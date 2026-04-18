// routes/trips.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all trips
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM trips ORDER BY startDate desc");
  res.json(stmt.all());
});

// GET full trip (trip + segments + tours)
router.get("/:id/full", (req, res) => {
  const id = req.params.id;

  const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(id);

  const rows = db.prepare(
    "SELECT * FROM segments WHERE tripId = ? ORDER BY startDate, departureTime"
  ).all(id);
  const segments = rows.map(s => ({ ...s, kind: "segment" }));

  const tours = db.prepare(
    "SELECT * FROM tours WHERE tripId = ? ORDER BY startDate, startTime"
  ).all(id);
  const notes = db.prepare(
    "SELECT * FROM notes WHERE tripId = ? ORDER BY dateTime"
  ).all(id);

  res.json({ trip, segments, tours });
});

// POST new trip
router.post("/", (req, res) => {
  console.log("Creating new trip with data:", req.body);
  const { name, startDate, endDate, notes, type } = req.body;

  const stmt = db.prepare(`
    INSERT INTO trips (name, startDate, endDate, notes, type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(name, startDate, endDate, notes, type);
  res.json({ id: result.lastInsertRowid });
});

// PATCH update trip
router.patch("/:id", (req, res) => {
  console.log("Patching trip", req.params.id, req.body);
  const { name, startDate, endDate, notes, type } = req.body;

  const stmt = db.prepare(`
    UPDATE trips
    SET name = ?, startDate = ?, endDate = ?, notes = ?, type = ?
    WHERE id = ?
  `);

  stmt.run(name, startDate, endDate, notes, type, req.params.id);
  res.json({ success: true });
});

router.post("/import", (req, res) => {
  const { trips } = req.body;

  if (!Array.isArray(trips)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const stmt = db.prepare(`
    INSERT INTO trips (name, startDate, endDate, notes, type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertedIds = [];

  try {
    const insertMany = db.transaction((items) => {
      for (const t of items) {
        const result = stmt.run(
          t.name,
          t.startDate,
          t.endDate,
          t.notes,
          t.type
        );
        insertedIds.push(result.lastInsertRowid);
      }
    });

    insertMany(trips);

    res.json({ inserted: insertedIds });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/trips/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare("DELETE FROM trips WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    console.log(`Deleted trip with id ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting trip:", err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

export default router;
