import express from "express";
import db from "../db.js";

const router = express.Router();

router.post("/notes", (req, res) => {
  const { tripId, dateTime, note } = req.body;

  const insertStmt = db.prepare(`
    INSERT INTO notes (tripId, dateTime, note)
    VALUES (?, ?, ?)
  `);

  const result = insertStmt.run(tripId, dateTime, note);

  // ⭐ Fetch the newly created note
  const selectStmt = db.prepare(`
    SELECT * FROM notes WHERE id = ?
  `);

  const newNote = selectStmt.get(result.lastInsertRowid);

  res.json({...newNote, kind:"note"}); // ⭐ Return full note object plus kind
});

router.patch("/notes/:id", (req, res) => {
  const { id } = req.params;
  const { dateTime, note } = req.body;

  const updateStmt = db.prepare(`
    UPDATE notes
    SET dateTime = ?, note = ?
    WHERE id = ?
  `);

  updateStmt.run(dateTime, note, id);

  // ⭐ Fetch the updated note
  const selectStmt = db.prepare(`
    SELECT * FROM notes WHERE id = ?
  `);

  const updatedNote = selectStmt.get(id);

  res.json({...updatedNote, kind:"note"}); // ⭐ Return the full updated note
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
  const rows = db.prepare(
    "SELECT * FROM notes WHERE tripId = ? ORDER BY dateTime"
  ).all(req.params.tripId);

  const notes = rows.map(n => ({
    ...n,
    kind: "note"
  }));

  res.json(notes);
});

export default router;