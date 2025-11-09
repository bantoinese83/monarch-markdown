import { GoogleGenAI, Modality, Chat, FunctionDeclaration, Type } from '@google/genai';
import type { Tone } from '../types';

// Ensure the API key is available, otherwise throw an error.
if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';

// --- Tool and Function Calling Definitions for Chat ---
const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'getSelection',
    description: 'Get the currently selected text from the editor.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'getCurrentDocument',
    description: 'Get the full content of the current markdown document.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'replaceContent',
    description: 'Replace the entire document content with new content.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        newContent: {
          type: Type.STRING,
          description: 'The new content to replace the entire document with.',
        },
      },
      required: ['newContent'],
    },
  },
  {
    name: 'insertAtCursor',
    description: 'Insert text at the current cursor position.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        textToInsert: {
          type: Type.STRING,
          description: 'The text to be inserted at the cursor.',
        },
      },
      required: ['textToInsert'],
    },
  },
  {
    name: 'replaceSelection',
    description: 'Replace the currently selected text with new text.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        replacementText: {
          type: Type.STRING,
          description: 'The text to replace the current selection with.',
        },
      },
      required: ['replacementText'],
    },
  },
];

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: textModel,
    config: {
      systemInstruction: `You are Monarch, an expert AI assistant integrated into a markdown editor. Your goal is to help users write, edit, and brainstorm.
- Be concise and helpful.
- When asked to write or generate content, respond in well-formatted markdown.
- You can use the available tools to interact with the document. For example, to rephrase a selection, first call 'getSelection', then provide the rephrased text.
- Do not describe your actions unless asked. For example, if you use a tool, don't say "I have used the tool to...". Just provide the final result.
- If a user asks for something you can't do, explain why and suggest alternatives.`,
      tools: [{ functionDeclarations: toolDeclarations }],
    },
  });
};

const TONE_PROMPTS: Record<Tone, string> = {
  Improve: 'improve it for clarity, conciseness, and grammar',
  Formal: 'make it more formal and professional',
  Informal: 'make it more casual and friendly',
  Professional: 'make it suitable for a professional business context',
  Witty: 'add a touch of wit and humor',
  Concise: 'make it more concise and to the point',
  Expanded: 'expand on the ideas and add more detail',
};

/**
 * Sends markdown text to Gemini to be rewritten with a specific tone.
 * @param markdownText The markdown text to rewrite.
 * @param tone The tone to apply.
 * @returns The rewritten markdown text.
 */
export const rewriteText = async (markdownText: string, tone: Tone): Promise<string> => {
  const instruction = TONE_PROMPTS[tone];
  const prompt = `You are an expert editor. Please review the following markdown text and ${instruction}. Maintain the original markdown formatting. Respond only with the rewritten markdown text, without any additional commentary. Here is the text:\n\n---\n\n${markdownText}`;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
    });
    const text = response.text;
    if (!text) {
      throw new Error('No text response from API.');
    }
    return text.trim();
  } catch (error) {
    console.error('Error rewriting text with Gemini:', error);
    // Re-throw a more specific error for the UI to handle.
    throw new Error('Failed to communicate with the Gemini API.');
  }
};

/**
 * Corrects grammar and spelling in the given text using Gemini.
 * @param text The text to correct.
 * @returns The corrected text, maintaining markdown.
 */
export const fixGrammarAndSpelling = async (text: string): Promise<string> => {
  const prompt = `You are an expert editor. Please correct any grammar and spelling mistakes in the following text. Maintain the original markdown formatting. Respond only with the corrected text, without any additional commentary. Here is the text:\n\n---\n\n${text}`;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
    });
    const text = response.text;
    if (!text) {
      throw new Error('No text response from API.');
    }
    return text.trim();
  } catch (error) {
    console.error('Error fixing grammar with Gemini:', error);
    throw new Error('Failed to communicate with the Gemini API.');
  }
};

/**
 * Generates markdown content from a user prompt.
 * @param userPrompt The prompt to generate content from.
 * @returns The generated markdown text.
 */
export const generateFromPrompt = async (userPrompt: string): Promise<string> => {
  const prompt = `You are a creative writer and expert in markdown formatting. Write a piece of content based on the following prompt. Respond only with the generated markdown text, without any additional commentary. Prompt: ${userPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
    });
    const text = response.text;
    if (!text) {
      throw new Error('No text response from API.');
    }
    return text.trim();
  } catch (error) {
    console.error('Error generating from prompt with Gemini:', error);
    throw new Error('Failed to communicate with the Gemini API.');
  }
};

/**
 * Generates an image from a user prompt.
 * @param userPrompt The prompt to generate an image from.
 * @returns The base64 encoded image data.
 */
export const generateImageFromPrompt = async (userPrompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [{ text: userPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        return part.inlineData.data ?? null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    throw new Error('Failed to generate image from the Gemini API.');
  }
};

/**
 * Generates speech from text using the Gemini TTS model.
 * @param text The text to convert to speech.
 * @returns The base64 encoded audio data.
 */
export const generateSpeech = async (text: string): Promise<string> => {
  // A simple cleanup to remove markdown for better speech flow.
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'a code block') // Replace code blocks
    .replace(/`[^`]+`/g, 'a code snippet') // Replace inline code
    .replace(/#{1,6}\s/g, '') // Remove headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/!\[(.*?)\]\(.*?\)/g, 'An image of $1'); // Remove images, keep alt text

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data returned from API.');
    }
    return base64Audio;
  } catch (error) {
    console.error('Error generating speech with Gemini:', error);
    throw new Error('Failed to communicate with the Gemini TTS API.');
  }
};
