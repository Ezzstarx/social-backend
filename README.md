# Ezzstar Platform Backend Extensions

This repository contains the backend extensions added to support Wallet transactions, gamification XP levels, Gist circle boards, content views tracking, tipping splits, promotional content boosts, and tournament bracket trees.

---

## 📁 File Structure Overview

```
social-backend/
├── config/
│   └── passport.js                  # Extended with automatic Wallet/XPProfile creation on signup
├── middleware/
│   ├── requireAuth.js               # JWT auth Bearer token extractor
│   ├── requireOnboarding.js         # Limits access if user profile onboarding is incomplete
│   └── requireAdmin.js              # Limits access to users with 'admin' role
├── models/
│   ├── Wallet.js                    # User tokens account balances Mongoose schema
│   ├── WalletTransaction.js         # Audit ledger logs Mongoose schema
│   ├── XPProfile.js                 # Experience and level profiles Mongoose schema
│   ├── XPTransaction.js             # Detailed XP increments logging Mongoose schema
│   ├── LevelConfig.js               # Levels requirements and rewards configuration Mongoose schema
│   ├── Gist.js                      # Public circles Mongoose schema
│   ├── GistTopic.js                 # Topic threads Mongoose schema
│   ├── Comment.js                   # Comments Mongoose schema
│   ├── Share.js                     # Share metrics Mongoose schema
│   ├── Reaction.js                  # Post quick emotive reactions Mongoose schema
│   ├── View.js                      # View session tracking Mongoose schema
│   ├── Tip.js                       # Tip splits allocation Mongoose schema
│   ├── BoostCampaign.js             # Sponsored campaigns Mongoose schema
│   ├── TournamentBracket.js         # Tournament trees structure Mongoose schema
│   ├── TournamentMatch.js           # Tournament matches Mongoose schema
│   ├── Notification.js              # Inbox alerts Mongoose schema
│   └── AbuseFlag.js                 # Anti-abuse locks Mongoose schema
├── routes/
│   ├── onboarding.routes.js         # Setup role and complete onboarding profile
│   ├── wallet.routes.js             # Fetch wallet balances and transaction history
│   ├── xp.routes.js                 # Fetch level progress and claim daily check-in reward
│   ├── gists.routes.js              # Mongoose-based Gist circle posts and topics
│   ├── engagement.routes.js         # Logging view, comment, share, and reaction interactions
│   ├── tips.routes.js               # Send creator tip splits
│   ├── boosts.routes.js             # Purchase promotion boosts and increment impressions
│   ├── tournaments.routes.js        # Bracket trees generation and verified progression
│   ├── notifications.routes.js      # alerts inbox management
│   ├── admin.routes.js              # Statistics, account suspension, flag review center
│   └── feed.routes.js               # Home feed aggregation
├── scripts/
│   ├── seedLevelConfig.js           # Linear and exponential level scaling seed script
│   └── testIntegration.js           # Diagnostic automated database and engines testing script
├── services/
│   ├── rewardEngine.js              # Balance adjustments (credits/debits)
│   ├── xpEngine.js                  # Level config thresholds monitoring
│   ├── viewTracker.js               # View durations and IP limits checks
│   ├── abuseDetector.js             # Comment length and IP farming locks
│   └── socket.js                    # Socket.io notification broker
└── server.js                        # Extended with DB connections and Socket.io setups
```

---

## ⚙️ Core Engines & Algorithms

### 1. Reward & Balance Ledger (`rewardEngine.js`)
*   **Credits & Debits**: Updates Wallet balance sheets securely. Supports specific `targetField` overrides (`utilityBalance` vs. `earnedBalance`).
*   **Tip Splits**: Applies a standard `95% creator / 5% platform` split. For Gist circle topics, if the topic creator differs from the Gist circle host, it applies an `80% topic creator / 15% Gist host / 5% platform` split.
*   **Event Registrations**: Deducts entry fees, allocating `80% to event prize pool / 15% to host / 5% to platform`.

### 2. Gamification Tiers & Progression (`xpEngine.js`)
*   Monitors XP allocations (Daily Visit = 10 XP, Profile Complete = 500 XP, host Event = 250 XP, Publish Chapter = 75 XP).
*   Enforces a daily cap of **10 qualified views** for view XP allocation.
*   Calculates tier thresholds and triggers loops to reward players immediately upon crossing level boundaries.

### 3. View Session Qualification (`viewTracker.js`)
*   Requires a minimum view duration (30s for Manga, 20s for Stories/Gists/Events).
*   Validates session uniqueness (no self-views, 24-hour limits on viewer, maximum 3 views from the same IP/Device per 24 hours).
*   Applies fractional accumulation (e.g., boosted views count as `0.25` of a qualified view, only incrementing counts once sum reaches `1.0`).

### 4. Spam & Sybil Audits (`abuseDetector.js`)
*   Filters comments shorter than 5 characters or users posting more than 5 times per minute.
*   Flags high-risk activities, creating `AbuseFlags` in the database and automatically locking transaction payments (`LOCKED` status) for manual administrative approvals.

---

## 📡 WebSockets & Alerts Broker (`socket.js`)
A clean broker isolates the Express routing layer from direct Socket bindings, broadcasting instant `'notification'` updates to connected clients without circular import dependency risks.

---

## 🛠️ Verification Commands

1. **Seed Levels**:
   ```bash
   node scripts/seedLevelConfig.js
   ```
2. **Platform Diagnostics**:
   ```bash
   node scripts/testIntegration.js
   ```
