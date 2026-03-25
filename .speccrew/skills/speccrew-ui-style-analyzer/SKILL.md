---
name: speccrew-ui-style-analyzer
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

### Step 0: Read All Templates

Before analysis, read all template files to understand document structures and required content:

| Template File | Output Document | Purpose |
|---------------|-----------------|---------|
| `templates/UI-STYLE-GUIDE-TEMPLATE.md` | `ui-style-guide.md` | Main style guide structure |
| `templates/PAGE-TYPE-SUMMARY-TEMPLATE.md` | `page-types/page-type-summary.md` | Page type classification structure |
| `templates/PAGE-TYPE-INDIVIDUAL-TEMPLATE.md` | `page-types/[type]-pages.md` | Individual page type structure |
| `templates/COMPONENT-LIBRARY-TEMPLATE.md` | `components/component-library.md` | Component inventory structure |
| `templates/COMMON-COMPONENTS-TEMPLATE.md` | `components/common-components.md` | Common component usage structure |
| `templates/BUSINESS-COMPONENTS-TEMPLATE.md` | `components/business-components.md` | Business component usage structure |
| `templates/LAYOUT-PATTERNS-TEMPLATE.md` | `layouts/page-layouts.md` | Layout patterns structure |
| `templates/NAVIGATION-PATTERNS-TEMPLATE.md` | `layouts/navigation-patterns.md` | Navigation patterns structure |
| `templates/STYLE-SYSTEM-TEMPLATE.md` | `styles/color-system.md` | Color system structure |
| `templates/TYPOGRAPHY-TEMPLATE.md` | `styles/typography.md` | Typography structure |
| `templates/SPACING-TEMPLATE.md` | `styles/spacing-system.md` | Spacing system structure |

**Key principle**: Extract information from source code according to each template's section requirements.

### Step 1: Discover Source Structure

**Purpose**: Gather project metadata for `ui-style-guide.md` Section 1-2 (Project Overview, Platform Summary)

**Template Reference**: `UI-STYLE-GUIDE-TEMPLATE.md` - Sections: Project Overview, Platform Summary

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

**Extract for ui-style-guide.md:**
- Technology Stack (framework, UI library, build tool, language versions)
- Directory Structure
- Platform details (resolution range, target device)
- Browser support list

### Step 2: Analyze Page Types

**Purpose**: Generate `page-types/page-type-summary.md` and individual `[type]-pages.md` files

**Templates to Read First**:
- `templates/PAGE-TYPE-SUMMARY-TEMPLATE.md` - Sections: Analysis Methodology, Page Type Statistics, Naming Conventions Summary, New Page Selection Guide, Page Type Details
- `templates/PAGE-TYPE-INDIVIDUAL-TEMPLATE.md` - Structure for each page type document

**Output Documents**:
1. `page-types/page-type-summary.md` - Classification overview
2. `page-types/[type]-pages.md` - One per discovered page type (dynamically named)

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

For each identified page type, extract according to `PAGE-TYPE-INDIVIDUAL-TEMPLATE.md`:

1. **File List** - All files belonging to this type
2. **Naming Pattern** - Common naming convention
3. **Common Components** - Components used across pages of this type
4. **Layout Pattern** - DOM structure and layout approach
5. **Data Flow** - How data is fetched and managed
6. **Interaction Patterns** - Common user interactions
7. **Business Scenarios** - What business functions this page type serves

**Generate**: `page-types/[type]-pages.md` for each discovered type

### Step 3: Extract Component Usage

**Purpose**: Generate component documentation in `components/` directory

**Templates to Read First**:
- `templates/COMPONENT-LIBRARY-TEMPLATE.md` - Sections: UI Framework Components, Common Components, Business Components, Component Usage Statistics
- `templates/COMMON-COMPONENTS-TEMPLATE.md` - Common component patterns and usage
- `templates/BUSINESS-COMPONENTS-TEMPLATE.md` - Business component patterns

**Output Documents**:
1. `components/component-library.md` - Component inventory
2. `components/common-components.md` - Common component usage conventions
3. `components/business-components.md` - Business component usage conventions

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

**Extract for component-library.md** (per COMPONENT-LIBRARY-TEMPLATE.md):
- UI Framework Components: Basic, Form, Data Display, Navigation, Feedback components
- Common Components: Layout, Utility, Functional components with props
- Business Components: Domain-specific components
- Component usage statistics and dependencies

**Extract for common-components.md**:
- Component purpose and usage scenarios
- Props definition and examples
- Usage patterns and best practices

**Extract for business-components.md**:
- Business component list by domain
- Props and event definitions
- Business logic integration patterns

### Step 4: Analyze Layout Patterns

**Purpose**: Generate layout documentation in `layouts/` directory

**Templates to Read First**:
- `templates/LAYOUT-PATTERNS-TEMPLATE.md` - Layout pattern structure
- `templates/NAVIGATION-PATTERNS-TEMPLATE.md` - Navigation pattern structure

