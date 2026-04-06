export function formatDateRange(startDate, startTime, endDate, endTime) {

    return `${formatDateTime(startDate, startTime)} → ${formatDateTime(endDate, endTime)}`;
}

export function formatDateTime(startDate, startTime) {
    const datePart = formatDate(startDate, false);
    const timePart = formatTime(startTime);
    return `${datePart} ${timePart}`;
}

// --- Weekday (short) ---
export function weekday(dateStr) {
  if (!dateStr) return "";
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date(dateStr);
  return names[d.getDay()];
}

// --- Format date: mm/dd/yyyy with weekday ---
export function formatDate(dateStr, includeWeekday = true) {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();

  if (includeWeekday) {
    return `${weekday(dateStr)} ${mm}/${dd}/${yyyy}`;
  }

  return `${mm}/${dd}/${yyyy}`;
}

// --- Format time: HH:mm (24h) → h:mm AM/PM ---
export function formatTime(timeStr) {
  if (!timeStr) return "";

  let [hour, minute] = timeStr.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}
