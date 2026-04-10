import React, { useState, useEffect, useRef } from "react";
import "../styles/TripListScreen.css";
import { tripIcon } from "../utils/icons";
import { formatDate, normalizeDate } from "../utils/dateHelpers";

export default function TripListScreen({
  trips,
  selectedTripId,
  onSelectTrip,
  onNewTrip,
  onRefresh
}) {
  const fileInputRef = useRef(null);
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

  function normalizeTrip(t) {
    return {
      name: t.name,
      startDate: normalizeDate(t.startDate),
      endDate: normalizeDate(t.endDate),
      notes: t.notes || "",
      type: t.type || "travel"
    };
  }

  async function uploadTrips(trips) {
    console.log("Uploading trips:", trips);
    const res = await fetch("/api/trips/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trips })
    });

    if (!res.ok) {
      alert("Import failed");
      return;
    } else {
      alert("Import successful");
    }
  }

  async function handleImportCsv(e) {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split("\n").map(r => r.trim()).filter(Boolean);

    const [headerLine, ...dataLines] = rows;
    const headers = headerLine.split(",");

    const trips = dataLines.map(line => {
      const cols = line.split(",");
      const obj = {};

      headers.forEach((h, i) => {
        obj[h.trim()] = cols[i]?.trim() || "";
      });

      return normalizeTrip(obj);
    });

    console.log("Parsed trips:", trips);

    await uploadTrips(trips);
    onRefresh(); // reset import state if coming from import  
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

      <button
        className="import-button"
        onClick={() => fileInputRef.current.click()}>
        Import Trips (.csv)
      </button>

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImportCsv}
      />
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
                {formatDate(t.startDate,false)}
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