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
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
// ✅ Export instead

module.exports = app;