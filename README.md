# CafeBook — Online Cafe Reservation System

A complete full-stack cafe reservation platform built for a college Software
Testing & Automation project. Customers browse the cafe and menu, register,
reserve a specific table and manage their bookings. Administrators manage
bookings, tables, menu items and customers from a protected dashboard.

> Current status: **Phases 1–5 complete.** The application is connected to
> Supabase and the main customer and administrator workflows have been verified
> locally through the live API. GitHub push, deployment, Selenium/WebDriver,
> and Postman/Newman testing are intentionally deferred to later phases.
>
> Verified locally: frontend production build, backend startup and health,
> public cafe/menu/table/availability APIs, customer registration/login,
> authenticated profile update, booking creation, duplicate-booking rejection,
> booking lookup/listing, cancellation and slot release, admin login and
> dashboard APIs, admin booking status transitions, table CRUD, menu CRUD,
> input validation, and server-side customer/admin authorization.

---

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Vite 6, JavaScript, Tailwind CSS 3, React Router 6, Axios, Lucide React |
| Backend    | Node.js, Express 4, JavaScript, REST, Zod validation, Helmet, CORS, Morgan |
| Database   | Supabase PostgreSQL (schema, RLS, constraints, RPC functions) |
| Auth       | Supabase Auth (email + password) with backend-verified access tokens |

---

## Project structure

```
cafe project/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # AdminPageHeader
│   │   │   ├── layout/           # Navbar, Footer
│   │   │   ├── ui/               # Button, Field, Modal, Badge, StatCard, …
│   │   │   ├── BookingCard.jsx
│   │   │   ├── MenuCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── hooks/                # useAuth, useToast
│   │   ├── layouts/              # MainLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/            # Overview, Bookings, Tables, Menu, Customers
│   │   │   ├── Home.jsx
│   │   │   ├── Cafe.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── BookTable.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/             # api.js + auth/cafe/booking/admin services
│   │   ├── utils/                # date, time and currency formatting
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── scripts/
│   │   └── create-admin.js       # npm run seed:admin
│   ├── src/
│   │   ├── config/               # env.js, supabase.js
│   │   ├── controllers/          # auth, cafe, table, booking, admin
│   │   ├── middleware/           # auth, admin, validate, errorHandler
│   │   ├── routes/               # REST route modules + index
│   │   ├── services/             # business logic + Supabase queries
│   │   ├── utils/                # ApiError, asyncHandler, time, assertUuid
│   │   ├── validators/           # Zod schemas
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── migrations/
│   │   ├── README.md
│   │   └── 001_initial_schema.sql
│   ├── schema.sql                # tables, constraints, RLS, functions
│   └── seed.sql                  # cafe, 10 tables, 22 menu items
│
├── documentation/
│   └── architecture.md
├── .gitignore
└── README.md
```

---

## 1. Supabase setup (required before the app can show real data)

1. Create a free project at <https://supabase.com>.
2. In **SQL Editor**, run the contents of `database/schema.sql`, then
   `database/seed.sql`.
   - `schema.sql` needs the `btree_gist` extension (the script creates it).
3. In **Authentication → Providers → Email**, keep Email enabled.
   - Registration uses the service-role Admin API with
     `email_confirm: true`, so accounts work immediately even with email
     confirmation switched on. You may still disable confirmation in
     development if you prefer.
4. In **Project Settings → API**, copy:
   - Project URL
   - `anon` (publishable) key
   - `service_role` (secret) key
5. Create `backend/.env` from `backend/.env.example` and paste the three values.
6. Create `frontend/.env` from `frontend/.env.example` (default API URL is
   `http://localhost:5000/api`).
7. Create the administrator account:

```bash
cd backend
npm run seed:admin
```

The default admin is read from `backend/.env`:

```
ADMIN_EMAIL=admin@cafebook.com
ADMIN_PASSWORD=CafeBook@123
ADMIN_NAME=CafeBook Admin
```

Change the password before any deployment.

> **Never** put the service-role key in the frontend or commit it. Only
> `backend/.env` (gitignored) holds it.

---

## 2. Install and run locally

Dependencies are already installed in this workspace. On a fresh clone:

```bash
cd frontend && npm install
cd ../backend && npm install
```

Run the two dev servers in separate terminals:

```bash
# Terminal 1 — Express API on http://localhost:5000
cd backend
npm run dev

# Terminal 2 — Vite app on http://localhost:5173
cd frontend
npm run dev
```

Useful checks:

- API health: <http://localhost:5000/api/health>
  (`supabaseConfigured` must be `true`)
- Frontend: <http://localhost:5173>

Production build check:

```bash
cd frontend
npm run build
```

---

## 3. What is implemented

### Customer

- Premium responsive homepage with hero, story, featured menu, features,
  reservation CTA, opening hours and contact details.
- Cafe details page: description, address, contact, hours and facilities.
- Menu page with category filtering, images, prices and availability.
- Registration and login with validation and inline server errors.
- Protected customer routes, JWT refresh, logout.
- Three-step reservation wizard: date, time slot, guests → available tables →
  review and confirm. Unique booking reference on success.
- My bookings: upcoming / past / all, status badges, cancellation with
  confirmation dialog.
- Profile: edit name and phone, read-only email, membership details.

### Administrator

- Separate `/admin` area protected by backend role checks.
- Overview: total, pending, confirmed and cancelled counts, customer/table
  totals, today's schedule and recent activity.
