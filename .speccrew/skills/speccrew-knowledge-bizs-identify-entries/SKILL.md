---
name: speccrew-knowledge-bizs-identify-entries
description: Analyze source directory structures to identify business module entry directories for each platform using XML workflow blocks. Use when initializing or updating business knowledge base to determine which directories contain user-facing entry points.
tools: Read, Write, Glob, Grep, Bash
---

# speccrew-knowledge-bizs-identify-entries

Analyze source directory structures to identify business module entry directories for each platform using XML workflow blocks.

## Language Adaptation

All generated documents must match the user's language. Detect the language from the user's input and generate content accordingly.

- User writes in 中文 → Generate Chinese documents, use `language: "zh"`
- User writes in English → Generate English documents, use `language: "en"`
- User writes in other languages → Use appropriate language code

## Trigger Scenarios

- Called by `speccrew-knowledge-bizs-dispatch` Stage 1
- "Identify business module entry directories"
- "Analyze source structure for business modules"

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `{platforms}` | array | Yes | Platform list from detection phase. Each item: `{platformId, sourcePath, platformType, platformSubtype, techStack}` |
| `{workspace_path}` | string | Yes | Absolute path to speccrew-workspace directory |
| `{sync_state_bizs_dir}` | string | Yes | Absolute path to entry-dirs JSON output directory |
| `{configs_dir}` | string | Yes | Absolute path to configuration files directory (for `tech-stack-mappings.json`) |

## Output

