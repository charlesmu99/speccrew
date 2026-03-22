# SpecCrew - AI-Driven Software Engineering Framework

<p align="center">
  <a href="./README.md">中文</a> |
  <a href="./README.en.md">English</a> |
  <a href="./README.ar.md">العربية</a> |
  <a href="./README.es.md">Español</a>
</p>

> A virtual AI development team that enables rapid engineering implementation for any software project

## What is SpecCrew?

SpecCrew is an embedded virtual AI development team framework. It transforms professional software engineering workflows (PRD → Solution → Design → Dev → Test) into reusable Agent workflows, helping development teams achieve Specification-Driven Development (SDD), especially suitable for existing projects.

By integrating Agents and Skills into existing projects, teams can quickly initialize project documentation systems and virtual software teams, implementing new features and modifications following standard engineering workflows.

---

## 8 Core Problems Solved

### 1. AI Ignores Existing Project Documentation (Knowledge Gap)
**Problem**: Existing SDD or Vibe Coding methods rely on AI to summarize projects in real-time, easily missing critical context and causing development results to deviate from expectations.

**Solution**: The `knowledge/` repository serves as the project's "single source of truth," accumulating architecture design, functional modules, and business processes to ensure requirements stay on track from the source.

### 2. Direct PRD-to-Technical Documentation (Content Omission)
**Problem**: Jumping directly from PRD to detailed design easily misses requirement details, causing implemented features to deviate from requirements.

**Solution**: Introduce the **Solution document** phase, focusing only on the requirement skeleton without technical details:
- What pages and components are included
- Page operation flows
- Backend processing logic
- Data storage structure

Development only needs to "fill in the flesh" based on the specific tech stack, ensuring features grow "close to the bone (requirements)."

### 3. Uncertain Agent Search Scope (Uncertainty)
**Problem**: In complex projects, AI's broad search of code and documents yields uncertain results, making consistency difficult to guarantee.

**Solution**: Clear document directory structures and templates, designed based on each Agent's needs, implementing **progressive disclosure and on-demand loading** to ensure determinism.

### 4. Missing Steps and Tasks (Process Breakdown)
**Problem**: Lack of complete engineering process coverage easily misses critical steps, making quality difficult to guarantee.

**Solution**: Cover the full software engineering lifecycle:
```
PRD (Requirements) → Solution (Planning) → API Contract
    → Design → Dev (Development) → Test (Testing)
```
- Each phase's output is the next phase's input
- Each step requires human confirmation before proceeding
- All Agent executions have todo lists with self-check after completion

### 5. Low Team Collaboration Efficiency (Knowledge Silos)
**Problem**: AI programming experience is difficult to share across teams, leading to repeated mistakes.

**Solution**: All Agents, Skills, and related documents are version-controlled with source code:
- One person's optimization, shared by the team
- Knowledge accumulated in the codebase
- Improved team collaboration efficiency

### 7. Single Agent Context Too Long (Performance Bottleneck)
**Problem**: Large complex tasks exceed single Agent context windows, causing understanding deviation and decreased output quality.

**Solution**: **Sub-Agent Auto-Dispatch Mechanism**:
- Complex tasks are automatically identified and split into subtasks
- Each subtask is executed by an independent sub-Agent with isolated context
- Parent Agent coordinates and aggregates to ensure overall consistency
- Avoids single Agent context expansion, ensuring output quality

### 8. Requirement Iteration Chaos (Management Difficulty)
**Problem**: Multiple requirements mixed in the same branch affect each other, making tracking and rollback difficult.

**Solution**: **Each Requirement as an Independent Project**:
- Each requirement creates an independent iteration directory `iterations/iXXX-[requirement-name]/`
- Complete isolation: documents, design, code, and tests managed independently
- Rapid iteration: small granularity delivery, rapid verification, rapid deployment
- Flexible archiving: after completion, archive to `archive/` with clear historical traceability

### 6. Document Update Lag (Knowledge Decay)
**Problem**: Documents become outdated as projects evolve, causing AI to work with incorrect information.

**Solution**: Agents have automatic document update capabilities, synchronizing project changes in real-time to keep the knowledge base accurate.

---

## Core Workflow

