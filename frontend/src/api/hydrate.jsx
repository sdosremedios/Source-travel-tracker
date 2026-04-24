function hydrateItem(item) {
  if (!item) return null;

  switch (item.kind) {
    case "trip":
      return hydrateTrip(item);

    case "segment":
      return hydrateSegment(item);

    case "tour":
      return hydrateTour(item);

    case "note":
      return hydrateNote(item);

    default:
      console.warn("Unknown item kind:", item);
      return item;
  }
}
function hydrateTrip(t) {
  return {
    id: t.id ?? null,
    kind: "trip",
    name: t.name ?? "(untitled)",
    startDate: t.startDate ?? "",
    endDate: t.endDate ?? "",
    tripNotes: t.tripNotes ?? "",
    type: t.type ?? ""
  };
}
function hydrateSegment(s) {
  return {
    id: s.id ?? null,
    kind: "segment",
    tripId: s.tripId ?? null,

    startDate: s.startDate ?? s.date ?? "",
    endDate: s.endDate ?? "",
    mode: s.mode ?? "",
    fromLocation: s.fromLocation ?? s.from ?? "",
    toLocation: s.toLocation ?? s.to ?? "",
    departureTime: s.departureTime ?? "",
    arrivalTime: s.arrivalTime ?? "",
    notes: s.notes ?? "",
    carrier: s.carrier ?? ""
  };
}
function hydrateTour(t) {
  return {
    id: t.id ?? null,
    kind: "tour",
    tripId: t.tripId ?? null,

    name: t.name ?? "",
    startDate: t.startDate ?? "",
    startTime: t.startTime ?? "",
    endDate: t.endDate ?? "",
    endTime: t.endTime ?? "",
    location: t.location ?? "",
    category: t.category ?? "",
    notes: t.notes ?? "",
    company: t.company ?? ""
  };
}
function hydrateNote(n) {
  return {
    id: n.id ?? null,
    kind: "note",
    tripId: n.tripId ?? null,

    dateTime: n.dateTime ?? new Date().toISOString(),
    note: n.note ?? ""
  };
}
export default hydrateItem;