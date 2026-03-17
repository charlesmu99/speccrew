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
| devcrew-designer-[techstack] | Detailed design |
| devcrew-dev-[techstack] | Development implementation |
| devcrew-test-[techstack] | Testing and validation |

### 5.2 Recommended devcrew-workspace Directory Structure

Based on project type and diagnosis results, recommend creating the following directory structure:

```
devcrew-workspace/
├── diagnosis-reports/          # Diagnosis reports
│   └── diagnosis-report-{date}.md
├── docs/                       # Management documents
│   ├── README.md
│   └── AGENTS.md
├── knowledge/                  # Project knowledge base
│   ├── README.md
│   ├── constitution.md
│   ├── architecture/           # Architecture docs (subdirs dynamically selected by project type)
│   │   ├── system/             # System overall architecture
│   │   ├── conventions/        # Development conventions
│   │   {{#if hasFrontend}}├── frontend/           # Frontend architecture (Web Full-Stack / Frontend Only){{/if}}
│   │   {{#if hasBackend}}├── backend/            # Backend architecture (Web Full-Stack / Backend Only){{/if}}
│   │   {{#if hasDatabase}}├── data/               # Data architecture (Web Full-Stack / Backend Only){{/if}}
│   │   {{#if hasDesktop}}├── desktop/            # Desktop architecture (Desktop Client){{/if}}
│   │   {{#if hasMobile}}└── mobile/             # Mobile architecture (Mobile){{/if}}
│   ├── bizs/                   # Business knowledge (empty initially, content accumulated by PM Agent)
│   │   {{#each detectedModules}}├── {{this}}/              # {{this}} module{{/each}}
│   └── domain/                 # Domain knowledge (empty initially, content accumulated later)
│       ├── standards/
│       ├── glossary/
│       └── qa/
└── projects/                   # Iteration projects
    └── archive/                # Archive directory
```

**architecture/ Subdirectory Description**:
Based on project type `[{{ProjectType}}]` determined in Phase 2, dynamically select corresponding subdirectory combinations:

| Project Type | Recommended Subdirectories | Mapping to SKILL.md Phase 2 |
|--------------|----------------------------|----------------------------|
| Web Full-Stack | system, conventions, frontend, backend, data | system, conventions, frontend, backend, data |
| Frontend Only | system, conventions, frontend | system, conventions, frontend |
| Backend Only | system, conventions, backend, data | system, conventions, backend, data |
| Desktop Client | system, conventions, desktop | system, conventions, desktop |
| Mobile | system, conventions, mobile | system, conventions, mobile |
| Hybrid | Create based on actual included platforms | Combine subdirs from detected platforms |

**bizs/ Dynamic Generation Rules**:

Based on Phase 3.3 Business Module Clue Collection, dynamically generate `bizs/` subdirectories:

| Condition | Generated Content |
|-----------|-------------------|
| `hasModules=true` | Create subdirectories named after detected business modules (e.g., `bizs/User/`, `bizs/Order/`) |
| `hasModules=false` | Skip `bizs/` directory creation or create empty structure |

**Initial Clues from Phase 3.3** (detected from code structure, to be confirmed by PM Agent):
- {{Module1FromRoute/DirectoryAnalysis}} (Source: frontend routing / backend API routes / directory structure)
- {{Module2FromRoute/DirectoryAnalysis}} (Source: frontend routing / backend API routes / directory structure)
- ...

> **Note**: 
> - `hasModules` = true when business modules detected from routes/entities/directories
> - Business flows will be organized by PM Agent during PRD phase
> - PM Agent will confirm and refine during actual project execution

## 6. Business Analysis (Initial)

Based on source code route/directory structure analysis, preliminary identification of business modules:

### 6.1 Frontend Page Modules

| Route Path | Page Name | Possible Function | Associated Module |
|------------|-----------|-------------------|-------------------|
| {{RoutePath1}} | {{PageName1}} | {{FunctionDesc1}} | {{ModuleName1}} |
| {{RoutePath2}} | {{PageName2}} | {{FunctionDesc2}} | {{ModuleName2}} |

> Data Source: Frontend routing configuration / pages directory structure analysis

### 6.2 Backend API Modules

| Route Prefix | Module Name | Possible Function | HTTP Methods |
|--------------|-------------|-------------------|--------------|
| {{ApiPrefix1}} | {{ModuleName1}} | {{FunctionDesc1}} | {{Methods1}} |
| {{ApiPrefix2}} | {{ModuleName2}} | {{FunctionDesc2}} | {{Methods2}} |

> Data Source: Backend router files / API directory structure analysis

### 6.3 Data Model Clues

| Table/Model Name | Associated Module | Possible Purpose | Key Fields |
|------------------|-------------------|------------------|------------|
| {{TableName1}} | {{Module1}} | {{Purpose1}} | {{Fields1}} |
| {{TableName2}} | {{Module2}} | {{Purpose2}} | {{Fields2}} |

> Data Source: ORM model files / database migration files analysis

### 6.4 Business Module Summary

```
{{ProjectName}}
├── {{Module1Name}}
│   ├── Frontend: {{Pages1}}
│   ├── Backend: {{Apis1}}
│   └── Data: {{Tables1}}
├── {{Module2Name}}
│   ├── Frontend: {{Pages2}}
│   ├── Backend: {{Apis2}}
│   └── Data: {{Tables2}}
```

> Note: This is preliminary analysis based on code structure only. Business logic details need to be confirmed by PM Agent during requirements phase.

---

## 7. Knowledge Base Initialization Guide

Based on this diagnosis report, the following knowledge base structure should be generated during initialization:

### 7.1 Architecture Layer (Auto-generated by Designer Agents)

| Directory | Generated By | Input From This Report |
|-----------|--------------|------------------------|
| `architecture/system/` | System analysis | Section 2: Technology Stack |
| `architecture/frontend/` | Frontend Designer Agent | Section 2.2, 3: Frontend framework & directory structure |
| `architecture/backend/` | Backend Designer Agent | Section 2.2, 3: Backend framework & directory structure |
| `architecture/data/` | Backend Designer Agent | Section 2.2, 6.3: Database & data models |
| `architecture/conventions/` | Designer Agents | Section 4: Development standards |

### 7.2 Business Layer (Framework generated by Leader Agent)

| Directory | Generated By | Input From This Report |
|-----------|--------------|------------------------|
| `bizs/{ModuleName}/` | Leader Agent | Section 6.4: Business module summary |

### 7.3 Domain Layer (Empty initially)

| Directory | Content | Populated By |
|-----------|---------|--------------|
| `domain/standards/` | Industry standards | PM Agent on-demand |
| `domain/glossary/` | Business terminology | PM Agent during PRD phase |
| `domain/qa/` | Q&A knowledge | All Agents gradually |

---

## 8. Content for Deep Identification

The following needs to be gradually accumulated during Agent usage:
- **Business Flows**: Organized by PM Agent during PRD phase, associated with corresponding modules
- **Domain Knowledge**: Added to `domain/` when involving industry standards
- **Repetitive Operation Patterns**: Identified by Dev Agent during development and accumulated as Skills
