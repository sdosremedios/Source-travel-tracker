import React from "react";
import Markdown from "../components/Markdown";
import { modeIcon } from "../utils/icons";
import { deleteSegment } from "../api/index";

import "../styles/SegmentDetailScreen.css";

export default function SegmentDetailScreen({
  segment,
  onEdit,
  onClose,
  onRefresh
}) {
  if (!segment) return null;

  async function handleDelete() {
    if (!confirm("Delete this segment?")) return;
    await deleteSegment(segment.id);

    onClose();
    onRefresh(segment.tripId);
  }

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
          <div className="markdown-text">
            <Markdown>{segment.notes}</Markdown>
          </div>
        </div>
      )}

      {/* Buttons ------------------------------------------------------------- */}
      <div className="sd-buttons">
        <button className="sd-btn edit" onClick={() => onEdit(segment)}>
          Edit
        </button>
        <button className="sd-btn danger" onClick={handleDelete}>
          Delete
        </button>
        <button className="sd-btn close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}