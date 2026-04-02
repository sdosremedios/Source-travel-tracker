export function formatMonthYear(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function weekday(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { weekday: "short" });
}