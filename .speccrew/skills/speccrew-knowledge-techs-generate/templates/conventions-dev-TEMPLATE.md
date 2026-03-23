# {{platform_name}} Development Conventions

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

本开发规范文档面向 {{platform_name}} 平台，定义命名规范、目录结构、代码风格、导入导出模式、Git 提交规范与代码审查检查清单。

## 项目结构

### Directory Structure

```
{{directory_structure}}
```

```mermaid
graph TB
{{#each directory_components}}
{{id}}["{{name}}"]
{{/each}}
{{#each directory_relations}}
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

### Naming Conventions

#### Files

| Type | Pattern | Example |
|------|---------|---------|
{{#each file_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

#### Variables & Functions

| Type | Pattern | Example |
|------|---------|---------|
{{#each naming_conventions}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

#### Classes & Types

| Type | Pattern | Example |
|------|---------|---------|
{{#each class_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

**Section Source**
{{#each core_components_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## 架构总览

### Code Style Overview

```mermaid
graph TB
Style["Code Style"]
Style --> Formatting["Formatting Rules"]
Style --> Linting["Linting Rules"]
Style --> Imports["Import/Export Patterns"]
Formatting --> Config["Config Files"]
Linting --> Config
Imports --> Config
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

### Formatting Rules

{{#each formatting_rules}}
- **{{name}}**: {{value}}
{{/each}}

### Linting Rules

{{#each linting_rules}}
#### {{tool}}

| Rule | Setting | Description |
|------|---------|-------------|
{{#each rules}}
| `{{rule}}` | {{setting}} | {{description}} |
{{/each}}

{{/each}}

### Import/Export Patterns

{{import_export_patterns}}

### Common Patterns

{{#each common_patterns}}
#### {{name}}

{{description}}

```{{language}}
{{code_example}}
```

{{/each}}

**Section Source**
{{#each component_analysis_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## 依赖分析

### Module Dependencies

```mermaid
graph LR
{{#each modules}}
{{id}}["{{name}}"]
{{/each}}
{{#each module_relations}}
{{from}} --> {{to}}
{{/each}}
```

**Diagram Source**
{{#each dependency_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

### Import Rules

{{#each import_rules}}
- {{this}}
{{/each}}

**Section Source**
{{#each dependency_analysis_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## 性能考虑

### Code Performance Guidelines

{{#each performance_guidelines}}
#### {{category}}

{{description}}

**Guidelines:**
{{#each items}}
- {{this}}
{{/each}}

{{/each}}

[This section provides general guidance, no specific file reference required]

## 故障排查指南

### Common Development Issues

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

### Git Conventions

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
{{#each commit_types}}
- `{{type}}`: {{description}}
{{/each}}

#### Branch Naming

{{branch_naming}}

### Code Review Checklist

- [ ] Code follows naming conventions
- [ ] Code follows style guidelines
- [ ] No console.log or debug code left
- [ ] Error handling is comprehensive
- [ ] Tests are included
- [ ] Documentation is updated

**Section Source**
{{#each appendix_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}
