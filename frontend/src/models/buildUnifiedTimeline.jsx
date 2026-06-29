// src/models/buildUnifiedTimeline.js

import { formatMonth, formatWeekday, formatDateTime } from "../utils/dateHelpers";

export function buildUnifiedTimeline(segments = [], tours = [], notes = []) {
  const items = [
    ...segments.map(hydrateItemForTimeline),
    ...tours.map(hydrateItemForTimeline),
    ...notes.map(hydrateItemForTimeline)
  ];

  function hydrateItemForTimeline(item) {
    // Trips are date-only, no time
    if (item.kind === "trip") {
      return {
        ...item,
        //      date: item.startDate,                 // already YYYY-MM-DD
        date: date.toLocaleDateString("en-US"),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        monthLabel: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        startLabel: null,
        endLabel: null,
        timelineSortKey: item.startDate
      };
    }

    // Notes have a single timestamp (startDate)
    if (item.kind === "note") {
      const start = new Date(item.dateTime);
      console.log("RAW:", item.dateTime);
      console.log("JSON:", JSON.stringify(item.dateTime));
      console.log("PARSED:", new Date(item.dateTime).toString());
      return {
        ...item,
        date: start.toLocaleDateString("en-US"),
        weekday: start.toLocaleDateString("en-US", { weekday: "short" }),
        monthLabel: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        startLabel: start.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit"
        }),
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
        date: start.toLocaleDateString("en-US"),
        weekday: start.toLocaleDateString("en-US", { weekday: "short" }),
        monthLabel: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        finishDate: end.toLocaleDateString("en-US"),

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

  return items.sort((a, b) => b.timelineSortKey.localeCompare(a.timelineSortKey));
}
