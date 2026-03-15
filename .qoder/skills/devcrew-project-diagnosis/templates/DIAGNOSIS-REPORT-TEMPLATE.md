# Project Diagnosis Report

Generated At: {{GeneratedAt}}

## 1. Project Basic Information

| Item | Content |
|------|---------|
| Project Name | {{ProjectName}} |
| Project Type | {{WebFullStack/FrontendOnly/BackendOnly/DesktopClient/Mobile/CLI/Hybrid}} |
| Determination Basis | {{DeterminationBasis}} |

## 2. Technology Stack List

### 2.1 Runtime & Languages
- Language: {{LanguageAndVersion}}
- Runtime: {{RuntimeEnvironment}}

### 2.2 Core Frameworks
- Frontend: {{FrontendFrameworkAndVersion}}
- Backend: {{BackendFrameworkAndVersion}}
- Database: {{DatabaseType}}

### 2.3 Toolchain
- Build: {{BuildTools}}
- Package Management: {{PackageManager}}
- Testing: {{TestingFramework}}

## 3. Project Directory Structure Conventions

Source code directory structure of the diagnosed project:

```
{{ProjectRootDirectoryStructure}}
```

## 4. Development Standards

- Code Linting: {{LintingToolsAndConfig}}
- Naming Style: {{NamingConventions}}
- Commit Standards: {{CommitStandards}}

## 5. Follow-up Work Recommendations

Based on diagnosis results, recommend creating the following:

### 5.1 Recommended Agents to Generate

Based on project type `{{ProjectType}}`, recommend generating the following Agents:

| Agent | Responsibility |
|-------|----------------|
| devcrew-pm | Product requirements document writing |
| devcrew-planner | Technical solution planning |
| devcrew-designer-[techstack] | Detailed design (frontend/backend by tech stack) |
| devcrew-dev-[techstack] | Development implementation |
| devcrew-test-[techstack] | Testing and validation |

### 5.2 Recommended .devcrew-workspace Directory Structure

Based on project type and diagnosis results, recommend creating the following directory structure:

```
.devcrew-workspace/
├── diagnosis-reports/          # Diagnosis reports
│   └── diagnosis-report-{date}.md
├── docs/                       # Management documents
│   ├── README.md
│   └── AGENTS.md
├── knowledge/                  # Project knowledge base
│   ├── README.md
│   ├── constitution.md
│   ├── architecture/           # Architecture docs (subdirs by project type)
│   │   ├── system/             # System overall architecture
│   │   ├── conventions/        # Development conventions
│   │   {{#if hasFrontend}}├── frontend/           # Frontend architecture{{/if}}
│   │   {{#if hasBackend}}├── backend/            # Backend architecture{{/if}}
│   │   {{#if hasDatabase}}├── data/               # Data architecture{{/if}}
│   │   {{#if hasDesktop}}├── desktop/            # Desktop architecture{{/if}}
│   │   {{#if hasMobile}}└── mobile/             # Mobile architecture{{/if}}
│   ├── bizs/                   # Business knowledge (empty initially, content accumulated later)
│   │   ├── modules/            # Business modules: {{DetectedModuleNamesList}}
│   │   └── flows/              # Business flows: To be organized by PM Agent
│   └── domain/                 # Domain knowledge (empty initially, content accumulated later)
│       ├── standards/
│       ├── glossary/
│       └── qa/
└── projects/                   # Iteration projects
    └── archive/                # Archive directory
```

**architecture/ Subdirectory Description**:
Based on project type `[{{ProjectType}}]`, recommend creating the following architecture subdirectories:

| Project Type | Recommended Subdirectories |
|--------------|----------------------------|
| Web Full-Stack | system, conventions, frontend, backend, data |
| Frontend Only | system, conventions, frontend |
| Backend Only | system, conventions, backend, data |
| Desktop Client | system, conventions, desktop |
| Mobile | system, conventions, mobile |
| Hybrid | Create based on actual included platforms |

**bizs/modules/ Initial Clues**:
Potential business modules detected from code structure (draft only, to be confirmed by PM Agent):
- {{Module1FromRoute/DirectoryAnalysis}}
- {{Module2FromRoute/DirectoryAnalysis}}
- ...

### 5.3 Content for Deep Identification

The following needs to be gradually accumulated during Agent usage:
- **Business Domains**: Organized by PM Agent during PRD phase
- **Repetitive Operation Patterns**: Identified by Dev Agent during development and accumulated as Skills
