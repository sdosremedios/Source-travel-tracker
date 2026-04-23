import { useState, useEffect } from "react";
import "../styles/TourEditorScreen.css";          // ⭐ your CSS restored
import TourCategorySelector from "../components/TourCategorySelector";
import { isValidDateTime, isChronological } from "../utils/dateHelpers";
import { patchTour, postTour, fetchTemplates } from "../api/index";

export default function TourEditorScreen({
  activeItem,
  setActiveItem,
  onRefresh,
  onClose }) {
  // ---------------------------------------
  // 1. INITIALIZE LOCAL STATE (ONCE)
  // ---------------------------------------
  /*
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
*/

  // ---------------------------------------
  // 3. UPDATE HELPER
  // ---------------------------------------
function update(field, value) {
  setActiveItem(prev => ({ ...prev, [field]: value }));
}

  // ---------------------------------------
  // 4. SAVE HANDLER (RESTORED)
  // ---------------------------------------
  function handleSave() {
    const { startDate, startTime, endDate, endTime } = activeItem;

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
    console.log("Saving tour with data:", activeItem);
    activeItem.id ? patchTour(activeItem.id, activeItem) : postTour(activeItem);

    onRefresh({ ...activeItem, kind: "tour" });
  }
  const [templates, setTemplates] = useState([]);
  useEffect(() => {
    fetchTemplates("tour").then(setTemplates).catch(console.error);
  }, []);

  // ---------------------------------------
  // 5. RENDER
  // ---------------------------------------
  return (
    <div className="tour-editor-screen">
      <div className="header">
        <h2 className="editor-title">Edit Tour</h2>
        {/* SAVE / CANCEL */}
        <div className="buttons">
          <button className="save" onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
      {/* NAME */}
      <div className="editor-row">
        <label className="editor-label">Name</label>
        <input
          className="editor-input"
          type="text"
          value={activeItem.name}
          onChange={e => update("name", e.target.value)}
        />
      </div>

      {/* COMPANY */}
      <div className="editor-row">
        <label className="editor-label">Company</label>
        <input
          className="editor-input"
          type="text"
          value={activeItem.company}
          onChange={e => update("company", e.target.value)}
        />
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="editor-row">
        <label className="editor-label">Category</label>
        <TourCategorySelector
          value={activeItem.category}
          onChange={value => update("category", value)}
        />
      </div>

      {/* LOCATION */}
      <div className="editor-row">
        <label className="editor-label">Location</label>
        <input
          className="editor-input"
          type="text"
          value={activeItem.location}
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
            value={activeItem.startDate}
            onChange={e => update("startDate", e.target.value)}
          />
          <input
            className="editor-input"
            type="time"
            value={activeItem.startTime}
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
            value={activeItem.endDate}
            onChange={e => update("endDate", e.target.value)}
          />
          <input
            className="editor-input"
            type="time"
            value={activeItem.endTime}
            onChange={e => update("endTime", e.target.value)}
          />
        </div>
      </div>

      {/* NOTES */}
      <div className="editor-row">
        <label className="editor-label">Notes</label>
        < div className="template-buttons" >
          {
            templates.map(t => (
              <button
                key={t.id}
                className="template-button"
                onClick={() => {
                  setActiveItem(prev => ({
                    ...prev,
                    notes: (prev.notes || "") + "\n\n" + t.template
                  }));
                }}
              >
                {t.icon} {t.name}
              </button>
            ))
          }
        </div >
        <textarea
          className="markdown-edit"
          value={activeItem.notes}
          onChange={e => update("notes", e.target.value)}
        />
      </div>

    </div>
  );
}
