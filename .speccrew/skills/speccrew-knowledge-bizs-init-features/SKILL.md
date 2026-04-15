---
name: speccrew-knowledge-bizs-init-features
description: Execute generate-inventory.js script to create features.json inventory for a single platform. Called by bizs-dispatch Stage 1b for each platform.
tools: Read, Write, Bash
---

# speccrew-knowledge-bizs-init-features

Execute generate-inventory.js script to create features.json inventory for a single platform. This is a Stage 1b worker skill called by dispatch after platform detection and entry directory identification are complete.

## Language Adaptation

All generated documents must match the user's language. Detect the language from the user's input and generate content accordingly.

- User writes in 中文 → Generate Chinese documents, use `language: "zh"`
- User writes in English → Generate English documents, use `language: "en"`
- User writes in other languages → Use appropriate language code

## Trigger Scenarios

- Called by `speccrew-knowledge-bizs-dispatch` Stage 1b
- "Generate feature inventory for platform"
- "Create features.json from entry-dirs"

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platformId` | string | Yes | Platform identifier (e.g., "backend-system", "frontend-web", "mobile-app") |
| `platformName` | string | Yes | Platform display name |
| `platformType` | string | Yes | Platform type: backend, web, mobile |
| `platformSubtype` | string | No | Platform subtype (e.g., vue, react, uniapp) |
| `sourcePath` | string | Yes | Absolute path to platform source root |
| `techIdentifier` | string | Yes | Technology stack identifier |
| `entryDirsFile` | string | Yes | Absolute path to entry-dirs JSON file |
| `outputDir` | string | Yes | Absolute path to features JSON output directory |
| `workspace_path` | string | Yes | Absolute path to speccrew-workspace directory |
| `sync_state_bizs_dir` | string | Yes | Absolute path to sync-state/knowledge-bizs directory |
| `language` | string | Yes | Language code for generated content |

## Output

- `${outputDir}/features-${platformId}.json`

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="Workflow input parameters">
    <field name="platformId" required="true" type="string" desc="Platform identifier"/>
    <field name="platformName" required="true" type="string" desc="Platform display name"/>
    <field name="platformType" required="true" type="string" desc="Platform type: backend/web/mobile"/>
    <field name="platformSubtype" required="false" type="string" desc="Platform subtype"/>
    <field name="sourcePath" required="true" type="string" desc="Absolute path to platform source root"/>
    <field name="techIdentifier" required="true" type="string" desc="Technology stack identifier"/>
    <field name="entryDirsFile" required="true" type="string" desc="Absolute path to entry-dirs JSON file"/>
    <field name="outputDir" required="true" type="string" desc="Absolute path to features JSON output directory"/>
    <field name="workspace_path" required="true" type="string" desc="Absolute path to speccrew-workspace directory"/>
    <field name="sync_state_bizs_dir" required="true" type="string" desc="Absolute path to sync-state/knowledge-bizs directory"/>
    <field name="language" required="true" type="string" desc="Language code for generated content"/>
  </block>

  <!-- ============================================================
       Global Constraints
       ============================================================ -->
  <block type="rule" id="R1" level="mandatory" desc="Path constraints">
    <field name="text">Use the provided absolute paths directly. DO NOT construct or derive paths yourself.</field>
    <field name="text">All paths must use forward slashes / as path separators (even on Windows)</field>
  </block>

  <block type="rule" id="R2" level="forbidden" desc="Script execution constraints">
    <field name="text">DO NOT manually scan source files or manually construct features JSON</field>
    <field name="text">MUST execute generate-inventory.js script - if script not found, STOP and report error</field>
    <field name="text">DO NOT use read_file, Glob, Grep, or search_codebase as substitutes for script execution</field>
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
       Main Processing Sequence
       ============================================================ -->
  <sequence id="S1" name="Generate Features Inventory" status="pending" desc="Execute script to generate features.json">

    <!-- Step 1: Verify entry-dirs JSON exists and is valid -->
    <block type="task" id="B1" action="read-file" desc="Read entry-dirs JSON to verify file exists and modules non-empty">
      <field name="path" value="${entryDirsFile}"/>
      <field name="output" var="entry_dirs_content"/>
    </block>

    <!-- Gateway: Validate entry-dirs content -->
    <block type="gateway" id="G1" mode="guard" desc="Verify entry-dirs has modules"
           test="${entry_dirs_content.modules} != null AND ${entry_dirs_content.modules.length} > 0"
           fail-action="stop">
      <field name="message">Entry-dirs JSON must have non-empty modules array: ${entryDirsFile}</field>
    </block>

    <!-- Step 2: Execute generate-inventory.js script -->
    <block type="task" id="B2" action="run-script" desc="Execute generate-inventory.js to create features.json">
      <field name="command">node "${workspace_path}/../.speccrew/skills/speccrew-knowledge-bizs-init-features/scripts/generate-inventory.js" --entryDirsFile "${entryDirsFile}" --outputDir "${outputDir}"</field>
      <field name="note">Script path discovery: Worker must locate generate-inventory.js in IDE skills directory. Search order: 1) .qoder/skills/ 2) .speccrew/skills/ 3) .cursor/skills/ - all relative to project root (workspace_path parent). If script not found, STOP and report error.</field>
      <field name="output" var="script_result"/>
    </block>

    <!-- Checkpoint: Verify features.json generated -->
    <block type="checkpoint" id="CP1" name="features-generated" desc="Verify features JSON was generated">
      <field name="file" value="${outputDir}/features-${platformId}.json"/>
      <field name="verify" value="file_exists(${outputDir}/features-${platformId}.json)"/>
    </block>

    <!-- Step 3: Validate output JSON structure -->
    <block type="task" id="B3" action="analyze" desc="Validate features.json structure">
      <field name="input" value="${outputDir}/features-${platformId}.json"/>
      <field name="validation_rules">
        - platformName matches input platformName
        - platformType matches input platformType
        - techStack is valid array
        - features array is non-empty
        - each feature has: fileName, sourcePath, module, analyzed=false
        - sourcePath uses forward slashes
      </field>
      <field name="output" var="validation_result"/>
    </block>

    <!-- Gateway: Handle validation result -->
    <block type="gateway" id="G2" mode="exclusive" desc="Handle validation result">
      <branch test="${validation_result.status} == 'failed'">
        <block type="event" id="E1" action="log" level="error" desc="Log validation failure">
          <field name="message">Features JSON validation failed for platform ${platformId}: ${validation_result.errors}</field>
        </block>
        <block type="error-handler" id="EH1" desc="Handle validation failure">
          <catch error-type="validation_failed">
            <field name="action">STOP - features.json structure invalid, manual intervention required</field>
          </catch>
        </block>
      </branch>
      <branch test="${validation_result.status} == 'passed'">
        <block type="event" id="E2" action="log" level="info" desc="Log validation success">
          <field name="message">Platform ${platformId} features.json validation passed</field>
        </block>
      </branch>
    </block>

  </sequence>

  <!-- ============================================================
       Output Results
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="generated_file" value="${outputDir}/features-${platformId}.json" type="string" desc="Path to generated features JSON"/>
    <field name="feature_count" from="${validation_result.feature_count}" type="number" desc="Number of features in inventory"/>
    <field name="validation_status" from="${validation_result.status}" type="string" desc="Validation result status"/>
  </block>

</workflow>

## Output JSON Format

```json
{
  "platformName": "Web Frontend",
  "platformType": "web",
  "sourcePath": "frontend-web/src/views",
  "techStack": ["vue", "typescript"],
  "modules": [
    { "name": "chat", "featureCount": 12 },
    { "name": "image", "featureCount": 8 }
  ],
  "totalFiles": 25,
  "analyzedCount": 0,
  "pendingCount": 25,
  "generatedAt": "2024-01-15-103000",
  "features": [
    {
      "fileName": "index",
      "sourcePath": "frontend-web/src/views/system/user/index.vue",
      "documentPath": "speccrew-workspace/knowledges/bizs/web-vue/src/views/system/user/index.md",
      "module": "system",
      "analyzed": false,
      "startedAt": null,
      "completedAt": null,
      "analysisNotes": null
    }
  ]
}
```

### Field Definitions

- `platformName`: Human-readable platform name
- `platformType`: Platform type (backend, web, mobile)
- `sourcePath`: Platform source root path (project-root-relative)
- `techStack`: Array of technology identifiers
- `modules`: Array of modules with feature counts
- `totalFiles`: Total number of feature files
- `analyzedCount`: Number of analyzed features (initially 0)
- `pendingCount`: Number of pending features (initially totalFiles)
- `generatedAt`: ISO timestamp when file was generated
- `features`: Array of feature objects
  - `fileName`: File name without extension
  - `sourcePath`: Relative path to source file (project-root-relative)
  - `documentPath`: Relative path to target document
  - `module`: Module name this feature belongs to
  - `analyzed`: Whether analysis is complete (initially false)
  - `startedAt`: Analysis start timestamp (null initially)
  - `completedAt`: Analysis completion timestamp (null initially)
  - `analysisNotes`: Analysis notes (null initially)

## Error Handling

| Scenario | Handling |
|----------|----------|
| entry-dirs JSON not found | STOP and report error with file path |
| entry-dirs modules array empty | STOP - cannot generate features without entry directories |
| generate-inventory.js script not found | STOP and report error - do NOT attempt manual generation |
| Script execution fails | STOP and report error with exit code and stderr |
| features.json validation fails | STOP - manual intervention required |
| features array empty | WARNING - platform may have no recognizable features |

## Checklist

- [ ] entry-dirs JSON file exists and is readable
- [ ] entry-dirs JSON has non-empty modules array
- [ ] generate-inventory.js script located and executed
- [ ] features-${platformId}.json file generated
- [ ] Output JSON has valid platform metadata
- [ ] features array is non-empty
- [ ] Each feature has required fields (fileName, sourcePath, module, analyzed)
- [ ] All sourcePath values use forward slashes
- [ ] analyzed field is false for all features (initial state)

> **MANDATORY**: Use the provided absolute paths directly. DO NOT construct or derive paths yourself. DO NOT manually create JSON files - MUST execute the script.
