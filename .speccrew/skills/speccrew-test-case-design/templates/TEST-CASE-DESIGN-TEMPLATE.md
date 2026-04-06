# Test Case Design: {Feature Name}

> **Source Document**: Feature Spec: [Link to feature spec]
> **API Contract**: [Link to API contract]
> **System Design**: [Link to system design]

---

## 1. Test Overview

| Item | Value |
|------|-------|
| Feature Name | {feature_name} |
| Module | {module_name} |
| Test Scope | {scope_description} |
| Related Documents | Feature Spec: {path}, API Contract: {path} |
| Platform | {platform_id} |
| Total Test Cases | {count} |
| Created Date | {date} |

### 1.1 Test Scope Summary

**In Scope:**
- {scope_item_1}
- {scope_item_2}
- {scope_item_3}

**Out of Scope:**
- {out_of_scope_item_1}
- {out_of_scope_item_2}

### 1.2 Test Approach

| Aspect | Approach |
|--------|----------|
| Test Type | Functional Testing, Boundary Testing, Exception Testing |
| Test Level | Integration Testing, System Testing |
| Test Method | Manual / Automated |
| Entry Criteria | Feature Spec approved, API Contract finalized |
| Exit Criteria | All P0/P1 test cases pass, coverage >= 100% for acceptance criteria |

---

## 2. Test Case Matrix

### 2.1 Functional Positive Tests (Happy Path)

| TC ID | Description | Preconditions | Steps | Input Data | Expected Result | Priority |
|-------|-------------|---------------|-------|------------|-----------------|----------|
| TC-{MOD}-001 | {description} | {preconditions} | 1. {step1}<br>2. {step2}<br>3. {step3} | {input} | {expected} | P0 |
| TC-{MOD}-002 | {description} | {preconditions} | 1. {step1}<br>2. {step2} | {input} | {expected} | P0 |
| TC-{MOD}-003 | {description} | {preconditions} | 1. {step1}<br>2. {step2} | {input} | {expected} | P1 |

### 2.2 Boundary Value Tests

| TC ID | Description | Preconditions | Steps | Input Data | Expected Result | Priority |
|-------|-------------|---------------|-------|------------|-----------------|----------|
| TC-{MOD}-010 | {description} - Minimum value | {preconditions} | 1. {step1}<br>2. {step2} | {boundary_value} | {expected} | P1 |
| TC-{MOD}-011 | {description} - Maximum value | {preconditions} | 1. {step1}<br>2. {step2} | {boundary_value} | {expected} | P1 |
| TC-{MOD}-012 | {description} - Empty value | {preconditions} | 1. {step1} | {empty_value} | {expected} | P2 |

### 2.3 Exception/Error Handling Tests

| TC ID | Description | Preconditions | Steps | Input Data | Expected Result | Priority |
|-------|-------------|---------------|-------|------------|-----------------|----------|
| TC-{MOD}-020 | Invalid input format | {preconditions} | 1. {step1}<br>2. {step2} | {invalid_input} | Error: {error_message} | P1 |
| TC-{MOD}-021 | Missing required field | {preconditions} | 1. {step1} | {missing_field} | Error: {error_message} | P1 |
| TC-{MOD}-022 | Business rule violation | {preconditions} | 1. {step1}<br>2. {step2} | {violation_data} | Error: {error_message} | P1 |
| TC-{MOD}-023 | System error handling | {preconditions} | 1. {step1}<br>2. Simulate system error | {input} | Graceful error handling | P2 |

### 2.4 Business Rule Constraint Tests

| TC ID | Description | Preconditions | Steps | Input Data | Expected Result | Priority |
|-------|-------------|---------------|-------|------------|-----------------|----------|
| TC-{MOD}-030 | {business_rule_1} validation | {preconditions} | 1. {step1}<br>2. {step2} | {input} | {expected_result} | P0 |
| TC-{MOD}-031 | {business_rule_2} validation | {preconditions} | 1. {step1}<br>2. {step2} | {input} | {expected_result} | P1 |
| TC-{MOD}-032 | {business_rule_3} validation | {preconditions} | 1. {step1} | {input} | {expected_result} | P1 |

### 2.5 Permission/Security Tests

