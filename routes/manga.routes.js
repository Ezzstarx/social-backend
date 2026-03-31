const express = require("express");
const { getMangaList, getCoverProxy } = require("../controllers/manga.controller");

const MangaRouter = express.Router();

// GET /api/manga
MangaRouter.get("/", getMangaList);
MangaRouter.get("/cover", getCoverProxy);

module.exports = MangaRouter;