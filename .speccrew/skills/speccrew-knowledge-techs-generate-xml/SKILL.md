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

<workflow>

  <!-- Global Rules -->
  <rule id="GLOBAL-R1" level="mandatory" description="Continuous Execution: Execute all steps in sequence without interruption. Worker must complete all steps before reporting results." />
  <rule id="GLOBAL-R-TECHSTACK" level="mandatory" description="Technology Stack Constraint: All generated documents must align with the detected technology stack of the platform." />

  <!-- Input Block -->
  <input name="platform_id" type="string" required="true" description="Platform identifier (e.g., web-react, backend-nestjs)" />
  <input name="platform_type" type="string" required="true" description="Platform type (web, mobile, backend, desktop)" />
  <input name="framework" type="string" required="true" description="Primary framework (react, nestjs, flutter, etc.)" />
  <input name="source_path" type="string" required="true" description="Platform source directory" />
  <input name="config_files" type="array" required="true" description="List of configuration file paths" />
  <input name="convention_files" type="array" required="false" description="List of convention file paths" />
  <input name="output_path" type="string" required="true" description="Output directory for generated documents" />
  <input name="language" type="string" required="true" description="Target language (e.g., zh, en)" />
  <input name="completed_dir" type="string" required="false" description="Directory for analysis coverage report output" />

  <!-- Step 0: Read Document Templates -->
  <task id="step0-read-templates" action="run-skill" description="Read document templates from templates directory">
    <run-skill skill="read-templates" template-path="../speccrew-knowledge-techs-generate/templates/" />
  </task>

  <!-- Step 1: Read Configuration Files -->
  <task id="step1-read-configs" action="read-files" description="Read primary configuration and convention files">
    <read-files files="{config_files}, {convention_files}" />
  </task>

  <!-- Step 2: Extract Technology Stack -->
  <task id="step2-extract-techstack" action="analyze" description="Parse configuration files to extract technology stack">
    <extract>
      <item name="core_framework" source="package.json|pom.xml|requirements.txt|pubspec.yaml|go.mod" />
      <item name="dependencies" source="dependencies section" />
      <item name="build_tools" source="devDependencies, scripts" />
    </extract>
  </task>

  <!-- Step 3: Analyze Conventions -->
  <task id="step3-analyze-conventions" action="analyze" description="Extract conventions from config files and analyze project structure">
    <analyze>
      <read file="speccrew-workspace/docs/rules/mermaid-rule.md" />
      <extract from="ESLint/Prettier configs" />
      <analyze-dir path="{source_path}" for="directory-conventions" />
    </analyze>
  </task>

  <!-- Step 4: UI Style Analysis (Frontend Platforms Only) -->
  <gateway id="step4-gateway" mode="exclusive" description="Check if platform is frontend">
    <condition test="platform_type in [web, mobile, desktop]">
      <task id="step4-ui-analyze" action="run-skill" description="Invoke UI style analysis skill">
        <run-skill skill="speccrew-knowledge-techs-ui-analyze" args="source_path={source_path};platform_id={platform_id};platform_type={platform_type};framework={framework};output_path={output_path}/ui-style/;language={language}" />
      </task>
    </condition>
    <fallback>
      <event action="log" message="UI style analysis skipped for backend platform" />
    </fallback>
  </gateway>

  <!-- Step 5: Generate Documents -->
  <task id="step5-generate-docs" action="generate" description="Generate all required documents using template fill workflow">
    <generate-docs template-path="../speccrew-knowledge-techs-generate/templates/" output-path="{output_path}">
      <doc name="INDEX.md" template="INDEX-TEMPLATE.md" />
      <doc name="tech-stack.md" template="TECH-STACK-TEMPLATE.md" />
      <doc name="architecture.md" template="ARCHITECTURE-TEMPLATE.md" />
      <doc name="conventions-design.md" template="CONVENTIONS-DESIGN-TEMPLATE.md" />
      <doc name="conventions-dev.md" template="CONVENTIONS-DEV-TEMPLATE.md" />
      <doc name="conventions-unit-test.md" template="CONVENTIONS-UNIT-TEST-TEMPLATE.md" />
      <doc name="conventions-system-test.md" template="CONVENTIONS-SYSTEM-TEST-TEMPLATE.md" />
      <doc name="conventions-build.md" template="CONVENTIONS-BUILD-TEMPLATE.md" />
    </generate-docs>
  </task>

  <!-- Step 5b: Generate conventions-data.md for Backend -->
  <gateway id="step5b-gateway" mode="exclusive" description="Check if data layer document needed">
    <condition test="platform_type == backend or data_layer_detected">
      <task id="step5b-generate-data" action="generate" description="Generate data layer conventions">
        <generate-doc template="CONVENTIONS-DATA-TEMPLATE.md" output="{output_path}/conventions-data.md" />
      </task>
    </condition>
  </gateway>

  <!-- Step 6: Write Output Files -->
  <task id="step6-write-output" action="write" description="Write all generated documents to output directory">
    <write-files to="{output_path}" />
  </task>

  <!-- Step 7: Generate Analysis Coverage Report -->
  <task id="step7-coverage-report" action="generate" description="Generate analysis coverage JSON report">
    <generate-report output="{completed_dir}/{platform_id}.analysis.json" format="json">
      <include name="topics_analysis" />
      <include name="config_files_analyzed" />
      <include name="source_dirs_scanned" />
      <include name="documents_generated" />
    </generate-report>
  </task>

  <!-- Step 8: Report Results -->
  <event id="step8-report" action="log" description="Report generation results">
    <report format="structured">
      Platform Technology Documents Generated: {platform_id}
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
      - Output Directory: {output_path}
    </report>
  </event>

  <!-- Output Block -->
  <output name="status" from="generation_status" />
  <output name="documents_generated" from="generated_files_list" />
  <output name="coverage_report" from="analysis_coverage" />

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
