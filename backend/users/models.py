from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('RENTER', 'Renter'),
        ('CAFE_PARTNER', 'Cafe Partner'),
        ('ADMIN', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='RENTER')

class SubscriptionTier(models.Model):
    name = models.CharField(max_length=50, unique=True)
    deposit_percent = models.DecimalField(max_digits=5, decimal_places=2)
    free_days = models.IntegerField()
    fee_multiplier = models.DecimalField(max_digits=3, decimal_places=2)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    escrow_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    subscription_tier = models.ForeignKey(SubscriptionTier, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class WalletTransaction(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='wallet_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"
