import React from 'react';
import { CloseIcon, ListTreeIcon } from './icons';
import type { OutlineItem } from '@/src/types';

interface OutlinePanelProps {
  isOpen: boolean;
  onClose: () => void;
  outline: OutlineItem[];
}

const OutlinePanel: React.FC<OutlinePanelProps> = ({ isOpen, onClose, outline }) => {
  const indentationClasses = {
    1: 'pl-2',
    2: 'pl-6',
    3: 'pl-10',
  };

  return (
    <aside
      className={`flex-shrink-0 bg-white dark:bg-monarch-bg-light border-r border-gray-200 dark:border-monarch-main z-20 flex flex-col transition-all duration-300 ease-in-out overflow-hidden shadow-lg ${
        isOpen ? 'w-[300px] animate-slideInLeft' : 'w-0'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-monarch-main flex-shrink-0 bg-gray-50/50 dark:bg-monarch-bg/50 backdrop-blur-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-monarch-text">
          <ListTreeIcon className="w-6 h-6 text-monarch-accent transition-transform duration-200 hover:rotate-12" />{' '}
          Document Outline
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-monarch-main transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-monarch-accent"
          aria-label="Close outline panel"
        >
          <CloseIcon className="w-5 h-5 text-gray-600 dark:text-monarch-text-dark" />
        </button>
      </div>

      <div className="flex-grow p-3 overflow-y-auto">
        {outline.length > 0 ? (
          <ul className="space-y-1">
            {outline.map((item, index) => (
              <li
                key={`${item.id}-${item.text}`}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <a
                  href={`#${item.id}`}
                  title={item.text}
                  className={`block w-full text-left py-2 px-3 text-sm rounded-lg transition-all duration-200 truncate ${indentationClasses[item.level]} text-gray-700 dark:text-monarch-text-dark hover:bg-gray-100 dark:hover:bg-monarch-main/50 hover:translate-x-1 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-monarch-accent/50`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-monarch-text-dark/70 italic p-4 text-center animate-fadeIn">
            No headings found in the document.
          </div>
        )}
      </div>
    </aside>
  );
};

export default OutlinePanel;
