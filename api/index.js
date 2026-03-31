const express = require("express");
const cors = require("cors");
const MangaRouter = require("../routes/manga.routes");
const StoryRouter = require("../routes/stories.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/manga", MangaRouter);
app.use("/api/stories", StoryRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Manga API");
});

// ❌ REMOVE app.listen()
// ✅ Export instead
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});