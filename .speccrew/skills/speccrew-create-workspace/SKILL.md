---
name: SpecCrew-create-workspace
description: Creates SpecCrew-workspace directory structure based on project diagnosis report. Generates project documentation directories, knowledge bases, and deliverable templates. Use after project diagnosis completion when setting up or updating the workspace structure.
---

# Create SpecCrew-workspace

Based on the diagnosis report in `SpecCrew-workspace/diagnosis-reports/`, generate or update the SpecCrew-workspace directory structure for the project.

## Prerequisites

**Must complete project diagnosis first**, ensure `SpecCrew-workspace/diagnosis-reports/diagnosis-report-{date}.md` exists and contains complete information. If not exists, prompt user to execute `SpecCrew-project-diagnosis` Skill first.

**Read the latest diagnosis report**:
1. List all diagnosis report files in `SpecCrew-workspace/diagnosis-reports/` directory
2. Sort by filename date, select the latest report
3. Read report content as generation basis

## Preconditions

Before execution, confirm the following has been obtained from the latest diagnosis report:
- **Project Type** (Web Full-Stack / Frontend Only / Backend Only / Desktop Client / Mobile / CLI / Hybrid)
- Actual technology stack used (language versions, core frameworks, database)
- Directory conventions (actual paths where various files are stored)

## Execution Steps

### Step 1: Check Existing Structure

Scan `SpecCrew-workspace/` directory, record existing directories and files. Preserve existing content, only create missing directories.

### Step 2: Create Directory Structure

Read the **Recommended SpecCrew-workspace Directory Structure** section from diagnosis report, create all directories and subdirectories listed.

**Standard directories typically include**:
- `docs/` - Project documentation
- `knowledge/architecture/{platform}/` - Architecture knowledge base
- `knowledge/bizs/` - Business knowledge base
- `templates/` - Deliverable templates
- `projects/` - Project deliverables

**Rules**:
- Only create missing directories, preserve existing
- Create initial README.md in each new directory with brief description
- Follow bizs directory flat structure: create subfolders directly under `bizs/` (e.g., `bizs/User/`, `bizs/Order/`), no `modules/` subdirectory

### Step 3: Create Initial README Files

For each newly created directory, create a brief README.md describing:
- Directory purpose
- Expected content types
- Naming conventions (if applicable)

### Step 4: Output Generation Summary

List:
- Created directories list (path + description)
- Skipped directories list (path + reason)
- Suggested next steps

## Notes

- Check if directories already exist before creating, skip if exists
- Deliverable templates use Markdown format, placeholders marked with `[...]`
- Preserve all existing files and directories

