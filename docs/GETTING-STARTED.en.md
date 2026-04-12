# SpecCrew Quick Start Guide

<p align="center">
  <a href="./GETTING-STARTED.md">简体中文</a> |
  <a href="./GETTING-STARTED.zh-TW.md">繁體中文</a> |
  <a href="./GETTING-STARTED.en.md">English</a> |
  <a href="./GETTING-STARTED.ko.md">한국어</a> |
  <a href="./GETTING-STARTED.de.md">Deutsch</a> |
  <a href="./GETTING-STARTED.es.md">Español</a> |
  <a href="./GETTING-STARTED.fr.md">Français</a> |
  <a href="./GETTING-STARTED.it.md">Italiano</a> |
  <a href="./GETTING-STARTED.da.md">Dansk</a> |
  <a href="./GETTING-STARTED.ja.md">日本語</a> |
  <a href="./GETTING-STARTED.ar.md">العربية</a>
</p>

This document helps you quickly understand how to use SpecCrew's Agent team to complete the full development cycle from requirements to delivery following standard engineering processes.

---

## 1. Prerequisites

### Install SpecCrew

```bash
npm install -g speccrew
```

### Initialize Project

```bash
speccrew init --ide qoder
```

Supported IDEs: `qoder`, `cursor`, `claude`, `codex`

### Directory Structure After Initialization

```
.
├── .qoder/
│   ├── agents/          # Agent definition files
│   └── skills/          # Skill definition files
├── speccrew-workspace/  # Workspace
│   ├── docs/            # Configurations, rules, templates, solutions
│   ├── iterations/      # Current ongoing iterations
│   ├── iteration-archives/  # Archived iterations
│   └── knowledges/      # Knowledge base
│       ├── base/        # Basic info (diagnosis reports, tech debts)
│       ├── bizs/        # Business knowledge base
│       └── techs/       # Technical knowledge base
```

### CLI Command Quick Reference

| Command | Description |
|---------|-------------|
| `speccrew list` | List all available Agents and Skills |
| `speccrew doctor` | Check installation integrity |
| `speccrew update` | Update project configuration to the latest version |
| `speccrew uninstall` | Uninstall SpecCrew |

---

## 2. Your First 5 Minutes

After running `speccrew init`, follow these steps to get productive immediately:

### Step 1: Choose Your IDE

| IDE | Init Command | Best For |
|-----|-------------|----------|
| **Qoder** (Recommended) | `speccrew init --ide qoder` | Full agent orchestration, parallel workers |
| **Cursor** | `speccrew init --ide cursor` | Composer-based workflows |
| **Claude Code** | `speccrew init --ide claude` | CLI-first development |
| **Codex** | `speccrew init --ide codex` | OpenAI ecosystem integration |

### Step 2: Initialize Knowledge Base (Recommended)

For existing projects, initialize knowledge base first so agents understand your codebase:

```
@speccrew-team-leader Initialize technical knowledge base
```

Then:

```
@speccrew-team-leader Initialize business knowledge base
```

### Step 3: Start Your First Task

```
@speccrew-product-manager I have a new requirement: [describe your feature]
```

> **Tip**: If unsure what to do, just say `@speccrew-team-leader Help me get started` — the Team Leader will auto-detect your project status and guide you.

---

## 3. Quick Decision Tree

Not sure what to do? Find your scenario below:

- **I have a new feature requirement**
  → `@speccrew-product-manager I have a new requirement: [describe your feature]`

- **I want to scan existing project knowledge**
  → `@speccrew-team-leader initialize technical knowledge base`
  → Then: `@speccrew-team-leader initialize business knowledge base`

- **I want to continue previous work**
  → `@speccrew-team-leader what is the current progress?`

- **I want to check system health**
  → Run in terminal: `speccrew doctor`

- **I'm not sure what to do**
  → `@speccrew-team-leader help me get started`
  → Team Leader will auto-detect your project status and guide you

---

## 4. Agent Quick Reference

