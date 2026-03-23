# {{platform_name}} Design Conventions

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

本设计规范文档面向 {{platform_name}} 平台，定义设计原则、组件/模块设计模式、数据流设计、接口设计、状态设计、错误处理设计、安全设计与性能设计。

## 项目结构

设计文档组织结构：

```
{{design_structure}}
```

**Section Source**
{{#each project_structure_sources}}
- [{{name}}](file://{{path}}#L{{start}}-L{{end}})
{{/each}}

## 核心组件

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

## 架构总览

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

## 详细组件分析

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

## 依赖分析

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

## 性能考虑

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

## 故障排查指南

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

## 结论

{{conclusion}}

[This section is a summary, no specific file reference required]

## 附录

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
