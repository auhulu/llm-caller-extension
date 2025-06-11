import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { llmSettingsStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Container, Select, TextInput, Textarea, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

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

  useEffect(() => {
    const validationResult = form.validate();
    if (Object.keys(validationResult.errors).length === 0) {
      handleSave(form.values);
    }
  }, [form.values]);

  return (
    <Container size="sm" p="md" style={{ width: '400px', minHeight: '500px' }}>
      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack>
          <Select
            label="LLM Provider"
            placeholder="Select provider"
            data={llmProviders}
            {...form.getInputProps('provider')}
          />

          <TextInput
            label="API Key"
            placeholder="Enter your API key"
            type="password"
            {...form.getInputProps('apiKey')}
          />

          <Select label="Model" placeholder="Select model" data={currentModels} {...form.getInputProps('model')} />

          {form.values.model === 'custom' && (
            <TextInput
              label="Custom Model Name"
              placeholder="Enter custom model name"
              {...form.getInputProps('customModel')}
            />
          )}

          <Textarea
            label="Prompt Template"
            placeholder="Enter your prompt template. Use {{selected_text}} where you want the selected text to appear."
            rows={10}
            {...form.getInputProps('promptTemplate')}
          />
        </Stack>
      </form>
    </Container>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
