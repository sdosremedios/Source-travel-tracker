//
// Trip icons based on trip.type
//
export function tripIcon(trip) {
  const raw = trip.type || trip.tripType || "";
  const type = raw.trim().toLowerCase();

  switch (type) {
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
