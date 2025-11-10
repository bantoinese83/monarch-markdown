import React, { forwardRef, useRef, useMemo, memo } from 'react';
import type { MisspelledWord } from '@/src/types';

type EditorProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  wordWrap: boolean;
  matches: { index: number; length: number }[];
  currentIndex: number;
  misspelledWords: MisspelledWord[];
  onContextMenu: (event: React.MouseEvent<HTMLTextAreaElement>) => void;
};

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ wordWrap, matches, currentIndex, misspelledWords, value, onContextMenu, ...props }, ref) => {
    const backdropRef = useRef<HTMLDivElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      const { scrollTop, scrollLeft } = e.currentTarget;
      if (backdropRef.current) {
        backdropRef.current.scrollTop = scrollTop;
        backdropRef.current.scrollLeft = scrollLeft;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
      }
    };

    // Tiny utility to escape HTML to prevent XSS from the content itself.
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const highlightedHTML = useMemo(() => {
      const textValue = (value as string) || '';
      if ((matches.length === 0 && misspelledWords.length === 0) || !textValue) {
        return { __html: escapeHtml(textValue).replace(/\n$/g, '\n&nbsp;') };
      }

      // Use Array.from for better performance than fill + map
      const annotations = Array.from({ length: textValue.length }, (_, i) => ({
        char: textValue[i],
        isMisspelled: false,
        isFindMatch: false,
        isCurrentFindMatch: false,
      }));

      misspelledWords.forEach((word) => {
        for (let i = 0; i < word.length; i++) {
          if (annotations[word.index + i]) {
            annotations[word.index + i].isMisspelled = true;
          }
        }
      });

      matches.forEach((match, i) => {
        const isCurrent = i === currentIndex;
        for (let j = 0; j < match.length; j++) {
          if (annotations[match.index + j]) {
            annotations[match.index + j].isFindMatch = true;
            annotations[match.index + j].isCurrentFindMatch = isCurrent;
          }
        }
      });

      // Use array join for better performance than string concatenation
      const htmlParts: string[] = [];
      let inMisspelledSpan = false;
      let inFindMark = false;

      for (let i = 0; i < annotations.length; i++) {
        const ann = annotations[i];
        const nextAnn = annotations[i + 1];

        const isFindDifferent =
          !nextAnn ||
          ann.isFindMatch !== nextAnn.isFindMatch ||
          ann.isCurrentFindMatch !== nextAnn.isCurrentFindMatch;
        const isMisspelledDifferent = !nextAnn || ann.isMisspelled !== nextAnn.isMisspelled;

        if (ann.isFindMatch && !inFindMark) {
          const className = `rounded-sm ${ann.isCurrentFindMatch ? 'bg-monarch-accent/60' : 'bg-monarch-accent/30'}`;
          htmlParts.push(`<mark class="${className}">`);
          inFindMark = true;
        }
        if (ann.isMisspelled && !inMisspelledSpan) {
          htmlParts.push(`<span class="misspelled">`);
          inMisspelledSpan = true;
        }

        htmlParts.push(escapeHtml(ann.char));

        if (inMisspelledSpan && isMisspelledDifferent) {
          htmlParts.push(`</span>`);
          inMisspelledSpan = false;
        }
        if (inFindMark && isFindDifferent) {
          htmlParts.push(`</mark>`);
          inFindMark = false;
        }
      }

      let html = htmlParts.join('').replace(/\n$/g, '\n&nbsp;');

      return { __html: html };
    }, [value, matches, currentIndex, misspelledWords]);

    const lineCount = useMemo(() => ((value as string) || '').split('\n').length, [value]);

    const editorCommonClasses = `w-full h-full resize-none focus:outline-none font-mono text-base leading-relaxed border-0`;
    const editorPaddingClasses = `py-4 pr-4 pl-3`;
    const wrapClasses = !wordWrap
      ? 'whitespace-pre overflow-auto'
      : 'whitespace-pre-wrap overflow-y-auto';

    return (
      <div className="flex flex-grow h-full overflow-hidden bg-white dark:bg-monarch-bg-light">
        <div
          ref={lineNumbersRef}
          className="py-4 pl-4 pr-3 text-right select-none text-gray-400 dark:text-monarch-text-dark/40 font-mono text-sm leading-relaxed border-r border-gray-200 dark:border-monarch-main bg-gray-50/80 dark:bg-monarch-bg/80 overflow-y-hidden transition-colors duration-200"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="hover:text-gray-600 dark:hover:text-monarch-text-dark/70 transition-colors"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative flex-grow h-full overflow-hidden">
          <div
            ref={backdropRef}
            className={`${editorCommonClasses} ${editorPaddingClasses} ${wrapClasses} absolute top-0 left-0 z-0 text-gray-800 dark:text-monarch-text pointer-events-none overflow-hidden`}
            aria-hidden="true"
            dangerouslySetInnerHTML={highlightedHTML}
          />
          <textarea
            ref={ref}
            className={`${editorCommonClasses} ${editorPaddingClasses} ${wrapClasses} relative z-10 bg-transparent text-transparent caret-monarch-accent placeholder-gray-400 dark:placeholder-monarch-text-dark/60 selection:bg-monarch-accent/30 dark:selection:bg-monarch-accent/40 selection:text-gray-900 dark:selection:text-monarch-text focus:outline-none`}
            placeholder="Start writing your masterpiece..."
            spellCheck="false"
            onScroll={handleScroll}
            onContextMenu={onContextMenu}
            value={value}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Editor.displayName = 'Editor';

// Memoize Editor to prevent unnecessary re-renders when props haven't changed
export default memo(Editor);
