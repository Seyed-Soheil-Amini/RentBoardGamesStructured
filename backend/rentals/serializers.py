from rest_framework import serializers
from .models import Rental
from inventory.serializers import InventoryItemSerializer

class RentalSerializer(serializers.ModelSerializer):
    inventory_item = InventoryItemSerializer(read_only=True)

    class Meta:
        model = Rental
        fields = [
            'id', 'renter', 'inventory_item', 'pickup_cafe', 
            'deposit_amount', 'rent_fee_charged', 'late_fee_charged',
            'status', 'pickup_date', 'due_date', 'return_date'
        ]
