import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { CloseIcon, SendIcon, BotIcon, LoaderIcon } from './icons';
import { createChatSession } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { marked } from 'marked';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Record<string, (...args: any[]) => any>;
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, tools, addToast }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session when panel is first opened
    if (isOpen && !chat) {
      setChat(createChatSession());
      setHistory([
        {
          id: `monarch-intro-${Date.now()}`,
          role: 'model',
          parts: [{ text: "Hello! I'm Monarch, your AI assistant. How can I help you write today? You can ask me to edit, summarize, or generate content." }],
        }
      ]);
    }
  }, [isOpen, chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!chat || !message.trim()) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { 
        id: `user-${Date.now()}`,
        role: 'user', 
        parts: [{ text: message }] 
    };
    setHistory(prev => [...prev, userMessage]);
    setInput('');

    try {
        let stream = await chat.sendMessageStream({ message });
        let modelResponseText = '';
        let currentMessageId = `model-${Date.now()}`;

        for await (const chunk of stream) {
            if (chunk.functionCalls) {
                const calls = chunk.functionCalls;

                // Call all functions in parallel
                const toolResponses = await Promise.all(calls.map(async (call) => {
                    const toolResult = tools[call.name]?.(...Object.values(call.args));
                    addToast(`AI used tool: ${call.name}`, 'success');
                    return {
                        id: call.id,
                        name: call.name,
                        response: { result: toolResult }
                    };
                }));

                // Send tool responses back to the model
                stream = await chat.sendMessageStream({ functionResponses: toolResponses });
                
            } else {
                modelResponseText += chunk.text;
                // Use a functional update to stream response into the history
                setHistory(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'model' && lastMessage.id === currentMessageId) {
                        lastMessage.parts[0].text = modelResponseText;
                        return [...prev];
                    } else {
                        return [...prev, { id: currentMessageId, role: 'model', parts: [{ text: modelResponseText }] }];
                    }
                });
            }
        }
    } catch (error) {
        console.error("Chat error:", error);
        addToast("Sorry, I encountered an error. Please try again.", "error");
        setHistory(prev => prev.slice(0, -1)); // Remove the user's message on error
    } finally {
        setIsLoading(false);
    }

  }, [chat, tools, addToast]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(input);
    }
  };

  return (
    <aside className={`flex-shrink-0 bg-white dark:bg-monarch-bg-light border-l border-gray-200 dark:border-monarch-main z-20 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-[400px]' : 'w-0'}`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-monarch-main flex-shrink-0">
        <h2 className="text-lg font-bold flex items-center gap-2"><BotIcon className="w-6 h-6 text-monarch-accent" /> AI Assistant</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-monarch-main">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        {history.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-monarch-main flex items-center justify-center flex-shrink-0">
                <BotIcon className="w-5 h-5 text-monarch-accent" />
              </div>
            )}
            <div
                className={`prose prose-sm dark:prose-invert max-w-full rounded-xl px-4 py-2.5 ${
                    msg.role === 'user'
                    ? 'bg-monarch-accent text-white prose-p:text-white prose-strong:text-white'
                    : 'bg-gray-100 dark:bg-monarch-bg'
                }`}
                dangerouslySetInnerHTML={{ __html: window.DOMPurify.sanitize(marked.parse(msg.parts[0].text)) }}
            />
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-monarch-main flex items-center justify-center flex-shrink-0">
                    <BotIcon className="w-5 h-5 text-monarch-accent" />
                </div>
                <div className="bg-gray-100 dark:bg-monarch-bg rounded-xl px-4 py-3 flex items-center gap-2">
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span className="text-sm italic">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-monarch-main flex-shrink-0">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Monarch to help..."
            rows={Math.max(1, Math.min(5, input.split('\n').length))}
            disabled={isLoading || !chat}
            className="w-full pl-3 pr-12 py-2 border border-monarch-main bg-monarch-bg rounded-lg focus:ring-2 focus:ring-monarch-accent focus:outline-none transition-all duration-200 disabled:opacity-50 resize-none"
          />
          <button onClick={() => handleSendMessage(input)} disabled={isLoading || !input.trim()} className="absolute right-2 bottom-2 p-2 rounded-lg bg-monarch-accent hover:bg-monarch-accent-hover text-white disabled:bg-monarch-light/50 transition-colors">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;