import { useState, useEffect, useCallback, useRef } from 'react';
import {
  STORAGE_KEYS,
  MAX_STORAGE_SIZE,
  SAVE_DEBOUNCE_MS,
  OUTLINE_DEBOUNCE_MS,
} from '@/src/constants';
import { parseHeadings } from '@/src/utils/markdownUtils';
import type { OutlineItem } from '@/src/types';

// Try to save to localStorage with quota error handling
const safeSetItem = (key: string, value: string, onError?: (error: Error) => void): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    const isQuotaError =
      error instanceof Error &&
      (error.name === 'QuotaExceededError' ||
        (error instanceof DOMException && (error.code === 22 || error.code === 1014)));
    if (isQuotaError) {
      // Quota exceeded - try to free space
      try {
        // Remove old find history if exists
        localStorage.removeItem(STORAGE_KEYS.FIND_HISTORY);
        // Try again
        localStorage.setItem(key, value);
        return true;
      } catch {
        // Still failed - notify user
        if (onError) {
          onError(new Error('Document too large to save locally. Consider exporting your work.'));
        }
        return false;
      }
    }
    if (onError) {
      onError(error instanceof Error ? error : new Error('Failed to save document'));
    }
    return false;
  }
};

export const useMarkdown = (initialContent: string) => {
  const errorCallbackRef = useRef<((error: Error) => void) | null>(null);

  const [markdown, setMarkdown] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.MARKDOWN_CONTENT) || initialContent;
      } catch {
        return initialContent;
      }
    }
    return initialContent;
  });

  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Set error callback for toast notifications
  const setErrorCallback = useCallback((callback: (error: Error) => void) => {
    errorCallbackRef.current = callback;
  }, []);

  // Debounced save to local storage with quota handling
  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Check size before attempting save (use byte length for efficiency)
        const size = new TextEncoder().encode(markdown).length;
        if (size > MAX_STORAGE_SIZE) {
          const error = new Error('Document exceeds 4MB limit. Consider exporting your work.');
          setSaveError(error.message);
          if (errorCallbackRef.current) {
            errorCallbackRef.current(error);
          }
          return;
        }

        const success = safeSetItem(STORAGE_KEYS.MARKDOWN_CONTENT, markdown, (error) => {
          setSaveError(error.message);
          if (errorCallbackRef.current) {
            errorCallbackRef.current(error);
          }
        });

        if (success) {
          setSaveError(null);
        }
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [markdown]);

  // Debounced outline generation
  useEffect(() => {
    const handler = setTimeout(() => {
      const items = parseHeadings(markdown);
      setOutlineItems(items);
    }, OUTLINE_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [markdown]);

  const updateMarkdown = useCallback((newContent: string) => {
    setMarkdown(newContent);
  }, []);

  return {
    markdown,
    setMarkdown: updateMarkdown,
    outlineItems,
    saveError,
    setErrorCallback,
  };
};
