import { useState, useCallback } from 'react';
import type { LLMSettingsStateType } from '@extension/storage';

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
        // Use OpenAI API directly for now
        const model = settings.model === 'custom' ? settings.customModel : settings.model;

        let apiUrl = '';
        let requestBody: Record<string, unknown> = {};

        if (settings.provider === 'openai') {
          apiUrl = 'https://api.openai.com/v1/chat/completions';
          requestBody = {
            model: model,
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            stream: false,
          };
        } else if (settings.provider === 'anthropic') {
          apiUrl = 'https://api.anthropic.com/v1/messages';
          requestBody = {
            model: model,
            max_tokens: 4096,
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          };
        } else if (settings.provider === 'google') {
          apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
          requestBody = {
            contents: [...messages, userMessage].map(msg => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            })),
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
          };
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (settings.provider === 'openai') {
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
        } else if (settings.provider === 'anthropic') {
          headers['Authorization'] = `Bearer ${settings.apiKey}`;
          headers['anthropic-version'] = '2023-06-01';
        } else if (settings.provider === 'google') {
          // Google uses API key as query parameter, update URL
          apiUrl += `?key=${settings.apiKey}`;
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        let assistantContent = '';
        if (settings.provider === 'openai') {
          assistantContent = data.choices?.[0]?.message?.content || 'No response received';
        } else if (settings.provider === 'anthropic') {
          assistantContent = data.content?.[0]?.text || 'No response received';
        } else if (settings.provider === 'google') {
          assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMessage]);
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
