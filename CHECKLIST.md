# ✅ API Testing - Action Items Checklist

## 🔴 CRITICAL (Do First - 20 minutes)

- [ ] **Install MongoDB**
  - Command: `brew install mongodb-community`
  - Verify: `brew services start mongodb-community`
  - Test: `mongosh --eval "db.version()"`
  - Time: 5 minutes
  - Impact: Unlocks 30+ endpoints

- [ ] **Add Missing Environment Variables**
  - [ ] Add to `.env`:
    ```
    ZYLA_API_KEY=<get-from-zylalabs.com>
    GOOGLE_CLIENT_ID=<get-from-google-console>
    GOOGLE_CLIENT_SECRET=<get-from-google-console>
    API_USER_AGENT=EzzstarxSocialBackend/1.0
    MONGO_URI=mongodb://127.0.0.1:27017/ezzstar
    ```
  - Time: 5 minutes
  - Impact: Fixes 4 broken endpoints + OAuth

- [ ] **Fix Routing Conflict**
  - See: `FIX_ROUTING_CONFLICT.md`
  - Steps:
    - [ ] Create `routes/threads.routes.js`
    - [ ] Update `routes/gists.routes.js`
    - [ ] Delete `routes/gist.routes.js`
    - [ ] Update `server.js`
    - [ ] Test new endpoints
  - Time: 15 minutes
  - Impact: Cleaner API, no conflicts

- [ ] **Restart Server & Quick Test**
  ```bash
  npm run dev
  curl http://localhost:5001/api/gists/
  curl http://localhost:5001/api/threads/4chan/boards
  curl http://localhost:5001/api/wallet/me  # Should require auth
  ```
  - Time: 5 minutes
  - Expected: No hanging requests

---

## 🟠 HIGH PRIORITY (Do Within 1 Hour)

- [ ] **Implement Rate Limiting**
  - Install: `npm install express-rate-limit`
  - Apply to external API endpoints (Jikan, OpenLibrary, 4chan)
  - Prevent DDoS attacks
  - Time: 30 minutes
  - Impact: Improved security

- [ ] **Fix Daily Visit Tracker**
  - Current: In-memory Map (resets on restart)
  - Better: Use Redis or database
  - File: `routes/xp.routes.js` line ~30
  - Time: 20 minutes
  - Impact: Data persistence

- [ ] **Run Full Endpoint Test Suite**
  - Create test script or use Postman
  - Test all 60+ endpoints
  - Document failures
  - Time: 30 minutes
  - Impact: Know full status

- [ ] **Add Error Logging**
  - File: `server.js`
  - Add middleware for request logging
  - Log all errors with context
  - Time: 20 minutes
  - Impact: Better debugging

---

## 🟡 MEDIUM PRIORITY (Do This Week)

- [ ] **Implement API Documentation**
  - Option 1: Swagger/OpenAPI
    - Install: `npm install swagger-ui-express`
    - Create: `swagger.json`
    - Time: 1-2 hours
  - Option 2: README with endpoints
    - List all endpoints
    - Include examples
    - Time: 30 minutes
  - Impact: Better developer experience

- [ ] **Add Request Validation**
  - Install: `npm install joi` or `zod`
  - Validate request bodies
  - Return 400 for invalid data
  - Time: 1 hour
  - Impact: Better error handling

- [ ] **Set Up Monitoring**
  - Install: `npm install winston` (logging)
  - Track: Response times, error rates
  - Alert: On failures
  - Time: 1 hour
  - Impact: Early issue detection

- [ ] **Create Automated Tests**
  - Install: `npm install jest`
  - Write tests for:
    - External API endpoints
    - Database operations
    - Auth flows
  - Run: `npm test`
  - Time: 2-3 hours
  - Impact: Regression prevention

---

## 📋 INFORMATION ITEMS

- [ ] **Review Generated Documentation**
  - [ ] Read `EXECUTIVE_SUMMARY.md` (5 min)
  - [ ] Read `API_TESTING_RESULTS.md` (10 min)
  - [ ] Read `API_TESTING_REPORT.md` (15 min)
  - [ ] Read `FIX_ROUTING_CONFLICT.md` (10 min)

- [ ] **Understand Current Status**
  - ✅ 7 endpoints working (external APIs)
  - ❌ 30+ endpoints broken (need MongoDB)
  - ⚠️ 1 routing conflict
  - ❌ 4 endpoints broken (missing credentials)

