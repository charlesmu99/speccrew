---
name: speccrew-knowledge-techs-generate-ui-style-xml
description: Generate UI style analysis documents for a specific frontend platform using XML workflow blocks. Analyzes page types, components, layouts, and styling conventions from source code. Only applicable to frontend platforms (web, mobile, desktop).
tools: Read, Write, Glob, Grep, Skill
---

# Stage 2: Generate Platform UI Style Documents (XML Workflow)

Generate comprehensive UI style documentation for a specific frontend platform by analyzing its source code structure, components, and styling patterns using XML workflow blocks.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and generate content accordingly.

- User writes in 中文 → Generate Chinese documents, use `language: "zh"`
- User writes in English → Generate English documents, use `language: "en"`
- Other languages → Use the specified language code

## Prerequisite

This skill ONLY applies to frontend platforms. The dispatcher MUST check platform_type before invoking:

- `web` → Execute this skill
- `mobile` → Execute this skill
- `desktop` → Execute this skill
- `backend` → DO NOT invoke this skill
- `api` → DO NOT invoke this skill

## Trigger Scenarios

- "Generate UI style documents for {platform}"
- "Analyze UI components and layouts"
- "Extract design system from {platform}"

## User

Worker Agent (speccrew-task-worker)

---

## XML Workflow Definition

<workflow id="techs-ui-style-generate" status="pending" version="1.0" desc="Generate UI style documents for frontend platform">
  > **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="UI style generation input parameters">
    <field name="platform_id" required="true" type="string" desc="Platform identifier (e.g., web-react, mobile-uniapp)"/>
    <field name="platform_type" required="true" type="string" desc="Platform type (web, mobile, desktop)"/>
    <field name="framework" required="true" type="string" desc="Primary framework (react, vue, angular, uniapp, flutter, etc.)"/>
    <field name="source_path" required="true" type="string" desc="Platform source directory"/>
    <field name="output_path" required="true" type="string" desc="Output directory (e.g., speccrew-workspace/knowledges/techs/{platform_id}/)"/>
    <field name="language" required="true" type="string" desc="Target language (zh, en)"/>
    <field name="completed_dir" required="false" type="string" desc="Directory for completion marker and analysis report"/>
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
    <field name="text">MUST verify ALL required output files exist before writing .done-ui-style.json marker</field>
    <field name="text">Required files: ui-style-guide.md, page-types/page-type-summary.md, components/component-library.md, layouts/page-layouts.md, styles/color-system.md</field>
    <field name="text">If ANY required file is missing, generate it BEFORE writing completion marker</field>
    <field name="text">NEVER write completion marker with missing required files</field>
  </block>

  <!-- ============================================================
       Gateway: Platform Type Validation
       ============================================================ -->
  <block type="gateway" id="G0" mode="exclusive" desc="Check platform type eligibility">
    <branch test="${platform_type} NOT IN ['web', 'mobile', 'desktop']" name="Skip non-frontend platform">
      <block type="event" id="E0-Skip" action="log" level="warn" desc="Log skip reason">
