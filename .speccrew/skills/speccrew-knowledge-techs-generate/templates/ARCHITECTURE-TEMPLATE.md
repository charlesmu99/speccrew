# {{platform_name}} Architecture Conventions

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

This architecture conventions document defines the layered architecture design, module organization, component interaction patterns, error handling strategies, security considerations, and performance guidelines for the {{platform_name}} platform.

## Project Structure

{{platform_name}} uses the following directory structure:

```
{{directory_structure}}
```

```mermaid
graph TB
{{#each structure_components}}
{{id}}["{{name}}"]
{{/each}}
{{#each structure_relations}}
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

### Layer Organization

| Layer | Responsibility | Key Components |
|-------|---------------|----------------|
{{#each layers}}
| {{name}} | {{responsibility}} | {{components}} |
{{/each}}

### Component Overview

{{component_overview}}

**Section Source**
{{#each core_components_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Architecture Overview

{{architecture_overview}}

```mermaid
graph TB
subgraph "{{platform_name}} Architecture"
{{#each arch_layers}}
subgraph "{{name}}"
{{#each components}}
{{id}}["{{label}}"]
{{/each}}
end
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

{{#if has_diagram}}
```mermaid
{{diagram_type}}
{{diagram_content}}
```

**Diagram Source**
{{#each diagram_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}
{{/if}}

**Section Source**
{{#each sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

{{/each}}

## Dependency Analysis

### Module Dependencies

```mermaid
graph LR
{{#each modules}}
{{id}}["{{name}}"]
{{/each}}
{{#each module_deps}}
{{from}} --> {{to}}
{{/each}}
```

**Diagram Source**
{{#each dependency_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

### Dependency Rules

{{#each dependency_rules}}
- **{{from}}** → **{{to}}**: {{rule}}
{{/each}}

**Section Source**
{{#each dependency_analysis_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Performance Considerations

### Performance Guidelines

{{#each performance_guidelines}}
#### {{category}}

{{description}}

**Best Practices:**
{{#each practices}}
- {{this}}
{{/each}}

{{/each}}

### Caching Strategy

{{caching_strategy}}

[This section provides general guidance, no specific file reference required]

## Troubleshooting Guide

{{#each troubleshooting}}
### {{issue}}

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

### Best Practices

{{#each best_practices}}
- {{this}}
{{/each}}

### Anti-Patterns to Avoid

{{#each anti_patterns}}
- {{this}}
{{/each}}

### Related Documentation

{{#each related_docs}}
- [{{name}}]({{path}})
{{/each}}

**Section Source**
{{#each appendix_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}
