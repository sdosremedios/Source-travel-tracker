// src/models/buildUnifiedTimeline.js

import { formatMonth, formatWeekday, formatDateTime } from "../utils/dateHelpers";

export function buildUnifiedTimeline(segments = [], tours = [], notes = []) {
  const items = [];

  //
  // Parse YYYY-MM-DD safely everywhere (date-only fields)
  //
  function parseYMD(value) {
    if (!value) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const [_, y, m, d] = match.map(Number);
    return new Date(y, m - 1, d);
  }

  //
  // Normalize ANY timestamp (UTC ISO or naive local) → local JS Date
  //
  function normalizeToLocal(dateTime) {
    return new Date(dateTime); // JS auto-converts UTC → local
  }

  function capitalizeEachWord(text) {
    return text
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  //
  // Shared duration + offset helpers
  //
export function hydrateItemForTimeline(item) {
  // Trips are date-only, no time
  if (item.kind === "trip") {
    return {
      ...item,
      date: item.startDate,                 // already YYYY-MM-DD
      startLabel: null,
      endLabel: null,
      timelineSortKey: item.startDate
    };
  }

  // Notes have a single timestamp (startDate)
  if (item.kind === "note") {
    const start = new Date(item.startDate);

    return {
      ...item,
      date: start.toLocaleDateString("en-CA"),
      startLabel: start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      endLabel: null,
      timelineSortKey: start.toISOString()
    };
  }

  // Tours + Segments both use startDate + endDate as UTC timestamps
  if (item.kind === "tour" || item.kind === "segment") {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);

    return {
      ...item,

      // Local date for grouping
      date: start.toLocaleDateString("en-CA"),

      // Local time labels
      startLabel: start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      endLabel: end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),

      // Sorting key (UTC ISO)
      timelineSortKey: start.toISOString(),

      // Duration (segments only)
      durationMinutes: item.kind === "segment"
        ? Math.round((end - start) / 60000)
        : null
    };
  }

  // Fallback (should never hit)
  return item;
}

  function computeDuration(start, end) {
    const minutes = Math.floor((end - start) / 60000);
    if (minutes <= 0) return "";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins.toString().padStart(2, "0")}m`;
  }

  function computeArrivalOffset(start, end) {
    const dayOffset = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    if (dayOffset === 1) return "+1 day";
    if (dayOffset > 1) return `+${dayOffset} days`;
    return "";
  }

  //
  // TOURS
  //
  tours.forEach(tour => {
    // The real datetime is stored in startDate (UTC ISO)
    const d = normalizeToLocal(tour.startDate);

    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate || tour.startDate);

    items.push({
      id: tour.id,
      kind: "tour",
      tripId: tour.tripId,

      rawDate: tour.startDate,

      date: d.toLocaleDateString(),
      weekday: d.toLocaleString("default", { weekday: "short" }),
      monthLabel: d.toLocaleString("default", { month: "long", year: "numeric" }),

      name: tour.name,
      category: tour.category,
      notes: tour.notes,
      location: tour.location,

      startDate: tour.startDate,
      endDate: tour.endDate,
      startTime: tour.startTime,
      endTime: tour.endTime,
      finishDate: end?.toLocaleDateString() || "",

      durationLabel: computeDuration(start, end),
      arrivalOffset: computeArrivalOffset(start, end),

      sortDate: d
    });
  });

  //
  // SEGMENTS
  //
  segments.forEach(seg => {
    const start = parseYMD(seg.startDate);
    const end = parseYMD(seg.endDate || seg.startDate);
    if (!start || !end) return;

    const d = normalizeToLocal(seg.departureTime || seg.startDate);

    const capMode = capitalizeEachWord(seg.mode);
    const capCarrier = capitalizeEachWord(seg.carrier);

    items.push({
      id: seg.id,
      kind: "segment",
      tripId: seg.tripId,

      rawDate: seg.departureTime || seg.startDate,

      date: d.toLocaleDateString(),
      weekday: d.toLocaleString("default", { weekday: "short" }),
      monthLabel: d.toLocaleString("default", { month: "long", year: "numeric" }),

      from: seg.fromLocation,
      to: seg.toLocation,
      mode: capMode,
      notes: seg.notes,

      startDate: seg.startDate,
      endDate: seg.endDate,
      finishDate: end.toLocaleDateString(),
      carrier: capCarrier,

      startTime: seg.departureTime,
      endTime: seg.arrivalTime,

      durationLabel: computeDuration(start, end),
      arrivalOffset: computeArrivalOffset(start, end),

      sortDate: d
    });
  });

  //
  // NOTES
  //
  notes.forEach(n => {
    const d = normalizeToLocal(n.dateTime);

    items.push({
      kind: "note",
      id: n.id,

      rawDate: n.dateTime,

      date: d.toLocaleDateString(),
      weekday: d.toLocaleString("default", { weekday: "short" }),
      monthLabel: d.toLocaleString("default", { month: "long", year: "numeric" }),

      note: n.note,

      sortDate: d,

      ...n
    });
  });

  //
  // SORT newest → oldest
  //
  items.sort((a, b) => b.sortDate - a.sortDate);

  return items;
}
