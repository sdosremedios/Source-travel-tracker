import React, { useState, useEffect } from "react";
import Markdown from "../components/Markdown";
import UnifiedTimeline from "../components/UnifiedTimeline";
import { buildUnifiedTimeline } from "../models/buildUnifiedTimeline";
import { tripIcon, actionIcon } from "../utils/icons";
import { deleteTrip } from "../api";
import { formatDate } from "../utils/dateHelpers";

import "../styles/TripDetailScreen.css";
import "../styles/timeline.css";

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
    await onRefresh();
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
        <div className="td-header">
          <h1 className="td-title">
            <span className="td-trip-icon">{tripIcon(trip)}</span>
            {trip.name}
          </h1>

          <div className="td-actions">
            <button className="td-btn icon" onClick={() => openTripEditor(trip.id)}>
              {actionIcon("edit")} Edit
            </button>

            <button className="td-btn icon" onClick={() => openSegmentEditor(trip.id)}>
              {actionIcon("add")} Segment
            </button>

            <button className="td-btn icon" onClick={() => openTourEditor(trip.id)}>
              {actionIcon("add")} Tour
            </button>

            <button className="td-btn icon" onClick={() => handleAddNote(trip.id)}>
              {actionIcon("add")} Note
            </button>

            <button className="td-btn icon" onClick={() => handleDeleteTrip(trip.id)}>
              {actionIcon("delete")} Delete
            </button>

            <button className="td-btn icon" onClick={onClose}>
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
            <div className="td-markdown">
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
