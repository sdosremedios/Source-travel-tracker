import React, { useState, useEffect } from "react";
import { loadTrips, createTrip, updateTrip } from "../api";
import { normalizeDate, isValidDateString, isChronological } from "../utils/dateHelpers";
import { fetchTemplates } from "../api";
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
  activeItem,
  setActiveItem,
  onClose,
  onSave
}) {
  const isEditing = Boolean(activeItem);
  /*
    const [local, setLocal] = useState({
      tripId: activeItem?.id || null,
      name: activeItem?.name || "",
      startDate: activeItem?.startDate || "",
      endDate: activeItem?.endDate || "",
      tripNotes: activeItem?.tripNotes || "",
      type: activeItem?.type || "travel",
      notes: activeItem?.notes || ""
    });
  */
  const [templates, setTemplates] = useState([]);
  useEffect(() => {
    fetchTemplates("trip").then(setTemplates).catch(console.error);
  }, []);


  function updateField(field, value) {
    setLocal(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    let { startDate, endDate } = activeItem;

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

    const id = activeItem?.tripId ?? null;
    let tripObj = null;

    if (id === null) {
      // CREATE
      tripObj = await createTrip(activeItem);
    } else {
      // UPDATE
      tripObj = await updateTrip(id, activeItem);
    }
    // Save normalized values
    onSave(activeItem);
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
          {TRIP_TYPE_ICONS[activeItem.type]}
        </span>

        <select
          className="te-input te-type-select"
          value={activeItem.type}
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
        value={activeItem.name}
        onChange={e => updateField("name", e.target.value)}
      />

      {/* Start Date */}
      <label className="te-label">Start Date</label>
      <input
        className="te-input"
        type="date"
        value={activeItem.startDate}
        onChange={e => updateField("startDate", e.target.value)}
      />

      {/* End Date */}
      <label className="te-label">End Date</label>
      <input
        className="te-input"
        type="date"
        value={activeItem.endDate}
        onChange={e => updateField("endDate", e.target.value)}
      />

      {/* Notes */}
      <label className="te-label">Notes</label>
      <div>
        < div className="template-buttons" >
          {
            templates.map(t => (
              <button
                key={t.id}
                className="template-button"
                onClick={() => {
                  setActiveItem(prev => ({
                    ...prev,
                    note: (prev.note || "") + "\n\n" + t.template
                  }));
                }}
              >
                {t.icon} {t.name}
              </button>
            ))
          }
        </div >
        <div className="markdown-text">
          <textarea
            value={activeItem.note || ""}
            onChange={e =>
              setActiveItem(prev => ({ ...prev, note: e.target.value }))
            }
          />
        </div>
      </div>
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
