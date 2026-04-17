# Feature Specification - [Feature Name]

<!-- AI-NOTE: CRITICAL — Business Perspective Guidelines
This Feature Spec is a PURE BUSINESS document describing WHAT the system does, NOT HOW it's implemented.

## What to Include (Business Perspective)
- ✅ User roles, business processes, functional requirements
- ✅ Data meaning, business rules, constraints (conceptual level)
- ✅ API functionality and parameter business meaning (no framework details)
- ✅ Business validation rules, permission rules (business level)
- ✅ Interaction flow business logic (What happens)
- ✅ Conceptual data entities and their relationships

## What to EXCLUDE (Technical Perspective) — FORBIDDEN
- ❌ File paths or code paths (src/views/..., yudao-module-base/..., pages/base/...)
- ❌ Framework-specific code (Vue directives, Java annotations, SQL statements)
- ❌ Framework/library names as implementation choices (MyBatis-Plus, Flyway, wot-design-uni, Element Plus component names)
- ❌ Programming language specific types (VARCHAR(50), BIGINT, Long, String)
- ❌ Component library element names (el-button, wd-cell, ElDatePicker, etc.)
- ❌ Error code numeric values or enum definitions
- ❌ Database table names, column names, SQL DDL/DML
- ❌ API layer implementation (request.get, @TableName, etc.)
- ❌ Maven/Gradle module paths, package paths
- ❌ Class names, method signatures, annotation names

## Correct Approach Examples

❌ WRONG (Technical):
| Field | Type | Constraint |
| shop_id | BIGINT NOT NULL | FK to system_shop |

✅ CORRECT (Business):
| Field | Business Type | Constraint | Meaning |
| Shop ID | Identifier | Required, references Shop entity | Which shop this record belongs to |

❌ WRONG (Technical):
`src/views/base/shop/index.vue` with `<el-button v-hasPermi="['base:shop:create']">`

✅ CORRECT (Business):
Shop List Page — displays all shops with search/filter, includes "Add Shop" button (visible to Admin role only)
---

> **Applicable Scenario**: System feature specification for a single feature or module
> **Target Audience**: speccrew-feature-designer, speccrew-designer, speccrew-dev
> **Source PRD**: [Link to PRD document]

---

## 0. Feature Analysis Summary

<!-- AI-NOTE: Auto-populated during unified analyze+design workflow.
Serves as audit trail for the analysis phase. Can be removed in final delivery.
DO NOT use this section as substitute for Sections 1-6. -->

### 0.1 Function Breakdown

| # | Function Name | Type | System Relationship | Related User Stories |
|---|--------------|------|-------------------|---------------------|
| 1 | {function_name} | {Page+API/API-only} | {[NEW]/[MODIFIED]/[EXISTING]} | {stories} |

### 0.2 Summary Statistics

- **Total Functions**: {count}
- **[NEW]**: {count}
- **[MODIFIED]**: {count}  
- **[EXISTING]**: {count}

---

## 1. Overview

### 1.1 Basic Information

| Item | Description |
|------|-------------|
| Feature ID | {Feature ID, e.g., F-CRM-01} |
| Feature Name | {Feature Name} |
| Feature Type | {Page+API / API-only} |
| Source PRD | {Link to Sub-PRD document} |
| Module | {Module Name} |
| Core Function | {1-3 sentences describing core feature value} |
| Target Users | {Describe target user groups} |
| Applicable Scenario | {Describe core applicable business scenarios} |

### 1.2 Feature Scope

<!-- AI-NOTE: This specification covers a SINGLE Feature (business operation unit), not the entire module. Check all items that this specification covers.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

- [ ] {Function 1} - Frontend prototype + Interaction flow + Backend interface + Data definition
- [ ] {Function 2} - Frontend prototype + Interaction flow + Backend interface + Data definition
- [ ] {Function 3} - Frontend prototype + Interaction flow + Backend interface + Data definition

### 1.3 Relationship to Existing System

| Module | Relationship Type | Description |
|--------|-------------------|-------------|
| {Module A} | EXISTING | {This module already exists, this feature reads data from it} |
| {Module B} | MODIFIED | {This module will be modified to support new functionality} |
| {Module C} | NEW | {This is a new module created for this feature} |

---

## 2. Function Details

<!-- AI-NOTE: Repeat Section 2.N for each function in the feature. Each function should include: frontend prototype, interaction flow, backend interface, and data definition.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

### 2.1 Function: {Function Name}

#### 2.1.1 Frontend Prototype

