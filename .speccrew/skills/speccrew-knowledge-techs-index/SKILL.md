---
name: speccrew-knowledge-techs-index
description: Stage 3 of technology knowledge initialization - Generate root INDEX.md by aggregating all platform technology documents. Creates the master index that maps platforms to their documentation and provides Agent-to-Platform mapping guide. Used by Worker Agent after all platform documents are generated.
tools: Read, Write
---

# Stage 3: Generate Root Technology Index

Aggregate all platform technology documentation into a single root INDEX.md that serves as the master navigation hub for technology knowledge.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

## Trigger Scenarios

- "Generate techs root index"
- "Create technology knowledge index"
- "Aggregate platform tech docs"
- "Generate master tech index"

## User

Worker Agent (speccrew-task-worker)

## Input

- `manifest_path`: Path to techs-manifest.json
- `techs_base_path`: Base path for techs documentation (default: `knowledge/techs/`)
- `output_path`: Output path for root INDEX.md (default: `knowledge/techs/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

## Output

- `{output_path}/INDEX.md` - Root technology knowledge index

## Workflow

### Step 1: Read Manifest

Read `techs-manifest.json` to get the list of all platforms:

```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "source_path": "/project",
  "language": "zh",
  "platforms": [
    {
      "platform_id": "web-react",
      "platform_type": "web",
      "framework": "react",
      "language": "typescript"
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "language": "typescript"
    }
  ]
}
```

### Step 2: Verify Platform Documents

For each platform in manifest, verify that platform documents exist:

```
knowledge/techs/{platform_id}/
├── INDEX.md
├── tech-stack.md
├── architecture.md
├── conventions-design.md
├── conventions-dev.md
├── conventions-test.md
└── conventions-data.md (optional)
```

If a platform's INDEX.md is missing, note it in the report but continue.

### Step 3: Extract Platform Summaries

Read each platform's INDEX.md to extract:
- Platform name/type
- Framework and version
- Primary language
- Key technologies (brief)

### Step 4: Generate Root INDEX.md

Create the master index document with the following sections:

#### Section 1: Header

```markdown
# Technology Knowledge Index

> Generated at: {generated_at}
> Source: {source_path}
> Platforms: {platform_count}
```

#### Section 2: Platform Overview

Summary table of all platforms:

```markdown
## Platform Overview

| Platform | Type | Framework | Language | Documents |
|----------|------|-----------|----------|-----------|
| [Web Frontend](web-react/INDEX.md) | Web | React 18.2.0 | TypeScript | [Stack](web-react/tech-stack.md), [Arch](web-react/architecture.md), [Design](web-react/conventions-design.md), [Dev](web-react/conventions-dev.md), [Test](web-react/conventions-test.md) |
| [Backend API](backend-nestjs/INDEX.md) | Backend | NestJS 10.0.0 | TypeScript | [Stack](backend-nestjs/tech-stack.md), [Arch](backend-nestjs/architecture.md), [Design](backend-nestjs/conventions-design.md), [Dev](backend-nestjs/conventions-dev.md), [Test](backend-nestjs/conventions-test.md) |
```

#### Section 3: Quick Reference

Quick links organized by document type:

```markdown
## Quick Reference

### Technology Stacks
- [Web Frontend - React](web-react/tech-stack.md)
- [Backend API - NestJS](backend-nestjs/tech-stack.md)

### Architecture Guidelines
- [Web Frontend](web-react/architecture.md)
- [Backend API](backend-nestjs/architecture.md)

### Design Conventions
- [Web Frontend](web-react/conventions-design.md)
- [Backend API](backend-nestjs/conventions-design.md)

### Development Conventions
- [Web Frontend](web-react/conventions-dev.md)
- [Backend API](backend-nestjs/conventions-dev.md)

### Testing Conventions
- [Web Frontend](web-react/conventions-test.md)
- [Backend API](backend-nestjs/conventions-test.md)
```

#### Section 4: Agent-to-Platform Mapping

Critical section that defines how Agents map to platform documentation:

```markdown
## Agent-to-Platform Mapping

