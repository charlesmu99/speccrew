---
name: devcrew-create-se-infrastructure
description: Creates or updates AI software engineering infrastructure based on project diagnosis report. Includes generating role Agents, project-level Skills, .devcrew-workspace directory structure and deliverable templates. Trigger scenarios: after project diagnosis completion, need to rebuild AI collaboration system, update Agent/Skill configuration.
tools: Read, Write, Glob
---

# Create SE Infrastructure

Based on the diagnosis report in `.devcrew-workspace/diagnosis-reports/`, generate or update AI software engineering infrastructure for the project.

## Prerequisites

**Must complete project diagnosis first**, ensure `.devcrew-workspace/diagnosis-reports/diagnosis-report-{date}.md` exists and contains complete information. If not exists, prompt user to execute `devcrew-project-diagnosis` Skill first.

**Read the latest diagnosis report**:
1. List all diagnosis report files in `.devcrew-workspace/diagnosis-reports/` directory
2. Sort by filename date, select the latest report
3. Read report content as generation basis

## Attached Resources

This Skill directory contains the following predefined files:

**Agent Templates** (`templates/agents/`, used for creating tech-stack-specific Agents):
- [templates/agents/designer-agent.md](templates/agents/designer-agent.md): Detailed Design Agent template
- [templates/agents/dev-agent.md](templates/agents/dev-agent.md): Development Agent template
- [templates/agents/test-agent.md](templates/agents/test-agent.md): Testing Agent template

**Note**: Use these templates to create Agents by replacing `[techstack]` placeholder with actual technology stack from diagnosis report.

**Deliverable Document Templates**:
- Reference template files in `devcrew-project-init` Skill:
  - `templates/prd-template.md`: PRD document template
  - `templates/solution-template.md`: Solution document template
  - `templates/design-template.md`: Detailed design document template
  - `templates/test-case-template.md`: Test case document template

## Preconditions

Before execution, confirm the following has been obtained from the latest diagnosis report:
- **Project Type** (Web Full-Stack / Frontend Only / Backend Only / Desktop Client / Mobile / CLI / Hybrid)
- Actual technology stack used (language versions, core frameworks, database)
- Directory conventions (actual paths where various files are stored)
- Code standards (lint tools, naming conventions, run commands)

## Execution Steps

### Step 1: Check Existing Files

Scan `.qoder/agents/` and `.qoder/skills/` directories, record existing files. For existing Agent files, they will be updated (not overwritten) based on latest diagnosis report in subsequent steps.

### Step 2: Generate Tech-Stack-Specific Agents

Read the **Recommended Agents to Generate** section from diagnosis report, create or update tech-stack-specific Agents in `.qoder/agents/`:

- `devcrew-designer-[techstack]` (e.g., devcrew-designer-react, devcrew-designer-fastapi) - use `templates/agents/designer-agent.md`
- `devcrew-dev-[techstack]` (e.g., devcrew-dev-nextjs, devcrew-dev-springboot) - use `templates/agents/dev-agent.md`
- `devcrew-test-[techstack]` (e.g., devcrew-test-playwright, devcrew-test-junit) - use `templates/agents/test-agent.md`

**Template Usage**:
- **If Agent does not exist**: Copy template, replace `[techstack]` placeholder with actual technology stack name from diagnosis report, embed project-specific information
- **If Agent already exists**: Read existing Agent file, update technology stack info, directory paths, commands, and standards based on latest diagnosis report (preserve existing workflow logic)

**Note**: Generic agents (pm-agent, solution-agent) are created during project initialization, not here.

**Each Agent file must embed project actual information:**
- Actual technology stack name and version (from diagnosis report)
- Actual directory paths (from diagnosis report, no guessing)
- Actual run/debug commands (from diagnosis report)
- Actual code standard requirements (from diagnosis report)

### Step 4: Generate Project-Level Skill Files

Create or update project-level Skill directory structure in `.qoder/skills/`.

**Note**: Specific Skill content (such as add-page, add-api, etc.) is not generated at this stage, but gradually created by Dev Agent through `devcrew-skill-develop` Skill after identifying repetitive operation patterns during development.

This step only creates necessary directory structure and basic configuration Skills (such as pre-commit-check, if configured). Existing Skill files are preserved.

### Step 5: Create .devcrew-workspace Directory Structure

Read the **Recommended .devcrew-workspace Directory Structure** section from diagnosis report, create all directories and subdirectories listed (only create missing directories, preserve existing). Create initial README.md in each new directory with brief description.

### Step 6: Copy Deliverable Templates to Project

Copy template files from `devcrew-project-init` Skill to `.qoder/templates/` (only copy if not exists, preserve existing):

- `devcrew-project-init/templates/prd-template.md` → `.qoder/templates/prd-template.md`
- `devcrew-project-init/templates/solution-template.md` → `.qoder/templates/solution-template.md`
- `devcrew-project-init/templates/design-template.md` → `.qoder/templates/design-template.md`
- `devcrew-project-init/templates/test-case-template.md` → `.qoder/templates/test-case-template.md`

**Note**: `design-template.md` is a generic structure template, each platform Agent refers to this template when generating specific design documents and fills according to the platform's technical characteristics.

### Step 7: Output Generation Summary

List:
- Created files list (path + description)
- Skipped files list (path + reason)
- Suggested next steps

## Agent File Content Standards

Each Agent file must:
1. **Embed project-specific information**, no generalized descriptions
2. Clarify "context input" (which directory and what type of files to read)
3. Clarify "output standards" (where to store deliverables)
4. Include "escalate when ambiguity found" constraint

## Skill File Content Standards

Each Skill file must:
1. Contain **specific file paths** (e.g., `server/routers/` instead of "router directory")
2. Contain **verification checklist** (how to confirm operation success after completion)
3. Keep step count within 10 steps

## Notes

- Check if files already exist before writing, skip if exists (no overwrite)
- Deliverable templates use Markdown format, placeholders marked with `[...]`
- Agent description field must contain clear "when to trigger" explanation
