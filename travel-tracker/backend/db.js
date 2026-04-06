// db.js
import Database from "better-sqlite3";

const db = new Database("travel.db");

// Initialize tables
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL,
  mode TEXT NOT NULL,
  startDate TEXT,
  endDate TEXT,
  fromLocation TEXT,
  toLocation TEXT,
  departureTime TEXT,
  arrivalTime TEXT,
  notes TEXT,
  carrier TEXT
);

CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL,
  name TEXT NOT NULL,
  startDate TEXT,
  startTime TEXT,
  endDate TEXT,
  endTime TEXT,
  location TEXT,
  category TEXT,
  notes TEXT,
  company TEXT
);
`);

export default db;
