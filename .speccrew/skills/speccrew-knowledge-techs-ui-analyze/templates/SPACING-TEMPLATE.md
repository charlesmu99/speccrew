---
template_name: spacing
description: Spacing system documentation
output_file: styles/spacing-system.md
---

# Spacing System

**Files Referenced in This Document**

| # | File | Source |
|---|------|--------|
{{source_files}}

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

The spacing system provides consistent spacing values for {{platform_name}}.

## Spacing Scale

### Base Unit

Base unit: {{base_unit}}px

### Spacing Tokens

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
{{spacing_tokens_table}}

## Margin Patterns

### Component Margins

| Context | Token | Value |
|---------|-------|-------|
{{component_margins_table}}

### Section Margins

| Context | Token | Value |
|---------|-------|-------|
{{section_margins_table}}

## Padding Patterns

### Component Padding

| Component Type | Token | Value |
|----------------|-------|-------|
{{component_padding_table}}

### Container Padding

| Container Type | Token | Value |
|----------------|-------|-------|
{{container_padding_table}}

## Gap Patterns

### Flex/Grid Gaps

| Context | Token | Value |
|---------|-------|-------|
{{gap_patterns_table}}

## CSS Variables

```css
:root {
{{spacing_css_variables}}
}
```

## Utility Classes

### Margin Utilities

```css
{{margin_utility_classes}}
```

### Padding Utilities

```css
{{padding_utility_classes}}
```

## Layout Spacing

### Page Layout

```
{{page_layout_spacing_diagram}}
```

### Component Spacing

{{component_spacing_guidelines}}

## Usage Guidelines

### Do's

- ✅ Use spacing tokens instead of arbitrary values
- ✅ Maintain consistent spacing within components
- ✅ Use larger spacing between sections, smaller within components

### Don'ts

- ❌ Mix spacing tokens arbitrarily
- ❌ Use spacing for visual fixes instead of proper layout
- ❌ Hardcode pixel values

---

**Section Source**
{{section_source_files}}
