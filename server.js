const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");

// 🔹 Routes
const mangaRoutes = require("./routes/manga.routes");
const storiesRoutes = require("./routes/stories.routes");
const authRoutes = require("./routes/auth.routes"); // if using OAuth/JWT
const eventRoutes = require('./routes/event.routes');
const gistRoutes = require('./routes/gist.routes');

// 🔹 App init
const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// 🔹 Routes
app.use("/api/manga", mangaRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gist', gistRoutes);

// 🔹 Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Manga API 🚀");
});

// 🔹 Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});