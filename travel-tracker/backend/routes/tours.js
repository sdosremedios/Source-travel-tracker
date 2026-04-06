// routes/tours.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// GET tours for a trip
router.get("/trip/:tripId", (req, res) => {
  const stmt = db.prepare(
    "SELECT * FROM tours WHERE tripId = ? ORDER BY startDate, startTime"
  );
  res.json(stmt.all(req.params.tripId));
});

// POST create tour
router.post("/", (req, res) => {
  const {
    tripId,
    name,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
    category,
    notes
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO tours (
      tripId, name, startDate, startTime, endDate, endTime, location, category, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    tripId,
    name,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
    category,
    notes
  );

  res.json({ id: result.lastInsertRowid });
});

// PATCH update tour
router.patch("/:id", (req, res) => {
  const {
    name,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
    category,
    notes
  } = req.body;

  const stmt = db.prepare(`
    UPDATE tours
    SET name = ?, startDate = ?, startTime = ?, endDate = ?, endTime = ?, location = ?, category = ?, notes = ?
    WHERE id = ?
  `);

  stmt.run(
    name,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
    category,
    notes,
    req.params.id
  );

  res.json({ success: true });
});

export default router;
