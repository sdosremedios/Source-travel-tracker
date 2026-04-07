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

import {
  loadTrips,
  loadSegmentsForTrip,
  loadToursForTrip
} from "./api";

export default function App() {
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

  // Load segments + tours when selectedTripId changes
  useEffect(() => {
    if (!selectedTripId) return;

    loadSegmentsForTrip(selectedTripId).then(data => {
      const hydrated = data.map(seg => hydrateItem(seg));
      setSegments(hydrated);
    });

    loadToursForTrip(selectedTripId).then(data => {
      const hydrated = data.map(t => hydrateItem(t));
      setTours(hydrated);
    });
  }, [selectedTripId]);

  // Active trip
  const activeTrip = trips.find(t => t.id === selectedTripId) || null;

  // ------------------------------------------------------------
  // Unified Hydration Lookup
  // ------------------------------------------------------------
  function hydrateItem(item) {
    if (!item) return null;

    const id = Number(item.id);  // normalize
    const kind = item.kind || item.type;

    if (kind === "segment") {
      const hydrated = segments.find(s => Number(s.id) === id);
      return hydrated ? { ...hydrated, kind: "segment" } : { ...item, kind: "segment" };
    }

    if (kind === "tour") {
      const hydrated = tours.find(t => Number(t.id) === id);
      return hydrated ? { ...hydrated, kind: "tour" } : { ...item, kind: "tour" };
    }

    return { ...item, kind };
  }

  // ------------------------------------------------------------
  // Unified Navigation: Detail
  // ------------------------------------------------------------
  function openItemDetail(item) {
    console.log("Hydrating item:", item);
    const hydrated = hydrateItem(item);
    if (!hydrated) return;
    console.log("Opening hydrated detail for item:", hydrated);

    setSelectedTripId(hydrated.tripId);
    setActiveItem(hydrated);

    if (hydrated.kind === "segment") {
      setActiveScreen("segmentDetail");
    } else if (hydrated.kind === "tour") {
      setActiveScreen("tourDetail");
    }
  }

  // ------------------------------------------------------------
  // Unified Navigation: Editor
  // ------------------------------------------------------------
  function openItemEditor(item) {
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
    setActiveItem(null);
    setActiveScreen("tripDetail");
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="app-root">
      {/* Left Pane */}
      <div className="app-left">
        <TripListScreen
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={(id) => {
            setSelectedTripId(id);
            setActiveScreen("tripDetail");
          }}
          onNewTrip={() => setActiveScreen("tripEditor")}
        />
      </div>

      {/* Right Pane */}
      <div className="app-right">
        {activeScreen === "tripList" && (
          <div style={{ padding: 24 }}>Select a trip from the left.</div>
        )}

        {activeScreen === "tripDetail" && activeTrip && (
          <TripDetailScreen
            trip={activeTrip}
            segments={segments}
            tours={tours}
            onSelectSegment={openItemDetail}
            onSelectTour={openItemDetail}
            onClose={closeOverlay}
            onEditTrip={() => setActiveScreen("tripEditor")}
            onAddSegment={() => openItemEditor({ kind: "segment", tripId: selectedTripId })}
            onAddTour={() => openItemEditor({ kind: "tour", tripId: selectedTripId })}
            onContextMenu={openContextMenu}
            onInlineEdit={handleInlineEdit}
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
            onClose={closeOverlay}
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
            onClose={closeOverlay}
            onSaved={async () => {
              await loadToursForTrip(selectedTripId).then(setTours);
              setActiveScreen("tripDetail");
            }}
          />
        )}

        {activeScreen === "tripEditor" && (
          <TripEditorScreen
            trip={activeItem}
            onClose={closeOverlay}
            onSaved={async (newTripId) => {
              const updated = await loadTrips();
              setTrips(updated);
              if (newTripId) setSelectedTripId(newTripId);
              setActiveScreen("tripDetail");
            }}
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
          onAction={() => { }}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
