const express = require("express");
const { getMangaList } = require("../controllers/manga.controller");

const router = express.Router();

// GET /api/manga
router.get("/", getMangaList);

module.exports = router;