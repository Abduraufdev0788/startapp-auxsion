# AGENTS.md — AUCTIONHUB
## AI Coding Agent Instructions & Complete Project Specification

**Project:** AuctionHub  
**Project Type:** Online Auction Marketplace  
**Target Market:** Uzbekistan  
**Architecture:** Modular Monolith  
**Backend:** Python + FastAPI  
**Frontend:** React + TypeScript  
**Database:** PostgreSQL  
**Real-time:** WebSocket  
**Infrastructure:** Docker + Redis  
**Document Version:** 1.0

---

# 1. PROJECT OVERVIEW

You are a senior software architect, senior Python backend developer, senior React frontend developer, database architect, UI/UX designer, DevOps engineer, and security engineer.

Your task is to design and develop a production-oriented online auction marketplace called AuctionHub.

AuctionHub is a platform where users can create auctions, participate in auctions by paying a refundable participation deposit, submit competing price offers, win auctions, and complete purchases.

The platform must be designed with security, financial correctness, scalability, maintainability, and excellent user experience as primary priorities.

Do not build a simple CRUD application.

Build a complete auction marketplace with real business logic.

## 1.1. Main Business Concept

The platform connects sellers and buyers.

A seller creates an auction by providing:

- Product name.
- Product description.
- Product images.
- Product category.
- Minimum selling price.
- Starting bid price.
- Minimum bid increment.
- Participation deposit amount.
- Auction start date.
- Auction end date.
- Delivery information.
- Additional auction rules.

Buyers can participate after successfully paying the required deposit.

Participants compete by submitting higher price offers.

When the auction ends, the system determines the highest eligible bidder.

The winner must complete the remaining payment within the configured payment deadline.

Participants who did not win receive their deposits back.

If the winner fails to complete the purchase within the allowed period, the winner's deposit may be forfeited according to the accepted auction terms and applicable law.

The platform must never silently deduct or transfer user funds.

All financial operations must be recorded, traceable, and auditable.

---

# 2. CORE BUSINESS RULES

These rules are mandatory.

## 2.1. Auction Creation

Only authenticated and eligible users can create auctions.

Every auction must have:

- Seller ID.
- Product information.
- Minimum price.
- Starting price.
- Deposit amount.
- Minimum bid increment.
- Start timestamp.
- End timestamp.
- Auction status.

Validation rules:

1. Starting price must be greater than zero.
2. Minimum price must be greater than zero.
3. Starting price must not exceed the minimum selling price.
4. Deposit must be greater than zero.
5. Auction end time must be later than start time.
6. Auction duration must respect platform limits.
7. Seller cannot participate in their own auction.
8. Product information must pass moderation.
9. The seller must accept the platform's auction agreement.

The seller must not be able to modify critical auction conditions after the auction becomes active.

## 2.2. Participation Deposit

Users must pay a participation deposit before submitting bids.

Example:

- Product minimum price: 5,000,000 UZS.
- Participation deposit: 500,000 UZS.
- Auction duration: 7 days.

A user who has not completed deposit payment cannot participate.

The deposit must be associated with:

- User ID.
- Auction ID.
- Payment ID.
- Amount.
- Currency.
- Payment status.
- Refund status.
- Provider transaction reference.

Important:

A payment request does not mean the deposit has been successfully received.

Participation becomes active only after a verified payment confirmation from the payment provider.

Never trust frontend payment status.

## 2.3. Deposit Lifecycle

Supported deposit statuses:

- PENDING
- PAID
- LOCKED
- REFUND_PENDING
- REFUNDED
- APPLIED_TO_PURCHASE
- FORFEITED
- FAILED

Expected lifecycle:

PENDING → PAID → LOCKED

For non-winning participants:

LOCKED → REFUND_PENDING → REFUNDED

For the auction winner:

LOCKED → APPLIED_TO_PURCHASE

If the winner does not complete payment:

LOCKED → FORFEITED

The exact financial settlement must follow the legal and contractual arrangement with the licensed financial partner.

Never mark a deposit as REFUNDED before the payment provider confirms the refund.

## 2.4. Auction Bidding

