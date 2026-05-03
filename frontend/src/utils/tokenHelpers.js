import { formatLocalDateTime } from "./dateHelpers";

export function applyNoteTokens(text, context = {}) {
  if (!text) return text;

  const { dateObj, segment, tour, note, trip } = context;

  const formatted = dateObj ? formatLocalDateTime(dateObj) : "";
  const [datePart, ...timeParts] = formatted.split(" ");
  const timePart = timeParts.join(" ");

  const replacements = {
    "[[date]]": datePart || "",
    "[[time]]": timePart || "",
    "[[datetime]]": formatted || "",

    // Optional contextual tokens
    "[[tripName]]": trip?.name || "",
    "[[segmentFrom]]": segment?.fromLocation || "",
    "[[segmentTo]]": segment?.toLocation || "",
    "[[tourName]]": tour?.name || ""
  };

  let output = text;

  for (const token in replacements) {
    output = output.split(token).join(replacements[token]);
  }

  return output;
}
