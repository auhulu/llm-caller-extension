import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { useState, useCallback } from 'react';
import type { LLMSettingsStateType } from '@extension/storage';

export const useLLMResponse = () => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const sendPrompt = useCallback(async (prompt: string, settings: LLMSettingsStateType) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const model = settings.model === 'custom' ? settings.customModel : settings.model;

      let result;

      if (settings.provider === 'openai') {
        const openai = createOpenAI({
          apiKey: settings.apiKey,
        });
        result = streamText({
          model: openai(model),
          messages: [{ role: 'user', content: prompt }],
        });
      } else if (settings.provider === 'anthropic') {
        const anthropic = createAnthropic({
          apiKey: settings.apiKey,
        });
        result = streamText({
          model: anthropic(model),
          messages: [{ role: 'user', content: prompt }],
        });
      } else if (settings.provider === 'google') {
        const google = createGoogleGenerativeAI({
          apiKey: settings.apiKey,
        });
        result = streamText({
          model: google(model),
          messages: [{ role: 'user', content: prompt }],
        });
      } else {
        throw new Error(`Unsupported provider: ${settings.provider}`);
      }

      // Stream the response
      for await (const delta of result.textStream) {
        setResponse(prev => prev + delta);
      }
    } catch (error) {
      console.error('LLM response error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    response,
    isLoading,
    error,
    sendPrompt,
  };
};
