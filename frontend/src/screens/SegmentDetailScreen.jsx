import React from "react";
import { modeIcon } from "../utils/icons";
import { formatDateTime } from "../utils/dateHelpers";

import "../styles/SegmentDetailScreen.css";

export default function SegmentDetailScreen({ segment, onEdit, onClose }) {
  if (!segment) return null;
  console.log("SegmentDetailScreen received segment:", segment);
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
        <div><strong>Date:</strong> {segment.startDateTimeLabel} {segment.endDateTimeLabel ? "- " + segment.endDateTimeLabel : ""}</div>
        <div><strong>Mode:</strong> <span className="sd-meta-badge">{segment.mode}</span></div>
        <div><strong>Carrier:</strong> {segment.carrier}</div>
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