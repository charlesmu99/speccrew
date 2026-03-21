# {{platform_name}} Technology Index

> Platform: {{platform_id}}  
> Framework: {{framework}}  
> Language: {{language}}  
> Generated: {{generated_at}}

## Overview

This document provides technology guidelines for the {{platform_name}} platform.

| Attribute | Value |
|-----------|-------|
| Platform Type | {{platform_type}} |
| Primary Framework | {{framework}} |
| Language | {{language}} |
| Source Path | `{{source_path}}` |

## Quick Navigation

| Document | Purpose | For |
|----------|---------|-----|
| [tech-stack.md](tech-stack.md) | Frameworks, libraries, tools | All Agents |
| [architecture.md](architecture.md) | Architecture patterns | Designer Agent |
| [conventions-design.md](conventions-design.md) | Design principles | Designer Agent |
| [conventions-dev.md](conventions-dev.md) | Coding standards | Dev Agent |
| [conventions-test.md](conventions-test.md) | Testing requirements | Test Agent |
| [conventions-data.md](conventions-data.md) | Data layer conventions | Designer/Dev Agent |

## Technology Stack Summary

{{tech_stack_summary}}

## Key Conventions

### Design
- See [conventions-design.md](conventions-design.md) for design patterns

### Development
- See [conventions-dev.md](conventions-dev.md) for coding standards

### Testing
- See [conventions-test.md](conventions-test.md) for testing requirements

## Configuration Files

{{#each config_files}}
- [{{name}}]({{path}})
{{/each}}

## Related Documentation

- [Root Technology Index](../../INDEX.md)
