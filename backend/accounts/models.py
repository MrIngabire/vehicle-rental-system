from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('manager', 'Fleet Manager'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True)
    registration_number = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"