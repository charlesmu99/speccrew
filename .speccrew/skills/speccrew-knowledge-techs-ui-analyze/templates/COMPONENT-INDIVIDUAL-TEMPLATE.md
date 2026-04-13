---
template_name: component-individual
description: Individual component detail template
dynamic_name: "{{component_name}}.md"
output_path: components/
---

# {{component_name}}

**Source Files Referenced**

{{component_source_path}}

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

- **Category**: {{category}} (UI Framework / Common / Business)
- **Source**: {{source_library}} (e.g., Wot Design Uni, Element Plus, Custom)
- **Location**: {{file_path}}

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
{{props_table}}

## Events

| Event | Payload | Description |
|-------|---------|-------------|
{{events_table}}

## Slots

| Slot | Props | Description |
|------|-------|-------------|
{{slots_table}}

## Usage Examples

### Basic Usage

```{{framework_language}}
{{basic_usage_code}}
```

### Common Patterns

```{{framework_language}}
{{pattern_usage_code}}
```

## Styling

### CSS Variables / Classes

| Variable/Class | Purpose |
|---------------|---------|
{{css_variables_table}}

### Customization

{{customization_notes}}

## Best Practices

{{best_practices_list}}

## Related Components

| Component | Relationship |
|-----------|-------------|
{{related_components_table}}

---

**Section Source**
{{section_source_files}}
