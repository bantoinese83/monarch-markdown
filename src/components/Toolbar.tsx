import React from 'react';
import type { FormattingAction, TtsState } from '@/src/types';
import {
  BoldIcon,
  ItalicIcon,
  HeadingIcon,
  StrikethroughIcon,
  LinkIcon,
  ImageIcon,
  QuoteIcon,
  CodeIcon,
  ListUnorderedIcon,
  ListOrderedIcon,
  SearchIcon,
  WordWrapIcon,
  PlayIcon,
  PauseIcon,
  LoaderIcon,
  StopIcon,
  PenLineIcon,
  UndoIcon,
  RedoIcon,
  FileTextIcon,
  HistoryIcon,
} from './icons';

interface ToolbarProps {
  onFormat: (action: FormattingAction) => void;
  onToggleFind: () => void;
  wordWrap: boolean;
  onToggleWordWrap: () => void;
  ttsState: TtsState;
  onTtsPlayPause: () => void;
  onTtsStop: () => void;
  ttsError: string | null;
  isContentPresent: boolean;
  onFixGrammar: () => void;
  isGenerating: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenTemplates?: () => void;
  onOpenVersionHistory?: () => void;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
}> = ({ onClick, children, label, isActive = false, disabled = false }) => (
  <button
    onClick={onClick}
    title={label}
    disabled={disabled}
    className={`p-2.5 rounded-lg text-gray-600 dark:text-monarch-text-dark transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-monarch-accent disabled:opacity-50 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-monarch-accent/20 dark:bg-monarch-main text-monarch-accent shadow-glow-sm scale-105'
        : 'hover:bg-gray-100 dark:hover:bg-monarch-main/50 hover:scale-105 active:scale-95'
    } disabled:hover:scale-100 disabled:hover:bg-transparent`}
  >
    {children}
  </button>
);

const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onToggleFind,
  wordWrap,
  onToggleWordWrap,
  ttsState,
  onTtsPlayPause,
  onTtsStop,
  ttsError,
  isContentPresent,
  onFixGrammar,
  isGenerating,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenTemplates,
  onOpenVersionHistory,
}) => {
  const commonIconClass = 'w-5 h-5';

  const renderTtsIcon = () => {
    switch (ttsState) {
      case 'loading':
        return <LoaderIcon className={`${commonIconClass} animate-spin`} />;
      case 'playing':
        return <PauseIcon className={commonIconClass} />;
      case 'paused':
      case 'idle':
      default:
        return <PlayIcon className={commonIconClass} />;
    }
  };

  return (
    <div className="p-3 border-b border-gray-200 dark:border-monarch-main flex items-center justify-between gap-2 flex-wrap bg-gray-50/50 dark:bg-monarch-bg/50 backdrop-blur-sm">
      <div className="flex items-center gap-1 flex-wrap">
        {onUndo && (
          <ToolbarButton onClick={onUndo} label="Undo (Ctrl+Z)" disabled={!canUndo}>
            <UndoIcon className={commonIconClass} />
          </ToolbarButton>
        )}
        {onRedo && (
          <ToolbarButton onClick={onRedo} label="Redo (Ctrl+Y)" disabled={!canRedo}>
            <RedoIcon className={commonIconClass} />
          </ToolbarButton>
        )}
        {(onUndo || onRedo) && (
          <div className="h-6 w-px bg-gray-200 dark:border-monarch-main mx-1"></div>
        )}
        {onOpenTemplates && (
          <ToolbarButton onClick={onOpenTemplates} label="Templates">
            <FileTextIcon className={commonIconClass} />
          </ToolbarButton>
        )}
        {onOpenVersionHistory && (
          <ToolbarButton onClick={onOpenVersionHistory} label="Version History">
            <HistoryIcon className={commonIconClass} />
          </ToolbarButton>
        )}
        {(onOpenTemplates || onOpenVersionHistory) && (
          <div className="h-6 w-px bg-gray-200 dark:border-monarch-main mx-1"></div>
        )}
        <ToolbarButton onClick={() => onFormat('heading')} label="Heading">
          <HeadingIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={() => onFormat('bold')} label="Bold">
          <BoldIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={() => onFormat('italic')} label="Italic">
          <ItalicIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={() => onFormat('strikethrough')} label="Strikethrough">
          <StrikethroughIcon className={commonIconClass} />
        </ToolbarButton>
        <div className="h-6 w-px bg-gray-200 dark:bg-monarch-main mx-1"></div>
        <ToolbarButton onClick={() => onFormat('link')} label="Link">
          <LinkIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={() => onFormat('image')} label="Image">
          <ImageIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={() => onFormat('quote')} label="Blockquote">
          <QuoteIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={() => onFormat('code')} label="Code">
          <CodeIcon className={commonIconClass} />
        </ToolbarButton>
        <div className="h-6 w-px bg-gray-200 dark:bg-monarch-main mx-1"></div>
        <ToolbarButton onClick={() => onFormat('ul')} label="Unordered List">
          <ListUnorderedIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={() => onFormat('ol')} label="Ordered List">
          <ListOrderedIcon className={commonIconClass} />
        </ToolbarButton>
        <div className="h-6 w-px bg-gray-200 dark:bg-monarch-main mx-1"></div>
        <ToolbarButton
          onClick={onFixGrammar}
          label={isGenerating ? 'Fixing grammar...' : 'Fix Grammar & Spelling (AI)'}
          disabled={isGenerating || !isContentPresent}
        >
          {isGenerating ? (
            <LoaderIcon className={`${commonIconClass} animate-spin`} />
          ) : (
            <PenLineIcon className={commonIconClass} />
          )}
        </ToolbarButton>
      </div>
      <div className="flex items-center gap-2">
        <ToolbarButton onClick={onToggleFind} label="Find & Replace (Ctrl+F)">
          <SearchIcon className={commonIconClass} />
        </ToolbarButton>
        <ToolbarButton onClick={onToggleWordWrap} label="Toggle Word Wrap" isActive={wordWrap}>
          <WordWrapIcon className={commonIconClass} />
        </ToolbarButton>
        <div className="h-6 w-px bg-gray-200 dark:bg-monarch-main mx-1"></div>
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={onTtsPlayPause}
            label={ttsState === 'playing' ? 'Pause' : 'Read Aloud'}
            isActive={ttsState === 'playing' || ttsState === 'paused'}
            disabled={ttsState === 'loading' || !isContentPresent}
          >
            {renderTtsIcon()}
          </ToolbarButton>
          {(ttsState === 'playing' || ttsState === 'paused') && (
            <ToolbarButton onClick={onTtsStop} label="Stop Reading">
              <StopIcon className={`${commonIconClass} text-red-500/80 hover:text-red-500`} />
            </ToolbarButton>
          )}
          {ttsError && <span className="text-red-400 text-xs ml-2">{ttsError}</span>}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