<!-- AI-NOTE: If the project has multiple frontend platforms (e.g., web + mobile), create separate Frontend Prototype sub-sections for each platform. Use headers like "#### 2.1.1 Frontend Prototype - Web" and "#### 2.1.1b Frontend Prototype - Mobile". Each platform should have its own wireframes and element descriptions tailored to the platform's interaction patterns.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

<!-- AI-NOTE: Use ASCII wireframes to show the UI layout. Choose the appropriate pattern below based on the interface type.
FORBIDDEN: Do NOT use framework-specific component names (el-button, wd-cell, etc.) or file paths in wireframes. -->

**Pattern A: List Page**

```
┌─────────────────────────────────────────────────────────────┐
│ [Page Title] {e.g., Product Management List}                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│ │ Filter Area │ □ Checkbox  │ Input □     │ Dropdown ▼  │  │
│ │             │ Keyword:____|____________ │ Status:_____▼│  │
│ │             │ [Query]     [Reset]  [Add]                 │  │
│ └─────────────┴─────────────┴─────────────┴─────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ No.  │ Field 1 │ Field 2 │ Field 3 │ Actions         │ │
│ ├──────┼─────────┼─────────┼─────────┼─────────────────┤ │
│ │ 1    │ {Value} │ {Value} │ {Value} │ [Edit][Delete]  │ │
│ │ 2    │ {Value} │ {Value} │ {Value} │ [Edit][Delete]  │ │
│ │ ...  │ ...     │ ...     │ ...     │ ...             │ │
│ └──────┴─────────┴─────────┴─────────┴─────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Pagination: Total {X} records  Page [1][2][3]  {X}/page ▼│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Pattern B: Form Page**

```
┌─────────────────────────────────────────────────────────────┐
│ [Page Title] {e.g., Add Product}                            │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Basic Information Area                                    │ │
│ │ ┌─────────────┬───────────────────────────────────────┐ │ │
│ │ │ Label       │ Input/Select                           │ │ │
│ │ │ Product:    │ ____|__________________________________ │ │ │
│ │ │ Code:       │ ____|__________________________________ │ │ │
│ │ │ Status:     │ □ Enable  □ Disable                   │ │ │
│ │ │ Category:   │ ______▼                               │ │ │
│ │ └─────────────┴───────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Save]                    [Cancel]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Pattern C: Modal/Dialog**

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Modal Title] {e.g., Delete Confirmation}               │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Message: {e.g., Are you sure to delete this product?    │ │
│ │           This action cannot be undone!}                │ │
│ │                                                         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │            [Cancel]        [Confirm]                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Pattern M-A: Mobile Card List**

<!-- AI-NOTE: Use this pattern instead of Pattern A when designing for mobile platforms -->

```
+----------------------------------+
|  < Back     Title       [+ Add]  |
+----------------------------------+
|  [Search...]            [Filter] |
+----------------------------------+
|  +----------------------------+  |
|  | Title          Status Tag  |  |
|  | Subtitle / Key info        |  |
|  | Detail line      [Action]  |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | Title          Status Tag  |  |
|  | Subtitle / Key info        |  |
|  | Detail line      [Action]  |  |
|  +----------------------------+  |
|                                  |
|  [Load More / Pull to Refresh]   |
+----------------------------------+
|  [Tab1] [Tab2] [Tab3] [Tab4]    |
+----------------------------------+
```

**Pattern M-B: Mobile Form**

<!-- AI-NOTE: Use this pattern instead of Pattern B when designing for mobile platforms -->

```
+----------------------------------+
|  < Back     Title       [Save]   |
+----------------------------------+
|  Label                           |
|  [Full-width input          ]    |
|                                  |
|  Label                           |
|  [Full-width input          ]    |
|                                  |
|  Label                           |
|  [Picker / Selector         >]   |
|                                  |
|  Label                           |
|  [Switch toggle            O ]   |
+----------------------------------+
```

**Pattern M-C: Action Sheet**

<!-- AI-NOTE: Use this pattern instead of Pattern C when designing for mobile platforms -->

```
+----------------------------------+
| (dimmed background)              |
|                                  |
|  +----------------------------+  |
|  | Action Sheet Title         |  |
|  +----------------------------+  |
|  | Option 1                   |  |
|  +----------------------------+  |
|  | Option 2                   |  |
|  +----------------------------+  |
|  | Cancel                     |  |
|  +----------------------------+  |
+----------------------------------+
```

**Interface Element Description:**

