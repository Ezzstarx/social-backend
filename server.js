const express = require("express");
const cors = require("cors");
const passport = require("passport");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
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

// 🆕 Ezzstar platform extension routes registration
app.use('/api/onboarding', require('./routes/onboarding.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/xp', require('./routes/xp.routes'));
app.use('/api/gists', require('./routes/gists.routes'));
app.use('/api/views', require('./routes/engagement.routes'));
app.use('/api/comments', require('./routes/engagement.routes'));
app.use('/api/shares', require('./routes/engagement.routes'));
app.use('/api/reactions', require('./routes/engagement.routes'));
app.use('/api/tips', require('./routes/tips.routes'));
app.use('/api/boosts', require('./routes/boosts.routes'));
app.use('/api/tournaments', require('./routes/tournaments.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/feed', require('./routes/feed.routes'));

// 🔹 Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Manga API 🚀");
});

// 💾 MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ezzstar")
  .then(() => console.log("💾 Connected to MongoDB successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🔹 Start server with Socket.io attachment
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173" } });
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  if (userId) socket.join(userId);
});

// Initialize the socket manager
require("./services/socket").setIO(io);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.server = server;
module.exports.io = io;
