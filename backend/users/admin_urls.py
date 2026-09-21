from django.urls import path
from .admin_views import AdminMetricsView, AdminCafeCreateView, AdminSubscriptionUpdateView, AdminTransactionsListView

urlpatterns = [
    path('metrics/', AdminMetricsView.as_view(), name='admin_metrics'),
    path('cafes/', AdminCafeCreateView.as_view(), name='admin_cafe_create'),
    path('subscriptions/<int:pk>/', AdminSubscriptionUpdateView.as_view(), name='admin_subscription_update'),
    path('transactions/', AdminTransactionsListView.as_view(), name='admin_transactions_list'),
]
