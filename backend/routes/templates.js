import express from "express";
import db from "../db.js";

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT *
    FROM templates
    ORDER BY name
  `).all();

  res.json(rows);
});
/*
router.get("/type=:kind", (req, res) => {
  const { type } = req.params.kind; // e.g. ?type=segment

  try {
    let rows;

    if (kind) {
      const stmt = db.prepare(`
        SELECT *
        FROM templates
        WHERE types LIKE ?
        ORDER BY name
      `);
      rows = stmt.all(`%${kind}%`);
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
*/
export default router;
