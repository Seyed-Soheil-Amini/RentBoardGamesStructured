from rest_framework import generics, permissions
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class AvailableInventoryListView(generics.ListAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return inventory items that are not damaged and not currently rented out
        return InventoryItem.objects.filter(
            is_damaged=False
        ).exclude(
            rentals__status__in=['RESERVED', 'PICKED_UP']
        )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import BoardGame
from django.shortcuts import get_object_or_404
from .models import PartnerCafe

class CafeInventoryListView(generics.ListAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InventoryItem.objects.filter(cafe__user=self.request.user).order_by('-id')

class AddInventoryItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        if request.user.role != 'CAFE_PARTNER':
            return Response({"error": "Only Cafe Partners can add inventory"}, status=status.HTTP_403_FORBIDDEN)
            
        cafe = get_object_or_404(PartnerCafe, user=request.user)
        
        # Expect either an existing board_game_id, or details to create a new one
        board_game_id = request.data.get('board_game_id')
        
        if board_game_id:
            board_game = get_object_or_404(BoardGame, id=board_game_id)
        else:
            title = request.data.get('title')
            publisher = request.data.get('publisher')
            retail_price = request.data.get('retail_price')
            
            if not title or not retail_price:
                return Response({"error": "Title and retail price are required to create a new game"}, status=status.HTTP_400_BAD_REQUEST)
                
            board_game = BoardGame.objects.create(
                title=title,
                publisher=publisher or 'Unknown',
                retail_price=retail_price
            )
            
        inventory_item = InventoryItem.objects.create(
            board_game=board_game,
            cafe=cafe,
            condition=request.data.get('condition', 'NEW'),
            barcode=request.data.get('barcode', '')
        )
        
        serializer = InventoryItemSerializer(inventory_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
