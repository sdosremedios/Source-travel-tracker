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
    await deleteSegment(segment.tripId, segment.id);
    onRefresh(segment);
  }

  console.log("SegmentDetailScreen received segment:", segment);

  return (
    <div className="segment-detail-screen">
      {/* Header -------------------------------------------------------------- */}
      <div className="header">
        <div className="icon">{modeIcon(segment.mode)}</div>
        <h1 className="title">
          Travel: {segment.fromLocation} → {segment.toLocation}
        </h1>

      </div>
      <div className="buttons">
        <button className="edit" onClick={() => onEdit(segment)}>Edit</button>
        <button className="danger" onClick={handleDelete}>Delete</button>
        <button className="close" onClick={onClose}>Close</button>
      </div>

      {/* Metadata ------------------------------------------------------------ */}
      <div className="data">
        <div className="">
          <strong>Date:</strong>{" "}
          {segment.startDate} {segment.departureTime}
          {" — "}
          {segment.endDate} {segment.arrivalTime}
        </div>

        <div>
          <strong>Mode:</strong>{" "}
          <span className="sd-meta-badge">
            {modeIcon(segment.mode)} {segment.mode}
          </span>
        </div>

        <div>
          <strong>Carrier:</strong> {segment.carrier}
        </div>
      </div>

      {/* Notes --------------------------------------------------------------- */}
      {segment.notes && (
        <div className="text-row-markdown">
          <h3>Notes</h3>
          <div className="markdown-text">
            <Markdown>{segment.notes}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
