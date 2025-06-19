import { Schema, model } from 'mongoose';

const ImportLogSchema = new Schema(
  {
    feedUrl: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },

    totalFetched: { type: Number, required: true },   // From feed
    pushedToQueue: { type: Number, required: true },  // Jobs pushed to Redis queue

    newJobs: { type: Number, default: 0 },            // Inserted
    updatedJobs: { type: Number, default: 0 },        // Updated
    totalImported: { type: Number, default: 0 },      // newJobs + updatedJobs

    failedJobs: [
      {
        jobId: String,
        reason: String,
      },
    ],
    failedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ImportLog = model('ImportLog', ImportLogSchema);
export default ImportLog;
