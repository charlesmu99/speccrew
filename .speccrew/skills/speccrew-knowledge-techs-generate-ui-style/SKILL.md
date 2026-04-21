---
name: speccrew-knowledge-techs-generate-ui-style
description: Generate UI style analysis documents for a specific frontend platform using XML workflow blocks. Analyzes page types, components, layouts, and styling conventions from source code. Only applicable to frontend platforms (web, mobile, desktop).
tools: Read, Write, Glob, Grep, Skill
---

# Stage 2: Generate Platform UI Style Documents (XML Workflow)

Generate comprehensive UI style documentation for a specific frontend platform by analyzing its source code structure, components, and styling patterns using XML workflow blocks.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and generate content accordingly.

- User writes in 中文 → Generate Chinese documents, use `language: "zh"`
- User writes in English → Generate English documents, use `language: "en"`
- Other languages → Use the specified language code

## Prerequisite

This skill ONLY applies to frontend platforms. The dispatcher MUST check platform_type before invoking:

- `web` → Execute this skill
- `mobile` → Execute this skill
- `desktop` → Execute this skill
- `backend` → DO NOT invoke this skill
- `api` → DO NOT invoke this skill

## Trigger Scenarios

- "Generate UI style documents for {platform}"
- "Analyze UI components and layouts"
- "Extract design system from {platform}"

## User

Worker Agent (speccrew-task-worker)

---

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

## Output Directory Structure

```
{output_path}/
└── ui-style/
    ├── ui-style-guide.md              # Main UI style guide (Required)
    ├── page-types/
    │   ├── page-type-summary.md       # Page type overview (Required)
    │   └── [type]-pages.md            # Per-type detail (Dynamic)
    ├── components/
    │   ├── component-library.md       # Component catalog (Required)
    │   ├── common-components.md       # Common components (Required)
    │   ├── business-components.md     # Business components (Required)
    │   └── {component-name}.md        # Per-component detail (Dynamic)
    ├── layouts/
    │   ├── page-layouts.md            # Layout patterns (Required)
    │   ├── navigation-patterns.md     # Navigation patterns (Required)
    │   └── {layout-name}-layout.md    # Per-layout detail (Dynamic)
    └── styles/
        ├── color-system.md            # Color system (Required)
        ├── typography.md              # Typography (Required)
        └── spacing-system.md          # Spacing system (Required)
```

## Directory Ownership

- `ui-style/` — Fully managed by this skill (techs pipeline)
  - Contains: ui-style-guide.md, styles/, page-types/, components/, layouts/
  - Source: Framework-level design system analysis from source code
- `ui-style-patterns/` — Managed by bizs pipeline (Stage 3.5: bizs-ui-style-extract)
  - Contains: Business pattern aggregation from feature documents
  - NOT created or written by this skill
  - May not exist if bizs pipeline has not been executed

---

## Quality Requirements

- ui-style-guide.md MUST have substantial content (not just template placeholders)
- At least 5 mandatory files MUST exist (see Self-Verification Checklist)
- Analysis report MUST honestly reflect coverage level
- All paths in documents MUST be relative (never absolute or file:// protocol)

---

## Error Handling

| Error Type | Action |
|------------|--------|
| Platform type is backend/api | Skip execution, return skipped status |
| UI analyzer skill invocation fails | Execute Secondary Path (template fill) |
| Source code structure is non-standard | Execute Tertiary Path (reference only) |
| Template not found | Use default structure, log warning |
| Any path MUST output the done file and analysis file | Never report "completed" with missing mandatory files |

---

## Task Completion Report

Upon completion, return the following structured report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-knowledge-techs-generate-ui-style",
  "output_files": [
    "{output_path}/ui-style/ui-style-guide.md",
    "{output_path}/ui-style/page-types/page-type-summary.md",
    "{output_path}/ui-style/components/component-library.md",
    "{output_path}/ui-style/layouts/page-layouts.md",
    "{output_path}/ui-style/styles/color-system.md",
    "{completed_dir}/{platform_id}.analysis-ui-style.json",
    "{completed_dir}/{platform_id}.done-ui-style.json"
  ],
  "summary": "UI style documents generated for {platform_id} at {ui_analysis_level} analysis level",
  "metrics": {
    "components_documented": 0,
    "style_patterns_captured": 0,
    "design_tokens_extracted": 0
  },
  "errors": [],
  "next_steps": [
    "Review ui-style-guide.md for design system completeness",
    "Coordinate with bizs-ui-style-extract for business pattern integration"
  ]
}
```

---

## Checklist

### Pre-Generation
- [ ] Platform type verified (web/mobile/desktop only)
- [ ] Template files read and understood
- [ ] Source directory structure scanned

### UI Style Analysis
- [ ] `speccrew-knowledge-techs-ui-analyze` skill invoked (Primary Path)
- [ ] If Primary Path failed → Secondary Path executed
- [ ] If Secondary Path failed → Tertiary Path executed
- [ ] All mandatory files created per Self-Verification Checklist

### Output Verification
- [ ] ui-style/ui-style-guide.md exists and has content
- [ ] ui-style/page-types/page-type-summary.md exists and has content
- [ ] ui-style/components/component-library.md exists and has content
- [ ] ui-style/layouts/page-layouts.md exists and has content
- [ ] ui-style/styles/color-system.md exists and has content

### Reporting
- [ ] Analysis report generated: `{platform_id}.analysis-ui-style.json`
- [ ] Completion marker generated: `{platform_id}.done-ui-style.json`
- [ ] Console output reported with correct status

---

## CONTINUOUS EXECUTION RULES

This skill MUST execute all steps continuously without unnecessary interruptions.

### FORBIDDEN Interruptions

1. DO NOT ask user "Should I continue?" after completing a step
2. DO NOT suggest "Let me split this into batches" or "Let's do this in parts"
3. DO NOT pause to list what you plan to do next — just do it
4. DO NOT ask for confirmation before generating output files
5. DO NOT warn about "large number of files" — proceed with generation
6. DO NOT offer "Should I proceed with the remaining items?"
7. DO NOT present options like "Full execution / Sample execution / Pause"

### When to Pause (ONLY these cases)

1. Explicit `<event action="confirm">` blocks in the workflow
2. Ambiguous requirements that genuinely need clarification
3. Unrecoverable errors that prevent further progress
4. Security-sensitive operations (e.g., deleting existing files)

### Execution Behavior

- When multiple templates need filling, process ALL of them sequentially without asking
- Use checkpoint files to track progress, enabling resumption if interrupted
- If context window is approaching limit, save progress and inform user how to resume
- NEVER voluntarily stop mid-process to ask if user wants to continue
