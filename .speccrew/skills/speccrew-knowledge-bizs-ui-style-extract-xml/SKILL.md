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

<workflow>

  <!-- Input Block -->
  <input name="platform_id" type="string" required="true" description="Platform identifier (e.g., web-vue, mobile-uniapp)" />
  <input name="platform_type" type="string" required="true" description="Platform type (web, mobile, desktop)" />
  <input name="feature_docs_path" type="string" required="true" description="Completed feature documents base path" />
  <input name="features_manifest_path" type="string" required="true" description="Path to features-{platform}.json" />
  <input name="module_overviews_path" type="string" required="true" description="Parent directory containing all module overview subdirectories" />
  <input name="output_path" type="string" required="true" description="Output directory for pattern documents" />
  <input name="language" type="string" required="true" description="User language code" />

  <!-- Rule Block: Absolute Constraints -->
  <rule level="forbidden">Using `create_file` to write pattern documents directly</rule>
  <rule level="forbidden">Full-file rewrite of pattern documents</rule>
  <rule level="mandatory">Copy template MUST execute before filling sections for every pattern document</rule>
  <rule level="mandatory">All generated pattern documents must be in the specified language</rule>

  <!-- ==================== GLOBAL CONTINUOUS EXECUTION RULES ==================== -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" during execution</field>
    <field name="text">DO NOT offer options like "Full execution / Partial / Stop" — always execute ALL tasks to completion</field>
    <field name="text">DO NOT suggest "Due to context window limits, let me pause" — complete current task, use checkpoint for resumption</field>
    <field name="text">DO NOT estimate workload and suggest breaking it into phases — execute ALL items in sequence</field>
    <field name="text">DO NOT warn about "large number of files" or "this may take a while" — proceed with generation</field>
    <field name="text">Context window management: if approaching limit, save progress to checkpoint file and resume — do NOT ask user for guidance</field>
  </block>

  <!-- Gateway: Platform Type Check -->
  <gateway mode="exclusive">
    <branch condition="platform_type NOT IN ['web', 'mobile', 'desktop']">
      <event action="log">Skipping skill: backend platforms do not have UI patterns</event>
      <output name="skip_reason" value="Backend platform - no UI patterns" />
      <task name="return-skip" action="run-skill">
        <return>
          <status>skipped</status>
          <reason>Backend platform does not have UI patterns</reason>
        </return>
      </task>
    </branch>
    <branch condition="platform_type IN ['web', 'mobile', 'desktop']">

      <!-- Step 1: Load Features Manifest -->
      <task name="load-features-manifest" action="run-script">
        <description>Read the features manifest to identify all completed features</description>
        <validation>
          <rule>Verify features_manifest_path exists and is valid JSON</rule>
          <rule>Verify feature_docs_path exists and is a directory</rule>
        </validation>
        <script type="read-file">
          <path>{features_manifest_path}</path>
        </script>
        <filter>status === "completed"</filter>
        <collect>featureId, module, documentPath</collect>
        <output name="completed_features" />
      </task>

      <!-- Gateway: Check Completed Features -->
      <gateway mode="guard">
        <condition>completed_features.length > 0</condition>
        <then>

          <!-- Create Output Directory -->
          <task name="create-output-dirs" action="run-script">
            <description>Create output directory structure if it does not exist</description>
            <create-directories>
              <path>{output_path}/page-types/</path>
              <path>{output_path}/components/</path>
              <path>{output_path}/layouts/</path>
            </create-directories>
          </task>

          <!-- Step 2: Read Feature Documents -->
          <task name="read-feature-docs" action="run-skill">
            <description>Extract UI-related information from all completed feature documents</description>
            <input ref="completed_features" />
            <input ref="feature_docs_path" />
            <extraction>
              <section name="Interface Prototype">
                <extract>ASCII wireframe diagrams, layout regions</extract>
              </section>
              <section name="Page Elements Table">
                <extract>Component names, types, responsibilities, interactions</extract>
              </section>
              <section name="Business Flow Description">
                <extract>User interaction sequences, navigation patterns</extract>
              </section>
            </extraction>
            <output name="ui_extracted_data" />
          </task>

          <!-- Step 3: Read Module Overviews -->
          <task name="read-module-overviews" action="run-script">
            <description>Gather module-level aggregated information for context</description>
            <input ref="module_overviews_path" />
            <script type="glob">
              <pattern>{module_overviews_path}/*/module-overview.md</pattern>
            </script>
            <extraction>
              <item>Common page structures</item>
              <item>Shared components</item>
              <item>Navigation patterns</item>
            </extraction>
            <output name="module_context" />
          </task>

          <!-- Checkpoint: Data Collection Complete -->
          <checkpoint name="data-collection-complete" verify="ui_extracted_data is not empty AND module_context is not empty" />

          <!-- Step 4: Cross-Module Clustering Analysis -->
          <task name="cross-module-clustering" action="run-skill">
            <description>Identify recurring UI patterns across modules through clustering analysis</description>
            <input ref="ui_extracted_data" />
            <input ref="module_context" />
            <clustering-strategy>
              <approach>Dynamic discovery - Agent automatically identifies and categorizes pattern types based on actual analysis results</approach>
              <note>Templates only standardize output format, do not limit pattern types</note>
            </clustering-strategy>
            <categories>
              <page-types>Pages with similar structure and purpose (e.g., list-page, form-page, detail-page, tree-list-page, dashboard-page, wizard-page)</page-types>
              <component-patterns>Reusable component combinations (e.g., search-filter-bar, data-table-pagination, modal-form, drawer-detail, tab-panel)</component-patterns>
              <layout-patterns>Repeating structural layouts (e.g., sidebar-content, topbar-sidebar-content, full-screen)</layout-patterns>
            </categories>
            <recognition-criteria>
              <frequency>Pattern appears in 2+ features (stronger signal if across different modules)</frequency>
              <similarity>Structural similarity in ASCII wireframes</similarity>
              <semantic-alignment>Similar business purpose and interaction flow</semantic-alignment>
            </recognition-criteria>
            <note>Cross-module occurrence is a strong signal but not required. Patterns appearing in multiple features within a single module are also valid for extraction.</note>
            <output name="identified_patterns" />
          </task>

          <!-- Gateway: Check Identified Patterns -->
          <gateway mode="exclusive">
            <branch condition="identified_patterns.length == 0">
              <event action="log">No patterns identified from feature documents</event>
              <output name="patterns" value="{}" />
            </branch>
            <branch condition="identified_patterns.length > 0">

              <!-- Step 5: Generate Pattern Documents -->
              <loop over="identified_patterns" as="pattern">

                <!-- 5.1 Template Selection -->
                <gateway mode="exclusive">
                  <branch condition="pattern.category == 'page-types'">
                    <task name="select-page-template" action="run-script">
                      <template-path>../speccrew-knowledge-bizs-ui-style-extract/templates/PAGE-TYPE-TEMPLATE.md</template-path>
                      <output-directory>{output_path}/page-types/</output-directory>
                      <output name="selected_template" />
                    </task>
                  </branch>
                  <branch condition="pattern.category == 'components'">
                    <task name="select-component-template" action="run-script">
                      <template-path>../speccrew-knowledge-bizs-ui-style-extract/templates/COMPONENT-PATTERN-TEMPLATE.md</template-path>
                      <output-directory>{output_path}/components/</output-directory>
                      <output name="selected_template" />
                    </task>
                  </branch>
                  <branch condition="pattern.category == 'layouts'">
                    <task name="select-layout-template" action="run-script">
                      <template-path>../speccrew-knowledge-bizs-ui-style-extract/templates/LAYOUT-PATTERN-TEMPLATE.md</template-path>
                      <output-directory>{output_path}/layouts/</output-directory>
                      <output name="selected_template" />
                    </task>
                  </branch>
                </gateway>

                <!-- 5.2 Copy Template to Document Path -->
                <task name="copy-template" action="run-script">
                  <description>Copy template to output path with kebab-case filename</description>
                  <input ref="selected_template" />
                  <filename-format>kebab-case (e.g., list-page.md, search-filter-bar.md, sidebar-content.md)</filename-format>
                  <output-path>{selected_template.output-directory}/{pattern.name}.md</output-path>
                  <output name="document_path" />
                </task>

                <!-- 5.3 Fill Sections Using search_replace -->
                <task name="fill-pattern-document" action="run-skill">
                  <description>Fill pattern document sections using search_replace</description>
                  <input ref="document_path" />
                  <input ref="pattern" />
                  <input ref="language" />
                  <constraints>
                    <rule level="forbidden">Using create_file to rewrite the entire document</rule>
                    <rule level="mandatory">Use search_replace to fill each section individually</rule>
                    <rule level="mandatory">All section titles MUST be preserved</rule>
                  </constraints>
                  <content-requirements>
                    <ascii-wireframes>Must be generalized versions (not direct copies from specific features)</ascii-wireframes>
                    <instance-references>Must use relative paths to reference actual feature documents</instance-references>
                    <mermaid-diagrams>
                      <rule>Follow speccrew-workspace/docs/rules/mermaid-rule.md rules</rule>
                      <rule>Use graph TB/LR syntax only</rule>
                      <rule>No br/ tags, no style definitions, no nested subgraph</rule>
                      <rule>No direction keyword, no special symbols</rule>
                    </mermaid-diagrams>
                  </content-requirements>
                  <output name="filled_document" />
                </task>

                <!-- Checkpoint: Pattern Document Generated -->
                <checkpoint name="pattern-document-generated" verify="file_exists({document_path}) AND document_has_all_sections({document_path})" />

              </loop>

            </branch>
          </gateway>

          <!-- Step 6: Return Summary -->
          <task name="return-summary" action="run-skill">
            <description>Provide summary of generated pattern documents</description>
            <collect>
              <item>All generated file paths</item>
              <item>Pattern counts by category</item>
            </collect>
            <output name="summary" />
          </task>

        </then>
        <else>
          <event action="log">No completed features found - returning empty result</event>
          <output name="summary">
            <status>completed</status>
            <platform_id>{platform_id}</platform_id>
            <patterns>
              <page-types count="0" files="[]" />
              <components count="0" files="[]" />
              <layouts count="0" files="[]" />
            </patterns>
            <total_patterns>0</total_patterns>
            <output_path>{output_path}</output_path>
          </output>
        </else>
      </gateway>

    </branch>
  </gateway>

  <!-- Output Block -->
  <output name="final_summary" from="summary" description="Summary of generated pattern documents with file list and counts" />

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
