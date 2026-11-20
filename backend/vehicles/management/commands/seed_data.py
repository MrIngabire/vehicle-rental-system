"""
Heavy seed data for the Vehicle Rental & Booking Management System.
Usage:
    python manage.py seed_data           # default: seed if DB empty
    python manage.py seed_data --flush   # wipe & reseed everything
    python manage.py seed_data --scale 3 # 3x volumes (heavy)
"""

import random
from datetime import date, timedelta, datetime
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from vehicles.models import Vehicle
from bookings.models import Booking


# ---------- Static reference pools ----------

FIRST_NAMES = [
    "Ben", "Diane", "Jean", "Marie", "Eric", "Alice", "Patrick", "Grace",
    "Emmanuel", "Claudine", "Olivier", "Sandrine", "Fabrice", "Josiane",
    "Thierry", "Aline", "Samuel", "Solange", "Yves", "Chantal",
    "Aimable", "Denise", "Herve", "Vanessa", "Innocent", "Divine",
    "Moses", "Nadine", "Kevin", "Josiane", "Bertrand", "Yvette",
]

LAST_NAMES = [
    "Bazirake", "Uwase", "Mugisha", "Habimana", "Nkurunziza", "Mutesi",
    "Kagabo", "Uwimana", "Ndayitegeye", "Rutaganda", "Mukamana",
    "Gasana", "Munyaneza", "Uwera", "Bizimana", "Ntawukuriryayo",
    "Mukandayisenga", "Nshimiyimana", "Twagirimana", "Kayitesi",
    "Rwigema", "Iradukunda", "Byiringiro", "Nsengiyumva",
]

# 40+ realistic Rwanda-registered fleet
VEHICLE_POOL = [
    # SUV / 4x4 Safari
    ("Toyota", "Land Cruiser Prado TX", 2022, "SUV 4x4 Safari", "RAD 001 A", 75000, 7, "Auto", "Diesel"),
    ("Toyota", "Land Cruiser Prado VX", 2021, "SUV 4x4 Safari", "RAD 002 A", 82000, 7, "Auto", "Diesel"),
    ("Toyota", "Land Cruiser 79 Pickup", 2020, "SUV 4x4 Safari", "RAD 003 A", 68000, 5, "Manual", "Diesel"),
    ("Land Rover", "Defender 110", 2023, "SUV 4x4 Safari", "RAD 004 A", 95000, 7, "Auto", "Diesel"),
    ("Mitsubishi", "Pajero Sport", 2021, "SUV 4x4 Safari", "RAD 005 A", 70000, 7, "Auto", "Diesel"),
    ("Nissan", "X-Trail 4WD", 2020, "SUV 4x4 Safari", "RAD 006 A", 55000, 5, "Auto", "Petrol"),
    ("Toyota", "Fortuner Legender", 2022, "SUV 4x4 Safari", "RAD 007 A", 72000, 7, "Auto", "Diesel"),
    ("Jeep", "Wrangler Rubicon", 2022, "SUV 4x4 Safari", "RAD 008 A", 98000, 5, "Auto", "Petrol"),

    # Executive Sedan
    ("Mercedes-Benz", "C-Class C200", 2021, "Executive Sedan", "RAD 010 B", 60000, 5, "Auto", "Petrol"),
    ("Mercedes-Benz", "E-Class E250", 2022, "Executive Sedan", "RAD 011 B", 85000, 5, "Auto", "Petrol"),
    ("BMW", "5 Series 520d", 2021, "Executive Sedan", "RAD 012 B", 80000, 5, "Auto", "Diesel"),
    ("BMW", "3 Series 320i", 2022, "Executive Sedan", "RAD 013 B", 65000, 5, "Auto", "Petrol"),
    ("Audi", "A6 45 TFSI", 2021, "Executive Sedan", "RAD 014 B", 78000, 5, "Auto", "Petrol"),
    ("Toyota", "Camry XLE", 2022, "Executive Sedan", "RAD 015 B", 58000, 5, "Auto", "Petrol"),
    ("Lexus", "ES 350", 2020, "Executive Sedan", "RAD 016 B", 75000, 5, "Auto", "Petrol"),
    ("Volkswagen", "Passat Comfortline", 2021, "Executive Sedan", "RAD 017 B", 52000, 5, "Auto", "Diesel"),

    # Compact Economy
    ("Toyota", "RAV4 AWD", 2020, "Compact Economy", "RAD 020 C", 45000, 5, "Auto", "Petrol"),
    ("Toyota", "Corolla Cross", 2022, "Compact Economy", "RAD 021 C", 42000, 5, "Auto", "Petrol"),
    ("Toyota", "Yaris Sedan", 2021, "Compact Economy", "RAD 022 C", 32000, 5, "Auto", "Petrol"),
    ("Toyota", "Vitz", 2019, "Compact Economy", "RAD 023 C", 28000, 5, "Manual", "Petrol"),
    ("Honda", "CR-V", 2021, "Compact Economy", "RAD 024 C", 48000, 5, "Auto", "Petrol"),
    ("Honda", "Civic", 2022, "Compact Economy", "RAD 025 C", 40000, 5, "Auto", "Petrol"),
    ("Suzuki", "Swift", 2021, "Compact Economy", "RAD 026 C", 30000, 5, "Manual", "Petrol"),
    ("Hyundai", "Tucson", 2022, "Compact Economy", "RAD 027 C", 46000, 5, "Auto", "Petrol"),
    ("Kia", "Sportage", 2021, "Compact Economy", "RAD 028 C", 44000, 5, "Auto", "Petrol"),
    ("Mazda", "CX-5", 2020, "Compact Economy", "RAD 029 C", 43000, 5, "Auto", "Petrol"),

    # Coaster / Minibus
    ("Toyota", "Coaster Bus 28-seat", 2019, "Coaster / Minibus", "RAD 030 D", 120000, 28, "Manual", "Diesel"),
    ("Toyota", "Coaster Bus 22-seat", 2020, "Coaster / Minibus", "RAD 031 D", 110000, 22, "Manual", "Diesel"),
    ("Toyota", "Hiace 14-seater", 2021, "Coaster / Minibus", "RAD 032 D", 85000, 14, "Manual", "Diesel"),
    ("Toyota", "Hiace 9-seater", 2022, "Coaster / Minibus", "RAD 033 D", 70000, 9, "Manual", "Diesel"),
    ("Mercedes-Benz", "Sprinter 18-seat", 2020, "Coaster / Minibus", "RAD 034 D", 115000, 18, "Manual", "Diesel"),
    ("Nissan", "Urvan 14-seat", 2019, "Coaster / Minibus", "RAD 035 D", 78000, 14, "Manual", "Diesel"),
    ("Hyundai", "County 25-seat", 2020, "Coaster / Minibus", "RAD 036 D", 118000, 25, "Manual", "Diesel"),
    ("Isuzu", "Elf Shuttle 18-seat", 2019, "Coaster / Minibus", "RAD 037 D", 105000, 18, "Manual", "Diesel"),
]

