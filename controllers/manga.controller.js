const mongoose = require("mongoose");
const axios = require("axios");
const Manga = require("../models/Manga");
const MangaEpisode = require("../models/MangaEpisode");
const User = require("../models/User");

// In-memory cache
let cachedMangaList = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// In-memory cache for top10
let cachedTop10 = null;
let lastTop10Fetch = 0;
const TOP10_TTL = 6 * 60 * 60 * 1000; // 6 hours

const getMangaTop = async (req, res) => {
  try {
    // Serve from cache if fresh
    if (cachedTop10 && (Date.now() - lastTop10Fetch) < TOP10_TTL) {
      console.log('Serving cached top10 manga');
      return res.status(200).json(cachedTop10);
    }

    const baseURL = "https://api.mangadex.org/manga";
    const params = {
      limit: 10,
      "order[followedCount]": "desc",
      "includes[]": ["cover_art", "author", "artist"],
      "contentRating[]": ["safe", "suggestive", "erotica", "pornographic"], // adjust as needed
    };

    const response = await axios.get(baseURL, { params });
    const data = response.data;

    const transformedData = {
      ...data,
      data: data.data.map((manga) => {
        const coverArt = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );
        const coverFileName = coverArt?.attributes?.fileName;
        return {
          ...manga,
          coverUrl: coverFileName
            ? `/api/manga/cover?mangaId=${manga.id}&fileName=${coverFileName}`
            : null,
        };
      }),
    };

    // Store in cache
    cachedTop10 = transformedData;
    lastTop10Fetch = Date.now();

    res.status(200).json(transformedData);
  } catch (error) {
    console.error("Top10 API error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top manga",
      error: error.message,
    });
  }
};

const getMangaList = async (req, res) => {
  try {
    // Serve from cache if still fresh
    if (cachedMangaList && (Date.now() - lastFetchTime) < CACHE_TTL_MS) {
      console.log('Serving cached manga list');
      return res.status(200).json(cachedMangaList);
    }

    const baseURL = "https://api.mangadex.org/manga";
    const params = {
      ...req.query,
      "includes[]": ["cover_art", "author", "artist"],
    };
    if (!req.query["contentRating[]"]) {
      params["contentRating[]"] = ["safe", "suggestive"];
    }

    const response = await axios.get(baseURL, { params });
    const data = response.data;

    const transformedData = {
      ...data,
      data: data.data.map((manga) => {
        const coverArt = manga.relationships.find(
          (rel) => rel.type === "cover_art"
        );
        const coverFileName = coverArt?.attributes?.fileName;
        return {
          ...manga,
          coverUrl: coverFileName
            ? `/api/manga/cover?mangaId=${manga.id}&fileName=${coverFileName}`
            : null,
        };
      }),
    };

    // Store in cache
    cachedMangaList = transformedData;
    lastFetchTime = Date.now();

    res.status(200).json(transformedData);
  } catch (error) {
    console.error("Manga API error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manga",
      error: error.message,
    });
  }
};

// GET /api/manga/cover
const getCoverProxy = async (req, res) => {
  try {
    const { mangaId, fileName } = req.query;
    if (!mangaId || !fileName) {
      return res.status(400).json({ message: "Missing params" });
    }
    const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    const response = await axios.get(imageUrl, {
      responseType: "stream",
      headers: { Referer: "https://mangadex.org/" },
    });
    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cover",
      error: err.message,
    });
  }
};

// GET /api/manga/external/:id (MangaDex manga details)
const getMangaByIdMangaDex = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.mangadex.org/manga/${id}`, {
      params: { "includes[]": ["cover_art", "author", "artist"] },
    });
    const manga = response.data.data;
    const coverArt = manga.relationships.find((rel) => rel.type === "cover_art");
    const coverFileName = coverArt?.attributes?.fileName;
    const transformed = {
      ...manga,
      coverUrl: coverFileName
        ? `/api/manga/cover?mangaId=${manga.id}&fileName=${coverFileName}`
        : null,
    };
    res.json(transformed);
  } catch (err) {
    console.error("MangaDex detail error:", err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: "Failed to fetch manga details",
      error: err.message,
    });
  }
};

// GET /api/manga/external/:id/chapters
const getChaptersByMangaId = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0, translatedLanguage = ["en"] } = req.query;
    const response = await axios.get(`https://api.mangadex.org/manga/${id}/feed`, {
      params: {
        "translatedLanguage[]": Array.isArray(translatedLanguage)
          ? translatedLanguage
          : [translatedLanguage],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: { chapter: "desc" },
        "includes[]": ["scanlation_group"],
      },
    });
    const chapters = response.data.data.map((ch) => ({
      id: ch.id,
      chapter: ch.attributes.chapter,
      title: ch.attributes.title,
      pages: ch.attributes.pages,
      volume: ch.attributes.volume,
      publishAt: ch.attributes.publishAt,
      createdAt: ch.attributes.createdAt,
      externalUrl: ch.attributes.externalUrl,
    }));
    res.json({
      success: true,
      total: response.data.total,
      limit: response.data.limit,
      offset: response.data.offset,
      data: chapters,
    });
  } catch (err) {
    console.error("Chapters error:", err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: "Failed to fetch chapters",
      error: err.message,
    });
  }
};

