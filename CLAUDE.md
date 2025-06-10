# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Functionality Overview

This extension enables users to interact with Large Language Models (LLMs) directly from any webpage via a side panel.

**Core User Workflow:**
1.  **Configuration (Popup):** The user sets their preferred LLM provider (OpenAI, Gemini, Anthropic), API key, and a custom prompt template in the extension's popup.
2.  **Execution (Context Menu):** The user selects text on a webpage and right-clicks to open a context menu.
3.  **Interaction (Side Panel):** Clicking the context menu item automatically opens the side panel. The extension sends the user's custom prompt combined with the selected text to the chosen LLM. The response is streamed into the side panel, where the user can continue the conversation.

## Common Development Commands

### Build and Development
- `pnpm dev` - Start development mode for Chrome (with HMR)
- `pnpm dev:firefox` - Start development mode for Firefox
- `pnpm build` - Production build for Chrome
- `pnpm build:firefox` - Production build for Firefox
- `pnpm zip` - Create distributable Chrome extension zip
- `pnpm zip:firefox` - Create distributable Firefox extension zip

### Code Quality
- `pnpm lint` - Run ESLint across all packages
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

### Testing
- `pnpm e2e` - Run end-to-end tests for Chrome
- `pnpm e2e:firefox` - Run end-to-end tests for Firefox

### Maintenance
- `pnpm clean` - Clean all build artifacts and node_modules
- `pnpm update-version <version>` - Update version across all packages
- `pnpm module-manager` - Enable/disable extension modules

## Architecture Overview

This is a monorepo Chrome extension boilerplate using pnpm workspaces and Turborepo for build orchestration.

### Key Architectural Concepts

**Monorepo Structure:**
- `chrome-extension/` - Core extension manifest and background scripts. This is where the context menu logic and side panel orchestration reside.
- `pages/` - Individual extension pages (popup, options, content scripts, etc.)
- `packages/` - Shared utilities and libraries
- `tests/` - E2E testing infrastructure

**Build System:**
- Turborepo orchestrates builds across all packages with dependency management
- Vite provides fast development builds with custom HMR for extension development
- Each page/package has independent build configuration but shares common configs

**Extension Pages:**
Each page in `/pages/` represents a different Chrome extension entry point with a specific role in this project:

- **`popup/` - Settings Panel (React + Vite + Mantine)**
    - Serves as the main configuration UI for the user using Mantine UI components.
    - **LLM Provider Selection:** A dropdown to select between OpenAI, Gemini, and Anthropic.
    - **API Key Input:** An input field for the user's API key. The key is securely stored in `chrome.storage.local` using the `@extension/storage` package.
    - **Model Selection:** A dropdown list of major models for the selected provider (e.g., `gpt-4o`, `gemini-1.5-pro-latest`). It also includes a "Custom" option that allows the user to input a model name manually.
    - **Prompt Template:** A single textarea for the user to define their prompt. It must support a `{{selected_text}}` variable, which will be replaced by the highlighted text from the webpage.

- `options/` - Extension settings page (Not used for core functionality in this project).

- **`side-panel/` - Chat Interface (React + Vite + Mantine)**
    - The main interface for displaying LLM responses and continuing the conversation using Mantine UI components.
    - **Automatic Opening:** This panel is opened automatically via the background script when the context menu is used.
    - **Chat UI:** The chat interface is built using **Vercel's AI SDK** (`useChat` hook) to handle streaming responses and message history.
    - **Session-based History:** Chat history is maintained only while the side panel is open. It is cleared when the panel is closed.
    - **UI Components:** Includes buttons to copy a specific response and to clear the current conversation.
    - **Error Handling:** API or network errors are displayed inline within the chat interface.

- `content/`, `content-ui/`, `content-runtime/` - Content scripts (Not the primary focus for the core functionality).
- `devtools/` + `devtools-panel/` - DevTools extensions (Not used).

**Background Logic (`chrome-extension/`)**
- Creates and manages the context menu item, which is visible only when text is selected.
- Listens for context menu clicks, retrieves the selected text, and fetches the user's settings (API key, model, prompt) from `chrome.storage.local`.
- Programmatically opens the side panel using the `chrome.sidePanel` API.
- Passes the initial, formatted prompt to the side panel to initiate the LLM request.

**Shared Packages:**
Key shared packages in `/packages/`:
- `@extension/shared` - Common utilities, hooks, components, types
- `@extension/storage` - Helper for `chrome.storage.local` to manage API keys and user settings.
- `@extension/i18n` - Type-safe internationalization
- `@extension/ui` - Shared UI components with Mantine integration
- `@extension/vite-config` - Shared Vite build configuration
- `@extension/hmr` - Custom hot module replacement for extension development

### Development Workflow

**Environment Variables:**
- Environment setup handled by `bash-scripts/set_global_env.sh`
- CLI environment variables prefixed with `CLI_CEB_*`
- Global environment variables prefixed with `CEB_*`

### Development Notes

- On Windows, development requires WSL and running as administrator
- Hot module reload can freeze - restart with Ctrl+C and `pnpm dev`
- VS Code users should connect remotely to WSL for proper import resolution
- Extension loads in dist/ directory - no need to rebuild for simple changes during development
- E2E tests require zipped extension, so they run `pnpm zip` first

### Build Outputs

All builds output to `/dist/` directory with the following structure:
- `/dist/manifest.json` - Extension manifest
- `/dist/<page-name>/` - Individual page builds
- `/dist-zip/` - Packaged extension files for distribution