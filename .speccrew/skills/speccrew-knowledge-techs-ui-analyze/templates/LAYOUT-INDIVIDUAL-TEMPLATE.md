---
template_name: layout-individual
description: Individual layout pattern detail template
dynamic_name: "{{layout_name}}-layout.md"
output_path: layouts/
---

# {{layout_name}} Layout

**Source Files Referenced**

{{layout_source_files}}

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

- **Type**: {{layout_type}} (e.g., TabBar, Detail, Form, Dashboard)
- **Usage Frequency**: {{frequency}} (High / Medium / Low)
- **Applicable Page Types**: {{applicable_page_types}}

## Structure

### Visual Layout

```
{{ascii_layout_diagram}}
```

### Layout Regions

| Region | Purpose | Required | Content Type |
|--------|---------|----------|-------------|
{{layout_regions_table}}

## Navigation

### Entry Points

{{entry_points_list}}

### Exit Points

{{exit_points_list}}

### Navigation Method

{{navigation_method}}

## Component Composition

### Required Components

| Component | Role | Position |
|-----------|------|----------|
{{required_components_table}}

### Optional Components

| Component | Condition | Position |
|-----------|-----------|----------|
{{optional_components_table}}

## Responsive Behavior
<!-- CONDITIONAL: Only for web/desktop platforms -->

| Breakpoint | Layout Change |
|-----------|--------------|
{{responsive_behavior_table}}

## Configuration

### Page-Level Config

```json
{{page_config_json}}
```

### Style Configuration

{{style_config_notes}}

## Usage Scenarios

{{usage_scenarios_list}}

## Examples in Codebase

| Page | Path | Notes |
|------|------|-------|
{{examples_table}}

---

**Section Source**
{{section_source_files}}
