---
name: speccrew-knowledge-techs-generate-quality-xml
description: Quality assurance for generated tech documentation using XML workflow blocks. Performs cross-validation, consistency checks, completeness verification, and generates quality reports.
tools: Read, Write, Glob, Grep, Bash
---

# Tech Documentation Quality Assurance (XML Workflow)

Perform comprehensive quality checks on generated technology documentation to ensure completeness, consistency, and accuracy using XML workflow blocks.

## Role Definition

You are a Technical Documentation Quality Assurance Specialist. Your role is to verify that generated tech documentation meets quality standards by performing:

- **Completeness Verification**: Ensure all required documents and sections exist
- **Cross-Validation**: Verify dependencies and references are consistent
- **Consistency Checks**: Ensure naming conventions and style are uniform
- **Source Traceability**: Verify all claims are properly sourced
- **Mermaid Compatibility**: Ensure diagrams render correctly

## Trigger Scenarios

- "Verify tech documentation quality for {platform}"
- "Run quality checks on generated docs"
- "Validate platform tech docs"
- "Check documentation completeness"

## User

Worker Agent (speccrew-task-worker)

---

## XML Workflow Definition

<workflow id="techs-quality-check" status="pending" version="1.0" desc="Quality assurance for tech documentation">
  > **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="Quality check input parameters">
    <field name="platform_dir" required="true" type="string" desc="Path to platform's techs directory (e.g., speccrew-workspace/knowledges/techs/{platform_id}/)"/>
    <field name="platform_id" required="true" type="string" desc="Target platform identifier (e.g., web-react, backend-nestjs)"/>
    <field name="platform_type" required="true" type="string" desc="Platform type (web, mobile, backend, desktop)"/>
    <field name="source_path" required="true" type="string" desc="Original source code path for cross-validation"/>
    <field name="analysis_report_path" required="false" type="string" default="{platform_dir}/{platform_id}.analysis.json" desc="Path to analysis.json for reference"/>
  </block>

  <!-- ============================================================
       Global Continuous Execution Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" between steps</field>
    <field name="text">DO NOT offer options like "Full execution / Sample execution / Pause" — always execute ALL steps to completion</field>
    <field name="text">DO NOT suggest "Let me split this into batches" or "Let's do this in parts" — process ALL items sequentially</field>
    <field name="text">DO NOT pause to list what you plan to do next — just do it</field>
    <field name="text">DO NOT ask for confirmation before generating output files</field>
    <field name="text">ONLY pause at explicit &lt;event action="confirm"&gt; blocks defined in the workflow</field>
  </block>

  <!-- ============================================================
       Global Technology Stack Constraints
       ============================================================ -->
  <block type="rule" id="GLOBAL-R-TECHSTACK" level="forbidden" desc="Technology stack constraints — NEVER violate">
    <field name="text">FORBIDDEN: Python, Ruby, Perl, compiled binaries, or any runtime requiring separate installation</field>
    <field name="text">PERMITTED scripting: PowerShell (Windows) and Bash (Linux/Mac) ONLY</field>
    <field name="text">PERMITTED Node.js: ONLY for existing project scripts</field>
    <field name="text">For JSON validation use: node -e "JSON.parse(require('fs').readFileSync('file.json','utf8'))"</field>
    <field name="text">DO NOT create temporary .py, .rb, .pl, .bat files — use inline commands via run_in_terminal</field>
  </block>

  <!-- ============================================================
       Pre-completion Validation Rule
       ============================================================ -->
  <block type="rule" id="PRE-COMPLETION-R1" level="mandatory" desc="Completion marker validation — MUST verify before writing done marker">
    <field name="text">MUST verify quality-report.json exists before writing quality-done.json marker</field>
    <field name="text">NEVER write completion marker with missing quality report</field>
  </block>

  <!-- ============================================================
       Step 1: Read Generated Documentation
       ============================================================ -->
  <block type="task" id="S1-B1" action="run-skill" status="pending" desc="Read all generated documentation files">
    <description>Read all generated documentation files in the platform directory</description>
    <required-documents>
      <file>{platform_dir}/INDEX.md</file>
      <file>{platform_dir}/tech-stack.md</file>
      <file>{platform_dir}/architecture.md</file>
      <file>{platform_dir}/conventions-design.md</file>
      <file>{platform_dir}/conventions-dev.md</file>
      <file>{platform_dir}/conventions-unit-test.md</file>
      <file>{platform_dir}/conventions-system-test.md</file>
      <file>{platform_dir}/conventions-build.md</file>
    </required-documents>
    <optional-documents>
      <file condition="backend OR has_data_layer">{platform_dir}/conventions-data.md</file>
      <file condition="frontend">{platform_dir}/ui-style/ui-style-guide.md</file>
    </optional-documents>
    <analysis-report>
      <file>{platform_id}.analysis.json</file>
    </analysis-report>
    <output var="documents_read"/>
    <record>
      <item>All files found</item>
      <item>File sizes</item>
    </record>
  </block>

  <block type="checkpoint" id="CP1" name="documents_read" desc="All documents read">
    <field name="verify" value="${documents_read.count} >= 8"/>
  </block>

  <!-- ============================================================
       Step 2: Completeness Check
       ============================================================ -->
  <block type="task" id="S2-B1" action="run-skill" status="pending" desc="Perform completeness check">
    <description>Verify all expected documents and sections exist</description>

    <!-- 2.1 Document Existence Check -->
    <subtask name="document_existence">
      <check table="platform_type">
        <row condition="all" required="INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md"/>
        <row condition="backend" additional="+ conventions-data.md"/>
        <row condition="web/mobile/desktop" additional="+ ui-style/ui-style-guide.md"/>
      </check>
    </subtask>

    <!-- 2.2 Section Completeness Check -->
    <subtask name="section_completeness">
      <document name="INDEX.md">
        <check-item>Platform summary</check-item>
        <check-item>Technology stack overview</check-item>
        <check-item>Navigation links to all convention documents</check-item>
        <check-item>Agent usage guide</check-item>
      </document>
      <document name="tech-stack.md">
        <check-item>Overview section</check-item>
        <check-item>Core Technologies table</check-item>
        <check-item>Dependencies section (grouped by category)</check-item>
        <check-item>Development Tools section</check-item>
        <check-item>Configuration Files list</check-item>
      </document>
      <document name="architecture.md">
        <check-item>Component/Module Architecture section</check-item>
        <check-item>State Management / Dependency Injection section</check-item>
        <check-item>API Integration / Module Organization section</check-item>
        <check-item>Styling Approach / Middleware section</check-item>
      </document>
      <document name="conventions-dev.md">
        <check-item>Naming Conventions section</check-item>
        <check-item>Directory Structure section</check-item>
        <check-item>Code Style section</check-item>
        <check-item>Import/Export Patterns section</check-item>
        <check-item>Pre-Development Checklist section</check-item>
      </document>
      <document name="conventions-build.md">
        <check-item>Build Tool &amp; Configuration section</check-item>
        <check-item>Environment Management section</check-item>
        <check-item>Build Profiles &amp; Outputs section</check-item>
      </document>
    </subtask>

    <!-- 2.3 Analysis Report Completeness -->
    <subtask name="analysis_report_completeness">
      <check file="{platform_id}.analysis.json">
        <check-item>platform_id field</check-item>
        <check-item>platform_type field</check-item>
        <check-item>analyzed_at timestamp</check-item>
        <check-item>topics object with all expected topics</check-item>
        <check-item>documents_generated array</check-item>
        <check-item>coverage_summary object</check-item>
      </check>
    </subtask>

    <output var="completeness_result"/>
  </block>

  <block type="event" id="E2" action="log" level="info" desc="Completeness check result">
