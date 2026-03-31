const express = require("express");
const cors = require("cors");
const mangaRoutes = require("./routes/manga.routes");
const storiesRoutes = require("./routes/stories.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/manga", mangaRoutes);
app.use("/api/stories", storiesRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Manga API");
});

// ❌ REMOVE app.listen()
// ✅ Export instead
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});