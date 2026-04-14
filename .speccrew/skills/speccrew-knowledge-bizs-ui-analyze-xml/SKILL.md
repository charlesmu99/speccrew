---
name: speccrew-knowledge-bizs-ui-analyze-xml
description: Analyze a single UI feature from source code to extract business functionality and generate feature documentation using XML Block workflow. Used by Worker Agent in parallel execution during knowledge base initialization Stage 2. Each worker analyzes one feature (e.g., one Vue/React page component).
tools: Read, Write, Edit, Glob, Grep, Bash
---

# UI Feature Analysis - Single Feature (XML Block Workflow)

> **CRITICAL CONSTRAINT**: DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.) under any circumstances. If execution encounters errors, STOP and report the exact error. Fixes must be applied to the Skill definition or source scripts — not patched at runtime.

Analyze one specific UI feature from source code, extract business functionality, and generate feature documentation. This skill operates at feature granularity - one worker per feature file.

## Trigger Scenarios

- "Analyze feature {fileName} from source code"
- "Extract UI functionality from feature {fileName}"
- "Generate documentation for feature {fileName}"
- "Analyze UI feature from features.json"

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{feature}}` | object | Complete feature object from features.json | - |
| `{{fileName}}` | string | Feature file name | `"index"`, `"UserForm"` |
| `{{sourcePath}}` | string | Relative path to source file | `"frontend-web/src/views/system/user/index.vue"` |
| `{{documentPath}}` | string | Target path for generated document | `"speccrew-workspace/knowledges/bizs/web-vue/src/views/system/user/index.md"` |
| `{{module}}` | string | Business module name (from feature.module) | `"system"`, `"trade"`, `"_root"` |
| `{{analyzed}}` | boolean | Analysis status flag | `true` / `false` |
| `{{platform_type}}` | string | Platform type | `"web"`, `"mobile"` |
| `{{platform_subtype}}` | string | Platform subtype | `"vue"`, `"react"` |
| `{{tech_stack}}` | array | Platform tech stack | `["vue", "typescript"]` |
| `{{language}}` | string | **REQUIRED** - Target language for generated content | `"zh"`, `"en"` |

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `{{language}}` parameter.

- `{{language}} == "zh"` → Generate all content in 中文
- `{{language}} == "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (feature names, descriptions, business rules) must be in the target language only.**

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `{{status}}` | string | Analysis status: `"success"`, `"partial"`, or `"failed"` |
| `{{feature_name}}` | string | Name of the analyzed feature |
| `{{generated_file}}` | string | Path to the generated documentation file |
| `{{message}}` | string | Summary message for status update |

## Output

**Generated Files (MANDATORY - Task is NOT complete until all files are written):**
1. `{{documentPath}}` - Feature documentation file

**Return Value (JSON format):**
```json
{
  "status": "success|partial|failed",
  "feature": {
    "fileName": "index",
    "sourcePath": "frontend-web/src/views/system/user/index.vue"
  },
  "platformType": "web",
  "module": "system",
  "featureName": "user-management",
  "generatedFile": "speccrew-workspace/knowledges/bizs/web-vue/src/views/system/user/index.md",
  "message": "Successfully analyzed user-management feature from index.vue"
}
```

> **Note**: Graph data construction (nodes, edges, marker files) is handled by `speccrew-knowledge-bizs-ui-graph` Skill. This Skill only generates feature documentation.

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

```xml
<workflow name="ui-feature-analysis" version="1.0">
  
  <!-- ==================== INPUT PARAMETERS ==================== -->
  <input name="feature" type="object" required="true" description="Complete feature object from features.json"/>
  <input name="fileName" type="string" required="true" description="Feature file name"/>
  <input name="sourcePath" type="string" required="true" description="Relative path to source file"/>
  <input name="documentPath" type="string" required="true" description="Target path for generated document"/>
  <input name="module" type="string" required="true" description="Business module name"/>
  <input name="analyzed" type="boolean" required="true" description="Analysis status flag"/>
  <input name="platform_type" type="string" required="true" description="Platform type: web, mobile, etc."/>
  <input name="platform_subtype" type="string" required="true" description="Platform subtype: vue, react, etc."/>
  <input name="tech_stack" type="array" required="true" description="Platform tech stack"/>
  <input name="language" type="string" required="true" description="Target language for generated content"/>
  
  <!-- ==================== CONSTRAINT RULES ==================== -->
  <rule level="forbidden" id="no-create-file-for-docs">
    NEVER use create_file to rewrite entire document. Documents MUST be created by copying template then filling with search_replace.
  </rule>
  <rule level="forbidden" id="no-file-deletion">
    NEVER delete generated files. If a file is malformed, fix it with search_replace.
  </rule>
  <rule level="forbidden" id="no-full-rewrite">
    NEVER rewrite entire document. Always use targeted search_replace on specific sections.
  </rule>
  <rule level="mandatory" id="template-first">
    Template copying (Step 5a) MUST execute before section filling (Step 5b).
  </rule>
  <rule level="mandatory" id="all-sections-filled">
    ALL sections in the template must be filled. Use "N/A" for unavailable data, never skip a section.
  </rule>
  <rule level="mandatory" id="language-compliance">
    ALL content MUST be generated in the language specified by {{language}} parameter.
  </rule>
  
  <!-- ==================== STEP 0: CHECK ANALYSIS STATUS ==================== -->
  <gateway name="check-analyzed-status" mode="exclusive">
    <branch condition="{{analyzed}} == true">
      <event action="log" level="info" message="Step 0 Status: SKIPPED (already analyzed)"/>
      <output name="status" value="skipped"/>
      <output name="message" value="Feature already analyzed, skipping"/>
      <checkpoint name="skip-complete" verify="true"/>
    </branch>
    <branch condition="{{analyzed}} == false">
      <event action="log" level="info" message="Step 0 Status: PROCEEDING (analysis required)"/>
    </branch>
  </gateway>
  
  <!-- ==================== STEP 1: READ ANALYSIS TEMPLATE ==================== -->
  <task name="step1-read-template" action="run-skill">
    <description>Read the appropriate template based on platform type</description>
    <parameter name="platform_type">{{platform_type}}</parameter>
    <parameter name="platform_subtype">{{platform_subtype}}</parameter>
    <script>
      <!-- Template Selection Logic -->
      <gateway name="template-selection" mode="exclusive">
        <branch condition="{{platform_type}} == 'mobile'">
          <output name="templateFile" value="../speccrew-knowledge-bizs-ui-analyze/templates/FEATURE-DETAIL-TEMPLATE-UI-MOBILE.md"/>
        </branch>
        <branch condition="{{platform_type}} == 'miniapp'">
          <output name="templateFile" value="../speccrew-knowledge-bizs-ui-analyze/templates/FEATURE-DETAIL-TEMPLATE-UI-MINIAPP.md"/>
        </branch>
        <branch condition="{{platform_type}} == 'desktop' AND {{platform_subtype}} == 'electron'">
          <output name="templateFile" value="../speccrew-knowledge-bizs-ui-analyze/templates/FEATURE-DETAIL-TEMPLATE-UI-ELECTRON.md"/>
        </branch>
        <branch condition="{{platform_type}} == 'desktop'">
          <output name="templateFile" value="../speccrew-knowledge-bizs-ui-analyze/templates/FEATURE-DETAIL-TEMPLATE-UI-DESKTOP.md"/>
        </branch>
        <branch condition="default">
          <output name="templateFile" value="../speccrew-knowledge-bizs-ui-analyze/templates/FEATURE-DETAIL-TEMPLATE-UI.md"/>
        </branch>
      </gateway>
      
      <!-- Read Template Content -->
      <task action="read-file" target="{{templateFile}}">
        <output name="templateContent" from="file.content"/>
      </task>
      
      <!-- Validate Template Structure -->
      <checkpoint name="template-loaded" verify="{{templateContent}} != null AND {{templateContent}} != ''"/>
      <event action="log" level="info" message="Step 1 Status: COMPLETED - Read template for {{platform_type}}/{{platform_subtype}}"/>
    </script>
  </task>
  
  <!-- ==================== STEP 2: READ FEATURE FILE AND ANALYZE UI STRUCTURE ==================== -->
  <task name="step2-read-source" action="run-skill">
    <description>Read feature file and analyze UI structure, components, props, state management</description>
    <parameter name="sourcePath">{{sourcePath}}</parameter>
    <script>
      <!-- Read Source File -->
      <task action="read-file" target="{{sourcePath}}">
        <output name="sourceContent" from="file.content"/>
        <output name="lineCount" from="file.lineCount"/>
      </task>
      
      <!-- Analyze UI Structure -->
      <task action="analyze-ui">
        <input name="content">{{sourceContent}}</input>
        <input name="tech_stack">{{tech_stack}}</input>
        <output name="componentCount" from="analysis.components"/>
        <output name="eventCount" from="analysis.events"/>
        <output name="apiCalls" from="analysis.apis"/>
        <output name="stateFields" from="analysis.state"/>
        <output name="formFields" from="analysis.forms"/>
      </task>
      
      <checkpoint name="source-analyzed" verify="{{sourceContent}} != null"/>
      <event action="log" level="info" message="Step 2 Status: COMPLETED - Read {{sourcePath}} ({{lineCount}} lines), Analyzed {{componentCount}} components, {{eventCount}} events"/>
    </script>
  </task>
  
  <!-- ==================== STEP 3: EXTRACT BUSINESS FEATURES ==================== -->
  <task name="step3-extract-features" action="run-skill">
    <description>Extract business features, wireframes, and business flows from source analysis</description>
    <parameter name="sourceContent">{{sourceContent}}</parameter>
    <parameter name="language">{{language}}</parameter>
    <script>
      <!-- Read Mermaid Rules -->
      <task action="read-file" target="speccrew-workspace/docs/rules/mermaid-rule.md">
        <output name="mermaidRules" from="file.content"/>
      </task>
      
      <!-- Extract Wireframes -->
      <task action="extract-wireframes">
        <input name="content">{{sourceContent}}</input>
        <input name="platform">{{platform_type}}</input>
        <output name="wireframes" from="extraction.wireframes"/>
        <output name="wireframeCount" from="extraction.count"/>
      </task>
      
      <!-- Extract Business Flows -->
      <task action="extract-flows">
        <input name="content">{{sourceContent}}</input>
        <input name="events">{{eventCount}}</input>
        <output name="flows" from="extraction.flows"/>
        <output name="flowCount" from="extraction.count"/>
        <output name="sequenceAnalysis" from="extraction.sequences"/>
        <output name="boundaryScenarios" from="extraction.boundaries"/>
      </task>
      
      <!-- Extract Data Bindings -->
      <task action="extract-data-bindings">
        <input name="stateFields">{{stateFields}}</input>
        <input name="formFields">{{formFields}}</input>
        <output name="dataBindingMap" from="extraction.bindings"/>
        <output name="reactiveDependencies" from="extraction.dependencies"/>
      </task>
      
      <checkpoint name="features-extracted" verify="{{flowCount}} &gt; 0 OR {{wireframeCount}} &gt; 0"/>
      <event action="log" level="info" message="Step 3 Status: COMPLETED - Extracted {{wireframeCount}} wireframes, {{flowCount}} business flows"/>
    </script>
  </task>
  
  <!-- ==================== STEP 4: FIND REFERENCING PAGES ==================== -->
  <task name="step4-find-references" action="run-skill">
    <description>Search other page files to find which pages reference/navigate to this page</description>
    <parameter name="fileName">{{fileName}}</parameter>
    <parameter name="sourcePath">{{sourcePath}}</parameter>
    <script>
      <!-- Search for Router Navigation -->
      <task action="grep-search">
        <input name="pattern">{{fileName}}</input>
        <input name="glob">*.{vue,tsx,jsx}</input>
        <output name="routerMatches" from="search.results"/>
      </task>
      
      <!-- Search for Component Imports -->
      <task action="grep-search">
        <input name="pattern">import.*{{fileName}}</input>
        <input name="glob">*.{vue,tsx,jsx,ts,js}</input>
        <output name="importMatches" from="search.results"/>
      </task>
      
      <!-- Compile Referencing Pages -->
      <task action="compile-references">
        <input name="routerMatches">{{routerMatches}}</input>
        <input name="importMatches">{{importMatches}}</input>
        <output name="referencingPages" from="compilation.pages"/>
        <output name="referenceCount" from="compilation.count"/>
      </task>
      
      <event action="log" level="info" message="Step 4 Status: COMPLETED - Found {{referenceCount}} referencing pages"/>
    </script>
  </task>
  
  <!-- ==================== STEP 5A: COPY TEMPLATE TO DOCUMENT PATH ==================== -->
  <task name="step5a-copy-template" action="run-skill">
    <description>Copy the appropriate template file to the target document path, replacing top-level placeholders</description>
    <parameter name="templateContent">{{templateContent}}</parameter>
    <parameter name="documentPath">{{documentPath}}</parameter>
    <parameter name="fileName">{{fileName}}</parameter>
    <parameter name="sourcePath">{{sourcePath}}</parameter>
    <parameter name="language">{{language}}</parameter>
    <script>
      <!-- Prepare Placeholder Replacements -->
      <task action="prepare-replacements">
        <output name="featureName" from="i18n.featureName"/>
        <output name="currentDate" from="date.now"/>
      </task>
      
      <!-- Replace Top-Level Placeholders -->
      <task action="replace-placeholders">
        <input name="template">{{templateContent}}</input>
        <replacements>
          <replacement from="{Feature Name}" to="{{featureName}}"/>
          <replacement from="{documentPath}" to="{{documentPath}}"/>
          <replacement from="{sourcePath}" to="{{sourcePath}}"/>
          <replacement from="{Date}" to="{{currentDate}}"/>
          <replacement from="{FeatureFile}.vue" to="{{fileName}}.vue"/>
        </replacements>
        <output name="documentSkeleton" from="result.content"/>
      </task>
      
      <!-- Write Document Skeleton -->
      <task action="create-file" target="{{documentPath}}">
        <content>{{documentSkeleton}}</content>
      </task>
      
      <checkpoint name="template-copied" verify="file.exists({{documentPath}})"/>
      <event action="log" level="info" message="Step 5a Status: COMPLETED - Template copied to {{documentPath}}"/>
    </script>
  </task>
  
  <!-- ==================== STEP 5B: FILL EACH SECTION USING SEARCH_REPLACE ==================== -->
  <task name="step5b-fill-sections" action="run-skill">
    <description>Fill each section of the copied template document using search_replace</description>
    <parameter name="documentPath">{{documentPath}}</parameter>
    <parameter name="analysisData">{{analysisData}}</parameter>
    <parameter name="language">{{language}}</parameter>
    <script>
      <!-- Section 1: Content Overview -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 1. Content Overview.*?(?=## 2.|$)</search>
        <replace>## 1. Content Overview

{{section1Content}}</replace>
      </task>
      
      <!-- Section 2: Interface Prototype -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 2. Interface Prototype.*?(?=## 3.|$)</search>
        <replace>## 2. Interface Prototype

{{wireframes}}

### Interface Element Description

{{elementDescriptions}}</replace>
      </task>
      
      <!-- Section 3: Business Flow -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 3. Business Flow.*?(?=## 4.|$)</search>
        <replace>## 3. Business Flow

{{businessFlows}}

### API Call Sequence Analysis

{{sequenceAnalysis}}

### Boundary Scenarios

{{boundaryScenarios}}</replace>
      </task>
      
      <!-- Section 4: Data Field Definition -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 4. Data Field Definition.*?(?=## 5.|$)</search>
        <replace>## 4. Data Field Definition

### Page State Fields

{{stateFieldsTable}}

### Form Fields

{{formFieldsTable}}

### Data Binding Mapping

{{dataBindingMap}}

### Reactive Dependency Chain

{{reactiveDependencies}}</replace>
      </task>
      
      <!-- Section 5: References -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 5. References.*?(?=## 6.|$)</search>
        <replace>## 5. References

### APIs

{{apiReferences}}

### Shared Methods

{{sharedMethods}}

### Shared Components

{{sharedComponents}}

### Other Pages

{{otherPages}}

### Referenced By

{{referencedBy}}</replace>
      </task>
      
      <!-- Section 6: Business Rule Constraints -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 6. Business Rule Constraints.*?(?=## 7.|$)</search>
        <replace>## 6. Business Rule Constraints

### Permission Rules

{{permissionRules}}

### Business Logic Rules

{{businessRules}}

### Validation Rules

{{validationRules}}</replace>
      </task>
      
      <!-- Section 7: Notes and Additional Information -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 7. Notes and Additional Information.*?(?=$)</search>
        <replace>## 7. Notes and Additional Information

{{notes}}

### Performance and Scalability Analysis

{{performanceAnalysis}}</replace>
      </task>
      
      <checkpoint name="all-sections-filled" verify="all.sections.filled"/>
      <event action="log" level="info" message="Step 5b Status: COMPLETED - All sections filled using search_replace"/>
    </script>
  </task>
  
  <!-- ==================== STEP 6: REPORT RESULTS ==================== -->
  <task name="step6-report" action="run-skill">
    <description>Return analysis result summary</description>
    <script>
      <output name="status" value="success"/>
      <output name="feature_name" value="{{fileName}}"/>
      <output name="generated_file" value="{{documentPath}}"/>
      <output name="message" value="Successfully analyzed {{fileName}} feature from {{sourcePath}}"/>
      
      <event action="log" level="info" message="Step 6 Status: COMPLETED - Analysis {{status}}: {{message}}"/>
    </script>
  </task>
  
  <!-- ==================== FINAL OUTPUT ==================== -->
  <output name="status" from="step6-report.status"/>
  <output name="feature" from="step6-report.feature"/>
  <output name="platformType" from="input.platform_type"/>
  <output name="module" from="input.module"/>
  <output name="featureName" from="step6-report.feature_name"/>
  <output name="generatedFile" from="step6-report.generated_file"/>
  <output name="message" from="step6-report.message"/>
  
  <!-- ==================== ERROR HANDLING ==================== -->
  <error-handler>
    <catch type="file-not-found">
      <event action="log" level="error" message="Source file not found: {{sourcePath}}"/>
      <output name="status" value="failed"/>
      <output name="message" value="Source file not found: {{sourcePath}}"/>
    </catch>
    <catch type="template-error">
      <event action="log" level="error" message="Template processing error"/>
      <output name="status" value="failed"/>
      <output name="message" value="Failed to process template"/>
    </catch>
    <catch type="validation-error">
      <event action="log" level="error" message="Validation failed: {{error.message}}"/>
      <output name="status" value="partial"/>
      <output name="message" value="Analysis completed with validation errors"/>
    </catch>
    <finally>
      <event action="log" level="info" message="Workflow execution completed"/>
    </finally>
  </error-handler>
  
</workflow>
```