Only eligible participants can submit bids.

Rules:

1. User must be authenticated.
2. User must have a confirmed deposit.
3. Auction must be ACTIVE.
4. User must not be the seller.
5. Bid must satisfy the minimum bid increment.
6. Bid must be greater than the current highest bid.
7. Bid must be submitted before the auction deadline.
8. Bid amount must be validated on the backend.
9. All accepted bids must be immutable.
10. Rejected bids must not change auction state.

Example:

Current highest bid: 6,000,000 UZS.

Minimum increment: 100,000 UZS.

Next valid bid: 6,100,000 UZS or higher.

## 2.5. Concurrent Bidding

This is a critical requirement.

Multiple users may submit bids simultaneously.

Prevent race conditions using PostgreSQL transactions and row-level locking.

Use:

- SELECT FOR UPDATE.
- Database transactions.
- Appropriate indexes.
- Atomic auction state updates.
- Server-side validation.

Never calculate the winning bid using frontend data.

The database must remain the source of truth.

If two users submit bids simultaneously, only valid sequential bids must be accepted.

## 2.6. Auction Completion

When the auction reaches its end timestamp:

1. Auction must be locked for finalization.
2. No new bids may be accepted.
3. Highest valid bidder must be identified.
4. Minimum selling price must be checked.
5. Auction result must be persisted.
6. Winner must receive a notification.
7. Non-winning participants must enter the refund process.
8. Winner must receive a payment deadline.

Auction statuses:

- DRAFT
- PENDING_MODERATION
- SCHEDULED
- ACTIVE
- FINALIZING
- COMPLETED
- NO_WINNER
- CANCELLED
- DISPUTED

If no valid bid reaches the seller's minimum price:

- Auction becomes NO_WINNER.
- No winner is assigned.
- Eligible deposits are refunded.

Never determine auction results using client-side countdown timers.

The backend clock is authoritative.

## 2.7. Winner Payment

After winning an auction, the user receives a configured payment deadline.

Example:

Final winning bid: 7,000,000 UZS.

Deposit: 500,000 UZS.

Remaining payment: 6,500,000 UZS.

The deposit is credited toward the final purchase price only if the legal and financial settlement model supports it.

The winner must pay the remaining balance.

If payment is not completed:

1. Payment deadline is checked.
2. Auction payment status changes to EXPIRED.
3. Deposit forfeiture rules are evaluated.
4. The platform records the reason.
5. Seller is notified.
6. The platform follows the predefined next-winner or relisting policy.

The platform must support configurable policies:

- Offer the product to the second-highest eligible bidder.
- Restart the auction.
- Allow the seller to relist.

Do not automatically sell to the second bidder without checking the auction terms and obtaining the required confirmation.

## 2.8. Refund Management

All losing participants must receive refunds.

Refund processing must be asynchronous.

Requirements:

- Refund amount must match the original deposit.
- Refund must go to the original payment method or an approved refund destination.
- Refund requests must be idempotent.
- Duplicate refunds must be impossible.
- Refund attempts must be logged.
- Failed refunds must be retried safely.
- Users must see refund status.

Refund statuses:

- REQUESTED
- PROCESSING
- COMPLETED
- FAILED
- CANCELLED

Never assume that a refund succeeds immediately.

If a provider does not support refunds to the original card, use an approved alternative process.

---

# 3. ESCROW AND PAYMENT ARCHITECTURE

Financial correctness is a top priority.

## 3.1. Payment Integration

Integrate with an authorized bank or licensed payment organization.

Evaluate payment providers based on:

- Merchant API availability.
- Payment confirmation webhooks.
- Refund API support.
- Partial refunds.
- Transaction status verification.
- Settlement and payout support.
- Escrow or special account support.
- Transaction reconciliation.
- Legal compatibility with the platform's business model.

Do not assume that an ordinary payment gateway provides escrow functionality.

Do not implement a fake escrow system by simply storing payment amounts in the application's database.

Do not collect or store card numbers, CVV codes, or payment passwords.

Use provider-hosted payment pages or secure tokenized payment flows.

The platform must not independently hold customer funds unless legally authorized.

