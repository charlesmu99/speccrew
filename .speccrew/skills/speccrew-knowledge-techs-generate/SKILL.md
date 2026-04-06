---
name: speccrew-knowledge-techs-generate
description: Stage 2 of technology knowledge initialization - Generate technology documentation for a specific platform. Extracts tech stack, architecture, and conventions from configuration files and source code. Creates INDEX.md, tech-stack.md, architecture.md, and conventions-*.md files. Used by Worker Agent in parallel for each detected platform.
tools: Read, Write, Glob, Grep, Skill
---

> **⚠️ DEPRECATED**: This skill has been split into two specialized skills for parallel execution:
> - **`speccrew-knowledge-techs-generate-conventions`** — Generates convention documents (INDEX, tech-stack, architecture, conventions-*)
> - **`speccrew-knowledge-techs-generate-ui-style`** — Generates UI style documents (ui-style/ directory, frontend platforms only)
>
> **Do NOT invoke this skill directly.** Use the specialized skills via `speccrew-knowledge-techs-dispatch` Stage 2 dual-worker orchestration.
> This file is retained as reference documentation only.

# Stage 2: Generate Platform Technology Documents

Generate comprehensive technology documentation for a specific platform by analyzing its configuration files and source code structure.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

## Trigger Scenarios

- "Generate technology documents for {platform}"
- "Create tech stack documentation"
- "Extract conventions from {platform}"
- "Generate platform tech docs"

## User

Worker Agent (speccrew-task-worker)

## Input

