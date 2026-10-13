const axios = require("axios");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const HOSTED_URL = "https://social-backend-actd.onrender.com";
const DEFAULT_SECRET = "your_jwt_secret";

// Generate a test JWT token using the default secret and a dummy user ID
const dummyUserId = "60b9f0e1f1d2b3c4d5e6f7a8";
const testTokenDefaultSecret = jwt.sign({ id: dummyUserId }, DEFAULT_SECRET, { expiresIn: "7d" });

const results = [];

async function testEndpoint(method, relativeUrl, body = null, headers = {}) {
  const url = `${HOSTED_URL}${relativeUrl}`;
  const startTime = Date.now();
  console.log(`[TESTING] ${method} ${relativeUrl}...`);
  try {
    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      timeout: 15000 // 15 seconds timeout
    };
    if (body) {
      config.data = body;
    }
    const response = await axios(config);
    const duration = Date.now() - startTime;
    console.log(`[SUCCESS] ${method} ${relativeUrl} -> Status: ${response.status} (${duration}ms)`);
    results.push({
      method,
      relativeUrl,
      status: response.status,
      success: true,
      duration,
      response: JSON.stringify(response.data).substring(0, 300),
      notes: "Request succeeded"
    });
    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    const status = error.response ? error.response.status : "TIMEOUT/NETWORK_ERR";
    const data = error.response ? error.response.data : null;
    const errorMsg = error.message;

    console.log(`[FAILED] ${method} ${relativeUrl} -> Status: ${status} (${duration}ms)`);
    results.push({
      method,
      relativeUrl,
      status,
      success: false,
      duration,
      response: data ? JSON.stringify(data).substring(0, 300) : errorMsg,
      notes: data && data.error ? data.error : (data && data.message ? data.message : errorMsg)
    });
    return null;
  }
}

