//
// TRIPS
//

export async function loadTrips() {
  const res = await fetch("/api/trips");
  if (!res.ok) throw new Error("Failed to load trips");
  return await res.json();
}

export async function loadTripFull(tripId) {
  const res = await fetch(`/api/trips/${tripId}/full`);
  if (!res.ok) throw new Error("Failed to load full trip");
  return await res.json(); // { trip, segments, tours }
}

export async function saveTrip(trip) {
  const isNew = !trip.id;

  const url = isNew ? "/api/trips" : `/api/trips/${trip.id}`;
  const method = isNew ? "POST" : "PATCH";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip)
  });

  if (!res.ok) throw new Error("Failed to save trip");
  return await res.json(); // { id }
}

//
// SEGMENTS
//

export async function loadSegmentsForTrip(tripId) {
  const res = await fetch(`/api/trips/${tripId}/segments`);
  if (!res.ok) throw new Error("Failed to load segments");
  return await res.json(); // array
}

export async function createSegment(segment) {
  const res = await fetch("/api/segments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(segment)
  });

  if (!res.ok) throw new Error("Failed to create segment");
  return await res.json(); // { id }
}

export async function updateSegment(id, segment) {
  const res = await fetch(`/api/segments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(segment)
  });

  if (!res.ok) throw new Error("Failed to update segment");
  return await res.json(); // { success: true }
}

//
// TOURS
//

export async function loadToursForTrip(tripId) {
  const res = await fetch(`/api/trips/${tripId}/tours`);
  if (!res.ok) throw new Error("Failed to load tours");
  return await res.json(); // array
}

export async function createTour(tour) {
  const res = await fetch("/api/tours", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tour)
  });

  if (!res.ok) throw new Error("Failed to create tour");
  return await res.json(); // { id }
}

export async function updateTour(id, tour) {
  const res = await fetch(`/api/tours/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tour)
  });

  if (!res.ok) throw new Error("Failed to update tour");
  return await res.json(); // { success: true }
}