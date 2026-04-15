---
name: speccrew-dev-review-mobile
description: SpecCrew Mobile Code Review Skill. Reviews mobile app implementation code against system design documents, API contracts, and platform-specific standards. Generates structured review reports with PASS/PARTIAL/FAIL verdict.
tools: Read, Glob, Grep
---

# Trigger Scenarios

- When speccrew-system-developer dispatches mobile code review for a completed module
- When user requests "Review this mobile module's implementation"
- When user asks "Check if mobile code matches design"
- When incremental review is needed after partial mobile implementation

# Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `design_doc_path` | Yes | Path to mobile module design document |
| `implementation_report_path` | Yes | Path to mobile development report |
| `source_root` | Yes | Root directory of mobile source code |
| `platform_id` | Yes | Mobile platform (mobile-uniapp, mobile-flutter, mobile-react-native) |
| `api_contract_path` | No | Path to API contract file |
| `task_id` | Yes | Task identifier from dispatch context |
| `previous_review_path` | No | Path to previous review report |

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

## Workflow

### Absolute Constraints

> **Violation = review failure.**

1. **READ-ONLY OPERATION** — NEVER modify source code files.
2. **FORBIDDEN: Code fixes** — Do NOT attempt to fix issues. Only document them.
3. **MANDATORY: Actionable output** — PARTIAL/FAIL results MUST include specific "Re-dispatch Guidance".
4. **INCREMENTAL REVIEW SUPPORT** — Skip items already marked as passed in previous review.

## Step 1: Load Documents

### 1.1 Validate Inputs

Verify all required parameters provided. If any missing → Report error, stop.

### 1.2 Read Design Document

Extract: Module Overview, Page/Component Structure, Native Features, Offline Support requirements.

### 1.3 Read Implementation Report

Extract: Completed Files, Implementation Status, Known Issues.

### 1.4 Read API Contract (if provided)

Extract API endpoints for validation against mobile API calls.

## Step 2: File Completeness Check

### 2.1 Build Expected File List

Mobile file categories:

| Category | Pattern | Example |
|----------|---------|---------|
| Pages | `pages/**/*` or `screens/**/*` | `pages/user/index.vue` |
| Components | `components/**/*` | `components/UserCard.vue` |
| Store | `store/**/*` | `store/user.js` |
| API | `api/**/*` or `services/**/*` | `api/user.js` |
| Utils | `utils/**/*` | `utils/permission.js` |
| Native Modules | `native/**/*` or `plugins/**/*` | `native/bridge.js` |

### 2.2 Scan Actual Files

Use `Glob` to scan `source_root` for implemented files.

### 2.3 Calculate Completeness

Generate completeness matrix and percentage.

## Step 3: Mobile-Specific Compliance Check

### 3.1 Mobile Component Check

| Check | Rule | Severity |
|-------|------|----------|
| Platform Components | Uses correct platform-specific components | ERROR |
| Component Reuse | Components appropriately reusable | WARN |
| Native Component Usage | Proper use of native UI components | WARN |

### 3.2 Platform Adaptation Validation

| Check | Rule | Severity |
|-------|------|----------|
| iOS/Android Differences | Platform-specific differences handled | ERROR |
| Screen Adaptation | Different screen sizes handled | ERROR |
| Safe Area | Safe area insets respected | ERROR |
| Platform APIs | Platform-specific APIs correctly used | WARN |

### 3.3 Permission Handling Check

| Check | Rule | Severity |
|-------|------|----------|
| Runtime Permissions | Runtime permission requests implemented | ERROR |
| Permission Rationale | User-friendly permission explanations | WARN |
| Denial Handling | Graceful handling of permission denial | ERROR |

### 3.4 Offline Support Validation

| Check | Rule | Severity |
|-------|------|----------|
| Local Storage | Data caching implemented where required | ERROR |
| Sync Mechanism | Offline data sync strategy implemented | ERROR |
| Network State | Network connectivity handling | ERROR |
| Queue Management | Pending request queue management | WARN |

### 3.5 Performance Check

| Check | Rule | Severity |
|-------|------|----------|
| List Rendering | Virtual scrolling for long lists | ERROR |
| Image Optimization | Image lazy loading and caching | WARN |
| Memory Management | Proper cleanup of listeners/timers | ERROR |
| Bundle Size | Code splitting where appropriate | WARN |

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
| **CRITICAL** | Security vulnerability or data integrity issue | Must fix immediately |
| **ERROR** | Blocking functionality or violating core requirements | Must fix before PASS |
| **WARN** | Best practice violation or missing documentation | Should fix |
| **LOW** | Code style or minor optimization suggestion | Optional |

# Key Rules

| Rule | Description |
|------|-------------|
| **Read-Only** | NEVER modify any source code |
| **Blueprint-Driven** | Validate against design document specifications |
| **Actionable Output** | PARTIAL/FAIL must include specific fix guidance |
| **Platform-Specific** | Consider iOS/Android platform differences |
| **Completeness First** | File existence is primary check before content validation |

# Checklist

- [ ] All required inputs validated
- [ ] Design document loaded and parsed
- [ ] File completeness check completed
- [ ] Mobile components validated
- [ ] Platform adaptation checked
- [ ] Permission handling verified
- [ ] Offline support validated
- [ ] Performance checks completed
- [ ] Review report written with clear verdict
- [ ] Re-dispatch guidance provided for PARTIAL/FAIL
