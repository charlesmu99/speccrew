# Technology Knowledge Generation Pipeline

> **Purpose**: Document the pipeline architecture for technology knowledge generation, facilitating maintenance and team collaboration
> **Last Updated**: 2024
> **Related Skills**: `SpecCrew-knowledge-techs-init`, `SpecCrew-knowledge-techs-dispatch`

---

## Architecture Overview

The technology knowledge generation adopts a **multi-stage pipeline** architecture, orchestrated by `SpecCrew-knowledge-techs-dispatch` to automate the transformation from source code configuration to technology documentation.

```
┌─────────────────────────────────────────────────────────────────│
│                    Techs Pipeline                              │
├─────────┬─────────┬─────────┬─────────│                       │
│Stage 1 │Stage 2 │Stage 3 │Report │                       │
│(Single)│Parallel)│Single) │Single)│                       │
├─────────┼─────────┼─────────┼─────────│                       │
│Detect  │Generate│Generate│Generate│                       │
│Platform│Techs   │Index   │Report  │                       │
│Manifest│Docs    │        │        │                       │
└─────────┴─────────┴─────────┴─────────│                       │
         │        │        │                                  │
    techs-manifest.json  Parallel  INDEX.md                      │
                         Worker                                  │
└─────────────────────────────────────────────────────────────────│
```

---

## Stage Details

### Stage 1: Detect Platform Manifest

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `SpecCrew-knowledge-techs-init`

**Input**:
- `source_path`: Source code root directory
- `output_path`: Task status directory
- `language`: Target language for generated content

**Processing Logic**:
1. Scan project structure for platform indicators
2. Detect technology stack for each platform
3. Identify configuration files and conventions
4. Generate platform manifest

**Platform Detection Rules**:

| Platform Type | Detection Signals | Examples |
|---------------|-------------------|----------|
| **Web** | package.json + framework deps | React, Vue, Angular |
| **Mobile** | platform-specific files | Flutter, React Native, iOS, Android |
| **Backend** | framework config files | NestJS, Spring, Django, Express |
| **Desktop** | desktop framework indicators | Electron, Tauri, WPF, Qt |

**Output**:
```
SpecCrew-workspace/docs/crew-init/knowledge-techs/
└── techs-manifest.json
```

**techs-manifest.json Structure**:
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
      "language": "typescript",
      "source_path": "src/web",
      "config_files": [
        "package.json",
        "tsconfig.json",
        "vite.config.ts"
      ],
      "convention_files": [
        ".eslintrc.js",
        ".prettierrc"
      ]
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "language": "typescript",
      "source_path": "src/server",
      "config_files": [
        "package.json",
        "nest-cli.json",
        "tsconfig.json"
      ]
    }
  ]
}
```

---

### Stage 2: Generate Techs Documents

**Execution Mode**: Parallel (1 Worker per platform)

**Responsible Skill**: `SpecCrew-knowledge-techs-generate`

**Input**:
- `platform_id`: Platform identifier
- `platform_config`: Platform configuration from manifest
- `source_path`: Source code path
- `output_path`: Output directory for platform docs
- `language`: Target language

**Processing Logic**:
1. Read platform configuration files (package.json, tsconfig.json, etc.)
2. Extract technology stack information
3. Analyze convention files (eslint, prettier, etc.)
4. Generate platform-specific technology documents

**Output per Platform**:
```
knowledge/techs/{platform-id}/
├── INDEX.md                    # Platform tech index
├── tech-stack.md              # Technology stack details
├── architecture.md            # Architecture conventions
├── conventions-design.md      # Design conventions
├── conventions-dev.md         # Development conventions
├── conventions-test.md        # Testing conventions
└── conventions-data.md        # Data conventions (optional)
```

**Document Descriptions**:

| Document | Purpose | Primary Users |
|----------|---------|---------------|
| `INDEX.md` | Platform overview and navigation | All Agents |
| `tech-stack.md` | Frameworks, libraries, tools, versions | All Agents |
| `architecture.md` | Layering, components, patterns | Designer Agent |
| `conventions-design.md` | Design principles, patterns | Designer Agent |
| `conventions-dev.md` | Naming, directory structure, code style | Dev Agent |
| `conventions-test.md` | Testing frameworks, coverage, patterns | Test Agent |
| `conventions-data.md` | ORM, database modeling, migrations | Designer/Dev Agent |

**Parallel Execution Example**:
```
Worker 1: platform="web-react",     output="knowledge/techs/web-react/"
Worker 2: platform="backend-nestjs", output="knowledge/techs/backend-nestjs/"
Worker 3: platform="mobile-flutter", output="knowledge/techs/mobile-flutter/"
```

**Status Tracking**:
```
SpecCrew-workspace/docs/crew-init/knowledge-techs/
└── stage2-status.json
```

---

### Stage 3: Generate Root Index

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `SpecCrew-knowledge-techs-index`

**Input**:
- `manifest_path`: Path to techs-manifest.json
- `techs_base_path`: Base path for techs documentation
- `output_path`: Output directory

**Processing Logic**:
1. Read techs-manifest.json
2. Discover all platform INDEX.md files
3. Aggregate platform information
4. Generate root-level technology index

**Output**:
```
knowledge/techs/
└── INDEX.md                 # Root technology knowledge index
```

**Included Content**:
- Platform Overview (list of all detected platforms)
- Platform Summary Table (type, framework, language)
- Quick Reference for Each Platform
- Agent-to-Platform Mapping Guide

---

### Stage 4: Generate Final Report

**Action**:
- Read all status files
- Read techs-manifest.json
- Generate summary report

**Output**:
```
Technology knowledge initialization completed:

