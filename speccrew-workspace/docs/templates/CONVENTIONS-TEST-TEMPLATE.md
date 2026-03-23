# {{platform_name}} Testing Conventions

<cite>
**Files Referenced in This Document**
{{#each source_files}}
- [{{name}}](file://{{path}})
{{/each}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}, devcrew-test-{{platform_id}}

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendix](#appendix)

## Introduction

This testing conventions document defines testing frameworks, test file organization, coverage requirements, unit testing patterns, integration testing patterns, mocking strategies, and test data management for the {{platform_name}} platform.

## Project Structure

### Test Directory Structure

```
{{test_directory_structure}}
```

```mermaid
graph TB
{{#each test_components}}
{{id}}["{{name}}"]
{{/each}}
{{#each test_relations}}
{{from}} --> {{to}}
{{/each}}
```

**Diagram Source**
{{#each structure_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

**Section Source**
{{#each project_structure_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Core Components

### Testing Framework

| Framework | Version | Purpose |
|-----------|---------|---------|
{{#each testing_frameworks}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

### Test File Naming

| Test Type | Naming Pattern | Example |
|-----------|---------------|---------|
{{#each test_file_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

**Section Source**
{{#each core_components_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Architecture Overview

### Testing Architecture

```mermaid
graph TB
subgraph "Test Types"
Unit["Unit Tests"]
Integration["Integration Tests"]
E2E["End-to-End Tests"]
end
subgraph "Test Infrastructure"
Framework["Testing Framework"]
Mocks["Mocks & Stubs"]
Fixtures["Test Fixtures"]
end
Unit --> Framework
Integration --> Framework
E2E --> Framework
Framework --> Mocks
Framework --> Fixtures
```

**Diagram Source**
{{#each architecture_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

**Section Source**
{{#each architecture_overview_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Detailed Component Analysis

### Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
{{#each coverage_requirements}}
| {{metric}} | {{minimum}} | {{target}} |
{{/each}}

### Unit Testing Patterns

{{unit_testing_patterns}}

```mermaid
flowchart TD
Arrange["Arrange: Setup test data"]
Act["Act: Execute the method"]
Assert["Assert: Verify results"]
Arrange --> Act --> Assert
```

**Diagram Source**
{{#each unit_test_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

### Integration Testing Patterns

{{integration_testing_patterns}}

### Mocking Strategies

{{mocking_strategies}}

### Test Data Management

{{test_data_management}}

**Section Source**
{{#each component_analysis_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Dependency Analysis

### Test Dependencies

```mermaid
graph LR
{{#each test_modules}}
{{id}}["{{name}}"]
{{/each}}
{{#each test_deps}}
{{from}} --> {{to}}
{{/each}}
```

**Diagram Source**
{{#each dependency_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

**Section Source**
{{#each dependency_analysis_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Performance Considerations

### Test Performance Guidelines

{{#each performance_guidelines}}
#### {{category}}

{{description}}

**Guidelines:**
{{#each items}}
- {{this}}
{{/each}}

{{/each}}

### Test Execution Optimization

{{test_execution_optimization}}

[This section provides general guidance, no specific file reference required]

## Troubleshooting Guide

### Common Test Issues

{{#each troubleshooting}}
#### {{issue}}

**Symptoms:**
{{#each symptoms}}
- {{this}}
{{/each}}

**Diagnostic Steps:**
{{#each steps}}
{{number}}. {{action}}
{{/each}}

**Solutions:**
{{#each solutions}}
- {{this}}
{{/each}}

{{/each}}

**Section Source**
{{#each troubleshooting_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Conclusion

{{conclusion}}

[This section is a summary, no specific file reference required]

## Appendix

### Testing Best Practices

{{#each testing_best_practices}}
- {{this}}
{{/each}}

### Common Test Scenarios

{{#each common_test_scenarios}}
#### {{name}}

{{description}}

```{{language}}
{{test_example}}
```

{{/each}}

### Running Tests

{{#each test_commands}}
#### {{name}}

```bash
{{command}}
```

{{description}}

{{/each}}

**Section Source**
{{#each appendix_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}
