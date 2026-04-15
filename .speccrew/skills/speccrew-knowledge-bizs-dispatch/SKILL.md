---
name: speccrew-knowledge-bizs-dispatch
description: Dispatch bizs knowledge base generation tasks with 5-stage pipeline (XML Block version). Handles feature inventory, feature analysis with skill routing, graph data writing, module summarization, UI style pattern extraction, and system summary.
tools: Read, Write, Task, Bash
---

> **⚠️ MANDATORY EXECUTION PROTOCOL — READ BEFORE EXECUTING ANY BLOCK**
>
> **Step 1**: Load XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md` — this defines all block types and action-to-tool mappings
>
> **Step 2**: Execute this SKILL.md's XML workflow **block by block in document order**. For EVERY block, you MUST follow this 3-step cycle:
>
> ```
> 📋 Block [ID] (action=[action]) — [desc]
> 🔧 Tool: [which IDE tool to call]
> ✅ Result: [output or status]
> ```
>
> Action-to-tool mapping:
> - `action="run-script"` → Execute via **Terminal tool** (pass the `<field name="command">` value EXACTLY)
> - `action="run-skill"` → Invoke via **Skill tool** (pass the `<field name="skill">` value EXACTLY)
> - `action="dispatch-to-worker"` → Create **Task** via **Task tool** for `speccrew-task-worker` (Worker loads and executes the skill, NOT you)
> - `action="confirm"` (event) → Present to user and wait for response
>
> **Step 3**: Execute ALL stages sequentially without pausing (only stop at explicit `<event action="confirm">` blocks)
>
> **FORBIDDEN**:
> - Do NOT skip the block announcement format above — every block must be announced before execution
> - Do NOT run terminal commands as substitute for Skill tool calls
> - Do NOT do Worker's job yourself — when `action="dispatch-to-worker"`, create a Task and let Worker handle it
> - Do NOT skip blocks or improvise your own commands
> - Do NOT read a skill's SKILL.md file yourself — use the Skill tool which resolves paths automatically

# Bizs Knowledge Dispatch (XML Block Version)

Orchestrate **bizs knowledge base generation** with a 5-stage pipeline using **XML Block system**: Feature Inventory → Feature Analysis + Graph Write → Module Summarize → UI Style Pattern Extract → System Summary.

## Invocation Method

**CRITICAL**: This skill is an **orchestration playbook** — it MUST be loaded directly by Team Leader via Skill tool (NOT via Worker Agent).

```
Correct: Leader uses Skill tool to load this playbook directly
Incorrect: Dispatch this skill to speccrew-task-worker
```

**Why?** This skill defines the orchestration workflow and prepares task plans for downstream workers. The Team Leader reads this playbook and dispatches individual worker tasks via Task tool → speccrew-task-worker for each stage.

**Correct Invocation Pattern**:
```xml
<block type="task" action="run-skill" desc="Leader directly invokes bizs-dispatch as orchestration playbook">
  <field name="skill">speccrew-knowledge-bizs-dispatch</field>
  <field name="note">Leader directly calls this dispatch skill as an orchestration playbook. The dispatch skill defines the workflow; Leader dispatches downstream workers via Task tool → speccrew-task-worker for each stage.</field>
</block>
```

**Worker Dispatch Rule**:
- Dispatch skills (bizs-dispatch, techs-dispatch): Leader calls directly via Skill tool
- Downstream worker skills (identify-entries, init-features, ui-analyze, module-summarize, etc.): Leader dispatches via Task tool → speccrew-task-worker

**FORBIDDEN**: Worker Agents MUST NOT execute this dispatch skill. If a Worker Agent loads this skill, it must report error and abort.

## Quick Reference — Execution Flow

```
Stage 0: Platform Detection
  └─ Detect platforms → Confirm platform list
        ↓
Stage 1: Feature Inventory Init
  └─ 1a: Entry directory recognition (identify-entries)
  └─ 1b: Feature inventory generation (init-features)
  └─ 1c: Feature merge (incremental mode)
        ↓
Stage 2: Feature Analysis (Batch Loop)
  └─ Step 0: Ensure completed_dir exists
  └─ Step 1: Get next batch of pending features
  └─ Step 2: Dispatch Worker for analysis (UI/API routing)
  └─ Step 2.5: Dispatch Graph Worker
  └─ Step 3: Process batch results → Update status
  └─ Loop until all features complete
        ↓
Stage 3: Module Summarize
  └─ Generate module overview for each module
        ↓
Stage 3.5: UI Style Pattern Extract
  └─ Extract UI style patterns for frontend platforms
        ↓
Stage 4: System Summary
  └─ Generate system-level business knowledge summary
