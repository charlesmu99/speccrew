---
name: speccrew-knowledge-bizs-api-analyze-xml
description: Analyze a single API controller from source code to extract business features and generate API documentation using XML Block workflow. Used by Worker Agent in parallel execution during knowledge base initialization Stage 2. Each worker analyzes one API controller file.
tools: Read, Write, Edit, Glob, Grep, Bash
---

# API Feature Analysis - Single Controller (XML Block Workflow)

> **CRITICAL CONSTRAINT**: DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.) under any circumstances. If execution encounters errors, STOP and report the exact error. Fixes must be applied to the Skill definition or source scripts — not patched at runtime.

Analyze one specific API controller from source code, extract all business features (API endpoints), and generate feature documentation. This skill operates at controller granularity - one worker per controller file.

## Trigger Scenarios

- "Analyze API controller {fileName} from source code"
- "Extract API features from controller {fileName}"
- "Generate documentation for API controller {fileName}"
- "Analyze API feature from features.json"

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{feature}}` | object | Complete feature object from features.json | - |
| `{{fileName}}` | string | Controller file name | `"UserController"`, `"OrderController"` |
| `{{sourcePath}}` | string | Relative path to source file | `"yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java"` |
| `{{documentPath}}` | string | Target path for generated document | `"speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md"` |
| `{{module}}` | string | Business module name (from feature.module) | `"system"`, `"trade"`, `"_root"` |
| `{{analyzed}}` | boolean | Analysis status flag | `true` / `false` |
| `{{platform_type}}` | string | Platform type | `"admin-api"`, `"app-api"` |
| `{{platform_subtype}}` | string | Platform subtype | `"spring-boot"`, `"java"` |
| `{{tech_stack}}` | array | Platform tech stack | `["java", "spring-boot", "mybatis-plus"]` |
| `{{completed_dir}}` | string | Marker files output directory | `"speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed"` |
| `{{sourceFile}}` | string | Source features JSON file name | `"features-admin-api.json"` |
| `{{language}}` | string | Target language for content | `"zh"`, `"en"` |

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
| `{{feature_name}}` | string | Name of the analyzed controller |
| `{{generated_file}}` | string | Path to the generated documentation file |
| `{{message}}` | string | Summary message for status update |

## Execution Requirements

This skill operates in **strict sequential execution mode**:
- Execute steps in exact order (Step 1 → Step 2 → ... → Step 7)
- Output step status after each step completion
- Do NOT skip any step

## Output

**Generated Files:**
1. `{{documentPath}}` - Controller documentation file
2. `{{completed_dir}}/{module}-{subpath}-{fileName}.done.json` - Completion status marker

**Graph Data Generation:**
Graph data (nodes, edges) construction is handled by `speccrew-knowledge-bizs-api-graph-xml` Skill.
After completing API analysis, dispatch will invoke the graph skill to generate `.graph.json` files.

**See Also:**
- `speccrew-knowledge-bizs-api-graph-xml` - Constructs knowledge graph data from API analysis results

**Return Value:**
```json
{
  "status": "success|partial|failed",
  "feature": {
    "fileName": "UserController",
    "sourcePath": "yudao-module-system/.../controller/admin/user/UserController.java"
  },
  "platformType": "admin-api",
  "module": "system",
  "featureName": "user-management-api",
  "generatedFile": "speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md",
  "message": "Successfully analyzed UserController with 8 API endpoints"
}
```

The return value is used by dispatch to update the feature status in `features-{platform}.json`.

## Execution Checklist

Before executing the workflow, verify the following inputs:

- Controller: `{{fileName}}` (`{{sourcePath}}`)
- Target: `{{documentPath}}`
- Language: `{{language}}`
- Module: `{{module}}`
- Platform: `{{platform_type}}`/`{{platform_subtype}}`
- Completed Dir: `{{completed_dir}}`
- Source File: `{{sourceFile}}`

## Workflow

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

```xml
<workflow name="api-controller-analysis" version="1.0">
  
  <!-- ==================== INPUT PARAMETERS ==================== -->
  <input name="feature" type="object" required="true" description="Complete feature object from features.json"/>
  <input name="fileName" type="string" required="true" description="Controller file name"/>
  <input name="sourcePath" type="string" required="true" description="Relative path to source file"/>
  <input name="documentPath" type="string" required="true" description="Target path for generated document"/>
  <input name="module" type="string" required="true" description="Business module name"/>
  <input name="analyzed" type="boolean" required="true" description="Analysis status flag"/>
  <input name="platform_type" type="string" required="true" description="Platform type: admin-api, app-api"/>
  <input name="platform_subtype" type="string" required="true" description="Platform subtype: spring-boot, java"/>
  <input name="tech_stack" type="array" required="true" description="Platform tech stack"/>
  <input name="completed_dir" type="string" required="true" description="Marker files output directory"/>
  <input name="sourceFile" type="string" required="true" description="Source features JSON file name"/>
  <input name="language" type="string" required="true" description="Target language for content"/>
  
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
  <rule level="mandatory" id="write-both-markers">
    MUST write both .done.json and .graph.json marker files in Step 7.
  </rule>
  <rule level="mandatory" id="marker-naming">
    Marker file names MUST follow pattern: {module}-{subpath}-{fileName}.done.json
  </rule>
  <rule level="mandatory" id="no-extension-in-filename">
    fileName in .done.json MUST NOT include file extension.
  </rule>
  <rule level="mandatory" id="relative-paths-only">
    ALL paths in JSON content MUST be relative, NEVER absolute paths.
  </rule>
  <rule level="mandatory" id="language-compliance">
    ALL content MUST be generated in the language specified by {{language}} parameter.
  </rule>
  
  <!-- ==================== STEP 0: CHECK ANALYSIS STATUS ==================== -->
  <gateway name="check-analyzed-status" mode="exclusive">
    <branch condition="{{analyzed}} == true">
      <event action="log" level="info" message="Step 0 Status: SKIPPED (already analyzed)"/>
      <output name="status" value="skipped"/>
      <output name="message" value="Controller already analyzed, skipping"/>
      <checkpoint name="skip-complete" verify="true"/>
    </branch>
    <branch condition="{{analyzed}} == false">
      <event action="log" level="info" message="Step 0 Status: PROCEEDING (analysis required)"/>
    </branch>
  </gateway>
  
  <!-- ==================== STEP 1: READ ANALYSIS TEMPLATE ==================== -->
  <task name="step1-read-template" action="run-skill">
    <description>Read the appropriate template based on tech stack</description>
    <parameter name="tech_stack">{{tech_stack}}</parameter>
    <script>
      <!-- Template Selection Logic -->
      <gateway name="template-selection" mode="exclusive">
        <branch condition="{{tech_stack}} contains 'fastapi' OR {{tech_stack}} contains 'python'">
          <output name="templateFile" value="../speccrew-knowledge-bizs-api-analyze/templates/FEATURE-DETAIL-TEMPLATE-FASTAPI.md"/>
        </branch>
        <branch condition="{{tech_stack}} contains 'dotnet' OR {{tech_stack}} contains '.net'">
          <output name="templateFile" value="../speccrew-knowledge-bizs-api-analyze/templates/FEATURE-DETAIL-TEMPLATE-NET.md"/>
        </branch>
        <branch condition="default">
          <output name="templateFile" value="../speccrew-knowledge-bizs-api-analyze/templates/FEATURE-DETAIL-TEMPLATE.md"/>
        </branch>
      </gateway>
      
      <!-- Read Template Content -->
      <task action="read-file" target="{{templateFile}}">
        <output name="templateContent" from="file.content"/>
        <output name="sectionCount" from="template.sections.count"/>
      </task>
      
      <!-- Validate Template Structure -->
      <checkpoint name="template-loaded" verify="{{templateContent}} != null AND {{templateContent}} != ''"/>
      <event action="log" level="info" message="Step 1 Status: COMPLETED - Template loaded, {{sectionCount}} sections identified for analysis"/>
    </script>
  </task>
  
  <!-- ==================== STEP 2: READ CONTROLLER AND ANALYZE API STRUCTURE ==================== -->
  <task name="step2-read-controller" action="run-skill">
    <description>Read controller file and analyze API handler structure</description>
    <parameter name="sourcePath">{{sourcePath}}</parameter>
    <parameter name="tech_stack">{{tech_stack}}</parameter>
    <script>
      <!-- Read Source File -->
      <task action="read-file" target="{{sourcePath}}">
        <output name="sourceContent" from="file.content"/>
        <output name="lineCount" from="file.lineCount"/>
      </task>
      
      <!-- Analyze API Structure Based on Tech Stack -->
      <gateway name="tech-specific-analysis" mode="exclusive">
        <branch condition="{{tech_stack}} contains 'java' OR {{tech_stack}} contains 'spring'">
          <task action="parse-spring-controller">
            <input name="content">{{sourceContent}}</input>
            <output name="endpoints" from="parser.endpoints"/>
            <output name="endpointCount" from="parser.endpointCount"/>
            <output name="services" from="parser.services"/>
            <output name="serviceCount" from="parser.serviceCount"/>
          </task>
        </branch>
        <branch condition="{{tech_stack}} contains 'fastapi' OR {{tech_stack}} contains 'python'">
          <task action="parse-fastapi-router">
            <input name="content">{{sourceContent}}</input>
            <output name="endpoints" from="parser.endpoints"/>
            <output name="endpointCount" from="parser.endpointCount"/>
            <output name="services" from="parser.services"/>
            <output name="serviceCount" from="parser.serviceCount"/>
          </task>
        </branch>
        <branch condition="{{tech_stack}} contains 'dotnet' OR {{tech_stack}} contains '.net'">
          <task action="parse-dotnet-controller">
            <input name="content">{{sourceContent}}</input>
            <output name="endpoints" from="parser.endpoints"/>
            <output name="endpointCount" from="parser.endpointCount"/>
            <output name="services" from="parser.services"/>
            <output name="serviceCount" from="parser.serviceCount"/>
          </task>
        </branch>
        <branch condition="default">
          <task action="parse-generic-controller">
            <input name="content">{{sourceContent}}</input>
            <output name="endpoints" from="parser.endpoints"/>
            <output name="endpointCount" from="parser.endpointCount"/>
            <output name="services" from="parser.services"/>
            <output name="serviceCount" from="parser.serviceCount"/>
          </task>
        </branch>
      </gateway>
      
      <checkpoint name="controller-analyzed" verify="{{sourceContent}} != null"/>
      <event action="log" level="info" message="Step 2 Status: COMPLETED - Read {{sourcePath}} ({{lineCount}} lines), Analyzed {{endpointCount}} endpoints, {{serviceCount}} services"/>
    </script>
  </task>
  
  <!-- ==================== STEP 3: EXTRACT API FEATURES ==================== -->
  <task name="step3-extract-features" action="run-skill">
    <description>Extract API features, business flows, and data structures from controller analysis</description>
    <parameter name="endpoints">{{endpoints}}</parameter>
    <parameter name="sourcePath">{{sourcePath}}</parameter>
    <parameter name="language">{{language}}</parameter>
    <script>
      <!-- Read Mermaid Rules -->
      <task action="read-file" target="speccrew-workspace/docs/rules/mermaid-rule.md">
        <output name="mermaidRules" from="file.content"/>
      </task>
      
      <!-- Extract Each API Endpoint Details -->
      <loop name="extract-endpoint-details" over="{{endpoints}}" as="endpoint">
        <task action="analyze-endpoint">
          <input name="endpoint">{{endpoint}}</input>
          <input name="tech_stack">{{tech_stack}}</input>
          <output name="requestDTO" from="analysis.requestDTO"/>
          <output name="responseDTO" from="analysis.responseDTO"/>
          <output name="businessFlow" from="analysis.flow"/>
          <output name="validationRules" from="analysis.validations"/>
        </task>
      </loop>
      
      <!-- Trace Backend Call Chain -->
      <task action="trace-call-chain">
        <input name="endpoints">{{endpoints}}</input>
        <input name="services">{{services}}</input>
        <input name="tech_stack">{{tech_stack}}</input>
        <output name="callChains" from="trace.chains"/>
        <output name="databaseTables" from="trace.tables"/>
        <output name="transactionBoundaries" from="trace.transactions"/>
        <output name="crossModuleCalls" from="trace.crossModules"/>
      </task>
      
      <!-- Generate Mermaid Flowcharts -->
      <task action="generate-flowcharts">
        <input name="endpoints">{{endpoints}}</input>
        <input name="callChains">{{callChains}}</input>
        <input name="mermaidRules">{{mermaidRules}}</input>
        <output name="flowcharts" from="generation.flowcharts"/>
        <output name="flowCount" from="generation.count"/>
      </task>
      
      <checkpoint name="features-extracted" verify="{{endpointCount}} &gt; 0"/>
      <event action="log" level="info" message="Step 3 Status: COMPLETED - Extracted {{endpointCount}} API endpoints, {{flowCount}} business flows"/>
    </script>
  </task>
  
  <!-- ==================== STEP 4: FIND API CONSUMERS ==================== -->
  <task name="step4-find-consumers" action="run-skill">
    <description>Search frontend page files to find which pages call the APIs in this controller</description>
    <parameter name="endpoints">{{endpoints}}</parameter>
    <parameter name="fileName">{{fileName}}</parameter>
    <script>
      <!-- Search for API Client Calls -->
      <task action="grep-search">
        <input name="pattern">{{fileName}}</input>
        <input name="glob">*.{vue,tsx,jsx,ts,js}</input>
        <output name="clientMatches" from="search.results"/>
      </task>
      
      <!-- Search for HTTP Requests to Controller Path -->
      <loop name="search-endpoint-paths" over="{{endpoints}}" as="endpoint">
        <task action="grep-search">
          <input name="pattern">{{endpoint.path}}</input>
          <input name="glob">*.{vue,tsx,jsx,ts,js}</input>
          <output name="pathMatches" from="search.results" accumulate="true"/>
        </task>
      </loop>
      
      <!-- Compile Consumer Pages -->
      <task action="compile-consumers">
        <input name="clientMatches">{{clientMatches}}</input>
        <input name="pathMatches">{{pathMatches}}</input>
        <output name="consumerPages" from="compilation.pages"/>
        <output name="consumerCount" from="compilation.count"/>
      </task>
      
      <event action="log" level="info" message="Step 4 Status: COMPLETED - Found {{consumerCount}} API consumers"/>
    </script>
  </task>
  
  <!-- ==================== STEP 5A: COPY TEMPLATE TO DOCUMENT PATH ==================== -->
  <task name="step5a-copy-template" action="run-skill">
    <description>Copy the appropriate template to the target document path and replace top-level placeholders</description>
    <parameter name="templateContent">{{templateContent}}</parameter>
    <parameter name="documentPath">{{documentPath}}</parameter>
    <parameter name="fileName">{{fileName}}</parameter>
    <parameter name="sourcePath">{{sourcePath}}</parameter>
    <parameter name="module">{{module}}</parameter>
    <script>
      <!-- Replace Top-Level Placeholders -->
      <task action="replace-placeholders">
        <input name="template">{{templateContent}}</input>
        <replacements>
          <replacement from="{Controller}" to="{{fileName}}"/>
          <replacement from="{sourcePath}" to="{{sourcePath}}"/>
          <replacement from="{documentPath}" to="{{documentPath}}"/>
          <replacement from="{module}" to="{{module}}"/>
          <replacement from="[Feature Name]" to="{{fileName}}"/>
        </replacements>
        <output name="documentSkeleton" from="result.content"/>
      </task>
      
      <!-- Create Document File -->
      <task action="create-file" target="{{documentPath}}">
        <content>{{documentSkeleton}}</content>
      </task>
      
      <!-- Verify Document Skeleton -->
      <task action="verify-structure">
        <input name="documentPath">{{documentPath}}</input>
        <output name="structureValid" from="verification.valid"/>
      </task>
      
      <checkpoint name="template-copied" verify="file.exists({{documentPath}}) AND {{structureValid}}"/>
      <event action="log" level="info" message="Step 5a Status: COMPLETED - Template copied to {{documentPath}}, ready for section filling"/>
    </script>
  </task>
  
  <!-- ==================== STEP 5B: FILL EACH SECTION USING SEARCH_REPLACE ==================== -->
  <task name="step5b-fill-sections" action="run-skill">
    <description>Fill each section of the document with actual data extracted from source code analysis</description>
    <parameter name="documentPath">{{documentPath}}</parameter>
    <parameter name="endpoints">{{endpoints}}</parameter>
    <parameter name="consumerPages">{{consumerPages}}</parameter>
    <parameter name="callChains">{{callChains}}</parameter>
    <parameter name="flowcharts">{{flowcharts}}</parameter>
    <parameter name="databaseTables">{{databaseTables}}</parameter>
    <parameter name="language">{{language}}</parameter>
    <script>
      <!-- Calculate Dynamic Path Prefix -->
      <task action="calculate-path-prefix">
        <input name="documentPath">{{documentPath}}</input>
        <output name="pathPrefix" from="calculation.prefix"/>
      </task>
      
      <!-- Section 1: Content Overview -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: OVERVIEW --></anchor>
        <replace>{{overviewContent}}</replace>
      </task>
      
      <!-- Section 2: API Endpoints -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: API_ENDPOINTS --></anchor>
        <replace>{{endpointDefinitions}}</replace>
      </task>
      
      <!-- Section 3: Data Fields -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: DATA_DEFINITION --></anchor>
        <replace>{{dataFieldDefinitions}}</replace>
      </task>
      
      <!-- Section 4: References -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: REFERENCES --></anchor>
        <replace>{{referencesContent}}</replace>
      </task>
      
      <!-- Section 5: Business Rules -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: BUSINESS_RULES --></anchor>
        <replace>{{businessRulesContent}}</replace>
      </task>
      
      <!-- Section 6: Dependencies -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: DEPENDENCIES --></anchor>
        <replace>{{dependenciesContent}}</replace>
      </task>
      
      <!-- Section 7: Performance -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: PERFORMANCE --></anchor>
        <replace>{{performanceContent}}</replace>
      </task>
      
      <!-- Section 8: Troubleshooting -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: TROUBLESHOOTING --></anchor>
        <replace>{{troubleshootingContent}}</replace>
      </task>
      
      <!-- Section 9: Notes -->
      <task action="search_replace" target="{{documentPath}}">
        <anchor><!-- AI-TAG: ADDITIONAL_NOTES --></anchor>
        <replace>{{additionalNotes}}</replace>
      </task>
      
      <!-- Section 10: Appendix -->
      <task action="search_replace" target="{{documentPath}}">
        <search>## 10. Appendix.*</search>
        <replace>## 10. Appendix

