import React, { useState, useEffect } from "react";
import { createNote, updateNote } from "../api";
import "../styles/NoteEditorScreen.css";

export default function NoteEditorScreen({
  tripId,
  note,
  onCancel,
  onRefresh,
  onClose
}) {
  const isEditing = !!note?.id;

  const [text, setText] = useState(note?.note || "");
  const [dateTime, setDateTime] = useState("");

  // --- Load existing note (UTC → local) ---
  useEffect(() => {
    if (note?.dateTime) {
      const d = new Date(note.dateTime); // stored UTC → converted to local
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
  }, [note]);

  // --- Save handler (local → UTC) ---
  async function handleSave() {
    const utc = new Date(dateTime).toISOString();

    const payload = {
      tripId,
      dateTime: utc,
      note: text
    };

    let saved;

    if (isEditing) {
      saved = await updateNote(note.id, payload);
    } else {
      saved = await createNote(payload);
    }

    onRefresh(saved);   // return the updated note object
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
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="editor-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
