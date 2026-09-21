from django.db import models
from django.conf import settings

class PartnerCafe(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='partner_cafes',
        help_text='The representative of the cafe.'
    )
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    address = models.TextField()

    def __str__(self):
        return f"{self.name} - {self.city}"

class BoardGame(models.Model):
    title = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.title

class InventoryItem(models.Model):
    board_game = models.ForeignKey(BoardGame, on_delete=models.CASCADE, related_name='inventory_items')
    cafe = models.ForeignKey(PartnerCafe, on_delete=models.CASCADE, related_name='inventory_items')
    barcode = models.CharField(max_length=100, unique=True)
    condition = models.CharField(max_length=50, default='GOOD')
    is_damaged = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.board_game.title} at {self.cafe.name} ({self.barcode})"
