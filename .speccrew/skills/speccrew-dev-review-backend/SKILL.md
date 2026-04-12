---
name: speccrew-dev-review-backend
description: SpecCrew Backend Code Review Skill. Reviews backend implementation code against system design documents, API contracts, and coding standards. Generates structured review reports with PASS/PARTIAL/FAIL verdict.
tools: Read, Glob, Grep
---

# Trigger Scenarios

- When speccrew-system-developer dispatches backend code review for a completed module
- When user requests "Review this backend module's implementation"
- When user asks "Check if backend code matches design"
- When incremental review is needed after partial backend implementation

# Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `design_doc_path` | Yes | Path to backend module design document |
| `implementation_report_path` | Yes | Path to backend development report |
| `source_root` | Yes | Root directory of backend source code |
| `platform_id` | Yes | Backend platform (backend-spring, backend-nodejs) |
| `api_contract_path` | No | Path to API contract file for endpoint validation |
| `task_id` | Yes | Task identifier from dispatch context |
| `previous_review_path` | No | Path to previous review report for incremental review |

# Workflow

## Absolute Constraints

> **Violation = review failure.**

1. **READ-ONLY OPERATION** — NEVER modify source code files. Only read and report findings.
2. **FORBIDDEN: Code fixes** — Do NOT attempt to fix issues. Only document them.
3. **MANDATORY: Actionable output** — PARTIAL/FAIL results MUST include specific "Re-dispatch Guidance".
4. **INCREMENTAL REVIEW SUPPORT** — If `previous_review_path` provided, skip items already marked as passed.

## Step 1: Load Documents

### 1.1 Validate Inputs

Verify all required parameters provided. If any missing → Report error, stop.

### 1.2 Read Design Document

Extract from backend design document:

| Section | Information to Extract |
|---------|------------------------|
| Module Overview | Module name, responsibilities |
| File Structure | Required files (DO, VO, Mapper, Service, Controller, Convert, Enums) |
| Class Specifications | Class names, inheritance requirements, annotations |
| API Endpoints | Endpoint definitions, HTTP methods, paths |
| Business Logic | Service methods, transaction requirements |

### 1.3 Read Implementation Report

Extract: Completed Files, Implementation Status, Known Issues.

### 1.4 Read API Contract (if provided)

Extract for validation: Endpoint Definitions, Request/Response Schemas, HTTP Methods, Error Codes.

## Step 2: File Completeness Check

### 2.1 Build Expected File List

Backend file categories:

| Category | Pattern | Example |
|----------|---------|---------|
| Enums | `enums/*.java` | `enums/ErrorCodeConstants.java` |
| DO | `dal/dataobject/**/*.java` | `dal/dataobject/employee/EmployeeDO.java` |
| VO | `controller/admin/vo/**/*.java` | `controller/admin/vo/EmployeeRespVO.java` |
| Mapper | `dal/mapper/**/*.java` | `dal/mapper/employee/EmployeeMapper.java` |
| Service | `service/**/*.java` | `service/employee/EmployeeService.java` |
| Controller | `controller/admin/**/*.java` | `controller/admin/employee/EmployeeController.java` |
| Convert | `convert/**/*.java` | `convert/employee/EmployeeConvert.java` |

### 2.2 Scan Actual Files

Use `Glob` to scan `source_root` for implemented files.

### 2.3 Calculate Completeness

Generate completeness matrix and percentage: `completeness_pct = (created / required) * 100`

## Step 3: Backend-Specific Compliance Check

### 3.1 DO/VO/DTO Compliance

| Check | Rule | Severity |
|-------|------|----------|
| Base Class | Must extend correct base class (e.g., `TenantBaseDO`) | ERROR |
| @TableName | Must have `@TableName` with correct table name | ERROR |
| @Schema | Must have `@Schema` for documentation | WARN |
| Validation | Required fields must have `@NotNull` or similar | ERROR |
| Desensitization | Sensitive fields must have desensitization | ERROR |

### 3.2 Service Layer Check

| Check | Rule | Severity |
|-------|------|----------|
| Interface | Must have Service interface and implementation separation | WARN |
| @Service | Implementation must have `@Service` annotation | ERROR |
| @Transactional | DB write methods must have `@Transactional` | ERROR |
| Method Coverage | All methods in design must be implemented | ERROR |
| Data Permission | Must check data permissions where required | ERROR |

### 3.3 Controller Layer Check

| Check | Rule | Severity |
|-------|------|----------|
| @RestController | Must have `@RestController` annotation | ERROR |
| @RequestMapping | Must have base `@RequestMapping` annotation | ERROR |
| @Operation | Endpoints should have `@Operation` for documentation | WARN |
| @PreAuthorize | Must have permission annotations where required | ERROR |
| @Valid | Request VO parameters must have `@Valid` | ERROR |

### 3.4 Database Mapping Validation

- Verify Entity fields match design document
- Check MyBatis XML mappers exist alongside Mapper interfaces
- Validate Lombok `@Data` or similar on DO/VO classes

## Step 4: API Consistency Check

If `api_contract_path` provided:

| Check | Description | Severity |
|-------|-------------|----------|
| Endpoint Coverage | All contract endpoints exist in Controller | ERROR |
| HTTP Method | Methods match contract | ERROR |
| Path Match | URL paths match contract exactly | ERROR |
| VO Fields | All contract fields present in VO | ERROR |
| Field Types | Data types match contract | ERROR |

## Step 5: Generate Review Report

### 5.1 Determine Result

| Result | Criteria |
|--------|----------|
| **PASS** | 100% files created, 0 ERROR-level issues |
| **PARTIAL** | 70-99% files created, or non-critical ERROR issues |
| **FAIL** | <70% files created, or critical blockers present |

### 5.2 Write Report

Generate report at: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[module]-review-report.md`

Use template from `templates/REVIEW-REPORT-TEMPLATE.md`.

## Step 6: Task Completion Report

### Success

```markdown
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: review-{original_task_id}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Output Files**: {review_report_path}
- **Summary**: Review {result}: {completed}/{total} files, {error_count} errors
```

### Failure

```markdown
## Task Completion Report
- **Status**: FAILED
- **Task ID**: review-{original_task_id}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Output Files**: None
- **Summary**: Review failed during {step}
- **Error**: {detailed error description}
- **Error Category**: DEPENDENCY_MISSING | VALIDATION_ERROR | BLOCKED
- **Recovery Hint**: {suggestion}
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
| **Incremental Support** | Skip already-passed items when previous review provided |
| **Completeness First** | File existence is primary check before content validation |

# Checklist

- [ ] All required inputs validated
- [ ] Design document loaded and parsed
- [ ] File completeness check completed with category breakdown
- [ ] DO classes checked for base class and annotations
- [ ] VO classes checked for validation and desensitization
- [ ] Service classes checked for @Transactional and permissions
- [ ] Controller classes checked for annotations and endpoints
- [ ] API contract validated against implementation (if provided)
- [ ] Review report written with clear verdict
- [ ] Re-dispatch guidance provided for PARTIAL/FAIL
