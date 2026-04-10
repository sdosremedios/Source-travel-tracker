import React from "react";
import UnifiedTimeline from "../components/UnifiedTimeline";
import { buildUnifiedTimeline } from "../models/buildUnifiedTimeline";
import { tripIcon, actionIcon } from "../utils/icons";

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

  return (
    <div className="trip-detail-screen">
      <div className="td-header">
        <h1 className="td-title">
          <span className="td-trip-icon">{tripIcon(trip)}</span>
          {trip.name}
        </h1>

        <div className="td-actions">
          <button className="td-btn" onClick={() => onEditTrip(trip.id)}>{actionIcon('edit')} Edit Trip</button>
          <button className="td-btn" onClick={() => onAddSegment(trip.id)}>{actionIcon('add')} Add Segment</button>
          <button className="td-btn" onClick={() => onAddTour(trip.id)}>{actionIcon('add')} Add Tour</button>
          <button className="td-btn" onClick={onClose}>{actionIcon('close')}Close</button>
        </div>
      </div>

      <div className="td-dates">
        {trip.startDate} → {trip.endDate}
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
