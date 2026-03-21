# {{platform_name}} Architecture Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines the architecture patterns and conventions for the {{platform_name}} platform.

## Architecture Patterns

{{architecture_overview}}

## Layer Organization

{{#if layers}}
| Layer | Responsibility | Key Components |
|-------|---------------|----------------|
{{#each layers}}
| {{name}} | {{responsibility}} | {{components}} |
{{/each}}
{{/if}}

## Component/Module Structure

{{component_structure}}

## State Management

{{state_management}}

## Communication Patterns

{{communication_patterns}}

## Error Handling

{{error_handling}}

## Security Considerations

{{security_considerations}}

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
