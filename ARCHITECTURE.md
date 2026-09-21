# ARCHITECTURE.md — System Architecture & Technology Stack

## 1. Executive Architecture Overview
The **Board Game Rental Exchange Network** is structured as a decoupled client-server architecture. The backend provides a RESTful API built with Django REST Framework, managing state, financial calculations, and database persistence. The frontend is a modern React Single Page Application (SPA) styled with Tailwind CSS.

```
+-----------------------------------------------------------------------+
|                            React SPA Frontend                         |
|  +--------------------+   +---------------------+   +---------------+ |
|  | Renter Dashboard   |   | Cafe Partner Hub    |   | Admin Console | |
|  +--------------------+   +---------------------+   +---------------+ |
+-----------------------------------|-----------------------------------+
                                    | REST APIs (JSON / JWT)
+-----------------------------------|-----------------------------------+
|                         Django REST Backend                           |
|  +--------------------+   +---------------------+   +---------------+ |
|  | Auth & User App    |   | Escrow & Rent Engine|   | Cafe Ledger   | |
|  +--------------------+   +---------------------+   +---------------+ |
+-----------------------------------|-----------------------------------+
                                    | Django ORM
+-----------------------------------|-----------------------------------+
|                        SQLite Database Engine                         |
+-----------------------------------------------------------------------+
```

## 2. Core Service Modules
1. **Authentication & Identity Service**: JWT token generation, refreshing, role-based access control (RBAC).
2. **Wallet & Escrow Engine**: Atomic ledger entries for deposits, refunds, rental fee deductions, and penalty processing.
3. **Inventory & Cafe Hub Management**: Geo-location tracking for physical cafes, crowdsourced listing tracking.
4. **Rental Lifecycle Manager**: Finite State Machine (FSM) tracking rentals across states: `REQUESTED` -> `PICKED_UP` -> `RETURNED_SAFE` / `RETURNED_DAMAGED`.

## 3. Key Transaction Sequence Flows

### A. Rental Request & Escrow Lock
1. User requests a board game rental at a specific Cafe location.
2. Backend checks user's `wallet_balance` >= `required_deposit`.
3. System moves `required_deposit` from `wallet_balance` to `escrow_balance` and sets rental status to `REQUESTED`.

### B. Physical Handover
1. Cafe Representative verifies renter identity and clicks "Confirm Pickup".
2. System sets rental status to `PICKED_UP`, records `pickup_timestamp`, and calculates `due_date = pickup_timestamp + free_days`.

### C. Inspection & Return Processing
1. Renter returns game to the exact pickup cafe.
2. Cafe Representative inspects box contents:
   - **Case 1: Intact**: Rental Fee and any overdue Late Fees are computed. Escrow is settled, user receives refund of remainder, and Cafe receives 20% commission on the base rent fee.
   - **Case 2: Damaged**: System charges full retail price of game to the user's wallet, releases deposit escrow, and marks inventory item as damaged.
