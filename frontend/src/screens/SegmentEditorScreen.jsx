import React, { useState } from "react";
import "../styles/SegmentEditorScreen.css";
import { postSegment, patchSegment } from "../api/index";
import { defaultDate } from "../utils/dateHelpers";

export default function SegmentEditorScreen({
  activeItem,
  setActiveItem,
  tripId,
  segment,
  onCancel,
  onRefresh
}) {
  const isEditing = Boolean(segment);
  /*
    const [local, setLocal] = useState({
      tripId: segment?.tripId ?? tripId,
      startDate: segment?.startDate ?? "",
      endDate: segment?.endDate ?? "",
      mode: segment?.mode ?? "flight",
      fromLocation: segment?.fromLocation ?? "",
      toLocation: segment?.toLocation ?? "",
      departureTime: segment?.departureTime ?? "",   // ← FIX
      arrivalTime: segment?.arrivalTime ?? "",       // ← FIX
      notes: segment?.notes ?? "",
      carrier: segment?.carrier ?? ""
    });
  */

  function update(field, value) {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }
  async function handleSave() {
    let startDate = activeItem.startDate || defaultDate();

    const payload = {
      ...activeItem,
      departureTime: activeItem.departureTime || segment?.departureTime || null,
      arrivalTime: activeItem.arrivalTime || segment?.arrivalTime || null
    };

    console.log("PAYLOAD BEING SENT:", payload);

    const isEditing = activeItem?.id != null;

    isEditing ? await patchSegment(segment.id, activeItem) : await postSegment(activeItem);


    // Notify parent to refresh timeline
    onRefresh(activeItem);

    // Desktop workflow: keep editor open
    // Mobile workflow: parent decides whether to close
    // So we DO NOT auto-close here.
  }

  console.log("segment passed into editor:", segment);
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
            value={activeItem.startDate}
            onChange={e => update("startDate", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>End Date</label>
          <input
            type="date"
            value={activeItem.endDate}
            onChange={e => update("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Departure</label>
          <input
            value={activeItem.fromLocation}
            onChange={e => update("fromLocation", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>Departure Time</label>
          <input
            type="time"
            className="se-input"
            value={activeItem.departureTime}
            onChange={e => update("departureTime", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Destination</label>
          <input
            value={activeItem.toLocation}
            onChange={e => update("toLocation", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>Arrival Time</label>
          <input
            type="time"
            className="se-input"
            value={activeItem.arrivalTime}
            onChange={e => update("arrivalTime", e.target.value)}
          />
        </div>
      </div>

      <div className="se-field">
        <label>Notes</label>
        <div className="markdown-box">
          <textarea className="markdown-edit"
            value={activeItem.notes}
            onChange={e => update("notes", e.target.value)}
          />
        </div>
      </div>


    </div>
  );
}