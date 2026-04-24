import React, { useState, useEffect } from "react";
import Markdown from "../components/Markdown";
import UnifiedTimeline from "../components/UnifiedTimeline";
import { buildUnifiedTimeline } from "../models/buildUnifiedTimeline";
import { tripIcon, actionIcon } from "../utils/icons";
import { deleteTrip } from "../api";
import { formatDate } from "../utils/dateHelpers";
import { createItem } from "../api/createItem";

import "../styles/TripDetailScreen.css";
import "../styles/TimelineRow.css";

export default function TripDetailScreen({
  trip,
  segments,
  tours,
  notes,
  onClose,
  onSelectItem,
  openItemEditor,
  openTripEditor,
  openSegmentEditor,
  openTourEditor,
  openNoteEditor,
  onContextMenu,
  onRefresh,
  rightPaneRef,
  onInlineEdit
}) {

  // Build the unified timeline (segments + tours + notes)
  const timelineItems = buildUnifiedTimeline(segments, tours, notes);
  const [showNotes, setTripNotes] = useState(false);


  // Unified selection handler for timeline items
  function handleSelectItem(item) {
    console.log("Selected timeline item:", item);

    onSelectItem(item);

    requestAnimationFrame(() => {
      if (rightPaneRef.current) {
        rightPaneRef.current.scrollTop = 0;
      }
    });
  }

  async function handleDeleteTrip(id) {
    if (!confirm("Delete this trip?")) return;
    await deleteTrip(id);
//    await onRefresh();
    onClose();
  }

  async function handleAddNote(tripId) {
    // NEW note → must pass tripId, not id
    openItemEditor({ kind: "note", tripId });
  }

  console.log("TripDetailScreen with: ", trip)
  return (
    <div className="trip-detail-screen ref={rightPaneRef}">
      <div className="td-upper-section">
        <div className="header">
          <h1 className="title">
            <span className="icon">{tripIcon(trip)}</span>
            {trip.name}
          </h1>

          <div className="actions">

            <button className="icon" onClick={() => openItemEditor(trip)}>
              {actionIcon("edit")} Edit
            </button>

            <button className="icon"
              onClick={() => {
                const newSeg = createItem("segment", trip);
                openItemEditor(newSeg);
              }}
            >
              {actionIcon("add")} Segment
            </button>

            <button className="icon"
              onClick={() => {
                const newTour = createItem("tour", trip);
                openItemEditor(newTour);
              }}
            >
              {actionIcon("add")} Tour
            </button>

            <button className="icon"
              onClick={() => {
                const newNote = createItem("note", trip);
                openItemEditor(newNote);
              }}
            >
              {actionIcon("add")} Note
            </button>

            <button className="icon" onClick={() => handleDeleteTrip(trip.id)}>
              {actionIcon("delete")} Delete
            </button>

            <button className="icon" onClick={onClose}>
              {actionIcon("close")} Close
            </button>
          </div>
        </div>

        <div className="td-dates">
          {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
        </div>
        {trip.tripNotes.trim() && (
          <>
            <h3
              className="note-header"
              onClick={() => setTripNotes(v => !v)}
            >
              {showNotes ? actionIcon("hide") : actionIcon("show")} Trip Notes
            </h3>
          </>
        )}
        {showNotes && trip.tripNotes.trim() && (
          <>
            <div className="markdown-text fullHeight">
              <Markdown>{trip.tripNotes.trim()}</Markdown>
            </div>
          </>
        )}
      </div>
      <div className="td-lower-section">
        <UnifiedTimeline
          items={timelineItems}
          onSelectItem={onSelectItem}
          onContextMenu={onContextMenu}
        />
      </div>
    </div>
  );
}
