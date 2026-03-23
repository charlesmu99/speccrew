# Technology Knowledge Index

<cite>
**Files Referenced in This Document**
- [techs-manifest.json](file://{{manifest_path}})
</cite>

> **Target Audience**: devcrew-designer-*, devcrew-dev-*, devcrew-test-*

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

本技术知识索引面向项目所有平台，提供平台概览、文档导航与 Agent 使用指南。

> Generated at: {{generated_at}}
> Source: {{source_path}}
> Platforms: {{platform_count}}

## 项目结构

### Platform Overview

Summary table of all platforms:

| Platform | Type | Framework | Language | Documents |
|----------|------|-----------|----------|-----------|
{{#each platforms}}
| [{{name}}]({{platform_id}}/INDEX.md) | {{platform_type}} | {{framework}} {{version}} | {{language}} | [Stack]({{platform_id}}/tech-stack.md), [Arch]({{platform_id}}/architecture.md), [Design]({{platform_id}}/conventions-design.md), [Dev]({{platform_id}}/conventions-dev.md), [Test]({{platform_id}}/conventions-test.md) |
{{/each}}

### Directory Structure

```
techs/
├── INDEX.md                    # This file (root index)
{{#each platforms}}
├── {{platform_id}}/
│   ├── INDEX.md
│   ├── tech-stack.md
│   ├── architecture.md
│   ├── conventions-design.md
│   ├── conventions-dev.md
│   ├── conventions-test.md
│   └── conventions-data.md (optional)
{{/each}}
```

**Section Source**
- [techs-manifest.json](file://{{manifest_path}})

## 核心组件

### Technology Stacks

{{#each platforms}}
- [{{name}} - {{framework}}]({{platform_id}}/tech-stack.md)
{{/each}}

### Architecture Guidelines

{{#each platforms}}
- [{{name}}]({{platform_id}}/architecture.md)
{{/each}}

### Design Conventions

{{#each platforms}}
- [{{name}}]({{platform_id}}/conventions-design.md)
{{/each}}

### Development Conventions

{{#each platforms}}
- [{{name}}]({{platform_id}}/conventions-dev.md)
{{/each}}

### Testing Conventions

{{#each platforms}}
- [{{name}}]({{platform_id}}/conventions-test.md)
{{/each}}

[This section provides navigation, aggregated from platform documents]

## 架构总览

### Platform Architecture Map

```mermaid
graph TB
Root["Technology Knowledge Index"]
{{#each platforms}}
{{platform_id}}["{{name}}"]
Root --> {{platform_id}}
{{/each}}
```

**Diagram Source**
- [techs-manifest.json](file://{{manifest_path}})

**Section Source**
- [techs-manifest.json](file://{{manifest_path}})

## 详细组件分析

### Agent-to-Platform Mapping

This section maps dynamically generated Agents to their respective platform documentation.

{{#each platforms}}
#### {{name}} ({{platform_id}})

| Agent Role | Agent Name | Documentation Path |
|------------|------------|-------------------|
| Designer | devcrew-designer-{{platform_id}} | [knowledge/techs/{{platform_id}}/]({{platform_id}}/) |
| Developer | devcrew-dev-{{platform_id}} | [knowledge/techs/{{platform_id}}/]({{platform_id}}/) |
| Tester | devcrew-test-{{platform_id}} | [knowledge/techs/{{platform_id}}/]({{platform_id}}/) |

**Key Documents for {{name}} Agents:**
- Designer: [architecture.md]({{platform_id}}/architecture.md), [conventions-design.md]({{platform_id}}/conventions-design.md)
- Developer: [conventions-dev.md]({{platform_id}}/conventions-dev.md)
- Tester: [conventions-test.md]({{platform_id}}/conventions-test.md)

{{/each}}

**Section Source**
- [techs-manifest.json](file://{{manifest_path}})

## 依赖分析

### Cross-Platform Dependencies

{{cross_platform_dependencies}}

```mermaid
graph LR
{{#each platforms}}
{{platform_id}}["{{name}}"]
{{/each}}
{{#each platform_relations}}
{{from}} --> {{to}}
{{/each}}
```

**Diagram Source**
- [techs-manifest.json](file://{{manifest_path}})

**Section Source**
- [techs-manifest.json](file://{{manifest_path}})

## 性能考虑

### Platform Performance Characteristics

{{performance_considerations}}

[This section provides general guidance, no specific file reference required]

## 故障排查指南

### Common Issues

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

### Document Guide

#### INDEX.md (per platform)
Platform-specific overview and navigation.

#### tech-stack.md
Framework versions, dependencies, build tools, and configuration files.

#### architecture.md
Architecture patterns, layering, component organization, and design patterns.

#### conventions-design.md
Design principles, patterns, and guidelines for detailed design work.

#### conventions-dev.md
Naming conventions, code style, directory structure, and Git conventions.

#### conventions-test.md
Testing frameworks, coverage requirements, and testing patterns.

#### conventions-data.md
Data modeling, ORM usage, and database conventions (if applicable).

### Usage Guide

#### For Designer Agents
1. Read [architecture.md] for platform architecture patterns
2. Read [conventions-design.md] for design principles
3. Reference [tech-stack.md] for technology capabilities

#### For Developer Agents
1. Read [conventions-dev.md] for coding standards
2. Read [conventions-test.md] for testing requirements
3. Reference [architecture.md] when implementation details are unclear

#### For Tester Agents
1. Read [conventions-test.md] for testing standards
2. Reference [conventions-design.md] to understand design intent

**Section Source**
- [techs-manifest.json](file://{{manifest_path}})