{{appendixContent}}</replace>
      </task>
      
      <!-- Get File Size -->
      <task action="get-file-size" target="{{documentPath}}">
        <output name="fileSize" from="file.size"/>
      </task>
      
      <checkpoint name="all-sections-filled" verify="all.sections.filled"/>
      <event action="log" level="info" message="Step 5b Status: COMPLETED - All sections filled at {{documentPath}} ({{fileSize}} bytes)"/>
    </script>
  </task>
  
  <!-- ==================== STEP 6: REPORT RESULTS ==================== -->
  <task name="step6-report" action="run-skill">
    <description>Return analysis result summary to dispatch</description>
    <script>
      <gateway name="determine-status" mode="exclusive">
        <branch condition="{{endpointCount}} == 0">
          <output name="status" value="failed"/>
          <output name="message" value="No API endpoints found in controller"/>
        </branch>
        <branch condition="{{errors}} != null AND {{errors.length}} &gt; 0">
          <output name="status" value="partial"/>
          <output name="message" value="Analysis completed with {{errors.length}} warnings"/>
        </branch>
        <branch condition="default">
          <output name="status" value="success"/>
          <output name="message" value="Successfully analyzed {{fileName}} with {{endpointCount}} API endpoints"/>
        </branch>
      </gateway>
      
      <output name="feature_name" value="{{fileName}}"/>
      <output name="generated_file" value="{{documentPath}}"/>
      
      <event action="log" level="info" message="Step 6 Status: COMPLETED - Analysis {{status}}: {{message}}"/>
    </script>
  </task>
  
  <!-- ==================== STEP 7: WRITE COMPLETION MARKERS ==================== -->
  <task name="step7-write-markers" action="run-skill">
    <description>Write analysis results to marker files for dispatch batch processing</description>
    <parameter name="completed_dir">{{completed_dir}}</parameter>
    <parameter name="module">{{module}}</parameter>
    <parameter name="sourcePath">{{sourcePath}}</parameter>
    <parameter name="fileName">{{fileName}}</parameter>
    <parameter name="sourceFile">{{sourceFile}}</parameter>
    <parameter name="documentPath">{{documentPath}}</parameter>
    <parameter name="status">{{status}}</parameter>
    <parameter name="message">{{message}}</parameter>
    <script>
      <!-- Calculate Subpath from Source Path -->
      <task action="calculate-subpath">
        <input name="sourcePath">{{sourcePath}}</input>
        <output name="subpath" from="calculation.subpath"/>
      </task>
      
      <!-- Generate Marker File Name -->
      <task action="generate-marker-name">
        <input name="module">{{module}}</input>
        <input name="subpath">{{subpath}}</input>
        <input name="fileName">{{fileName}}</input>
        <output name="markerName" from="generation.name"/>
      </task>
      
      <!-- Pre-write Verification -->
      <checkpoint name="pre-write-check" verify="{{fileName}} does-not-contain '.' AND {{sourceFile}} matches 'features-*.json'"/>
      
      <!-- Write .done.json File -->
      <task action="create-file" target="{{completed_dir}}/{{markerName}}.done.json">
        <content>{
  "fileName": "{{fileName}}",
  "sourcePath": "{{sourcePath}}",
  "sourceFile": "{{sourceFile}}",
  "module": "{{module}}",
  "documentPath": "{{documentPath}}",
  "status": "{{status}}",
  "analysisNotes": "{{message}}"
}</content>
      </task>
      
      <!-- Verify Marker File Written -->
      <checkpoint name="marker-written" verify="file.exists({{completed_dir}}/{{markerName}}.done.json)"/>
      
      <!-- Dispatch to Graph Skill for .graph.json -->
      <task name="dispatch-graph-generation" action="dispatch-to-worker">
        <skill>speccrew-knowledge-bizs-api-graph-xml</skill>
        <parameters>
          <parameter name="controllerFile">{{fileName}}</parameter>
          <parameter name="sourcePath">{{sourcePath}}</parameter>
          <parameter name="endpoints">{{endpoints}}</parameter>
          <parameter name="completed_dir">{{completed_dir}}</parameter>
          <parameter name="markerName">{{markerName}}</parameter>
        </parameters>
      </task>
      
      <event action="log" level="info" message="Step 7 Status: COMPLETED - Marker file written to {{completed_dir}}"/>
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
    <catch type="marker-write-error">
      <event action="log" level="error" message="Failed to write marker file: {{error.message}}"/>
      <output name="status" value="failed"/>
      <output name="message" value="Failed to write completion marker"/>
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

## Reference Guides

### Mermaid Guide

When generating Mermaid diagrams, follow compatibility guidelines:
- Use `graph TB` or `graph LR` syntax (not `flowchart`)
- No parentheses `()` in node text
- No HTML tags like `<br/>`
- No `style` definitions

### Business Flow Guidelines

- One diagram per API request
- Focus on business operations
- Refer to `templates/FEATURE-DETAIL-TEMPLATE.md`

## Constraints

1. **DO NOT analyze files outside the specified `{{sourcePath}}`**
2. **DO NOT generate separate documents for internal/private methods**
3. **All content MUST be in the language specified by `{{language}}`**
4. **Use `search_replace` for section filling, NEVER rewrite entire document**
5. **Mermaid diagrams MUST follow the rules in `mermaid-rule.md`**
6. **All links MUST use relative paths, NEVER `file://` protocol**
7. **Marker files MUST follow naming convention: `{module}-{subpath}-{fileName}.done.json`**
8. **fileName in .done.json MUST NOT include file extension**
9. **ALL paths in JSON MUST be relative, not absolute**

## Checklist

- [ ] Template file selected based on `{{tech_stack}}`
- [ ] Template content read successfully
- [ ] Controller file read and analyzed
- [ ] API endpoints extracted with business flows
- [ ] API consumers found
- [ ] Template copied to document path
- [ ] All sections filled using search_replace
- [ ] All content in target language (`{{language}}`)
- [ ] Results reported in JSON format
- [ ] .done.json marker file written successfully
- [ ] .graph.json generation dispatched to graph skill
