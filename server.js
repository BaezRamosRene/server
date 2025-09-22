// server.js (mínimo para probar Render)
const express = require('express');

const app = express();

app.get('/api/poll/totals', (req, res) => {
  res.json({ op1: 0, op2: 0, op3: 0, op4: 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API lista en http://localhost:${PORT}`);
});
