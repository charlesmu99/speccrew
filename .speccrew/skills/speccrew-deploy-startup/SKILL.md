---
name: speccrew-deploy-startup
description: Starts the application in local/development environment and performs health check verification. Reports service URL and health status.
tools: Read, Bash
---

# Trigger Scenarios

- User requests to start the application for testing
- Deploy Agent needs to verify application startup
- Smoke test requires a running application instance

# Input Parameters

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `platform_id` | Yes | string | Platform identifier |
| `start_cmd` | Yes | string | Application start command from conventions-data (e.g., `java -jar target/app.jar`) |
| `health_url` | No | string | Health check URL (e.g., `http://localhost:8080/actuator/health`). Required for `http` mode. |
| `health_timeout` | No | string | Health check timeout, default 60s |
| `project_root` | Yes | string | Absolute path to the project root directory |
| `iteration_path` | Yes | string | Current iteration directory path |
| `verification_mode` | No | string | Verification method: `http` (default, for server apps), `process` (for client/desktop apps), `log` (for apps with log output). Default: `http` |
| `process_name` | No | string | Process name or pattern to check (for `process` mode, e.g., `myapp.exe` or `MyApp`) |
| `log_file` | No | string | Path to application log file (for `log` mode) |
| `success_pattern` | No | string | Regex pattern in log that indicates successful startup (for `log` mode, e.g., `"Application started"` or `"Ready"`) |

# Workflow

## Step 1: Start Application

Launch the application in background:

1. **Execute start_cmd in background via Bash**
   - Working directory: `project_root`
   - Command: `start_cmd`
   - Use background execution (e.g., `nohup {start_cmd} > app.log 2>&1 &` on Unix)
   - Capture the process PID

2. **Record PID for cleanup**
   - Store PID for later reference
   - Log: "Application started with PID {pid}"

3. **Wait for initial startup**
   - Wait 5 seconds for application initialization
   - Log: "Waiting for application to initialize..."

## Step 2: Verification (Based on Mode)

### Verification Strategy

Based on `verification_mode` parameter:

**Mode: `http`** (default — for server/web applications)
- Poll `health_url` every 5 seconds using curl
- Success: HTTP 200 response
- Timeout: `health_timeout` seconds

**Mode: `process`** (for desktop/mobile/client applications)
- Check if process `process_name` is running
- On Windows: `tasklist /FI "IMAGENAME eq {process_name}" | findstr /I "{process_name}"`
- On Unix/Mac: `pgrep -f "{process_name}"`
- Success: Process found and running
- Timeout: `health_timeout` seconds (default 30s)

**Mode: `log`** (for applications with log-based startup confirmation)
- Monitor `log_file` for `success_pattern`
- On Windows: `Select-String -Path "{log_file}" -Pattern "{success_pattern}"`
- On Unix/Mac: `grep -m 1 "{success_pattern}" "{log_file}"`
- Poll every 3 seconds
- Success: Pattern found in log
- Timeout: `health_timeout` seconds (default 60s)

### Execution by Mode

#### HTTP Mode (default)

Poll health endpoint until success or timeout:

1. **Calculate max attempts**
   - timeout_seconds = parseInt(health_timeout) || 60
   - max_attempts = timeout_seconds / 5
   - attempt = 0

2. **Poll health_url**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" {health_url}
   ```

3. **Check response**
   - HTTP 200 → Health check passed, continue to Step 3
   - Other codes → Increment attempt, wait 5 seconds, retry

4. **Timeout handling**
   - If attempt >= max_attempts → FAILED with Error Category: RUNTIME_ERROR
   - Report: "Health check timed out after {timeout_seconds}s"

#### Process Mode (for client apps)

Verify process is running:

1. **Calculate max attempts**
   - timeout_seconds = parseInt(health_timeout) || 30
   - max_attempts = timeout_seconds / 3
   - attempt = 0

2. **Check process existence**
   - **Windows**:
     ```powershell
     tasklist /FI "IMAGENAME eq {process_name}" | findstr /I "{process_name}"
     ```
   - **Unix/Mac**:
     ```bash
     pgrep -f "{process_name}"
     ```

3. **Check result**
   - Process found → Verification passed, continue to Step 3
   - Process not found → Increment attempt, wait 3 seconds, retry

4. **Timeout handling**
   - If attempt >= max_attempts → FAILED with Error Category: RUNTIME_ERROR
   - Report: "Process verification timed out after {timeout_seconds}s - process {process_name} not found"

#### Log Mode (for log-based verification)

Monitor log file for success pattern:

1. **Calculate max attempts**
   - timeout_seconds = parseInt(health_timeout) || 60
   - max_attempts = timeout_seconds / 3
   - attempt = 0

2. **Check log file for success_pattern**
   - **Windows**:
     ```powershell
     Select-String -Path "{log_file}" -Pattern "{success_pattern}"
     ```
   - **Unix/Mac**:
     ```bash
     grep -m 1 "{success_pattern}" "{log_file}"
     ```

3. **Check result**
   - Pattern found → Verification passed, continue to Step 3
   - Pattern not found → Increment attempt, wait 3 seconds, retry

4. **Timeout handling**
   - If attempt >= max_attempts → FAILED with Error Category: RUNTIME_ERROR
   - Report: "Log verification timed out after {timeout_seconds}s - pattern '{success_pattern}' not found in {log_file}"

## Step 3: Report Startup Status

Compile and report startup results:

1. **Record service information**
   - Service URL: derived from `health_url` (remove `/actuator/health` if present)
   - Health status: UP / DOWN
   - Startup duration: time from start to health success
   - PID: process ID for cleanup

2. **Verify application is still running**
   - Check if process with recorded PID exists
   - If not running → FAILED with Error Category: RUNTIME_ERROR

# Task Completion Report

## Success Report

```
## Task Completion Report
- **Status**: SUCCESS
- **Platform**: {platform_id}
- **Project Root**: {project_root}
- **Service URL**: {service_url}
- **Health URL**: {health_url}
- **Health Status**: UP
- **Startup Duration**: {duration_seconds}s
- **Process ID (PID)**: {pid}
- **Start Command**: {start_cmd}
- **Summary**: Application started successfully and passed health check
```

## Failure Report

```
## Task Completion Report
- **Status**: FAILED
- **Platform**: {platform_id}
- **Project Root**: {project_root}
- **Start Command**: {start_cmd}
- **Health URL**: {health_url}
- **Error Category**: {DEPENDENCY_MISSING | RUNTIME_ERROR}
- **Error**: {detailed error description}
- **Startup Log** (last 30 lines):
```
{last_30_lines_of_application_log}
```
- **Recovery Hint**: {suggestion for resolving the issue}
```

# Important Notes

- **Application runs in BACKGROUND** — it must remain running for subsequent smoke test
- **PID must be reported** — the Deploy Agent uses this for cleanup later
- **Health check uses curl** — cross-platform availability may vary; ensure curl is available
- **Default timeout is 60s** — adjust health_timeout parameter for slower-starting applications
- **Process monitoring** — verify the application process is still running after health check

# Key Rules

| Rule | Description |
|------|-------------|
| **Background Execution** | Application must start in background and continue running |
| **PID Recording** | Always record and report the process PID |
| **Health Polling** | Poll health endpoint every 5 seconds until success or timeout |
| **Timeout Configurable** | health_timeout parameter controls maximum wait time |
| **Process Verification** | Verify application process is still running after health check |
