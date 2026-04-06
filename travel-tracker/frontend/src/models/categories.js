// src/models/categories.js

export const TOUR_CATEGORIES = {
  walking: "Walking Tour",
  museum: "Museum Visit",
  food: "Food Tour",
  nature: "Nature Tour",
  boat: "Boat Tour",
  adventure: "Adventure Tour",
  transport: "Travel Tour",
  photo: "Photo Tour",
  expedition: "Expedition",
};

export function tourIcon(category) {
  switch (category) {
    case "walking": return "🚶‍♂️";
    case "museum": return "🏛️";
    case "food": return "🍽️";
    case "nature": return "🌲";
    case "boat": return "⛵";
    case "adventure": return "🚴‍♂️";
    case "transport": return "🚌";
    case "photo": return "📷";
    case "expedition": return "🧭";
    default: return "📍";
  }
}

export const CATEGORY_COLORS = {
  walking: "#4CAF50",
  museum: "#3F51B5",
  food: "#FF7043",
  nature: "#2E7D32",
  boat: "#0288D1",
  adventure: "#FBC02D",
  transport: "#8E24AA",
  photo: "#6D4C41",
  expedition: "#455A64",
  general: "#9E9E9E"
};
