from django.db import models
from django.conf import settings
from inventory.models import InventoryItem, PartnerCafe

class Rental(models.Model):
    STATUS_CHOICES = (
        ('RESERVED', 'Reserved'),
        ('PICKED_UP', 'Picked Up'),
        ('RETURNED_SAFE', 'Returned Safe'),
        ('RETURNED_DAMAGED', 'Returned Damaged'),
    )

    renter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rentals')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='rentals')
    pickup_cafe = models.ForeignKey(PartnerCafe, on_delete=models.CASCADE, related_name='rentals')
    
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    rent_fee_charged = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    late_fee_charged = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RESERVED')
    
    pickup_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    return_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Rental {self.id} - {self.inventory_item.board_game.title} by {self.renter.username}"
