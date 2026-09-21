# BACKLOG.md — Product Development Roadmap & Task List

## Milestone 1: Core System & Authentication Foundations
- [x] Setup Django REST Framework backend with JWT authentication.
- [x] Configure CustomUser model supporting roles (`RENTER`, `CAFE_PARTNER`, `ADMIN`).
- [x] Build User Profile & Wallet models with atomic balance modification methods.
- [x] Seed initial Subscription Tiers (`Basic`, `Gold`, `Platinum`).

## Milestone 2: Partner Cafe & Inventory Management
- [x] Implement `PartnerCafe` model with city, address, and representative owner link.
- [x] Implement `BoardGame` catalog and `InventoryItem` tracking.
- [x] Build Cafe Dashboard allowing partners to list crowdsourced physical board games.

## Milestone 3: Escrow Engine & Rental Lifecycle
- [x] Build rental booking endpoint with automatic wallet escrow lock calculations.
- [x] Build Cafe Handover terminal ("Confirm Pickup") setting due date timer.
- [x] Build Return & Inspection terminal:
  - [x] Safe return math (Base Rent Fee + Daily Late Fee deduction).
  - [x] 100% Damage Settlement path charging full game retail cost.
- [x] Enforce single-location pickup & return constraint.

## Milestone 4: Revenue Sharing & Dashboards
- [x] Implement 20% cafe commission ledger split on base rental fees.
- [x] Build Renter Dashboard (Wallet top-up, subscription purchase, active rentals).
- [x] Build Cafe Partner Dashboard (Inventory, Handover/Return terminal, earnings).
- [x] Build Platform Admin Dashboard (Global metrics, cafe onboarding).

## Milestone 5: Future Enhancements (Post-MVP)
- [ ] Mobile Courier Application for direct door-to-door deliveries and inspections.
- [ ] SMS OTP Authentication integration.
- [ ] Inter-city return routing and cross-cafe inventory logistics.
- [ ] Automated game piece inventory checklists for cafe representatives.
