import React, { useEffect } from "react";
import "../styles/ContextMenu.css";

export default function ContextMenu({
  x,
  y,
  actions,
  onAction,
  onClose
}) {
  // Close on click outside or Escape
  useEffect(() => {
    function handle(e) {
      if (e.key === "Escape") onClose();
      if (e.button === 0) onClose();
    }
    window.addEventListener("mousedown", handle);
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("mousedown", handle);
      window.removeEventListener("keydown", handle);
    };
  }, [onClose]);

  const safe = Array.isArray(actions) ? actions : [];

  return (
    <div className="cmenu" style={{ top: y, left: x }}>
      {safe.map((a, i) => (
        <div
          key={i}
          className="cmenu-item"
          onClick={() => onAction(a)}
        >
          <span className="cmenu-icon">{a.icon}</span>
          <span className="cmenu-label">{a.label}</span>
        </div>
      ))}
    </div>
  );
}
