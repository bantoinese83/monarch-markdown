import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MAX_UNDO_REDO_HISTORY } from '@/src/constants';

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
      // Slice to current position and add new value
      const newHistory = prev.slice(0, historyIndex + 1);
      const lastValue = newHistory[newHistory.length - 1];

      if (lastValue !== currentValue) {
        const updatedHistory = [...newHistory, currentValue];
        // Limit history size to prevent memory leaks
        if (updatedHistory.length > MAX_UNDO_REDO_HISTORY) {
          return updatedHistory.slice(-MAX_UNDO_REDO_HISTORY);
        }
        return updatedHistory;
      }
      return prev;
    });

    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      // Adjust index if history was truncated
      return Math.min(newIndex, MAX_UNDO_REDO_HISTORY - 1);
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

  const canUndo = useMemo(() => historyIndex > 0, [historyIndex]);
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex, history.length]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
