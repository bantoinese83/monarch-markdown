import { useState, useEffect } from 'react';
import {
  SPELLCHECK_DEBOUNCE_MS,
  TYPO_JS_BASE_URL,
  TYPO_JS_VERSION,
  TYPO_JS_DICTIONARY_PATH,
  TYPO_JS_DICTIONARY,
} from '@/src/constants';
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
        const baseUrl = `${TYPO_JS_BASE_URL}${TYPO_JS_VERSION}${TYPO_JS_DICTIONARY_PATH}`;
        const affResponse = await fetch(`${baseUrl}.aff`);
        const dicResponse = await fetch(`${baseUrl}.dic`);
        const affData = await affResponse.text();
        const dicData = await dicResponse.text();
        setTypo(new window.Typo(TYPO_JS_DICTIONARY, affData, dicData));
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
      // Use Set for O(1) lookup instead of array includes
      const words = markdown.match(/\b[a-zA-Z']+\b/g) || [];
      const uniqueWords = Array.from(new Set(words)); // More efficient than spread + Set
      const misspelledSet = new Set<string>();

      // Filter misspelled words efficiently
      for (const word of uniqueWords) {
        if (!typo.check(word)) {
          misspelledSet.add(word);
        }
      }

      const newMisspelledWords: MisspelledWord[] = [];
      if (misspelledSet.size > 0) {
        // Use the already created Set for O(1) lookups
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
    }, SPELLCHECK_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [markdown, typo]);

  return { typo, misspelledWords };
};