Pipeline Summary:
- Stage 1 (Platform Detection): │Completed - 3 platforms detected
- Stage 2 (Doc Generation): │Completed - 3/3 platforms generated
- Stage 3 (Index Generation): │Completed

Platform Breakdown:
- web-react: React 18.2.0, TypeScript 5.3.0, Vite 5.0.0
- backend-nestjs: NestJS 10.0.0, TypeScript 5.3.0
- mobile-flutter: Flutter 3.16.0, Dart 3.2.0

Generated Documents:
- knowledge/techs/INDEX.md
- knowledge/techs/web-react/INDEX.md
- knowledge/techs/web-react/tech-stack.md
- knowledge/techs/web-react/architecture.md
- knowledge/techs/web-react/conventions-design.md
- knowledge/techs/web-react/conventions-dev.md
- knowledge/techs/web-react/conventions-test.md
- [Other platforms...]

Agent Mapping:
- SpecCrew-designer-web-react │knowledge/techs/web-react/
- SpecCrew-dev-web-react │knowledge/techs/web-react/
- SpecCrew-test-web-react │knowledge/techs/web-react/
- SpecCrew-designer-backend-nestjs │knowledge/techs/backend-nestjs/
- [Other mappings...]

Next Steps:
- Review knowledge/techs/INDEX.md for complete platform overview
- Use platform-specific conventions for Agent tasks
```

---

## Directory Structure

### Runtime Status Directory
```
SpecCrew-workspace/
└── docs/
    └── crew-init/
        └── knowledge-techs/
            ├── techs-manifest.json       # Stage 1 output
            ├── stage2-status.json        # Stage 2 status
            └── final-report.json         # Final report
```

### Generated Documentation Directory
```
knowledge/techs/
├── INDEX.md                           # Root index (Stage 3)
└── {platform-id}/                     # One directory per platform
    ├── INDEX.md                       # Platform index
    ├── tech-stack.md                  # Technology stack
    ├── architecture.md                # Architecture conventions
    ├── conventions-design.md          # Design conventions
    ├── conventions-dev.md             # Development conventions
    ├── conventions-test.md            # Testing conventions
    └── conventions-data.md            # Data conventions (optional)
```

---

## Worker Dispatch Mechanism

### SpecCrew-task-worker Invocation

The pipeline uses `SpecCrew-task-worker` Agent for task execution. Leader Agent invokes Workers via the **Task tool** for parallel processing.

#### Task Tool Call Format

```yaml
subagent_type: "SpecCrew-task-worker"
description: "Brief task description"
prompt: |
  skill_path: .speccrew/skills/{skill-name}/SKILL.md
  context:
    param1: value1
    param2: value2
    ...
```

#### Stage 2 Parallel Dispatch Example

```yaml
# Worker 1 - Generate web-react tech docs
subagent_type: "SpecCrew-task-worker"
description: "Generate web-react technology documents"
prompt: |
  skill_path: .speccrew/skills/SpecCrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: web-react
    platform_type: web
    framework: react
    source_path: src/web
    output_path: knowledge/techs/web-react/
    language: zh

# Worker 2 - Generate backend-nestjs tech docs
subagent_type: "SpecCrew-task-worker"
description: "Generate backend-nestjs technology documents"
prompt: |
  skill_path: .speccrew/skills/SpecCrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: backend-nestjs
    platform_type: backend
    framework: nestjs
    source_path: src/server
    output_path: knowledge/techs/backend-nestjs/
    language: zh

