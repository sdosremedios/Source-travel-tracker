import React from "react";
import Markdown from "../components/Markdown";
import { deleteNote } from "../api/index";
import { refreshNotes } from "../utils/refreshHelpers";

import "../styles/NoteDetailScreen.css";


export default function NoteDetailScreen({
  note,
  onEdit,
  onClose,
  onRefresh
}) {
  if (!note) return null;

  async function handleDelete() {
    if (!confirm("Delete this note?")) return;

    await deleteNote(note.tripId, note.id);

    /*
      onRefresh(note);
      selectedTripId,
      loadNotesForTrip,
      setNotes,
      setActiveScreen
    
    */
    onRefresh(note);
    onClose();
  }

  return (
    <div className="note-detail-screen">
      {/* Header -------------------------------------------------------------- */}
      <div className="header">
        <div className="icon">📝</div>
        <h1 className="title">Note</h1>

        {/* Metadata ------------------------------------------------------------ */}
        <div className="data">
          <div>
            <strong>Date:</strong> {new Date(note.dateTime).toLocaleString()}
          </div>
        </div>
        {/* Buttons ------------------------------------------------------------- */}
        <div className="buttons">
          <button
            className="nd-btn edit"
            onClick={() =>
              onEdit({
                id: note.id,
                kind: "note",
                tripId: note.tripId,
                dateTime: note.dateTime,
                note: note.note || ""
              })
            }
          >
            Edit
          </button>

          <button className="nd-btn danger" onClick={handleDelete}>
            Delete
          </button>

          <button className="nd-btn close" onClick={onClose}>
            Close
          </button>

        </div>
      </div>
      {/* Note text ----------------------------------------------------------- */}
      <div className="markdown-text">
        <Markdown>{note.note}</Markdown>
      </div>
    </div>
  );
}
