---
name: devcrew-project-diagnosis
description: Project diagnosis and evaluation Skill. Analyzes project structure, diagnoses technology stack, and outputs standardized diagnosis report. Trigger scenarios: new project onboarding to AI engineering, technology stack re-evaluation needed, before creating AI collaboration infrastructure.
tools: Read, Glob, Grep, List, ReadFile, Search
---

# Trigger Scenarios

- New project onboarding to AI engineering workflow, requires comprehensive diagnosis
- Significant technology stack changes, needs re-evaluation
- Before creating or rebuilding AI collaboration infrastructure
- User says "diagnose project", "evaluate tech stack", "analyze project structure"

# Diagnosis Goal

> Note: Deep identification of business domains and repetitive operation patterns should be gradually accumulated by specific Agents during actual usage after infrastructure creation.

---

**Diagnosis Report Output**: `.devcrew-workspace/diagnosis-reports/diagnosis-report-{YYYY-MM-DD-HHmm}.md`

- **Template**: [templates/DIAGNOSIS-REPORT-TEMPLATE.md](templates/DIAGNOSIS-REPORT-TEMPLATE.md)
- **Naming Convention**: Date-time suffix, e.g., `diagnosis-report-2026-03-15-1430.md`, supports multiple diagnoses on the same day

# Diagnosis Workflow

## Phase 1: Project Exploration (Parallel Reading)

Read the following simultaneously:

1. **Root Directory Key Files** (examples): `README.md`, `package.json`, `pyproject.toml`, `Cargo.toml`, `*.csproj`, `go.mod`, `pom.xml`, etc.
2. **Configuration Files** (examples): `docker-compose.yml`, `.env.template`, `.env.example`, `Dockerfile`, etc.
3. **Directory Structure**: Read root directory first, then decide whether to dive into subdirectories based on project complexity (typically 2-3 levels)
4. **Existing `.qoder/` Directory**: Record existing configuration

## Phase 2: Project Type Determination

Determine project type based on reading results:

| Project Type | Common Determination Criteria (Examples) |
|--------------|------------------------------------------|
| **Web Full-Stack** | Both frontend (Vue/React/Angular/Svelte, etc.) and backend (FastAPI/Express/Spring/Django, etc.) directories exist |
| **Frontend Only** | Only frontend framework, no independent backend service |
| **Backend/API Only** | No frontend directory, only server-side code |
| **Desktop Client** | Presence of Electron/Tauri/WPF/Qt, etc. characteristic files |
| **Mobile** | Presence of Android/iOS/Flutter/React Native, etc. characteristic files |
| **CLI Tool** | CLI entry point exists and no UI directory |
| **Hybrid** | Monorepo containing multiple types above |

## Phase 3: Deep Analysis

### 3.1 Technology Stack Identification

**Runtime & Languages** (examples)
- Language versions (Node.js, Python, Go, Rust, Java, C#, etc.)
- Runtime environment requirements

**Core Frameworks & Libraries** (examples)
- Frontend: Vue/React/Angular/Svelte, etc.
- Backend: Express/FastAPI/Spring/Django, etc.
- Database: PostgreSQL/MySQL/MongoDB/Redis, etc.
- Other key dependencies

**Build & Toolchain** (examples)
- Build tools: Vite/Webpack/rollup/esbuild, etc.
- Package managers: npm/pnpm/yarn/poetry/cargo, etc.
- Testing frameworks: Jest/Vitest/Pytest/Playwright, etc.

### 3.2 Directory Structure Analysis

Record actual directory conventions (examples):
- Source code directories (`src/`, `app/`, `lib/`, `packages/`, etc.)
- Configuration file locations
- Test file locations
- Static resource locations
- Documentation locations

### 3.3 Business Module Clue Collection (For Creating Empty Folders Only)

Collect business module names from the following locations (examples, no deep understanding needed, just list detected names):
- Route names in frontend routing configuration
- Backend API route prefixes
- Database Model/Entity file names
- Feature directory names (subdirectories under `modules/`, `features/`, `domains/`, etc.)

**Output Format**: List detected module names, mark as "To be confirmed by PM Agent"

### 3.4 Development Standards Identification

- **Code Style** (examples): ESLint, Prettier, Ruff, Black, Checkstyle, etc. configurations
- **Naming Conventions**: File naming, variable naming styles
- **Commit Standards** (examples): commitlint, conventional commits, etc.
- **Run Commands** (examples): package.json scripts, Makefile, Gradle tasks, etc.

## Phase 4: Generate Diagnosis Report

### 4.1 Create Diagnosis Report Directory

Ensure `.devcrew-workspace/diagnosis-reports/` directory exists.

### 4.2 Generate Diagnosis Report

Based on template `templates/DIAGNOSIS-REPORT-TEMPLATE.md`, generate the diagnosis report.

**Dynamic Content Filling Rules**:

1. **architecture/ Subdirectories**: Based on project type determined in Phase 2, select corresponding subdirectory combinations
   - Web Full-Stack → system, conventions, frontend, backend, data
   - Frontend Only → system, conventions, frontend
   - Backend Only → system, conventions, backend, data
   - Desktop Client → system, conventions, desktop
   - Mobile → system, conventions, mobile

2. **bizs/modules/ Initial Clues**: Fill in business module names collected in Phase 3.3

# Output Requirements

1. **Diagnosis report must be complete**: Cover all sections above, mark uncertain content as "To be confirmed"
2. **Information must be accurate**: All technology stack versions and paths must come from actual files, no guessing
3. **Format standardization**: Use the template format above for easy parsing by subsequent Skills

# Verification Checklist

- [ ] Project type determination has clear basis
- [ ] Technology stack version info comes from actual configuration files
- [ ] Directory structure comes from actual scan results
- [ ] Business module clues listed (marked "To be confirmed by PM Agent")
- [ ] Repetitive operation pattern identification noted as "To be accumulated later"
- [ ] Diagnosis report saved to specified path

# Output Summary

```
## Project Diagnosis Complete

### Diagnosis Result Summary
- Project Type: xxx
- Main Tech Stack: xxx, xxx, xxx
- Identified Business Domains: x
- Candidate Skills: x

### Diagnosis Report Location
See "Diagnosis Report Output" above

### Suggested Next Step
Call `devcrew-create-se-infrastructure` Skill to create AI collaboration infrastructure based on this diagnosis report
```
