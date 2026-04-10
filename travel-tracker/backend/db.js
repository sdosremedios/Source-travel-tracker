// db.js
import Database from "better-sqlite3";

const db = new Database("travel.db");

// Initialize tables
console.log("db.js executed — ensuring tables exist");

db.exec(`
CREATE TABLE trips (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL
                      DEFAULT ('(undefined)'),
    startDate TEXT,
    endDate   TEXT,
    notes     TEXT,
    type      TEXT
);

CREATE TABLE segments (
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

CREATE TABLE tours (
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

CREATE TABLE notes (
    id       INTEGER  PRIMARY KEY AUTOINCREMENT,
    tripId   INTEGER  REFERENCES trips (id) ON DELETE CASCADE
                      NOT NULL,
    dateTime DATETIME,
    note     TEXT
);

`);

export default db;
