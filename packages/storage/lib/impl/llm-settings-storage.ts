import { createStorage, StorageEnum } from '../base/index.js';
import type { LLMSettingsStateType, LLMSettingsStorageType } from '../base/index.js';

const storage = createStorage<LLMSettingsStateType>(
  'llm-settings-storage-key',
  {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
    customModel: '',
    promptTemplate: 'You are a helpful assistant. Please respond to the following text:\n\n{{selected_text}}',
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const llmSettingsStorage: LLMSettingsStorageType = {
  ...storage,
};
