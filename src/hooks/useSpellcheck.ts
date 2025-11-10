import { useState, useEffect } from 'react';
import type { MisspelledWord } from '@/src/types';

export const useSpellcheck = (markdown: string) => {
  const [typo, setTypo] = useState<{
    check: (word: string) => boolean;
    suggest: (word: string, limit?: number) => string[];
  } | null>(null);
  const [misspelledWords, setMisspelledWords] = useState<MisspelledWord[]>([]);

  // Load typo.js dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const affResponse = await fetch(
          'https://cdn.jsdelivr.net/npm/typo-js@1.2.1/dictionaries/en_US/en_US.aff'
        );
        const dicResponse = await fetch(
          'https://cdn.jsdelivr.net/npm/typo-js@1.2.1/dictionaries/en_US/en_US.dic'
        );
        const affData = await affResponse.text();
        const dicData = await dicResponse.text();
        setTypo(new window.Typo('en_US', affData, dicData));
      } catch {
        // Failed to load spellchecking dictionary
      }
    };
    loadDictionary();
  }, []);

  // Debounced spellcheck
  useEffect(() => {
    if (!typo) return;

    const handler = setTimeout(() => {
      const words = markdown.match(/\b[a-zA-Z']+\b/g) || [];
      const uniqueWords = [...new Set(words)];
      const misspelled = uniqueWords.filter((word) => !typo.check(word));

      const newMisspelledWords: MisspelledWord[] = [];
      if (misspelled.length > 0) {
        const misspelledSet = new Set(misspelled);
        const regex = /\b[a-zA-Z']+\b/g;
        let match;
        while ((match = regex.exec(markdown)) !== null) {
          if (misspelledSet.has(match[0])) {
            newMisspelledWords.push({
              index: match.index,
              length: match[0].length,
              word: match[0],
            });
          }
        }
      }
      setMisspelledWords(newMisspelledWords);
    }, 500);

    return () => clearTimeout(handler);
  }, [markdown, typo]);

  return { typo, misspelledWords };
};
