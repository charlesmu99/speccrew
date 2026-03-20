# {{platform_name}} Testing Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines testing standards and conventions for the {{platform_name}} platform.

## Testing Framework

| Framework | Version | Purpose |
|-----------|---------|---------|
{{#each testing_frameworks}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

## Test File Organization

### File Naming

| Test Type | Naming Pattern | Example |
|-----------|---------------|---------|
{{#each test_file_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

### Directory Structure

{{test_directory_structure}}

## Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
{{#each coverage_requirements}}
| {{metric}} | {{minimum}} | {{target}} |
{{/each}}

## Unit Testing Patterns

{{unit_testing_patterns}}

## Integration Testing Patterns

{{integration_testing_patterns}}

## Mocking Strategies

{{mocking_strategies}}

## Test Data Management

{{test_data_management}}

## Testing Best Practices

{{#each testing_best_practices}}
- {{this}}
{{/each}}

## Common Test Scenarios

{{#each common_test_scenarios}}
### {{name}}

{{description}}

```{{language}}
{{test_example}}
```

{{/each}}

## Running Tests

{{#each test_commands}}
### {{name}}

```bash
{{command}}
```

{{description}}

{{/each}}
