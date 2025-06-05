# 📦 Data Ingestion API System

A priority-based, batch-processing data ingestion system using Node.js (Express).  
It simulates processing external API data with strict rate limits and priority handling.

---

## 🔧 Features

- **POST `/ingest`** – Accepts a list of IDs and a priority level (HIGH, MEDIUM, LOW).
- **GET `/status/:ingestion_id`** – Returns status of the ingestion request and each batch.
- Processes data in **batches of 3 IDs**.
- Enforces **1 batch per 5 seconds** rate limit.
- Respects **priority (HIGH > MEDIUM > LOW)** and **request time**.
- Simulated API call for each ID with 1-second delay.

---

## 🚀 Getting Started
 1. Clone the repository

git clone https://github.com/yourusername/data-ingestion-api.git
cd data-ingestion-api
2. Install dependencies

npm install
3. Run the server

node index.js
Server will start at: http://localhost:5000
