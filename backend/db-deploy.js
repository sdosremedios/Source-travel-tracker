// db.js
import Database from "better-sqlite3";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "travel.db"));

// Initialize tables
console.log("db.js executed — ensuring tables exist");

db.exec(`
CREATE TABLE IF NOT EXISTS trips (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL
                      DEFAULT ('(undefined)'),
    startDate TEXT,
    endDate   TEXT,
    notes     TEXT,
    type      TEXT
);

CREATE TABLE IF NOT EXISTS  segments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId        INTEGER NOT NULL
                          REFERENCES trips (id) ON DELETE CASCADE,
    mode          TEXT,
    startDate     TEXT,
    endDate       TEXT,
    fromLocation  TEXT,
    toLocation    TEXT,
    departureTime TEXT,
    arrivalTime   TEXT,
    notes         TEXT,
    carrier       TEXT
);

CREATE TABLE IF NOT EXISTS tours (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    tripId    INTEGER NOT NULL
                      REFERENCES trips (id) ON DELETE CASCADE,
    name      TEXT,
    startDate TEXT,
    startTime TEXT,
    endDate   TEXT,
    endTime   TEXT,
    location  TEXT,
    category  TEXT,
    notes     TEXT,
    company   TEXT
);

CREATE TABLE IF NOT EXISTS notes (
    id       INTEGER  PRIMARY KEY AUTOINCREMENT,
    tripId   INTEGER  REFERENCES trips (id) ON DELETE CASCADE
                      NOT NULL,
    dateTime DATETIME,
    note     TEXT
);

`);

export default db;
