---
name: speccrew-dev-review
description: Code Review SOP for validating development outputs against design documents. Acts as an independent reviewer (separate from dev worker) to verify file completeness, code compliance, API consistency, and business logic integrity. Read-only operation - reports findings without modifying code.
tools: Read, Grep, Glob
---

# Trigger Scenarios

- When speccrew-system-developer dispatches code review for a completed module
- When user requests "Review this module's implementation"
- When user asks "Check if code matches design" or "Verify implementation completeness"
- When incremental review is needed after partial implementation

# Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `design_doc_path` | Yes | Path to module design document (e.g., `03.system-design/module-designs/backend-spring/M6-employee-design.md`) |
| `implementation_report_path` | Yes | Path to development report (e.g., `04.dev-reports/backend-spring/M6-employee-implementation-report.md`) |
| `source_root` | Yes | Root directory of source code to review |
| `platform_id` | Yes | Platform identifier (backend-spring/web-vue/mobile-uniapp/desktop-tauri) |
| `api_contract_path` | No | Path to API contract file for endpoint validation |
| `task_id` | Yes | Task identifier from dispatch context |
| `previous_review_path` | No | Path to previous review report for incremental review (skip already passed items) |

# Workflow

## Absolute Constraints

> **These rules apply to ALL review operations. Violation = review failure.**

1. **READ-ONLY OPERATION** — NEVER modify any source code files. Only read and report findings.

2. **FORBIDDEN: Code fixes** — Do NOT attempt to fix issues found. Only document them in the review report.

3. **MANDATORY: Actionable output** — PARTIAL or FAIL results MUST include specific "Re-dispatch Guidance" with prioritized fix list.

4. **INCREMENTAL REVIEW SUPPORT** — If `previous_review_path` is provided, skip items already marked as passed in previous review.

## Step 1: Validate Input and Load Documents

### 1.1 Check Required Inputs

Verify all required parameters are provided:

```
IF design_doc_path missing → Report error, stop
IF implementation_report_path missing → Report error, stop
IF source_root missing → Report error, stop
IF platform_id missing → Report error, stop
IF task_id missing → Report error, stop
```

### 1.2 Read Design Document

Read the module design document at `design_doc_path`:

**Extract Required Information:**

| Section | What to Extract |
|---------|-----------------|
| Module Overview | Module name, description, responsibilities |
| File Structure | Complete list of required files (DO, VO, Mapper, Service, Controller, Convert, Enums, etc.) |
| Class Specifications | Class names, inheritance requirements, annotations required |
| API Endpoints | Endpoint definitions, HTTP methods, paths |
| Business Logic | Service methods, business rules, transaction requirements |

**Error Handling:**
- If design document not found → Report `DEPENDENCY_MISSING` error
- If design document malformed → Report `VALIDATION_ERROR` error

### 1.3 Read Implementation Report

Read the development report at `implementation_report_path`:

**Extract Information:**

| Field | Purpose |
|-------|---------|
| Completed Files | List of files claimed to be implemented |
| Implementation Status | Which tasks were completed |
| Known Issues | Any documented deviations or issues |

### 1.4 Read API Contract (if provided)

If `api_contract_path` is provided, read the API contract document:

**Extract for Validation:**

| Item | Validation Purpose |
|------|-------------------|
| Endpoint Definitions | Verify Controller implements all defined endpoints |
| Request/Response Schemas | Verify VO classes match contract fields |
| HTTP Methods | Verify correct HTTP method annotations |
| Error Codes | Verify consistent error handling |

### 1.5 Load Previous Review (if incremental)

If `previous_review_path` is provided:

1. Read previous review report
2. Extract items marked as "PASSED" or "VERIFIED"
3. These items can be skipped in current review (already validated)

## Step 2: File Completeness Check

### 2.1 Build Expected File List

From design document, extract complete file inventory:

**Backend-Spring File Categories:**

| Category | Pattern | Example |
|----------|---------|---------|
| Enums | `enums/*.java` | `enums/ErrorCodeConstants.java` |
| DO (Data Object) | `dal/dataobject/**/*.java` | `dal/dataobject/employee/EmployeeDO.java` |
| VO (View Object) | `controller/admin/vo/**/*.java` | `controller/admin/vo/EmployeeRespVO.java` |
| Mapper | `dal/mapper/**/*.java` | `dal/mapper/employee/EmployeeMapper.java` |
| Service Interface | `service/**/*.java` | `service/employee/EmployeeService.java` |
| Service Impl | `service/**/*.java` | `service/employee/EmployeeServiceImpl.java` |
| Controller | `controller/admin/**/*.java` | `controller/admin/employee/EmployeeController.java` |
| Convert | `convert/**/*.java` | `convert/employee/EmployeeConvert.java` |

