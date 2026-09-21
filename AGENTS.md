# AGENTS.md — System Instructions for AI Coding Agents

## Overview
This document specifies operational standards, architecture rules, and implementation patterns for AI coding agents (Cursor, Devin, Claude Engineer, etc.) building **The Board Game Rental Exchange Network**.

## Core System Invariants & Business Logic
1. **Subscription-Based Escrow Holds**:
   - **Basic Tier**: 100% retail price deposit hold | 3 free days | 1.0x rental fee multiplier.
   - **Gold Tier**: 70% retail price deposit hold | 7 free days | 0.8x rental fee multiplier.
   - **Platinum Tier**: 50% retail price deposit hold | 10 free days | 0.5x rental fee multiplier.
2. **Financial Operations & Wallet Escrow**:
   - All monetary amounts must use exact decimal calculations (`DecimalField(max_digits=10, decimal_places=2)` in Django).
   - Upon rental creation, deposit funds are moved from user `wallet_balance` into `escrow_balance`.
   - On safe return: Base rental fee = `10% * game.retail_price * subscription_multiplier`. Late fee = `25% * game.retail_price * days_overdue`.
   - Total fee is deducted from `escrow_balance`. Remaining deposit is returned to `wallet_balance`.
3. **100% Damage Settlement Rule**:
   - If a partner cafe marks a game as damaged or unplayable, the user is charged **100% of the game's retail price** directly from their wallet. The deposit hold is released/adjusted accordingly.
4. **Partner Cafe Revenue Share**:
   - Crowdsourced items generate a 20% revenue share payout credited directly to the partner cafe's ledger balance upon successful rental completion.
5. **Logistics Constraint**:
   - Physical board games MUST be returned to the exact partner cafe location where they were picked up.

## Technology Stack Constraints
- **Backend**: Python 3.12, Django 5.x, Django REST Framework (DRF), Django REST Framework SimpleJWT.
- **Database**: SQLite (local development).
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide React icons, React Router DOM v6, Axios.
- **Authentication**: JWT authentication stored in state/localStorage (No OTP in Phase 1).

## Agent Workflows
- **Code Generation**: Always write atomic, testable functions with explicit type hints in Python and JSDoc/PropTypes in React.
- **Database Migrations**: Always create explicit Django migration files when modifying models.
- **State Management**: Use `AuthContext` for JWT state and active user role (`renter`, `cafe_partner`, `admin`).
