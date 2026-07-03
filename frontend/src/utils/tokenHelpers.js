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

export function resolveDynamicAliases(text, trip) {
  if (!text) return text;

  const dynamicAliasRegex = /%([A-Za-z0-9_]+)(?:\[(\d+)\]|\((.*?)\))?%/g;

  return text.replace(dynamicAliasRegex, (match, name, index, params) => {
    if (trip.dictionary && trip.dictionary[name]) {
      return trip.dictionary[name];
    }
    return match; // fallback
  });
}

export function parseTripDictionary(text) {
  const dict = {};
  text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.includes(":"))
    .forEach(line => {
      const [key, value] = line.split(":").map(s => s.trim());
      if (key) dict[key] = value || "";
    });
  return dict;
}

