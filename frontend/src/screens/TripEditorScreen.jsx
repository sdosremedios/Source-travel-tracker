import React, { useState, useEffect } from "react";
import "../styles/TripEditorScreen.css";
import { patchTrip, postTrip } from "../api/index";
import { buildTripPayload } from "../api/createItem";

export default function TripEditorScreen({
  activeItem,
  setActiveItem,
  onCancel,
  onRefresh,
  allTemplates
}) {
  if (!activeItem) {
    return <div className="trip-editor-screen loading">Loading…</div>;
  }

  const templates = allTemplates?.filter(t => t.types.includes("trip"));
  const [text, setText] = useState("");

  useEffect(() => {
    setText(activeItem?.tripNotes || "");
  }, [activeItem?.id]);

  function update(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }

  const isEditing = !!activeItem?.id;

  async function handleSave() {
    // Sync textarea into payload
    const payload = buildTripPayload({
      ...activeItem,
      tripNotes: text
    });

    const updated = isEditing
      ? await patchTrip(activeItem.id, payload)
      : await postTrip(payload);

    onRefresh(updated);
    onCancel();
  }

  return (
    <div className="trip-editor-screen">
      <div className="header">
        <h2>{isEditing ? "Edit Trip" : "Add Trip"}</h2>
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
          value={activeItem?.name}
          onChange={e => update("name", e.target.value)}
        />
      </div>

      {/* START DATE */}
      <div className="editor-row">
        <label className="editor-label">Start Date</label>
        <input
          className="editor-input"
          type="date"
          value={activeItem?.startDate}
          onChange={e => update("startDate", e.target.value)}
        />
      </div>

      {/* END DATE */}
      <div className="editor-row">
        <label className="editor-label">End Date</label>
        <input
          className="editor-input"
          type="date"
          value={activeItem?.endDate}
          onChange={e => update("endDate", e.target.value)}
        />
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

        <textarea
          className="markdown-edit"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>
    </div>
  );
}
