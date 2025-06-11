import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { llmSettingsStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Container, Select, TextInput, Textarea, Button, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

const providers = ['openai', 'google', 'anthropic'] as const;
const llmProviders = providers.map(provider => ({ value: provider, label: provider }));

const models = [
  { openai: ['o3', 'gpt-4o', 'gpt-4o-mini'] },
  {
    google: [
      'gemini-2.5-pro-preview-06-05',
      'gemini-2.5-flash-preview-05-20',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ],
  },
  { anthropic: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514'] },
] as const;
const modelsByProvider = models.reduce(
  (acc, providerObj) => {
    const [[provider, modelList]] = Object.entries(providerObj);
    return {
      ...acc,
      [provider]: [
        ...modelList.map((model: string) => ({ value: model, label: model })),
        { value: 'custom', label: 'custom' },
      ],
    };
  },
  {} as Record<string, { value: string; label: string }[]>,
);

const Popup = () => {
  const llmSettings = useStorage(llmSettingsStorage);

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

  const handleSave = (values: typeof form.values) => llmSettingsStorage.set(values);

  const currentModels = modelsByProvider[form.values.provider as keyof typeof modelsByProvider] || [];

  return (
    <Container size="sm" p="md" style={{ width: '400px', minHeight: '500px' }}>
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
          <Button type="submit">Save Settings</Button>
        </Group>
      </form>
    </Container>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