## Constraints

1. **DO NOT analyze files outside the specified `{{sourcePath}}`**
2. **DO NOT generate separate documents for embedded components**
3. **All content MUST be in the language specified by `{{language}}`**
4. **Use `search_replace` for section filling, NEVER rewrite entire document**
5. **Mermaid diagrams MUST follow the rules in `mermaid-rule.md`**
6. **All links MUST use relative paths, NEVER `file://` protocol**

## Task Completion Report

When the task is complete, report the following:

**Status:** `success` | `partial` | `failed`

**Summary:**
- Feature analyzed: `{{feature_name}}`
- Document generated: `{{documentPath}}`
- Platform: `{{platform_type}}/{{platform_subtype}}`
- Module: `{{module}}`

**Files Generated:**
- `{{documentPath}}` - Feature documentation

**Note:** Graph data construction (nodes, edges, marker files) is handled by `speccrew-knowledge-bizs-ui-graph` Skill.

## Checklist

- [ ] Template file selected based on `{{platform_type}}`
- [ ] Template content read successfully
- [ ] Source file read and analyzed
- [ ] Business features extracted with wireframes
- [ ] Referencing pages found
- [ ] Template copied to document path
- [ ] All sections filled using search_replace
- [ ] All content in target language (`{{language}}`)
- [ ] Results reported in JSON format