```mermaid
graph LR
    A[PRD<br/>Requirements] --> B[Solution<br/>Technical Planning]
    B --> C[API Contract<br/>Interface Contract]
    C --> D[Design<br/>Detailed Design]
    D --> E[Dev<br/>Implementation]
    E --> F[Test<br/>Testing]
    F --> G[Archive<br/>Archiving]
    
    H[Knowledge<br/>Repository] -.-> A
    H -.-> B
    H -.-> D
    H -.-> E
    
    E -.-> H
    F -.-> H
```

### Phase Descriptions

| Phase | Agent | Input | Output | Human Confirmation |
|-------|-------|-------|--------|-------------------|
| PRD | PM | User Requirements | Product Requirements Document | ✅ Required |
| Solution | Planner | PRD | Technical Solution + API Contract | ✅ Required |
| Design | Designer | Solution | Frontend/Backend Design Documents | ✅ Required |
| Dev | Dev | Design | Code + Task Records | ✅ Required |
| Test | Test | Dev Output + PRD Acceptance Criteria | Test Report | ✅ Required |

---

## Comparison with Existing Solutions

| Dimension | Vibe Coding | Ralph Loop | **SpecCrew** |
|-----------|-------------|------------|-------------|
| Document Dependency | Ignores existing docs | Relies on AGENTS.md | **Structured Knowledge Base** |
| Requirement Transfer | Direct coding | PRD → Code | **PRD → Solution → Design → Code** |
| Human Involvement | Minimal | At startup | **At every phase** |
| Process Completeness | Weak | Medium | **Complete engineering workflow** |
| Team Collaboration | Hard to share | Personal efficiency | **Team knowledge sharing** |
| Context Management | Single instance | Single instance loop | **Sub-Agent auto-dispatch** |
| Iteration Management | Mixed | Task list | **Requirement as project, independent iteration** |
| Determinism | Low | Medium | **High (progressive disclosure)** |

---

## Quick Start

### 1. Install SpecCrew

**Method 1: One-click Install Script (Recommended, Qoder IDE only)**

```bash
# macOS / Linux / WSL - Install from GitHub
curl -fsSL https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/scripts/install-qoder.sh | bash

# macOS / Linux / WSL - Install from Gitee (China Mirror)
curl -fsSL https://gitee.com/amutek/SpecCrew/raw/main/scripts/install-qoder.sh | bash
```

```powershell
# Windows - Install from GitHub
Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/scripts/install-qoder.ps1").Content

# Windows - Install from Gitee (China Mirror)
Invoke-Expression (Invoke-WebRequest -Uri "https://gitee.com/amutek/SpecCrew/raw/main/scripts/install-qoder.ps1").Content
```

> **Note**: One-click installation script currently only supports Qoder IDE. For other IDEs (VS Code, Cursor, etc.), please use manual copy method below.

**Method 2: Manual Copy (Universal for all IDEs)**

```bash
# Clone repository and copy to existing project
git clone https://github.com/charlesmu99/speccrew.git
# or: git clone https://gitee.com/amutek/speccrew.git

# Copy to target project (adjust based on your IDE config directory)
cp -r SpecCrew/.speccrew /path/to/your-project/
cp -r SpecCrew/SpecCrew-workspace /path/to/your-project/

# For Qoder IDE, also copy to .qoder/ directory
cp -r SpecCrew/.speccrew/agents/* /path/to/your-project/.qoder/agents/
cp -r SpecCrew/.speccrew/skills/* /path/to/your-project/.qoder/skills/
```

### 2. Initialize Project

```bash
# Run initialization Skill to automatically generate knowledge base and project structure
# Executed automatically by speccrew-project-init Skill
```

### 3. Start Development Workflow

```bash
# 1. Create PRD
# 2. Generate Solution
# 3. Confirm API Contract
# 4. Detailed Design
# 5. Development Implementation
# 6. Testing
```

### 4. Uninstall SpecCrew

**Method 1: One-Click Uninstall Script (Recommended, Qoder IDE only)**

```bash
# macOS / Linux / WSL - Uninstall from GitHub
curl -fsSL https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/scripts/uninstall-qoder.sh | bash

# macOS / Linux / WSL - Uninstall from Gitee (China Mirror)
curl -fsSL https://gitee.com/amutek/SpecCrew/raw/main/scripts/uninstall-qoder.sh | bash
```

