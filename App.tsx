import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import GeminiControls from './components/GeminiControls';
import FindReplace from './components/FindReplace';
import SpellcheckContextMenu from './components/SpellcheckContextMenu';
import Splitter from './components/Splitter';
import Toast from './components/Toast';
import ChatPanel from './components/ChatPanel';
import OutlinePanel from './components/OutlinePanel';
import ErrorBoundary from './components/ErrorBoundary';
import { INITIAL_MARKDOWN } from './constants';
import type {
  FormattingAction,
  MisspelledWord,
  ContextMenuData,
  TtsState,
  Toast as ToastType,
  OutlineItem,
} from './types';
import { getWordAt } from './utils/textUtils';
import { parseHeadings } from './utils/markdownUtils';
import { generateSpeech, fixGrammarAndSpelling } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';

const LOCAL_STORAGE_KEY = 'monarch-markdown-content';

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(
    () => localStorage.getItem(LOCAL_STORAGE_KEY) || INITIAL_MARKDOWN
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showFind, setShowFind] = useState<boolean>(false);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Split view state
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const isResizing = useRef(false);

  // Panel States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);

  // Spellcheck state
  const [typo, setTypo] = useState<{
    check: (word: string) => boolean;
    suggest: (word: string, limit?: number) => string[];
  } | null>(null);
  const [misspelledWords, setMisspelledWords] = useState<MisspelledWord[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  // Find & Replace state
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // TTS State
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const pausedAtRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);

  // Debounced save to local storage
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, markdown);
    }, 500);
    return () => clearTimeout(handler);
  }, [markdown]);

  // Debounced outline generation
  useEffect(() => {
    const handler = setTimeout(() => {
      const items = parseHeadings(markdown);
      setOutlineItems(items);
    }, 500); // Debounce to avoid running on every keystroke
    return () => clearTimeout(handler);
  }, [markdown]);

  // Load typo.js dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const affResponse = await fetch(
          'https://cdn.jsdelivr.net/npm/typo-js@1.2.1/dictionaries/en_US/en_US.aff'
        );
        const dicResponse = await fetch(
          'https://cdn.jsdelivr.net/npm/typo-js@1.2.1/dictionaries/en_US/en_US.dic'
        );
        const affData = await affResponse.text();
        const dicData = await dicResponse.text();
        setTypo(new window.Typo('en_US', affData, dicData));
      } catch (error) {
        console.error('Failed to load spellchecking dictionary:', error);
      }
    };
    loadDictionary();
  }, []);

  // Debounced spellcheck
  useEffect(() => {
    if (!typo) return;

    const handler = setTimeout(() => {
      const words = markdown.match(/\b[a-zA-Z']+\b/g) || [];
      const uniqueWords = [...new Set(words)];
      const misspelled = uniqueWords.filter((word) => !typo.check(word));

      const newMisspelledWords: MisspelledWord[] = [];
      if (misspelled.length > 0) {
        const misspelledSet = new Set(misspelled);
        const regex = /\b[a-zA-Z']+\b/g;
        let match;
        while ((match = regex.exec(markdown)) !== null) {
          if (misspelledSet.has(match[0])) {
            newMisspelledWords.push({
              index: match.index,
              length: match[0].length,
              word: match[0],
            });
          }
        }
      }
      setMisspelledWords(newMisspelledWords);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [markdown, typo]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        setShowFind(true);
      }
      if (event.key === 'Escape') {
        setShowFind(false);
        setContextMenu(null);
        setIsChatOpen(false);
        setIsOutlineOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const stats = useMemo(() => {
    const charCount = markdown.length;
    const words = markdown.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length === 1 && words[0] === '' ? 0 : words.length;
    const isContentPresent = markdown.trim().length > 0;
    const readingTime = isContentPresent ? Math.max(1, Math.ceil(wordCount / 225)) : 0; // Avg reading speed: 225 wpm
    return { wordCount, charCount, isContentPresent, readingTime };
  }, [markdown]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prevToasts: ToastType[]) => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts: ToastType[]) =>
      prevToasts.filter((toast: ToastType) => toast.id !== id)
    );
  }, []);

  const handleCorrection = (word: MisspelledWord, suggestion: string) => {
    const { index, length } = word;
    const newMarkdown =
      markdown.substring(0, index) + suggestion + markdown.substring(index + length);
    setMarkdown(newMarkdown);
    setContextMenu(null);
    editorRef.current?.focus();
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!typo) return;
    event.preventDefault();
    const cursorPosition = event.currentTarget.selectionStart;
    const wordInfo = getWordAt(markdown, cursorPosition);

    if (wordInfo) {
      const isMisspelled = misspelledWords.find((w: MisspelledWord) => w.index === wordInfo.index);
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
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'monarch-export.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Exported as monarch-export.md');
  };

  const handleStopTts = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setTtsState('idle');
    pausedAtRef.current = 0;
    startedAtRef.current = 0;
    audioBufferRef.current = null;
  }, []);

  const handleTtsPlayPause = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (
          window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        )({
          sampleRate: 24000,
        });
      } catch (e) {
        console.error('Web Audio API is not supported in this browser.', e);
        setTtsError('Audio playback not supported.');
        return;
      }
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setTtsError(null);

    switch (ttsState) {
      case 'playing':
        if (audioSourceRef.current && audioContextRef.current) {
          pausedAtRef.current = audioContextRef.current.currentTime - startedAtRef.current;
          audioSourceRef.current.onended = null;
          audioSourceRef.current.stop();
          audioSourceRef.current = null;
          setTtsState('paused');
        }
        break;
      case 'paused':
        if (audioContextRef.current && audioBufferRef.current) {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBufferRef.current;
          source.connect(audioContextRef.current.destination);
          startedAtRef.current = audioContextRef.current.currentTime - pausedAtRef.current;
          source.start(0, pausedAtRef.current % audioBufferRef.current.duration);
          source.onended = handleStopTts;
          audioSourceRef.current = source;
          setTtsState('playing');
        }
        break;
      case 'idle':
        if (!markdown.trim()) return;
        handleStopTts(); // Clear any previous state
        setTtsState('loading');
        try {
          const audioData = await generateSpeech(markdown);
          const decodedBuffer = await decodeAudioData(
            decode(audioData),
            audioContextRef.current,
            24000,
            1
          );
          audioBufferRef.current = decodedBuffer;
          const source = audioContextRef.current.createBufferSource();
          source.buffer = decodedBuffer;
          source.connect(audioContextRef.current.destination);
          pausedAtRef.current = 0;
          startedAtRef.current = audioContextRef.current.currentTime;
          source.start(0);
          source.onended = handleStopTts;
          audioSourceRef.current = source;
          setTtsState('playing');
        } catch (err) {
          console.error(err);
          setTtsError(err instanceof Error ? err.message : 'Failed to generate audio.');
          setTtsState('idle');
        }
        break;
    }
  }, [markdown, ttsState, handleStopTts]);

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
    } catch (err) {
      addToast('Failed to correct grammar. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [addToast, isGenerating, markdown]);

  // --- Splitter Logic ---
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isResizing.current = true;
    e.preventDefault();
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !mainContentRef.current) return;
    const containerRect = mainContentRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    if (newWidth > 15 && newWidth < 85) {
      // Clamp width
      setEditorWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // --- Panel Toggles ---
  const handleToggleOutline = () => {
    const willBeOpen = !isOutlineOpen;
    setIsOutlineOpen(willBeOpen);
    if (willBeOpen) {
      setIsChatOpen(false); // Close chat if opening outline
    }
  };

  const handleToggleChat = () => {
    const willBeOpen = !isChatOpen;
    setIsChatOpen(willBeOpen);
    if (willBeOpen) {
      setIsOutlineOpen(false); // Close outline if opening chat
    }
  };

  const applyFormatting = (action: FormattingAction) => {
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
  };

  // --- AI Chat Tool Functions ---
  const chatTools: Record<string, (...args: unknown[]) => unknown> = {
    getSelection: () => {
      const textarea = editorRef.current;
      if (!textarea) return '';
      const { selectionStart, selectionEnd } = textarea;
      return markdown.substring(selectionStart, selectionEnd);
    },
    getCurrentDocument: () => markdown,
    replaceContent: (newContent: unknown) => {
      if (typeof newContent === 'string') {
        setMarkdown(newContent);
      }
    },
    insertAtCursor: (textToInsert: unknown) => {
      if (typeof textToInsert !== 'string') return;
      const textarea = editorRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd } = textarea;
      const newText =
        markdown.substring(0, selectionStart) + textToInsert + markdown.substring(selectionEnd);
      setMarkdown(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          selectionStart + textToInsert.length,
          selectionStart + textToInsert.length
        );
      }, 0);
    },
    replaceSelection: (replacementText: unknown) => {
      if (typeof replacementText !== 'string') return;
      const textarea = editorRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd } = textarea;
      const newText =
        markdown.substring(0, selectionStart) + replacementText + markdown.substring(selectionEnd);
      setMarkdown(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(selectionStart, selectionStart + replacementText.length);
      }, 0);
    },
  };

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
              <div className="p-2 border-b border-gray-200 dark:border-monarch-main">
                <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-monarch-text-dark tracking-wider">
                  Preview
                </h2>
              </div>
              <ErrorBoundary
                fallback={
                  <div className="p-6 text-center text-gray-600 dark:text-monarch-text-dark">
                    <p>Preview failed to render. Please check your markdown syntax.</p>
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
          tools={chatTools}
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
        {toasts.map((toast: ToastType) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default App;
