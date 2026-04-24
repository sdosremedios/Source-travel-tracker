import React, { useState, useEffect } from "react";
import "../styles/SegmentEditorScreen.css";
import { postSegment, patchSegment } from "../api/index";
import { buildSegmentPayload } from "../api/createItem";
import { defaultDate } from "../utils/dateHelpers";

export default function SegmentEditorScreen({
  activeItem,
  setActiveItem,
  activeTrip, // parent
  onCancel,
  onRefresh,
  allTemplates
}) {

  const templates = allTemplates.filter(t => t.types.includes("segment"));

  function update(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }
  const isEditing = activeItem?.id != null;

  async function handleSave() {
    const payload = buildSegmentPayload(activeItem);

    console.log("buildSegmentPayload:", payload);
    const updated = isEditing
      ? await patchSegment(activeTrip.id, activeItem.id, payload)
      : await postSegment(activeTrip.id, payload);

    onRefresh(updated);
  }

  console.log("segment passed into editor:", activeItem);
  console.log("isEditing:", isEditing);

  return (
    <div className="se-pane">
      <div className="header">
        <h2>{isEditing ? "Edit Segment" : "Add Segment"}</h2>
        <div className="buttons">
          <button className="save" onClick={handleSave}>
            Save
          </button>
          <button className="cancel" onClick={onCancel}>
            Cancel
          </button>
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
            <option value="train">Train</option>
            <option value="car">Car</option>
            <option value="bus">Bus</option>
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

      <div className="se-field">
        <label>Notes</label>
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
        <textarea className="markdown-edit"
          value={activeItem.notes}
          onChange={e => update("notes", e.target.value)}
        />
      </div>


    </div>
  );
}