# Vehicle Rental & Booking Management System

**Case Study:** Car Rental Company (Rwanda)  
**Author:** Bazirake Ben — BBICTR/2024/45385  
**Institution:** Mount Kigali University (MKU)  
**Year:** 2026

A full-stack Management Information System (MIS) for digitizing vehicle rental bookings, fleet management, and customer invoicing — built with **Django + Django REST Framework**, **React + Vite + Tailwind CSS v4**.

---

## 🎯 Objectives Met

1. ✅ **Relational Database** — PostgreSQL-ready schema (SQLite for dev) linking Users, Vehicles, and Bookings.
2. ✅ **Web UI** — Responsive, mobile-first React SPA matching the academic prototype.
3. ✅ **Automated Workflow** — Customer → Pending → Fleet Manager → Approved → Invoice.

---

## 🏗️ Architecture
┌─────────────┐ JWT ┌──────────────┐ ORM ┌────────────┐
│ React SPA │ ─────────► │ Django + DRF │ ────────► │ PostgreSQL │
│ (Vite) │ ◄───────── │ REST API │ ◄──────── │ (or SQLite)│
└─────────────┘ └──────────────┘ └────────────┘


### Roles & Permissions
| Role | Capabilities |
|------|--------------|
| **Customer** | Sign up, sign in, browse fleet, create bookings, view status & invoices |
| **Fleet Manager** | Review pending bookings, approve/reject, update vehicle availability |
| **Administrator** | Manage users & roles, generate financial/activity reports, view all bookings |

---

## ⚡ Quick Start

### 1. Clone & Backend

```bash
git clone https://github.com/<your-username>/vehicle-rental-system.git
cd vehicle-rental-system/backend

python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # then edit SECRET_KEY
python manage.py migrate
python manage.py seed_data --flush
python manage.py runserver       # → http://localhost:8000
'''
'''
### 2. Frontend
bash
cd ../frontend
npm install
cp .env.example .env
npm run dev                      # → http://localhost:5173
🔑 Demo Credentials
Role	Username	Password
Administrator	admin	admin123
Supervisor	rafiki.ndayitegeye	admin123
Fleet Manager	manager	manager123
Customer	customer	customer123
Customers can also self-register from the login page.

🧪 API Endpoints
Method	Endpoint	Access	Purpose
POST	/api/auth/register/	Public	Customer signup
POST	/api/auth/login/	Public	JWT login
POST	/api/auth/refresh/	Public	Refresh token
GET	/api/users/me/	Any	Current user profile
GET	/api/users/	Admin	List users
PATCH	/api/users/:id/	Admin	Update role/status
GET	/api/vehicles/	Any	All vehicles
GET	/api/vehicles/available/	Any	Available fleet (search/filter)
PATCH	/api/vehicles/:id/set_status/	Manager/Admin	Change availability
GET	/api/bookings/	Role-scoped	List bookings
POST	/api/bookings/	Customer	Create booking
GET	/api/bookings/pending/	Manager/Admin	Pending queue
POST	/api/bookings/:id/approve/	Manager/Admin	Approve
POST	/api/bookings/:id/reject/	Manager/Admin	Reject
GET	/api/reports/financial/	Admin	Financial summary
GET	/api/reports/activity/	Admin	Recent activity
📁 Project Structure
text
vehicle_rental_system/
├── backend/
│   ├── accounts/          # Custom User model + auth
│   ├── bookings/          # Booking model + workflow
│   ├── vehicles/          # Fleet model + seed command
│   ├── reports/           # Admin analytics
│   └── config/            # Django settings & URLs
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client + endpoints
│   │   ├── components/    # Customer/Manager/Admin views
│   │   ├── context/       # Auth context
│   │   └── pages/         # Login, Signup, Dashboard
│   └── vite.config.js
└── README.md
📄 License
This project is submitted in partial fulfillment of the requirements for the award of Bachelor of Business Information Communication Technology of Mount Kigali University.

🙏 Acknowledgments
Supervisor: Mr. Rafiki NDAYITEGEYE, Mount Kigali University.

text

---

## 🧾 Step 4 — Create `backend/requirements.txt`

```bash
cd backend
pip freeze > requirements.txt
Or if you want a clean, pinned version:

txt
Django>=5.0,<6.0
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
python-dotenv>=1.0
psycopg2-binary>=2.9
Pillow>=10.0
