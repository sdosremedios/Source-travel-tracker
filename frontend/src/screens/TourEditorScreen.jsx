import { useState, useEffect } from "react";
import "../styles/TourEditorScreen.css";          // ⭐ your CSS restored
import TourCategorySelector from "../components/TourCategorySelector";
import { isValidDateTime, isChronological } from "../utils/dateHelpers";
import { patchTour, postTour } from "../api/index";
import { buildTourPayload } from "../api/createItem";

export default function TourEditorScreen({
  activeItem,
  setActiveItem,
  activeTrip, // parent
  onCancel,
  onRefresh,
  allTemplates
}) {

  const templates = allTemplates.filter(t => t.types.includes("tour"));

  // ---------------------------------------
  // 3. UPDATE HELPER
  // ---------------------------------------
  function update(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }

  // ---------------------------------------
  // 4. SAVE HANDLER (RESTORED)
  // ---------------------------------------
  async function handleSave() {
    const { startDate, startTime, endDate, endTime } = activeItem;

    // Optional: allow empty dates (unscheduled tours)
    const hasStart = startDate && startTime;
    const hasEnd = endDate && endTime;

    if (hasStart && !isValidDateTime(startDate, startTime)) {
      alert("Start date/time is invalid");
      return;
    }

    if (hasEnd && !isValidDateTime(endDate, endTime)) {
      alert("End date/time is invalid");
      return;
    }

    if (hasStart && hasEnd && !isChronological(startDate, startTime, endDate, endTime)) {
      alert("End must be after start");
      return;
    }
    console.log("Saving tour with data:", activeItem);
    const isEditing = activeItem?.id ?? Boolean;
    const payload = buildTourPayload(activeItem);

    const updated = isEditing
      ? await patchTour(activeTrip.id, activeItem.id, payload)
      : await postTour(activeTrip.id, payload);

    onRefresh(updated);
  }

  // ---------------------------------------
  // 5. RENDER
  // ---------------------------------------
  return (
    <div className="tour-editor-screen">
      <div className="header">
        <h2 className="editor-title">Edit Tour</h2>
        {/* SAVE / CANCEL */}
        <div className="buttons">
          <button className="save" onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
      {/* NAME */}
      <div className="editor-row">
        <label className="editor-label">Name</label>
        <input
          className="editor-input"
          type="text"
          value={activeItem.name}
          onChange={e => update("name", e.target.value)}
        />
      </div>

      {/* COMPANY */}
      <div className="editor-row">
        <label className="editor-label">Company</label>
        <input
          className="editor-input"
          type="text"
          value={activeItem.company}
          onChange={e => update("company", e.target.value)}
        />
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="editor-row">
        <label className="editor-label">Category</label>
        <TourCategorySelector
          value={activeItem.category}
          onChange={value => update("category", value)}
        />
      </div>

      {/* LOCATION */}
      <div className="editor-row">
        <label className="editor-label">Location</label>
        <input
          className="editor-input"
          type="text"
          value={activeItem.location}
          onChange={e => update("location", e.target.value)}
        />
      </div>

      {/* START DATE/TIME */}
      <div className="editor-row">
        <label className="editor-label">Start</label>
        <div className="editor-inline">
          <input
            className="editor-input"
            type="date"
            value={activeItem.startDate}
            onChange={e => update("startDate", e.target.value)}
          />
          <input
            className="editor-input"
            type="time"
            value={activeItem.startTime}
            onChange={e => update("startTime", e.target.value)}
          />
        </div>
      </div>

      {/* END DATE/TIME */}
      <div className="editor-row">
        <label className="editor-label">End</label>
        <div className="editor-inline">
          <input
            className="editor-input"
            type="date"
            value={activeItem.endDate}
            onChange={e => update("endDate", e.target.value)}
          />
          <input
            className="editor-input"
            type="time"
            value={activeItem.endTime}
            onChange={e => update("endTime", e.target.value)}
          />
        </div>
      </div>

      {/* NOTES */}
      <div className="editor-row">
        <label className="editor-label">Notes</label>
        < div className="template-buttons" >
          {
            templates.map(t => (
              <button
                key={t.id}
                className="template-button"
                onClick={() => {
                  setActiveItem(prev => ({
                    ...prev,
                    notes: (prev.notes || "") + "\n\n" + t.template
                  }));
                }}
              >
                {t.icon} {t.name}
              </button>
            ))
          }
        </div >
        <textarea
          className="markdown-edit"
          value={activeItem.notes}
          onChange={e => update("notes", e.target.value)}
        />
      </div>

    </div>
  );
}
