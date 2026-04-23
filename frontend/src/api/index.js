//
// Trips
//
export async function loadTrips() {
  return await fetch("/api/trips").then(r => r.json());
}

export async function loadFullTrip(id) {
  return await fetch(`/api/trips/${id}/full`).then(r => r.json());
}

export async function postTrip(data) {
  console.log("postTrip CALLED with data:", data);
  return await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function patchTrip(id, data) {
  console.log("patchTrip CALLED with id:", id, "data:", data);
  return await fetch(`/api/trips/${id}`, {
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
  return await fetch(`/api/segments/trip/${tripId}`).then(r => r.json());
}

export async function postSegment(data) {
  console.log("postSegment CALLED with data:", data);
  return await fetch("/api/segments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function patchSegment(id, data) {
  console.log("patchSegment CALLED with id:", id, "data:", data);
  return await fetch(`/api/segments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function deleteSegment(id) {
  const res = await fetch(`/api/segments/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
//
// Tours
//
//import { hydrateItem } from "../models/hydrate";

export async function loadToursForTrip(tripId) {
  return await fetch(`/api/tours/trip/${tripId}`).then(r => r.json());
  /*
  console.log("loadToursForTrip CALLED with tripId:", tripId);
  const res = await fetch(`/api/tours/trip/${tripId}`);
  const data = await res.json();
  console.log("RAW tours from backend:", data);
  return data.map(hydrateTour); */
}

export async function postTour(data) {
  console.log("postTour CALLED with data:", data);
  const response = await fetch("/api/tours", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to post tour");
  }

  return response.json();
}

export async function patchTour(id, data) {
  console.log("patchTour CALLED with id:", id, "data:", data);
  return await fetch(`/api/tours/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function deleteTour(id) {
  console.log("deleteTour CALLED with id:", id);
  const res = await fetch(`/api/tours/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
//
// Templates
//
export async function fetchTemplates(type) {
  const url = type
    ? `/api/templates?type=${encodeURIComponent(type)}`
    : `/api/templates`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load templates");
  return res.json();
}

export async function loadNotesForTrip(tripId) {
  console.log("loadNotesForTrip CALLED with tripId:", tripId);
  const res = await fetch(`/api/trips/${tripId}/notes`);
  return res.json();
}

export async function postNote(data) {
  const res = await fetch(`/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function patchNote(id, data) {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(`/api/notes/${id}`, {
    method: "DELETE"
  });

  if (res.status === 204) return { success: true };

  try {
    return await res.json();
  } catch {
    return { success: res.ok };
  }
}
