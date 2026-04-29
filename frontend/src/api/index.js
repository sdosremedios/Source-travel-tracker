// Unifed fetch
export async function fetchItemById(kind, id, tripId) {
  switch (kind) {
    case "segment":
      return await fetchSegment(tripId, id);

    case "tour":
      return await fetchTour(tripId, id);

    case "note":
      return await fetchNote(tripId, id);

    case "trip":
      return await fetchTrip(id); // trips use id for tripId

    default:
      console.error("Unknown kind in fetchItemById:", kind, id);
      return null;
  }
}
//
// Trips
//
export async function fetchTrip(tripId) {
  const res = await fetch(`/api/trips/${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch trip");
  return await res.json();
}
export async function loadTrips() {
  return fetch("/api/trips").then(r => r.json());
}
export async function loadFullTrip(id) {
  return fetch(`/api/trips/${id}`).then(r => r.json());
}
export async function postTrip(data) {
  return fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
export async function patchTrip(id, data) {
  return fetch(`/api/trips/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
export async function deleteTrip(id) {
  const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete trip");
  return { success: true };
}
//
// Segments
//
export async function fetchSegment(tripId, segmentId) {
  const res = await fetch(`/api/trips/${tripId}/segments/${segmentId}`);
  if (!res.ok) throw new Error("Failed to fetch segment");
  return await res.json();
}
export async function loadSegmentsForTrip(tripId) {
  return fetch(`/api/trips/${tripId}/segments`).then(r => r.json());
}

export async function postSegment(tripId, data) {
  return fetch(`/api/trips/${tripId}/segments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function patchSegment(tripId, id, data) {
  return fetch(`/api/trips/${tripId}/segments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

export async function deleteSegment(tripId, id) {
  const res = await fetch(`/api/trips/${tripId}/segments/${id}`, {
    method: "DELETE"
  });
  return { success: res.ok };
}
//
// Tours
//
export async function fetchTour(tripId, tourId) {
  const res = await fetch(`/api/trips/${tripId}/tours/${tourId}`);
  if (!res.ok) throw new Error("Failed to fetch tour");
  return await res.json();
}
export async function loadToursForTrip(tripId) {
  return fetch(`/api/trips/${tripId}/tours`).then(r => r.json());
}
export async function postTour(tripId, data) {
  return fetch(`/api/trips/${tripId}/tours`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
export async function patchTour(tripId, id, data) {
  return fetch(`/api/trips/${tripId}/tours/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
export async function deleteTour(tripId, id) {
  const res = await fetch(`/api/trips/${tripId}/tours/${id}`, {
    method: "DELETE"
  });
  return { success: res.ok };
}
//
// Templates
//
export async function fetchTemplates() {
  const res = await fetch(`/api/templates`);
  if (!res.ok) throw new Error("Failed to load templates");
  return res.json();
}
//
// Notes
//
export async function fetchNote(tripId, noteId) {
  const res = await fetch(`/api/trips/${tripId}/notes/${noteId}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return await res.json();
}
export async function loadNotesForTrip(tripId) {
  return fetch(`/api/trips/${tripId}/notes`).then(r => r.json());
}
export async function postNote(tripId, data) {
  return fetch(`/api/trips/${tripId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
export async function patchNote(tripId, id, data) {
  return fetch(`/api/trips/${tripId}/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}
export async function deleteNote(tripId, id) {
  const res = await fetch(`/api/trips/${tripId}/notes/${id}`, {
    method: "DELETE"
  });
  return { success: res.ok };
}
