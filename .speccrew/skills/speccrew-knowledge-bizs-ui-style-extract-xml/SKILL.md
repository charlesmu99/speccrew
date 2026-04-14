---
name: speccrew-knowledge-bizs-ui-style-extract-xml
description: Extract and aggregate UI design patterns (page types, components, layouts) from analyzed bizs feature documents using XML workflow blocks, outputting to techs ui-style-patterns directory.
tools: Read, Write
---

# Bizs UI Style Extract (XML Workflow)

Extract and aggregate **UI design patterns** from bizs pipeline analyzed feature documents using XML workflow blocks. Through cross-module clustering analysis, identify common page types, component patterns, and layout patterns, then output them to the techs knowledge base `ui-style-patterns/` subdirectory.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and generate content accordingly.

- User writes in 中文 → Generate Chinese documents, use `language: "zh"`
- User writes in English → Generate English documents, use `language: "en"`
- User writes in other languages → Use appropriate language code

**All generated pattern documents must be in the language specified by the `language` parameter.**

## Trigger Scenarios

- Called by `speccrew-knowledge-bizs-dispatch` Stage 3.5 (after Module Summarize, before System Summary)
- "Extract UI patterns from bizs features"
- "Aggregate UI design patterns"

## Input

| Variable | Description | Required |
|----------|-------------|----------|
| `platform_id` | Platform identifier (e.g., web-vue, mobile-uniapp), used to locate output directory | Yes |
| `platform_type` | Platform type (web, mobile, desktop), only execute for frontend platforms | Yes |
| `feature_docs_path` | Completed feature documents base path, e.g., `speccrew-workspace/knowledges/bizs/{platform-type}/{module}/features/` | Yes |
| `features_manifest_path` | Path to features-{platform}.json, used to get completed feature list | Yes |
| `module_overviews_path` | **Parent directory** containing all module overview subdirectories. Example: `knowledges/bizs/web-vue/` (this directory contains `system/system-overview.md`, `user/user-overview.md`, etc.). **NOT** a specific module directory like `knowledges/bizs/web-vue/system/`. | Yes |
| `output_path` | Output directory, e.g., `speccrew-workspace/knowledges/techs/{platform_id}/ui-style-patterns/` | Yes |
| `language` | User language code | Yes |

## Output

> **Directory Separation**: This skill outputs to `ui-style-patterns/` (NOT `ui-style/`).
> - `ui-style/` is managed by techs pipeline (framework-level design system, existing components/pages)
> - `ui-style-patterns/` is managed by bizs pipeline (business pattern aggregation from feature docs)
> This separation prevents file conflicts between the two pipelines.

```
{output_path}/
├── page-types/          # Page type pattern documents
│   ├── {pattern-name}.md
│   └── ...
├── components/          # Component pattern documents
│   ├── {pattern-name}.md
│   └── ...
└── layouts/             # Layout pattern documents
    ├── {pattern-name}.md
    └── ...
```

## Absolute Constraints

> **These rules apply to ALL document generation steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for pattern documents** — NEVER use `create_file` to write pattern documents. Each document MUST be created by copying the appropriate template then filling sections with `search_replace`.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before filling sections for every pattern document.

## Workflow

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

