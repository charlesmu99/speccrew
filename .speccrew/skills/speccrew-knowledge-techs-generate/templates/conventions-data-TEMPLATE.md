# {{platform_name}} Data Conventions

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

本数据规范文档面向 {{platform_name}} 平台，定义 ORM/数据库工具、数据建模规范、迁移模式、查询优化与缓存策略。

## 项目结构

### Data Layer Structure

```
{{data_directory_structure}}
```

```mermaid
graph TB
{{#each data_components}}
{{id}}["{{name}}"]
{{/each}}
{{#each data_relations}}
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

### ORM/Database Tool

| Tool | Version | Purpose |
|------|---------|---------|
{{#each orm_tools}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

### Data Modeling Conventions

{{data_modeling_conventions}}

**Section Source**
{{#each core_components_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## 架构总览

### Data Architecture

```mermaid
erDiagram
{{#each entities}}
{{name}} {
{{#each fields}}
{{type}} {{field_name}}
{{/each}}
}
{{/each}}
{{#each relationships}}
{{from}} ||--o{ {{to}} : "{{relation}}"
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

### Entity Design

{{entity_design}}

### Migration Patterns

{{migration_patterns}}

```mermaid
flowchart TD
Dev["Development"] --> CreateMigration["Create Migration"]
CreateMigration --> TestMigration["Test Migration"]
TestMigration --> ApplyMigration["Apply to Production"]
```

**Diagram Source**
{{#each migration_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

### Query Optimization

{{query_optimization}}

### Caching Strategies

{{caching_strategies}}

**Section Source**
{{#each component_analysis_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## 依赖分析

### Data Layer Dependencies

```mermaid
graph LR
{{#each data_modules}}
{{id}}["{{name}}"]
{{/each}}
{{#each data_deps}}
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

## 性能考虑

### Database Performance

{{#each performance_guidelines}}
#### {{category}}

{{description}}

**Guidelines:**
{{#each items}}
- {{this}}
{{/each}}

{{/each}}

### Indexing Strategy

{{indexing_strategy}}

[This section provides general guidance, no specific file reference required]

## 故障排查指南

### Common Data Issues

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

## 结论

{{conclusion}}

[This section is a summary, no specific file reference required]

## 附录

### Data Conventions Checklist

{{#each data_checklist}}
- [ ] {{item}}
{{/each}}

### Common Data Scenarios

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
