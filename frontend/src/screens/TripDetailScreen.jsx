import React from "react";
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
  onInlineEdit
}) {

  // Build the unified timeline (segments + tours + notes)
  const timelineItems = buildUnifiedTimeline(segments, tours, notes);

  // Unified selection handler for timeline items
  function handleSelectItem(item) {
    console.log("Selected timeline item:", item);

    if (item.kind === "segment") {
      onSelectItem(item);
    } else if (item.kind === "tour") {
      onSelectItem(item);
    } else if (item.kind === "note") {
      onSelectItem(item);
    }
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

  return (
    <div className="trip-detail-screen">
      <div className="td-header">
        <h1 className="td-title">
          <span className="td-trip-icon">{tripIcon(trip)}</span>
          {trip.name}
        </h1>

        <div className="td-actions">
          <button className="td-btn" onClick={() => openTripEditor(trip.id)}>
            {actionIcon("edit")} Edit
          </button>

          <button className="td-btn" onClick={() => openSegmentEditor(trip.id)}>
            {actionIcon("add")} Segment
          </button>

          <button className="td-btn" onClick={() => openTourEditor(trip.id)}>
            {actionIcon("add")} Tour
          </button>

          <button className="td-btn" onClick={() => handleAddNote(trip.id)}>
            {actionIcon("add")} Note
          </button>

          <button className="td-btn" onClick={() => handleDeleteTrip(trip.id)}>
            {actionIcon("delete")} Delete
          </button>

          <button className="td-btn" onClick={onClose}>
            {actionIcon("close")} Close
          </button>
        </div>
      </div>

      <div className="td-dates">
        {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
      </div>

      <UnifiedTimeline
        items={timelineItems}
        onSelectItem={onSelectItem}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}