Completeness check: ${completeness_result.documents_found}/${completeness_result.documents_expected} documents, ${completeness_result.sections_passed}/${completeness_result.sections_checked} sections
  </block>

  <block type="checkpoint" id="CP2" name="completeness_checked" desc="Completeness check complete">
    <field name="verify" value="${completeness_result.status} IN ['passed', 'partial']"/>
  </block>

  <!-- ============================================================
       Step 3: Cross-Validation
       ============================================================ -->
  <block type="task" id="S3-B1" action="run-skill" status="pending" desc="Perform cross-validation">
    <description>Verify information is consistent across documents and with source code</description>

    <!-- 3.1 Version Consistency Check -->
    <subtask name="version_consistency">
      <action>Read {source_path}/package.json</action>
      <check>Framework versions match documentation</check>
      <check>Key dependency versions match documentation</check>
      <check>Build tool versions match documentation</check>
      <output var="version_checks"/>
    </subtask>

    <!-- 3.2 Dependency Reference Consistency -->
    <subtask name="dependency_consistency">
      <check>Each dependency in tech-stack.md exists in package.json</check>
      <check>Version format is consistent</check>
      <output var="dependency_checks"/>
    </subtask>

    <!-- 3.3 Cross-Document Reference Check -->
    <subtask name="cross_document_references">
      <check>INDEX.md links to all other documents</check>
      <check condition="frontend">conventions-design.md references ui-style/ui-style-guide.md</check>
      <check>All documents have consistent platform_id references</check>
      <check>All documents have consistent platform_type references</check>
      <output var="reference_checks"/>
    </subtask>

    <!-- 3.4 Configuration File Reference Check -->
    <subtask name="config_file_references">
      <check>ESLint config path → file exists</check>
      <check>Prettier config path → file exists</check>
      <check>Build config path → file exists</check>
      <output var="config_checks"/>
    </subtask>

    <output var="cross_validation_result"/>
  </block>

  <block type="event" id="E3" action="log" level="info" desc="Cross-validation result">
