---
name: speccrew-knowledge-bizs-identify-entries-xml
description: Analyze source directory structures to identify business module entry directories for each platform using XML workflow blocks. Use when initializing or updating business knowledge base to determine which directories contain user-facing entry points.
tools: Read, Write, Glob, Grep, Bash
---

# speccrew-knowledge-bizs-identify-entries-xml

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

<workflow>

  <!-- Input Block -->
  <input name="platforms" type="array" required="true" description="Platform list from detection phase" />
  <input name="workspace_path" type="string" required="true" description="Absolute path to speccrew-workspace directory" />
  <input name="sync_state_bizs_dir" type="string" required="true" description="Absolute path to entry-dirs JSON output directory" />
  <input name="configs_dir" type="string" required="true" description="Absolute path to configuration files directory" />

  <!-- Rule Block: Constraints -->
  <rule level="mandatory">Use the provided absolute paths directly. DO NOT construct or derive paths yourself.</rule>
  <rule level="mandatory">All entryDirs paths must use forward slashes / as path separators (even on Windows)</rule>
  <rule level="mandatory">Do not include leading or trailing slashes in entryDirs paths</rule>

  <!-- Loop: Process Each Platform -->
  <loop over="platforms" as="platform">

    <!-- Step 1: Read Directory Tree -->
    <task name="read-directory-tree" action="run-script">
      <description>Read each platform's sourcePath directory structure (3 levels deep)</description>
      <script type="bash">
        <platform-type>windows</platform-type>
        <command>tree /F /A "{platform.sourcePath}" | Select-Object -First 100</command>
      </script>
      <script type="bash">
        <platform-type>unix</platform-type>
        <command>tree -L 3 "{platform.sourcePath}"</command>
      </script>
      <output name="directory_tree" />
    </task>

    <!-- Step 2: LLM Analysis - Identify Entry Directories -->
    <task name="analyze-entry-dirs" action="run-skill">
      <description>Analyze directory tree and identify entry directories based on platform type</description>
      <input ref="directory_tree" />
      <input ref="platform.platformType" />
      <input ref="platform.platformSubtype" />
      <input ref="platform.techStack" />
      <logic>
        <backend>
          - Find all directories containing *Controller.java or *Controller.kt files
          - These are API entry directories
          - Module name = the business package name of the entry directory
        </backend>
        <frontend-vue-react>
          - Find views/ or pages/ directories
          - First-level subdirectories under these directories are business modules
        </frontend-vue-react>
        <mobile-uniapp>
          - Find first-level subdirectories under pages/
          - Plus top-level pages-* directories (module name = directory name without pages- prefix)
        </mobile-uniapp>
        <mobile-miniprogram>
          - Find first-level subdirectories under pages/ as modules
        </mobile-miniprogram>
      </logic>
      <output name="identified_entries" />
    </task>

    <!-- Step 3: Load Exclusion Rules -->
    <task name="load-exclusion-rules" action="run-script">
      <description>Read tech-stack-mappings.json to load exclusion patterns</description>
      <script type="read-file">
        <path>{configs_dir}/tech-stack-mappings.json</path>
      </script>
      <output name="exclusion_rules" />
    </task>

    <!-- Gateway: Apply Exclusion Rules -->
    <gateway mode="guard">
      <condition>identified_entries is not empty</condition>
      <then>
        <task name="filter-entries" action="run-skill">
          <description>Apply exclusion rules to filter out technical directories</description>
          <input ref="identified_entries" />
          <input ref="exclusion_rules" />
          <exclusions>
            <pure-technical>config, framework, enums, exception, util, utils, common, constant, constants, type, types, dto, vo, entity, model, mapper, repository, dao, service, impl</pure-technical>
            <build-output>dist, build, target, out, node_modules</build-output>
            <test-directories>test, tests, spec, __tests__, e2e</test-directories>
            <config-directories>.git, .idea, .vscode, .speccrew</config-directories>
          </exclusions>
          <root-handling>Assign entry files not under any subdirectory to _root module</root-handling>
          <output name="filtered_entries" />
        </task>
      </then>
    </gateway>

    <!-- Step 4: Generate entry-dirs JSON -->
    <task name="generate-entry-dirs-json" action="run-script">
      <description>Generate entry-dirs JSON file for the platform</description>
      <output-path>{sync_state_bizs_dir}/entry-dirs-{platform.platformId}.json</output-path>
      <content>
        <json-structure>
          {
            "platformId": "{platform.platformId}",
            "platformName": "{platform.platformName}",
            "platformType": "{platform.platformType}",
            "platformSubtype": "{platform.platformSubtype}",
            "sourcePath": "{platform.sourcePath}",
            "techStack": "{platform.techStack}",
            "modules": [
              { "name": "module-name", "entryDirs": ["relative/path/to/entry"] }
            ]
          }
        </json-structure>
      </content>
      <output name="generated_json_path" />
    </task>

    <!-- Checkpoint: Persist Generated JSON -->
    <checkpoint name="entry-dirs-generated" verify="file_exists({sync_state_bizs_dir}/entry-dirs-{platform.platformId}.json)" />

    <!-- Step 5: Validation -->
    <task name="validate-output" action="run-skill">
      <description>Validate the generated entry-dirs JSON</description>
      <input ref="generated_json_path" />
      <validation-rules>
        <rule>modules array is not empty</rule>
        <rule>each module has at least one entry directory</rule>
        <rule>module names are business-meaningful (not technical terms like config, util)</rule>
        <rule>entryDirs paths are correct and accessible</rule>
        <rule>JSON format is valid</rule>
      </validation-rules>
      <output name="validation_result" />
    </task>

    <!-- Gateway: Validation Result -->
    <gateway mode="exclusive">
      <branch condition="validation_result.status == 'failed'">
        <error-handler>
          <catch>
            <event action="log">Entry directory recognition failed for platform {platform.platformId}</event>
            <task name="re-analyze" action="run-skill">
              <description>Re-analyze the directory tree due to validation failure</description>
              <input ref="directory_tree" />
              <output name="re_analyzed_entries" />
            </task>
          </catch>
        </error-handler>
      </branch>
      <branch condition="validation_result.status == 'passed'">
        <event action="log">Platform {platform.platformId} entry-dirs validation passed</event>
      </branch>
    </gateway>

  </loop>

  <!-- Output Block -->
  <output name="generated_files" from="generated_json_path" description="List of all generated entry-dirs JSON files" />
  <output name="validation_summary" from="validation_result" description="Summary of validation results for all platforms" />

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
Skill: speccrew-knowledge-bizs-identify-entries-xml
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
