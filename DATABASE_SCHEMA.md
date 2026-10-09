# DATABASE_SCHEMA.md — Database Schema & Entity Relationships

## 1. Entity Relationship Overview
The database uses SQLite managed through Django ORM. Below are the key models and their relational mappings.

```
+--------------------+       1:1       +--------------------+
|     CustomUser     | <-------------> |    UserProfile     |
+--------------------+                 +--------------------+
| id (PK)            |                 | id (PK)            |
| username           |                 | wallet_balance     |
| email              |                 | escrow_balance     |
| role               |                 | subscription_tier  |
+--------------------+                 +--------------------+
          |                                      | FK
          | 1:N (Representative)                 v
          v                            +--------------------+
+--------------------+                 |  SubscriptionTier  |
|    PartnerCafe     |                 +--------------------+
+--------------------+                 | deposit_percent    |
| id (PK)            |                 | free_days          |
| name, city, address|                 | fee_multiplier     |
+--------------------+                 +--------------------+
          |
          | 1:N
          v
+--------------------+       N:1       +--------------------+
|   InventoryItem    | --------------> |     BoardGame      |
+--------------------+                 +--------------------+
| id (PK)            |                 | title, publisher   |
| barcode, condition |                 | retail_price       |
+--------------------+                 +--------------------+
          |
          | 1:N
          v
+--------------------+
|       Rental       |
+--------------------+
| user (FK)          |
| inventory_item (FK)|
| pickup_cafe (FK)   |
| deposit_amount     |
| status             |
+--------------------+
```

## 2. Detailed Table Specifications

### `CustomUser`
- `id`: BigAutoField (Primary Key)
- `username`: CharField(150, unique=True)
- `role`: CharField choices (`RENTER`, `CAFE_PARTNER`, `ADMIN`)

### `UserProfile`
- `user`: OneToOneField(CustomUser)
- `wallet_balance`: DecimalField(10, 2, default=0.00)
- `escrow_balance`: DecimalField(10, 2, default=0.00)
- `subscription_tier`: ForeignKey(SubscriptionTier, null=True)

### `SubscriptionTier`
- `name`: CharField(50) — `Basic`, `Gold`, `Platinum`
- `deposit_percent`: DecimalField(5, 2) — `100.00`, `70.00`, `50.00`
- `free_days`: IntegerField — `3`, `7`, `10`
- `fee_multiplier`: DecimalField(3, 2) — `1.00`, `0.80`, `0.50`

### `Rental`
- `renter`: ForeignKey(CustomUser)
- `inventory_item`: ForeignKey(InventoryItem)
- `pickup_cafe`: ForeignKey(PartnerCafe)
- `deposit_amount`: DecimalField(10, 2)
- `rent_fee_charged`: DecimalField(10, 2)
- `late_fee_charged`: DecimalField(10, 2)
- `status`: CharField (`RESERVED`, `PICKED_UP`, `RETURNED_SAFE`, `RETURNED_DAMAGED`, `CANCELLED`)
- `pickup_date`: DateTimeField(null=True)
- `due_date`: DateTimeField(null=True)
- `return_date`: DateTimeField(null=True)
