---
name: speccrew-dev-review-frontend
description: SpecCrew Frontend Code Review Skill. Reviews web frontend implementation code against system design documents, API contracts, and coding standards. Generates structured review reports with PASS/PARTIAL/FAIL verdict.
tools: Read, Glob, Grep
---

# Trigger Scenarios

- When speccrew-system-developer dispatches frontend code review for a completed module
- When user requests "Review this frontend module's implementation"
- When user asks "Check if frontend code matches design"
- When incremental review is needed after partial frontend implementation

# Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `design_doc_path` | Yes | Path to frontend module design document |
| `implementation_report_path` | Yes | Path to frontend development report |
| `source_root` | Yes | Root directory of frontend source code |
| `platform_id` | Yes | Frontend platform (web-vue, web-react) |
| `api_contract_path` | No | Path to API contract file |
| `task_id` | Yes | Task identifier from dispatch context |
| `previous_review_path` | No | Path to previous review report |

# Workflow

## Absolute Constraints

> **Violation = review failure.**

1. **READ-ONLY OPERATION** — NEVER modify source code files.
2. **FORBIDDEN: Code fixes** — Do NOT attempt to fix issues. Only document them.
3. **MANDATORY: Actionable output** — PARTIAL/FAIL results MUST include specific "Re-dispatch Guidance".
4. **INCREMENTAL REVIEW SUPPORT** — Skip items already marked as passed in previous review.

## Step 1: Load Documents

### 1.1 Validate Inputs

Verify all required parameters provided. If any missing → Report error, stop.

### 1.2 Read Design Document

Extract: Module Overview, Component Structure, Store Modules, Routes, API Integration points.

### 1.3 Read Implementation Report

Extract: Completed Files, Implementation Status, Known Issues.

### 1.4 Read API Contract (if provided)

Extract API endpoints for validation against frontend API calls.

## Step 2: File Completeness Check

### 2.1 Build Expected File List

Frontend file categories:

| Category | Pattern | Example |
|----------|---------|---------|
| Components | `components/**/*.vue` or `**/*.tsx` | `components/UserForm.vue` |
| Views/Pages | `views/**/*.vue` or `pages/**/*.tsx` | `views/UserList.vue` |
| Store | `store/**/*.ts` or `stores/**/*.ts` | `store/userStore.ts` |
| API Clients | `api/**/*.ts` or `services/**/*.ts` | `api/userApi.ts` |
| Routes | `router/**/*.ts` | `router/index.ts` |
| Styles | `styles/**/*.scss` or `**/*.module.css` | `styles/variables.scss` |

### 2.2 Scan Actual Files

Use `Glob` to scan `source_root` for implemented files.

### 2.3 Calculate Completeness

Generate completeness matrix and percentage.

## Step 3: Frontend-Specific Compliance Check

### 3.1 Component Structure Check

| Check | Rule | Severity |
|-------|------|----------|
| Directory Structure | Components in correct directories per design | ERROR |
| Component Granularity | Components appropriately sized and reusable | WARN |
| Naming Convention | PascalCase for components, camelCase for composables | ERROR |
| Props Definition | Props properly typed and documented | WARN |

### 3.2 State Management Check

| Check | Rule | Severity |
|-------|------|----------|
| Store Design | Store modules match design specification | ERROR |
| Data Flow | Unidirectional data flow followed | WARN |
| State Mutations | Mutations/actions properly defined | ERROR |

### 3.3 API Call Consistency

| Check | Rule | Severity |
|-------|------|----------|
| Endpoint Match | API calls match API contract | ERROR |
| Error Handling | API errors properly handled | ERROR |
| Loading States | Loading states implemented | WARN |

### 3.4 Route Definition Validation

| Check | Rule | Severity |
|-------|------|----------|
| Route Match | Routes match design document | ERROR |
| Lazy Loading | Routes use lazy loading where appropriate | WARN |
| Navigation Guards | Auth guards implemented where required | ERROR |

### 3.5 Style and Layout Compliance

| Check | Rule | Severity |
|-------|------|----------|
| Style Guide | Follows project style guide | WARN |
| Responsive | Responsive design implemented | ERROR |
| Accessibility | Basic accessibility (a11y) compliance | WARN |

## Step 4: Generate Review Report

### 4.1 Determine Result

| Result | Criteria |
|--------|----------|
| **PASS** | 100% files created, 0 ERROR-level issues |
| **PARTIAL** | 70-99% files created, or non-critical ERROR issues |
| **FAIL** | <70% files created, or critical blockers present |

### 4.2 Write Report

Generate report at: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[module]-review-report.md`

Use template from `templates/REVIEW-REPORT-TEMPLATE.md`.

## Step 5: Task Completion Report

```markdown
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: review-{original_task_id}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Output Files**: {review_report_path}
- **Summary**: Review {result}: {completed}/{total} files, {error_count} errors
```

# Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| **ERROR** | Blocking functionality or violating core requirements | Must fix before PASS |
| **WARN** | Best practice violation or missing documentation | Should fix |
| **LOW** | Code style or minor optimization suggestion | Optional |

# Key Rules

| Rule | Description |
|------|-------------|
| **Read-Only** | NEVER modify any source code |
| **Blueprint-Driven** | Validate against design document specifications |
| **Actionable Output** | PARTIAL/FAIL must include specific fix guidance |
| **Completeness First** | File existence is primary check before content validation |

# Checklist

- [ ] All required inputs validated
- [ ] Design document loaded and parsed
- [ ] File completeness check completed
- [ ] Component structure validated
- [ ] State management checked
- [ ] API calls validated against contract
- [ ] Routes verified against design
- [ ] Styles checked for compliance
- [ ] Review report written with clear verdict
- [ ] Re-dispatch guidance provided for PARTIAL/FAIL
