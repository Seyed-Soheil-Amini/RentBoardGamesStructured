from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from django.db import transaction
from decimal import Decimal
from django.shortcuts import get_object_or_404
from .models import Rental
from .serializers import RentalSerializer
from inventory.models import InventoryItem
from users.models import WalletTransaction

class BookRentalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        item_id = request.data.get('inventory_item_id')
        if not item_id:
            return Response({"error": "inventory_item_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        item = get_object_or_404(InventoryItem, id=item_id)
        
        # Check if already rented
        if Rental.objects.filter(inventory_item=item, status__in=['RESERVED', 'PICKED_UP']).exists():
            return Response({"error": "Item is already rented or reserved"}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.profile
        tier = profile.subscription_tier
        
        if tier:
            deposit_percent = tier.deposit_percent
        else:
            deposit_percent = Decimal('100.00')

        deposit_hold = (item.board_game.retail_price * deposit_percent) / Decimal('100.00')

        if profile.wallet_balance < deposit_hold:
            return Response({
                "error": "Insufficient wallet balance",
                "required_deposit": str(deposit_hold),
                "current_balance": str(profile.wallet_balance)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Process financial escrow
        profile.wallet_balance -= deposit_hold
        profile.escrow_balance += deposit_hold
        profile.save()

        # Log transaction
        WalletTransaction.objects.create(
            user=request.user,
            amount=-deposit_hold,
            transaction_type='DEPOSIT_LOCK',
            description=f"Deposit locked for renting {item.board_game.title}"
        )

        # Create rental
        rental = Rental.objects.create(
            renter=request.user,
            inventory_item=item,
            pickup_cafe=item.cafe,
            deposit_amount=deposit_hold,
            status='RESERVED'
        )

        return Response({
            "message": "Rental successfully booked",
            "rental_id": rental.id,
            "deposit_locked": str(deposit_hold),
            "new_wallet_balance": str(profile.wallet_balance)
        }, status=status.HTTP_201_CREATED)

from django.utils import timezone
from datetime import timedelta
import math

class HandoverRentalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        rental = get_object_or_404(Rental, pk=pk)
        
        if rental.status != 'RESERVED':
            return Response({"error": "Rental is not reserved"}, status=status.HTTP_400_BAD_REQUEST)
        
        if rental.pickup_cafe.user != request.user:
            return Response({"error": "Not authorized. Must be the pickup cafe representative."}, status=status.HTTP_403_FORBIDDEN)
            
        tier = rental.renter.profile.subscription_tier
        free_days = tier.free_days if tier else 3
        
        rental.pickup_date = timezone.now()
        rental.due_date = rental.pickup_date + timedelta(days=free_days)
        rental.status = 'PICKED_UP'
        rental.save()
        
        return Response({"message": "Handed over successfully", "due_date": rental.due_date}, status=status.HTTP_200_OK)

class ReturnRentalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        rental = get_object_or_404(Rental, pk=pk)
        
        if rental.status != 'PICKED_UP':
            return Response({"error": "Rental is not picked up"}, status=status.HTTP_400_BAD_REQUEST)
            
        if rental.pickup_cafe.user != request.user:
            return Response({"error": "Not authorized. Must return to the pickup cafe."}, status=status.HTTP_403_FORBIDDEN)
            
        condition = request.data.get('condition')
        if condition not in ['SAFE', 'DAMAGED']:
            return Response({"error": "Condition must be SAFE or DAMAGED"}, status=status.HTTP_400_BAD_REQUEST)
            
        renter_profile = rental.renter.profile
        cafe_profile = rental.pickup_cafe.user.profile
        retail_price = rental.inventory_item.board_game.retail_price
        
        # Release escrow
        renter_profile.escrow_balance -= rental.deposit_amount
        renter_profile.wallet_balance += rental.deposit_amount
        
        WalletTransaction.objects.create(
            user=rental.renter,
            amount=rental.deposit_amount,
            transaction_type='DEPOSIT_RELEASE',
            description=f"Deposit released for {rental.inventory_item.board_game.title}"
        )
        
        if condition == 'SAFE':
            tier = renter_profile.subscription_tier
            fee_multiplier = tier.fee_multiplier if tier else Decimal('1.00')
            
            base_fee = (retail_price * Decimal('0.10')) * fee_multiplier
            
            late_fee = Decimal('0.00')
            now = timezone.now()
            if now > rental.due_date:
                days_overdue = math.ceil((now - rental.due_date).total_seconds() / 86400.0)
                late_fee = retail_price * Decimal('0.25') * Decimal(days_overdue)
                
            total_charge = base_fee + late_fee
            
            renter_profile.wallet_balance -= total_charge
            WalletTransaction.objects.create(
                user=rental.renter,
                amount=-total_charge,
                transaction_type='RENTAL_CHARGE',
                description=f"Rental and late fees for {rental.inventory_item.board_game.title}"
            )
            
            cafe_payout = base_fee * Decimal('0.20')
            cafe_profile.wallet_balance += cafe_payout
            cafe_profile.save()
            WalletTransaction.objects.create(
                user=rental.pickup_cafe.user,
                amount=cafe_payout,
                transaction_type='REVENUE_SHARE',
                description=f"Revenue share for {rental.inventory_item.board_game.title}"
            )
            
            rental.rent_fee_charged = base_fee
            rental.late_fee_charged = late_fee
            rental.status = 'RETURNED_SAFE'
            
        elif condition == 'DAMAGED':
            renter_profile.wallet_balance -= retail_price
            WalletTransaction.objects.create(
                user=rental.renter,
                amount=-retail_price,
                transaction_type='DAMAGE_PENALTY',
                description=f"Damage penalty for {rental.inventory_item.board_game.title}"
            )
            
            item = rental.inventory_item
            item.is_damaged = True
            item.condition = 'DAMAGED'
            item.save()
            
            rental.status = 'RETURNED_DAMAGED'
            
        rental.return_date = timezone.now()
        rental.save()
        renter_profile.save()
        
        return Response({"message": f"Rental returned as {condition}"}, status=status.HTTP_200_OK)

class MyRentalsListView(generics.ListAPIView):
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Rental.objects.filter(renter=self.request.user).order_by('-id')

class CafeRentalsListView(generics.ListAPIView):
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Rental.objects.filter(pickup_cafe__user=self.request.user).order_by('-id')
