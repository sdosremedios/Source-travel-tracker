import React from "react";
import { TOUR_CATEGORIES, tourIcon } from "../models/categories";
import { formatDate, formatTime } from "../utils/dateHelpers";
import { deleteTour } from "../api/index";

import "../styles/TourDetailScreen.css";


export default function TourDetailScreen({
  tour,
  onEdit,
  onClose,
  onRefresh
}) {
  if (!tour) return null;

  async function handleDelete() {
    if (!confirm("Delete this tour?")) return;
    await deleteTour(tour.id);

    onClose();
    onRefresh(tour.tripId);
  }

  console.log("Rendering TourDetailScreen with tour:", tour);
  return (
    <div className="tds-container">
      <div className="tds-header">
        <div className="tds-icon">{tourIcon(tour.category)}</div>
        <h1 className="tds-title">{tour.name}</h1>
      </div>

      <div className="tds-meta">
        <div><strong>Company:</strong> {tour.company}</div>
        <div><strong>Date:</strong> {formatDate(tour.startDate) + (tour.startTime ? " " + formatTime(tour.startTime) : "")}</div>
        <div><strong>Location:</strong> {tour.location}</div>
        <div>
          <strong>Category:</strong>
          <span className="tds-category-badge">
            {TOUR_CATEGORIES[tour.category]}
          </span>
        </div>
      </div>

      {tour.notes && (
        <div className="tds-notes">
          <h3>Notes</h3>
          <p>{tour.notes}</p>
        </div>
      )}

      <div className="tds-buttons">
        <button className="tds-btn edit" onClick={() => onEdit(tour)}>
          Edit
        </button>
        <button className="tds-btn danger" onClick={handleDelete}>
          Delete
        </button>
        <button className="tds-btn close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
