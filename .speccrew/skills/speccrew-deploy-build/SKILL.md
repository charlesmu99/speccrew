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

# Workflow

## Step 1: Pre-build Check

Verify prerequisites before executing the build:

1. **Verify project_root exists**
   - Check directory exists at `project_root`
   - If not exists → FAILED with Error Category: DEPENDENCY_MISSING

2. **Verify build tool is available**
   - Detect build tool from `build_cmd`:
     - `mvn` → Run `mvn --version`
     - `npm` / `pnpm` / `yarn` → Run `{tool} --version`
     - `gradle` → Run `gradle --version`
     - `go` → Run `go version`
   - If tool not available → FAILED with Error Category: DEPENDENCY_MISSING

3. **Check for build config files**
   - Maven: `pom.xml` must exist in `project_root`
   - Node.js: `package.json` must exist in `project_root`
   - Gradle: `build.gradle` or `build.gradle.kts` must exist
   - Go: `go.mod` must exist
   - If config missing → FAILED with Error Category: VALIDATION_ERROR

## Step 2: Execute Build

Run the build command:

1. **Execute build_cmd via Bash**
   - Working directory: `project_root`
   - Command: `build_cmd`
   - Capture stdout and stderr
   - Record start time before execution

2. **Check exit code**
   - Exit code 0 → Continue to Step 3
   - Exit code non-zero → FAILED with Error Category: BUILD_FAILURE

3. **Calculate build duration**
   - Duration = end_time - start_time

## Step 3: Verify Build Output

Check for expected build artifacts:

1. **Detect expected artifacts by platform**
   - Spring/Maven: `target/*.jar` files
   - Node.js: `dist/` or `build/` directory
   - Gradle: `build/libs/*.jar`
   - Go: Binary executable in project root or `bin/`

2. **Verify artifacts exist**
   - Use Glob to find expected artifacts
   - If no artifacts found → FAILED with Error Category: BUILD_FAILURE

3. **Record artifact paths**
   - List all generated artifacts with full paths

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
