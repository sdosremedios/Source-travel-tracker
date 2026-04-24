import React, { useState, useRef, useEffect } from "react";
import TripListScreen from "./screens/TripListScreen";
import TripDetailScreen from "./screens/TripDetailScreen";
import TripEditorScreen from "./screens/TripEditorScreen";
import SegmentDetailScreen from "./screens/SegmentDetailScreen";
import SegmentEditorScreen from "./screens/SegmentEditorScreen";
import TourDetailScreen from "./screens/TourDetailScreen";
import TourEditorScreen from "./screens/TourEditorScreen";
import NoteEditorScreen from "./screens/NoteEditorScreen";
import NoteDetailScreen from "./screens/NoteDetailScreen";
import CommandPalette from "./components/CommandPalette";
import ContextMenu from "./components/ContextMenu";
import { createItem } from "./api/createItem";
import { formatDate, formatTime } from "./utils/dateHelpers";
import hydrateItem from "./api/hydrate"

import {
  loadTrips,
  loadSegmentsForTrip,
  loadToursForTrip,
  loadNotesForTrip,
  patchTrip,
  postTrip,
  postTour,
  patchTour,
  patchSegment,
  deleteSegment,
  deleteTour,
  fetchTemplates
} from "./api/index";

import favicon from "./assets/favicon.png";

