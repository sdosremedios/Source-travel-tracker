// src/components/UnifiedTimeline.jsx
import React, { useState, useEffect } from "react";
import TimelineRow from "./TimelineRow";
import "../styles/UnifiedTimeline.css";
import { collapseIcon, expandIcon } from "../utils/icons";

export default function UnifiedTimeline({
  items,
  onSelectItem,
  onContextMenu,
  onInlineEdit
}) {
  const [index, setIndex] = useState(0);
  const [collapsedDates, setCollapsedDates] = useState({});

  function toggleDate(date) {
    setCollapsedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  }

  function collapseAll() {
    const map = {};
    for (const item of items) {
      map[item.date] = true;
    }
    setCollapsedDates(map);
  }

  function expandAll() {
    const map = {};
    for (const item of items) {
      map[item.date] = false;
    }
    setCollapsedDates(map);
  }

  let lastMonth = null;
  let lastDate = null;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "c" || e.key === "C") collapseAll();
      if (e.key === "e" || e.key === "E") expandAll();
      if (e.key === "d" || e.key === "D") {
        const item = items[index];
        if (item?.date) toggleDate(item.date);
      }

      if (e.key === "ArrowDown") {
        setIndex(i => Math.min(i + 1, items.length - 1));
      }

      if (e.key === "ArrowUp") {
        setIndex(i => Math.max(i - 1, 0));
      }

      if (e.key === "Enter") {
        const item = items[index];
        if (item) onSelectItem?.(item);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, index]);

  return (
    <div>
      <div className="timeline-controls">
        <span class="icon pointer" title="Collapse All" onClick={collapseAll}>
          {collapseIcon}
        </span>
        <span class="icon pointer" title="Expand All" onClick={expandAll}>
          {expandIcon}
        </span>
      </div>

      <div className="timeline-container">
        {items.map(item => {
          // ⭐ These depend on lastMonth / lastDate existing
          const showMonth = item.monthLabel !== lastMonth;
          const showDate = item.date !== lastDate;

          lastMonth = item.monthLabel;
          lastDate = item.date;

          return (
            <React.Fragment key={`${item.kind}-${item.id}`}>
              {showMonth && (
                <div className="timeline-month-header">
                  {item.monthLabel}
                </div>
              )}

              {showDate && (
                <div
                  className="timeline-day-divider"
                  onClick={() => toggleDate(item.date)}
                >
                  {collapsedDates[item.date] ? "►" : "▼"}{" "}
                  {item.weekday} — {item.date}
                </div>
              )}

              {!collapsedDates[item.date] && (
                <TimelineRow
                  item={item}
                  onClick={() => onSelectItem(item)}
                  onContextMenu={e => onContextMenu?.(e, item)}
                  onInlineEdit={(field, value) =>
                    onInlineEdit?.(item, field, value)
                  }
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
