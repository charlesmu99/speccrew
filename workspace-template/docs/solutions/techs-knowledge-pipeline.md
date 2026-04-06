# Technology Knowledge Generation Pipeline

> **Purpose**: Document the pipeline architecture for technology knowledge generation, facilitating maintenance and team collaboration
> **Last Updated**: 2025-03
> **Related Skills**: `speccrew-knowledge-dispatch`, `speccrew-knowledge-techs-init`, `speccrew-knowledge-techs-generate`, `speccrew-knowledge-techs-index`

---

## Architecture Overview

The technology knowledge generation adopts a **3-stage pipeline** architecture, orchestrated by `speccrew-knowledge-dispatch` to automate the transformation from source code configuration to technology documentation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Techs Pipeline (3 Stages)                            │
├─────────┬─────────┬─────────┬───────────────────────────────────────────│
│Stage 1  │Stage 2  │Stage 3  │Report                                     │
│(Single) │(Parallel)│(Single)│(Single)                                   │
├─────────┼─────────┼─────────┼───────────────────────────────────────────│
│Detect   │Generate │Generate │Generate                                   │
│Platform │Platform │Root     │Report                                     │
│Manifest │Docs     │Index    │                                           │
└─────────┴─────────┴─────────┴───────────────────────────────────────────│
          │        │                                                    │
     techs-manifest.json  Parallel  INDEX.md                             │
                          Worker                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Orchestration

When `knowledge_types = "both"`, the techs pipeline runs in parallel with the bizs pipeline from Stage 1. Both pipelines proceed independently through their stages.

---

## Stage Details

### Stage 1: Detect Platform Manifest

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `speccrew-knowledge-techs-init`

**Input**:
- `source_path`: Source code root directory (default: project root)
- `output_path`: Output directory for techs-manifest.json (default: `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/`)
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

**Processing Logic**:
1. **Scan for Platform Indicators**: Check for platform-specific files and configurations
2. **Extract Platform Metadata**: platform_id, platform_type, framework, language, source_path
3. **Identify Configuration Files**: package.json, tsconfig.json, build configs, etc.
4. **Identify Convention Files**: ESLint, Prettier, testing configs, etc.
5. **Generate techs-manifest.json**

**Platform Detection Rules**:

| Platform Type | Detection Signals | platform_id | Framework |
|---------------|-------------------|-------------|-----------|
| **Web** | package.json + react dependency | web-react | React |
| **Web** | package.json + vue dependency | web-vue | Vue |
| **Web** | package.json + next | web-nextjs | Next.js |
| **Mobile** | pubspec.yaml | mobile-flutter | Flutter |
| **Mobile** | package.json + react-native | mobile-react-native | React Native |
| **Mobile** | manifest.json + pages.json | mobile-uniapp | UniApp |
| **Backend** | package.json + @nestjs/core | backend-nestjs | NestJS |
| **Backend** | pom.xml + spring-boot | backend-spring | Spring Boot |
| **Backend** | go.mod | backend-go | Go |
| **Desktop** | package.json + electron | desktop-electron | Electron |
| **Desktop** | tauri.conf.json | desktop-tauri | Tauri |

**Platform Naming Convention**:

To ensure consistency between bizs and techs pipelines:

| Concept | techs-manifest.json | modules.json (bizs) | Example (UniApp) |
|---------|---------------------|---------------------|------------------|
| **Category** | `platform_type` | `platform_type` | `mobile` |
| **Technology** | `framework` | `platform_subtype` | `uniapp` |
| **Identifier** | `platform_id` | `{platform_type}/{platform_subtype}` | `mobile-uniapp` |

**Output**:
```
speccrew-workspace/knowledges/base/sync-state/knowledge-techs/
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
        "src/web/package.json",
        "src/web/tsconfig.json",
        "src/web/vite.config.ts"
      ],
      "convention_files": [
        "src/web/.eslintrc.js",
        "src/web/.prettierrc"
      ]
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "language": "typescript",
      "source_path": "src/server",
      "config_files": [
        "src/server/package.json",
        "src/server/nest-cli.json",
        "src/server/tsconfig.json"
      ],
      "convention_files": [
        "src/server/.eslintrc.js"
      ]
    }
  ]
}
```

