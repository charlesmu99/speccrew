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

<workflow id="techs-init-main" status="pending" version="1.0" desc="Technology platform detection and manifest generation">

  <!-- ============================================================
       Global Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="mandatory" desc="Continuous Execution constraint">
    <field name="text">Execute all steps in sequence without interruption. Worker must complete all steps before reporting results.</field>
  </block>

  <block type="rule" id="GLOBAL-R-TECHSTACK" level="mandatory" desc="Technology Stack constraint">
    <field name="text">Detected platforms must align with standardized platform identifiers from platform-mapping.json.</field>
  </block>

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="techs-init input parameters">
    <field name="source_path" required="false" type="string" default="project-root" desc="Source code root directory"/>
    <field name="output_path" required="false" type="string" default="speccrew-workspace/knowledges/base/sync-state/knowledge-techs/" desc="Output directory for techs-manifest.json"/>
    <field name="language" required="true" type="string" desc="Target language for generated content"/>
  </block>

  <!-- ============================================================
       Step 1: Scan for Platform Indicators
       ============================================================ -->
  <sequence id="S1" name="Platform Detection" status="pending" desc="Analyze project structure to detect technology platforms">

    <!-- Step 1a: Read Platform Mapping Config -->
    <block type="task" id="S1-B1a" action="read-file" status="pending" desc="Read platform-mapping.json for standardized identifiers">
      <field name="file_path">${workspace_path}/docs/configs/platform-mapping.json</field>
      <field name="output" var="platform_mapping"/>
    </block>

    <!-- Step 1b: Detect Web Platforms -->
    <block type="gateway" id="S1-G1" mode="parallel" desc="Detect web platform indicators">
      <branch test="package.json exists AND react dependency detected" name="web-react">
        <field name="platform_id" value="web-react"/>
        <field name="framework" value="react"/>
      </branch>
      <branch test="package.json exists AND vue dependency detected" name="web-vue">
        <field name="platform_id" value="web-vue"/>
        <field name="framework" value="vue"/>
      </branch>
      <branch test="package.json exists AND @angular/core detected" name="web-angular">
        <field name="platform_id" value="web-angular"/>
        <field name="framework" value="angular"/>
      </branch>
      <branch test="package.json exists AND next dependency detected" name="web-nextjs">
        <field name="platform_id" value="web-nextjs"/>
        <field name="framework" value="nextjs"/>
      </branch>
      <branch test="package.json exists AND nuxt dependency detected" name="web-nuxt">
        <field name="platform_id" value="web-nuxt"/>
        <field name="framework" value="nuxt"/>
      </branch>
      <branch test="package.json exists AND svelte dependency detected" name="web-svelte">
        <field name="platform_id" value="web-svelte"/>
        <field name="framework" value="svelte"/>
      </branch>
    </block>

    <!-- Step 1c: Detect Mobile Platforms -->
    <block type="gateway" id="S1-G2" mode="parallel" desc="Detect mobile platform indicators">
      <branch test="pubspec.yaml exists" name="mobile-flutter">
        <field name="platform_id" value="mobile-flutter"/>
        <field name="framework" value="flutter"/>
      </branch>
      <branch test="package.json exists AND react-native dependency detected" name="mobile-react-native">
        <field name="platform_id" value="mobile-react-native"/>
        <field name="framework" value="react-native"/>
      </branch>
      <branch test=".xcodeproj OR Package.swift exists" name="mobile-ios">
        <field name="platform_id" value="mobile-ios"/>
        <field name="framework" value="ios"/>
      </branch>
      <branch test="build.gradle exists AND AndroidManifest.xml exists" name="mobile-android">
        <field name="platform_id" value="mobile-android"/>
        <field name="framework" value="android"/>
      </branch>
      <branch test="manifest.json exists AND pages.json exists" name="mobile-uniapp">
        <field name="platform_id" value="mobile-uniapp"/>
        <field name="framework" value="uniapp"/>
      </branch>
      <branch test="project.config.json exists AND app.json exists" name="mobile-miniprogram">
        <field name="platform_id" value="mobile-miniprogram"/>
        <field name="framework" value="miniprogram"/>
      </branch>
    </block>

    <!-- Step 1d: Detect Backend Platforms -->
    <block type="gateway" id="S1-G3" mode="parallel" desc="Detect backend platform indicators">
      <branch test="package.json exists AND @nestjs/core detected" name="backend-nestjs">
        <field name="platform_id" value="backend-nestjs"/>
        <field name="framework" value="nestjs"/>
      </branch>
      <branch test="package.json exists AND express detected" name="backend-express">
        <field name="platform_id" value="backend-express"/>
        <field name="framework" value="express"/>
      </branch>
      <branch test="package.json exists AND fastify detected" name="backend-fastify">
        <field name="platform_id" value="backend-fastify"/>
        <field name="framework" value="fastify"/>
      </branch>
      <branch test="pom.xml exists AND spring-boot detected" name="backend-spring">
        <field name="platform_id" value="backend-spring"/>
        <field name="framework" value="spring"/>
      </branch>
      <branch test="requirements.txt exists AND django detected" name="backend-django">
        <field name="platform_id" value="backend-django"/>
        <field name="framework" value="django"/>
      </branch>
      <branch test="requirements.txt exists AND fastapi detected" name="backend-fastapi">
        <field name="platform_id" value="backend-fastapi"/>
        <field name="framework" value="fastapi"/>
      </branch>
      <branch test="go.mod exists" name="backend-go">
        <field name="platform_id" value="backend-go"/>
        <field name="framework" value="go"/>
      </branch>
      <branch test="Cargo.toml exists" name="backend-rust">
        <field name="platform_id" value="backend-rust"/>
        <field name="framework" value="rust"/>
      </branch>
    </block>

    <!-- Step 1e: Detect Desktop Platforms -->
    <block type="gateway" id="S1-G4" mode="parallel" desc="Detect desktop platform indicators">
      <branch test="package.json exists AND electron detected" name="desktop-electron">
        <field name="platform_id" value="desktop-electron"/>
        <field name="framework" value="electron"/>
      </branch>
      <branch test="tauri.conf.json exists" name="desktop-tauri">
        <field name="platform_id" value="desktop-tauri"/>
        <field name="framework" value="tauri"/>
      </branch>
      <branch test=".csproj exists AND WPF references detected" name="desktop-wpf">
        <field name="platform_id" value="desktop-wpf"/>
        <field name="framework" value="wpf"/>
      </branch>
      <branch test=".csproj exists AND WinForms detected" name="desktop-winforms">
        <field name="platform_id" value="desktop-winforms"/>
        <field name="framework" value="winforms"/>
      </branch>
      <branch test=".pro file exists AND Qt detected" name="desktop-qt">
        <field name="platform_id" value="desktop-qt"/>
        <field name="framework" value="qt"/>
      </branch>
    </block>

  </sequence>

  <!-- ============================================================
       Step 2: Extract Platform Metadata
       ============================================================ -->
  <sequence id="S2" name="Metadata Extraction" status="pending" desc="Extract metadata for each detected platform">

    <block type="loop" id="S2-L1" over="${detected_platforms}" as="platform" desc="Extract metadata for each detected platform">
      <block type="task" id="S2-B1" action="analyze" status="pending" desc="Extract platform metadata fields">
        <field name="platform_id" value="${platform.platform_type}-${platform.framework}"/>
        <field name="platform_type" from="${platform.detected_type}"/>
        <field name="framework" from="${platform.detected_framework}"/>
        <field name="language" from="${platform.config_file_analysis}"/>
        <field name="source_path" from="${platform.directory_location}"/>
        <field name="config_files" from="${platform.file_list}"/>
        <field name="convention_files" from="${platform.lint_format_configs}"/>
        <field name="output" var="platform_metadata"/>
      </block>
    </block>

  </sequence>

  <!-- ============================================================
       Step 3: Get Timestamp
       ============================================================ -->
  <block type="task" id="S3-B1" action="run-script" status="pending" desc="Get current timestamp for generated_at field">
    <field name="command">node scripts/get-timestamp.js</field>
    <field name="output" var="timestamp"/>
  </block>

  <!-- ============================================================
       Step 4: Generate techs-manifest.json
       ============================================================ -->
  <block type="task" id="S4-B1" action="generate" status="pending" desc="Generate techs-manifest.json with detected platforms">
    <field name="output_path">${output_path}/techs-manifest.json</field>
    <field name="generated_at" value="${timestamp}"/>
    <field name="source_path" value="${source_path}"/>
    <field name="language" value="${language}"/>
    <field name="platforms" from="${detected_platforms_metadata}"/>
  </block>

  <!-- ============================================================
       Step 5: Report Results
       ============================================================ -->
  <block type="event" id="S5-E1" action="log" level="info" desc="Report detection results">
Stage 1 completed: Technology Platform Detection
- Platforms Detected: ${platform_count}
  - web-react: React 18.2.0, TypeScript 5.3.0
  - backend-nestjs: NestJS 10.0.0, TypeScript 5.3.0
- Configuration Files Found: ${config_file_count}
- Output: ${output_path}/techs-manifest.json
- Next: Dispatch parallel tasks for Stage 2 (Tech Document Generation)
  </block>

  <!-- ============================================================
       Output Definition
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="status" from="${detection_status}"/>
    <field name="platforms_detected" from="${detected_platforms_list}"/>
    <field name="manifest_path" from="${manifest_file_path}"/>
  </block>

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
