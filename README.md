# Board Game Rental Exchange Network 🎲☕

A robust physical board game rental exchange network built with **Python (Django)** and **React**. This project implements the crowdsourced physical game rental model, partner cafe representatives (representative hubs), tiered subscription models, wallet systems, security deposits, and custom mathematical structures for damages and late fees.

---

## 🛠️ System Architecture & Business Logic

Based on the shared product vision, the exchange platform coordinates several core logistics:

### 1. Subscription & Security Deposits
Users subscribe to tier plans which dictate the lease durations, rental fees, and security deposit percentages:
* **Basic Tier**: $10/mo, 100% security deposit required, 3-day free rental period, 10% value rent fee.
* **Premium Tier**: $20/mo, 70% security deposit required, 7-day free rental period, 7% value rent fee.
* **VIP Tier**: $35/mo, 50% security deposit required, 10-day free rental period, 5% value rent fee.

*Note: The security deposit is deducted into a platform escrow wallet when a rental is requested.*

### 2. Physical Verification & Damage Assessment
* When returning a game, the **Cafe Partner** acts as the local inspector.
* If a game is returned **safely**:
  - The security deposit is returned, minus the tier's base rental fee and any accrued late fees.
  - **Late Fee Math**: $25% of the game's retail price is charged daily for every day past the subscription's free rental limit.
* If a game is **permanently damaged or unplayable**:
  - The user's wallet is charged the **full cost (100%)** of the game.
  - The security deposit is refunded back (retaining the full game price as penalty).

### 3. Collective Inventory (Crowdsourcing) & Revenue Share
* Cafe partners list their physical game inventory on the platform.
* When a user rents a crowdsourced game, the **Cafe Owner earns a fixed 20% revenue share** of the retained rental fee upon safe return.
* **Multi-City Inventory Constraint**: Renters must return physical board games to the exact location cafe where they picked them up.

---

## 📦 Directory Structure

```
boardgame_exchange_project/
├── backend/                  # Python Django Backend
│   ├── manage.py
│   ├── seed_data.py          # Seeding script for DB Setup
│   ├── boardgame_exchange/   # Core Settings and Main URLs
│   └── rental_network/       # App Models, Views, Serializers, URLs
└── frontend/                 # Vite + React Frontend (Tailwind CSS)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── components/       # Core Components (Navbar)
    │   ├── context/          # Auth Context (JWT, Profiles, Wallet state)
    │   └── pages/            # Role-Specific Dashboards (User, Cafe, Admin)
```

---

## 🚀 Setup & Execution Instructions

### 1. Django Backend Setup

Prerequisites: Python 3.10+ installed.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Perform database migrations (creates SQLite tables):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Seed subscription tiers and create the default admin credentials:
   ```bash
   python manage.py shell < seed_data.py
   ```
   * *This will output: "Created admin superuser (user: admin, pass: admin123)"*
6. Start the development server:
   ```bash
   python manage.py runserver
   ```
   *Backend is now listening at `http://localhost:8000`.*

---

### 2. React Frontend Setup

Prerequisites: Node.js (v18+) installed.

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend is now listening at `http://localhost:3000`.*

---

## 🎯 Verification & Testing Flow

1. **Sign Up / Registration**: Register a new account under `/register`. Select the user role **User / Regular Renter** or **Cafe Partner**.
2. **Setup Cafe Hub (For Cafe Partners)**:
   * Login as a `CAFE_PARTNER` account.
   * Fill out the cafe registration form to bind your cafe to your user.
   * Add a crowdsourced board game (e.g. Catan, retail value $50). It is registered directly in your cafe's inventory.
3. **Regular Renter Flow**:
   * Login as a `USER`.
   * Top up your wallet in the dashboard (e.g. add $100).
   * Subscribe to a tier (e.g., Premium Tier for $20). You will immediately see your free rental limits and deposit rates updated.
   * Click **Request Rent** on the newly listed board game. Your wallet will automatically lock and subtract the subscription-dependent security deposit.
4. **Physical Pickup & Handover (By Cafe Partner)**:
   * Log back in as the `CAFE_PARTNER`.
   * Under **Pending Handover**, verify the renter's request and click **Handover Game**.
   * This begins the rental period and sets the due date.
5. **Physical Return & Financial Settlement**:
   * Renter returns the game physically to the cafe.
   * Cafe Partner logs in and clicks **Confirm Return** under **Verify Returns**.
   * Process return as **Safe** or check **Damaged** to simulate fees.
   * System performs the math, transfers the refund to the user, and adds the revenue share earnings to the Cafe Partner's dashboard!