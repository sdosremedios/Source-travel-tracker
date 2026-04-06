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

  // Selected trip ID (from left pane)
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Active item (segment or tour object)
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

    loadSegmentsForTrip(selectedTripId).then(data => setSegments(data || []));
    loadToursForTrip(selectedTripId).then(data => setTours(data || []));
  }, [selectedTripId]);

  // Compute activeTrip from selectedTripId
  const activeTrip = trips.find(t => t.id === selectedTripId) || null;

  // Helpers
  function openTripEditor(id = null) {
    setActiveItem(id ? trips.find(t => t.id === id) : null);
    setActiveScreen("tripEditor");
  }

  function openSegmentEditor(tripId, segment) {
    setSelectedTripId(tripId);   // ← ensures tripId is always defined
    setActiveItem(segment);
    setActiveScreen("segmentEditor");
  }

  function openSegmentDetail(tripId, segment) {
    setSelectedTripId(tripId);   // ← THIS is the missing piece
    setActiveItem(segment);
    setActiveScreen("segmentDetail");
  }

  function openTourEditor(tour) {
    setActiveItem(tour);
    setActiveScreen("tourEditor");
  }

  function openTourDetail(tour) {
    setActiveItem(tour);
    setActiveScreen("tourDetail");
  }

  function openContextMenu(e, item) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      actions: buildActionsFor(item)
    });
  }

  function handleSelectSegment(segment) {
    setSelectedTripId(segment.tripId);
    setActiveItem(segment);
    setActiveScreen("segmentDetail");
  }

  function handleSelectTour(tour) {
    setSelectedTripId(tour.tripId);
    setActiveItem(tour);
    setActiveScreen("tourDetail");
  }

  function buildActionsFor(item) {
    if (!item) return [];

    if (item.type === "segment") {
      return [
        { label: "Edit Segment", icon: "✏️", onClick: () => openSegmentEditor(selectedTripId, item) },
        { label: "Delete Segment", icon: "🗑️", onClick: () => console.log("delete segment", item.id) }
      ];
    }

    if (item.type === "tour") {
      return [
        { label: "Edit Tour", icon: "✏️", onClick: () => openTourEditor(item) },
        { label: "Delete Tour", icon: "🗑️", onClick: () => console.log("delete tour", item.id) }
      ];
    }

    return [];
  }


  function closeContextMenu() {
    setContextMenu(null);
  }

  function closeOverlay() {
    setActiveItem(null);
    setActiveScreen("tripDetail");
  }

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
          onNewTrip={() => openTripEditor(null)}
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
            onEditTrip={openTripEditor}
            onSelectSegment={handleSelectSegment}
            onSelectTour={handleSelectTour}
            onAddSegment={() => openSegmentEditor(selectedTripId, null)}
            onAddTour={() => openTourEditor(null)}
            onContextMenu={openContextMenu}
            onClose={() => setActiveScreen("tripList")}
          />
        )}

        {activeScreen === "segmentDetail" && activeItem && (
          <SegmentDetailScreen
            segment={activeItem}
            onEdit={() => openSegmentEditor(selectedTripId, activeItem)}
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
            onEdit={() => openTourEditor(activeItem)}
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