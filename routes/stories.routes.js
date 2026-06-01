const express = require("express");
const { getAllStories, getStory } = require("../controllers/stories.controller");
const {
  getOpenLibraryStories,
  getOpenLibraryWork,
  getZylaNovels,
  getZylaNovelById,
} = require("../controllers/externalDiscovery.controller");

const StoryRouter = express.Router();

// GET /api/stories
StoryRouter.get("/openlibrary/search", getOpenLibraryStories);
StoryRouter.get("/openlibrary/work/:workId", getOpenLibraryWork);
StoryRouter.get("/zyla/novels", getZylaNovels);
StoryRouter.get("/zyla/novels/:id", getZylaNovelById);
StoryRouter.get("/", getAllStories);
StoryRouter.get("/:id", getStory);

module.exports = StoryRouter;
