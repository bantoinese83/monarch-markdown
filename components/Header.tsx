import React, { useState, useEffect } from 'react';
import { MonarchIcon, SunIcon, MoonIcon, DownloadIcon, MessageSquareIcon, ListTreeIcon } from './icons';
import { Theme } from '../types';

interface HeaderProps {
    onExport: () => void;
    wordCount: number;
    charCount: number;
    readingTime: number;
    onToggleChat: () => void;
    isChatOpen: boolean;
    onToggleOutline: () => void;
    isOutlineOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onExport, wordCount, charCount, readingTime, 
    onToggleChat, isChatOpen,
    onToggleOutline, isOutlineOpen
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme && Object.values(Theme).includes(storedTheme)) {
        return storedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.Monarch;
      }
    }
    return Theme.Light;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === Theme.Light) {
      root.classList.remove('dark');
      root.classList.remove('monarch-theme');
    } else {
      root.classList.add('dark');
      if (theme === Theme.Monarch) {
        root.classList.add('monarch-theme'); // for potential monarch-specific styles
      } else {
        root.classList.remove('monarch-theme');
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => {
        if(current === Theme.Light) return Theme.Monarch;
        if(current === Theme.Monarch) return Theme.Light;
        return Theme.Light; // fallback
    });
  };

  return (
    <header className="flex items-center justify-between p-2 px-4 border-b border-gray-200 dark:border-monarch-main flex-shrink-0 dark:bg-monarch-bg-light/80 dark:backdrop-blur-sm z-30 relative">
      <div className="flex items-center gap-3">
        <MonarchIcon className="w-8 h-8 text-monarch-accent" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-monarch-text">
          Monarch <span className="font-light">Markdown</span>
        </h1>
         <div className="hidden sm:flex items-center gap-3 border-l border-gray-200 dark:border-monarch-main ml-3 pl-3 text-xs text-gray-500 dark:text-monarch-text-dark font-mono tracking-tighter">
            <span>{wordCount} words</span>
            <div className="h-3 w-px bg-gray-300 dark:bg-monarch-main"></div>
            <span>{charCount} chars</span>
            {readingTime > 0 && (
                <>
                    <div className="h-3 w-px bg-gray-300 dark:bg-monarch-main"></div>
                    <span>{readingTime} min read</span>
                </>
            )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
            onClick={onExport}
            className="p-2 rounded-lg text-gray-700 dark:text-monarch-text-dark hover:bg-gray-200 dark:hover:bg-monarch-main transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-monarch-accent hover:scale-110"
            aria-label="Export markdown"
            title="Export as .md file"
        >
            <DownloadIcon className="w-5 h-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-700 dark:text-monarch-text-dark hover:bg-gray-200 dark:hover:bg-monarch-main transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-monarch-accent hover:scale-110"
          aria-label="Toggle theme"
        >
          {theme === Theme.Light ? (
            <MoonIcon className="w-5 h-5 text-gray-700" />
          ) : (
            <SunIcon className="w-5 h-5 text-monarch-text" />
          )}
        </button>
         <div className="h-6 w-px bg-gray-200 dark:bg-monarch-main mx-1"></div>
        <button
            onClick={onToggleOutline}
            className={`p-2 rounded-lg text-gray-700 dark:text-monarch-text-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-monarch-accent hover:scale-110 ${isOutlineOpen ? 'bg-monarch-accent/20 dark:bg-monarch-main' : 'hover:bg-gray-200 dark:hover:bg-monarch-main'}`}
            aria-label="Toggle Document Outline"
            title="Toggle Document Outline"
        >
            <ListTreeIcon className={`w-5 h-5 ${isOutlineOpen ? 'text-monarch-accent' : ''}`} />
        </button>
        <button
            onClick={onToggleChat}
            className={`p-2 rounded-lg text-gray-700 dark:text-monarch-text-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-monarch-accent hover:scale-110 ${isChatOpen ? 'bg-monarch-accent/20 dark:bg-monarch-main' : 'hover:bg-gray-200 dark:hover:bg-monarch-main'}`}
            aria-label="Toggle AI Chat"
            title="Toggle AI Chat"
        >
            <MessageSquareIcon className={`w-5 h-5 ${isChatOpen ? 'text-monarch-accent' : ''}`} />
        </button>
      </div>
    </header>
  );
};

export default Header;