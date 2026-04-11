import React, { useState } from "react";
import { loadTrips, createTrip, updateTrip } from "../api";
import { normalizeDate, isValidDateString, isChronological } from "../utils/dateHelpers";
import "../styles/TripEditorScreen.css";

const TRIP_TYPE_ICONS = {
  travel: "✈️",
  tour: "🧭",
  experience: "🎨",
  work: "💼",
  personal: "❤️",
  other: "🌀"
};

export default function TripEditorScreen({
  trip,
  onClose,
  onSave
}) {
  const isEditing = Boolean(trip);

  const [local, setLocal] = useState({
    tripId: trip?.id || null,
    name: trip?.name || "",
    startDate: trip?.startDate || "",
    endDate: trip?.endDate || "",
    notes: trip?.notes || "",
    type: trip?.type || "travel"
  });

  function updateField(field, value) {
    setLocal(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    let { startDate, endDate } = local;

    // Normalize first
    startDate = normalizeDate(startDate);
    endDate = normalizeDate(endDate);

    // Validate
    const hasStart = !!startDate;
    const hasEnd = !!endDate;

    if (hasStart && !isValidDateString(startDate)) {
      alert("Start date is invalid");
      return;
    }

    if (hasEnd && !isValidDateString(endDate)) {
      alert("End date is invalid");
      return;
    }

    if (hasStart && hasEnd && !isChronological(startDate, "00:00", endDate, "00:00")) {
      alert("End date must be on or after start date");
      return;
    }

    const id = local?.tripId ?? null;
    let tripObj = null;

    if (id === null) {
      // CREATE
      tripObj = await createTrip(local);
    } else {
      // UPDATE
      tripObj = await updateTrip(id, local);
    }
    // Save normalized values
    onSave(local);
  }

  //console.log("Rendering TripEditorScreen with local state:", local);
  return (
    <div className="te-pane">
      <h1 className="te-title">
        {isEditing ? "Edit Trip" : "New Trip"}
      </h1>

      {/* Trip Type */}
      <label className="te-label">Trip Type</label>
      <div className="te-type-row">
        <span className="te-type-icon">
          {TRIP_TYPE_ICONS[local.type]}
        </span>

        <select
          className="te-input te-type-select"
          value={local.type}
          onChange={e => updateField("type", e.target.value)}
        >
          <option value="travel">✈️ Travel</option>
          <option value="tour">🧭 Tour</option>
          <option value="experience">🎨 Experience</option>
          <option value="work">💼 Work</option>
          <option value="personal">❤️ Personal</option>
          <option value="other">🌀 Other</option>
        </select>
      </div>

      {/* Name */}
      <label className="te-label">Name</label>
      <input
        className="te-input"
        type="text"
        value={local.name}
        onChange={e => updateField("name", e.target.value)}
      />

      {/* Start Date */}
      <label className="te-label">Start Date</label>
      <input
        className="te-input"
        type="date"
        value={local.startDate}
        onChange={e => updateField("startDate", e.target.value)}
      />

      {/* End Date */}
      <label className="te-label">End Date</label>
      <input
        className="te-input"
        type="date"
        value={local.endDate}
        onChange={e => updateField("endDate", e.target.value)}
      />

      {/* Notes */}
      <label className="te-label">Notes</label>
      <textarea
        className="te-textarea"
        value={local.notes}
        onChange={e => updateField("notes", e.target.value)}
      />

      {/* Buttons */}
      <div className="te-buttons">
        <button className="te-btn save" onClick={handleSave}>
          Save
        </button>
        <button className="te-btn cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
