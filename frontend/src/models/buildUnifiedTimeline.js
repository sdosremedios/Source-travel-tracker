// src/models/buildUnifiedTimeline.js

import { formatMonth, formatWeekday, formatDateTime } from "../utils/dateHelpers";

export function buildUnifiedTimeline(segments = [], tours = [], notes = []) {
  const items = [];

  //
  // Parse YYYY-MM-DD safely everywhere
  //
  function parseYMD(value) {
    if (!value) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const [_, y, m, d] = match.map(Number);
    return new Date(y, m - 1, d);
  }

  function normalizeDate(d) {
    return new Date(d); // JS auto-converts UTC → local
  }

  function capitalizeEachWord(text) {
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  //
  // Shared duration + offset helpers
  //
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

  // TOURS
  // console.log("Building timeline with tours:", tours);
  tours.forEach(tour => {
    const start = parseYMD(tour.startDate);
    const end = parseYMD(tour.endDate || tour.startDate);
    if (!start || !end) return;

    items.push({
      id: tour.id,
      kind: "tour",
      tripId: tour.tripId,

      rawDate: tour.startDate,
      date: start.toLocaleDateString(),
      weekday: start.toLocaleString("default", { weekday: "short" }),
      monthLabel: start.toLocaleString("default", { month: "long", year: "numeric" }),

      name: tour.name,
      category: tour.category,
      notes: tour.notes,
      location: tour.location,

      // ⬇️ add these
      startDate: tour.startDate,
      endDate: tour.endDate,
      startTime: tour.startTime,
      endTime: tour.endTime,
      finishDate: end.toLocaleDateString(),

      durationLabel: computeDuration(start, end),
      arrivalOffset: computeArrivalOffset(start, end)
    });
  });

  // SEGMENTS
  // console.log("Building timeline with segments:", segments);
  segments.forEach(seg => {
    const start = parseYMD(seg.startDate);
    const end = parseYMD(seg.endDate || seg.startDate);
    if (!start || !end) return;

    const capMode = capitalizeEachWord(seg.mode);
    const capCarrier = capitalizeEachWord(seg.carrier);

    items.push({
      id: seg.id,
      kind: "segment",
      tripId: seg.tripId,

      rawDate: seg.startDate,
      date: start.toLocaleDateString(),
      weekday: start.toLocaleString("default", { weekday: "short" }),
      monthLabel: start.toLocaleString("default", { month: "long", year: "numeric" }),

      from: seg.fromLocation,
      to: seg.toLocation,
      mode: capMode,
      notes: seg.notes,

      startDate: seg.startDate,
      endDate: seg.endDate,
      finishDate: end.toLocaleDateString(),
      carrier: capCarrier,

      // ⭐ time mapping
      startTime: seg.departureTime,
      endTime: seg.arrivalTime,

      durationLabel: computeDuration(start, end),
      arrivalOffset: computeArrivalOffset(start, end)
    });
  });
  // NOTES ------------------------------------------------------------------
  /*
      monthLabel: formatMonth(normalizeDate(n.dateTime)),
      date: formatDateTime(n.dateTime),
      weekday: formatWeekday(n.dateTime),
 */
  console.log("buildUnifiedTimeline with notes:", notes);
  notes.forEach(n => {
    items.push({
      kind: "note",
      id: n.id,
      rawDate: n.dateTime,
      monthLabel: formatMonth(new Date(n.dateTime)), // convert to local dateTime
      date: formatDateTime(new Date(n.dateTime)),
      weekday: formatWeekday(new Date(n.dateTime)),
      note: n.note,
      ...n
    });
  });
  //
  // SORT chronologically by start date
  //
  items.sort((b, a) => new Date(a.rawDate) - new Date(b.rawDate));

  return items;
}
