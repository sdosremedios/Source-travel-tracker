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
  return fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function updateTrip(id, data) {
  return fetch(`/api/trips/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

//
// Segments
//
export async function loadSegmentsForTrip(tripId) {
  return fetch(`/api/segments/trip/${tripId}`).then(r => r.json());
}

export async function createSegment(data) {
  return fetch("/api/segments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function updateSegment(id, data) {
  return fetch(`/api/segments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

//
// Tours
//
import { hydrateTour } from "../models/hydrate";

export async function loadToursForTrip(tripId) {
  console.log("loadToursForTrip CALLED with tripId:", tripId);
  const res = await fetch(`/api/tours/trip/${tripId}`);
  const data = await res.json();
  console.log("RAW tours from backend:", data);
  return data.map(hydrateTour);
}

export async function createTour(data) {
  return fetch("/api/tours", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function updateTour(id, data) {
  return fetch(`/api/tours/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function refreshTours() {
  const tours = await loadToursForTrip(selectedTripId);
  setTours(tours);
}
