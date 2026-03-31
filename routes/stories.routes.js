const express = require("express");
const { getAllStories, getStory } = require("../controllers/stories.controller");

const router = express.Router();

// GET /api/stories
router.get("/", getAllStories);
router.get("/:id", getStory);

module.exports = router;