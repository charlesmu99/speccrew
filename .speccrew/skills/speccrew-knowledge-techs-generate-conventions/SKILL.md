---
name: speccrew-knowledge-techs-generate-conventions
description: Generate technology convention documents (INDEX, tech-stack, architecture, conventions-*) for a specific platform using XML Block workflow. Extracts tech stack, architecture, and development conventions from configuration files and source code. Split from techs-generate for parallel execution with ui-style worker.
tools: Read, Write, Glob, Grep
---

# Stage 2: Generate Platform Convention Documents (XML Block Workflow)

Generate comprehensive convention documentation for a specific platform by analyzing its configuration files and source code structure. This skill focuses on conventions documents only; UI style analysis is handled by the separate techs-generate-ui-style worker.

## Trigger Scenarios

- "Generate convention documents for {platform}"
- "Create tech stack and architecture documentation"
- "Extract development conventions from {platform}"
- "Generate platform conventions docs"
- "Create INDEX, tech-stack, and conventions-* files"

## User

Worker Agent (speccrew-task-worker)

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `${platform_id}` | string | Platform identifier | `"web-react"`, `"backend-nestjs"` |
| `${platform_type}` | string | Platform type | `web`, `mobile`, `backend`, `desktop`, `api` |
| `${framework}` | string | Primary framework | `react`, `nestjs`, `flutter`, etc. |
| `${source_path}` | string | Platform source directory | `"frontend-web"` |
| `${config_files}` | array | List of configuration file paths | `["package.json", "tsconfig.json"]` |
| `${convention_files}` | array | List of convention file paths | `[".eslintrc.js", ".prettierrc"]` |
| `${output_path}` | string | Output directory for generated documents | `speccrew-workspace/knowledges/techs/{platform_id}/` |
| `${language}` | string | Target language for generated content | `"zh"`, `"en"` |
| `${completed_dir}` | string | (Optional) Directory for analysis coverage report output | `speccrew-workspace/iterations/...` |

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `${status}` | string | Generation status: `"success"`, `"partial"`, or `"failed"` |
| `${documents_generated}` | array | List of generated document filenames |
| `${analysis_file}` | string | Path to the analysis coverage report |
| `${message}` | string | Summary message for status update |

## Output

Generate the following documents in `${output_path}/`:

```
${output_path}/
├── INDEX.md                    # Platform technology index (Required)
├── tech-stack.md              # Technology stack details (Required)
├── architecture.md            # Architecture conventions (Required)
├── conventions-design.md      # Design conventions (Required)
├── conventions-dev.md         # Development conventions (Required)
├── conventions-unit-test.md   # Unit testing conventions (Required)
├── conventions-system-test.md # System testing conventions (Required)
├── conventions-build.md       # Build & Deployment conventions (Required)
└── conventions-data.md        # Data conventions (Optional)
```

### Platform Type to Document Mapping

| Platform Type | Required Documents | Optional Documents | Generate conventions-data.md? |
|---------------|-------------------|-------------------|------------------------------|
| `backend` | All 8 docs | - | **Must Generate** - Contains ORM, data modeling, caching strategy |
| `web` | All 8 docs | conventions-data.md | **Conditional** - Only when using ORM/data layer (Prisma, TypeORM, Sequelize, etc.) |
| `mobile` | All 8 docs | conventions-data.md | **Default No** - Based on actual tech stack |
| `desktop` | All 8 docs | conventions-data.md | **Default No** - Based on actual tech stack |
| `api` | All 8 docs | conventions-data.md | **Conditional** - Based on whether data layer exists |

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`



## Constraints

1. **DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.)** under any circumstances
2. **DO NOT analyze files outside the specified `${source_path}`**
3. **All content MUST be in the language specified by `${language}`**
4. **Use `search_replace` for section filling, NEVER rewrite entire document**
5. **Mermaid diagrams MUST follow the rules in `mermaid-rule.md`**
6. **All links MUST use relative paths, NEVER `file://` protocol**
7. **Write each document to file immediately after generation - DO NOT accumulate all documents in memory**
8. **DO NOT create done marker file until ALL required documents have been verified to exist on disk**

## Task Completion Report

When the task is complete, report the following:

**Status:** `success` | `partial` | `failed`

**Summary:**
- Platform: `${platform_id}`
- Type: `${platform_type}`
- Framework: `${framework}`
- Documents generated: 8 required + (1 optional if data layer detected)

**Files Generated:**
- `${output_path}/INDEX.md` - Platform technology index
- `${output_path}/tech-stack.md` - Technology stack details
- `${output_path}/architecture.md` - Architecture conventions
- `${output_path}/conventions-design.md` - Design conventions
- `${output_path}/conventions-dev.md` - Development conventions
- `${output_path}/conventions-unit-test.md` - Unit testing conventions
- `${output_path}/conventions-system-test.md` - System testing conventions
- `${output_path}/conventions-build.md` - Build and deployment conventions
- `${output_path}/conventions-data.md` - Data conventions (optional)
- `${completed_dir}/${platform_id}.analysis-conventions.json` - Analysis coverage report

## Checklist

### Pre-Generation
- [ ] All template files read successfully
- [ ] All configuration files read and parsed
- [ ] Technology stack extracted accurately
- [ ] Conventions analyzed from config files

### Document Generation
- [ ] INDEX.md generated with navigation
- [ ] tech-stack.md generated with dependency tables
- [ ] architecture.md generated with platform-specific patterns
- [ ] conventions-design.md generated with design principles
- [ ] conventions-dev.md generated with naming and style rules
- [ ] conventions-unit-test.md generated with unit testing requirements
- [ ] conventions-system-test.md generated with system testing requirements
- [ ] conventions-build.md generated with build and deployment conventions
- [ ] conventions-data.md generated (only if applicable per platform type mapping)

### Quality Checks
- [ ] All files written to output_path
- [ ] **Source traceability**: File reference block added to each document
- [ ] **Source traceability**: Diagram Source annotations added after each Mermaid diagram
- [ ] **Source traceability**: Section Source annotations added at end of major sections
- [ ] **Mermaid compatibility**: No `style`, `direction`, `<br/>`, or nested subgraphs
- [ ] **Document completeness**: All 8 required documents exist (verified in Step 3)
- [ ] **Done marker integrity**: Done marker only created after verification
- [ ] **Analysis Coverage Report**: `${platform_id}.analysis-conventions.json` generated

## CONTINUOUS EXECUTION RULES

This skill MUST execute continuously without user interruption:

1. **All steps must complete in a single session** - from template reading to done marker creation
2. **If context window is running low**: Save checkpoint and inform user - DO NOT create false done marker
3. **No intermediate user confirmation required** between steps
4. **Error handling**: On error, log details and stop - do not proceed with incomplete data
5. **Verification gate**: Step 3 verification MUST pass before Step 4 done marker creation
6. **Memory management**: Write each document immediately after generation, do not accumulate in memory
