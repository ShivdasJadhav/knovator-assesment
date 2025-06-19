// client/lib/socket.js
import { io } from "socket.io-client";

let socket;

export function initSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket.io server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket.io server");
    });
  }

  return socket;
}
