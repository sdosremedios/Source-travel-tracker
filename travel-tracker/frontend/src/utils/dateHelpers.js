/*
Common import for date-related functions. 

This file is imported by both TripDetailScreen and TourForm, 
so it should not import from those files to avoid circular dependencies.
If we need shared date utilities, they should go here. For example:   

import { isValidDateTime, isChronological } from "../utils/dateHelpers"; 

*/

export function normalizeDate(input) {
  if (!input) return "";

  // Already normalized
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  // Convert MM/DD/YYYY → YYYY-MM-DD
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return input; // fallback (will fail validation)
}

export function isValidDateString(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

export function isValidTimeString(str) {
  return /^\d{2}:\d{2}$/.test(str);
}

export function isValidDateTime(date, time) {
  if (!isValidDateString(date) || !isValidTimeString(time)) return false;
  const dt = new Date(`${date}T${time}`);
  return !isNaN(dt.getTime());
}

export function isChronological(startDate, startTime, endDate, endTime) {
  const start = isValidDateTime(startDate, startTime);
  const end = isValidDateTime(endDate, endTime);
//console.log("isChronological CALLED with:", { startDate, startTime, endDate, endTime, start, end });
  return start && end && start <= end;
}
/*
export function isChronological(startDate, startTime, endDate, endTime) {
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  return start <= end;
}
*/
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

export function formatDateRange(startDate, startTime, endDate, endTime) {
    return `${formatDateTime(startDate, startTime)} → ${formatDateTime(endDate, endTime)}`;
}

