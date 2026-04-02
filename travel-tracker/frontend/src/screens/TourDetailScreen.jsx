import React from "react";
import { TOUR_CATEGORIES, tourIcon } from "../models/categories";
import "../styles/TourDetailScreen.css";

export default function TourDetailScreen({ tour, onEdit, onClose }) {
  if (!tour) return null;

  return (
    <div className="tds-container">
      <div className="tds-header">
        <div className="tds-icon">{tourIcon(tour.category)}</div>
        <h1 className="tds-title">{tour.name}</h1>
      </div>

      <div className="tds-meta">
        <div><strong>Date:</strong> {tour.date}</div>
        <div><strong>Time:</strong> {tour.time}</div>
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
        <button className="tds-btn close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}