Skipping UI style generation: {platform_type} is not a frontend platform
      </block>
      <block type="output" id="O-Skip" desc="Skip result">
        <field name="status" value="skipped"/>
        <field name="reason" value="Not a frontend platform"/>
      </block>
    </branch>
    <branch test="${platform_type} IN ['web', 'mobile', 'desktop']" name="Process frontend platform">

      <!-- ============================================================
           Step 0: Read UI Style Templates
           ============================================================ -->
      <block type="task" id="S0-B1" action="run-skill" status="pending" desc="Read UI style template files">
        <description>Read all UI style template files to understand the required content structure</description>
        <template-files>
          <file>../speccrew-knowledge-techs-generate-ui-style/templates/COMPONENT-LIBRARY-TEMPLATE.md</file>
          <file>../speccrew-knowledge-techs-generate-ui-style/templates/PAGE-LAYOUTS-TEMPLATE.md</file>
          <file>../speccrew-knowledge-techs-generate-ui-style/templates/PAGE-TYPE-SUMMARY-TEMPLATE.md</file>
          <file>../speccrew-knowledge-techs-generate-ui-style/templates/COLOR-SYSTEM-TEMPLATE.md</file>
        </template-files>
        <purpose>Understand template structure for fallback path copy+fill workflow</purpose>
        <output var="templates_loaded"/>
      </block>

      <block type="checkpoint" id="CP0" name="templates_read" desc="Templates read successfully">
        <field name="verify" value="${templates_loaded} == true"/>
      </block>

      <!-- ============================================================
           Step 1: UI Style Analysis
           ============================================================ -->
      <block type="rule" id="S1-R1" level="mandatory" desc="Directory ownership rules">
        <field name="text">ui-style/ is fully managed by techs pipeline (this skill)</field>
        <field name="text">ui-style-patterns/ is managed by bizs pipeline — NOT created by this skill</field>
      </block>

      <!-- Gateway: Choose Analysis Path -->
      <block type="gateway" id="G1" mode="exclusive" desc="Determine analysis path">
        <branch test="${ui_analyzer_available} == true" name="Primary Path - UI Analyzer Available">

          <!-- Step 1.1: Invoke UI Analyzer Skill -->
          <block type="task" id="S1-B1a" action="run-skill" status="pending" desc="Invoke UI analyzer skill">
            <description>CRITICAL: Use Skill tool to invoke speccrew-knowledge-techs-ui-analyze</description>
            <skill>speccrew-knowledge-techs-ui-analyze</skill>
            <parameters>
              source_path={source_path}
              platform_id={platform_id}
              platform_type={platform_type}
              framework={framework}
              output_path={output_path}/ui-style/
              language={language}
            </parameters>
            <output var="ui_analyze_result"/>
          </block>

          <!-- Verify Primary Path Output -->
          <block type="task" id="S1-B1b" action="run-script" status="pending" desc="Verify UI analyzer output files">
            <description>Wait for completion and verify output files exist</description>
            <required-files>
              <file>{output_path}/ui-style/ui-style-guide.md</file>
              <file>{output_path}/ui-style/page-types/page-type-summary.md</file>
              <file>{output_path}/ui-style/components/component-library.md</file>
              <file>{output_path}/ui-style/layouts/page-layouts.md</file>
              <file>{output_path}/ui-style/styles/color-system.md</file>
            </required-files>
            <output var="primary_output_verified"/>
          </block>

          <block type="gateway" id="G1a" mode="guard" test="${primary_output_verified} == true" fail-action="fallback" desc="Check primary path success">
            <field name="fallback_target" value="secondary_path"/>
            <field name="message">Primary path failed, falling back to secondary path</field>
          </block>

          <block type="event" id="E1a" action="log" level="info" desc="Record analysis level">
