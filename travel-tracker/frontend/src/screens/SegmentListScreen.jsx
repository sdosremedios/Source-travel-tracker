import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SegmentListScreen.css";

function computeArrivalOffset(startDate, departureTime, endDate, arrivalTime) {
  if (!departureTime || !arrivalTime) return "";

  const start = new Date(`${startDate}T${departureTime}`);
  const end = new Date(`${endDate}T${arrivalTime}`);
  const dayOffset = Math.floor((end - start) / (1000 * 60 * 60 * 24));

  if (dayOffset === 0) return "";
  if (dayOffset === 1) return "+1 day";
  if (dayOffset > 1) return `+${dayOffset} days`;
  if (dayOffset === -1) return "−1 day";
  return `−${Math.abs(dayOffset)} days`;
}

function computeDurationLabel(startDate, departureTime, endDate, arrivalTime) {
  if (!departureTime || !arrivalTime) return "";

  const start = new Date(`${startDate}T${departureTime}`);
  const end = new Date(`${endDate}T${arrivalTime}`);
  const minutes = Math.floor((end - start) / 60000);

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

function weekdayLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function SegmentListScreen() {
  const [segments, setSegments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();
  const listRef = useRef(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const res = await fetch("/api/segments");
    const data = await res.json();

    const hydrated = data.map(seg => ({
      ...seg,
      weekday: weekdayLabel(seg.startDate),
      arrivalOffset: computeArrivalOffset(
        seg.startDate,
        seg.departureTime,
        seg.endDate,
        seg.arrivalTime
      ),
      durationLabel: computeDurationLabel(
        seg.startDate,
        seg.departureTime,
        seg.endDate,
        seg.arrivalTime
      )
    }));

    setSegments(hydrated);
  }

  function openEditor(id) {
    navigate(`/segments/${id}`);
  }

  function handleKeyDown(e) {
    if (!segments.length) return;

    const idx = segments.findIndex(s => s.id === selectedId);

    if (e.key === "ArrowDown") {
      const next = segments[idx + 1] || segments[0];
      setSelectedId(next.id);
      scrollIntoView(next.id);
    }

    if (e.key === "ArrowUp") {
      const prev = segments[idx - 1] || segments[segments.length - 1];
      setSelectedId(prev.id);
      scrollIntoView(prev.id);
    }

    if (e.key === "Enter" && selectedId) {
      openEditor(selectedId);
    }
  }

  function scrollIntoView(id) {
    const el = document.getElementById(`seg-${id}`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  return (
    <div
      className="segment-list-screen"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={listRef}
    >
      {segments.map(seg => (
        <div
          key={seg.id}
          id={`seg-${seg.id}`}
          className={
            "segment-row" + (seg.id === selectedId ? " selected" : "")
          }
          onClick={() => setSelectedId(seg.id)}
          onDoubleClick={() => openEditor(seg.id)}
        >
          <div className="segment-main">
            <div className="segment-title">
              {seg.mode === "flight" ? "✈️" : "🚌"} {seg.fromLocation} → {seg.toLocation}
            </div>

            <div className="segment-detail">
              {seg.weekday} · {seg.startDate} · {seg.departureTime}
              {" → "}
              {seg.arrivalTime}
              {seg.arrivalOffset && ` (${seg.arrivalOffset})`}
              {seg.durationLabel && ` · ${seg.durationLabel}`}
              <button onClick={refresh}>Refresh</button>
            </div>
          </div>
        </div>
      ))}

    </div>
  );
}