# ... (more workers for other platforms)
```

---

## Dispatcher Responsibilities

`SpecCrew-knowledge-techs-dispatch` is responsible for orchestrating the entire pipeline:

### Core Responsibilities
1. **Stage Control**: Ensure stages execute in order (1│││)
2. **Parallel Dispatch**: Stage 2 calls multiple Workers in parallel via Task tool
3. **Status Tracking**: Record execution status of each task
4. **Error Handling**: Single platform failure does not affect other platforms
5. **Result Aggregation**: Generate final execution report

### Dispatch Flow

```
1. Execute Stage 1 (Single Task)
   └─ Invoke 1 Worker with SpecCrew-knowledge-techs-init
   └─ Wait for completion ─│
                           │
2. Read techs-manifest.json
   └─ Launch Stage 2 in parallel (one Worker per platform)
   └─ Invoke N Workers with SpecCrew-knowledge-techs-generate
   └─ Wait for all Stage 2 Workers to complete ─│
                                                │
3. Execute Stage 3 (Single Task)
   └─ Invoke 1 Worker with SpecCrew-knowledge-techs-index
   └─ Generate root INDEX.md ─│
                              │
4. Generate final report
```

---

## Error Handling Strategy

| Stage | Failure Impact | Handling Strategy |
|-------|---------------|-------------------|
| Stage 1 | Entire pipeline stops | Report error, do not continue |
| Stage 2 | Single platform fails | Continue other platforms, record failed platform |
| Stage 3 | Index generation fails | Stop, require checking Stage 2 results |

---

## Usage

### Trigger Methods
Invoke through Leader Agent:
```
"Initialize technology knowledge base"
"Generate techs documentation from source code"
"Generate techs knowledge"
"Scan project for technology stacks"
```

### Execution Flow
1. Leader Agent identifies intent
2. Calls `SpecCrew-knowledge-techs-dispatch` Skill
3. Dispatch executes multi-stage pipeline
4. Returns execution report with platform mapping

---

## Agent-to-Platform Mapping

Based on generated techs-manifest.json, Agents are dynamically created and mapped to their respective platform documentation:

| Agent Type | Platform ID | Documentation Path |
|------------|-------------|-------------------|
| SpecCrew-designer-{platform-id} | web-react | knowledge/techs/web-react/ |
| SpecCrew-dev-{platform-id} | web-react | knowledge/techs/web-react/ |
| SpecCrew-test-{platform-id} | web-react | knowledge/techs/web-react/ |
| SpecCrew-designer-{platform-id} | backend-nestjs | knowledge/techs/backend-nestjs/ |
| SpecCrew-dev-{platform-id} | backend-nestjs | knowledge/techs/backend-nestjs/ |
| SpecCrew-test-{platform-id} | backend-nestjs | knowledge/techs/backend-nestjs/ |

**Mapping Rule**: Agent name suffix matches `platform_id` from manifest.

---

## Extensibility Design

### New Platform Handling

When new platforms are added to source code:
1. Stage 1 automatically recognizes new platforms
2. Stage 2 automatically creates Workers for new platforms
3. Stage 3 re-aggregates all platforms into root index

### Platform Template System

Templates are organized by platform type and framework:

```
.speccrew/skills/SpecCrew-knowledge-techs-generate/templates/
├── web-react/
│  ├── INDEX-TEMPLATE.md
│  ├── tech-stack-TEMPLATE.md
│  ├── architecture-TEMPLATE.md
│  ├── conventions-design-TEMPLATE.md
│  ├── conventions-dev-TEMPLATE.md
│  ├── conventions-test-TEMPLATE.md
│  └── conventions-data-TEMPLATE.md
├── backend-nestjs/
│  └── [similar structure]
├── mobile-flutter/
│  └── [similar structure]
└── generic/                    # Fallback templates
    └── [similar structure]
```

Template selection logic:
1. Look for `{platform-type}-{framework}/` directory
2. If not found, use `generic/` templates
3. Fill template variables with extracted configuration data

---

## Related Documentation

| Document | Location | Description |
|----------|----------|-------------|
| agent-knowledge-map.md | `SpecCrew-workspace/docs/` | Agent knowledge requirements and paths |
| bizs-knowledge-pipeline.md | `SpecCrew-workspace/docs/` | Business knowledge pipeline reference |

---

## Maintenance Log

| Date | Changes | Owner |
|------|---------|-------|
| - | Initial version, techs pipeline design | - |


