import os
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import SubscriptionTier, UserProfile
from inventory.models import PartnerCafe, BoardGame, InventoryItem

User = get_user_model()

def seed():
    print("Clearing existing data...")
    InventoryItem.objects.all().delete()
    BoardGame.objects.all().delete()
    PartnerCafe.objects.all().delete()
    UserProfile.objects.all().delete()
    User.objects.all().delete()
    SubscriptionTier.objects.all().delete()
    
    print("Creating Subscription Tiers...")
    basic_tier = SubscriptionTier.objects.create(
        name='Basic', deposit_percent=Decimal('100.00'), free_days=3, fee_multiplier=Decimal('1.00')
    )
    gold_tier = SubscriptionTier.objects.create(
        name='Gold', deposit_percent=Decimal('70.00'), free_days=7, fee_multiplier=Decimal('0.80')
    )
    platinum_tier = SubscriptionTier.objects.create(
        name='Platinum', deposit_percent=Decimal('50.00'), free_days=10, fee_multiplier=Decimal('0.50')
    )

    print("Creating Admin...")
    admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    admin.role = 'ADMIN'
    admin.save()
    UserProfile.objects.create(user=admin)

    print("Creating Cafe Partners...")
    cafe_user1 = User.objects.create_user('cafe_seattle', 'seattle@example.com', 'cafe123')
    cafe_user1.role = 'CAFE_PARTNER'
    cafe_user1.save()
    UserProfile.objects.create(user=cafe_user1)
    cafe1 = PartnerCafe.objects.create(user=cafe_user1, name='Mox Boarding House', city='Seattle', address='5105 Leary Ave NW')

    cafe_user2 = User.objects.create_user('cafe_austin', 'austin@example.com', 'cafe123')
    cafe_user2.role = 'CAFE_PARTNER'
    cafe_user2.save()
    UserProfile.objects.create(user=cafe_user2)
    cafe2 = PartnerCafe.objects.create(user=cafe_user2, name='Emerald Tavern', city='Austin', address='9012 Research Blvd')

    print("Creating Renter...")
    renter = User.objects.create_user('renter_user', 'renter@example.com', 'renter123')
    renter.role = 'RENTER'
    renter.save()
    
    renter_profile = UserProfile.objects.create(user=renter)
    renter_profile.wallet_balance = Decimal('200.00')
    renter_profile.subscription_tier = gold_tier
    renter_profile.save()

    print("Creating Board Games & Inventory...")
    games_data = [
        {'title': 'Catan', 'publisher': 'Kosmos', 'retail_price': Decimal('55.00')},
        {'title': 'Ticket to Ride', 'publisher': 'Days of Wonder', 'retail_price': Decimal('50.00')},
        {'title': 'Scythe', 'publisher': 'Stonemaier Games', 'retail_price': Decimal('85.00')},
        {'title': 'Gloomhaven', 'publisher': 'Cephalofair Games', 'retail_price': Decimal('140.00')},
        {'title': 'Wingspan', 'publisher': 'Stonemaier Games', 'retail_price': Decimal('60.00')},
    ]

    games = []
    for g in games_data:
        games.append(BoardGame.objects.create(**g))

    # Add games to cafes
    InventoryItem.objects.create(board_game=games[0], cafe=cafe1, barcode='CATAN-001')
    InventoryItem.objects.create(board_game=games[1], cafe=cafe1, barcode='TTR-001')
    InventoryItem.objects.create(board_game=games[2], cafe=cafe1, barcode='SCYTHE-001')
    
    InventoryItem.objects.create(board_game=games[3], cafe=cafe2, barcode='GLOOM-001')
    InventoryItem.objects.create(board_game=games[4], cafe=cafe2, barcode='WING-001')
    InventoryItem.objects.create(board_game=games[0], cafe=cafe2, barcode='CATAN-002')

    print("Seeding Complete!")

if __name__ == "__main__":
    seed()
