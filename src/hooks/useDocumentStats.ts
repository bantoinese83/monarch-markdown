import { useMemo } from 'react';
import type { DocumentStats } from '@/src/types';

const WORDS_PER_MINUTE = 200;

export const useDocumentStats = (markdown: string): DocumentStats => {
  return useMemo(() => {
    const text = markdown.trim();
    const wordCount = text ? text.split(/\s+/).filter((word) => word.length > 0).length : 0;
    const charCount = text.length;
    const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);
    const isContentPresent = text.length > 0;

    return {
      wordCount,
      charCount,
      readingTime,
      isContentPresent,
    };
  }, [markdown]);
};