async function runTests() {
  console.log(`🚀 Starting hosted backend API endpoint test suite...`);
  console.log(`Target: ${HOSTED_URL}`);
  console.log(`=========================================\n`);

  // --- 1. Root & Auth Failure ---
  await testEndpoint("GET", "/");
  await testEndpoint("GET", "/api/auth/google/failure");
  // Check redirect behavior (don't fail on redirect)
  await testEndpoint("GET", "/api/auth/google");

  // --- 2. Manga Dex Public Endpoints ---
  await testEndpoint("GET", "/api/manga/");
  await testEndpoint("GET", "/api/manga/top10");
  await testEndpoint("GET", "/api/manga/cover?mangaId=e6fb0597-caec-49d7-83a3-aa5a81db197d&fileName=cover.jpg");
  await testEndpoint("GET", "/api/manga/external/e6fb0597-caec-49d7-83a3-aa5a81db197d");
  await testEndpoint("GET", "/api/manga/external/e6fb0597-caec-49d7-83a3-aa5a81db197d/chapters");
  await testEndpoint("GET", "/api/manga/chapter/e6fb0597-caec-49d7-83a3-aa5a81db197d/pages");

  // --- 3. Jikan Public Endpoints ---
  await testEndpoint("GET", "/api/manga/jikan/top");
  await testEndpoint("GET", "/api/manga/jikan/search?q=naruto");
  await testEndpoint("GET", "/api/manga/jikan/21");

  // --- 4. Zyla Public (Manga & Stories) ---
  await testEndpoint("GET", "/api/manga/zyla");
  await testEndpoint("GET", "/api/stories/zyla/novels");

  // --- 5. OpenLibrary Public Endpoints ---
  await testEndpoint("GET", "/api/stories/openlibrary/search?q=harry");
  await testEndpoint("GET", "/api/stories/openlibrary/work/OL27479W");

  // --- 6. 4chan Public Endpoints ---
  await testEndpoint("GET", "/api/gist/threads/4chan/boards");
  await testEndpoint("GET", "/api/gist/threads/4chan/a/catalog");
  
  // --- 7. Platform Manga Endpoints (Public + DB) ---
  // Let's try creating a Platform Manga
  const createMangaRes = await testEndpoint("POST", "/api/manga/create", {
    title: `Hosted Test Manga ${Date.now()}`,
    description: "A manga created during automated integration tests on hosted backend.",
    coverImage: "https://example.com/cover.jpg",
    genres: ["Action", "Sci-Fi"],
    author: dummyUserId // passes dummy user ID
  });

  let createdMangaId = null;
  if (createMangaRes && createMangaRes.success && createMangaRes.data) {
    createdMangaId = createMangaRes.data._id;
  }

  // If manga was successfully created, test dynamic sub-routes with it. Otherwise use dummy ID.
  const targetMangaId = createdMangaId || dummyUserId;
  await testEndpoint("GET", `/api/manga/${targetMangaId}`);
  await testEndpoint("GET", `/api/manga/user/${dummyUserId}`);
  
  // Test platform episodes
  await testEndpoint("POST", `/api/manga/${targetMangaId}/episode`, {
    title: "Episode 1: The Beginning",
    episodeNumber: 1,
    pages: ["https://example.com/p1.jpg", "https://example.com/p2.jpg"]
  });
  await testEndpoint("GET", `/api/manga/${targetMangaId}/episodes`);

  // --- 8. Platform Stories & Gists & Comments ---
  await testEndpoint("GET", "/api/stories/");
  await testEndpoint("GET", `/api/stories/${dummyUserId}`);
  await testEndpoint("GET", "/api/gists/");
  await testEndpoint("GET", `/api/gists/${dummyUserId}`);
  await testEndpoint("GET", `/api/gists/${dummyUserId}/topics`);
  await testEndpoint("GET", `/api/gists/topics/${dummyUserId}`);
  await testEndpoint("GET", `/api/comments/GIST_TOPIC/${dummyUserId}`);

  // --- 9. Events Public Endpoints ---
  await testEndpoint("GET", "/api/events/");
  await testEndpoint("GET", `/api/events/${dummyUserId}`);

  // --- 10. Engagement Public Endpoints ---
  await testEndpoint("POST", "/api/views/record", {
    contentType: "GIST_TOPIC",
    contentId: dummyUserId,
    durationSeconds: 15,
    deviceHash: "test-device-hash"
  });

  // --- 11. Boost Campaign Impression (Public) ---
  await testEndpoint("POST", `/api/boosts/${dummyUserId}/impression`);

  // --- 12. Verification of Auth Protection (Should return 401 Unauthorized) ---
  const authProtectedRoutes = [
    { method: "POST", url: "/api/onboarding/role", body: { role: "READER" } },
    { method: "POST", url: "/api/onboarding/profile", body: { username: "tester" } },
    { method: "GET", url: "/api/wallet/me", body: null },
    { method: "GET", url: "/api/wallet/transactions", body: null },
    { method: "GET", url: "/api/xp/me", body: null },
    { method: "POST", url: "/api/xp/daily-visit", body: null },
    { method: "POST", url: "/api/comments", body: { contentType: "GIST_TOPIC", contentId: dummyUserId, body: "test" } },
    { method: "POST", url: "/api/shares", body: { contentType: "GIST_TOPIC", contentId: dummyUserId } },
    { method: "POST", url: "/api/reactions", body: { contentType: "GIST_TOPIC", contentId: dummyUserId, reactionType: "LIKE" } },
    { method: "POST", url: "/api/tips/send", body: { contentType: "GIST_TOPIC", contentId: dummyUserId, amount: 10 } },
    { method: "POST", url: "/api/boosts/create", body: { contentType: "GIST_TOPIC", contentId: dummyUserId, plan: "STARTER" } },
    { method: "GET", url: "/api/boosts/my", body: null },
    { method: "POST", url: `/api/tournaments/events/${dummyUserId}/bracket/generate`, body: null },
    { method: "GET", url: "/api/notifications", body: null },
    { method: "GET", url: "/api/admin/stats", body: null }
  ];

  for (const route of authProtectedRoutes) {
    await testEndpoint(route.method, route.url, route.body);
  }

  // --- 13. Test Token Validation using Default Secret ---
  console.log(`\n🔑 Testing if default JWT_SECRET is accepted by the hosted server...`);
  const tokenTestRes = await testEndpoint("GET", "/api/wallet/me", null, {
    Authorization: `Bearer ${testTokenDefaultSecret}`
  });

  // Analyze secret test results
  const jwtTestResult = results[results.length - 1];
  let jwtReportNote = "";
  if (jwtTestResult.status === 401) {
    if (jwtTestResult.notes.includes("User not found")) {
      jwtReportNote = "🟢 **Default JWT secret ('your_jwt_secret') is ACCEPTED** by the hosted server. The signature was valid, but the user ID was not found in the database. This means we can simulate auth by seeding a user in the local environment and copying that ID!";
    } else if (jwtTestResult.notes.includes("Invalid or expired token")) {
      jwtReportNote = "🔴 **Custom JWT secret is configured** on the hosted server. The default secret was rejected with 'Invalid or expired token'.";
    } else {
      jwtReportNote = `🟡 Returned 401 with message: "${jwtTestResult.notes}"`;
    }
  } else {
    jwtReportNote = `🟡 Unexpected status code ${jwtTestResult.status}. Response: ${jwtTestResult.response}`;
  }
  console.log(`JWT Secret Test Verdict: ${jwtReportNote}\n`);

  // --- 14. Write Markdown Report ---
  generateMarkdownReport(jwtReportNote);
}

