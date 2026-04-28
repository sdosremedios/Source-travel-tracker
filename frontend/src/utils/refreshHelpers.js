// --- TRIP REFRESH ------------------------------------------------------------
import { loadTrips } from "../api/index";
export async function refreshTrips({
  savedTrip,
  //loadTrips,
  loadSegmentsForTrip,
  loadToursForTrip,
  loadNotesForTrip,
  setTrips,
  setSelectedTripId,
  setSegments,
  setTours,
  setNotes,
  setActiveScreen
}) {
  const trips = await loadTrips();
  const segments = await loadSegmentsForTrip(savedTrip.id);
  const tours = await loadToursForTrip(savedTrip.id);
  const notes = await loadNotesForTrip(savedTrip.id);

  // React 18 will batch all of this automatically
  setTrips(trips);
  setSelectedTripId(savedTrip.id);
  setSegments(segments);
  setTours(tours);
  setNotes(notes);
  setActiveScreen("tripDetail");
}

// --- SEGMENT REFRESH ---------------------------------------------------------

export async function refreshSegments({
  selectedTripId,
  loadSegmentsForTrip,
  setSegments,
  setActiveScreen
}) {
  const segments = await loadSegmentsForTrip(selectedTripId);

  setSegments(segments);
  setActiveScreen("tripDetail");
}

// --- TOUR REFRESH ------------------------------------------------------------

export async function refreshTours({
  selectedTripId,
  loadToursForTrip,
  setTours,
  setActiveScreen
}) {
  const tours = await loadToursForTrip(selectedTripId);

  setTours(tours);
  setActiveScreen("tripDetail");
}

// --- NOTE REFRESH ------------------------------------------------------------

export async function refreshNotes({
  selectedTripId,
  loadNotesForTrip,
  setNotes,
  setActiveScreen
}) {
  const notes = await loadNotesForTrip(selectedTripId);

  setNotes(notes);
  setActiveScreen("tripDetail");
}
