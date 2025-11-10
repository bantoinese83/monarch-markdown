import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { CloseIcon, SendIcon, BotIcon, LoaderIcon } from './icons';
import { createChatSession } from '@/src/services';
import {
  ANIMATION_DELAY_MULTIPLIER,
  TEXTAREA_MIN_ROWS,
  TEXTAREA_MAX_ROWS,
  DOCUMENT_IDS,
  STREAM_UPDATE_THROTTLE_MS,
} from '@/src/constants';
import { processFunctionCall, updateMessageHistory } from '@/src/utils';
import type { ChatMessage } from '@/src/types';
import { marked } from 'marked';
import { useRequestCancellation } from '@/src/hooks/useRequestCancellation';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Record<string, (...args: unknown[]) => unknown>;
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, tools, addToast }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<number>(0);
  const { createController, cleanup } = useRequestCancellation();

  useEffect(() => {
    // Initialize chat session when panel is first opened
    if (isOpen && !chat) {
      setChat(createChatSession());
      setHistory([
        {
          id: `monarch-intro-${Date.now()}`,
          role: 'model',
          parts: [
            {
              text: "Hello! I'm Monarch, your AI assistant. How can I help you write today? You can ask me to edit, summarize, or generate content.",
            },
          ],
        },
      ]);
    }
  }, [isOpen, chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (isOpen && chat) {
      const input = document.querySelector(
        'textarea[placeholder="Ask Monarch to help..."]'
      ) as HTMLTextAreaElement;
      input?.focus();
    }
  }, [isOpen, chat]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!chat || !message.trim() || isLoading) return;

      const currentRequestId = ++requestIdRef.current;
      const controller = createController();

      setIsLoading(true);
      const userMessage: ChatMessage = {
        id: `${DOCUMENT_IDS.PREFIX_USER}${Date.now()}`,
        role: 'user',
        parts: [{ text: message }],
      };
      setHistory((prev: ChatMessage[]) => [...prev, userMessage]);
      setInput('');

      const textChunks: string[] = [];
      let currentMessageId = `${DOCUMENT_IDS.PREFIX_MODEL}${Date.now()}`;
      let updateThrottle: ReturnType<typeof setTimeout> | null = null;

      try {
        let stream = await chat.sendMessageStream({ message });

        // Check if request was cancelled
        if (currentRequestId !== requestIdRef.current) {
          if (updateThrottle) clearTimeout(updateThrottle);
          return;
        }

        for await (const chunk of stream) {
          if (chunk.functionCalls) {
            const calls = chunk.functionCalls;
            await Promise.all(calls.map((call) => processFunctionCall({ call, tools, addToast })));
          } else if (chunk.text) {
            textChunks.push(chunk.text);
            const modelResponseText = textChunks.join('');

            // Throttle updates to avoid excessive re-renders
            if (updateThrottle) {
              clearTimeout(updateThrottle);
            }
            updateThrottle = setTimeout(() => {
              setHistory((prev: ChatMessage[]) =>
                updateMessageHistory({
                  history: prev,
                  messageId: currentMessageId,
                  text: modelResponseText,
                })
              );
            }, STREAM_UPDATE_THROTTLE_MS);
          }
        }

        // Final update with all chunks
        if (updateThrottle) {
          clearTimeout(updateThrottle);
        }
        const finalText = textChunks.join('');
        setHistory((prev: ChatMessage[]) =>
          updateMessageHistory({
            history: prev,
            messageId: currentMessageId,
            text: finalText,
          })
        );
      } catch (error) {
        // Cleanup throttle on error
        if (updateThrottle) {
          clearTimeout(updateThrottle);
        }

        // Check if request was cancelled
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        // Check if error is from abort
        if (error instanceof Error && error.name === 'AbortError') {
          setHistory((prev: ChatMessage[]) => prev.slice(0, -1)); // Remove the user's message
          return;
        }

        addToast('Sorry, I encountered an error. Please try again.', 'error');
        setHistory((prev: ChatMessage[]) => prev.slice(0, -1)); // Remove the user's message on error
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
          cleanup(controller);
        }
      }
    },
    [chat, tools, addToast, isLoading, cleanup, createController]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <aside
      className={`shrink-0 bg-white dark:bg-monarch-bg-light border-l border-gray-200 dark:border-monarch-main z-20 flex flex-col transition-all duration-300 ease-in-out overflow-hidden shadow-lg ${
        isOpen ? 'w-[400px] animate-slideInRight' : 'w-0'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-monarch-main flex-shrink-0 bg-gray-50/50 dark:bg-monarch-bg/50 backdrop-blur-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-monarch-text">
          <BotIcon className="w-6 h-6 text-monarch-accent transition-transform duration-200 hover:scale-110" />{' '}
          AI Assistant
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-monarch-main transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-monarch-accent"
          aria-label="Close chat panel"
        >
          <CloseIcon className="w-5 h-5 text-gray-600 dark:text-monarch-text-dark" />
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {history.map((msg: ChatMessage, index: number) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : ''}`}
            style={{ animationDelay: `${index * ANIMATION_DELAY_MULTIPLIER}s` }}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-monarch-main flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 hover:scale-110">
                <BotIcon className="w-5 h-5 text-monarch-accent" />
              </div>
            )}
            <div
              className={`prose prose-sm dark:prose-invert max-w-full rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-monarch-accent/10 dark:bg-monarch-accent/20 border border-monarch-accent/30 text-gray-900 dark:text-monarch-text prose-p:text-gray-900 dark:prose-p:text-monarch-text prose-strong:text-gray-900 dark:prose-strong:text-monarch-text prose-a:text-blue-600 dark:prose-a:text-monarch-accent hover:shadow-md'
                  : 'bg-gray-100 dark:bg-monarch-bg text-gray-900 dark:text-monarch-text prose-p:text-gray-900 dark:prose-p:text-monarch-text prose-strong:text-gray-900 dark:prose-strong:text-monarch-text prose-a:text-blue-600 dark:prose-a:text-monarch-accent prose-code:text-gray-900 dark:prose-code:text-monarch-accent hover:shadow-md'
              }`}
              dangerouslySetInnerHTML={{
                __html: window.DOMPurify.sanitize(
                  (() => {
                    const parsed = marked.parse(msg.parts[0].text);
                    return typeof parsed === 'string' ? parsed : String(parsed ?? '');
                  })()
                ),
              }}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-monarch-main flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
              <BotIcon className="w-5 h-5 text-monarch-accent" />
            </div>
            <div className="bg-gray-100 dark:bg-monarch-bg rounded-xl px-4 py-3 flex items-center gap-2 text-gray-900 dark:text-monarch-text shadow-sm">
              <LoaderIcon className="w-4 h-4 animate-spin text-gray-900 dark:text-monarch-text" />
              <span className="text-sm italic text-gray-900 dark:text-monarch-text">
                Thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-monarch-main flex-shrink-0 bg-gray-50/50 dark:bg-monarch-bg/50 backdrop-blur-sm">
        <div className="relative">
          <BotIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-monarch-text-dark/60 pointer-events-none" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Monarch to help..."
            rows={Math.max(
              TEXTAREA_MIN_ROWS,
              Math.min(TEXTAREA_MAX_ROWS, input.split('\n').length)
            )}
            disabled={isLoading || !chat}
            className="w-full pl-12 pr-14 py-3 border border-gray-300 dark:border-monarch-main bg-white dark:bg-monarch-bg rounded-xl focus:ring-2 focus:ring-monarch-accent focus:border-monarch-accent focus:outline-none transition-all duration-200 disabled:opacity-50 resize-none shadow-sm text-gray-900 dark:text-monarch-text placeholder-gray-400 dark:placeholder-monarch-text-dark/60"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2.5 p-2.5 rounded-lg bg-[#9d5bff] hover:bg-[#b88cff] text-white disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-all duration-200 hover:scale-110 active:scale-95 disabled:hover:scale-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9d5bff] focus:ring-offset-2"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;
