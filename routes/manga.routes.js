const express = require("express");
const {
  getMangaList,
  getCoverProxy,
  createManga,
  getMangaById,
  getUserManga,
  addEpisode,
  getEpisodes,
  getMangaByIdMangaDex,
  getChaptersByMangaId,
  getChapterPages,
  searchManga,
} = require("../controllers/manga.controller");

const MangaRouter = express.Router();

/* ---------------------------
   🔍 HYBRID SEARCH
----------------------------*/
MangaRouter.get("/search", searchManga);

/* ---------------------------
   🌐 MangaDex (external API)
----------------------------*/
MangaRouter.get("/", getMangaList);                     // List/explore
MangaRouter.get("/cover", getCoverProxy);               // Cover image proxy
MangaRouter.get("/external/:id", getMangaByIdMangaDex); // MangaDex manga details
MangaRouter.get("/external/:id/chapters", getChaptersByMangaId); // Chapters list
MangaRouter.get("/chapter/:id/pages", getChapterPages); // Chapter pages

/* ---------------------------
   🧠 Your Platform (DB manga)
----------------------------*/
MangaRouter.post("/create", createManga);               // Create manga
MangaRouter.get("/user/:userId", getUserManga);        // Get user's manga
MangaRouter.get("/:id", getMangaById);                 // Platform manga by ID
MangaRouter.post("/:id/episode", addEpisode);          // Add episode to platform manga
MangaRouter.get("/:id/episodes", getEpisodes);         // Get episodes of platform manga

module.exports = MangaRouter;