- [ ] **API Key/Credential Checklist**
  - [ ] Jikan API: ✅ Public (no key needed)
  - [ ] OpenLibrary API: ✅ Public (no key needed)
  - [ ] 4chan API: ✅ Public (no key needed)
  - [ ] MangaDex API: ✅ Public (no key needed)
  - [ ] ZyleLabs API: ❌ Need key
  - [ ] Google OAuth: ❌ Need credentials
  - [ ] MongoDB: ✅ Local (no auth)

---

## 🧪 TESTING CHECKLIST

### Phase 1: Setup (20 minutes)
- [ ] MongoDB installed and running
- [ ] .env file updated with all variables
- [ ] Routing conflict fixed
- [ ] Server starts without errors
- [ ] No warnings in console

### Phase 2: Basic Tests (5 minutes)
- [ ] `GET /` returns "Welcome to Manga API"
- [ ] `GET /api/manga/jikan/top` returns data
- [ ] `GET /api/stories/openlibrary/search?q=test` returns data
- [ ] `GET /api/gist/threads/4chan/boards` returns data

### Phase 3: Database Tests (5 minutes)
- [ ] `GET /api/gists/` returns data or empty array
- [ ] `GET /api/events/` returns data or empty array
- [ ] `GET /api/stories/` returns data or empty array
- [ ] No hanging/timeout responses

### Phase 4: Auth Tests (5 minutes)
- [ ] `GET /api/auth/google/failure` works
- [ ] `POST /api/onboarding/role` requires auth
- [ ] `POST /api/onboarding/profile` requires auth
- [ ] `GET /api/wallet/me` requires auth

### Phase 5: Integration Tests (15 minutes)
- [ ] Complete OAuth flow (or test manually)
- [ ] Create gist
- [ ] Join gist
- [ ] Create comment
- [ ] Create reaction

---

## 🎯 SUCCESS METRICS

After all critical fixes:

- ✅ 50+/60 endpoints working (83%)
- ✅ 0 hanging requests
- ✅ 0 routing conflicts
- ✅ All external APIs responsive
- ✅ Database operations functional
- ✅ Auth system working
- ✅ All environment variables set
- ✅ Server starts in <2 seconds

---

## 📊 Time Investment

| Task | Time | Priority | Impact |
|------|------|----------|--------|
| Install MongoDB | 5 min | 🔴 CRITICAL | 🔥 High |
| Add env variables | 5 min | 🔴 CRITICAL | 🔥 High |
| Fix routing | 15 min | 🔴 CRITICAL | 🔥 Medium |
| Rate limiting | 30 min | 🟠 High | 🔥 Medium |
| Daily tracker fix | 20 min | 🟠 High | 📊 Low |
| Full test suite | 30 min | 🟠 High | 🔥 High |
| Documentation | 1-2 hrs | 🟡 Medium | 📊 Medium |
| Automation tests | 2-3 hrs | 🟡 Medium | 🔥 High |
| **TOTAL** | **~3.5 hours** | - | - |

---

## 🚀 Quick Start Command

```bash
# 1. Install MongoDB
brew install mongodb-community

# 2. Start MongoDB
brew services start mongodb-community

# 3. Verify MongoDB
mongosh --eval "db.version()"

# 4. Apply routing fix
# (See FIX_ROUTING_CONFLICT.md)

# 5. Update .env with missing variables
nano .env

# 6. Start server
npm run dev

# 7. Test in another terminal
curl http://localhost:5001/api/gists/
curl http://localhost:5001/api/threads/4chan/boards
```

---

## 📞 FAQ

**Q: Why are endpoints hanging?**
A: MongoDB is not installed. They're waiting for database connection that will never come.

**Q: How long will this take?**
A: Critical fixes: 20 minutes. Full fixes: 3.5 hours.

**Q: What if I don't have MongoDB?**
A: Install it with: `brew install mongodb-community`

**Q: Why are some external APIs broken?**
A: Missing API keys (ZyleLabs) or credentials (Google OAuth).

**Q: Can I use the API without fixing the routing conflict?**
A: Yes, but it's confusing. Use `/api/gists/` or `/api/gist/`, not both.

**Q: When should I go to production?**
A: After all critical fixes + testing. Probably 1-2 days.

---

## 📝 Notes

- All external APIs (Jikan, OpenLibrary, 4chan, MangaDex) work perfectly ✅
- Server code quality is good (no major bugs found) ✅
- Architecture is solid once MongoDB is added ✅
- Security needs rate limiting and validation 🟡
- Documentation is missing (plan to add) 🟡

---

**Last Updated**: June 2, 2026  
**Status**: 🔴 Blocked by infrastructure (MongoDB)  
**Next Action**: Install MongoDB (5 minutes)
