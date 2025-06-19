import { Worker } from "bullmq";
import mongoose from "mongoose";
import dotenv from "dotenv";
import IORedis from "ioredis";

import Job from "../models/job.model.js";
import ImportLog from "../models/importLog.model.js";
import { emitImportUpdate } from "../socket.js"; // Ensure path is correct

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected (Worker)");

// Redis connection
const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null, // Required for BullMQ
  }
);

// 🧠 In-memory map to track per-feed stats
const jobStats = new Map();

const worker = new Worker(
  "job-import-queue",
  async (job) => {
    const { name, data } = job;

    if (name === "save-job") {
      const { feedUrl, importTime, ...jobData } = data;
      const key = `${feedUrl}_${importTime}`;

      if (!jobStats.has(key)) {
        jobStats.set(key, {
          insertCount: 0,
          updateCount: 0,
          failedJobs: [],
        });
      }

      try {
        const existing = await Job.findOne({ jobId: jobData.jobId });

        if (!existing) {
          await Job.create(jobData);
          jobStats.get(key).insertCount++;
          return { status: "inserted" };
        }

        // 🚀 Compare only changed fields (shallow)
        const changes = {};
        let changed = false;

        for (const field of Object.keys(jobData)) {
          if (
            typeof jobData[field] === "object" ||
            typeof existing[field] === "object"
          ) {
            continue;
          }
          if (jobData[field] !== existing[field]) {
            changes[field] = jobData[field];
            changed = true;
          }
        }

        if (changed) {
          await Job.updateOne({ jobId: jobData.jobId }, { $set: changes });
          jobStats.get(key).updateCount++;
          return { status: "updated" };
        }

        return { status: "unchanged" };
      } catch (err) {
        jobStats.get(key).failedJobs.push({
          jobId: jobData.jobId,
          reason: err.message,
        });
        throw err;
      }
    }

    if (name === "log-summary") {
      const {
        feedUrl,
        importTime,
        totalFetched,
        pushedToQueue = 0,
        failedJobs = [],
      } = data;
      const key = `${feedUrl}_${importTime}`;
      const stat = jobStats.get(key) || {
        insertCount: 0,
        updateCount: 0,
        failedJobs,
      };

      const importDoc = await ImportLog.create({
        feedUrl,
        timestamp: new Date(importTime),
        totalFetched,
        pushedToQueue,
        newJobs: stat.insertCount,
        updatedJobs: stat.updateCount,
        totalImported: stat.insertCount + stat.updateCount,
        failedJobs: [...stat.failedJobs, ...failedJobs],
        failedCount: (stat.failedJobs.length || 0) + (failedJobs.length || 0),
      });

      jobStats.delete(key);

      // ✅ Real-time emit
      emitImportUpdate(importDoc.toObject());

      return { status: "logged" };
    }
  },
  { connection }
);

console.log("[WORKER] Listening for jobs...");
