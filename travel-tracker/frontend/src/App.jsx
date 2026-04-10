import React, { useState, useEffect } from "react";
import TripListScreen from "./screens/TripListScreen";
import TripDetailScreen from "./screens/TripDetailScreen";
import TripEditorScreen from "./screens/TripEditorScreen";
import SegmentDetailScreen from "./screens/SegmentDetailScreen";
import SegmentEditorScreen from "./screens/SegmentEditorScreen";
import TourDetailScreen from "./screens/TourDetailScreen";
import TourEditorScreen from "./screens/TourEditorScreen";
import CommandPalette from "./components/CommandPalette";
import ContextMenu from "./components/ContextMenu";
import { formatDate, formatTime } from "./utils/dateHelpers";

import {
  loadTrips,
  loadSegmentsForTrip,
  loadToursForTrip,
  updateTrip,
  createTrip,
  createTour,
  updateTour,
  updateSegment
} from "./api/index";

export default function App() {
  const appVersion = "0.1.1";
  // Navigation state
  const [activeScreen, setActiveScreen] = useState("tripList");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // Data
  const [trips, setTrips] = useState([]);
  const [segments, setSegments] = useState([]);
  const [tours, setTours] = useState([]);

  // Command palette + context menu
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  // Load trips on startup
  useEffect(() => {
    loadTrips().then(setTrips);
  }, []);


  async function refreshTours() {
    const tours = await loadToursForTrip(selectedTripId);
    setTours(tours);
  }

  async function handleSaveTrip(trip) {
    console.log("handleSaveTrip CALLED with trip:", trip);
    let saved;

    console.log("Updating existing trip with:", trip.tripId, trip);
    saved = await updateTrip(trip.tripId, trip);

    const updatedTrips = await loadTrips();
    setTrips(updatedTrips);

    setSelectedTripId(saved.id);
    setActiveScreen("tripDetail");
  }

  async function handleSaveTour(updated) {
    console.log("handleSaveTour START");

    try {
      if (updated.id) {
        console.log("Calling updateTour");
        await updateTour(updated.id, updated);
      } else {
        console.log("Calling createTour");
        await createTour(updated);
      }

      console.log("Calling refreshTours");
      await refreshTours();

      console.log("Setting screen to tripDetail");
      setActiveScreen("tripDetail");
    } catch (err) {
      console.error("handleSaveTour ERROR:", err);
    }
  }

  async function reloadTours() {
    const data = await fetchTours();
    console.log("Tours after reload:", data);
    setTours(data);
  }

  function hydrateItem(item) {
    if (!item) return null;
    console.log("HydrateItem receives item:", item);

    const id = Number(item.id);
    const kind = item.kind || item.type;

    const addFormattedFields = (obj) => {
      const startDate = obj.startDate;
      const endDate = obj.endDate || obj.startDate;
      const startTime = obj.startTime || obj.departureTime;
      const endTime = obj.endTime || obj.arrivalTime;

      return {
        ...obj,
        startDateLabel: formatDate(startDate),
        endDateLabel: formatDate(endDate),
        startTimeLabel: formatTime(startTime),
        endTimeLabel: formatTime(endTime),
        startDateTimeLabel: `${formatDate(startDate)} ${formatTime(startTime)}`,
        endDateTimeLabel: `${formatDate(endDate)} ${formatTime(endTime)}`
      };
    };

    // SEGMENT
    if (kind === "segment") {
      const hydrated = segments.find(s => Number(s.id) === id);
      const base = hydrated
        ? { ...hydrated, kind: "segment" }   // ⭐ force kind
        : { ...item, kind: "segment" };

      return addFormattedFields(base);
    }

    // TOUR
    if (kind === "tour") {
      const hydrated = tours.find(t => Number(t.id) === id);
      const base = hydrated
        ? { ...hydrated, kind: "tour" }      // ⭐ force kind
        : { ...item, kind: "tour" };

      return addFormattedFields({
        ...base,
        company: base.company ?? ""
      });
    }

    return { ...item, kind };
  }

  // Load segments + tours when selectedTripId changes
  useEffect(() => {
    if (!selectedTripId) return;

    loadSegmentsForTrip(selectedTripId).then(data => {
      setSegments(data.map(hydrateItem));
    });

    loadToursForTrip(selectedTripId).then(data => {
      setTours(data.map(hydrateItem));
    });
  }, [selectedTripId]);

  // Active trip
  const activeTrip = trips.find(t => t.id === selectedTripId) || null;

  // ------------------------------------------------------------
  // Unified Navigation: Detail
  // ------------------------------------------------------------
  function openItemDetail(item) {
    console.log("App openItemDetail item:", item);
    const hydrated = hydrateItem(item);
    console.log("App hydrated item:", hydrated);
    if (!hydrated) return;
    console.log("Opening hydrated detail for hydrated:", hydrated);

    setSelectedTripId(hydrated.tripId);
    setActiveItem(hydrated);

    if (hydrated.kind === "segment") {
      setActiveScreen("segmentDetail");
    } else if (hydrated.kind === "tour") {
      setActiveScreen("tourDetail");
    }
    console.log("Detail screen should be open now with activeItem:", hydrated);
  }

  // ------------------------------------------------------------
  // Unified Navigation: Editor
  // ------------------------------------------------------------
  useEffect(() => {
    console.log("activeScreen:", activeScreen);
  }, [activeScreen]);

  function openItemEditor(item) {
    // NEW ITEM → DO NOT HYDRATE
    console.log("openItemEditor receives item:", item);
    if (!item.id) {
      setSelectedTripId(item.tripId);
      setActiveItem({
        name: "(untitled)",   // ⭐ required because DB requires NOT NULL
        ...item
      });

      if (item.kind === "segment") {
        setActiveScreen("segmentEditor");
      } else if (item.kind === "tour") {
        setActiveScreen("tourEditor");
      }
      return;
    }

    // EXISTING ITEM → HYDRATE
    const hydrated = hydrateItem(item);
    if (!hydrated) return;

    setSelectedTripId(hydrated.tripId);
    setActiveItem(hydrated);

    if (hydrated.kind === "segment") {
      setActiveScreen("segmentEditor");
    } else if (hydrated.kind === "tour") {
      setActiveScreen("tourEditor");
    }
  }

  // ------------------------------------------------------------
  // Context Menu
  // ------------------------------------------------------------
  function openContextMenu(e, item) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      actions: buildActionsFor(item)
    });
  }

  function buildActionsFor(item) {
    if (!item) return [];

    if (item.kind === "segment") {
      return [
        { label: "Edit Segment", icon: "✏️", onClick: () => openItemEditor(item) },
        { label: "Delete Segment", icon: "🗑️", onClick: () => console.log("delete segment", item.id) }
      ];
    }

    if (item.kind === "tour") {
      return [
        { label: "Edit Tour", icon: "✏️", onClick: () => openItemEditor(item) },
        { label: "Delete Tour", icon: "🗑️", onClick: () => console.log("delete tour", item.id) }
      ];
    }

    return [];
  }

  function closeContextMenu() {
    setContextMenu(null);
  }

  // ------------------------------------------------------------
  // Inline Edit
  // ------------------------------------------------------------
  async function handleInlineEdit(item, field, value) {
    const hydrated = hydrateItem(item);
    if (!hydrated) return;

    if (hydrated.kind === "segment") {
      const refreshed = await loadSegmentsForTrip(hydrated.tripId);
      setSegments(refreshed);
    }

    if (hydrated.kind === "tour") {
      const refreshed = await loadToursForTrip(hydrated.tripId);
      setTours(refreshed);
    }
  }

  // ------------------------------------------------------------
  // Close overlay
  // ------------------------------------------------------------
  function closeOverlay() {
    setActiveItem("null");
    setActiveScreen("tripDetail");
  }
  // ------------------------------------------------------------
  // Close overlay
  // ------------------------------------------------------------
  function closeTripDetail() {
    setActiveItem("null");
    setActiveScreen("empty");
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="app-root">
      {/* Left Pane */}
      <div className="app-left">
        <div className="app-header">
          <h1>Travel Tracker</h1>
          <p>Version {appVersion}</p>
        </div>
        <TripListScreen
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={(id) => {
            setSelectedTripId(id);
            setActiveScreen("tripDetail");
          }}
          onNewTrip={() => setActiveScreen("tripEditor")}
          appVersion={appVersion}
        />
      </div>

      {/* Right Pane */}
      <div className="app-right">
        {/* ⭐ This is the empty-state text */}
        {activeScreen === "empty" && (
          <div className="empty-state">
            <p>Select a trip from the list or create a new one.</p>
          </div>
        )}
        {activeScreen === "tripList" && (
          <div style={{ padding: 24 }}>Add or select a trip.</div>
        )}

        {activeScreen === "tripDetail" && activeTrip && (
          <TripDetailScreen
            trip={activeTrip}
            segments={segments}
            tours={tours}
            onClose={closeTripDetail}
            onEditTrip={(id) => {
              console.log("Edit trip with id:", id);

              const trip = trips.find(t => t.id === id);   // ⭐ hydrate here

              setSelectedTripId(id);
              setActiveItem(trip);                         // ⭐ pass full object
              setActiveScreen("tripEditor");
            }}
            onSelectItem={openItemDetail}
            onAddSegment={() => openItemEditor({ kind: "segment", tripId: selectedTripId })}
            onAddTour={() => openItemEditor({ kind: "tour", tripId: selectedTripId })}
            onContextMenu={openContextMenu}
            onInlineEdit={handleInlineEdit}
          />
        )}

        {activeScreen === "tripEditor" && (
          <TripEditorScreen
            trip={activeItem}
            onClose={closeOverlay}
            onSave={handleSaveTrip}
          />
        )}

        {activeScreen === "segmentDetail" && activeItem && (
          <SegmentDetailScreen
            segment={activeItem}
            onEdit={() => openItemEditor(activeItem)}
            onClose={closeOverlay}
          />
        )}

        {activeScreen === "segmentEditor" && (
          <SegmentEditorScreen
            tripId={selectedTripId}
            segment={activeItem}
            onCancel={closeOverlay}
            onSaved={async () => {
              await loadSegmentsForTrip(selectedTripId).then(setSegments);
              setActiveScreen("tripDetail");
            }}
          />
        )}

        {activeScreen === "tourDetail" && activeItem && (
          <TourDetailScreen
            tour={activeItem}
            segments={segments}
            onEdit={() => openItemEditor(activeItem)}
            onSelectSegment={openItemDetail}
            onClose={closeOverlay}
          />
        )}

        {activeScreen === "tourEditor" && (
          <TourEditorScreen
            tripId={selectedTripId}
            tour={activeItem}
            onCancel={closeOverlay}
            onSave={handleSaveTour}
          />
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setPaletteOpen(false)}
        onCommand={() => { }}
        trips={trips}
        segments={segments}
        tours={tours}
        activeScreen={activeScreen}
        activeItem={activeItem}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={contextMenu.actions}
          onAction={(action) => {
            action.onClick();
            closeContextMenu();
          }}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
