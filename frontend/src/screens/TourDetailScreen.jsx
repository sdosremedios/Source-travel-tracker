import React from "react";
import { TOUR_CATEGORIES, tourIcon } from "../models/categories";
import { formatDate, formatTime } from "../utils/dateHelpers";
import Markdown from "../components/Markdown";
import { deleteTour } from "../api/index";
import { refreshTrips } from "../utils/refreshHelpers";

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
    await deleteTour(tour.tripId, tour.id);

    onRefresh(tour);
    /*
    await refreshTrips({
      savedTrip: { id: tour.tripId },
      loadSegmentsForTrip,
      loadToursForTrip,
      loadNotesForTrip,
      setTrips,
      setSelectedTripId,
      setSegments,
      setTours,
      setNotes,
      setActiveScreen
    });
    */
    onClose();
  }

  console.log("Rendering TourDetailScreen with tour:", tour);
  return (
    <div className="tour-detail-screen">
      <div className="header">
        <div className="icon">{tourIcon(tour.category)}</div>
        <h1 className="title">{tour.name}</h1>
        <div className="buttons">
          <button className="edit" onClick={() => onEdit(tour)}>
            Edit
          </button>
          <button className="danger" onClick={handleDelete}>
            Delete
          </button>
          <button className="close" onClick={onClose}>
            Close
          </button>
        </div>

      </div>

      <div className="data">
        <div><strong>Company:</strong> {tour.company}</div>
        <div><strong>Date:</strong> {formatDate(tour.startDate) + (tour.startTime ? " " + formatTime(tour.startTime) : "")}</div>
        <div><strong>Location:</strong> {tour.location}</div>
        <div>
          <strong>Category:</strong>
          <span className="tds-category-badge">
            {tourIcon(tour.category)} {TOUR_CATEGORIES[tour.category]}
          </span>
        </div>
      </div>

      {tour.notes && (
        <div className="tds-notes">
          <h3>Notes</h3>
          <div className="markdown-text">
            <Markdown>{tour.notes}</Markdown>
          </div>
        </div>
      )}

    </div>
  );
}
