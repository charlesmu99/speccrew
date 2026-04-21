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

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

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
