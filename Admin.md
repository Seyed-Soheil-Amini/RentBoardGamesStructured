# Admin.md — Platform Administration Specification

## 1. Overview
The **Platform Administration Workspace** equips system operators with full visibility and control over the Board Game Rental Exchange Network. It provides centralized tools to monitor network liquidity, manage cafe partner onboarding, configure subscription tiers, and resolve dispute exceptions.

## 2. Key Administrative Capabilities
- **Partner Cafe Onboarding**: Create and verify physical cafe locations, assign representative user accounts, and track cafe activity.
- **Subscription Tier Configuration**: Adjust tier parameters (deposit hold percentages, free rental day allowances, fee multipliers).
- **Global Financial Ledger**: View total platform wallet balances, total security deposits locked in escrow, total rental revenue, and cafe payouts.
- **Dispute & Damage Auditing**: Review damage logs submitted by cafe representatives, audit full retail price charges, and issue manual adjustments if necessary.

## 3. Administrative API Endpoints
- `GET /api/admin/metrics/`: Overview of total active rentals, total escrows, revenue generated, and total partner hubs.
- `POST /api/admin/cafes/`: Onboard a new partner cafe location and assign its owner.
- `PATCH /api/admin/subscriptions/<id>/`: Modify parameters for Basic, Gold, or Platinum tiers.
- `GET /api/admin/transactions/`: Full audit trail of all wallet transactions and escrow locks across the network.
