// src/components/TimelineRow.jsx
import React from "react";
import { modeIcon, tourIcon } from "../utils/icons";
import { formatTime } from "../utils/dateHelpers";
import "../styles/TimelineRow.css";

export default function TimelineRow({
  item,
  onClick,
  onContextMenu,
  onInlineEdit
}) {
  const isSegment = item.kind === "segment";
  const isTour = item.kind === "tour";
  const isNote = item.kind === "note";

  //console.log("ROW ITEM", item);
  //console.log("ROW CLICK", item);

  return (

    <div
      className="timeline-row"
      onClick={() => onClick(item)}
      onContextMenu={(e) => onContextMenu?.(e, item)}
    >
      {/* Icon */}
      {!isNote && (
        <div className="timeline-row-icon">
          {isSegment ? modeIcon(item.mode) : tourIcon(item.category)}
        </div>
      )}

      {/* Content */}
      <div className="timeline-row-content">
        {!isNote && (
          <>
            <div className="timeline-row-date">
              {item.weekday} — {item.date} → {item.finishDate || item.startDate}
            </div>
          </>)}

        {isSegment && (
          <>
            <div className="timeline-row-title">
              {item.from} → {item.to}
            </div>
            <div className="timeline-row-subtitle">
              {item.mode} - {item.carrier || "No carrier"}
            </div>

            {item.notes && (
              <div className="td-notes">
                {item.notes ?? "No notes"}
              </div>
            )}
          </>
        )}

        {isTour && (
          <>
            <div className="timeline-row-title">
              {item.name}
            </div>
            <div className="timeline-row-subtitle">
              {item.category} Tour
            </div>
            <div className="timeline-row-location">
              {item.location}
            </div>
            {item.notes && (
              <div className="td-notes">
                {item.notes ?? "No notes"}
              </div>
            )}
          </>
        )}
        {isNote && (
          <>
            <div className="timeline-row note">
              <div className="tr-icon">📝</div>
              <div className="tr-main">
                <div className="tr-sub">{formatTime(item.dateTime)}</div>
                <div className="tr-note">{item.note}</div>
              </div>
            </div>          </>
        )}

      </div>
    </div>
  );
}
