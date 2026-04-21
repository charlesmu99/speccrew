---
name: speccrew-knowledge-bizs-ui-analyze
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

> **Note**: Graph data (.graph.json) is handled by `speccrew-knowledge-bizs-ui-graph` Skill. This Skill generates feature documentation AND writes `.done.json` completion marker.

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

  <!-- ==================== INPUT PARAMETERS ==================== -->
  <block type="input" id="I1" desc="UI feature analysis input parameters">
    <field name="feature" required="true" type="object" desc="Complete feature object from features.json"/>
    <field name="fileName" required="true" type="string" desc="Feature file name"/>
    <field name="sourcePath" required="true" type="string" desc="Relative path to source file"/>
    <field name="documentPath" required="true" type="string" desc="Target path for generated document"/>
    <field name="module" required="true" type="string" desc="Business module name"/>
    <field name="analyzed" required="true" type="boolean" desc="Analysis status flag"/>
    <field name="platform_type" required="true" type="string" desc="Platform type: web, mobile, etc."/>
    <field name="platform_subtype" required="true" type="string" desc="Platform subtype: vue, react, etc."/>
    <field name="tech_stack" required="true" type="array" desc="Platform tech stack"/>
    <field name="language" required="true" type="string" desc="Target language for generated content"/>
    <field name="completed_dir" required="true" type="string" desc="Marker file output directory"/>
    <field name="workspace_path" required="true" type="string" desc="Workspace root path"/>
    <field name="sync_state_bizs_dir" required="true" type="string" desc="Sync state directory path"/>
    <field name="sourceFile" required="true" type="string" desc="Source features JSON filename"/>
  </block>

  <!-- ==================== CONSTRAINT RULES ==================== -->
  <block type="rule" id="R1" level="forbidden" desc="Document generation constraints">
    <field name="text">NEVER use create_file to rewrite entire document. Documents MUST be created by copying template then filling with search_replace.</field>
  </block>
  <block type="rule" id="R2" level="forbidden" desc="File deletion constraint">
    <field name="text">NEVER delete generated files. If a file is malformed, fix it with search_replace.</field>
  </block>
  <block type="rule" id="R3" level="forbidden" desc="Full rewrite constraint">
    <field name="text">NEVER rewrite entire document. Always use targeted search_replace on specific sections.</field>
  </block>
  <block type="rule" id="R4" level="mandatory" desc="Template-first workflow">
    <field name="text">Template copying (Step 5a) MUST execute before section filling (Step 5b).</field>
  </block>
  <block type="rule" id="R5" level="mandatory" desc="All sections filled">
    <field name="text">ALL sections in the template must be filled. Use "N/A" for unavailable data, never skip a section.</field>
  </block>
  <block type="rule" id="R6" level="mandatory" desc="Language compliance">
    <field name="text">ALL content MUST be generated in the language specified by {{language}} parameter.</field>
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
  <sequence id="S0" name="Step 0: Check Analysis Status" status="pending" desc="Check if feature has already been analyzed">
    <block type="gateway" id="G0" mode="exclusive" desc="Check analyzed status">
      <branch test="${analyzed} == true" name="Already analyzed">
        <block type="event" id="E0a" action="log" level="info" desc="Skip already analyzed feature">
          <field name="message">Step 0 Status: SKIPPED (already analyzed)</field>
        </block>
        <block type="output" id="O0a" desc="Skip output">
          <field name="status" value="skipped"/>
          <field name="message" value="Feature already analyzed, skipping"/>
        </block>
        <block type="checkpoint" id="CP0" name="skip-complete" desc="Skip checkpoint">
          <field name="verify" value="true"/>
        </block>
      </branch>
      <branch test="${analyzed} == false" name="Proceed with analysis">
        <block type="event" id="E0b" action="log" level="info" desc="Proceed with analysis">
          <field name="message">Step 0 Status: PROCEEDING (analysis required)</field>
        </block>
      </branch>
    </block>
  </sequence>

  <!-- ==================== STEP 1: READ ANALYSIS TEMPLATE ==================== -->
  <sequence id="S1" name="Step 1: Read Template" status="pending" desc="Read the appropriate template based on platform type">
    <!-- Template Selection Logic -->
    <block type="gateway" id="G1" mode="exclusive" desc="Select template based on platform type">
      <branch test="${platform_type} == 'mobile'" name="Mobile template">
        <field name="templateFile" value="./templates/FEATURE-DETAIL-TEMPLATE-UI-MOBILE.md"/>
      </branch>
      <branch test="${platform_type} == 'miniapp'" name="Miniapp template">
        <field name="templateFile" value="./templates/FEATURE-DETAIL-TEMPLATE-UI-MINIAPP.md"/>
      </branch>
      <branch test="${platform_type} == 'desktop' AND ${platform_subtype} == 'electron'" name="Electron template">
        <field name="templateFile" value="./templates/FEATURE-DETAIL-TEMPLATE-UI-ELECTRON.md"/>
      </branch>
      <branch test="${platform_type} == 'desktop'" name="Desktop template">
        <field name="templateFile" value="./templates/FEATURE-DETAIL-TEMPLATE-UI-DESKTOP.md"/>
      </branch>
      <branch default="true" name="Default Web template">
        <field name="templateFile" value="./templates/FEATURE-DETAIL-TEMPLATE-UI.md"/>
      </branch>
    </block>

    <!-- Read Template Content -->
    <block type="task" id="B1" action="read-file" desc="Read template content">
      <field name="path" value="${templateFile}"/>
      <field name="output" var="templateContent"/>
    </block>

    <!-- Validate Template Structure -->
    <block type="checkpoint" id="CP1" name="template-loaded" desc="Template loaded checkpoint">
      <field name="verify" value="${templateContent} != null AND ${templateContent} != ''"/>
    </block>
    <block type="event" id="E1" action="log" level="info" desc="Log template read">
      <field name="message">Step 1 Status: COMPLETED - Read template for ${platform_type}/${platform_subtype}</field>
    </block>
  </sequence>

  <!-- ==================== STEP 2: READ FEATURE FILE AND ANALYZE UI STRUCTURE ==================== -->
  <sequence id="S2" name="Step 2: Read Source" status="pending" desc="Read feature file and analyze UI structure">
    <!-- Read Source File -->
    <block type="task" id="B2" action="read-file" desc="Read source file">
      <field name="path" value="${sourcePath}"/>
      <field name="output" var="sourceContent"/>
    </block>

    <!-- Analyze UI Structure -->
    <block type="task" id="B2b" action="analyze" desc="Analyze UI structure">
      <field name="content" value="${sourceContent}"/>
      <field name="tech_stack" value="${tech_stack}"/>
      <field name="output" var="analysisResult"/>
      <field name="componentCount" from="${analysisResult.components.length}"/>
      <field name="eventCount" from="${analysisResult.events.length}"/>
      <field name="apiCalls" from="${analysisResult.apis}"/>
      <field name="stateFields" from="${analysisResult.state}"/>
      <field name="formFields" from="${analysisResult.forms}"/>
    </block>

    <block type="checkpoint" id="CP2" name="source-analyzed" desc="Source analyzed checkpoint">
      <field name="verify" value="${sourceContent} != null"/>
    </block>
    <block type="event" id="E2" action="log" level="info" desc="Log source analysis">
      <field name="message">Step 2 Status: COMPLETED - Read ${sourcePath}, Analyzed ${componentCount} components, ${eventCount} events</field>
    </block>
  </sequence>

  <!-- ==================== STEP 3: EXTRACT BUSINESS FEATURES ==================== -->
  <sequence id="S3" name="Step 3: Extract Features" status="pending" desc="Extract business features and flows">
    <!-- Read Mermaid Rules -->
    <block type="task" id="B3a" action="read-file" desc="Read Mermaid rules">
      <field name="path" value="speccrew-workspace/docs/rules/mermaid-rule.md"/>
      <field name="output" var="mermaidRules"/>
    </block>

    <!-- Extract Wireframes -->
    <block type="task" id="B3b" action="analyze" desc="Extract wireframes">
      <field name="content" value="${sourceContent}"/>
      <field name="platform" value="${platform_type}"/>
      <field name="output" var="wireframes"/>
    </block>

    <!-- Extract Business Flows -->
    <block type="task" id="B3c" action="analyze" desc="Extract business flows">
      <field name="content" value="${sourceContent}"/>
      <field name="events" value="${eventCount}"/>
      <field name="output" var="flows"/>
      <field name="sequenceAnalysis" from="${flows.sequences}"/>
      <field name="boundaryScenarios" from="${flows.boundaries}"/>
    </block>

    <!-- Extract Data Bindings -->
    <block type="task" id="B3d" action="analyze" desc="Extract data bindings">
      <field name="stateFields" value="${stateFields}"/>
      <field name="formFields" value="${formFields}"/>
      <field name="output" var="dataBindingMap"/>
      <field name="reactiveDependencies" from="${dataBindingMap.dependencies}"/>
    </block>

    <block type="checkpoint" id="CP3" name="features-extracted" desc="Features extracted checkpoint">
      <field name="verify" value="${flows.length} > 0 OR ${wireframes.length} > 0"/>
    </block>
    <block type="event" id="E3" action="log" level="info" desc="Log feature extraction">
      <field name="message">Step 3 Status: COMPLETED - Extracted ${wireframes.length} wireframes, ${flows.length} business flows</field>
    </block>
  </sequence>

  <!-- ==================== STEP 4: FIND REFERENCING PAGES ==================== -->
  <sequence id="S4" name="Step 4: Find References" status="pending" desc="Find referencing pages">
    <!-- Search for Router Navigation -->
    <block type="task" id="B4a" action="run-script" desc="Search router references">
      <field name="command">grep -r "${fileName}" --include="*.{vue,tsx,jsx}" "${sourcePath}/.."</field>
      <field name="output" var="routerMatches"/>
    </block>

    <!-- Search for Component Imports -->
    <block type="task" id="B4b" action="run-script" desc="Search import references">
      <field name="command">grep -r "import.*${fileName}" --include="*.{vue,tsx,jsx,ts,js}" "${sourcePath}/.."</field>
      <field name="output" var="importMatches"/>
    </block>

    <!-- Compile Referencing Pages -->
    <block type="task" id="B4c" action="analyze" desc="Compile references">
      <field name="routerMatches" value="${routerMatches}"/>
      <field name="importMatches" value="${importMatches}"/>
      <field name="output" var="referencingPages"/>
    </block>

    <block type="event" id="E4" action="log" level="info" desc="Log reference search">
      <field name="message">Step 4 Status: COMPLETED - Found ${referencingPages.length} referencing pages</field>
    </block>
  </sequence>

  <!-- ==================== STEP 5A: COPY TEMPLATE TO DOCUMENT PATH ==================== -->
  <sequence id="S5a" name="Step 5a: Copy Template" status="pending" desc="Copy template to document path">
    <!-- Document Output Path Rule -->
    <block type="rule" id="R-DOCPATH" level="mandatory" desc="Document output path MUST use documentPath parameter">
      <field name="text">
        The output document file MUST be created at the EXACT path specified by ${documentPath} input parameter.
        DO NOT use the template file name (e.g., FEATURE-DETAIL-TEMPLATE-*.md) as the output file name.
        The documentPath already contains the correct target path including file name (e.g., speccrew-workspace/knowledges/bizs/web-vue/src/views/system/user/index.md).
        Before creating the file, ensure the parent directory exists (create if necessary).
      </field>
    </block>

    <!-- Ensure Document Output Directory Exists -->
    <block type="task" id="B5a0" action="run-script" desc="Ensure document output directory exists">
      <field name="command">node -e "require('fs').mkdirSync(require('path').dirname('${documentPath}'), {recursive: true})"</field>
    </block>

    <!-- Prepare Placeholder Replacements -->
    <block type="task" id="B5a1" action="analyze" desc="Prepare replacements">
      <field name="language" value="${language}"/>
      <field name="fileName" value="${fileName}"/>
      <field name="output" var="replacements"/>
    </block>

    <!-- Replace Top-Level Placeholders and Write Document Skeleton -->
    <block type="task" id="B5a2" action="write-file" desc="Write document skeleton">
      <field name="path" value="${documentPath}"/>
      <field name="content" value="${templateContent}"/>
      <field name="note">Replace placeholders {Feature Name}, {documentPath}, {sourcePath}, {Date}, {FeatureFile}.vue with actual values</field>
    </block>

    <block type="checkpoint" id="CP5a" name="template-copied" desc="Template copied checkpoint">
      <field name="verify" value="file.exists(${documentPath})"/>
    </block>
    <block type="event" id="E5a" action="log" level="info" desc="Log template copy">
      <field name="message">Step 5a Status: COMPLETED - Template copied to ${documentPath}</field>
    </block>
  </sequence>
  
  <!-- ==================== STEP 5-MID: DYNAMIC SECTION GENERATION ==================== -->
  <!-- Rule: Dynamic section generation before filling fixed sections -->
  <block type="rule" id="R-DYNAMIC-SECTIONS" level="mandatory" desc="Dynamic section generation rule">
    <field name="text">BEFORE filling template sections, you MUST first count identified UI components and dynamically create the corresponding number of sections in the document.</field>
    <field name="text">Step 1: Copy template skeleton to target path</field>
    <field name="text">Step 2: For each identified UI component/area, insert a new numbered sub-section (e.g., 2.1, 2.2, 2.3...) into the document</field>
    <field name="text">Step 3: Fill each sub-section with the specific component details (wireframe, interactions, events)</field>
    <field name="text">NEVER rely on fixed template sections alone — the number of sections MUST match the number of identified UI components</field>
  </block>
  
  <!-- Loop: Dynamically generate a section for each UI component -->
  <block type="loop" id="L-COMPONENT-SECTIONS" over="${analysisResult.components}" as="component" desc="Dynamically generate a section for each UI component">
    <block type="task" id="B-COMP-SECTION" action="generate" desc="Insert component sub-section into document">
      <field name="target" value="${documentPath}"/>
      <field name="content">For component ${component.name} (type: ${component.type}): insert a ## 2.X sub-section containing Component Wireframe, Props/Events table, Interaction Flow, and State Management</field>
      <field name="output" var="section_${component.index}"/>
    </block>
  </block>
  
  <!-- Checkpoint: Verify section count matches component count -->
  <block type="checkpoint" id="CP-SECTIONS-COUNT" desc="Verify section count matches component count">
    <field name="verify">Number of generated 2.X sections == ${analysisResult.components.length}</field>
  </block>
  
  <!-- ==================== STEP 5B: FILL EACH SECTION USING SEARCH_REPLACE ==================== -->
  <sequence id="S5b" name="Step 5b: Fill Sections" status="pending" desc="Fill document sections">
    <!-- Section 1: Content Overview -->
    <block type="task" id="B5b1" action="run-skill" desc="Fill Section 1">
      <field name="skill">search_replace</field>
      <field name="file_path" value="${documentPath}"/>
      <field name="search" value="## 1. Content Overview.*?(?=## 2.|$)"/>
      <field name="replace" value="## 1. Content Overview\n\n${section1Content}"/>
    </block>

    <!-- Section 2: Interface Prototype -->
    <block type="task" id="B5b2" action="run-skill" desc="Fill Section 2">
      <field name="skill">search_replace</field>
      <field name="file_path" value="${documentPath}"/>
      <field name="search" value="## 2. Interface Prototype.*?(?=## 3.|$)"/>
      <field name="replace" value="## 2. Interface Prototype\n\n${wireframes}\n\n### Interface Element Description\n\n${elementDescriptions}"/>
    </block>

    <!-- Section 3: Business Flow -->
    <block type="task" id="B5b3" action="run-skill" desc="Fill Section 3">
      <field name="skill">search_replace</field>
      <field name="file_path" value="${documentPath}"/>
      <field name="search" value="## 3. Business Flow.*?(?=## 4.|$)"/>
      <field name="replace" value="## 3. Business Flow\n\n${businessFlows}\n\n### API Call Sequence Analysis\n\n${sequenceAnalysis}\n\n### Boundary Scenarios\n\n${boundaryScenarios}"/>
    </block>

    <!-- Section 4: Data Field Definition -->
    <block type="task" id="B5b4" action="run-skill" desc="Fill Section 4">
      <field name="skill">search_replace</field>
      <field name="file_path" value="${documentPath}"/>
      <field name="search" value="## 4. Data Field Definition.*?(?=## 5.|$)"/>
      <field name="replace" value="## 4. Data Field Definition\n\n### Page State Fields\n\n${stateFieldsTable}\n\n### Form Fields\n\n${formFieldsTable}\n\n### Data Binding Mapping\n\n${dataBindingMap}\n\n### Reactive Dependency Chain\n\n${reactiveDependencies}"/>
    </block>

    <!-- Section 5: References -->
    <block type="task" id="B5b5" action="run-skill" desc="Fill Section 5">
      <field name="skill">search_replace</field>
      <field name="file_path" value="${documentPath}"/>
      <field name="search" value="## 5. References.*?(?=## 6.|$)"/>
      <field name="replace" value="## 5. References\n\n### APIs\n\n${apiReferences}\n\n### Shared Methods\n\n${sharedMethods}\n\n### Shared Components\n\n${sharedComponents}\n\n### Other Pages\n\n${otherPages}\n\n### Referenced By\n\n${referencedBy}"/>
    </block>

    <!-- Section 6: Business Rule Constraints -->
    <block type="task" id="B5b6" action="run-skill" desc="Fill Section 6">
      <field name="skill">search_replace</field>
      <field name="file_path" value="${documentPath}"/>
      <field name="search" value="## 6. Business Rule Constraints.*?(?=## 7.|$)"/>
      <field name="replace" value="## 6. Business Rule Constraints\n\n### Permission Rules\n\n${permissionRules}\n\n### Business Logic Rules\n\n${businessRules}\n\n### Validation Rules\n\n${validationRules}"/>
    </block>

    <!-- Section 7: Notes and Additional Information -->
    <block type="task" id="B5b7" action="run-skill" desc="Fill Section 7">
      <field name="skill">search_replace</field>
      <field name="file_path" value="${documentPath}"/>
      <field name="search" value="## 7. Notes and Additional Information.*?(?=$)"/>
      <field name="replace" value="## 7. Notes and Additional Information\n\n${notes}\n\n### Performance and Scalability Analysis\n\n${performanceAnalysis}"/>
    </block>

    <block type="checkpoint" id="CP5b" name="all-sections-filled" desc="All sections filled checkpoint">
      <field name="verify" value="all.sections.filled"/>
    </block>
    <block type="event" id="E5b" action="log" level="info" desc="Log section filling">
      <field name="message">Step 5b Status: COMPLETED - All sections filled using search_replace</field>
    </block>
  </sequence>

  <!-- ==================== STEP 6: REPORT RESULTS ==================== -->
  <sequence id="S6" name="Step 6: Report Results" status="pending" desc="Report analysis results">
    <block type="event" id="E6" action="log" level="info" desc="Log final status">
      <field name="message">Step 6 Status: COMPLETED - Analysis success: Successfully analyzed ${fileName} feature from ${sourcePath}</field>
    </block>
  </sequence>

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
  
  <block type="event" id="E10" action="log" level="info" desc="Log marker status">
    <field name="message" value="Step 7 Status: COMPLETED - Done marker file written to ${completed_dir}/${markerName}.done.json"/>
  </block>

  <!-- ==================== FINAL OUTPUT ==================== -->
  <block type="output" id="O1" desc="UI feature analysis output results">
    <field name="status" value="success"/>
    <field name="feature_name" from="${fileName}"/>
    <field name="generated_file" from="${documentPath}"/>
    <field name="message" value="Successfully analyzed ${fileName} feature from ${sourcePath}"/>
    <field name="platformType" from="${platform_type}"/>
    <field name="module" from="${module}"/>
  </block>

  <!-- ==================== ERROR HANDLING ==================== -->
  <block type="error-handler" id="EH1" desc="Handle workflow errors">
    <try>
      <!-- Main workflow defined in sequences above -->
    </try>
    <catch error-type="file-not-found">
      <block type="event" id="EH1-E1" action="log" level="error" desc="File not found error">
        <field name="message">Source file not found: ${sourcePath}</field>
      </block>
      <field name="status" value="failed"/>
      <field name="message" value="Source file not found: ${sourcePath}"/>
    </catch>
    <catch error-type="template-error">
      <block type="event" id="EH1-E2" action="log" level="error" desc="Template error">
        <field name="message">Template processing error</field>
      </block>
      <field name="status" value="failed"/>
      <field name="message" value="Failed to process template"/>
    </catch>
    <catch error-type="validation-error">
      <block type="event" id="EH1-E3" action="log" level="error" desc="Validation error">
        <field name="message">Validation failed: ${error.message}</field>
      </block>
      <field name="status" value="partial"/>
      <field name="message" value="Analysis completed with validation errors"/>
    </catch>
    <finally>
      <block type="event" id="EH1-E4" action="log" level="info" desc="Workflow completed">
        <field name="message">Workflow execution completed</field>
      </block>
    </finally>
  </block>

</workflow>

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
- `completed_dir/markerName.done.json` - Completion marker

**Note:** Graph data (.graph.json) is handled by `speccrew-knowledge-bizs-ui-graph` Skill. The `.done.json` completion marker is written by this Skill in Step 7.

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
- [ ] Done marker file written to completed_dir
