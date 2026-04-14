---
name: speccrew-knowledge-system-summarize-xml
description: Generate complete system-overview.md by reading all {{module_name}}-overview.md files using XML workflow blocks. Aggregates module information, builds dependency graph, and creates system-level documentation.
tools: Read, Write, Glob, Skill
---

# System Summarize - Complete System Overview (XML Workflow)

Read all {{module_name}}-overview.md files, aggregate information to generate complete system-overview.md with module index, topology, and business flows.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (system description, module summaries, flow descriptions) must be in the target language only.**

## Trigger Scenarios

- "Generate system overview from modules"
- "Complete system documentation"
- "Summarize all modules into system view"

## User

Worker Agent (speccrew-task-worker)

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `modules_path` | string | Yes | Path to modules directory (e.g., `speccrew-workspace/knowledges/bizs/`) containing all {{platform_type}}/{{module_name}}/{{module_name}}-overview.md files |
| `output_path` | string | Yes | Output path for system-overview.md (e.g., `speccrew-workspace/knowledges/bizs/`) |
| `language` | string | Yes | Target language for generated content (e.g., "zh", "en") |

## Output

| Output | Path | Description |
|--------|------|-------------|
| `system-overview.md` | `{{output_path}}/system-overview.md` | Complete system overview. Example: `speccrew-workspace/knowledges/bizs/system-overview.md` |

## Workflow

