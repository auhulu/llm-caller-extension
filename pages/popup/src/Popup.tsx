import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { llmSettingsStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Container, Title, Select, TextInput, Textarea, Button, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

const llmProviders = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'google', label: 'Google Gemini' },
  { value: 'anthropic', label: 'Anthropic Claude' },
];

const modelsByProvider = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'custom', label: 'Custom' },
  ],
  google: [
    { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro Latest' },
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash Latest' },
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'custom', label: 'Custom' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'custom', label: 'Custom' },
  ],
};

const Popup = () => {
  const llmSettings = useStorage(llmSettingsStorage);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      provider: llmSettings.provider,
      apiKey: llmSettings.apiKey,
      model: llmSettings.model,
      customModel: llmSettings.customModel,
      promptTemplate: llmSettings.promptTemplate,
    },
    validate: {
      apiKey: value => (value.trim().length === 0 ? 'API Key is required' : null),
      promptTemplate: value => {
        if (value.trim().length === 0) return 'Prompt template is required';
        if (!value.includes('{{selected_text}}')) return 'Prompt template must include {{selected_text}} variable';
        return null;
      },
    },
  });

  const handleSave = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      await llmSettingsStorage.set(values);
      notifications.show({
        title: 'Success',
        message: 'Settings saved successfully!',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to save settings',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentModels = modelsByProvider[form.values.provider as keyof typeof modelsByProvider] || [];

  return (
    <Container size="sm" p="md" style={{ width: '400px', minHeight: '500px' }}>
      <Title order={2} mb="lg">
        LLM Extension Settings
      </Title>

      <form onSubmit={form.onSubmit(handleSave)}>
        <Select
          label="LLM Provider"
          placeholder="Select provider"
          data={llmProviders}
          {...form.getInputProps('provider')}
          mb="md"
        />

        <TextInput
          label="API Key"
          placeholder="Enter your API key"
          type="password"
          {...form.getInputProps('apiKey')}
          mb="md"
        />

        <Select
          label="Model"
          placeholder="Select model"
          data={currentModels}
          {...form.getInputProps('model')}
          mb="md"
        />

        {form.values.model === 'custom' && (
          <TextInput
            label="Custom Model Name"
            placeholder="Enter custom model name"
            {...form.getInputProps('customModel')}
            mb="md"
          />
        )}

        <Textarea
          label="Prompt Template"
          placeholder="Enter your prompt template. Use {{selected_text}} where you want the selected text to appear."
          rows={4}
          {...form.getInputProps('promptTemplate')}
          mb="md"
        />

        <Text size="sm" c="dimmed" mb="lg">
          The prompt template must include the variable <code>{'{{selected_text}}'}</code> which will be replaced with
          the text you select on web pages.
        </Text>

        <Group justify="flex-end">
          <Button type="submit" loading={isLoading}>
            Save Settings
          </Button>
        </Group>
      </form>
    </Container>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
