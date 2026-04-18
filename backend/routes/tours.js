// routes/tours.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// GET tours for a trip
router.get("/trip/:tripId", (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM tours WHERE tripId = ? ORDER BY startDate, startTime"
  ).all(req.params.tripId);

  const tours = rows.map(t => ({ ...t, kind: "tour" }));

  res.json(tours);
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
    notes,
    company
  } = req.body;

  console.log("POST /tours CALLED with body:", req.body);

  const insertStmt = db.prepare(`
    INSERT INTO tours (
      tripId, name, startDate, startTime, endDate, endTime, location, category, notes, company
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    const result = insertStmt.run(
      tripId,
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      category,
      notes,
      company
    );

    // ⭐ Fetch the newly created tour
    const selectStmt = db.prepare(`
      SELECT * FROM tours WHERE id = ?
    `);

    const newTour = selectStmt.get(result.lastInsertRowid);

    res.json({ ...newTour, kind: "tour" }); // ⭐ Return full tour object
  } catch (err) {
    console.error("POST /tours ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH update tour
router.patch("/:id", (req, res) => {
  try {
    const {
      tripId,
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      category,
      notes,
      company
    } = req.body;

    const updateStmt = db.prepare(`
      UPDATE tours
      SET tripId = ?, name = ?, startDate = ?, startTime = ?, endDate = ?, endTime = ?,
          location = ?, category = ?, notes = ?, company = ?
      WHERE id = ?
    `);

    updateStmt.run(
      tripId,
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      category,
      notes,
      company,
      req.params.id
    );

    // ⭐ Fetch the updated tour
    const selectStmt = db.prepare(`
      SELECT * FROM tours WHERE id = ?
    `);

    const updatedTour = selectStmt.get(req.params.id);

    res.json({ ...updatedTour, kind: "tour" }); // ⭐ Return the full updated tour
  } catch (err) {
    console.error("PATCH /tours/:id ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tours/:id
router.delete("/:id", (req, res) => {
  console.log("DELETE /tours/:id CALLED with id:", req.params);
  const { id } = req.params;

  try {
    const stmt = db.prepare("DELETE FROM tours WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting tour:", err);
    res.status(500).json({ error: "Failed to delete tour" });
  }
});

export default router;
