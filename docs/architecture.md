# 🏗️ Architecture Overview: Scalable Job Importer with Queue & Tracking

This document outlines the architecture of the scalable job import system built as part of the assessment. The system is modular, fault-tolerant, and extensible for future use cases like analytics or advanced filtering.

---

## ⚙️ High-Level Components

+---------------------+ +-----------------+
| External Job Feeds |-----> | Job Fetcher |
| (XML/RSS) | | (service.js) |
+---------------------+ +-----------------+
|
| 🔄 Normalized Job JSON
v
+------------------+
| Redis Queue |
| (BullMQ + Redis) |
+------------------+
|
+---------------------------------------------+
| |
v v
+------------------+ +---------------------+
| Worker Processor | | QueueEvents Monitor |
| (job.worker.js) | | (future extension) |
+------------------+ +---------------------+
|
| 🧠 Deduplication + Upsert to DB
v
+--------------------+
| MongoDB: jobs |
+--------------------+
|
| 🧾 Import Summary Stats
v
+------------------------+
| MongoDB: `import_logs` |
+------------------------+
|
| 📡 Real-time update (emit)
v
+--------------------+
| Admin UI (Next.js) |
+--------------------+

---

## 🧩 Components Description

### 1. **Job Fetcher (`fetchAndStoreJobs`)**

- Runs every hour (via `node-cron`)
- Fetches job data from multiple RSS/XML feeds
- Parses XML → JSON using `xml2js`
- Normalizes the structure to a consistent schema
- Pushes jobs to the Redis-backed BullMQ queue
- Logs metadata (`feedUrl`, `timestamp`, `totalFetched`) before queuing

---

### 2. **Queue & Worker (`BullMQ` + `job.worker.js`)**

- Uses BullMQ with Redis for background processing
- Each job in the queue contains job details + import metadata
- Worker performs:

  - `upsert` to avoid duplicates
  - `diff-check` to skip unchanged documents
  - Tracks:
    - `insertCount`
    - `updateCount`
    - `failedJobs`

- Once all jobs from a feed are processed, a summary log is pushed to the `import_logs` collection

---

### 3. **Import Log Summary (`import_logs` collection)**

Stores full metadata of each import:

| Field           | Description                   |
| --------------- | ----------------------------- |
| `feedUrl`       | Source of the feed            |
| `timestamp`     | Time when import started      |
| `totalFetched`  | Jobs parsed from feed         |
| `newJobs`       | Freshly inserted into DB      |
| `updatedJobs`   | Existing jobs updated         |
| `failedJobs`    | Failed job saves with reasons |
| `totalImported` | Sum of new + updated jobs     |

---

### 4. **Real-Time Monitoring (`Socket.IO`)**

- Worker emits `import-update` event after each import
- Admin dashboard listens to `import-update`
- Updates the table **in real-time**, avoiding page refreshes

---

## 🧠 Design Decisions

| Area             | Decision                                                              |
| ---------------- | --------------------------------------------------------------------- |
| Queueing         | BullMQ chosen over Bull for better structure and TypeScript support   |
| Real-time        | Socket.IO used instead of SSE for future bi-directional communication |
| Deduplication    | `jobId` field ensures uniqueness (based on `id` or `source-title`)    |
| Update Check     | Document field comparison to skip unnecessary updates                 |
| Logging Strategy | Push job logs into memory → batch log into MongoDB once per import    |
| Resilience       | Retry + exponential backoff enabled via BullMQ settings               |

---

## 📦 Tech Stack & Integrations

| Area       | Technology             |
| ---------- | ---------------------- |
| Parser     | `xml2js`               |
| Queue      | `bullmq`, `Redis`      |
| Database   | `MongoDB` + Mongoose   |
| Real-Time  | `Socket.IO`            |
| Backend    | Express (ESM)          |
| Frontend   | Next.js 15             |
| Styling    | Tailwind CSS           |
| Scheduling | `node-cron`            |
| Dev Tools  | Docker (Redis), dotenv |

---

## 🔁 Retry & Backoff Strategy

```js
await jobQueue.add("save-job", jobData, {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000, // Starts at 2s
  },
});
```

### 🧪 Testing Strategy

Local test via node 
```bash 
services/test-fetch.js
```

UI updated live after worker finishes job + emits summary

import_logs inspected via MongoDB Compass or UI

Retry scenarios tested with simulated failures