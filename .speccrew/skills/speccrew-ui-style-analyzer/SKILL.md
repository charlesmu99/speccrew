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

Create comprehensive style guide documents using templates from `speccrew-ui-style-analyzer/templates/`.

#### Template Usage

| Template File | Output Document | Purpose |
|---------------|-----------------|---------|
| `templates/UI-STYLE-GUIDE-TEMPLATE.md` | `ui-style-guide.md` | Main style guide with project overview and navigation |
| `templates/PAGE-TYPE-SUMMARY-TEMPLATE.md` | `page-types/page-type-summary.md` | Page type classification overview |
| `templates/PAGE-TYPE-INDIVIDUAL-TEMPLATE.md` | `page-types/[type]-pages.md` | Individual page type analysis (dynamically named) |
| `templates/COMPONENT-LIBRARY-TEMPLATE.md` | `components/component-library.md` | Component inventory |
| `templates/COMMON-COMPONENTS-TEMPLATE.md` | `components/common-components.md` | Common component usage |
| `templates/BUSINESS-COMPONENTS-TEMPLATE.md` | `components/business-components.md` | Business component usage |
| `templates/LAYOUT-PATTERNS-TEMPLATE.md` | `layouts/page-layouts.md` | Layout patterns documentation |
| `templates/NAVIGATION-PATTERNS-TEMPLATE.md` | `layouts/navigation-patterns.md` | Navigation patterns documentation |
| `templates/STYLE-SYSTEM-TEMPLATE.md` | `styles/color-system.md` | Color system documentation |
| `templates/TYPOGRAPHY-TEMPLATE.md` | `styles/typography.md` | Typography system documentation |
| `templates/SPACING-TEMPLATE.md` | `styles/spacing-system.md` | Spacing system documentation |

#### Document Generation Order

1. **Read template** from `templates/` directory
2. **Extract data** from source code analysis (Steps 1-5)
3. **Replace placeholders** in template with actual values
4. **Write output** to `{output_path}/` (path already includes `ui-style/` suffix)

#### Required Documents (All Platforms)

| Document | Template | Required |
|----------|----------|----------|
| `ui-style-guide.md` | UI-STYLE-GUIDE-TEMPLATE.md | ✅ Yes |
| `page-types/page-type-summary.md` | PAGE-TYPE-SUMMARY-TEMPLATE.md | ✅ Yes |
| `page-types/[type]-pages.md` | PAGE-TYPE-INDIVIDUAL-TEMPLATE.md | ✅ Yes (one per discovered type) |
| `components/component-library.md` | COMPONENT-LIBRARY-TEMPLATE.md | ✅ Yes |
| `components/common-components.md` | COMMON-COMPONENTS-TEMPLATE.md | ✅ Yes |
| `components/business-components.md` | BUSINESS-COMPONENTS-TEMPLATE.md | ✅ Yes |
| `layouts/page-layouts.md` | LAYOUT-PATTERNS-TEMPLATE.md | ✅ Yes |
| `layouts/navigation-patterns.md` | NAVIGATION-PATTERNS-TEMPLATE.md | ✅ Yes |
| `styles/color-system.md` | STYLE-SYSTEM-TEMPLATE.md | ✅ Yes |
| `styles/typography.md` | TYPOGRAPHY-TEMPLATE.md | ✅ Yes |
| `styles/spacing-system.md` | SPACING-TEMPLATE.md | ✅ Yes |

### Step 7: Verify Output Completeness

**CRITICAL**: Verify all required files exist before reporting completion.

**Required File Structure**:
```
{output_path}/                    # Caller should pass path ending with ui-style/
├── ui-style-guide.md                           ✅ Required
├── page-types/
│   ├── page-type-summary.md                    ✅ Required
│   └── [type-1]-pages.md                       ✅ Required (one per discovered type)
│   └── [type-2]-pages.md                       ✅ Required (one per discovered type)
│   └── ...                                     ✅ Additional types...
├── components/
│   ├── component-library.md                    ✅ Required
│   ├── common-components.md                    ✅ Required
│   └── business-components.md                  ✅ Required
├── layouts/
│   ├── page-layouts.md                         ✅ Required
│   └── navigation-patterns.md                  ✅ Required
└── styles/
    ├── color-system.md                         ✅ Required
    ├── typography.md                           ✅ Required
    └── spacing-system.md                       ✅ Required
```

**Verification Rules**:
1. Count discovered page types from Step 2
2. Verify each page type has a corresponding `[type]-pages.md` file
3. Verify all 11 required documents exist
4. If any file is missing, regenerate before proceeding

## Analysis Output Format

Templates for generated documents are located in `speccrew-ui-style-analyzer/templates/`:

| Template | Description |
|----------|-------------|
| `PAGE-TYPE-SUMMARY-TEMPLATE.md` | Template for page type classification overview |
| `PAGE-TYPE-INDIVIDUAL-TEMPLATE.md` | Template for individual page type analysis |

**Note**: See template files for detailed structure and placeholder variables.

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
- [ ] Individual page type documents generated (dynamically named - one per discovered type)
- [ ] Component library documented (component-library.md)
- [ ] Common components documented (common-components.md)
- [ ] Business components documented (business-components.md)
- [ ] Layout patterns documented (page-layouts.md)
- [ ] Navigation patterns documented (navigation-patterns.md)
- [ ] Style system documented (color-system.md, typography.md, spacing-system.md)

### Quality Checks
- [ ] All content in specified language
- [ ] File paths are correct and accessible
- [ ] Code examples are syntactically correct
- [ ] ASCII diagrams are clear and accurate
- [ ] Results reported with file counts
