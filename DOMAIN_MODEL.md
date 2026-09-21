# DOMAIN_MODEL.md — Domain-Driven Design (DDD) Model

## 1. Bounded Contexts

```
+-------------------------------------------------------------------+
|                        Domain Architecture                        |
|                                                                   |
| +-------------------------+     +-------------------------------+ |
| | User & Wallet Context   |     | Subscription Context          | |
| | - User, Profile         |     | - Tier, Benefit Rules         | |
| | - Ledger, Escrow Hold   |     |                               | |
| +-------------------------+     +-------------------------------+ |
|                                                                   |
| +-------------------------+     +-------------------------------+ |
| | Inventory & Cafe Hub    |     | Rental Lifecycle & Logistics  | |
| | - Cafe, BoardGame       |     | - Rental, Handover, Return    | |
| | - Item Condition        |     | - Late/Damage Calculation     | |
| +-------------------------+     +-------------------------------+ |
|                                                                   |
| +---------------------------------------------------------------+ |
| | Settlement & Revenue Sharing Context                          | |
| | - Cafe Commission Ledger, Platform Margin                     | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

## 2. Core Entities & Value Objects
- **User (Aggregate Root)**: Controls account identity, wallet balance, and escrowed funds.
- **SubscriptionTier (Value Object)**: Immutable set of parameters defining deposit rates and free rental durations.
- **InventoryItem (Entity)**: Physical board game copy located at a specific Partner Cafe.
- **Rental (Aggregate Root)**: Orchestrates the rental state machine, calculating due dates, late penalties, and deposit settlements.

## 3. Domain Events
- `RentalRequested`: Triggers deposit calculation and wallet escrow lock.
- `RentalHandedOver`: Marks item as checked out and sets exact `due_date`.
- `RentalReturnedIntact`: Computes base rent fee + late fee, settles escrow, releases remaining deposit, and credits cafe revenue share.
- `RentalReturnedDamaged`: Executes 100% full game cost charge to user wallet, releases escrow, and flags item as damaged.
