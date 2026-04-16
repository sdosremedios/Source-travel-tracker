import express from "express";
import cors from "cors";

import trips from "./routes/trips.js";
import segments from "./routes/segments.js";
import tours from "./routes/tours.js";
import notes from "./routes/notes.js";

const app = express();

console.log(">>> RUNNING THIS SERVER FILE <<<");

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/trips", trips);
app.use("/api/segments", segments);
app.use("/api/tours", tours);
app.use("/api", notes);

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
