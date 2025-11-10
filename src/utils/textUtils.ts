/**
 * Finds the word at a specific index in a string.
 * @param text The string to search within.
 * @param index The index to find the word at.
 * @returns An object containing the word and its start/end indices, or null if not found.
 */
export const getWordAt = (
  text: string,
  index: number
): { word: string; index: number; length: number } | null => {
  if (!text || index < 0 || index > text.length) {
    return null;
  }

  // Use a regex that includes word characters and apostrophes
  const wordRegex = /[a-zA-Z']+/g;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;

    // Check if the cursor position is within the bounds of the current match
    if (index >= matchStart && index <= matchEnd) {
      return {
        word: match[0],
        index: matchStart,
        length: match[0].length,
      };
    }
  }

  return null;
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error instanceof Error) {
        // Don't retry on validation errors or abort errors
        if (error.name === 'ValidationError' || error.name === 'AbortError') {
          throw error;
        }
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
