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

# Workflow

### Test Strategy

Based on `test_mode` parameter:

**Mode: `http`** (default — for server/web applications)
- Parse API Contract documents
- curl each endpoint and verify HTTP status codes
- Pass criteria: GET returns 200; POST/PUT/DELETE returns non-404

**Mode: `process`** (for client/desktop applications)
- Verify the application process is still running (not crashed)
- If the app supports a CLI health check command, run it
- Pass criteria: Process alive AND exit code matches `expected_exit_code` (if process has exited)
- For GUI apps: Check process exists and has been running for at least 10 seconds without crash

**Mode: `log`** (for log-based verification)
- Read `log_file` content
- Check for each pattern in `expected_log_patterns`
- Pass criteria: ALL expected patterns found in log
- Fail: Any pattern missing → report which patterns were not found
- Example patterns for client with local DB:
  - "Database migration completed" (DB initialized)
  - "Application ready" (app started)
  - "UI rendered" (UI loaded, for GUI apps)

## Step 1: Parse API Contracts (HTTP Mode)

Extract endpoints from API Contract documents:

1. **Read each API Contract document**
   - Split `api_contract_paths` by comma
   - Read each document using Read tool

2. **Extract endpoint list**
   - Parse endpoints from contract:
     - Method: GET, POST, PUT, DELETE, etc.
     - Path: endpoint path (e.g., `/api/users`)
     - Expected status code: from contract definition

3. **Filter for core endpoints**
   - Focus on core endpoints only
   - For GET endpoints: test directly with full validation
   - For POST/PUT/DELETE: only verify endpoint exists (expect 400/401/405 is acceptable, NOT 404)

## Step 2: Execute Smoke Tests (HTTP Mode)

Test each endpoint:

1. **For each endpoint, execute curl command**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X {METHOD} {base_url}{path}
   ```

2. **Record test results**
   - Endpoint path
   - HTTP method
   - Expected status (or status range)
   - Actual status code
   - Pass/fail status

3. **Handle connection errors**
   - If curl fails to connect → mark as FAILED
   - Report: "Cannot connect to {base_url}"

## Step 2 (Alternative): Process Mode Verification

For client/desktop applications:

1. **Check process is still running**
   - **Windows**:
     ```powershell
     tasklist /FI "IMAGENAME eq {process_name}" | findstr /I "{process_name}"
     ```
   - **Unix/Mac**:
     ```bash
     pgrep -f "{process_name}"
     ```

2. **Verify process stability**
   - Record process start time
   - Wait 10 seconds
   - Check if process is still running (not crashed)
   - If process has exited:
     - Get exit code
     - Compare with `expected_exit_code` (default: 0)

3. **Record test results**
   - Process name
   - Status: RUNNING / EXITED
   - Exit code (if exited)
   - Uptime (if running)
   - Pass/fail status

## Step 2 (Alternative): Log Mode Verification

For log-based smoke testing:

1. **Read log file content**
   - Use Read tool to read `log_file`
   - If file not found → FAILED

2. **Parse expected patterns**
   - Split `expected_log_patterns` by comma
   - Trim whitespace from each pattern

3. **Check each pattern**
   - For each pattern in expected patterns:
     - **Windows**:
       ```powershell
       Select-String -Path "{log_file}" -Pattern "{pattern}"
       ```
     - **Unix/Mac**:
       ```bash
       grep -E "{pattern}" "{log_file}"
       ```
   - Record whether pattern was found

4. **Record test results**
   - Pattern name
   - Found: YES/NO
   - Pass/fail status

5. **Report missing patterns**
   - List all patterns not found
   - Include context from log if available

## Step 3: Evaluate Results

Apply pass criteria:

1. **GET endpoints**
   - Pass: HTTP 200 or 301/302 (redirect)
   - Fail: 404 or connection error

2. **POST/PUT/DELETE endpoints**
   - Pass: NOT 404 (any other status is acceptable for smoke test)
   - Acceptable: 400 (bad request), 401 (unauthorized), 405 (method not allowed)
   - Fail: 404 (not found)

3. **Health endpoint**
   - Pass: HTTP 200
   - Fail: Any other status

4. **Calculate pass rate**
   - pass_rate = (passed_count / total_count) * 100

## Step 4: Report Smoke Test Results

Compile test results table:

| Endpoint | Method | Expected | Actual | Status |
|----------|--------|----------|--------|--------|
| /api/users | GET | 200 | 200 | PASS |
| /api/auth/login | POST | !404 | 401 | PASS |
| /api/orders | GET | 200 | 404 | FAIL |

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