Cross-validation: ${cross_validation_result.version_checks.passed}/${cross_validation_result.version_checks.total} version checks, ${cross_validation_result.reference_checks.passed}/${cross_validation_result.reference_checks.total} reference checks
  </block>

  <block type="checkpoint" id="CP3" name="cross_validation_complete" desc="Cross-validation complete">
    <field name="verify" value="true"/>
  </block>

  <!-- ============================================================
       Step 4: Consistency Check
       ============================================================ -->
  <block type="task" id="S4-B1" action="run-skill" status="pending" desc="Perform consistency check">
    <description>Verify naming conventions and style are uniform across all documents</description>

    <!-- 4.1 Naming Convention Consistency -->
    <subtask name="naming_conventions">
      <check>Component naming (PascalCase vs camelCase) matches conventions-dev.md</check>
      <check>File naming conventions match conventions-dev.md</check>
      <check>Variable naming conventions match conventions-dev.md</check>
      <output var="naming_issues"/>
    </subtask>

    <!-- 4.2 Platform Terminology Consistency -->
    <subtask name="terminology_consistency">
      <check>Platform identifier is consistent (e.g., web-react vs react-web)</check>
      <check>Framework name is consistent (e.g., React vs react)</check>
      <check>Language name is consistent (e.g., TypeScript vs Typescript)</check>
      <output var="terminology_issues"/>
    </subtask>

    <!-- 4.3 Code Style Consistency -->
    <subtask name="code_style_consistency">
      <check>Quote style matches conventions-dev.md (single vs double)</check>
      <check>Semicolon usage matches conventions-dev.md</check>
      <check>Indentation style matches conventions-dev.md</check>
      <output var="style_issues"/>
    </subtask>

    <!-- 4.4 UI Reference Consistency (Frontend Platforms) -->
    <block type="gateway" id="G4" mode="guard" test="${platform_type} IN ['web', 'mobile', 'desktop']" desc="Check UI reference for frontend platforms">
      <subtask name="ui_reference_consistency">
        <check>conventions-design.md contains reference to ui-style/ui-style-guide.md</check>
        <check>ui_style_analysis_level indicator exists</check>
        <output var="ui_reference_issues"/>
      </subtask>
    </block>

    <output var="consistency_result"/>
  </block>

  <block type="event" id="E4" action="log" level="info" desc="Consistency check result">
