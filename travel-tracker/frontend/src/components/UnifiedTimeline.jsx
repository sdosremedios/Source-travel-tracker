import React, { useState, useMemo, useRef, useEffect } from "react";
import { hydrateSegment, hydrateTour } from "../models/hydrate";
import { tourIcon } from "../models/categories";
import { modeIcon } from "../utils/icons";
import "../styles/UnifiedTimeline.css";

export default function UnifiedTimeline({
  segments = [],
  tours = [],
  filterCategory = null,
  onSelectSegment,
  onSelectTour
}) {
  const containerRef = useRef(null);

  // --- Hydrate + merge + filter --------------------------------------------
  const items = useMemo(() => {
    const segs = segments.map(s => ({ ...hydrateSegment(s), type: "segment" }));
    const trs = tours
      .filter(t => !filterCategory || t.category === filterCategory)
      .map(t => ({ ...hydrateTour(t), type: "tour" }));

    return [...segs, ...trs].sort((a, b) =>
      a.timelineSortKey.localeCompare(b.timelineSortKey)
    );
  }, [segments, tours, filterCategory]);

  console.log("Hydrated items:", items);

  // --- Keyboard navigation --------------------------------------------------
  const [cursor, setCursor] = useState(0);

  function handleKeyDown(e) {
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      setCursor(c => Math.min(c + 1, items.length - 1));
      e.preventDefault();
    }

    if (e.key === "ArrowUp") {
      setCursor(c => Math.max(c - 1, 0));
      e.preventDefault();
    }

    if (e.key === "Enter") {
      const item = items[cursor];
      if (item.type === "segment" && onSelectSegment) onSelectSegment(item);
      if (item.type === "tour" && onSelectTour) onSelectTour(item);
    }
  }

  // Auto-scroll cursor into view
  useEffect(() => {
    const el = containerRef.current?.querySelector(
      `.ut-row[data-index="${cursor}"]`
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  // --- Group by month, then by day -----------------------------------------
  const groups = {};
  for (const item of items) {
    const month = item.monthLabel;
    const day = item.date;

    if (!groups[month]) groups[month] = {};
    if (!groups[month][day]) groups[month][day] = [];

    groups[month][day].push(item);
  }

  return (
    <div
      className="ut-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      {Object.entries(groups).map(([month, days]) => (
        <div key={month} className="ut-month-block">
          {/* Sticky month header */}
          <div className="ut-month-header">{month}</div>

          {Object.entries(days).map(([day, dayItems]) => (
            <div key={day} className="ut-day-block">
              {/* Sticky day header */}
              <div className="ut-day-header">{dayItems[0].weekday}</div>

              {dayItems.map((item, index) => {
                const flatIndex = items.indexOf(item);
                const isCursor = flatIndex === cursor;

                return (
                  <div
                    key={item.timelineSortKey}
                    data-index={flatIndex}
                    className={`ut-row ${isCursor ? "cursor" : ""}`}
                    onClick={() =>
                      item.type === "segment"
                        ? onSelectSegment?.(item)
                        : onSelectTour?.(item)
                    }
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onContextMenu?.(e.clientX, e.clientY, item);
                    }}
                  >
                    <div className="ut-icon">
                      {item.type === "segment"
                        ? modeIcon(item.mode)
                        : tourIcon(item.category)}
                    </div>

                    <div className="ut-main">
                      <div className="ut-title">
                        {item.type === "segment"
                          ? `${item.fromLocation} → ${item.toLocation}`
                          : item.name}
                      </div>

                      <div className="ut-sub">
                        <span className="ut-weekday">{item.weekday}</span>
                        <span className="ut-dot">•</span>
                        <span>{item.time || item.departureTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}