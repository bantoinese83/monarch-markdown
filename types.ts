import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// This is to inform TypeScript about the global variables loaded from CDNs
declare global {
  interface Window {
    DOMPurify: typeof DOMPurify;
    hljs: typeof hljs;
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

export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Monarch = 'monarch',
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
