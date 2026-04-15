---
name: speccrew-deploy-smoke-test
description: Performs lightweight smoke testing against running application. Verifies core API endpoint reachability based on API Contract documents. Does NOT test business logic — only HTTP status code verification.
tools: Read, Bash, Glob
---

# Trigger Scenarios

- User requests to verify application is running correctly
- Deploy Agent needs to validate deployment success
- Post-deployment verification required

# Input Parameters

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `platform_id` | Yes | string | Platform identifier |
| `base_url` | No | string | Application base URL (e.g., `http://localhost:8080`). Required for `http` mode. |
| `api_contract_paths` | No | string | Comma-separated paths to API Contract documents. Required for `http` mode. |
| `iteration_path` | Yes | string | Current iteration directory path |
| `test_mode` | No | string | Test method: `http` (default, for server apps), `process` (for client apps - verify process runs and exits cleanly), `log` (verify expected log output). Default: `http` |
| `expected_exit_code` | No | string | Expected process exit code for `process` mode (default: `0`) |
| `log_file` | No | string | Log file path for `log` mode verification |
| `expected_log_patterns` | No | string | Comma-separated regex patterns expected in log for `log` mode (e.g., `"DB initialized,UI loaded"`) |
| `process_name` | No | string | Process name or pattern to check (for `process` mode, e.g., `myapp.exe` or `MyApp`) |

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

# Task Completion Report

## Success Report

```
## Task Completion Report
- **Status**: SUCCESS
- **Platform**: {platform_id}
- **Base URL**: {base_url}
- **Endpoints Tested**: {total_count}
- **Pass Rate**: {pass_rate}%
- **Passed**: {passed_count}
- **Failed**: {failed_count}
- **Test Results**:

| Endpoint | Method | Expected | Actual | Status |
|----------|--------|----------|--------|--------|
| {endpoint_1} | {method} | {expected} | {actual} | PASS |
| {endpoint_2} | {method} | {expected} | {actual} | PASS |
| {endpoint_3} | {method} | {expected} | {actual} | FAIL |

- **Summary**: Smoke test passed with {pass_rate}% success rate
```

## Failure Report

```
## Task Completion Report
- **Status**: FAILED
- **Platform**: {platform_id}
- **Base URL**: {base_url}
- **Endpoints Tested**: {total_count}
- **Pass Rate**: {pass_rate}%
- **Failed Endpoints**:
  - {endpoint_1}: expected {expected}, got {actual}
  - {endpoint_2}: expected {expected}, got {actual}
- **Error Category**: {VALIDATION_ERROR | RUNTIME_ERROR}
- **Error**: {detailed error description}
- **Recovery Hint**: Verify application is running and API contracts are up to date
```

# Important Notes

- **Smoke test is NOT integration testing** — it only verifies service availability and endpoint reachability
- **Pass rate threshold** — If pass rate < 80% → FAILED
- **Critical GET endpoints** — If any critical GET endpoint returns 404 → FAILED
- **No business logic testing** — Smoke test does not validate request/response bodies or business rules
- **Lightweight verification** — Designed for quick post-deployment validation

# Key Rules

| Rule | Description |
|------|-------------|
| **HTTP Status Only** | Only verify HTTP status codes, not response bodies |
| **GET Endpoints** | Must return 200 or redirect (301/302) |
| **Write Endpoints** | Any status except 404 is acceptable |
| **80% Pass Rate** | Overall pass rate must be >= 80% |
| **Critical GET 404** | Any critical GET endpoint returning 404 causes failure |
| **Contract-Based** | Extract endpoints from API Contract documents |