- `platform_id`: Platform identifier (e.g., "web-react", "backend-nestjs")
- `platform_type`: Platform type (web, mobile, backend, desktop)
- `framework`: Primary framework (react, nestjs, flutter, etc.)
- `source_path`: Platform source directory
- `config_files`: List of configuration file paths
- `convention_files`: List of convention file paths (eslint, prettier, etc.)
- `output_path`: Output directory for generated documents (e.g., `speccrew-workspace/knowledges/techs/{platform_id}/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**
- `completed_dir`: (Optional) Directory for analysis coverage report output. If provided, the analysis JSON will be written here instead of the knowledges directory

## Output

Generate the following documents in `{output_path}/`:

```
{output_path}/
├── INDEX.md                    # Platform technology index (Required)
├── tech-stack.md              # Technology stack details (Required)
├── architecture.md            # Architecture conventions (Required)
├── conventions-design.md      # Design conventions (Required)
├── conventions-dev.md         # Development conventions (Required)
├── conventions-test.md        # Testing conventions (Required)
├── conventions-build.md       # Build & Deployment conventions (Required)
├── conventions-data.md        # Data conventions (Optional)
└── ui-style/                  # UI style analysis (Optional, frontend platforms only)
    ├── ui-style-guide.md      # Main UI style guide
    ├── page-types/            # Page type analysis
    ├── components/            # Component analysis
    ├── layouts/               # Layout patterns
    └── styles/                # Styling conventions
```

### Platform Type to Document Mapping

| Platform Type | Required Documents | Optional Documents | Generate conventions-data.md? |
|---------------|-------------------|-------------------|------------------------------|
| `backend` | All 7 docs | - | ✅ **必须生成** - 包含 ORM、数据建模、缓存策略 |
| `web` | All 7 docs | conventions-data.md | ⚠️ **条件生成** - 仅当使用 ORM/数据层时（Prisma、TypeORM、Sequelize 等） |
| `mobile` | All 7 docs | conventions-data.md | ❌ **默认不生成** - 根据实际技术栈判断 |
| `desktop` | All 7 docs | conventions-data.md | ❌ **默认不生成** - 根据实际技术栈判断 |
| `api` | All 7 docs | conventions-data.md | ⚠️ **条件生成** - 根据是否有数据层 |

### Decision Logic for conventions-data.md

**Step 1: Check Platform Type**
- If `backend` → **Generate** (always)
- If `web`/`mobile`/`desktop`/`api` → Proceed to Step 2

**Step 2: Detect Data Layer (for non-backend platforms)**

Check configuration files for data layer indicators:

| Indicator | Technology | Action |
|-----------|------------|--------|
| `prisma` in package.json dependencies | Prisma ORM | Generate conventions-data.md |
| `typeorm` in package.json dependencies | TypeORM | Generate conventions-data.md |
| `sequelize` in package.json dependencies | Sequelize | Generate conventions-data.md |
| `mongoose` in package.json dependencies | Mongoose | Generate conventions-data.md |
| `drizzle-orm` in package.json dependencies | Drizzle ORM | Generate conventions-data.md |
| `firebase` / `@react-native-firebase` | Firebase | Generate conventions-data.md (lightweight) |
| `sqlite` / `realm` / `@realm/react` | SQLite/Realm | Generate conventions-data.md (lightweight) |
| `core-data` in iOS project | Core Data | Generate conventions-data.md |
| `room` in Android project | Room Persistence | Generate conventions-data.md |
| None detected | - | **Skip** conventions-data.md |

**Step 3: Report Decision**
```
Platform: {platform_id}
Type: {platform_type}
Framework: {framework}
Data Layer Detected: {yes/no/technology}
Generate conventions-data.md: {yes/no}
```

## Workflow

```mermaid
flowchart TD
    Start([Start]) --> Step0[Step 0: Read Document Templates]
    Step0 --> Step1[Step 1: Read Configuration Files]
    Step1 --> Step2[Step 2: Extract Technology Stack]
    Step2 --> Step3[Step 3: Analyze Conventions]
    Step3 --> Step4[Step 4: Invoke UI Style Analysis]
    Step4 --> Step5[Step 5: Generate Documents]
    Step5 --> Step6[Step 6: Write Output Files]
    Step6 --> Step7[Step 7: Generate Analysis Coverage Report]
    Step7 --> Step8[Step 8: Report Results]
    Step8 --> End([End])
```

### Step 0: Read Document Templates

Before processing, read all template files to understand the required content structure for each document type:
- **Read**: `templates/INDEX-TEMPLATE.md` - Platform overview and navigation hub structure
- **Read**: `templates/TECH-STACK-TEMPLATE.md` - Technology stack details structure
- **Read**: `templates/ARCHITECTURE-TEMPLATE.md` - Architecture patterns and conventions structure
- **Read**: `templates/CONVENTIONS-DESIGN-TEMPLATE.md` - Design principles and patterns structure
- **Read**: `templates/CONVENTIONS-DEV-TEMPLATE.md` - Development conventions structure
- **Read**: `templates/CONVENTIONS-TEST-TEMPLATE.md` - Testing conventions structure
- **Read**: `templates/CONVENTIONS-BUILD-TEMPLATE.md` - Build and deployment conventions structure
- **Read**: `templates/CONVENTIONS-DATA-TEMPLATE.md` - Data layer conventions structure (if applicable)
- **Purpose**: Understand each template's chapters and example content requirements
- **Key principle**: Extract information from source code according to template section requirements

### Step 1: Read Configuration Files

Read and parse all configuration files for the platform:

**Primary Config Files:**
- package.json / pom.xml / requirements.txt / pubspec.yaml / go.mod
- tsconfig.json / jsconfig.json
- Build config: vite.config.* / webpack.config.* / next.config.* / nest-cli.json

**Convention Files:**
- ESLint: .eslintrc.* / eslint.config.*
- Prettier: .prettierrc.* / prettier.config.*
- Testing: jest.config.* / vitest.config.* / pytest.ini
- Git: .gitignore, .gitattributes

### Step 2: Extract Technology Stack

Parse configuration files to extract:

**Core Framework:**
- Name and version from dependencies
- Primary language (TypeScript, JavaScript, Dart, etc.)

**Dependencies:**
- Production dependencies (grouped by purpose)
- Development dependencies
- Key library versions

**Build Tools:**
- Bundler (Vite, Webpack, Rollup)
- Transpiler (TypeScript, Babel)
- Task runner (npm scripts, Gradle, Maven)

**Example Extraction:**
```json
{
  "framework": "React",
  "framework_version": "18.2.0",
  "language": "TypeScript",
  "language_version": "5.3.0",
  "build_tool": "Vite 5.0.0",
  "key_dependencies": [
    { "name": "react-router-dom", "version": "6.20.0", "purpose": "Routing" },
    { "name": "zustand", "version": "4.4.0", "purpose": "State Management" }
  ]
}
```

### Step 3: Analyze Conventions

1. **Read Configuration**:
   - Read `speccrew-workspace/docs/rules/mermaid-rule.md` - Get Mermaid diagram compatibility guidelines

2. **Extract conventions from configuration files:**

**From ESLint Config:**
- Enabled rules
- Code style preferences
- Import/export patterns

**From Prettier Config:**
- Formatting rules (semi, quotes, tabWidth)
- Print width

**From Project Structure:**
- Directory conventions (src/, components/, utils/)
- File naming patterns
- Module organization

3. **Apply Mermaid Rules**:
   - Follow compatibility guidelines from `mermaid-rule.md`
   - See: [Mermaid Diagram Guide](#mermaid-diagram-guide)

### Domain-Specific Convention Extraction (MANDATORY)

In addition to the general conventions above, you MUST actively search for and extract the following domain-specific topics. These are critical for downstream Agents (solution, design, development, testing).

**For Frontend Platforms (web-vue, mobile-uniapp, etc.):**

| Topic | What to Search For | Where to Look |
|-------|-------------------|---------------|
| **i18n/Internationalization** | i18n framework config, locale files, translation key patterns | `locales/`, `i18n/`, `lang/`, package.json deps |
| **Authorization & Permissions** | Permission directives (`v-hasPermi`), route guards, permission stores | `permission/`, `router/`, `store/`, `utils/auth` |
| **Menu Registration** | Menu config, dynamic menu loading, menu-to-route mapping | `router/`, `store/`, `layout/`, API calls for menus |
| **Data Dictionary** | Dict components (`DictTag`), dict stores, dict API calls | `components/Dict`, `utils/dict`, `store/` |
| **Logging** | Error reporting service, console policy, error boundaries | `utils/log`, `plugins/sentry`, error handling config |
| **API Request Layer** | Axios/fetch instance, interceptors, token refresh, base URL config | `utils/request`, `api/`, `config/`, `interceptors/` |
| **Data Validation** | Form validation rules, custom validators, validation timing | `utils/validate`, form schemas, component props validation |
| **File Upload** | Upload components, upload API calls, file size limits | `components/Upload`, `api/file`, `utils/upload` |

**For Backend Platforms (backend-spring, etc.):**

| Topic | What to Search For | Where to Look |
|-------|-------------------|---------------|
| **Authorization & Permissions** | `@PreAuthorize`, `@DataPermission`, security config, permission enums | Security config, controller annotations, framework modules |
| **Data Dictionary** | Dict entity, dict service, dict cache, dict enum patterns | `dict/`, `system/` module, enum classes |
| **Multi-tenancy** | Tenant interceptor/plugin, tenant column, tenant context, `@TenantIgnore` | MyBatis plugins, framework config, base entity |
| **Backend i18n** | messages.properties, MessageSource, i18n config, ValidationMessages | `resources/i18n/`, `messages*.properties`, i18n config beans |
| **Logging** | Logger usage, log config (logback.xml/log4j2), operation log annotation, audit trail | `logback*.xml`, `log4j2*.xml`, `@OperateLog`, `operatelog/` module |
| **Exception Handling** | GlobalExceptionHandler, business exceptions, error codes, error response format | `handler/`, `exception/`, `enums/ErrorCode`, `GlobalExceptionHandler` |
| **Caching** | @Cacheable, RedisTemplate, cache key patterns, cache config | `cache/`, `redis/`, `CacheConfig`, `@Cacheable` annotations |
| **Data Validation** | @Valid, @Validated, custom validators, validation groups | DTO classes, `validator/`, `@NotNull/@Size` patterns |
| **Scheduled Jobs** | @Scheduled, Quartz config, XXL-Job handler, cron expressions | `job/`, `task/`, `schedule/`, `@Scheduled` methods |
| **File Storage** | FileService, upload API, OSS/S3 config, file path patterns | `file/`, `infra/file/`, `FileClient`, storage config |

**If a topic is not found in the source code**, explicitly state "Not applicable" in the corresponding template section. Do NOT leave the section empty or skip it silently.

### Analysis Tracking (MANDATORY)

During Step 3, you MUST maintain an internal tracking record for each topic you search. For every topic in the tables above:

1. **Search** the source code using the "Where to Look" paths
2. **Record** the result:
   - `found` — Topic implementation found, relevant files identified
   - `not_found` — Searched all suggested paths, no implementation exists
   - `partial` — Some aspects found but incomplete
3. **List** all files you actually read/analyzed for that topic

This tracking data will be used in Step 8 to generate the analysis coverage report. Do NOT skip any topic — if a topic is not applicable to this platform type, record it as `not_found` with a note.

**Topic Checklist by Platform Type:**

**Frontend Topics (web, mobile, desktop):**
1. i18n / Internationalization
2. Authorization & Permissions
3. Menu Registration & Routing
4. Data Dictionary Usage
5. Logging & Error Reporting
6. API Request Layer (Axios/fetch)
7. Data Validation
8. File Upload & Storage
9. UI Style System (handled in Step 4)

**Backend Topics (backend):**
1. Backend Internationalization
2. Authorization & Permissions (annotations, data permission)
3. Data Dictionary Management
4. Logging & Audit Trail
5. Exception Handling & Error Codes
6. Caching Strategy
7. Data Validation (JSR 380, custom validators)
8. Scheduled Jobs & Task Scheduling
9. File Storage
10. Multi-tenancy

### Step 4: UI Style Analysis (Frontend Platforms Only) - WITH FALLBACK

If `platform_type` is `web`, `mobile`, or `desktop`:

**Directory Ownership**:
- `ui-style/` — Fully managed by techs pipeline (this skill)
  - Contains: ui-style-guide.md, styles/, page-types/, components/, layouts/
  - Source: Framework-level design system analysis from source code
- `ui-style-patterns/` — Managed by bizs pipeline (Stage 3.5: bizs-ui-style-extract)
  - Contains: Business pattern aggregation from feature documents
  - NOT created or written by this skill
  - May not exist if bizs pipeline has not been executed

**Primary Path (UI Analyzer Available and Succeeds)**:
1. **CRITICAL**: Use the Skill tool to invoke `speccrew-knowledge-techs-ui-analyze` with these exact parameters:
   ```
   skill: "speccrew-knowledge-techs-ui-analyze"
   args: "source_path={source_path};platform_id={platform_id};platform_type={platform_type};framework={framework};output_path={output_path}/ui-style/;language={language}"
   ```

2. **Wait for completion** and verify output files exist:
   - `{output_path}/ui-style/ui-style-guide.md` ✓
   - `{output_path}/ui-style/page-types/page-type-summary.md` ✓
   - `{output_path}/ui-style/page-types/[type]-pages.md` (one per discovered type) ✓
   - `{output_path}/ui-style/components/component-library.md` ✓
   - `{output_path}/ui-style/components/common-components.md` ✓
   - `{output_path}/ui-style/components/business-components.md` ✓
   - `{output_path}/ui-style/layouts/page-layouts.md` ✓
   - `{output_path}/ui-style/layouts/navigation-patterns.md` ✓
   - `{output_path}/ui-style/styles/color-system.md` ✓
   - `{output_path}/ui-style/styles/typography.md` ✓
   - `{output_path}/ui-style/styles/spacing-system.md` ✓

3. If all outputs verified → proceed to next step
4. Record: `ui_style_analysis_level = "full"`

**Secondary Path (UI Analyzer Fails or Partial Output)**:

**MANDATORY: UI Style Fallback Path - Complete Directory Structure**

When UI Style Analyzer fails or produces incomplete output, you MUST create ALL of the following directories and files. Skipping ANY item is FORBIDDEN.

**Required Directory Structure (MANDATORY - ALL items must be created):**
```
ui-style/
├── ui-style-guide.md              ← MANDATORY
├── page-types/
│   └── page-type-summary.md       ← MANDATORY
├── components/
│   └── component-library.md       ← MANDATORY
├── layouts/
│   └── page-layouts.md            ← MANDATORY
└── styles/
    └── color-system.md            ← MANDATORY
```

**Self-Verification Checklist (MUST complete before reporting success):**
- [ ] ui-style/ui-style-guide.md exists and has content
- [ ] ui-style/page-types/page-type-summary.md exists and has content
- [ ] ui-style/components/component-library.md exists and has content
- [ ] ui-style/layouts/page-layouts.md exists and has content
- [ ] ui-style/styles/color-system.md exists and has content

If ANY file in the checklist is missing, you MUST create it before proceeding to the next step. Do NOT report "completed" with missing files.

**Execution Steps:**

1. Create ui-style directory structure:
   `{output_path}/ui-style/`, `{output_path}/ui-style/page-types/`, `{output_path}/ui-style/components/`, `{output_path}/ui-style/layouts/`, `{output_path}/ui-style/styles/`

2. Generate minimal ui-style-guide.md by manually scanning source code:
   - Design system: identify UI framework from dependencies (Material UI, Ant Design, Tailwind, etc.)
   - Color system: scan for CSS variables, theme files, or color constants in `{source_path}/src/styles/` or `{source_path}/src/theme/`
   - Typography: scan for font-family declarations
   - Component library: list directories under `{source_path}/src/components/`
   - Page types: list directories/files under `{source_path}/src/pages/` or `{source_path}/src/views/`

3. Content structure for minimal ui-style-guide.md:
   ```markdown
   # UI Style Guide - {platform_id}
   
   > Note: Generated from manual source code inspection. Automated UI analysis was unavailable.
   
   ## Design System
   - UI Framework: {detected from package.json}
   - CSS Approach: {CSS Modules / Tailwind / styled-components / SCSS - detected from config}
   
   ## Component Library Overview
   {list component directories found}
   
   ## Page Types Identified
   {list page directories/files found}
   
   ## Styling Configuration
   {extract from tailwind.config / theme file / CSS variables file}
   ```

4. **MANDATORY: UI Style Fallback - Copy Template + Fill Workflow**

   For each ui-style sub-document, copy the template and use search_replace to fill:

   **4.1 component-library.md**:
   - Copy `templates/COMPONENT-LIBRARY-TEMPLATE.md` to `{output_path}/ui-style/components/component-library.md`
   - Use search_replace to fill each AI-TAG section with data extracted from source code
   - MUST include props tables for at least the top 5 most-used components
   - Fill: COMPONENT_CATEGORIES, API_REFERENCE, COMPOSITION_PATTERNS, AGENT_GUIDE sections

   **4.2 page-layouts.md**:
   - Copy `templates/PAGE-LAYOUTS-TEMPLATE.md` to `{output_path}/ui-style/layouts/page-layouts.md`
   - Fill layout types, slots, responsive behavior from source analysis
   - Fill: LAYOUT_TYPES, LAYOUT_DETAILS, NAVIGATION sections

   **4.3 page-type-summary.md**:
   - Copy `templates/PAGE-TYPE-SUMMARY-TEMPLATE.md` to `{output_path}/ui-style/page-types/page-type-summary.md`
   - Fill page classifications and routing conventions
   - Fill: PAGE_TYPES, PAGE_TYPE_DETAILS, ROUTING sections

   **4.4 color-system.md**:
   - Copy `templates/COLOR-SYSTEM-TEMPLATE.md` to `{output_path}/ui-style/styles/color-system.md`
   - Fill theme colors, functional colors, typography from CSS/SCSS variables
   - Fill: THEME_COLORS, FUNCTIONAL_COLORS, SEMANTIC_TOKENS, TYPOGRAPHY, SPACING sections

5. Record: `ui_style_analysis_level = "minimal"`

**Tertiary Path (No UI Analysis Possible)**:
If source code scanning also fails (e.g., non-standard structure):
1. Create `{output_path}/ui-style/ui-style-guide.md` with references only:
   ```markdown
   # UI Style Guide - {platform_id}
   
   > Note: Automated and manual UI analysis were not possible for this platform.
   > Manual inspection of source code is required.
   
   ## References
   - Source components: {source_path}/src/components/ (if exists)
   - Source pages: {source_path}/src/pages/ (if exists)
   - Style files: {source_path}/src/styles/ (if exists)
   - Package dependencies: {source_path}/package.json
   ```
2. Record: `ui_style_analysis_level = "reference_only"`

**In conventions-design.md, ALWAYS include UI reference section**:
Regardless of analysis level, conventions-design.md MUST contain:
```markdown
## UI Design Conventions

Refer to [UI Style Guide](ui-style/ui-style-guide.md) for design system details.

Analysis completeness: {ui_style_analysis_level}
- full: Complete automated analysis available
- minimal: Manual inspection results only
- reference_only: Source file references only - manual review needed
```

### Step 5: Generate Documents (MANDATORY: Copy Template + Fill)

**CRITICAL**: This step MUST follow the template fill workflow - copy template first, then fill sections.

1. **For Each Document, Follow This Workflow**:

   **Step 5.1: Copy Template File**
   - Copy the corresponding template file to the output path:
     - `templates/INDEX-TEMPLATE.md` → `{output_path}/INDEX.md`
     - `templates/TECH-STACK-TEMPLATE.md` → `{output_path}/tech-stack.md`
     - `templates/ARCHITECTURE-TEMPLATE.md` → `{output_path}/architecture.md`
     - `templates/CONVENTIONS-DESIGN-TEMPLATE.md` → `{output_path}/conventions-design.md`
     - `templates/CONVENTIONS-DEV-TEMPLATE.md` → `{output_path}/conventions-dev.md`
     - `templates/CONVENTIONS-TEST-TEMPLATE.md` → `{output_path}/conventions-test.md`
     - `templates/CONVENTIONS-BUILD-TEMPLATE.md` → `{output_path}/conventions-build.md`
     - `templates/CONVENTIONS-DATA-TEMPLATE.md` → `{output_path}/conventions-data.md` (if applicable)

   **Step 5.2: Fill Template Sections with search_replace**
   - Use `search_replace` tool to fill each section of the template
   - Replace placeholder content with actual analyzed data
   - Follow [Document Structure Standard](#document-structure-standard)
   - Apply [Source Traceability Requirements](#source-traceability-requirements)

   **MANDATORY RULES**:
   - **Do NOT use create_file to rewrite the entire document**
   - **Do NOT delete or skip any template section**
   - Only replace the placeholder content within each section
   - Preserve all template section headers and structure

2. **Document Generation Order**:
   - Generate: INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-test.md, conventions-build.md, conventions-data.md (if applicable)

### Step 6: Write Output Files

Create output directory if not exists, then write all generated documents.

### Step 7: Generate Analysis Coverage Report (MANDATORY)

After completing all document generation, you MUST create an analysis coverage report as a JSON file.

**Output file**: `{completed_dir}/{platform_id}.analysis.json`

Where `{completed_dir}` is the directory passed via the `completed_dir` parameter (if provided). If `completed_dir` is not provided, output to the platform's knowledges directory.

**Report Format**:

```json
{
  "platform_id": "{platform_id}",
  "platform_type": "{platform_type}",
  "analyzed_at": "{ISO 8601 timestamp}",
  "topics": {
    "i18n": {
      "status": "found",
      "files_analyzed": ["src/i18n/index.ts", "locales/zh-CN.ts"],
      "notes": "Vue I18n with 2 locale files"
    },
    "authorization": {
      "status": "found",
      "files_analyzed": ["src/permission/index.ts", "src/router/guard.ts"],
      "notes": "RBAC with route guards and v-hasPermi directive"
    },
    "data_dictionary": {
      "status": "not_found",
      "files_analyzed": [],
      "notes": "No dictionary implementation found in suggested paths"
    }
  },
  "config_files_analyzed": [
    "package.json",
    "vite.config.ts",
    "tsconfig.json"
  ],
  "source_dirs_scanned": [
    "src/components/",
    "src/views/",
    "src/utils/",
    "src/store/"
  ],
  "documents_generated": [
    "INDEX.md",
    "tech-stack.md",
    "architecture.md",
    "conventions-dev.md",
    "conventions-design.md",
    "conventions-test.md",
    "conventions-build.md"
  ],
  "coverage_summary": {
    "topics_found": 7,
    "topics_partial": 1,
    "topics_not_found": 1,
    "topics_total": 9,
    "coverage_percent": 78
  }
}
```

**Rules**:
- Every topic from the Topic Checklist in Step 3 MUST appear in the `topics` object
- `files_analyzed` MUST list the actual file paths you read (relative to source_path)
- `status` MUST be one of: `found`, `not_found`, `partial`
- `coverage_percent` = (topics_found + topics_partial) / topics_total * 100, rounded to integer
- `documents_generated` MUST list all .md files actually created
- Use `create_file` to write this JSON file (this is the ONE exception where create_file is allowed — for JSON output files)

### Step 8: Report Results

```
Platform Technology Documents Generated: {{platform_id}}
- INDEX.md: ✓
- tech-stack.md: ✓
- architecture.md: ✓
- conventions-design.md: ✓
- conventions-dev.md: ✓
- conventions-test.md: ✓
- conventions-build.md: ✓
- conventions-data.md: ✓ (or skipped if not applicable)
- ui-style-guide.md: ✓ (frontend platforms only, analysis level: {{ui_style_analysis_level}})
- {{platform_id}}.analysis.json: ✓ (analysis coverage report)
- Output Directory: {{output_path}}
- Analysis Report: {{completed_dir}}/{{platform_id}}.analysis.json (or knowledges dir if completed_dir not provided)
```

---

## Reference Guides

### Mermaid Diagram Guide

When generating Mermaid diagrams, follow these compatibility guidelines:

**Key Requirements:**
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` syntax only

**Diagram Types:**

| Diagram Type | Use Case | Example Scenario |
|--------------|----------|------------------|
| `graph TB/LR` | Structure & Dependency | Module relationships, component hierarchy |
| `flowchart TD` | Business Logic Flow | Request processing, decision trees |
| `sequenceDiagram` | Interaction Flow | API calls, service communication |
| `classDiagram` | Class Structure | Entity relationships, inheritance |
| `erDiagram` | Database Schema | Table relationships, data model |
| `stateDiagram-v2` | State Machine | Order status, workflow states |

### Source Traceability Requirements

**CRITICAL: All source file links MUST use RELATIVE PATHS. Absolute paths and `file://` protocol are STRICTLY FORBIDDEN.**

**FORBIDDEN:**
- ❌ Do NOT use absolute paths (e.g., `d:/dev/ruoyi-vue-pro/...`)
- ❌ Do NOT use `file://` protocol (e.g., `file://d:/dev/...`)
- ❌ Do NOT hardcode machine-specific paths
- ✅ ALWAYS use relative paths calculated from the document's location

**Dynamic Relative Path Calculation:**

Documents are located at: `speccrew-workspace/knowledges/techs/{platform_id}/{document}.md`
This is 4 levels deep from the project root:
  - speccrew-workspace (1)
  - knowledges (2)
  - techs (3)
  - {platform_id} (4)

Therefore, to reference a source file from the project root, use `../../../../` as the prefix.

Example calculation:
  - Document: `speccrew-workspace/knowledges/techs/backend-spring/architecture.md`
  - Source file: `yudao-server/src/main/java/.../YudaoServerApplication.java`
  - Relative path: `../../../../yudao-server/src/main/java/.../YudaoServerApplication.java`

For root INDEX.md (one level less deep):
  - Document: `speccrew-workspace/knowledges/techs/INDEX.md`
  - Prefix: `../../../` (3 levels)

**1. File Reference Block (`<cite>`)**

Place at the beginning of each document:

```markdown
<cite>
**Files Referenced in This Document**
- [package.json](../../../../yudao-ui/yudao-ui-admin-vue3/package.json)
- [tsconfig.json](../../../../yudao-ui/yudao-ui-admin-vue3/tsconfig.json)
</cite>
```

**2. Diagram Source Annotation**

After each Mermaid diagram:

```markdown
**Diagram Source**
- [file-name.ext](../../../../yudao-server/src/main/java/...#L10-L50)
```

**3. Section Source Annotation**

At the end of each major section:

```markdown
**Section Source**
- [file-name.ext](../../../../yudao-server/src/main/java/...#L10-L50)
```

For generic guidance sections without specific file references:

```markdown
[This section provides general guidance, no specific file reference required]
```

### Document Structure Standard

All generated documents must follow this structure:

```markdown
# {{platform_name}} {{document_type}}

<cite>
**Files Referenced in This Document**
{{source_files}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}, devcrew-test-{{platform_id}}

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

... content sections ...

**Section Source**
- [file.ext](../../../../path/to/file#Lstart-Lend)
```

### Document Content Specifications

#### INDEX.md

Platform overview and navigation hub.

**Content:**
- Platform summary (type, framework, language)
- Technology stack overview
- Quick links to all convention documents
- Agent usage guide

#### tech-stack.md

Detailed technology stack information.

**Sections:**
- Overview (framework, language, build tool)
- Core Technologies (table with versions)
- Dependencies (grouped by category)
  - UI/Framework
  - State Management
  - Routing
  - HTTP/API
  - Utilities
- Development Tools
- Configuration Files (list with paths)

#### architecture.md

Architecture patterns and conventions.

**Sections (Platform-Specific):**

**For Web (React/Vue/Angular):**
- Component Architecture (Atomic Design, Container/Presentational)
- State Management Patterns
- Routing Conventions
- API Integration Patterns
- Styling Approach

**For Backend (NestJS/Spring/Express):**
- Layered Architecture (Controller/Service/Repository)
- Dependency Injection
- Module Organization
- API Design Patterns
- Middleware/Interceptor Usage

**For Mobile (Flutter/React Native):**
- Widget/Component Structure
- State Management
- Navigation Patterns
- Platform-Specific Considerations

#### conventions-design.md

Design principles and patterns for detailed design.

**Sections:**
- Design Principles (SOLID, DRY, etc.)
- Component/Module Design Patterns
- **UI Design Conventions** (frontend platforms - reference ui-style analysis)
  - Link to `ui-style/ui-style-guide.md`
  - Link to `ui-style/page-types/page-type-summary.md`
- Data Flow Design
- Error Handling Patterns
- Security Considerations
- Performance Guidelines

#### conventions-dev.md

Development conventions for coding.

**Sections (MUST INCLUDE)**:

1. Naming Conventions
   - File naming (with actual examples from project: e.g., UserProfile.tsx, userProfile.utils.ts)
   - Variable/function naming with GOOD/BAD examples
   - Class/component naming for platform
   - Constants naming (SCREAMING_SNAKE_CASE or UPPER_CAMEL_CASE - which does project use?)

2. Directory Structure
   - Visual tree (actual from src/ - scan and present real structure)
   - What goes where guide:
     | Directory | Purpose | Naming Pattern |
     |-----------|---------|---------------|
     | components/ | Reusable UI components | PascalCase.tsx |
     | pages/ | Page-level components | PascalCase.tsx |
     | hooks/ | Custom hooks | useXxx.ts |
     | utils/ | Utility functions | camelCase.ts |
     | services/ | API services | xxxService.ts |
   - Module-level organization patterns

3. Code Style (Extracted from ESLint/Prettier configs)

   MUST extract these specific fields:

   **From Prettier/EditorConfig**:
   | Setting | Value | Example |
   |---------|-------|---------|
   | Indentation | {tabs/spaces} {width} | (extract from .prettierrc or .editorconfig) |
   | Quote style | {single/double} | ✓ const s = 'hello' |
   | Semicolons | {always/never} | ✓ const x = 1; |
   | Line width | {number} | Max {n} characters per line |
   | Trailing comma | {all/es5/none} | ✓ [a, b, c,] |
   | Arrow parens | {always/avoid} | ✓ (x) => x |

   **From ESLint**:
   - Key enabled rules (no-unused-vars, no-console, etc.)
   - Parser settings (ecmaVersion, sourceType)
   - Environment settings (node, browser, es6)

   **GOOD vs BAD Code Examples** (generate 3-5 examples based on actual rules):
   ```
   ✓ GOOD: const userName = 'Alice';
   ✗ BAD:  var user_name = "Alice";
   Reason: Use const, camelCase naming, single quotes (from .prettierrc)
   ```

4. Import/Export Patterns
   - ES Modules vs CommonJS (which does project use?)
   - Barrel exports rules (index.ts patterns - does project use them?)
   - Relative vs absolute imports (path aliases from tsconfig/vite.config?)
   - Import ordering rules (from eslint-plugin-import config if present)

5. Git Commit Conventions
   - Message format (Conventional Commits? Semantic? Custom? - detect from commitlint config or .commitlintrc)
   - Commit scope examples relevant to this project
   - Branch naming convention (if detected from git hooks or CI config)

6. Pre-Development Checklist (NEW - critical for Dev Agent onboarding)
   - [ ] Runtime version check: extract from .nvmrc / .node-version / package.json engines / .python-version / .java-version
   - [ ] Dependency installation command: npm install / yarn / pnpm install / mvn install / pip install -r requirements.txt
   - [ ] Local dev server startup command: extract from package.json scripts.dev / scripts.start / Makefile
   - [ ] Environment variables needed: list .env.local template variables (from .env.example if exists)
   - [ ] Pre-commit hooks check: detect husky / lint-staged / pre-commit config
   - [ ] IDE plugins recommended: based on tech stack (ESLint plugin, Prettier plugin, etc.)

7. Code Review Checklist
   - [ ] Linting passed: {actual lint command from package.json}
   - [ ] Formatting consistent: {actual format command}
   - [ ] Type safety: {TypeScript strict mode / type checking command}
   - [ ] Tests written and passing: {actual test command}
   - [ ] Naming follows conventions (Section 1)
   - [ ] No hardcoded secrets or sensitive data
   - [ ] Documentation updated for public APIs

**Source extraction rules**:
- Prettier config: .prettierrc, .prettierrc.js, .prettierrc.json, prettier.config.js
- ESLint config: .eslintrc.js, .eslintrc.json, eslint.config.js (flat config)
- EditorConfig: .editorconfig
- Git hooks: .husky/, .git/hooks/, .pre-commit-config.yaml, lint-staged config in package.json
- Commit conventions: .commitlintrc, commitlint.config.js
- Runtime version: .nvmrc, .node-version, package.json engines, .tool-versions
- IDE config: .vscode/extensions.json, .idea/ settings

#### conventions-test.md

Testing conventions and requirements.

**Sections (MUST INCLUDE)**:

1. Unit Testing
   - Framework (Jest/Vitest/pytest/JUnit/Go testing/etc.)
   - Test file naming convention (*.test.ts vs *.spec.ts - extract from config)
   - Test file location (co-located vs __tests__/ directory)
   - Minimal test template with assertions (provide actual code example)
   - Run command: extract from package.json scripts or project config

2. Integration Testing
   - When to write integration tests (API integration, module boundaries)
   - Test data management:
     - Fixtures location and format
     - Seeding approach (factory functions, JSON fixtures, SQL scripts)
   - Mock external services strategy:
     - HTTP mocking tool (nock/msw/WireMock/mockito)
     - When to mock vs when to use real services

3. E2E Testing (CONDITIONAL: frontend/mobile platforms ONLY)
   - E2E framework (Cypress/Playwright/Appium/Detox - detect from dependencies)
   - Browser/device compatibility matrix:
     | Browser/Device | Required | Notes |
     |--------|----------|-------|
   - Critical user flow scenarios to cover
   - Run command (e.g., npm run test:e2e)
   - CI environment considerations (headless mode, timeouts)
   - If NO E2E framework detected: note "E2E framework not configured. Recommend: [Playwright/Cypress] based on {framework}"

4. Database Testing (CONDITIONAL: backend platforms ONLY)
   - Database isolation strategy (transaction rollback / separate test DB / in-memory DB)
   - Migration testing (schema upgrade verification)
   - Fixture management (location, format, seeding commands)
   - Query verification approach (EXPLAIN PLAN usage)
   - If NO database detected: SKIP this section

5. Performance Testing
   - Key metrics to monitor:
     - Frontend: FCP, LCP, TTI, bundle size
     - Backend: API response time (p50/p95/p99), throughput
   - Load testing tool (k6/Artillery/JMeter/wrk - detect from dependencies or note recommendation)
   - Baseline expectations (document actual values if found in config, else recommend defaults)
   - When to run (pre-release, nightly, on-demand)

6. Coverage Requirements
   - Target coverage percentage (extract from jest.config/vitest.config/pytest.ini/.coveragerc)
   - If not configured: recommend industry defaults (80% statements, 70% branches)
   - Critical paths priority list
   - Local coverage check command (e.g., npm run test:coverage)
   - Coverage reporting tool (istanbul/c8/coverage.py/JaCoCo)

7. Testing Troubleshooting
   - Common failure scenarios and resolutions (platform-specific)
   - Debugging test failures (breakpoint setup, verbose logging)
   - Flaky test detection and investigation approach
   - Test environment reset procedures

**Source extraction rules**:
- Test framework: from package.json devDependencies / pom.xml test scope / requirements-dev.txt
- E2E framework: from cypress.config.*, playwright.config.*, detox config
- Coverage config: from jest.config (coverageThreshold), vitest.config, .coveragerc, jacoco-maven-plugin
- Performance tools: from package.json devDependencies (k6, artillery, lighthouse)
- Database test config: from test configuration files, docker-compose.test.yml

#### conventions-build.md

Build & Deployment Conventions.

**Required**: YES (all platform types)

**Sections (MUST INCLUDE)**:

1. Build Tool & Configuration
   - Primary build tool (Vite/Webpack/Rollup/Maven/Gradle/Go build/Cargo etc.)
   - Main config file path and key settings
   - Build commands reference table:
     | Command | Purpose | Example |
     |---------|---------|---------|
     | dev     | Start development server | npm run dev |
     | build   | Production build | npm run build |
     | preview | Preview production build | npm run preview |

2. Environment Management
   - Environment files (.env, .env.local, .env.production, application.yml, application-dev.yml)
   - Environment variable naming conventions (VITE_ prefix / NEXT_PUBLIC_ prefix / spring profiles)
   - Environment differences table:
     | Setting | Development | Staging | Production |
     |---------|-------------|---------|------------|
     | API URL | localhost   | staging-api | prod-api |
   - Sensitive config handling (secrets, API keys - what NOT to commit)

3. Build Profiles & Outputs
   - Build modes (development/production/test)
   - Output directory and structure (dist/, build/, target/)
   - Optimization strategies (code splitting, tree shaking, minification, source maps)
   - Bundle size considerations (if frontend)

4. CI/CD Pipeline Conventions (conditional: if CI config files detected)
   - CI config file paths (.github/workflows/, Jenkinsfile, .gitlab-ci.yml)
   - Pipeline stages definition (lint → test → build → deploy)
   - Deployment targets and trigger conditions
   - If NO CI config detected: note "CI/CD pipeline not configured in repository"

5. Docker & Container (conditional: if Dockerfile detected)
   - Dockerfile path and build command
   - Image naming convention
   - docker-compose configuration (if exists)
   - If NO Dockerfile detected: SKIP this section entirely

6. Dependency Management
   - Package manager (npm/yarn/pnpm/maven/gradle/pip/go mod)
   - Lock file strategy (committed? .gitignore'd?)
   - Dependency upgrade workflow
   - Compatibility checking approach

**Source extraction rules**:
- Build tool: from package.json scripts / pom.xml plugins / build.gradle / Makefile / Cargo.toml
- Environment files: scan for .env*, application*.yml, application*.properties
- CI config: scan for .github/workflows/*.yml, Jenkinsfile, .gitlab-ci.yml, .circleci/config.yml
- Docker: scan for Dockerfile, docker-compose*.yml
- Package manager: detect from lock files (package-lock.json → npm, yarn.lock → yarn, pnpm-lock.yaml → pnpm)

#### conventions-data.md (Optional)

Data layer conventions (if applicable).

**Sections:**
- ORM/Database Tool
- Data Modeling Conventions
- Migration Patterns
- Query Optimization
- Caching Strategies

---

## Template Usage

### Template Reference

All templates are unified and located in `templates/` directory:

| Template File | Purpose |
|---------------|---------|
| `templates/INDEX-TEMPLATE.md` | Platform overview and navigation hub |
| `templates/TECH-STACK-TEMPLATE.md` | Technology stack details |
| `templates/ARCHITECTURE-TEMPLATE.md` | Architecture patterns and conventions |
| `templates/CONVENTIONS-DESIGN-TEMPLATE.md` | Design principles and patterns |
| `templates/CONVENTIONS-DEV-TEMPLATE.md` | Development conventions |
| `templates/CONVENTIONS-TEST-TEMPLATE.md` | Testing conventions |
| `templates/CONVENTIONS-BUILD-TEMPLATE.md` | Build and deployment conventions |
| `templates/CONVENTIONS-DATA-TEMPLATE.md` | Data layer conventions |

Platform-specific content is generated dynamically based on:
- Platform type (web, mobile, backend, desktop)
- Framework (react, vue, springboot, etc.)
- Analyzed configuration files

## Document Generation Guidelines

### Be Specific

Extract actual values from config files:
- ✓ "React 18.2.0" (from package.json)
- ✗ "React (version varies)"

### Be Concise

Focus on actionable conventions:
- ✓ "Use PascalCase for component files: UserProfile.tsx"
- ✗ "There are many naming conventions to consider..."

### Include Examples

Wherever possible, include concrete examples:
```markdown
### Component Naming
- ✓ UserProfile.tsx
- ✓ OrderList.tsx
- ✗ userProfile.tsx
- ✗ order-list.tsx
```

## Checklist

### Pre-Generation
- [ ] All configuration files read and parsed
- [ ] Technology stack extracted accurately
- [ ] Conventions analyzed from config files

### Document Generation Decision
- [ ] Platform type identified (web/mobile/backend/desktop/api)
- [ ] Data layer detection completed for non-backend platforms
- [ ] Decision made on whether to generate conventions-data.md
  - [ ] Backend platform → Always generate
  - [ ] Other platforms → Generate only if data layer detected

### Required Documents (All Platforms)
- [ ] INDEX.md generated with navigation
- [ ] tech-stack.md generated with dependency tables
- [ ] architecture.md generated with platform-specific patterns
- [ ] conventions-design.md generated with design principles
- [ ] conventions-dev.md generated with naming and style rules
- [ ] conventions-test.md generated with testing requirements
- [ ] conventions-build.md generated with build and deployment conventions

### Optional Document
- [ ] conventions-data.md generated (only if applicable per platform type mapping)

### UI Style Analysis (Frontend Platforms - web/mobile/desktop)
- [ ] For web/mobile/desktop platforms: `speccrew-knowledge-techs-ui-analyze` skill invoked with correct parameters
- [ ] `ui-style/ui-style-guide.md` generated
- [ ] `ui-style/page-types/page-type-summary.md` generated
- [ ] `ui-style/page-types/[type]-pages.md` generated (one per discovered page type)
- [ ] `ui-style/components/component-library.md` generated
- [ ] `ui-style/components/common-components.md` generated
- [ ] `ui-style/components/business-components.md` generated
- [ ] `ui-style/layouts/page-layouts.md` generated
- [ ] `ui-style/layouts/navigation-patterns.md` generated
- [ ] `ui-style/styles/color-system.md` generated
- [ ] `ui-style/styles/typography.md` generated
- [ ] `ui-style/styles/spacing-system.md` generated
- [ ] UI conventions properly referenced in `conventions-design.md`

### Quality Checks
- [ ] All files written to output_path
- [ ] **Source traceability**: `<cite>` block added to each document
- [ ] **Source traceability**: Diagram Source annotations added after each Mermaid diagram
- [ ] **Source traceability**: Section Source annotations added at end of major sections
- [ ] **Mermaid compatibility**: No `style`, `direction`, `<br/>`, or nested subgraphs
- [ ] **Document completeness**: Verify all 7 required documents exist (INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-test.md, conventions-build.md)
- [ ] **Analysis Coverage Report**: `{platform_id}.analysis.json` generated with all topics tracked
- [ ] Results reported with conventions-data.md and ui-style-guide.md generation status (including ui_style_analysis_level)

