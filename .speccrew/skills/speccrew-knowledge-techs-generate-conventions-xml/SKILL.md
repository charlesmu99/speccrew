---
name: speccrew-knowledge-techs-generate-conventions-xml
description: Generate technology convention documents (INDEX, tech-stack, architecture, conventions-*) for a specific platform using XML Block workflow. Extracts tech stack, architecture, and development conventions from configuration files and source code. Split from techs-generate for parallel execution with ui-style worker.
tools: Read, Write, Glob, Grep
---

# Stage 2: Generate Platform Convention Documents (XML Block Workflow)

Generate comprehensive convention documentation for a specific platform by analyzing its configuration files and source code structure. This skill focuses on conventions documents only; UI style analysis is handled by the separate techs-generate-ui-style worker.

## Trigger Scenarios

- "Generate convention documents for {platform}"
- "Create tech stack and architecture documentation"
- "Extract development conventions from {platform}"
- "Generate platform conventions docs"
- "Create INDEX, tech-stack, and conventions-* files"

## User

Worker Agent (speccrew-task-worker)

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{platform_id}}` | string | Platform identifier | `"web-react"`, `"backend-nestjs"` |
| `{{platform_type}}` | string | Platform type | `web`, `mobile`, `backend`, `desktop`, `api` |
| `{{framework}}` | string | Primary framework | `react`, `nestjs`, `flutter`, etc. |
| `{{source_path}}` | string | Platform source directory | `"frontend-web"` |
| `{{config_files}}` | array | List of configuration file paths | `["package.json", "tsconfig.json"]` |
| `{{convention_files}}` | array | List of convention file paths | `[".eslintrc.js", ".prettierrc"]` |
| `{{output_path}}` | string | Output directory for generated documents | `speccrew-workspace/knowledges/techs/{platform_id}/` |
| `{{language}}` | string | Target language for generated content | `"zh"`, `"en"` |
| `{{completed_dir}}` | string | (Optional) Directory for analysis coverage report output | `speccrew-workspace/iterations/...` |

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `{{status}}` | string | Generation status: `"success"`, `"partial"`, or `"failed"` |
| `{{documents_generated}}` | array | List of generated document filenames |
| `{{analysis_file}}` | string | Path to the analysis coverage report |
| `{{message}}` | string | Summary message for status update |

## Output

Generate the following documents in `{{output_path}}/`:

```
{{output_path}}/
├── INDEX.md                    # Platform technology index (Required)
├── tech-stack.md              # Technology stack details (Required)
├── architecture.md            # Architecture conventions (Required)
├── conventions-design.md      # Design conventions (Required)
├── conventions-dev.md         # Development conventions (Required)
├── conventions-unit-test.md   # Unit testing conventions (Required)
├── conventions-system-test.md # System testing conventions (Required)
├── conventions-build.md       # Build & Deployment conventions (Required)
└── conventions-data.md        # Data conventions (Optional)
```

### Platform Type to Document Mapping

| Platform Type | Required Documents | Optional Documents | Generate conventions-data.md? |
|---------------|-------------------|-------------------|------------------------------|
| `backend` | All 8 docs | - | **Must Generate** - Contains ORM, data modeling, caching strategy |
| `web` | All 8 docs | conventions-data.md | **Conditional** - Only when using ORM/data layer (Prisma, TypeORM, Sequelize, etc.) |
| `mobile` | All 8 docs | conventions-data.md | **Default No** - Based on actual tech stack |
| `desktop` | All 8 docs | conventions-data.md | **Default No** - Based on actual tech stack |
| `api` | All 8 docs | conventions-data.md | **Conditional** - Based on whether data layer exists |

## Workflow

<!--
== Block Types Schema ==
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
<workflow name="platform-conventions-generation" version="1.0">

  <!-- ==================== INPUT PARAMETERS ==================== -->
  <input name="platform_id" type="string" required="true" description="Platform identifier (e.g., web-react, backend-nestjs)"/>
  <input name="platform_type" type="string" required="true" description="Platform type: web, mobile, backend, desktop, api"/>
  <input name="framework" type="string" required="true" description="Primary framework (react, nestjs, flutter, etc.)"/>
  <input name="source_path" type="string" required="true" description="Platform source directory"/>
  <input name="config_files" type="array" required="true" description="List of configuration file paths"/>
  <input name="convention_files" type="array" required="true" description="List of convention file paths (eslint, prettier, etc.)"/>
  <input name="output_path" type="string" required="true" description="Output directory for generated documents"/>
  <input name="language" type="string" required="true" description="Target language (e.g., zh, en)"/>
  <input name="completed_dir" type="string" required="false" description="Directory for analysis coverage report output"/>

  <!-- ==================== GLOBAL CONSTRAINT RULES ==================== -->
  <block type="rule" id="GLOBAL-R1" level="mandatory" desc="Continuous execution rules">
    <field name="text">This skill MUST execute continuously without user interruption</field>
    <field name="text">All steps must complete in a single session</field>
    <field name="text">If context window is running low, save checkpoint and inform user - DO NOT create false done marker</field>
  </block>

  <block type="rule" id="GLOBAL-R-TECHSTACK" level="mandatory" desc="Technology stack constraints">
    <field name="text">Extract actual values from config files: "React 18.2.0" (from package.json) - NOT "React (version varies)"</field>
    <field name="text">Focus on actionable conventions: "Use PascalCase for component files: UserProfile.tsx" - NOT vague statements</field>
    <field name="text">Include concrete examples wherever possible</field>
  </block>

  <block type="rule" id="GLOBAL-R-DONE-MARKER" level="forbidden" desc="Done marker integrity rules">
    <field name="text">DO NOT create done marker file until ALL required documents have been verified to exist on disk</field>
    <field name="text">Required documents: INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md</field>
    <field name="text">If context window is running low, save checkpoint and inform user - DO NOT create false done marker</field>
  </block>

  <block type="rule" id="GLOBAL-R-CONTEXT" level="mandatory" desc="Context management rules">
    <field name="text">Write each document to file immediately after generation - DO NOT accumulate all documents in memory</field>
    <field name="text">Use search_replace to fill template sections - NEVER use create_file to rewrite entire document</field>
    <field name="text">Preserve all template section headers and structure</field>
  </block>

  <block type="rule" id="GLOBAL-R-SOURCE" level="mandatory" desc="Source traceability rules">
    <field name="text">All source file links MUST use RELATIVE PATHS - Absolute paths and file:// protocol are STRICTLY FORBIDDEN</field>
    <field name="text">Use ../../../../ as prefix to reference source files from document location</field>
    <field name="text">Add File Reference Block at beginning of each document</field>
    <field name="text">Add Diagram Source annotations after each Mermaid diagram</field>
    <field name="text">Add Section Source annotations at end of major sections</field>
  </block>

  <block type="rule" id="GLOBAL-R-MERMAID" level="mandatory" desc="Mermaid diagram compatibility rules">
    <field name="text">Use only basic node definitions: A[text content]</field>
    <field name="text">No HTML tags (e.g., &lt;br/&gt;)</field>
    <field name="text">No nested subgraphs</field>
    <field name="text">No direction keyword</field>
    <field name="text">No style definitions</field>
    <field name="text">Use standard graph TB/LR syntax only</field>
  </block>

  <!-- ==================== STEP 0: READ DOCUMENT TEMPLATES ==================== -->
  <task name="step0-read-templates" action="run-skill">
    <description>Read all template files to understand required content structure for each document type</description>
    <script>
      <!-- Read INDEX Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/INDEX-TEMPLATE.md">
        <output name="template_index" from="file.content"/>
      </task>

      <!-- Read TECH-STACK Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/TECH-STACK-TEMPLATE.md">
        <output name="template_tech_stack" from="file.content"/>
      </task>

      <!-- Read ARCHITECTURE Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/ARCHITECTURE-TEMPLATE.md">
        <output name="template_architecture" from="file.content"/>
      </task>

      <!-- Read CONVENTIONS-DESIGN Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-DESIGN-TEMPLATE.md">
        <output name="template_conventions_design" from="file.content"/>
      </task>

      <!-- Read CONVENTIONS-DEV Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-DEV-TEMPLATE.md">
        <output name="template_conventions_dev" from="file.content"/>
      </task>

      <!-- Read CONVENTIONS-UNIT-TEST Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-UNIT-TEST-TEMPLATE.md">
        <output name="template_conventions_unit_test" from="file.content"/>
      </task>

      <!-- Read CONVENTIONS-SYSTEM-TEST Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-SYSTEM-TEST-TEMPLATE.md">
        <output name="template_conventions_system_test" from="file.content"/>
      </task>

      <!-- Read CONVENTIONS-BUILD Template -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-BUILD-TEMPLATE.md">
        <output name="template_conventions_build" from="file.content"/>
      </task>

      <!-- Read CONVENTIONS-DATA Template (Optional) -->
      <task action="read-file" target="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-DATA-TEMPLATE.md">
        <output name="template_conventions_data" from="file.content"/>
      </task>

      <!-- Read Mermaid Rules -->
      <task action="read-file" target="speccrew-workspace/docs/rules/mermaid-rule.md">
        <output name="mermaid_rules" from="file.content"/>
      </task>

      <checkpoint name="templates-loaded" verify="{{template_index}} != null AND {{template_tech_stack}} != null"/>
      <event action="log" level="info" message="Step 0 Status: COMPLETED - All templates loaded"/>
    </script>
  </task>

  <!-- ==================== STEP 1: ANALYZE PROJECT SOURCE CODE STRUCTURE ==================== -->
  <task name="step1-analyze-structure" action="run-skill">
    <description>Read configuration files and analyze project structure to extract technology stack and conventions</description>
    <script>
      <!-- Read Primary Config Files -->
      <loop name="config-reading" over="{{config_files}}" as="config_file">
        <task action="read-file" target="{{source_path}}/{{config_file}}">
          <output name="config_{{config_file}}" from="file.content"/>
        </task>
      </loop>

      <!-- Read Convention Files -->
      <loop name="convention-reading" over="{{convention_files}}" as="convention_file">
        <task action="read-file" target="{{source_path}}/{{convention_file}}">
          <output name="convention_{{convention_file}}" from="file.content"/>
        </task>
      </loop>

      <!-- Extract Technology Stack -->
      <task action="extract-tech-stack">
        <input name="config_files">{{config_files}}</input>
        <input name="config_content">{{config_content}}</input>
        <output name="framework" from="extraction.framework"/>
        <output name="framework_version" from="extraction.framework_version"/>
        <output name="language" from="extraction.language"/>
        <output name="language_version" from="extraction.language_version"/>
        <output name="build_tool" from="extraction.build_tool"/>
        <output name="dependencies" from="extraction.dependencies"/>
        <output name="dev_dependencies" from="extraction.dev_dependencies"/>
      </task>

      <!-- Extract Conventions from Config Files -->
      <task action="extract-conventions">
        <input name="convention_files">{{convention_files}}</input>
        <input name="convention_content">{{convention_content}}</input>
        <output name="eslint_rules" from="extraction.eslint"/>
        <output name="prettier_config" from="extraction.prettier"/>
        <output name="testing_config" from="extraction.testing"/>
        <output name="naming_conventions" from="extraction.naming"/>
      </task>

      <!-- Analyze Directory Structure -->
      <task action="analyze-structure" target="{{source_path}}">
        <output name="directory_structure" from="analysis.directories"/>
        <output name="file_patterns" from="analysis.patterns"/>
      </task>

      <!-- Detect Data Layer for conventions-data.md decision -->
      <task action="detect-data-layer">
        <input name="dependencies">{{dependencies}}</input>
        <input name="platform_type">{{platform_type}}</input>
        <output name="data_layer_detected" from="detection.found"/>
        <output name="data_technology" from="detection.technology"/>
        <output name="generate_data_doc" from="detection.should_generate"/>
      </task>

      <event action="log" level="info" message="Platform: {{platform_id}}, Type: {{platform_type}}, Framework: {{framework}}"/>
      <event action="log" level="info" message="Data Layer Detected: {{data_layer_detected}}, Technology: {{data_technology}}"/>
      <event action="log" level="info" message="Generate conventions-data.md: {{generate_data_doc}}"/>

      <checkpoint name="structure-analyzed" verify="{{framework}} != null"/>
      <event action="log" level="info" message="Step 1 Status: COMPLETED - Project structure analyzed"/>
    </script>
  </task>

  <!-- ==================== STEP 2: DOMAIN-SPECIFIC CONVENTION EXTRACTION ==================== -->
  <task name="step2-extract-domain-conventions" action="run-skill">
    <description>Extract domain-specific conventions based on platform type</description>
    <script>
      <!-- Frontend Topics Extraction -->
      <gateway name="frontend-topics" mode="guard">
        <branch condition="{{platform_type}} == 'web' OR {{platform_type}} == 'mobile' OR {{platform_type}} == 'desktop'">
          <task action="search-topic">
            <input name="topic">i18n</input>
            <input name="paths">["locales/", "i18n/", "lang/"]</input>
            <output name="topic_i18n_status" from="search.status"/>
            <output name="topic_i18n_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">authorization</input>
            <input name="paths">["permission/", "router/", "store/", "utils/auth"]</input>
            <output name="topic_auth_status" from="search.status"/>
            <output name="topic_auth_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">menu_registration</input>
            <input name="paths">["router/", "store/", "layout/"]</input>
            <output name="topic_menu_status" from="search.status"/>
            <output name="topic_menu_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">data_dictionary</input>
            <input name="paths">["components/Dict", "utils/dict", "store/"]</input>
            <output name="topic_dict_status" from="search.status"/>
            <output name="topic_dict_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">logging</input>
            <input name="paths">["utils/log", "plugins/sentry"]</input>
            <output name="topic_logging_status" from="search.status"/>
            <output name="topic_logging_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">api_request_layer</input>
            <input name="paths">["utils/request", "api/", "config/", "interceptors/"]</input>
            <output name="topic_api_status" from="search.status"/>
            <output name="topic_api_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">data_validation</input>
            <input name="paths">["utils/validate"]</input>
            <output name="topic_validation_status" from="search.status"/>
            <output name="topic_validation_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">file_upload</input>
            <input name="paths">["components/Upload", "api/file", "utils/upload"]</input>
            <output name="topic_upload_status" from="search.status"/>
            <output name="topic_upload_files" from="search.files"/>
          </task>
        </branch>
      </gateway>

      <!-- Backend Topics Extraction -->
      <gateway name="backend-topics" mode="guard">
        <branch condition="{{platform_type}} == 'backend'">
          <task action="search-topic">
            <input name="topic">backend_i18n</input>
            <input name="paths">["resources/i18n/", "messages*.properties"]</input>
            <output name="topic_backend_i18n_status" from="search.status"/>
            <output name="topic_backend_i18n_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">authorization_permissions</input>
            <input name="paths">["security/", "controller/", "framework/"]</input>
            <output name="topic_backend_auth_status" from="search.status"/>
            <output name="topic_backend_auth_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">data_dictionary</input>
            <input name="paths">["dict/", "system/"]</input>
            <output name="topic_backend_dict_status" from="search.status"/>
            <output name="topic_backend_dict_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">multi_tenancy</input>
            <input name="paths">["framework/tenant/", "base/entity/"]</input>
            <output name="topic_tenant_status" from="search.status"/>
            <output name="topic_tenant_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">logging_audit</input>
            <input name="paths">["logback*.xml", "log4j2*.xml", "operatelog/"]</input>
            <output name="topic_backend_logging_status" from="search.status"/>
            <output name="topic_backend_logging_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">exception_handling</input>
            <input name="paths">["handler/", "exception/", "enums/ErrorCode"]</input>
            <output name="topic_exception_status" from="search.status"/>
            <output name="topic_exception_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">caching</input>
            <input name="paths">["cache/", "redis/", "CacheConfig"]</input>
            <output name="topic_cache_status" from="search.status"/>
            <output name="topic_cache_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">scheduled_jobs</input>
            <input name="paths">["job/", "task/", "schedule/"]</input>
            <output name="topic_jobs_status" from="search.status"/>
            <output name="topic_jobs_files" from="search.files"/>
          </task>
          <task action="search-topic">
            <input name="topic">file_storage</input>
            <input name="paths">["file/", "infra/file/", "FileClient"]</input>
            <output name="topic_storage_status" from="search.status"/>
            <output name="topic_storage_files" from="search.files"/>
          </task>
        </branch>
      </gateway>

      <checkpoint name="domain-conventions-extracted" verify="true"/>
      <event action="log" level="info" message="Step 2 Status: COMPLETED - Domain-specific conventions extracted"/>
    </script>
  </task>

  <!-- ==================== STEP 2.1: GENERATE INDEX.MD ==================== -->
  <task name="step2-1-generate-index" action="run-skill">
    <description>Generate INDEX.md by copying template and filling sections</description>
    <script>
      <task action="copy-template" source="{{template_index}}" target="{{output_path}}/INDEX.md">
        <parameter name="platform_id">{{platform_id}}</parameter>
        <parameter name="platform_type">{{platform_type}}</parameter>
        <parameter name="framework">{{framework}}</parameter>
      </task>
      <task action="search_replace" target="{{output_path}}/INDEX.md">
        <search>{Platform Name}</search>
        <replace>{{platform_id}}</replace>
      </task>
      <task action="search_replace" target="{{output_path}}/INDEX.md">
        <search>{Platform Type}</search>
        <replace>{{platform_type}}</replace>
      </task>
      <checkpoint name="index-generated" verify="file.exists({{output_path}}/INDEX.md)"/>
      <event action="log" level="info" message="Step 2.1 Status: COMPLETED - INDEX.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.2: GENERATE TECH-STACK.MD ==================== -->
  <task name="step2-2-generate-tech-stack" action="run-skill">
    <description>Generate tech-stack.md with extracted technology information</description>
    <script>
      <task action="copy-template" source="{{template_tech_stack}}" target="{{output_path}}/tech-stack.md">
        <parameter name="framework">{{framework}}</parameter>
        <parameter name="framework_version">{{framework_version}}</parameter>
        <parameter name="dependencies">{{dependencies}}</parameter>
      </task>
      <task action="fill-tech-stack-sections" target="{{output_path}}/tech-stack.md">
        <input name="framework">{{framework}}</input>
        <input name="framework_version">{{framework_version}}</input>
        <input name="language">{{language}}</input>
        <input name="build_tool">{{build_tool}}</input>
        <input name="dependencies">{{dependencies}}</input>
        <input name="dev_dependencies">{{dev_dependencies}}</input>
      </task>
      <checkpoint name="tech-stack-generated" verify="file.exists({{output_path}}/tech-stack.md)"/>
      <event action="log" level="info" message="Step 2.2 Status: COMPLETED - tech-stack.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.3: GENERATE ARCHITECTURE.MD ==================== -->
  <task name="step2-3-generate-architecture" action="run-skill">
    <description>Generate architecture.md with platform architecture patterns</description>
    <script>
      <task action="copy-template" source="{{template_architecture}}" target="{{output_path}}/architecture.md">
        <parameter name="platform_type">{{platform_type}}</parameter>
        <parameter name="directory_structure">{{directory_structure}}</parameter>
      </task>
      <task action="fill-architecture-sections" target="{{output_path}}/architecture.md">
        <input name="platform_type">{{platform_type}}</input>
        <input name="framework">{{framework}}</input>
        <input name="directory_structure">{{directory_structure}}</input>
        <input name="file_patterns">{{file_patterns}}</input>
      </task>
      <checkpoint name="architecture-generated" verify="file.exists({{output_path}}/architecture.md)"/>
      <event action="log" level="info" message="Step 2.3 Status: COMPLETED - architecture.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.4: GENERATE CONVENTIONS-DESIGN.MD ==================== -->
  <task name="step2-4-generate-conventions-design" action="run-skill">
    <description>Generate conventions-design.md with design principles and patterns</description>
    <script>
      <task action="copy-template" source="{{template_conventions_design}}" target="{{output_path}}/conventions-design.md">
        <parameter name="platform_type">{{platform_type}}</parameter>
      </task>
      <task action="fill-design-sections" target="{{output_path}}/conventions-design.md">
        <input name="platform_type">{{platform_type}}</input>
        <input name="framework">{{framework}}</input>
        <input name="naming_conventions">{{naming_conventions}}</input>
      </task>
      <checkpoint name="conventions-design-generated" verify="file.exists({{output_path}}/conventions-design.md)"/>
      <event action="log" level="info" message="Step 2.4 Status: COMPLETED - conventions-design.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.5: GENERATE CONVENTIONS-DEV.MD ==================== -->
  <task name="step2-5-generate-conventions-dev" action="run-skill">
    <description>Generate conventions-dev.md with development conventions</description>
    <script>
      <task action="copy-template" source="{{template_conventions_dev}}" target="{{output_path}}/conventions-dev.md">
        <parameter name="eslint_rules">{{eslint_rules}}</parameter>
        <parameter name="prettier_config">{{prettier_config}}</parameter>
      </task>
      <task action="fill-dev-sections" target="{{output_path}}/conventions-dev.md">
        <input name="eslint_rules">{{eslint_rules}}</input>
        <input name="prettier_config">{{prettier_config}}</input>
        <input name="naming_conventions">{{naming_conventions}}</input>
        <input name="file_patterns">{{file_patterns}}</input>
      </task>
      <checkpoint name="conventions-dev-generated" verify="file.exists({{output_path}}/conventions-dev.md)"/>
      <event action="log" level="info" message="Step 2.5 Status: COMPLETED - conventions-dev.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.6: GENERATE CONVENTIONS-UNIT-TEST.MD ==================== -->
  <task name="step2-6-generate-conventions-unit-test" action="run-skill">
    <description>Generate conventions-unit-test.md with unit testing requirements</description>
    <script>
      <task action="copy-template" source="{{template_conventions_unit_test}}" target="{{output_path}}/conventions-unit-test.md">
        <parameter name="testing_config">{{testing_config}}</parameter>
      </task>
      <task action="fill-unit-test-sections" target="{{output_path}}/conventions-unit-test.md">
        <input name="testing_config">{{testing_config}}</input>
        <input name="framework">{{framework}}</input>
        <input name="platform_type">{{platform_type}}</input>
      </task>
      <checkpoint name="conventions-unit-test-generated" verify="file.exists({{output_path}}/conventions-unit-test.md)"/>
      <event action="log" level="info" message="Step 2.6 Status: COMPLETED - conventions-unit-test.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.7: GENERATE CONVENTIONS-SYSTEM-TEST.MD ==================== -->
  <task name="step2-7-generate-conventions-system-test" action="run-skill">
    <description>Generate conventions-system-test.md with system testing requirements</description>
    <script>
      <task action="copy-template" source="{{template_conventions_system_test}}" target="{{output_path}}/conventions-system-test.md">
        <parameter name="platform_type">{{platform_type}}</parameter>
      </task>
      <task action="fill-system-test-sections" target="{{output_path}}/conventions-system-test.md">
        <input name="platform_type">{{platform_type}}</input>
        <input name="framework">{{framework}}</input>
      </task>
      <checkpoint name="conventions-system-test-generated" verify="file.exists({{output_path}}/conventions-system-test.md)"/>
      <event action="log" level="info" message="Step 2.7 Status: COMPLETED - conventions-system-test.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.8: GENERATE CONVENTIONS-BUILD.MD ==================== -->
  <task name="step2-8-generate-conventions-build" action="run-skill">
    <description>Generate conventions-build.md with build and deployment conventions</description>
    <script>
      <task action="copy-template" source="{{template_conventions_build}}" target="{{output_path}}/conventions-build.md">
        <parameter name="build_tool">{{build_tool}}</parameter>
      </task>
      <task action="fill-build-sections" target="{{output_path}}/conventions-build.md">
        <input name="build_tool">{{build_tool}}</input>
        <input name="config_files">{{config_files}}</input>
        <input name="dependencies">{{dependencies}}</input>
      </task>
      <checkpoint name="conventions-build-generated" verify="file.exists({{output_path}}/conventions-build.md)"/>
      <event action="log" level="info" message="Step 2.8 Status: COMPLETED - conventions-build.md generated"/>
    </script>
  </task>

  <!-- ==================== STEP 2.9: GENERATE CONVENTIONS-DATA.MD (CONDITIONAL) ==================== -->
  <gateway name="generate-data-doc" mode="exclusive">
    <branch condition="{{generate_data_doc}} == true">
      <task name="step2-9-generate-conventions-data" action="run-skill">
        <description>Generate conventions-data.md with data layer conventions</description>
        <script>
          <task action="copy-template" source="{{template_conventions_data}}" target="{{output_path}}/conventions-data.md">
            <parameter name="data_technology">{{data_technology}}</parameter>
          </task>
          <task action="fill-data-sections" target="{{output_path}}/conventions-data.md">
            <input name="data_technology">{{data_technology}}</input>
            <input name="platform_type">{{platform_type}}</input>
            <input name="dependencies">{{dependencies}}</input>
          </task>
          <checkpoint name="conventions-data-generated" verify="file.exists({{output_path}}/conventions-data.md)"/>
          <event action="log" level="info" message="Step 2.9 Status: COMPLETED - conventions-data.md generated"/>
        </script>
      </task>
    </branch>
    <branch condition="default">
      <event action="log" level="info" message="Step 2.9 Status: SKIPPED - No data layer detected, conventions-data.md not generated"/>
    </branch>
  </gateway>

  <!-- ==================== STEP 3: VERIFY ALL FILES GENERATED ==================== -->
  <task name="step3-verify-files" action="run-skill">
    <description>Verify all required documents exist on disk before creating done marker</description>
    <script>
      <task action="verify-file-exists" target="{{output_path}}/INDEX.md">
        <output name="index_exists" from="verify.result"/>
      </task>
      <task action="verify-file-exists" target="{{output_path}}/tech-stack.md">
        <output name="tech_stack_exists" from="verify.result"/>
      </task>
      <task action="verify-file-exists" target="{{output_path}}/architecture.md">
        <output name="architecture_exists" from="verify.result"/>
      </task>
      <task action="verify-file-exists" target="{{output_path}}/conventions-design.md">
        <output name="conventions_design_exists" from="verify.result"/>
      </task>
      <task action="verify-file-exists" target="{{output_path}}/conventions-dev.md">
        <output name="conventions_dev_exists" from="verify.result"/>
      </task>
      <task action="verify-file-exists" target="{{output_path}}/conventions-unit-test.md">
        <output name="conventions_unit_test_exists" from="verify.result"/>
      </task>
      <task action="verify-file-exists" target="{{output_path}}/conventions-system-test.md">
        <output name="conventions_system_test_exists" from="verify.result"/>
      </task>
      <task action="verify-file-exists" target="{{output_path}}/conventions-build.md">
        <output name="conventions_build_exists" from="verify.result"/>
      </task>

      <task action="compile-verification">
        <input name="index_exists">{{index_exists}}</input>
        <input name="tech_stack_exists">{{tech_stack_exists}}</input>
        <input name="architecture_exists">{{architecture_exists}}</input>
        <input name="conventions_design_exists">{{conventions_design_exists}}</input>
        <input name="conventions_dev_exists">{{conventions_dev_exists}}</input>
        <input name="conventions_unit_test_exists">{{conventions_unit_test_exists}}</input>
        <input name="conventions_system_test_exists">{{conventions_system_test_exists}}</input>
        <input name="conventions_build_exists">{{conventions_build_exists}}</input>
        <output name="all_required_exist" from="compilation.all_exist"/>
        <output name="missing_files" from="compilation.missing"/>
      </task>

      <gateway name="verification-result" mode="exclusive">
        <branch condition="{{all_required_exist}} == true">
          <event action="log" level="info" message="Step 3 Status: COMPLETED - All required documents verified to exist"/>
        </branch>
        <branch condition="default">
          <event action="log" level="error" message="Step 3 Status: FAILED - Missing files: {{missing_files}}"/>
          <output name="status" value="failed"/>
          <output name="message" value="Verification failed - missing required documents"/>
        </branch>
      </gateway>

      <checkpoint name="files-verified" verify="{{all_required_exist}} == true"/>
    </script>
  </task>

  <!-- ==================== STEP 4: CREATE COMPLETION MARKER ==================== -->
  <task name="step4-create-done-marker" action="run-skill">
    <description>Create done marker file to signal completion - ONLY after all files verified</description>
    <script>
      <gateway name="pre-create-check" mode="guard">
        <branch condition="{{all_required_exist}} == true">
          <task action="create-file" target="{{output_path}}/conventions.done">
            <content>{
  "platform_id": "{{platform_id}}",
  "worker_type": "conventions",
  "status": "completed",
  "documents_generated": ["INDEX.md", "tech-stack.md", "architecture.md", "conventions-design.md", "conventions-dev.md", "conventions-unit-test.md", "conventions-system-test.md", "conventions-build.md"],
  "conventions_data_generated": {{generate_data_doc}},
  "analysis_file": "{{platform_id}}.analysis-conventions.json",
  "completed_at": "{{iso_timestamp}}"
}</content>
          </task>
          <event action="log" level="info" message="Step 4 Status: COMPLETED - Done marker created"/>
        </branch>
      </gateway>

      <checkpoint name="done-marker-created" verify="file.exists({{output_path}}/conventions.done)"/>
    </script>
  </task>

  <!-- ==================== STEP 5: GENERATE ANALYSIS COVERAGE REPORT ==================== -->
  <task name="step5-generate-analysis-report" action="run-skill">
    <description>Generate analysis coverage report as JSON file</description>
    <script>
      <task action="determine-output-dir">
        <input name="completed_dir">{{completed_dir}}</input>
        <input name="output_path">{{output_path}}</input>
        <output name="report_output_dir" from="determination.dir"/>
      </task>

      <task action="create-file" target="{{report_output_dir}}/{{platform_id}}.analysis-conventions.json">
        <content>{
  "platform_id": "{{platform_id}}",
  "platform_type": "{{platform_type}}",
  "worker_type": "conventions",
  "analyzed_at": "{{iso_timestamp}}",
  "topics": {
    "i18n": {
      "status": "{{topic_i18n_status}}",
      "files_analyzed": {{topic_i18n_files}},
      "notes": ""
    },
    "authorization": {
      "status": "{{topic_auth_status}}",
      "files_analyzed": {{topic_auth_files}},
      "notes": ""
    },
    "menu_registration": {
      "status": "{{topic_menu_status}}",
      "files_analyzed": {{topic_menu_files}},
      "notes": ""
    },
    "data_dictionary": {
      "status": "{{topic_dict_status}}",
      "files_analyzed": {{topic_dict_files}},
      "notes": ""
    },
    "logging": {
      "status": "{{topic_logging_status}}",
      "files_analyzed": {{topic_logging_files}},
      "notes": ""
    },
    "api_request_layer": {
      "status": "{{topic_api_status}}",
      "files_analyzed": {{topic_api_files}},
      "notes": ""
    },
    "data_validation": {
      "status": "{{topic_validation_status}}",
      "files_analyzed": {{topic_validation_files}},
      "notes": ""
    },
    "file_upload": {
      "status": "{{topic_upload_status}}",
      "files_analyzed": {{topic_upload_files}},
      "notes": ""
    }
  },
  "config_files_analyzed": {{config_files}},
  "source_dirs_scanned": ["{{source_path}}"],
  "documents_generated": ["INDEX.md", "tech-stack.md", "architecture.md", "conventions-design.md", "conventions-dev.md", "conventions-unit-test.md", "conventions-system-test.md", "conventions-build.md"],
  "coverage_summary": {
    "topics_found": 0,
    "topics_partial": 0,
    "topics_not_found": 0,
    "topics_total": 8,
    "coverage_percent": 0
  }
}</content>
      </task>

      <checkpoint name="analysis-report-generated" verify="file.exists({{report_output_dir}}/{{platform_id}}.analysis-conventions.json)"/>
      <event action="log" level="info" message="Step 5 Status: COMPLETED - Analysis coverage report generated"/>
    </script>
  </task>

  <!-- ==================== STEP 6: REPORT RESULTS ==================== -->
  <task name="step6-report-results" action="run-skill">
    <description>Report final results and task completion</description>
    <script>
      <event action="log" level="info" message="==============================================="/>
      <event action="log" level="info" message="Platform Convention Documents Generated: {{platform_id}}"/>
      <event action="log" level="info" message="- INDEX.md: ✓"/>
      <event action="log" level="info" message="- tech-stack.md: ✓"/>
      <event action="log" level="info" message="- architecture.md: ✓"/>
      <event action="log" level="info" message="- conventions-design.md: ✓"/>
      <event action="log" level="info" message="- conventions-dev.md: ✓"/>
      <event action="log" level="info" message="- conventions-unit-test.md: ✓"/>
      <event action="log" level="info" message="- conventions-system-test.md: ✓"/>
      <event action="log" level="info" message="- conventions-build.md: ✓"/>
      <event action="log" level="info" message="- conventions-data.md: {{generate_data_doc ? '✓' : 'SKIPPED'}}"/>
      <event action="log" level="info" message="- {{platform_id}}.analysis-conventions.json: ✓"/>
      <event action="log" level="info" message="- Output Directory: {{output_path}}"/>
      <event action="log" level="info" message="==============================================="/>

      <output name="status" value="success"/>
      <output name="documents_generated" value="[INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md]"/>
      <output name="analysis_file" value="{{report_output_dir}}/{{platform_id}}.analysis-conventions.json"/>
      <output name="message" value="Convention documents generated for {{platform_id}}"/>

      <checkpoint name="workflow-complete" verify="true"/>
    </script>
  </task>

  <!-- ==================== FINAL OUTPUT ==================== -->
  <output name="status" from="step6-report-results.status"/>
  <output name="documents_generated" from="step6-report-results.documents_generated"/>
  <output name="analysis_file" from="step6-report-results.analysis_file"/>
  <output name="message" from="step6-report-results.message"/>

  <!-- ==================== ERROR HANDLING ==================== -->
  <error-handler>
    <catch type="file-not-found">
      <event action="log" level="error" message="File not found: {{error.file}}"/>
      <output name="status" value="failed"/>
      <output name="message" value="Required file not found: {{error.file}}"/>
    </catch>
    <catch type="template-error">
      <event action="log" level="error" message="Template processing error: {{error.message}}"/>
      <output name="status" value="failed"/>
      <output name="message" value="Failed to process template: {{error.message}}"/>
    </catch>
    <catch type="verification-failed">
      <event action="log" level="error" message="Verification failed: {{error.message}}"/>
      <output name="status" value="failed"/>
      <output name="message" value="Document verification failed: {{error.message}}"/>
    </catch>
    <catch type="context-limit">
      <event action="log" level="warning" message="Context window running low - checkpoint saved"/>
      <output name="status" value="partial"/>
      <output name="message" value="Execution paused due to context limit. Checkpoint saved, can resume."/>
    </catch>
    <finally>
      <event action="log" level="info" message="Workflow execution completed with status: {{status}}"/>
    </finally>
  </error-handler>

</workflow>
```