Primary path succeeded. ui_analysis_level = "full"
          </block>

          <field name="ui_analysis_level" value="full"/>

        </branch>
        <branch test="${ui_analyzer_available} == false OR ${primary_output_verified} == false" name="Secondary Path - Template Fill">

          <!-- Step 1.2: Secondary Path - Create Directory Structure -->
          <block type="task" id="S1-B2a" action="run-script" status="pending" desc="Create ui-style directory structure">
            <description>Create all required directories for UI style output</description>
            <create-directories>
              <path>{output_path}/ui-style/</path>
              <path>{output_path}/ui-style/page-types/</path>
              <path>{output_path}/ui-style/components/</path>
              <path>{output_path}/ui-style/layouts/</path>
              <path>{output_path}/ui-style/styles/</path>
            </create-directories>
          </block>

          <!-- Step 1.2.1: Generate ui-style-guide.md -->
          <block type="task" id="S1-B2b" action="run-skill" status="pending" desc="Generate minimal ui-style-guide.md">
            <description>Manually scan source code and generate ui-style-guide.md</description>
            <scan-directories>
              <dir>{source_path}/src/styles/</dir>
              <dir>{source_path}/src/theme/</dir>
              <dir>{source_path}/src/components/</dir>
              <dir>{source_path}/src/pages/</dir>
              <dir>{source_path}/src/views/</dir>
            </scan-directories>
            <extract>
              <item>Design system: identify UI framework from dependencies</item>
              <item>Color system: scan CSS variables, theme files</item>
              <item>Typography: scan font-family declarations</item>
              <item>Component library: list component directories</item>
              <item>Page types: list page directories/files</item>
            </extract>
            <output-file>{output_path}/ui-style/ui-style-guide.md</output-file>
            <note>If automated analysis unavailable, use reference-only format</note>
          </block>

          <!-- Step 1.2.2: Copy and Fill Templates -->
          <block type="task" id="S1-B2c" action="run-skill" status="pending" desc="Copy template and fill component-library.md">
            <description>Copy COMPONENT-LIBRARY-TEMPLATE.md and fill with search_replace</description>
            <template-source>../speccrew-knowledge-techs-generate-ui-style/templates/COMPONENT-LIBRARY-TEMPLATE.md</template-source>
            <output-file>{output_path}/ui-style/components/component-library.md</output-file>
            <constraints>
              <rule level="forbidden">Using create_file to write entire document</rule>
              <rule level="mandatory">Use search_replace to fill each section</rule>
              <rule level="mandatory">Include props tables for top 5 components</rule>
            </constraints>
            <fill-sections>COMPONENT_CATEGORIES, API_REFERENCE, COMPOSITION_PATTERNS, AGENT_GUIDE</fill-sections>
          </block>

          <block type="task" id="S1-B2d" action="run-skill" status="pending" desc="Copy template and fill page-layouts.md">
            <description>Copy PAGE-LAYOUTS-TEMPLATE.md and fill with search_replace</description>
            <template-source>../speccrew-knowledge-techs-generate-ui-style/templates/PAGE-LAYOUTS-TEMPLATE.md</template-source>
            <output-file>{output_path}/ui-style/layouts/page-layouts.md</output-file>
            <fill-sections>LAYOUT_TYPES, LAYOUT_DETAILS, NAVIGATION</fill-sections>
          </block>

          <block type="task" id="S1-B2e" action="run-skill" status="pending" desc="Copy template and fill page-type-summary.md">
            <description>Copy PAGE-TYPE-SUMMARY-TEMPLATE.md and fill with search_replace</description>
            <template-source>../speccrew-knowledge-techs-generate-ui-style/templates/PAGE-TYPE-SUMMARY-TEMPLATE.md</template-source>
            <output-file>{output_path}/ui-style/page-types/page-type-summary.md</output-file>
            <fill-sections>PAGE_TYPES, PAGE_TYPE_DETAILS, ROUTING</fill-sections>
          </block>

          <block type="task" id="S1-B2f" action="run-skill" status="pending" desc="Copy template and fill color-system.md">
            <description>Copy COLOR-SYSTEM-TEMPLATE.md and fill with search_replace</description>
            <template-source>../speccrew-knowledge-techs-generate-ui-style/templates/COLOR-SYSTEM-TEMPLATE.md</template-source>
            <output-file>{output_path}/ui-style/styles/color-system.md</output-file>
            <fill-sections>THEME_COLORS, FUNCTIONAL_COLORS, SEMANTIC_TOKENS, TYPOGRAPHY, SPACING</fill-sections>
          </block>

          <!-- Self-Verification -->
          <block type="task" id="S1-B2g" action="run-script" status="pending" desc="Verify all mandatory files exist">
            <description>Self-verification checklist - MUST complete before proceeding</description>
            <checklist>
              <item verify="exists">{output_path}/ui-style/ui-style-guide.md</item>
              <item verify="exists">{output_path}/ui-style/page-types/page-type-summary.md</item>
              <item verify="exists">{output_path}/ui-style/components/component-library.md</item>
              <item verify="exists">{output_path}/ui-style/layouts/page-layouts.md</item>
              <item verify="exists">{output_path}/ui-style/styles/color-system.md</item>
            </checklist>
            <on-fail>Generate missing file before proceeding</on-fail>
            <output var="secondary_verification"/>
          </block>

          <block type="event" id="E1b" action="log" level="info" desc="Record analysis level">
