// src/components/TimelineRow.jsx
import React from "react";
import { modeIcon, tourIcon } from "../utils/icons";
import "../styles/TimelineRow.css";

export default function TimelineRow({
  item,
  onClick,
  onContextMenu,
  onInlineEdit
}) {
  const isSegment = item.kind === "segment";
  const isTour = item.kind === "tour";

  //console.log("ROW ITEM", item);
  //console.log("ROW CLICK", item);

  return (

    <div
      className="timeline-row"
      onClick={() => onClick(item)}
      onContextMenu={(e) => onContextMenu?.(e, item)}
    >
      {/* Icon */}
      <div className="timeline-row-icon">
        {isSegment ? modeIcon(item.mode) : tourIcon(item.category)}
      </div>

      {/* Content */}
      <div className="timeline-row-content">
        <div className="timeline-row-date">
          {item.weekday} — {item.date} → {item.finishDate || item.startDate}
        </div>

        {isSegment && (
          <>
            <div className="timeline-row-title">
              {item.from} → {item.to}
            </div>
            <div className="timeline-row-subtitle">
              {item.mode} - {item.carrier || "No carrier"}
            </div>
          </>
        )}

        {isTour && (
          <>
            <div className="timeline-row-title">
              {item.name} Tour
            </div>
            <div className="timeline-row-subtitle">
              {item.category}
            </div>
            <div className="timeline-row-location">
              {item.location}
            </div>
          </>
        )}

      </div>
      <div className="timeline-row-note">
        {item.notes}
      </div>

    </div>
  );
}
