const express = require("express");

const {
  getMangaList,
  getCoverProxy
} = require("../controllers/manga.controller");

// 👉 NEW (your own platform controller)
const {
  createManga,
  getMangaById,
  getUserManga,
  addEpisode,
  getEpisodes
} = require("../controllers/manga.controller");

const MangaRouter = express.Router();

/* ---------------------------
   🌐 MangaDex (external API)
----------------------------*/

// GET /api/manga
MangaRouter.get("/", getMangaList);

// GET /api/manga/cover
MangaRouter.get("/cover", getCoverProxy);


/* ---------------------------
   🧠 Your Platform (DB manga)
----------------------------*/

// POST /api/manga/create
MangaRouter.post("/create", createManga);

// GET /api/manga/user/:userId
MangaRouter.get("/user/:userId", getUserManga);

// GET /api/manga/:id
MangaRouter.get("/:id", getMangaById);

// POST /api/manga/:id/episode
MangaRouter.post("/:id/episode", addEpisode);

// GET /api/manga/:id/episodes
MangaRouter.get("/:id/episodes", getEpisodes);

module.exports = MangaRouter;