```mermaid
flowchart TD
    Start([Start]) --> Step0[Step 0: Read System Overview Template]
    Step0 --> Step1[Step 1: Discover All Modules]
    Step1 --> Step2[Step 2: Read All Module Overviews]
    Step2 --> Step3[Step 3: Build Module Index]
    Step3 --> Step4[Step 4: Build Dependency Graph]
    Step4 --> Step5[Step 5: Identify Business Domains]
    Step5 --> Step6[Step 6: Identify End-to-End Flows]
    Step6 --> Step7[Step 7: Generate system-overview.md]
    Step7 --> Step8[Step 8: Report Results]
    Step8 --> End([End])
```

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
  <!-- Input Block: Define workflow inputs -->
  <input name="modules_path" type="string" required="true" />
  <input name="output_path" type="string" required="true" />
  <input name="language" type="string" required="true" />

  <!-- Prerequisites Verification -->
  <event action="log" level="info">Starting system summarization workflow</event>

  <!-- Edge Case Rules -->
  <rule level="note">Empty modules directory: Generate skeleton with warning status if no *-overview.md files found</rule>
  <rule level="note">Incomplete module overviews: Use available data and mark gaps with <!-- DATA INCOMPLETE --></rule>
  <rule level="note">Same module name from different platforms: Treat as separate modules with platform annotation</rule>

  <!-- Step 0: Read System Overview Template -->
  <task name="read_template" action="run-skill" skill="Read">
    <param name="file_path">../speccrew-knowledge-system-summarize/templates/SYSTEM-OVERVIEW-TEMPLATE.md</param>
    <output name="template_content" />
  </task>

  <!-- Checkpoint: Template loaded -->
  <checkpoint name="template_loaded" verify="template_content != null" />

  <!-- Step 1: Discover All Modules -->
  <task name="discover_modules" action="run-skill" skill="Glob">
    <param name="pattern">{{modules_path}}/**/*-overview.md</param>
    <output name="module_files" />
  </task>

  <!-- Gateway: Handle empty modules directory -->
  <gateway name="check_modules" mode="exclusive">
    <branch condition="module_files.length == 0">
      <event action="log" level="warning">No module overview files found in {{modules_path}}</event>
      <task name="generate_skeleton" action="run-script">
        <param name="script">generate-skeleton.js</param>
        <param name="template">{{template_content}}</param>
        <output name="skeleton_doc" />
      </task>
      <task name="write_skeleton" action="run-skill" skill="Write">
        <param name="file_path">{{output_path}}/system-overview.md</param>
        <param name="content">{{skeleton_doc}}</param>
      </task>
      <output name="status" from="warning" />
      <event action="signal">workflow_complete_with_warning</event>
    </branch>
    <branch condition="module_files.length > 0">
      <event action="log" level="info">Discovered {{module_files.length}} module overview files</event>
    </branch>
  </gateway>

  <!-- Extract platform types from paths -->
  <loop name="extract_platforms" over="module_files" as="module_file">
    <task name="parse_platform" action="run-script">
      <param name="script">extract-platform.js</param>
      <param name="file_path">{{module_file}}</param>
      <output name="platform_info" />
    </task>
  </loop>

  <!-- Checkpoint: Modules discovered -->
  <checkpoint name="modules_discovered" verify="module_files.length > 0" />

  <!-- Step 2: Read All Module Overviews -->
  <loop name="read_modules" over="module_files" as="module_file">
    <task name="read_module" action="run-skill" skill="Read">
      <param name="file_path">{{module_file}}</param>
      <output name="module_content" />
    </task>
    <task name="extract_module_info" action="run-script">
      <param name="script">extract-module-info.js</param>
      <param name="content">{{module_content}}</param>
      <param name="file_path">{{module_file}}</param>
      <output name="module_info" />
    </task>
  </loop>

  <!-- Checkpoint: Module info extracted -->
  <checkpoint name="modules_read" verify="module_infos.length == module_files.length" />

  <!-- Step 3: Build Module Index -->
  <task name="build_index" action="run-script">
    <param name="script">build-module-index.js</param>
    <param name="modules">{{module_infos}}</param>
    <output name="module_index" />
  </task>

  <!-- Create index table rows -->
  <loop name="create_index_rows" over="module_infos" as="module_info">
    <task name="create_index_row" action="run-script">
      <param name="script">create-index-row.js</param>
      <param name="module">{{module_info}}</param>
      <param name="language">{{language}}</param>
      <output name="index_row" />
    </task>
  </loop>

  <!-- Checkpoint: Index built -->
  <checkpoint name="index_built" verify="module_index != null" />

  <!-- Step 4: Build Dependency Graph -->
  <task name="extract_dependencies" action="run-script">
    <param name="script">extract-all-dependencies.js</param>
    <param name="modules">{{module_infos}}</param>
    <output name="all_dependencies" />
  </task>

  <!-- Classify dependencies -->
  <loop name="classify_dependencies" over="all_dependencies" as="dependency">
    <gateway name="dep_type" mode="exclusive">
      <branch condition="dependency.type == 'internal'">
        <output name="internal_deps" append="{{dependency}}" />
      </branch>
      <branch condition="dependency.type == 'external'">
        <output name="external_deps" append="{{dependency}}" />
      </branch>
      <branch condition="dependency.type == 'cross_platform'">
        <output name="cross_platform_deps" append="{{dependency}}" />
      </branch>
    </gateway>
  </loop>

  <!-- Build directed graph -->
  <task name="build_dependency_graph" action="run-script">
    <param name="script">build-dep-graph.js</param>
    <param name="internal_deps">{{internal_deps}}</param>
    <param name="cross_platform_deps">{{cross_platform_deps}}</param>
    <output name="dependency_graph" />
  </task>

  <!-- Generate Mermaid diagram -->
  <task name="generate_mermaid_deps" action="run-script">
    <param name="script">generate-mermaid-diagram.js</param>
    <param name="graph">{{dependency_graph}}</param>
    <param name="diagram_type">graph LR</param>
    <output name="mermaid_deps" />
  </task>

  <!-- Checkpoint: Dependency graph built -->
  <checkpoint name="deps_built" verify="dependency_graph.nodes.length > 0" />

  <!-- Step 5: Identify Business Domains -->
  <task name="extract_domains" action="run-script">
    <param name="script">extract-domains.js</param>
    <param name="modules">{{module_infos}}</param>
    <output name="business_domains" />
  </task>

  <!-- Group modules by domain -->
  <loop name="group_by_domain" over="business_domains" as="domain">
    <task name="find_domain_modules" action="run-script">
      <param name="script">find-domain-modules.js</param>
      <param name="domain">{{domain}}</param>
      <param name="modules">{{module_infos}}</param>
      <output name="domain_modules" />
    </task>
  </loop>

  <!-- Generate domain diagram -->
  <task name="generate_domain_diagram" action="run-script">
    <param name="script">generate-domain-diagram.js</param>
    <param name="domains">{{business_domains}}</param>
    <param name="module_groups">{{domain_module_groups}}</param>
    <output name="domain_diagram" />
  </task>

  <!-- Checkpoint: Domains identified -->
  <checkpoint name="domains_identified" verify="business_domains.length > 0" />

  <!-- Step 6: Identify End-to-End Flows -->
  <task name="analyze_flows" action="run-script">
    <param name="script">analyze-cross-module-flows.js</param>
    <param name="dependencies">{{all_dependencies}}</param>
    <param name="modules">{{module_infos}}</param>
    <output name="end_to_end_flows" />
  </task>

  <!-- Create flow-module mapping matrix -->
  <loop name="build_flow_matrix" over="end_to_end_flows" as="flow">
    <task name="map_flow_modules" action="run-script">
      <param name="script">map-flow-modules.js</param>
      <param name="flow">{{flow}}</param>
      <param name="modules">{{module_infos}}</param>
      <output name="flow_mapping" />
    </task>
  </loop>

  <!-- Checkpoint: Flows identified -->
  <checkpoint name="flows_identified" verify="end_to_end_flows.length >= 0" />

  <!-- Step 7: Generate system-overview.md -->
  <!-- Phase A: Skeleton Construction -->
  <task name="count_modules" action="run-script">
    <param name="script">count-items.js</param>
    <param name="items">{{module_infos}}</param>
    <output name="module_count" />
  </task>

  <task name="count_flows" action="run-script">
    <param name="script">count-items.js</param>
    <param name="items">{{end_to_end_flows}}</param>
    <output name="flow_count" />
  </task>

  <task name="count_integrations" action="run-script">
    <param name="script">count-items.js</param>
    <param name="items">{{external_deps}}</param>
    <output name="integration_count" />
  </task>

  <!-- Read tech stack mappings -->
  <task name="read_tech_mappings" action="run-skill" skill="Read">
    <param name="file_path">speccrew-workspace/docs/configs/tech-stack-mappings.json</param>
    <output name="tech_mappings" />
  </task>

  <!-- Read Mermaid rules -->
  <task name="read_mermaid_rules" action="run-skill" skill="Read">
    <param name="file_path">speccrew-workspace/docs/rules/mermaid-rule.md</param>
    <output name="mermaid_rules" />
  </task>

  <!-- Get timestamp via script -->
  <task name="get_timestamp" action="run-script" description="Get current timestamp">
    <run-script script="scripts/get-timestamp.js" output="timestamp" />
  </task>

  <!-- Gateway: Fallback for timestamp -->
  <gateway name="check_timestamp" mode="exclusive">
    <branch condition="timestamp == null">
      <task name="fallback_timestamp" action="run-script">
        <param name="script">get-system-time.js</param>
        <output name="timestamp" />
      </task>
      <event action="log" level="warning">Using system fallback timestamp</event>
    </branch>
  </gateway>

  <!-- Determine technology stack -->
  <task name="determine_tech_stack" action="run-script">
    <param name="script">determine-tech-stack.js</param>
    <param name="platforms">{{extracted_platforms}}</param>
    <param name="mappings">{{tech_mappings}}</param>
    <output name="tech_stack" />
  </task>

  <!-- Create skeleton structure -->
  <task name="create_skeleton" action="run-script">
    <param name="script">create-system-skeleton.js</param>
    <param name="template">{{template_content}}</param>
    <param name="module_count">{{module_count}}</param>
    <param name="flow_count">{{flow_count}}</param>
    <param name="integration_count">{{integration_count}}</param>
    <param name="timestamp">{{timestamp}}</param>
    <param name="tech_stack">{{tech_stack}}</param>
    <param name="language">{{language}}</param>
    <output name="document_skeleton" />
  </task>

  <!-- Rule: Skeleton must be complete before filling -->
  <rule level="mandatory">DO NOT start filling content until the complete skeleton is verified</rule>

  <!-- Checkpoint: Skeleton ready -->
  <checkpoint name="skeleton_ready" verify="document_skeleton != null AND document_skeleton.contains('[TO BE FILLED]')" />

  <!-- Phase B: Content Filling -->
  <!-- Fill Index and Overview section -->
  <task name="fill_index_section" action="run-script">
    <param name="script">fill-index-section.js</param>
    <param name="skeleton">{{document_skeleton}}</param>
    <param name="timestamp">{{timestamp}}</param>
    <param name="tech_stack">{{tech_stack}}</param>
    <param name="statistics">{{aggregated_stats}}</param>
    <param name="module_index">{{module_index}}</param>
    <output name="filled_index" />
  </task>

  <!-- Fill Section 1: System Overview -->
  <task name="fill_system_overview" action="run-script">
    <param name="script">fill-system-overview.js</param>
    <param name="skeleton">{{filled_index}}</param>
    <param name="modules">{{module_infos}}</param>
    <param name="language">{{language}}</param>
    <output name="filled_section1" />
  </task>

  <!-- Fill Section 2: Module Topology -->
  <task name="fill_module_topology" action="run-script">
    <param name="script">fill-module-topology.js</param>
    <param name="skeleton">{{filled_section1}}</param>
    <param name="domain_diagram">{{domain_diagram}}</param>
    <param name="dependency_graph">{{dependency_graph}}</param>
    <param name="mermaid_deps">{{mermaid_deps}}</param>
    <param name="module_index">{{module_index}}</param>
    <param name="language">{{language}}</param>
    <output name="filled_section2" />
  </task>

  <!-- Fill Section 3: End-to-End Business Flows -->
  <task name="fill_business_flows" action="run-script">
    <param name="script">fill-business-flows.js</param>
    <param name="skeleton">{{filled_section2}}</param>
    <param name="flows">{{end_to_end_flows}}</param>
    <param name="flow_mappings">{{flow_mappings}}</param>
    <param name="modules">{{module_infos}}</param>
    <param name="language">{{language}}</param>
    <output name="filled_section3" />
  </task>

  <!-- Fill Section 4: System Boundaries and Integration -->
  <task name="fill_system_boundaries" action="run-script">
    <param name="script">fill-system-boundaries.js</param>
    <param name="skeleton">{{filled_section3}}</param>
    <param name="external_deps">{{external_deps}}</param>
    <param name="language">{{language}}</param>
    <output name="filled_section4" />
  </task>

  <!-- Fill Section 5: Requirement Assessment Guide -->
  <task name="fill_assessment_guide" action="run-script">
    <param name="script">fill-assessment-guide.js</param>
    <param name="skeleton">{{filled_section4}}</param>
    <param name="language">{{language}}</param>
    <output name="filled_section5" />
  </task>

  <!-- Error Handler for document writing -->
  <error-handler>
    <try>
      <!-- Step 7a: Prepare Document -->
      <task name="write_document" action="run-skill" skill="Write">
        <param name="file_path">{{output_path}}/system-overview.md</param>
        <param name="content">{{filled_section5}}</param>
      </task>
    </try>
    <catch error="write_error">
      <event action="log" level="error">Failed to write system overview: {{write_error.message}}</event>
      <output name="status" from="failed" />
    </catch>
    <finally>
      <event action="log" level="info">Document write operation completed</event>
    </finally>
  </error-handler>

  <!-- Rule: Critical constraints -->
  <rule level="forbidden">FORBIDDEN: create_file for documents - Document MUST be created by copying template then filling with search_replace</rule>
  <rule level="forbidden">FORBIDDEN: Full-file rewrite - Always use targeted search_replace on specific sections</rule>
  <rule level="mandatory">MANDATORY: Template-first workflow - Step 7a MUST execute before Step 7b</rule>

  <!-- Checkpoint: Document generated -->
  <checkpoint name="document_generated" verify="output_file_exists == true" />

  <!-- Step 8: Report Results -->
  <task name="calculate_metrics" action="run-script">
    <param name="script">calculate-metrics.js</param>
    <param name="modules">{{module_infos}}</param>
    <param name="platforms">{{extracted_platforms}}</param>
    <output name="metrics" />
  </task>

  <task name="generate_report" action="run-script">
    <param name="script">generate-system-report.js</param>
    <param name="module_count">{{module_count}}</param>
    <param name="entity_count">{{metrics.entity_count}}</param>
    <param name="api_count">{{metrics.api_count}}</param>
    <param name="dependency_count">{{all_dependencies.length}}</param>
    <param name="flow_count">{{flow_count}}</param>
    <output name="completion_report" />
  </task>

  <!-- Event: Log completion -->
  <event action="log" level="info">
    System summarization completed:
    - Modules Processed: {{module_count}}
    - Entities Aggregated: {{metrics.entity_count}}
    - APIs Counted: {{metrics.api_count}}
    - Dependencies Mapped: {{all_dependencies.length}}
    - Business Flows Identified: {{flow_count}}
    - Output: system-overview.md (complete)
    - Status: success
  </event>

  <!-- Output Block: Define workflow outputs -->
  <output name="status" from="success" />
  <output name="output_file" from="system-overview.md" />
  <output name="message" from="System summarization completed with {{module_count}} modules processed" />
