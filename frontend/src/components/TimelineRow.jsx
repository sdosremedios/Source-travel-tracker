// src/components/TimelineRow.jsx
import React from "react";
import { modeIcon, tourIcon, actionIcon } from "../utils/icons";
import { formatTime } from "../utils/dateHelpers";
import "../styles/TimelineRow.css";
import Markdown from "./Markdown";

export default function TimelineRow({
  item,
  onClick,
  onContextMenu,
  onInlineEdit
}) {
  const isSegment = item.kind === "segment";
  const isTour = item.kind === "tour";
  const isNote = item.kind === "note";

  // --- NOTE ROW ---
  if (isNote) {
    return (
      <div
        className="timeline-row note"
        onClick={() => onClick(item)}
        onContextMenu={(e) => onContextMenu?.(e, item)}
      >
        <div className="tr-icon">📝</div>
        <div className="tr-main">
          <div className="tr-sub">{formatTime(item.dateTime)}</div>
        </div>
        <div className="markdown-text">
          <Markdown>{item.note}</Markdown>
        </div>
      </div>
    );
  }

  // --- SEGMENT ROW ---
  if (isSegment) {
    return (
      <div
        className="timeline-row"
        onClick={() => onClick(item)}
        onContextMenu={(e) => onContextMenu?.(e, item)}
      >
        <div className="timeline-row-icon">{modeIcon(item.mode)}</div>

        <div className="timeline-row-content">
          <div className="timeline-row-date">
            {item.weekday} — {item.date} → {item.finishDate || item.startDate}
          </div>

          <div className="timeline-row-title">
            {item.from} → {item.to}
          </div>

          <div className="timeline-row-subtitle">
            {item.mode} — {item.carrier || "No carrier"}
          </div>

          {item.notes && (
            <div className="markdown-text">
              <Markdown>{item.notes}</Markdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TOUR ROW ---
  if (isTour) {
    return (
      <div
        className="timeline-row"
        onClick={() => onClick(item)}
        onContextMenu={(e) => onContextMenu?.(e, item)}
      >
        <div className="timeline-row-icon">{tourIcon(item.category)}</div>

        <div className="timeline-row-content">
          <div className="timeline-row-date">
            {item.weekday} — {item.date} → {item.finishDate || item.startDate}
          </div>

          <div className="timeline-row-title">{item.name}</div>
          <div className="timeline-row-subtitle">{item.category} Tour</div>
          <div className="timeline-row-location">{item.location}</div>

          {item.notes && (
            <div className="markdown-text">
              <Markdown>{item.notes}</Markdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
