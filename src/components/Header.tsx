import React from 'react';
import { MonarchIcon, DownloadIcon, MessageSquareIcon, ListTreeIcon } from './icons';

interface HeaderProps {
  onExport: (format?: 'md' | 'html') => void;
  wordCount: number;
  charCount: number;
  readingTime: number;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onToggleOutline: () => void;
  isOutlineOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onExport,
  wordCount,
  charCount,
  readingTime,
  onToggleChat,
  isChatOpen,
  onToggleOutline,
  isOutlineOpen,
}) => {
  return (
    <header className="flex items-center justify-between p-3 px-5 border-b border-gray-200 dark:border-monarch-main flex-shrink-0 dark:bg-monarch-bg-light/90 dark:backdrop-blur-md bg-white/95 backdrop-blur-sm z-30 relative shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 group">
          <MonarchIcon className="w-8 h-8 text-monarch-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-monarch-text tracking-tight">
            Monarch <span className="font-light opacity-90">Markdown</span>
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-3 border-l border-gray-200 dark:border-monarch-main ml-3 pl-4 text-xs text-gray-500 dark:text-monarch-text-dark font-mono tracking-tighter">
          <span className="font-medium">{wordCount} words</span>
          <div className="h-3 w-px bg-gray-300 dark:bg-monarch-main"></div>
          <span className="font-medium">{charCount} chars</span>
          {readingTime > 0 && (
            <>
              <div className="h-3 w-px bg-gray-300 dark:bg-monarch-main"></div>
              <span className="font-medium">{readingTime} min read</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="relative group">
          <button
            onClick={() => onExport('md')}
            className="p-2.5 rounded-lg text-gray-700 dark:text-monarch-text-dark hover:bg-gray-100 dark:hover:bg-monarch-main/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-monarch-accent focus:ring-offset-2 dark:focus:ring-offset-monarch-bg hover:scale-105 active:scale-95"
            aria-label="Export markdown"
            title="Export (Ctrl+S)"
          >
            <DownloadIcon className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="bg-white dark:bg-monarch-bg border border-gray-200 dark:border-monarch-main rounded-lg shadow-lg py-1 min-w-[120px]">
              <button
                onClick={() => onExport('md')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-monarch-text hover:bg-gray-100 dark:hover:bg-monarch-main/50"
              >
                Export as .md
              </button>
              <button
                onClick={() => onExport('html')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-monarch-text hover:bg-gray-100 dark:hover:bg-monarch-main/50"
              >
                Export as .html
              </button>
            </div>
          </div>
        </div>
        <div className="h-6 w-px bg-gray-200 dark:bg-monarch-main mx-1.5"></div>
        <button
          onClick={onToggleOutline}
          className={`p-2.5 rounded-lg text-gray-700 dark:text-monarch-text-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-monarch-accent focus:ring-offset-2 dark:focus:ring-offset-monarch-bg hover:scale-105 active:scale-95 ${
            isOutlineOpen
              ? 'bg-monarch-accent/20 dark:bg-monarch-main text-monarch-accent shadow-glow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-monarch-main/50'
          }`}
          aria-label="Toggle Document Outline"
          title="Toggle Document Outline (Ctrl+O)"
        >
          <ListTreeIcon
            className={`w-5 h-5 transition-transform duration-200 ${isOutlineOpen ? 'text-monarch-accent' : ''}`}
          />
        </button>
        <button
          onClick={onToggleChat}
          className={`p-2.5 rounded-lg text-gray-700 dark:text-monarch-text-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-monarch-accent focus:ring-offset-2 dark:focus:ring-offset-monarch-bg hover:scale-105 active:scale-95 ${
            isChatOpen
              ? 'bg-monarch-accent/20 dark:bg-monarch-main text-monarch-accent shadow-glow-sm'
              : 'hover:bg-gray-100 dark:hover:bg-monarch-main/50'
          }`}
          aria-label="Toggle AI Chat"
          title="Toggle AI Chat (Ctrl+K)"
        >
          <MessageSquareIcon
            className={`w-5 h-5 transition-transform duration-200 ${isChatOpen ? 'text-monarch-accent' : ''}`}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
