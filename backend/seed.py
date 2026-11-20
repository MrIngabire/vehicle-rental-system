import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from vehicles.models import Vehicle

# Superuser/admin
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@carrental.rw', 'admin123',
                                   role='admin', first_name='System', last_name='Admin')
if not User.objects.filter(username='manager').exists():
    u = User(username='manager', email='jp.fleet@carrental.rw', role='manager',
             first_name='Jean', last_name='Pierre', department='Kigali Central Depot')
    u.set_password('manager123'); u.save()
if not User.objects.filter(username='customer').exists():
    u = User(username='customer', email='ben.bazirake@carrental.rw', role='customer',
             first_name='Bazirake', last_name='Ben', registration_number='BBICTR/2024/45385')
    u.set_password('customer123'); u.save()

vehicles = [
    dict(make='Toyota', model='Land Cruiser Prado TX', year=2022, category='SUV 4x4 Safari',
         license_plate='RAD 001 A', daily_rate=75000, seats=7, transmission='Auto', fuel_type='Diesel',
         status='available', image_url='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'),
    dict(make='Mercedes-Benz', model='C-Class', year=2021, category='Executive Sedan',
         license_plate='RAD 002 B', daily_rate=60000, seats=5, transmission='Auto', fuel_type='Petrol',
         status='booked', image_url='https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'),
    dict(make='Toyota', model='RAV4 AWD', year=2020, category='Compact Economy',
         license_plate='RAD 003 C', daily_rate=45000, seats=5, transmission='Auto', fuel_type='Petrol',
         status='available', image_url='https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80'),
    dict(make='Toyota', model='Coaster Bus', year=2019, category='Coaster / Minibus',
         license_plate='RAD 004 D', daily_rate=120000, seats=28, transmission='Manual', fuel_type='Diesel',
         status='maintenance', image_url='https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'),
]
for v in vehicles:
    Vehicle.objects.get_or_create(license_plate=v['license_plate'], defaults=v)

print("✅ Seed data created!")