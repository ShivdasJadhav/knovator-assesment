// socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // 👈 or your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected to Socket.IO");
  });
};

export const emitImportUpdate = (data) => {
  if (io) {
    console.log("📡 Emitted import-update", data);
    io.emit("import-update", data);
  }
};
