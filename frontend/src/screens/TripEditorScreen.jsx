import React, { useState, useEffect, act } from "react";
import { loadTrips, postTrip, patchTrip, fetchTemplates } from "../api/index";
import { normalizeDate, isValidDateString, isChronological } from "../utils/dateHelpers";
import { createItem } from "../api/createItem"
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
  onRefresh
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
      tripNotes: activeItem?.tripNotes || ""
    });
  */
  const [templates, setTemplates] = useState([]);
  useEffect(() => {
    fetchTemplates("trip").then(setTemplates).catch(console.error);
  }, []);


  function updateField(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
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
    console.log("TripEditorScreen handleSave with:", activeItem)
    const id = activeItem?.id ?? null;

    // Build a clean payload from activeItem
    const payload = {
      ...activeItem,
      startDate,
      endDate
    };

    let savedTrip;

    if (id === null) {
      savedTrip = await postTrip(payload);
    } else {
      savedTrip = await patchTrip(id, payload);
    }
    // Save normalized values
    console.log("TripEditorScreen onRefresh trip savedItem = ", savedTrip);
    onRefresh(savedTrip);
    //onClose();
  }

  //console.log("Rendering TripEditorScreen with local state:", local);
  return (
    <div className="trip-editor-screen">
      <div className="header">
        <h1 className="te-title">
          {isEditing ? "Edit Trip" : "New Trip"}
        </h1>
        {/* Buttons */}
        <div className="buttons">
          <button className="save" onClick={handleSave}>
            Save
          </button>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      {/* Trip Type */}
      <div className="te-type-row">
        <label className="te-label">
          <span className="icon">
            {TRIP_TYPE_ICONS[activeItem.type]}
          </span> Trip Type
        </label>

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
      < div className="template-buttons" >
        {
          templates.map(t => (
            <button
              key={t.id}
              className="template-button"
              onClick={() => {
                setActiveItem(prev => ({
                  ...prev,
                  tripNotes: (prev.tripNotes || "") + "\n\n" + t.template
                }));
              }}
            >
              {t.icon} {t.name}
            </button>
          ))
        }
      </div >
      <textarea className="markdown-edit"
        name="markdown-edit"
        value={activeItem.tripNotes || ""}
        onChange={e =>
          setActiveItem(prev => ({ ...prev, tripNotes: e.target.value }))
        }
      />
    </div>
  );
}
