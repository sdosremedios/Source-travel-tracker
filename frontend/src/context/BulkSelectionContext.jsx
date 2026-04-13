// src/context/BulkSelectionContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const BulkSelectionContext = createContext(null);

export function BulkSelectionProvider({ children }) {
  const [mode, setMode] = useState(null); // "trips" | "segments" | null
  const [selectedIds, setSelectedIds] = useState(new Set());

  const enterMode = useCallback(type => {
    setMode(type);
    setSelectedIds(new Set());
  }, []);

  const exitMode = useCallback(() => {
    setMode(null);
    setSelectedIds(new Set());
  }, []);

  const toggleId = useCallback(id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectMany = useCallback(ids => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  return (
    <BulkSelectionContext.Provider
      value={{
        mode,
        selectedIds,
        enterMode,
        exitMode,
        toggleId,
        selectMany,
        clear
      }}
    >
      {children}
    </BulkSelectionContext.Provider>
  );
}

export function useBulkSelection() {
  const ctx = useContext(BulkSelectionContext);
  if (!ctx) throw new Error("useBulkSelection must be used inside provider");
  return ctx;
}