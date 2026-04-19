import { useState, useEffect } from "react";
import "../styles/TourEditorScreen.css";          // ⭐ your CSS restored
import TourCategorySelector from "../components/TourCategorySelector";
import { isValidDateTime, isChronological } from "../utils/dateHelpers";
import { updateTour, createTour } from "../api/index";

export default function TourEditorScreen({ tour, tripId, onRefresh,  onClose }) {
  // ---------------------------------------
  // 1. INITIALIZE LOCAL STATE (ONCE)
  // ---------------------------------------
  const [local, setLocal] = useState(() => ({
    id: tour?.id,                     // ⭐ REQUIRED
    tripId: tour?.tripId ?? tripId,
    name: tour?.name ?? "(untitled)",
    company: tour?.company ?? "",
    category: tour?.category ?? "",
    location: tour?.location ?? "",
    startDate: tour?.startDate ?? "",
    startTime: tour?.startTime ?? "",
    endDate: tour?.endDate ?? "",
    endTime: tour?.endTime ?? "",
    notes: tour?.notes ?? ""
  }));

  // ---------------------------------------
  // 2. RESET WHEN SWITCHING TO A NEW TOUR
  // ---------------------------------------
  useEffect(() => {
    if (tour) {
      setLocal({
        id: tour.id,                 // ⭐ REQUIRED
        tripId: tour.tripId,
        name: tour.name ?? "(untitled)",
        company: tour.company ?? "",
        category: tour.category ?? "",
        location: tour.location ?? "",
        startDate: tour.startDate ?? "",
        startTime: tour.startTime ?? "",
        endDate: tour.endDate ?? "",
        endTime: tour.endTime ?? "",
        notes: tour.notes ?? ""
      });
    }
  }, [tour?.id]);

  // ---------------------------------------
  // 3. UPDATE HELPER
  // ---------------------------------------
  function update(field, value) {
    setLocal(prev => ({ ...prev, [field]: value }));
  }

  // ---------------------------------------
  // 4. SAVE HANDLER (RESTORED)
  // ---------------------------------------
  function handleSave() {
    const { startDate, startTime, endDate, endTime } = local;

    // Optional: allow empty dates (unscheduled tours)
    const hasStart = startDate && startTime;
    const hasEnd = endDate && endTime;

    if (hasStart && !isValidDateTime(startDate, startTime)) {
      alert("Start date/time is invalid");
      return;
    }

    if (hasEnd && !isValidDateTime(endDate, endTime)) {
      alert("End date/time is invalid");
      return;
    }

    if (hasStart && hasEnd && !isChronological(startDate, startTime, endDate, endTime)) {
      alert("End must be after start");
      return;
    }
    console.log("Saving tour with data:", local);
    local.id ? updateTour(local.id, local) : createTour(local);

    onRefresh(local);
  }

  // ---------------------------------------
  // 5. RENDER
  // ---------------------------------------
  return (
    <div className="editor">
      <h2 className="editor-title">Edit Tour</h2>

      {/* NAME */}
      <div className="editor-row">
        <label className="editor-label">Name</label>
        <input
          className="editor-input"
          type="text"
          value={local.name}
          onChange={e => update("name", e.target.value)}
        />
      </div>

      {/* COMPANY */}
      <div className="editor-row">
        <label className="editor-label">Company</label>
        <input
          className="editor-input"
          type="text"
          value={local.company}
          onChange={e => update("company", e.target.value)}
        />
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="editor-row">
        <label className="editor-label">Category</label>
        <TourCategorySelector
          value={local.category}
          onChange={value => update("category", value)}
        />
      </div>

      {/* LOCATION */}
      <div className="editor-row">
        <label className="editor-label">Location</label>
        <input
          className="editor-input"
          type="text"
          value={local.location}
          onChange={e => update("location", e.target.value)}
        />
      </div>

      {/* START DATE/TIME */}
      <div className="editor-row">
        <label className="editor-label">Start</label>
        <div className="editor-inline">
          <input
            className="editor-input"
            type="date"
            value={local.startDate}
            onChange={e => update("startDate", e.target.value)}
          />
          <input
            className="editor-input"
            type="time"
            value={local.startTime}
            onChange={e => update("startTime", e.target.value)}
          />
        </div>
      </div>

      {/* END DATE/TIME */}
      <div className="editor-row">
        <label className="editor-label">End</label>
        <div className="editor-inline">
          <input
            className="editor-input"
            type="date"
            value={local.endDate}
            onChange={e => update("endDate", e.target.value)}
          />
          <input
            className="editor-input"
            type="time"
            value={local.endTime}
            onChange={e => update("endTime", e.target.value)}
          />
        </div>
      </div>

      {/* NOTES */}
      <div className="editor-row">
        <label className="editor-label">Notes</label>
        <textarea
          className="editor-textarea"
          value={local.notes}
          onChange={e => update("notes", e.target.value)}
        />
      </div>

      {/* SAVE / CANCEL */}
      <div className="editor-buttons">
        <button className="editor-save" onClick={handleSave}>Save</button>
        <button className="editor-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
