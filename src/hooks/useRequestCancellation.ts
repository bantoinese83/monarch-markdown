import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to manage request cancellation with AbortController
 * Provides a reusable pattern for cancelling async operations
 */
export const useRequestCancellation = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Creates a new AbortController and cancels any previous request
   * @returns The new AbortController
   */
  const createController = useCallback(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  }, []);

  /**
   * Checks if the current request was aborted
   * @param controller The AbortController to check
   * @returns true if the request was aborted
   */
  const isAborted = useCallback((controller: AbortController) => {
    return controller.signal.aborted;
  }, []);

  /**
   * Cleans up the controller reference
   * @param controller The AbortController to clean up
   */
  const cleanup = useCallback((controller: AbortController) => {
    if (abortControllerRef.current === controller) {
      abortControllerRef.current = null;
    }
  }, []);

  return {
    createController,
    isAborted,
    cleanup,
  };
};
