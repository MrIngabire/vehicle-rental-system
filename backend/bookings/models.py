from django.db import models
from django.conf import settings
from vehicles.models import Vehicle

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    DRIVER_CHOICES = (
        ('self', 'Self-Drive'),
        ('chauffeur', 'Professional Chauffeur'),
        ('safari', 'Safari Guide + Driver'),
    )
    reference = models.CharField(max_length=30, unique=True, blank=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    requested_category = models.CharField(max_length=50)
    requested_unit = models.CharField(max_length=100, blank=True)
    pickup_date = models.DateField()
    return_date = models.DateField()
    driver_option = models.CharField(max_length=20, choices=DRIVER_CHOICES, default='self')
    special_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    manager_feedback = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name='reviewed_bookings')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.reference:
            import uuid
            self.reference = f"REQ-2026-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    @property
    def days(self):
        return max((self.return_date - self.pickup_date).days, 1)

    def __str__(self):
        return self.reference