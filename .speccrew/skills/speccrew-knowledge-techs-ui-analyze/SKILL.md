---
name: speccrew-knowledge-techs-ui-analyze
description: Analyze existing frontend UI codebase to extract and summarize page styles, layout patterns, component usage, and design conventions. Generates comprehensive UI style guides for each platform (PC, Mobile, etc.) including page type classifications, component libraries, layout patterns, and styling conventions. Used to ensure new pages maintain consistency with existing system design.
tools: Read, Write, Glob, Grep
---

# UI Style Analyzer

Analyze existing frontend UI codebase to extract and summarize page styles, layout patterns, and component usage for each platform.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English

## Trigger Scenarios

- "Analyze UI styles from existing codebase"
- "Extract page layout patterns from {platform}"
- "Summarize component usage in {project}"
- "Generate UI style guide from source code"
- "梳理现有系统页面风格"
- "分析项目UI组件使用规范"

## User

Worker Agent (speccrew-task-worker)

## Input

- `source_path`: Path to UI source code directory (e.g., `yudao-ui/yudao-ui-admin-vue3/`)
- `platform_id`: Platform identifier (e.g., "admin-pc", "admin-mobile")
- `platform_type`: Platform type (`web`, `mobile`, `desktop`)
- `framework`: Frontend framework (vue3, react, uniapp, etc.)
- `output_path`: Output directory for generated style guide
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

## Output

Generate the following documents in `{output_path}/`:

**Note**: The `output_path` parameter should already include the `ui-style/` suffix when passed from the caller (e.g., `speccrew-knowledge-techs-generate`).

```
{output_path}/                    # e.g., .../techs/mobile-uniapp/ui-style/
├── ui-style-guide.md              # Main UI style guide (Required)
├── page-types/                    # Page type analysis
│   ├── page-type-summary.md      # Page type overview (dynamically generated type list)
│   ├── [type-1]-pages.md         # Specific page type analysis (dynamically named)
│   ├── [type-2]-pages.md         # Specific page type analysis
│   └── ...                       # Other discovered page types
├── components/                    # Component analysis
│   ├── component-library.md      # Component inventory (summary)
│   ├── common-components.md      # Common component usage conventions
│   ├── business-components.md    # Business component usage conventions
│   └── {component-name}.md       # Individual component detail (one per discovered component)
├── layouts/                       # Layout patterns
│   ├── page-layouts.md           # Layout patterns summary
│   ├── navigation-patterns.md    # Navigation patterns
│   └── {layout-name}-layout.md   # Individual layout detail (one per discovered layout)
└── styles/                        # Styling conventions
    ├── color-system.md           # Color system
    ├── typography.md             # Typography conventions
    └── spacing-system.md         # Spacing system
```

**Note**: Page type documents are dynamically named based on discovered types, e.g.
- If system has `*List.vue` files → `list-pages.md`
- If system has `*Form.vue` files → `form-pages.md`
- If system has `*Dashboard.vue` files → `dashboard-pages.md`
- If system has custom patterns like `*Workflow.vue` → `workflow-pages.md`

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Checklist

### Pre-Analysis (Step 0)
- [ ] All 13 templates read and understood
- [ ] Template section requirements mapped to extraction tasks
- [ ] Source path exists and accessible
- [ ] Framework identified (Vue3, React, etc.)
- [ ] Platform type determined

### Analysis Phase
**Step 1: Source Structure**
- [ ] Project structure explored
- [ ] Technology stack extracted for ui-style-guide.md
- [ ] Directory structure documented

**Step 2: Page Types**
- [ ] PAGE-TYPE-SUMMARY-TEMPLATE.md read
- [ ] PAGE-TYPE-INDIVIDUAL-TEMPLATE.md read
- [ ] Page files discovered and categorized
- [ ] page-type-summary.md generated
- [ ] Individual [type]-pages.md generated (one per discovered type)

**Step 3: Component Usage**
- [ ] COMPONENT-LIBRARY-TEMPLATE.md read
- [ ] COMMON-COMPONENTS-TEMPLATE.md read
- [ ] BUSINESS-COMPONENTS-TEMPLATE.md read
- [ ] COMPONENT-INDIVIDUAL-TEMPLATE.md read
- [ ] Components extracted and classified
- [ ] component-library.md generated
- [ ] common-components.md generated
- [ ] business-components.md generated
- [ ] Individual {component-name}.md files generated (one per discovered component)

**Step 4: Layout Patterns**
- [ ] LAYOUT-PATTERNS-TEMPLATE.md read
- [ ] NAVIGATION-PATTERNS-TEMPLATE.md read
- [ ] LAYOUT-INDIVIDUAL-TEMPLATE.md read
- [ ] Layout patterns identified
- [ ] page-layouts.md generated
- [ ] navigation-patterns.md generated
- [ ] Individual {layout-name}-layout.md files generated (one per discovered layout)

**Step 5: Style Conventions**
- [ ] STYLE-SYSTEM-TEMPLATE.md read
- [ ] TYPOGRAPHY-TEMPLATE.md read
- [ ] SPACING-TEMPLATE.md read
- [ ] Style conventions extracted
- [ ] color-system.md generated
- [ ] typography.md generated
- [ ] spacing-system.md generated

### Documentation Phase (Step 6)
- [ ] UI-STYLE-GUIDE-TEMPLATE.md read
- [ ] ui-style-guide.md generated with links to all other documents
- [ ] All 13 required documents exist (11 base + individual component/layout files)
- [ ] Each component in component-library.md links to its individual file
- [ ] Each layout in page-layouts.md links to its individual file
- [ ] Document cross-references are valid

### Quality Checks
- [ ] All content in specified language
- [ ] File paths are correct and accessible
- [ ] Code examples are syntactically correct
- [ ] ASCII diagrams are clear and accurate
- [ ] Individual component files follow template structure (Props table, Usage examples, etc.)
- [ ] Individual layout files follow template structure (Regions table, Navigation, etc.)
- [ ] Results reported with file counts
