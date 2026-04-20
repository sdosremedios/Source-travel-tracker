import React, { useState, useEffect } from "react";
import { createNote, updateNote } from "../api";
import { fetchTemplates } from "../api";
import "../styles/NoteEditorScreen.css";

export default function NoteEditorScreen({
  activeItem,
  setActiveItem,
  onCancel,
  onRefresh,
  onClose
}) {
  const isEditing = !!activeItem?.id;

  const [dateTime, setDateTime] = useState("");

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

  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchTemplates("note").then(setTemplates).catch(console.error);
  }, []);

  // --- Save handler (local → UTC) ---
async function handleSave() {
  const utc = new Date(dateTime).toISOString();

  const payload = {
    tripId: activeItem.tripId,
    dateTime: utc,
    note: activeItem.note || ""
  };

  let saved;

  if (isEditing) {
    saved = await updateNote(activeItem.id, payload);
  } else {
    saved = await createNote(payload);
  }

  onRefresh(saved);
}

  return (
    <div className="note-editor-screen">
      <div className="editor-header">
        <h2>{isEditing ? "Edit Note" : "New Note"}</h2>
      </div>

      <label>Date & Time</label>
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
      />

      <label>Note</label>
      <div>
        <div className="template-buttons">
          {templates.map(t => (
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
          ))}
        </div>
        <div className="markdown-text">
          <textarea
            value={activeItem.note || ""}
            onChange={e =>
              setActiveItem(prev => ({ ...prev, note: e.target.value }))
            }
          /></div>
      </div>

      <div className="editor-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