</workflow>

## Constraints

### Critical Constraints

> 1. **FORBIDDEN: `create_file` for documents** — Document MUST be created by copying template (Step 7a) then filling with `search_replace` (Step 7b)
> 2. **FORBIDDEN: Full-file rewrite** — Always use targeted `search_replace` on specific sections
> 3. **MANDATORY: Template-first workflow** — Step 7a MUST execute before Step 7b

### Content Language

**IMPORTANT**: ALL generated content (system description, module summaries, flow descriptions, section headers, and narrative text) MUST be written in the language specified by the `language` parameter. Only code identifiers, file paths, and technical terms remain in their original language.

## Return Value Format

```json
{
  "status": "success|failed",
  "output_file": "system-overview.md",
  "message": "System summarization completed with N modules processed"
}
```

## Task Completion Report

Upon completion, output the following structured report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-knowledge-system-summarize-xml",
  "output_files": [
    "{output_path}/system-overview.md"
  ],
  "summary": "System overview generated from {module_count} modules across {platform_count} platforms",
  "metrics": {
    "platforms_covered": 0,
    "modules_summarized": 0,
    "system_overview_generated": true
  },
  "errors": [],
  "next_steps": [
    "Review system-overview.md for completeness",
    "Run speccrew-pm-requirement-assess if requirement assessment is needed"
  ]
}
```

## Reference Guides

### Mermaid Diagram Guide

When generating Mermaid diagrams, follow these compatibility guidelines:

**Key Requirements:**
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` syntax only

