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

from .serializers import WalletTransactionSerializer

class WalletTransactionListView(generics.ListAPIView):
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WalletTransaction.objects.filter(user=self.request.user).order_by('-timestamp')