# Curated Unsplash images per category (avoids 404s)
CATEGORY_IMAGES = {
    "SUV 4x4 Safari": [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1511527844068-006b95d162c2?auto=format&fit=crop&w=600&q=80",
    ],
    "Executive Sedan": [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    ],
    "Compact Economy": [
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80",
    ],
    "Coaster / Minibus": [
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    ],
}

CATEGORIES = ["SUV 4x4 Safari", "Executive Sedan", "Compact Economy", "Coaster / Minibus"]
DRIVER_OPTIONS = ["self", "chauffeur", "safari"]

SPECIAL_NOTES_POOL = [
    "Airport transfer at Kigali International Airport (KGL) at 09:00 AM.",
    "Full safari roof rack and GPS installation required.",
    "Child seat required for a 3-year-old passenger.",
    "Trip to Akagera National Park — 3-day itinerary.",
    "Client requests professional chauffeur for corporate event.",
    "Vehicle must be delivered to Marriott Hotel Kigali.",
    "Volcanoes National Park trekking — gorilla tour.",
    "Lake Kivu weekend getaway — Kigali to Rubavu.",
    "Wedding convoy — 2 vehicles requested as group.",
    "Municipal government official transport — invoicing to RRA.",
    "",
    "",
    "",
]

MANAGER_FEEDBACK_APPROVED = [
    "Approved. Vehicle reserved and prepped.",
    "Approved — driver assigned and fuel topped up.",
    "Confirmed. Keys ready for pickup at 08:30.",
    "Approved. Insurance documents verified.",
    "All clear — approved without conditions.",
]

MANAGER_FEEDBACK_REJECTED = [
    "Rejected: vehicle not available for the requested dates.",
    "Rejected: customer license verification failed.",
    "Rejected: requested unit is under maintenance.",
    "Rejected: rental duration exceeds policy for that category.",
    "Rejected: customer has outstanding balance from prior booking.",
]


# ---------- Helpers ----------

def _rand_phone():
    return f"+250 78{random.randint(1,8)} {random.randint(100,999)} {random.randint(100,999)}"


def _rand_past_date(days_back_max=120):
    return date.today() - timedelta(days=random.randint(0, days_back_max))


def _rand_future_date(days_ahead_max=90):
    return date.today() + timedelta(days=random.randint(1, days_ahead_max))


