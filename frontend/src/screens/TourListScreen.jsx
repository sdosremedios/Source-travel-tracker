import React, { useState, useEffect, useRef } from "react";
import "../styles/TripListScreen.css";
import { tripIcon } from "../utils/icons";

export default function TripListScreen({
  trips,
  selectedTripId,
  onSelectTrip,
  filterCategory // optional: "walking", "museum", etc.
}) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(trips);
  const listRef = useRef(null);
  const [cursor, setCursor] = useState(0);

  // --- Filter trips by search + category ------------------------------------
  useEffect(() => {
    let result = trips;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(t => (t.name || "").toLowerCase().includes(q));
    }

    if (filterCategory) {
      result = result.filter(t =>
        t.tours?.some(tour => tour.category === filterCategory)
      );
    }

    setFiltered(result);
    setCursor(0);
  }, [query, trips, filterCategory]);

  // --- Keyboard navigation ---------------------------------------------------
  function handleKeyDown(e) {
    if (!filtered.length) return;

    if (e.key === "ArrowDown") {
      setCursor(c => Math.min(c + 1, filtered.length - 1));
      e.preventDefault();
    }

    if (e.key === "ArrowUp") {
      setCursor(c => Math.max(c - 1, 0));
      e.preventDefault();
    }

    if (e.key === "Enter") {
      onSelectTrip(filtered[cursor].id);
    }
  }

  // --- Group trips by year ---------------------------------------------------
  const groups = {};
  for (const trip of filtered) {
    const year = trip.startDate?.slice(0, 4) || "Unknown";
    if (!groups[year]) groups[year] = [];
    groups[year].push(trip);
  }

  return (
    <div
      className="tls-pane"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={listRef}
    >
      <div className="tls-search">
        <input
          type="text"
          placeholder="Search trips..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="tls-list">
        {Object.entries(groups).map(([year, group]) => (
          <div key={year} className="tls-year-block">
            <div className="tls-year-header">{year}</div>

            {group.map((trip, index) => {
              const isSelected = trip.id === selectedTripId;
              const isCursor = index === cursor;

              return (
                <div
                  key={trip.id}
                  className={`tls-row ${isSelected ? "selected" : ""
                    } ${isCursor ? "cursor" : ""}`}
                  onClick={() => onSelectTrip(trip.id)}
                >
                  <div className="tls-icon">{tripIcon(trip)}</div>

                  <div className="tls-main">
                    <div className="tls-name">{trip.name}</div>
                    <div className="tls-sub">
                      {trip.startDate} → {trip.endDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}