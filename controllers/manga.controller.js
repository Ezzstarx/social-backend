const axios = require("axios");

const Manga = require("../models/Manga");
const MangaEpisode = require("../models/MangaEpisode");
const User = require("../models/User");


const getMangaList = async (req, res) => {
  try {
    const baseURL = "https://api.mangadex.org/manga";

    const params = {
      ...req.query,
      "includes[]": ["cover_art", "author", "artist"],
    };

    // Default content rating
    if (!req.query["contentRating[]"]) {
      params["contentRating[]"] = ["safe", "suggestive"];
    }

    const response = await axios.get(baseURL, { params });

    const data = response.data;

    // Add coverUrl
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
            : null
        };
      }),
    };

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
      headers: {
        Referer: "https://mangadex.org/"
      }
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cover",
      error: err.message
    });
  }
};


/* =====================================================
   🧠 YOUR PLATFORM (DB Manga System)
===================================================== */

// POST /api/manga/create
const createManga = async (req, res) => {
  try {
    const {
      title,
      description,
      coverImage,
      genres,
      author
    } = req.body;

    const manga = await Manga.create({
      title,
      description,
      coverImage,
      genres,
      author
    });

    await User.findByIdAndUpdate(author, {
      $inc: { totalManga: 1 }
    });

    res.status(201).json({
      success: true,
      data: manga
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET /api/manga/user/:userId
const getUserManga = async (req, res) => {
  try {
    const manga = await Manga.find({ author: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: manga
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET /api/manga/:id
const getMangaById = async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id);

    if (!manga) {
      return res.status(404).json({
        success: false,
        message: "Manga not found"
      });
    }

    res.json({
      success: true,
      data: manga
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// POST /api/manga/:id/episode
const addEpisode = async (req, res) => {
  try {
    const mangaId = req.params.id;

    const {
      title,
      episodeNumber,
      pages
    } = req.body;

    const episode = await MangaEpisode.create({
      manga: mangaId,
      title,
      episodeNumber,
      pages
    });

    await Manga.findByIdAndUpdate(mangaId, {
      $inc: { totalEpisodes: 1 }
    });

    res.status(201).json({
      success: true,
      data: episode
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET /api/manga/:id/episodes
const getEpisodes = async (req, res) => {
  try {
    const episodes = await MangaEpisode.find({
      manga: req.params.id
    }).sort({ episodeNumber: 1 });

    res.json({
      success: true,
      data: episodes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  // MangaDex
  getMangaList,
  getCoverProxy,

  // DB system
  createManga,
  getUserManga,
  getMangaById,
  addEpisode,
  getEpisodes
};