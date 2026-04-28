import express from "express";
import db from "../db.js";

const router = express.Router({ mergeParams: true });

// GET all notes for a trip
router.get("/", (req, res) => {
  const { tripId } = req.params;

  const rows = db.prepare(`
    SELECT *
    FROM notes
    WHERE tripId = ?
    ORDER BY dateTime ASC
  `).all(tripId);

  const notes = rows.map(n => ({ ...n, kind: "note" }));
  res.json(notes);
});

// GET a single note
router.get("/:id", (req, res) => {
  const { id, tripId } = req.params;

  const row = db.prepare(`
    SELECT *
    FROM notes
    WHERE id = ? AND tripId = ?
  `).get(id, tripId);

  if (!row) return res.status(404).json({ error: "note not found" });

  res.json({ ...row, kind: "note" });
});

// CREATE a note
router.post("/", (req, res) => {
  const { tripId } = req.params;
  const { dateTime, note } = req.body;

  const result = db.prepare(`
    INSERT INTO notes (tripId, dateTime, note)
    VALUES (?, ?, ?)
  `).run(tripId, dateTime, note);

  const row = db.prepare(`SELECT * FROM notes WHERE id = ?`).get(result.lastInsertRowid);
  res.json({ ...row, kind: "note" });
});

// UPDATE a note
router.patch("/:id", (req, res) => {
  const { id, tripId } = req.params;
  const { dateTime, note } = req.body;

  db.prepare(`
    UPDATE notes
    SET dateTime = ?, note = ?
    WHERE id = ? AND tripId = ?
  `).run(dateTime, note, id, tripId);

  const row = db.prepare(`SELECT * FROM notes WHERE id = ?`).get(id);
  res.json({ ...row, kind: "note" });
});

// DELETE a note
router.delete("/:id", (req, res) => {
  const { tripId, id } = req.params;

  console.log("notes router delete tripId:", tripId,", id:",id)

  const stmt = db.prepare(`
    DELETE FROM notes
    WHERE id = ? AND tripId = ?
  `);

  stmt.run(id, tripId);

  res.json({ success: true });
});

export default router;
