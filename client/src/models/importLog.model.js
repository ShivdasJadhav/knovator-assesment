import mongoose, { Schema, model, models } from "mongoose";

const ImportLogSchema = new Schema({
  feedUrl: String,
  timestamp: Date,
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedCount: Number,
  failedJobs: [{ jobId: String, reason: String }],
}, { timestamps: true });

export default models.ImportLog || model("ImportLog", ImportLogSchema);
