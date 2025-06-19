import axios from "axios";
import xml2js from "xml2js";

import { jobQueue } from "../queues/job.queue.js";

// schemas
import Job from "../models/job.model.js";
import ImportLog from "../models/importLog.model.js";

const parser = new xml2js.Parser({ explicitArray: false });

const FEED_URLS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

// Util to extract key fields from feed JSON
const normalizeJob = (item = {}, source) => {
  return {
    jobId: item.id || `${source}-${item.title}`,
    title: item.title || "",
    company:
      item["job_listing:company"] || item.author || item["dc:creator"] || "",
    description: item.description || item["content:encoded"] || "",
    location: item.location || item["job_listing:location"] || "Remote",
    link: item.link || "",
    category: item.category || "",
    type: item["job_listing:job_type"] || "",
    datePosted: item.pubDate ? new Date(item.pubDate) : new Date(),
  };
};

const fetchJobsFromFeed = async (url) => {
  try {
    const { data } = await axios.get(url);
    const json = await parser.parseStringPromise(data);

    const channel = json.rss?.channel;
    if (!channel || !channel.item) return [];

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];

    return items.map((item) => normalizeJob(item, url));
  } catch (err) {
    console.error(`❌ Error fetching from ${url}`, err.message);
    return [];
  }
};

const fetchAllJobs = async () => {
  const allJobs = [];

  for (const url of FEED_URLS) {
    const jobs = await fetchJobsFromFeed(url);
    allJobs.push(...jobs);
  }

  return allJobs;
};

const saveJobsToDB = async (jobs = []) => {
  let inserted = 0,
    updated = 0,
    failed = 0;

  for (const job of jobs) {
    try {
      const res = await Job.updateOne(
        { jobId: job.jobId },
        { $set: job },
        { upsert: true }
      );
      if (res.upsertedCount) inserted++;
      else if (res.modifiedCount) updated++;
    } catch (err) {
      console.error(`❌ Failed to save job ${job.jobId}: ${err.message}`);
      failed++;
    }
  }

  return { total: jobs.length, inserted, updated, failed };
};

// Export this to be used by cron or controller

const fetchAndStoreJobs = async () => {
  const summary = [];

  for (const feedUrl of FEED_URLS) {
    try {
      const items = await fetchJobsFromFeed(feedUrl); // normalized jobs
      let pushed = 0,
        failed = 0,
        failedJobs = [];

      const timestamp = new Date();

      for (const job of items) {
        try {
          await jobQueue.add('save-job', {
            ...job,
            feedUrl,
            importTime: timestamp,
          });
          pushed++;
        } catch (err) {
          failed++;
          failedJobs.push({
            jobId: job.jobId || 'UNKNOWN',
            reason: err.message || 'Queue add error',
          });
        }
      }

      // ✅ Add summary log job to the queue
      await jobQueue.add('log-summary', {
        feedUrl,
        importTime: timestamp,
        totalFetched: items.length,
        failedJobs,
      });

      summary.push({ feedUrl, totalFetched: items.length, pushed, failed });
    } catch (err) {
      console.error(`❌ Error fetching from ${feedUrl}:`, err.message);

      // Push a failed summary job to still log the issue
      await jobQueue.add('log-summary', {
        feedUrl,
        importTime: new Date(),
        totalFetched: 0,
        failedJobs: [{ jobId: 'N/A', reason: err.message }],
      });

      summary.push({
        feedUrl,
        totalFetched: 0,
        pushed: 0,
        failed: 0,
        error: err.message,
      });
    }
  }

  return summary;
};

export {
  fetchJobsFromFeed,
  fetchAllJobs,
  saveJobsToDB,
  normalizeJob,
  fetchAndStoreJobs,
};
