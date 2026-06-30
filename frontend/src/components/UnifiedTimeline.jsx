// src/components/UnifiedTimeline.jsx
import React, { useState, useEffect } from "react";
import TimelineRow from "./TimelineRow";
import "../styles/UnifiedTimeline.css";
import { collapseIcon, expandIcon } from "../utils/icons";
import { expandDayIcon, collapseDayIcon } from "../utils/icons";

export default function UnifiedTimeline({
  items,
  onSelectItem,
  onInlineEdit,
  collapseState,
  setCollapseState
}) {
  const [index, setIndex] = useState(0);

  const [collapsedDates, setCollapsedDates] = useState(() =>
    collapseState?.collapsedDates || {}
  );

  const [allCollapsed, setAllCollapsed] = useState(() =>
    collapseState?.allCollapsed ?? false
  );

  function collapseAll() {
    const map = {};
    for (const item of items) {
      map[item.date] = true;
    }
    setCollapsedDates(map);
    setAllCollapsed(true);
  }

  function expandAll() {
    const map = {};
    for (const item of items) {
      map[item.date] = false;
    }
    setCollapsedDates(map);
    setAllCollapsed(false);
  }
  useEffect(() => {
    setCollapseState({ allCollapsed, collapsedDates });
  }, [allCollapsed, collapsedDates]);

  useEffect(() => {
    setCollapsedDates(prev => {
      const updated = { ...prev };
      let changed = false;

      for (const item of items) {
        if (!(item.date in updated)) {
          updated[item.date] = allCollapsed;
          changed = true;
        }
      }

      return changed ? updated : prev;
    });
  }, [items, allCollapsed]);

  useEffect(() => {
    setCollapsedDates(prev => {
      const updated = { ...prev };
      let changed = false;

      for (const item of items) {
        if (!(item.date in updated)) {
          updated[item.date] = allCollapsed;
          changed = true;
        }
      }

      return changed ? updated : prev;
    });
  }, [items, allCollapsed]);

  function toggleDate(date) {
    setCollapsedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
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
        <span className="icon pointer" title="Expand All" onClick={expandAll}>
           <strong>{expandIcon} Expand All</strong>
        </span>
        <span className="icon pointer" title="Collapse All" onClick={collapseAll}>
           <strong>{collapseIcon} Collapse All</strong>
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
                  {collapsedDates[item.date] ? collapseDayIcon : expandDayIcon}{" "}
                  {item.weekday} — {item.date}
                </div>
              )}

              {!collapsedDates[item.date] && (
                <TimelineRow
                  item={item}
                  onClick={() => onSelectItem(item)}
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
