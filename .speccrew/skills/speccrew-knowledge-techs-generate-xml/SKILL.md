---
name: speccrew-knowledge-techs-generate-xml
description: Stage 2 of technology knowledge initialization - Generate technology documentation for a specific platform using XML workflow blocks. Extracts tech stack, architecture, and conventions from configuration files and source code. Creates INDEX.md, tech-stack.md, architecture.md, and conventions-*.md files. Used by Worker Agent in parallel for each detected platform.
tools: Read, Write, Glob, Grep, Skill
---

> **⚠️ DEPRECATED**: This skill has been superseded by `speccrew-knowledge-techs-generate-conventions-xml` and `speccrew-knowledge-techs-generate-ui-style-xml`. Use those skills for new requests. This file is kept for backward compatibility only.
>
> **Do NOT invoke this skill directly.** Use the specialized skills via `speccrew-knowledge-techs-dispatch` Stage 2 dual-worker orchestration.

# Stage 2: Generate Platform Technology Documents (XML Workflow)

Generate comprehensive technology documentation for a specific platform by analyzing its configuration files and source code structure.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

## Input

- `platform_id`: Platform identifier (e.g., "web-react", "backend-nestjs")
- `platform_type`: Platform type (web, mobile, backend, desktop)
- `framework`: Primary framework (react, nestjs, flutter, etc.)
- `source_path`: Platform source directory
- `config_files`: List of configuration file paths
- `convention_files`: List of convention file paths (eslint, prettier, etc.)
- `output_path`: Output directory for generated documents
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**
- `completed_dir`: (Optional) Directory for analysis coverage report output

## Output

**Required Documents (All Platforms)**: INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md

**Optional Documents**: conventions-data.md (backend required), ui-style/ (frontend only)

**Quality Assurance**: After document generation, quality checks are performed by `speccrew-knowledge-techs-generate-quality` skill.

## Workflow

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

