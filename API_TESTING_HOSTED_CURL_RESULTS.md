# 🌐 Hosted Backend API Testing Report (curl-based)

**Target Backend URL**: `https://social-backend-actd.onrender.com`  
**Date of Execution**: Mon Jun 29 23:34:23 IST 2026  

## 📊 Summary of Results

| Endpoint / Route | Method | Expected Status | Actual Status | Response Time | Result | Notes / Snippet |
|------------------|--------|-----------------|---------------|---------------|--------|-----------------|
| `/` | `GET` | `200` | `200` | 596ms | **✅ PASS** | Welcome to the Manga API 🚀 |
| `/api/auth/google/failure` | `GET` | `401` | `401` | 521ms | **✅ PASS** | {"message":"Google authentication failed"} |
| `/api/auth/google` | `GET` | `200` | `302` | 663ms | **❌ FAIL** |  |
| `/api/manga/` | `GET` | `200` | `200` | 550ms | **✅ PASS** | {"result":"ok","response":"collection","data":[{"id":"5f7b46a4-c807-4a92-9a3e-c6055c373b67","type":"manga","attributes":{"title":{"en":"Subaru to Suba |
| `/api/manga/top10` | `GET` | `200` | `200` | 573ms | **✅ PASS** | {"result":"ok","response":"collection","data":[{"id":"32d76d19-8a05-4db0-9fc2-e0b0648fe9d0","type":"manga","attributes":{"title":{"ko-ro":"Na Honjaman |
| `/api/manga/external/e6fb0597-caec-49d7-83a3-aa5a81db197d` | `GET` | `404` | `404` | 1034ms | **✅ PASS** | {"success":false,"message":"Failed to fetch manga details","error":"Request failed with status code 404"} |
| `/api/manga/external/e6fb0597-caec-49d7-83a3-aa5a81db197d/chapters` | `GET` | `200` | `200` | 491ms | **✅ PASS** | {"success":true,"total":0,"limit":100,"offset":0,"data":[]} |
| `/api/manga/jikan/top` | `GET` | `200` | `200` | 595ms | **✅ PASS** | {"success":true,"source":"jikan","data":[{"mal_id":2,"url":"https://myanimelist.net/manga/2/Berserk","images":{"jpg":{"image_url":"https://cdn.myanime |
| `/api/manga/jikan/search?q=naruto` | `GET` | `200` | `200` | 530ms | **✅ PASS** | {"success":true,"source":"jikan","data":[{"mal_id":11,"url":"https://myanimelist.net/manga/11/Naruto","images":{"jpg":{"image_url":"https://cdn.myanim |
| `/api/manga/jikan/21` | `GET` | `200` | `200` | 709ms | **✅ PASS** | {"success":true,"source":"jikan","data":{"mal_id":21,"url":"https://myanimelist.net/manga/21/Death_Note","images":{"jpg":{"image_url":"https://cdn.mya |
| `/api/manga/zyla` | `GET` | `200` | `200` | 502ms | **✅ PASS** | {"success":true,"source":"zyla","data":[{"id":"1","title":"Guardian Dog","author":"Various Authors","genres":["Manga"],"cover_image":"https://media.ki |
| `/api/stories/zyla/novels` | `GET` | `200` | `200` | 614ms | **✅ PASS** | {"success":true,"source":"zyla","data":[{"id":"OL66554W","title":"Pride and Prejudice","author":"Jane Austen","genre":"Fiction, Romance, Historical, R |
| `/api/stories/openlibrary/search?q=harry` | `GET` | `200` | `200` | 557ms | **✅ PASS** | {"success":true,"source":"openlibrary","total":108623,"page":1,"data":[{"id":"/works/OL82563W","title":"Harry Potter and the Philosopher's Stone","aut |
| `/api/stories/openlibrary/work/OL27479W` | `GET` | `200` | `200` | 538ms | **✅ PASS** | {"success":true,"source":"openlibrary","data":{"description":"The Lord of the Rings, J.R.R. Tolkien's three-volume epic, is set in the imaginary world |
| `/api/gist/threads/4chan/boards` | `GET` | `200` | `200` | 491ms | **✅ PASS** | {"success":true,"source":"4chan","data":[{"board":"3","title":"3DCG","ws_board":1,"per_page":15,"pages":10,"max_filesize":4194304,"max_webm_filesize": |
| `/api/gist/threads/4chan/a/catalog` | `GET` | `200` | `200` | 819ms | **✅ PASS** | {"success":true,"source":"4chan","data":[{"page":1,"threads":[{"no":289015655,"now":"06/29/26(Mon)09:32:33","name":"Anonymous","com":"Do you still con |
| `/api/manga/create` | `POST` | `201` | `500` | 10517ms | **❌ FAIL** | {"success":false,"message":"Operation `mangas.insertOne()` buffering timed out after 10000ms"} |
| `/api/manga/60b9f0e1f1d2b3c4d5e6f7a8` | `GET` | `404` | `205` | 10529ms | **❌ FAIL** |  |
| `/api/manga/user/60b9f0e1f1d2b3c4d5e6f7a8` | `GET` | `200` | `500` | 10596ms | **❌ FAIL** | {"success":false,"message":"Operation `mangas.find()` buffering timed out after 10000ms"} |
| `/api/stories/` | `GET` | `200` | `000` | 15036ms | **❌ FAIL** |  |
| `/api/gists/` | `GET` | `200` | `500` | 10757ms | **❌ FAIL** | {"error":"Operation `gists.find()` buffering timed out after 10000ms"} |
| `/api/events/` | `GET` | `200` | `200` | 650ms | **✅ PASS** | {"success":true,"message":"Events retrieved successfully","data":[{"id":"1","name":"Counter Strike 2 Tournament","description":"Utilizing Anime and Ma |
| `/api/views/record` | `POST` | `200` | `500` | 10696ms | **❌ FAIL** | {"error":"Operation `gisttopics.findOne()` buffering timed out after 10000ms"} |
| `/api/onboarding/role` | `POST` | `401/403` | `401` | 1095ms | **✅ PASS** | {"error":"Unauthorized: No token provided"} |
| `/api/wallet/me` | `GET` | `401/403` | `401` | 483ms | **✅ PASS** | {"error":"Unauthorized: No token provided"} |
| `/api/xp/me` | `GET` | `401/403` | `401` | 463ms | **✅ PASS** | {"error":"Unauthorized: No token provided"} |
| `/api/xp/daily-visit` | `POST` | `401/403` | `401` | 474ms | **✅ PASS** | {"error":"Unauthorized: No token provided"} |
| `/api/notifications` | `GET` | `401/403` | `401` | 456ms | **✅ PASS** | {"error":"Unauthorized: No token provided"} |
| `/api/admin/stats` | `GET` | `401/403` | `401` | 500ms | **✅ PASS** | {"error":"Unauthorized: No token provided"} |
| `/api/wallet/me` | `GET` | `401/403` | `401` | 10533ms | **✅ PASS** | {"error":"Unauthorized: Invalid or expired token"} |
