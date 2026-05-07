import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { buildUnifiedTimeline } from "./models/buildUnifiedTimeline";
import {
  refreshTrips,
  refreshSegments,
  refreshTours,
  refreshNotes
} from "./utils/refreshHelpers";

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
  fetchTemplates,
  fetchItemById,
} from "./api/index";

import favicon from "./assets/favicon.png";

export default function App() {
  const appVersion = "0.4.21";
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
  // ------------------------------------------------------------
  // Timeline Items
  // ------------------------------------------------------------
  const [timelineItems, setTimelineItems] = useState([]);
  useEffect(() => {
    setTimelineItems(buildUnifiedTimeline(segments, tours, notes));
  }, [segments, tours, notes]);


  // DEBUG Logging 
  useEffect(() => {
    console.log("activeItem changed:", activeItem);
  }, [activeItem]);

  useEffect(() => {
    console.log("activeScreen:", activeScreen, " with activeItem:", activeItem);
  }, [activeScreen]);

  // always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeScreen, selectedTripId]);

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
  useEffect(() => {
    if (!selectedTripId) {
      setActiveTrip(null);
      return;
    }

    const trip = trips.find(t => t.id === selectedTripId) || null;
    setActiveTrip(trip);
  }, [selectedTripId, trips]);

  // Load segments + tours when selectedTripId changes
  // ------------------------------------------------------------
  // Segment helpers
  // ------------------------------------------------------------
  function normalizeTripForEditor(trip) {
    const dep = new Date(trip.startDate);
    const arr = new Date(trip.endDate);

    return {
      ...trip,

      // Local date fields for <input type="date">
      startDate: dep.toLocaleDateString("en-CA"), // YYYY-MM-DD
      endDate: arr.toLocaleDateString("en-CA"),

      type: trip.type || "",
      tripNotes: trip.tripNotes || "",
    };
  }
  function normalizeSegmentForEditor(segment) {
    const dep = new Date(segment.startDate);
    const arr = new Date(segment.endDate);

    return {
      ...segment,

      // Local date fields for <input type="date">
      startDate: dep.toLocaleDateString("en-CA"), // YYYY-MM-DD
      endDate: arr.toLocaleDateString("en-CA"),

      // Local time fields for <input type="time">
      departureTime: dep.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      arrivalTime: arr.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      }),

      fromLocation: segment.fromLocation || "",
      toLocation: segment.toLocation || "",
      mode: segment.mode || "",
      notes: segment.notes || "",
      carrier: segment.carrier || ""
    };
  }

  function normalizeSegmentForDetail(segment) {
    const dep = new Date(segment.startDate);
    const arr = new Date(segment.endDate);

    return {
      ...segment,

      // Preserve canonical UTC timestamps
      startDateUtc: segment.startDate,
      endDateUtc: segment.endDate,

      // Local display fields
      startDate: dep.toLocaleDateString("en-US"), // MM/DD/YYYY
      endDate: arr.toLocaleDateString("en-US"),

      departureTime: dep.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      arrivalTime: arr.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),

      // Ensure all fields exist
      fromLocation: segment.fromLocation || "",
      toLocation: segment.toLocation || "",
      mode: segment.mode || "",
      notes: segment.notes || "",
      carrier: segment.carrier || ""
    };
  }

  // ------------------------------------------------------------
  // Tour helpers
  // ------------------------------------------------------------
  function normalizeTourForEditor(tour) {
    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate);

    return {
      ...tour,
      startDate: start.toLocaleDateString("en-CA"),   // YYYY-MM-DD
      startTime: start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      endDate: end.toLocaleDateString("en-CA"),
      endTime: end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    };
  }

  function normalizeTourForDetail(tour) {
    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate);

    return {
      ...tour,

      startDateUtc: tour.startDate,
      endDateUtc: tour.endDate,

      startDate: start.toLocaleDateString("en-US"),
      endDate: end.toLocaleDateString("en-US"),

      startTime: start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      endTime: end.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      }),

      name: tour.name || "",
      notes: tour.notes || ""
    };
  }
  // ------------------------------------------------------------
  // Note helpers
  // ------------------------------------------------------------
  function normalizeNoteForEditor(note) {
    const d = new Date(note.dateTime);

    // Convert UTC → local "YYYY-MM-DDTHH:mm"
    const local = d
      .toLocaleString("sv-SE")  // YYYY-MM-DD HH:mm:ss (local)
      .replace(" ", "T")
      .slice(0, 16);

    return {
      ...note,
      dateTime: local,      // <-- what your editor expects
      note: note.note || "" // ensure defined
    };
  }

  function normalizeNoteForDetail(note) {
    const d = new Date(note.dateTime);

    const local = d
      .toLocaleString("sv-SE")  // YYYY-MM-DD HH:mm:ss
      .replace(" ", "T")
      .slice(0, 16);            // YYYY-MM-DDTHH:mm

    return {
      ...note,

      dateTimeUtc: note.dateTime,
      dateTime: local,

      note: note.note || ""
    };
  }
  // ------------------------------------------------------------
  // Unified helpers
  // ------------------------------------------------------------
  function normalizeItemForEditor(item) {
    if (item.kind === "tour") {
      return normalizeTourForEditor(item);
    }
    if (item.kind === "segment") {
      return normalizeSegmentForEditor(item);
    }
    if (item.kind === "note") {
      return normalizeNoteForEditor(item);
    }
    if (item.kind === "trip") {
      return normalizeTripForEditor(item);
    }
    return item;
  }

  function normalizeItemForDetail(item) {
    switch (item.kind) {
      case "segment":
        return normalizeSegmentForDetail(item);
      case "tour":
        return normalizeTourForDetail(item);
      case "note":
        return normalizeNoteForDetail(item);
      case "trip":
        return item; // trips don't use activeItem
      default:
        return item;
    }
  }
  // Used for segments and tours
  function createNewTimedItemDefaults(item) {
    const today = new Date();
    const defaultDate = today.toLocaleDateString("en-CA");

    return {
      ...item,
      name: "(untitled)",
      startDate: defaultDate,
      startTime: "",
      endDate: defaultDate,
      endTime: ""
    };
  }
  // ------------------------------------------------------------
  // Unified Navigation: Detail
  // ------------------------------------------------------------
  async function openItemDetail(item) {
    console.log("App openItemDetail item:", item);
    const hydrated = hydrateItem(item);
    if (!hydrated) return;

    const full = await fetchItemById(
      item.kind,
      item.id,
      item.tripId || activeTrip.id);

    const hydratedFull = hydrateItem(full);
    const normalized = normalizeItemForDetail(hydratedFull);

    console.log("Opening normalized detail for hydrated:", normalized);

    setSelectedTripId(normalized.tripId);

    if (hydrated.kind === "segment") {
      setActiveItem(normalized);
      setActiveScreen("segmentDetail");
    } else if (hydrated.kind === "tour") {
      setActiveItem(normalized);
      setActiveScreen("tourDetail");
    } else if (hydrated.kind === "note") {
      setActiveItem(normalized);
      setActiveScreen("noteDetail");
    } else if (hydrated.kind === "trip") {
      setActiveScreen("tripDetail");
    }

    console.log("Detail screen activeItem:", normalized);
  }
  async function openItemEditor(item) {
    console.log("openItemEditor receives item:", item);

    // NEW ITEM → DO NOT HYDRATE
    if (!item.id) {
      setSelectedTripId(item.tripId);

      if (item.kind === "tour" || item.kind === "segment") {
        const newItem = createNewTimedItemDefaults(item);
        setActiveItem(newItem);
        setActiveScreen(item.kind === "tour" ? "tourEditor" : "segmentEditor");
      }

      else if (item.kind === "note") {
        setActiveItem({ name: "(untitled)", ...item });
        setActiveScreen("noteEditor");
      }

      else if (item.kind === "trip") {
        const newTrip = createItem("trip");
        setActiveItem(newTrip);
      }

      return;
    }

    // EXISTING ITEM → HYDRATE
    // EXISTING ITEM → FETCH FULL DB RECORD
    const full = await fetchItemById(item.kind, item.id, item.tripId || activeTrip.id);
    if (!full) return;

    // Normalize for editor (NOT hydrateItem)
    const normalized = normalizeItemForEditor(full);
    console.log("normalizeItemForEditor:", normalized);

    setSelectedTripId(normalized.tripId);
    setActiveItem(normalized);

    if (normalized.kind === "tour") {
      setActiveScreen("tourEditor");
    }
    else if (normalized.kind === "segment") {
      setActiveScreen("segmentEditor");
    }
    else if (normalized.kind === "note") {
      setSelectedTripId(normalized.tripId);
      setActiveScreen("noteEditor");
    }
    else if (normalized.kind === "trip") {
      // 1. Set the item
      setActiveItem(normalized);
      setSelectedTripId(normalized.id);
      setActiveScreen("tripEditor");
      return;
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
  function openEditor(item) {
    const hydrated = hydrateItem(item);
    setActiveItem(hydrated);
    setActiveScreen(hydrated.kind + "Editor");
  }
  function closeEditor() {
    const item = activeItem;

    // If no activeItem → we were editing a trip
    if (!item) {
      setActiveScreen("tripList");
      return;
    }

    // Existing child item (segment/tour/note)
    if (item.id != null) {
      setSelectedTripId(item.tripId);
      setActiveScreen(item.kind + "Detail");
      return;
    }

    // New child item
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
   */
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

    setSelectedTripId(null);
    setActiveItem(null);   // only affects child editors
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
            timelineItems={timelineItems}
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
            onSelectItem={(item) => openItemDetail(item)}
            openItemEditor={openItemEditor}
            onContextMenu={openContextMenu}
            onInlineEdit={handleInlineEdit}
          />
        )}

        {activeScreen === "tripEditor" && (
          <TripEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            onCancel={() => {
              if (selectedTripId) {
                setActiveScreen("tripDetail");
              } else {
                setActiveScreen("tripList");
              }
            }}
            onRefresh={async (savedTrip) => {
              await refreshTrips({
                savedTrip,
                loadTrips,
                loadSegmentsForTrip,
                loadToursForTrip,
                loadNotesForTrip,
                setTrips,
                setSelectedTripId,
                setSegments,
                setTours,
                setNotes,
                setActiveScreen
              });
            }}
            allTemplates={allTemplates}
          />
        )}
        {activeScreen === "segmentDetail" && activeItem && (
          <SegmentDetailScreen
            segment={activeItem}
            onEdit={(segment) => {
              openItemEditor(segment);
            }}
            onClose={async (tripId) => {
              setActiveScreen("tripDetail")
            }}
            onRefresh={async (segment) => {
              await refreshSegments({
                selectedTripId: segment.tripId,
                loadSegmentsForTrip,
                setSegments,
                setActiveScreen
              });
            }}
          />
        )}

        {activeScreen === "segmentEditor" && activeItem && (
          <SegmentEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            activeTrip={activeTrip}
            onCancel={closeOverlay}
            onRefresh={async (segment) => {
              await refreshSegments({
                selectedTripId: segment.tripId,   // ✔ FIXED
                loadSegmentsForTrip,
                setSegments,
                setActiveScreen
              });
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
            onRefresh={async (tour) => {
              await refreshTours({
                selectedTripId: tour.tripId,
                loadToursForTrip,
                setTours,
                setActiveScreen
              });
            }}

          />
        )}
        {activeScreen === "tourEditor" && activeItem && (
          <TourEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            activeTrip={activeTrip}
            onCancel={closeOverlay}
            onRefresh={async (tour) => {
              await refreshTours({
                selectedTripId: tour.tripId,
                loadToursForTrip,
                setTours,
                setActiveScreen
              });
            }} allTemplates={allTemplates}
          />
        )}
        {activeScreen === "noteDetail" && activeItem && (
          <NoteDetailScreen
            note={activeItem}
            activeTrip={activeTrip}
            onEdit={() => openItemEditor(activeItem)}
            onSelectSegment={openItemDetail}
            onClose={closeOverlay}
            onRefresh={async (note) => {
              await refreshNotes({
                selectedTripId: note.tripId,
                loadNotesForTrip,
                setNotes,
                setActiveScreen
              });
            }}
          />
        )}
        {activeScreen === "noteEditor" && activeItem && (
          <NoteEditorScreen
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            activeTrip={activeTrip}
            onCancel={closeOverlay}
            /*            onRefresh={async (note) =>{
                          notes = await loadNotesForTrip(note.tripId);
                        }}
            */
            onRefresh={async (note) => {
              await refreshNotes({
                selectedTripId: note.tripId,
                loadNotesForTrip,
                setNotes,
                setActiveScreen
              });
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
