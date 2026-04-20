import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const { type } = req.query; // e.g. ?type=segment

  try {
    let rows;

    if (type) {
      const stmt = db.prepare(`
        SELECT *
        FROM templates
        WHERE types LIKE ?
        ORDER BY name
      `);
      rows = stmt.all(`%${type}%`);
    } else {
      const stmt = db.prepare(`
        SELECT *
        FROM templates
        ORDER BY name
      `);
      rows = stmt.all();
    }

    res.json(rows);
  } catch (err) {
    console.error("Template fetch error:", err);
    res.status(500).json({ error: "Failed to load templates" });
  }
});

export default router;
