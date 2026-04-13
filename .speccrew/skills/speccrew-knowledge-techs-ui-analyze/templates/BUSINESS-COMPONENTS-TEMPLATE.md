---
template_name: business-components
description: Business components usage conventions
output_file: components/business-components.md
---

# Business Components

**Files Referenced in This Document**

| # | File | Source |
|---|------|--------|
{{source_files}}

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

Domain-specific components for {{platform_name}}.

## User Management Components

### User Selector

**Purpose**: Select users from the system

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{user_selector_props}}

**Usage**:

```vue
{{user_selector_usage}}
```

---

### Role Picker

**Purpose**: Select user roles

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{role_picker_props}}

**Usage**:

```vue
{{role_picker_usage}}
```

---

## Department Components

### Department Tree

**Purpose**: Display and select department hierarchy

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{dept_tree_props}}

**Usage**:

```vue
{{dept_tree_usage}}
```

---

## Dictionary Components

### Dictionary Tag

**Purpose**: Display dictionary values with color coding

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{dict_tag_props}}

**Usage**:

```vue
{{dict_tag_usage}}
```

---

### Dictionary Select

**Purpose**: Select from dictionary values

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{dict_select_props}}

**Usage**:

```vue
{{dict_select_usage}}
```

---

## File Components

### Image Preview

**Purpose**: Preview images with zoom and gallery

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{image_preview_props}}

**Usage**:

```vue
{{image_preview_usage}}
```

---

### File Upload

**Purpose**: Upload files with progress and validation

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
{{file_upload_props}}

**Usage**:

```vue
{{file_upload_usage}}
```

---

## Component Guidelines

### Domain Separation

{{domain_separation_guidelines}}

### Reusability

{{reusability_guidelines}}

### Data Integration

{{data_integration_guidelines}}

---

**Section Source**
{{section_source_files}}