// GET /api/manga/chapter/:id/pages
const getChapterPages = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.mangadex.org/at-home/server/${id}`, {
      headers: {
        "Referer": "https://mangadex.org/",
        "User-Agent": "YourMangaApp/1.0 (contact@yourapp.com)" // optional but good practice
      }
    });
    const { baseUrl, chapter } = response.data;
    const { hash, data, dataSaver } = chapter;
    const pages = data.map((filename) => `${baseUrl}/data/${hash}/${filename}`);
    const pagesDataSaver = dataSaver.map(
      (filename) => `${baseUrl}/data-saver/${hash}/${filename}`
    );
    res.json({
      success: true,
      chapterId: id,
      baseUrl,
      hash,
      pages,
      pagesDataSaver,
    });
  } catch (err) {
    console.error("Chapter pages error:", err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: "Failed to fetch chapter pages",
      error: err.message,
    });
  }
};

/* =====================================================
   🧠 YOUR PLATFORM (DB Manga System)
===================================================== */

// POST /api/manga/create
const createManga = async (req, res) => {
  try {
    const { title, description, coverImage, genres, author } = req.body;
    const manga = await Manga.create({
      title,
      description,
      coverImage,
      genres,
      author,
    });
    await User.findByIdAndUpdate(author, { $inc: { totalManga: 1 } });
    res.status(201).json({ success: true, data: manga });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/manga/user/:userId
const getUserManga = async (req, res) => {
  try {
    const manga = await Manga.find({ author: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: manga });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/manga/:id (platform manga by ID)
const getMangaById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Manga not found" });
    }
    const manga = await Manga.findById(req.params.id).populate("author", "username profilePic");
    if (!manga) {
      return res.status(404).json({ success: false, message: "Manga not found" });
    }
    res.json({ success: true, data: manga });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/manga/:id/episode
const addEpisode = async (req, res) => {
  try {
    const mangaId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(mangaId)) {
      return res.status(404).json({ success: false, message: "Manga not found" });
    }
    const { title, episodeNumber, pages } = req.body;
    const episode = await MangaEpisode.create({
      manga: mangaId,
      title,
      episodeNumber,
      pages,
    });
    await Manga.findByIdAndUpdate(mangaId, { $inc: { totalEpisodes: 1 } });
    res.status(201).json({ success: true, data: episode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/manga/:id/episodes
const getEpisodes = async (req, res) => {
  try {
    const mangaId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(mangaId)) {
      return res.json({ success: true, data: [] });
    }
    const episodes = await MangaEpisode.find({ manga: mangaId }).sort({
      episodeNumber: 1,
    });
    res.json({ success: true, data: episodes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   🔍 HYBRID SEARCH (Platform + MangaDex)
===================================================== */

const searchManga = async (req, res) => {
  try {
    const { q, limit = 20, source = "both" } = req.query;
    const intLimit = parseInt(limit);

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    let results = [];

    // 1. Search in your own database
    if (source === "platform" || source === "both") {
      const internalResults = await Manga.find({
        title: { $regex: q, $options: "i" },
      })
        .limit(intLimit)
        .populate("author", "username profilePic")
        .lean();

      const formattedInternal = internalResults.map((manga) => ({
        id: manga._id.toString(),
        title: manga.title,
        description: manga.description,
        coverUrl: manga.coverImage,
        author: manga.author?.username || "Unknown",
        genres: manga.genres,
        status: manga.status,
        views: manga.views,
        rating: manga.rating,
        source: "platform",
        isPlatform: true,
        imageUrl: manga.coverImage,
      }));
      results.push(...formattedInternal);
    }

    // 2. Search in MangaDex
    if (source === "mangadex" || source === "both") {
      try {
        const mangaDexRes = await axios.get("https://api.mangadex.org/manga", {
          params: {
            title: q,
            limit: intLimit,
            "includes[]": ["cover_art", "author", "artist"],
            "contentRating[]": ["safe", "suggestive"],
            order: { relevance: "desc" },
          },
        });

        const externalResults = mangaDexRes.data.data.map((manga) => {
          const coverArt = manga.relationships.find(
            (rel) => rel.type === "cover_art"
          );
          const coverFileName = coverArt?.attributes?.fileName;
          const authorRel = manga.relationships.find(
            (rel) => rel.type === "author"
          );
          const authorName = authorRel?.attributes?.name || "Unknown";
          const title =
            manga.attributes.title.en ||
            Object.values(manga.attributes.title)[0];
          return {
            id: manga.id,
            title: title,
            description: manga.attributes.description?.en || "No description",
            coverUrl: coverFileName
              ? `/api/manga/cover?mangaId=${manga.id}&fileName=${coverFileName}`
              : null,
            author: authorName,
            genres: manga.attributes.tags
              .filter((t) => t.attributes.group === "genre")
              .map((t) => t.attributes.name.en),
            status: manga.attributes.status,
            source: "mangadex",
            isPlatform: false,
            imageUrl: coverFileName
              ? `/api/manga/cover?mangaId=${manga.id}&fileName=${coverFileName}`
              : null,
          };
        });
        results.push(...externalResults);
      } catch (err) {
        console.error("MangaDex search error:", err.message);
        // Do not fail the whole request
      }
    }

    // 3. Sorting: platform first, then alphabetically
    if (source === "both") {
      results.sort((a, b) => {
        if (a.source === "platform" && b.source !== "platform") return -1;
        if (a.source !== "platform" && b.source === "platform") return 1;
        return a.title.localeCompare(b.title);
      });
      results = results.slice(0, intLimit);
    }

    res.json({
      success: true,
      query: q,
      source,
      total: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search manga",
      error: error.message,
    });
  }
};

/* =====================================================
   EXPORT
===================================================== */
module.exports = {
  // MangaDex
  getMangaList,
  getMangaTop,
  getCoverProxy,
  getMangaByIdMangaDex,
  getChaptersByMangaId,
  getChapterPages,
  // Platform DB
  createManga,
  getUserManga,
  getMangaById,
  addEpisode,
  getEpisodes,
  // Hybrid search
  searchManga,
};