**Output Documents**:
1. `layouts/page-layouts.md` - Page layout patterns
2. `layouts/navigation-patterns.md` - Navigation patterns

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

**Extract for page-layouts.md** (per LAYOUT-PATTERNS-TEMPLATE.md):
- Layout type definitions and visual diagrams
- DOM structure patterns
- Responsive behavior rules
- Usage scenarios for each layout

**Extract for navigation-patterns.md** (per NAVIGATION-PATTERNS-TEMPLATE.md):
- Navigation structure (sidebar, topbar, breadcrumbs)
- Menu organization patterns
- Route configuration conventions
- Navigation state management

### Step 5: Extract Style Conventions

**Purpose**: Generate style system documentation in `styles/` directory

**Templates to Read First**:
- `templates/STYLE-SYSTEM-TEMPLATE.md` - Color system structure
- `templates/TYPOGRAPHY-TEMPLATE.md` - Typography structure
- `templates/SPACING-TEMPLATE.md` - Spacing system structure

**Output Documents**:
1. `styles/color-system.md` - Color system
2. `styles/typography.md` - Typography conventions
3. `styles/spacing-system.md` - Spacing system

Analyze style files to extract:

#### Color System
- Primary colors
- Status colors (success, warning, error, info)
- Text colors
- Background colors
- Border colors

**Extract for color-system.md** (per STYLE-SYSTEM-TEMPLATE.md):
- Color palette with hex values
- Semantic color usage (primary, success, warning, error, info)
- Color application rules (text, background, border)
- CSS variables or theme configuration

#### Typography
- Font families
- Font sizes (heading, body, small)
- Font weights
- Line heights

**Extract for typography.md** (per TYPOGRAPHY-TEMPLATE.md):
- Font family definitions
- Type scale (H1-H6, body, small sizes)
- Font weights and line heights
- Typography usage patterns

#### Spacing System
- Padding/Margin scales
- Grid system
- Container widths

**Extract for spacing-system.md** (per SPACING-TEMPLATE.md):
- Spacing tokens (xs, sm, md, lg, xl values)
- Grid system configuration
- Container and breakpoint definitions
- Spacing application guidelines

### Step 6: Generate Documentation

**Purpose**: Create all documentation files using extracted data and templates

#### Document Generation Workflow

For each document, follow this process:

1. **Read the corresponding template** from `templates/` directory
2. **Review extracted data** from Steps 1-5
3. **Map data to template sections** - ensure all template placeholders are filled
4. **Generate document** with actual values
5. **Write output** to `{output_path}/`

#### Document Generation Order and Dependencies

| Order | Document | Template | Data Source | Dependencies |
|-------|----------|----------|-------------|--------------|
| 1 | `ui-style-guide.md` | UI-STYLE-GUIDE-TEMPLATE.md | Step 1, 3, 4, 5 | None (main entry) |
| 2 | `page-types/page-type-summary.md` | PAGE-TYPE-SUMMARY-TEMPLATE.md | Step 2 | None |
| 3 | `page-types/[type]-pages.md` | PAGE-TYPE-INDIVIDUAL-TEMPLATE.md | Step 2 | page-type-summary.md |
| 4 | `components/component-library.md` | COMPONENT-LIBRARY-TEMPLATE.md | Step 3 | None |
| 5 | `components/common-components.md` | COMMON-COMPONENTS-TEMPLATE.md | Step 3 | component-library.md |
| 6 | `components/business-components.md` | BUSINESS-COMPONENTS-TEMPLATE.md | Step 3 | component-library.md |
| 7 | `layouts/page-layouts.md` | LAYOUT-PATTERNS-TEMPLATE.md | Step 4 | None |
| 8 | `layouts/navigation-patterns.md` | NAVIGATION-PATTERNS-TEMPLATE.md | Step 4 | page-layouts.md |
| 9 | `styles/color-system.md` | STYLE-SYSTEM-TEMPLATE.md | Step 5 | None |
| 10 | `styles/typography.md` | TYPOGRAPHY-TEMPLATE.md | Step 5 | color-system.md |
| 11 | `styles/spacing-system.md` | SPACING-TEMPLATE.md | Step 5 | color-system.md |

**Note**: `ui-style-guide.md` should reference/link to all other generated documents.

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

## Checklist

### Pre-Analysis (Step 0)
- [ ] All 11 templates read and understood
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
- [ ] Components extracted and classified
- [ ] component-library.md generated
- [ ] common-components.md generated
- [ ] business-components.md generated

**Step 4: Layout Patterns**
- [ ] LAYOUT-PATTERNS-TEMPLATE.md read
- [ ] NAVIGATION-PATTERNS-TEMPLATE.md read
- [ ] Layout patterns identified
- [ ] page-layouts.md generated
- [ ] navigation-patterns.md generated

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
- [ ] All 11 required documents exist
- [ ] Document cross-references are valid

### Quality Checks
- [ ] All content in specified language
- [ ] File paths are correct and accessible
- [ ] Code examples are syntactically correct
- [ ] ASCII diagrams are clear and accurate
- [ ] Results reported with file counts
