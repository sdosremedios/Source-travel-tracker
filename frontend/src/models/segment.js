// src/models/segment.js

export const SegmentModel = {
  id: Number,
  tripId: Number,
  mode: String,            // "plane" | "train" | "car" | ...
  startDate: String,       // YYYY-MM-DD
  endDate: String,         // YYYY-MM-DD
  fromLocation: String,
  toLocation: String,
  departureTime: String,   // HH:MM
  arrivalTime: String,     // HH:MM
  notes: String,
  carrierId: Number        // optional
};