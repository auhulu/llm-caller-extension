import '@src/SidePanel.css';
import { useLLMChat } from './hooks/use-llm-chat';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import {
  Container,
  Title,
  ScrollArea,
  TextInput,
  Button,
  Group,
  Paper,
  Text,
  ActionIcon,
  Stack,
  Alert,
} from '@mantine/core';
import { IconSend, IconCopy, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { LLMSettingsStateType } from '@extension/storage';

const SidePanel = () => {
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [chatSettings, setChatSettings] = useState<LLMSettingsStateType | null>(null);
  const [input, setInput] = useState<string>('');

  const { messages, isLoading, error, sendMessage, clearMessages } = useLLMChat();

  // Handle messages from background script
  useEffect(() => {
    const handleMessage = (
      message: { type: string; payload: { prompt: string; settings: LLMSettingsStateType } },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: { success: boolean }) => void,
    ) => {
      console.log('Side panel received message:', message);
      if (message.type === 'INIT_CHAT') {
        setInitialPrompt(message.payload.prompt);
        setChatSettings(message.payload.settings);
        sendResponse({ success: true }); // Acknowledge receipt
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Send initial prompt when received
  useEffect(() => {
    if (initialPrompt && chatSettings && messages.length === 0) {
      sendMessage(initialPrompt, chatSettings);
      setInitialPrompt(''); // Clear after sending
    }
  }, [initialPrompt, chatSettings, messages.length, sendMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSettings || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message, chatSettings);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const clearChat = () => {
    clearMessages();
  };

  if (!chatSettings) {
    return (
      <Container p="md" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text>Waiting for chat initialization...</Text>
      </Container>
    );
  }

  return (
    <Container p="md" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" mb="md">
        <Title order={3}>LLM Chat</Title>
        <ActionIcon onClick={clearChat} variant="subtle" color="red">
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <ScrollArea flex={1} mb="md">
        <Stack gap="md">
          {messages.map(message => (
            <Paper key={message.id} p="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm" c={message.role === 'user' ? 'blue' : 'green'}>
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </Text>
                {message.role === 'assistant' && (
                  <ActionIcon size="sm" variant="subtle" onClick={() => copyToClipboard(message.content)}>
                    <IconCopy size={12} />
                  </ActionIcon>
                )}
              </Group>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Text>
            </Paper>
          ))}
          {isLoading && (
            <Paper p="md" withBorder>
              <Text size="sm" c="dimmed">
                Assistant is typing...
              </Text>
            </Paper>
          )}
        </Stack>
      </ScrollArea>

      <form onSubmit={handleSubmit}>
        <Group gap="xs">
          <TextInput
            flex={1}
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} leftSection={<IconSend size={16} />}>
            Send
          </Button>
        </Group>
      </form>
    </Container>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
