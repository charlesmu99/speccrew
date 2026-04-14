---
name: speccrew-knowledge-module-summarize-xml
description: Summarize a module's features to complete MODULE-OVERVIEW.md using XML workflow blocks. Reads all FEATURE-DETAIL.md files of a module and generates the complete module overview with entities, dependencies, and business rules.
tools: Read, Write, Glob
---

# Module Summarize - Complete Module Overview (XML Workflow)

Read all {{feature_name}}.md files of a specific module, extract and summarize information to complete {{module_name}}-overview.md (full version with entities, dependencies, flows, and rules).

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (entity names, descriptions, business rules, flow descriptions) must be in the target language only.**

## Trigger Scenarios

- "Summarize module {name} features"
- "Complete module overview for {name}"
- "Finalize module documentation for {name}"

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module_name` | string | Yes | Module name to summarize |
| `module_path` | string | Yes | Path to module directory (e.g., `speccrew-workspace/knowledges/bizs/{{platform_type}}/{{module_name}}/`) containing: {{module_name}}-overview.md (initial version), features/{{feature_name}}.md files |
| `language` | string | Yes | Target language for generated content (e.g., "zh", "en") |

## Output

| Output | Path | Description |
|--------|------|-------------|
| `{{module_name}}-overview.md` | `{{module_path}}/{{module_name}}-overview.md` | Complete module overview (overwritten). Example: `speccrew-workspace/knowledges/bizs/backend-ai/chat/chat-overview.md` |

## Workflow

```mermaid
flowchart TD
    Start([Start]) --> Step1[Step 1: Read Prerequisites]
    Step1 --> Step2[Step 2: Extract Entities]
    Step2 --> Step3[Step 3: Identify Dependencies]
    Step3 --> Step4[Step 4: Summarize Business Rules]
    Step4 --> Step5[Step 5: Generate Complete MODULE-OVERVIEW.md]
    Step5 --> Step6[Step 6: Report Results]
    Step6 --> End([End])
