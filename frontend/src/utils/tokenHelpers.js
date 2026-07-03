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
    "[[startDate]]": trip?.startDate || "",
    "[[endDate]]": trip?.endDate || "",
    "[[segmentFrom]]": segment?.fromLocation || "",
    "[[segmentTo]]": segment?.toLocation || "",
    "[[tourName]]": tour?.name || "",
    "[[tourCompany]]": tour?.company || "",
    "[[tourLocation]]": tour?.location || ""
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

  return text.replace(dynamicAliasRegex, (match, rawName, index, params) => {
    const name = rawName.toLowerCase();

    // 1. Dictionary lookup
    if (trip.dictionary) {
      const dictValue = trip.dictionary[name];
      if (dictValue !== undefined) {
        return dictValue;
      }
      // 2. Indexed dynamic functions (future)
      if (index !== undefined && trip.dynamicFunctions?.[name]) {
        return trip.dynamicFunctions[name](trip, Number(index));
      }

      // 3. Parameterized dynamic functions (future)
      if (params !== undefined && trip.dynamicFunctions?.[name]) {
        return trip.dynamicFunctions[name](trip, params);
      }

      // 4. Simple dynamic functions (future)
      if (trip.dynamicFunctions?.[name]) {
        return trip.dynamicFunctions[name](trip);
      }

      // 5. Unknown token → leave unchanged    
    } return match; // fallback
  });
}

export function parseTripDictionary(summaryText) {
  const dict = {};
  if (!summaryText) return dict;

  const lines = summaryText.split("\n");

  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim().toLowerCase();
    const rawValue = line.slice(idx + 1).trim();

    const value = unescapeDictionaryValue(rawValue);

    dict[key] = value;
  }

  return dict;
}

export function unescapeDictionaryValue(value) {
  return value
    .replace(/\\n/g, "\n")     // newline
    .replace(/\\t/g, "\t")     // tab (optional)
    .replace(/\\r/g, "\r");    // carriage return (optional)
}