---

### Stage 2: Generate Platform Documents

**Execution Mode**: Parallel (1 Worker per platform)

**Responsible Skill**: `speccrew-knowledge-techs-generate`

**Input**:
- `platform_id`: Platform identifier from manifest
- `platform_type`: Platform type (web, mobile, backend, desktop)
- `framework`: Primary framework
- `source_path`: Platform source directory
- `config_files`: List of configuration file paths
- `convention_files`: List of convention file paths (eslint, prettier, etc.)
- `output_path`: Output directory for platform docs (e.g., `speccrew-workspace/knowledges/techs/{platform_id}/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

**Processing Logic**:
1. **Read Configuration Files**: package.json, tsconfig.json, build configs, etc.
2. **Extract Technology Stack**: Framework versions, dependencies, build tools
3. **Analyze Conventions**: ESLint rules, Prettier config, project structure
4. **Invoke UI Style Analysis** (frontend platforms only): Generate `ui-style-guide.md` and `styles/` directory
5. **Generate Documents**: Based on platform type and detected data layer

**Output per Platform**:
```
speccrew-workspace/knowledges/techs/{platform_id}/
├── INDEX.md                    # Required - Platform tech index
├── tech-stack.md              # Required - Technology stack details
├── architecture.md            # Required - Architecture conventions
├── conventions-design.md      # Required - Design conventions
├── conventions-dev.md         # Required - Development conventions
├── conventions-test.md        # Required - Testing conventions
├── conventions-data.md        # Optional - Data conventions (conditional)
├── ui-style/                  # Optional - UI style analysis (frontend only)
│   ├── ui-style-guide.md      # techs Stage 2
│   ├── styles/                # techs Stage 2
│   ├── page-types/            # techs Stage 2
│   ├── components/            # techs Stage 2
│   └── layouts/               # techs Stage 2
│
└── ui-style-patterns/         # Optional - bizs Stage 3.5 (if executed)
    ├── page-types/            # bizs Stage 3.5
    ├── components/            # bizs Stage 3.5
    └── layouts/               # bizs Stage 3.5
```

**UI Style Directory Ownership**:

| 目录/子目录         | 管理方                  | 生成来源                              | 内容描述                              |
|---------------------|-------------------------|---------------------------------------|---------------------------------------|
| `ui-style/`         | techs pipeline          | Stage 2 (techs-generate)              | 框架级设计系统分析（技术视角）        |
| ├─ ui-style-guide.md| techs pipeline          | Stage 2                               | 技术框架层面的样式指南                |
| ├─ styles/          | techs pipeline          | Stage 2                               | 颜色/字体/间距系统等基础变量          |
| ├─ page-types/      | techs pipeline          | Stage 2                               | 源码发现的页面类型                    |
| ├─ components/      | techs pipeline          | Stage 2                               | 源码发现的组件库                      |
| └─ layouts/         | techs pipeline          | Stage 2                               | 源码发现的布局模式                    |
| `ui-style-patterns/`| bizs pipeline           | Stage 3.5 (bizs-ui-style-extract)     | 业务聚合的UI模式（业务视角）          |
| ├─ page-types/      | bizs pipeline           | Stage 3.5                             | 业务聚合的页面类型模式                |
| ├─ components/      | bizs pipeline           | Stage 3.5                             | 业务聚合的组件复用模式                |
| └─ layouts/         | bizs pipeline           | Stage 3.5                             | 业务聚合的布局模式                    |

> **注意**: 
> - `ui-style-patterns/` 目录仅在 bizs pipeline Stage 3.5 执行后才存在
> - 两个目录的内容互补：techs 提供技术视角，bizs 提供业务视角
> - Designer Agent 应同时参考两个目录

**Document Generation Rules**:

| Platform Type | Required Documents | Optional Documents | Generate conventions-data.md? |
|---------------|-------------------|-------------------|------------------------------|
| `backend` | All 6 docs | - | ✅ **必须生成** - 包含 ORM、数据建模、缓存策略 |
| `web` | All 6 docs | conventions-data.md | ⚠️ **条件生成** - 仅当使用 ORM/数据层时（Prisma、TypeORM 等） |
| `mobile` | All 6 docs | conventions-data.md | ❌ **默认不生成** - 根据实际技术栈判断 |
| `desktop` | All 6 docs | conventions-data.md | ❌ **默认不生成** - 根据实际技术栈判断 |
| `api` | All 6 docs | conventions-data.md | ⚠️ **条件生成** - 根据是否有数据层 |

**Data Layer Detection** (for non-backend platforms):

| Indicator | Technology | Action |
|-----------|------------|--------|
| `prisma` in package.json | Prisma ORM | Generate conventions-data.md |
| `typeorm` in package.json | TypeORM | Generate conventions-data.md |
| `sequelize` in package.json | Sequelize | Generate conventions-data.md |
| `mongoose` in package.json | Mongoose | Generate conventions-data.md |
| `drizzle-orm` in package.json | Drizzle ORM | Generate conventions-data.md |
| `firebase` / `@react-native-firebase` | Firebase | Generate conventions-data.md (lightweight) |
| `sqlite` / `realm` | SQLite/Realm | Generate conventions-data.md (lightweight) |
| None detected | - | **Skip** conventions-data.md |

**Document Descriptions**:

| Document | Purpose | Primary Users |
|----------|---------|---------------|
| `INDEX.md` | Platform overview and navigation | All Agents |
| `tech-stack.md` | Frameworks, libraries, tools, versions | All Agents |
| `architecture.md` | Layering, components, patterns | Designer Agent |
| `conventions-design.md` | Design principles, patterns, UI conventions | Designer Agent |
| `conventions-dev.md` | Naming, directory structure, code style | Dev Agent |
| `conventions-test.md` | Testing frameworks, coverage, patterns | Test Agent |
| `conventions-data.md` | ORM, database modeling, migrations | Designer/Dev Agent |

**Parallel Execution Example**:
```yaml
# Worker 1 - Generate web-react tech docs
subagent_type: "speccrew-task-worker"
description: "Generate web-react technology documents"
prompt: |
  skill_path: speccrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: web-react
    platform_type: web
    framework: react
    source_path: src/web
    config_files: ["src/web/package.json", "src/web/tsconfig.json", "src/web/vite.config.ts"]
    convention_files: ["src/web/.eslintrc.js", "src/web/.prettierrc"]
    output_path: speccrew-workspace/knowledges/techs/web-react/
    language: zh

# Worker 2 - Generate backend-nestjs tech docs
subagent_type: "speccrew-task-worker"
description: "Generate backend-nestjs technology documents"
prompt: |
  skill_path: speccrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: backend-nestjs
    platform_type: backend
    framework: nestjs
    source_path: src/server
    config_files: ["src/server/package.json", "src/server/nest-cli.json", "src/server/tsconfig.json"]
    convention_files: ["src/server/.eslintrc.js"]
    output_path: speccrew-workspace/knowledges/techs/backend-nestjs/
    language: zh
```

**Status Tracking**:
```
speccrew-workspace/knowledges/base/sync-state/knowledge-techs/
└── stage2-status.json
```

**stage2-status.json Format**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "stage": "platform-doc-generation",
  "total_platforms": 3,
  "completed": 3,
  "failed": 0,
  "platforms": [
    {
      "platform_id": "web-react",
      "platform_type": "web",
      "framework": "react",
      "status": "completed",
      "documents_generated": [
        "INDEX.md",
        "tech-stack.md",
        "architecture.md",
        "conventions-design.md",
        "conventions-dev.md",
        "conventions-test.md"
      ],
      "output_path": "speccrew-workspace/knowledges/techs/web-react/"
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "status": "completed",
      "documents_generated": [
        "INDEX.md",
        "tech-stack.md",
        "architecture.md",
        "conventions-design.md",
        "conventions-dev.md",
        "conventions-test.md",
        "conventions-data.md"
      ],
      "output_path": "speccrew-workspace/knowledges/techs/backend-nestjs/"
    }
  ]
}
```

---

### Stage 3: Generate Root Index

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `speccrew-knowledge-techs-index`

**Input**:
- `manifest_path`: Path to techs-manifest.json
- `techs_base_path`: Base path for techs documentation (default: `speccrew-workspace/knowledges/techs/`)
- `output_path`: Output path for root INDEX.md (default: `speccrew-workspace/knowledges/techs/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

**Processing Logic**:
1. **Read techs-manifest.json**: Get list of all platforms
2. **Verify Platform Documents** (Dynamic Detection):
   - Scan each platform directory to detect which documents actually exist
   - Build document availability map for each platform
   - Do NOT assume all platforms have the same document set
3. **Extract Platform Summaries**: Read each platform's INDEX.md
4. **Generate Root INDEX.md** with dynamic link generation

**Critical Requirements for Techs Index Generation**:

1. **Dynamic Document Detection**: 
   - Must scan each platform directory to detect which documents actually exist
   - Do NOT assume all platforms have the same document set
   - `conventions-data.md` may not exist for all platforms

2. **Dynamic Link Generation**:
   - Only include links to documents that actually exist
   - For missing optional documents, either omit the link or mark as "N/A"

3. **Platform-Specific Document Recommendations**:
   - Adjust "Agent 重点文档" recommendations based on actual available documents

**Output**:
```
speccrew-workspace/knowledges/techs/
└── INDEX.md                 # Root technology knowledge index
```

**Included Content**:
- Header with generation timestamp and source reference
- Platform Overview (list of all detected platforms with dynamic document links)
- Platform Summary Table (type, framework, language, documents)
- Quick Reference organized by document type
- Agent-to-Platform Mapping Guide (dynamically adjusted per platform)
- Document Guide explaining each document type
- Usage Guide for different Agent roles

**Status Tracking**:
```
speccrew-workspace/knowledges/base/sync-state/knowledge-techs/
└── stage3-status.json
```

**stage3-status.json Format**:
```json
{
  "generated_at": "2024-01-15T10:35:00Z",
  "stage": "root-index-generation",
  "status": "completed",
  "platforms_indexed": 3,
  "index_file": "speccrew-workspace/knowledges/techs/INDEX.md"
}
```

---

### Final Report Generation

**Action**:
- Read all status files (stage2-status.json, stage3-status.json)
- Read techs-manifest.json
- Generate unified summary report (combined with bizs pipeline when `knowledge_types = "both"`)

**Output Format** (when `knowledge_types = "both"`):
```
╔══════════════════════════════════════════════════════════════════════╗
║          Knowledge Base Initialization Completed                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║ [Techs Pipeline]                                                     ║
║ ─────────────────────────────────────────────────────────────────   ║
║ Stage 1 (Platform Detection): ✅ Completed - 3 platforms detected    ║
║ Stage 2 (Doc Generation):     ✅ Completed - 3/3 platforms           ║
║ Stage 3 (Index Generation):   ✅ Completed                           ║
║                                                                      ║
║ Platform Breakdown:                                                  ║
║ ─────────────────────────────────────────────────────────────────   ║
║ Techs: web-react, backend-nestjs, mobile-flutter                     ║
║                                                                      ║
║ Generated Documents:                                                 ║
║ ─────────────────────────────────────────────────────────────────   ║
║   📄 speccrew-workspace/knowledges/techs/INDEX.md                    ║
║   📄 speccrew-workspace/knowledges/techs/{platform}/... (3 platforms)║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Output Format** (when `knowledge_types = "techs"` only):
```
Technology knowledge initialization completed:

Pipeline Summary:
- Stage 1 (Platform Detection): ✅ Completed - 3 platforms detected
- Stage 2 (Doc Generation):     ✅ Completed - 3/3 platforms generated
- Stage 3 (Index Generation):   ✅ Completed

Platform Breakdown:
- web-react: React 18.2.0, TypeScript 5.3.0, Vite 5.0.0
- backend-nestjs: NestJS 10.0.0, TypeScript 5.3.0
- mobile-flutter: Flutter 3.16.0, Dart 3.2.0

Generated Documents:
- speccrew-workspace/knowledges/techs/INDEX.md
- speccrew-workspace/knowledges/techs/web-react/INDEX.md
- speccrew-workspace/knowledges/techs/web-react/tech-stack.md
- speccrew-workspace/knowledges/techs/web-react/architecture.md
- speccrew-workspace/knowledges/techs/web-react/conventions-design.md
- speccrew-workspace/knowledges/techs/web-react/conventions-dev.md
- speccrew-workspace/knowledges/techs/web-react/conventions-test.md
- [Other platforms...]

Agent Mapping:
- speccrew-sd-web-react → speccrew-workspace/knowledges/techs/web-react/
- speccrew-dev-web-react → speccrew-workspace/knowledges/techs/web-react/
- speccrew-test-web-react → speccrew-workspace/knowledges/techs/web-react/
- speccrew-sd-backend-nestjs → speccrew-workspace/knowledges/techs/backend-nestjs/
- [Other mappings...]

Next Steps:
- Review speccrew-workspace/knowledges/techs/INDEX.md for complete platform overview
- Use platform-specific conventions for Agent tasks
```

---

## Directory Structure

### Runtime Status Directory
```
speccrew-workspace/
└── knowledges/
    └── base/
        └── sync-state/
            └── knowledge-techs/
                ├── techs-manifest.json       # Stage 1 output
                ├── stage2-status.json        # Stage 2 status
                ├── stage3-status.json        # Stage 3 status
                └── final-report.json         # Final report
```

### Generated Documentation Directory
```
speccrew-workspace/
└── knowledges/
    └── techs/
        ├── INDEX.md                           # Root index (Stage 3)
        └── {platform-id}/                     # One directory per platform
            ├── INDEX.md                       # Platform index
            ├── tech-stack.md                  # Technology stack
            ├── architecture.md                # Architecture conventions
            ├── conventions-design.md          # Design conventions
            ├── conventions-dev.md             # Development conventions
            ├── conventions-test.md            # Testing conventions
            ├── conventions-data.md            # Data conventions (optional)
            ├── ui-style/                      # UI style (frontend only) - techs Stage 2
            │   ├── ui-style-guide.md          # 框架级设计系统指南
            │   ├── styles/                    # 颜色/字体/间距系统
            │   ├── page-types/                # 源码发现的页面类型
            │   ├── components/                # 源码发现的组件库
            │   └── layouts/                   # 源码发现的布局模式
            │
            └── ui-style-patterns/             # UI patterns (frontend only) - bizs Stage 3.5
                ├── page-types/                # 业务聚合的页面类型模式
                ├── components/                # 业务聚合的组件复用模式
                └── layouts/                   # 业务聚合的布局模式
```

**UI Style Directory Separation**:

| 目录 | 管理 Pipeline | 内容来源 | 存在条件 |
|------|--------------|----------|----------|
| `ui-style/` | techs pipeline Stage 2 | 框架级设计系统分析 | 前端平台始终存在 |
| `ui-style-patterns/` | bizs pipeline Stage 3.5 | 业务 feature 文档聚合 | 仅当 bizs pipeline 执行后存在 |

两个目录的内容互补：
- **techs pipeline** 提供技术视角：从源码分析得出的框架设计系统、组件库、布局模式
- **bizs pipeline** 提供业务视角：从业务 feature 文档聚合得出的可复用 UI 模式

Designer Agent 应同时参考两个目录以获得完整的 UI 设计指导。

---

## Worker Dispatch Mechanism

### speccrew-task-worker Invocation

The pipeline uses `speccrew-task-worker` Agent for task execution. Leader Agent invokes Workers via the **Task tool** for parallel processing.

#### Task Tool Call Format

```yaml
subagent_type: "speccrew-task-worker"
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
subagent_type: "speccrew-task-worker"
description: "Generate web-react technology documents"
prompt: |
  skill_path: speccrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: web-react
    platform_type: web
    framework: react
    source_path: src/web
    config_files: ["src/web/package.json", "src/web/tsconfig.json", "src/web/vite.config.ts"]
    convention_files: ["src/web/.eslintrc.js", "src/web/.prettierrc"]
    output_path: speccrew-workspace/knowledges/techs/web-react/
    language: zh

# Worker 2 - Generate backend-nestjs tech docs
subagent_type: "speccrew-task-worker"
description: "Generate backend-nestjs technology documents"
prompt: |
  skill_path: speccrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: backend-nestjs
    platform_type: backend
    framework: nestjs
    source_path: src/server
    config_files: ["src/server/package.json", "src/server/nest-cli.json", "src/server/tsconfig.json"]
    convention_files: ["src/server/.eslintrc.js"]
    output_path: speccrew-workspace/knowledges/techs/backend-nestjs/
    language: zh

# ... (more workers for other platforms)
```

---

## Dispatcher Responsibilities

`speccrew-knowledge-dispatch` is responsible for orchestrating the entire pipeline:

### Core Responsibilities
1. **Stage Control**: Ensure stages execute in order (1→2→3)
2. **Parallel Dispatch**: Stage 2 calls multiple Workers in parallel via Task tool
3. **Status Tracking**: Record execution status of each task with timestamp
4. **Error Handling**: Single platform failure does not affect other platforms
5. **Result Aggregation**: Generate final execution report
6. **Language Propagation**: Pass `language` parameter to all downstream skills

### Dispatch Flow

```
1. Execute Stage 1 (Single Task)
   └─ Invoke 1 Worker with speccrew-knowledge-techs-init
   └─ Wait for completion ─┐
                           │
2. Read techs-manifest.json│
   └─ Launch Stage 2 in parallel (one Worker per platform)
   └─ Invoke N Workers with speccrew-knowledge-techs-generate
   └─ Wait for all Stage 2 Workers to complete ─┐
                                                │
3. Generate stage2-status.json with timestamp   │
   Execute Stage 3 (Single Task)                 │
   └─ Invoke 1 Worker with speccrew-knowledge-techs-index
   └─ Generate root INDEX.md ─┤
                               │
4. Generate stage3-status.json │
   Generate unified final report (when knowledge_types = "both")
```

### Parallel Execution with Bizs Pipeline

When `knowledge_types = "both"`:

```
Time →
─────────────────────────────────────────────────────────────────────────────

Bizs Pipeline:   [Stage 1] →[Stage 2 Parallel] →[Stage 3 Parallel] →[Stage 4] →[Report]
                      │          │                   │
Techs Pipeline:   [Stage 1] →[Stage 2 Parallel] →[Stage 3] →[Report]
                      │          │
                  Both Stage 1s run in parallel
                  (independent tasks)

─────────────────────────────────────────────────────────────────────────────
```

**Execution Rules**:
1. **Stage 1 Parallel**: Both bizs-init and techs-init Workers launch simultaneously
2. **Independent Progress**: Each pipeline proceeds through its stages independently
3. **No Cross-Dependencies**: Bizs and techs pipelines do not depend on each other
4. **Unified Final Report**: Generate a combined report after both pipelines complete

---

## Error Handling Strategy

| Stage | Failure Impact | Handling Strategy |
|-------|---------------|-------------------|
| Stage 1 | Entire pipeline stops | Report error, do not continue (bizs pipeline continues if running) |
| Stage 2 | Single platform fails | Continue other platforms, record failed platform in stage2-status.json |
| Stage 3 | Index generation fails | Abort techs pipeline if Stage 2 had critical failures |

### Cross-Pipeline Policy

- **Pipeline Independence**: Failure in one pipeline does NOT affect the other
- **Partial Success**: Report success for completed pipeline, failure for the other
- **Final Report**: Always generate report showing status of both pipelines (if requested)

---

## Usage

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source_path` | string | No | Source code root path (default: project root) |
| `knowledge_types` | string | No | `"bizs"`, `"techs"`, or `"both"` (default: `"both"`) |
| `output_path` | string | No | Output directory (default: `speccrew-workspace/knowledges/`) |
| `sync_mode` | string | No | `"full"` or `"incremental"` (default: `"full"`) |
| `base_commit` | string | No | Git commit hash for incremental mode (comparison base) |
| `head_commit` | string | No | Git commit hash for incremental mode (current HEAD) |
| `changed_files` | array | No | Pre-computed list of changed files for incremental mode |

### Trigger Methods
Invoke through Leader Agent:
```
"Initialize knowledge base"
"Initialize bizs and techs knowledge base"
"Generate knowledge from source code"
"Dispatch knowledge generation tasks"
```

### Execution Flow
1. Leader Agent identifies intent
2. Calls `speccrew-knowledge-dispatch` Skill
3. Dispatch executes 3-stage pipeline (or both pipelines if `knowledge_types = "both"`)
4. Returns unified execution report with platform mapping

---

## Agent-to-Platform Mapping

Based on generated techs-manifest.json, Agents are dynamically created and mapped to their respective platform documentation:

| Agent Type | Platform ID | Documentation Path |
|------------|-------------|-------------------|
| speccrew-sd-{platform-id} | web-react | speccrew-workspace/knowledges/techs/web-react/ |
| speccrew-dev-{platform-id} | web-react | speccrew-workspace/knowledges/techs/web-react/ |
| speccrew-test-{platform-id} | web-react | speccrew-workspace/knowledges/techs/web-react/ |
| speccrew-sd-{platform-id} | backend-nestjs | speccrew-workspace/knowledges/techs/backend-nestjs/ |
| speccrew-dev-{platform-id} | backend-nestjs | speccrew-workspace/knowledges/techs/backend-nestjs/ |
| speccrew-test-{platform-id} | backend-nestjs | speccrew-workspace/knowledges/techs/backend-nestjs/ |

**Mapping Rule**: Agent name suffix matches `platform_id` from manifest.

**Key Documents per Agent Role**:

| Agent Role | Always Reference | Conditionally Reference |
|------------|-----------------|------------------------|
| Designer | architecture.md, conventions-design.md | conventions-data.md (if platform has data layer) |
| Developer | conventions-dev.md | conventions-data.md (if platform has data layer) |
| Tester | conventions-test.md | - |

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
.speccrew/skills/speccrew-knowledge-techs-generate/templates/
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

### UI Style Analysis Integration

For frontend platforms (web, mobile, desktop), UI style documentation is generated across two separate directories with clear ownership:

**techs pipeline Stage 2 Responsibilities** (`ui-style/` directory):
- `ui-style-guide.md` - Main UI style guide (tech stack, design system overview)
- `styles/` - Style-related documentation (color system, typography, spacing, etc.)
- `page-types/` - Page types discovered from source code analysis
- `components/` - Component library discovered from source code
- `layouts/` - Layout patterns discovered from source code

```
Stage 2 Worker (Frontend Platforms)
    │
    ├─> Extract tech stack
    ├─> Analyze conventions
    ├─> Generate UI Style (complete)
    │       Output: ui-style/ (all subdirectories)
    │
    └─> Generate convention documents
```

**bizs pipeline Stage 3.5 Responsibilities** (`ui-style-patterns/` directory):
The `ui-style-patterns/` directory and its subdirectories are created and managed by **bizs pipeline Stage 3.5** (`speccrew-knowledge-bizs-ui-style-extract` skill), which extracts UI style patterns from actual business feature documents:

| Directory/Subdirectory | Generated By                              | Content Description |
|------------------------|-------------------------------------------|---------------------|
| `ui-style-patterns/`   | bizs Stage 3.5 (ui-style-extract)         | Business pattern aggregation root |
| ├─ page-types/         | bizs Stage 3.5                            | Page type patterns from business modules |
| ├─ components/         | bizs Stage 3.5                            | Component reuse patterns from actual usage |
| └─ layouts/            | bizs Stage 3.5                            | Layout patterns from business pages |

> **Important**: 
> - `ui-style-patterns/` directory is **NOT** created by techs pipeline
> - It only exists if bizs pipeline Stage 3.5 has been executed
> - techs pipeline should never write to `ui-style-patterns/`
> - Refer to `bizs-knowledge-pipeline.md` for details on Stage 3.5

**Cross-Directory Usage for Designer Agent**:

Designer Agent should reference both directories for complete UI design guidance:

| Design Task | Primary Reference | Secondary Reference |
|-------------|-------------------|---------------------|
| Color/Typography/Spacing | `ui-style/styles/` | - |
| Component Selection | `ui-style/components/` | `ui-style-patterns/components/` (if exists) |
| Page Layout | `ui-style/layouts/` | `ui-style-patterns/layouts/` (if exists) |
| Page Type Pattern | `ui-style/page-types/` | `ui-style-patterns/page-types/` (if exists) |

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