**Other Platforms:**
Adapt file patterns based on `platform_id` conventions.

### 2.2 Scan Actual Files

Use `Glob` to scan `source_root` for implemented files:

```
FOR each category:
  - Glob search for actual files matching category pattern
  - Record found files
```

### 2.3 Compare and Calculate Completeness

Generate completeness matrix:

```markdown
| Category | Required | Created | Missing |
|----------|----------|---------|---------|
| Enums | {count} | {count} | {count} |
| DO | {count} | {count} | {count} |
| VO | {count} | {count} | {count} |
| Mapper | {count} | {count} | {count} |
| Service | {count} | {count} | {count} |
| Controller | {count} | {count} | {count} |
| Convert | {count} | {count} | {count} |
| **Total** | **{total}** | **{total}** | **{total}** |
```

**Completeness Percentage:**
```
completeness_pct = (created_files / required_files) * 100
```

### 2.4 List Missing Files

Generate detailed list of missing files with expected paths:

```markdown
### Missing Files
1. `{expected_path_1}`
2. `{expected_path_2}`
...
```

## Step 3: Code Compliance Check

### 3.1 DO Class Compliance

For each found DO class, verify:

| Check | Rule | Severity |
|-------|------|----------|
| Base Class | Must extend correct base class (e.g., `TenantBaseDO`) | ERROR |
| @TableName | Must have `@TableName` annotation with correct table name | ERROR |
| @Schema | Must have `@Schema` annotation for documentation | WARN |
| Field Annotations | Required fields must have `@NotNull` or similar | WARN |
| Package | Must match design document package structure | ERROR |

### 3.2 VO Class Compliance

For each found VO class, verify:

| Check | Rule | Severity |
|-------|------|----------|
| @Schema | All fields should have `@Schema` annotation | WARN |
| Validation | Required fields must have validation annotations | ERROR |
| Desensitization | Sensitive fields must have desensitization (e.g., phone, ID card) | ERROR |
| Package | Must match design document package structure | ERROR |

### 3.3 Service Compliance

For each found Service, verify:

| Check | Rule | Severity |
|-------|------|----------|
| Interface | Must have Service interface and implementation separation | WARN |
| @Service | Implementation must have `@Service` annotation | ERROR |
| @Transactional | Methods with DB writes must have `@Transactional` | ERROR |
| Method Coverage | All methods defined in design must be implemented | ERROR |
| Data Permission | Must check data permissions where required | ERROR |

### 3.4 Controller Compliance

For each found Controller, verify:

| Check | Rule | Severity |
|-------|------|----------|
| @RestController | Must have `@RestController` annotation | ERROR |
| @RequestMapping | Must have base `@RequestMapping` annotation | ERROR |
| @Operation | Endpoints should have `@Operation` for documentation | WARN |
| @PreAuthorize | Must have permission annotations where required | ERROR |
| Valid | Request VO parameters must have `@Valid` | ERROR |

### 3.5 Naming Convention Check

Verify naming follows conventions:

| Element | Convention | Example |
|---------|------------|---------|
| Class Name | PascalCase, descriptive | `EmployeeServiceImpl` |
| Method Name | camelCase, verb-first | `createEmployee` |
| Variable Name | camelCase | `employeeList` |
| Constant | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |

## Step 4: API Consistency Check

### 4.1 Endpoint Coverage

If `api_contract_path` provided, verify:

| Check | Description | Severity |
|-------|-------------|----------|
| All Endpoints Implemented | Every endpoint in contract exists in Controller | ERROR |
| HTTP Method Correct | `GET/POST/PUT/DELETE` matches contract | ERROR |
| Path Correct | URL path matches contract exactly | ERROR |
| Path Variables | `{id}` placeholders match contract | ERROR |

### 4.2 Request/Response Consistency

Verify VO classes match API contract:

| Check | Description | Severity |
|-------|-------------|----------|
| All Fields Present | VO must have all fields defined in contract | ERROR |
| Field Types Match | Data types must match contract specification | ERROR |
| Required Fields | Non-nullable contract fields must be required in VO | ERROR |
| Field Names Match | JSON property names must match contract | ERROR |

## Step 5: Business Logic Integrity Check

### 5.1 Service Method Coverage

Compare Service implementation against design document:

| Check | Description | Severity |
|-------|-------------|----------|
| All Methods Implemented | Every method in design must exist in Service | ERROR |
| Method Signatures Match | Parameters and return types match design | ERROR |
| Business Rules Implemented | Key business rules from design are coded | ERROR |

