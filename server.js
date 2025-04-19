const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = "opak_secret_token_2024";

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    shift TEXT,
    machine TEXT,
    boxes INTEGER,
    area REAL,
    workTime REAL,
    downtime REAL,
    reason TEXT
  )
`);

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Brak tokena" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Nieprawidłowy token" });
    req.user = decoded;
    next();
  });
}

app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === "opak2024") {
    const token = jwt.sign({ user: "admin" }, SECRET, { expiresIn: "7d" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Błędne hasło" });
  }
});

app.post("/api/records", verifyToken, (req, res) => {
  const { date, shift, machine, boxes, area, workTime, downtime, reason } = req.body;
  const stmt = db.prepare("INSERT INTO records (date, shift, machine, boxes, area, workTime, downtime, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(date, shift, machine, boxes, area, workTime, downtime, reason, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, ...req.body });
  });
});

app.get("/api/records", verifyToken, (req, res) => {
  db.all("SELECT * FROM records ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`API działa na http://localhost:${PORT}`);
});
