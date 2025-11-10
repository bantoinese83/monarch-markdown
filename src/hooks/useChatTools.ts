import { useCallback } from 'react';
import type { RefObject } from 'react';
import { getSelection, insertTextAtCursor, replaceSelection } from '@/src/utils';

interface UseChatToolsParams {
  editorRef: RefObject<HTMLTextAreaElement>;
  markdown: string;
  setMarkdown: (content: string) => void;
}

export const useChatTools = ({ editorRef, markdown, setMarkdown }: UseChatToolsParams) => {
  return useCallback(
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
    [editorRef, markdown, setMarkdown]
  );
};
