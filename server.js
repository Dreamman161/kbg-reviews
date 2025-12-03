// the fog is coming (unsichtbares Easter Egg)
// (siehe ganz unten – in einem versteckten Kommentar)

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ======================
//   DATABASE
// ======================
const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER,
            text TEXT NOT NULL,
            rating INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// ======================
//   API ENDPOINTS
// ======================

// Alle Kommentare holen
app.get("/api/comments", (req, res) => {
    db.all(
        "SELECT * FROM comments ORDER BY created_at DESC",
        (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows);
        }
    );
});

// Kommentar erstellen
app.post("/api/comments", (req, res) => {
    const { text, rating, parent_id } = req.body;

    const stmt = db.prepare(`
        INSERT INTO comments (text, rating, parent_id)
        VALUES (?, ?, ?)
    `);

    stmt.run(text, rating, parent_id || null, function (err) {
        if (err) return res.status(500).json({ error: err });
        res.json({ id: this.lastID });
    });
});

// ======================
//   START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server läuft auf Port " + PORT));

/*
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀  the fog is coming
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
*/
