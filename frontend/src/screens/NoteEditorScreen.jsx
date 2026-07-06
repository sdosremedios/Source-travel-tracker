import React, { useState, useEffect } from "react";
import { postNote, patchNote } from "../api/index";
import { buildNotePayload } from "../api/createItem";
import Markdown from "../components/Markdown";
import { applyNoteTokens, resolveDynamicAliases, parseTripDictionary } from "../utils/tokenHelpers";
import "../styles/NoteEditorScreen.css";
//import "../styles/markdownSplitScreen.css";

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

  function localToUtc(datetimeLocal) {
    return new Date(datetimeLocal).toISOString();
  }
  // --- Save handler -------------------------------------------------------
async function handleSave() {
  const dateObj = new Date();

  // 1. Parse dictionary from tripSummary
  const dictionary = parseTripDictionary(activeTrip.tripSummary || "");

  // 2. Merge dictionary into trip object
  const tripWithDict = {
    ...activeTrip,
    dictionary
  };

  // 3. PASS 1: dynamic tokens (%A%, %TripLeader%, %CITY[0]%, etc.)
  const pass1 = resolveDynamicAliases(text, tripWithDict);

  // 4. PASS 2: static tokens ([[date]], [[time]], etc.)
  const pass2 = applyNoteTokens(pass1, {
    dateObj,
    trip: tripWithDict,
    segment: activeItem.kind === "segment" ? activeItem : null,
    tour: activeItem.kind === "tour" ? activeItem : null,
    note: activeItem.kind === "note" ? activeItem : null
  });

  const updatedItem = {
    ...activeItem,
    note: pass2,
    dateTime: localToUtc(activeItem.dateTime)
  };

  const payload = buildNotePayload(updatedItem);

  const saved = isEditing
    ? await patchNote(activeTrip.id, activeItem.id, payload)
    : await postNote(activeTrip.id, payload);

  onRefresh(saved);
}

  const pageTitle = isEditing ? activeTrip.name + ": Note" : "New Note";

  return (
    <div className="note-editor-screen">
      <div className="header">
        <h2>{pageTitle}</h2>
        <div className="buttons">
          <button className="save" onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <label>Date & Time</label>
      <input
        type="datetime-local"
        value={activeItem.dateTime}
        onChange={e =>
          setActiveItem(prev => ({ ...prev, dateTime: e.target.value }))
        }
      />

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