Consistency: ${consistency_result.status} - ${consistency_result.issues.length} issues found
  </block>

  <block type="checkpoint" id="CP4" name="consistency_checked" desc="Consistency check complete">
    <field name="verify" value="true"/>
  </block>

  <!-- ============================================================
       Step 5: Source Traceability Check
       ============================================================ -->
  <block type="task" id="S5-B1" action="run-skill" status="pending" desc="Perform source traceability check">
    <description>Verify all documents properly cite their sources</description>

    <!-- 5.1 File Reference Block Check -->
    <subtask name="file_reference_blocks">
      <loop over="documents" as="doc">
        <check>File reference block exists at document beginning</check>
        <check>Contains list of referenced files</check>
        <check>File paths use relative paths (NOT absolute or file://)</check>
      </loop>
      <output var="cite_block_checks"/>
    </subtask>

    <!-- 5.2 Diagram Source Annotation Check -->
    <subtask name="diagram_source_annotations">
      <loop over="mermaid_diagrams" as="diagram">
        <check>**Diagram Source** annotation exists after diagram</check>
        <check>Source file path is provided</check>
        <check>Path uses relative format</check>
      </loop>
      <output var="diagram_source_checks"/>
    </subtask>

    <!-- 5.3 Section Source Annotation Check -->
    <subtask name="section_source_annotations">
      <loop over="major_sections" as="section">
        <check>**Section Source** annotation exists at section end OR generic guidance note is present</check>
      </loop>
      <output var="section_source_checks"/>
    </subtask>

    <!-- 5.4 Path Format Validation -->
    <subtask name="path_format_validation">
      <check>No paths start with drive letter (e.g., d:/, C:\)</check>
      <check>No paths use file:// protocol</check>
      <check>Correct relative depth used (e.g., ../../../../ for 4 levels)</check>
      <output var="path_format_issues"/>
    </subtask>

    <output var="traceability_result"/>
  </block>

  <block type="event" id="E5" action="log" level="info" desc="Source traceability result">
Source Traceability: ${traceability_result.documents_with_cite_block}/${traceability_result.documents_total} documents with cite blocks, ${traceability_result.absolute_paths_found} absolute paths, ${traceability_result.file_protocol_found} file:// protocols
  </block>

  <block type="checkpoint" id="CP5" name="traceability_checked" desc="Source traceability check complete">
    <field name="verify" value="true"/>
  </block>

  <!-- ============================================================
       Step 6: Mermaid Compatibility Check
       ============================================================ -->
  <block type="task" id="S6-B1" action="run-skill" status="pending" desc="Perform Mermaid compatibility check">
    <description>Verify all Mermaid diagrams are compatible with standard rendering</description>

    <!-- 6.1 Forbidden Elements Check -->
    <subtask name="forbidden_elements">
      <loop over="mermaid_diagrams" as="diagram">
        <check>No `style` definitions</check>
        <check>No `direction` keyword</check>
        <check>No HTML tags (e.g., &lt;br/>, &lt;div>)</check>
        <check>No nested subgraphs</check>
      </loop>
      <output var="forbidden_element_issues"/>
    </subtask>

    <!-- 6.2 Syntax Validation -->
    <subtask name="syntax_validation">
      <loop over="mermaid_diagrams" as="diagram">
        <check>Valid diagram type declaration</check>
        <check>Properly closed brackets</check>
        <check>Valid node syntax</check>
      </loop>
      <output var="syntax_issues"/>
    </subtask>

    <!-- 6.3 Diagram Type Usage -->
    <subtask name="diagram_type_usage">
      <check condition="structure">Use graph TB/LR for structure diagrams</check>
      <check condition="process">Use flowchart TD for process diagrams</check>
      <check condition="api">Use sequenceDiagram for API diagrams</check>
      <output var="type_usage_issues"/>
    </subtask>

    <output var="mermaid_result"/>
  </block>

  <block type="event" id="E6" action="log" level="info" desc="Mermaid compatibility result">
Mermaid Compatibility: ${mermaid_result.diagrams_passed}/${mermaid_result.diagrams_checked} diagrams passed, ${mermaid_result.issues.length} issues found
  </block>

  <block type="checkpoint" id="CP6" name="mermaid_checked" desc="Mermaid compatibility check complete">
    <field name="verify" value="true"/>
  </block>

  <!-- ============================================================
       Step 7: Generate Quality Report
       ============================================================ -->
  <block type="task" id="S7-B1" action="run-script" status="pending" desc="Generate quality report JSON">
    <description>Generate comprehensive quality report in JSON format</description>
    <output-file>{platform_dir}/quality-report.json</output-file>
    <format>
{
  "platform_id": "{platform_id}",
  "platform_type": "{platform_type}",
  "checked_at": "{ISO 8601 timestamp}",
  "summary": {
    "total_checks": 35,
    "passed": 32,
    "warnings": 2,
    "failed": 1,
    "quality_score": 91
  },
  "completeness": {
    "status": "passed",
    "documents_expected": 8,
    "documents_found": 8,
    "documents_missing": [],
    "sections_checked": 24,
    "sections_passed": 24
  },
  "cross_validation": {
    "status": "passed",
    "version_checks": { "total": 5, "passed": 5, "mismatches": [] },
    "reference_checks": { "total": 12, "passed": 12, "broken_links": [] }
  },
  "consistency": {
    "status": "warning",
    "naming_issues": [],
    "terminology_issues": [],
    "style_issues": []
  },
  "source_traceability": {
    "status": "passed",
    "documents_with_cite_block": 8,
    "documents_missing_cite_block": 0,
    "absolute_paths_found": 0,
    "file_protocol_found": 0
  },
  "mermaid_compatibility": {
    "status": "failed|passed",
    "diagrams_checked": 5,
    "diagrams_passed": 4,
    "issues": []
  },
  "recommendations": []
}
    </format>
    <quality-score-calculation>
      <formula>quality_score = (passed / total_checks) * 100</formula>
      <warning-penalty>Warnings count as 0.5 towards failed</warning-penalty>
      <critical-penalty>Critical failures (missing required documents) deduct 10 points each</critical-penalty>
    </quality-score-calculation>
    <output var="quality_report"/>
  </block>

  <block type="checkpoint" id="CP7" name="quality_report_generated" desc="Quality report generated">
    <field name="verify" value="file_exists({platform_dir}/quality-report.json)"/>
  </block>

  <!-- ============================================================
       Step 8: Write Completion Marker
       ============================================================ -->
  <block type="task" id="S8-B1" action="run-script" status="pending" desc="Write completion marker">
    <description>Create completion marker file to signal quality check completion</description>
    <validation>
      <rule level="mandatory">Verify quality-report.json exists before writing marker</rule>
    </validation>
    <output-file>{platform_dir}/quality-done.json</output-file>
    <format>
{
  "platform_id": "{platform_id}",
  "status": "completed",
  "quality_score": {calculated_score},
  "report_path": "quality-report.json",
  "completed_at": "{ISO 8601 timestamp}"
}
    </format>
    <status-values>
      <value name="completed">Quality check finished successfully</value>
      <value name="failed">Critical error during quality check</value>
    </status-values>
    <output var="completion_marker"/>
  </block>

  <block type="event" id="E8" action="log" level="info" desc="Quality check complete">
Quality check complete for {platform_id}
- Total Checks: ${quality_report.summary.total_checks}
- Passed: ${quality_report.summary.passed}
- Warnings: ${quality_report.summary.warnings}
- Failed: ${quality_report.summary.failed}
- Quality Score: ${quality_report.summary.quality_score}%

## Status by Category
- Completeness: ${quality_report.completeness.status}
- Cross-Validation: ${quality_report.cross_validation.status}
- Consistency: ${quality_report.consistency.status}
- Source Traceability: ${quality_report.source_traceability.status}
- Mermaid Compatibility: ${quality_report.mermaid_compatibility.status}
  </block>

  <!-- ============================================================
       Output Results
       ============================================================ -->
  <block type="output" id="O1" desc="Quality check results">
    <field name="platform_id" from="${platform_id}" type="string"/>
    <field name="status" value="completed"/>
    <field name="quality_score" from="${quality_report.summary.quality_score}" type="number"/>
    <field name="quality_report" from="${platform_dir}/quality-report.json" type="string"/>
    <field name="completion_marker" from="${platform_dir}/quality-done.json" type="string"/>
    <field name="summary">
      <total_checks from="${quality_report.summary.total_checks}"/>
      <passed from="${quality_report.summary.passed}"/>
      <warnings from="${quality_report.summary.warnings}"/>
      <failed from="${quality_report.summary.failed}"/>
    </field>
  </block>

  <!-- ============================================================
       Error Handling
       ============================================================ -->
  <block type="error-handler" id="EH1" desc="Global error handling">
    <try>
      <!-- Main workflow defined in steps above -->
    </try>
    <catch on="platform_dir_not_found">
      <block type="event" id="EH1-E1" action="log" level="error" desc="Platform directory not found">
Platform directory not found: {platform_dir}
      </block>
      <block type="output" id="EH1-O1">
        <field name="status" value="failed"/>
        <field name="error" value="Platform directory not found"/>
      </block>
    </catch>
    <catch on="required_document_missing">
      <block type="event" id="EH1-E2" action="log" level="warn" desc="Required document missing">
Required document missing: {missing_document}
      </block>
      <field name="continue" value="true"/>
      <field name="record_in" value="completeness.documents_missing"/>
    </catch>
    <catch on="analysis_report_missing">
      <block type="event" id="EH1-E3" action="log" level="warn" desc="Analysis report missing">
Analysis report missing, skipping cross-validation with source
      </block>
      <field name="continue" value="true"/>
    </catch>
    <catch on="mermaid_parsing_error">
      <block type="event" id="EH1-E4" action="log" level="warn" desc="Mermaid parsing error">
Mermaid parsing error in {diagram_location}
      </block>
      <field name="continue" value="true"/>
      <field name="record_in" value="mermaid_compatibility.issues"/>
    </catch>
  </block>

</workflow>

---

## Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| platform_dir | Yes | Path to platform's techs directory containing generated docs (e.g., `speccrew-workspace/knowledges/techs/{platform_id}/`) |
| platform_id | Yes | Target platform identifier (e.g., "web-react", "backend-nestjs") |
| platform_type | Yes | Platform type (web, mobile, backend, desktop) |
| source_path | Yes | Original source code path for cross-validation |
| analysis_report_path | No | Path to analysis.json for reference (default: `{platform_dir}/{platform_id}.analysis.json`) |

---

## Output Files

- Quality Report: `{platform_dir}/quality-report.json`
- Completion Marker: `{platform_dir}/quality-done.json`
- Console summary of check results

---

## Quality Thresholds

| Score | Status |
|-------|--------|
| 90-100 | EXCELLENT |
| 80-89 | GOOD |
| 70-79 | ACCEPTABLE |
| 60-69 | NEEDS_IMPROVEMENT |
| 0-59 | FAILED |

---

## Constraints

1. **Read-Only Source Access**: Only READ from source_path, never modify
2. **Relative Paths Only**: All file references must use relative paths
3. **JSON Output Only**: Quality report must be valid JSON
4. **Complete All Steps**: Must complete all 8 steps even if early failures are found
5. **Detailed Issue Reporting**: Include file paths and line numbers for issues when possible

---

## Error Handling

| Error Type | Action |
|------------|--------|
| Platform directory not found | Report error, terminate with failed status |
| Required document missing | Record in completeness check, continue |
| Analysis report missing | Skip cross-validation with source, continue |
| Mermaid parsing error | Record in compatibility check, continue |

---

## Task Completion Report

Upon completion, return the following:

```
TASK COMPLETED: speccrew-knowledge-techs-generate-quality-xml

## Input Parameters
- platform_id: {platform_id}
- platform_dir: {platform_dir}
- source_path: {source_path}

## Quality Summary
- Total Checks: {total}
- Passed: {passed}
- Warnings: {warnings}
- Failed: {failed}
- Quality Score: {score}%

## Status by Category
- Completeness: {status}
- Cross-Validation: {status}
- Consistency: {status}
- Source Traceability: {status}
- Mermaid Compatibility: {status}

## Output
- Quality Report: {platform_dir}/quality-report.json

## Recommendations
{list of recommendations if any}
```

---

## Integration Notes

This skill is designed to be invoked after `speccrew-knowledge-techs-generate` completes. The quality report can be used by:

- `techs-dispatch` to determine if re-generation is needed
- Development teams to identify documentation issues
- CI/CD pipelines to enforce documentation quality gates

---

## CONTINUOUS EXECUTION RULES

This skill MUST execute all steps continuously without unnecessary interruptions.

### FORBIDDEN Interruptions

1. DO NOT ask user "Should I continue?" after completing a step
2. DO NOT suggest "Let me split this into batches" or "Let's do this in parts"
3. DO NOT pause to list what you plan to do next — just do it
4. DO NOT ask for confirmation before generating output files
5. DO NOT warn about "large number of files" — proceed with generation
6. DO NOT offer "Should I proceed with the remaining items?"
7. DO NOT present options like "Full execution / Sample execution / Pause"

### When to Pause (ONLY these cases)

1. Explicit `<event action="confirm">` blocks in the workflow
2. Ambiguous requirements that genuinely need clarification
3. Unrecoverable errors that prevent further progress
4. Security-sensitive operations (e.g., deleting existing files)

### Execution Behavior

- When multiple checks need to be performed, execute ALL of them sequentially without asking
- Continue execution even if individual checks fail — record failures and proceed
- NEVER voluntarily stop mid-process to ask if user wants to continue
