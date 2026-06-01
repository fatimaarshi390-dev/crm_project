// hooks/useUndoRedo.ts
import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  // Set new state (and save previous in history)
  const setState = useCallback((newState: T) => {
    setPast((prev) => [...prev, present]);
    setPresent(newState);
    setFuture([]); // Clear future when new change happens
  }, [present]);

  // Undo
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    setFuture((prev) => [present, ...prev]);
    setPresent(previous);
    setPast((prev) => prev.slice(0, -1));
  }, [past, present]);

  // Redo
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    setPast((prev) => [...prev, present]);
    setPresent(next);
    setFuture((prev) => prev.slice(1));
  }, [future, present]);

  // Reset to new initial state
  const reset = useCallback((newState: T) => {
    setPast([]);
    setPresent(newState);
    setFuture([]);
  }, []);

  return {
    state: present,
    setState,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}