| TC ID | Description | Preconditions | Steps | Input Data | Expected Result | Priority |
|-------|-------------|---------------|-------|------------|-----------------|----------|
| TC-{MOD}-040 | Unauthenticated access | None | 1. Access feature without login | N/A | Redirect to login / 401 error | P0 |
| TC-{MOD}-041 | Unauthorized operation | User without permission | 1. Attempt restricted operation | {operation_data} | Permission denied / 403 error | P0 |
| TC-{MOD}-042 | Cross-user data access | User A logged in | 1. Attempt to access User B's data | {user_b_id} | Access denied / Data not found | P0 |
| TC-{MOD}-043 | Role-based feature visibility | User with limited role | 1. Navigate to feature area | N/A | Restricted features hidden/disabled | P1 |

### 2.6 Data Validation Tests

| TC ID | Description | Preconditions | Steps | Input Data | Expected Result | Priority |
|-------|-------------|---------------|-------|------------|-----------------|----------|
| TC-{MOD}-050 | Field format validation - {field_name} | {preconditions} | 1. Enter invalid format<br>2. Submit | {invalid_format} | Validation error: {error_message} | P1 |
| TC-{MOD}-051 | Field type validation - {field_name} | {preconditions} | 1. Enter wrong type<br>2. Submit | {wrong_type} | Validation error: {error_message} | P1 |
| TC-{MOD}-052 | Field constraint validation - {field_name} | {preconditions} | 1. Enter value violating constraint | {constraint_violation} | Validation error: {error_message} | P1 |
| TC-{MOD}-053 | Relationship validation | {preconditions} | 1. Enter invalid reference | {invalid_reference} | Validation error: {error_message} | P1 |

### 2.7 State Transition Tests (If Applicable)

| TC ID | Description | Current State | Action | Expected State | Expected Result | Priority |
|-------|-------------|---------------|--------|----------------|-----------------|----------|
| TC-{MOD}-060 | Transition: {state_A} to {state_B} | {state_A} | {action} | {state_B} | {expected_result} | P0 |
| TC-{MOD}-061 | Invalid transition: {state_A} to {state_C} | {state_A} | {invalid_action} | {state_A} | Error: {error_message} | P1 |
| TC-{MOD}-062 | Concurrent state change | {state_A} | Simultaneous updates | {expected_state} | Conflict handling | P2 |

---

## 3. Test Data Definition

### 3.1 Normal Data Set

| Field | Valid Value | Description |
|-------|------------|-------------|
| {field_1} | {valid_value_1} | {description} |
| {field_2} | {valid_value_2} | {description} |
| {field_3} | {valid_value_3} | {description} |
| {field_4} | {valid_value_4} | {description} |
| {field_5} | {valid_value_5} | {description} |

**Complete Normal Test Record:**

```json
{
  "{field_1}": "{value_1}",
  "{field_2}": "{value_2}",
  "{field_3}": "{value_3}",
  "{field_4}": "{value_4}",
  "{field_5}": "{value_5}"
}
```

### 3.2 Boundary Data Set

| Field | Boundary Type | Boundary Value | Expected Behavior |
|-------|--------------|----------------|-------------------|
| {field_1} | Minimum | {min_value} | Accept / Reject with {reason} |
| {field_1} | Maximum | {max_value} | Accept / Reject with {reason} |
| {field_1} | Below minimum | {below_min} | Reject with {error_message} |
| {field_1} | Above maximum | {above_max} | Reject with {error_message} |
| {field_2} | Empty string | "" | Accept as optional / Reject |
| {field_2} | Max length | {max_length_string} | Accept / Truncate |
| {field_2} | Exceed max length | {exceed_string} | Reject with {error_message} |

### 3.3 Exception Data Set

| Field | Invalid Value | Expected Error |
|-------|--------------|----------------|
| {field_1} | {invalid_value_1} | {error_message_1} |
| {field_1} | {invalid_value_2} | {error_message_2} |
| {field_2} | {invalid_value_3} | {error_message_3} |
| {field_3} | {invalid_value_4} | {error_message_4} |
| {field_4} | null (for required field) | {error_message_5} |

### 3.4 Special Character Data Set

| Field | Special Character | Expected Behavior |
|-------|------------------|-------------------|
| {field_1} | < > & " ' | Sanitize / Reject |
| {field_1} | Unicode characters (中文, emoji) | Accept / Reject |
| {field_1} | SQL injection patterns | Sanitize / Reject |
| {field_1} | XSS patterns | Sanitize / Reject |