```

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and pass it to all downstream Worker Agents.

- User writes in 中文 → Generate Chinese documents, pass `language: "zh"` to workers
- User writes in English → Generate English documents, pass `language: "en"` to workers
- User writes in other languages → Use appropriate language code

**All downstream skills must receive the `language` parameter and generate content in that language only.**

## Trigger Scenarios

- "Initialize bizs knowledge base"
- "Generate business knowledge from source code"
- "Dispatch bizs knowledge generation"
- "Generate knowledge base from src/views directory"
- "Analyze this subdirectory for knowledge base"

---

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`
>
> After reading the specification, parse the XML workflow and **strictly execute each `<block>` in document order**. Every `<block type="task">` is a literal tool-call instruction — use the `action` attribute to determine which IDE tool to invoke, and pass the `<field name="command">` or `<field name="skill">` value **exactly as written**. Do NOT interpret the workflow as a goal description or improvise your own approach.

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="bizs knowledge base generation input parameters">
    <field name="source_path" required="true" type="string" desc="Source code root directory path (can be a subdirectory; auto-detects platform root by traversing upward)"/>
    <field name="language" required="true" type="string" desc="User's language code (e.g., zh, en)"/>
    <field name="sync_mode" required="false" type="string" default="full" desc="full=complete | incremental=incremental"/>
    <field name="base_commit" required="false" type="string" desc="(incremental only) Git base commit hash"/>
    <field name="head_commit" required="false" type="string" default="HEAD" desc="(incremental only) Git HEAD commit hash"/>
    <field name="changed_files" required="false" type="array" desc="(incremental only) Pre-computed changed file list"/>
    <field name="max_concurrent_workers" required="false" type="number" default="5" desc="Maximum parallel Worker count"/>
    <field name="workspace_path" required="true" type="string" desc="Absolute path to speccrew-workspace directory"/>
    <field name="sync_state_bizs_dir" required="true" type="string" desc="Absolute path to knowledges/base/sync-state/knowledge-bizs/"/>
    <field name="ide_skills_dir" required="true" type="string" desc="Absolute path to IDE-specific skills directory (e.g., .qoder/skills/, .cursor/skills/, .claude/skills/) where skill scripts are deployed"/>
    <field name="configs_dir" required="true" type="string" desc="Absolute path to docs/configs/ directory"/>
    <field name="graph_root" required="false" type="string" desc="Graph data output root path (absolute path preferred)" default="${workspace_path}/knowledges/bizs/graph"/>
    <field name="completed_dir" required="true" type="string" desc="Marker file output directory for Worker results (absolute path required)"/>
  </block>

  <!-- ============================================================
       Global Invocation Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R-INVOCATION" level="forbidden" desc="Invocation constraints — NEVER violate">
    <field name="text">This skill is an ORCHESTRATION PLAYBOOK — it MUST be loaded directly by Team Leader via Skill tool</field>
    <field name="text">Worker Agents MUST NOT execute this dispatch skill — if loaded by a Worker, report error and abort</field>
    <field name="text">Downstream worker skills (identify-entries, init-features, ui-analyze, module-summarize, etc.) MUST be dispatched via Task tool → speccrew-task-worker</field>
  </block>

  <!-- ============================================================
       Global Continuous Execution Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" between stages</field>
    <field name="text">DO NOT offer options like "Full execution / Sample execution / Pause" — always execute ALL stages to completion</field>
    <field name="text">DO NOT suggest "Let me split this into batches" or "Let's do this in parts" — process ALL features sequentially</field>
    <field name="text">DO NOT pause to list what you plan to do next — just do it</field>
    <field name="text">DO NOT ask for confirmation before generating output files</field>
    <field name="text">DO NOT warn about "large number of files" or "this may take a while" — proceed with generation</field>
    <field name="text">ONLY pause at explicit &lt;event action="confirm"&gt; blocks defined in the workflow</field>
    <field name="text">DO NOT offer "continue/pause/partial" options — EVER</field>
    <field name="text">DO NOT estimate workload and suggest breaking it into phases — execute ALL phases in sequence</field>
    <field name="text">When many features need analysis, dispatch ALL of them — do NOT skip or defer any</field>
    <field name="text">Context window management: if approaching limit, save progress to checkpoint file and resume — do NOT ask user for guidance</field>
  </block>

  <!-- ============================================================
       Global Technology Stack Constraints
       ============================================================ -->
  <block type="rule" id="GLOBAL-R-TECHSTACK" level="forbidden" desc="Technology stack constraints — NEVER violate">
    <field name="text">FORBIDDEN: Python, Ruby, Perl, compiled binaries, or any runtime requiring separate installation</field>
    <field name="text">PERMITTED scripting: PowerShell (Windows) and Bash (Linux/Mac) ONLY</field>
    <field name="text">PERMITTED Node.js: ONLY for existing project scripts (e.g., node scripts/update-progress.js)</field>
    <field name="text">For JSON validation use: node -e "JSON.parse(require('fs').readFileSync('file.json','utf8'))"</field>
    <field name="text">For JSON creation use: node -e with inline script, or PowerShell ConvertTo-Json</field>
    <field name="text">DO NOT create temporary .py, .rb, .pl, .bat files — use inline commands via run_in_terminal</field>
  </block>

  <!-- ============================================================
       Stage 0: Platform Detection
       ============================================================ -->
  <sequence id="S0" name="Stage 0: Platform Detection" status="pending" desc="Automatically discover ALL platforms in the project">
    
    <block type="rule" id="S0-R1" level="mandatory" desc="Stage 0 mandatory rules">
      <field name="text">MUST scan project directory to discover ALL platforms — NEVER hardcode a fixed number of platforms</field>
      <field name="text">Missing a platform means incomplete knowledge base generation</field>
    </block>

    <!-- Step 1: Scan backend modules -->
    <block type="task" id="S0-B1" action="run-script" status="pending" desc="Scan backend module directories">
      <field name="command">Get-ChildItem -Path "${source_path}" -Filter "yudao-module-*" -Directory</field>
      <field name="alt_command">Get-ChildItem -Path "${source_path}" -Directory | Where-Object { $_.Name -match "^(module-|service-|api-)" }</field>
      <field name="output" var="backend_modules"/>
    </block>

    <!-- Step 2: Scan frontend projects -->
    <block type="task" id="S0-B2" action="run-script" status="pending" desc="Scan frontend/UI project directories">
      <field name="command">Get-ChildItem -Path "${source_path}" -Directory | Where-Object { $_.Name -match "ui|frontend|web|app" }</field>
      <field name="output" var="frontend_dirs"/>
    </block>

    <!-- Step 3: Validate each platform -->
    <block type="loop" id="S0-L1" over="${backend_modules}" as="module" desc="Validate backend modules">
      <block type="gateway" id="S0-G1" mode="guard" test="${module.hasSourceCode} == true" fail-action="skip" desc="Verify module has actual source code">
        <field name="message">Skipping empty directory: ${module.name}</field>
      </block>
      <block type="event" id="S0-E1" action="log" level="info" desc="Log backend module">
        <field name="message">Discovered backend module: ${module.name} → Platform type: backend-${module.business_name}</field>
      </block>
    </block>

    <block type="loop" id="S0-L2" over="${frontend_dirs}" as="frontend" desc="Validate frontend projects">
      <block type="task" id="S0-B3" action="run-script" status="pending" desc="Check frontend project structure">
        <field name="command">Test-Path "${frontend.path}/package.json"</field>
        <field name="output" var="has_package_json"/>
      </block>
      <block type="gateway" id="S0-G2" mode="guard" test="${has_package_json} == true" fail-action="skip" desc="Verify frontend project validity">
        <field name="message">Skipping non-frontend directory: ${frontend.name}</field>
      </block>
      <block type="event" id="S0-E2" action="log" level="info" desc="Log frontend platform">
        <field name="message">Discovered frontend platform: ${frontend.name} → Tech stack: Vue/React/UniApp</field>
      </block>
    </block>

    <!-- Step 4: Generate platform list JSON -->
    <block type="task" id="S0-B4" action="run-script" status="pending" desc="Generate platforms.json from discovered modules and frontends">
      <field name="command">node -e "const fs=require('fs'); const data=JSON.parse(process.argv[1]); fs.mkdirSync(process.argv[2], {recursive:true}); fs.writeFileSync(process.argv[2]+'/platforms.json', JSON.stringify(data,null,2)); console.log('platforms.json written')"</field>
      <field name="note">The LLM constructs the platforms array from S0-L1 and S0-L2 discovery results, then writes it via this inline script. No external platform-detector.js is needed.</field>
      <field name="arg">${platforms_json_string}</field>
      <field name="arg">${sync_state_bizs_dir}</field>
      <field name="output" var="platforms" from="${sync_state_bizs_dir}/platforms.json"/>
    </block>

    <!-- Step 5: Gate - Confirm platforms detected -->
    <block type="gateway" id="S0-G3" mode="guard" test="${platforms.length} > 0" fail-action="stop" desc="Confirm at least one platform detected">
      <field name="message">No platforms detected, please check source_path and platform-mapping.json</field>
    </block>

    <!-- Step 6: User confirmation -->
    <block type="event" id="S0-E3" action="confirm" title="Confirm Platform List" type="yesno" desc="Wait for user to confirm detected platform list">
      <field name="preview">
