const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.sqlite"); // In-memory database for simplicity

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    publicKey TEXT,
    metadata TEXT
  )`);
});

module.exports = db;