Secondary path completed. ui_analysis_level = "minimal"
          </block>

          <field name="ui_analysis_level" value="minimal"/>

        </branch>
        <branch test="${source_structure_non_standard} == true" name="Tertiary Path - Reference Only">

          <!-- Step 1.3: Tertiary Path - Reference Only -->
          <block type="task" id="S1-B3a" action="run-skill" status="pending" desc="Generate reference-only ui-style-guide.md">
            <description>Create ui-style-guide.md with references only when analysis is not possible</description>
            <output-file>{output_path}/ui-style/ui-style-guide.md</output-file>
            <content>
# UI Style Guide - {platform_id}

> Note: Automated and manual UI analysis were not possible for this platform.
> Manual inspection of source code is required.

## References
- Source components: {source_path}/src/components/ (if exists)
- Source pages: {source_path}/src/pages/ (if exists)
- Style files: {source_path}/src/styles/ (if exists)
- Package dependencies: {source_path}/package.json
            </content>
          </block>

          <block type="event" id="E1c" action="log" level="info" desc="Record analysis level">
Tertiary path completed. ui_analysis_level = "reference_only"
          </block>

          <field name="ui_analysis_level" value="reference_only"/>

        </branch>
      </block>

      <block type="checkpoint" id="CP1" name="ui_style_analysis_complete" desc="UI style analysis complete">
        <field name="verify" value="${ui_analysis_level} IN ['full', 'minimal', 'reference_only']"/>
      </block>

      <!-- ============================================================
           Step 2: Write Output Files
           ============================================================ -->
      <block type="task" id="S2-B1" action="run-script" status="pending" desc="Ensure output directories exist">
        <description>Create output directory structure if not exists</description>
        <create-directories>
          <path>{output_path}/ui-style/</path>
          <path>{output_path}/ui-style/page-types/</path>
          <path>{output_path}/ui-style/components/</path>
          <path>{output_path}/ui-style/layouts/</path>
          <path>{output_path}/ui-style/styles/</path>
        </create-directories>
      </block>

      <block type="event" id="E2" action="log" level="info" desc="Output files written">
All UI style documents written to {output_path}/ui-style/
      </block>

      <block type="checkpoint" id="CP2" name="output_files_written" desc="Output files written">
        <field name="verify" value="file_exists({output_path}/ui-style/ui-style-guide.md)"/>
      </block>

      <!-- ============================================================
           Step 3: Generate Analysis Report
           ============================================================ -->
      <block type="task" id="S3-B1" action="run-script" status="pending" desc="Generate analysis report JSON">
        <description>Generate analysis report with topic coverage details</description>
        <output-file>{completed_dir}/{platform_id}.analysis-ui-style.json</output-file>
        <format>
{
  "platform_id": "{platform_id}",
  "platform_type": "{platform_type}",
  "worker_type": "ui-style",
  "analyzed_at": "{ISO 8601 timestamp}",
  "ui_analysis_level": "{ui_analysis_level}",
  "topics": {
    "page_types": { "status": "found|not_found|partial", "count": N, "files_analyzed": [...] },
    "components": { "status": "found|not_found|partial", "count": N, "files_analyzed": [...] },
    "layouts": { "status": "found|not_found|partial", "count": N, "files_analyzed": [...] },
    "styles": { "status": "found|not_found|partial", "files_analyzed": [...] }
  },
  "documents_generated": [...],
  "source_dirs_scanned": [...],
  "coverage_summary": { "total_topics": 4, "found": N, "not_found": N, "partial": N, "coverage_percent": N }
}
        </format>
        <output var="analysis_report"/>
      </block>

      <block type="checkpoint" id="CP3" name="analysis_report_generated" desc="Analysis report generated">
        <field name="verify" value="file_exists({completed_dir}/{platform_id}.analysis-ui-style.json)"/>
      </block>

      <!-- ============================================================
           Step 4: Report Results
           ============================================================ -->
      <block type="task" id="S4-B1" action="run-script" status="pending" desc="Generate completion marker">
        <description>Create completion marker file after verifying all required files</description>
        <validation>
          <rule level="mandatory">Verify all required files exist before writing marker</rule>
          <required-files>
            <file>{output_path}/ui-style/ui-style-guide.md</file>
            <file>{output_path}/ui-style/page-types/page-type-summary.md</file>
            <file>{output_path}/ui-style/components/component-library.md</file>
            <file>{output_path}/ui-style/layouts/page-layouts.md</file>
            <file>{output_path}/ui-style/styles/color-system.md</file>
          </required-files>
        </validation>
        <output-file>{completed_dir}/{platform_id}.done-ui-style.json</output-file>
        <format>
{
  "platform_id": "{platform_id}",
  "worker_type": "ui-style",
  "status": "completed",
  "ui_analysis_level": "{ui_analysis_level}",
  "documents_generated": [...],
  "analysis_file": "{platform_id}.analysis-ui-style.json",
  "completed_at": "{ISO timestamp}"
}
        </format>
        <output var="completion_marker"/>
      </block>

      <block type="event" id="E4" action="log" level="info" desc="Report completion">
