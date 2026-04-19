export function createItem(kind, tripId) {
    const base = { id: null, kind, tripId };

    switch (kind) {
        case "segment":
            return createSegment(tripId);
        case "tour":
            return createTour(tripId);
        case "note":
            return createNote(tripId);
    }
    console.log("createItem: ", base)
    return base;
}
export function createSegment(tripId) {
    return {
        id: null,
        kind: "segment",
        tripId,
        date: "",
        mode: "",
        from: "",
        to: "",
        notes: ""
    };
}
export function createTour(tripId) {
    return {
        id: null,
        kind: "tour",
        tripId,
        name: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        category: "",
        notes: ""
    };
}
export function createNote(tripId) {
    return {
        id: null,
        kind: "note",
        tripId,
        dateTime: new Date().toISOString(), // or ""
        note: ""
    };
}
