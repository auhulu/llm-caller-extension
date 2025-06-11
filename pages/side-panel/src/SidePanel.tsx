import '@src/SidePanel.css';
import { useLLMResponse } from './hooks/use-llm-response';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Alert, Container, ScrollArea, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { LLMSettingsStateType } from '@extension/storage';

const SidePanel = () => {
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [chatSettings, setChatSettings] = useState<LLMSettingsStateType | null>(null);
  const { response, error, sendPrompt } = useLLMResponse();

  useEffect(() => {
    const handleMessage = (
      message: { type: string; payload: { prompt: string; settings: LLMSettingsStateType } },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: { success: boolean }) => void,
    ) => {
      if (message.type === 'INIT_CHAT') {
        setInitialPrompt(message.payload.prompt);
        setChatSettings(message.payload.settings);
        sendResponse({ success: true }); // Acknowledge receipt
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    if (initialPrompt && chatSettings) {
      sendPrompt(initialPrompt, chatSettings);
      setInitialPrompt(''); // Clear after sending
    }
  }, [initialPrompt, chatSettings, sendPrompt]);
  if (!chatSettings || error) return <Alert color="red">error</Alert>;
  return (
    <Container p="md" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollArea flex={1}>
        {response && (
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {response}
          </Text>
        )}
      </ScrollArea>
    </Container>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
