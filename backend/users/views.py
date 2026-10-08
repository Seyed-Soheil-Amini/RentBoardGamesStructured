from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

from rest_framework.views import APIView
from rest_framework import status
from django.db import transaction
from decimal import Decimal
from .models import WalletTransaction

class WalletTopupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        amount = request.data.get('amount')
        try:
            amount = Decimal(amount)
            if amount <= 0:
                return Response({"error": "Amount must be positive"}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.profile
        profile.wallet_balance += amount
        profile.save()

        WalletTransaction.objects.create(
            user=request.user,
            amount=amount,
            transaction_type='TOPUP',
            description=f"Wallet topped up by {amount}"
        )

        return Response({"message": "Top-up successful", "new_balance": str(profile.wallet_balance)}, status=status.HTTP_200_OK)

from .models import SubscriptionTier
from .serializers import WalletTransactionSerializer, SubscriptionTierSerializer, TIER_PRICES

class WalletTransactionListView(generics.ListAPIView):
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WalletTransaction.objects.filter(user=self.request.user).order_by('-timestamp')

class SubscriptionTierListView(generics.ListAPIView):
    queryset = SubscriptionTier.objects.all().order_by('id')
    serializer_class = SubscriptionTierSerializer
    permission_classes = [permissions.AllowAny]

class SubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        tier_id = request.data.get('tier_id')
        tier_name = request.data.get('tier_name')

        tier = None
        if tier_id:
            try:
                tier = SubscriptionTier.objects.get(id=tier_id)
            except SubscriptionTier.DoesNotExist:
                return Response({"error": "Subscription tier not found"}, status=status.HTTP_404_NOT_FOUND)
        elif tier_name:
            tier = SubscriptionTier.objects.filter(name__iexact=tier_name).first()
            if not tier:
                return Response({"error": "Subscription tier not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "tier_id or tier_name is required"}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.profile
        if profile.subscription_tier_id == tier.id:
            return Response({"error": f"You are already on the {tier.name} tier."}, status=status.HTTP_400_BAD_REQUEST)

        price = TIER_PRICES.get(tier.name.upper(), Decimal('0.00'))

        if price > 0 and profile.wallet_balance < price:
            return Response(
                {"error": f"موجودی کیف پول کافی نیست. برای ارتقا به طرح {tier.name} به {int(price):,} تومان موجودی نیاز دارید."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if price > 0:
            profile.wallet_balance -= price
            WalletTransaction.objects.create(
                user=request.user,
                amount=-price,
                transaction_type='SUBSCRIPTION',
                description=f"Subscribed to {tier.name} tier"
            )

        profile.subscription_tier = tier
        profile.save()

        return Response({
            "message": f"Successfully subscribed to {tier.name} tier!",
            "subscription_tier": SubscriptionTierSerializer(tier).data,
            "wallet_balance": str(profile.wallet_balance)
        }, status=status.HTTP_200_OK)

