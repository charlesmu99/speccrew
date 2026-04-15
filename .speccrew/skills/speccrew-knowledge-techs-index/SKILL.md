---
name: speccrew-knowledge-techs-index
description: Stage 3 of technology knowledge initialization - Generate root INDEX.md by aggregating all platform technology documents using XML workflow blocks. Creates the master index that maps platforms to their documentation and provides Agent-to-Platform mapping guide. Used by Worker Agent after all platform documents are generated.
tools: Read, Write, Skill
---

# Stage 3: Generate Root Technology Index (XML Workflow)

Aggregate all platform technology documentation into a single root INDEX.md that serves as the master navigation hub for technology knowledge.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

## Trigger Scenarios

- "Generate techs root index"
- "Create technology knowledge index"
- "Aggregate platform tech docs"
- "Generate master tech index"

## User

Worker Agent (speccrew-task-worker)

## Input

- `manifest_path`: Path to techs-manifest.json
- `techs_base_path`: Base path for techs documentation (default: `speccrew-workspace/knowledges/techs/`)
- `output_path`: Output path for root INDEX.md (default: `speccrew-workspace/knowledges/techs/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

## Output

- `{{output_path}}/INDEX.md` - Root technology knowledge index

**INDEX.md Content Structure**:
- Introduction (generation info, platform count)
- Platform Overview (table with links to all platform docs)
- Quick Reference (links organized by document type)
- Agent-to-Platform Mapping (maps agents to their platform docs)
- Document Guide (explains each document type)
- Usage Guide (how to use the knowledge)

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

## Template Usage

Templates are located at `./templates/`:

**Template Variables:**
- `{{generated_at}}`: ISO timestamp
- `{{source_path}}`: Source path
- `{{platform_count}}`: Number of platforms
- `{{#each platforms}}`: Loop through platforms
  - `{{platform_id}}`: Platform identifier
  - `{{platform_type}}`: Platform type
  - `{{framework}}`: Framework name
  - `{{language}}`: Programming language

---

## Document Structure Details

### Section 1: Header

```markdown
# Technology Knowledge Index

**Files Referenced in This Document**

- [techs-manifest.json](../../../speccrew-workspace/knowledges/techs/techs-manifest.json)

> **Target Audience**: devcrew-designer-*, devcrew-dev-*, devcrew-test-*
```

### Section 2: Platform Overview

Summary table of all platforms with **dynamically generated document links**:

```markdown
## Platform Overview

| Platform | Type | Framework | Stack | Arch | Design | Dev | Test | Build | Data |
|----------|------|-----------|-------|------|--------|-----|------|-------|------|
| [web-react](web-react/INDEX.md) | web | React | [Stack](web-react/tech-stack.md) | ... | ... | ... | ... | ... | - |
```

**Dynamic Link Generation Rules:**

1. **Always include links to required documents** (if they exist)
2. **Conditionally include conventions-data.md**: Show `-` if not exists
3. **Link Format**: Use short abbreviations to save space

### Section 3: Quick Reference

Quick links organized by document type (Technology Stacks, Architecture Guidelines, Design Conventions, etc.)

### Section 4: Agent-to-Platform Mapping

Critical section that defines how Agents map to platform documentation. **Must dynamically adjust based on actual document availability.**

**Dynamic Adjustment Rules:**

1. **Designer Agent Documents**: Primary + Optional (conventions-data.md, ui-style-patterns/)
2. **Developer Agent Documents**: Primary (conventions-dev.md, conventions-build.md) + Optional
3. **Tester Agent Documents**: Primary (conventions-test.md, conventions-build.md) + Optional

### Section 5: Document Guide

Explain what each document type contains.

### Section 6: Usage Guide

How to use the technology knowledge for Designer, Developer, and Tester Agents.

---

## Checklist

### Pre-Generation
- [ ] techs-manifest.json read successfully
- [ ] Platform list extracted from manifest

### Dynamic Document Detection
- [ ] Each platform directory scanned for actual document existence
- [ ] Document availability map created for each platform
- [ ] Required documents verified
- [ ] Optional conventions-data.md existence checked per platform

### Content Generation
- [ ] Platform summaries extracted from existing INDEX.md files
- [ ] Root INDEX.md generated with all sections
- [ ] **Platform Overview table**: Links dynamically generated based on actual document existence
- [ ] **Agent-to-Platform mapping**: Document recommendations adjusted per platform
- [ ] Document guide included
- [ ] Usage guide included

### Quality & Validation
- [ ] No broken links to non-existent documents
- [ ] conventions-data.md links only included for platforms where it exists
- [ ] **Source traceability**: File reference block added to root INDEX.md
- [ ] Output file written successfully
- [ ] Results reported with document availability summary

---

## CONTINUOUS EXECUTION RULES

This skill follows the continuous execution pattern defined in `GLOBAL-R1`:

1. **Sequential Execution**: All workflow steps must execute in the defined order without interruption.
2. **No User Prompts**: Worker must not pause for user confirmation between steps.
3. **Complete All Steps**: Worker must complete all steps before reporting results.
4. **Error Handling**: If any step fails, continue with remaining steps if possible, then report all errors together.
5. **Technology Stack Constraint**: Per `GLOBAL-R-TECHSTACK`, all generated index documents must accurately reflect detected platform technology stacks.
