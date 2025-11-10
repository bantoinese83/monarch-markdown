import React, { createContext, useContext } from 'react';
import { useMarkdown } from '@/src/hooks/useMarkdown';
import { INITIAL_MARKDOWN } from '@/src/constants';
import type { OutlineItem } from '@/src/types';

interface MarkdownContextValue {
  markdown: string;
  setMarkdown: (content: string) => void;
  outlineItems: OutlineItem[];
  saveError: string | null;
  setErrorCallback: (callback: (error: Error) => void) => void;
}

const MarkdownContext = createContext<MarkdownContextValue | undefined>(undefined);

export const MarkdownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { markdown, setMarkdown, outlineItems, saveError, setErrorCallback } =
    useMarkdown(INITIAL_MARKDOWN);

  return (
    <MarkdownContext.Provider
      value={{ markdown, setMarkdown, outlineItems, saveError, setErrorCallback }}
    >
      {children}
    </MarkdownContext.Provider>
  );
};

export const useMarkdownContext = (): MarkdownContextValue => {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error('useMarkdownContext must be used within MarkdownProvider');
  }
  return context;
};
