import React, { useState } from "react";
import { TOUR_CATEGORIES, tourIcon } from "../models/categories";
import "../styles/TourEditorScreen.css";

// Convert TOUR_CATEGORIES into a clean text-value picklist
const CATEGORY_OPTIONS = Object.entries(TOUR_CATEGORIES).map(([value, label]) => ({
  value,   // e.g. "food"
  label    // e.g. "Food Tour"
}));

export default function TourEditorScreen({ tripId, tour, onClose, onSaved }) {
  // IMPORTANT: hydrate from correct field names
  const [name, setName] = useState(tour?.name || "");

  // DB + backend use startDate, not date
  const [date, setDate] = useState(tour?.startDate || "");

  // DB + backend use startTime
  const [time, setTime] = useState(tour?.startTime || "");

  // End date defaults to start date if missing
  const [endDate, setEndDate] = useState(tour?.endDate || tour?.startDate || "");

  // DB + backend use endTime
  const [endTime, setEndTime] = useState(tour?.endTime || "");

  const [location, setLocation] = useState(tour?.location || "");

  // Category must be TEXT — ensure string
  const [category, setCategory] = useState(
    tour?.category ? String(tour.category) : "general"
  );

  const [notes, setNotes] = useState(tour?.notes || "");

  async function handleSave() {
    const payload = {
      tripId,
      name,
      startDate: date,
      startTime: time,
      endDate,
      endTime,
      location,
      category,   // now always a string
      notes
    };

    const method = tour ? "PATCH" : "POST";
    const url = tour ? `/api/tours/${tour.id}` : `/api/tours`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const saved = await res.json();
    onSaved?.(saved.id);
  }

  return (
    <div className="tes-container">
      <div className="tes-header">
        <div className="tes-icon">{tourIcon(category)}</div>
        <h1 className="tes-title">{tour ? "Edit Tour" : "New Tour"}</h1>
      </div>

      <div className="tes-form">

        {/* Name */}
        <label className="tes-field">
          <span>Name</span>
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>

        {/* Start Date + Time */}
        <div className="tes-row">
          <label className="tes-field">
            <span>Start Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>

          <label className="tes-field">
            <span>Start Time</span>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </label>
        </div>

        {/* End Date + End Time */}
        <div className="tes-row">
          <label className="tes-field">
            <span>End Date</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </label>

          <label className="tes-field">
            <span>End Time</span>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </label>
        </div>

        {/* Location */}
        <label className="tes-field">
          <span>Location</span>
          <input value={location} onChange={e => setLocation(e.target.value)} />
        </label>

        {/* Category */}
        <label className="tes-field">
          <span>Category</span>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* Notes */}
        <label className="tes-field">
          <span>Notes</span>
          <textarea
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </label>
      </div>

      <div className="tes-buttons">
        <button className="tes-btn save" onClick={handleSave}>Save</button>
        <button className="tes-btn cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