| Role | Agent | Responsibilities | Example Command |
|------|-------|-----------------|-----------------|
| Team Leader | `@speccrew-team-leader` | Project navigation, knowledge init, status check | "Help me get started" |
| Product Manager | `@speccrew-product-manager` | Requirements analysis, PRD generation | "I have a new requirement: ..." |
| Feature Designer | `@speccrew-feature-designer` | Feature analysis, spec design, API contracts | "Start feature design for iteration X" |
| System Designer | `@speccrew-system-designer` | Architecture design, platform-specific design | "Start system design for iteration X" |
| System Developer | `@speccrew-system-developer` | Development coordination, code generation | "Start development for iteration X" |
| Test Manager | `@speccrew-test-manager` | Test planning, case design, execution | "Start testing for iteration X" |

> **Note**: You don't need to remember all agents. Just talk to `@speccrew-team-leader` and it will route your request to the right agent.

---

## 5. Workflow Overview

### Complete Flowchart

```mermaid
flowchart LR
    PRD[Phase 1<br/>Requirements Analysis<br/>Product Manager] --> FD[Phase 2<br/>Feature Design<br/>Feature Designer]
    FD --> SD[Phase 3<br/>System Design<br/>System Designer]
    SD --> DEV[Phase 4<br/>Development<br/>System Developer]
    DEV --> DEPLOY[Phase 5<br/>Deployment<br/>System Deployer]
    DEPLOY --> TEST[Phase 6<br/>System Testing<br/>Test Manager]
    TEST --> ARCHIVE[Phase 7<br/>Archive]
    
    KB[(Knowledge Base<br/>Throughout)] -.-> PRD
    KB -.-> FD
    KB -.-> SD
    KB -.-> DEV
    KB -.-> DEPLOY
    KB -.-> TEST
```

### Core Principles

1. **Phase Dependencies**: Each phase's deliverable is the input for the next phase
2. **Checkpoint Confirmation**: Each phase has a confirmation point that requires user approval before proceeding to the next phase
3. **Knowledge Base Driven**: The knowledge base runs throughout the entire process, providing context for all phases

---

## 6. Step Zero: Knowledge Base Initialization

Before starting the formal engineering process, you need to initialize the project knowledge base.

### 6.1 Technical Knowledge Base Initialization

**Conversation Example**:
```
@speccrew-team-leader initialize technical knowledge base
```

**Three-Phase Process**:
1. Platform Detection — Identify technical platforms in the project
2. Technical Documentation Generation — Generate technical specification documents for each platform
3. Index Generation — Establish knowledge base index

**Deliverable**:
```
speccrew-workspace/knowledges/techs/{platform-id}/
├── tech-stack.md          # Technology stack definition
├── architecture.md        # Architecture conventions
├── dev-spec.md            # Development specifications
├── test-spec.md           # Testing specifications
└── INDEX.md               # Index file
```

### 6.2 Business Knowledge Base Initialization

**Conversation Example**:
```
@speccrew-team-leader initialize business knowledge base
```

**Four-Phase Process**:
1. Feature Inventory — Scan code to identify all functional features
2. Feature Analysis — Analyze business logic for each feature
3. Module Summary — Summarize features by module
4. System Summary — Generate system-level business overview

