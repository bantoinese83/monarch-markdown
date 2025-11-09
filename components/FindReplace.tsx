import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon, CloseIcon } from './icons';

interface FindReplaceProps {
  show: boolean;
  onClose: () => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  markdown: string;
  setMarkdown: (value: string) => void;
  findTerm: string;
  setFindTerm: (value: string) => void;
  replaceTerm: string;
  setReplaceTerm: (value: string) => void;
  matchCase: boolean;
  setMatchCase: (value: boolean) => void;
  currentIndex: number;
  setCurrentIndex: (value: number) => void;
  matches: { index: number; length: number }[];
}

const FindReplace: React.FC<FindReplaceProps> = ({ 
    show, onClose, editorRef, markdown, setMarkdown,
    findTerm, setFindTerm, replaceTerm, setReplaceTerm,
    matchCase, setMatchCase, currentIndex, setCurrentIndex, matches
}) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const findInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem('monarch-find-history');
    if (storedHistory) {
      try {
        setSearchHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse find history from localStorage", e);
      }
    }
  }, []);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    // Add term to front, remove duplicates, and cap at 10 entries
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('monarch-find-history', JSON.stringify(newHistory));
  };
  
  const selectMatch = useCallback((index: number) => {
    if (editorRef.current && matches[index]) {
      const { index: start, length } = matches[index];
      editorRef.current.focus();
      editorRef.current.setSelectionRange(start, start + length);
    }
  }, [editorRef, matches]);
  
  useEffect(() => {
    if (show && findTerm) {
      const newCurrentIndex = matches.findIndex(match => match.index >= (editorRef.current?.selectionStart ?? 0));
      const idx = newCurrentIndex !== -1 ? newCurrentIndex : 0;
      setCurrentIndex(matches.length > 0 ? idx : -1);
      if (matches.length > 0) {
        selectMatch(idx);
      }
    } else {
        setCurrentIndex(-1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findTerm, show, matches.length, selectMatch]);

  const handleNav = (direction: 'next' | 'prev') => {
    if (matches.length === 0) return;
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % matches.length;
    } else {
      nextIndex = (currentIndex - 1 + matches.length) % matches.length;
    }
    setCurrentIndex(nextIndex);
    selectMatch(nextIndex);
  };
  
  const handleReplace = () => {
    if (currentIndex === -1 || matches.length === 0 || !editorRef.current) return;
    
    const { index, length } = matches[currentIndex];
    const newMarkdown = markdown.substring(0, index) + replaceTerm + markdown.substring(index + length);
    
    setMarkdown(newMarkdown);
    
    setTimeout(() => {
        if (editorRef.current) {
            const nextMatchPos = index + replaceTerm.length;
            editorRef.current.focus();
            editorRef.current.setSelectionRange(nextMatchPos, nextMatchPos);
            // After replacing, the matches array will update, so we need to let useEffect handle the next index.
        }
    }, 0);
  };

  const handleReplaceAll = () => {
    if (matches.length === 0 || !findTerm) return;
    addToHistory(findTerm);
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const newMarkdown = markdown.replace(regex, replaceTerm);
    setMarkdown(newMarkdown);
  };
  
  const handleFindKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addToHistory(findTerm);
      setShowSuggestions(false);
      handleNav('next');
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (findInputRef.current && !findInputRef.current.contains(event.target as Node) &&
            suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHistory = useMemo(() => {
    if (!findTerm) return searchHistory;
    return searchHistory.filter(term => term.toLowerCase().includes(findTerm.toLowerCase()) && term.toLowerCase() !== findTerm.toLowerCase());
  }, [findTerm, searchHistory]);


  if (!show) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-gray-100/90 dark:bg-monarch-bg-light/90 backdrop-blur-sm p-2 z-20 border-b border-gray-200 dark:border-monarch-main shadow-lg animate-fadeInDown">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
        <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                ref={findInputRef}
                type="text"
                placeholder="Find"
                value={findTerm}
                onChange={(e) => setFindTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleFindKeyDown}
                className="w-full px-2 py-1 border border-transparent bg-gray-200 dark:bg-monarch-bg rounded-md focus:ring-2 focus:ring-monarch-accent focus:border-monarch-accent focus:outline-none text-sm transition-all"
              />
              {showSuggestions && filteredHistory.length > 0 && (
                <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-monarch-bg border border-monarch-light/50 rounded-md shadow-lg z-30 max-h-40 overflow-y-auto">
                    {filteredHistory.map(term => (
                        <div key={term} className="px-3 py-2 text-sm hover:bg-monarch-main cursor-pointer"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setFindTerm(term);
                                setShowSuggestions(false);
                                findInputRef.current?.focus();
                            }}>
                            {term}
                        </div>
                    ))}
                </div>
              )}
            </div>
            <button onClick={() => setMatchCase(!matchCase)} className={`p-1 rounded text-xs font-mono font-bold ${matchCase ? 'bg-monarch-accent text-white' : 'bg-gray-300 dark:bg-monarch-main hover:bg-gray-400 dark:hover:bg-monarch-light'}`} title="Match Case">Aa</button>
            <div className="flex items-center text-sm text-gray-600 dark:text-monarch-text-dark whitespace-nowrap">
                {matches.length > 0 ? `${currentIndex + 1} of ${matches.length}` : 'No results'}
            </div>
            <button onClick={() => handleNav('prev')} disabled={matches.length === 0} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-monarch-main disabled:opacity-50" title="Previous match"><ChevronUpIcon className="w-4 h-4" /></button>
            <button onClick={() => handleNav('next')} disabled={matches.length === 0} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-monarch-main disabled:opacity-50" title="Next match"><ChevronDownIcon className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Replace"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="w-full px-2 py-1 border border-transparent bg-gray-200 dark:bg-monarch-bg rounded-md focus:ring-2 focus:ring-monarch-accent focus:border-monarch-accent focus:outline-none text-sm transition-all"
            />
            <button onClick={handleReplace} disabled={matches.length === 0} className="px-3 py-1 text-sm rounded-md bg-monarch-accent hover:bg-monarch-accent-hover text-white disabled:opacity-50 transition-colors">Replace</button>
            <button onClick={handleReplaceAll} disabled={matches.length === 0} className="px-3 py-1 text-sm rounded-md bg-monarch-accent hover:bg-monarch-accent-hover text-white disabled:opacity-50 transition-colors">All</button>
        </div>
      </div>
       <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-monarch-main" title="Close (Esc)"><CloseIcon className="w-4 h-4" /></button>
    </div>
  );
};

export default FindReplace;
