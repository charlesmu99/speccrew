# {{platform_name}} Architecture Conventions

<cite>
**Files Referenced in This Document**
{{#each source_files}}
- [{{name}}](file://{{path}})
{{/each}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}, devcrew-test-{{platform_id}}

## 目录 / Table of Contents

1. [引言 / Introduction](#引言)
2. [项目结构 / Project Structure](#项目结构)
3. [核心组件 / Core Components](#核心组件)
4. [架构总览 / Architecture Overview](#架构总览)
5. [详细组件分析 / Detailed Component Analysis](#详细组件分析)
6. [依赖分析 / Dependency Analysis](#依赖分析)
7. [性能考虑 / Performance Considerations](#性能考虑)
8. [故障排查指南 / Troubleshooting Guide](#故障排查指南)
9. [结论 / Conclusion](#结论)
10. [附录 / Appendix](#附录)

## 引言

本架构规范文档面向 {{platform_name}} 平台，定义分层架构设计、模块组织方式、组件交互模式、错误处理策略、安全考量与性能指导原则。

## 项目结构

{{platform_name}} 采用以下目录结构：

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

## 核心组件

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

## 架构总览

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

## 详细组件分析

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

## 依赖分析

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

## 性能考虑

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

## 故障排查指南

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

## 结论

{{conclusion}}

[This section is a summary, no specific file reference required]

## 附录

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
