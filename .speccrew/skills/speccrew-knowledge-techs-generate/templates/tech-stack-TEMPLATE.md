# {{platform_name}} Technology Stack

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

本技术栈文档面向 {{platform_name}} 平台，系统梳理框架版本、依赖库、构建工具、配置文件等，帮助开发者理解技术选型与架构设计思路。

## 项目结构

{{platform_name}} 采用 {{architecture_type}} 架构组织：

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

## 核心组件

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
{{#each core_technologies}}
| {{category}} | {{name}} | {{version}} | {{purpose}} |
{{/each}}

**Section Source**
{{#each core_components_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## 架构总览

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

## 详细组件分析

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

## 依赖分析

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

## 性能考虑

{{#each performance_considerations}}
### {{category}}

{{description}}

**Recommendations:**
{{#each recommendations}}
- {{this}}
{{/each}}

{{/each}}

[This section provides general guidance, no specific file reference required]

## 故障排查指南

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

## 结论

{{conclusion}}

[This section is a summary, no specific file reference required]

## 附录

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
