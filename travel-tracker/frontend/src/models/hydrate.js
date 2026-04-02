// src/models/hydrate.js

import { tourIcon } from "./categories.js";
import { modeIcon } from "../utils/icons.js";
import { weekday, formatMonthYear } from "../utils/date.js";

export function hydrateTrip(trip) {
  return {
    ...trip,
    ...hydrateDateFields(trip),
  };
}
export function hydrateSegment(seg) {
  const date = seg.startDate;   // ← canonical from your schema

  return {
    ...seg,
    date,                       // ← UnifiedTimeline groups by this
    icon: modeIcon(seg.mode),
    weekday: weekday(date),
    monthLabel: formatMonthYear(date),
    timelineSortKey: `${date}T${seg.departureTime || "00:00"}`
  };
}

export function hydrateTour(tour) {
  return {
    ...tour,
    ...hydrateDateFields(tour),
  };
}

export function buildUnifiedTimeline(segments, tours) {
  const items = [
    ...segments.map(s => ({ ...s, type: "segment" })),
    ...tours.map(t => ({ ...t, type: "tour" }))
  ];

  return items.sort((a, b) =>
    a.timelineSortKey.localeCompare(b.timelineSortKey)
  );
}

function hydrateDateFields(item) {
  if (!item.startDate) {
    return {
      weekday: null,
      monthLabel: null,
      timelineSortKey: "",
    };
  }

  const start = new Date(item.startDate);

  return {
    weekday: start.toLocaleDateString("en-US", { weekday: "short" }),
    monthLabel: start.toLocaleDateString("en-US", { month: "short" }),
    timelineSortKey: start.toISOString(),
  };
}