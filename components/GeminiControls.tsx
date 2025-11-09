import React, { useState } from 'react';
import { rewriteText, generateFromPrompt, generateImageFromPrompt } from '../services/geminiService';
import { SparklesIcon, MagicWandIcon, ImageIcon } from './icons';
import type { Tone } from '../types';

interface GeminiControlsProps {
  currentText: string;
  onGeneratedText: (text: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const TONES: Tone[] = ['Improve', 'Formal', 'Informal', 'Professional', 'Witty', 'Concise', 'Expanded'];

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

  const handleRewrite = async () => {
    const textarea = editorRef.current;
    if (!textarea || isGenerating) return;

    const { selectionStart, selectionEnd } = textarea;
    const hasSelection = selectionStart !== selectionEnd;
    const textToRewrite = hasSelection ? currentText.substring(selectionStart, selectionEnd) : currentText;
    
    if (!textToRewrite.trim()) return;

    setIsGenerating(true);
    try {
      const rewrittenText = await rewriteText(textToRewrite, tone);
      if (hasSelection) {
        const newFullText = 
            currentText.substring(0, selectionStart) +
            rewrittenText +
            currentText.substring(selectionEnd);
        onGeneratedText(newFullText);
      } else {
        onGeneratedText(rewrittenText);
      }
      addToast(`Text rewritten with ${tone} tone.`);
    } catch (err) {
      addToast('Failed to rewrite text. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const generatedText = await generateFromPrompt(prompt);
      const textarea = editorRef.current;
      if (textarea) {
        const { selectionStart } = textarea;
        const newText = 
            currentText.substring(0, selectionStart) +
            generatedText +
            currentText.substring(selectionStart);
        onGeneratedText(newText);
      } else {
        onGeneratedText(currentText + generatedText);
      }
      addToast('Content generated successfully.');
    } catch (err) {
      addToast('Failed to generate text. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const base64Image = await generateImageFromPrompt(prompt);
      const textarea = editorRef.current;
      if (base64Image && textarea) {
        const { selectionStart } = textarea;
        const imageMarkdown = `\n\n![${prompt.replace(/"/g, '')}](data:image/png;base64,${base64Image})\n\n`;
        const newText =
          currentText.substring(0, selectionStart) +
          imageMarkdown +
          currentText.substring(selectionStart);
        onGeneratedText(newText);
        addToast('Image generated and inserted.');
      } else {
        throw new Error("No image data received from API.");
      }
    } catch (err) {
      addToast('Failed to generate image. Please try a different prompt.', 'error');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-monarch-main bg-white dark:bg-monarch-bg-light flex-shrink-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Enter a prompt to generate content or an image..."
            disabled={isGenerating}
            className="w-full pl-10 pr-3 py-2 border border-monarch-main bg-monarch-bg rounded-lg focus:ring-2 focus:ring-monarch-accent focus:outline-none transition-all duration-200 disabled:opacity-50 placeholder:text-monarch-text-dark/70"
          />
          <MagicWandIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-monarch-accent" />
        </div>
        <div className="flex items-stretch gap-2">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-4 py-2 bg-monarch-accent hover:bg-monarch-accent-hover text-white font-bold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:bg-monarch-light/50 disabled:cursor-not-allowed flex-grow sm:flex-grow-0 transform hover:scale-105 shadow-lg shadow-monarch-accent/20"
                title="Generate text from prompt"
            >
                Generate
            </button>
             <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !prompt.trim()}
                className="px-3 py-2 bg-monarch-accent hover:bg-monarch-accent-hover text-white font-bold rounded-lg transition-all duration-200 flex items-center gap-2 disabled:bg-monarch-light/50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg shadow-monarch-accent/20"
                title="Generate image from prompt"
            >
                <ImageIcon className="w-5 h-5" />
            </button>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              disabled={isGenerating}
              className="px-3 py-2 border border-monarch-main bg-monarch-bg text-monarch-text-dark font-semibold rounded-lg focus:ring-2 focus:ring-monarch-accent focus:outline-none transition disabled:opacity-50 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23bca9d4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              {TONES.map(t => (
                <option key={t} value={t} className="bg-monarch-bg text-monarch-text font-semibold">{t}</option>
              ))}
            </select>
            <button
                onClick={handleRewrite}
                disabled={isGenerating || !currentText.trim()}
                className={`px-4 py-2 bg-transparent border-2 border-monarch-accent text-monarch-text font-bold rounded-lg transition flex items-center gap-2 hover:bg-monarch-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex-grow sm:flex-grow-0 transform hover:scale-105 ${isGenerating ? 'animate-pulseGlow' : ''}`}
            >
                <SparklesIcon className="w-5 h-5" />
                Rewrite
            </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiControls;