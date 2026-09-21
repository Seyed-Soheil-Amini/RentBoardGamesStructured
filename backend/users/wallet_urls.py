from django.urls import path
from .views import WalletTopupView, WalletTransactionListView

urlpatterns = [
    path('topup/', WalletTopupView.as_view(), name='wallet_topup'),
    path('transactions/', WalletTransactionListView.as_view(), name='wallet_transactions'),
]
