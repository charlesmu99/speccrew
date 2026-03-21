---
name: SpecCrew-create-agents
description: Creates or updates tech-stack-specific Agents and project-level Skills based on project diagnosis report. Generates role Agents using predefined templates. Use after project diagnosis completion when setting up or updating the AI collaboration system.
---

# Create Agents and Skills

Based on the diagnosis report in `SpecCrew-workspace/diagnosis-reports/`, generate or update tech-stack-specific Agents and project-level Skills for the project.

## Prerequisites

**Must complete project diagnosis first**, ensure `SpecCrew-workspace/diagnosis-reports/diagnosis-report-{date}.md` exists and contains complete information. If not exists, prompt user to execute `SpecCrew-project-diagnosis` Skill first.

**Read the latest diagnosis report**:
1. List all diagnosis report files in `SpecCrew-workspace/diagnosis-reports/` directory
2. Sort by filename date, select the latest report
3. Read report content as generation basis

## Attached Resources

This Skill directory contains the following predefined files:

**Agent Templates** (`templates/agents/`, used for creating tech-stack-specific Agents):
- [templates/agents/designer-agent.md](templates/agents/designer-agent.md): Detailed Design Agent template
- [templates/agents/dev-agent.md](templates/agents/dev-agent.md): Development Agent template
- [templates/agents/test-agent.md](templates/agents/test-agent.md): Testing Agent template

**Note**: Use these templates to create Agents by replacing `[techstack]` placeholder with actual technology stack from diagnosis report.

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

- `SpecCrew-designer-[techstack]` (e.g., SpecCrew-designer-react, SpecCrew-designer-fastapi) - use `templates/agents/designer-agent.md`
- `SpecCrew-dev-[techstack]` (e.g., SpecCrew-dev-nextjs, SpecCrew-dev-springboot) - use `templates/agents/dev-agent.md`
- `SpecCrew-test-[techstack]` (e.g., SpecCrew-test-playwright, SpecCrew-test-junit) - use `templates/agents/test-agent.md`

**Template Usage**:
- **If Agent does not exist**: Copy template, replace `[techstack]` placeholder with actual technology stack name from diagnosis report, embed project-specific information
- **If Agent already exists**: Read existing Agent file, update technology stack info, directory paths, commands, and standards based on latest diagnosis report (preserve existing workflow logic)

**Note**: Generic agents (leader-agent,pm-agent, solution-agent) are created during project initialization, not here.

**Each Agent file must embed project actual information:**
- Actual technology stack name and version (from diagnosis report)
- Actual directory paths (from diagnosis report, no guessing)
- Actual run/debug commands (from diagnosis report)
- Actual code standard requirements (from diagnosis report)

### Step 3: Generate Project-Level Skill Files

Create or update project-level Skill directory structure in `.qoder/skills/`.

**Note**: Specific Skill content (such as add-page, add-api, etc.) is not generated at this stage, but gradually created by Dev Agent through `SpecCrew-skill-develop` Skill after identifying repetitive operation patterns during development.

This step only creates necessary directory structure and basic configuration Skills (such as pre-commit-check, if configured). Existing Skill files are preserved.

### Step 4: Output Generation Summary

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
- Agent description field must contain clear "when to trigger" explanation