Platform UI Style Documents Generated: {platform_id}
- ui-style-guide.md: ✓ (analysis level: {ui_analysis_level})
- page-types/page-type-summary.md: ✓
- components/component-library.md: ✓
- layouts/page-layouts.md: ✓
- styles/color-system.md: ✓
- Output Directory: {output_path}/ui-style/
- Analysis Report: {completed_dir}/{platform_id}.analysis-ui-style.json
- Completion Marker: {completed_dir}/{platform_id}.done-ui-style.json
      </block>

      <!-- ============================================================
           Output Results
           ============================================================ -->
      <block type="output" id="O1" desc="UI style generation results">
        <field name="platform_id" from="${platform_id}" type="string"/>
        <field name="status" value="completed"/>
        <field name="ui_analysis_level" from="${ui_analysis_level}" type="string"/>
        <field name="output_directory" from="${output_path}/ui-style/" type="string"/>
        <field name="documents_generated" type="array">
          <item>ui-style-guide.md</item>
          <item>page-types/page-type-summary.md</item>
          <item>components/component-library.md</item>
          <item>layouts/page-layouts.md</item>
          <item>styles/color-system.md</item>
        </field>
        <field name="analysis_report" from="${completed_dir}/{platform_id}.analysis-ui-style.json" type="string"/>
        <field name="completion_marker" from="${completed_dir}/{platform_id}.done-ui-style.json" type="string"/>
      </block>

    </branch>
  </block>

  <!-- ============================================================
       Error Handling
       ============================================================ -->
  <block type="error-handler" id="EH1" desc="Global error handling">
    <try>
      <!-- Main workflow defined in branches above -->
    </try>
    <catch on="skill_invocation_failed">
      <block type="event" id="EH1-E1" action="log" level="warn" desc="Skill invocation failed">
UI analyzer skill invocation failed, falling back to secondary path
      </block>
    </catch>
    <catch on="output_write_failed">
      <block type="event" id="EH1-E2" action="log" level="error" desc="Output write failed">
Failed to write output files: {error.message}
      </block>
    </catch>
  </block>

</workflow>

---

## Output Directory Structure