**Deliverable**:
```
speccrew-workspace/knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

---

## 7. Phase-by-Phase Conversation Guide

### 7.1 Phase 1: Requirements Analysis (Product Manager)

**How to Start**:
```
@speccrew-product-manager I have a new requirement: [describe your requirement]
```

**Agent Workflow**:
1. Read system overview to understand existing modules
2. Analyze user requirements
3. Generate structured PRD document

**Deliverable**:
```
iterations/{number}-{type}-{name}/01.product-requirement/
├── [feature-name]-prd.md           # Product Requirements Document
└── [feature-name]-bizs-modeling.md # Business modeling (for complex requirements)
```

**Confirmation Checklist**:
- [ ] Does the requirement description accurately reflect user intent?
- [ ] Are business rules complete?
- [ ] Are integration points with existing systems clear?
- [ ] Are acceptance criteria measurable?

---

### 7.2 Phase 2: Feature Design (Feature Designer)

**How to Start**:
```
@speccrew-feature-designer start feature design
```

**Agent Workflow**:
1. Automatically locate the confirmed PRD document
2. Load business knowledge base
3. Generate feature design (including UI wireframes, interaction flows, data definitions, API contracts)
4. For multiple PRDs, use Task Worker for parallel design

**Deliverable**:
```
iterations/{iter}/02.feature-design/
└── [feature-name]-feature-spec.md  # Feature design document
```

**Confirmation Checklist**:
- [ ] Are all user scenarios covered?
- [ ] Are interaction flows clear?
- [ ] Are data field definitions complete?
- [ ] Is exception handling comprehensive?

---

### 7.3 Phase 3: System Design (System Designer)

**How to Start**:
```
@speccrew-system-designer start system design
```

**Agent Workflow**:
1. Locate Feature Spec and API Contract
2. Load technical knowledge base (tech stack, architecture, specifications for each platform)
3. **Checkpoint A**: Framework Evaluation — Analyze technical gaps, recommend new frameworks (if needed), wait for user confirmation
4. Generate DESIGN-OVERVIEW.md
5. Use Task Worker to parallel dispatch design for each platform (frontend/backend/mobile/desktop)
6. **Checkpoint B**: Joint Confirmation — Display summary of all platform designs, wait for user confirmation

**Deliverable**:
```
iterations/{iter}/03.system-design/
├── DESIGN-OVERVIEW.md              # Design overview
├── {platform-id}/
│   ├── INDEX.md                    # Platform design index
│   └── {module}-design.md          # Pseudocode-level module design
```

**Confirmation Checklist**:
- [ ] Does the pseudocode use actual framework syntax?
- [ ] Are cross-platform API contracts consistent?
- [ ] Is error handling strategy unified?

---

### 7.4 Phase 4: Development Implementation (System Developer)

**How to Start**:
```
@speccrew-system-developer start development
```

**Agent Workflow**:
1. Read system design documents
2. Load technical knowledge for each platform
3. **Checkpoint A**: Environment Pre-check — Check runtime versions, dependencies, service availability; wait for user resolution if failed
4. Use Task Worker to parallel dispatch development for each platform
5. Integration check: API contract alignment, data consistency
6. Output delivery report

**Deliverable**:
```
# Source code written to actual project source directory
iterations/{iter}/04.development/
├── {platform-id}/
│   └── tasks/                      # Development task records
└── delivery-report.md
```

**Confirmation Checklist**:
- [ ] Is the environment ready?
- [ ] Are integration issues within acceptable range?
- [ ] Does the code comply with development specifications?

---

### 7.5 Phase 5: Deployment (System Deployer)

**How to Start**:
```
@speccrew-system-deployer start deployment
```

**Agent Workflow**:
1. Verify development phase is complete (Stage Gate)
2. Load technical knowledge base (build configuration, database migration configuration, service startup commands)
3. **Checkpoint**: Environment Pre-check — Verify build tools, runtime versions, dependency availability
4. Execute deployment skills in sequence: Build → Migrate → Startup → Smoke Test
5. Output deployment report

> 💡 **Tip**: For projects without databases, the migration step is automatically skipped; for client applications (desktop/mobile), process verification mode is used instead of HTTP health checks.

**Deliverable**:
```
iterations/{iter}/05.deployment/
├── {platform-id}/
│   ├── deployment-plan.md          # Deployment plan
│   └── deployment-log.md           # Deployment execution log
└── deployment-report.md            # Deployment completion report
```

**Confirmation Checklist**:
- [ ] Is build completed successfully?
- [ ] Are all database migration scripts executed successfully (if applicable)?
- [ ] Does the application start normally and pass health checks?
- [ ] Are all smoke tests passed?

---

### 7.6 Phase 6: System Testing (Test Manager)

**How to Start**:
```
@speccrew-test-manager start testing
```

**Three-Phase Testing Process**:

| Phase | Description | Checkpoint |
|-------|-------------|------------|
| Test Case Design | Generate test cases based on PRD and Feature Spec | A: Display case coverage statistics and traceability matrix, wait for user confirmation of sufficient coverage |
| Test Code Generation | Generate executable test code | B: Display generated test files and case mapping, wait for user confirmation |
| Test Execution and Bug Reporting | Automatically execute tests and generate reports | None (automatic execution) |

**Deliverable**:
```
iterations/{iter}/06.system-test/
├── cases/
│   └── {platform-id}/              # Test case documents
├── code/
│   └── {platform-id}/              # Test code plan
├── reports/
│   └── test-report-{date}.md       # Test report
└── bugs/
    └── BUG-{id}-{title}.md         # Bug reports (one file per bug)