Detected ${platforms.length} platforms:
(For each platform in ${platforms}, display: ${platform.platformId}: ${sourcePath} (${platformType}/${platformSubtype}))

Continue with knowledge base generation?
      </field>
      <on-confirm>
        <block type="event" action="log" level="info" desc="User confirmed">
                  <field name="message">User confirmed platform list, continuing</field>
                </block>
      </on-confirm>
      <on-cancel>
        <block type="event" action="log" level="warn" desc="User cancelled">
                  <field name="message">User cancelled, terminating workflow</field>
                </block>
        <field name="workflow.status" value="cancelled"/>
      </on-cancel>
    </block>

    <!-- Checkpoint: Platform detection complete -->
    <block type="checkpoint" id="S0-CP1" name="platforms_detected" desc="Platform detection complete">
      <field name="file" value="${sync_state_bizs_dir}/.progress.json"/>
      <field name="verify" value="${platforms.length} > 0"/>
    </block>

    <block type="task" id="S0-B5" action="run-script" status="pending" desc="Update Stage 0 progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage0 --status completed --output "Detected ${platforms.length} platforms"</field>
    </block>

    <block type="event" id="S0-E4" action="log" level="info" desc="Report detected platform list">
    <field name="message">Detected ${platforms.length} platforms: ${platforms.names}</field>
    </block>
  </sequence>

  <!-- ============================================================
       Stage 1a: Entry Directory Recognition
       ============================================================ -->
  <sequence id="S1a" name="Stage 1a: Entry Directory Recognition" status="pending" desc="Identify entry directories for each platform and classify into business modules">
    
    <block type="rule" id="S1a-R1" level="mandatory" desc="Stage 1a mandatory rules">
      <field name="text">ALL platform entry directory recognition tasks MUST be dispatched IN PARALLEL — sequential execution is FORBIDDEN</field>
      <field name="text">ALL Worker dispatch calls in S1a-L1 MUST be issued SIMULTANEOUSLY in a SINGLE orchestration turn</field>
      <field name="text">DO NOT wait for any Worker to complete before dispatching the next Worker</field>
      <field name="text">Dispatch all ${max_concurrent_workers} workers at once, then wait for ALL to complete</field>
      <field name="text">Sequential one-by-one dispatch is STRICTLY FORBIDDEN</field>
    </block>

    <block type="loop" id="S1a-L1" over="${platforms}" as="platform" parallel="true" max-concurrency="${max_concurrent_workers}" desc="Dispatch entry directory recognition for each platform IN PARALLEL">
      <!-- Step 1: Read source directory tree -->
      <block type="task" id="S1a-B1" action="dispatch-to-worker" status="pending" desc="Dispatch entry identification to Worker">
        <field name="worker">speccrew-knowledge-bizs-identify-entries</field>
        <field name="source_path" value="${platform.sourcePath}"/>
        <field name="platform_id" value="${platform.platformId}"/>
        <field name="platform_type" value="${platform.platformType}"/>
        <field name="platform_subtype" value="${platform.platformSubtype}"/>
        <field name="tech_identifier" value="${platform.techIdentifier}"/>
        <field name="configs_dir" value="${configs_dir}"/>
        <field name="output_path" value="${sync_state_bizs_dir}/entry-dirs-${platform.platformId}.json"/>
        <field name="output" var="entries_${platform.platformId}"/>
      </block>

      <!-- Step 2: Validate entry directories -->
      <block type="gateway" id="S1a-G1" mode="guard" test="${entries_${platform.platformId}.modules.length} > 0" fail-action="stop" desc="Validate entry directory recognition result">
        <field name="message">Platform ${platform.platformId} did not identify any entry directories</field>
      </block>
    </block>

    <block type="checkpoint" id="S1a-CP1" name="entry_dirs_recognized" desc="Entry directory recognition complete">
      <field name="file" value="${sync_state_bizs_dir}/.progress.json"/>
      <field name="verify" value="true"/>
    </block>

    <block type="task" id="S1a-B2" action="run-script" status="pending" desc="Update Stage 1a progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage1a --status completed --output "Entry directories recognized for all platforms"</field>
    </block>
  </sequence>

  <!-- ============================================================
       Stage 1b: Generate Feature Inventory
       ============================================================ -->
  <sequence id="S1b" name="Stage 1b: Generate Feature Inventory" status="pending" desc="Generate Feature inventory for each platform">
    
    <block type="rule" id="S1b-R1" level="mandatory" desc="Stage 1b mandatory rules">
      <field name="text">ALL platform feature inventory generation tasks MUST be dispatched IN PARALLEL — sequential execution is FORBIDDEN</field>
      <field name="text">ALL Worker dispatch calls in S1b-L1 MUST be issued SIMULTANEOUSLY in a SINGLE orchestration turn</field>
      <field name="text">DO NOT wait for any Worker to complete before dispatching the next Worker</field>
      <field name="text">Dispatch all ${max_concurrent_workers} workers at once, then wait for ALL to complete</field>
      <field name="text">Sequential one-by-one dispatch is STRICTLY FORBIDDEN</field>
      <field name="text">Worker Agents do not have run_in_terminal capability, which is required for script execution</field>
    </block>

    <block type="loop" id="S1b-L1" over="${platforms}" as="platform" parallel="true" max-concurrency="${max_concurrent_workers}" desc="Generate Feature inventory for each platform IN PARALLEL">
      <!-- Step 1: Dispatch Worker to generate feature inventory -->
      <block type="task" id="S1b-B1" action="dispatch-to-worker" status="pending" desc="Dispatch Worker to generate feature inventory">
        <field name="worker">speccrew-knowledge-bizs-init-features</field>
        <field name="instructions">
Generate feature inventory for the specified platform by analyzing entry directories.