**Diagram Types:**

| Diagram Type | Use Case | Example |
|---------|---------|------|
| `graph TB/LR` | System structure, module dependencies | System architecture, module dependency graph |
| `sequenceDiagram` | Cross-module interaction flow | User operation flow, service call chain |
| `flowchart TD` | Business logic, conditional branches | State transition, exception handling |
| `classDiagram` | Class structure, entity relationships | Data model, service interface |
| `erDiagram` | Database table relationships | Entity relationship diagram |
| `stateDiagram-v2` | State machine | Order status, approval status |

### Source Traceability Guide

Aggregate source file references from all module overview documents:

> **Note**: Use relative paths from the generated document to the source file. Do NOT use `file://` protocol.

1. **File Reference Block** (at document start):
```markdown
**Referenced Files**

- Aggregated from all module overview documents
- [OrderController.java](path/to/source/OrderController.java)
- [PaymentController.java](path/to/source/PaymentController.java)
```

2. **Diagram Source** (after each Mermaid diagram):
```markdown
**Diagram Source**
- Aggregated from: order-overview.md, payment-overview.md
```

3. **Section Source** (at end of document):
```markdown
**Section Source**
- Aggregated from all module overview documents
```

## Checklist

- [ ] All {{module_name}}-overview.md files discovered
- [ ] Module information extracted
- [ ] Source file references aggregated from module documents
- [ ] Module index table created
- [ ] Dependency graph built
- [ ] Business domains identified
- [ ] End-to-end flows mapped
- [ ] system-overview.md generated with all sections
- [ ] Source traceability information included
- [ ] Mermaid diagrams follow compatibility guidelines
- [ ] Results reported
