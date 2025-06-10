# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `chrome-extension/` - Core extension manifest and background scripts
- `pages/` - Individual extension pages (popup, options, content scripts, etc.)
- `packages/` - Shared utilities and libraries
- `tests/` - E2E testing infrastructure

**Build System:**
- Turborepo orchestrates builds across all packages with dependency management
- Vite provides fast development builds with custom HMR for extension development
- Each page/package has independent build configuration but shares common configs

**Extension Pages:**
Each page in `/pages/` represents a different Chrome extension entry point:
- `popup/` - Toolbar popup (React + Vite)
- `options/` - Extension settings page
- `new-tab/` - Custom new tab replacement
- `side-panel/` - Chrome 114+ side panel
- `content/` - Basic content scripts
- `content-ui/` - React components injected into web pages  
- `content-runtime/` - Runtime-injected content scripts
- `devtools/` + `devtools-panel/` - DevTools extensions

**Shared Packages:**
Key shared packages in `/packages/`:
- `@extension/shared` - Common utilities, hooks, components, types
- `@extension/storage` - Chrome storage API helpers
- `@extension/i18n` - Type-safe internationalization
- `@extension/ui` - Shared UI components with Tailwind integration
- `@extension/vite-config` - Shared Vite build configuration
- `@extension/hmr` - Custom hot module replacement for extension development

### Development Workflow

**Environment Variables:**
- Environment setup handled by `bash-scripts/set_global_env.sh`
- CLI environment variables prefixed with `CLI_CEB_*`
- Global environment variables prefixed with `CEB_*`

**Cross-Browser Support:**
- Chrome/Firefox builds use same codebase with browser-specific configurations
- Firefox builds require temporary loading on each browser restart

**Module Management:**
- Use `pnpm module-manager` to enable/disable extension features
- Modular architecture allows selective inclusion of functionality

### Package Dependencies

All packages use `workspace:*` references for internal dependencies to ensure version consistency. When adding dependencies:

**Root level:** `pnpm i <package> -w` 
**Specific package:** `pnpm i <package> -F <package-name>`

Package names follow `@extension/<name>` convention (can omit `@extension/` prefix in pnpm commands).

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