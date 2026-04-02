import React, { useState, useEffect, useRef } from "react";
import "../styles/TripListScreen.css";
import { tripIcon } from "../utils/icons";

export default function TripListScreen({
  trips,
  selectedTripId,
  onSelectTrip,
  onNewTrip
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef(null);

  // Filter trips by search query
  const filtered = trips.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  // The list includes a synthetic "New Trip" row at index 0
  const rows = [
    { type: "new" },
    ...filtered.map(t => ({ type: "trip", trip: t }))
  ];

  // Keep cursor in bounds
  useEffect(() => {
    if (cursor >= rows.length) {
      setCursor(rows.length - 1);
    }
  }, [rows.length, cursor]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(".tls-item.cursor");
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  // Keyboard navigation
  function handleKey(e) {
    if (e.key === "ArrowDown") {
      setCursor(c => Math.min(c + 1, rows.length - 1));
      e.preventDefault();
    }
    if (e.key === "ArrowUp") {
      setCursor(c => Math.max(c - 1, 0));
      e.preventDefault();
    }
    if (e.key === "Enter") {
      const row = rows[cursor];
      if (row.type === "new") onNewTrip();
      if (row.type === "trip") onSelectTrip(row.trip.id);
    }
  }

  return (
    <div className="tls-root" onKeyDown={handleKey} tabIndex={0}>
      {/* Search */}
      <div className="tls-search">
        <input
          placeholder="Search trips…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setCursor(0);
          }}
        />
      </div>

      {/* Trip List */}
      <div className="tls-list" ref={listRef}>
        {/* New Trip row */}
        <div
          className={
            "tls-item tls-new" + (cursor === 0 ? " cursor" : "")
          }
          onClick={onNewTrip}
        >
          <div className="tls-icon">➕</div>
          <div className="tls-name">Add Trip</div>
        </div>

        {/* Trip rows */}
        {filtered.map((t, i) => {
          const rowIndex = i + 1; // because row 0 is "New Trip"
          const isSelected = t.id === selectedTripId;
          const isCursor = rowIndex === cursor;

          return (
            <div
              key={t.id}
              className={
                "tls-item" +
                (isSelected ? " selected" : "") +
                (isCursor ? " cursor" : "")
              }
              onClick={() => onSelectTrip(t.id)}
            >
              <div className="tls-icon">{tripIcon(t)}</div>
              <div className="tls-name">{t.name}</div>
              <div className="tls-dates">
                {t.startDate} → {t.endDate}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {trips.length === 0 && (
          <div className="tls-empty-state">
            <div>No trips yet</div>
            <button onClick={onNewTrip}>Add your first trip</button>
          </div>
        )}
      </div>
    </div>
  );
}