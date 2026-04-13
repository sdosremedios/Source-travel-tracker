//
// Trips
//
export async function loadTrips() {
  return fetch("/api/trips").then(r => r.json());
}

export async function loadFullTrip(id) {
  return fetch(`/api/trips/${id}/full`).then(r => r.json());
}

export async function createTrip(data) {
  console.log("createTrip CALLED with data:", data);
  return fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function updateTrip(id, data) {
  console.log("updateTrip CALLED with id:", id, "data:", data);
  return fetch(`/api/trips/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function deleteTrip(id) {
  const res = await fetch(`/api/trips/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete trip");
  }

  return res.json();
}

//
// Segments
//
export async function loadSegmentsForTrip(tripId) {
  return fetch(`/api/segments/trip/${tripId}`).then(r => r.json());
}

export async function createSegment(data) {
  console.log("createSegment CALLED with data:", data);
  return fetch("/api/segments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function updateSegment(id, data) {
  console.log("updateSegment CALLED with id:", id, "data:", data);
  return fetch(`/api/segments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

//
// Tours
//
//import { hydrateItem } from "../models/hydrate";

export async function loadToursForTrip(tripId) {
  return fetch(`/api/tours/trip/${tripId}`).then(r => r.json());
  /*
  console.log("loadToursForTrip CALLED with tripId:", tripId);
  const res = await fetch(`/api/tours/trip/${tripId}`);
  const data = await res.json();
  console.log("RAW tours from backend:", data);
  return data.map(hydrateTour); */
}

export async function createTour(data) {
  console.log("createTour CALLED with data:", data);
  const response = await fetch("/api/tours", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to create tour");
  }

  return response.json();
}

export async function updateTour(id, data) {
  console.log("updateTour CALLED with id:", id, "data:", data);
  return fetch(`/api/tours/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