Requirements:
- Read entry-dirs JSON file to get module entry directories
- Scan source files in each entry directory
- Generate features JSON with feature metadata
- Output to features-{platformId}.json in sync_state_bizs_dir
        </field>
        <field name="context">{
  "platformId": "${platform.platformId}",
  "platformName": "${platform.platformName}",
  "platformType": "${platform.platformType}",
  "platformSubtype": "${platform.platformSubtype}",
  "sourcePath": "${platform.sourcePath}",
  "techIdentifier": "${platform.techIdentifier}",
  "entryDirsFile": "${sync_state_bizs_dir}/entry-dirs-${platform.platformId}.json",
  "outputDir": "${sync_state_bizs_dir}",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "language": "${language}"
}</field>
        <field name="output" var="features_${platform.platformId}"/>
      </block>

      <!-- Step 2: Validate Feature inventory -->
      <block type="gateway" id="S1b-G1" mode="guard" test="${features_${platform.platformId}.features.length} > 0" fail-action="stop" desc="Validate Feature inventory is not empty">
        <field name="message">Platform ${platform.platformId} did not generate any Features</field>
      </block>
    </block>

    <block type="checkpoint" id="S1b-CP1" name="features_generated" desc="Feature inventory generation complete">
      <field name="file" value="${sync_state_bizs_dir}/.progress.json"/>
      <field name="verify" value="${all_features.length} > 0"/>
    </block>

    <block type="task" id="S1b-B2" action="run-script" status="pending" desc="Update Stage 1b progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage1b --status completed --output "${feature_count} features across ${platform_count} platforms"</field>
    </block>

    <block type="event" id="S1b-E1" action="log" level="info" desc="Report Feature inventory statistics">
    <field name="message">Feature inventory initialized. ${feature_count} features across ${platform_count} platforms.</field>
    </block>
  </sequence>

  <!-- ============================================================
       Stage 1c: Feature Merge (Incremental Mode)
       ============================================================ -->
  <sequence id="S1c" name="Stage 1c: Feature Merge" status="pending" desc="Merge new and existing Feature inventories in incremental mode">
    
    <block type="rule" id="S1c-R1" level="mandatory" desc="Stage 1c mandatory rules">
      <field name="text">This stage is executed DIRECTLY by the dispatch agent (Leader) via run_in_terminal, NOT delegated to a Worker Agent</field>
    </block>

    <!-- Conditional: Incremental mode -->
    <block type="gateway" id="S1c-G1" mode="exclusive" desc="Determine execution mode">
      <branch test="${sync_mode} == 'incremental'" name="Incremental mode">
        <!-- Step 1: Execute Feature merge -->
        <block type="task" id="S1c-B1" action="run-script" status="pending" desc="Merge new and existing Feature inventories">
          <field name="command">node "${ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/merge-features.js"</field>
          <field name="arg">--syncStatePath</field>
          <field name="arg">${sync_state_bizs_dir}</field>
          <field name="arg">--completedDir</field>
          <field name="arg">${completed_dir}</field>
          <field name="arg">--projectRoot</field>
          <field name="arg">${source_path}</field>
          <field name="output" var="merge_result"/>
        </block>

        <!-- Step 2: Report merge result -->
        <block type="event" id="S1c-E1" action="log" level="info" desc="Report merge result">
        <field name="message">Feature merge complete:
- Added: ${merge_result.added}
- Removed: ${merge_result.removed}
- Changed: ${merge_result.changed} (reset for re-analysis)
- Unchanged: ${merge_result.unchanged} (analysis state preserved)</field>
        </block>

        <!-- Step 3: Mark stale Features -->
        <block type="task" id="S1c-B2" action="run-script" status="pending" desc="Clean up documents and markers for deleted Features">
          <field name="command">node "${ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/mark-stale.js"</field>
          <field name="arg">--syncStatePath</field>
          <field name="arg">${sync_state_bizs_dir}</field>
          <field name="arg">--completedDir</field>
          <field name="arg">${completed_dir}</field>
        </block>
      </branch>
      <branch default="true" name="Full mode">
        <block type="event" id="S1c-E2" action="log" level="info" desc="Full mode skip merge">
        <field name="message">Full mode, skipping Feature merge step</field>
        </block>
      </branch>
    </block>

    <block type="checkpoint" id="S1c-CP1" name="feature_merge_complete" desc="Feature merge complete">
      <field name="file" value="${sync_state_bizs_dir}/.progress.json"/>
      <field name="passed" value="true"/>
    </block>

    <block type="task" id="S1c-B3" action="run-script" status="pending" desc="Update Stage 1c progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage1c --status completed</field>
    </block>
  </sequence>

  <!-- ============================================================
       Stage 2: Feature Analysis (Batch Processing)
       ============================================================ -->
  <sequence id="S2" name="Stage 2: Feature Analysis" status="pending" desc="Batch process Feature analysis, dispatch Workers to execute">

    <block type="task" id="S2-B-Start" action="run-script" status="pending" desc="Update Stage 2 progress to in_progress">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage2 --status in_progress</field>
    </block>

    <block type="rule" id="S2-R1" level="mandatory" desc="Stage 2 mandatory rules">
      <field name="text">MUST use batch-orchestrator for batch management — DO NOT manually track batches</field>
      <field name="text">MUST dispatch Workers for feature analysis — DO NOT analyze features yourself</field>
      <field name="text">ALL workers for the same stage MUST be dispatched in PARALLEL — sequential execution is FORBIDDEN</field>
      <field name="text">ALL Worker dispatch calls in S2-L2 MUST be issued SIMULTANEOUSLY in a SINGLE orchestration turn</field>
      <field name="text">DO NOT wait for any Worker to complete before dispatching the next Worker</field>
      <field name="text">Dispatch all ${max_concurrent_workers} workers at once, then wait for ALL to complete</field>
      <field name="text">Sequential one-by-one dispatch is STRICTLY FORBIDDEN</field>
      <field name="text">Monitor completion via marker files, NOT by polling worker status</field>
    </block>

    <block type="rule" id="S2-R2" level="forbidden" desc="Stage 2 forbidden actions">
      <field name="text">DO NOT skip pending features — every feature must be analyzed</field>
      <field name="text">DO NOT generate feature analysis content yourself — always dispatch to Worker</field>
      <field name="text">DO NOT proceed to next Stage until ALL workers in current Stage have completed or failed</field>
    </block>

    <!-- Step 0: Ensure completed_dir exists (MANDATORY) -->
    <block type="task" id="S2-B0" action="run-script" status="pending" desc="Ensure completed_dir directory exists">
      <field name="command">node -e "require('fs').mkdirSync('${completed_dir}', {recursive: true}); console.log('completed dir ready')"</field>
    </block>

    <block type="rule" id="S2-R3" level="mandatory" desc="completed_dir path rules">
      <field name="text">completed_dir MUST be an ABSOLUTE path (e.g., d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed)</field>
      <field name="text">Relative paths will cause Worker marker file writes to fail silently</field>
    </block>

    <!-- Batch Loop: Step 1→2→2.5→3 loop until all features processed -->
    <block type="loop" id="S2-L-Main" over="${batches}" as="batch_iteration" desc="Batch loop to process Features">
      
      <!-- Step 1: Get next batch -->
      <block type="task" id="S2-B1" action="run-script" status="pending" desc="Get next batch of pending Features">
        <field name="command">node "${ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/batch-orchestrator.js" get-batch</field>
        <field name="arg">--syncStatePath</field>
        <field name="arg">${sync_state_bizs_dir}</field>
        <field name="arg">--batchSize</field>
        <field name="arg">${max_concurrent_workers}</field>
        <field name="output" var="batch_response"/>
      </block>

      <!-- Determine if complete -->
      <block type="gateway" id="S2-G0" mode="exclusive" desc="Determine batch response">
        <branch test="${batch_response.action} == 'done'" name="All Features processed">
          <block type="event" id="S2-E-Done" action="log" level="info" desc="All Features processed">
          <field name="message">All Features analyzed, exiting Stage 2 loop</field>
          </block>
          <field name="stage2_complete" value="true"/>
        </branch>
        <branch test="${batch_response.action} == 'process'" name="Process current batch">
          
          <!-- Step 2: Prepare analysis task specifications -->
          <block type="event" id="S2-E-Batch" action="log" level="info" desc="Report current batch">
          <field name="message">Processing batch: ${batch_response.batch.length} Features</field>
          </block>

          <!-- Step 2: Dispatch Worker for each Feature -->
          <!-- PARALLEL EXECUTION MANDATORY: All Workers MUST be dispatched SIMULTANEOUSLY in ONE turn -->
          <block type="loop" id="S2-L2" over="${batch_response.batch}" as="feature" parallel="true" max-concurrency="${max_concurrent_workers}" desc="Dispatch analysis Worker for each Feature">
            
            <!-- Route to different Skill based on platformType -->
            <block type="gateway" id="S2-G1" mode="exclusive" desc="Route analysis Skill based on platform type">
              <branch test="${feature.platformType} == 'web' or ${feature.platformType} == 'mobile' or ${feature.platformType} == 'desktop'" name="UI platform">
                <block type="task" id="S2-B2a" action="dispatch-to-worker" status="pending" desc="Dispatch UI Feature analysis Worker">
                  <field name="worker">speccrew-knowledge-bizs-ui-analyze</field>
                  <field name="instructions">
Analyze the following source code file and generate detailed feature documentation.

CRITICAL - Template Fill-in Workflow (MANDATORY):
1. First, copy the analysis template to documentPath (template structure = document skeleton)
2. Then fill each Section using search_replace to replace placeholders with actual data
3. NEVER use create_file to rewrite the entire document — this destroys template structure
4. NEVER delete or skip any template Section — if no data available, fill with "N/A"
5. NEVER create custom Section structures — use ONLY the template's predefined Sections

Requirements:
- Read source code file, understand related functionality interfaces
- Generate detailed documentation to documentPath
- Create two marker files to completed_dir
- Use speccrew-knowledge-bizs-ui-analyze skill to complete this task
                  </field>
                  <field name="context">{
  "fileName": "${feature.fileName}",
  "sourcePath": "${feature.sourcePath}",
  "module": "${feature.module}",
  "documentPath": "${feature.documentPath}",
  "platformType": "${feature.platformType}",
  "platformSubtype": "${feature.platformSubtype}",
  "language": "${language}",
  "completed_dir": "${completed_dir}",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "sourceFile": "${feature.sourceFile}"
}</field>
                  <field name="output" var="analyze_result_${feature.id}"/>
                </block>
              </branch>
              <branch default="true" name="Backend platform">
                <block type="task" id="S2-B2b" action="dispatch-to-worker" status="pending" desc="Dispatch API Feature analysis Worker">
                  <field name="worker">speccrew-knowledge-bizs-api-analyze</field>
                  <field name="instructions">
Analyze the following source code file and generate detailed API feature documentation.

CRITICAL - Template Fill-in Workflow (MANDATORY):
1. First, copy the analysis template to documentPath
2. Then fill each Section using search_replace
3. NEVER use create_file to rewrite the entire document
4. NEVER delete or skip any template Section

Requirements:
- Read API Controller source code
- Extract API endpoints, request/response structures
- Generate detailed documentation to documentPath
- Create .done.json and .graph.json marker files
                  </field>
                  <field name="context">{
  "fileName": "${feature.fileName}",
  "sourcePath": "${feature.sourcePath}",
  "module": "${feature.module}",
  "documentPath": "${feature.documentPath}",
  "platformType": "${feature.platformType}",
  "platformSubtype": "${feature.platformSubtype}",
  "language": "${language}",
  "completed_dir": "${completed_dir}",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "sourceFile": "${feature.sourceFile}"
}</field>
                  <field name="output" var="analyze_result_${feature.id}"/>
                </block>
              </branch>
            </block>
          </block>

          <!-- Step 2.5: Graph Worker Task Preparation -->
          <block type="event" id="S2-E-Graph" action="log" level="info" desc="Prepare Graph Worker tasks">
          <field name="message">Preparing Graph data generation for completed Features</field>
          </block>

          <!-- Step 2.5: Dispatch Graph Worker -->
          <!-- PARALLEL EXECUTION MANDATORY: All Graph Workers MUST be dispatched SIMULTANEOUSLY in ONE turn -->
          <block type="loop" id="S2-L25" over="${batch_response.batch}" as="feature" parallel="true" max-concurrency="${max_concurrent_workers}" desc="Dispatch Graph Worker for each Feature IN PARALLEL">
            <block type="gateway" id="S2-G2" mode="exclusive" desc="Route Graph Worker based on analysis type">
              <branch test="${feature.platformType} == 'backend'" name="API Graph">
                <block type="task" id="S2-B25a" action="dispatch-to-worker" status="pending" desc="Dispatch API Graph Worker">
                  <field name="worker">speccrew-knowledge-bizs-api-graph</field>
                  <field name="instructions">
Generate graph data nodes and edges from the analyzed API feature document.

Requirements:
- Read the API analysis document at api_analysis_path
- Extract entities (APIs, services, tables, DTOs)
- Generate graph nodes and edges
- Write graph JSON to output_dir
- Create .graph-done.json completion marker at output_dir
                  </field>
                  <field name="context">{
  "api_analysis_path": "${feature.documentPath}",
  "platform_id": "${feature.platformId}",
  "output_dir": "${completed_dir}",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "module": "${feature.module}",
  "fileName": "${feature.fileName}",
  "sourcePath": "${feature.sourcePath}",
  "sourceFile": "${feature.sourceFile}",
  "language": "${language}",
  "subpath": "${feature.subpath}"
}</field>
                  <field name="output" var="graph_result_${feature.id}"/>
                </block>
              </branch>
              <branch default="true" name="UI Graph">
                <block type="task" id="S2-B25b" action="dispatch-to-worker" status="pending" desc="Dispatch UI Graph Worker">
                  <field name="worker">speccrew-knowledge-bizs-ui-graph</field>
                  <field name="instructions">
