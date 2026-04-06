// src/models/hydrate.js

import { tourIcon } from "./categories.js";
import { modeIcon } from "../utils/icons.js";
import { weekday, formatMonthYear } from "../utils/date.js";

export function hydrateTrip(trip) {
  return {
    ...trip,
    type: trip.type || trip.tripType || "travel",
    ...hydrateDateFields(trip),
  };
}

export function hydrateSegment(seg) {
  const start = new Date(`${seg.startDate}T${seg.departureTime}`);
  const end = new Date(`${seg.endDate}T${seg.arrivalTime}`);

  const ms = end - start;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return {
    ...seg,
    kind: "segment",
    icon: modeIcon(seg.mode),

    // sorting
    timelineSortKey: `${seg.startDate}T${seg.departureTime}`,

    // grouping
    monthLabel: start.toLocaleString("default", { month: "long" }),
    weekday: start.toLocaleString("default", { weekday: "short" }),
    date: seg.startDate,

    // display
    startDateLabel: seg.startDate,
    startTimeLabel: seg.departureTime,
    endDateLabel: seg.endDate,
    endTimeLabel: seg.arrivalTime,
    durationLabel: `${days}d ${hours}h`,
  };
}

export function hydrateTour(tour) {
  const start = new Date(`${tour.startDate}T${tour.startTime}`);
  const end = new Date(`${tour.endDate}T${tour.endTime}`);

  return {
    ...tour,
    kind: "tour",
    icon: tourIcon(tour.category),
    location: tour.location,

    // sorting
    timelineSortKey: `${tour.startDate}T${tour.startTime}`,

    // grouping
    monthLabel: start.toLocaleString("default", { month: "long" }),
    weekday: start.toLocaleString("default", { weekday: "short" }),
    date: tour.startDate,

    // display
    startDateLabel: tour.startDate,
    startTimeLabel: tour.startTime,
    endDateLabel: tour.endDate,
    endTimeLabel: tour.endTime,
    durationLabel: "",
  };
}

export function buildUnifiedTimeline(segments, tours) {
  const items = [
    ...segments.map(hydrateSegment),
    ...tours.map(hydrateTour),
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
