import { useState, useMemo } from 'react';

export const useFindReplace = (markdown: string) => {
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const matches = useMemo(() => {
    if (!findTerm) return [];

    // Escape special regex characters
    const escapedTerm = findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flags = matchCase ? 'g' : 'gi';

    // Use matchAll for better performance (native browser API)
    try {
      const regex = new RegExp(escapedTerm, flags);
      const matches = Array.from(markdown.matchAll(regex));
      return matches.map((match) => ({
        index: match.index!,
        length: match[0].length,
      }));
    } catch {
      // Fallback for older browsers or invalid regex
      const regex = new RegExp(escapedTerm, flags);
      const results: { index: number; length: number }[] = [];
      let match;
      while ((match = regex.exec(markdown)) !== null) {
        results.push({ index: match.index, length: match[0].length });
      }
      return results;
    }
  }, [findTerm, markdown, matchCase]);

  return {
    findTerm,
    setFindTerm,
    replaceTerm,
    setReplaceTerm,
    matchCase,
    setMatchCase,
    currentIndex,
    setCurrentIndex,
    matches,
  };
};