Generate graph data nodes and edges from the analyzed UI feature document.

Requirements:
- Read the UI analysis document at documentPath
- Extract entities (pages, components, API calls, navigations)
- Generate graph nodes and edges
- Write graph JSON to completed_dir
- Create .graph-done.json completion marker at completed_dir
                  </field>
                  <field name="context">{
  "feature": "${feature}",
  "fileName": "${feature.fileName}",
  "sourcePath": "${feature.sourcePath}",
  "documentPath": "${feature.documentPath}",
  "module": "${feature.module}",
  "platform_type": "${feature.platformType}",
  "platform_subtype": "${feature.platformSubtype}",
  "completed_dir": "${completed_dir}",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "sourceFile": "${feature.sourceFile}",
  "language": "${language}"
}</field>
                  <field name="output" var="graph_result_${feature.id}"/>
                </block>
              </branch>
            </block>
          </block>

          <!-- Step 3: Process batch results -->
          <block type="task" id="S2-B3" action="run-script" status="pending" desc="Collect and process batch Worker results">
            <field name="command">node "${ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/batch-orchestrator.js" process-results</field>
            <field name="arg">--syncStatePath</field>
            <field name="arg">${sync_state_bizs_dir}</field>
            <field name="arg">--graphRoot</field>
            <field name="arg">${graph_root}</field>
            <field name="arg">--completedDir</field>
            <field name="arg">${completed_dir}</field>
            <field name="output" var="batch_result"/>
          </block>

          <block type="event" id="S2-E-Result" action="log" level="info" desc="Report batch processing result">
          <field name="message">Batch processing complete: ${batch_result.success} succeeded, ${batch_result.failed} failed</field>
          </block>
        </branch>
      </block>
    </block>

    <block type="checkpoint" id="S2-CP1" name="feature_analysis_complete" desc="All Feature analysis complete">
      <field name="file" value="${sync_state_bizs_dir}/.progress.json"/>
      <field name="verify" value="${pending_features.length} == 0"/>
    </block>

    <block type="task" id="S2-B-End" action="run-script" status="pending" desc="Update Stage 2 progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage2 --status completed --output "${analyzed_count} features analyzed"</field>
    </block>

    <block type="event" id="S2-E-Final" action="log" level="info" desc="Stage 2 complete">
    <field name="message">Stage 2 Milestone: Feature analysis complete. ${analyzed_count} features analyzed, ${failed_count} failed. ${graph_count} graph data files generated.</field>
    </block>
  </sequence>

  <!-- ============================================================
       Stage 3: Module Summarize
       ============================================================ -->
  <sequence id="S3" name="Stage 3: Module Summarize" status="pending" desc="Generate module overview for each module">
    
    <block type="rule" id="S3-R1" level="mandatory" desc="Stage 3 mandatory rules">
      <field name="text">Worker dispatch is handled by the calling Agent (Team Leader). This Skill only prepares the task plan and parameters.</field>
      <field name="text">ALL module summary workers MUST be dispatched IN PARALLEL — sequential execution is FORBIDDEN</field>
      <field name="text">ALL Worker dispatch calls in S3-L2 MUST be issued SIMULTANEOUSLY in a SINGLE orchestration turn</field>
      <field name="text">DO NOT wait for any Worker to complete before dispatching the next Worker</field>
      <field name="text">Dispatch all ${max_concurrent_workers} workers at once, then wait for ALL to complete</field>
      <field name="text">Sequential one-by-one dispatch is STRICTLY FORBIDDEN</field>
      <field name="text">Workers MUST NOT create any temporary scripts or workaround files</field>
    </block>

    <!-- Step 1: Read all features JSON -->
    <block type="task" id="S3-B1" action="run-script" status="pending" desc="Read all platform features JSON">
      <field name="command">node -e "const fs=require('fs'); const files=fs.readdirSync('${sync_state_bizs_dir}').filter(f=>f.startsWith('features-')); console.log(JSON.stringify(files))"</field>
      <field name="output" var="features_files"/>
    </block>

    <!-- Step 2: Prepare module summary tasks for each platform -->
    <block type="loop" id="S3-L1" over="${platforms}" as="platform" parallel="true" max-concurrency="${max_concurrent_workers}" desc="Prepare module summary tasks for each platform IN PARALLEL">
      <!-- Step 2.1: Read platform features -->
      <block type="task" id="S3-B2" action="run-script" status="pending" desc="Read platform features">
        <field name="command">node -e "console.log(require('fs').readFileSync('${sync_state_bizs_dir}/features-${platform.platformId}.json', 'utf8'))"</field>
        <field name="output" var="platform_features"/>
      </block>

      <!-- Step 2.2: Extract module list -->
      <block type="task" id="S3-B3" action="run-script" status="pending" desc="Extract module list">
        <field name="command">node -e "const f=JSON.parse(process.argv[2]); const modules=[...new Set(f.features.map(x=>x.module))]; console.log(JSON.stringify(modules))" "${platform_features}"</field>
        <field name="output" var="platform_modules"/>
      </block>

      <!-- Step 2.3: Dispatch Worker for each module -->
      <!-- PARALLEL EXECUTION MANDATORY: All Module Summary Workers MUST be dispatched SIMULTANEOUSLY in ONE turn -->
      <block type="loop" id="S3-L2" over="${platform_modules}" as="module_name" parallel="true" max-concurrency="${max_concurrent_workers}" desc="Dispatch summary Worker for each module">
        <block type="task" id="S3-B4" action="dispatch-to-worker" status="pending" desc="Dispatch module summary Worker">
          <field name="worker">speccrew-knowledge-module-summarize</field>
          <field name="instructions">
Generate complete module overview documentation for the specified module.