## 3.2. Financial Operations

Create a dedicated payment module.

Responsibilities:

- Create payment requests.
- Verify provider callbacks.
- Process deposit confirmations.
- Process refunds.
- Process winner payments.
- Track seller settlements.
- Handle failed payments.
- Reconcile provider transactions.
- Record financial audit events.

Every payment must have a unique internal ID and provider reference.

## 3.3. Webhook Security

Payment webhooks must:

- Verify provider signatures.
- Validate transaction identifiers.
- Validate amount and currency.
- Verify transaction ownership.
- Check transaction status with the provider when necessary.
- Reject duplicate events.
- Be idempotent.
- Be logged.

Never trust an arbitrary success message sent by the frontend.

## 3.4. Double-Entry Financial Ledger

Implement an immutable financial ledger.

Every financial movement must have corresponding debit and credit entries.

Never directly modify historical financial records.

Corrections must be represented by compensating transactions.

Maintain:

- Transaction ID.
- Reference ID.
- Account ID.
- Debit amount.
- Credit amount.
- Currency.
- Transaction type.
- Created timestamp.

Use integer minor units for monetary calculations.

For UZS, define the currency precision consistently.

Never use floating-point numbers for financial calculations.

---

# 4. USER ROLES AND PERMISSIONS

Implement Role-Based Access Control.

Roles:

## Guest

- View public auctions.
- Search products.
- View auction details.
- Register.
- Login.

## Registered User

- Manage profile.
- Create auctions.
- Participate in auctions.
- Submit bids.
- View deposit history.
- View transaction history.
- Receive refunds.
- View notifications.
- Submit complaints.

## Seller

- Manage created auctions.
- View participants.
- View auction results.
- Manage delivery.
- Respond to disputes.
- View settlements.

## Admin

- Manage users.
- Moderate products.
- Manage auction reports.
- Review disputes.
- Monitor transactions.
- Suspend suspicious accounts.
- View platform analytics.

## Super Admin

- Manage administrators.
- Manage roles and permissions.
- Configure platform settings.
- Access security audit logs.

Users may act as both buyers and sellers.

Never trust a role provided by the frontend.

All permissions must be checked on the backend.

---

# 5. FRONTEND REQUIREMENTS

Build a modern, premium-quality marketplace interface.

The design must feel like a professional international marketplace.

Avoid generic dashboard templates.

## 5.1. Design Direction

Design principles:

- Premium marketplace appearance.
- Modern typography.
- Consistent spacing.
- Clear visual hierarchy.
- Responsive layout.
- Smooth but restrained animations.
- Accessible contrast.
- Fast loading.
- Mobile-first compatibility.

Use a unified design system.

Create reusable:

- Buttons.
- Inputs.
- Dropdowns.
- Modals.
- Cards.
- Badges.
- Toast notifications.
- Loading skeletons.
- Pagination.
- Empty states.
- Error states.

Support light and dark themes.

## 5.2. Public Pages

Create:

1. Home page.
2. Auction marketplace.
3. Auction details.
4. Categories.
5. Search results.
6. About us.
7. How it works.
8. Terms and conditions.
9. Privacy policy.
10. Contact page.
11. Login.
12. Registration.
13. Password recovery.

## 5.3. Home Page

Home page must contain:

- Hero section.
- Search bar.
- Featured auctions.
- Ending soon auctions.
- Recently added auctions.
- Popular categories.
- How AuctionHub works.
- Trust and security section.
- Statistics.
- Footer.

## 5.4. Auction Card

Every auction card must display:

- Product image.
- Product name.
- Current highest bid.
- Minimum price or reserve status where appropriate.
- Number of participants.
- Countdown timer.
- Auction status.
- Category.
- Favorite button.

## 5.5. Auction Details

Display:

- Product image gallery.
- Product description.
- Seller information.
- Seller rating.
- Current highest bid.
- Minimum required next bid.
- Auction countdown.
- Deposit amount.
- Participation status.
- Bid history.
- Number of participants.
- Auction conditions.
- Delivery information.
- Bid submission interface.

The bid button must be disabled when the user is not eligible.

