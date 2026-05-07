import { normalizeDate, isValidDateString, isChronological, isoDateTime } from "../utils/dateHelpers";
// Unified routines
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
    endDate: todayISO(),
    tripNotes: "",
    type: ""
  };
}
export function buildTripPayload(item) {
  function toUTC(date, time) {
    if (!date) return null;
    return new Date(`${date}T${time || "00:00"}`).toISOString();
  }
  let { startDate, endDate } = item;

  // Normalize first
  startDate = normalizeDate(startDate);
  endDate = normalizeDate(endDate);

  // Validate
  const hasStart = !!startDate;
  const hasEnd = !!endDate;

  if (hasStart && !isValidDateString(startDate)) {
    alert("Start date is invalid");
    return;
  }

  if (hasEnd && !isValidDateString(endDate)) {
    alert("End date is invalid");
    return;
  }

  if (hasStart && hasEnd && !isChronological(startDate, "00:00", endDate, "00:00")) {
    alert("End date must be on or after start date");
    return;
  }
  console.log("TripEditorScreen handleSave with:", item)
  const id = item?.id ?? null;

  // Build a clean payload from activeItem
  const payload = {
    ...item,
    startDate,
    endDate
  };

  return payload;
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
    endDate: defaultStartDateForTrip(trip),
    mode: "plane",
    fromLocation: "",
    toLocation: "",
    departureTime: "", // deprecated
    arrivalTime: "", // deprecated
    notes: "",
    carrier: ""
  };
}
export function buildSegmentPayload(item) {
  function toUTC(date, time) {
    if (!date ) return null;
    return new Date(`${date}T${time || "00:00"}`).toISOString();
  }

  return {
    mode: item.mode || "",
    fromLocation: item.fromLocation || "",
    toLocation: item.toLocation || "",
    carrier: item.carrier || "",
    notes: item.notes || "",

    // canonical UTC datetime fields
    startDate: toUTC(item.startDate, item.departureTime),
    endDate: toUTC(item.endDate, item.arrivalTime)
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
    endDate: defaultStartDateForTrip(trip),
    endTime: "",
    location: "",
    category: "",
    notes: "",
    company: ""
  };
}
export function buildTourPayload(item) {
  function toUTC(date, time) {
    if (!date) return null;
    return new Date(`${date}T${time || "00:00"}`).toISOString();
  }

  return {
    name: item.name || "",
    location: item.location || "",
    category: item.category || "",
    notes: item.notes || "",
    company: item.company || "",
    startDate: toUTC(item.startDate, item.startTime || "12:00"),
    endDate: toUTC(item.endDate || item.startDate, item.endTime || "12:00")
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
export function buildNotePayload(item) {
  let utc;

  try {
    utc = new Date(item.dateTime).toISOString();
  } catch {
    utc = new Date().toISOString();
  }

  return {
    note: item.note || "",
    dateTime: utc
  };
}
function todayISO() {
  return new Date().toISOString().slice(0, 10); // "2026-04-22"
}
function defaultStartDateForTrip(trip) {
  return trip?.startDate || todayISO();
}