For each platform, generates:
- `{sync_state_bizs_dir}/entry-dirs-{platform_id}.json`

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="Workflow input parameters">
    <field name="platforms" required="true" type="array" desc="Platform list from detection phase"/>
    <field name="workspace_path" required="true" type="string" desc="Absolute path to speccrew-workspace directory"/>
    <field name="sync_state_bizs_dir" required="true" type="string" desc="Absolute path to entry-dirs JSON output directory"/>
    <field name="configs_dir" required="true" type="string" desc="Absolute path to configuration files directory"/>
  </block>

  <!-- ============================================================
       Global Constraints
       ============================================================ -->
  <block type="rule" id="R1" level="mandatory" desc="Path constraints">
    <field name="text">Use the provided absolute paths directly. DO NOT construct or derive paths yourself.</field>
    <field name="text">All entryDirs paths must use forward slashes / as path separators (even on Windows)</field>
    <field name="text">Do not include leading or trailing slashes in entryDirs paths</field>
  </block>

  <block type="rule" id="R-TECHSTACK" level="mandatory" desc="techStack values MUST match tech-stack-mappings.json keys">
    <field name="text">
      The techStack array values MUST exactly match keys defined in tech-stack-mappings.json (e.g., "fastapi", "vue3", "uniapp").
      DO NOT prefix with language name (e.g., use "fastapi" NOT "python-fastapi", use "express" NOT "node-express").
      The tech_identifier input parameter value should be used as the primary techStack entry.
    </field>
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
  <sequence id="S1" name="Process Platforms" status="pending" desc="Iterate each platform to identify entry directories">

    <!-- Loop: Process Each Platform -->
    <block type="loop" id="L1" over="${platforms}" as="platform" desc="Iterate each platform to identify entry directories">

      <!-- Step 1: Read Directory Tree -->
      <block type="task" id="B1" action="run-script" desc="Read each platform's sourcePath directory structure (3 levels deep)">
        <field name="command">Get-ChildItem -Path "${platform.sourcePath}" -Recurse -Directory -Depth 2 | Select-Object -ExpandProperty FullName</field>
        <field name="note">MUST use Get-ChildItem (NOT tree command). MUST use ${platform.sourcePath} absolute path (NOT relative path). Scan depth follows module_scan.depth configuration from tech-stack-mappings.json.</field>
        <field name="output" var="directory_tree"/>
      </block>

      <!-- Step 2: LLM Analysis - Identify Entry Directories -->
      <block type="task" id="B2" action="analyze" desc="Analyze directory tree and identify entry directories based on platform type">
        <field name="input" value="${directory_tree}"/>
        <field name="platform_type" value="${platform.platformType}"/>
        <field name="platform_subtype" value="${platform.platformSubtype}"/>
        <field name="tech_stack" value="${platform.techStack}"/>
        <field name="logic_module_scan" value="Read tech-stack-mappings.json for the techStack's module_scan configuration. Use module_scan.root as the scan starting point and module_scan.depth as the grouping level (depth=1 means first-level subdirectories = one module each)"/>
        <field name="logic_backend" value="Find all directories containing *Controller.java or *Controller.kt files under module_scan.root. These are API entry directories. Module name = the business package name of the entry directory. Apply module_scan.depth for grouping level"/>
        <field name="logic_frontend_vue_react" value="Find directories under module_scan.root (e.g., src/views or src/pages). First-level subdirectories under module_scan.root are business modules when depth=1"/>
        <field name="logic_mobile_uniapp" value="Find first-level subdirectories under module_scan.root (e.g., src/pages). Plus top-level pages-* directories (module name = directory name without pages- prefix)"/>
        <field name="logic_mobile_miniprogram" value="Find first-level subdirectories under module_scan.root (e.g., pages) as modules"/>
        <field name="output" var="identified_entries"/>
      </block>

      <!-- Step 3: Load Exclusion Rules -->
      <block type="task" id="B3" action="read-file" desc="Read tech-stack-mappings.json to load exclusion patterns">
        <field name="path" value="${configs_dir}/tech-stack-mappings.json"/>
        <field name="output" var="exclusion_rules"/>
      </block>

      <!-- Gateway: Apply Exclusion Rules -->
      <block type="gateway" id="G1" mode="guard" desc="Check if identified_entries is not empty">
        <branch test="${identified_entries} != null AND ${identified_entries.length} > 0">
          <block type="task" id="B4" action="analyze" desc="Apply exclusion rules to filter out technical directories">
            <field name="input" value="${identified_entries}"/>
            <field name="exclusion_rules" value="${exclusion_rules}"/>
            <field name="exclusions_pure_technical" value="config, framework, enums, exception, util, utils, common, constant, constants, type, types, dto, vo, entity, model, mapper, repository, dao, service, impl"/>
            <field name="exclusions_build_output" value="dist, build, target, out, node_modules"/>
            <field name="exclusions_test_directories" value="test, tests, spec, __tests__, e2e"/>
            <field name="exclusions_config_directories" value=".git, .idea, .vscode, .speccrew"/>
            <field name="root_handling" value="Assign entry files not under any subdirectory to _root module"/>
            <field name="output" var="filtered_entries"/>
          </block>
        </branch>
      </block>

      <!-- Step 4: Generate entry-dirs JSON -->
      <block type="task" id="B5" action="write-file" desc="Generate entry-dirs JSON file for the platform">
        <field name="path" value="${sync_state_bizs_dir}/entry-dirs-${platform.platformId}.json"/>
        <field name="content_json">
          {
            "platformId": "${platform.platformId}",
            "platformName": "${platform.platformName}",
            "platformType": "${platform.platformType}",
            "platformSubtype": "${platform.platformSubtype}",
            "sourcePath": "${platform.sourcePath}",
            "techStack": "${platform.techStack}",
            "modules": [
              { "name": "module-name", "entryDirs": ["relative/path/to/entry"] }
            ]
          }
        </field>
        <field name="output" var="generated_json_path"/>
      </block>

      <!-- Rule: Output JSON Format Validation -->
      <block type="rule" id="R-FORMAT" scope="mandatory" desc="Output JSON format validation">
        <field name="content">
          The generated entry-dirs JSON file MUST strictly follow this structure:
          - Root object MUST contain "modules" field (array type)
          - Root object MUST NOT contain "businessModules", "subModules", or "components" fields
          - Each module in "modules" array MUST have exactly two fields: "name" (string) and "entryDirs" (array of strings)
          - For platforms with hierarchical directory structure (e.g. frontend views/system/user/), flatten into individual modules
          - Module names should use hyphen-separated composite names for sub-modules (e.g. "system-user", "system-role")
          - Multiple modules MUST NOT share the same entryDirs value. If multiple business areas share the same directory, they belong to ONE module.
          - If the generated JSON does not match this format, you MUST regenerate it before proceeding
        </field>
        <field name="text">Output is strictly the entry-dirs JSON file at the specified output path. Per agentflow-spec.md "Strict Block Adherence" rule, no extra files are permitted.</field>
      </block>

      <!-- Checkpoint: Persist Generated JSON -->
      <block type="checkpoint" id="CP1" name="entry-dirs-generated" desc="Verify entry-dirs JSON was generated">
        <field name="file" value="${sync_state_bizs_dir}/entry-dirs-${platform.platformId}.json"/>
        <field name="verify" value="file_exists(${sync_state_bizs_dir}/entry-dirs-${platform.platformId}.json)"/>
      </block>

      <!-- Step 5: Validation -->
      <block type="task" id="B6" action="analyze" desc="Validate the generated entry-dirs JSON">
        <field name="input" value="${generated_json_path}"/>
        <field name="validation_rules">
          - modules array is not empty
          - each module has at least one entry directory
          - module names are business-meaningful (not technical terms like config, util)
          - entryDirs paths are correct and accessible
          - JSON format is valid
        </field>
        <field name="output" var="validation_result"/>
      </block>

      <!-- Gateway: Validation Result -->
      <block type="gateway" id="G2" mode="exclusive" desc="Handle validation result">
        <branch test="${validation_result.status} == 'failed'">
          <block type="error-handler" id="EH1" desc="Handle validation failure">
            <catch error-type="validation_failed">
              <block type="event" id="E1" action="log" level="warn" desc="Log validation failure">
                <field name="message">Entry directory recognition failed for platform ${platform.platformId}</field>
              </block>
              <block type="task" id="B7" action="analyze" desc="Re-analyze the directory tree due to validation failure">
                <field name="input" value="${directory_tree}"/>
                <field name="output" var="re_analyzed_entries"/>
              </block>
            </catch>
          </block>
        </branch>
        <branch test="${validation_result.status} == 'passed'">
          <block type="event" id="E2" action="log" level="info" desc="Log validation success">
            <field name="message">Platform ${platform.platformId} entry-dirs validation passed</field>
          </block>
        </branch>
      </block>

    </block>

  </sequence>

  <!-- ============================================================
       Output Results
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="generated_files" from="${generated_json_path}" type="array" desc="List of all generated entry-dirs JSON files"/>
    <field name="validation_summary" from="${validation_result}" type="object" desc="Summary of validation results for all platforms"/>
  </block>