- Bookings: filter by status/date, confirm, complete or cancel.
- Tables: add, edit, activate/deactivate, seat capacity.
- Menu: add, edit, delete, mark available/unavailable.
- Customers: searchable list with contact details and booking counts.

### Booking integrity (database level)

- 90-minute seating, starts every 30 minutes within cafe hours.
- Rejects past dates/times, dates more than 60 days ahead, invalid slots,
  guests above table capacity, and duplicate active bookings by the same user.
- PostgreSQL `EXCLUDE USING gist` constraint blocks overlapping active
  bookings per table **inside the database**, even for simultaneous requests.
- Cancelled bookings release their slot automatically.
- Statuses: `pending`, `confirmed`, `cancelled`, `completed`.
- Finished reservations are swept to `completed` by the API.

---

## 4. REST API

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| POST | `/api/auth/register` | Public | Create account + session |
| POST | `/api/auth/login` | Public | Sign in |
| POST | `/api/auth/refresh` | Public | Rotate access token |
| GET | `/api/auth/me` | Auth | Current profile |
| PATCH | `/api/auth/profile` | Auth | Update name/phone |
| POST | `/api/auth/logout` | Auth | Revoke Supabase session |
| GET | `/api/cafes` | Public | List active cafes |
| GET | `/api/cafes/:id` | Public | Cafe + generated time slots |
| GET | `/api/cafes/:id/menu` | Public | Menu items |
| GET | `/api/tables` | Public | Active tables (`?cafeId=`) |
| GET | `/api/availability` | Public | Tables for date/time/guests |
| POST | `/api/bookings` | Customer | Create reservation |
| GET | `/api/bookings` | Customer | Own bookings |
| GET | `/api/bookings/:id` | Owner/Admin | Booking details |
| PATCH | `/api/bookings/:id/cancel` | Owner | Cancel booking |
| GET | `/api/admin/stats` | Admin | Dashboard counts + today |
| GET | `/api/admin/bookings` | Admin | All bookings, filters |
| PATCH | `/api/admin/bookings/:id/status` | Admin | Change status |
| GET | `/api/admin/customers` | Admin | Customers + counts |
| GET/POST | `/api/admin/tables` | Admin | List/create tables |
| PUT | `/api/admin/tables/:id` | Admin | Update table |
| GET/POST | `/api/admin/menu` | Admin | List/create menu items |
| PUT/DELETE | `/api/admin/menu/:id` | Admin | Update/delete item |

All errors return `{ "message": "...", "errors": {...} }` with appropriate HTTP
status codes (400, 401, 403, 404, 409, 422, 500).

### Example: availability

```
GET /api/availability?cafeId=<uuid>&date=2026-11-25&time=19:00&guests=4
```

Returns the table list with `is_available` and `capacity_ok`, computed from
overlapping `pending`/`confirmed` bookings.

---

## 5. Booking rules used everywhere

| Rule | Value |
|------|-------|
| Cafe hours | 10:00 – 22:00 (Asia/Kolkata) |
| Seating duration | 90 minutes |
| Slot step | 30 minutes |
| Last start time | 20:30 |
| Guests | 1–20 (UI offers 1–8; tables hold up to 8) |
| Advance booking | up to 60 days |
| Active statuses | `pending`, `confirmed` |
| Booking reference | `CB-XXXXXXXX` |

One source of truth: the SQL function `create_booking`, plus the exclusion
constraint. The frontend and Express validation are convenience layers only.

---

## 6. Security model

- Supabase Auth issues access + refresh tokens; the Express API verifies every
  protected access token with `auth.getUser(token)`.
- Admin APIs require the `profiles.role = 'admin'` check **on the server**.
- The service-role key lives only in `backend/.env`.
- RLS is enabled on every table. Direct PostgREST access cannot create/update
  bookings; profile updates are limited to name and phone columns.
- All input is validated with Zod before it reaches the database.
- Helmet, JSON body limits, CORS allow-list and centralized error handling are
  configured.

---

## 7. Verification checklist (Phase 5)

The local verification phase is complete:

1. `npm run seed:admin` succeeds and repairs or creates the administrator.
2. `GET /api/health` returns `status: "ok"` and `supabaseConfigured: true`.
3. Cafe, menu, table and availability endpoints return live Supabase data.
4. Customer registration and token-authenticated `/me` access succeed.
5. Customer profile name and phone updates persist successfully.
6. A reservation is created with a booking reference and `pending` status.
7. Duplicate booking attempts are rejected with HTTP 409.
8. Booking listing and detail endpoints return the customer reservation.
9. Customer cancellation succeeds and releases the table slot.
10. Invalid request data is rejected with HTTP 422.
11. Administrator login succeeds and dashboard, booking, customer, table and
    menu APIs return successfully.
12. Administrator booking status transitions (`pending` → `confirmed` →
    `cancelled`) work and are visible to the customer.
13. Administrator table create/deactivate and menu create/update/delete
    operations succeed.
14. Customer access to `/admin` APIs is rejected with HTTP 403.
15. Frontend production build succeeds with Vite.

---

## 8. Not started yet (by design)

- GitHub push and deployment (Vercel + Render).
- Selenium WebDriver + Mocha UI automation.
- Postman/Newman API collections and reports.
- Production environment variables and redirect URLs.

See `documentation/architecture.md` for diagrams and deeper design notes.