### 5.2 Critical Implementation Checks

| Aspect | What to Verify | Severity |
|--------|----------------|----------|
| Transaction Management | DB write operations in `@Transactional` | ERROR |
| Data Permission | Tenant/user isolation implemented | ERROR |
| Input Validation | Service layer validates inputs | ERROR |
| Error Handling | Proper exception handling and error codes | WARN |

## Step 6: Generate Review Report

### 6.1 Determine Review Result

Based on findings, determine overall result:

| Result | Criteria |
|--------|----------|
| **PASS** | All files created, no ERROR-level issues |
| **PARTIAL** | 50-99% files created, or has ERROR issues but not critical blockers |
| **FAIL** | <50% files created, or has critical blockers preventing functionality |

### 6.2 Write Review Report

Generate review report at:
```
speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[module]-review-report.md
```

**Report Structure:**

```markdown
## Dev Review Report

### Summary
- **Task ID**: {task_id}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Review Result**: PASS | PARTIAL | FAIL
- **Completeness**: {completed_files}/{total_files} ({percentage}%)

### File Completeness
| Category | Required | Created | Missing |
|----------|----------|---------|---------|
| Enums | {n} | {n} | {n} |
| DO | {n} | {n} | {n} |
| VO | {n} | {n} | {n} |
| Mapper | {n} | {n} | {n} |
| Service | {n} | {n} | {n} |
| Controller | {n} | {n} | {n} |
| Convert | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** |

### Missing Files
1. `{path}`
2. `{path}`
...

### Code Compliance Issues
1. [{severity}] `{file}`: {issue_description}
2. [{severity}] `{file}`: {issue_description}
...

### API Consistency Issues
1. [{severity}] {issue_description}
...

### Business Logic Issues
1. [{severity}] {issue_description}
...

### Verdict
{Detailed verdict explanation}

### Re-dispatch Guidance
Priority items for next dev worker:
1. {priority_item_1}
2. {priority_item_2}
...
```

## Step 7: Task Completion Report

Output structured Task Completion Report:

### Success Report

```markdown
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: review-{original_task_id}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Output Files**:
  - {review_report_path}
- **Summary**: Review {result}: {completed}/{total} files, {error_count} errors, {warn_count} warnings
```

### Failure Report

If review cannot be completed:

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
- **Partial Outputs**: None
- **Recovery Hint**: {suggestion for recovery}
```

**Error Category Definitions:**
- `DEPENDENCY_MISSING`: Design document or implementation report not found
- `VALIDATION_ERROR`: Input parameters invalid or documents malformed
- `BLOCKED`: Cannot access source code directory or other blocking issue

# Key Rules

| Rule | Description |
|------|-------------|
| **Read-Only** | NEVER modify any source code - only report findings |
| **Blueprint-Driven** | Validate against design document specifications |
| **Actionable Output** | PARTIAL/FAIL must include specific fix guidance |
| **Incremental Support** | Skip already-passed items when previous review provided |
| **Severity Classification** | ERROR = must fix, WARN = should fix |
| **No Code Fixes** | Do NOT attempt to fix issues - only document them |
| **Completeness First** | File existence is primary check before content validation |

# Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| **ERROR** | Critical issue blocking functionality or violating core requirements | Must be fixed before PASS |
| **WARN** | Non-critical issue, best practice violation, or missing documentation | Should be fixed but not blocking |

# Checklist

- [ ] All required input parameters validated
- [ ] Design document successfully loaded and parsed
- [ ] Implementation report successfully loaded
- [ ] File completeness check completed with category breakdown
- [ ] Missing files list generated
- [ ] DO classes checked for base class and annotations
- [ ] VO classes checked for validation and desensitization
- [ ] Service classes checked for @Transactional and permissions
- [ ] Controller classes checked for annotations and endpoints
- [ ] API contract validated against implementation (if provided)
- [ ] Business logic coverage verified against design
- [ ] Review report written with clear verdict
- [ ] Re-dispatch guidance provided for PARTIAL/FAIL
- [ ] Task Completion Report output

# Platform-Specific Adaptations

## backend-spring

- Check for Spring annotations: `@Service`, `@RestController`, `@Mapper`
- Verify MyBatis XML mappers exist alongside Mapper interfaces
- Check for Lombok `@Data` or similar on DO/VO classes
- Validate `@PreAuthorize` for permission control

## web-vue / mobile-uniapp

- Check for Vue component file structure
- Verify API client methods match contract
- Check for Pinia/Vuex store implementations
- Validate route definitions

## desktop-tauri

- Check for Rust module structure
- Verify command handlers registered
- Check for type-safe API bindings
