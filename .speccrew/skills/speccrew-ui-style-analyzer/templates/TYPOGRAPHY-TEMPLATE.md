---
template_name: typography
description: Typography system documentation
output_file: styles/typography.md
---

# Typography System

<cite>
**Files Referenced in This Document**
{{source_files}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

The typography system defines font families, sizes, weights, and line heights for {{platform_name}}.

## Font Families

### Primary Font

| Property | Value | Usage |
|----------|-------|-------|
{{primary_font_table}}

### Fallback Fonts

```css
font-family: {{font_stack}};
```

### Monospace Font

| Property | Value | Usage |
|----------|-------|-------|
{{monospace_font_table}}

## Type Scale

### Heading Styles

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
{{heading_styles_table}}

### Body Text Styles

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
{{body_styles_table}}

### Special Text Styles

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
{{special_styles_table}}

## Font Weights

| Token | Value | Usage |
|-------|-------|-------|
{{font_weights_table}}

## Line Heights

| Token | Value | Usage |
|-------|-------|-------|
{{line_heights_table}}

## Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
{{letter_spacing_table}}

## CSS Classes

```css
{{typography_css_classes}}
```

## Responsive Typography

### Mobile Adjustments

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
{{responsive_typography_table}}

## Usage Guidelines

### Hierarchy

{{typography_hierarchy_guidelines}}

### Readability

- Optimal line length: {{optimal_line_length}}
- Minimum font size: {{minimum_font_size}}
- Recommended line height for body text: {{recommended_line_height}}

---

**Section Source**
{{section_source_files}}
