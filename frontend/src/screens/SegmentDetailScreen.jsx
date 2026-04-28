import React, { useState, useEffect } from "react";
import Markdown from "../components/Markdown";
import { modeIcon } from "../utils/icons";
import { deleteSegment } from "../api/index";
import { refreshSegments } from "../utils/refreshHelpers";

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

  await deleteSegment(segment.tripId, segment.id);

  onRefresh(segment);
  onClose();
}

  console.log("SegmentDetailScreen received segment:", segment);
  return (
    <div className="segment-detail-screen">
      {/* Header -------------------------------------------------------------- */}
      <div className="header">
        <div className="icon">{modeIcon(segment.mode)}</div>
        <h1 className="title">
          {segment.fromLocation} → {segment.toLocation}
        </h1>
        {/* Buttons ------------------------------------------------------------- */}
        <div className="buttons">
          <button className="edit" onClick={() => onEdit(segment)}>
            Edit
          </button>
          <button className="danger" onClick={handleDelete}>
            Delete
          </button>
          <button className="close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Metadata ------------------------------------------------------------ */}
      <div className="data">
        <div><strong>Date:</strong> {segment.startDateTimeLabel} {segment.endDateTimeLabel ? "- " + segment.endDateTimeLabel : ""}</div>
        <div><strong>Mode:</strong> <span className="sd-meta-badge">{modeIcon(segment.mode)} {segment.mode}</span></div>
        <div><strong>Carrier:</strong> {segment.carrier}</div>
      </div>

      {/* Notes --------------------------------------------------------------- */}
      {segment.notes && (
        <div className="notes">
          <h3>Notes</h3>
          <div className="markdown-text">
            <Markdown>{segment.notes}</Markdown>
          </div>
        </div>
      )}

    </div>
  );
}