---

## 4. Coverage Traceability Matrix

### 4.1 Acceptance Criteria Coverage

| AC ID | Acceptance Criteria | Test Case IDs | Coverage Status | Notes |
|-------|--------------------|---------------|-----------------|-------|
| AC-001 | {acceptance_criteria_1} | TC-{MOD}-001, TC-{MOD}-002 | Covered | |
| AC-002 | {acceptance_criteria_2} | TC-{MOD}-003, TC-{MOD}-030 | Covered | |
| AC-003 | {acceptance_criteria_3} | TC-{MOD}-004 | Covered | |
| AC-004 | {acceptance_criteria_4} | TC-{MOD}-040, TC-{MOD}-041 | Covered | |
| AC-005 | {acceptance_criteria_5} | - | Not Covered | Reason: {explanation} |

### 4.2 API Endpoint Coverage

| API Endpoint | Method | Test Case IDs | Coverage Status |
|--------------|--------|---------------|-----------------|
| {/api/path/1} | GET | TC-{MOD}-001, TC-{MOD}-040 | Covered |
| {/api/path/1} | POST | TC-{MOD}-002, TC-{MOD}-020, TC-{MOD}-021 | Covered |
| {/api/path/1}/{id} | PUT | TC-{MOD}-003, TC-{MOD}-050 | Covered |
| {/api/path/1}/{id} | DELETE | TC-{MOD}-004, TC-{MOD}-041 | Covered |

### 4.3 Business Rule Coverage

| Rule ID | Business Rule | Test Case IDs | Coverage Status |
|---------|---------------|---------------|-----------------|
| BR-001 | {business_rule_1} | TC-{MOD}-030 | Covered |
| BR-002 | {business_rule_2} | TC-{MOD}-031 | Covered |
| BR-003 | {business_rule_3} | TC-{MOD}-032 | Covered |

### 4.4 Coverage Summary

| Dimension | Total Items | Covered | Coverage Rate |
|-----------|------------|---------|---------------|
| Acceptance Criteria | {total_ac} | {covered_ac} | {rate}% |
| API Endpoints | {total_api} | {covered_api} | {rate}% |
| Business Rules | {total_br} | {covered_br} | {rate}% |

---

## 5. Test Execution Guidelines

### 5.1 Prerequisites

- [ ] Test environment is properly configured
- [ ] Required test data is prepared and loaded
- [ ] Test accounts with appropriate permissions are available
- [ ] Dependent systems/services are accessible

### 5.2 Test Data Preparation

| Data Type | Description | Quantity |
|-----------|-------------|----------|
| User Accounts | {user_account_description} | {count} |
| Master Data | {master_data_description} | {count} |
| Transaction Data | {transaction_data_description} | {count} |

### 5.3 Execution Sequence

| Sequence | Test Category | Test Case IDs | Dependency |
|----------|---------------|---------------|------------|
| 1 | Permission/Security | TC-{MOD}-040 ~ TC-{MOD}-043 | None |
| 2 | Functional Positive | TC-{MOD}-001 ~ TC-{MOD}-003 | Permission tests pass |
| 3 | Business Rule | TC-{MOD}-030 ~ TC-{MOD}-032 | Functional tests pass |
| 4 | Boundary Value | TC-{MOD}-010 ~ TC-{MOD}-012 | None |
| 5 | Data Validation | TC-{MOD}-050 ~ TC-{MOD}-053 | None |
| 6 | Exception/Error | TC-{MOD}-020 ~ TC-{MOD}-023 | None |
| 7 | State Transition | TC-{MOD}-060 ~ TC-{MOD}-062 | Functional tests pass |

---

## 6. Notes

### 6.1 Assumptions

- {assumption_1}
- {assumption_2}
- {assumption_3}

### 6.2 Dependencies

- {dependency_1}
- {dependency_2}

### 6.3 Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk_1} | {impact_level} | {mitigation_strategy} |
| {risk_2} | {impact_level} | {mitigation_strategy} |

### 6.4 Additional Notes

- {additional_note_1}
- {additional_note_2}

---

**Document Status:** Draft / In Review / Published
**Last Updated:** {date}
**Author:** {author}
