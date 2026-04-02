import React from "react";
import UnifiedTimeline from "../components/UnifiedTimeline";
import "../styles/TripDetailScreen.css";

export default function TripDetailScreen({
  trip,
  segments,
  tours,
  setActiveScreen,
  setActiveItem,
  onEditTrip,
  onSelectSegment,
  onSelectTour,
  onContextMenu,
  onClose
}) {
  if (!trip) return null;

  // Merge segments + tours into a single timeline
  const items = [
    ...segments.map(s => ({ ...s, kind: "segment" })),
    ...tours.map(t => ({ ...t, kind: "tour" }))
  ].sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));


  console.log("Segments in TripDetailScreen:", segments);

  return (
    <div className="td-pane">
      {/* Header */}
      <div className="td-header">
        <h1 className="td-title">{trip.name}</h1>

        <div className="td-header-buttons">
          <button
            className="td-btn"
            onClick={() => onEditTrip(trip.id)}
          >
            Edit Trip
          </button>

          <button
            className="td-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      {/* Trip Dates */}
      <div className="td-dates">
        {trip.startDate} → {trip.endDate}
      </div>

      {/* Notes */}
      {trip.notes && (
        <div className="td-notes">
          {trip.notes}
        </div>
      )}

      {/* Add Actions */}
      <div className="td-actions">
        <button
          className="td-btn add"
          onClick={() => onSelectSegment(trip.id, null)}
        >
          ➕ Add Segment
        </button>

        <button
          className="td-btn add"
          onClick={() => {
            onSelectTour(trip.id, null)
          }}
        >
          ➕ Add Tour
        </button>
      </div>

      {/* Timeline */}
      <h2 className="td-subtitle">Timeline</h2>

      <UnifiedTimeline
        segments={segments}
        tours={tours}
        onSelectSegment={(segment) => onSelectSegment(trip.id, segment)}
        onSelectTour={(tour) => onSelectTour(trip.id, tour)}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}