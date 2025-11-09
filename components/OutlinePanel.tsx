import React from 'react';
import { CloseIcon, ListTreeIcon } from './icons';
import type { OutlineItem } from '../types';

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
    <aside className={`flex-shrink-0 bg-white dark:bg-monarch-bg-light border-r border-gray-200 dark:border-monarch-main z-20 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-[300px]' : 'w-0'}`}>
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-monarch-main flex-shrink-0">
            <h2 className="text-lg font-bold flex items-center gap-2"><ListTreeIcon className="w-6 h-6 text-monarch-accent" /> Document Outline</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-monarch-main">
            <CloseIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="flex-grow p-2 overflow-y-auto">
            {outline.length > 0 ? (
                <ul>
                    {outline.map(item => (
                        <li key={`${item.id}-${item.text}`}>
                            <a 
                                href={`#${item.id}`} 
                                title={item.text}
                                className={`block w-full text-left py-1.5 text-sm rounded-md transition-colors truncate ${indentationClasses[item.level]} text-gray-700 dark:text-monarch-text-dark hover:bg-gray-100 dark:hover:bg-monarch-main`}
                            >
                                {item.text}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-500 dark:text-monarch-text-dark/70 italic p-4 text-center">
                    No headings found in the document.
                </div>
            )}
        </div>
    </aside>
  );
};

export default OutlinePanel;
