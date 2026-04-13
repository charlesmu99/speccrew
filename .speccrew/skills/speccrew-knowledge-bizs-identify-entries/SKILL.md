---
name: speccrew-knowledge-bizs-identify-entries
description: Analyze source directory structures to identify business module entry directories for each platform. Use when initializing or updating business knowledge base to determine which directories contain user-facing entry points.
tools: Read, Write, Glob, Grep, Bash
---

# speccrew-knowledge-bizs-identify-entries

Analyze source directory structures to identify business module entry directories for each platform.

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

### Step 1: Read Directory Tree

Use `Glob` or `Bash(tree)` to read each platform's `{sourcePath}` directory structure (3 levels deep):

```bash
# Windows (PowerShell)
tree /F /A "{source_path}" | Select-Object -First 100

# Unix/Linux/Mac
tree -L 3 "{source_path}"
```

### Step 2: LLM Analysis - Identify Entry Directories

Based on the directory tree and technology stack, analyze and identify entry directories for each platform type:

**Backend (Spring/Java/Kotlin)**:
- Find all directories containing `*Controller.java` or `*Controller.kt` files
- These are API entry directories
- Module name = the business package name of the entry directory (e.g., `controller/admin/chat` → module `chat`)

**Frontend (Vue/React)**:
- Find `views/` or `pages/` directories
- First-level subdirectories under these directories are business modules
- Each subdirectory is an entry directory (e.g., `views/system/` → module `system`)

**Mobile (UniApp)**:
- Find first-level subdirectories under `pages/`
- Plus top-level `pages-*` directories (module name = directory name without `pages-` prefix, e.g., `pages-bpm` → module `bpm`)

**Mobile (Mini Program)**:
- Find first-level subdirectories under `pages/` as modules

### Step 3: Load Exclusion Rules

Read `{configs_dir}/tech-stack-mappings.json` to load exclusion patterns. Apply the following exclusion rules:

**Pure Technical Directories**:
`config`, `framework`, `enums`, `exception`, `util`, `utils`, `common`, `constant`, `constants`, `type`, `types`, `dto`, `vo`, `entity`, `model`, `mapper`, `repository`, `dao`, `service`, `impl`

**Build/Output Directories**:
`dist`, `build`, `target`, `out`, `node_modules`

**Test Directories**:
`test`, `tests`, `spec`, `__tests__`, `e2e`

**Configuration Directories**:
`.git`, `.idea`, `.vscode`, `.speccrew`

**Root Module Handling**:
- If an entry file is not under any subdirectory (directly under `{sourcePath}`), assign it to the `_root` module

### Step 4: Generate entry-dirs JSON

Output file: `{sync_state_bizs_dir}/entry-dirs-{platform_id}.json`

**JSON Format**:
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

**Field Definitions**:
- `platformId`: Platform identifier (e.g., `backend-ai`, `web-vue`, `mobile-uniapp`)
- `platformName`: (Optional) Human-readable platform name. Auto-generated as `{platform_type}-{platform_subtype}` if missing
- `platformType`: (Optional) Platform type: `backend`, `web`, `mobile`, `desktop`. Inferred from platform_id if missing
- `platformSubtype`: (Optional) Platform subtype (e.g., `ai`, `vue`, `uniapp`). Inferred from platform_id if missing
- `sourcePath`: Absolute path to the platform source root
- `techStack`: (Optional) Array of tech stack names (e.g., `["spring-boot", "mybatis-plus"]`). Default inferred from platform_type
- `modules`: Array of business modules
  - `name`: Module name (business-meaningful, e.g., `chat`, `system`, `order`)
  - `entryDirs`: Array of entry directory paths (relative to `{source_path}`)

**Path Rules**:
- All `entryDirs` paths must be relative to `{sourcePath}`
- Use forward slashes `/` as path separators (even on Windows)
- Do not include leading or trailing slashes

### Step 5: Validation

After generating the entry-dirs JSON for each platform:
1. Verify that `modules` array is not empty
2. Verify that each module has at least one entry directory
3. Verify that module names are business-meaningful (not technical terms like `config`, `util`)
4. If validation fails, re-analyze the directory tree

**Error Handling**:
If entry directory recognition fails for a platform, STOP and report the error with platform details. Do NOT continue processing that platform.

## Checklist

- [ ] All platforms' entry-dirs JSON files have been generated
- [ ] Each platform's `modules` array is non-empty
- [ ] Module names have business meaning (not technical terms like config, util)
- [ ] `entryDirs` paths are correct and accessible
- [ ] JSON format is valid

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