```

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/xml-workflow-spec.md`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="module-summarize" version="1.0" status="pending" desc="Module summarization workflow">

  <!-- Input Block: Define workflow inputs -->
  <block type="input" id="I1" desc="Module summarize input parameters">
    <field name="module_name" required="true" type="string" desc="Module name to summarize"/>
    <field name="module_path" required="true" type="string" desc="Path to module directory"/>
    <field name="language" required="true" type="string" desc="Target language for generated content"/>
    <field name="workspace_path" required="true" type="string" desc="Workspace root path"/>
    <field name="sync_state_bizs_dir" required="true" type="string" desc="Sync state directory path"/>
  </block>

  <!-- ==================== GLOBAL CONTINUOUS EXECUTION RULES ==================== -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" during execution</field>
    <field name="text">DO NOT offer options like "Full execution / Partial / Stop" — always execute ALL tasks to completion</field>
    <field name="text">DO NOT suggest "Due to context window limits, let me pause" — complete current task, use checkpoint for resumption</field>
    <field name="text">DO NOT estimate workload and suggest breaking it into phases — execute ALL items in sequence</field>
    <field name="text">DO NOT warn about "large number of files" or "this may take a while" — proceed with generation</field>
    <field name="text">Context window management: if approaching limit, save progress to checkpoint file and resume — do NOT ask user for guidance</field>
  </block>

  <!-- Step 1: Read Prerequisites -->
  <sequence id="S1" name="Step 1: Read Prerequisites" status="pending" desc="Read template, initial overview, and discover features">
    <block type="task" id="B1a" action="read-file" desc="Read module overview template">
      <field name="path" value="../speccrew-knowledge-module-summarize/templates/MODULE-OVERVIEW-TEMPLATE.md"/>
      <field name="output" var="template_content"/>
    </block>

    <block type="task" id="B1b" action="read-file" desc="Read initial overview">
      <field name="path" value="${module_path}/${module_name}-overview.md"/>
      <field name="output" var="initial_overview"/>
    </block>

    <block type="task" id="B1c" action="run-script" desc="Discover feature files">
      <field name="command">Get-ChildItem -Path "${module_path}/features" -Filter "*.md" -File</field>
      <field name="output" var="feature_files"/>
    </block>

    <!-- Loop: Read all feature detail files -->
    <block type="loop" id="L1" over="${feature_files}" as="feature_file" desc="Read all feature files">
      <block type="task" id="B1d" action="read-file" desc="Read feature file">
        <field name="path" value="${feature_file}"/>
        <field name="output" var="feature_content"/>
      </block>
    </block>

    <!-- Checkpoint: Verify prerequisites loaded -->
    <block type="checkpoint" id="CP1" name="prerequisites_loaded" desc="Prerequisites loaded checkpoint">
      <field name="verify" value="${template_content} != null AND ${feature_files} != null"/>
    </block>

    <!-- Gateway: Handle edge case - no features found -->
    <block type="gateway" id="G1" mode="exclusive" desc="Check if features exist">
      <branch test="${feature_files.length} == 0" name="No features">
        <block type="event" id="E1a" action="log" level="warning" desc="No features warning">
          <field name="message">No feature documents found for module ${module_name}</field>
        </block>
        <block type="task" id="B1e" action="write-file" desc="Generate minimal overview">
          <field name="path" value="${module_path}/${module_name}-overview.md"/>
          <field name="content" value="${minimal_skeleton}"/>
        </block>
        <field name="status" value="partial"/>
        <block type="event" id="E1b" action="signal" desc="Signal complete">
          <field name="message">workflow_complete</field>
        </block>
      </branch>
      <branch test="${feature_files.length} > 0" name="Features found">
        <block type="event" id="E1c" action="log" level="info" desc="Features found">
          <field name="message">Found ${feature_files.length} feature documents</field>
        </block>
      </branch>
    </block>
  </sequence>

  <!-- Step 2: Extract Entities -->
  <sequence id="S2" name="Step 2: Extract Entities" status="pending" desc="Extract and aggregate entities from features">
    <block type="task" id="B2a" action="analyze" desc="Extract entities">
      <field name="inputs" value="${feature_contents}"/>
      <field name="output" var="extracted_entities"/>
    </block>

    <!-- Loop: Process each entity for deduplication -->
    <block type="loop" id="L2" over="${extracted_entities}" as="entity" desc="Aggregate entities">
      <block type="task" id="B2b" action="analyze" desc="Aggregate entity">
        <field name="entity" value="${entity}"/>
        <field name="output" var="aggregated_entity"/>
      </block>
    </block>

    <!-- Checkpoint: Entities aggregated -->
    <block type="checkpoint" id="CP2" name="entities_aggregated" desc="Entities aggregated checkpoint">
      <field name="verify" value="${unique_entities.length} > 0"/>
    </block>
  </sequence>

  <!-- Step 3: Identify Dependencies -->
  <sequence id="S3" name="Step 3: Identify Dependencies" status="pending" desc="Identify dependencies from features">
    <block type="task" id="B3a" action="analyze" desc="Identify dependencies">
      <field name="inputs" value="${feature_contents}"/>
      <field name="output" var="dependencies"/>
    </block>

    <!-- Classify dependencies -->
    <block type="loop" id="L3" over="${dependencies}" as="dependency" desc="Classify dependencies">
      <block type="gateway" id="G3" mode="exclusive" desc="Classify direction">
        <branch test="${dependency.direction} == 'provides'" name="Provides">
          <field name="provided_deps" append="${dependency}"/>
        </branch>
        <branch test="${dependency.direction} == 'consumes'" name="Consumes">
          <field name="consumed_deps" append="${dependency}"/>
        </branch>
      </block>
    </block>

    <!-- Checkpoint: Dependencies classified -->
    <block type="checkpoint" id="CP3" name="dependencies_classified" desc="Dependencies classified checkpoint">
      <field name="verify" value="${dependencies} != null"/>
    </block>
  </sequence>

  <!-- Step 4: Summarize Business Rules -->
  <sequence id="S4" name="Step 4: Summarize Rules" status="pending" desc="Extract and associate business rules">
    <block type="task" id="B4a" action="analyze" desc="Extract rules">
      <field name="inputs" value="${feature_contents}"/>
      <field name="output" var="business_rules"/>
    </block>

    <!-- Loop: Associate rules with features -->
    <block type="loop" id="L4" over="${business_rules}" as="rule" desc="Associate rules">
      <block type="task" id="B4b" action="analyze" desc="Find rule source">
        <field name="rule" value="${rule}"/>
        <field name="features" value="${feature_files}"/>
        <field name="output" var="rule_with_source"/>
      </block>
    </block>

    <!-- Checkpoint: Rules collected -->
    <block type="checkpoint" id="CP4" name="rules_collected" desc="Rules collected checkpoint">
      <field name="verify" value="${business_rules.length} >= 0"/>
    </block>
  </sequence>

  <!-- Step 5: Generate Complete MODULE-OVERVIEW.md -->
  <sequence id="S5" name="Step 5: Generate Overview" status="pending" desc="Generate complete module overview">
    <!-- Phase A: Skeleton Construction -->
    <block type="task" id="B5a" action="analyze" desc="Count entities">
      <field name="items" value="${unique_entities}"/>
      <field name="output" var="entity_count"/>
    </block>

    <block type="task" id="B5b" action="analyze" desc="Count dependencies">
      <field name="items" value="${dependencies}"/>
      <field name="output" var="dependency_count"/>
    </block>

    <block type="task" id="B5c" action="analyze" desc="Count flows">
      <field name="features" value="${feature_contents}"/>
      <field name="output" var="flow_count"/>
    </block>

    <block type="task" id="B5d" action="analyze" desc="Count rules">
      <field name="items" value="${business_rules}"/>
      <field name="output" var="rule_count"/>
    </block>

    <!-- Create skeleton structure -->
    <block type="task" id="B5e" action="analyze" desc="Create skeleton">
      <field name="template" value="${template_content}"/>
      <field name="entity_count" value="${entity_count}"/>
      <field name="dependency_count" value="${dependency_count}"/>
      <field name="flow_count" value="${flow_count}"/>
      <field name="rule_count" value="${rule_count}"/>
      <field name="language" value="${language}"/>
      <field name="output" var="document_skeleton"/>
    </block>

    <!-- Rule: Skeleton must be complete before filling -->
    <block type="rule" id="R1" level="mandatory" desc="Skeleton first">
      <field name="text">DO NOT start filling content until the complete skeleton is verified</field>
    </block>

    <!-- Checkpoint: Skeleton verified -->
    <block type="checkpoint" id="CP5a" name="skeleton_verified" desc="Skeleton verified checkpoint">
      <field name="verify" value="${document_skeleton} != null AND ${document_skeleton}.contains('[TO BE FILLED]')"/>
    </block>

    <!-- Phase B: Content Filling -->
    <!-- Read Mermaid rules -->
    <block type="task" id="B5f" action="read-file" desc="Read Mermaid rules">
      <field name="path" value="speccrew-workspace/docs/rules/mermaid-rule.md"/>
      <field name="output" var="mermaid_rules"/>
    </block>

    <!-- Fill Section 3: Business Entities -->
    <block type="loop" id="L5a" over="${unique_entities}" as="entity" desc="Fill entity rows">
      <block type="task" id="B5g" action="analyze" desc="Fill entity row">
        <field name="entity" value="${entity}"/>
        <field name="language" value="${language}"/>
        <field name="output" var="entity_row"/>
      </block>
    </block>

    <!-- Fill Section 4: Dependencies -->
    <block type="loop" id="L5b" over="${dependencies}" as="dependency" desc="Fill dependency rows">
      <block type="task" id="B5h" action="analyze" desc="Fill dependency row">
        <field name="dependency" value="${dependency}"/>
        <field name="language" value="${language}"/>
        <field name="output" var="dependency_row"/>
      </block>
    </block>

    <!-- Fill Section 5: Core Business Flows -->
    <block type="loop" id="L5c" over="${core_flows}" as="flow" desc="Fill flow items">
      <block type="task" id="B5i" action="analyze" desc="Fill flow item">
        <field name="flow" value="${flow}"/>
        <field name="language" value="${language}"/>
        <field name="output" var="flow_item"/>
      </block>
    </block>

    <!-- Fill Section 6: Business Rules -->
    <block type="loop" id="L5d" over="${business_rules}" as="rule" desc="Fill rule rows">
      <block type="task" id="B5j" action="analyze" desc="Fill rule row">
        <field name="rule" value="${rule}"/>
        <field name="language" value="${language}"/>
        <field name="output" var="rule_row"/>
      </block>
    </block>

    <!-- Error Handler for document writing -->
    <block type="error-handler" id="EH1" desc="Handle document writing errors">
      <try>
        <!-- Write final document -->
        <block type="gateway" id="G5" mode="exclusive" desc="Check existing document">
          <branch test="${initial_overview} != null" name="Existing document">
            <!-- Use search_replace for existing document -->
            <block type="loop" id="L5e" over="${sections}" as="section" desc="Replace sections">
              <block type="task" id="B5k" action="run-skill" desc="Replace section">
                <field name="skill" value="search_replace"/>
                <field name="file_path" value="${module_path}/${module_name}-overview.md"/>
                <field name="section" value="${section}"/>
              </block>
            </block>
          </branch>
          <branch test="${initial_overview} == null" name="New document">
            <!-- Create new document -->
            <block type="task" id="B5l" action="write-file" desc="Write overview">
              <field name="path" value="${module_path}/${module_name}-overview.md"/>
              <field name="content" value="${document_skeleton}"/>
            </block>
          </branch>
        </block>
      </try>
      <catch error-type="write_error">
        <block type="event" id="EH1-E1" action="log" level="error" desc="Write error">
          <field name="message">Failed to write overview document: ${write_error.message}</field>
        </block>
        <field name="status" value="failed"/>
      </catch>
      <finally>
        <block type="event" id="EH1-E2" action="log" level="info" desc="Write completed">
          <field name="message">Document write operation completed</field>
        </block>
      </finally>
    </block>

    <!-- Rule: Content language constraint -->
    <block type="rule" id="R2" level="mandatory" desc="Language constraint">
      <field name="text">ALL generated content MUST be in the language specified by the language parameter</field>
    </block>

    <!-- Rule: Forbidden operations -->
    <block type="rule" id="R3" level="forbidden" desc="No create_file for rewrite">
      <field name="text">FORBIDDEN: create_file for overview document rewrite - use search_replace instead</field>
    </block>
    <block type="rule" id="R4" level="forbidden" desc="No full-file rewrite">
      <field name="text">FORBIDDEN: Full-file rewrite - always use targeted search_replace on specific sections</field>
    </block>

    <!-- Checkpoint: Document generated -->
    <block type="checkpoint" id="CP5b" name="document_generated" desc="Document generated checkpoint">
      <field name="verify" value="${output_file_exists} == true"/>
    </block>
  </sequence>

  <!-- Step 6: Report Results -->
  <sequence id="S6" name="Step 6: Report Results" status="pending" desc="Generate completion report">
    <block type="task" id="B6" action="analyze" desc="Generate report">
      <field name="module_name" value="${module_name}"/>
      <field name="feature_count" value="${feature_files.length}"/>
      <field name="entity_count" value="${unique_entities.length}"/>
      <field name="dependency_count" value="${dependencies.length}"/>
      <field name="rule_count" value="${business_rules.length}"/>
      <field name="output" var="completion_report"/>
    </block>

    <!-- Event: Log completion -->
    <block type="event" id="E6" action="log" level="info" desc="Log completion">
      <field name="message">Module summarization completed:
- Module: ${module_name}
- Features Processed: ${feature_files.length}
- Entities Extracted: ${unique_entities.length}
- Dependencies Identified: ${dependencies.length}
- Business Rules Summarized: ${business_rules.length}
- Output: ${module_name}-overview.md (complete)
- Status: success</field>
    </block>
  </sequence>

  <!-- Output Block: Define workflow outputs -->
  <block type="output" id="O1" desc="Module summarize output results">
    <field name="status" value="success"/>
    <field name="module_name" from="${module_name}"/>
    <field name="output_file" from="${module_name}-overview.md"/>
    <field name="message" value="Module summarization completed with ${feature_files.length} features processed"/>
  </block>

</workflow>
```

## Constraints

### Critical Constraints

> 1. **FORBIDDEN: `create_file` for overview document** — If skeleton exists, use `search_replace`; if not, copy template first then fill with `search_replace`
> 2. **FORBIDDEN: Full-file rewrite** — Always use targeted `search_replace` on specific sections
> 3. **MANDATORY: Template-first workflow** — Template (or existing skeleton) MUST be in place before filling sections

### Content Language

**IMPORTANT**: ALL generated content (entity descriptions, business rules, flow descriptions, section headers, and narrative text) MUST be written in the language specified by the `language` parameter. Only code identifiers, file paths, and technical terms (class names, API endpoints) remain in their original language.

## Return Value Format

```json
{
  "status": "success|failed",
  "module_name": "module_name",
  "output_file": "module_name-overview.md",
  "message": "Module summarization completed with N features processed"
}
```

## Task Completion Report

Upon completion, output the following structured report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-knowledge-module-summarize-xml",
  "output_files": [
    "{module_path}/{module_name}-overview.md"
  ],
  "summary": "Module overview completed with entities, dependencies, and business rules extracted from {feature_count} features",
  "metrics": {
    "modules_processed": 1,
    "documents_generated": 1,
    "features_covered": 0
  },
  "errors": [],
  "next_steps": [
    "Run speccrew-knowledge-system-summarize-xml to aggregate all modules into system overview"
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
| `graph TB/LR` | Module structure, dependencies | Project structure diagram, dependency graph |
| `sequenceDiagram` | Interaction flow, API calls | User operation flow, service call chain |
| `flowchart TD` | Business logic, conditional branches | State transition, exception handling |
| `classDiagram` | Class structure, entity relationships | Data model, service interface |
| `erDiagram` | Database table relationships | Entity relationship diagram |
| `stateDiagram-v2` | State machine | Order status, approval status |

### Source Traceability Guide

Aggregate source file references from all feature documents:

> **Note**: Use relative paths from the generated document to the source file. Do NOT use `file://` protocol.

