import React from "react";
import UnifiedTimeline from "../components/UnifiedTimeline";
import { buildUnifiedTimeline } from "../models/buildUnifiedTimeline";
import { tripIcon, actionIcon } from "../utils/icons";
import { loadTrips, deleteTrip } from "../api";
import { formatDate } from "../utils/dateHelpers";

import "../styles/TripDetailScreen.css";

export default function TripDetailScreen({
  trip,
  segments,
  tours,
  onClose,
  onEditTrip,
  onSelectItem,
  onAddSegment,
  onAddTour,
  onContextMenu,
  onRefresh,
  onInlineEdit
}) {

  const timelineItems = buildUnifiedTimeline(segments, tours);

  //console.log("TripDetailScreen timelineItems:", timelineItems);

  function handleSelectItem(item) {
    console.log("Selected timeline item:", item);
    if (item.kind === "segment") {
      onSelectSegment(item);
    } else if (item.kind === "tour") {
      onSelectTour(item);
    }
  }
  async function handleDeleteTrip(id) {
    if (!confirm("Delete this trip?")) return;

    await deleteTrip(id);
    await onRefresh(); // however you reload your list
    onClose();
  }


  return (
    <div className="trip-detail-screen">
      <div className="td-header">
        <h1 className="td-title">
          <span className="td-trip-icon">{tripIcon(trip)}</span>
          {trip.name}
        </h1>

        <div className="td-actions">
          <button className="td-btn" onClick={() => onEditTrip(trip.id)}>{actionIcon('edit')} Edit</button>
          <button className="td-btn" onClick={() => onAddSegment(trip.id)}>{actionIcon('add')} Segment</button>
          <button className="td-btn" onClick={() => onAddTour(trip.id)}>{actionIcon('add')} Tour</button>
          <button className="td-btn" onClick={() => handleDeleteTrip(trip.id)}>{actionIcon('delete')} Delete</button>
          <button className="td-btn" onClick={onClose}>{actionIcon('close')} Close</button>
        </div>
      </div>

      <div className="td-dates">
        {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
      </div>

      {trip.notes && (
        <div className="td-notes">{trip.notes}</div>
      )}

      <UnifiedTimeline
        items={timelineItems}
        onSelectItem={onSelectItem}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}
