import React, { useState, useEffect } from "react";
import { postNote, patchNote } from "../api/index";
import { buildNotePayload } from "../api/createItem";
import "../styles/NoteEditorScreen.css";

export default function NoteEditorScreen({
  activeItem,
  setActiveItem,
  activeTrip,
  onCancel,
  onRefresh,
  allTemplates
}) {
  const isEditing = !!activeItem?.id;
  const templates = allTemplates.filter(t => t.types.includes("note"));

  // --- Local state (single source of truth) ---
  const [text, setText] = useState("");
  const [dateTime, setDateTime] = useState("");

  // --- Initialize local state when switching notes ---
  useEffect(() => {
    // Note text
    setText(activeItem?.note || "");

    // Date/time
    if (activeItem?.dateTime) {
      const d = new Date(activeItem.dateTime);
      const local = d
        .toLocaleString("sv-SE")
        .replace(" ", "T")
        .slice(0, 16);
      setDateTime(local);
    } else {
      const now = new Date();
      const local = now
        .toLocaleString("sv-SE")
        .replace(" ", "T")
        .slice(0, 16);
      setDateTime(local);
    }
  }, [activeItem?.id]); // only reinitialize when switching notes

  // --- Save handler ---
  async function handleSave() {
    // Push local state back into activeItem
    const updatedItem = {
      ...activeItem,
      note: text,
      dateTime
    };

    const payload = buildNotePayload(updatedItem);

    const saved = isEditing
      ? await patchNote(activeTrip.id, activeItem.id, payload)
      : await postNote(activeTrip.id, payload);

    onRefresh(saved);
  }

  return (
    <div className="note-editor-screen">
      <div className="header">
        <h2>{isEditing ? "Edit Note" : "New Note"}</h2>
        <div className="buttons">
          <button className="save" onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <label>Date & Time</label>
      <input
        type="datetime-local"
        value={dateTime}
        onChange={e => setDateTime(e.target.value)}
      />

      <label>Note</label>

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
  );
}