```

**Confirmation Checklist**:
- [ ] Is case coverage complete?
- [ ] Is test code runnable?
- [ ] Is bug severity assessment accurate?

---

### 7.7 Phase 7: Archive

Iterations are automatically archived upon completion:

```
speccrew-workspace/iteration-archives/
└── {number}-{type}-{name}-{date}/
    ├── 01.product-requirement/
    ├── 02.feature-design/
    ├── 03.system-design/
    ├── 04.development/
    ├── 05.deployment/
    └── 06.system-test/
```

---

## 8. Knowledge Base Overview

### 8.1 Business Knowledge Base (bizs)

**Purpose**: Store project business function descriptions, module divisions, API characteristics

**Directory Structure**:
```
knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

**Usage Scenarios**: Product Manager, Feature Designer

### 8.2 Technical Knowledge Base (techs)

**Purpose**: Store project technology stack, architecture conventions, development specifications, testing specifications

**Directory Structure**:
```
knowledges/techs/{platform-id}/
├── tech-stack.md
├── architecture.md
├── dev-spec.md
├── test-spec.md
└── INDEX.md
```

**Usage Scenarios**: System Designer, System Developer, Test Manager

---

## 9. Workflow Progress Management

The SpecCrew virtual team follows a strict stage-gating mechanism where each phase must be confirmed by the user before proceeding to the next. It also supports resumable execution — when restarted after interruption, it automatically continues from where it left off.

### 9.1 Three-Layer Progress Files

The workflow automatically maintains three types of JSON progress files, located in the iteration directory:

| File | Location | Purpose |
|------|----------|---------|
| `WORKFLOW-PROGRESS.json` | `iterations/{iter}/` | Records the status of each pipeline stage |
| `.checkpoints.json` | Under each phase directory | Records user checkpoint confirmation status |
| `DISPATCH-PROGRESS.json` | Under each phase directory | Records item-by-item progress for parallel tasks (multi-platform/multi-module) |

### 9.2 Stage Status Flow

Each phase follows this status flow:

```
pending → in_progress → completed → confirmed
```

- **pending**: Not yet started
- **in_progress**: Currently executing
- **completed**: Agent execution completed, awaiting user confirmation
- **confirmed**: User confirmed through final checkpoint, next phase can start

### 9.3 Resumable Execution

When restarting an Agent for a phase:

1. **Automatic upstream check**: Verifies if the previous phase is confirmed, blocks and prompts if not
2. **Checkpoint recovery**: Reads `.checkpoints.json`, skips passed checkpoints, continues from the last interruption point
3. **Parallel task recovery**: Reads `DISPATCH-PROGRESS.json`, only re-executes tasks with `pending` or `failed` status, skips `completed` tasks

### 9.4 Viewing Current Progress

View the pipeline panorama status through the Team Leader Agent:

```
@speccrew-team-leader view current iteration progress
```

The Team Leader will read the progress files and display a status overview similar to:

```
Pipeline Status: i001-user-management
  01 PRD:            ✅ Confirmed
  02 Feature Design: 🔄 In Progress (Checkpoint A passed)
  03 System Design:  ⏳ Pending
  04 Development:    ⏳ Pending
  05 Deployment:     ⏳ Pending
  06 System Test:    ⏳ Pending
```

### 9.5 Backward Compatibility

The progress file mechanism is fully backward compatible — if progress files do not exist (e.g., in legacy projects or new iterations), all Agents will execute normally according to the original logic.

---

## 10. Frequently Asked Questions (FAQ)

### Q1: What if the Agent doesn't work as expected?

1. Run `speccrew doctor` to check installation integrity
2. Confirm the knowledge base has been initialized
3. Confirm the previous phase's deliverable exists in the current iteration directory

### Q2: How to skip a phase?

**Not recommended** — Each phase's output is the input for the next phase.

If you must skip, manually prepare the corresponding phase's input document and ensure it follows the format specifications.