class Command(BaseCommand):
    help = "Seed heavy, realistic demo data for the Vehicle Rental MIS"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush", action="store_true",
            help="Delete all existing data before seeding",
        )
        parser.add_argument(
            "--scale", type=int, default=1,
            help="Multiply seed volumes (e.g. 3 = 3x customers/bookings)",
        )

    # ---------- Main entry ----------

    @transaction.atomic
    def handle(self, *args, **opts):
        scale = max(opts.get("scale", 1), 1)
        flush = opts.get("flush", False)

        if flush:
            self.stdout.write(self.style.WARNING("Flushing existing data..."))
            Booking.objects.all().delete()
            Vehicle.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS("✓ Flushed."))

        # Guard against re-seeding
        if User.objects.filter(username="admin").exists() and not flush:
            self.stdout.write(self.style.WARNING(
                "Seed data already exists. Use --flush to wipe and reseed."
            ))
            return

        self.stdout.write(self.style.MIGRATE_HEADING("Seeding Vehicle Rental MIS..."))

        admins = self._seed_admins()
        managers = self._seed_managers(4)
        customers = self._seed_customers(60 * scale)
        vehicles = self._seed_vehicles()
        bookings = self._seed_bookings(customers, managers, vehicles, 200 * scale)

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Seeded {len(admins)} admin(s), {len(managers)} manager(s), "
            f"{len(customers)} customer(s), {len(vehicles)} vehicle(s), "
            f"and {len(bookings)} booking(s).\n"
        ))
        self._print_credentials()

    # ---------- Seeders ----------

    def _seed_admins(self):
        admins = []
        admin_data = [
            ("admin", "System", "Administrator", "admin@carrental.rw", "admin123",
             "IT Operations", "HQ-KGL"),
            ("rafiki.ndayitegeye", "Rafiki", "Ndayitegeye", "rafiki.ndayitegeye@mku.ac.rw",
             "admin123", "Supervision & System Admin", "MKU"),
        ]
        for uname, fn, ln, email, pwd, dept, reg in admin_data:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults=dict(
                    email=email, first_name=fn, last_name=ln,
                    role="admin", department=dept, registration_number=reg,
                    phone=_rand_phone(), is_staff=True, is_superuser=(uname == "admin"),
                ),
            )
            if created:
                u.set_password(pwd)
                u.save()
            admins.append(u)
        self.stdout.write(f"  → Admins: {len(admins)}")
        return admins

    def _seed_managers(self, n):
        managers = []
        predefined = [
            ("manager", "Jean", "Pierre", "jp.fleet@carrental.rw", "manager123",
             "Kigali Central Depot", "KGL-CENTRAL"),
        ]
        for uname, fn, ln, email, pwd, dept, reg in predefined:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults=dict(
                    email=email, first_name=fn, last_name=ln, role="manager",
                    department=dept, registration_number=reg, phone=_rand_phone(),
                ),
            )
            if created:
                u.set_password(pwd)
                u.save()
            managers.append(u)

        depots = ["Kigali Central Depot", "Kigali Airport Depot", "Musanze Branch",
                  "Rubavu Branch", "Huye Branch"]
        for i in range(n - 1):
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            uname = f"manager{i+2}"
            u, created = User.objects.get_or_create(
                username=uname,
                defaults=dict(
                    email=f"{fn.lower()}.{ln.lower()}@carrental.rw",
                    first_name=fn, last_name=ln, role="manager",
                    department=random.choice(depots),
                    registration_number=f"KGL-{random.randint(1000,9999)}",
                    phone=_rand_phone(),
                ),
            )
            if created:
                u.set_password("manager123")
                u.save()
            managers.append(u)
        self.stdout.write(f"  → Managers: {len(managers)}")
        return managers

    def _seed_customers(self, n):
        customers = []
        # Guaranteed demo customer matching the prototype
        ben, created = User.objects.get_or_create(
            username="customer",
            defaults=dict(
                email="ben.bazirake@carrental.rw",
                first_name="Bazirake", last_name="Ben",
                role="customer", registration_number="BBICTR/2024/45385",
                phone=_rand_phone(), department="Mount Kigali University",
            ),
        )
        if created:
            ben.set_password("customer123")
            ben.save()
        customers.append(ben)

        used = {ben.username}
        for i in range(n):
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            uname = f"cust_{fn.lower()}_{i:03d}"
            if uname in used:
                continue
            used.add(uname)
            u = User.objects.create(
                username=uname,
                email=f"{fn.lower()}.{ln.lower()}{i}@mail.rw",
                first_name=fn, last_name=ln, role="customer",
                phone=_rand_phone(),
                registration_number=(
                    f"BBICTR/2024/{random.randint(40000, 99999)}"
                    if random.random() < 0.4
                    else f"CUST-{random.randint(10000, 99999)}"
                ),
                department=random.choice([
                    "Individual", "Corporate Client", "Tourist", "NGO Staff",
                    "Government Official", "Mount Kigali University",
                ]),
            )
            u.set_password("customer123")
            u.save()
            customers.append(u)
        self.stdout.write(f"  → Customers: {len(customers)}")
        return customers

    def _seed_vehicles(self):
        vehicles = []
        statuses_weighted = (
            ["available"] * 14 +
            ["booked"] * 4 +
            ["maintenance"] * 2
        )
        for idx, (make, model, year, category, plate, rate, seats, trans, fuel) in enumerate(VEHICLE_POOL):
            v, created = Vehicle.objects.get_or_create(
                license_plate=plate,
                defaults=dict(
                    make=make, model=model, year=year, category=category,
                    daily_rate=Decimal(rate), seats=seats, transmission=trans,
                    fuel_type=fuel,
                    image_url=random.choice(CATEGORY_IMAGES[category]),
                    status=random.choice(statuses_weighted),
                ),
            )
            vehicles.append(v)
        self.stdout.write(f"  → Vehicles: {len(vehicles)}")
        return vehicles

    def _seed_bookings(self, customers, managers, vehicles, n):
        bookings = []
        # Realistic status distribution
        status_weights = (
            ["pending"] * 3 +
            ["approved"] * 6 +
            ["completed"] * 4 +
            ["rejected"] * 2 +
            ["cancelled"] * 1
        )

        for i in range(n):
            customer = random.choice(customers)
            status = random.choice(status_weights)
            vehicle = random.choice(vehicles)

            # Date logic depends on status
            if status == "completed":
                pickup = _rand_past_date(180)
                duration = random.randint(1, 10)
                ret = pickup + timedelta(days=duration)
                created = timezone.make_aware(
                    datetime.combine(pickup - timedelta(days=random.randint(1, 5)),
                                     datetime.min.time()) + timedelta(hours=random.randint(8, 18))
                )
            elif status == "approved":
                pickup = _rand_future_date(45)
                duration = random.randint(1, 7)
                ret = pickup + timedelta(days=duration)
                created = timezone.make_aware(
                    datetime.combine(date.today() - timedelta(days=random.randint(0, 15)),
                                     datetime.min.time()) + timedelta(hours=random.randint(8, 20))
                )
            elif status == "pending":
                pickup = _rand_future_date(30)
                duration = random.randint(1, 6)
                ret = pickup + timedelta(days=duration)
                created = timezone.make_aware(
                    datetime.combine(date.today() - timedelta(days=random.randint(0, 2)),
                                     datetime.min.time()) + timedelta(hours=random.randint(6, 22))
                )
            else:  # rejected / cancelled
                pickup = _rand_past_date(90)
                duration = random.randint(1, 5)
                ret = pickup + timedelta(days=duration)
                created = timezone.make_aware(
                    datetime.combine(pickup - timedelta(days=random.randint(1, 7)),
                                     datetime.min.time()) + timedelta(hours=random.randint(8, 18))
                )

            category = vehicle.category
            unit = f"{vehicle.make} {vehicle.model}"
            days = max((ret - pickup).days, 1)
            total = Decimal(vehicle.daily_rate) * days

            booking = Booking(
                customer=customer,
                vehicle=vehicle if status != "pending" else None,
                requested_category=category,
                requested_unit=unit,
                pickup_date=pickup,
                return_date=ret,
                driver_option=random.choice(DRIVER_OPTIONS),
                special_notes=random.choice(SPECIAL_NOTES_POOL),
                status=status,
                total_amount=total,
            )
            booking.save()  # reference auto-generated

            # Backdate created_at realistically
            Booking.objects.filter(pk=booking.pk).update(created_at=created)

            # Attach reviewer for reviewed statuses
            if status in ("approved", "rejected", "completed"):
                booking.reviewed_by = random.choice(managers)
                booking.reviewed_at = created + timedelta(
                    hours=random.randint(1, 48), minutes=random.randint(0, 59)
                )
                if status == "approved":
                    booking.manager_feedback = random.choice(MANAGER_FEEDBACK_APPROVED)
                elif status == "rejected":
                    booking.manager_feedback = random.choice(MANAGER_FEEDBACK_REJECTED)
                else:  # completed
                    booking.manager_feedback = "Rental completed successfully."
                booking.save()

            bookings.append(booking)

        self.stdout.write(f"  → Bookings: {len(bookings)}")
        return bookings

    # ---------- Reporting ----------

    def _print_credentials(self):
        self.stdout.write(self.style.HTTP_INFO(
            "\n" + "=" * 60 + "\n"
            "  LOGIN CREDENTIALS\n" + "=" * 60 + "\n"
            "  Admin      → admin       / admin123\n"
            "  Supervisor → rafiki.ndayitegeye / admin123\n"
            "  Manager    → manager     / manager123\n"
            "  Customer   → customer    / customer123\n"
            "  (All other customers/managers use password: customer123 / manager123)\n"
            + "=" * 60
        ))