## Constraints

1. **DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.)** under any circumstances
2. **DO NOT analyze files outside the specified `{{source_path}}`**
3. **All content MUST be in the language specified by `{{language}}`**
4. **Use `search_replace` for section filling, NEVER rewrite entire document**
5. **Mermaid diagrams MUST follow the rules in `mermaid-rule.md`**
6. **All links MUST use relative paths, NEVER `file://` protocol**
7. **Write each document to file immediately after generation - DO NOT accumulate all documents in memory**
8. **DO NOT create done marker file until ALL required documents have been verified to exist on disk**

## Task Completion Report

When the task is complete, report the following:

**Status:** `success` | `partial` | `failed`

**Summary:**
- Platform: `{{platform_id}}`
- Type: `{{platform_type}}`
- Framework: `{{framework}}`
- Documents generated: 8 required + (1 optional if data layer detected)

**Files Generated:**
- `{{output_path}}/INDEX.md` - Platform technology index
- `{{output_path}}/tech-stack.md` - Technology stack details
- `{{output_path}}/architecture.md` - Architecture conventions
- `{{output_path}}/conventions-design.md` - Design conventions
- `{{output_path}}/conventions-dev.md` - Development conventions
- `{{output_path}}/conventions-unit-test.md` - Unit testing conventions
- `{{output_path}}/conventions-system-test.md` - System testing conventions
- `{{output_path}}/conventions-build.md` - Build and deployment conventions
- `{{output_path}}/conventions-data.md` - Data conventions (optional)
- `{{completed_dir}}/{{platform_id}}.analysis-conventions.json` - Analysis coverage report