</workflow>

## Output JSON Format

```json
{
  "platformId": "backend-ai",
  "platformName": "AI Module Backend",
  "platformType": "backend",
  "platformSubtype": "ai",
  "sourcePath": "yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai",
  "techStack": ["spring-boot", "mybatis-plus"],
  "modules": [
    { "name": "chat", "entryDirs": ["controller/admin/chat"] },
    { "name": "image", "entryDirs": ["controller/admin/image"] },
    { "name": "knowledge", "entryDirs": ["controller/admin/knowledge"] },
    { "name": "_root", "entryDirs": ["controller/admin"] }
  ]
}
```

### Module Granularity (CRITICAL)

**Core Principle**: modules = directory-level groupings, NOT file-level features

**Configuration-Driven Approach**:
1. Read `tech-stack-mappings.json` to get the `module_scan` configuration for the detected `techStack`
2. Use `module_scan.root` as the scanning starting point (e.g., `src/views` for vue, `controller` for spring)
3. Use `module_scan.depth` as the grouping level:
   - `depth=1`: Each first-level subdirectory under `module_scan.root` = ONE module
   - `depth=2`: Each second-level subdirectory = ONE module (e.g., for android)
4. Each module represents a distinct source directory containing entry files

**NEVER create multiple modules pointing to the SAME entryDirs** — if 10 controller files all reside in the same directory, that is ONE module with that directory as entryDirs, NOT 10 separate modules

**Key Rules**:
- The downstream `generate-inventory.js` script handles file-level decomposition within each module's entryDirs — that is NOT the job of this skill
- Module names should correspond to directory names, not individual file names
- Typical module count for a medium project: 3-10 modules (not 30+)

