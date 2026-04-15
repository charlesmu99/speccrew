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

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

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