export default function App() {
  const appVersion = "0.3.3";
  // Navigation state
  const [activeScreen, setActiveScreen] = useState("tripList");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [allTemplates, setAllTemplates] = useState([]);

  // Data
  const [segments, setSegments] = useState([]);
  const [tours, setTours] = useState([]);
  const [notes, setNotes] = useState([]);
  // Command palette + context menu
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const rightPaneRef = useRef(null);

  useEffect(() => {
    fetch("/api/templates")
      .then(res => res.json())
      .then(setAllTemplates)
      .catch(err => console.error("Failed to load templates", err));
    console.log("allTemplates loaded:", allTemplates)
  }, []);


  // Load trips on startup
  useEffect(() => {
    loadTrips().then(data => {
      console.log("loadTrips returned:", data);
      setTrips(data);
    });
  }, []);

  // always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeScreen, selectedTripId]);

  async function refreshSegments() {
    const segments = await loadSegmentsForTrip(selectedTripId);
    setSegments(segments);
    return segments;
  }
  async function refreshTours() {
    const tours = await loadToursForTrip(selectedTripId);
    setTours(tours);
    return tours;
  }
  async function refreshNotes() {
    const notes = await loadNotesForTrip(selectedTripId);
    setNotes(notes);
    return notes;
  }
  async function handleSave() {
    const item = activeItem;
    const isEditing = item.id != null;

    const saved = isEditing
      ? await patchItem(item)
      : await postItem(item);

    onRefresh(saved);
    openDetail(saved);
  }
  /*
    async function handleSaveTrip(trip) {
      console.log("handleSaveTrip CALLED with trip:", trip);
      let saved;
  
      console.log("Updating existing trip with:", trip.tripId, trip);
      saved = await updateTrip(trip.tripId, trip);
  
      const updatedTrips = await loadTrips();
      setTrips(updatedTrips);
  
      const updatedTrip = updatedTrips.find(t => t.id === trip.tripId);
      setSelectedTripId(trip.tripId);
      console.log("Updated trip found:", trip.tripId, updatedTrip);
      setActiveItem(updatedTrip);
      setActiveScreen("tripDetail");
    }
  */
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
  /*
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
  */
  // Load segments + tours when selectedTripId changes
  useEffect(() => {
    if (!selectedTripId) return;

    loadSegmentsForTrip(selectedTripId).then(data => {
      setSegments(data.map(hydrateItem));
    });

    loadToursForTrip(selectedTripId).then(data => {
      setTours(data.map(hydrateItem));
    });

    loadNotesForTrip(selectedTripId).then(data => {
      setNotes(data);
    });
  }, [selectedTripId]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (rightPaneRef.current) {
        rightPaneRef.current.scrollTop = 0;
      }
    });
  }, [activeScreen, activeItem?.id]);

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
    } else if (hydrated.kind === "note") {
      setActiveScreen("noteDetail");
    } else if (hydrated.kind === "trip") {
      setActiveScreen("tripDetail");
    }
    console.log("Detail screen should be open now with activeItem:", hydrated);
  }

  // ------------------------------------------------------------
  // Unified Navigation: Editor
  // ------------------------------------------------------------
  useEffect(() => {
    console.log("activeScreen:", activeScreen, " with activeItem:", activeItem);
  }, [activeScreen]);

  useEffect(() => {
    if (!selectedTripId) {
      setActiveTrip(null);
      return;
    }

    const trip = trips.find(t => t.id === selectedTripId) || null;
    setActiveTrip(trip);
  }, [selectedTripId, trips]);

  function openItemEditor(item) {
    // NEW ITEM → DO NOT HYDRATE
    console.log("openItemEditor receives item:", item);
    if (!item.id) {
      console.log("Opening NEW editor for item:", item);
      setSelectedTripId(item.tripId);
      setActiveItem({
        name: "(untitled)",
        ...item
      });

      if (item.kind === "segment") {
        setActiveScreen("segmentEditor");
      } else if (item.kind === "tour") {
        setActiveScreen("tourEditor");
      } else if (item.kind === "note") {
        setActiveScreen("noteEditor");
      } else if (item.kind === "trip") {
        setActiveScreen("tripEditor")
      }
      return;
    }
    console.log("Opening editor for EXISTING item:", item);
    // EXISTING ITEM → HYDRATE
    const hydrated = hydrateItem(item);
    if (!hydrated) return;

    setSelectedTripId(hydrated.tripId);
    setActiveItem(hydrated);

    if (hydrated.kind === "segment") {
      setActiveScreen("segmentEditor");
    } else if (hydrated.kind === "tour") {
      setActiveScreen("tourEditor");
    } else if (hydrated.kind === "note") {
      setActiveScreen("noteEditor");
    } else if (hydrated.kind === "trip") {
      setActiveScreen("tripEditor");
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
  /*
    Usage:
      openEditor(createItem("segment", trip));
      openEditor(existingTrip);
      openEditor(existingSegment);
      openEditor(existingTour);
      openEditor(existingNote);
  */
  function openEditor(item) {
    const hydrated = hydrateItem(item);
    setActiveItem(hydrated);
    setActiveScreen(hydrated.kind + "Editor");
  }
  function closeEditor() {
    const item = activeItem;

    if (!item) {
      setActiveScreen("tripList");
      return;
    }

    if (item.id != null) {
      setSelectedTripId(item.tripId ?? item.id);
      setActiveScreen(item.kind + "Detail");
      return;
    }

    if (item.tripId) {
      setSelectedTripId(item.tripId);
      setActiveScreen("tripDetail");
    } else {
      setActiveScreen("tripList");
    }
  }
  function openDetail(item) {
    setActiveItem(item);
    setSelectedTripId(item.tripId ?? item.id);
    setActiveScreen(item.kind + "Detail");
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
  async function closeTripDetail() {
    const trips = await loadTrips();
    setTrips(trips);

    setSelectedTripId(null);   // ⭐ THIS is the missing piece
    setActiveItem(null);       // "null" (string) was a bug — use null
    setActiveTrip(null);
    setActiveScreen("tripList");
  }


  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className={`app-root ${activeScreen}`}>
      {/* Left Pane */}
      <div className="app-left">
        <div className="app-header">
          <h1>
            <img
              src={favicon}
              alt=""
              className="tls-app-icon"
            />
            Travel Tracker
          </h1>
          <p>Version {appVersion}</p>
        </div>
        <TripListScreen
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={(id) => {
            setSelectedTripId(id);
            setActiveScreen("tripDetail");
          }}
          onRefresh={loadTrips}
          onNewTrip={() => {
            const newTrip = createItem("trip");
            setSelectedTripId(null);
            setActiveItem(newTrip);
            setActiveScreen("tripEditor");
          }}
          appVersion={appVersion}
        />
      </div>

      {/* Right Pane */}
      <div className="app-right" ref={rightPaneRef}>
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
            notes={notes}
            onClose={closeTripDetail}
            rightPaneRef={rightPaneRef}

            onRefresh={async (id) => {
              const trip = await loadTrip(id);
              const segments = await loadSegmentsForTrip(id);
              const tours = await loadToursForTrip(id);
              const notes = await loadNotesForTrip(id);

              setActiveTrip(trip);   // ⭐ MUST update this
              setSegments(segments);
              setTours(tours);
              setNotes(notes);

              // ⭐ DO NOT setActiveScreen("tripDetail")
              // You're already on tripDetail, so this would cause a loop.
            }}
            openTripEditor={(id) => {
              //console.log("Edit trip with id:", id);

              const trip = trips.find(t => t.id === id);   // ⭐ hydrate here

              setSelectedTripId(id);
              setActiveItem(trip);                         // ⭐ pass full object
              setActiveScreen("tripEditor");
            }}

            onSelectItem={(item) => openItemDetail(item)}

            openItemEditor={openItemEditor}
            openSegmentEditor={openItemEditor}
            openTourEditor={openItemEditor}
            openNoteEditor={openItemEditor}
            onContextMenu={openContextMenu}
            onInlineEdit={handleInlineEdit}
          />
        )}

        {activeScreen === "tripEditor" && activeItem && (
          <TripEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            //trip={activeItem}
            onClose={() => {
              const id = activeItem?.id;

              if (id) {
                setSelectedTripId(id);
                setActiveScreen("tripDetail");
              } else {
                // User cancelled creating a new trip
                setSelectedTripId(null);
                setActiveScreen("tripList");
              }
            }}
            onRefresh={async (savedTrip) => {
              console.log("Refreshing after CREATE or UPDATE in TripEditorScreen:", savedTrip);

              // 1. Reload the trip list
              const updatedTrips = await loadTrips();
              setTrips(updatedTrips);

              // 2. Hydrate the saved trip from the updated list
              const hydratedTrip = updatedTrips.find(t => t.id === savedTrip.id);

              // 3. Update activeItem + selectedTripId
              setActiveItem(hydratedTrip);
              setSelectedTripId(savedTrip.id);

              // 4. Reload trip detail data
              // const trip = await loadTrip(savedTrip.id);
              const segments = await loadSegmentsForTrip(savedTrip.id);
              const tours = await loadToursForTrip(savedTrip.id);
              const notes = await loadNotesForTrip(savedTrip.id);

              // setActiveTrip(trip);
              setSegments(segments);
              setTours(tours);
              setNotes(notes);

              // 5. Switch to TripDetailScreen
              setActiveScreen("tripDetail");
            }}
          />
        )}
        {activeScreen === "segmentDetail" && activeItem && (
          <SegmentDetailScreen
            segment={activeItem}
            onEdit={() => {
              openItemEditor(activeItem);
            }}
            onClose={async (tripId) => {
              setActiveScreen("tripDetail")
            }}
            onRefresh={async () => {
              setTrips(await loadSegmentsForTrip(selectedTripId));
            }}
          />
        )}

        {activeScreen === "segmentEditor" && activeItem && (
          <SegmentEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            activeTrip={activeTrip}
            onCancel={closeOverlay}
            onRefresh={async (updatedSegment) => {
              await refreshSegments();
              setActiveItem(updatedSegment);
              setActiveScreen("segmentDetail");
            }}
            allTemplates={allTemplates}
          />
        )}

        {activeScreen === "tourDetail" && activeItem && (
          <TourDetailScreen
            tour={activeItem}
            tours={tours}
            onEdit={() => openItemEditor(activeItem)}
            onSelectSegment={openItemDetail}
            onClose={closeOverlay}
            onRefresh={async () => {
              console.log("Refreshing tours after delete...");
              setTrips(await loadToursForTrip(selectedTripId));
            }}

          />
        )}
        {activeScreen === "tourEditor" && activeItem && (
          <TourEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            activeTrip={activeTrip}
            onCancel={closeOverlay}
            onRefresh={async (updatedTour) => {
              console.log("Refreshing tours after delete or edit");
              await refreshTours();
              setActiveItem(updatedTour);
              setActiveScreen("tourDetail");
            }}
            allTemplates={allTemplates}
          />
        )}
        {activeScreen === "noteDetail" && activeItem && (
          <NoteDetailScreen
            note={activeItem}
            onEdit={() => openItemEditor(activeItem)}
            onSelectSegment={openItemDetail}
            onClose={closeOverlay}
            onRefresh={refreshNotes}
          />
        )}
        {activeScreen === "noteEditor" && activeItem && (
          <NoteEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            activeTrip={activeTrip}
            onCancel={async () =>{ 
              openItemDetail(activeItem); 
            }}
            onRefresh={async (updatedNote) => {
              console.log("NoteEditorScreen refreshNotes", updatedNote);
              await refreshNotes();     // updates notes array
              setActiveItem(updatedNote); // ⭐ always correct
              setActiveScreen("noteDetail");
            }}
            allTemplates={allTemplates}
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
