import React from "react";
import { deleteNote } from "../api/index";

import "../styles/NoteDetailScreen.css";


export default function NoteDetailScreen({ note, onEdit, onClose, onRefresh }) {
  if (!note) return null;

  async function handleDelete() {
    if (!confirm("Delete this note?")) return;

    await deleteNote(note.id);

    onClose();
    onRefresh();
  }

  return (
    <div className="nd-pane">
      {/* Header -------------------------------------------------------------- */}
      <div className="nd-header">
        <div className="nd-icon">📝</div>
        <h1 className="nd-title">Note</h1>
      </div>

      {/* Metadata ------------------------------------------------------------ */}
      <div className="nd-meta">
        <div>
          <strong>Date:</strong> {note.dateTime}
        </div>
      </div>

      {/* Note text ----------------------------------------------------------- */}
      <div className="nd-body">
        <p>{note.note}</p>
      </div>

      {/* Buttons ------------------------------------------------------------- */}
      <div className="nd-buttons">
        <button className="nd-btn edit" onClick={() => onEdit(note)}>
          Edit
        </button>

        <button className="danger" onClick={handleDelete}>
          Delete
        </button>

        <button className="nd-btn close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
