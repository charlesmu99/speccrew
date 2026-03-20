# {{platform_name}} Development Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines coding standards and conventions for development on the {{platform_name}} platform.

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
{{#each file_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

### Variables & Functions

| Type | Pattern | Example |
|------|---------|---------|
{{#each naming_conventions}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

### Classes & Types

| Type | Pattern | Example |
|------|---------|---------|
{{#each class_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

## Directory Structure

```
{{directory_structure}}
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

### Import/Export Patterns

{{import_export_patterns}}

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

### Branch Naming

{{branch_naming}}

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] Code follows style guidelines
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
