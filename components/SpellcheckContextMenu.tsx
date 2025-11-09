import React, { useEffect, useRef, useState } from 'react';
import type { ContextMenuData, MisspelledWord } from '../types';

interface SpellcheckContextMenuProps {
  data: ContextMenuData;
  onSelect: (word: MisspelledWord, suggestion: string) => void;
  onClose: () => void;
}

const SpellcheckContextMenu: React.FC<SpellcheckContextMenuProps> = ({ data, onSelect, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { word, suggestions } = data;
  const [menuPosition, setMenuPosition] = useState({ top: data.y, left: data.x, opacity: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Use timeout to prevent the same click that opened the menu from closing it
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Adjust position to keep the menu within the viewport after it has been rendered
  useEffect(() => {
    if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth: menuWidth, offsetHeight: menuHeight } = menuRef.current;
      
      let top = data.y;
      let left = data.x;

      if (left + menuWidth > innerWidth) {
        left = innerWidth - menuWidth - 10;
      }
      if (top + menuHeight > innerHeight) {
        top = innerHeight - menuHeight - 10;
      }

      setMenuPosition({ top, left, opacity: 1 });
    }
  }, [data.x, data.y]);


  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 bg-white dark:bg-monarch-bg-light border border-gray-200 dark:border-monarch-main rounded-lg shadow-2xl animate-fadeInDown transition-opacity"
      style={{
        ...menuPosition,
        animationDuration: '150ms'
      }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the menu via App's listener
    >
      <div className="p-2 border-b border-gray-200 dark:border-monarch-main">
        <span className="font-bold text-gray-700 dark:text-monarch-text">Suggestions for:</span>
        <p className="text-monarch-accent font-mono text-sm truncate">{word.word}</p>
      </div>
      <ul className="py-1 max-h-48 overflow-y-auto">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                onClick={() => onSelect(word, suggestion)}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-800 dark:text-monarch-text-dark hover:bg-gray-100 dark:hover:bg-monarch-main transition-colors"
              >
                {suggestion}
              </button>
            </li>
          ))
        ) : (
          <li className="px-3 py-1.5 text-sm text-gray-500 dark:text-monarch-text-dark/70 italic">
            No suggestions
          </li>
        )}
      </ul>
    </div>
  );
};

export default SpellcheckContextMenu;
