---
template_name: ui-style-guide
description: Main UI style guide template for frontend platforms
output_file: ui-style-guide.md
---

# {{platform_name}} UI Style Guide

<cite>
**Files Referenced in This Document**
{{source_files}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Table of Contents

1. [Project Overview](#project-overview)
2. [Platform Summary](#platform-summary)
3. [Design System](#design-system)
4. [Component Architecture](#component-architecture)
5. [Layout Patterns](#layout-patterns)
6. [Page Type Guide](#page-type-guide)
7. [Styling Conventions](#styling-conventions)
8. [Best Practices](#best-practices)

## Project Overview

### Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | {{framework}} | {{framework_version}} |
| UI Library | {{ui_library}} | {{ui_library_version}} |
| Build Tool | {{build_tool}} | {{build_tool_version}} |
| Language | {{language}} | {{language_version}} |

### Directory Structure

```
src/
├── views/          # Page components
├── components/     # Reusable components
├── layouts/        # Layout components
├── styles/         # Global styles
└── assets/         # Static assets
```

## Platform Summary

### Supported Platforms

| Platform | Resolution Range | Target Device |
|----------|------------------|---------------|
| {{platform_details}} |

### Browser Support

- {{browser_support_list}}

## Design System

### Color Palette

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Primary | {{primary_color}} | Buttons, links, active states |
| Success | {{success_color}} | Success messages, positive actions |
| Warning | {{warning_color}} | Warnings, caution states |
| Error | {{error_color}} | Errors, destructive actions |
| Info | {{info_color}} | Informational messages |

### Typography

| Element | Font Family | Size | Weight | Line Height |
|---------|-------------|------|--------|-------------|
| H1 | {{heading_font}} | {{h1_size}} | 600 | 1.2 |
| H2 | {{heading_font}} | {{h2_size}} | 600 | 1.3 |
| Body | {{body_font}} | {{body_size}} | 400 | 1.5 |
| Small | {{body_font}} | {{small_size}} | 400 | 1.4 |

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| xs | {{xs_spacing}} | Tight spacing, icons |
| sm | {{sm_spacing}} | Compact elements |
| md | {{md_spacing}} | Default spacing |
| lg | {{lg_spacing}} | Section spacing |
| xl | {{xl_spacing}} | Large sections |

## Component Architecture

### Component Categories

1. **UI Framework Components**: {{ui_framework_name}} built-in components
2. **Common Components**: Project-wide reusable components
3. **Business Components**: Domain-specific components

### Component Usage Patterns

See detailed documentation:
- [Component Library](components/component-library.md)
- [Common Components](components/common-components.md)
- [Business Components](components/business-components.md)

## Layout Patterns

### Available Layouts

See [Layout Patterns](layouts/page-layouts.md) for detailed information.

### Navigation Patterns

See [Navigation Patterns](layouts/navigation-patterns.md) for detailed information.

## Page Type Guide

### Page Type Overview

See [Page Type Summary](page-types/page-type-summary.md) for the complete list of page types.

### Page Type Selection

| Business Scenario | Recommended Page Type | Reference |
|-------------------|----------------------|-----------|
{{page_type_selection_table}}

## Styling Conventions

### CSS Methodology

- **Approach**: {{css_methodology}}
- **Preprocessor**: {{preprocessor}}
- **Naming Convention**: {{naming_convention}}

### Style File Organization

```
styles/
├── variables/      # CSS variables
├── mixins/         # SCSS/LESS mixins
├── components/     # Component-specific styles
└── utilities/      # Utility classes
```

See detailed style system:
- [Color System](styles/color-system.md)
- [Typography](styles/typography.md)
- [Spacing System](styles/spacing-system.md)

## Best Practices

### Do's

- ✅ Use the design system tokens for consistency
- ✅ Follow the established naming conventions
- ✅ Reuse existing components before creating new ones
- ✅ Test responsive behavior across breakpoints

### Don'ts

- ❌ Hardcode colors or spacing values
- ❌ Create one-off components without justification
- ❌ Bypass the layout system
- ❌ Ignore accessibility guidelines

---

**Section Source**
{{section_source_files}}