Display a clear explanation when participation is unavailable.

## 5.6. User Dashboard

Create a complete personal dashboard.

Sections:

- Overview.
- My profile.
- My auctions.
- Participating auctions.
- My winning auctions.
- My losing auctions.
- Deposits.
- Refunds.
- Payments.
- Transaction history.
- Notifications.
- Favorites.
- Security settings.

## 5.7. Seller Dashboard

Include:

- Create auction.
- Manage products.
- Active auctions.
- Scheduled auctions.
- Completed auctions.
- Winning bidders.
- Payment status.
- Delivery status.
- Sales statistics.

## 5.8. Admin Dashboard

Include:

- User statistics.
- Auction statistics.
- Revenue analytics.
- Active auctions.
- Pending moderation.
- Failed payments.
- Pending refunds.
- Disputes.
- Suspicious activities.
- Audit logs.

Admin financial operations must require appropriate permissions and audit logging.

---

# 6. BACKEND ARCHITECTURE

Use FastAPI with a modular monolith architecture.

Do not build an unnecessarily complicated microservice architecture for the MVP.

Organize the backend by business domain.

Each module must separate:

- Models.
- Schemas.
- Repository.
- Service.
- Router.
- Dependencies.
- Tests.

Use SQLAlchemy 2.0 asynchronous database access where appropriate.

Use Pydantic for validation.

Use Alembic for database migrations.

## 6.1. Backend Modules

### Authentication Module

Responsibilities:

- Registration.
- Login.
- Logout.
- Refresh tokens.
- Email or phone verification.
- Password reset.
- Session management.
- Account security.

### Users Module

Responsibilities:

- User profiles.
- User settings.
- Verification status.
- Account suspension.
- User statistics.

### Products Module

Responsibilities:

- Product creation.
- Product editing.
- Image upload.
- Category assignment.
- Product moderation.

### Auctions Module

Responsibilities:

- Auction creation.
- Auction publishing.
- Auction scheduling.
- Auction activation.
- Auction cancellation.
- Auction finalization.
- Winner determination.

### Bidding Module

Responsibilities:

- Deposit eligibility verification.
- Bid validation.
- Bid submission.
- Bid history.
- Current highest bid.
- Concurrent bidding protection.

### Payments Module

Responsibilities:

- Payment initiation.
- Provider integration.
- Payment verification.
- Webhook handling.
- Payment reconciliation.

### Deposits Module

Responsibilities:

- Deposit creation.
- Deposit confirmation.
- Deposit locking.
- Deposit allocation.
- Deposit forfeiture.
- Deposit refunds.

### Escrow Module

Responsibilities:

- Financial settlement coordination.
- Escrow transaction tracking.
- Settlement state transitions.
- Seller payout coordination.
- Dispute-related holds.

### Refunds Module

Responsibilities:

- Refund requests.
- Refund processing.
- Refund retries.
- Refund status tracking.

### Notifications Module

Responsibilities:

- In-app notifications.
- Email notifications.
- SMS integration.
- Auction reminders.
- Winner notifications.
- Refund notifications.

### Disputes Module

Responsibilities:

- Dispute creation.
- Evidence uploads.
- Admin review.
- Dispute resolution.
- Settlement decisions.

### Admin Module

Responsibilities:

- User management.
- Auction moderation.
- Financial monitoring.
- Reports.
- Audit logs.

---

# 7. DATABASE DESIGN

Use PostgreSQL.

Create normalized database models.

Required tables:

## Identity

- users
- user_profiles
- user_roles
- roles
- permissions
- user_sessions
- user_verifications

## Marketplace

- categories
- products
- product_images
- favorites
- seller_ratings

## Auctions

- auctions
- auction_participants
- bids
- auction_results
- auction_events

## Financial

- payment_transactions
- deposits
- refunds
- escrow_transactions
- financial_accounts
- ledger_entries
- seller_settlements
- payment_webhook_events

## Delivery

- deliveries
- delivery_events
- delivery_addresses

## Communication

- notifications
- notification_preferences
- conversations
- messages

## Disputes

- disputes
- dispute_evidence
- dispute_actions

## Administration

