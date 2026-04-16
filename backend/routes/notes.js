import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/notes", (req, res) => {
  const { tripId, dateTime, note } = req.body;

  const stmt = db.prepare(`
    INSERT INTO notes (tripId, dateTime, note)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(tripId, dateTime, note);
  res.json({ id: result.lastInsertRowid });
});
router.patch("/notes/:id", (req, res) => {
  const { id } = req.params;
  const { dateTime, note } = req.body;

  const stmt = db.prepare(`
    UPDATE notes
    SET dateTime = ?, note = ?
    WHERE id = ?
  `);

  stmt.run(dateTime, note, id);
  res.json({ success: true });
});
router.delete("/notes/:id", (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.status(204).end();
});
router.get("/trips/:tripId/notes", (req, res) => {
  const { tripId } = req.params;

  const stmt = db.prepare(`
    SELECT * FROM notes
    WHERE tripId = ?
    ORDER BY dateTime ASC
  `);

  const notes = stmt.all(tripId);
  res.json(notes);
});

export default router;