<workflow id="ui-style-extract-main" status="pending" version="1.0" desc="Extract and aggregate UI design patterns from feature documents">

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="Workflow input parameters">
    <field name="platform_id" required="true" type="string" desc="Platform identifier (e.g., web-vue, mobile-uniapp)"/>
    <field name="platform_type" required="true" type="string" desc="Platform type (web, mobile, desktop)"/>
    <field name="feature_docs_path" required="true" type="string" desc="Completed feature documents base path"/>
    <field name="features_manifest_path" required="true" type="string" desc="Path to features-{platform}.json"/>
    <field name="module_overviews_path" required="true" type="string" desc="Parent directory containing all module overview subdirectories"/>
    <field name="output_path" required="true" type="string" desc="Output directory for pattern documents"/>
    <field name="language" required="true" type="string" desc="User language code"/>
  </block>

  <!-- ============================================================
       Global Constraints
       ============================================================ -->
  <block type="rule" id="R1" level="forbidden" desc="Document generation constraints">
    <field name="text">Using create_file to write pattern documents directly</field>
    <field name="text">Full-file rewrite of pattern documents</field>
  </block>

  <block type="rule" id="R2" level="mandatory" desc="Document generation requirements">
    <field name="text">Copy template MUST execute before filling sections for every pattern document</field>
    <field name="text">All generated pattern documents must be in the specified language</field>
  </block>

  <!-- ============================================================
       Global Continuous Execution Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" during execution</field>
    <field name="text">DO NOT offer options like "Full execution / Partial / Stop" — always execute ALL tasks to completion</field>
    <field name="text">DO NOT suggest "Due to context window limits, let me pause" — complete current task, use checkpoint for resumption</field>
    <field name="text">DO NOT estimate workload and suggest breaking it into phases — execute ALL items in sequence</field>
    <field name="text">DO NOT warn about "large number of files" or "this may take a while" — proceed with generation</field>
    <field name="text">Context window management: if approaching limit, save progress to checkpoint file and resume — do NOT ask user for guidance</field>
  </block>

  <!-- ============================================================
       Gateway: Platform Type Check
       ============================================================ -->
  <block type="gateway" id="G1" mode="exclusive" desc="Check platform type for UI pattern extraction">
    <branch test="${platform_type} NOT IN ['web', 'mobile', 'desktop']" name="Backend platform">
      <block type="event" id="E1" action="log" level="info" desc="Log skip reason">Skipping skill: backend platforms do not have UI patterns</block>
      <block type="task" id="B1" action="analyze" desc="Return skip status">
        <field name="status" value="skipped"/>
        <field name="reason" value="Backend platform does not have UI patterns"/>
        <field name="output" var="summary"/>
      </block>
    </branch>
    <branch test="${platform_type} IN ['web', 'mobile', 'desktop']" name="UI platform">

      <!-- ============================================================
           Step 1: Load Features Manifest
           ============================================================ -->
      <sequence id="S1" name="Step 1: Load Features Manifest" status="pending" desc="Read features manifest to identify completed features">
        <block type="task" id="B2" action="read-file" desc="Read features manifest file">
          <field name="path" value="${features_manifest_path}"/>
          <field name="output" var="featuresManifest"/>
        </block>

        <block type="task" id="B3" action="analyze" desc="Filter completed features">
          <field name="input" value="${featuresManifest}"/>
          <field name="filter" value="status === 'completed'"/>
          <field name="collect" value="featureId, module, documentPath"/>
          <field name="output" var="completed_features"/>
        </block>
      </sequence>

      <!-- ============================================================
           Gateway: Check Completed Features
           ============================================================ -->
      <block type="gateway" id="G2" mode="guard" desc="Check if completed features exist">
        <branch test="${completed_features.length} > 0" name="Has completed features">

          <!-- Step 1.5: Create Output Directory -->
          <block type="task" id="B4" action="run-script" desc="Create output directory structure">
            <field name="command">node -e "require('fs').mkdirSync('${output_path}/page-types', {recursive:true}); require('fs').mkdirSync('${output_path}/components', {recursive:true}); require('fs').mkdirSync('${output_path}/layouts', {recursive:true})"</field>
          </block>

          <!-- ============================================================
               Step 2: Read Feature Documents
               ============================================================ -->
          <sequence id="S2" name="Step 2: Read Feature Documents" status="pending" desc="Extract UI information from feature documents">
            <block type="task" id="B5" action="analyze" desc="Extract UI-related information from feature documents">
              <field name="input" value="${completed_features}"/>
              <field name="feature_docs_path" value="${feature_docs_path}"/>
              <field name="extract_section" value="Interface Prototype"/>
              <field name="extract_items" value="ASCII wireframe diagrams, layout regions"/>
              <field name="extract_section_2" value="Page Elements Table"/>
              <field name="extract_items_2" value="Component names, types, responsibilities, interactions"/>
              <field name="extract_section_3" value="Business Flow Description"/>
              <field name="extract_items_3" value="User interaction sequences, navigation patterns"/>
              <field name="output" var="ui_extracted_data"/>
            </block>
          </sequence>

          <!-- ============================================================
               Step 3: Read Module Overviews
               ============================================================ -->
          <sequence id="S3" name="Step 3: Read Module Overviews" status="pending" desc="Gather module-level context">
            <block type="task" id="B6" action="analyze" desc="Read module overview files for context">
              <field name="glob_pattern" value="${module_overviews_path}/*/module-overview.md"/>
              <field name="extract_items" value="Common page structures, Shared components, Navigation patterns"/>
              <field name="output" var="module_context"/>
            </block>
          </sequence>

          <!-- Checkpoint: Data Collection Complete -->
          <block type="checkpoint" id="CP1" name="data-collection-complete" desc="Data collection complete">
            <field name="file" value="${output_path}/.progress.json"/>
            <field name="verify" value="${ui_extracted_data} != null AND ${module_context} != null"/>
          </block>

          <!-- ============================================================
               Step 4: Cross-Module Clustering Analysis
               ============================================================ -->
          <sequence id="S4" name="Step 4: Cross-Module Clustering Analysis" status="pending" desc="Identify recurring UI patterns">
            <block type="task" id="B7" action="analyze" desc="Perform cross-module clustering analysis">
              <field name="input" value="${ui_extracted_data}"/>
              <field name="module_context" value="${module_context}"/>
              <field name="clustering_approach" value="Dynamic discovery - Agent automatically identifies and categorizes pattern types based on actual analysis results"/>
              <field name="note" value="Templates only standardize output format, do not limit pattern types"/>
              <field name="categories_page_types" value="Pages with similar structure and purpose (e.g., list-page, form-page, detail-page, tree-list-page, dashboard-page, wizard-page)"/>
              <field name="categories_component_patterns" value="Reusable component combinations (e.g., search-filter-bar, data-table-pagination, modal-form, drawer-detail, tab-panel)"/>
              <field name="categories_layout_patterns" value="Repeating structural layouts (e.g., sidebar-content, topbar-sidebar-content, full-screen)"/>
              <field name="recognition_frequency" value="Pattern appears in 2+ features (stronger signal if across different modules)"/>
              <field name="recognition_similarity" value="Structural similarity in ASCII wireframes"/>
              <field name="recognition_semantic" value="Similar business purpose and interaction flow"/>
              <field name="output" var="identified_patterns"/>
            </block>
          </sequence>

          <!-- ============================================================
               Gateway: Check Identified Patterns
               ============================================================ -->
          <block type="gateway" id="G3" mode="exclusive" desc="Check if patterns were identified">
            <branch test="${identified_patterns.length} == 0" name="No patterns">
              <block type="event" id="E2" action="log" level="warn" desc="Log no patterns">No patterns identified from feature documents</block>
              <block type="task" id="B8" action="analyze" desc="Return empty result">
                <field name="status" value="completed"/>
                <field name="platform_id" value="${platform_id}"/>
                <field name="patterns_page_types" value='{"count": 0, "files": []}'/>
                <field name="patterns_components" value='{"count": 0, "files": []}'/>
                <field name="patterns_layouts" value='{"count": 0, "files": []}'/>
                <field name="total_patterns" value="0"/>
                <field name="output_path" value="${output_path}"/>
                <field name="output" var="summary"/>
              </block>
            </branch>
            <branch test="${identified_patterns.length} > 0" name="Has patterns">

              <!-- ============================================================
                   Step 5: Generate Pattern Documents
                   ============================================================ -->
              <block type="loop" id="L1" over="${identified_patterns}" as="pattern" desc="Generate pattern documents">

                <!-- 5.1 Template Selection -->
                <block type="gateway" id="G4" mode="exclusive" desc="Select template based on pattern category">
                  <branch test="${pattern.category} == 'page-types'" name="Page type">
                    <block type="task" id="B9" action="analyze" desc="Select page type template">
                      <field name="template_path" value="../speccrew-knowledge-bizs-ui-style-extract/templates/PAGE-TYPE-TEMPLATE.md"/>
                      <field name="output_directory" value="${output_path}/page-types/"/>
                      <field name="output" var="selected_template"/>
                    </block>
                  </branch>
                  <branch test="${pattern.category} == 'components'" name="Component pattern">
                    <block type="task" id="B10" action="analyze" desc="Select component pattern template">
                      <field name="template_path" value="../speccrew-knowledge-bizs-ui-style-extract/templates/COMPONENT-PATTERN-TEMPLATE.md"/>
                      <field name="output_directory" value="${output_path}/components/"/>
                      <field name="output" var="selected_template"/>
                    </block>
                  </branch>
                  <branch test="${pattern.category} == 'layouts'" name="Layout pattern">
                    <block type="task" id="B11" action="analyze" desc="Select layout pattern template">
                      <field name="template_path" value="../speccrew-knowledge-bizs-ui-style-extract/templates/LAYOUT-PATTERN-TEMPLATE.md"/>
                      <field name="output_directory" value="${output_path}/layouts/"/>
                      <field name="output" var="selected_template"/>
                    </block>
                  </branch>
                </block>

                <!-- 5.2 Copy Template to Document Path -->
                <block type="task" id="B12" action="run-script" desc="Copy template to output path">
                  <field name="template" value="${selected_template}"/>
                  <field name="filename_format" value="kebab-case (e.g., list-page.md, search-filter-bar.md, sidebar-content.md)"/>
                  <field name="output_path" value="${selected_template.output_directory}/${pattern.name}.md"/>
                  <field name="output" var="document_path"/>
                </block>

                <!-- 5.3 Fill Sections Using search_replace -->
                <block type="task" id="B13" action="analyze" desc="Fill pattern document sections">
                  <field name="document_path" value="${document_path}"/>
                  <field name="pattern" value="${pattern}"/>
                  <field name="language" value="${language}"/>
                  <field name="constraint_forbidden" value="Using create_file to rewrite the entire document"/>
                  <field name="constraint_mandatory" value="Use search_replace to fill each section individually"/>
                  <field name="constraint_sections" value="All section titles MUST be preserved"/>
                  <field name="content_ascii_wireframes" value="Must be generalized versions (not direct copies from specific features)"/>
                  <field name="content_instance_references" value="Must use relative paths to reference actual feature documents"/>
                  <field name="mermaid_rule" value="Follow speccrew-workspace/docs/rules/mermaid-rule.md rules"/>
                  <field name="mermaid_syntax" value="Use graph TB/LR syntax only"/>
                  <field name="mermaid_no_br" value="No br/ tags, no style definitions, no nested subgraph"/>
                  <field name="mermaid_no_direction" value="No direction keyword, no special symbols"/>
                  <field name="output" var="filled_document"/>
                </block>

                <!-- Checkpoint: Pattern Document Generated -->
                <block type="checkpoint" id="CP2" name="pattern-document-generated" desc="Pattern document generated">
                  <field name="file" value="${output_path}/.progress.json"/>
                  <field name="verify" value="file_exists(${document_path}) AND document_has_all_sections(${document_path})"/>
                </block>

              </block>

              <!-- Step 6: Return Summary -->
              <block type="task" id="B14" action="analyze" desc="Generate summary of pattern documents">
                <field name="collect_files" value="All generated file paths"/>
                <field name="collect_counts" value="Pattern counts by category"/>
                <field name="output" var="summary"/>
              </block>

            </branch>
          </block>

        </branch>
        <branch test="${completed_features.length} == 0" name="No completed features">
          <block type="event" id="E3" action="log" level="warn" desc="Log no features">No completed features found - returning empty result</block>
          <block type="task" id="B15" action="analyze" desc="Return empty summary">
            <field name="status" value="completed"/>
            <field name="platform_id" value="${platform_id}"/>
            <field name="patterns_page_types" value='{"count": 0, "files": []}'/>
            <field name="patterns_components" value='{"count": 0, "files": []}'/>
            <field name="patterns_layouts" value='{"count": 0, "files": []}'/>
            <field name="total_patterns" value="0"/>
            <field name="output_path" value="${output_path}"/>
            <field name="output" var="summary"/>
          </block>
        </branch>
      </block>

    </branch>
  </block>

  <!-- ============================================================
       Output Results
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="final_summary" from="${summary}" type="object" desc="Summary of generated pattern documents with file list and counts"/>
  </block>

