---
name: speccrew-knowledge-techs-index-xml
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

## Workflow

<!--
== Block Types ==
input      : Workflow input parameters (required=mandatory, default=default value)
output     : Workflow output results (from=data source variable)
task       : Execute action (action: run-skill | run-script | dispatch-to-worker)
gateway    : Conditional branch/gate (mode: exclusive | guard | parallel)
loop       : Iterate over collection (over=collection, as=current item)
event      : Log/confirm/signal (action: log | confirm | signal)
error-handler : Exception handling (try > catch > finally)
checkpoint : Persistent milestone (name=checkpoint name, verify=verification condition)
rule       : Constraint declaration (level: forbidden | mandatory | note)
-->

<workflow>

  <!-- Global Rules -->
  <rule id="GLOBAL-R1" level="mandatory" description="Continuous Execution: Execute all steps in sequence without interruption. Worker must complete all steps before reporting results." />
  <rule id="GLOBAL-R-TECHSTACK" level="mandatory" description="Technology Stack Constraint: All generated index documents must accurately reflect detected platform technology stacks." />

  <!-- Input Block -->
  <input name="manifest_path" type="string" required="true" description="Path to techs-manifest.json" />
  <input name="techs_base_path" type="string" required="false" default="speccrew-workspace/knowledges/techs/" description="Base path for techs documentation" />
  <input name="output_path" type="string" required="false" default="speccrew-workspace/knowledges/techs/" description="Output path for root INDEX.md" />
  <input name="language" type="string" required="true" description="Target language (e.g., zh, en)" />

  <!-- Step 0: Read Root Index Template -->
  <task id="step0-read-template" action="read" description="Read root index template to understand required structure">
    <read-file path="../speccrew-knowledge-techs-index/templates/INDEX-TEMPLATE.md" />
  </task>

  <!-- Step 1: Read Manifest -->
  <task id="step1-read-manifest" action="read" description="Read techs-manifest.json to get platform list">
    <read-file path="{manifest_path}" />
  </task>

  <!-- Step 2: Verify Platform Documents -->
  <loop id="step2-verify-docs" over="platforms" as="platform" description="Scan each platform directory for document availability">
    <task id="step2a-scan-dir" action="list" description="List all .md files in platform directory">
      <list-dir path="{techs_base_path}/{platform.platform_id}/" filter="*.md" />
    </task>
    <task id="step2b-verify-required" action="verify" description="Check required documents exist">
      <verify-docs>
        <required name="INDEX.md" on-missing="skip-platform" />
        <required name="tech-stack.md" on-missing="mark-incomplete" />
        <required name="architecture.md" on-missing="mark-incomplete" />
        <required name="conventions-design.md" on-missing="mark-incomplete" />
        <required name="conventions-dev.md" on-missing="mark-incomplete" />
        <required name="conventions-test.md" on-missing="mark-incomplete" />
        <required name="conventions-build.md" on-missing="mark-incomplete" />
        <optional name="conventions-data.md" />
      </verify-docs>
    </task>
  </loop>

  <!-- Step 3: Extract Platform Summaries -->
  <loop id="step3-extract-summaries" over="platforms" as="platform" description="Read each platform INDEX.md for summary extraction">
    <gateway mode="guard" condition="platform.documents.INDEX.md exists">
      <task action="read" description="Read platform INDEX.md">
        <read-file path="{techs_base_path}/{platform.platform_id}/INDEX.md" />
      </task>
      <task action="extract" description="Extract platform name, framework, language, key technologies">
        <extract-fields>
          <field name="platform_name" />
          <field name="framework" />
          <field name="language" />
          <field name="key_technologies" />
        </extract-fields>
      </task>
    </gateway>
  </loop>

  <!-- Step 4: Get Timestamp -->
  <task id="step4-get-timestamp" action="run-script" description="Get current timestamp for generated_at field">
    <run-script script="scripts/get-timestamp.js" output="timestamp" />
  </task>

  <!-- Step 5: Generate Root INDEX.md -->
  <task id="step5-generate-index" action="generate" description="Generate root INDEX.md using template fill workflow">
    <generate-index template-path="../speccrew-knowledge-techs-index/templates/INDEX-TEMPLATE.md" output-path="{output_path}/INDEX.md">
      <copy-template />
      <fill-sections>
        <section name="header" with="{generated_at}, {source_path}, {platform_count}" />
        <section name="platform-overview" with="dynamic_links_from_verification" />
        <section name="quick-reference" with="organized_links" />
        <section name="agent-mapping" with="platform_agent_documents" />
        <section name="document-guide" with="document_descriptions" />
        <section name="usage-guide" with="agent_usage_instructions" />
      </fill-sections>
    </generate-index>
  </task>

  <!-- Step 6: Write Output -->
  <task id="step6-write-output" action="write" description="Write generated INDEX.md to output path">
    <write-file path="{output_path}/INDEX.md" />
  </task>

  <!-- Step 7: Report Results -->
  <event id="step7-report" action="log" description="Report generation results">
    <report format="structured">
      Stage 3 completed: Root Technology Index Generated
      - Platforms Indexed: {platform_count}
        - web-react: ✓
        - backend-nestjs: ✓
      - Root Index: {output_path}/INDEX.md
      - Agent Mappings: Documented for all platforms
    </report>
  </event>

  <!-- Output Block -->
  <output name="status" from="generation_status" />
  <output name="platforms_indexed" from="indexed_platforms_list" />
  <output name="output_file" from="index_file_path" />

</workflow>

---

## Template Usage

Templates are located at `../speccrew-knowledge-techs-index/templates/`:

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
