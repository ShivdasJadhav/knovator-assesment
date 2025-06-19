import cron from "node-cron";
import { fetchAndStoreJobs } from "../services/job.service.js";

export const startJobImportCron = () => {
  // Schedule: every hour at minute 0 (e.g., 12:00, 1:00, 2:00, etc.)
  cron.schedule("0 * * * *", async () => {
    console.log(`[CRON] Starting job import at ${new Date().toISOString()}`);

    try {
      const result = await fetchAndStoreJobs();
      console.log(`[CRON] Import complete:`, result);
    } catch (err) {
      console.error(`[CRON] Import failed:`, err);
    }
  });

  console.log("[CRON] Job import cron started — running every hour.");
};
