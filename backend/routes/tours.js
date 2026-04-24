import express from "express";
import db from "../db.js";

const router = express.Router({ mergeParams: true });

// GET all tours for a trip
router.get("/", (req, res) => {
  const { tripId } = req.params;

  const rows = db.prepare(`
    SELECT *
    FROM tours
    WHERE tripId = ?
    ORDER BY startDate, startTime
  `).all(tripId);

  const tours = rows.map(t => ({ ...t, kind: "tour" }));
  res.json(tours);
});

// GET a single tour
router.get("/:id", (req, res) => {
  const { id, tripId } = req.params;

  const row = db.prepare(`
    SELECT *
    FROM tours
    WHERE id = ? AND tripId = ?
  `).get(id, tripId);

  if (!row) return res.status(404).json({ error: "tour not found" });

  res.json({ ...row, kind: "tour" });
});

// CREATE a tour
router.post("/", (req, res) => {
  const { tripId } = req.params;
  const {
    startDate,
    startTime,
    endDate,
    endTime,
    name,
    location,
    category,
    notes,
    company
  } = req.body;

  const result = db.prepare(`
    INSERT INTO tours (
      tripId, startDate, startTime, endDate, endTime,
      name, location, category, notes, company
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tripId, startDate, startTime, endDate, endTime,
    name, location, category, notes, company
  );

  const row = db.prepare(`SELECT * FROM tours WHERE id = ?`).get(result.lastInsertRowid);
  res.json({ ...row, kind: "tour" });
});

// UPDATE a tour
router.patch("/:id", (req, res) => {
  const { id, tripId } = req.params;
  const {
    startDate,
    startTime,
    endDate,
    endTime,
    name,
    location,
    category,
    notes,
    company
  } = req.body;

  db.prepare(`
    UPDATE tours
    SET startDate = ?, startTime = ?, endDate = ?, endTime = ?,
        name = ?, location = ?, category = ?, notes = ?, company = ?
    WHERE id = ? AND tripId = ?
  `).run(
    startDate, startTime, endDate, endTime,
    name, location, category, notes, company,
    id, tripId
  );

  const row = db.prepare(`SELECT * FROM tours WHERE id = ?`).get(id);
  res.json({ ...row, kind: "tour" });
});

// DELETE a tour
router.delete("/:id", (req, res) => {
  const { id, tripId } = req.params;

  const result = db.prepare(`
    DELETE FROM tours
    WHERE id = ? AND tripId = ?
  `).run(id, tripId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "tour not found" });
  }

  res.status(204).end();
});

export default router;
