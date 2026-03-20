# Technology Knowledge Index

> Generated at: {{generated_at}}  
> Source: {{source_path}}  
> Platforms: {{platform_count}}

## Platform Overview

| Platform | Type | Framework | Language | Documents |
|----------|------|-----------|----------|-----------|
{{#each platforms}}
| [{{name}}]({{platform_id}}/INDEX.md) | {{platform_type}} | {{framework}} {{version}} | {{language}} | [Stack]({{platform_id}}/tech-stack.md), [Arch]({{platform_id}}/architecture.md), [Design]({{platform_id}}/conventions-design.md), [Dev]({{platform_id}}/conventions-dev.md), [Test]({{platform_id}}/conventions-test.md) |
{{/each}}

## Quick Reference

### Technology Stacks
{{#each platforms}}
- [{{name}} - {{framework}}]({{platform_id}}/tech-stack.md)
{{/each}}

### Architecture Guidelines
{{#each platforms}}
- [{{name}}]({{platform_id}}/architecture.md)
{{/each}}

### Design Conventions
{{#each platforms}}
- [{{name}}]({{platform_id}}/conventions-design.md)
{{/each}}

### Development Conventions
{{#each platforms}}
- [{{name}}]({{platform_id}}/conventions-dev.md)
{{/each}}

### Testing Conventions
{{#each platforms}}
- [{{name}}]({{platform_id}}/conventions-test.md)
{{/each}}

## Agent-to-Platform Mapping

This section maps dynamically generated Agents to their respective platform documentation.

{{#each platforms}}
### {{name}} ({{platform_id}})

| Agent Role | Agent Name | Documentation Path |
|------------|------------|-------------------|
| Designer | devcrew-designer-{{platform_id}} | [knowledge/techs/{{platform_id}}/]({{platform_id}}/) |
| Developer | devcrew-dev-{{platform_id}} | [knowledge/techs/{{platform_id}}/]({{platform_id}}/) |
| Tester | devcrew-test-{{platform_id}} | [knowledge/techs/{{platform_id}}/]({{platform_id}}/) |

**Key Documents for {{name}} Agents:**
- Designer: [architecture.md]({{platform_id}}/architecture.md), [conventions-design.md]({{platform_id}}/conventions-design.md)
- Developer: [conventions-dev.md]({{platform_id}}/conventions-dev.md)
- Tester: [conventions-test.md]({{platform_id}}/conventions-test.md)

{{/each}}

## Document Guide

### INDEX.md (per platform)
Platform-specific overview and navigation.

### tech-stack.md
Framework versions, dependencies, build tools, and configuration files.

### architecture.md
Architecture patterns, layering, component organization, and design patterns.

### conventions-design.md
Design principles, patterns, and guidelines for detailed design work.

### conventions-dev.md
Naming conventions, code style, directory structure, and Git conventions.

### conventions-test.md
Testing frameworks, coverage requirements, and testing patterns.

### conventions-data.md
Data modeling, ORM usage, and database conventions (if applicable).

## Usage Guide

### For Designer Agents
1. Read [architecture.md] for platform architecture patterns
2. Read [conventions-design.md] for design principles
3. Reference [tech-stack.md] for technology capabilities

### For Developer Agents
1. Read [conventions-dev.md] for coding standards
2. Read [conventions-test.md] for testing requirements
3. Reference [architecture.md] when implementation details are unclear

### For Tester Agents
1. Read [conventions-test.md] for testing standards
2. Reference [conventions-design.md] to understand design intent
