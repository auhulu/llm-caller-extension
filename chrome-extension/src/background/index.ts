import 'webextension-polyfill';
import { llmSettingsStorage } from '@extension/storage';

// Context menu creation
const createContextMenu = () => {
  chrome.contextMenus.create({
    id: 'llm-chat',
    title: 'Call LLM',
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
      // Open side panel first to preserve user gesture
      await chrome.sidePanel.open({ tabId: tab.id });

      // Get user settings after opening panel
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

      // Send initial prompt to side panel with retry logic
      const sendInitMessage = () => {
        console.log('Sending INIT_CHAT message to side panel');
        chrome.runtime
          .sendMessage({
            type: 'INIT_CHAT',
            payload: {
              prompt: formattedPrompt,
              settings: settings,
            },
          })
          .then(response => {
            console.log('Side panel responded:', response);
          })
          .catch(error => {
            console.log('Failed to send message, retrying...', error);
            // Retry after a short delay if side panel isn't ready
            setTimeout(sendInitMessage, 100);
          });
      };

      // Small delay to ensure side panel is loaded
      setTimeout(sendInitMessage, 200);
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
