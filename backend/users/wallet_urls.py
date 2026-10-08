from django.urls import path
from .views import WalletTopupView, WalletTransactionListView, SubscribeView, SubscriptionTierListView

urlpatterns = [
    path('topup/', WalletTopupView.as_view(), name='wallet_topup'),
    path('transactions/', WalletTransactionListView.as_view(), name='wallet_transactions'),
    path('subscribe/', SubscribeView.as_view(), name='wallet_subscribe'),
    path('subscription-tiers/', SubscriptionTierListView.as_view(), name='subscription_tiers'),
]