- admin_audit_logs
- moderation_records
- system_settings

## 7.1. Database Requirements

- Use UUID primary keys where appropriate.
- Add foreign keys.
- Add unique constraints.
- Add check constraints.
- Add indexes for frequently queried fields.
- Use timezone-aware timestamps.
- Use soft deletion only where appropriate.
- Preserve financial history.
- Prevent duplicate participation.
- Prevent duplicate payment processing.

Important unique constraints:

- One participant record per user per auction.
- Unique provider transaction reference.
- Unique webhook event identifier.
- Unique refund request idempotency key.
- Unique auction result per auction.

Financial tables must not be freely editable or deletable.

---

# 8. PROJECT FOLDER STRUCTURE

Build the following monorepo structure.

auctionhub/
│
├── AGENTS.md
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── docs/
│   ├── architecture.md
│   ├── business-rules.md
│   ├── database-design.md
│   ├── api-documentation.md
│   ├── payment-flow.md
│   ├── auction-lifecycle.md
│   ├── security.md
│   ├── deployment.md
│   └── decisions/
│       └── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic.ini
│   │
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── exceptions.py
│   │   │   ├── logging.py
│   │   │   ├── permissions.py
│   │   │   └── constants.py
│   │   │
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── migrations.py
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   ├── router.py
│   │   │   │   └── dependencies.py
│   │   │   │
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── auctions/
│   │   │   ├── bidding/
│   │   │   ├── participants/
│   │   │   ├── deposits/
│   │   │   ├── payments/
│   │   │   ├── escrow/
│   │   │   ├── refunds/
│   │   │   ├── settlements/
│   │   │   ├── deliveries/
│   │   │   ├── notifications/
│   │   │   ├── favorites/
│   │   │   ├── disputes/
│   │   │   └── admin/
│   │   │
│   │   ├── integrations/
│   │   │   ├── payments/
│   │   │   │   ├── base.py
│   │   │   │   ├── factory.py
│   │   │   │   ├── provider_adapter.py
│   │   │   │   └── webhooks.py
│   │   │   ├── storage/
│   │   │   ├── sms/
│   │   │   └── email/
│   │   │
│   │   ├── workers/
│   │   │   ├── celery_app.py
│   │   │   ├── auction_tasks.py
│   │   │   ├── refund_tasks.py
│   │   │   ├── payment_tasks.py
│   │   │   └── notification_tasks.py
│   │   │
│   │   ├── websocket/
│   │   │   ├── manager.py
│   │   │   ├── events.py
│   │   │   └── router.py
│   │   │
│   │   └── utils/
│   │       ├── pagination.py
│   │       ├── money.py
│   │       ├── idempotency.py
│   │       └── validators.py
│   │
│   └── tests/
│       ├── conftest.py
│       ├── unit/
│       ├── integration/
│       ├── api/
│       ├── payments/
│       ├── auctions/
│       ├── bidding/
│       └── security/
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   │
│   ├── public/
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       │
│       ├── app/
│       │   ├── router.tsx
│       │   ├── providers.tsx
│       │   └── store.ts
│       │
│       ├── assets/
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   ├── forms/
│       │   └── common/
│       │
│       ├── features/
│       │   ├── auth/
│       │   ├── auctions/
│       │   ├── bidding/
│       │   ├── products/
│       │   ├── deposits/
│       │   ├── payments/
│       │   ├── refunds/
│       │   ├── dashboard/
│       │   ├── favorites/
│       │   ├── notifications/
│       │   └── admin/
│       │
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── AuctionsPage.tsx
│       │   ├── AuctionDetailsPage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx
│       │   └── NotFoundPage.tsx
│       │
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── constants/
│       └── styles/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
│
└── .github/
    └── workflows/
        ├── backend-ci.yml
        └── frontend-ci.yml

Each module must contain its own internal files where appropriate.

Do not create empty files just to satisfy the structure.

Create meaningful code and documentation.

---

# 9. API DESIGN

Use REST API with versioning.

Base URL:

/api/v1/

Required endpoint groups:

## Authentication

POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/verify
POST /auth/forgot-password
POST /auth/reset-password

