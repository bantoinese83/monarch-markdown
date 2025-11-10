import React, { useState } from 'react';
import { rewriteText, generateFromPrompt, generateImageFromPrompt } from '@/src/services';
import { SparklesIcon, MagicWandIcon, ImageIcon } from './icons';
import type { Tone } from '@/src/types';
import { useRequestCancellation } from '@/src/hooks/useRequestCancellation';
import { validatePrompt, insertTextAtCursor, replaceSelection } from '@/src/utils';

interface GeminiControlsProps {
  currentText: string;
  onGeneratedText: (text: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const TONES: Tone[] = [
  'Improve',
  'Formal',
  'Informal',
  'Professional',
  'Witty',
  'Concise',
  'Expanded',
];

const GeminiControls: React.FC<GeminiControlsProps> = ({
  currentText,
  onGeneratedText,
  isGenerating,
  setIsGenerating,
  editorRef,
  addToast,
}) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<Tone>('Improve');
  const { createController, isAborted, cleanup } = useRequestCancellation();

  const handleRewrite = async () => {
    const textarea = editorRef.current;
    if (!textarea || isGenerating) return;

    const controller = createController();
    const { selectionStart, selectionEnd } = textarea;
    const hasSelection = selectionStart !== selectionEnd;
    const textToRewrite = hasSelection
      ? currentText.substring(selectionStart, selectionEnd)
      : currentText;

    if (!textToRewrite.trim()) return;

    setIsGenerating(true);
    try {
      const rewrittenText = await rewriteText(textToRewrite, tone);

      if (isAborted(controller)) return;

      if (hasSelection && textarea) {
        replaceSelection(textarea, currentText, rewrittenText, onGeneratedText);
      } else {
        onGeneratedText(rewrittenText);
      }
      addToast(`Text rewritten with ${tone} tone.`);
      setPrompt('');
    } catch {
      if (isAborted(controller)) return;
      addToast('Failed to rewrite text. Please try again.', 'error');
    } finally {
      if (!isAborted(controller)) {
        setIsGenerating(false);
        cleanup(controller);
      }
    }
  };

  const handleGenerate = async () => {
    const validationError = validatePrompt(prompt);
    if (validationError) {
      addToast(validationError, 'error');
      return;
    }
    if (isGenerating) return;

    const controller = createController();
    setIsGenerating(true);
    try {
      const generatedText = await generateFromPrompt(prompt);

      if (isAborted(controller)) return;

      const textarea = editorRef.current;
      if (textarea) {
        insertTextAtCursor(textarea, currentText, generatedText, onGeneratedText);
      } else {
        onGeneratedText(currentText + generatedText);
      }
      addToast('Content generated successfully.');
      setPrompt('');
    } catch {
      if (isAborted(controller)) return;
      addToast('Failed to generate text. Please try again.', 'error');
    } finally {
      if (!isAborted(controller)) {
        setIsGenerating(false);
        cleanup(controller);
      }
    }
  };

  const handleGenerateImage = async () => {
    const validationError = validatePrompt(prompt);
    if (validationError) {
      addToast(validationError, 'error');
      return;
    }
    if (isGenerating) return;

    const controller = createController();
    setIsGenerating(true);
    try {
      const base64Image = await generateImageFromPrompt(prompt);

      if (isAborted(controller)) return;

      const textarea = editorRef.current;
      if (base64Image && textarea) {
        const imageMarkdown = `\n\n![${prompt.replace(/"/g, '')}](data:image/png;base64,${base64Image})\n\n`;
        insertTextAtCursor(textarea, currentText, imageMarkdown, onGeneratedText);
        addToast('Image generated and inserted.');
        setPrompt('');
      } else {
        throw new Error('No image data received from API.');
      }
    } catch {
      if (isAborted(controller)) return;
      addToast('Failed to generate image. Please try a different prompt.', 'error');
    } finally {
      if (!isAborted(controller)) {
        setIsGenerating(false);
        cleanup(controller);
      }
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-monarch-main bg-white dark:bg-monarch-bg-light flex-shrink-0 relative z-40">
      <div className="flex flex-col gap-2 w-full">
        <div className="relative w-full">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder={`Enter a prompt to generate content or an image... (max 5000 chars)`}
            disabled={isGenerating}
            maxLength={5000}
            className="w-full pl-10 pr-3 py-2 border border-monarch-main bg-monarch-bg rounded-lg focus:ring-2 focus:ring-monarch-accent focus:outline-none transition-all duration-200 disabled:opacity-50 placeholder:text-monarch-text-dark/70"
          />
          <MagicWandIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-monarch-accent pointer-events-none" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              backgroundColor: isGenerating || !prompt.trim() ? '#4d2da3' : '#9d5bff',
              color: '#ffffff',
              opacity: isGenerating || !prompt.trim() ? 0.8 : 1,
            }}
            className="px-3 sm:px-4 py-2 hover:bg-[#b88cff] font-bold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed flex-shrink-0 transform hover:scale-105 shadow-lg shadow-[#9d5bff]/20 whitespace-nowrap"
            title="Generate text from prompt"
          >
            {isGenerating ? (
              <div className="w-5 h-5 flex-shrink-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MagicWandIcon
                className="w-5 h-5 flex-shrink-0"
                style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff' }}
              />
            )}
            <span style={{ color: '#ffffff' }} className="hidden sm:inline">
              {isGenerating ? 'Generating...' : 'Generate'}
            </span>
          </button>
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating || !prompt.trim()}
            style={{
              backgroundColor: isGenerating || !prompt.trim() ? '#4d2da3' : '#9d5bff',
              color: '#ffffff',
              opacity: isGenerating || !prompt.trim() ? 0.8 : 1,
            }}
            className="px-3 py-2 hover:bg-[#b88cff] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed flex-shrink-0 transform hover:scale-105 shadow-lg shadow-[#9d5bff]/20"
            title="Generate image from prompt"
          >
            {isGenerating ? (
              <div className="w-5 h-5 flex-shrink-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ImageIcon
                className="w-5 h-5 flex-shrink-0"
                style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff' }}
              />
            )}
          </button>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            disabled={isGenerating}
            className="px-3 py-2 border border-monarch-main bg-white dark:bg-monarch-bg font-semibold rounded-lg focus:ring-2 focus:ring-monarch-accent focus:outline-none transition disabled:opacity-50 appearance-none flex-shrink-0 min-w-[100px] max-w-[150px]"
            style={{
              color: '#1f2937',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
          >
            {TONES.map((t) => (
              <option
                key={t}
                value={t}
                className="bg-white dark:bg-monarch-bg text-[#1f2937] dark:text-monarch-text font-semibold"
              >
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={handleRewrite}
            disabled={isGenerating || !currentText.trim()}
            className={`px-3 sm:px-4 py-2 bg-white dark:bg-transparent border-2 border-monarch-accent font-bold rounded-lg transition flex items-center gap-2 hover:bg-monarch-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transform hover:scale-105 whitespace-nowrap ${isGenerating ? 'animate-pulseGlow' : ''}`}
            style={{
              color: '#1f2937',
            }}
          >
            {isGenerating ? (
              <div className="w-5 h-5 flex-shrink-0 border-2 border-monarch-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <SparklesIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#1f2937' }} />
            )}
            <span style={{ color: '#1f2937' }}>{isGenerating ? 'Rewriting...' : 'Rewrite'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiControls;
