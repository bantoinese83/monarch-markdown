import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Global type declarations for CDN-loaded libraries
declare global {
  interface Window {
    DOMPurify: typeof DOMPurify;
    hljs: typeof hljs;
    mermaid?: {
      initialize: (config: { startOnLoad?: boolean; theme?: string }) => void;
      run: (config: { nodes: HTMLElement[] }) => void;
    };
    Typo: new (
      dictionary: string,
      affData: string,
      dicData: string
    ) => {
      check: (word: string) => boolean;
      suggest: (word: string, limit?: number) => string[];
    };
  }
}

export type FormattingAction =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'strikethrough'
  | 'link'
  | 'image'
  | 'quote'
  | 'code'
  | 'ul'
  | 'ol';

export type Tone =
  | 'Improve'
  | 'Formal'
  | 'Informal'
  | 'Professional'
  | 'Witty'
  | 'Concise'
  | 'Expanded';

export interface MisspelledWord {
  index: number;
  length: number;
  word: string;
}

export interface ContextMenuData {
  x: number;
  y: number;
  word: MisspelledWord;
  suggestions: string[];
}

export type TtsState = 'idle' | 'loading' | 'playing' | 'paused';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  id: string;
}

export interface OutlineItem {
  level: 1 | 2 | 3;
  text: string;
  id: string;
}

export interface DocumentStats {
  wordCount: number;
  charCount: number;
  readingTime: number;
  isContentPresent: boolean;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isUnsaved?: boolean;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  createdAt: number;
  label?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'blog' | 'notes' | 'meeting' | 'report' | 'personal' | 'other';
  content: string;
  isCustom?: boolean;
}
