import React, { forwardRef, useRef, useMemo } from 'react';
import type { MisspelledWord } from '../types';

type EditorProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    wordWrap: boolean;
    matches: { index: number; length: number }[];
    currentIndex: number;
    misspelledWords: MisspelledWord[];
    onContextMenu: (event: React.MouseEvent<HTMLTextAreaElement>) => void;
};

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ wordWrap, matches, currentIndex, misspelledWords, value, onContextMenu, ...props }, ref) => {
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
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
    }

    const highlightedHTML = useMemo(() => {
        const textValue = (value as string) || '';
        if ((matches.length === 0 && misspelledWords.length === 0) || !textValue) {
            return { __html: escapeHtml(textValue).replace(/\n$/g, '\n&nbsp;') };
        }

        const annotations = new Array(textValue.length).fill(0).map((_, i) => ({
            char: textValue[i],
            isMisspelled: false,
            isFindMatch: false,
            isCurrentFindMatch: false,
        }));

        misspelledWords.forEach(word => {
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

        let html = '';
        let inMisspelledSpan = false;
        let inFindMark = false;

        for (let i = 0; i < annotations.length; i++) {
            const ann = annotations[i];
            const nextAnn = annotations[i+1];

            const isFindDifferent = !nextAnn || ann.isFindMatch !== nextAnn.isFindMatch || ann.isCurrentFindMatch !== nextAnn.isCurrentFindMatch;
            const isMisspelledDifferent = !nextAnn || ann.isMisspelled !== nextAnn.isMisspelled;

            if (ann.isFindMatch && !inFindMark) {
                const className = `rounded-sm ${ann.isCurrentFindMatch ? 'bg-monarch-accent/60' : 'bg-monarch-accent/30'}`;
                html += `<mark class="${className}">`;
                inFindMark = true;
            }
            if (ann.isMisspelled && !inMisspelledSpan) {
                html += `<span class="misspelled">`;
                inMisspelledSpan = true;
            }
            
            html += escapeHtml(ann.char);

            if (inMisspelledSpan && isMisspelledDifferent) {
                html += `</span>`;
                inMisspelledSpan = false;
            }
            if (inFindMark && isFindDifferent) {
                html += `</mark>`;
                inFindMark = false;
            }
        }
        
        html = html.replace(/\n$/g, '\n&nbsp;');

        return { __html: html };
    }, [value, matches, currentIndex, misspelledWords]);

    const lineCount = useMemo(() => (value as string || '').split('\n').length, [value]);

    const editorCommonClasses = `w-full h-full resize-none focus:outline-none font-mono text-base leading-relaxed border-0`;
    const editorPaddingClasses = `py-4 pr-4 pl-3`;
    const wrapClasses = !wordWrap ? 'whitespace-pre overflow-auto' : 'whitespace-pre-wrap overflow-y-auto';

    return (
        <div className="flex flex-grow h-full overflow-hidden bg-white dark:bg-monarch-bg-light">
            <div
                ref={lineNumbersRef}
                className="py-4 pl-4 pr-3 text-right select-none text-gray-400 dark:text-monarch-text-dark/50 font-mono text-base leading-relaxed border-r border-gray-200 dark:border-monarch-main bg-gray-50 dark:bg-monarch-bg overflow-y-hidden"
                aria-hidden="true"
            >
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
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
                    className={`${editorCommonClasses} ${editorPaddingClasses} ${wrapClasses} relative z-10 bg-transparent text-transparent caret-monarch-accent placeholder-gray-400 dark:placeholder-monarch-text-dark selection:bg-monarch-light selection:text-monarch-text`}
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
});

Editor.displayName = 'Editor';

export default Editor;