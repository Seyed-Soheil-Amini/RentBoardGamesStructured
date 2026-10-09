from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from inventory.models import BoardGame, InventoryItem, PartnerCafe
from rentals.models import Rental
from users.models import SubscriptionTier, UserProfile, WalletTransaction

User = get_user_model()

class CancelRentalTests(APITestCase):
    def setUp(self):
        self.basic_tier = SubscriptionTier.objects.create(
            name='Basic',
            deposit_percent=Decimal('100.00'),
            free_days=3,
            fee_multiplier=Decimal('1.00')
        )

        # Renter
        self.renter = User.objects.create_user('test_renter', 'renter@test.com', 'password123')
        self.renter_profile = UserProfile.objects.create(
            user=self.renter,
            wallet_balance=Decimal('200.00'),
            escrow_balance=Decimal('0.00'),
            subscription_tier=self.basic_tier
        )

        # Other User
        self.other_user = User.objects.create_user('other_renter', 'other@test.com', 'password123')
        UserProfile.objects.create(user=self.other_user, wallet_balance=Decimal('100.00'))

        # Cafe
        self.cafe_user = User.objects.create_user('cafe_owner', 'cafe@test.com', 'password123', role='CAFE_PARTNER')
        UserProfile.objects.create(user=self.cafe_user)
        self.cafe = PartnerCafe.objects.create(
            user=self.cafe_user,
            name='Test Cafe',
            city='Tehran',
            address='123 Test St'
        )

        # Board Game and Inventory
        self.game = BoardGame.objects.create(
            title='Settlers of Catan',
            publisher='Kosmos',
            retail_price=Decimal('100.00')
        )
        self.item = InventoryItem.objects.create(
            board_game=self.game,
            cafe=self.cafe,
            barcode='CATAN-001'
        )

    def test_renter_can_cancel_reserved_rental_before_pickup(self):
        # 1. Book the rental
        self.client.force_authenticate(user=self.renter)
        book_res = self.client.post(reverse('book_rental'), {'inventory_item_id': self.item.id})
        self.assertEqual(book_res.status_code, status.HTTP_201_CREATED)
        
        rental_id = book_res.data['rental_id']
        rental = Rental.objects.get(id=rental_id)
        self.assertEqual(rental.status, 'RESERVED')
        self.assertEqual(rental.deposit_amount, Decimal('100.00'))

        self.renter_profile.refresh_from_db()
        self.assertEqual(self.renter_profile.wallet_balance, Decimal('100.00'))
        self.assertEqual(self.renter_profile.escrow_balance, Decimal('100.00'))

        # 2. Cancel the rental
        cancel_url = reverse('cancel_rental', kwargs={'pk': rental.id})
        res = self.client.post(cancel_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['rental_id'], rental.id)

        # 3. Verify rental status is CANCELLED
        rental.refresh_from_db()
        self.assertEqual(rental.status, 'CANCELLED')

        # 4. Verify escrow released back to wallet
        self.renter_profile.refresh_from_db()
        self.assertEqual(self.renter_profile.wallet_balance, Decimal('200.00'))
        self.assertEqual(self.renter_profile.escrow_balance, Decimal('0.00'))

        # 5. Verify WalletTransaction logged
        tx = WalletTransaction.objects.filter(user=self.renter, transaction_type='DEPOSIT_RELEASE').first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, Decimal('100.00'))

        # 6. Verify item can be rented again
        self.assertFalse(
            Rental.objects.filter(inventory_item=self.item, status__in=['RESERVED', 'PICKED_UP']).exists()
        )

    def test_cannot_cancel_already_picked_up_rental(self):
        rental = Rental.objects.create(
            renter=self.renter,
            inventory_item=self.item,
            pickup_cafe=self.cafe,
            deposit_amount=Decimal('100.00'),
            status='PICKED_UP'
        )
        self.client.force_authenticate(user=self.renter)
        cancel_url = reverse('cancel_rental', kwargs={'pk': rental.id})
        res = self.client.post(cancel_url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only reserved rentals can be cancelled", res.data['error'])

    def test_cannot_cancel_already_cancelled_rental(self):
        rental = Rental.objects.create(
            renter=self.renter,
            inventory_item=self.item,
            pickup_cafe=self.cafe,
            deposit_amount=Decimal('100.00'),
            status='CANCELLED'
        )
        self.client.force_authenticate(user=self.renter)
        cancel_url = reverse('cancel_rental', kwargs={'pk': rental.id})
        res = self.client.post(cancel_url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_user_cannot_cancel_renter_rental(self):
        rental = Rental.objects.create(
            renter=self.renter,
            inventory_item=self.item,
            pickup_cafe=self.cafe,
            deposit_amount=Decimal('100.00'),
            status='RESERVED'
        )
        self.client.force_authenticate(user=self.other_user)
        cancel_url = reverse('cancel_rental', kwargs={'pk': rental.id})
        res = self.client.post(cancel_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        rental.refresh_from_db()
        self.assertEqual(rental.status, 'RESERVED')

    def test_unauthenticated_user_cannot_cancel(self):
        rental = Rental.objects.create(
            renter=self.renter,
            inventory_item=self.item,
            pickup_cafe=self.cafe,
            deposit_amount=Decimal('100.00'),
            status='RESERVED'
        )
        cancel_url = reverse('cancel_rental', kwargs={'pk': rental.id})
        res = self.client.post(cancel_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
