import { useState, useEffect } from "react";
import Markdown from "../components/Markdown";
import "../styles/markdownSplitScreen.css";
import "../styles/TourEditorScreen.css";
import TourCategorySelector from "../components/TourCategorySelector";
import { isValidDateTime, isChronological } from "../utils/dateHelpers";
import { patchTour, postTour } from "../api/index";
import { buildTourPayload } from "../api/createItem";

export default function TourEditorScreen({
  activeItem,
  setActiveItem,
  activeTrip,
  onCancel,
  onRefresh,
  allTemplates
}) {
  const templates = allTemplates.filter(t => t.types.includes("tour"));

  // Local-only textarea state
  const [text, setText] = useState("");

  // Initialize textarea ONLY when editor opens or item changes
  useEffect(() => {
    setText(activeItem?.notes || "");
  }, [activeItem?.id]);

  function update(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    const { startDate, startTime, endDate, endTime } = activeItem;

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

    // Sync textarea into payload
    const payload = buildTourPayload({
      ...activeItem,
      notes: text
    });

    const isEditing = !!activeItem?.id;

    const updated = isEditing
      ? await patchTour(activeTrip.id, activeItem.id, payload)
      : await postTour(activeTrip.id, payload);

    onRefresh(updated);
    onCancel();
  }

  return (
    <div className="tour-editor-screen">
      <div className="header">
        <h2 className="editor-title">{activeItem.id ? "Edit Tour" : "Add Tour"}</h2>
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

      {/* CATEGORY */}
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

      {/* START */}
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

      {/* END */}
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
      <div className="editor-row notes">
        <label className="editor-label">Notes</label>

        <div className="template-buttons">
          {templates.map(t => (
            <button
              key={t.id}
              className="template-button"
              onClick={() => setText(prev => prev + "\n" + t.template)}
            >
              {t.icon} {t.name}
            </button>
          ))}
        </div>

        <div className="notes-container">
          <div className="notes-editor">
            <textarea
              className="markdown-edit"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          <div className="notes-preview markdown-text">
            <Markdown>{text}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
