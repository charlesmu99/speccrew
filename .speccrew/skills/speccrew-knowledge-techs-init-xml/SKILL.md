---
name: speccrew-knowledge-techs-init-xml
description: Stage 1 of technology knowledge initialization - Scan source code to detect technology platforms and generate techs-manifest.json using XML workflow blocks. Identifies web, mobile, backend, and desktop platforms by analyzing configuration files and project structure. Used by Worker Agent to kick off the techs pipeline.
tools: Read, Write, Glob, Grep, SearchCodebase, Skill
---

# Stage 1: Detect Technology Platforms (XML Workflow)

Scan project source code to identify all technology platforms, extract configuration metadata, and generate techs-manifest.json for downstream document generation.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content must be in the target language only.**

## Trigger Scenarios

- "Initialize technology knowledge base"
- "Scan source code for technology platforms"
- "Detect tech stacks in project"
- "Generate techs manifest"

## User

Worker Agent (speccrew-task-worker)

## Input

- `source_path`: Source code root directory (default: project root)
- `output_path`: Output directory for techs-manifest.json (default: `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/`)
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{{output_path}}/techs-manifest.json` - Technology platform manifest for pipeline orchestration

## Workflow

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

<workflow>

  <!-- Global Rules -->
  <rule id="GLOBAL-R1" level="mandatory" description="Continuous Execution: Execute all steps in sequence without interruption. Worker must complete all steps before reporting results." />
  <rule id="GLOBAL-R-TECHSTACK" level="mandatory" description="Technology Stack Constraint: Detected platforms must align with standardized platform identifiers from platform-mapping.json." />

  <!-- Input Block -->
  <input name="source_path" type="string" required="false" default="project-root" description="Source code root directory" />
  <input name="output_path" type="string" required="false" default="speccrew-workspace/knowledges/base/sync-state/knowledge-techs/" description="Output directory for techs-manifest.json" />
  <input name="language" type="string" required="true" description="Target language for generated content" />

  <!-- Step 1: Scan for Platform Indicators -->
  <task id="step1-scan-platforms" action="scan" description="Analyze project structure to detect technology platforms">
    
    <!-- Step 1a: Read Platform Mapping Config -->
    <task id="step1a-read-config" action="read" description="Read platform-mapping.json for standardized identifiers">
      <read-file path="speccrew-workspace/docs/configs/platform-mapping.json" />
    </task>

    <!-- Step 1b: Detect Web Platforms -->
    <gateway id="detect-web" mode="parallel" description="Detect web platform indicators">
      <check signal="package.json + react dependency" platform-id="web-react" framework="react" />
      <check signal="package.json + vue dependency" platform-id="web-vue" framework="vue" />
      <check signal="package.json + @angular/core" platform-id="web-angular" framework="angular" />
      <check signal="package.json + next" platform-id="web-nextjs" framework="nextjs" />
      <check signal="package.json + nuxt" platform-id="web-nuxt" framework="nuxt" />
      <check signal="package.json + svelte" platform-id="web-svelte" framework="svelte" />
    </gateway>

    <!-- Step 1c: Detect Mobile Platforms -->
    <gateway id="detect-mobile" mode="parallel" description="Detect mobile platform indicators">
      <check signal="pubspec.yaml" platform-id="mobile-flutter" framework="flutter" />
      <check signal="package.json + react-native" platform-id="mobile-react-native" framework="react-native" />
      <check signal=".xcodeproj / Package.swift" platform-id="mobile-ios" framework="ios" />
      <check signal="build.gradle + AndroidManifest.xml" platform-id="mobile-android" framework="android" />
      <check signal="manifest.json + pages.json" platform-id="mobile-uniapp" framework="uniapp" />
      <check signal="project.config.json + app.json" platform-id="mobile-miniprogram" framework="miniprogram" />
    </gateway>

    <!-- Step 1d: Detect Backend Platforms -->
    <gateway id="detect-backend" mode="parallel" description="Detect backend platform indicators">
      <check signal="package.json + @nestjs/core" platform-id="backend-nestjs" framework="nestjs" />
      <check signal="package.json + express" platform-id="backend-express" framework="express" />
      <check signal="package.json + fastify" platform-id="backend-fastify" framework="fastify" />
      <check signal="pom.xml + spring-boot" platform-id="backend-spring" framework="spring" />
      <check signal="requirements.txt + django" platform-id="backend-django" framework="django" />
      <check signal="requirements.txt + fastapi" platform-id="backend-fastapi" framework="fastapi" />
      <check signal="go.mod" platform-id="backend-go" framework="go" />
      <check signal="Cargo.toml" platform-id="backend-rust" framework="rust" />
    </gateway>

    <!-- Step 1e: Detect Desktop Platforms -->
    <gateway id="detect-desktop" mode="parallel" description="Detect desktop platform indicators">
      <check signal="package.json + electron" platform-id="desktop-electron" framework="electron" />
      <check signal="tauri.conf.json" platform-id="desktop-tauri" framework="tauri" />
      <check signal=".csproj + WPF references" platform-id="desktop-wpf" framework="wpf" />
      <check signal=".csproj + WinForms" platform-id="desktop-winforms" framework="winforms" />
      <check signal=".pro file + Qt" platform-id="desktop-qt" framework="qt" />
    </gateway>

  </task>

  <!-- Step 2: Extract Platform Metadata -->
  <loop id="step2-extract-metadata" over="detected_platforms" as="platform" description="Extract metadata for each detected platform">
    <task action="extract" description="Extract platform metadata fields">
      <extract-fields>
        <field name="platform_id" value="{platform_type}-{framework}" />
        <field name="platform_type" from="detected_type" />
        <field name="framework" from="detected_framework" />
        <field name="language" from="config_file_analysis" />
        <field name="source_path" from="directory_location" />
        <field name="config_files" from="file_list" />
        <field name="convention_files" from="lint_format_configs" />
      </extract-fields>
    </task>
  </loop>

  <!-- Step 3: Get Timestamp -->
  <task id="step3-get-timestamp" action="run-script" description="Get current timestamp for generated_at field">
    <run-script script="scripts/get-timestamp.js" output="timestamp" />
  </task>

  <!-- Step 4: Generate techs-manifest.json -->
  <task id="step4-generate-manifest" action="generate" description="Generate techs-manifest.json with detected platforms">
    <generate-json output="{output_path}/techs-manifest.json">
      <field name="generated_at" value="{timestamp}" />
      <field name="source_path" value="{source_path}" />
      <field name="language" value="{language}" />
      <array name="platforms" from="detected_platforms_metadata" />
    </generate-json>
  </task>

  <!-- Step 5: Report Results -->
  <event id="step5-report" action="log" description="Report detection results">
    <report format="structured">
      Stage 1 completed: Technology Platform Detection
      - Platforms Detected: {platform_count}
        - web-react: React 18.2.0, TypeScript 5.3.0
        - backend-nestjs: NestJS 10.0.0, TypeScript 5.3.0
      - Configuration Files Found: {config_file_count}
      - Output: {output_path}/techs-manifest.json
      - Next: Dispatch parallel tasks for Stage 2 (Tech Document Generation)
    </report>
  </event>

  <!-- Output Block -->
  <output name="status" from="detection_status" />
  <output name="platforms_detected" from="detected_platforms_list" />
  <output name="manifest_path" from="manifest_file_path" />

</workflow>

---

## Platform Detection Reference

### Web Platform Detection

**Indicators:**

| Signal | Platform ID | Framework |
|--------|-------------|-----------|
| package.json + react dependency | web-react | React |
| package.json + vue dependency | web-vue | Vue |
| package.json + @angular/core | web-angular | Angular |
| package.json + next | web-nextjs | Next.js |
| package.json + nuxt | web-nuxt | Nuxt |
| package.json + svelte | web-svelte | Svelte |

**Configuration Files to Capture:**
- package.json
- tsconfig.json
- vite.config.* / webpack.config.* / next.config.* / nuxt.config.*
- tailwind.config.* / postcss.config.*
- .eslintrc.* / .prettierrc.*

### Mobile Platform Detection

**Indicators:**

| Signal | Platform ID | Framework |
|--------|-------------|-----------|
| pubspec.yaml | mobile-flutter | Flutter |
| package.json + react-native | mobile-react-native | React Native |
| .xcodeproj / Package.swift | mobile-ios | iOS (Swift) |
| build.gradle + AndroidManifest.xml | mobile-android | Android (Kotlin/Java) |
| manifest.json + pages.json (uni-app) | mobile-uniapp | UniApp |
| project.config.json + app.json | mobile-miniprogram | Mini Program |

**Configuration Files to Capture:**
- Flutter: pubspec.yaml, analysis_options.yaml
- React Native: package.json, metro.config.js
- iOS: Package.swift, Podfile, Info.plist
- Android: build.gradle, AndroidManifest.xml

### Backend Platform Detection

**Indicators:**

| Signal | Platform ID | Framework |
|--------|-------------|-----------|
| package.json + @nestjs/core | backend-nestjs | NestJS |
| package.json + express | backend-express | Express |
| package.json + fastify | backend-fastify | Fastify |
| pom.xml + spring-boot | backend-spring | Spring Boot |
| build.gradle + spring-boot | backend-spring | Spring Boot |
| requirements.txt + django | backend-django | Django |
| requirements.txt + fastapi | backend-fastapi | FastAPI |
| go.mod | backend-go | Go |
| Cargo.toml | backend-rust | Rust (Actix/Rocket) |

**Configuration Files to Capture:**
- Node.js: package.json, tsconfig.json, nest-cli.json
- Java: pom.xml, build.gradle, application.yml/properties
- Python: requirements.txt, pyproject.toml
- Go: go.mod, go.sum
- Rust: Cargo.toml

### Desktop Platform Detection

**Indicators:**

| Signal | Platform ID | Framework |
|--------|-------------|-----------|
| package.json + electron | desktop-electron | Electron |
| tauri.conf.json | desktop-tauri | Tauri |
| .csproj + WPF references | desktop-wpf | WPF |
| .csproj + WinForms | desktop-winforms | WinForms |
| .pro file + Qt | desktop-qt | Qt |

**Configuration Files to Capture:**
- Electron: package.json, electron-builder.yml
- Tauri: tauri.conf.json, Cargo.toml
- WPF/WinForms: .csproj, App.xaml
- Qt: .pro, CMakeLists.txt

---

## Metadata Extraction Fields

| Field | Source | Example |
|-------|--------|---------|
| platform_id | `{{platform_type}}-{{framework}}` | web-react, backend-nestjs |
| platform_type | Platform category | web, mobile, backend, desktop |
| framework | Primary framework | react, nestjs, flutter |
| language | Primary language | typescript, kotlin, dart |
| source_path | Relative source directory | src/web, src/server |
| config_files | List of config file paths | ["package.json", "tsconfig.json"] |
| convention_files | Lint/format config files | [".eslintrc.js", ".prettierrc"] |

---

## Platform Mapping Consistency

Ensure consistency with modules.json by using standardized platform identifiers from `platform-mapping.json`:

**Key Rules:**
- `platform_id` format: `{{platform_type}}-{{framework}}` (e.g., `mobile-uniapp`, `web-vue`)
- `platform_type` must match between techs-manifest.json and modules.json
- `framework` maps to `platform_subtype` in modules.json

**Example Mapping:**

| platform_id | platform_type | framework | platform_subtype (for bizs-init) |
|-------------|---------------|-----------|----------------------------------|
| web-vue | web | vue | vue |
| mobile-uniapp | mobile | uniapp | uniapp |
| backend-spring | backend | spring | spring |

---

## Checklist

- [ ] All platform indicators checked
- [ ] Platform metadata extracted (platform_id, type, framework, language)
- [ ] Configuration files identified and paths recorded
- [ ] Convention files (eslint, prettier) identified
- [ ] techs-manifest.json generated with valid JSON structure
- [ ] **Source traceability**: All config_file paths recorded for downstream use
- [ ] Output path verified
- [ ] Results reported with platform summary

---

## CONTINUOUS EXECUTION RULES

This skill follows the continuous execution pattern defined in `GLOBAL-R1`:

1. **Sequential Execution**: All workflow steps must execute in the defined order without interruption.
2. **No User Prompts**: Worker must not pause for user confirmation between steps.
3. **Complete All Steps**: Worker must complete all steps before reporting results.
4. **Error Handling**: If any step fails, continue with remaining steps if possible, then report all errors together.
5. **Technology Stack Constraint**: Per `GLOBAL-R-TECHSTACK`, detected platforms must align with standardized platform identifiers from platform-mapping.json.
