from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.db.models import Sum, Count
from rentals.models import Rental
from inventory.models import PartnerCafe
from users.models import WalletTransaction, SubscriptionTier, UserProfile
from django.contrib.auth import get_user_model
from users.serializers import WalletTransactionSerializer

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class AdminMetricsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        active_rentals = Rental.objects.filter(status__in=['RESERVED', 'PICKED_UP']).count()
        
        escrow_total = UserProfile.objects.aggregate(total=Sum('escrow_balance'))['total'] or 0.00
        
        # Revenue generated is sum of RENTAL_CHARGE
        revenue_generated = WalletTransaction.objects.filter(transaction_type='RENTAL_CHARGE').aggregate(total=Sum('amount'))['total'] or 0.00
        # Since it's negative in db, we want the absolute value
        revenue_generated = abs(revenue_generated)
        
        partner_hubs = PartnerCafe.objects.count()
        
        return Response({
            "active_rentals": active_rentals,
            "total_escrow_locked": str(escrow_total),
            "total_revenue_generated": str(revenue_generated),
            "total_partner_hubs": partner_hubs
        })

class AdminCafeCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        user_id = request.data.get('user_id')
        name = request.data.get('name')
        city = request.data.get('city')
        address = request.data.get('address')
        
        if not all([user_id, name, city, address]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            cafe_user = User.objects.get(id=user_id)
            if cafe_user.role != 'CAFE_PARTNER':
                return Response({"error": "User must have CAFE_PARTNER role"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        cafe = PartnerCafe.objects.create(
            user=cafe_user,
            name=name,
            city=city,
            address=address
        )
        
        return Response({"message": "Cafe onboarded successfully", "cafe_id": cafe.id}, status=status.HTTP_201_CREATED)

class AdminSubscriptionUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            tier = SubscriptionTier.objects.get(pk=pk)
        except SubscriptionTier.DoesNotExist:
            return Response({"error": "Subscription tier not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if 'deposit_percent' in request.data:
            tier.deposit_percent = request.data['deposit_percent']
        if 'free_days' in request.data:
            tier.free_days = request.data['free_days']
        if 'fee_multiplier' in request.data:
            tier.fee_multiplier = request.data['fee_multiplier']
            
        tier.save()
        
        return Response({"message": "Subscription tier updated successfully"})

class AdminTransactionsListView(generics.ListAPIView):
    queryset = WalletTransaction.objects.all().order_by('-timestamp')
    serializer_class = WalletTransactionSerializer
    permission_classes = [IsAdminUser]