<workflow id="techs-generate-main" status="pending" version="1.0" desc="Platform technology documentation generation">

  <!-- ============================================================
       Global Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="mandatory" desc="Continuous Execution constraint">
    <field name="text">Execute all steps in sequence without interruption. Worker must complete all steps before reporting results.</field>
  </block>

  <block type="rule" id="GLOBAL-R-TECHSTACK" level="mandatory" desc="Technology Stack constraint">
    <field name="text">All generated documents must align with the detected technology stack of the platform.</field>
  </block>

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="techs-generate input parameters">
    <field name="platform_id" required="true" type="string" desc="Platform identifier (e.g., web-react, backend-nestjs)"/>
    <field name="platform_type" required="true" type="string" desc="Platform type (web, mobile, backend, desktop)"/>
    <field name="framework" required="true" type="string" desc="Primary framework (react, nestjs, flutter, etc.)"/>
    <field name="source_path" required="true" type="string" desc="Platform source directory"/>
    <field name="config_files" required="true" type="array" desc="List of configuration file paths"/>
    <field name="convention_files" required="false" type="array" desc="List of convention file paths"/>
    <field name="output_path" required="true" type="string" desc="Output directory for generated documents"/>
    <field name="language" required="true" type="string" desc="Target language (e.g., zh, en)"/>
    <field name="completed_dir" required="false" type="string" desc="Directory for analysis coverage report output"/>
  </block>

  <!-- ============================================================
       Step 0: Read Document Templates
       ============================================================ -->
  <sequence id="S0" name="Template Loading" status="pending" desc="Read document templates from templates directory">

    <block type="task" id="S0-B1" action="read-file" status="pending" desc="Read document templates from templates directory">
      <field name="file_path">${skill_dir}/../speccrew-knowledge-techs-generate/templates/</field>
      <field name="output" var="document_templates"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 1: Read Configuration Files
       ============================================================ -->
  <sequence id="S1" name="Config Reading" status="pending" desc="Read primary configuration and convention files">

    <block type="task" id="S1-B1" action="read-files" status="pending" desc="Read primary configuration and convention files">
      <field name="files" value="${config_files},${convention_files}"/>
      <field name="output" var="config_contents"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 2: Extract Technology Stack
       ============================================================ -->
  <sequence id="S2" name="Tech Stack Extraction" status="pending" desc="Parse configuration files to extract technology stack">

    <block type="task" id="S2-B1" action="analyze" status="pending" desc="Parse configuration files to extract technology stack">
      <field name="extract_items">
        <field name="core_framework" source="package.json|pom.xml|requirements.txt|pubspec.yaml|go.mod"/>
        <field name="dependencies" source="dependencies section"/>
        <field name="build_tools" source="devDependencies, scripts"/>
      </field>
      <field name="output" var="tech_stack"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 3: Analyze Conventions
       ============================================================ -->
  <sequence id="S3" name="Convention Analysis" status="pending" desc="Extract conventions from config files and analyze project structure">

    <block type="task" id="S3-B1" action="read-file" status="pending" desc="Read mermaid-rule.md for diagram generation">
      <field name="file_path">${workspace_path}/docs/rules/mermaid-rule.md</field>
      <field name="output" var="mermaid_rule"/>
    </block>

    <block type="task" id="S3-B2" action="analyze" status="pending" desc="Extract conventions from ESLint/Prettier configs and analyze directory structure">
      <field name="extract_from" value="ESLint/Prettier configs"/>
      <field name="analyze_dir" value="${source_path}"/>
      <field name="analyze_for" value="directory-conventions"/>
      <field name="output" var="conventions"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 4: UI Style Analysis (Frontend Platforms Only)
       ============================================================ -->
  <block type="gateway" id="S4-G1" mode="exclusive" desc="Check if platform is frontend">
    <branch test="${platform_type} IN [web, mobile, desktop]" name="Frontend platform">
      <block type="task" id="S4-B1" action="run-skill" status="pending" desc="Invoke UI style analysis skill">
        <field name="skill">speccrew-knowledge-techs-ui-analyze</field>
        <field name="args">source_path=${source_path};platform_id=${platform_id};platform_type=${platform_type};framework=${framework};output_path=${output_path}/ui-style/;language=${language}</field>
        <field name="output" var="ui_style_result"/>
      </block>
    </branch>
    <branch default="true" name="Backend platform">
      <block type="event" id="S4-E1" action="log" level="info" desc="UI style analysis skipped">
UI style analysis skipped for backend platform
      </block>
    </branch>
  </block>

  <!-- ============================================================
       Step 5: Generate Documents
       ============================================================ -->
  <sequence id="S5" name="Document Generation" status="pending" desc="Generate all required documents using template fill workflow">

    <block type="task" id="S5-B1" action="generate" status="pending" desc="Generate all required documents using template fill workflow">
      <field name="template_path">${skill_dir}/../speccrew-knowledge-techs-generate/templates/</field>
      <field name="output_path">${output_path}</field>
      <field name="documents">
        <field name="INDEX.md" template="INDEX-TEMPLATE.md"/>
        <field name="tech-stack.md" template="TECH-STACK-TEMPLATE.md"/>
        <field name="architecture.md" template="ARCHITECTURE-TEMPLATE.md"/>
        <field name="conventions-design.md" template="CONVENTIONS-DESIGN-TEMPLATE.md"/>
        <field name="conventions-dev.md" template="CONVENTIONS-DEV-TEMPLATE.md"/>
        <field name="conventions-unit-test.md" template="CONVENTIONS-UNIT-TEST-TEMPLATE.md"/>
        <field name="conventions-system-test.md" template="CONVENTIONS-SYSTEM-TEST-TEMPLATE.md"/>
        <field name="conventions-build.md" template="CONVENTIONS-BUILD-TEMPLATE.md"/>
      </field>
      <field name="output" var="generated_docs"/>
    </block>

  </sequence>

  <!-- ============================================================
       Step 5b: Generate conventions-data.md for Backend
       ============================================================ -->
  <block type="gateway" id="S5b-G1" mode="exclusive" desc="Check if data layer document needed">
    <branch test="${platform_type} == backend OR ${data_layer_detected} == true" name="Data layer required">
      <block type="task" id="S5b-B1" action="generate" status="pending" desc="Generate data layer conventions">
        <field name="template" value="CONVENTIONS-DATA-TEMPLATE.md"/>
        <field name="output_path">${output_path}/conventions-data.md</field>
        <field name="output" var="data_conventions"/>
      </block>
    </branch>
    <branch default="true" name="No data layer">
      <block type="event" id="S5b-E1" action="log" level="info" desc="Data conventions skipped">
