import React, { useState, useEffect } from "react";
import { patchTrip, postTrip } from "../api/index";
import { buildTripPayload } from "../api/createItem";
import Markdown from "../components/Markdown";
import { applyNoteTokens, resolveDynamicAliases, parseTripDictionary } from "../utils/tokenHelpers";
// import "../styles/markdownSplitScreen.css";
// import "../styles/TripEditorScreen.css";

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
  const [tripSummary, setTripSummary] = useState(activeItem.tripSummary || "");


  useEffect(() => {
    setText(activeItem?.tripNotes || "");
  }, [activeItem?.id]);

  function update(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }

  const isEditing = !!activeItem?.id;
  // --------------------------------------------------------------------------
async function handleSave() {
  const start = new Date();

  // 1. Parse dictionary from tripSummary
  const dictionary = parseTripDictionary(tripSummary || "");

  // 2. Merge dictionary into trip object
  const tripWithDict = {
    ...activeItem,
    tripSummary,
    dictionary
  };

  // 3. PASS 1: dynamic tokens (%A%, %TripLeader%, %CITY[0]%, etc.)
  const pass1 = resolveDynamicAliases(text, tripWithDict);

  // 4. PASS 2: static tokens ([[date]], [[time]], etc.)
  const pass2 = applyNoteTokens(pass1, {
    dateObj: start,
    trip: tripWithDict,
    segment: activeItem.kind === "segment" ? activeItem : null,
    tour: activeItem.kind === "tour" ? activeItem : null,
    note: activeItem.kind === "note" ? activeItem : null
  });

  // 5. Build payload
  const payload = buildTripPayload({
    ...tripWithDict,
    tripNotes: pass2,
    tripSummary
  });

  const updated = isEditing
    ? await patchTrip(activeItem.id, payload)
    : await postTrip(payload);

  onRefresh(updated);
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

      {/* TYPE */}
      <div className="editor-row">
        <div className="editor-label">
          <label>Type </label>
          <select className="pick-list"
            value={activeItem.type}
            onChange={e => update("type", e.target.value)}
          >
            <option value="travel">✈️ Plane</option>
            <option value="work">💼 Work</option>
            <option value="personal">❤️ Personal</option>
            <option value="tour">🧭 Tour</option>
            <option value="experience">🎨 Experience</option>
            <option value="nature">🌿 Nature</option>
            <option value="other">🧳 Other</option>
          </select>
        </div>

        {/* NAME */}
        <div className="editor-label">
          <label className="editor-label">Name</label>
          <input
            className="editor-input"
            type="text"
            value={activeItem?.name}
            onChange={e => update("name", e.target.value)}
          />
        </div>
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
        {/* TRIP SUMMARY */}
        <label>Trip Summary</label>
        <textarea
          value={tripSummary}
          onChange={e => setTripSummary(e.target.value)}
          placeholder="Enter token:value pairs or dynamic tokens here..."
          rows={10}
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
    </div >
  );
}