| Area | Element | Type | Description | Interaction |
|------|---------|------|-------------|-------------|
| {Area Name} | {Element Name} | {Input/Button/Link/etc} | {Description of purpose} | {Click/Blur/Change behavior} |
| {Area Name} | {Element Name} | {Type} | {Description} | {Interaction} |

#### 2.1.2 Interaction Flow

<!-- AI-NOTE: Use Mermaid sequenceDiagram to show the flow: User → Frontend → Backend API → Data Store. NO style definitions allowed. NO HTML tags. CRITICAL: This section MUST contain mermaid syntax. Plain text or ASCII flowcharts are FORBIDDEN.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant A as API
    participant B as Business Logic
    participant D as Data Store
    
    U->>F: 1. {User action, e.g., Click Add button}
    F->>F: 2. {Frontend processing, e.g., Open form}
    U->>F: 3. {User input, e.g., Fill form data}
    U->>F: 4. {User action, e.g., Click Save}
    F->>F: 5. {Frontend validation}
    
    alt Validation passed
        F->>A: 6. {API call, e.g., POST /api/resource}
        A->>B: 7. {Business validation}
        
        alt Business validation passed
            B->>D: 8. {Data operation, e.g., Save data}
            D-->>B: 9. {Return result}
            B-->>A: 10. {Return success}
            A-->>F: 11. {Return success response}
            F->>F: 12. {UI update, e.g., Show success message}
            F->>U: 13. {Final state, e.g., Return to list}
        else Business validation failed
            B-->>A: {Return error}
            A-->>F: {Return error response}
            F->>U: {Show error message}
        end
    else Validation failed
        F->>U: {Show validation error}
    end
```

**Interaction Rules:**

| Trigger | Behavior | API Called | Exception Handling |
|---------|----------|------------|-------------------|
| {Trigger event} | {Behavior description} | {API name or -} | {Exception handling} |
| {Trigger} | {Behavior} | {API} | {Exception} |

#### 2.1.3 Backend Interface

<!-- AI-NOTE: Describe API functionality from a business perspective. Focus on WHAT each API does, not HOW it's implemented.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

**Interface List:**

| Interface Name | Method | Path Pattern | Description | Caller |
|----------------|--------|--------------|-------------|--------|
| {Interface Name} | GET/POST/PUT/DELETE | {/api/path/pattern} | {Description} | {Frontend/Other} |
| {Interface Name} | {Method} | {Path} | {Description} | {Caller} |

**Processing Logic:**

<!-- AI-NOTE: Use Mermaid flowchart TD to show the processing logic for each core interface. Show: business validation → data operation → response. NO style definitions allowed. CRITICAL: This section MUST contain mermaid syntax. Plain text or ASCII flowcharts are FORBIDDEN.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

```mermaid
flowchart TD
    Start[Request Received] --> Validation{Business Validation}
    
    Validation -->|Failed| ValidationError[Return Validation Error]
    ValidationError --> End1[End]
    
    Validation -->|Passed| CheckPermission{Permission Check}
    
    CheckPermission -->|Failed| PermissionError[Return Permission Error]
    PermissionError --> End2[End]
    
    CheckPermission -->|Passed| DataOperation[Execute Data Operation]
    
    DataOperation -->|Failed| OperationError[Return Operation Error]
    OperationError --> End3[End]
    
    DataOperation -->|Success| BuildResponse[Build Success Response]
    BuildResponse --> End4[End]