This section maps dynamically generated Agents to their respective platform documentation.

### Web Frontend (web-react)

| Agent Role | Agent Name | Documentation Path |
|------------|------------|-------------------|
| Designer | speccrew-designer-web-react | [knowledge/techs/web-react/](web-react/) |
| Developer | speccrew-dev-web-react | [knowledge/techs/web-react/](web-react/) |
| Tester | speccrew-test-web-react | [knowledge/techs/web-react/](web-react/) |

**Key Documents for Web Agents:**
- Designer: [architecture.md](web-react/architecture.md), [conventions-design.md](web-react/conventions-design.md)
- Developer: [conventions-dev.md](web-react/conventions-dev.md)
- Tester: [conventions-test.md](web-react/conventions-test.md)

### Backend API (backend-nestjs)

| Agent Role | Agent Name | Documentation Path |
|------------|------------|-------------------|
| Designer | speccrew-designer-backend-nestjs | [knowledge/techs/backend-nestjs/](backend-nestjs/) |
| Developer | speccrew-dev-backend-nestjs | [knowledge/techs/backend-nestjs/](backend-nestjs/) |
| Tester | speccrew-test-backend-nestjs | [knowledge/techs/backend-nestjs/](backend-nestjs/) |

**Key Documents for Backend Agents:**
- Designer: [architecture.md](backend-nestjs/architecture.md), [conventions-design.md](backend-nestjs/conventions-design.md)
- Developer: [conventions-dev.md](backend-nestjs/conventions-dev.md)
- Tester: [conventions-test.md](backend-nestjs/conventions-test.md)
```

#### Section 5: Document Guide

Explain what each document type contains:

```markdown
## Document Guide

### INDEX.md (per platform)
Platform-specific overview and navigation.

### tech-stack.md
Framework versions, dependencies, build tools, and configuration files.

### architecture.md
Architecture patterns, layering, component organization, and design patterns.

### conventions-design.md
Design principles, patterns, and guidelines for detailed design work.

### conventions-dev.md
Naming conventions, code style, directory structure, and Git conventions.

### conventions-test.md
Testing frameworks, coverage requirements, and testing patterns.

### conventions-data.md
Data modeling, ORM usage, and database conventions (if applicable).
```

#### Section 6: Usage Guide

How to use the technology knowledge:

```markdown
## Usage Guide

### For Designer Agents
1. Read [architecture.md] for platform architecture patterns
2. Read [conventions-design.md] for design principles
3. Reference [tech-stack.md] for technology capabilities

### For Developer Agents
1. Read [conventions-dev.md] for coding standards
2. Read [conventions-test.md] for testing requirements
3. Reference [architecture.md] when implementation details are unclear

### For Tester Agents
1. Read [conventions-test.md] for testing standards
2. Reference [conventions-design.md] to understand design intent
```

### Step 5: Write Output

Write the generated INDEX.md to `{output_path}/INDEX.md`.

### Step 6: Report Results

```
Stage 3 completed: Root Technology Index Generated
- Platforms Indexed: {N}
  - web-react: ✓
  - backend-nestjs: ✓
- Root Index: {output_path}/INDEX.md
- Agent Mappings: Documented for all platforms
```

## Template

Use template at `speccrew-knowledge-techs-index/templates/INDEX-TEMPLATE.md`:

**Template Variables:**
- `{{generated_at}}`: ISO timestamp
- `{{source_path}}`: Source path
- `{{platform_count}}`: Number of platforms
- `{{#each platforms}}`: Loop through platforms
  - `{{platform_id}}`: Platform identifier
  - `{{platform_type}}`: Platform type
  - `{{framework}}`: Framework name
  - `{{language}}`: Programming language

## Checklist

- [ ] techs-manifest.json read successfully
- [ ] All platform INDEX.md files discovered
- [ ] Platform summaries extracted
- [ ] Root INDEX.md generated with all sections
- [ ] Agent-to-Platform mapping documented
- [ ] Document guide included
- [ ] Usage guide included
- [ ] Output file written successfully
- [ ] Results reported

