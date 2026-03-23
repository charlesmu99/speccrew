# {{platform_name}} Design Conventions

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

This design conventions document defines design principles, component/module design patterns, data flow design, interface design, state design, error handling design, security design, and performance design for the {{platform_name}} platform.

## Project Structure

Design document organization structure:

```
{{design_structure}}
```

**Section Source**
{{#each project_structure_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Core Components

### Design Principles

{{#each design_principles}}
#### {{name}}

{{description}}

**Examples:**
{{#each examples}}
- {{this}}
{{/each}}

{{/each}}

**Section Source**
{{#each core_components_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Architecture Overview

### Design Pattern Overview

```mermaid
graph TB
{{#each design_patterns}}
{{id}}["{{name}}"]
{{/each}}
{{#each pattern_relations}}
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

### Component/Module Design Patterns

{{component_design_patterns}}

### Data Flow Design

{{data_flow_design}}

```mermaid
flowchart TD
{{#each data_flow_steps}}
{{id}}["{{action}}"]
{{/each}}
{{#each data_flow_relations}}
{{from}} --> {{to}}
{{/each}}
```

**Diagram Source**
{{#each data_flow_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

### Interface Design

{{interface_design}}

### State Design

{{state_design}}

{{#if has_state_diagram}}
```mermaid
stateDiagram-v2
{{state_diagram_content}}
```

**Diagram Source**
{{#each state_diagram_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}
{{/if}}

### Error Handling Design

{{error_handling_design}}

### Security Design

{{security_design}}

### Performance Design

{{performance_design}}

**Section Source**
{{#each component_analysis_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## Dependency Analysis

### Design Dependencies

{{design_dependencies}}

```mermaid
graph LR
{{#each design_modules}}
{{id}}["{{name}}"]
{{/each}}
{{#each design_deps}}
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

### Performance Design Guidelines

{{#each performance_guidelines}}
#### {{category}}

{{description}}

**Guidelines:**
{{#each items}}
- {{this}}
{{/each}}

{{/each}}

[This section provides general guidance, no specific file reference required]

## Troubleshooting Guide

### Common Design Issues

{{#each troubleshooting}}
#### {{issue}}

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

### Design Checklist

Before finalizing design, verify:

{{#each design_checklist}}
- [ ] {{item}}
{{/each}}

### Common Design Scenarios

{{#each common_scenarios}}
#### {{name}}

{{description}}

**Recommended Approach:**
{{approach}}

{{/each}}

**Section Source**
{{#each appendix_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}
