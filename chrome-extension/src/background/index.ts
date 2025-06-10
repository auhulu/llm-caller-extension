import 'webextension-polyfill';
import { llmSettingsStorage } from '@extension/storage';

// Context menu creation
const createContextMenu = () => {
  chrome.contextMenus.create({
    id: 'llm-chat',
    title: 'Chat with LLM',
    contexts: ['selection'],
  });
};

// Create context menu on extension startup
chrome.runtime.onStartup.addListener(createContextMenu);
chrome.runtime.onInstalled.addListener(createContextMenu);

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'llm-chat' && info.selectionText && tab?.id) {
    try {
      // Get user settings
      const settings = await llmSettingsStorage.get();

      // Validate settings
      if (!settings.apiKey.trim()) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon-34.png'),
          title: 'LLM Extension',
          message: 'Please configure your API key in the extension popup first.',
        });
        return;
      }

      // Format the prompt with selected text
      const formattedPrompt = settings.promptTemplate.replace('{{selected_text}}', info.selectionText);

      // Open side panel
      await chrome.sidePanel.open({ tabId: tab.id });

      // Send initial prompt to side panel
      chrome.runtime.sendMessage({
        type: 'INIT_CHAT',
        payload: {
          prompt: formattedPrompt,
          settings: settings,
        },
      });
    } catch (error) {
      console.error('Error handling context menu click:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon-34.png'),
        title: 'LLM Extension Error',
        message: 'Failed to initialize chat. Please try again.',
      });
    }
  }
});

console.log('Background script loaded');
