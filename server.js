// server.js
// API de votos globales (Express). Guarda en poll_totals.json.
// (Opcional) sirve el frontend desde /public si existe.

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());        // permitir llamadas desde GitHub Pages u otros orígenes
app.use(express.json());

// === (opcional) servir frontend si subís /public junto al server ===
const PUBLIC_DIR = path.join(__dirname, 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
}

// === Persistencia simple (archivo JSON) ===
const DATA_FILE = path.join(__dirname, 'poll_totals.json');
const DEFAULT_TOTALS = { op1: 0, op2: 0, op3: 0, op4: 0 };

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_TOTALS, null, 2));
  }
}
function readTotals() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const obj = JSON.parse(raw);
    for (const k of Object.keys(DEFAULT_TOTALS)) {
      if (typeof obj[k] !== 'number') obj[k] = 0;
    }
    return obj;
  } catch {
    return { ...DEFAULT_TOTALS };
  }
}
function writeTotals(totals) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(totals, null, 2));
}

// === API ===
app.get('/api/poll/totals', (req, res) => {
  res.json(readTotals());
});

app.post('/api/poll/vote', (req, res) => {
  const { optionId } = req.body || {};
  if (!['op1','op2','op3','op4'].includes(optionId)) {
    return res.status(400).json({ error: 'optionId inválido' });
  }
  const totals = readTotals();
  totals[optionId] = (totals[optionId] || 0) + 1;
  writeTotals(totals);
  res.json({ ok: true, totals });
});

// === Lanzar ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API lista en http://localhost:${PORT}`);
});
