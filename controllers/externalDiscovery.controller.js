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

const getZylaManga = async (req, res) => {
  try {
    const key = process.env.ZYLA_API_KEY;
    if (key) {
      const data = await requestJson(
        `https://zylalabs.com/api/1760/anime+manga+and+novel+discovery+api/1375/fetch+manga`,
        {
          params: req.query,
          headers: { Authorization: `Bearer ${key}` },
        }
      );
      return res.json({ success: true, source: "zyla", data });
    }

    // Fallback to Kitsu API (Free)
    console.log("No ZYLA_API_KEY found, falling back to Kitsu API for Zyla tab");
    const kitsuResponse = await requestJson("https://kitsu.io/api/edge/manga?page[limit]=20");
    const kitsuData = kitsuResponse.data || [];
    const mapped = kitsuData.map(item => {
      const attrs = item.attributes || {};
      return {
        id: item.id,
        title: attrs.canonicalTitle || attrs.titles?.en || attrs.titles?.en_jp || "Untitled",
        author: "Various Authors",
        genres: ["Manga"],
        cover_image: attrs.posterImage?.medium || attrs.posterImage?.original || "/fallback-cover.jpg",
        description: attrs.description || attrs.synopsis || "No description available.",
      };
    });
    return res.json({ success: true, source: "zyla", data: mapped });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch fallback manga from Kitsu");
  }
};

const getZylaMangaById = async (req, res) => {
  try {
    const key = process.env.ZYLA_API_KEY;
    const { id } = req.params;
    if (key) {
      const data = await requestJson(
        `https://zylalabs.com/api/1760/anime+manga+and+novel+discovery+api/1376/fetch+manga+by+id`,
        {
          params: { id },
          headers: { Authorization: `Bearer ${key}` },
        }
      );
      return res.json({ success: true, source: "zyla", data });
    }

    // Fallback to Kitsu API (Free)
    console.log("No ZYLA_API_KEY found, falling back to Kitsu API for Zyla manga details");
    const kitsuItem = await requestJson(`https://kitsu.io/api/edge/manga/${id}`);
    const item = kitsuItem.data || {};
    const attrs = item.attributes || {};
    const mapped = {
      id: item.id,
      title: attrs.canonicalTitle || attrs.titles?.en || attrs.titles?.en_jp || "Untitled",
      author: "Various Authors",
      genre: "Manga",
      cover_image: attrs.posterImage?.medium || attrs.posterImage?.original || "/fallback-cover.jpg",
      description: attrs.description || attrs.synopsis || "No description available.",
    };
    return res.json({ success: true, source: "zyla", data: mapped });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch fallback manga details from Kitsu");
  }
};

const getZylaNovels = async (req, res) => {
  try {
    const key = process.env.ZYLA_API_KEY;
    if (key) {
      const data = await requestJson(
        `https://zylalabs.com/api/1760/anime+manga+and+novel+discovery+api/1379/fetch+novels`,
        {
          params: req.query,
          headers: { Authorization: `Bearer ${key}` },
        }
      );
      return res.json({ success: true, source: "zyla", data });
    }

    // Fallback to Open Library subjects (Free)
    console.log("No ZYLA_API_KEY found, falling back to Open Library for Zyla novels");
    const olResponse = await requestJson("https://openlibrary.org/subjects/fiction.json?limit=20");
    const works = olResponse.works || [];
    const mapped = works.map(work => {
      const coverId = work.cover_id;
      const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop";
      const authorName = work.authors?.map(a => a.name).join(", ") || "Various Authors";
      return {
        id: work.key ? work.key.replace(/^\/?works\//, "") : work.id,
        title: work.title || "Untitled Novel",
        author: authorName,
        genre: work.subject?.[0] || "Fiction",
        genres: work.subject || ["Fiction"],
        cover_image: coverUrl,
        description: work.first_publish_year ? `First published in ${work.first_publish_year}.` : "No description available.",
      };
    });
    return res.json({ success: true, source: "zyla", data: mapped });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch fallback novels from Open Library");
  }
};

const getZylaNovelById = async (req, res) => {
  try {
    const key = process.env.ZYLA_API_KEY;
    const { id } = req.params;
    if (key) {
      const data = await requestJson(
        `https://zylalabs.com/api/1760/anime+manga+and+novel+discovery+api/1380/fetch+novels+by+id`,
        {
          params: { id },
          headers: { Authorization: `Bearer ${key}` },
        }
      );
      return res.json({ success: true, source: "zyla", data });
    }

    // Fallback to Open Library work details (Free)
    console.log("No ZYLA_API_KEY found, falling back to Open Library for Zyla novel details");
    const work = await requestJson(`https://openlibrary.org/works/${id}.json`);
    const desc = typeof work.description === 'string' ? work.description : (work.description?.value || 'No description available.');
    const coverId = work.covers?.[0];
    const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop";
    const mapped = {
      id: work.key ? work.key.replace(/^\/?works\//, "") : work.id,
      title: work.title || "Untitled Novel",
      author: "Various Authors",
      genre: "Fiction",
      cover_image: coverUrl,
      description: desc,
    };
    return res.json({ success: true, source: "zyla", data: mapped });
  } catch (error) {
    return sendExternalError(res, error, "Failed to fetch fallback novel details from Open Library");
  }
};

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
