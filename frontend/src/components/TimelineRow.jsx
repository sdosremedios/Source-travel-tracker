// src/components/TimelineRow.jsx
import React from "react";
import { modeIcon, tourIcon, actionIcon, kindIcon } from "../utils/icons";
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
        <div className="timeline-icon">
          {kindIcon("note")}
          <span className="timeline-row-category"><br />Note</span>
        </div>
        <div className="timeline-row-content">
          <div className="timeline-note-time">{formatTime(item.dateTime)}</div>
        </div>
        <div className="markdown-text preview">
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
        <div className="timeline-row-icon">
          {item.mode ?
            modeIcon(item.mode)
            : item.kindIcon(item.kind)}
          <span className="timeline-row-category"><br />{item.mode}</span>
        </div>

        <div className="timeline-row-content">
          <div className="timeline-row-date">
            {item.weekday} - {item.date} → {item.finishDate || item.date}
          </div>

          <div className="timeline-row-title">
            {item.fromLocation || "From ?"} → {item.toLocation || "To ?"}
          </div>

          <div className="timeline-row-subtitle">
            {item.mode} — {item.carrier || "No carrier"}
          </div>

          {item.notes && (
            <div className="markdown-text preview">
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
        <div className="timeline-row-icon">{item.kind === "tour"
          ? tourIcon(item.category)
          : kindIcon(item.kind)}
          <br />
          <span className="timeline-row-category">{item.category}</span>
        </div>
        <div className="timeline-row-content">
          <div className="timeline-row-date">
            {item.weekday} {item.date} → {item.finishDate || item.startDate}
          </div>
          <div className="timeline-row-title">{item.name}</div>
          <div className="timeline-row-location">{item.location}</div>
          <div className="timeline-row-company">{item.company || "No company"}</div>
        </div>
        {item.notes && (
          <div className="markdown-text preview">
            <Markdown>{item.notes}</Markdown>
          </div>
        )}
      </div>
    );
  }

  return null;
}
