# {{platform_name}} Architecture Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines the architecture patterns and conventions for the {{platform_name}} Electron application.

## Process Architecture

### Main Process vs Renderer Process

Electron operates with a multi-process architecture:

| Process | Responsibility | Characteristics |
|---------|---------------|-----------------|
| **Main Process** | Application lifecycle, native APIs, window management | Single instance, Node.js environment, no DOM access |
| **Renderer Process** | UI rendering, user interactions | Multiple instances, Chromium environment, sandboxed |

### Process Communication Model

```
┌─────────────────┐     IPC      ┌─────────────────┐
│  Main Process   │ ◄──────────► │ Renderer Process│
│  (Node.js)      │              │  (Chromium)     │
├─────────────────┤              ├─────────────────┤
│ • App lifecycle │              │ • UI Components │
│ • File system   │              │ • User events   │
│ • Native APIs   │              │ • DOM manipulation│
│ • Window mgmt   │              │ • Preload bridge│
└─────────────────┘              └─────────────────┘
```

## Project Structure

```
{{project_structure}}
```

### Directory Conventions

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `src/main/` | Main process code | App initialization, window management, native APIs |
| `src/renderer/` | Renderer process code | UI components, pages, styles |
| `src/preload/` | Preload scripts | Secure bridge between main and renderer |
| `src/common/` | Shared code | Types, constants, utilities |
| `resources/` | Static assets | Icons, images, native binaries |
| `build/` | Build output | Compiled application |

## IPC Communication Patterns

### IPC Channels

{{#if ipc_channels}}
| Channel Name | Direction | Purpose | Payload Type |
|--------------|-----------|---------|--------------|
{{#each ipc_channels}}
| `{{name}}` | {{direction}} | {{purpose}} | {{payload_type}} |
{{/each}}
{{/if}}

### IPC Patterns

{{ipc_patterns}}

### Secure IPC Best Practices

{{#each ipc_best_practices}}
- {{this}}
{{/each}}

## Preload Scripts

### Purpose

Preload scripts act as a secure bridge between main and renderer processes:

{{preload_script_purpose}}

### Preload Script Structure

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Invoke methods (renderer → main)
  {{#each exposed_apis}}
  {{name}}: {{implementation}},
  {{/each}}
});
```

## Security Considerations

### Context Isolation

{{context_isolation_description}}

### Sandbox Mode

{{sandbox_description}}

### Security Checklist

{{#each security_checklist}}
- [ ] {{item}}
{{/each}}

## Window Management

### Window Types

{{window_management}}

### Window Lifecycle

{{window_lifecycle}}

## State Management

{{state_management}}

## Error Handling

{{error_handling}}

## Performance Guidelines

{{performance_guidelines}}

## Best Practices

{{#each best_practices}}
- {{this}}
{{/each}}

## Anti-Patterns to Avoid

{{#each anti_patterns}}
- {{this}}
{{/each}}
