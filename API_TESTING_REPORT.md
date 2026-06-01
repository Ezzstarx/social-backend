# Social Backend - Complete API Testing Report

## Server Status
- **Port**: 5001
- **Environment**: Development (MongoDB local: mongodb://127.0.0.1:27017/ezzstar)
- **Status**: ✅ No syntax errors detected

---

## 📋 Complete API Endpoints Map

### 1️⃣ **Authentication Routes** (`/api/auth`)
| Method | Endpoint | Auth Required | Status | Issues |
|--------|----------|---------------|--------|--------|
| GET | `/google` | ❌ No | 🟡 Needs Testing | Requires Google OAuth setup |
| GET | `/google/callback` | ❌ No | 🟡 Needs Testing | Depends on Google OAuth |
| GET | `/google/failure` | ❌ No | ✅ Should Work | Simple JSON response |

**Issues Found**:
- ⚠️ No JWT verification endpoint (login with token validation)
- ⚠️ No logout endpoint
- ⚠️ Google OAuth credentials not visible in `.env` (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET missing)
- ⚠️ No refresh token mechanism

---

### 2️⃣ **Manga Routes** (`/api/manga`)
| Method | Endpoint | External API | Status | Notes |
|--------|----------|--------------|--------|-------|
| GET | `/search` | Internal DB | 🟡 Check DB | MongoDB required |
| GET | `/jikan/search?q=` | Jikan API | ✅ Should Work | 10s timeout |
| GET | `/jikan/top` | Jikan API | ✅ Should Work | Cached for 10min |
| GET | `/jikan/:id` | Jikan API | ✅ Should Work | Cached for 10min |
| GET | `/zyla?` | ZyleLabs API | ⚠️ Issues | API key not in .env |
| GET | `/zyla/:id` | ZyleLabs API | ⚠️ Issues | API key not in .env |
| GET | `/` | MangaDex | ✅ Should Work | Cached 6 hours |
| GET | `/top10` | MangaDex | ✅ Should Work | Cached 6 hours |
| GET | `/cover?mangaId=&fileName=` | MangaDex Proxy | 🟡 Check | Image proxy |
| GET | `/external/:id` | MangaDex | ✅ Should Work | With relationships |
| GET | `/external/:id/chapters` | MangaDex | ✅ Should Work | Paginated |
| GET | `/chapter/:id/pages` | MangaDex | ✅ Should Work | Paginated |
| POST | `/create` | Internal DB | 🟡 Check DB | Requires auth |
| GET | `/user/:userId` | Internal DB | 🟡 Check DB | User manga list |

**Issues Found**:
- ❌ **CRITICAL**: ZyleLabs API key missing from `.env`
- ⚠️ No validation on image proxy (potential security issue)
- ⚠️ `/search` endpoint behavior not clear (internal DB search)
- ⚠️ MangaDex API rate limiting not handled

---

### 3️⃣ **Stories Routes** (`/api/stories`)
| Method | Endpoint | External API | Status | Issues |
|--------|----------|--------------|--------|--------|
| GET | `/openlibrary/search?q=` | OpenLibrary | ✅ Should Work | Cached 10min |
| GET | `/openlibrary/work/:workId` | OpenLibrary | ✅ Should Work | Cached 10min |
| GET | `/zyla/novels?` | ZyleLabs | ❌ BROKEN | API key missing |
| GET | `/zyla/novels/:id` | ZyleLabs | ❌ BROKEN | API key missing |
| GET | `/` | Internal DB | 🟡 Check DB | Requires MongoDB |
| GET | `/:id` | Internal DB | 🟡 Check DB | Requires MongoDB |

**Issues Found**:
- ❌ **CRITICAL**: ZyleLabs API key missing
- ✅ OpenLibrary API doesn't require authentication (public)

---

### 4️⃣ **Gist Routes** (`/api/gist`) - ⚠️ ROUTING CONFLICT
| Method | Endpoint | Auth | Status | Issues |
|--------|----------|------|--------|--------|
| GET | `/` | ❌ | 🟡 Conflicts | See `/api/gists/` |
| GET | `/threads/4chan/boards` | ❌ | ✅ Should Work | 4chan API (public) |
| GET | `/threads/4chan/:board/catalog` | ❌ | ✅ Should Work | 4chan API |
| GET | `/threads/4chan/:board/:threadNo` | ❌ | ✅ Should Work | 4chan API |
| POST | `/:id/join` | ✅ Auth | 🟡 Check DB | Requires auth |
| POST | `/:id/star` | ✅ Auth | 🟡 Check DB | Requires auth |
| GET | `/creators` | ❌ | 🟡 Check DB | List creators |
| POST | `/creators/:id/subscribe` | ✅ Auth | 🟡 Check DB | Subscribe |

---

### 5️⃣ **Gists Routes** (`/api/gists`) - ⚠️ ROUTING CONFLICT WITH `/api/gist`
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| POST | `/` | ✅ Auth | 🟡 Check DB | Create gist, requires onboarding |
| GET | `/` | ❌ | 🟡 Check DB | List with pagination & search |

**CRITICAL ISSUE**:
- ❌ **ROUTING CONFLICT**: Both `/api/gist` and `/api/gists` are registered
- Both have `GET /` endpoint → Express will use the first registered route
- **Current priority** (from server.js):
  1. `/api/gist` (gist.routes) - registered AFTER `/api/gists` (gists.routes)
  2. `/api/gists` (gists.routes)

---

### 6️⃣ **Event Routes** (`/api/events`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| GET | `/my-events` | ✅ Auth | 🟡 Check DB | **MUST be before /:id** (correct!) |
| GET | `/` | ❌ | 🟡 Check DB | List events |
| GET | `/:id` | ❌ | 🟡 Check DB | Event details |
| POST | `/` | ✅ Auth | 🟡 Check DB | Create event |
| PUT | `/:id` | ✅ Auth | 🟡 Check DB | Update event |
| DELETE | `/:id` | ✅ Auth | 🟡 Check DB | Delete event |
| POST | `/:id/participate` | ✅ Auth | 🟡 Check DB | Join event |
| DELETE | `/:id/leave` | ✅ Auth | 🟡 Check DB | Leave event |
| POST | `/:id/winner` | ✅ Auth | 🟡 Check DB | Assign winner |

**Status**: ✅ Routes properly ordered

---

### 7️⃣ **Onboarding Routes** (`/api/onboarding`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| POST | `/role` | ✅ Auth | 🟡 Check DB | Set primary role (READER/CREATOR/EVENT_HOST/GAMER) |
| POST | `/profile` | ✅ Auth | 🟡 Check DB | Complete profile, creates wallet & XP profile |

**Notes**:
- Creates wallet and XP profile automatically
- Awards 500 XP for profile completion
- Validates username uniqueness

---

### 8️⃣ **Wallet Routes** (`/api/wallet`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| GET | `/me` | ✅ Auth Required | 🟡 Check DB | Get user wallet, auto-creates if missing |
| GET | `/transactions` | ✅ Auth Required | 🟡 Check DB | Paginated transaction history with filtering |

---

### 9️⃣ **XP Routes** (`/api/xp`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| GET | `/me` | ✅ Auth Required | 🟡 Check DB | Get XP profile with level configs |
| POST | `/daily-visit` | ✅ Auth Required | 🟡 Check DB | Daily visit reward (once per day, in-memory tracker) |

**Issues**:
- ⚠️ Daily visit tracker is in-memory → resets on server restart
- Should use Redis or database for persistence

---

### 🔟 **Engagement Routes** (`/api/views`, `/api/comments`, `/api/shares`, `/api/reactions`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| POST | `/record` (views) | ❌ Optional | 🟡 Check | View tracking with abuse detection |
| POST | `/comments` | ✅ Auth | 🟡 Check DB | Create comment, spam detection |
| GET | `/comments/:contentType/:contentId` | ❌ | 🟡 Check DB | Get comments |
| POST | `/shares` | ✅ Auth | 🟡 Check DB | Create share |
| POST | `/reactions` | ✅ Auth | 🟡 Check DB | Create/update/delete reaction (LIKE, LOVE, FIRE, WOW) |

**Issues**:
- ⚠️ Comment spam detection might have false positives
- ⚠️ View abuse detection checks: same viewer, same owner, same IP, device, content

---

### 1️⃣1️⃣ **Tips Routes** (`/api/tips`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| POST | `/send` | ✅ Auth Required | 🟡 Check DB | Send tip, awards XP to sender |

---

### 1️⃣2️⃣ **Boosts Routes** (`/api/boosts`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| POST | `/create` | ✅ Auth Required | 🟡 Check DB | Create boost (STARTER/GROWTH/VIRAL plans) |
| GET | `/my` | ✅ Auth Required | 🟡 Check DB | User's boost campaigns, paginated |
| GET | `/:id` | ✅ Auth Required | 🟡 Check DB | Campaign details with ownership check |
| POST | `/:id/impression` | ❌ | 🟡 Check DB | Record impression, auto-completes when target reached |

---

### 1️⃣3️⃣ **Tournaments Routes** (`/api/tournaments`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| POST | `/events/:id/bracket/generate` | ✅ Auth + Host | 🟡 Check DB | Generate tournament bracket (requires event host) |

---

### 1️⃣4️⃣ **Notifications Routes** (`/api/notifications`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| GET | `/` | ✅ Auth Required | 🟡 Check DB | Get notifications, paginated, with unread count |
| PATCH | `/read-all` | ✅ Auth Required | 🟡 Check DB | Mark all as read |
| PATCH | `/:id/read` | ✅ Auth Required | 🟡 Check DB | Mark one as read (with ownership check) |

---

### 1️⃣5️⃣ **Feed Routes** (`/api/feed`)
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| GET | `/home` | ✅ Auth + Onboarding | 🟡 Check DB | Trending gists, topics, events, boosted content |

---

### 1️⃣6️⃣ **Admin Routes** (`/api/admin`) - 🔐 Requires Auth + Admin Role
| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | `/stats` | 🟡 Check DB | Platform statistics (users, SKA, fees) |
| GET | `/users` | 🟡 Check DB | List users with wallets, paginated, filterable |
| PATCH | `/users/:id/suspend` | 🟡 Check DB | Suspend user (partial implementation shown) |

---

## 🔴 Critical Issues Found

### 1. **ROUTING CONFLICT** ⚠️ HIGHEST PRIORITY
   - `/api/gist` and `/api/gists` both have `GET /` endpoint
   - Express resolves to first match → unpredictable behavior
   - **Fix**: Merge routes or rename one endpoint

### 2. **Missing API Keys** ❌ BLOCKING
   - ZyleLabs API key not in `.env` → `/api/manga/zyla/*` & `/api/stories/zyla/*` will FAIL
   - Missing Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
   - No API credentials for external services

### 3. **Missing Environment Variables** ⚠️
   - MONGO_URI not in `.env` (defaults to localhost)
   - No API_USER_AGENT documented
   - JWT_SECRET is weak ("your_jwt_secret")

### 4. **Database Connectivity** 🟡
   - Requires MongoDB running on `mongodb://127.0.0.1:27017/ezzstar`
   - Not verified if database is accessible

### 5. **Session Persistence Issues** ⚠️
   - Daily visit tracker uses in-memory Map → lost on server restart
   - Should use Redis or database

### 6. **Missing Middleware** ⚠️
   - `requireAuth` → JWT verification not shown
   - `requireAdmin` → Admin role check not shown
   - `requireOnboarding` → Onboarding status check not shown

### 7. **External API Failures Not Handled** ⚠️
   - Jikan, OpenLibrary, 4chan, MangaDex timeout = 500 error
   - No fallback or retry logic
   - Rate limiting not implemented

---

## 📊 Endpoint Status Summary
- ✅ **Should Work** (no obvious issues): ~25 endpoints
- 🟡 **Need Testing** (requires database/auth): ~35 endpoints
- ❌ **Will Fail** (missing credentials): 4 endpoints (ZyleLabs + OAuth)
- ⚠️ **Potential Issues**: Several endpoints with design flaws

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Verify MongoDB is running and accessible
- [ ] Check `.env` file for all required variables
- [ ] Add missing API keys (ZyleLabs, Google OAuth)
- [ ] Start server: `npm run dev`
- [ ] Fix routing conflict between `/api/gist` and `/api/gists`

### Quick Tests (Public Endpoints)
- [ ] GET `/` (root) → Should return "Welcome to the Manga API 🚀"
- [ ] GET `/api/manga/` → Should return MangaDex list (cached)
- [ ] GET `/api/manga/jikan/top` → Should return top 10 from Jikan
- [ ] GET `/api/stories/openlibrary/search?q=harry` → Should return books
- [ ] GET `/api/gist/threads/4chan/boards` → Should return 4chan boards

### Database Dependent Tests
- [ ] Test all routes that require `requireAuth`
- [ ] Test all routes that require database access
- [ ] Test pagination endpoints
- [ ] Test search functionality

### Integration Tests
- [ ] Complete OAuth flow
- [ ] Create account → Onboarding → Create content
- [ ] Test reward/XP system
- [ ] Test wallet transactions

---

## Recommended Fixes (Priority Order)

### P0 - Critical
1. **Fix routing conflict**: Choose `/api/gist` OR `/api/gists`, remove duplicate
2. **Add ZyleLabs API key** to `.env`
3. **Add Google OAuth credentials** to `.env`
4. **Verify MongoDB connection**

### P1 - High
5. Fix daily visit tracker to use persistent storage
6. Implement proper error handling for external API timeouts
7. Add rate limiting for external API calls
8. Validate all JWT tokens properly

### P2 - Medium
9. Add request validation (schema validation)
10. Improve error messages
11. Add API documentation (OpenAPI/Swagger)
12. Implement caching strategy for database queries

---

## Next Steps
1. Run this checklist
2. Fix critical issues
3. Report findings on each endpoint
4. Set up proper monitoring/logging
