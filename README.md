# 🚀 Scalable Job Importer with Queue Processing & History Tracking

A full-stack MERN application that imports job listings from multiple external XML feeds, processes them through a Redis-based queue, stores them in MongoDB, and provides real-time admin monitoring via a modern frontend.

---

## 📌 Features

### ✅ Core Functionality

- **XML Feed Integration**  
  Pulls job data from multiple RSS/XML feeds and parses them into structured JSON.

- **Queue-based Background Processing (BullMQ + Redis)**  
  Jobs are queued for background processing using `bullmq` for scalable and performant handling.

- **MongoDB Storage**  
  Clean and normalized job data is stored in a MongoDB collection with `upsert` logic to prevent duplication.

- **Import History Tracking**  
  A dedicated `import_logs` collection tracks every import attempt with:
  - `timestamp`
  - `feedUrl`
  - `totalFetched`
  - `newJobs`
  - `updatedJobs`
  - `failedJobs` (with reasons)

- **Admin UI**  
  View import history in a clean, sortable table built with Next.js and TailwindCSS.

---

## 💡 Bonus Implementations

- ✅ **Real-time Admin Panel**  
  Uses **Socket.IO** to instantly reflect new import logs without refreshing the page.

- ✅ **Retry & Backoff**  
  Automatic job retries on failure with exponential backoff (handled via `bullmq`).

- ✅ **Environment-Based Batch Size & Concurrency**  
  Batch size and concurrency limits are configurable via `.env` or `.env.local`.

---

## 🛠 Tech Stack

| Layer        | Tech                                           |
|--------------|------------------------------------------------|
| Frontend     | Next.js 15, Tailwind CSS, Socket.IO Client     |
| Backend      | Express.js, BullMQ, Node.js (ESM), Socket.IO   |
| Database     | MongoDB (Mongoose ODM)                         |
| Queue        | Redis + BullMQ                                 |
| Dev Tools    | Docker, dotenv, Postman, MongoDB Compass       |

---

## 🔧 Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/ShivdasJadhav/knovator-assesment.git

# For backend
cd server
npm install

# For frontend
cd ../client
npm install
```
### 2. Run with Docker (Redis)
```bash
docker run -d --name redis -p 6379:6379 redis
```

### 🚀 Start the App
Terminal 1: Backend Server
```bash
cd server
node index.js
```
Terminal 2: Job Worker
```bash
node queues/job.worker.js
```
Terminal 3: Frontend
```bash
cd client
npm run dev
```
📦 Trigger Manual Job Import
```bash
cd server
node services/test-fetch.js
```

🙌 Author
Shivdas Jadhav
📫 [LinkedIn](https://www.linkedin.com/in/shivdas-jadhav-7b8096210/) | ✉️ [Email](https://mailto:jshivdas07@gmail.com)