# AI Coding Agent Specification: Board Game Rental Exchange Network

You are an expert full-stack developer. Your task is to implement a complete, production-ready, functional web application for the **Board Game Rental Exchange Network** using **Python (Django REST Framework)** on the backend and **React (Vite + Tailwind CSS)** on the frontend. The project must be fully integrated, secure, and ready for deployment with a local SQLite database and standard JWT authentication.

Follow the strict business rules, technical stack, and design guidelines specified below.

---

## 1. Core Business Rules & Financial Math

The platform handles the crowdsourcing and rental of physical board games through local partner cafe hubs [1, 2]. You must implement the following math formulas and logical checks inside Django atomic transactions:

### A. Subscription Tiers & Deposit Escrow
Users subscribe to plans that dictate their rental terms:
* **Basic Plan**: 100% security deposit hold [1] | 3 days free rental duration [1]
* **Gold Plan**: 70% security deposit hold [1] | 7 days free rental duration [1]
* **Platinum Plan**: 50% security deposit hold [1] | 10 days free rental duration [1]

*When renting a board game (e.g., Retail Value $100)*:
1. Lock the security deposit in **Escrow** using the renter's subscription tier rate (e.g., Gold user pays a $70 hold).
2. Deduct this amount from their user wallet. If their wallet balance is insufficient, reject the rental request.

### B. Rental Fee & Deposit Retention (Upon Return)
When a game is returned on time, the actual rental fee is calculated as a combination of a flat percentage of the game's retail value and a discount multiplier based on their subscription tier:
* **Base Rental Fee**: 10% of the board game's retail value.
* **Subscription Tier Multiplier**:
  * **Basic User**: 1.0x (Pays 100% of Base Fee)
  * **Gold User**: 0.8x (20% discount)
  * **Platinum User**: 0.5x (50% discount)
* *Calculation Example*: A Platinum user renting a $100 game pays: `$100 * 10% * 0.5 = $5.00` total rental fee. This $5.00 is retained by the platform, and the remaining $45.00 of their $50.00 escrow is refunded to their wallet.

### C. Late Fee Calculation
If a game is returned late (exceeding the subscription's free rental days) [1]:
* **Late Fee**: Charged at **25% of the game's retail price per day overdue**.
* *Calculation Example*: If a user is 2 days late on a $100 game, they owe `$100 * 25% * 2 = $50.00` in late fees.
* Deduct late fees from the remaining escrowed deposit first, and if that is exceeded, charge the renter's remaining active wallet balance.

### D. 100% Damage Settlement Rule
If the partner cafe inspects a returned game and flags it as **ruined/unplayable** [1, 2]:
* Do **not** charge a standard rental fee or late fee.
* Charge the user the **full 100% retail cost** of the board game directly to their wallet [2].
* Release the escrowed security deposit back to the user's wallet (or use the escrow to cover the damage fee).

### E. Cafe Revenue Sharing
* For crowdsourced games owned by a partner cafe [2]: The system must automatically calculate a **20% revenue share** of the base rental fee upon a safe return.
* Credit this 20% commission directly to the partner cafe's internal ledger balance. The remaining 80% is retained by the platform.

### F. Logistics & Returns (Strict Multi-City Constraint)
* Users **must return** the physical board game to the **exact partner cafe location** where they picked it up [2]. The backend must block return requests at any other location.

---

## 2. Technical Stack & Architecture

### Backend: Django REST Framework (DRF)
* **Language**: Python 3.12+
* **Database**: SQLite (local development)
* **Authentication**: Django REST Framework SimpleJWT (`/api/token/` and `/api/token/refresh/`). No OTP/SMS is required at first; use traditional username/password credentials.
* **Required Models**:
  * `User`: Custom user inheriting from `AbstractUser` with a `role` field (Renter, Partner Cafe, Admin).
  * `UserProfile`: Linked 1-to-1 with User. Tracks `wallet_balance` and `subscription_tier` (Basic, Gold, Platinum).
  * `Cafe`: Represents a local partner hub with `name`, `city`, `address`, and `owner` (foreign key to User). Tracks `revenue_balance`.
  * `BoardGame`: Represents a game metadata template with `title`, `description`, and `retail_price`.
  * `InventoryItem`: Represents a physical copy of a game with `owner` (either Platform or a Cafe User), `current_cafe` (hub location), and `status` (Available, Rented, Damaged).
  * `Rental`: Tracks individual transactions: `renter`, `inventory_item`, `pickup_cafe`, `status` (Requested, Picked Up, Returned, Damaged), `escrow_held`, `rental_fee_charged`, `late_fee_charged`, `damage_fee_charged`, `started_at`, `due_at`, `returned_at`.
  * `WalletTransaction`: Logs wallet adjustments (Deposit, Hold, Refund, Fees).

### Frontend: React (Vite + Tailwind CSS)
* **State Management**: Context API (`AuthContext`) to manage global authentication tokens, active user profiles, and real-time wallet balances.
* **Routing**: React Router with protected paths based on user roles.
* **Styling**: Modern, responsive dashboard design utilizing Tailwind CSS.

---

## 3. UI/UX Interface Requirements

Your frontend must render three primary layouts based on the authenticated user's role:

### A. Renter Dashboard
* **Wallet Manager**: View current balance, add dummy funds (top up), and view the active subscription tier with an option to upgrade.
* **Game Catalog**: Browse physical board games available across local partner cafes. Request to rent a game, showing the dynamic security deposit hold before checkout.
* **Active Rentals Tracker**: Monitor active rentals, view pickup hub details, and see countdowns to the due date.

### B. Partner Cafe Dashboard
* **Inventory Management**: View list of games hosted at their physical cafe. List new crowdsourced games to earn a 20% revenue share [2].
* **Handover Terminal**:
  * **Pickup Verification**: Search active rental bookings and confirm physical handover (sets rental start time and due date).
  * **Return Verification**: Process physical drop-offs. Provide checkboxes to verify condition (Safe Return vs. Game Damaged) to instantly calculate and trigger backend fee settlements.

### C. Admin Panel
* **Network Metrics**: High-level telemetry displaying total renters, active hubs, overall wallet floats, platform rent commissions, and accumulated late/damage penalties.
* **Onboarding Hub**: Form to register and authorize new Partner Cafe hubs and assign representative user accounts.

---

## 4. Setup & Database Seeding

Provide an automated shell script or seed file (`seed.py`) that instantly:
1. Creates three subscription plans: Basic, Gold, Platinum.
2. Registers a global platform Admin user (`admin` / `admin123`).
3. Registers a representative Cafe user (`partner_cafe` / `partner123`) and onboards a physical hub.
4. Registers a preloaded Renter user (`renter_user` / `renter123`) with **$200.00** in their wallet and an active Gold plan.
5. Populates the global catalog with a few baseline physical board games.

Please generate all folders, components, configurations, and backend modules to make this system fully executable immediately.
