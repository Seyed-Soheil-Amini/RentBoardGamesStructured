from rest_framework import serializers
from .models import BoardGame, PartnerCafe, InventoryItem

class BoardGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardGame
        fields = ['id', 'title', 'publisher', 'retail_price']

class PartnerCafeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerCafe
        fields = ['id', 'name', 'city', 'address']

class InventoryItemSerializer(serializers.ModelSerializer):
    board_game = BoardGameSerializer(read_only=True)
    cafe = PartnerCafeSerializer(read_only=True)

    class Meta:
        model = InventoryItem
        fields = ['id', 'barcode', 'condition', 'is_damaged', 'board_game', 'cafe']
