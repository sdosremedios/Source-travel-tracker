// src/models/categories.js

export const TOUR_CATEGORIES = {
  walking: "Walking / City",
  museum: "Cultural / Historical",
  food: "Food & Drink",
  nature: "Nature & Scenic",
  boat: "Water & Boat",
  adventure: "Adventure & Activity",
  transport: "Commercial / Transport-Based",
  photo: "Photography",
  expedition: "Country / Regional Expedition"
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