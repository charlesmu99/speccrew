# {{platform_name}} Development Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines coding standards and conventions for development on the {{platform_name}} Electron application.

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
{{#each file_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}
| Main process files | `*.main.ts` | `window.main.ts`, `app.main.ts` |
| Preload scripts | `*.preload.ts` | `api.preload.ts`, `ipc.preload.ts` |
| Renderer components | `PascalCase.tsx` | `UserProfile.tsx`, `SettingsPanel.tsx` |
| IPC handlers | `*.ipc.ts` | `fileOperations.ipc.ts` |

### Variables & Functions

| Type | Pattern | Example |
|------|---------|---------|
{{#each naming_conventions}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}
| IPC channel names | `SCREAMING_SNAKE_CASE` | `IPC_GET_FILE_CONTENT` |
| IPC handlers | `camelCaseHandler` | `getFileContentHandler` |
| Window references | `camelCaseWindow` | `mainWindow`, `settingsWindow` |

### Classes & Types

| Type | Pattern | Example |
|------|---------|---------|
{{#each class_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}
| Window options | `PascalCaseOptions` | `MainWindowOptions` |
| IPC payloads | `PascalCasePayload` | `SaveFilePayload` |
| Store schema | `PascalCaseSchema` | `AppSettingsSchema` |

## Directory Structure

```
{{directory_structure}}
```

### Process Separation Guidelines

#### Main Process (`src/main/`)

- **Responsibilities:**
  - Application lifecycle management
  - Window creation and management
  - Native API access (filesystem, OS)
  - IPC handler registration
  - Menu and tray management

- **File Organization:**
  ```
  src/main/
  ├── index.ts              # Entry point
  ├── app.ts                # App lifecycle
  ├── window/
  │   ├── main.window.ts    # Main window
  │   └── manager.ts        # Window manager
  ├── ipc/
  │   ├── handlers/         # IPC handlers
  │   └── channels.ts       # Channel definitions
  └── menu/
      ├── app.menu.ts       # Application menu
      └── tray.menu.ts      # Tray menu
  ```

#### Preload Scripts (`src/preload/`)

- **Responsibilities:**
  - Expose secure APIs to renderer
  - Bridge between main and renderer
  - Input validation and sanitization

- **File Organization:**
  ```
  src/preload/
  ├── index.ts              # Main preload entry
  ├── api/
  │   ├── file.api.ts       # File operations API
  │   ├── window.api.ts     # Window control API
  │   └── system.api.ts     # System info API
  └── types.ts              # Exposed API types
  ```

#### Renderer Process (`src/renderer/`)

- **Responsibilities:**
  - UI components and pages
  - User interaction handling
  - Calling exposed preload APIs

- **File Organization:**
  ```
  src/renderer/
  ├── main.tsx              # Renderer entry
  ├── components/           # React/Vue components
  ├── pages/                # Page components
  ├── hooks/                # Custom hooks
  ├── stores/               # State management
  └── styles/               # CSS/styling
  ```

## Code Style

### Formatting Rules

{{#each formatting_rules}}
- **{{name}}**: {{value}}
{{/each}}

### ESLint Rules

{{#each eslint_rules}}
- `{{rule}}`: {{setting}} - {{description}}
{{/each}}

### Electron-Specific Rules

- Always use `contextIsolation: true` in `webPreferences`
- Never expose `ipcRenderer` directly; use contextBridge
- Validate all IPC inputs in preload or main process
- Use TypeScript for type-safe IPC communication

## Import Organization

### Import Order

```typescript
// 1. Electron imports
import { ipcMain, BrowserWindow } from 'electron';

// 2. Third-party imports
import React from 'react';

// 3. Internal absolute imports
import { IPC_CHANNELS } from '@/common/channels';

// 4. Internal relative imports
import { WindowManager } from './window/manager';
```

### Path Aliases

| Alias | Target | Usage |
|-------|--------|-------|
| `@/` | `src/` | Shared imports |
| `@main/` | `src/main/` | Main process imports |
| `@preload/` | `src/preload/` | Preload imports |
| `@renderer/` | `src/renderer/` | Renderer imports |
| `@common/` | `src/common/` | Common code imports |

## IPC Naming Conventions

### Channel Names

```typescript
// src/common/channels.ts
export const IPC_CHANNELS = {
  // File operations
  FILE: {
    READ: 'file:read',
    WRITE: 'file:write',
    DELETE: 'file:delete',
  },
  // Window operations
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
  },
  // App operations
  APP: {
    GET_VERSION: 'app:get-version',
    QUIT: 'app:quit',
  },
} as const;
```

### Naming Pattern

- Use **namespaced channels**: `domain:action`
- Use **camelCase** for handler functions
- Use **SCREAMING_SNAKE_CASE** for channel constants

## Git Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
{{#each commit_types}}
- `{{type}}`: {{description}}
{{/each}}
- `main`: Changes to main process
- `renderer`: Changes to renderer process
- `preload`: Changes to preload scripts
- `ipc`: Changes to IPC communication

### Branch Naming

{{branch_naming}}

### Scope Guidelines

| Scope | Description |
|-------|-------------|
| `main` | Main process changes |
| `renderer` | Renderer/UI changes |
| `preload` | Preload script changes |
| `ipc` | IPC communication changes |
| `build` | Build configuration changes |
| `deps` | Dependency updates |

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] Code follows style guidelines
- [ ] Process separation is correct (no main code in renderer)
- [ ] IPC channels follow naming conventions
- [ ] Security: contextIsolation enabled
- [ ] Security: No direct nodeIntegration
- [ ] Security: IPC inputs validated
- [ ] No console.log or debug code left
- [ ] Error handling is comprehensive
- [ ] Tests are included
- [ ] Documentation is updated

## Common Patterns

{{#each common_patterns}}
### {{name}}

{{description}}

```{{language}}
{{code_example}}
```

{{/each}}

## Electron-Specific Patterns

### IPC Handler Registration

```typescript
// src/main/ipc/handlers/file.handler.ts
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '@/common/channels';

ipcMain.handle(IPC_CHANNELS.FILE.READ, async (event, filePath: string) => {
  // Validate input
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path');
  }
  
  // Implementation
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### Preload API Exposure

```typescript
// src/preload/api/file.api.ts
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@/common/channels';

export const fileAPI = {
  readFile: (filePath: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE.READ, filePath),
  writeFile: (filePath: string, content: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE.WRITE, filePath, content),
};

contextBridge.exposeInMainWorld('fileAPI', fileAPI);
```

### Renderer API Usage

```typescript
// src/renderer/hooks/useFile.ts
export const useFile = () => {
  const readFile = async (filePath: string) => {
    // Type-safe access to exposed API
    const result = await window.fileAPI.readFile(filePath);
    return result;
  };
  
  return { readFile };
};
```
