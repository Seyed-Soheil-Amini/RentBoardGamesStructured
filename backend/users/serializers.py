from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, SubscriptionTier
from .models import UserProfile, SubscriptionTier, WalletTransaction

from decimal import Decimal

User = get_user_model()

TIER_PRICES = {
    'BASIC': Decimal('0.00'),
    'GOLD': Decimal('149000.00'),
    'PLATINUM': Decimal('299000.00'),
}

class SubscriptionTierSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionTier
        fields = ['id', 'name', 'deposit_percent', 'free_days', 'fee_multiplier', 'price']

    def get_price(self, obj):
        name_key = (obj.name or '').upper()
        return str(TIER_PRICES.get(name_key, Decimal('0.00')))

class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'timestamp']

class UserProfileSerializer(serializers.ModelSerializer):
    subscription_tier = SubscriptionTierSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['wallet_balance', 'escrow_balance', 'subscription_tier']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'RENTER')
        )
        # Create user profile upon registration
        UserProfile.objects.create(user=user)
        return user
