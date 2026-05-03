import express from "express";
import db from "../db.js";

const router = express.Router({ mergeParams: true });

// GET all trips
router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT *
    FROM trips
    ORDER BY startDate DESC
  `).all();

  const trips = rows.map(t => ({ ...t, kind: "trip" }));
  res.json(trips);
});

// GET a single trip
router.get("/:tripId", (req, res) => {
  const { tripId } = req.params;

  const row = db.prepare(`
    SELECT *
    FROM trips
    WHERE id = ?
  `).get(tripId);

  if (!row) return res.status(404).json({ error: "trip not found" });

  res.json({ ...row, kind: "trip" });
});

// CREATE a trip
router.post("/", (req, res) => {
  const { name, startDate, endDate, tripNotes, type } = req.body;

  const result = db.prepare(`
    INSERT INTO trips (name, startDate, endDate, tripNotes, type)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, startDate, endDate, tripNotes, type);

  const row = db.prepare(`SELECT * FROM trips WHERE id = ?`).get(result.lastInsertRowid);
  res.json({ ...row, kind: "trip" });
});

// UPDATE a trip
router.patch("/:tripId", (req, res) => {
  const { tripId } = req.params;
  const { name, startDate, endDate, tripNotes, type } = req.body;

  db.prepare(`
    UPDATE trips
    SET name = ?, startDate = ?, endDate = ?, tripNotes = ?, type = ?
    WHERE id = ?
  `).run(name, startDate, endDate, tripNotes, type, tripId);

  const row = db.prepare(`SELECT * FROM trips WHERE id = ?`).get(tripId);
  res.json({ ...row, kind: "trip" });
});

// DELETE a trip
router.delete("/:tripId", (req, res) => {
  const { tripId } = req.params;

  const result = db.prepare(`
    DELETE FROM trips
    WHERE id = ?
  `).run(tripId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "trip not found" });
  }

  res.status(204).end();
});

export default router;