</workflow>

## Generation Rules

1. **Pattern Quality**:
   - Each pattern must have clear applicable scenarios
   - Generalized ASCII wireframe (not feature-specific)
   - At least 2 instance references (from same or different modules)

2. **Template Compliance**:
   - All sections from template must be filled
   - Instance reference paths must be relative and valid

3. **Mermaid Compliance**:
   - Follow all rules in `mermaid-rule.md`
   - Use basic `graph TB` or `graph LR` syntax
   - No prohibited syntax elements

4. **Language Consistency**:
   - All content in the specified `language`
   - Template section headers remain in English
   - Content text matches user language

## Error Handling

| Scenario | Handling |
|----------|----------|
| No completed features | Return empty result, log warning |
| No patterns identified | Return empty result, log message |
| Template not found | Use default structure, log warning |
| Feature document missing | Skip feature, continue with others |

## Checklist

- [ ] Step 1: Features manifest loaded, completed features identified
- [ ] Step 2: All completed feature documents read
- [ ] Step 3: All module overviews read
- [ ] Step 4: Cross-module clustering analysis completed
- [ ] Step 5: Pattern documents generated with correct templates
- [ ] Step 5: File naming follows kebab-case convention
- [ ] Step 5: ASCII wireframes are generalized versions
- [ ] Step 5: Instance references use relative paths
- [ ] Step 5: Mermaid diagrams follow mermaid-rule.md
- [ ] Step 6: Summary returned with file list

## Return

After completion, return a summary object to the caller:

```json
{
  "status": "completed",
  "platform_id": "web-vue",
  "patterns": {
    "page_types": {
      "count": 3,
      "files": ["page-types/list-page.md", "page-types/form-page.md", "page-types/detail-page.md"]
    },
    "components": {
      "count": 2,
      "files": ["components/search-filter-bar.md", "components/modal-form.md"]
    },
    "layouts": {
      "count": 1,
      "files": ["layouts/sidebar-content.md"]
    }
  },
  "total_patterns": 6,
  "output_path": "speccrew-workspace/knowledges/techs/web-vue/ui-style-patterns/"
}
```