**CRITICAL: Dynamic Relative Path Calculation**

The document generation location is `speccrew-workspace/knowledges/bizs/{platform_id}/{module_path}/{file}.md`, which has a **variable depth** from the project root. You MUST dynamically calculate the relative path depth based on the actual document location.

**Calculation Method:**
1. Count the number of directory separators (`/`) from the project root to the document's directory
2. Each directory level requires one `../` to traverse up to the project root
3. Example: Document at `speccrew-workspace/knowledges/bizs/backend-ai/chat/overview.md` (5 levels) → Use `../../../../../src/...`

**Common Path Depths Reference:**
| Document Location | Depth | Relative Path Prefix |
|---|---|---|
| `speccrew-workspace/knowledges/bizs/{platform}/{module}/` | 5+ | `../../../../../` |
| `speccrew-workspace/knowledges/bizs/{platform}/{module}/{sub}/` | 6+ | `../../../../../../` |

**Source reference examples by tech stack (assuming document at depth 5):**

Backend (Java): `[OrderController.java](../../../../../src/main/java/.../OrderController.java#L10-L25)`
Backend (Python): `[views.py](../../../../../app/order/views.py#L10-L25)`
Backend (Node.js): `[orderController.js](../../../../../src/modules/order/orderController.js#L10-L25)`
Frontend (Vue): `[OrderList.vue](../../../../../src/views/order/OrderList.vue#L10-L25)`
Frontend (React): `[OrderDetail.tsx](../../../../../src/pages/order/OrderDetail.tsx#L10-L25)`

1. **File Reference Block** (at document start):
```markdown
**Referenced Files**

- [OrderController.*](path/to/source/OrderController.*)
- [OrderService.*](path/to/source/OrderService.*)
```

2. **Diagram Source** (after each Mermaid diagram):
```markdown
**Diagram Source**
- [OrderController.*](path/to/source/OrderController.*#L45-L60)
```

3. **Section Source** (at end of document):
```markdown
**Section Source**
- [OrderController.*](path/to/source/OrderController.*#L1-L100)
- [OrderService.*](path/to/source/OrderService.*#L1-L80)
```

## Notes

> **Note**: This skill focuses on document aggregation only. Knowledge graph data (nodes, edges) is handled separately by the dispatch skill's `process-batch-results.js` script during Stage 2. Module-summarize does NOT read from or write to the knowledge graph.

## Checklist

- [ ] Step 1: Prerequisites read (template, initial overview, feature details)
- [ ] Step 2: Entities extracted and aggregated
- [ ] Step 3: Dependencies identified
- [ ] Step 4: Business rules collected
- [ ] Step 5: Section 3-6 completed in {{module_name}}-overview.md
- [ ] Step 6: Results reported