Requirements:
- Read all Feature documents under the module
- Aggregate and generate module-level overview
- Output to {module_path}/{module_name}-overview.md
          </field>
          <field name="context">{
  "module_name": "${module_name}",
  "module_path": "${workspace_path}/knowledges/bizs/${platform.platformId}/${module_name}/",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "language": "${language}"
}</field>
          <field name="output" var="module_result_${platform.platformId}_${module_name}"/>
        </block>
      </block>
    </block>

    <block type="checkpoint" id="S3-CP1" name="module_summarize_complete" desc="Module summary generation complete">
      <field name="file" value="${sync_state_bizs_dir}/.progress.json"/>
      <field name="passed" value="true"/>
    </block>

    <block type="task" id="S3-B5" action="run-script" status="pending" desc="Update Stage 3 progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage3 --status completed --output "${module_count} modules summarized"</field>
    </block>

    <block type="event" id="S3-E1" action="log" level="info" desc="Stage 3 complete">
    <field name="message">Stage 3 Milestone: Module summaries complete. ${module_count} modules summarized.</field>
    </block>
  </sequence>

  <!-- ============================================================
       Stage 3.5: UI Style Pattern Extract
       ============================================================ -->
  <sequence id="S3.5" name="Stage 3.5: UI Style Pattern Extract" status="pending" desc="Extract UI style patterns for frontend platforms">
    
    <block type="rule" id="S35-R1" level="mandatory" desc="Stage 3.5 mandatory rules">
      <field name="text">Worker dispatch is handled by the calling Agent (Team Leader). This Skill only prepares the task plan and parameters.</field>
      <field name="text">ALL UI style extraction workers MUST be dispatched IN PARALLEL — sequential execution is FORBIDDEN</field>
      <field name="text">ALL Worker dispatch calls in S35-L1 MUST be issued SIMULTANEOUSLY in a SINGLE orchestration turn</field>
      <field name="text">DO NOT wait for any Worker to complete before dispatching the next Worker</field>
      <field name="text">Dispatch all ${max_concurrent_workers} workers at once, then wait for ALL to complete</field>
      <field name="text">Sequential one-by-one dispatch is STRICTLY FORBIDDEN</field>
      <field name="text">This stage writes to techs knowledge base, not bizs knowledge base</field>
    </block>

    <!-- Dispatch UI Style Extract Worker for each frontend platform -->
    <!-- PARALLEL EXECUTION MANDATORY: All UI Style Workers MUST be dispatched SIMULTANEOUSLY in ONE turn -->
    <block type="loop" id="S35-L1" over="${platforms}" as="platform" parallel="true" max-concurrency="${max_concurrent_workers}" desc="Dispatch UI style extraction Workers for frontend platforms IN PARALLEL">
      <block type="gateway" id="S35-G1" mode="exclusive" desc="Execute for UI platforms only">
        <branch test="${platform.platformType} in ['web', 'mobile', 'desktop']" name="UI platform">
          <block type="task" id="S35-B1" action="dispatch-to-worker" status="pending" desc="Dispatch UI style extraction Worker">
            <field name="worker">speccrew-knowledge-bizs-ui-style-extract</field>
            <field name="instructions">
Extract UI design patterns from frontend platform Feature documents.

Requirements:
- Analyze Feature documents for page types, component patterns, layout patterns
- Generate pattern documents under page-types/, components/, layouts/ directories
- Output to {workspace_path}/knowledges/techs/{platform_id}/ui-style-patterns/
            </field>
            <field name="context">{
  "platform_id": "${platform.platformId}",
  "platform_type": "${platform.platformType}",
  "feature_docs_path": "${workspace_path}/knowledges/bizs/${platform.platformId}",
  "features_manifest_path": "${sync_state_bizs_dir}/features-${platform.platformId}.json",
  "module_overviews_path": "${workspace_path}/knowledges/bizs/${platform.platformId}/",
  "output_path": "${workspace_path}/knowledges/techs/${platform.platformId}/ui-style-patterns/",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "language": "${language}"
}</field>
            <field name="output" var="ui_style_result_${platform.platformId}"/>
          </block>
        </branch>
        <branch default="true" name="Non-UI platform">
          <block type="event" id="S35-E1" action="log" level="info" desc="Backend platform skip style extraction">
          <field name="message">Backend platform ${platform.platformId} skipping UI style extraction</field>
          </block>
        </branch>
      </block>
    </block>

    <block type="event" id="S35-E2" action="log" level="info" desc="Stage 3.5 complete">
    <field name="message">Stage 3.5 Milestone: UI style patterns extracted. ${pattern_count} patterns extracted from ${frontend_platform_count} platforms.</field>
    </block>

    <block type="task" id="S35-B2" action="run-script" status="pending" desc="Update Stage 3.5 progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage3.5 --status completed --output "${pattern_count} patterns extracted"</field>
    </block>
  </sequence>

  <!-- ============================================================
       Stage 4: System Summarize
       ============================================================ -->
  <sequence id="S4" name="Stage 4: System Summarize" status="pending" desc="Generate system-level business knowledge summary">
    
    <block type="rule" id="S4-R1" level="mandatory" desc="Stage 4 prerequisites">
      <field name="text">ALL platform modules must be summarized before system summarize</field>
      <field name="text">MUST include cross-platform analysis if multiple platforms exist</field>
      <field name="text">Worker dispatch is handled by the calling Agent (Team Leader)</field>
    </block>

    <!-- Step 1: Read all platform structures -->
    <block type="task" id="S4-B1" action="run-script" status="pending" desc="Read all platform features JSON">
      <field name="command">node -e "const fs=require('fs'); const files=fs.readdirSync('${sync_state_bizs_dir}').filter(f=>f.startsWith('features-')); const platforms=files.map(f=>JSON.parse(fs.readFileSync('${sync_state_bizs_dir}/'+f))); console.log(JSON.stringify(platforms))"</field>
      <field name="output" var="all_platforms_data"/>
    </block>

    <!-- Step 2: Dispatch System Summarize Worker -->
    <block type="task" id="S4-B2" action="dispatch-to-worker" status="pending" desc="Dispatch system summary Worker">
      <field name="worker">speccrew-knowledge-system-summarize</field>
      <field name="instructions">
Generate complete system-level business knowledge summary.

