// routes/trips.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all trips
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM trips ORDER BY startDate DESC");
  const rows = stmt.all();

  const trips = rows.map(t => ({
    ...t,
    kind: "trip"
  }));

  res.json(trips);
});

// GET full trip (trip + segments + tours)
router.get("/:id/full", (req, res) => {
  const id = req.params.id;

  // Trip row
  const trip = db.prepare("SELECT * FROM trips WHERE id = ? ORDER BY startDate DESC").get(id);

  // Segments
  const segments = db.prepare(
    "SELECT * FROM segments WHERE tripId = ? ORDER BY startDate, departureTime"
  )
    .all(id)
    .map(s => ({ ...s, kind: "segment" }));

  // Tours
  const tours = db.prepare(
    "SELECT * FROM tours WHERE tripId = ? ORDER BY startDate, startTime"
  )
    .all(id)
    .map(t => ({ ...t, kind: "tour" }));

  // Notes
  const notes = db.prepare(
    "SELECT * FROM notes WHERE tripId = ? ORDER BY dateTime"
  )
    .all(id)
    .map(n => ({ ...n, kind: "note" }));

  res.json({ trip, segments, tours, notes });
});

// POST new trip
router.post("/", (req, res) => {
  console.log("Creating new trip with data:", req.body);
  const { name, startDate, endDate, tripNotes, type } = req.body;

  const stmt = db.prepare(`
    INSERT INTO trips (name, startDate, endDate, tripNotes, type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(name, startDate, endDate, tripNotes, type);
  // Fetch the full row
  const row = db.prepare(`SELECT * FROM trips WHERE id = ?`).get(result.lastInsertRowid);
  res.json({ ...row, kind: "trip" });
});

// PATCH update trip
router.patch("/:id", (req, res) => {
  console.log("Patching trip", req.params.id, req.body);
  const { name, startDate, endDate, tripNotes, type } = req.body;

  const stmt = db.prepare(`
    UPDATE trips
    SET name = ?, startDate = ?, endDate = ?, tripNotes = ?, type = ?
    WHERE id = ?
  `);

  stmt.run(name, startDate, endDate, tripNotes, type, req.params.id);

  // Fetch updated row
  const row = db.prepare(`SELECT * FROM trips WHERE id = ?`).get(req.params.id);

  res.json({ ...row, kind: "trip" });
});

router.post("/import", (req, res) => {
  const { trips } = req.body;

  if (!Array.isArray(trips)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const stmt = db.prepare(`
    INSERT INTO trips (name, startDate, endDate, tripNotes, type)
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
          t.tripNotes,
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