## Checklist

### Pre-Generation
- [ ] All template files read successfully
- [ ] All configuration files read and parsed
- [ ] Technology stack extracted accurately
- [ ] Conventions analyzed from config files

### Document Generation
- [ ] INDEX.md generated with navigation
- [ ] tech-stack.md generated with dependency tables
- [ ] architecture.md generated with platform-specific patterns
- [ ] conventions-design.md generated with design principles
- [ ] conventions-dev.md generated with naming and style rules
- [ ] conventions-unit-test.md generated with unit testing requirements
- [ ] conventions-system-test.md generated with system testing requirements
- [ ] conventions-build.md generated with build and deployment conventions
- [ ] conventions-data.md generated (only if applicable per platform type mapping)

### Quality Checks
- [ ] All files written to output_path
- [ ] **Source traceability**: File reference block added to each document
- [ ] **Source traceability**: Diagram Source annotations added after each Mermaid diagram
- [ ] **Source traceability**: Section Source annotations added at end of major sections
- [ ] **Mermaid compatibility**: No `style`, `direction`, `<br/>`, or nested subgraphs
- [ ] **Document completeness**: All 8 required documents exist (verified in Step 3)
- [ ] **Done marker integrity**: Done marker only created after verification
- [ ] **Analysis Coverage Report**: `{{platform_id}}.analysis-conventions.json` generated

## CONTINUOUS EXECUTION RULES

This skill MUST execute continuously without user interruption:

1. **All steps must complete in a single session** - from template reading to done marker creation
2. **If context window is running low**: Save checkpoint and inform user - DO NOT create false done marker
3. **No intermediate user confirmation required** between steps
4. **Error handling**: On error, log details and stop - do not proceed with incomplete data
5. **Verification gate**: Step 3 verification MUST pass before Step 4 done marker creation
6. **Memory management**: Write each document immediately after generation, do not accumulate in memory