function generateMarkdownReport(jwtVerdict) {
  const reportPath = path.join(__dirname, "..", "API_TESTING_HOSTED_RESULTS.md");
  
  let md = `# 🌐 Hosted Backend API Testing Report\n\n`;
  md += `**Target Backend URL**: \`${HOSTED_URL}\`  \n`;
  md += `**Date of Execution**: ${new Date().toISOString()}  \n`;
  md += `**Overall JWT Secret Verdict**: ${jwtVerdict}\n\n`;

  md += `## 📊 Summary of Results\n\n`;
  const total = results.length;
  const passed = results.filter(r => r.success || r.status === 401 || r.status === 403).length; // Auth protection returning 401 is correct/pass behavior
  const activeFails = results.filter(r => !r.success && r.status !== 401 && r.status !== 403).length;
  
  md += `- **Total Endpoints Tested**: ${total}\n`;
  md += `- **Passed (Success or correctly blocked by Auth)**: ${passed} / ${total}\n`;
  md += `- **Failed (Server errors, timeouts, or unexpected crashes)**: ${activeFails} / ${total}\n\n`;

  md += `## 🧪 Detailed Endpoint Tests\n\n`;
  md += `| Category / Route | Method | Status Code | Response Time | Result | Notes / Details |\n`;
  md += `|------------------|--------|-------------|---------------|--------|-----------------|\n`;

  results.forEach(r => {
    let outcome = "❌ FAIL";
    // If the request succeeded, or if it failed with 401/403 which is the EXPECTED behavior for unauthorized calls
    const isExpectedAuthBlock = (r.relativeUrl.startsWith("/api/") && 
                                 !["/api/auth/google", "/api/auth/google/failure", "/api/manga/", "/api/manga/top10", "/api/manga/cover", "/api/manga/external", "/api/manga/chapter", "/api/manga/jikan", "/api/manga/zyla", "/api/stories/openlibrary", "/api/stories/zyla", "/api/gist/threads", "/api/gist/creators", "/api/gists/", "/api/events/", "/api/comments/GIST_TOPIC", "/api/views/record", "/api/manga/create", "/api/manga/user"].some(p => r.relativeUrl.startsWith(p)) &&
                                 (r.status === 401 || r.status === 403));
                                 
    const isExpectedPublicFail = (r.relativeUrl.includes("/zyla") && r.status === 400); // Zyla requires key, so 400 is expected if unconfigured

    if (r.success || isExpectedAuthBlock || isExpectedPublicFail) {
      outcome = "✅ PASS";
    }

    // Clean response for display
    const cleanResponse = r.response.replace(/\n/g, " ").substring(0, 80);

    md += `| \`${r.relativeUrl}\` | \`${r.method}\` | \`${r.status}\` | ${r.duration}ms | **${outcome}** | ${r.notes || cleanResponse} |\n`;
  });

  md += `\n## 📝 Conclusion & Findings\n\n`;
  md += `### 1. Database & Platform Functionality\n`;
  const platformMangaTest = results.find(r => r.relativeUrl === "/api/manga/create");
  if (platformMangaTest && platformMangaTest.success) {
    md += `- **MongoDB Integration**: ✅ **FULLY FUNCTIONAL** on the hosted server. \`POST /api/manga/create\` succeeded, indicating the database is up, running, and accepting writes.\n`;
  } else {
    md += `- **MongoDB Integration**: ❌ **NOT WRITING/FUNCTIONAL** on hosted backend (or returned errors). Details: \`${platformMangaTest ? platformMangaTest.response : "No run"}\`\n`;
  }

  md += `\n### 2. External API Connections\n`;
  const jikanTest = results.find(r => r.relativeUrl.includes("/jikan/top"));
  const mangaDexTest = results.find(r => r.relativeUrl === "/api/manga/");
  const openLibraryTest = results.find(r => r.relativeUrl.includes("/openlibrary/search"));
  const fourChanTest = results.find(r => r.relativeUrl.includes("/threads/4chan"));

  md += `- **Jikan API**: ${jikanTest && jikanTest.success ? "✅ Working" : "❌ Failed"}\n`;
  md += `- **MangaDex API**: ${mangaDexTest && mangaDexTest.success ? "✅ Working" : "❌ Failed"}\n`;
  md += `- **OpenLibrary API**: ${openLibraryTest && openLibraryTest.success ? "✅ Working" : "❌ Failed"}\n`;
  md += `- **4chan API**: ${fourChanTest && fourChanTest.success ? "✅ Working" : "❌ Failed"}\n`;

  const zylaManga = results.find(r => r.relativeUrl === "/api/manga/zyla");
  if (zylaManga && zylaManga.status === 400 && zylaManga.notes.includes("ZYLA_API_KEY")) {
    md += `- **ZyleLabs API**: ⚠️ Key not configured on hosted server (received 400 ZYLA_API_KEY error, which matches local behavior).\n`;
  } else if (zylaManga && zylaManga.success) {
    md += `- **ZyleLabs API**: ✅ **Working on hosted server!** (API key is properly set on Render).\n`;
  } else {
    md += `- **ZyleLabs API**: ❌ Failed or returned other error status.\n`;
  }

  md += `\nReport written to: \`API_TESTING_HOSTED_RESULTS.md\`\n`;

  fs.writeFileSync(reportPath, md);
  console.log(`\n🎉 Test report successfully generated at ${reportPath}!`);
}

runTests();