conventions-data.md skipped - not required for this platform
      </block>
    </branch>
  </block>

  <!-- ============================================================
       Step 6: Write Output Files
       ============================================================ -->
  <block type="task" id="S6-B1" action="write-files" status="pending" desc="Write all generated documents to output directory">
    <field name="output_path">${output_path}</field>
    <field name="files" from="${generated_docs}"/>
  </block>

  <!-- ============================================================
       Step 7: Generate Analysis Coverage Report
       ============================================================ -->
  <block type="task" id="S7-B1" action="generate" status="pending" desc="Generate analysis coverage JSON report">
    <field name="output_path">${completed_dir}/${platform_id}.analysis.json</field>
    <field name="format" value="json"/>
    <field name="include">
      <field name="topics_analysis"/>
      <field name="config_files_analyzed"/>
      <field name="source_dirs_scanned"/>
      <field name="documents_generated"/>
    </field>
    <field name="output" var="coverage_report"/>
  </block>

  <!-- ============================================================
       Step 8: Report Results
       ============================================================ -->
  <block type="event" id="S8-E1" action="log" level="info" desc="Report generation results">
Platform Technology Documents Generated: ${platform_id}
- INDEX.md: ✓
- tech-stack.md: ✓
- architecture.md: ✓
- conventions-design.md: ✓
- conventions-dev.md: ✓
- conventions-unit-test.md: ✓
- conventions-system-test.md: ✓
- conventions-build.md: ✓
- conventions-data.md: ✓ (or skipped)
- ui-style-guide.md: ✓ (frontend only)
- Output Directory: ${output_path}
  </block>

  <!-- ============================================================
       Output Definition
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="status" from="${generation_status}"/>
    <field name="documents_generated" from="${generated_files_list}"/>
    <field name="coverage_report" from="${analysis_coverage}"/>
  </block>

</workflow>

---

## Reference Guides

### Mermaid Diagram Guide

**Key Requirements:** Use basic node definitions only. No HTML tags, no nested subgraphs, no `direction` keyword, no `style` definitions.

**Diagram Types**: `graph TB/LR` (structure), `flowchart TD` (logic), `sequenceDiagram` (interactions), `classDiagram` (classes), `erDiagram` (database), `stateDiagram-v2` (states)

### Source Traceability Requirements

**CRITICAL: All source file links MUST use RELATIVE PATHS.** No absolute paths, no `file://` protocol.

**Relative Path Calculation**: Documents at `speccrew-workspace/knowledges/techs/{platform_id}/` are 4 levels deep. Use `../../../../` prefix to reference project root files.

**Required Elements**:
1. File reference block at document beginning listing referenced files
2. `**Diagram Source**` annotation after each Mermaid diagram
3. `**Section Source**` annotation at end of major sections

### Document Content Specifications

#### INDEX.md
Platform summary, technology stack overview, navigation links, agent usage guide.

#### tech-stack.md
Overview, Core Technologies table, Dependencies (grouped), Development Tools, Configuration Files.

#### architecture.md
**Web**: Component Architecture, State Management, Routing, API Integration, Styling. **Backend**: Layered Architecture, DI, Module Organization, API Design, Middleware. **Mobile**: Widget Structure, State Management, Navigation, Platform considerations.

