const express = require("express");
const { getMangaList, getCoverProxy } = require("../controllers/manga.controller");

const router = express.Router();

// GET /api/manga
router.get("/", getMangaList);
router.get("/cover", getCoverProxy);


module.exports = router;