import express from "express";
import cors from "cors";

import trips from "./routes/trips.js";
import segments from "./routes/segments.js";
import tours from "./routes/tours.js";
import notes from "./routes/notes.js";
import templates from "./routes/templates.js";

const app = express();

console.log(">>> RUNNING THIS SERVER FILE <<<");

app.use(cors());
app.use(express.json());

// Mount routes
// Mount routes (REST‑pure, trip‑scoped)
app.use("/api/trips", trips);
app.use("/api/trips/:tripId/segments", segments);
app.use("/api/trips/:tripId/tours", tours);
app.use("/api/trips/:tripId/notes", notes);
app.use("/api/templates", templates);


app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
