const express = require("express");
const { getAllStories, getStory } = require("../controllers/stories.controller");

const StoryRouter = express.Router();

// GET /api/stories
StoryRouter.get("/", getAllStories);
StoryRouter.get("/:id", getStory);

module.exports = StoryRouter;