## Users

GET /users/me
PATCH /users/me
GET /users/{user_id}
GET /users/me/transactions

## Products

POST /products
GET /products
GET /products/{product_id}
PATCH /products/{product_id}
DELETE /products/{product_id}

## Auctions

POST /auctions
GET /auctions
GET /auctions/{auction_id}
PATCH /auctions/{auction_id}
POST /auctions/{auction_id}/publish
POST /auctions/{auction_id}/cancel
GET /auctions/{auction_id}/participants
GET /auctions/{auction_id}/history
GET /auctions/{auction_id}/result

## Participation

POST /auctions/{auction_id}/participate
GET /auctions/{auction_id}/participation

## Bidding

POST /auctions/{auction_id}/bids
GET /auctions/{auction_id}/bids
GET /auctions/{auction_id}/my-bids

## Deposits

GET /deposits
GET /deposits/{deposit_id}

## Payments

POST /payments/initiate
GET /payments/{payment_id}
POST /payments/webhooks/{provider}

## Refunds

GET /refunds
GET /refunds/{refund_id}

## Notifications

GET /notifications
PATCH /notifications/{notification_id}/read

## Admin

GET /admin/dashboard
GET /admin/users
GET /admin/auctions
GET /admin/payments
GET /admin/refunds
GET /admin/disputes

Use consistent response schemas.

Implement pagination, filtering, sorting, and validation.

Document endpoints using OpenAPI.

Never expose sensitive financial information through public endpoints.

---

# 10. REAL-TIME AUCTION SYSTEM

Use WebSocket for live bidding updates.

Events:

- auction.started
- auction.bid.created
- auction.bid.outbid
- auction.time.updated
- auction.ending.soon
- auction.completed
- auction.winner.declared
- auction.cancelled

WebSocket must only distribute verified server-side events.

The frontend countdown is informational.

Backend timestamps determine the actual auction state.

Use Redis pub/sub or an appropriate event distribution mechanism when scaling multiple application instances.

Reconnection and synchronization must be supported.

After reconnecting, the client must retrieve the latest auction state from the REST API.

---

# 11. BACKGROUND TASKS

Use Celery with Redis.

Required tasks:

1. Activate scheduled auctions.
2. Finalize expired auctions.
3. Determine winners.
4. Start losing participant refunds.
5. Check winner payment deadlines.
6. Process refund retries.
7. Process payment reconciliation.
8. Send auction reminders.
9. Notify sellers.
10. Notify winners.
11. Clean up expired temporary files.

Background tasks must be safe to execute more than once.

Use database locks and idempotency keys.

Do not rely only on in-memory timers.

---

# 12. SECURITY REQUIREMENTS

Security is mandatory.

Implement:

- Password hashing using Argon2id or a secure supported alternative.
- Short-lived access tokens.
- Refresh token rotation.
- Rate limiting.
- CORS restrictions.
- Input validation.
- SQL injection prevention.
- XSS protection.
- CSRF protection where applicable.
- Secure cookies where applicable.
- File upload validation.
- MIME type verification.
- File size limits.
- Authorization checks.
- Audit logging.
- Webhook signature verification.
- Sensitive data redaction.

Financial and administrative endpoints require additional authorization.

Prevent:

- Fake bids.
- Duplicate payments.
- Duplicate refunds.
- Fake payment callbacks.
- Unauthorized deposits.
- Self-bidding.
- Bid manipulation.
- Race conditions.
- Unauthorized auction changes.
- Replay attacks.
- Account takeover.

Never put secrets in source code.

Use environment variables.

Provide .env.example with placeholders only.

---

# 13. TESTING REQUIREMENTS

Testing is not optional.

Backend:

- Unit tests.
- Integration tests.
- API tests.
- Database tests.
- Payment integration tests.
- Webhook tests.
- Auction lifecycle tests.
- Concurrent bidding tests.
- Refund tests.
- Security tests.

Frontend:

- Component tests.
- Form validation tests.
- Authentication tests.
- Auction participation tests.
- Bid submission tests.
- Payment state tests.
- Responsive layout tests.

Critical test scenarios:

