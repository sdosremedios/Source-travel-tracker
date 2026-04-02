// src/models/tour.js

export const TourModel = {
  id: Number,
  tripId: Number,
  name: String,
  date: String,        // YYYY-MM-DD
  time: String,        // HH:MM
  location: String,
  notes: String,
  category: String     // see categories.js
};