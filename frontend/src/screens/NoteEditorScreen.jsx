import React, { useState, useEffect } from "react";
import { postNote, patchNote, fetchTemplates } from "../api/index";
import { buildNotePayload } from "../api/createItem";
import "../styles/NoteEditorScreen.css";
import { isoDateTime } from "../utils/dateHelpers";

export default function NoteEditorScreen({
  activeItem,
  setActiveItem,
  activeTrip, // parent
  onCancel,
  onRefresh,
  allTemplates
}) {
  const isEditing = !!activeItem?.id;

  const [dateTime, setDateTime] = useState("");
  const templates = allTemplates.filter(t => t.types.includes("note"));


  // --- Load existing note (UTC → local) ---
  useEffect(() => {
    if (activeItem && activeItem.note === undefined) {
      setActiveItem(prev => ({ ...prev, note: "" }));
    }
  }, [activeItem, setActiveItem]);
  useEffect(() => {
    if (activeItem?.dateTime) {
      const d = new Date(activeItem.dateTime); // stored UTC → converted to local
      const local = d
        .toLocaleString("sv-SE")        // YYYY-MM-DD HH:mm:ss (local)
        .replace(" ", "T")              // → YYYY-MM-DDTHH:mm:ss
        .slice(0, 16);                  // → YYYY-MM-DDTHH:mm
      setDateTime(local);
    } else {
      // NEW note → default to now (local)
      const now = new Date();
      const local = now
        .toLocaleString("sv-SE")
        .replace(" ", "T")
        .slice(0, 16);
      setDateTime(local);
    }
  }, [activeItem]);

  // --- Save handler (local → UTC) ---
  async function handleSave() {
    const payload = buildNotePayload(activeItem);

    const updated = isEditing
      ? await patchNote(activeTrip.id, activeItem.id, payload)
      : await postNote(activeTrip.id, payload);

      onRefresh(updated);

    onCancel(); //Close
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
        onChange={e =>
          setActiveItem(prev => ({ ...prev, dateTime: e.target.value }))
        }
      />

      <label>Note</label>
      <div className="template-buttons">
        {templates.map(t => (
          <button
            key={t.id}
            className="template-button"
            onClick={() => {
              setActiveItem(prev => ({
                ...prev,
                note: (prev.note || "") + "\n" + t.template
              }));
            }}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>
      <textarea className="markdown-edit"
        value={activeItem.note || ""}
        onChange={e =>
          setActiveItem(prev => ({ ...prev, note: e.target.value.trim }))
        }
      />
    </div>
  );
}