1. User cannot bid without a confirmed deposit.
2. User cannot bid on their own auction.
3. User cannot submit a bid below the required amount.
4. Expired auctions reject new bids.
5. Concurrent bids do not corrupt auction results.
6. Only one winner is assigned.
7. Losing deposits are refunded exactly once.
8. Winner deposit is not refunded twice.
9. Duplicate payment callbacks do not create duplicate transactions.
10. Failed refunds remain visible and retryable.
11. Unverified payment callbacks are rejected.
12. Auction below reserve price has no winner.

Use a sandbox payment provider for integration tests.

Never test real financial transfers in automated test suites.

---

# 14. DEVELOPMENT STANDARDS

Follow these standards strictly.

## Python

- Follow PEP 8.
- Use type hints.
- Use clear function and class names.
- Use async functions where appropriate.
- Use dependency injection.
- Keep business logic out of routers.
- Use service and repository layers.
- Avoid circular imports.
- Use structured logging.
- Handle exceptions explicitly.

## TypeScript

- Enable strict mode.
- Avoid any.
- Use reusable components.
- Use typed API responses.
- Separate business logic from UI.
- Use a consistent state management strategy.
- Handle loading, error, and empty states.
- Keep components maintainable.

## Database

- All schema changes require Alembic migrations.
- Never modify production database schema manually.
- Use explicit constraints.
- Avoid unnecessary queries.
- Use transactions for financial operations.

## Git

Use clear commit messages:

- feat:
- fix:
- refactor:
- test:
- docs:
- chore:

Do not commit secrets, environment files, or temporary build artifacts.

---

# 15. UI/UX QUALITY REQUIREMENTS

The user interface must be premium and professional.

The platform must not look like a basic student project.

Prioritize:

- Excellent visual hierarchy.
- Professional typography.
- Consistent design tokens.
- Elegant product cards.
- Smooth transitions.
- Responsive navigation.
- Clear financial information.
- Accessible controls.
- Useful loading states.
- Friendly empty states.
- Helpful error messages.

All user-facing text should be in Uzbek initially.

Use Uzbek Latin alphabet.

Prepare the architecture for future multilingual support.

Display monetary values in UZS.

Use consistent date and timezone formatting.

Never show misleading countdowns or fake financial statuses.

---

# 16. ENVIRONMENT CONFIGURATION

Create .env.example.

Include placeholders for:

DATABASE_URL=
REDIS_URL=
JWT_SECRET_KEY=
JWT_REFRESH_SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=
REFRESH_TOKEN_EXPIRE_DAYS=
PAYMENT_PROVIDER=
PAYMENT_MERCHANT_ID=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
FRONTEND_URL=
BACKEND_URL=

Never include real credentials.

Validate required settings on application startup.

Fail safely when required production configuration is missing.

---

# 17. DOCKER REQUIREMENTS

Create Docker Compose configuration for:

- Frontend.
- Backend API.
- PostgreSQL.
- Redis.
- Celery worker.
- Celery beat.
- Nginx (when needed).

Requirements:

- Health checks.
- Persistent database volume.
- Environment configuration.
- Restart policies.
- Separate development and production configurations.
- Secure production defaults.

Do not expose PostgreSQL or Redis publicly in production.

---

# 18. DEVELOPMENT ROADMAP

Build the project in carefully controlled phases.

Do not attempt to generate the entire system in one uncontrolled operation.

## Phase 1 — Project Foundation

- Initialize monorepo.
- Configure backend.
- Configure frontend.
- Configure PostgreSQL.
- Configure Redis.
- Configure Docker.
- Configure environment settings.
- Create initial documentation.

Deliverable: Application starts successfully.

## Phase 2 — Authentication and Users

- Registration.
- Login.
- JWT.
- Refresh tokens.
- User profiles.
- Role permissions.
- Authentication UI.

Deliverable: Secure user authentication.

## Phase 3 — Marketplace

- Product categories.
- Product creation.
- Image uploads.
- Auction creation.
- Auction moderation.
- Marketplace listing.
- Auction details page.

Deliverable: Users can create and browse auctions.

