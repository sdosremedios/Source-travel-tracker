import React from "react";
import { TOUR_CATEGORIES, tourIcon } from "../models/categories";
import "../styles/TourCategorySelector.css";

export default function TourCategorySelector({ value, onChange }) {
  return (
    <div className="category-grid">
      {Object.entries(TOUR_CATEGORIES).map(([key, label]) => (
        <div
          key={key}
          className={`category-item ${value === key ? "selected" : ""}`}
          onClick={() => onChange(key)}
        >
          <div className="category-icon">{tourIcon(key)}</div>
          <div className="category-label">{label}</div>
        </div>
      ))}
    </div>
  );
}