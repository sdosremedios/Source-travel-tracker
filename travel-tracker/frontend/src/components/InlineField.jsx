// src/components/InlineField.jsx
import { useState, useRef, useEffect } from "react";
import "./InlineField.css";

export default function InlineField({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (local !== value) onChange(local);
  }

  return editing ? (
    <input
      ref={ref}
      className="inline-field-input"
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setLocal(value);
          setEditing(false);
        }
      }}
    />
  ) : (
    <span className="inline-field" onClick={() => setEditing(true)}>
      {value || "—"}
    </span>
  );
}