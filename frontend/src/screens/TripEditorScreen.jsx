import React, { useState, useEffect } from "react";
import { postTrip, patchTrip, fetchTemplates } from "../api/index";
import { buildTripPayload } from "../api/createItem";
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
  trip,          // <-- pass the trip directly, NOT activeItem
  onCancel,
  onRefresh
}) {

  const isEditing = Boolean(trip?.id);

  // LOCAL STATE ONLY — trips never use activeItem
  const [local, setLocal] = useState({
    name: trip?.name || "",
    startDate: trip?.startDate || "",
    endDate: trip?.endDate || "",
    tripNotes: trip?.tripNotes || "",
    type: trip?.type || "travel"
  });

  useEffect(() => {
    if (trip) {
      setLocal({
        name: trip.name || "",
        startDate: trip.startDate || "",
        endDate: trip.endDate || "",
        tripNotes: trip.tripNotes || "",
        type: trip.type || "travel"
      });
    }
  }, [trip]);
  
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchTemplates("trip").then(setTemplates).catch(console.error);
  }, []);

  async function handleSave() {
    const payload = buildTripPayload(local);

    const updated = isEditing
      ? await patchTrip(trip.id, payload)
      : await postTrip(payload);

    console.log("TripEditorScreen onRefresh trip updatedItem = ", updated);
    onRefresh(updated);
    onClose();
  }

  return (
    <div className="trip-editor-screen">
      <div className="header">
        <h1 className="te-title">
          {isEditing ? "Edit Trip" : "New Trip"}
        </h1>

        <div className="buttons">
          <button className="save" onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      {/* Trip Type */}
      <div className="te-type-row">
        <label className="te-label">
          <span className="icon">{TRIP_TYPE_ICONS[local.type]}</span>
          Trip Type
        </label>

        <select
          className="te-input te-type-select"
          value={local.type}
          onChange={e => setLocal(prev => ({ ...prev, type: e.target.value }))}
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
        onChange={e => setLocal(prev => ({ ...prev, name: e.target.value }))}
      />

      {/* Start Date */}
      <label className="te-label">Start Date</label>
      <input
        className="te-input"
        type="date"
        value={local.startDate}
        onChange={e => setLocal(prev => ({ ...prev, startDate: e.target.value }))}
      />

      {/* End Date */}
      <label className="te-label">End Date</label>
      <input
        className="te-input"
        type="date"
        value={local.endDate}
        onChange={e => setLocal(prev => ({ ...prev, endDate: e.target.value }))}
      />

      {/* Notes */}
      <label className="te-label">Notes</label>

      <div className="template-buttons">
        {templates.map(t => (
          <button
            key={t.id}
            className="template-button"
            onClick={() =>
              setLocal(prev => ({
                ...prev,
                tripNotes: (prev.tripNotes || "") + "\n" + t.template
              }))
            }
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      <textarea
        className="markdown-edit"
        value={local.tripNotes}
        onChange={e =>
          setLocal(prev => ({ ...prev, tripNotes: e.target.value.trim }))
        }
      />
    </div>
  );
}
