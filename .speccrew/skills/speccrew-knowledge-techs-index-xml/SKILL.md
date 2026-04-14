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

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

<workflow id="techs-index-main" status="pending" version="1.0" desc="Root technology index generation from platform manifests">

  <!-- ============================================================
       Global Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="mandatory" desc="Continuous Execution constraint">
    <field name="text">Execute all steps in sequence without interruption. Worker must complete all steps before reporting results.</field>
  </block>

  <block type="rule" id="GLOBAL-R-TECHSTACK" level="mandatory" desc="Technology Stack constraint">
    <field name="text">All generated index documents must accurately reflect detected platform technology stacks.</field>
  </block>

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="techs-index input parameters">
    <field name="manifest_path" required="true" type="string" desc="Path to techs-manifest.json"/>
    <field name="techs_base_path" required="false" type="string" default="speccrew-workspace/knowledges/techs/" desc="Base path for techs documentation"/>
    <field name="output_path" required="false" type="string" default="speccrew-workspace/knowledges/techs/" desc="Output path for root INDEX.md"/>
    <field name="language" required="true" type="string" desc="Target language (e.g., zh, en)"/>
  </block>

  <!-- ============================================================
       Step 0: Read Root Index Template
       ============================================================ -->
  <sequence id="S0" name="Template Loading" status="pending" desc="Read root index template to understand required structure">

    <block type="task" id="S0-B1" action="read-file" status="pending" desc="Read root index template">
      <field name="file_path">${skill_dir}/../speccrew-knowledge-techs-index/templates/INDEX-TEMPLATE.md</field>
      <field name="output" var="index_template"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 1: Read Manifest
       ============================================================ -->
  <sequence id="S1" name="Manifest Reading" status="pending" desc="Read techs-manifest.json to get platform list">

    <block type="task" id="S1-B1" action="read-file" status="pending" desc="Read techs-manifest.json">
      <field name="file_path">${manifest_path}</field>
      <field name="output" var="techs_manifest"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 2: Verify Platform Documents
       ============================================================ -->
  <sequence id="S2" name="Document Verification" status="pending" desc="Scan each platform directory for document availability">

    <block type="loop" id="S2-L1" over="${techs_manifest.platforms}" as="platform" desc="Scan each platform directory for document availability">
      <!-- Step 2a: List .md files in platform directory -->
      <block type="task" id="S2-B1" action="list-dir" status="pending" desc="List all .md files in platform directory">
        <field name="path">${techs_base_path}/${platform.platform_id}/</field>
        <field name="filter" value="*.md"/>
        <field name="output" var="platform_md_files"/>
      </block>

      <!-- Step 2b: Verify required documents -->
      <block type="task" id="S2-B2" action="verify" status="pending" desc="Check required documents exist">
        <field name="required_docs" value="INDEX.md,tech-stack.md,architecture.md,conventions-design.md,conventions-dev.md,conventions-unit-test.md,conventions-system-test.md,conventions-build.md"/>
        <field name="optional_docs" value="conventions-data.md"/>
        <field name="on_missing_required" value="mark-incomplete"/>
        <field name="output" var="platform_doc_status"/>
      </block>
    </block>

  </sequence>

  <!-- ============================================================
       Step 3: Extract Platform Summaries
       ============================================================ -->
  <sequence id="S3" name="Summary Extraction" status="pending" desc="Read each platform INDEX.md for summary extraction">

    <block type="loop" id="S3-L1" over="${techs_manifest.platforms}" as="platform" desc="Read each platform INDEX.md for summary extraction">
      <block type="gateway" id="S3-G1" mode="guard" test="${platform.documents.INDEX.md} exists" fail-action="skip" desc="Only process platforms with INDEX.md">
        <field name="message">Skipping platform without INDEX.md: ${platform.platform_id}</field>

        <block type="task" id="S3-B1" action="read-file" status="pending" desc="Read platform INDEX.md">
          <field name="file_path">${techs_base_path}/${platform.platform_id}/INDEX.md</field>
          <field name="output" var="platform_index_content"/>
        </block>

        <block type="task" id="S3-B2" action="analyze" status="pending" desc="Extract platform name, framework, language, key technologies">
          <field name="extract_fields" value="platform_name,framework,language,key_technologies"/>
          <field name="output" var="platform_summary"/>
        </block>
      </block>
    </block>

  </sequence>

  <!-- ============================================================
       Step 4: Get Timestamp
       ============================================================ -->
  <block type="task" id="S4-B1" action="run-script" status="pending" desc="Get current timestamp for generated_at field">
    <field name="command">node scripts/get-timestamp.js</field>
    <field name="output" var="timestamp"/>
  </block>

  <!-- ============================================================
       Step 5: Generate Root INDEX.md
       ============================================================ -->
  <sequence id="S5" name="Index Generation" status="pending" desc="Generate root INDEX.md using template fill workflow">

    <block type="task" id="S5-B1" action="generate" status="pending" desc="Generate root INDEX.md from template">
      <field name="template_path">${skill_dir}/../speccrew-knowledge-techs-index/templates/INDEX-TEMPLATE.md</field>
      <field name="output_path">${output_path}/INDEX.md</field>
      <field name="sections">
        <field name="header" value="${generated_at},${source_path},${platform_count}"/>
        <field name="platform-overview" value="dynamic_links_from_verification"/>
        <field name="quick-reference" value="organized_links"/>
        <field name="agent-mapping" value="platform_agent_documents"/>
        <field name="document-guide" value="document_descriptions"/>
        <field name="usage-guide" value="agent_usage_instructions"/>
      </field>
      <field name="output" var="generated_index"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 6: Write Output
       ============================================================ -->
  <block type="task" id="S6-B1" action="write-file" status="pending" desc="Write generated INDEX.md to output path">
    <field name="file_path">${output_path}/INDEX.md</field>
    <field name="content" from="${generated_index}"/>
  </block>

  <!-- ============================================================
       Step 7: Report Results
       ============================================================ -->
  <block type="event" id="S7-E1" action="log" level="info" desc="Report generation results">
    <field name="message">Stage 3 completed: Root Technology Index Generated
- Platforms Indexed: ${platform_count}
  - web-react: ✓
  - backend-nestjs: ✓
- Root Index: ${output_path}/INDEX.md
- Agent Mappings: Documented for all platforms</field>
  </block>

  <!-- ============================================================
       Output Definition
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="status" from="${generation_status}"/>
    <field name="platforms_indexed" from="${indexed_platforms_list}"/>
    <field name="output_file" from="${index_file_path}"/>
  </block>

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
