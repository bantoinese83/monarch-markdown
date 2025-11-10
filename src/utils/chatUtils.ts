import type { ChatMessage } from '@/src/types';

interface ProcessFunctionCallParams {
  call: {
    id?: string;
    name?: string;
    args?: Record<string, unknown>;
  };
  tools: Record<string, (...args: unknown[]) => unknown>;
  addToast: (message: string, type?: 'success' | 'error') => void;
}

export const processFunctionCall = async ({ call, tools, addToast }: ProcessFunctionCallParams) => {
  const callId = call.id ?? '';
  const callName = call.name ?? '';
  const callArgs = call.args ?? {};
  const toolResult = tools[callName]?.(...Object.values(callArgs));
  addToast(`AI used tool: ${callName}`, 'success');
  return {
    id: callId,
    name: callName,
    response: { result: toolResult },
  };
};

interface UpdateMessageHistoryParams {
  history: ChatMessage[];
  messageId: string;
  text: string;
}

export const updateMessageHistory = ({
  history,
  messageId,
  text,
}: UpdateMessageHistoryParams): ChatMessage[] => {
  const lastMessage = history[history.length - 1];
  if (lastMessage && lastMessage.role === 'model' && lastMessage.id === messageId) {
    lastMessage.parts[0].text = text;
    return [...history];
  }
  return [...history, { id: messageId, role: 'model', parts: [{ text }] }];
};
