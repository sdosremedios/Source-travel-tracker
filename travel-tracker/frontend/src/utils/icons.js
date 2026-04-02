//
// Trip icons based on trip.type
//
export function tripIcon(trip) {
  if (!trip || !trip.type) return "🧳";

  switch (trip.type.toLowerCase()) {
    case "travel":
      return "✈️";
    case "work":
      return "💼";
    case "personal":
      return "❤️";
    case "tour":
      return "🧭";
    case "experience":
      return "🎨";
    case "nature":
      return "🌿";
    default:
      return "🧳";
  }
}

//
// Segment mode icons
//
export function modeIcon(mode) {
  switch (mode?.toLowerCase()) {
    case "flight":
    case "plane":
      return "✈️";
    case "train":
      return "🚆";
    case "car":
      return "🚗";
    case "walk":
    case "walking":
      return "🚶";
    default:
      return "•";
  }
}

//
// Tour category icons
//
export function tourIcon(category) {
  switch (category?.toLowerCase()) {
    case "walking":
      return "🚶";
    case "museum":
      return "🏛️";
    case "food":
      return "🍽️";
    case "nature":
      return "🌿";
    default:
      return "📍";
  }
}