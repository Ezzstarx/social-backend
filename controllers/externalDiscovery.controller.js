const axios = require("axios");

const DEFAULT_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

const getCached = (key) => {
  const cached = cache.get(key);
  if (!cached || cached.expiresAt < Date.now()) return null;
  return cached.data;
};

const setCached = (key, data, ttl = CACHE_TTL_MS) => {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
};

const requestJson = async (url, options = {}) => {
  const cacheKey = `${url}:${JSON.stringify(options.params || {})}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await axios.get(url, {
    timeout: DEFAULT_TIMEOUT_MS,
    ...options,
    headers: {
      "User-Agent": process.env.API_USER_AGENT || "EzzstarxSocialBackend/1.0 (contact@example.com)",
      ...(options.headers || {}),
    },
  });

  setCached(cacheKey, response.data);
  return response.data;
};

const sendExternalError = (res, error, message) => {
  const status = error.response?.status || 502;
  return res.status(status).json({
    success: false,
    message,
    error: error.response?.data?.message || error.message,
  });
};

const normalizeLimit = (value, fallback = 20, max = 50) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const searchJikanManga = async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    const limit = normalizeLimit(req.query.limit, 20, 25);

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Search query must be at least 2 characters" });
    }

    const data = await requestJson("https://api.jikan.moe/v4/manga", {
      params: { q, page, limit, order_by: "popularity", sort: "asc" },
    });

    return res.json({
      success: true,
      source: "jikan",
      data: data.data,
      pagination: data.pagination,
    });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch manga from Jikan");
  }
};

const getTopJikanManga = async (req, res) => {
  try {
    const limit = normalizeLimit(req.query.limit, 10, 25);
    const data = await requestJson("https://api.jikan.moe/v4/top/manga", {
      params: { limit },
    });

    return res.json({
      success: true,
      source: "jikan",
      data: data.data,
      pagination: data.pagination,
    });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch top manga from Jikan");
  }
};

const getJikanMangaById = async (req, res) => {
  try {
    const data = await requestJson(`https://api.jikan.moe/v4/manga/${req.params.id}`);
    return res.json({ success: true, source: "jikan", data: data.data });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch manga details from Jikan");
  }
};

const getOpenLibraryStories = async (req, res) => {
  try {
    const { q, subject } = req.query;
    const limit = normalizeLimit(req.query.limit, 20, 50);
    const page = parseInt(req.query.page, 10) || 1;

    if (!q && !subject) {
      return res.status(400).json({ success: false, message: "Provide q or subject" });
    }

    const params = {
      limit,
      page,
      fields: "key,title,author_name,first_publish_year,cover_i,subject,ebook_access,ratings_average",
    };
    if (q) params.q = q;
    if (subject) params.subject = subject;

    const data = await requestJson("https://openlibrary.org/search.json", { params });
    const docs = (data.docs || []).map((book) => ({
      id: book.key,
      title: book.title,
      author: book.author_name?.[0] || "Unknown",
      year: book.first_publish_year,
      coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
      subjects: book.subject?.slice(0, 8) || [],
      ebookAccess: book.ebook_access,
      rating: book.ratings_average || null,
      source: "openlibrary",
    }));

    return res.json({
      success: true,
      source: "openlibrary",
      total: data.numFound,
      page,
      data: docs,
    });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch stories from OpenLibrary");
  }
};

const getOpenLibraryWork = async (req, res) => {
  try {
    const workId = req.params.workId.replace(/^\/?works\//, "");
    const data = await requestJson(`https://openlibrary.org/works/${workId}.json`);
    return res.json({ success: true, source: "openlibrary", data });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch story details from OpenLibrary");
  }
};

const getFourChanBoards = async (req, res) => {
  try {
    const data = await requestJson("https://a.4cdn.org/boards.json");
    return res.json({ success: true, source: "4chan", data: data.boards || [] });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch thread boards");
  }
};

const getFourChanCatalog = async (req, res) => {
  try {
    const data = await requestJson(`https://a.4cdn.org/${encodeURIComponent(req.params.board)}/catalog.json`);
    return res.json({ success: true, source: "4chan", data });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch thread catalog");
  }
};

const getFourChanThread = async (req, res) => {
  try {
    const { board, threadNo } = req.params;
    const data = await requestJson(`https://a.4cdn.org/${encodeURIComponent(board)}/thread/${encodeURIComponent(threadNo)}.json`);
    return res.json({ success: true, source: "4chan", data });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch thread details");
  }
};

const requireZylaKey = (res) => {
  if (process.env.ZYLA_API_KEY) return process.env.ZYLA_API_KEY;
  res.status(503).json({
    success: false,
    message: "ZYLA_API_KEY is not configured on the backend",
  });
  return null;
};

const getZylaResource = async (req, res, endpointId, endpointName, message, extraParams = {}) => {
  try {
    const key = requireZylaKey(res);
    if (!key) return null;

    const data = await requestJson(
      `https://zylalabs.com/api/1760/anime+manga+and+novel+discovery+api/${endpointId}/${endpointName}`,
      {
        params: { ...req.query, ...extraParams },
        headers: { Authorization: `Bearer ${key}` },
      }
    );

    return res.json({ success: true, source: "zyla", data });
  } catch (error) {
    return sendExternalError(res, error, message);
  }
};

const getZylaManga = (req, res) => getZylaResource(req, res, 1375, "fetch+manga", "Failed to fetch manga from Zyla");
const getZylaMangaById = (req, res) => getZylaResource(req, res, 1376, "fetch+manga+by+id", "Failed to fetch manga details from Zyla", { id: req.params.id });
const getZylaNovels = (req, res) => getZylaResource(req, res, 1379, "fetch+novels", "Failed to fetch novels from Zyla");
const getZylaNovelById = (req, res) => getZylaResource(req, res, 1380, "fetch+novels+by+id", "Failed to fetch novel details from Zyla", { id: req.params.id });

module.exports = {
  searchJikanManga,
  getTopJikanManga,
  getJikanMangaById,
  getOpenLibraryStories,
  getOpenLibraryWork,
  getFourChanBoards,
  getFourChanCatalog,
  getFourChanThread,
  getZylaManga,
  getZylaMangaById,
  getZylaNovels,
  getZylaNovelById,
};
