import React, { useState, useEffect } from "react";
import Markdown from "../components/Markdown";
// import "../styles/markdownSplitScreen.css";
import "../styles/SegmentEditorScreen.css";
import { postSegment, patchSegment } from "../api/index";
import { buildSegmentPayload } from "../api/createItem";
import { applyNoteTokens, parseTripDictionary, resolveDynamicAliases } from "../utils/tokenHelpers";

export default function SegmentEditorScreen({
  activeItem,
  setActiveItem,
  activeTrip,
  onCancel,
  onRefresh,
  allTemplates
}) {
  const templates = allTemplates.filter(t => t.types.includes("segment"));

  // Local-only state for textarea
  const [text, setText] = useState("");

  // Initialize textarea ONLY when the editor opens or item changes
  useEffect(() => {
    setText(activeItem?.notes || "");
  }, [activeItem?.id]);

  function update(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }

  const isEditing = activeItem?.id != null;

  function localToUtc(datetimeLocal) {
    return new Date(datetimeLocal).toISOString();
  }

  // --------------------------------------------------------------
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

    // 4. PASS 2: static tokens ([[date]], [[time]], [[segmentFrom]], etc.)
    const pass2 = applyNoteTokens(pass1, {
      dateObj,
      trip: tripWithDict,
      segment: activeItem,   // segments always have segment context
      tour: null,
      note: null
    });

    const updatedItem = {
      ...activeItem,
      notes: pass2
      //dateTime: localToUtc(activeItem.dateTime)
    };

    const payload = buildSegmentPayload(updatedItem);

    const saved = isEditing
      ? await patchSegment(activeTrip.id, activeItem.id, payload)
      : await postSegment(activeTrip.id, payload);

    onRefresh(saved);
  }

  return (
    <div className="segment-editor-screen">
      <div className="header">
        <h2>{isEditing ? "Edit Travel" : "Add Travel"}</h2>
        <div className="buttons">
          <button className="save" onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Mode</label>
          <select
            value={activeItem.mode}
            onChange={e => update("mode", e.target.value)}
          >
            <option value="plane">Plane</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="car">Car</option>
          </select>
        </div>

        <div className="se-field">
          <label>Carrier</label>
          <input
            value={activeItem.carrier || ""}
            onChange={e => update("carrier", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Start Date</label>
          <input
            type="date"
            value={activeItem.startDate || ""}
            onChange={e => update("startDate", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>End Date</label>
          <input
            type="date"
            value={activeItem.endDate || ""}
            onChange={e => update("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Departure</label>
          <input
            value={activeItem.fromLocation || ""}
            onChange={e => update("fromLocation", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>Departure Time</label>
          <input
            type="time"
            className="se-input"
            value={activeItem.departureTime || ""}
            onChange={e => update("departureTime", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Destination</label>
          <input
            value={activeItem.toLocation || ""}
            onChange={e => update("toLocation", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>Arrival Time</label>
          <input
            type="time"
            className="se-input"
            value={activeItem.arrivalTime || ""}
            onChange={e => update("arrivalTime", e.target.value)}
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
