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
| `${feature}` | object | Complete feature object from features.json | - |
| `${fileName}` | string | Controller file name | `"UserController"`, `"OrderController"` |
| `${sourcePath}` | string | Relative path to source file | `"yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java"` |
| `${documentPath}` | string | Target path for generated document | `"speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md"` |
| `${module}` | string | Business module name (from feature.module) | `"system"`, `"trade"`, `"_root"` |
| `${analyzed}` | boolean | Analysis status flag | `true` / `false` |
| `${platform_type}` | string | Platform type | `"admin-api"`, `"app-api"` |
| `${platform_subtype}` | string | Platform subtype | `"spring-boot"`, `"java"` |
| `${tech_stack}` | array | Platform tech stack | `["java", "spring-boot", "mybatis-plus"]` |
| `${completed_dir}` | string | Marker files output directory | `"speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed"` |
| `${sourceFile}` | string | Source features JSON file name | `"features-admin-api.json"` |
| `${language}` | string | Target language for content | `"zh"`, `"en"` |

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `${language}` parameter.

- `${language} == "zh"` → Generate all content in 中文
- `${language} == "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (feature names, descriptions, business rules) must be in the target language only.**

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `${status}` | string | Analysis status: `"success"`, `"partial"`, or `"failed"` |
| `${feature_name}` | string | Name of the analyzed controller |
| `${generated_file}` | string | Path to the generated documentation file |
| `${message}` | string | Summary message for status update |

## Execution Requirements

This skill operates in **strict sequential execution mode**:
- Execute steps in exact order (Step 1 → Step 2 → ... → Step 7)
- Output step status after each step completion
- Do NOT skip any step

## Output

**Generated Files:**
1. `${documentPath}` - Controller documentation file
2. `${completed_dir}/{module}-{subpath}-{fileName}.done.json` - Completion status marker

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

- Controller: `${fileName}` (`${sourcePath}`)
- Target: `${documentPath}`
- Language: `${language}`
- Module: `${module}`
- Platform: `${platform_type}`/`${platform_subtype}`
- Completed Dir: `${completed_dir}`
- Source File: `${sourceFile}`

## Workflow

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/xml-workflow-spec.md`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="api-controller-analysis" status="pending" version="1.0" desc="API controller analysis workflow">
  
  <!-- ==================== INPUT PARAMETERS ==================== -->
  <block type="input" id="I1" desc="API controller analysis input parameters">
    <field name="feature" required="true" type="object" desc="Complete feature object from features.json"/>
    <field name="fileName" required="true" type="string" desc="Controller file name"/>
    <field name="sourcePath" required="true" type="string" desc="Relative path to source file"/>
    <field name="documentPath" required="true" type="string" desc="Target path for generated document"/>
    <field name="module" required="true" type="string" desc="Business module name"/>
    <field name="analyzed" required="true" type="boolean" desc="Analysis status flag"/>
    <field name="platform_type" required="true" type="string" desc="Platform type: admin-api, app-api"/>
    <field name="platform_subtype" required="true" type="string" desc="Platform subtype: spring-boot, java"/>
    <field name="tech_stack" required="true" type="array" desc="Platform tech stack"/>
    <field name="completed_dir" required="true" type="string" desc="Marker files output directory"/>
    <field name="sourceFile" required="true" type="string" desc="Source features JSON file name"/>
    <field name="language" required="true" type="string" desc="Target language for content"/>
  </block>
  
  <!-- ==================== CONSTRAINT RULES ==================== -->
  <block type="rule" id="R-FORB1" level="forbidden" desc="Document creation constraint">
    <field name="text">NEVER use create_file to rewrite entire document. Documents MUST be created by copying template then filling with search_replace.</field>
  </block>
  <block type="rule" id="R-FORB2" level="forbidden" desc="File deletion constraint">
    <field name="text">NEVER delete generated files. If a file is malformed, fix it with search_replace.</field>
  </block>
  <block type="rule" id="R-FORB3" level="forbidden" desc="Full rewrite constraint">
    <field name="text">NEVER rewrite entire document. Always use targeted search_replace on specific sections.</field>
  </block>
  <block type="rule" id="R-MAND1" level="mandatory" desc="Template-first constraint">
    <field name="text">Template copying (Step 5a) MUST execute before section filling (Step 5b).</field>
  </block>
  <block type="rule" id="R-MAND2" level="mandatory" desc="Marker files constraint">
    <field name="text">MUST write both .done.json and .graph.json marker files in Step 7.</field>
  </block>
  <block type="rule" id="R-MAND3" level="mandatory" desc="Marker naming constraint">
    <field name="text">Marker file names MUST follow pattern: {module}-{subpath}-{fileName}.done.json</field>
  </block>
  <block type="rule" id="R-MAND4" level="mandatory" desc="No extension in filename">
    <field name="text">fileName in .done.json MUST NOT include file extension.</field>
  </block>
  <block type="rule" id="R-MAND5" level="mandatory" desc="Relative paths constraint">
    <field name="text">ALL paths in JSON content MUST be relative, NEVER absolute paths.</field>
  </block>
  <block type="rule" id="R-MAND6" level="mandatory" desc="Language compliance">
    <field name="text">ALL content MUST be generated in the language specified by ${language} parameter.</field>
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
  
  <!-- ==================== STEP 0: CHECK ANALYSIS STATUS ==================== -->
  <block type="gateway" id="G0" mode="exclusive" desc="Check if already analyzed">
    <branch test="${analyzed} == true" name="Already analyzed">
      <block type="event" id="E1" action="log" level="info" desc="Log skip status">
        <field name="message" value="Step 0 Status: SKIPPED (already analyzed)"/>
      </block>
      <block type="output" id="O-skip" desc="Skip output">
        <field name="status" value="skipped"/>
        <field name="message" value="Controller already analyzed, skipping"/>
      </block>
      <block type="checkpoint" id="CP-skip" name="skip-complete" desc="Skip checkpoint">
        <field name="verify" value="true"/>
      </block>
    </branch>
    <branch test="${analyzed} == false" name="Analysis required">
      <block type="event" id="E2" action="log" level="info" desc="Log proceed status">
        <field name="message" value="Step 0 Status: PROCEEDING (analysis required)"/>
      </block>
    </branch>
  </block>
  
  <!-- ==================== STEP 1: READ ANALYSIS TEMPLATE ==================== -->
  <!-- Template Selection Logic -->
  <block type="gateway" id="G1" mode="exclusive" desc="Select template based on tech stack">
    <branch test="${tech_stack} contains 'fastapi' OR ${tech_stack} contains 'python'" name="FastAPI template">
      <block type="output" id="O-tpl1" desc="Set FastAPI template path">
        <field name="templateFile" value="../speccrew-knowledge-bizs-api-analyze/templates/FEATURE-DETAIL-TEMPLATE-FASTAPI.md"/>
      </block>
    </branch>
    <branch test="${tech_stack} contains 'dotnet' OR ${tech_stack} contains '.net'" name=".NET template">
      <block type="output" id="O-tpl2" desc="Set .NET template path">
        <field name="templateFile" value="../speccrew-knowledge-bizs-api-analyze/templates/FEATURE-DETAIL-TEMPLATE-NET.md"/>
      </block>
    </branch>
    <branch default="true" name="Default template">
      <block type="output" id="O-tpl3" desc="Set default template path">
        <field name="templateFile" value="../speccrew-knowledge-bizs-api-analyze/templates/FEATURE-DETAIL-TEMPLATE.md"/>
      </block>
    </branch>
  </block>
  
  <!-- Read Template Content -->
  <block type="task" id="B1" action="read-file" desc="Read selected template">
    <field name="target" value="${templateFile}"/>
    <field name="output" var="templateContent" from="file.content"/>
    <field name="output" var="sectionCount" from="template.sections.count"/>
  </block>
  
  <!-- Validate Template Structure -->
  <block type="checkpoint" id="CP1" name="template-loaded" desc="Template loaded successfully">
    <field name="verify" value="${templateContent} != null AND ${templateContent} != ''"/>
  </block>
  <block type="event" id="E3" action="log" level="info" desc="Log template status">
    <field name="message" value="Step 1 Status: COMPLETED - Template loaded, ${sectionCount} sections identified for analysis"/>
  </block>
  
  <!-- ==================== STEP 2: READ CONTROLLER AND ANALYZE API STRUCTURE ==================== -->
  <!-- Read Source File -->
  <block type="task" id="B2" action="read-file" desc="Read controller source file">
    <field name="target" value="${sourcePath}"/>
    <field name="output" var="sourceContent" from="file.content"/>
    <field name="output" var="lineCount" from="file.lineCount"/>
  </block>
  
  <!-- Analyze API Structure Based on Tech Stack -->
  <block type="gateway" id="G2" mode="exclusive" desc="Tech-specific API analysis">
    <branch test="${tech_stack} contains 'java' OR ${tech_stack} contains 'spring'" name="Spring/Java analysis">
      <block type="task" id="B3" action="parse-spring-controller" desc="Parse Spring controller">
        <field name="content" value="${sourceContent}"/>
        <field name="output" var="endpoints" from="parser.endpoints"/>
        <field name="output" var="endpointCount" from="parser.endpointCount"/>
        <field name="output" var="services" from="parser.services"/>
        <field name="output" var="serviceCount" from="parser.serviceCount"/>
      </block>
    </branch>
    <branch test="${tech_stack} contains 'fastapi' OR ${tech_stack} contains 'python'" name="FastAPI/Python analysis">
      <block type="task" id="B4" action="parse-fastapi-router" desc="Parse FastAPI router">
        <field name="content" value="${sourceContent}"/>
        <field name="output" var="endpoints" from="parser.endpoints"/>
        <field name="output" var="endpointCount" from="parser.endpointCount"/>
        <field name="output" var="services" from="parser.services"/>
        <field name="output" var="serviceCount" from="parser.serviceCount"/>
      </block>
    </branch>
    <branch test="${tech_stack} contains 'dotnet' OR ${tech_stack} contains '.net'" name=".NET analysis">
      <block type="task" id="B5" action="parse-dotnet-controller" desc="Parse .NET controller">
        <field name="content" value="${sourceContent}"/>
        <field name="output" var="endpoints" from="parser.endpoints"/>
        <field name="output" var="endpointCount" from="parser.endpointCount"/>
        <field name="output" var="services" from="parser.services"/>
        <field name="output" var="serviceCount" from="parser.serviceCount"/>
      </block>
    </branch>
    <branch default="true" name="Generic analysis">
      <block type="task" id="B6" action="parse-generic-controller" desc="Parse generic controller">
        <field name="content" value="${sourceContent}"/>
        <field name="output" var="endpoints" from="parser.endpoints"/>
        <field name="output" var="endpointCount" from="parser.endpointCount"/>
        <field name="output" var="services" from="parser.services"/>
        <field name="output" var="serviceCount" from="parser.serviceCount"/>
      </block>
    </branch>
  </block>
  
  <block type="checkpoint" id="CP2" name="controller-analyzed" desc="Controller analyzed successfully">
    <field name="verify" value="${sourceContent} != null"/>
  </block>
  <block type="event" id="E4" action="log" level="info" desc="Log controller status">
    <field name="message" value="Step 2 Status: COMPLETED - Read ${sourcePath} (${lineCount} lines), Analyzed ${endpointCount} endpoints, ${serviceCount} services"/>
  </block>
  
  <!-- ==================== STEP 3: EXTRACT API FEATURES ==================== -->
  <!-- Read Mermaid Rules -->
  <block type="task" id="B7" action="read-file" desc="Read Mermaid rules">
    <field name="target" value="speccrew-workspace/docs/rules/mermaid-rule.md"/>
    <field name="output" var="mermaidRules" from="file.content"/>
  </block>
  
  <!-- Extract Each API Endpoint Details -->
  <block type="loop" id="L1" over="${endpoints}" as="endpoint" desc="Extract endpoint details">
    <block type="task" id="B8" action="analyze-endpoint" desc="Analyze single endpoint">
      <field name="endpoint" value="${endpoint}"/>
      <field name="tech_stack" value="${tech_stack}"/>
      <field name="output" var="requestDTO" from="analysis.requestDTO"/>
      <field name="output" var="responseDTO" from="analysis.responseDTO"/>
      <field name="output" var="businessFlow" from="analysis.flow"/>
      <field name="output" var="validationRules" from="analysis.validations"/>
    </block>
  </block>
  
  <!-- Trace Backend Call Chain -->
  <block type="task" id="B9" action="trace-call-chain" desc="Trace call chains">
    <field name="endpoints" value="${endpoints}"/>
    <field name="services" value="${services}"/>
    <field name="tech_stack" value="${tech_stack}"/>
    <field name="output" var="callChains" from="trace.chains"/>
    <field name="output" var="databaseTables" from="trace.tables"/>
    <field name="output" var="transactionBoundaries" from="trace.transactions"/>
    <field name="output" var="crossModuleCalls" from="trace.crossModules"/>
  </block>
  
  <!-- Generate Mermaid Flowcharts -->
  <block type="task" id="B10" action="generate-flowcharts" desc="Generate Mermaid diagrams">
    <field name="endpoints" value="${endpoints}"/>
    <field name="callChains" value="${callChains}"/>
    <field name="mermaidRules" value="${mermaidRules}"/>
    <field name="output" var="flowcharts" from="generation.flowcharts"/>
    <field name="output" var="flowCount" from="generation.count"/>
  </block>
  
  <block type="checkpoint" id="CP3" name="features-extracted" desc="Features extracted successfully">
    <field name="verify" value="${endpointCount} > 0"/>
  </block>
  <block type="event" id="E5" action="log" level="info" desc="Log extraction status">
    <field name="message" value="Step 3 Status: COMPLETED - Extracted ${endpointCount} API endpoints, ${flowCount} business flows"/>
  </block>
  
  <!-- ==================== STEP 4: FIND API CONSUMERS ==================== -->
  <!-- Search for API Client Calls -->
  <block type="task" id="B11" action="grep-search" desc="Search for API client calls">
    <field name="pattern" value="${fileName}"/>
    <field name="glob" value="*.{vue,tsx,jsx,ts,js}"/>
    <field name="output" var="clientMatches" from="search.results"/>
  </block>
  
  <!-- Search for HTTP Requests to Controller Path -->
  <block type="loop" id="L2" over="${endpoints}" as="endpoint" desc="Search endpoint paths">
    <block type="task" id="B12" action="grep-search" desc="Search for endpoint path">
      <field name="pattern" value="${endpoint.path}"/>
      <field name="glob" value="*.{vue,tsx,jsx,ts,js}"/>
      <field name="output" var="pathMatches" from="search.results" accumulate="true"/>
    </block>
  </block>
  
  <!-- Compile Consumer Pages -->
  <block type="task" id="B13" action="compile-consumers" desc="Compile consumer pages">
    <field name="clientMatches" value="${clientMatches}"/>
    <field name="pathMatches" value="${pathMatches}"/>
    <field name="output" var="consumerPages" from="compilation.pages"/>
    <field name="output" var="consumerCount" from="compilation.count"/>
  </block>
  
  <block type="event" id="E6" action="log" level="info" desc="Log consumer status">
    <field name="message" value="Step 4 Status: COMPLETED - Found ${consumerCount} API consumers"/>
  </block>
  
  <!-- ==================== STEP 5A: COPY TEMPLATE TO DOCUMENT PATH ==================== -->
  <!-- Replace Top-Level Placeholders -->
  <block type="task" id="B14" action="replace-placeholders" desc="Replace template placeholders">
    <field name="template" value="${templateContent}"/>
    <field name="replacements">
      <replacement from="{Controller}" to="${fileName}"/>
      <replacement from="{sourcePath}" to="${sourcePath}"/>
      <replacement from="{documentPath}" to="${documentPath}"/>
      <replacement from="{module}" to="${module}"/>
      <replacement from="[Feature Name]" to="${fileName}"/>
    </field>
    <field name="output" var="documentSkeleton" from="result.content"/>
  </block>
  
  <!-- Create Document File -->
  <block type="task" id="B15" action="create-file" desc="Create document file">
    <field name="target" value="${documentPath}"/>
    <field name="content" value="${documentSkeleton}"/>
  </block>
  
  <!-- Verify Document Skeleton -->
  <block type="task" id="B16" action="verify-structure" desc="Verify document structure">
    <field name="documentPath" value="${documentPath}"/>
    <field name="output" var="structureValid" from="verification.valid"/>
  </block>
  
  <block type="checkpoint" id="CP4" name="template-copied" desc="Template copied successfully">
    <field name="verify" value="file.exists(${documentPath}) AND ${structureValid}"/>
  </block>
  <block type="event" id="E7" action="log" level="info" desc="Log template copy status">
    <field name="message" value="Step 5a Status: COMPLETED - Template copied to ${documentPath}, ready for section filling"/>
  </block>
  
  <!-- ==================== STEP 5-DYNAMIC: DYNAMIC SECTION GENERATION ==================== -->
  <!-- Dynamic Section Generation Rule -->
  <block type="rule" id="R-DYNAMIC-SECTIONS" level="mandatory" desc="Dynamic section generation rule">
    <field name="text">BEFORE filling template sections, you MUST first count identified items (endpoints, components, etc.) and dynamically create the corresponding number of sections in the document.</field>
    <field name="text">Step 1: Copy template skeleton to target path</field>
    <field name="text">Step 2: For each identified endpoint/component, insert a new numbered sub-section (e.g., 2.1, 2.2, 2.3...) into the document</field>
    <field name="text">Step 3: Fill each sub-section with the specific endpoint/component details</field>
    <field name="text">NEVER rely on fixed template sections alone — the number of sections MUST match the number of identified items</field>
  </block>
  
  <!-- Dynamically Generate Endpoint Sections -->
  <block type="loop" id="L-ENDPOINT-SECTIONS" over="${endpoints}" as="endpoint" desc="Dynamically generate a section for each API endpoint">
    <block type="task" id="B-EP-SECTION" action="generate" desc="Insert endpoint sub-section into document">
      <field name="target" value="${documentPath}"/>
      <field name="content">For endpoint ${endpoint.method} ${endpoint.path}: insert a ## 2.X sub-section containing Endpoint Information table, Request Parameters, Response Data, Business Flow, and Error Codes</field>
      <field name="output" var="section_${endpoint.index}"/>
    </block>
  </block>
  
  <!-- Verify Section Count Matches Endpoint Count -->
  <block type="checkpoint" id="CP-SECTIONS-COUNT" desc="Verify section count matches endpoint count">
    <field name="verify" value="Number of generated 2.X sections == ${endpoints.length}"/>
  </block>
  
  <block type="event" id="E-DYNAMIC" action="log" level="info" desc="Log dynamic sections status">
    <field name="message" value="Step 5-Dynamic Status: COMPLETED - Generated ${endpoints.length} endpoint sections dynamically"/>
  </block>
  
  <!-- ==================== STEP 5B: FILL EACH SECTION USING SEARCH_REPLACE ==================== -->
  <!-- Calculate Dynamic Path Prefix -->
  <block type="task" id="B17" action="calculate-path-prefix" desc="Calculate path prefix">
    <field name="documentPath" value="${documentPath}"/>
    <field name="output" var="pathPrefix" from="calculation.prefix"/>
  </block>
  
  <!-- Section 1: Content Overview -->
  <block type="task" id="B18" action="search_replace" desc="Fill overview section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: OVERVIEW -->"/>
    <field name="replace" value="${overviewContent}"/>
  </block>
  
  <!-- Section 2: API Endpoints -->
  <block type="task" id="B19" action="search_replace" desc="Fill API endpoints section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: API_ENDPOINTS -->"/>
    <field name="replace" value="${endpointDefinitions}"/>
  </block>
  
  <!-- Section 3: Data Fields -->
  <block type="task" id="B20" action="search_replace" desc="Fill data definition section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: DATA_DEFINITION -->"/>
    <field name="replace" value="${dataFieldDefinitions}"/>
  </block>
  
  <!-- Section 4: References -->
  <block type="task" id="B21" action="search_replace" desc="Fill references section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: REFERENCES -->"/>
    <field name="replace" value="${referencesContent}"/>
  </block>
  
  <!-- Section 5: Business Rules -->
  <block type="task" id="B22" action="search_replace" desc="Fill business rules section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: BUSINESS_RULES -->"/>
    <field name="replace" value="${businessRulesContent}"/>
  </block>
  
  <!-- Section 6: Dependencies -->
  <block type="task" id="B23" action="search_replace" desc="Fill dependencies section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: DEPENDENCIES -->"/>
    <field name="replace" value="${dependenciesContent}"/>
  </block>
  
  <!-- Section 7: Performance -->
  <block type="task" id="B24" action="search_replace" desc="Fill performance section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: PERFORMANCE -->"/>
    <field name="replace" value="${performanceContent}"/>
  </block>
  
  <!-- Section 8: Troubleshooting -->
  <block type="task" id="B25" action="search_replace" desc="Fill troubleshooting section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: TROUBLESHOOTING -->"/>
    <field name="replace" value="${troubleshootingContent}"/>
  </block>
  
  <!-- Section 9: Notes -->
  <block type="task" id="B26" action="search_replace" desc="Fill additional notes section">
    <field name="target" value="${documentPath}"/>
    <field name="anchor" value="<!-- AI-TAG: ADDITIONAL_NOTES -->"/>
    <field name="replace" value="${additionalNotes}"/>
  </block>
  
  <!-- Section 10: Appendix -->
  <block type="task" id="B27" action="search_replace" desc="Fill appendix section">
    <field name="target" value="${documentPath}"/>
    <field name="search" value="## 10. Appendix.*"/>
    <field name="replace" value="## 10. Appendix&#10;&#10;${appendixContent}"/>
  </block>
  
  <!-- Get File Size -->
  <block type="task" id="B28" action="get-file-size" desc="Get generated file size">
    <field name="target" value="${documentPath}"/>
    <field name="output" var="fileSize" from="file.size"/>
  </block>
  
  <block type="checkpoint" id="CP5" name="all-sections-filled" desc="All sections filled">
    <field name="verify" value="all.sections.filled"/>
  </block>
  <block type="event" id="E8" action="log" level="info" desc="Log sections filled status">
    <field name="message" value="Step 5b Status: COMPLETED - All sections filled at ${documentPath} (${fileSize} bytes)"/>
  </block>
  
  <!-- ==================== STEP 6: REPORT RESULTS ==================== -->
  <block type="gateway" id="G3" mode="exclusive" desc="Determine analysis status">
    <branch test="${endpointCount} == 0" name="No endpoints">
      <block type="output" id="O-fail" desc="Failed output">
        <field name="status" value="failed"/>
        <field name="message" value="No API endpoints found in controller"/>
      </block>
    </branch>
    <branch test="${errors} != null AND ${errors.length} > 0" name="Partial success">
      <block type="output" id="O-partial" desc="Partial output">
        <field name="status" value="partial"/>
        <field name="message" value="Analysis completed with ${errors.length} warnings"/>
      </block>
    </branch>
    <branch default="true" name="Success">
      <block type="output" id="O-success" desc="Success output">
        <field name="status" value="success"/>
        <field name="message" value="Successfully analyzed ${fileName} with ${endpointCount} API endpoints"/>
      </block>
    </branch>
  </block>
  
  <block type="output" id="O-vals" desc="Feature outputs">
    <field name="feature_name" value="${fileName}"/>
    <field name="generated_file" value="${documentPath}"/>
  </block>
  
  <block type="event" id="E9" action="log" level="info" desc="Log report status">
    <field name="message" value="Step 6 Status: COMPLETED - Analysis ${status}: ${message}"/>
  </block>
  
  <!-- ==================== STEP 7: WRITE COMPLETION MARKERS ==================== -->
  <!-- Calculate Subpath from Source Path -->
  <block type="task" id="B29" action="calculate-subpath" desc="Calculate subpath">
    <field name="sourcePath" value="${sourcePath}"/>
    <field name="output" var="subpath" from="calculation.subpath"/>
  </block>
  
  <!-- Generate Marker File Name -->
  <block type="task" id="B30" action="generate-marker-name" desc="Generate marker name">
    <field name="module" value="${module}"/>
    <field name="subpath" value="${subpath}"/>
    <field name="fileName" value="${fileName}"/>
    <field name="output" var="markerName" from="generation.name"/>
  </block>
  
  <!-- Pre-write Verification -->
  <block type="checkpoint" id="CP6" name="pre-write-check" desc="Pre-write verification">
    <field name="verify" value="${fileName} does-not-contain '.' AND ${sourceFile} matches 'features-*.json'"/>
  </block>
  
  <!-- Write .done.json File -->
  <block type="task" id="B31" action="create-file" desc="Write done marker file">
    <field name="target" value="${completed_dir}/${markerName}.done.json"/>
    <field name="content" value="{
  &quot;fileName&quot;: &quot;${fileName}&quot;,
  &quot;sourcePath&quot;: &quot;${sourcePath}&quot;,
  &quot;sourceFile&quot;: &quot;${sourceFile}&quot;,
  &quot;module&quot;: &quot;${module}&quot;,
  &quot;documentPath&quot;: &quot;${documentPath}&quot;,
  &quot;status&quot;: &quot;${status}&quot;,
  &quot;analysisNotes&quot;: &quot;${message}&quot;
}"/>
  </block>
  
  <!-- Verify Marker File Written -->
  <block type="checkpoint" id="CP7" name="marker-written" desc="Marker file written">
    <field name="verify" value="file.exists(${completed_dir}/${markerName}.done.json)"/>
  </block>
  
  <!-- Dispatch to Graph Skill for .graph.json -->
  <block type="task" id="B32" action="dispatch-to-worker" desc="Dispatch graph generation">
    <field name="skill">speccrew-knowledge-bizs-api-graph-xml</field>
    <field name="parameters">
      <field name="controllerFile">${fileName}</field>
      <field name="sourcePath">${sourcePath}</field>
      <field name="endpoints">${endpoints}</field>
      <field name="completed_dir">${completed_dir}</field>
      <field name="markerName">${markerName}</field>
    </field>
  </block>
  
  <block type="event" id="E10" action="log" level="info" desc="Log marker status">
    <field name="message" value="Step 7 Status: COMPLETED - Marker file written to ${completed_dir}"/>
  </block>
  
  <!-- ==================== FINAL OUTPUT ==================== -->
  <block type="output" id="O1" desc="Final workflow outputs">
    <field name="status" from="step6-report.status"/>
    <field name="feature" from="step6-report.feature"/>
    <field name="platformType" from="input.platform_type"/>
    <field name="module" from="input.module"/>
    <field name="featureName" from="step6-report.feature_name"/>
    <field name="generatedFile" from="step6-report.generated_file"/>
    <field name="message" from="step6-report.message"/>
  </block>
  
  <!-- ==================== ERROR HANDLING ==================== -->
  <block type="error-handler" id="EH1" desc="Global error handling">
    <catch error-type="file-not-found">
      <block type="event" id="E-err1" action="log" level="error" desc="Log file not found">
        <field name="message" value="Source file not found: ${sourcePath}"/>
      </block>
      <block type="output" id="O-err1" desc="Error output">
        <field name="status" value="failed"/>
        <field name="message" value="Source file not found: ${sourcePath}"/>
      </block>
    </catch>
    <catch error-type="template-error">
      <block type="event" id="E-err2" action="log" level="error" desc="Log template error">
        <field name="message" value="Template processing error"/>
      </block>
      <block type="output" id="O-err2" desc="Error output">
        <field name="status" value="failed"/>
        <field name="message" value="Failed to process template"/>
      </block>
    </catch>
    <catch error-type="marker-write-error">
      <block type="event" id="E-err3" action="log" level="error" desc="Log marker write error">
        <field name="message" value="Failed to write marker file: ${error.message}"/>
      </block>
      <block type="output" id="O-err3" desc="Error output">
        <field name="status" value="failed"/>
        <field name="message" value="Failed to write completion marker"/>
      </block>
    </catch>
    <catch error-type="validation-error">
      <block type="event" id="E-err4" action="log" level="error" desc="Log validation error">
        <field name="message" value="Validation failed: ${error.message}"/>
      </block>
      <block type="output" id="O-err4" desc="Partial output">
        <field name="status" value="partial"/>
        <field name="message" value="Analysis completed with validation errors"/>
      </block>
    </catch>
    <finally>
      <block type="event" id="E-finally" action="log" level="info" desc="Log workflow complete">
        <field name="message" value="Workflow execution completed"/>
      </block>
    </finally>
  </block>
  
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

1. **DO NOT analyze files outside the specified `${sourcePath}`**
2. **DO NOT generate separate documents for internal/private methods**
3. **All content MUST be in the language specified by `${language}`**
4. **Use `search_replace` for section filling, NEVER rewrite entire document**
5. **Mermaid diagrams MUST follow the rules in `mermaid-rule.md`**
6. **All links MUST use relative paths, NEVER `file://` protocol**
7. **Marker files MUST follow naming convention: `{module}-{subpath}-{fileName}.done.json`**
8. **fileName in .done.json MUST NOT include file extension**
9. **ALL paths in JSON MUST be relative, not absolute**

## Checklist

- [ ] Template file selected based on `${tech_stack}`
- [ ] Template content read successfully
- [ ] Controller file read and analyzed
- [ ] API endpoints extracted with business flows
- [ ] API consumers found
- [ ] Template copied to document path
- [ ] All sections filled using search_replace
- [ ] All content in target language (`${language}`)
- [ ] Results reported in JSON format
- [ ] .done.json marker file written successfully
- [ ] .graph.json generation dispatched to graph skill
