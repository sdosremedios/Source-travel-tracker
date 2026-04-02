import React, { useState } from "react";
import { createTour, updateTour } from "../api/index.js";
import TourCategorySelector from "../components/TourCategorySelector.jsx";
import "../styles/TourEditorScreen.css"; // optional, if you have it

export default function TourEditorScreen({ tripId, tour, onClose }) {
  const isEditing = Boolean(tour);

  // --- Local state ---------------------------------------------------------
  const [local, setLocal] = useState({
    name: tour?.name || "",
    date: tour?.date || "",
    time: tour?.time || "",
    location: tour?.location || "",
    notes: tour?.notes || "",
    category: tour?.category || "walking" // default category
  });

  function updateField(field, value) {
    setLocal(prev => ({ ...prev, [field]: value }));
  }

  // --- Save handler --------------------------------------------------------
  async function handleSave() {
    if (isEditing) {
      await updateTour(tripId, tour.id, local);
    } else {
      await createTour(tripId, local);
    }
    onClose();
  }

  // --- UI ------------------------------------------------------------------
  return (
    <div className="editor-container">
      <h1 className="editor-title">
        {isEditing ? "Edit Tour" : "New Tour"}
      </h1>

      {/* Name --------------------------------------------------------------- */}
      <label className="editor-label">Name</label>
      <input
        className="editor-input"
        type="text"
        value={local.name}
        onChange={e => updateField("name", e.target.value)}
      />

      {/* Date --------------------------------------------------------------- */}
      <label className="editor-label">Date</label>
      <input
        className="editor-input"
        type="date"
        value={local.date}
        onChange={e => updateField("date", e.target.value)}
      />

      {/* Time --------------------------------------------------------------- */}
      <label className="editor-label">Time</label>
      <input
        className="editor-input"
        type="time"
        value={local.time}
        onChange={e => updateField("time", e.target.value)}
      />

      {/* Location ----------------------------------------------------------- */}
      <label className="editor-label">Location</label>
      <input
        className="editor-input"
        type="text"
        value={local.location}
        onChange={e => updateField("location", e.target.value)}
      />

      {/* Notes -------------------------------------------------------------- */}
      <label className="editor-label">Notes</label>
      <textarea
        className="editor-textarea"
        value={local.notes}
        onChange={e => updateField("notes", e.target.value)}
      />

      {/* Category Selector -------------------------------------------------- */}
      <h2 className="editor-section-title">Category</h2>

      <TourCategorySelector
        value={local.category}
        onChange={val => updateField("category", val)}
      />

      {/* Buttons ------------------------------------------------------------ */}
      <div className="editor-buttons">
        <button className="editor-button save" onClick={handleSave}>
          Save
        </button>
        <button className="editor-button cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}