import { useState } from "react";
import { createNote, updateNote } from "../api/index";


import "../styles/NoteEditorScreen.css";

export default function NoteEditorScreen({ note, tripId, onClose, onRefresh }) {
  const isEditing = !!note?.id;

  const [dateTime, setDateTime] = useState(
    note?.dateTime || new Date().toISOString().slice(0, 16)
  );
  const [text, setText] = useState(note?.note || "");

  async function handleSave() {
    const payload = {
      tripId,
      dateTime,
      note: text
    };

    if (isEditing) {
      await updateNote(note.id, payload);
    } else {
      await createNote(payload);
    }

    onClose();
    onRefresh();
  }

  return (
    <div className="ne-pane">
      <h1>{isEditing ? "Edit Note" : "New Note"}</h1>

      <div className="ne-field">
        <label>Date/Time</label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />
      </div>

      <div className="ne-field">
        <label>Note</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
        />
      </div>

      <div className="ne-buttons">
        <button className="ne-btn save" onClick={handleSave}>
          Save
        </button>
        <button className="ne-btn cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
