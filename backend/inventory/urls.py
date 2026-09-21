from django.urls import path
from .views import AvailableInventoryListView, CafeInventoryListView, AddInventoryItemView

urlpatterns = [
    path('', AvailableInventoryListView.as_view(), name='inventory_list'),
    path('cafe/', CafeInventoryListView.as_view(), name='cafe_inventory_list'),
    path('add/', AddInventoryItemView.as_view(), name='add_inventory_item'),
]
