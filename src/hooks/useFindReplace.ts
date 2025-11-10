import { useState, useMemo } from 'react';

export const useFindReplace = (markdown: string) => {
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const matches = useMemo(() => {
    if (!findTerm) return [];
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const results: { index: number; length: number }[] = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      results.push({ index: match.index, length: match[0].length });
    }
    return results;
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
