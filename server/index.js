import express from "express";
import { config } from "dotenv";
import { createServer } from "http"; // For Socket.IO
import cors from "cors";

import connectDB from "./utils/db.connect.js";
import { startJobImportCron } from "./cron/jobImport.cron.js";
import { initSocket } from "./socket.js"; // <-- Real-time integration

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Optional: Health check route
app.get("/", (req, res) => res.send("✅ Job Importer API is running"));

// Create raw HTTP server for Socket.IO
const httpServer = createServer(app);

// 🧠 Start DB + CRON + Socket.IO
httpServer.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`🔗 MongoDB connected`);
    startJobImportCron();
    console.log(`📅 Cron Job Started`);
    initSocket(httpServer); // 🎯 Enable socket listeners
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  } catch (error) {
    console.error(`❌ Error starting server: ${error.message}`);
  }
});
