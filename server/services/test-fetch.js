import mongoose from "mongoose";
import { fetchAndStoreJobs } from "./job.service.js";
import { config } from "dotenv";
config();
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await fetchAndStoreJobs();
    console.log("Import summary:", result);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
