// index.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

const PORT = 5000;

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const queues = {
  HIGH: [],
  MEDIUM: [],
  LOW: []
};

const ingestions = new Map();
let taskRunning = false;

class Batch {
  constructor(ids) {
    this.batch_id = uuidv4();
    this.ids = ids;
    this.status = 'yet_to_start';
  }
}

class Ingestion {
  constructor(id, batches) {
    this.ingestion_id = id;
    this.status = 'yet_to_start';
    this.batches = batches;
  }
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function processBatches() {
  if (taskRunning) return;
  taskRunning = true;

  while (queues.HIGH.length || queues.MEDIUM.length || queues.LOW.length) {
    for (const priority of PRIORITIES) {
      if (queues[priority].length) {
        const { ingestion_id, batch } = queues[priority].shift();
        batch.status = 'triggered';
        const ingestion = ingestions.get(ingestion_id);
        ingestion.status = 'triggered';

        await sleep(5000); // 5 second rate limit

        for (const id of batch.ids) {
          await sleep(1000); // simulate API call
          console.log({ id, data: 'processed' });
        }

        batch.status = 'completed';

        if (ingestion.batches.every(b => b.status === 'completed')) {
          ingestion.status = 'completed';
        }
      }
    }
  }

  taskRunning = false;
}

app.post('/ingest', (req, res) => {
  const { ids, priority } = req.body;
  if (!ids || !Array.isArray(ids) || !PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const ingestion_id = uuidv4();
  const batches = [];

  for (let i = 0; i < ids.length; i += 3) {
    const batch = new Batch(ids.slice(i, i + 3));
    batches.push(batch);
    queues[priority].push({ ingestion_id, batch });
  }

  ingestions.set(ingestion_id, new Ingestion(ingestion_id, batches));
  processBatches();

  res.json({ ingestion_id });
});

app.get('/status/:ingestion_id', (req, res) => {
  const ingestion = ingestions.get(req.params.ingestion_id);
  if (!ingestion) return res.status(404).json({ error: 'Ingestion ID not found' });

  res.json({
    ingestion_id: ingestion.ingestion_id,
    status: ingestion.status,
    batches: ingestion.batches.map(b => ({
      batch_id: b.batch_id,
      ids: b.ids,
      status: b.status
    }))
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
