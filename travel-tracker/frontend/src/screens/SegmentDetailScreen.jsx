import React from "react";
import { modeIcon } from "../utils/icons";
import "../styles/SegmentDetailScreen.css";

export default function SegmentDetailScreen({ segment, onEdit, onClose }) {
  if (!segment) return null;

  return (
    <div className="sd-pane">
      {/* Header -------------------------------------------------------------- */}
      <div className="sd-header">
        <div className="sd-icon">{modeIcon(segment.mode)}</div>
        <h1 className="sd-title">
          {segment.fromLocation} → {segment.toLocation}
        </h1>
      </div>

      {/* Metadata ------------------------------------------------------------ */}
      <div className="sd-meta">
        <div><strong>Date:</strong> {segment.date}</div>
        <div><strong>Departure:</strong> {segment.departureTime}</div>
        <div><strong>Arrival:</strong> {segment.arrivalTime}</div>
        <div><strong>Mode:</strong> {segment.mode}</div>
        {segment.carrierId && (
          <div><strong>Carrier ID:</strong> {segment.carrierId}</div>
        )}
      </div>

      {/* Notes --------------------------------------------------------------- */}
      {segment.notes && (
        <div className="sd-notes">
          <h3>Notes</h3>
          <p>{segment.notes}</p>
        </div>
      )}

      {/* Buttons ------------------------------------------------------------- */}
      <div className="sd-buttons">
        <button className="sd-btn edit" onClick={() => onEdit(segment)}>
          Edit
        </button>
        <button className="sd-btn close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}