```
{output_path}/
└── ui-style/
    ├── ui-style-guide.md              # Main UI style guide (Required)
    ├── page-types/
    │   ├── page-type-summary.md       # Page type overview (Required)
    │   └── [type]-pages.md            # Per-type detail (Dynamic)
    ├── components/
    │   ├── component-library.md       # Component catalog (Required)
    │   ├── common-components.md       # Common components (Required)
    │   ├── business-components.md     # Business components (Required)
    │   └── {component-name}.md        # Per-component detail (Dynamic)
    ├── layouts/
    │   ├── page-layouts.md            # Layout patterns (Required)
    │   ├── navigation-patterns.md     # Navigation patterns (Required)
    │   └── {layout-name}-layout.md    # Per-layout detail (Dynamic)
    └── styles/
        ├── color-system.md            # Color system (Required)
        ├── typography.md              # Typography (Required)
        └── spacing-system.md          # Spacing system (Required)
```

## Directory Ownership

- `ui-style/` — Fully managed by this skill (techs pipeline)
  - Contains: ui-style-guide.md, styles/, page-types/, components/, layouts/
  - Source: Framework-level design system analysis from source code
- `ui-style-patterns/` — Managed by bizs pipeline (Stage 3.5: bizs-ui-style-extract)
  - Contains: Business pattern aggregation from feature documents
  - NOT created or written by this skill
  - May not exist if bizs pipeline has not been executed

---

## Quality Requirements

- ui-style-guide.md MUST have substantial content (not just template placeholders)
- At least 5 mandatory files MUST exist (see Self-Verification Checklist)
- Analysis report MUST honestly reflect coverage level
- All paths in documents MUST be relative (never absolute or file:// protocol)

---

## Error Handling

| Error Type | Action |
|------------|--------|
| Platform type is backend/api | Skip execution, return skipped status |
| UI analyzer skill invocation fails | Execute Secondary Path (template fill) |
| Source code structure is non-standard | Execute Tertiary Path (reference only) |
| Template not found | Use default structure, log warning |
| Any path MUST output the done file and analysis file | Never report "completed" with missing mandatory files |

---

## Task Completion Report

Upon completion, return the following structured report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-knowledge-techs-generate-ui-style-xml",
  "output_files": [
    "{output_path}/ui-style/ui-style-guide.md",
    "{output_path}/ui-style/page-types/page-type-summary.md",
    "{output_path}/ui-style/components/component-library.md",
    "{output_path}/ui-style/layouts/page-layouts.md",
    "{output_path}/ui-style/styles/color-system.md",
    "{completed_dir}/{platform_id}.analysis-ui-style.json",
    "{completed_dir}/{platform_id}.done-ui-style.json"
  ],
  "summary": "UI style documents generated for {platform_id} at {ui_analysis_level} analysis level",
  "metrics": {
    "components_documented": 0,
    "style_patterns_captured": 0,
    "design_tokens_extracted": 0
  },
  "errors": [],
  "next_steps": [
    "Review ui-style-guide.md for design system completeness",
    "Coordinate with bizs-ui-style-extract for business pattern integration"
  ]
}
```

---

## Checklist

### Pre-Generation
- [ ] Platform type verified (web/mobile/desktop only)
- [ ] Template files read and understood
- [ ] Source directory structure scanned

### UI Style Analysis
- [ ] `speccrew-knowledge-techs-ui-analyze` skill invoked (Primary Path)
- [ ] If Primary Path failed → Secondary Path executed
- [ ] If Secondary Path failed → Tertiary Path executed
- [ ] All mandatory files created per Self-Verification Checklist

### Output Verification
- [ ] ui-style/ui-style-guide.md exists and has content
- [ ] ui-style/page-types/page-type-summary.md exists and has content
- [ ] ui-style/components/component-library.md exists and has content
- [ ] ui-style/layouts/page-layouts.md exists and has content
- [ ] ui-style/styles/color-system.md exists and has content

### Reporting
- [ ] Analysis report generated: `{platform_id}.analysis-ui-style.json`
- [ ] Completion marker generated: `{platform_id}.done-ui-style.json`
- [ ] Console output reported with correct status

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

- When multiple templates need filling, process ALL of them sequentially without asking
- Use checkpoint files to track progress, enabling resumption if interrupted
- If context window is approaching limit, save progress and inform user how to resume
- NEVER voluntarily stop mid-process to ask if user wants to continue
