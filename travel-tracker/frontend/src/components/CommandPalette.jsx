import React, { useState, useEffect, useRef, useMemo } from "react";
import "../styles/CommandPalette.css";

import { tripIcon } from "../utils/icons";
import { modeIcon } from "../utils/icons";
import { tourIcon } from "../models/categories";

export default function CommandPalette({
  isOpen,
  onClose,
  onCommand,
  trips,
  segments,
  tours,
  activeScreen,
  activeItem
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // -------------------------------------------------------------------------
  // Fuzzy scoring
  // -------------------------------------------------------------------------
  function score(label, q) {
    if (!q) return 1;
    label = label.toLowerCase();
    q = q.toLowerCase();

    if (label.startsWith(q)) return 100;
    if (label.includes(q)) return 50;

    const acronym = label
      .split(/\s+/)
      .map(w => w[0])
      .join("");

    if (acronym.startsWith(q)) return 80;

    return 0;
  }

  // -------------------------------------------------------------------------
  // Quick Actions Engine
  // -------------------------------------------------------------------------
  function buildQuickActions() {
    const list = [];

    // Trip Detail Quick Actions
    if (activeScreen === "tripDetail" && activeItem) {
      list.push({
        group: "Quick Actions",
        label: "Edit Trip",
        icon: "✏️",
        action: "editTrip",
        payload: activeItem
      });

      list.push({
        group: "Quick Actions",
        label: "Duplicate Trip",
        icon: "📄",
        action: "duplicateTrip",
        payload: activeItem
      });

      list.push({
        group: "Quick Actions",
        label: "Add Segment",
        icon: "🛫",
        action: "newSegment"
      });

      list.push({
        group: "Quick Actions",
        label: "Add Tour",
        icon: "📍",
        action: "newTour"
      });
    }

    // Segment Detail Quick Actions
    if (activeScreen === "segmentDetail" && activeItem) {
      const seg = activeItem;

      list.push({
        group: "Quick Actions",
        label: "Edit Segment",
        icon: "✏️",
        action: "editSegment",
        payload: seg
      });

      list.push({
        group: "Quick Actions",
        label: "Duplicate Segment",
        icon: "📄",
        action: "duplicateSegment",
        payload: seg
      });

      list.push({
        group: "Quick Actions",
        label: "Delete Segment",
        icon: "🗑️",
        action: "deleteSegment",
        payload: seg
      });

      // Mode changes
      ["plane", "train", "car", "walk"].forEach(mode => {
        list.push({
          group: "Quick Actions",
          label: `Change Mode → ${mode}`,
          icon: modeIcon(mode),
          action: "changeSegmentMode",
          payload: { seg, mode }
        });
      });

      // Date shifts
      list.push({
        group: "Quick Actions",
        label: "Shift Forward 1 Day",
        icon: "➡️",
        action: "shiftSegment",
        payload: { seg, days: 1 }
      });

      list.push({
        group: "Quick Actions",
        label: "Shift Backward 1 Day",
        icon: "⬅️",
        action: "shiftSegment",
        payload: { seg, days: -1 }
      });
    }

    // Tour Detail Quick Actions
    if (activeScreen === "tourDetail" && activeItem) {
      const tour = activeItem;

      list.push({
        group: "Quick Actions",
        label: "Edit Tour",
        icon: "✏️",
        action: "editTour",
        payload: tour
      });

      list.push({
        group: "Quick Actions",
        label: "Duplicate Tour",
        icon: "📄",
        action: "duplicateTour",
        payload: tour
      });

      list.push({
        group: "Quick Actions",
        label: "Delete Tour",
        icon: "🗑️",
        action: "deleteTour",
        payload: tour
      });

      ["walking", "museum", "food", "nature"].forEach(cat => {
        list.push({
          group: "Quick Actions",
          label: `Change Category → ${cat}`,
          icon: tourIcon(cat),
          action: "changeTourCategory",
          payload: { tour, cat }
        });
      });

      list.push({
        group: "Quick Actions",
        label: "Shift Forward 1 Day",
        icon: "➡️",
        action: "shiftTour",
        payload: { tour, days: 1 }
      });

      list.push({
        group: "Quick Actions",
        label: "Shift Backward 1 Day",
        icon: "⬅️",
        action: "shiftTour",
        payload: { tour, days: -1 }
      });
    }

    return list;
  }

  // -------------------------------------------------------------------------
  // Build full command list
  // -------------------------------------------------------------------------
  const commands = useMemo(() => {
    const list = [];

    // Quick Actions first
    list.push(...buildQuickActions());

    // Global actions
    list.push({
      group: "Actions",
      label: "New Trip",
      icon: "🆕",
      action: "newTrip"
    });

    list.push({
      group: "Actions",
      label: "New Segment",
      icon: "🛫",
      action: "newSegment"
    });

    list.push({
      group: "Actions",
      label: "New Tour",
      icon: "📍",
      action: "newTour"
    });

    // Navigation
    list.push({
      group: "Navigation",
      label: "Go to Trip List",
      icon: "📁",
      action: "goTrips"
    });

    // Trips
    for (const t of trips) {
      list.push({
        group: "Trips",
        label: `Open Trip: ${t.name}`,
        icon: tripIcon(t),
        action: "openTrip",
        payload: t.id
      });
    }

    // Segments
    for (const s of segments) {
      list.push({
        group: "Segments",
        label: `${s.fromLocation} → ${s.toLocation}`,
        icon: modeIcon(s.mode),
        action: "openSegment",
        payload: s
      });
    }

    // Tours
    for (const t of tours) {
      list.push({
        group: "Tours",
        label: t.name,
        icon: tourIcon(t.category),
        action: "openTour",
        payload: t
      });
    }

    return list;
  }, [trips, segments, tours, activeScreen, activeItem]);

  // -------------------------------------------------------------------------
  // Filter + score
  // -------------------------------------------------------------------------
  const filtered = useMemo(() => {
    return commands
      .map(cmd => ({
        ...cmd,
        score: score(cmd.label, query)
      }))
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [commands, query]);

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------
  function handleKey(e) {
    if (e.key === "ArrowDown") {
      setCursor(c => Math.min(c + 1, filtered.length - 1));
      e.preventDefault();
    }

    if (e.key === "ArrowUp") {
      setCursor(c => Math.max(c - 1, 0));
      e.preventDefault();
    }

    if (e.key === "Enter") {
      const cmd = filtered[cursor];
      if (cmd) onCommand(cmd);
    }

    if (e.key === "Escape") {
      onClose();
    }
  }

  if (!isOpen) return null;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="cp-overlay" onKeyDown={handleKey} tabIndex={0}>
      <div className="cp-box">
        <input
          ref={inputRef}
          className="cp-input"
          placeholder="Type a command…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setCursor(0);
          }}
        />

        <div className="cp-list">
          {filtered.length === 0 && (
            <div className="cp-empty">No results</div>
          )}

          {filtered.map((cmd, i) => {
            const showGroupHeader =
              i === 0 || filtered[i - 1].group !== cmd.group;

            return (
              <React.Fragment key={i}>
                {showGroupHeader && (
                  <div className="cp-group">{cmd.group}</div>
                )}

                <div
                  className={`cp-item ${i === cursor ? "cursor" : ""}`}
                  onClick={() => onCommand(cmd)}
                >
                  <div className="cp-icon">{cmd.icon}</div>
                  <div className="cp-label">{cmd.label}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}