---
name: speccrew-knowledge-techs-index
description: Stage 3 of technology knowledge initialization - Generate root INDEX.md by aggregating all platform technology documents. Creates the master index that maps platforms to their documentation and provides Agent-to-Platform mapping guide. Used by Worker Agent after all platform documents are generated.
tools: Read, Write, Skill
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
- `techs_base_path`: Base path for techs documentation (default: `speccrew-workspace/knowledges/techs/`)
- `output_path`: Output path for root INDEX.md (default: `speccrew-workspace/knowledges/techs/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

## Output

- `{{output_path}}/INDEX.md` - Root technology knowledge index

## Workflow

### Step 0: Read Root Index Template

Before processing, read the template file to understand the required content structure:
- **Read**: `templates/INDEX-TEMPLATE.md`
- **Purpose**: Understand the template chapters and example content requirements for root technology index documents
- **Key sections to follow**:
  - Introduction (generation info, platform count)
  - Project Structure (Platform Overview table, Directory Structure)
  - Core Components (Technology Stacks, Architecture Guidelines, Design Conventions, Development Conventions, Testing Conventions)
  - Architecture Overview (Platform Architecture Map with Mermaid diagram)
  - Detailed Component Analysis (Agent-to-Platform Mapping)
  - Dependency Analysis (Cross-Platform Dependencies with Mermaid diagram)
  - Performance Considerations
  - Troubleshooting Guide
  - Conclusion
  - Appendix (Document Guide, Usage Guide)

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

### Step 2: Verify Platform Documents (Dynamic Detection)

**CRITICAL**: Do NOT assume all platforms have the same document set. Must dynamically detect which documents actually exist.

For each platform in manifest, scan the platform directory to detect actual document existence:

```
speccrew-workspace/knowledges/techs/{{platform_id}}/
├── INDEX.md                    # Required - must exist
├── tech-stack.md              # Required - must exist
├── architecture.md            # Required - must exist
├── conventions-design.md      # Required - must exist
├── conventions-dev.md         # Required - must exist
├── conventions-test.md        # Required - must exist
└── conventions-data.md        # Optional - check existence dynamically
```

**Dynamic Detection Logic:**

1. **Scan Platform Directory**: List all `.md` files in `{{techs_base_path}}/{{platform_id}}/`
2. **Build Document Availability Map**:
   ```json
   {
     "platform_id": "mobile-uniapp",
     "documents": {
       "INDEX.md": true,
       "tech-stack.md": true,
       "architecture.md": true,
       "conventions-design.md": true,
       "conventions-dev.md": true,
       "conventions-test.md": true,
       "conventions-data.md": false  // Dynamically detected
     }
   }
   ```
3. **Validation**:
   - If `INDEX.md` is missing → Note as error in report, skip this platform
   - If any required document (except conventions-data.md) is missing → Note as warning
   - Record actual document availability for dynamic link generation

**Document Availability Rules:**

| Document | Required | Action if Missing |
|----------|----------|-------------------|
| INDEX.md | ✅ Yes | Skip platform, report error |
| tech-stack.md | ✅ Yes | Report warning |
| architecture.md | ✅ Yes | Report warning |
| conventions-design.md | ✅ Yes | Report warning |
| conventions-dev.md | ✅ Yes | Report warning |
| conventions-test.md | ✅ Yes | Report warning |
| conventions-data.md | ❌ No | Omit from links, no warning |

### Step 3: Extract Platform Summaries

Read each platform's INDEX.md to extract:
- Platform name/type
- Framework and version
- Primary language
- Key technologies (brief)

### Step 4: Generate Root INDEX.md

1. **Get Timestamp**:
   - **CRITICAL**: Use the Skill tool to invoke `speccrew-get-timestamp` with parameter: `format=ISO`
   - Store the returned timestamp as `{{generated_at}}` template variable

2. **Create the master index document** with the following sections:

#### Section 1: Header

```markdown
# Technology Knowledge Index

<cite>
**Files Referenced in This Document**
- [techs-manifest.json](file://path/to/techs-manifest.json)
</cite>

> **Target Audience**: devcrew-designer-*, devcrew-dev-*, devcrew-test-*

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

This technology knowledge index serves all platforms in the project, providing platform overview, document navigation, and Agent usage guidelines.

> Generated at: {{generated_at}}
> Source: {{source_path}}
> Platforms: {{platform_count}}
```

#### Section 2: Platform Overview

Summary table of all platforms with **dynamically generated document links**:

```markdown
## Platform Overview

| Platform | Type | Framework | Language | Documents |
|----------|------|-----------|----------|-----------|
| [Web Frontend](web-react/INDEX.md) | Web | React 18.2.0 | TypeScript | [Stack](web-react/tech-stack.md), [Arch](web-react/architecture.md), [Design](web-react/conventions-design.md), [Dev](web-react/conventions-dev.md), [Test](web-react/conventions-test.md) |
| [Backend API](backend-nestjs/INDEX.md) | Backend | NestJS 10.0.0 | TypeScript | [Stack](backend-nestjs/tech-stack.md), [Arch](backend-nestjs/architecture.md), [Design](backend-nestjs/conventions-design.md), [Dev](backend-nestjs/conventions-dev.md), [Test](backend-nestjs/conventions-test.md), [Data](backend-nestjs/conventions-data.md) |
| [Mobile App](mobile-uniapp/INDEX.md) | Mobile | UniApp | TypeScript | [Stack](mobile-uniapp/tech-stack.md), [Arch](mobile-uniapp/architecture.md), [Design](mobile-uniapp/conventions-design.md), [Dev](mobile-uniapp/conventions-dev.md), [Test](mobile-uniapp/conventions-test.md) |
```

**Dynamic Link Generation Rules:**

1. **Always include links to required documents** (if they exist):
   - INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-test.md

2. **Conditionally include conventions-data.md**:
   - Only add link if `conventions-data.md` exists in the platform directory
   - For `backend` platforms, typically include
   - For `mobile` platforms without data layer, omit

3. **Link Format**: Use short abbreviations to save space:
   - `[Stack]` → tech-stack.md
   - `[Arch]` → architecture.md
   - `[Design]` → conventions-design.md
   - `[Dev]` → conventions-dev.md
   - `[Test]` → conventions-test.md
   - `[Data]` → conventions-data.md (only if exists)

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

Critical section that defines how Agents map to platform documentation. **Must dynamically adjust based on actual document availability**:

```markdown
## Agent-to-Platform Mapping

This section maps dynamically generated Agents to their respective platform documentation.

### Web Frontend (web-react)

| Agent Role | Agent Name | Documentation Path |
|------------|------------|-------------------|
| Designer | speccrew-designer-web-react | [speccrew-workspace/knowledges/techs/web-react/](web-react/) |
| Developer | speccrew-dev-web-react | [speccrew-workspace/knowledges/techs/web-react/](web-react/) |
| Tester | speccrew-test-web-react | [speccrew-workspace/knowledges/techs/web-react/](web-react/) |

**Key Documents for Web Agents:**
- Designer: [architecture.md](web-react/architecture.md), [conventions-design.md](web-react/conventions-design.md)
- Developer: [conventions-dev.md](web-react/conventions-dev.md)
- Tester: [conventions-test.md](web-react/conventions-test.md)

### Backend API (backend-nestjs)

| Agent Role | Agent Name | Documentation Path |
|------------|------------|-------------------|
| Designer | speccrew-designer-backend-nestjs | [speccrew-workspace/knowledges/techs/backend-nestjs/](backend-nestjs/) |
| Developer | speccrew-dev-backend-nestjs | [speccrew-workspace/knowledges/techs/backend-nestjs/](backend-nestjs/) |
| Tester | speccrew-test-backend-nestjs | [speccrew-workspace/knowledges/techs/backend-nestjs/](backend-nestjs/) |

**Key Documents for Backend Agents:**
- Designer: [architecture.md](backend-nestjs/architecture.md), [conventions-design.md](backend-nestjs/conventions-design.md), [conventions-data.md](backend-nestjs/conventions-data.md)
- Developer: [conventions-dev.md](backend-nestjs/conventions-dev.md), [conventions-data.md](backend-nestjs/conventions-data.md)
- Tester: [conventions-test.md](backend-nestjs/conventions-test.md)

### Mobile App (mobile-uniapp) - Example without conventions-data.md

| Agent Role | Agent Name | Documentation Path |
|------------|------------|-------------------|
| Designer | speccrew-designer-mobile-uniapp | [speccrew-workspace/knowledges/techs/mobile-uniapp/](mobile-uniapp/) |
| Developer | speccrew-dev-mobile-uniapp | [speccrew-workspace/knowledges/techs/mobile-uniapp/](mobile-uniapp/) |
| Tester | speccrew-test-mobile-uniapp | [speccrew-workspace/knowledges/techs/mobile-uniapp/](mobile-uniapp/) |

**Key Documents for Mobile Agents:**
- Designer: [architecture.md](mobile-uniapp/architecture.md), [conventions-design.md](mobile-uniapp/conventions-design.md)
- Developer: [conventions-dev.md](mobile-uniapp/conventions-dev.md)
- Tester: [conventions-test.md](mobile-uniapp/conventions-test.md)
```

**Dynamic Adjustment Rules:**

1. **Designer Agent Documents**:
   - Always: architecture.md, conventions-design.md
   - Conditionally: conventions-data.md (only if platform has data layer)

2. **Developer Agent Documents**:
   - Always: conventions-dev.md
   - Conditionally: conventions-data.md (only if platform has data layer)

3. **Tester Agent Documents**:
   - Always: conventions-test.md
   - Rarely: conventions-data.md (only if testing data layer specifically)

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

Write the generated INDEX.md to `{{output_path}}/INDEX.md`.

### Step 6: Report Results

```
Stage 3 completed: Root Technology Index Generated
- Platforms Indexed: {{platform_count}}
  - web-react: ✓
  - backend-nestjs: ✓
- Root Index: {{output_path}}/INDEX.md
- Agent Mappings: Documented for all platforms
```

## Template

Use template at `templates/INDEX-TEMPLATE.md`:

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

### Pre-Generation
- [ ] techs-manifest.json read successfully
- [ ] Platform list extracted from manifest

### Dynamic Document Detection
- [ ] Each platform directory scanned for actual document existence
- [ ] Document availability map created for each platform
- [ ] Required documents verified (INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-test.md)
- [ ] Optional conventions-data.md existence checked per platform

### Content Generation
- [ ] Platform summaries extracted from existing INDEX.md files
- [ ] Root INDEX.md generated with all sections
- [ ] **Platform Overview table**: Links dynamically generated based on actual document existence
- [ ] **Agent-to-Platform mapping**: Document recommendations adjusted per platform
- [ ] Document guide included
- [ ] Usage guide included

### Quality & Validation
- [ ] No broken links to non-existent documents
- [ ] conventions-data.md links only included for platforms where it exists
- [ ] **Source traceability**: `<cite>` block added to root INDEX.md
- [ ] **Source traceability**: Section Source annotations added at end of major sections
- [ ] Output file written successfully
- [ ] Results reported with document availability summary

