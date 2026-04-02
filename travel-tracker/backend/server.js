import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
// Database
//
const db = new Database("travel.db");

// Create tables if missing
db.exec(`
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  startDate TEXT,
  endDate TEXT,
  notes TEXT,
  type TEXT
);

CREATE TABLE IF NOT EXISTS segments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId        INTEGER NOT NULL,
    mode          TEXT    NOT NULL,
    startDate     TEXT,
    endDate       TEXT,
    fromLocation  TEXT,
    toLocation    TEXT,
    departureTime TIME,
    arrivalTime   TIME,
    notes         TEXT,
    carrierId     INTEGER
);

CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL,
  name TEXT NOT NULL,
  startDate TEXT,
  endDate TEXT,
  location TEXT,
  notes TEXT
);
`);

app.get("/ping", (req, res) => {
  console.log("PING HIT");
  res.send("pong");
});

//
// TRIPS
//

// GET all trips
app.get("/api/trips", (req, res) => {
  const rows = db.prepare("SELECT * FROM trips ORDER BY startDate").all();
  res.json(rows);
});

// GET full trip (trip + segments + tours)
app.get("/api/trips/:id/full", (req, res) => {
  const id = req.params.id;

  const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(id);
  const segments = db.prepare(
    "SELECT * FROM segments WHERE tripId = ? ORDER BY startDate"
  ).all(id);
  const tours = db.prepare(
    "SELECT * FROM tours WHERE tripId = ? ORDER BY startDate"
  ).all(id);

  res.json({ trip, segments, tours });
});

// POST new trip
app.post("/api/trips", (req, res) => {
  const { name, startDate, endDate, notes, type } = req.body;

  const stmt = db.prepare(`
    INSERT INTO trips (name, startDate, endDate, notes, type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(name, startDate, endDate, notes, type);
  res.json({ id: result.lastInsertRowid });
});

// PATCH update trip
app.patch("/api/trips/:id", (req, res) => {
  const { name, startDate, endDate, notes, type } = req.body;

  const stmt = db.prepare(`
    UPDATE trips
    SET name = ?, startDate = ?, endDate = ?, notes = ?, type = ?
    WHERE id = ?
  `);

  stmt.run(name, startDate, endDate, notes, type, req.params.id);
  res.json({ success: true });
});

//
// SEGMENTS
//

// GET segments for a trip
app.get("/api/trips/:id/segments", (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM segments WHERE tripId = ? ORDER BY startDate"
  ).all(req.params.id);

  res.json(rows);
});

// POST new segment
app.post("/api/segments", (req, res) => {
  const {
    tripId,
    startDate,
    endDate,
    mode,
    fromLocation,
    toLocation,
    departureTime,
    arrivalTime,
    notes
  } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO segments
      (tripId, startDate, endDate, mode, fromLocation, toLocation, departureTime, arrivalTime, notes)
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
      notes
    );

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error("CREATE SEGMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH update segment
app.patch("/api/segments/:id", (req, res) => {
  console.log("PATCH /api/segments/:id HIT");
  console.log("PATCH BODY:", req.body);
  const {
    startDate,
    endDate,
    mode,
    fromLocation,
    toLocation,
    departureTime,
    arrivalTime,
    notes
  } = req.body;


  try {
    const stmt = db.prepare(`
      UPDATE segments
      SET startDate = ?, endDate = ?, mode = ?, fromLocation = ?, toLocation = ?, departureTime = ?, arrivalTime = ?, notes = ?
      WHERE id = ?
    `);

    console.log("VALUES GOING INTO SQL:", {
      startDate,
      endDate,
      mode,
      fromLocation,
      toLocation,
      departureTime,
      arrivalTime,
      notes,
      id: req.params.id
    });

    stmt.run(
      startDate,
      endDate,
      mode,
      fromLocation,
      toLocation,
      departureTime,
      arrivalTime,
      notes,
      req.params.id
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE SEGMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

//
// TOURS
//

// GET tours for a trip
app.get("/api/trips/:id/tours", (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM tours WHERE tripId = ? ORDER BY startDate"
  ).all(req.params.id);

  res.json(rows);
});

// POST new tour
app.post("/api/tours", (req, res) => {
  const { tripId, name, startDate, endDate, location, notes } = req.body;

  const stmt = db.prepare(`
    INSERT INTO tours (tripId, name, startDate, endDate, location, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    tripId,
    name,
    startDate,
    endDate,
    location,
    notes
  );

  res.json({ id: result.lastInsertRowid });
});

// PATCH update tour
app.patch("/api/tours/:id", (req, res) => {
  const { name, startDate, endDate, location, notes } = req.body;

  const stmt = db.prepare(`
    UPDATE tours
    SET name = ?, startDate = ?, endDate = ?, location = ?, notes = ?
    WHERE id = ?
  `);

  stmt.run(name, startDate, endDate, location, notes, req.params.id);
  res.json({ success: true });
});

//
// Start server
//
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});