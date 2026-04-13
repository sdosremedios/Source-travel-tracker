// src/components/UnifiedTimeline.jsx
import React, { useState, useEffect } from "react";
import TimelineRow from "./TimelineRow";
import "../styles/UnifiedTimeline.css";

export default function UnifiedTimeline({
  items,
  onSelectItem,
  onContextMenu,
  onInlineEdit
}) {
  const [index, setIndex] = useState(0);

  // console.log("UnifiedTimeline props:", { onSelectItem });
  //
  // Keyboard navigation
  //
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowDown") {
        setIndex(i => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        setIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const item = items[index];
        if (item) onSelectItem?.(item);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, index, onSelectItem]);

  //
  // Render timeline with month + day grouping
  //
  let lastMonth = null;
  let lastDate = null;

  return (
    <div className="timeline-container">
      {items.map(item => {
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
              <div className="timeline-day-divider">
                {item.weekday} — {item.date}
              </div>
            )}

            <TimelineRow
              item={item}
              onClick={onSelectItem}
              onContextMenu={e => onContextMenu?.(e, item)}
              onInlineEdit={(field, value) =>
                onInlineEdit?.(item, field, value)
              }
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
