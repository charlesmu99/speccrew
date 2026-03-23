---
name: speccrew-ui-style-analyzer
description: Analyze existing frontend UI codebase to extract and summarize page styles, layout patterns, component usage, and design conventions. Generates comprehensive UI style guides for each platform (PC, Mobile, etc.) including page type classifications, component libraries, layout patterns, and styling conventions. Used to ensure new pages maintain consistency with existing system design.
tools: Read, Write, Glob, Grep
---

# UI Style Analyzer

Analyze existing frontend UI codebase to extract and summarize page styles, layout patterns, and component usage for each platform.

## Target Audience

Generated style guides serve:
- **devcrew-designer-{platform_id}**: Understanding existing design patterns for new page design
- **devcrew-dev-{platform_id}**: Implementing pages consistent with existing codebase

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

Generate the following documents in `{output_path}/ui-style/`:

```
{output_path}/
├── ui-style-guide.md              # Main UI style guide (Required)
├── page-types/                    # Page type analysis
│   ├── page-type-summary.md      # Page type overview (dynamically generated type list)
│   ├── [type-1]-pages.md         # Specific page type analysis (dynamically named)
│   ├── [type-2]-pages.md         # Specific page type analysis
│   └── ...                       # Other discovered page types
├── components/                    # Component analysis
│   ├── component-library.md      # Component library inventory
│   ├── common-components.md      # Common component usage conventions
│   └── business-components.md    # Business component usage conventions
├── layouts/                       # Layout patterns
│   ├── page-layouts.md           # Page layout patterns
│   └── navigation-patterns.md    # Navigation patterns
└── styles/                        # Styling conventions
    ├── color-system.md           # Color system
    ├── typography.md             # Typography conventions
    └── spacing-system.md         # Spacing system
```

**Note**: Page type documents are dynamically named based on discovered types, e.g.,
- If system has `*List.vue` files → `list-pages.md`
- If system has `*Form.vue` files → `form-pages.md`
- If system has `*Dashboard.vue` files → `dashboard-pages.md`
- If system has custom patterns like `*Workflow.vue` → `workflow-pages.md`

## Workflow

### Step 1: Discover Source Structure

Explore the source code directory to understand:
- Project structure (views/pages directory)
- Component organization
- Style file locations
- Configuration files (package.json, vite.config, etc.)

**Key directories to explore:**
- `src/views/` or `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/layout/` or `src/layouts/` - Layout components
- `src/styles/` or `src/assets/styles/` - Style files

### Step 2: Analyze Page Types

Scan page files to identify and classify page types dynamically based on actual source code.

#### Dynamic Page Type Discovery

**DO NOT assume predefined page types.** Instead, analyze the actual codebase to discover what page types exist:

1. **File Name Analysis**
   - Extract naming patterns from page files
   - Group files by similar naming conventions
   - Examples: `*List.vue`, `*Form.vue`, `*Detail.vue`, `*Chart.vue`, etc.

2. **Component Usage Analysis**
   - Identify dominant components in each file group
   - Look for patterns like:
     - Table-heavy files → likely list/query pages
     - Form-heavy files → likely create/edit pages
     - Chart-heavy files → likely report/dashboard pages
     - Split-pane layouts → likely master-detail pages

3. **Route/Navigation Analysis**
   - Check router configuration for page organization
   - Identify menu structures and page hierarchies

4. **Content Pattern Recognition**
   - Search for keywords in template sections:
     - Search/filter inputs → query functionality
     - Submit buttons → form functionality
     - Charts/graphs → report functionality
     - Trees + tables → tree-table functionality

#### Page Type Classification Output

Based on analysis, generate a classification table:

```
| Page Type | Detection Pattern | File Count | Typical Files |
|-----------|-------------------|------------|---------------|
| [Auto-discovered Type 1] | [Recognition features] | N | [Example files] |
| [Auto-discovered Type 2] | [Recognition features] | N | [Example files] |
```

#### Analysis Content for Each Discovered Page Type

For each identified page type, extract:

1. **File List** - All files belonging to this type
2. **Naming Pattern** - Common naming convention
3. **Common Components** - Components used across pages of this type
4. **Layout Pattern** - DOM structure and layout approach
5. **Data Flow** - How data is fetched and managed
6. **Interaction Patterns** - Common user interactions
7. **Business Scenarios** - What business functions this page type serves

### Step 3: Extract Component Usage

Analyze component imports and usage:

#### Component Categories

**UI Framework Components** (Element Plus, Ant Design, Vant, etc.)
- Button, Input, Select, Table, Form, Modal, etc.

**Common Components** (Project-specific)
- SearchForm, Pagination, DictTag, ImagePreview, etc.

**Business Components** (Domain-specific)
- UserSelect, DeptTree, RolePicker, etc.

#### Extraction Method

1. Read component files in `src/components/`
2. Analyze imports in page files
3. Identify component props and usage patterns
4. Document component APIs

### Step 4: Analyze Layout Patterns

Identify common layout patterns:

#### Layout Types

1. **Standard List Layout**
   ```
   Search Form
   Toolbar (Add/Export/Delete buttons)
   Data Table
   Pagination
   ```

