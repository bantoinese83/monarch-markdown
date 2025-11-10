import type { FormattingAction } from '@/src/types';

/**
 * Utility functions for editor text manipulation
 * Eliminates duplication of cursor/selection manipulation patterns
 */

interface FormatSyntax {
  prefix: string;
  suffix: string;
  placeholder: string;
}

export const FORMAT_SYNTAX_MAP: Record<FormattingAction, FormatSyntax> = {
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

interface ApplyFormattingResult {
  newText: string;
  newSelectionStart: number;
  newSelectionEnd: number;
}

export const applyFormattingToText = (
  action: FormattingAction,
  markdown: string,
  selectionStart: number,
  selectionEnd: number
): ApplyFormattingResult => {
  const format = FORMAT_SYNTAX_MAP[action];
  const selectedText = markdown.substring(selectionStart, selectionEnd);

  if (selectedText) {
    const newText = `${format.prefix}${selectedText}${format.suffix}`;
    return {
      newText,
      newSelectionStart: selectionStart,
      newSelectionEnd: selectionStart + newText.length,
    };
  }

  const newText = `${format.prefix}${format.placeholder}${format.suffix}`;
  const newSelectionStart = selectionStart + format.prefix.length;
  return {
    newText,
    newSelectionStart,
    newSelectionEnd: newSelectionStart + format.placeholder.length,
  };
};

/**
 * Inserts text at the current cursor position
 * @param textarea The textarea element
 * @param content The current content
 * @param textToInsert The text to insert
 * @param setContent Function to update content
 */
export const insertTextAtCursor = (
  textarea: HTMLTextAreaElement,
  content: string,
  textToInsert: string,
  setContent: (newContent: string) => void
): void => {
  const { selectionStart, selectionEnd } = textarea;
  const newText =
    content.substring(0, selectionStart) + textToInsert + content.substring(selectionEnd);
  setContent(newText);

  setTimeout(() => {
    textarea.focus();
    const newCursorPos = selectionStart + textToInsert.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
};

/**
 * Replaces the current selection with new text
 * @param textarea The textarea element
 * @param content The current content
 * @param replacementText The text to replace selection with
 * @param setContent Function to update content
 */
export const replaceSelection = (
  textarea: HTMLTextAreaElement,
  content: string,
  replacementText: string,
  setContent: (newContent: string) => void
): void => {
  const { selectionStart, selectionEnd } = textarea;
  const newText =
    content.substring(0, selectionStart) + replacementText + content.substring(selectionEnd);
  setContent(newText);

  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(selectionStart, selectionStart + replacementText.length);
  }, 0);
};

/**
 * Gets the current selection from a textarea
 * @param textarea The textarea element
 * @param content The current content
 * @returns The selected text, or empty string if no selection
 */
export const getSelection = (textarea: HTMLTextAreaElement | null, content: string): string => {
  if (!textarea) return '';
  const { selectionStart, selectionEnd } = textarea;
  return content.substring(selectionStart, selectionEnd);
};
