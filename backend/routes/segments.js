import express from "express";
import db from "../db.js";

const router = express.Router({ mergeParams: true });

// GET all segments for a trip
router.get("/", (req, res) => {
  const { tripId } = req.params;

  const rows = db.prepare(`
    SELECT *
    FROM segments
    WHERE tripId = ?
    ORDER BY startDate, departureTime
  `).all(tripId);

  const segments = rows.map(s => ({ ...s, kind: "segment" }));
  res.json(segments);
});

// GET a single segment
router.get("/:id", (req, res) => {
  const { id, tripId } = req.params;

  const row = db.prepare(`
    SELECT *
    FROM segments
    WHERE id = ? AND tripId = ?
  `).get(id, tripId);

  if (!row) return res.status(404).json({ error: "segment not found" });

  res.json({ ...row, kind: "segment" });
});

// CREATE a segment
router.post("/", (req, res) => {
  const { tripId } = req.params;
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

  const result = db.prepare(`
    INSERT INTO segments (
      tripId, startDate, endDate, mode,
      fromLocation, toLocation,
      departureTime, arrivalTime,
      notes, carrier
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tripId, startDate, endDate, mode,
    fromLocation, toLocation,
    departureTime, arrivalTime,
    notes, carrier
  );

  const row = db.prepare(`SELECT * FROM segments WHERE id = ?`).get(result.lastInsertRowid);
  res.json({ ...row, kind: "segment" });
});

// UPDATE a segment
router.patch("/:id", (req, res) => {
  const { id, tripId } = req.params;
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

  db.prepare(`
    UPDATE segments
    SET startDate = ?, endDate = ?, mode = ?,
        fromLocation = ?, toLocation = ?,
        departureTime = ?, arrivalTime = ?,
        notes = ?, carrier = ?
    WHERE id = ? AND tripId = ?
  `).run(
    startDate, endDate, mode,
    fromLocation, toLocation,
    departureTime, arrivalTime,
    notes, carrier,
    id, tripId
  );

  const row = db.prepare(`SELECT * FROM segments WHERE id = ?`).get(id);
  res.json({ ...row, kind: "segment" });
});

// DELETE a segment
router.delete("/:id", (req, res) => {
  const { id, tripId } = req.params;

  const result = db.prepare(`
    DELETE FROM segments
    WHERE id = ? AND tripId = ?
  `).run(id, tripId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "segment not found" });
  }

  res.status(204).end();
});

export default router;