## Phase 4 — Auction Engine

- Auction participation.
- Deposit eligibility.
- Bid submission.
- Bid validation.
- Concurrent bidding.
- WebSocket updates.
- Countdown synchronization.
- Auction finalization.

Deliverable: Complete auction engine.

## Phase 5 — Financial System

- Payment provider adapter.
- Deposit payment.
- Payment verification.
- Escrow integration.
- Refund processing.
- Winner payments.
- Financial ledger.
- Seller settlement.

Deliverable: Verified financial workflow.

Do not enable real money transactions until the legal model and provider integration are approved.

## Phase 6 — Notifications and Delivery

- Notifications.
- Email.
- SMS.
- Delivery management.
- Winner reminders.
- Refund updates.

Deliverable: Complete post-auction workflow.

## Phase 7 — Administration

- Admin dashboard.
- User management.
- Auction moderation.
- Payment monitoring.
- Refund monitoring.
- Dispute management.
- Audit logs.

Deliverable: Complete administration system.

## Phase 8 — Quality Assurance

- Full testing.
- Security review.
- Performance testing.
- Database optimization.
- Error handling.
- Responsive UI verification.

Deliverable: Production-ready release candidate.

## Phase 9 — Deployment

- Production Docker configuration.
- HTTPS.
- Domain configuration.
- Monitoring.
- Backups.
- CI/CD.
- Deployment documentation.

Deliverable: Production deployment.

---

# 19. AI AGENT WORKING RULES

You must follow these rules throughout development.

1. Read this AGENTS.md before writing code.
2. Understand the existing repository before modifying it.
3. Inspect existing files and dependencies.
4. Do not overwrite working code without understanding its purpose.
5. Do not create unnecessary files.
6. Follow the defined folder structure.
7. Implement one development phase at a time.
8. Never leave critical functionality as TODO.
9. Never use fake payment success responses in production code.
10. Never hardcode credentials.
11. Never trust frontend financial values.
12. Never use floating-point arithmetic for money.
13. Never allow duplicate financial operations.
14. Write tests for important business logic.
15. Run tests after every significant change.
16. Fix errors before moving to the next phase.
17. Update documentation when architecture changes.
18. Use database migrations for schema changes.
19. Report any missing external credentials or integrations.
20. Never claim a feature is complete without verification.

Before implementing a feature:

- Explain its purpose.
- Identify affected modules.
- Identify database changes.
- Identify API changes.
- Identify security implications.
- Define acceptance criteria.

After implementing a feature:

- Run relevant tests.
- Check application startup.
- Verify database migrations.
- Verify API behavior.
- Report completed work.
- Report remaining issues.

If an external service requires credentials or legal approval, implement a safe integration interface and sandbox mode.

Do not invent external API endpoints.

---

# 20. DEFINITION OF DONE

A feature is complete only when:

- Business requirements are implemented.
- Backend validation works.
- Database constraints exist.
- API documentation is updated.
- Frontend integration works.
- Error states are handled.
- Security requirements are satisfied.
- Relevant tests pass.
- Documentation is updated.

The complete application is ready for a production release candidate only when:

- Users can register and log in.
- Sellers can create auctions.
- Buyers can pay deposits.
- Eligible users can bid.
- Concurrent bidding works safely.
- Auctions finish correctly.
- Winners are determined correctly.
- Losing deposits are refunded.
- Winner payments are processed.
- Escrow settlement follows the approved financial model.
- Delivery and disputes are supported.
- Admins can manage the platform.
- Financial operations are auditable.
- Security and integration tests pass.

---

# 21. FINAL PRODUCT VISION

AuctionHub must become a trustworthy auction marketplace where people can buy and sell products through transparent competitive bidding.

The platform must prioritize:

1. Financial security.
2. Fair auctions.
3. Transparent bidding.
4. Reliable refunds.
5. Seller and buyer protection.
6. Excellent user experience.
7. Scalability.
8. Maintainable software architecture.

Build the system as a serious commercial product, not as a demo or tutorial project.

**Your ultimate objective is to deliver a secure, scalable, maintainable, and production-oriented Auction Marketplace.**