Requirements:
- Aggregate business knowledge from all platforms and modules
- Generate platform index and module hierarchy
- Include cross-platform analysis (if multiple platforms exist)
- Output to {workspace_path}/knowledges/bizs/system-overview.md
      </field>
      <field name="context">{
  "modules_path": "${workspace_path}/knowledges/bizs/",
  "output_path": "${workspace_path}/knowledges/bizs/",
  "workspace_path": "${workspace_path}",
  "sync_state_bizs_dir": "${sync_state_bizs_dir}",
  "language": "${language}",
  "platforms": "${all_platforms_data}"
}</field>
      <field name="output" var="system_summary"/>
    </block>

    <block type="checkpoint" id="S4-CP1" name="system_summarize_complete" desc="System summary generation complete">
      <field name="file" value="${sync_state_bizs_dir}/.progress.json"/>
      <field name="passed" value="true"/>
    </block>

    <block type="task" id="S4-B3" action="run-script" status="pending" desc="Update Stage 4 progress to completed">
      <field name="command">node "${workspace_path}/scripts/update-progress.js" update-workflow --file "${sync_state_bizs_dir}/WORKFLOW-PROGRESS.json" --stage Stage4 --status completed --output "System overview generated"</field>
    </block>

    <block type="event" id="S4-E1" action="log" level="info" desc="Stage 4 complete">
    <field name="message">Stage 4 Milestone: System overview generated. All stages complete. Pipeline finished successfully.</field>
    </block>
  </sequence>

  <!-- ============================================================
       Error Handling
       ============================================================ -->
  <block type="error-handler" id="EH1" desc="Global error handling">
    <try>
      <!-- Main workflow defined in sequences above -->
    </try>
    <catch on="worker_failed">
      <block type="event" id="EH1-E1" action="log" level="warn" desc="Worker failed, log error and continue">
      <field name="message">Worker ${error.worker} failed: ${error.message}</field>
      </block>
      <block type="task" id="EH1-B1" action="run-script" desc="Update failed status">
        <field name="command">node "${ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/update-feature-status.js"</field>
        <field name="arg">--featureId</field>
        <field name="arg">${error.feature_id}</field>
        <field name="arg">--status</field>
        <field name="arg">failed</field>
        <field name="arg">--error</field>
        <field name="arg">${error.message}</field>
      </block>
    </catch>
    <catch on="script_error">
      <block type="event" id="EH1-E2" action="log" level="error" desc="Script execution failed">
      <field name="message">Script ${error.script} execution failed: ${error.message}</field>
      </block>
    </catch>
    <catch on="stage_abort">
      <block type="event" id="EH1-E3" action="log" level="error" desc="Stage aborted">
      <field name="message">Stage ${error.stage} execution aborted: ${error.message}</field>
      </block>
      <block type="event" id="EH1-E4" action="log" level="warn" desc="High failure rate">
      <field name="message">Failure rate exceeds 50%, terminating entire pipeline</field>
      </block>
    </catch>
  </block>

  <!-- ============================================================
       Output Results
       ============================================================ -->
  <block type="output" id="O1" desc="bizs knowledge base generation results">
    <field name="platforms_processed" from="${platforms}" type="array" desc="List of processed platforms"/>
    <field name="features_total" from="${all_features.length}" type="number" desc="Total Feature count"/>
    <field name="features_success" from="${success_count}" type="number" desc="Successfully analyzed Feature count"/>
    <field name="features_failed" from="${failed_count}" type="number" desc="Failed Feature count"/>
    <field name="modules_summarized" from="${module_count}" type="number" desc="Summarized module count"/>
    <field name="ui_patterns_extracted" from="${pattern_count}" type="number" desc="Extracted UI style pattern count"/>
    <field name="system_summary" from="${system_summary.path}" type="string" desc="System summary file path"/>
    <field name="graph_root" from="${graph_root}" type="string" desc="Graph data output directory"/>
  </block>
</workflow>

---

## Appendix: Reference

### Skill Routing Table (Stage 2)

> **Note**: Detailed routing logic is defined in XML Stage 2 gateway (S2-G1).

| platformType | skill_name | Description |
|--------------|------------|-------------|
| `web` | `speccrew-knowledge-bizs-ui-analyze` | Web frontend (Vue/React/Angular) |
| `mobile` | `speccrew-knowledge-bizs-ui-analyze` | Mobile apps (Flutter/React Native/UniApp) |
| `desktop` | `speccrew-knowledge-bizs-ui-analyze` | Desktop apps (Electron/WPF) |
| `backend` | `speccrew-knowledge-bizs-api-analyze` | Backend APIs (Java/Python/Node.js) |

---

### Platform Types

| Platform Type | Platform Subtype | Description |
|---------------|------------------|-------------|
| `web` | `vue`, `react`, `angular` | Web frontend applications |
| `mobile` | `uniapp`, `flutter`, `react-native` | Mobile applications |
| `desktop` | `electron`, `wpf` | Desktop applications |
| `backend` | `spring`, `nodejs`, `python` | Backend services |

---

### Worker Completion Marker Format

#### Marker File Naming Convention

**Pattern**: `{module}-{subpath}-{fileName}.{type}.json`

| Component | Description | Example |
|-----------|-------------|---------|
| `module` | Business module name | `chat`, `user`, `order` |
| `subpath` | Sub-path within module, `/` replaced with `-`. Empty if file is directly under module | `admin`, `api-v2` |
| `fileName` | Source file name WITHOUT extension | `UserController`, `ChatService` |
| `type` | Marker type: `done`, `error`, or `skip` | `done` |

**Examples**:

| Source File Path | Marker File Name |
|------------------|------------------|
| `chat/ChatController.java` | `chat-ChatController.done.json` |
| `user/admin/UserController.java` | `user-admin-UserController.done.json` |
| `order/api/v2/OrderService.java` | `order-api-v2-OrderService.done.json` |

#### .done.json Required Fields

```json
{
  "fileName": "<class name without extension>",
  "sourcePath": "<relative source file path>",
  "sourceFile": "<features JSON filename, e.g. features-backend-ai.json>",
  "module": "<business module name>",
  "status": "success|partial|failed",
  "analysisNotes": "<brief notes>"
}
```

> WRONG: Writing plain text like "COMPLETED" or "Analysis done"
> CORRECT: Writing valid JSON with all required fields

---

### Batch Processing Details

#### get-batch Script Output Format

```json
{
  "action": "process|done",
  "batch": [
    {
      "id": "feature-001",
      "fileName": "UserController",
      "sourcePath": "controller/admin/user/UserController.java",
      "module": "user",
      "documentPath": "speccrew-workspace/knowledges/bizs/backend-system/user/UserController.md",
      "platformType": "backend",
      "platformSubtype": "spring",
      "platformId": "backend-system",
      "sourceFile": "features-backend-system.json"
    }
  ]
}
```

#### process-results Script Behavior

- Scans `.done.json` files → updates feature status to `completed` in features-*.json
- Scans `.graph-done.json` files → confirms graph data generation complete
- Scans `.graph.json` files → writes graph data (nodes + edges) grouped by module
- Cleans up all marker files

---

### Stateless Design

Dispatch adopts a fully stateless file-driven design. Re-execute loop to recover: `get-batch` auto-recovers from file state; `process-results` handles uncleaned markers. The entire flow is safely re-entrant.

---

### Large-Scale Scenario Guidance

For modules with >20 features: dispatch multiple Worker Agents in parallel (each handles a subset). Use `get-next-batch` for resume support across sessions. Run `process-batch-results --validateDocs` after completion to verify.


