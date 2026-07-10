let io;

const initializeSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  socket.on("joinWorkspace", (workspaceId) => {

    socket.join(workspaceId);

    console.log(
      `${socket.id} joined workspace ${workspaceId}`
    );

  });

  socket.on("disconnect", () => {

    console.log(
      "Disconnected:",
      socket.id
    );

  });

});
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};