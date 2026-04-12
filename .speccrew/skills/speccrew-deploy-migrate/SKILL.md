---
name: speccrew-deploy-migrate
description: Executes database migration scripts using the project's migration tool. Validates migration results and reports affected tables.
tools: Read, Bash, Glob
---

# Trigger Scenarios

- User requests to run database migrations before deployment
- Deploy Agent needs to apply pending schema changes
- CI/CD pipeline requires database migration verification

# Input Parameters

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `platform_id` | Yes | string | Platform identifier |
| `migration_cmd` | Yes | string | Migration execution command from conventions-data (e.g., `mvn flyway:migrate`) |
| `validation_cmd` | No | string | Migration validation command (e.g., `mvn flyway:validate`) |
| `migration_scripts` | Yes | string | JSON array of migration scripts: `[{"name":"V001__create_user.sql","path":"...","type":"CREATE TABLE"}]` |
| `project_root` | Yes | string | Absolute path to the project root directory |
| `iteration_path` | Yes | string | Current iteration directory path |

# Workflow

## Step 1: Pre-migration Check

Verify prerequisites before executing migrations:

1. **Verify migration script files exist**
   - Parse `migration_scripts` JSON array
   - For each script, verify file exists at specified `path`
   - If any script missing → FAILED with Error Category: DEPENDENCY_MISSING

2. **Verify migration tool is available**
   - Detect tool from `migration_cmd` (e.g., `mvn`, `npm`, `npx`)
   - Run tool version check
   - If tool not available → FAILED with Error Category: DEPENDENCY_MISSING

3. **Count total scripts to execute**
   - Record total script count from `migration_scripts`
   - Log: "Preparing to execute {count} migration scripts"

## Step 2: Execute Migration

Run the migration command:

1. **Execute migration_cmd via Bash**
   - Working directory: `project_root`
   - Command: `migration_cmd`
   - Capture stdout and stderr
   - Record start time before execution

2. **Check exit code**
   - Exit code 0 → Continue to Step 3
   - Exit code non-zero → FAILED with Error Category: BUILD_FAILURE

## Step 3: Validate Migration (if validation_cmd provided)

Run validation if command is provided:

1. **Execute validation_cmd via Bash**
   - Working directory: `project_root`
   - Command: `validation_cmd`
   - Capture output

2. **Verify validation result**
   - Exit code 0 → All migrations applied successfully
   - Exit code non-zero → FAILED with Error Category: VALIDATION_ERROR

3. **If validation fails**
   - Report specific failure reason from output
   - Include suggestion for manual intervention

## Step 4: Report Migration Results

Compile and report migration summary:

1. **List scripts executed**
   - Extract from migration output or use input `migration_scripts`

2. **List tables affected**
   - Parse `type` field from each script:
     - CREATE TABLE → New table created
     - ALTER TABLE → Table modified
     - DROP TABLE → Table removed

3. **Calculate execution duration**
   - Duration = end_time - start_time

# Task Completion Report

## Success Report

```
## Task Completion Report
- **Status**: SUCCESS
- **Platform**: {platform_id}
- **Project Root**: {project_root}
- **Migration Command**: {migration_cmd}
- **Scripts Executed**: {count}
  - {script_1_name}: {type} ({tables_affected})
  - {script_2_name}: {type} ({tables_affected})
  - ...
- **Tables Affected**:
  - Created: {table_list}
  - Modified: {table_list}
  - Dropped: {table_list}
- **Validation Status**: {PASSED | SKIPPED}
- **Execution Duration**: {duration_seconds}s
- **Summary**: Database migration completed successfully
```

## Failure Report

```
## Task Completion Report
- **Status**: FAILED
- **Platform**: {platform_id}
- **Project Root**: {project_root}
- **Migration Command**: {migration_cmd}
- **Error Category**: {DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR}
- **Error**: {detailed error description}
- **Scripts Attempted**: {count}
- **Failed Script**: {script_name} (if applicable)
- **Migration Output** (last 30 lines):
```
{last_30_lines_of_migration_output}
```
- **Recovery Hint**: {suggestion for resolving the issue}
```

# Key Rules

| Rule | Description |
|------|-------------|
| **Script Verification** | Always verify migration script files exist before execution |
| **Optional Validation** | Validation step is optional based on validation_cmd presence |
| **JSON Parsing** | Parse migration_scripts JSON to extract script metadata |
| **Table Tracking** | Report tables affected by each migration script |
| **Duration Tracking** | Record and report migration execution duration |
