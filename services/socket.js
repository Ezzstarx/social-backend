let io = null;

module.exports = {
  setIO: (socketIo) => {
    io = socketIo;
  },
  getIO: () => io,
  notifyUser: (userId, notification) => {
    if (io) {
      io.to(userId.toString()).emit("notification", notification);
    }
  },
};
