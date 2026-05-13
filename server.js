const express = require("express");
const cors = require("cors");

// 🔹 Routes
const mangaRoutes = require("./routes/manga.routes");
const storiesRoutes = require("./routes/stories.routes");
const authRoutes = require("./routes/auth.routes"); // if using OAuth/JWT
const eventRoutes = require('./routes/event.routes');

// 🔹 App init
const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Routes
app.use("/api/manga", mangaRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/events', eventRoutes);

// 🔹 Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Manga API 🚀");
});

// 🔹 Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});