#### conventions-design.md
Design Principles (SOLID, DRY), Design Patterns, UI Design Conventions (reference ui-style/), Data Flow, Error Handling, Security, Performance.

#### conventions-dev.md
Naming Conventions, Directory Structure, Code Style (from ESLint/Prettier), Import/Export Patterns, Git Commit Conventions, Pre-Development Checklist, Code Review Checklist.

**Source extraction**: Prettier (.prettierrc), ESLint (.eslintrc), EditorConfig (.editorconfig), Git hooks (.husky/), Commit conventions (.commitlintrc), Runtime version (.nvmrc), IDE config (.vscode/).

#### conventions-unit-test.md / conventions-system-test.md
Unit Testing (framework, naming, location, template, run command), Integration Testing, E2E Testing (frontend only), Database Testing (backend only), Performance Testing, Coverage Requirements, Troubleshooting.

#### conventions-build.md
Build Tool & Configuration, Environment Management, Build Profiles & Outputs, CI/CD (if detected), Docker (if detected), Dependency Management.

#### conventions-data.md (Optional)
ORM/Database Tool, Data Modeling, Migrations, Query Optimization, Caching.

---

## Template Usage

Templates are located at `../speccrew-knowledge-techs-generate/templates/`:

| Template File | Purpose |
|---------------|---------|
| INDEX-TEMPLATE.md | Platform overview |
| TECH-STACK-TEMPLATE.md | Technology stack |
| ARCHITECTURE-TEMPLATE.md | Architecture patterns |
| CONVENTIONS-DESIGN-TEMPLATE.md | Design principles |
| CONVENTIONS-DEV-TEMPLATE.md | Development conventions |
| CONVENTIONS-UNIT-TEST-TEMPLATE.md | Unit testing |
| CONVENTIONS-SYSTEM-TEST-TEMPLATE.md | System testing |
| CONVENTIONS-BUILD-TEMPLATE.md | Build/deployment |
| CONVENTIONS-DATA-TEMPLATE.md | Data layer |

## Checklist

### Pre-Generation
- [ ] All configuration files read and parsed
- [ ] Technology stack extracted accurately
- [ ] Conventions analyzed from config files
- [ ] Platform type identified
- [ ] Data layer detection completed for non-backend platforms

### Required Documents (All Platforms)
- [ ] INDEX.md, tech-stack.md, architecture.md
- [ ] conventions-design.md, conventions-dev.md
- [ ] conventions-unit-test.md, conventions-system-test.md, conventions-build.md

### Optional Document
- [ ] conventions-data.md (if applicable)

### UI Style Analysis (Frontend Platforms)
- [ ] ui-analyze skill invoked
- [ ] ui-style-guide.md generated
- [ ] UI conventions referenced in conventions-design.md

## Task Completion Report

Upon completion, output the following structured report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-knowledge-techs-generate-xml",
  "output_files": [
    "{output_path}/INDEX.md",
    "{output_path}/tech-stack.md",
    "{output_path}/architecture.md"
  ],
  "summary": "Tech documentation generated for {platform_id}",
  "metrics": {
    "documents_generated": 0,
    "sections_filled": 0,
    "code_examples_included": 0
  },
  "errors": [],
  "next_steps": ["Run quality check via speccrew-knowledge-techs-generate-quality"]
}
```

---

## CONTINUOUS EXECUTION RULES

This skill follows the continuous execution pattern defined in `GLOBAL-R1`:

1. **Sequential Execution**: All workflow steps must execute in the defined order without interruption.
2. **No User Prompts**: Worker must not pause for user confirmation between steps.
3. **Complete All Steps**: Worker must complete all steps before reporting results.
4. **Error Handling**: If any step fails, continue with remaining steps if possible, then report all errors together.
5. **Technology Stack Constraint**: Per `GLOBAL-R-TECHSTACK`, all generated documents must align with the detected technology stack.