```

**Data Access:**

| Operation | Data Structure | Access Type | Description |
|-----------|----------------|-------------|-------------|
| {e.g., Query list} | {Structure name} | Read | {Description of access} |
| {e.g., Create record} | {Structure name} | Create | {Description} |
| {e.g., Update record} | {Structure name} | Write | {Description} |

#### 2.1.4 Data Definition

<!-- AI-NOTE: ALL field definitions MUST use BUSINESS terms, not technical types.
Example: NOT "VARCHAR(50) NOT NULL" → BUT "Text, required, max 50 characters"
CRITICAL: Never include database table/column names, SQL types, or framework-specific annotations.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

**Fields:**

| Field Name | Business Type | Constraint Rules | Business Meaning | New/Existing | Remarks |
|------------|---------------|------------------|------------------|--------------|---------|
| {Field Name} | Text/Number/Boolean/Date/Enum/Identifier | {e.g., Required, max 50 chars, unique} | {What this field means in business context} | NEW/EXISTING | {Additional notes} |
| {Field Name} | {Business Type} | {Constraints} | {Business Meaning} | NEW/EXISTING | {Remarks} |

**Data Source:**

| Field Name | Data Source | Update Timing | Description |
|------------|-------------|---------------|-------------|
| {Field Name} | User input | On form submission | {Description} |
| {Field Name} | System generated | On record creation | {e.g., Auto-generated ID} |
| {Field Name} | Reference from {source} | {Timing} | {Description} |

---

### 2.2 Function: {Function Name}

<!-- AI-NOTE: Repeat the same structure as 2.1 for each additional function -->

#### 2.2.1 Frontend Prototype

<!-- AI-NOTE: If multi-platform, create separate wireframes per platform (Web + Mobile) -->

{ASCII wireframe and element description per platform}

#### 2.2.2 Interaction Flow

{Mermaid sequenceDiagram and interaction rules}

#### 2.2.3 Backend Interface

{Interface list, processing logic flowchart, data access}

#### 2.2.4 Data Definition

{Fields and data source}

---

## 3. Cross-Function Concerns

### 3.1 Shared Data Structures

<!-- AI-NOTE: List data structures used across multiple functions
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

| Structure Name | Used By Functions | Description |
|----------------|-------------------|-------------|
| {Structure Name} | {Function 1}, {Function 2} | {Description} |
| {Structure Name} | {Functions} | {Description} |

### 3.2 Cross-Function Flows

<!-- AI-NOTE: Use Mermaid sequenceDiagram for flows that span multiple functions. NO style definitions. NO HTML tags.
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

```mermaid
sequenceDiagram
    actor U as User
    participant F1 as Function A Frontend
    participant A1 as Function A API
    participant F2 as Function B Frontend
    participant A2 as Function B API
    participant D as Data Store
    
    U->>F1: Action in Function A
    F1->>A1: API call
    A1->>D: Data operation
    A1-->>F1: Response
    F1->>F2: Navigate to Function B
    F2->>A2: Load related data
    A2->>D: Query data
    A2-->>F2: Return data
    F2->>U: Display Function B
```

---

## 4. Business Rules & Constraints

### 4.1 Permission Rules

| Operation | Permission Requirement | No Permission Handling |
|-----------|----------------------|----------------------|
| {Operation name} | {Role/Permission required} | {How to handle - hide button, show error, etc.} |
| {Operation} | {Requirement} | {Handling} |

### 4.2 Business Logic Rules

<!-- AI-NOTE: Numbered list of business rules
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

1. **{Rule Name}**: {Detailed description of the rule}
2. **{Rule Name}**: {Detailed description}
3. **{Rule Name}**: {Detailed description}

### 4.3 Validation Rules

| Scenario | Rule | Prompt Message | Validation Timing |
|----------|------|----------------|-------------------|
| {Scenario} | {Validation rule} | {Error message to show} | {Frontend/Backend/Both} |
| {Scenario} | {Rule} | {Message} | {Timing} |

---

## 5. API Contract Summary

### 5.1 Complete API List

| API Name | Method | Path | Description | Related Function |
|----------|--------|------|-------------|------------------|
| {API Name} | GET/POST/PUT/DELETE | {/api/path} | {Description} | {Function Name} |
| {API Name} | {Method} | {Path} | {Description} | {Function Name} |

### 5.2 Shared Response Format

<!-- AI-NOTE: Standard response JSON structure used across all APIs in this feature
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

**Success Response:**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "{field1}": "{value1}",
    "{field2}": "{value2}"
  }
}
```

**Error Response:**

```json
{
  "code": {error_code},
  "message": "{error_message}",
  "data": null
}
```

### 5.3 Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| {Code} | {Status} | {Description} |
| {Code} | {Status} | {Description} |

---

## 6. Notes

### 6.1 Pending Confirmations

<!-- AI-NOTE: Checklist of items needing confirmation from stakeholders
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

- [ ] **{Item 1}**: {Description of what needs confirmation}
- [ ] **{Item 2}**: {Description}

### 6.2 Assumptions & Dependencies

<!-- AI-NOTE: List assumptions made and external dependencies
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

- **Assumption 1**: {Description of assumption}
- **Dependency 1**: {External system or module this feature depends on}

### 6.3 Extension Notes

<!-- AI-NOTE: Notes about future iterations or extensions
FORBIDDEN: Do NOT include file paths, framework code, SQL statements, component library names, or any implementation-specific details in this section. -->

- {Note about potential future enhancements}
- {Note about scalability considerations}

---

**Document Status:** Draft / In Review / Published
**Last Updated:** {Date}
**Source PRD:** [PRD Document](link)
**Related Module:** [Module Overview](link)
