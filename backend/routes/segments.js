// routes/segments.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// GET segments for a trip
router.get("/trip/:tripId", (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM segments WHERE tripId = ? ORDER BY startDate, departureTime"
  ).all(req.params.tripId);

  const segments = rows.map(s => ({ ...s, kind: "segment" }));

  res.json(segments);
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

  const insertStmt = db.prepare(`
    INSERT INTO segments
    (tripId, startDate, endDate, mode, fromLocation, toLocation, departureTime, arrivalTime, notes, carrier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
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

  // ⭐ Fetch the newly created segment
  const selectStmt = db.prepare(`
    SELECT * FROM segments WHERE id = ?
  `);

  const newSegment = selectStmt.get(result.lastInsertRowid);

  res.json({ ...newSegment, kind: "segment" }); // ⭐ Return full segment object plus kind
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

  const updateStmt = db.prepare(`
    UPDATE segments
    SET startDate = ?, endDate = ?, mode = ?, fromLocation = ?, toLocation = ?, departureTime = ?, arrivalTime = ?, notes = ?, carrier = ?
    WHERE id = ?
  `);

  updateStmt.run(
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

  // ⭐ Fetch the updated segment
  const selectStmt = db.prepare(`
    SELECT * FROM segments WHERE id = ?
  `);

  const updatedSegment = selectStmt.get(req.params.id);

  res.json({ ...updatedSegment, kind: "segment" }); // ⭐ Return the full updated segment plus kind
});

export default router;
