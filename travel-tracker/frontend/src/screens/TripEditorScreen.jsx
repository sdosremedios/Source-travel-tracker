import React, { useState } from "react";
import { createTrip, updateTrip } from "../api";
import "../styles/TripEditorScreen.css";

const TRIP_TYPE_ICONS = {
  travel: "✈️",
  tour: "🧭",
  experience: "🎨",
  work: "💼",
  personal: "❤️",
  other: "🌀"
};

export default function TripEditorScreen({ trip, onClose, onSaved }) {
  const isEditing = Boolean(trip);

  const [local, setLocal] = useState({
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
    const data = { ...local };

    if (trip?.id) {
      await updateTrip(trip.id, data);
    } else {
      await createTrip(data);
    }

    onSaved?.();
    onClose?.();
  }

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
