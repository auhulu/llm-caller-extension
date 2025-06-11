import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { useState, useCallback } from 'react';
import type { LLMSettingsStateType } from '@extension/storage';
import type { CoreMessage } from 'ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useLLMChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const sendMessage = useCallback(
    async (content: string, settings: LLMSettingsStateType) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError('');

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMessage]);

      try {
        const model = settings.model === 'custom' ? settings.customModel : settings.model;

        // Convert messages to CoreMessage format
        const coreMessages: CoreMessage[] = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        let result;

        if (settings.provider === 'openai') {
          const openai = createOpenAI({
            apiKey: settings.apiKey,
          });
          result = streamText({
            model: openai(model),
            messages: coreMessages,
          });
        } else if (settings.provider === 'anthropic') {
          const anthropic = createAnthropic({
            apiKey: settings.apiKey,
          });
          result = streamText({
            model: anthropic(model),
            messages: coreMessages,
          });
        } else if (settings.provider === 'google') {
          const google = createGoogleGenerativeAI({
            apiKey: settings.apiKey,
          });
          result = streamText({
            model: google(model),
            messages: coreMessages,
          });
        } else {
          throw new Error(`Unsupported provider: ${settings.provider}`);
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Stream the response
        for await (const delta of result.textStream) {
          setMessages(prev =>
            prev.map(msg => (msg.id === assistantMessage.id ? { ...msg, content: msg.content + delta } : msg)),
          );
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setError(errorMessage);

        // Remove the user message if there was an error
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError('');
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};
