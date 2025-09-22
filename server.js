// server.js
// Servidor Express + almacenamiento en JSON (sin base de datos).
// Sirve la web y expone la API para totales y votos.
const express = require('express');
const cors = require('cors');
// ...
app.use(cors());        // <— agregar
app.use(express.json());
// app.use(express.static(PUBLIC_DIR)); // opcional si servís el HTML desde el mismo Render



const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());

// === Static ===
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// === Datos (JSON simple) ===
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
    // asegurar todas las claves
    for (const k of Object.keys(DEFAULT_TOTALS)) {
      if (typeof obj[k] !== 'number') obj[k] = 0;
    }
    return obj;
  } catch (e) {
    return { ...DEFAULT_TOTALS };
  }
}
function writeTotals(totals) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(totals, null, 2));
}

// === API ===
app.get('/api/poll/totals', (req, res) => {
  const totals = readTotals();
  res.json(totals);
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
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Abrí esa URL en tu navegador.`);
});
