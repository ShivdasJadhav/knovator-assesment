import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // ✅ Required by BullMQ
});

export const jobQueue = new Queue('job-import-queue', {
  connection,
});
