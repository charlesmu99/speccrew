---
template_name: style-system
description: Style system documentation (color, typography, spacing)
output_file: styles/color-system.md
---

# Color System

<cite>
**Files Referenced in This Document**
{{source_files}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

The color system provides a consistent palette for {{platform_name}}.

## Brand Colors

### Primary Palette

| Token Name | Hex Value | RGB Value | Usage |
|------------|-----------|-----------|-------|
{{primary_palette_table}}

### Secondary Palette

| Token Name | Hex Value | RGB Value | Usage |
|------------|-----------|-----------|-------|
{{secondary_palette_table}}

## Semantic Colors

### Status Colors

| Status | Light Mode | Dark Mode | Usage |
|--------|------------|-----------|-------|
{{status_colors_table}}

### Feedback Colors

| Type | Color | Usage Examples |
|------|-------|----------------|
{{feedback_colors_table}}

## Neutral Colors

### Gray Scale

| Token | Hex Value | Usage |
|-------|-----------|-------|
{{gray_scale_table}}

### Text Colors

| Token | Hex Value | Usage |
|-------|-----------|-------|
{{text_colors_table}}

## Background Colors

| Token | Hex Value | Usage |
|-------|-----------|-------|
{{background_colors_table}}

## Border Colors

| Token | Hex Value | Usage |
|-------|-----------|-------|
{{border_colors_table}}

## CSS Variables

```css
:root {
{{css_variables}}
}

[data-theme="dark"] {
{{dark_mode_variables}}
}
```

## Usage Guidelines

### Do's

- ✅ Use semantic color tokens (e.g., `--color-primary`) instead of hardcoded values
- ✅ Use status colors consistently for their intended purposes
- ✅ Ensure sufficient contrast ratios for accessibility
- ✅ Test colors in both light and dark modes

### Don'ts

- ❌ Use colors outside the defined palette without approval
- ❌ Mix multiple primary colors in the same context
- ❌ Use status colors for non-status purposes
- ❌ Ignore color blindness accessibility

## Color Combinations

### Safe Combinations

{{safe_combinations_table}}

### Contrast Requirements

| Text Size | Minimum Contrast | Recommended Contrast |
|-----------|------------------|---------------------|
{{contrast_requirements_table}}

---

**Section Source**
{{section_source_files}}
