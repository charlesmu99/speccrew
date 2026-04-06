---
template_name: navigation-patterns
description: Navigation patterns documentation
output_file: layouts/navigation-patterns.md
---

# Navigation Patterns

<cite>
**Files Referenced in This Document**
{{source_files}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Overview

Navigation patterns used in {{platform_name}}.

## Navigation Types

### 1. Sidebar Navigation

**Use Case**: Main application navigation

**Structure**:

```
+------------------+------------------------------------------+
| Logo             |                                          |
+------------------+                                          |
|                  |                                          |
|  Dashboard       |           Main Content Area              |
|  Users           |                                          |
|  Settings        |                                          |
|  ...             |                                          |
|                  |                                          |
+------------------+------------------------------------------+
```

**Implementation**:

```vue
{{sidebar_navigation_code}}
```

**Behavior**:
{{sidebar_behavior}}

---

### 2. Top Navigation

**Use Case**: Secondary navigation, toolbars

**Structure**:

```
+-------------------------------------------------------------+
| Breadcrumb  |          Actions | User Profile               |
+-------------------------------------------------------------+
```

**Implementation**:

```vue
{{top_navigation_code}}
```

---

### 3. Tab Navigation

**Use Case**: Content organization within a page

**Structure**:

```
+-------------------------------------------------------------+
| [Tab 1] [Tab 2] [Tab 3]                                     |
+-------------------------------------------------------------+
|                                                             |
|                    Tab Content                              |
|                                                             |
+-------------------------------------------------------------+
```

**Implementation**:

```vue
{{tab_navigation_code}}
```

---

### 4. Breadcrumb Navigation

**Use Case**: Hierarchical page indication

**Structure**:

```
Home / Category / Current Page
```

**Implementation**:

```vue
{{breadcrumb_code}}
```

---

### 5. Pagination

**Use Case**: List navigation

**Structure**:

```
[Previous] [1] [2] [3] ... [10] [Next]
```

**Implementation**:

```vue
{{pagination_code}}
```

## Navigation State Management

### Active State

{{active_state_guidelines}}

### Collapsed State

{{collapsed_state_guidelines}}

### Mobile Adaptation

{{mobile_adaptation_guidelines}}

## Navigation Guidelines

### Information Architecture

{{ia_guidelines}}

### Accessibility

{{accessibility_guidelines}}

---

**Section Source**
{{section_source_files}}
