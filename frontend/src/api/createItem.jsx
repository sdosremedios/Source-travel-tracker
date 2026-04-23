export function createItem(kind, trip = null) {
  switch (kind) {
    case "trip":
      return createTrip();

    case "segment":
      return createSegment(trip);

    case "tour":
      return createTour(trip);

    case "note":
      return createNote(trip);

    default:
      console.warn("Unknown kind:", kind);
      return { id: null, kind };
  }
}
/*
CREATE TABLE IF NOT EXISTS trips (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL
                      DEFAULT ('(undefined)'),
    startDate TEXT,
    endDate   TEXT,
    tripNotes TEXT,
    type      TEXT
);
*/
export function createTrip() {
  return {
    id: null,
    kind: "trip",
    name: "(untitled)",
    startDate: todayISO(),
    endDate: "",
    tripNotes: "",
    type: ""
  };
}
/*
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
*/
export function createSegment(trip) {
  return {
    id: null,
    kind: "segment",
    tripId: trip?.id ?? null,

    startDate: defaultStartDateForTrip(trip),
    endDate: "",
    mode: "",
    fromLocation: "",
    toLocation: "",
    departureTime: "",
    arrivalTime: "",
    notes: "",
    carrier: ""
  };
}
/*
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
*/
export function createTour(trip) {
  return {
    id: null,
    kind: "tour",
    tripId: trip?.id ?? null,

    name: "",
    startDate: defaultStartDateForTrip(trip),
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    category: "",
    notes: "",
    company: ""
  };
}
/*
CREATE TABLE notes (
    id       INTEGER  PRIMARY KEY AUTOINCREMENT,
    tripId   INTEGER  REFERENCES trips (id) ON DELETE CASCADE
                      NOT NULL,
    dateTime DATETIME,
    note     TEXT
);
*/
export function createNote(trip) {
  return {
    id: null,
    kind: "note",
    tripId: trip?.id ?? null,

    dateTime: new Date().toISOString(),
    note: ""
  };
}
function todayISO() {
  return new Date().toISOString().slice(0, 10); // "2026-04-22"
}
function defaultStartDateForTrip(trip) {
  return trip?.startDate || todayISO();
}
