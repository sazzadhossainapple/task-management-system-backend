let io;

const setIO = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins; restrict this in production.
    },
  });

  // Handle connection events
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.io instance has not been initialized. Call setIO first."
    );
  }
  return io;
};

module.exports = { setIO, getIO };