# PRODUCT_SPEC.md — Product Requirement Document (PRD)

## 1. Product Vision & Summary
The **Board Game Rental Exchange Network** is a decentralized, crowdsourced physical board game sharing platform. It enables individual board game lovers and partner board game cafes to list games for rent, while renters access games under subscription plans that reduce security deposit burdens and offer free rental windows.

## 2. Core Feature Requirements

### A. Subscription & Wallet Mechanics
- **Wallet**: Pre-funded account balance used for deposit holds, rental fees, and damage charges.
- **Subscription Tiers**:
  - **Basic**: 100% deposit hold, 3 free rental days.
  - **Gold**: 70% deposit hold, 7 free rental days.
  - **Platinum**: 50% deposit hold, 10 free rental days.

### B. Rental Fees & Penalty Mathematics
- **Base Rental Fee**: `10% * Retail Price * Tier Multiplier`.
- **Late Penalty**: `25% * Retail Price` for each day overdue beyond the tier's free day allowance.
- **Damage Settlement**: If a game is returned damaged or unplayable, the platform charges **100% of the game's retail price** to the user.

### C. Partner Cafe Integration
- Cafes serve as physical representation hubs for pickup and return.
- **Logistics Constraint**: Games MUST be returned to the same cafe location where they were picked up.
- **Revenue Sharing**: Cafes receive an automated **20% payout** on every completed base rental fee for crowdsourced items hosted at their hub.

### D. User Interface & Dashboards
- **Renter View**: Catalog browsing, subscription purchasing, wallet top-up, active rental tracking.
- **Cafe Partner View**: Physical handover/pickup terminal, inspection & return terminal, crowdsourced game manager, earnings ledger.
- **Admin Panel**: Network metrics, cafe onboarding, subscription tier management.
