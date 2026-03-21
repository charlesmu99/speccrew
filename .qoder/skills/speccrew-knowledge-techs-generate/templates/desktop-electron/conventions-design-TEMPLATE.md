# {{platform_name}} Design Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document provides design principles and patterns for detailed design work on the {{platform_name}} Electron application.

## Design Principles

{{#each design_principles}}
### {{name}}

{{description}}

{{#if examples}}
**Examples:**
{{#each examples}}
- {{this}}
{{/each}}
{{/if}}

{{/each}}

## Window Management Design

### Window Types and Purposes

{{#if window_types}}
| Window Type | Purpose | Characteristics |
|-------------|---------|-----------------|
{{#each window_types}}
| {{type}} | {{purpose}} | {{characteristics}} |
{{/each}}
{{/if}}

### Window State Management

{{window_state_management}}

### Multi-Window Patterns

{{multi_window_patterns}}

## IPC Protocol Design

### Channel Naming Conventions

{{ipc_naming_conventions}}

### Request-Response Pattern

```typescript
// Renderer → Main (Invoke/Handle)
// Channel: {{example_invoke_channel}}
interface Request {
  {{request_fields}}
}

interface Response {
  {{response_fields}}
}
```

### Event-Based Pattern

```typescript
// Main → Renderer (Send/On)
// Channel: {{example_event_channel}}
interface EventPayload {
  {{event_fields}}
}
```

### IPC Security Design

{{ipc_security_design}}

## State Management Across Processes

### State Architecture

{{state_architecture}}

### State Synchronization Patterns

{{state_sync_patterns}}

### Persistent State

{{persistent_state_design}}

## Menu and Tray Design

### Application Menu Structure

{{menu_structure}}

### Context Menu Design

{{context_menu_design}}

### System Tray Design

{{tray_design}}

## Component Design Patterns

{{component_design_patterns}}

## Data Flow Design

{{data_flow_design}}

## Error Handling Design

{{error_handling_design}}

## Security Design

{{security_design}}

## Performance Design

{{performance_design}}

## Electron-Specific Design Principles

### Process Separation Guidelines

{{process_separation_guidelines}}

### Native API Integration Design

{{native_api_design}}

### Auto-Update Design

{{auto_update_design}}

## Design Checklist

Before finalizing design, verify:

{{#each design_checklist}}
- [ ] {{item}}
{{/each}}

## Common Design Scenarios

{{#each common_scenarios}}
### {{name}}

{{description}}

**Recommended Approach:**
{{approach}}

{{/each}}
