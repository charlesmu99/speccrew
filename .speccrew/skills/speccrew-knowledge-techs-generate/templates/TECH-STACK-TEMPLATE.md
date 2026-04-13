# {{platform_name}} Technology Stack

**Files Referenced in This Document**

{{#each source_files}}
- [{{name}}](file://{{path}})
{{/each}}

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

This technology stack document provides a systematic overview of framework versions, dependencies, build tools, and configuration files for the {{platform_name}} platform, helping developers understand the technology choices and architecture design rationale.

## Project Structure

{{platform_name}} is organized using the {{architecture_type}} architecture:

```
{{directory_structure}}
```

```mermaid
graph TB
{{#each modules}}
{{id}}["{{name}}"]
{{/each}}
{{#each module_relations}}
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

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
{{#each core_technologies}}
| {{category}} | {{name}} | {{version}} | {{purpose}} |
{{/each}}

**Section Source**
{{#each core_components_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Architecture Overview

{{architecture_overview}}

```mermaid
graph TB
subgraph "{{platform_name}}"
{{#each arch_components}}
{{id}}["{{name}}"]
{{/each}}
end
{{#each arch_relations}}
{{from}} --> {{to}}
{{/each}}
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

{{#each component_analysis}}
### {{name}}

{{description}}

**Key Features:**
{{#each features}}
- {{this}}
{{/each}}

**Section Source**
{{#each sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

{{/each}}

## Dependency Analysis

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
{{#each production_dependencies}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
{{#each development_dependencies}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

### Dependency Version Management

{{dependency_management_strategy}}

```mermaid
graph LR
{{#each dependency_layers}}
{{id}}["{{name}}"]
{{/each}}
{{#each dependency_relations}}
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

{{#each performance_considerations}}
### {{category}}

{{description}}

**Recommendations:**
{{#each recommendations}}
- {{this}}
{{/each}}

{{/each}}

[This section provides general guidance, no specific file reference required]

## Troubleshooting Guide

{{#each troubleshooting}}
### {{issue}}

**Symptoms:**
{{#each symptoms}}
- {{this}}
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

### Configuration Files

| File | Purpose |
|------|---------|
{{#each config_files}}
| [{{name}}]({{path}}) | {{purpose}} |
{{/each}}

### Package Scripts

| Script | Command | Purpose |
|--------|---------|---------|
{{#each package_scripts}}
| {{name}} | `{{command}}` | {{purpose}} |
{{/each}}

### Environment Requirements

{{environment_requirements}}

### Learning Resources

{{#each learning_resources}}
- **{{name}}**: {{url}}
{{/each}}

**Section Source**
{{#each appendix_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}
