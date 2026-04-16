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

  // DELETE /api/segments/:id
  router.delete("/segments/:id", (req, res) => {
    const { id } = req.params;

    try {
      const stmt = db.prepare("DELETE FROM segments WHERE id = ?");
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Segment not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting segment:", err);
      res.status(500).json({ error: "Failed to delete segment" });
    }
  });

  res.json({ success: true });
});

export default router;
