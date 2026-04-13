---
template_name: layout-patterns
description: Layout patterns documentation template
output_file: layouts/page-layouts.md
---

# Page Layout Patterns

**Files Referenced in This Document**

| # | File | Source |
|---|------|--------|
{{source_files}}

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

This document describes the standard layout patterns used in {{platform_name}}.

## Layout Types

### 1. Standard List Layout

**Use Case**: Data listing, search results, tables

**Visual Structure**:

```
+------------------------------------------+
|  Search Form (filters, search input)     |
+------------------------------------------+
|  Toolbar (Add, Export, Batch actions)    |
+------------------------------------------+
|                                          |
|  Data Table                              |
|  +------+------+------+------+          |
|  | Col1 | Col2 | Col3 | Col4 |          |
|  +------+------+------+------+          |
|  | ...  | ...  | ...  | ...  |          |
|  +------+------+------+------+          |
|                                          |
+------------------------------------------+
|  Pagination                              |
+------------------------------------------+
```

**Implementation**:

```vue
{{list_layout_code_example}}
```

**Key Components**:
{{list_layout_key_components}}

---

### 2. Standard Form Layout

**Use Case**: Data entry, editing, configuration

**Visual Structure**:

```
+------------------------------------------+
|  Form Card                               |
|  +------------------------------------+  |
|  |  Form Title                        |  |
|  +------------------------------------+  |
|  |  +--------+  +--------+            |  |
|  |  | Field1 |  | Field2 |            |  |
|  |  +--------+  +--------+            |  |
|  |  +--------+  +--------+            |  |
|  |  | Field3 |  | Field4 |            |  |
|  |  +--------+  +--------+            |  |
|  +------------------------------------+  |
|  |  [Cancel]              [Submit]    |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Implementation**:

```vue
{{form_layout_code_example}}
```

**Key Components**:
{{form_layout_key_components}}

---

### 3. Detail View Layout

**Use Case**: Data display, read-only views, information pages

**Visual Structure**:

```
+------------------------------------------+
|  Detail Card                             |
|  +------------------------------------+  |
|  |  Title + Actions                   |  |
|  +------------------------------------+  |
|  |  +-------------+  +-------------+  |  |
|  |  | Section 1   |  | Section 2   |  |  |
|  |  | - Item 1    |  | - Item 1    |  |  |
|  |  | - Item 2    |  | - Item 2    |  |  |
|  |  +-------------+  +-------------+  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

**Implementation**:

```vue
{{detail_layout_code_example}}
```

**Key Components**:
{{detail_layout_key_components}}

---

### 4. Split Pane Layout

**Use Case**: Master-detail, tree-table, navigation with content

**Visual Structure**:

```
+-------------------+----------------------+
|                   |                      |
|   Tree/Menu       |    Content Area      |
|   +-----------+   |   +----------------+ |
|   | Item 1    |   |   |                | |
|   | Item 2    |   |   |   Main Content | |
|   | Item 3    |   |   |                | |
|   +-----------+   |   +----------------+ |
|                   |                      |
+-------------------+----------------------+
```

**Implementation**:

```vue
{{split_pane_layout_code_example}}
```

**Key Components**:
{{split_pane_layout_key_components}}

---

### 5. Dashboard Layout

**Use Case**: Overview pages, analytics, reporting

**Visual Structure**:

```
+------------------------------------------+
|  Stat Cards Row                          |
|  +------+  +------+  +------+  +------+  |
|  |Stat 1|  |Stat 2|  |Stat 3|  |Stat 4|  |
|  +------+  +------+  +------+  +------+  |
+------------------------------------------+
|  +----------------+  +----------------+  |
|  |   Chart 1      |  |   Chart 2      |  |
|  +----------------+  +----------------+  |
+------------------------------------------+
|  +----------------+  +----------------+  |
|  |   Table/List   |  |   Activity     |  |
|  +----------------+  +----------------+  |
+------------------------------------------+
```

**Implementation**:

```vue
{{dashboard_layout_code_example}}
```

**Key Components**:
{{dashboard_layout_key_components}}

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
{{breakpoint_table}}

### Responsive Patterns

{{responsive_patterns_description}}

## Layout Selection Guide

| Content Type | Recommended Layout | Alternative |
|--------------|-------------------|-------------|
{{layout_selection_table}}

---

**Section Source**
{{section_source_files}}