```powershell
# Windows - Uninstall from GitHub
Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/charlesmu99/SpecCrew/main/scripts/uninstall-qoder.ps1").Content

# Windows - Uninstall from Gitee (China Mirror)
Invoke-Expression (Invoke-WebRequest -Uri "https://gitee.com/amutek/SpecCrew/raw/main/scripts/uninstall-qoder.ps1").Content
```

> **Note**: One-click uninstall script currently only supports Qoder IDE.

**Method 2: Manual Uninstall (Universal for all IDEs)**

```bash
# Remove speccrew-workspace directory
rm -rf speccrew-workspace/

# Remove SpecCrew-prefixed files in .speccrew/ (preserve custom content)
rm -rf .speccrew/agents/SpecCrew-*.md
rm -rf .speccrew/skills/SpecCrew-*/

# For Qoder IDE, also clean up .qoder/ directory
rm -rf .qoder/agents/SpecCrew-*.md
rm -rf .qoder/skills/SpecCrew-*/
```

> **Note**: Uninstallation will preserve source files and custom content in `.speccrew/`. To completely remove IDE configurations, manually delete the corresponding IDE config directory (e.g., `.qoder/`).

---

## Directory Structure

```
your-project/
├── .speccrew/                       # SpecCrew source files (version controllable)
├── .qoder/                          # Qoder IDE configuration (runtime)
│   ├── agents/                      # 6 role Agents
│   └── skills/                      # 16 Skills
│
└── speccrew-workspace/              # Workspace (generated during initialization)
    ├── docs/                        # Management documents
    │   ├── rules/                   # Rule configurations
    │   └── solutions/               # Solution documents
    │       └── agent-knowledge-map.md
    │
    ├── iterations/                  # Iteration projects (dynamically generated)
    │   └── {number}-{type}-{name}/  # e.g., 001-feature-order
    │       ├── 00.docs/             # Original requirements
    │       ├── 01.prd/              # Product requirements
    │       ├── 02.solution/         # Solution design
    │       ├── 03.design/           # Design documents
    │       ├── 04.dev/              # Development phase
    │       ├── 05.test/             # Testing phase
    │       └── 06.delivery/         # Delivery phase
    │
    ├── iteration-archives/          # Iteration archives
    │   └── {number}-{type}-{name}-{date}/
    │
    └── knowledges/                  # Knowledge base
        ├── base/                    # Base metadata
        │   ├── diagnosis-reports/   # Diagnosis reports
        │   ├── sync-state/          # Sync state
        │   └── tech-debts/          # Technical debts
        │
        ├── bizs/                    # Business knowledge
        │   └── {platform-type}/
        │       └── {module-name}/
        │
        └── techs/                   # Technical knowledge
            └── {platform-id}/
```

---

## Core Design Principles

1. **Specification-Driven**: Write specifications first, then let code "grow" from them
2. **Progressive Disclosure**: Agents start from minimal entry points, loading information on demand
3. **Human Confirmation**: Each phase's output requires human confirmation to prevent AI deviation
4. **Context Isolation**: Large tasks are split into small, context-isolated subtasks
5. **Sub-Agent Collaboration**: Complex tasks automatically dispatch sub-Agents to avoid single Agent context expansion
6. **Rapid Iteration**: Each requirement as an independent project for rapid delivery and verification
7. **Knowledge Sharing**: All configurations are version-controlled with source code

---

## Use Cases

### ✅ Recommended For
- Medium to large projects requiring standardized workflows
- Team collaboration software development
- Legacy project engineering transformation
- Products requiring long-term maintenance

### ❌ Not Suitable For
- Personal rapid prototype validation
- Exploratory projects with highly uncertain requirements
- One-off scripts or tools

---

## More Information

- **Agent Knowledge Map**: [speccrew-workspace/docs/agent-knowledge-map.md](./speccrew-workspace/docs/agent-knowledge-map.md)
- **GitHub**: https://github.com/charlesmu99/speccrew
- **Gitee**: https://gitee.com/amutek/speccrew
- **Qoder IDE**: https://qoder.com/

---

> **SpecCrew is not about replacing developers, but automating the tedious parts so teams can focus on more valuable work.**

---


