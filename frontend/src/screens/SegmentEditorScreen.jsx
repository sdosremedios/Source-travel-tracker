import React, { useState } from "react";
import "../styles/SegmentEditorScreen.css";
import { updateSegment, createSegment } from "../api";

export default function SegmentEditorScreen({
  tripId,
  segment,
  onCancel,
  onRefresh
}) {
  const isEditing = Boolean(segment);

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

  function update(field, value) {
    setLocal(prev => ({ ...prev, [field]: value }));
  }
  async function handleSave() {
    const payload = {
      ...local,
      departureTime: local.departureTime || segment?.departureTime || null,
      arrivalTime: local.arrivalTime || segment?.arrivalTime || null
    };

    console.log("PAYLOAD BEING SENT:", payload);

    const url = isEditing
      ? `/api/segments/${segment.id}`
      : `/api/segments`;

    isEditing ? await updateSegment(segment.id, local) : await createSegment(local);


    // Notify parent to refresh timeline
    onRefresh(local);

    // Desktop workflow: keep editor open
    // Mobile workflow: parent decides whether to close
    // So we DO NOT auto-close here.
  }

  console.log("segment passed into editor:", segment);
  console.log("isEditing:", isEditing);

  return (
    <div className="se-pane">
      <h2>{isEditing ? "Edit Segment" : "Add Segment"}</h2>

      <div className="se-row">
        <div className="se-field">
          <label>Mode</label>
          <select
            value={local.mode}
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
            value={local.carrier || ""}
            onChange={e => update("carrier", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Start Date</label>
          <input
            type="date"
            value={local.startDate}
            onChange={e => update("startDate", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>End Date</label>
          <input
            type="date"
            value={local.endDate}
            onChange={e => update("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Departure</label>
          <input
            value={local.fromLocation}
            onChange={e => update("fromLocation", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>Departure Time</label>
          <input
            type="time"
            className="se-input"
            value={local.departureTime}
            onChange={e => update("departureTime", e.target.value)}
          />
        </div>
      </div>

      <div className="se-row">
        <div className="se-field">
          <label>Destination</label>
          <input
            value={local.toLocation}
            onChange={e => update("toLocation", e.target.value)}
          />
        </div>

        <div className="se-field">
          <label>Arrival Time</label>
          <input
            type="time"
            className="se-input"
            value={local.arrivalTime}
            onChange={e => update("arrivalTime", e.target.value)}
          />
        </div>
      </div>

      <div className="se-field">
        <label>Notes</label>
        <textarea
          value={local.notes}
          onChange={e => update("notes", e.target.value)}
        />
      </div>

      <div className="se-actions">
        <button className="se-btn save" onClick={handleSave}>
          Save
        </button>
        <button className="se-btn cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}