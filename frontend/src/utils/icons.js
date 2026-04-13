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
    case "adventure": return "🗺️";
    case "transport": return "🚌";
    case "photo": return "📷";
    case "expedition": return "🧭";
    default: return "📍";
  }
}

// utils/icons.js

// Core action icons
export const editIcon = "✏️";
export const addIcon = "➕";
export const deleteIcon = "🗑️";
export const closeIcon = "✖️";
export const openIcon = "👁️";
export const saveIcon = "💾";
export const duplicateIcon = "📄";
export const moveIcon = "↕️";
export const moreIcon = "⋯";
export const settingsIcon = "⚙️";
export const refreshIcon = "🔄";
export const importIcon = "📥";
export const exportIcon = "📤";
export const searchIcon = "🔍";
export const filterIcon = "🔎";
export const calendarIcon = "📅";

// Optional helper for consistency
export function actionIcon(name) {
  const map = {
    edit: editIcon,
    add: addIcon,
    delete: deleteIcon,
    close: closeIcon,
    open: openIcon,
    save: saveIcon,
    duplicate: duplicateIcon,
    move: moveIcon,
    more: moreIcon,
    settings: settingsIcon,
    refresh: refreshIcon,
    import: importIcon,
    export: exportIcon,
    search: searchIcon,
    filter: filterIcon,
    calendar: calendarIcon
  };
  return map[name] || "❓";
}
