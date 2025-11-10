/**
 * Utility functions for editor text manipulation
 * Eliminates duplication of cursor/selection manipulation patterns
 */

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