2. **Standard Form Layout**
   ```
   Form Card
   Form Fields (2-3 columns)
   Action Buttons (Submit/Cancel)
   ```

3. **Detail View Layout**
   ```
   Detail Card
   Description List
   Action Buttons
   ```

4. **Split Pane Layout**
   ```
   Left: Tree/Menu
   Right: Content Table/Form
   ```

### Step 5: Extract Style Conventions

Analyze style files to extract:

#### Color System
- Primary colors
- Status colors (success, warning, error, info)
- Text colors
- Background colors
- Border colors

#### Typography
- Font families
- Font sizes (heading, body, small)
- Font weights
- Line heights

#### Spacing System
- Padding/Margin scales
- Grid system
- Container widths

### Step 6: Generate Documentation

Create comprehensive style guide documents:

#### Document 1: ui-style-guide.md

Main style guide with:
- Project overview
- Platform summary
- Quick navigation to all sections

#### Document 2: Page Type Summary

Create `page-type-summary.md` with:
- Discovered page types overview table
- Classification methodology
- Naming pattern summary
- Recommendations for new pages

#### Document 3: Individual Page Type Analysis

For each discovered page type, create `[type-name]-pages.md`:
- Page type definition and naming pattern
- File list with paths
- Layout structure (ASCII diagram)
- Common components used
- Code example (simplified)
- Business scenarios and use cases
- Best practices

#### Document 4: Component Library

- Component inventory
- Usage examples
- Props documentation

#### Document 5: Layout Patterns

- Layout diagrams
- Responsive behavior
- Implementation guidelines

#### Document 6: Style System

- Color palette
- Typography scale
- Spacing system

## Analysis Output Format

### Page Type Summary Template

```markdown
# Page Type Overview

## Analysis Methodology

Explain how page types were identified and classified.

## Page Type Statistics

| Page Type | Detection Pattern | File Count | Percentage | Typical Files |
|-----------|-------------------|------------|------------|---------------|
| List Pages | `*List.vue`, `*Index.vue` | 45 | 35% | `user/index.vue` |
| Form Pages | `*Form.vue` | 32 | 25% | `user/UserForm.vue` |
| [Other Types] | [Pattern] | N | N% | [Examples] |

## Naming Conventions Summary

| Page Type | Recommended Naming | Example |
|-----------|-------------------|---------|
| List Pages | `[module]/index.vue` | `system/user/index.vue` |
| Form Pages | `[Module]Form.vue` | `UserForm.vue` |
| [Other Types] | [Convention] | [Example] |

## New Page Selection Guide

| Business Scenario | Recommended Page Type | Reference |
|-------------------|----------------------|-----------|
| Data list display | List Pages | [list-pages.md](list-pages.md) |
| Data editing | Form Pages | [form-pages.md](form-pages.md) |
| [Other scenarios] | [Recommended type] | [Reference] |
```

### Individual Page Type Template

```markdown
# {Page Type Name} Pages

## Overview

- **Detection Pattern**: `*.vue` file matching pattern
- **File Count**: N files
- **Typical Functions**: Description of main functions for this page type

## Applicable Scenarios

- Scenario 1: Description
- Scenario 2: Description
- Scenario 3: Description

## Page Inventory

| File Path | Page Name | Function Description | Module |
|-----------|-----------|---------------------|--------|
| `src/views/...` | ... | ... | ... |

## Layout Structure

```
[ASCII diagram showing typical layout]
```

## Common Components

### UI Framework Components
- `component-name` - Usage description

### Project Common Components
- `ComponentName` - Usage description

## Code Example

```vue
<!-- Typical implementation example -->
<template>
  <!-- ... -->
</template>
```

## Best Practices

1. Practice 1
2. Practice 2
3. Practice 3

## Related Files

- [Component A](file://path/to/component)
- [Page Example](file://path/to/example)
```

## Integration with speccrew-knowledge-techs-generate

When generating `conventions-design.md` for a platform:

1. Check if UI style analysis exists
2. If yes, reference the generated style guide:

```markdown
## UI Design Conventions

This platform follows established UI patterns documented in:
- [UI Style Guide](ui-style-guide.md)
- [Page Type Summary](page-types/page-type-summary.md)

### Page Type Selection Guide

| Scenario | Recommended Page Type | Reference |
|----------|----------------------|-----------|
| [Business scenario] | [Auto-discovered page type] | [[type]-pages.md](page-types/[type]-pages.md) |
```

## Checklist

### Pre-Analysis
- [ ] Source path exists and accessible
- [ ] Framework identified (Vue3, React, etc.)
- [ ] Platform type determined

### Analysis Phase
- [ ] Page files discovered and categorized
- [ ] Components extracted and classified
- [ ] Layout patterns identified
- [ ] Style conventions extracted

### Documentation Phase
- [ ] ui-style-guide.md generated
- [ ] page-type-summary.md generated
- [ ] Individual page type documents generated (dynamically named)
- [ ] Component library documented
- [ ] Layout patterns documented
- [ ] Style system documented

### Quality Checks
- [ ] All content in specified language
- [ ] File paths are correct and accessible
- [ ] Code examples are syntactically correct
- [ ] ASCII diagrams are clear and accurate
- [ ] Results reported with file counts
