// routes/segments.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// GET segments for a trip
router.get("/trip/:tripId", (req, res) => {
  const stmt = db.prepare(
    "SELECT * FROM segments WHERE tripId = ? ORDER BY startDate, departureTime"
  );
  res.json(stmt.all(req.params.tripId));
});

// POST new segment
router.post("/", (req, res) => {
  const {
    tripId,
    startDate,
    endDate,
    mode,
    fromLocation,
    toLocation,
    departureTime,
    arrivalTime,
    notes,
    carrier
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO segments
    (tripId, startDate, endDate, mode, fromLocation, toLocation, departureTime, arrivalTime, notes, carrier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    tripId,
    startDate,
    endDate,
    mode,
    fromLocation,
    toLocation,
    departureTime,
    arrivalTime,
    notes,
    carrier
  );

  res.json({ id: result.lastInsertRowid });
});

// PATCH update segment
router.patch("/:id", (req, res) => {
  const {
    startDate,
    endDate,
    mode,
    fromLocation,
    toLocation,
    departureTime,
    arrivalTime,
    notes,
    carrier
  } = req.body;

  const stmt = db.prepare(`
    UPDATE segments
    SET startDate = ?, endDate = ?, mode = ?, fromLocation = ?, toLocation = ?, departureTime = ?, arrivalTime = ?, notes = ?, carrier = ?
    WHERE id = ?
  `);

  stmt.run(
    startDate,
    endDate,
    mode,
    fromLocation,
    toLocation,
    departureTime,
    arrivalTime,
    notes,
    carrier,
    req.params.id
  );

  res.json({ success: true });
});

export default router;
