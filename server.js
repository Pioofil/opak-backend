
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './records.db'
  },
  useNullAsDefault: true
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/records', async (req, res) => {
  try {
    const records = await db('records').select();
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    await db('records').insert(req.body);
    res.status(201).json({ message: 'Zapisano dane' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