**Correct example** (directory-level, vue with module_scan.root="src/views", depth=1):
```json
{
  "modules": [
    { "name": "ai", "entryDirs": ["src/views/ai"] },
    { "name": "bpm", "entryDirs": ["src/views/bpm"] },
    { "name": "system", "entryDirs": ["src/views/system"] }
  ]
}
```

**WRONG example** (file-level — FORBIDDEN):
```json
{
  "modules": [
    { "name": "system-user", "entryDirs": ["src/views/system"] },
    { "name": "system-role", "entryDirs": ["src/views/system"] },
    { "name": "system-dept", "entryDirs": ["src/views/system"] }
  ]
}
```

### Format Constraints

- **MUST use `modules` array** — never use `businessModules`, `components`, or any alternative field name
- **MUST flatten hierarchy** — if a platform has sub-modules (e.g. frontend `system/user`, `system/role`), each sub-module must be a separate top-level module entry in the `modules` array
  - 例如：`system` 有 `user` 和 `role` 子目录 → 生成 `{ "name": "system-user", "entryDirs": ["src/views/system/user"] }` 和 `{ "name": "system-role", "entryDirs": ["src/views/system/role"] }`
- **Forbidden fields**: `businessModules`, `subModules`, `components`, `hasSubModules` — 这些都不被下游脚本支持
- **Each module's entryDirs** must point to directories containing actual entry files (e.g. .vue, .py, .java), not parent wrapper directories

### Field Definitions

- `platformId`: Platform identifier (e.g., `backend-ai`, `web-vue`, `mobile-uniapp`)
- `platformName`: (Optional) Human-readable platform name. Auto-generated as `{platform_type}-{platform_subtype}` if missing
- `platformType`: (Optional) Platform type: `backend`, `web`, `mobile`, `desktop`. Inferred from platform_id if missing
- `platformSubtype`: (Optional) Platform subtype (e.g., `ai`, `vue`, `uniapp`). Inferred from platform_id if missing
- `sourcePath`: Absolute path to the platform source root
- `techStack`: (Optional) Array of tech stack names (e.g., `["spring-boot", "mybatis-plus"]`). Default inferred from platform_type
- `modules`: Array of business modules
  - `name`: Module name (business-meaningful, e.g., `chat`, `system`, `order`)
  - `entryDirs`: Array of entry directory paths (relative to `{source_path}`)

### Path Rules

- All `entryDirs` paths must be relative to `{sourcePath}`
- Use forward slashes `/` as path separators (even on Windows)
- Do not include leading or trailing slashes

## Error Handling

| Scenario | Handling |
|----------|----------|
| Entry directory recognition fails | STOP and report error with platform details. Do NOT continue processing that platform. |
| Validation fails | Re-analyze the directory tree and regenerate |
| Config file not found | Use default exclusion rules and log warning |

## Checklist

- [ ] All platforms' entry-dirs JSON files have been generated
- [ ] Each platform's `modules` array is non-empty
- [ ] Module names have business meaning (not technical terms like config, util)
- [ ] `entryDirs` paths are correct and accessible
- [ ] JSON format is valid
- [ ] All paths use forward slashes as separators
- [ ] No leading or trailing slashes in entryDirs paths

> **MANDATORY**: Use the provided absolute paths directly. DO NOT construct or derive paths yourself.

## Example Usage

```
Skill: speccrew-knowledge-bizs-identify-entries
Args:
  platforms: [
    {
      "platformId": "backend-ai",
      "sourcePath": "/path/to/yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai",
      "platformType": "backend",
      "platformSubtype": "ai",
      "techStack": ["spring-boot", "mybatis-plus"]
    },
    {
      "platformId": "web-vue",
      "sourcePath": "/path/to/yudao-ui-admin/src",
      "platformType": "web",
      "platformSubtype": "vue",
      "techStack": ["vue3", "element-plus"]
    }
  ]
  workspace_path: "/path/to/speccrew-workspace"
  sync_state_bizs_dir: "/path/to/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs"
  configs_dir: "/path/to/speccrew-workspace/docs/configs"
```
