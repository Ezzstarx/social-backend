const express = require("express");
const cors = require("cors");
const mangaRoutes = require("./routes/manga.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/manga", mangaRoutes);

app.get("/test", (req, res) => {
  res.send("Welcome to the Manga API");
});

// ❌ REMOVE app.listen()
module.exports = app;