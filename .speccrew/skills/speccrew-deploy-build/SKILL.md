---
name: speccrew-deploy-build
description: Executes application build commands based on techs knowledge conventions. Runs the build, verifies success, and reports build artifacts.
tools: Read, Bash, Glob
---

# Trigger Scenarios

- User requests to build the application before deployment
- Deploy Agent needs to verify the application compiles successfully
- CI/CD pipeline requires a build step verification

# Input Parameters

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `platform_id` | Yes | string | Platform identifier (e.g., backend-spring, frontend-react) |
| `build_cmd` | Yes | string | Build command from conventions-data/build (e.g., `mvn package -DskipTests`) |
| `project_root` | Yes | string | Absolute path to the project root directory |
| `iteration_path` | Yes | string | Current iteration directory path |

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
- **Build Duration**: {duration_seconds}s
- **Build Command**: {build_cmd}
- **Artifact Paths**:
  - {artifact_path_1}
  - {artifact_path_2}
  - ...
- **Build Log** (last 20 lines):
```
{last_20_lines_of_build_output}
```
- **Summary**: Build completed successfully with {artifact_count} artifacts generated
```

## Failure Report

```
## Task Completion Report
- **Status**: FAILED
- **Platform**: {platform_id}
- **Project Root**: {project_root}
- **Build Command**: {build_cmd}
- **Error Category**: {DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR}
- **Error**: {detailed error description}
- **Build Log** (last 30 lines):
```
{last_30_lines_of_build_output}
```
- **Recovery Hint**: {suggestion for resolving the issue}
```

# Key Rules

| Rule | Description |
|------|-------------|
| **No Hard-coded Commands** | All build commands come from input parameters |
| **Tool Detection** | Automatically detect and verify build tool availability |
| **Artifact Verification** | Always verify expected artifacts exist after build |
| **Duration Tracking** | Record and report build duration |
| **Log Capture** | Capture and report relevant build output |