### Q3: How to handle multiple parallel requirements?

Create independent iteration directories for each requirement:
```
iterations/
├── 001-feature-xxx/
├── 002-feature-yyy/
└── 003-feature-zzz/
```

Each iteration is completely isolated and does not affect others.

### Q4: How to update SpecCrew version?

Update requires two steps:

```bash
# Step 1: Update the global CLI tool
npm install -g speccrew@latest

# Step 2: Sync Agents and Skills in your project directory
cd /path/to/your-project
speccrew update
```

- `npm install -g speccrew@latest`: Updates the CLI tool itself (new versions may include new Agent/Skill definitions, bug fixes, etc.)
- `speccrew update`: Syncs Agent and Skill definition files in your project to the latest version
- `speccrew update --ide cursor`: Updates configuration for a specific IDE only

> **Note**: Both steps are required. Running only `speccrew update` will not update the CLI tool itself; running only `npm install` will not update project files.

### Q5: `speccrew update` shows new version available but `npm install -g speccrew@latest` still installs the old version?

This is usually caused by npm cache. Solution:

```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install -g speccrew@latest

# Verify version
npm list -g speccrew
```

If it still doesn't work, try installing with a specific version number:
```bash
npm install -g speccrew@0.5.6
```

### Q6: How to view historical iterations?

After archiving, view in `speccrew-workspace/iteration-archives/`, organized by `{number}-{type}-{name}-{date}/` format.

### Q7: Does the knowledge base need regular updates?

Re-initialization is required in the following situations:
- Major changes to project structure
- Technology stack upgrade or replacement
- Addition/removal of business modules

---

## 11. Quick Reference

### Agent Start Quick Reference

| Phase | Agent | Start Conversation |
|-------|-------|-------------------|
| Initialization | Team Leader | `@speccrew-team-leader initialize technical knowledge base` |
| Requirements Analysis | Product Manager | `@speccrew-product-manager I have a new requirement: [description]` |
| Feature Design | Feature Designer | `@speccrew-feature-designer start feature design` |
| System Design | System Designer | `@speccrew-system-designer start system design` |
| Development | System Developer | `@speccrew-system-developer start development` |
| Deployment | System Deployer | `@speccrew-system-deployer start deployment` |
| System Testing | Test Manager | `@speccrew-test-manager start testing` |

### Checkpoint Checklist

| Phase | Number of Checkpoints | Key Check Items |
|-------|----------------------|-----------------|
| Requirements Analysis | 1 | Requirement accuracy, business rule completeness, acceptance criteria measurability |
| Feature Design | 1 | Scenario coverage, interaction clarity, data completeness, exception handling |
| System Design | 2 | A: Framework evaluation; B: Pseudocode syntax, cross-platform consistency, error handling |
| Development | 1 | A: Environment readiness, integration issues, code specifications |
| Deployment | 1 | Build success, migration complete, service startup, smoke test passed |
| System Testing | 2 | A: Case coverage; B: Test code runnability |

### Deliverable Path Quick Reference

| Phase | Output Directory | File Format |
|-------|-----------------|-------------|
| Requirements Analysis | `iterations/{iter}/01.product-requirement/` | `[name]-prd.md`, `[name]-bizs-modeling.md` |
| Feature Design | `iterations/{iter}/02.feature-design/` | `[name]-feature-spec.md` |
| System Design | `iterations/{iter}/03.system-design/` | `DESIGN-OVERVIEW.md`, `{platform}/INDEX.md`, `{platform}/{module}-design.md` |
| Development | `iterations/{iter}/04.development/` | Source code + `delivery-report.md` |
| Deployment | `iterations/{iter}/05.deployment/` | `deployment-plan.md`, `deployment-log.md`, `deployment-report.md` |
| System Testing | `iterations/{iter}/06.system-test/` | `cases/`, `code/`, `reports/`, `bugs/` |
| Archive | `iteration-archives/{iter}-{date}/` | Complete iteration copy |

---

## Next Steps

1. Run `speccrew init --ide qoder` to initialize your project
2. Execute Step Zero: Knowledge Base Initialization
3. Progress through each phase following the workflow, enjoying the specification-driven development experience!
