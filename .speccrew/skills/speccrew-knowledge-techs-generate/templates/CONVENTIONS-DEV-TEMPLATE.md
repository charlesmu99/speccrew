# {{platform_name}} Development Conventions

<cite>
**Files Referenced in This Document**
{{#each source_files}}
- [{{name}}]({{path}})
{{/each}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}, devcrew-test-{{platform_id}}

## Table of Contents

1. [Convention Enforcement Levels](#1-convention-enforcement-levels)
2. [Project Structure & Directory Conventions (Platform-Specific)](#2-project-structure--directory-conventions-platform-specific)
3. [Naming Conventions](#3-naming-conventions)
4. [Code Comment Conventions](#4-code-comment-conventions)
5. [Code Style & Formatting](#5-code-style--formatting)
6. [Common Development Patterns](#6-common-development-patterns)
7. [API & Interface Conventions (Backend Only)](#7-api--interface-conventions-backend-only)
8. [Null & Empty Value Handling](#8-null--empty-value-handling)
9. [Transaction Conventions (Backend Only)](#9-transaction-conventions-backend-only)
10. [Exception Handling Conventions (Backend Only)](#10-exception-handling-conventions-backend-only)
11. [Sensitive Data Handling](#11-sensitive-data-handling)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Authorization & Permissions (Platform-Specific)](#13-authorization--permissions-platform-specific)
14. [Menu Registration & Routing (Frontend Only)](#14-menu-registration--routing-frontend-only)
15. [Data Dictionary Usage](#15-data-dictionary-usage)
16. [Logging Standards](#16-logging-standards)
17. [API Request Layer (Frontend Only)](#17-api-request-layer-frontend-only)
18. [Data Validation](#18-data-validation)
19. [Scheduled Jobs & Task Scheduling (Backend Only)](#19-scheduled-jobs--task-scheduling-backend-only)
20. [File Upload & Storage](#20-file-upload--storage)
21. [Performance Conventions](#21-performance-conventions)
22. [Security Conventions (Platform-Specific)](#22-security-conventions-platform-specific)
23. [Dependency Management](#23-dependency-management)
24. [Automated Enforcement](#24-automated-enforcement)
25. [Best Practices & Anti-Patterns](#25-best-practices--anti-patterns)
26. [Appendix](#appendix)

---

## 1. Convention Enforcement Levels

<!-- AI-TAG: ENFORCEMENT_LEVELS -->
<!-- Fill with actual enforcement levels used in the project. Define what is mandatory vs recommended vs reference. -->

All conventions in this document are classified into three enforcement levels:

| Level | Description | Enforcement | Examples |
|-------|-------------|-------------|----------|
| **Mandatory** | Must follow, CI blocks on violation | CI check + Code review gate | Naming conventions, parameter validation, exception handling |
| **Recommended** | Should follow, flagged in review | Code review reminder + best practice examples | Cache usage, batch operations, log levels |
| **Reference** | Optional, team agreement | Documentation reference | Branch naming details, comment style |

### Level Definitions for This Platform

{{#each enforcement_levels}}
#### {{level}}

{{description}}

**Enforcement:** {{enforcement}}

{{/each}}

---

## 2. Project Structure & Directory Conventions (Platform-Specific)

<!-- AI-TAG: PROJECT_STRUCTURE -->
<!-- Backend platforms: describe controller/service/dal/convert layer structure. Frontend platforms: describe components/views/stores/composables structure. Mobile platforms: describe pages/components/store structure. -->

### Directory Structure

```
{{directory_structure}}
```

```mermaid
graph TB
{{#each directory_components}}
{{id}}["{{name}}"]
{{/each}}
{{#each directory_relations}}
{{from}} --> {{to}}
{{/each}}
```

### Package/Module Naming

| Layer | Naming Pattern | Example | Enforcement |
|-------|---------------|---------|-------------|
| Controller | `xxx.controller` | `user.controller` | Mandatory |
| Service | `xxx.service` | `user.service` | Mandatory |
| DAL/DAO | `xxx.dal` or `xxx.dao` | `user.dal` | Mandatory |
| Convert | `xxx.convert` | `user.convert` | Mandatory |

### Layered Directory Standards

{{#each layer_standards}}
#### {{layer}}

| Item | Convention | Example |
|------|-----------|---------|
| {{item}} | {{convention}} | {{example}} |

{{/each}}

**Section Source**
{{#each project_structure_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 3. Naming Conventions

<!-- AI-TAG: NAMING_CONVENTIONS -->
<!-- Fill with actual naming conventions found in the project source code. -->

### File Naming

| Type | Pattern | Example | Enforcement |
|------|---------|---------|-------------|
{{#each file_naming}}
| {{type}} | {{pattern}} | {{example}} | {{enforcement}} |
{{/each}}

### Variables & Functions

| Type | Pattern | Example | Enforcement |
|------|---------|---------|-------------|
{{#each naming_conventions}}
| {{type}} | {{pattern}} | {{example}} | {{enforcement}} |
{{/each}}

### Classes & Types

| Type | Pattern | Example | Enforcement |
|------|---------|---------|-------------|
{{#each class_naming}}
| {{type}} | {{pattern}} | {{example}} | {{enforcement}} |
{{/each}}

### Constants

| Type | Pattern | Example | Enforcement |
|------|---------|---------|-------------|
{{#each constant_naming}}
| {{type}} | {{pattern}} | {{example}} | {{enforcement}} |
{{/each}}

### Database Naming (if backend platform)

| Object | Pattern | Example | Enforcement |
|--------|---------|---------|-------------|
{{#each database_naming}}
| {{object}} | {{pattern}} | {{example}} | {{enforcement}} |
{{/each}}

**Section Source**
{{#each naming_conventions_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 4. Code Comment Conventions

<!-- AI-TAG: COMMENT_CONVENTIONS -->
<!-- Fill with actual comment conventions found in the project. Include Good/Bad examples. -->

### Class Comment Standards

| Element | Required | Format | Example |
|---------|----------|--------|---------|
| Class purpose | Yes | Description of functionality | `/** User service for managing user entities */` |
| Author | Optional | `@author name` | `@author John Doe` |
| Creation date | Optional | `@since YYYY-MM-DD` | `@since 2024-01-15` |

### Method Comment Standards

| Element | Required | Rule | Example |
|---------|----------|------|---------|
| Method purpose | Complex methods only | Brief description | `/** Query users by department */` |
| Parameters | Complex methods only | `@param name description` | `@param deptId department ID` |
| Return value | Complex methods only | `@return description` | `@return list of users` |
| Exceptions | If throws checked | `@throws ExceptionType reason` | `@throws NotFoundException if dept not exists` |

### Inline Comment Standards

| Scenario | Rule | Example |
|----------|------|---------|
| Complex logic | Explain "why", not "what" | `// Compensate for timezone offset` |
| Workarounds | Explain the issue and reference | `// FIXME: Remove after library upgrade (ISSUE-123)` |
| Algorithm steps | Numbered steps for clarity | `// Step 1: Validate input range` |

### Prohibited Practices

- ❌ Meaningless comments: `// Increment i by 1` for `i++`
- ❌ Outdated comments that don't match code
- ❌ Commented-out code blocks
- ❌ Redundant comments on obvious operations

### Good Example

```{{language}}
/**
 * Calculates prorated refund amount based on usage period.
 * 
 * @param subscription the subscription to refund
 * @param cancelDate the cancellation effective date
 * @return calculated refund amount, never null
 * @throws IllegalArgumentException if subscription is expired
 */
public BigDecimal calculateRefund(Subscription subscription, LocalDate cancelDate) {
    // Validate subscription is still active (not expired)
    if (subscription.isExpired()) {
        throw new IllegalArgumentException("Cannot refund expired subscription");
    }
    
    // Calculate remaining days using 30-day month approximation
    // per business requirement BR-2024-001
    int remainingDays = calculateRemainingDays(subscription, cancelDate);
    
    return subscription.getDailyRate().multiply(BigDecimal.valueOf(remainingDays));
}
```

### Bad Example

```{{language}}
// Calculate refund
public BigDecimal calc(Subscription s, LocalDate d) {
    // Check if expired
    if (s.isExpired()) {
        throw new IllegalArgumentException("Expired");
    }
    int days = calcDays(s, d); // calculate days
    return s.getRate().multiply(BigDecimal.valueOf(days)); // multiply
}
```

**Section Source**
{{#each comment_conventions_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 5. Code Style & Formatting

<!-- AI-TAG: CODE_STYLE -->
<!-- List formatting and linting tools specific to this platform's language/runtime (e.g., Checkstyle for Java, ESLint for JavaScript/TypeScript, Flake8 for Python, SwiftLint for iOS). -->

### Formatting Rules

{{#each formatting_rules}}
- **{{name}}**: {{value}}
{{/each}}

### Lint Rules

{{#each linting_rules}}
#### {{tool}}

| Rule | Setting | Description | Enforcement |
|------|---------|-------------|-------------|
{{#each rules}}
| `{{rule}}` | {{setting}} | {{description}} | {{enforcement}} |
{{/each}}

{{/each}}

### Import/Export Patterns

{{import_export_patterns}}

### IDE Configuration

| IDE | Config File | Purpose |
|-----|-------------|---------|
{{#each ide_configs}}
| {{ide}} | [{{file}}]({{path}}) | {{purpose}} |
{{/each}}

**Section Source**
{{#each code_style_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 6. Common Development Patterns

<!-- AI-TAG: DEV_PATTERNS -->
<!-- Fill with actual patterns and framework usage found in the project. -->

### Framework/Tool Usage Standards

{{#each framework_patterns}}
#### {{framework}}

| Aspect | Convention | Example |
|--------|-----------|---------|
| {{aspect}} | {{convention}} | {{example}} |

```{{language}}
{{code_example}}
```

{{/each}}

### DTO/VO/DO Conversion Standards

| Conversion | Pattern | Tool | Example |
|------------|---------|------|---------|
{{#each conversion_patterns}}
| {{conversion}} | {{pattern}} | {{tool}} | {{example}} |
{{/each}}

### Dependency Injection Patterns

| Scenario | Pattern | Example |
|----------|---------|---------|
{{#each di_patterns}}
| {{scenario}} | {{pattern}} | {{example}} |
{{/each}}

**Section Source**
{{#each dev_patterns_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 7. API & Interface Conventions (Backend Only)

<!-- AI-TAG: API_CONVENTIONS -->
<!-- If this platform is frontend or mobile, write 'Not applicable - API design is defined in the backend platform conventions.' -->

### RESTful Standards (if applicable)

| HTTP Method | URL Pattern | Purpose | Example |
|-------------|-------------|---------|---------|
| GET | `/resources` | List resources | `GET /users` |
| GET | `/resources/{id}` | Get single resource | `GET /users/123` |
| POST | `/resources` | Create resource | `POST /users` |
| PUT | `/resources/{id}` | Full update | `PUT /users/123` |
| PATCH | `/resources/{id}` | Partial update | `PATCH /users/123` |
| DELETE | `/resources/{id}` | Delete resource | `DELETE /users/123` |

### Unified Response Format

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `code` | Integer | Business status code | Yes |
| `message` | String | Human-readable message | Yes |
| `data` | T | Response payload | No |
| `timestamp` | Long | Response timestamp | Optional |

```{{language}}
{{response_format_example}}
```

### Pagination Standards

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
{{#each pagination_params}}
| {{param}} | {{type}} | {{default}} | {{description}} |
{{/each}}

### API Version Management

| Strategy | Implementation | Example |
|----------|---------------|---------|
{{#each versioning_strategies}}
| {{strategy}} | {{implementation}} | {{example}} |
{{/each}}

### API Documentation Standards

| Tool | Configuration | Standards |
|------|--------------|-----------|
{{#each api_doc_tools}}
| {{tool}} | {{config}} | {{standards}} |
{{/each}}

**Section Source**
{{#each api_conventions_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 8. Null & Empty Value Handling

<!-- AI-TAG: NULL_HANDLING -->
<!-- Fill with actual null handling patterns found in the project. Include Good/Bad examples. -->

### Null Value Handling Rules

| Scenario | Rule | Enforcement |
|----------|------|-------------|
| Collection return | Never return null, use empty collection | Mandatory |
| Optional usage | Use Optional for nullable returns | Recommended |
| Parameter validation | Validate null at method entry | Mandatory |
| Null checks | Use Objects.requireNonNull or similar | Recommended |

### Empty Value Conventions

| Type | Empty Representation | Null Allowed? |
|------|---------------------|---------------|
| String | `""` (empty string) | No |
| List | `Collections.emptyList()` | No |
| Map | `Collections.emptyMap()` | No |
| Optional | `Optional.empty()` | N/A |

### DO/VO Field Null Semantics

| Field Type | Null Meaning | Empty Meaning |
|------------|--------------|---------------|
{{#each field_semantics}}
| {{field_type}} | {{null_meaning}} | {{empty_meaning}} |
{{/each}}

### Good Example

```{{language}}
// Return empty list instead of null
public List<User> findByDepartment(Long deptId) {
    List<User> users = userMapper.selectByDeptId(deptId);
    return users != null ? users : Collections.emptyList();
}

// Use Optional for potentially null values
public Optional<User> findById(Long id) {
    return Optional.ofNullable(userMapper.selectById(id));
}
```

### Bad Example

```{{language}}
// Don't return null for collections
public List<User> findByDepartment(Long deptId) {
    List<User> users = userMapper.selectByDeptId(deptId);
    return users; // May return null - BAD
}

// Don't use null without checking
public void processUser(User user) {
    String name = user.getName(); // NPE risk - BAD
    System.out.println(name.toUpperCase());
}
```

**Section Source**
{{#each null_handling_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 9. Transaction Conventions (Backend Only)

<!-- AI-TAG: TRANSACTION_CONVENTIONS -->
<!-- If this platform is frontend or mobile, write 'Not applicable - transactions are managed at the backend layer.' -->

### transaction_annotation Usage Standards (if backend platform)

| Aspect | Rule | Enforcement |
|--------|------|-------------|
| Placement | On service methods, not DAO | Mandatory |
| Read-only | Add to query methods | Recommended |
| Public methods only | Transactional requires public | Mandatory |

### Prohibited Practices

- ❌ Adding `transaction_annotation` to simple query methods without read-only
- ❌ Large transactions spanning multiple business operations
- ❌ Calling transactional methods within same class (self-invocation)
- ❌ Catching exceptions without proper rollback handling

### Propagation Behavior Guidelines

| Scenario | Propagation | Reason |
|----------|-------------|--------|
| Default service method | REQUIRED | Join existing or create new |
| Independent operation | REQUIRES_NEW | Must commit regardless |
| Optional operation | SUPPORTS | Participate if exists |
| Nested operation | NESTED | Can rollback independently |

### Isolation Level Selection

| Scenario | Isolation | Reason |
|----------|-----------|--------|
| Default | READ_COMMITTED | Balance consistency/performance |
| Financial operations | SERIALIZABLE | Strict consistency required |
| Read-heavy reporting | READ_UNCOMMITTED | Performance over consistency |

### Transaction Splitting Best Practices

```{{language}}
// Good: Split large transaction into smaller units
@Service
public class OrderService {
    
    @transaction_annotation
    public void createOrder(OrderDTO dto) {
        // Step 1: Validate and create order (in transaction)
        Order order = createOrderEntity(dto);
        
        // Step 2: Process payment (separate transaction)
        paymentService.processPayment(order);
        
        // Step 3: Send notification (outside transaction)
        notificationService.sendOrderConfirmation(order);
    }
}
```

### Good Example

```{{language}}
@Service
public class UserService {
    
    @transaction_annotation(readOnly = true)
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }
    
    @transaction_annotation(rollbackFor = Exception.class)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        // Both operations in same transaction
        debit(fromId, amount);
        credit(toId, amount);
    }
}
```

### Bad Example

```{{language}}
@Service
public class UserService {
    
    // BAD: Transactional on private method
    @transaction_annotation
    private void updateUser(User user) {
        userMapper.update(user);
    }
    
    // BAD: No readOnly on query
    @transaction_annotation
    public User getUser(Long id) {
        return userMapper.selectById(id);
    }
    
    // BAD: Self-invocation bypasses transaction
    public void processOrder(Order order) {
        saveOrder(order); // Transactional ignored!
    }
    
    @transaction_annotation
    public void saveOrder(Order order) {
        orderMapper.insert(order);
    }
}
```

**Section Source**
{{#each transaction_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 10. Exception Handling Conventions (Backend Only)

<!-- AI-TAG: EXCEPTION_CONVENTIONS -->
<!-- If this platform is frontend, describe frontend error handling (try/catch, error boundaries, global error handlers) instead. If mobile, describe mobile error handling patterns. -->

### Exception Hierarchy (if backend platform)

```
BaseException
├── ServiceException (business logic errors)
├── BizException (domain-specific errors)
└── SystemException (infrastructure errors)
```

| Exception Type | Use Case | HTTP Status | Example |
|----------------|----------|-------------|---------|
| ServiceException | Business rule violation | 400/422 | Insufficient balance |
| BizException | Domain constraint violation | 409 | Duplicate email |
| SystemException | Infrastructure failure | 500 | Database timeout |

### Error Code Standards

| Code Range | Category | Example |
|------------|----------|---------|
{{#each error_code_ranges}}
| {{range}} | {{category}} | {{example}} |
{{/each}}

### Prohibited Practices

- ❌ Throwing raw `RuntimeException` or `Exception`
- ❌ Swallowing exceptions without logging
- ❌ Catching `Exception` or `Throwable` broadly without re-throwing
- ❌ Returning error codes instead of throwing exceptions

### Exception Handling Best Practices

```{{language}}
// Good: Specific exception with meaningful message
if (user == null) {
    throw new ServiceException(ErrorCode.USER_NOT_FOUND, "User not found: " + userId);
}

// Good: Wrap and re-throw with context
try {
    paymentGateway.charge(card, amount);
} catch (PaymentException e) {
    log.error("Payment failed for order: {}", orderId, e);
    throw new ServiceException(ErrorCode.PAYMENT_FAILED, "Payment processing failed", e);
}
```

**Section Source**
{{#each exception_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 11. Sensitive Data Handling

<!-- AI-TAG: SENSITIVE_DATA -->
<!-- Fill with actual sensitive data handling patterns found in the project. -->

### Data Masking Rules

| Data Type | Masking Rule | Example |
|-----------|--------------|---------|
| Mobile Phone | Show first 3 and last 4 digits | `138****8888` |
| ID Card | Show first 6 and last 4 digits | `110101********1234` |
| Email | Show first 2 and domain | `ab****@example.com` |
| Bank Card | Show last 4 digits only | `**** **** **** 1234` |
| Password | Never log or display | `[PROTECTED]` |

### Password Storage Standards

| Aspect | Requirement | Implementation |
|--------|-------------|----------------|
| Hashing Algorithm | Use BCrypt/Argon2 | `BCryptPasswordEncoder` |
| Salt | Auto-generated per password | Built into BCrypt |
| Plain Text | Strictly prohibited | N/A |
| MD5/SHA1 | Deprecated, do not use | N/A |

### Log Sensitive Field Masking

```{{language}}
// Good: Mask sensitive fields in logs
log.info("User registered: phone={}, email={}", 
    maskPhone(user.getPhone()), 
    maskEmail(user.getEmail()));
// Output: User registered: phone=138****8888, email=jo****@example.com
```

### API Response Desensitization

| Scenario | Approach | Example |
|----------|----------|---------|
| Internal APIs | Full data with authentication | Complete user object |
| External APIs | Masked sensitive fields | Masked phone/email |
| Public APIs | Minimal data exposure | User ID and name only |

**Section Source**
{{#each sensitive_data_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 12. Internationalization (i18n)

<!-- AI-TAG: I18N_SETUP -->
<!-- Fill this section with actual i18n setup found in the project. If the project does not use i18n, write "Not applicable - this platform does not implement i18n." -->

### i18n Framework & Configuration

| Item | Detail |
|------|--------|
| Framework | i18n_framework |
| Default Locale | default_locale |
| Supported Locales | supported_locales |
| Locale File Location | locale_dir |

### Language File Organization

| Strategy | Description | Example |
|----------|-------------|---------|
| strategy | description | example_path |

### Translation Key Conventions

| Convention | Rule | Example |
|-----------|------|---------|
| Key format | rule | example |
| Namespace | rule | example |

### Usage in Code

```lang
// Example of using i18n in this platform
code_example
```

### Backend Internationalization (if backend platform)

<!-- AI-TAG: BACKEND_I18N -->
<!-- Fill if the backend has message internationalization. If not applicable, write "Not applicable." -->

| Item | Detail |
|------|--------|
| Message Source | message_source (e.g., messages.properties, database) |
| Error Message i18n | error_i18n_approach |
| Validation Message i18n | validation_i18n_approach |
| Response Message i18n | response_i18n_approach |

```lang
// Example of internationalized error/validation message
backend_i18n_example
```

---

## 13. Authorization & Permissions (Platform-Specific)

<!-- AI-TAG: PERMISSION_SETUP -->
<!-- Fill with actual permission implementation found in source code -->

### Backend Authorization (if backend platform)

<!-- AI-TAG: BACKEND_PERMISSION -->
<!-- Fill with backend permission framework: annotations, interceptors, filters. If frontend platform, skip this subsection. -->

| Item | Detail |
|------|--------|
| Permission Framework | permission_framework (e.g., Spring Security, Shiro, Passport.js, Django permissions) |
| Permission Check Mechanism | check_mechanism (e.g., annotation, middleware, decorator) |
| Permission Annotation/Decorator | permission_annotation |
| Data Permission | data_permission_approach |

```lang
// Example of backend permission check
backend_permission_example
```

### Frontend Permission UI (if frontend platform)

<!-- AI-TAG: FRONTEND_PERMISSION -->
<!-- Fill with frontend permission implementation: route guards, directives, state management. If backend platform, skip this subsection. -->

| Item | Detail |
|------|--------|
| Permission Storage | permission_storage (e.g., Vuex/Pinia store, Redux, localStorage) |
| Permission Source API | permission_api |
| Route Guard | route_guard_impl |
| Permission Directive/HOC | permission_directive |

```lang
// Example of frontend permission check
frontend_permission_example
```

---

## 14. Menu Registration & Routing (Frontend Only)

<!-- AI-TAG: MENU_REGISTRATION -->
<!-- If this platform is backend, write 'Not applicable - menu registration is handled at the frontend platform. Backend exposes menu data via API.' -->

### Menu Data Source

| Item | Detail |
|------|--------|
| Source Type | menu_source_type (e.g., static config, dynamic API) |
| API Endpoint | menu_api |
| Local Config | menu_config_path |

### Menu-to-Route Mapping

| Menu Field | Route Property | Description |
|-----------|---------------|-------------|
| field | property | description |

### Adding a New Menu Item

```
Step 1: step1
Step 2: step2
Step 3: step3
```

---

## 15. Data Dictionary Usage

<!-- AI-TAG: DICTIONARY_USAGE -->
<!-- Fill with actual dictionary usage patterns found in source code -->

### Dictionary Infrastructure

| Item | Detail |
|------|--------|
| Dictionary Source | dict_source (e.g., API, local enum) |
| Cache Strategy | cache_strategy |
| Dictionary Component | dict_component (e.g., DictTag) |

### Using Dictionary in Templates

```lang
// Example of rendering dictionary values
dict_template_example
```

### Using Dictionary in Logic

```lang
// Example of dictionary lookup in code
dict_logic_example
```

### Dictionary Code Conventions

| Convention | Rule | Example |
|-----------|------|---------|
| Dict type naming | rule | example |
| Dict value type | rule | example |

---

## 16. Logging Standards

<!-- AI-TAG: LOGGING_STANDARDS -->
<!-- Fill with actual logging practices found in source code -->

### Logging Framework & Configuration

| Item | Detail |
|------|--------|
| Framework | logging_framework (e.g., SLF4J+Logback, Log4j2, console.log wrapper, winston) |
| Config File | config_file |
| Log Output | log_output (e.g., console, file, ELK) |

### Log Level Conventions

| Level | When to Use | Example |
|-------|------------|---------|
| ERROR | error_usage | error_example |
| WARN | warn_usage | warn_example |
| INFO | info_usage | info_example |
| DEBUG | debug_usage | debug_example |

### Operation/Audit Log

<!-- AI-TAG: AUDIT_LOG -->
<!-- Fill if the project has operation log or audit trail mechanism -->

| Item | Detail |
|------|--------|
| Mechanism | audit_mechanism (e.g., AOP annotation, interceptor, manual) |
| Annotation/Decorator | audit_annotation (e.g., @OperateLog) |
| Storage | audit_storage (e.g., database table, log file) |

```lang
// Example of operation log usage
audit_log_example
```

### Frontend Error Reporting (if frontend platform)

| Item | Detail |
|------|--------|
| Error Boundary | error_boundary |
| Error Reporting | error_reporting (e.g., Sentry, custom API) |
| Console Policy | console_policy (e.g., remove console.log in production) |

---

## 17. API Request Layer (Frontend Only)

<!-- AI-TAG: API_REQUEST_LAYER -->
<!-- If this platform is backend, write 'Not applicable - backend does not have a frontend request layer. See backend API conventions instead.' -->

### HTTP Client Setup

| Item | Detail |
|------|--------|
| Library | http_library (e.g., Axios, fetch, uni.request) |
| Base Config File | config_file |
| Base URL | base_url_config |
| Timeout | timeout |

### Request Interceptors

| Interceptor | Purpose | Implementation |
|------------|---------|---------------|
| Auth Token | auth_token_impl | code_location |
| Tenant Header | tenant_header_impl | code_location |
| custom_interceptor | purpose | code_location |

### Response Interceptors

| Interceptor | Purpose | Implementation |
|------------|---------|---------------|
| Error Handler | error_handler | code_location |
| Token Refresh | token_refresh | code_location |
| custom_interceptor | purpose | code_location |

### API Module Organization

| Convention | Rule | Example |
|-----------|------|---------|
| File naming | rule | example |
| Function naming | rule | example |
| Base path | rule | example |

```lang
// Example of a typical API module definition
api_module_example
```

---

## 18. Data Validation

<!-- AI-TAG: DATA_VALIDATION -->
<!-- Fill with actual validation patterns found in source code -->

### Backend Validation (if backend platform)

| Item | Detail |
|------|--------|
| Framework | validation_framework (e.g., JSR 380/Hibernate Validator, class-validator) |
| Validation Groups | validation_groups (e.g., Create.class, Update.class) |

| Annotation/Decorator | Purpose | Example |
|----------------------|---------|---------|
| annotation | purpose | example |

```lang
// Example of validation usage in DTO/Request
backend_validation_example
```

### Frontend Validation (if frontend platform)

| Item | Detail |
|------|--------|
| Framework | frontend_validation (e.g., Element Plus form rules, VeeValidate) |
| Validation Timing | validation_timing (e.g., on blur, on submit) |

```lang
// Example of form validation rules
frontend_validation_example
```

### Custom Validators

| Validator | Purpose | Usage |
|-----------|---------|-------|
| validator | purpose | usage |

---

## 19. Scheduled Jobs & Task Scheduling (Backend Only)

<!-- AI-TAG: SCHEDULED_JOBS -->
<!-- If this platform is frontend or mobile, write 'Not applicable - scheduled jobs run on the backend.' -->

### Job Framework

| Item | Detail |
|------|--------|
| Framework | job_framework (e.g., Spring @Scheduled, Quartz, XXL-Job, node-cron) |
| Config Location | job_config |
| Management UI | job_management_ui |

### Job Registration Pattern

```lang
// Example of registering a scheduled job
job_registration_example
```

### Existing Jobs Overview

| Job Name | Schedule | Purpose | Source |
|----------|----------|---------|--------|
| job_name | cron_expression | purpose | [Source]({{source_file}}) |

---

## 20. File Upload & Storage

<!-- AI-TAG: FILE_STORAGE -->
<!-- Fill with actual file handling patterns found in source code. If not applicable, write "Not applicable." -->

### Storage Strategy

| Item | Detail |
|------|--------|
| Storage Backend | storage_backend (e.g., local disk, S3/OSS, MinIO, database) |
| Upload API | upload_api |
| Max File Size | max_size |
| Allowed Types | allowed_types |

### File Path Convention

| Convention | Rule | Example |
|-----------|------|---------|
| Path format | rule | example |
| Naming strategy | rule | example |

### Frontend Upload Component (if frontend platform)

| Item | Detail |
|------|--------|
| Component | upload_component |
| Usage Pattern | usage_pattern |

```lang
// Example of file upload usage
upload_example
```

---

## 21. Performance Conventions

<!-- AI-TAG: PERFORMANCE_CONVENTIONS -->
<!-- Backend: focus on API latency, throughput, database query optimization. Frontend: focus on page load time, bundle size, render performance, memory usage. -->

### JVM Configuration (if backend platform)

| Parameter | Recommendation | Rationale |
|-----------|----------------|-----------|
{{#each jvm_configs}}
| {{param}} | {{recommendation}} | {{rationale}} |
{{/each}}

### API Performance Standards (Backend Only)

<!-- AI-TAG: API_PERFORMANCE -->
<!-- If this platform is frontend, skip this subsection and fill the Page Performance Standards instead. -->

| Metric | Target | Maximum | Measurement |
|--------|--------|---------|-------------|
| P50 Response Time | {{p50_target}} | {{p50_max}} | APM/Metrics |
| P95 Response Time | {{p95_target}} | {{p95_max}} | APM/Metrics |
| P99 Response Time | {{p99_target}} | {{p99_max}} | APM/Metrics |
| Error Rate | < {{error_target}}% | {{error_max}}% | Monitoring |

### Page Performance Standards (Frontend Only)

<!-- AI-TAG: PAGE_PERFORMANCE -->
<!-- If this platform is backend, skip this subsection and fill the API Performance Standards instead. -->

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | fcp_target | Lighthouse |
| Largest Contentful Paint (LCP) | lcp_target | Lighthouse |
| Time to Interactive (TTI) | tti_target | Lighthouse |
| Cumulative Layout Shift (CLS) | cls_target | Lighthouse |
| Bundle Size | bundle_size_target | Build analysis |

### Slow Query Governance

| Threshold | Action | Owner |
|-----------|--------|-------|
| > 1s | Log warning | DBA |
| > 3s | Alert + Review | Dev Team |
| > 10s | Block + Emergency fix | Dev + DBA |

### Batch Operation Standards

| Operation | Recommended Batch Size | Notes |
|-----------|----------------------|-------|
| Database insert | 500-1000 | Use batch insert |
| Database update | 200-500 | Avoid large transactions |
| API bulk operations | 100-200 | Consider timeout |

### Code Performance Guidelines

{{#each performance_guidelines}}
#### {{category}}

{{description}}

**Guidelines:**
{{#each items}}
- {{this}}
{{/each}}

{{/each}}

**Section Source**
{{#each performance_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 22. Security Conventions (Platform-Specific)

<!-- AI-TAG: SECURITY_CONVENTIONS -->
<!-- Fill with actual security patterns and requirements found in the project. -->

### Backend Security (if backend platform)

<!-- AI-TAG: BACKEND_SECURITY -->
<!-- Fill with backend security measures. If frontend platform, skip this subsection. -->

| Category | Measure | Implementation | Example |
|----------|---------|---------------|---------|
| SQL Injection Prevention | sql_injection_prevention | implementation | example |
| Authentication Enforcement | auth_enforcement | implementation | example |
| Rate Limiting | rate_limiting | implementation | example |
| Input Sanitization | input_sanitization | implementation | example |
| Sensitive Data in Logs | log_sanitization | implementation | example |

### Frontend Security (if frontend platform)

<!-- AI-TAG: FRONTEND_SECURITY -->
<!-- Fill with frontend security measures. If backend platform, skip this subsection. -->

| Category | Measure | Implementation | Example |
|----------|---------|---------------|---------|
| XSS Prevention | xss_prevention | implementation | example |
| CSRF Protection | csrf_protection | implementation | example |
| Sensitive Data Handling | sensitive_data_handling | implementation | example |
| Content Security Policy | csp_policy | implementation | example |
| Auth Token Storage | token_storage | implementation | example |

### API Rate Limiting

| Endpoint Type | Rate Limit | Implementation |
|---------------|------------|----------------|
{{#each rate_limits}}
| {{type}} | {{limit}} | {{implementation}} |
{{/each}}

### XSS & SQL Injection Prevention

| Threat | Prevention Method | Implementation |
|--------|------------------|----------------|
| XSS | Input sanitization + Output encoding | {{xss_impl}} |
| SQL Injection | Parameterized queries only | {{sql_impl}} |

### Authorization Check Standards

| Requirement | Implementation | Enforcement |
|-------------|----------------|-------------|
| All endpoints protected | `@PreAuthorize` or equivalent | Mandatory |
| Public endpoints explicitly marked | `@PermitAll` or whitelist | Mandatory |
| Role checks consistent | Use constants, not hardcoded strings | Mandatory |

### MyBatis SQL Safety (if backend platform)

| Rule | Requirement | Example |
|------|-------------|---------|
| Parameter binding | Always use `#{}` | `WHERE id = #{id}` |
| Dynamic SQL | Use `<bind>` for like | `<bind name="pattern" value="'%' + name + '%'"/>` |
| Prohibited | Never use `${}` for user input | ❌ `WHERE id = ${id}` |

### Good Example

```{{language}}
// Good: Parameterized query with #{
@Select("SELECT * FROM users WHERE name = #{name} AND status = #{status}")
List<User> findByNameAndStatus(@Param("name") String name, @Param("status") Integer status);
```

### Bad Example

```{{language}}
// BAD: String concatenation in SQL
@Select("SELECT * FROM users WHERE name = '" + name + "'")
List<User> findByName(String name);

// BAD: Using ${} for user input
@Select("SELECT * FROM users WHERE name = '${name}'")
List<User> findByName(@Param("name") String name);
```

**Section Source**
{{#each security_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 23. Dependency Management

<!-- AI-TAG: DEPENDENCY_MANAGEMENT -->
<!-- Fill with actual dependency management practices found in the project. -->

### Dependency Version Selection

| Type | Strategy | Example |
|------|----------|---------|
| Framework | Use managed version from BOM | `spring-boot-dependencies` |
| Libraries | Prefer stable versions over latest | `1.2.3` vs `1.3.0-beta` |
| Security patches | Apply within 7 days of release | CVE fixes |

### Upgrade Strategy

| Scenario | Action | Timeline |
|----------|--------|----------|
| Security vulnerability | Emergency upgrade | Within 7 days |
| Major version update | Planned migration | Per roadmap |
| Minor version update | Regular maintenance | Quarterly |

### Dependency Scanning

| Tool | Integration | Threshold |
|------|-------------|-----------|
{{#each dependency_scanners}}
| {{tool}} | {{integration}} | {{threshold}} |
{{/each}}

### Dependency Whitelist/Blacklist

| Category | Policy | Examples |
|----------|--------|----------|
| Whitelist | Approved libraries | {{whitelist}} |
| Blacklist | Prohibited libraries | {{blacklist}} |

**Section Source**
{{#each dependency_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 24. Automated Enforcement

<!-- AI-TAG: AUTOMATED_ENFORCEMENT -->
<!-- Fill with actual automation tools and configurations found in the project. -->

### Git Hooks

| Hook | Purpose | Implementation |
|------|---------|----------------|
| pre-commit | Code format check | {{pre_commit_impl}} |
| commit-msg | Commit message validation | {{commit_msg_impl}} |
| pre-push | Test execution | {{pre_push_impl}} |

### CI/CD Gate Rules

| Stage | Check | Failure Action |
|-------|-------|----------------|
{{#each ci_checks}}
| {{stage}} | {{check}} | {{action}} |
{{/each}}

### Static Analysis Integration

| Tool | Purpose | Configuration | Threshold |
|------|---------|---------------|-----------|
{{#each static_analysis_tools}}
| {{tool}} | {{purpose}} | {{config}} | {{threshold}} |
{{/each}}

### IDE Configuration Standardization

| IDE | Config File | Distribution |
|-----|-------------|--------------|
{{#each ide_standardization}}
| {{ide}} | [{{file}}]({{path}}) | {{distribution}} |
{{/each}}

**Section Source**
{{#each automated_enforcement_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## 25. Best Practices & Anti-Patterns

<!-- AI-TAG: BEST_PRACTICES -->
<!-- Provide examples relevant to THIS platform's tech stack. Backend: focus on database, concurrency, caching patterns. Frontend: focus on rendering, state management, component patterns. Use the actual language and frameworks of this platform. -->

### Pagination Optimization

**Good Example:**
```{{language}}
{{pagination_good_example}}
```

**Bad Example:**
```{{language}}
{{pagination_bad_example}}
```

### Batch Operations

**Good Example:**
```{{language}}
{{batch_good_example}}
```

**Bad Example:**
```{{language}}
{{batch_bad_example}}
```

### Cache Consistency

**Good Example:**
```{{language}}
{{cache_good_example}}
```

**Bad Example:**
```{{language}}
{{cache_bad_example}}
```

### Concurrency Handling

**Good Example:**
```{{language}}
{{concurrency_good_example}}
```

**Bad Example:**
```{{language}}
{{concurrency_bad_example}}
```

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
{{#each anti_patterns}}
| {{name}} | {{problem}} | {{solution}} |
{{/each}}

**Section Source**
{{#each best_practices_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}

---

## Appendix

### Git Conventions

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
{{#each commit_types}}
- `{{type}}`: {{description}}
{{/each}}

#### Branch Naming

{{branch_naming}}

### Code Review Checklist

#### Mandatory Checks
- [ ] Code follows naming conventions
- [ ] Code follows style guidelines
- [ ] No console.log or debug code left in production
- [ ] Error handling is comprehensive
- [ ] Tests are included
- [ ] Documentation is updated

#### Security Checks
- [ ] No hardcoded credentials or secrets
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Input validation implemented

#### Performance Checks
- [ ] No N+1 query problems
- [ ] Proper use of caching
- [ ] Batch operations used where appropriate
- [ ] Transaction boundaries are correct

### Newcomer Quick Reference

<!-- AI-TAG: NEWCOMER_GUIDE -->
<!-- Fill with quick start information for new team members -->

| Topic | Resource | Description |
|-------|----------|-------------|
| Project setup | {{setup_guide}} | Environment setup steps |
| First contribution | {{first_pr_guide}} | How to submit first PR |
| Common commands | {{commands_ref}} | Frequently used commands |
| Key contacts | {{contacts}} | Who to ask for help |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
{{#each version_history}}
| {{version}} | {{date}} | {{author}} | {{changes}} |
{{/each}}

**Section Source**
{{#each appendix_sources}}
- [{{name}}]({{path}}#L{{start}}-L{{end}})
{{/each}}
