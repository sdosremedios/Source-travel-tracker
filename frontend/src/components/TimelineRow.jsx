// src/components/TimelineRow.jsx
import React from "react";
import { tourIcon } from "../models/categories";
import { modeIcon, actionIcon, kindIcon } from "../utils/icons";
import { formatTime } from "../utils/dateHelpers";
import "../styles/TimelineRow.css";
import Markdown from "./Markdown";

export default function TimelineRow({
  item,
  onClick,
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
      >
        <div className="timeline-icon">
          {kindIcon("note")}
          <span className="timeline-category"><br />Note</span>
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
      >
        <div className="timeline-icon">
          {item.mode ?
            modeIcon(item.mode)
            : item.kindIcon(item.kind)}
          <span className="timeline-category"><br />{item.mode} Travel</span>
        </div>

        <div className="timeline-row-content">
          <div className="timeline-row-date">
            {item.weekday} - {item.date} → {item.finishDate || item.date}
          </div>

          <div className="timeline-row-title">
            {item.fromLocation || "From ?"} → {item.toLocation || "To ?"}
          </div>

          <div className="timeline-row-subtitle">
            {item.carrier || "No carrier"}
          </div>

        </div>
        {item.notes && (
          <div className="markdown-text preview">
            <Markdown>{item.notes}</Markdown>
          </div>
        )}
      </div>
    );
  }

  // --- TOUR ROW ---
  if (isTour) {
    return (
      <div
        className="timeline-row"
        onClick={() => onClick(item)}
      >
        <div className="timeline-icon">{item.kind === "tour"
          ? tourIcon(item.category)
          : kindIcon(item.kind)}
          <br />
          <span className="timeline-category">{item.category} Tour</span>
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
