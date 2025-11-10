import { ValidationError } from '@/src/errors';
import { MAX_PROMPT_LENGTH, MAX_TEXT_LENGTH } from '@/src/constants';

/**
 * Validates a prompt string
 * @param prompt The prompt to validate
 * @param maxLength Maximum allowed length (default: MAX_PROMPT_LENGTH)
 * @returns Error message if invalid, null if valid
 */
export const validatePrompt = (prompt: string, maxLength = MAX_PROMPT_LENGTH): string | null => {
  if (!prompt || !prompt.trim()) {
    return 'Prompt cannot be empty.';
  }
  if (prompt.length > maxLength) {
    return `Prompt too long. Maximum ${maxLength} characters.`;
  }
  return null;
};

/**
 * Validates text content
 * @param text The text to validate
 * @param maxLength Maximum allowed length (default: MAX_TEXT_LENGTH)
 * @throws ValidationError if invalid
 */
export const validateText = (text: string, maxLength = MAX_TEXT_LENGTH): void => {
  if (!text || !text.trim()) {
    throw new ValidationError('Text cannot be empty.');
  }
  if (text.length > maxLength) {
    throw new ValidationError(`Text too long. Maximum ${maxLength} characters.`);
  }
};
