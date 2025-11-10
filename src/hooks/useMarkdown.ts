import { useState, useEffect, useCallback, useRef } from 'react';
import { parseHeadings } from '@/src/utils/markdownUtils';
import type { OutlineItem } from '@/src/types';

const LOCAL_STORAGE_KEY = 'monarch-markdown-content';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB safety limit

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
        localStorage.removeItem('monarch-find-history');
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
        return localStorage.getItem(LOCAL_STORAGE_KEY) || initialContent;
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
        // Check size before attempting save
        const size = new Blob([markdown]).size;
        if (size > MAX_STORAGE_SIZE) {
          const error = new Error('Document exceeds 4MB limit. Consider exporting your work.');
          setSaveError(error.message);
          if (errorCallbackRef.current) {
            errorCallbackRef.current(error);
          }
          return;
        }

        const success = safeSetItem(LOCAL_STORAGE_KEY, markdown, (error) => {
          setSaveError(error.message);
          if (errorCallbackRef.current) {
            errorCallbackRef.current(error);
          }
        });

        if (success) {
          setSaveError(null);
        }
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [markdown]);

  // Debounced outline generation
  useEffect(() => {
    const handler = setTimeout(() => {
      const items = parseHeadings(markdown);
      setOutlineItems(items);
    }, 500);
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
