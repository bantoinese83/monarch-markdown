import { useState, useRef, useEffect, useCallback } from 'react';

interface UseUndoRedoReturn {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useUndoRedo = (
  currentValue: string,
  setValue: (value: string) => void
): UseUndoRedoReturn => {
  const [history, setHistory] = useState<string[]>([currentValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUpdatingRef = useRef(false);
  const previousValueRef = useRef<string>(currentValue);

  // Update history when value changes (but not from undo/redo)
  useEffect(() => {
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      previousValueRef.current = currentValue;
      return;
    }

    // Only update if value actually changed
    if (previousValueRef.current === currentValue) {
      return;
    }

    previousValueRef.current = currentValue;

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      const lastValue = newHistory[newHistory.length - 1];
      if (lastValue !== currentValue) {
        return [...newHistory, currentValue];
      }
      return prev;
    });

    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex;
    });
  }, [currentValue, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUpdatingRef.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
    }
  }, [history, historyIndex, setValue]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUpdatingRef.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setValue(history[newIndex]);
    }
  }, [history, historyIndex, setValue]);

  return {
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
