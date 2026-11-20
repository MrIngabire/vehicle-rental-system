from django.db import models

class Vehicle(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('maintenance', 'Under Maintenance'),
    )
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    category = models.CharField(max_length=50)  # SUV 4x4 Safari, Executive Sedan, etc.
    license_plate = models.CharField(max_length=20, unique=True)
    daily_rate = models.DecimalField(max_digits=12, decimal_places=0)
    seats = models.IntegerField(default=5)
    transmission = models.CharField(max_length=20, default='Auto')
    fuel_type = models.CharField(max_length=20, default='Petrol')
    image_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.license_plate})"