import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Header,
  Toolbar,
  Editor,
  Preview,
  GeminiControls,
  FindReplace,
  SpellcheckContextMenu,
  Splitter,
  Toast,
  ChatPanel,
  OutlinePanel,
  ErrorBoundary,
  TemplatePicker,
  VersionHistory,
} from '@/src/components';
import { useMarkdownContext, useToastContext } from '@/src/contexts';
import {
  useDocumentStats,
  useSpellcheck,
  useFindReplace,
  useKeyboardShortcuts,
  useSplitter,
  useTts,
  useUndoRedo,
  useDocuments,
} from '@/src/hooks';
import {
  getWordAt,
  insertTextAtCursor,
  replaceSelection,
  getSelection,
  exportToHTML,
  downloadFile,
} from '@/src/utils';
import { fixGrammarAndSpelling } from '@/src/services';
import type {
  FormattingAction,
  MisspelledWord,
  ContextMenuData,
  Template,
  DocumentVersion,
} from '@/src/types';

const App: React.FC = () => {
  const { markdown, setMarkdown, outlineItems, setErrorCallback } = useMarkdownContext();
  const { toasts, addToast, removeToast } = useToastContext();

  // Set up error callback for localStorage errors
  useEffect(() => {
    setErrorCallback((error: Error) => {
      addToast(error.message, 'error');
    });
  }, [setErrorCallback, addToast]);

  // Undo/Redo functionality
  const { undo, redo, canUndo, canRedo } = useUndoRedo(markdown, setMarkdown);
  const stats = useDocumentStats(markdown);
  const { typo, misspelledWords } = useSpellcheck(markdown);
  const {
    findTerm,
    setFindTerm,
    replaceTerm,
    setReplaceTerm,
    matchCase,
    setMatchCase,
    currentIndex,
    setCurrentIndex,
    matches,
  } = useFindReplace(markdown);
  const { editorWidth, mainContentRef, handleMouseDown } = useSplitter();
  const { ttsState, ttsError, handleTtsPlayPause, handleStopTts } = useTts(markdown);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showFind, setShowFind] = useState<boolean>(false);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Document management and version history
  const { createVersion, getDocumentVersions } = useDocuments();
  const documentVersions = getDocumentVersions('current-doc');

  // Auto-create version snapshots every 2 minutes
  useEffect(() => {
    if (!markdown.trim()) return;
    const interval = setInterval(() => {
      createVersion('current-doc', markdown);
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [markdown, createVersion]);

  // Create initial version on mount
  useEffect(() => {
    if (markdown) {
      createVersion('current-doc', markdown, 'Initial');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTemplate = useCallback(
    (template: Template) => {
      setMarkdown(template.content);
      addToast(`Template "${template.name}" applied`);
    },
    [setMarkdown, addToast]
  );

  const handleRestoreVersion = useCallback(
    (version: DocumentVersion) => {
      setMarkdown(version.content);
      addToast('Version restored');
    },
    [setMarkdown, addToast]
  );

  const handleCorrection = useCallback(
    (word: MisspelledWord, suggestion: string) => {
      const { index, length } = word;
      const newMarkdown =
        markdown.substring(0, index) + suggestion + markdown.substring(index + length);
      setMarkdown(newMarkdown);
      setContextMenu(null);
      editorRef.current?.focus();
    },
    [markdown, setMarkdown]
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement>) => {
      if (!typo) return;
      event.preventDefault();
      const cursorPosition = event.currentTarget.selectionStart;
      const wordInfo = getWordAt(markdown, cursorPosition);

      if (wordInfo) {
        const isMisspelled = misspelledWords.find(
          (w: MisspelledWord) => w.index === wordInfo.index
        );
        if (isMisspelled) {
          const suggestions = typo.suggest(isMisspelled.word, 5);
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
            word: isMisspelled,
            suggestions,
          });
        } else {
          setContextMenu(null);
        }
      } else {
        setContextMenu(null);
      }
    },
    [typo, markdown, misspelledWords]
  );

  const handleExport = useCallback(
    (format: 'md' | 'html' = 'md') => {
      if (format === 'html') {
        const htmlContent = exportToHTML(markdown, 'Monarch Export');
        downloadFile(htmlContent, 'monarch-export.html', 'text/html;charset=utf-8');
        addToast('Exported as HTML');
      } else {
        downloadFile(markdown, 'monarch-export.md', 'text/markdown;charset=utf-8');
        addToast('Exported as Markdown');
      }
    },
    [markdown, addToast]
  );

  const handleFixGrammar = useCallback(async () => {
    const textarea = editorRef.current;
    if (!textarea || isGenerating || !markdown.trim()) return;

    const { selectionStart, selectionEnd } = textarea;
    const hasSelection = selectionStart !== selectionEnd;
    const textToFix = hasSelection ? markdown.substring(selectionStart, selectionEnd) : markdown;

    if (!textToFix.trim()) return;

    setIsGenerating(true);
    try {
      const fixedText = await fixGrammarAndSpelling(textToFix);
      if (hasSelection) {
        const newFullText =
          markdown.substring(0, selectionStart) + fixedText + markdown.substring(selectionEnd);
        setMarkdown(newFullText);
      } else {
        setMarkdown(fixedText);
      }
      addToast('Grammar and spelling corrected.');
    } catch {
      addToast('Failed to correct grammar. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [addToast, isGenerating, markdown, setMarkdown]);

  const handleToggleOutline = useCallback(() => {
    const willBeOpen = !isOutlineOpen;
    setIsOutlineOpen(willBeOpen);
    if (willBeOpen) {
      setIsChatOpen(false);
    }
  }, [isOutlineOpen]);

  const handleToggleChat = useCallback(() => {
    const willBeOpen = !isChatOpen;
    setIsChatOpen(willBeOpen);
    if (willBeOpen) {
      setIsOutlineOpen(false);
    }
  }, [isChatOpen]);

  useKeyboardShortcuts({
    onToggleFind: () => setShowFind(true),
    onCloseFind: () => setShowFind(false),
    onCloseContextMenu: () => setContextMenu(null),
    onCloseChat: () => setIsChatOpen(false),
    onCloseOutline: () => setIsOutlineOpen(false),
    onExport: handleExport,
    onToggleOutline: handleToggleOutline,
    onToggleChat: handleToggleChat,
    onUndo: undo,
    onRedo: redo,
  });

  const applyFormatting = useCallback(
    (action: FormattingAction) => {
      const textarea = editorRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = markdown.substring(start, end);
      let newText = '';
      let newSelectionStart = start;
      let newSelectionEnd = end;

      const syntaxMap = {
        bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
        italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
        strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' },
        heading: { prefix: '### ', suffix: '', placeholder: 'Heading' },
        quote: { prefix: '> ', suffix: '', placeholder: 'Quote' },
        code: { prefix: '`', suffix: '`', placeholder: 'code' },
        link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
        image: { prefix: '![', suffix: '](url)', placeholder: 'alt text' },
        ul: { prefix: '- ', suffix: '', placeholder: 'List item' },
        ol: { prefix: '1. ', suffix: '', placeholder: 'List item' },
      };

      const format = syntaxMap[action];

      if (selectedText) {
        newText = `${format.prefix}${selectedText}${format.suffix}`;
        newSelectionStart = start;
        newSelectionEnd = start + newText.length;
      } else {
        newText = `${format.prefix}${format.placeholder}${format.suffix}`;
        newSelectionStart = start + format.prefix.length;
        newSelectionEnd = newSelectionStart + format.placeholder.length;
      }

      setMarkdown(`${markdown.substring(0, start)}${newText}${markdown.substring(end)}`);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
      }, 0);
    },
    [markdown, setMarkdown]
  );

  const chatTools = useCallback(
    () => ({
      getSelection: () => getSelection(editorRef.current, markdown),
      getCurrentDocument: () => markdown,
      replaceContent: (newContent: unknown) => {
        if (typeof newContent === 'string') {
          setMarkdown(newContent);
        }
      },
      insertAtCursor: (textToInsert: unknown) => {
        if (typeof textToInsert !== 'string' || !editorRef.current) return;
        insertTextAtCursor(editorRef.current, markdown, textToInsert, setMarkdown);
      },
      replaceSelection: (replacementText: unknown) => {
        if (typeof replacementText !== 'string' || !editorRef.current) return;
        replaceSelection(editorRef.current, markdown, replacementText, setMarkdown);
      },
    }),
    [markdown, setMarkdown]
  );

  return (
    <div
      className="flex flex-col h-screen font-sans text-gray-800 dark:text-monarch-text bg-white dark:bg-monarch-bg overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      <Header
        onExport={handleExport}
        wordCount={stats.wordCount}
        charCount={stats.charCount}
        readingTime={stats.readingTime}
        onToggleChat={handleToggleChat}
        isChatOpen={isChatOpen}
        onToggleOutline={handleToggleOutline}
        isOutlineOpen={isOutlineOpen}
      />
      <div className="flex flex-grow overflow-hidden">
        <OutlinePanel
          isOpen={isOutlineOpen}
          onClose={() => setIsOutlineOpen(false)}
          outline={outlineItems}
        />
        <main ref={mainContentRef} className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <div
            className="w-full md:w-[var(--editor-width)] flex flex-col h-full relative bg-white dark:bg-monarch-bg-light"
            style={{ '--editor-width': `${editorWidth}%` } as React.CSSProperties}
          >
            <Toolbar
              onFormat={applyFormatting}
              onToggleFind={() => setShowFind(!showFind)}
              wordWrap={wordWrap}
              onToggleWordWrap={() => setWordWrap(!wordWrap)}
              ttsState={ttsState}
              onTtsPlayPause={handleTtsPlayPause}
              onTtsStop={handleStopTts}
              ttsError={ttsError}
              isContentPresent={stats.isContentPresent}
              onFixGrammar={handleFixGrammar}
              isGenerating={isGenerating}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onOpenTemplates={() => setShowTemplates(true)}
              onOpenVersionHistory={() => setShowVersionHistory(true)}
            />
            <FindReplace
              show={showFind}
              onClose={() => setShowFind(false)}
              editorRef={editorRef as React.RefObject<HTMLTextAreaElement>}
              markdown={markdown}
              setMarkdown={setMarkdown}
              findTerm={findTerm}
              setFindTerm={setFindTerm}
              replaceTerm={replaceTerm}
              setReplaceTerm={setReplaceTerm}
              matchCase={matchCase}
              setMatchCase={setMatchCase}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              matches={matches}
            />
            <Editor
              ref={editorRef}
              value={markdown}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMarkdown(e.target.value)}
              onContextMenu={handleContextMenu}
              wordWrap={wordWrap}
              matches={matches}
              currentIndex={currentIndex}
              misspelledWords={misspelledWords}
            />
            <GeminiControls
              editorRef={editorRef as React.RefObject<HTMLTextAreaElement>}
              currentText={markdown}
              onGeneratedText={setMarkdown}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              addToast={addToast}
            />
          </div>
          <Splitter onMouseDown={handleMouseDown} />
          <div
            className="w-full md:w-[calc(100%-var(--editor-width))] flex flex-col h-full bg-gray-50 dark:bg-monarch-bg"
            style={{ '--editor-width': `${editorWidth}%` } as React.CSSProperties}
          >
            <div className="p-3 border-b border-gray-200 dark:border-monarch-main bg-white/50 dark:bg-monarch-bg-light/50 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase text-gray-600 dark:text-monarch-text-dark tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-monarch-accent animate-pulse"></span>
                Preview
              </h2>
            </div>
            <ErrorBoundary
              fallback={
                <div className="p-6 text-center text-gray-600 dark:text-monarch-text-dark animate-fadeIn">
                  <p className="text-base">
                    Preview failed to render. Please check your markdown syntax.
                  </p>
                </div>
              }
            >
              <Preview markdown={markdown} />
            </ErrorBoundary>
          </div>
        </main>
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          tools={chatTools()}
          addToast={addToast}
        />
      </div>

      {contextMenu && (
        <SpellcheckContextMenu
          data={contextMenu}
          onSelect={handleCorrection}
          onClose={() => setContextMenu(null)}
        />
      )}
      <div className="fixed top-20 right-4 z-[100]">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>

      <TemplatePicker
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <VersionHistory
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={documentVersions}
        onRestore={handleRestoreVersion}
        documentTitle="Current Document"
      />
    </div>
  );
};

export default App;
