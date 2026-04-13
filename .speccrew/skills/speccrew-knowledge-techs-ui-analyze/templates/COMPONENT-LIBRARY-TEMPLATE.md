---
template_name: component-library
description: Component library inventory template
output_file: components/component-library.md
---

# Component Library Inventory

**Files Referenced in This Document**

| # | File | Source |
|---|------|--------|
{{source_files}}

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

This document catalogs all components available in the {{platform_name}} project.

### Component Categories

1. **UI Framework Components**: Third-party components from {{ui_framework_name}}
2. **Common Components**: Project-wide reusable components
3. **Business Components**: Domain-specific components

## UI Framework Components

### Basic Components

| Component | Purpose | Common Props | Usage Frequency |
|-----------|---------|--------------|-----------------|
{{basic_components_table}}

### Form Components

| Component | Purpose | Common Props | Usage Frequency |
|-----------|---------|--------------|-----------------|
{{form_components_table}}

### Data Display Components

| Component | Purpose | Common Props | Usage Frequency |
|-----------|---------|--------------|-----------------|
{{data_display_components_table}}

### Navigation Components

| Component | Purpose | Common Props | Usage Frequency |
|-----------|---------|--------------|-----------------|
{{navigation_components_table}}

### Feedback Components

| Component | Purpose | Common Props | Usage Frequency |
|-----------|---------|--------------|-----------------|
{{feedback_components_table}}

## Common Components

### Layout Components

| Component | Purpose | Props | Location |
|-----------|---------|-------|----------|
{{common_layout_components_table}}

### Utility Components

| Component | Purpose | Props | Location |
|-----------|---------|-------|----------|
{{common_utility_components_table}}

### Functional Components

| Component | Purpose | Props | Location |
|-----------|---------|-------|----------|
{{common_functional_components_table}}

## Business Components

### Domain: {{domain_name}}

| Component | Purpose | Props | Location |
|-----------|---------|-------|----------|
{{business_components_table}}

## Component Usage Statistics

### Most Used Components

{{most_used_components_list}}

### Component Dependencies

```
{{component_dependency_diagram}}
```

## Component Guidelines

### When to Use Each Category

- **UI Framework Components**: Base UI elements, standard interactions
- **Common Components**: Cross-cutting concerns, repeated patterns
- **Business Components**: Domain-specific functionality

### Creating New Components

Before creating a new component:

1. Check if an existing component meets your needs
2. Consider if it should be a common or business component
3. Follow the established naming conventions
4. Include proper documentation and examples

---

**Section Source**
{{section_source_files}}
