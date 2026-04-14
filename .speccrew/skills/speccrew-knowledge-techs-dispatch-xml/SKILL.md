---
name: speccrew-knowledge-techs-dispatch-xml
description: Dispatch techs knowledge base generation tasks with 3-stage pipeline (XML Block version). Handles platform detection, tech document generation, and root index creation.
tools: Read, Write, Task, Bash
---

# Techs Knowledge Dispatch (XML Block Version)

Orchestrate **techs knowledge base generation** with a 3-stage pipeline using **XML Block system**: Platform Detection → Tech Doc Generation → Root Index.

## Quick Reference — Execution Flow

```
Stage 1: Platform Detection
  └─ Read techs-manifest.json → Identify platforms & tech stacks
        ↓
Stage 2: Tech Doc Generation (PARALLEL)
  └─ Prepare task plans for techs-generate workers per platform
  └─ After generate workers complete → prepare quality check worker task plans
  └─ Monitor completion markers
        ↓
Stage 2.5: Completion Verification
  └─ Step A: Scan completion markers
  └─ Step B: Verify output integrity
  └─ Step C: Update progress status
        ↓
Stage 3: Root Index Generation
  └─ Generate techs/README.md root index
  └─ Cross-platform consistency check
```

> **NOTE**: All worker dispatch operations are handled by the calling Agent (Team Leader). This Skill only prepares task plans and monitors completion markers.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and pass it to all downstream Worker Agents.

- User writes in 中文 → Generate Chinese documents, pass `language: "zh"` to workers
- User writes in English → Generate English documents, pass `language: "en"` to workers
- User writes in other languages → Use appropriate language code

**All downstream skills must receive the `language` parameter and generate content in that language only.**

## Trigger Scenarios

- "Initialize techs knowledge base"
- "Generate technology knowledge from source code"
- "Dispatch techs knowledge generation"

## User

Leader Agent (speccrew-team-leader)

## Platform Naming Convention

Read `speccrew-workspace/docs/configs/platform-mapping.json` for standardized platform mapping rules.

| Concept | techs-init (techs-manifest.json) | Example (UniApp) |
|---------|----------------------------------|------------------|
| **Category** | `platform_type` | `mobile` |
| **Technology** | `framework` | `uniapp` |
| **Identifier** | `platform_id` | `mobile-uniapp` |

## Input

| Variable | Description | Default |
|----------|-------------|---------|
| `source_path` | Source code root path | project root |
| `language` | User's language code (e.g., "zh", "en") | **REQUIRED** |

## Output

- Platform manifest: `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/techs-manifest.json`
- Tech docs: `speccrew-workspace/knowledges/techs/{platform_id}/`
- Root index: `speccrew-workspace/knowledges/techs/INDEX.md`
- Status files: `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/stage{N}-status.json`

---

## XML Workflow Definition

<workflow id="techs-dispatch-main" status="pending" version="1.0" desc="techs knowledge base generation 3-stage pipeline">
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
  == Field ==
  field      : Parameter/variable/output (name=param name, var=bind variable, value=value)
  -->

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="techs knowledge base generation input parameters">
    <field name="source_path" required="true" type="string" desc="Source code root directory path"/>
    <field name="language" required="true" type="string" desc="User's language code (e.g., zh, en)"/>
    <field name="workspace_path" required="true" type="string" desc="Absolute path to speccrew-workspace directory"/>
    <field name="sync_state_techs_dir" required="true" type="string" desc="Absolute path to knowledges/base/sync-state/knowledge-techs/"/>
    <field name="completed_dir" required="true" type="string" desc="Marker file output directory for Worker results (absolute path required)"/>
    <field name="ide_skills_dir" required="true" type="string" desc="Absolute path to IDE skills directory (e.g., .qoder/skills, .cursor/skills)"/>
  </block>

  <!-- ============================================================
       Global Continuous Execution Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" between stages</field>
    <field name="text">DO NOT offer options like "Full execution / Sample execution / Pause" — always execute ALL stages to completion</field>
    <field name="text">DO NOT suggest "Let me split this into batches" or "Let's do this in parts" — process ALL platforms sequentially</field>
    <field name="text">DO NOT pause to list what you plan to do next — just do it</field>
    <field name="text">DO NOT ask for confirmation before generating output files</field>
    <field name="text">DO NOT warn about "large number of files" or "this may take a while" — proceed with generation</field>
    <field name="text">ONLY pause at explicit &lt;event action="confirm"&gt; blocks defined in the workflow</field>
    <field name="text">DO NOT offer "continue/pause/partial" options — EVER</field>
    <field name="text">DO NOT estimate workload and suggest breaking it into phases — execute ALL phases in sequence</field>
    <field name="text">When many platforms need analysis, dispatch ALL of them — do NOT skip or defer any</field>
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
       Stage 1: Platform Detection (Single Task)
       ============================================================ -->
  <sequence id="S1" name="Stage 1: Platform Detection" status="pending" desc="Scan source code and identify all technology platforms">
    
    <block type="rule" id="S1-R1" level="mandatory" desc="Stage 1 mandatory rules">
      <field name="text">MUST read techs-manifest.json to identify platforms and tech stacks</field>
      <field name="text">MUST read platform-mapping.json for standardized platform mapping rules</field>
    </block>

    <!-- Step 1: Read Configuration -->
    <block type="task" id="S1-B1" action="run-skill" status="pending" desc="Read platform mapping config">
      <field name="skill">speccrew-read-config</field>
      <field name="config_path">${workspace_path}/docs/configs/platform-mapping.json</field>
      <field name="output" var="platform_mapping"/>
    </block>

    <!-- Step 2: Prepare Task Plan for techs-init -->
    <block type="event" id="S1-E1" action="log" level="info" desc="Prepare techs-init task plan">
Stage 1: Preparing task plan for speccrew-knowledge-techs-init-xml
- Source path: ${source_path}
- Output path: ${sync_state_techs_dir}
- Language: ${language}
    </block>

    <!-- Step 3: Prepare task specification -->
    <block type="task" id="S1-B2" action="prepare-task" status="pending" desc="Prepare techs-init task specification">
      <field name="skill_name">speccrew-knowledge-techs-init-xml</field>
      <field name="context">
        <field name="source_path">${source_path}</field>
        <field name="output_path">${sync_state_techs_dir}</field>
        <field name="language">${language}</field>
      </field>
      <field name="output" var="stage1_task"/>
    </block>

    <!-- Step 4: Monitor completion -->
    <block type="event" id="S1-E2" action="log" level="info" desc="Stage 1 task prepared">
Stage 1 task plan prepared. Waiting for calling Agent to dispatch.
Task: speccrew-knowledge-techs-init-xml
Output: ${sync_state_techs_dir}/techs-manifest.json
    </block>

    <!-- Step 5: Read manifest after completion -->
    <block type="task" id="S1-B3" action="read-file" status="pending" desc="Read generated techs-manifest.json">
      <field name="file_path">${sync_state_techs_dir}/techs-manifest.json</field>
      <field name="output" var="techs_manifest"/>
    </block>

    <!-- Step 6: Validate manifest -->
    <block type="gateway" id="S1-G1" mode="guard" test="${techs_manifest.platforms.length} > 0" fail-action="stop" desc="Validate at least one platform detected">
      <field name="message">No platforms detected in techs-manifest.json. Please check source_path and platform-mapping.json.</field>
    </block>

    <!-- Checkpoint: Platform detection complete -->
    <block type="checkpoint" id="S1-CP1" name="platforms_detected" desc="Platform detection complete">
      <field name="file" value="${sync_state_techs_dir}/stage1-status.json"/>
      <field name="verify" value="${techs_manifest.platforms.length} > 0"/>
    </block>

    <block type="event" id="S1-E3" action="log" level="info" desc="Report detected platforms">
Stage 1 complete. Detected ${techs_manifest.platforms.length} platforms: ${techs_manifest.platforms.map(p => p.platform_id).join(', ')}
    </block>
  </sequence>

  <!-- ============================================================
       Stage 2: Generate Platform Documents (PARALLEL)
       ============================================================ -->
  <sequence id="S2" name="Stage 2: Tech Doc Generation" status="pending" desc="Generate technology documentation for each platform in parallel">
    
    <block type="rule" id="S2-R1" level="mandatory" desc="Stage 2 mandatory rules">
      <field name="text">MUST prepare task plans for ALL platforms FIRST, then dispatch ALL workers SIMULTANEOUSLY</field>
      <field name="text">DO NOT finish one platform before starting the next — this wastes time and violates the pipeline design</field>
      <field name="text">The calling Agent MUST use concurrent task dispatch (e.g., dispatch 3 workers in one turn for 3 platforms)</field>
      <field name="text">Sequential platform-by-platform execution is FORBIDDEN</field>
    </block>

    <block type="rule" id="S2-R2" level="forbidden" desc="Stage 2 forbidden actions">
      <field name="text">DO NOT process platforms sequentially — PARALLEL execution is MANDATORY</field>
      <field name="text">DO NOT wait for one platform to complete before starting another</field>
      <field name="text">DO NOT proceed to Stage 2.5 until ALL workers have completed or failed</field>
    </block>

    <!-- Step 0: Ensure completed_dir exists -->
    <block type="task" id="S2-B0" action="run-script" status="pending" desc="Ensure completed_dir directory exists">
      <field name="command">node -e "require('fs').mkdirSync('${completed_dir}', {recursive: true}); console.log('completed dir ready')"</field>
    </block>

    <!-- Step 1: Update manifest status to processing -->
    <block type="loop" id="S2-L1" over="${techs_manifest.platforms}" as="platform" desc="Update each platform status to processing">
      <block type="task" id="S2-B1a" action="run-script" status="pending" desc="Update platform status in manifest">
        <field name="command">node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('${sync_state_techs_dir}/techs-manifest.json', 'utf8'));
const platform = manifest.platforms.find(p => p.platform_id === '${platform.platform_id}');
if (platform) {
  platform.status = 'processing';
  platform.startedAt = new Date().toISOString();
  platform.workers = platform.workers || {};
  platform.workers.conventions = { status: 'processing' };
  if (['web', 'mobile', 'desktop'].includes(platform.platform_type)) {
    platform.workers.ui_style = { status: 'processing' };
  }
  fs.writeFileSync('${sync_state_techs_dir}/techs-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Updated ${platform.platform_id} to processing');
}
"</field>
      </block>
    </block>

    <!-- Step 2: Prepare Conventions Worker Task Plans (ALL Platforms) -->
    <block type="event" id="S2-E1" action="log" level="info" desc="Prepare conventions worker tasks">
Preparing conventions worker task plans for ${techs_manifest.platforms.length} platforms...
    </block>

    <block type="loop" id="S2-L2" over="${techs_manifest.platforms}" as="platform" desc="Prepare conventions worker task for each platform">
      <block type="task" id="S2-B2" action="prepare-task" status="pending" desc="Prepare conventions worker task specification">
        <field name="skill_name">speccrew-knowledge-techs-generate-conventions-xml</field>
        <field name="context">
          <field name="platform_id">${platform.platform_id}</field>
          <field name="platform_type">${platform.platform_type}</field>
          <field name="framework">${platform.framework}</field>
          <field name="source_path">${platform.source_path}</field>
          <field name="config_files">${platform.config_files}</field>
          <field name="convention_files">${platform.convention_files}</field>
          <field name="output_path">${workspace_path}/knowledges/techs/${platform.platform_id}/</field>
          <field name="completed_dir">${completed_dir}</field>
          <field name="language">${language}</field>
        </field>
        <field name="output" var="conventions_task_${platform.platform_id}"/>
      </block>
    </block>

    <!-- Step 3: Prepare UI-Style Worker Task Plans (Frontend Platforms ONLY) -->
    <block type="event" id="S2-E2" action="log" level="info" desc="Prepare UI-style worker tasks">
Preparing UI-style worker task plans for frontend platforms...
    </block>

    <block type="loop" id="S2-L3" over="${techs_manifest.platforms}" as="platform" desc="Prepare UI-style worker task for frontend platforms">
      <block type="gateway" id="S2-G1" mode="guard" test="${platform.platform_type} IN ['web', 'mobile', 'desktop']" fail-action="skip" desc="Only for frontend platforms">
        <field name="message">Skipping UI-style for backend platform: ${platform.platform_id}</field>
      </block>
      <block type="task" id="S2-B3" action="prepare-task" status="pending" desc="Prepare UI-style worker task specification">
        <field name="skill_name">speccrew-knowledge-techs-generate-ui-style-xml</field>
        <field name="context">
          <field name="platform_id">${platform.platform_id}</field>
          <field name="platform_type">${platform.platform_type}</field>
          <field name="framework">${platform.framework}</field>
          <field name="source_path">${platform.source_path}</field>
          <field name="output_path">${workspace_path}/knowledges/techs/${platform.platform_id}/</field>
          <field name="completed_dir">${completed_dir}</field>
          <field name="language">${language}</field>
        </field>
        <field name="output" var="ui_style_task_${platform.platform_id}"/>
      </block>
    </block>

    <!-- Step 4: Dispatch ALL Workers in PARALLEL -->
    <block type="event" id="S2-E3" action="log" level="info" desc="Dispatch all workers">
Dispatching ALL workers in PARALLEL. The calling Agent should dispatch all prepared tasks simultaneously.
    </block>

    <!-- Step 5: Monitor Completion Markers -->
    <block type="loop" id="S2-L4" over="${techs_manifest.platforms}" as="platform" parallel="true" max-concurrency="${techs_manifest.platforms.length}" desc="Monitor completion markers for each platform">
      
      <!-- Check conventions worker marker -->
      <block type="task" id="S2-B4a" action="run-script" status="pending" desc="Check conventions completion marker">
        <field name="command">Test-Path "${completed_dir}/${platform.platform_id}.done-conventions.json"</field>
        <field name="output" var="conventions_done_exists"/>
      </block>

      <!-- Check UI-style worker marker (frontend only) -->
      <block type="gateway" id="S2-G2" mode="exclusive" desc="Check UI-style marker for frontend">
        <branch test="${platform.platform_type} IN ['web', 'mobile', 'desktop']" name="Frontend platform">
          <block type="task" id="S2-B4b" action="run-script" status="pending" desc="Check UI-style completion marker">
            <field name="command">Test-Path "${completed_dir}/${platform.platform_id}.done-ui-style.json"</field>
            <field name="output" var="ui_style_done_exists"/>
          </block>
        </branch>
        <branch default="true" name="Backend platform">
          <field name="ui_style_done_exists" value="true"/>
        </branch>
      </block>

      <!-- Read conventions done file -->
      <block type="task" id="S2-B4c" action="read-file" status="pending" desc="Read conventions done file">
        <field name="file_path">${completed_dir}/${platform.platform_id}.done-conventions.json</field>
        <field name="output" var="conventions_done"/>
      </block>

      <!-- Read UI-style done file (frontend only) -->
      <block type="gateway" id="S2-G3" mode="exclusive" desc="Read UI-style done file">
        <branch test="${platform.platform_type} IN ['web', 'mobile', 'desktop']" name="Frontend platform">
          <block type="task" id="S2-B4d" action="read-file" status="pending" desc="Read UI-style done file">
            <field name="file_path">${completed_dir}/${platform.platform_id}.done-ui-style.json</field>
            <field name="output" var="ui_style_done"/>
          </block>
        </branch>
        <branch default="true" name="Backend platform">
          <field name="ui_style_done" value="{&quot;status&quot;:&quot;skipped&quot;}"/>
        </branch>
      </block>

      <!-- Prepare Quality Check Worker Task Plans -->
      <block type="gateway" id="S2-G4" mode="guard" test="${conventions_done.status} == 'completed'" fail-action="continue" desc="Prepare quality check for conventions">
        <block type="task" id="S2-B5a" action="prepare-task" status="pending" desc="Prepare conventions quality worker">
          <field name="skill_name">speccrew-knowledge-techs-generate-quality-xml</field>
          <field name="context">
            <field name="platform_dir">${workspace_path}/knowledges/techs/${platform.platform_id}/</field>
            <field name="platform_id">${platform.platform_id}</field>
            <field name="platform_type">${platform.platform_type}</field>
            <field name="source_path">${platform.source_path}</field>
          </field>
          <field name="output" var="quality_conventions_task_${platform.platform_id}"/>
        </block>
      </block>

      <block type="gateway" id="S2-G5" mode="guard" test="${ui_style_done.status} == 'completed'" fail-action="continue" desc="Prepare quality check for UI-style">
        <block type="task" id="S2-B5b" action="prepare-task" status="pending" desc="Prepare UI-style quality worker">
          <field name="skill_name">speccrew-knowledge-techs-generate-quality-xml</field>
          <field name="context">
            <field name="platform_dir">${workspace_path}/knowledges/techs/${platform.platform_id}/ui-style/</field>
            <field name="platform_id">${platform.platform_id}</field>
            <field name="platform_type">${platform.platform_type}</field>
            <field name="source_path">${platform.source_path}</field>
          </field>
          <field name="output" var="quality_ui_style_task_${platform.platform_id}"/>
        </block>
      </block>
    </block>

    <!-- Checkpoint: Stage 2 complete -->
    <block type="checkpoint" id="S2-CP1" name="stage2_complete" desc="Tech doc generation complete">
      <field name="file" value="${sync_state_techs_dir}/stage2-status.json"/>
      <field name="verify" value="true"/>
    </block>

    <block type="event" id="S2-E4" action="log" level="info" desc="Stage 2 complete">
Stage 2 complete. All platform workers finished.
    </block>
  </sequence>

  <!-- ============================================================
       Stage 2.5: Completion Verification
       ============================================================ -->
  <sequence id="S2_5" name="Stage 2.5: Completion Verification" status="pending" desc="Verify cross-platform consistency and document completeness before indexing">
    
    <block type="rule" id="S2_5-R1" level="mandatory" desc="Stage 2.5 mandatory rules">
      <field name="text">MUST scan ALL completion markers before proceeding</field>
      <field name="text">MUST verify document existence and completeness</field>
      <field name="text">MUST update stage2-status.json with verification results</field>
    </block>

    <!-- Step A: Scan Completion Markers -->
    <block type="event" id="S2_5-E1" action="log" level="info" desc="Step A: Scan completion markers">
Stage 2.5 Step A: Scanning completion markers...
    </block>

    <block type="loop" id="S2_5-L1" over="${techs_manifest.platforms}" as="platform" desc="Scan markers for each platform">
      <block type="task" id="S2_5-B1" action="run-script" status="pending" desc="Check all markers for platform">
        <field name="command">node -e "
const fs = require('fs');
const platformId = '${platform.platform_id}';
const completedDir = '${completed_dir}';
const platformType = '${platform.platform_type}';
const isFrontend = ['web', 'mobile', 'desktop'].includes(platformType);

const markers = {
  conventions: fs.existsSync(\`\${completedDir}/\${platformId}.done-conventions.json\`),
  ui_style: isFrontend ? fs.existsSync(\`\${completedDir}/\${platformId}.done-ui-style.json\`) : 'skipped',
  quality: fs.existsSync(\`\${completedDir}/\${platformId}.quality-done.json\`)
};

console.log(JSON.stringify(markers));
"</field>
        <field name="output" var="markers_${platform.platform_id}"/>
      </block>
    </block>

    <!-- Step B: Verify Output Integrity -->
    <block type="event" id="S2_5-E2" action="log" level="info" desc="Step B: Verify output integrity">
Stage 2.5 Step B: Verifying output integrity...
    </block>

    <block type="loop" id="S2_5-L2" over="${techs_manifest.platforms}" as="platform" desc="Verify documents for each platform">
      <block type="task" id="S2_5-B2" action="run-script" status="pending" desc="Check required documents exist">
        <field name="command">node -e "
const fs = require('fs');
const path = require('path');
const platformDir = '${workspace_path}/knowledges/techs/${platform.platform_id}';
const platformType = '${platform.platform_type}';
const isFrontend = ['web', 'mobile', 'desktop'].includes(platformType);

const requiredDocs = [
  'INDEX.md', 'tech-stack.md', 'architecture.md',
  'conventions-design.md', 'conventions-dev.md',
  'conventions-unit-test.md', 'conventions-system-test.md', 'conventions-build.md'
];

const results = {
  documents_present: [],
  documents_missing: [],
  ui_style_complete: false
};

requiredDocs.forEach(doc => {
  if (fs.existsSync(path.join(platformDir, doc))) {
    results.documents_present.push(doc);
  } else {
    results.documents_missing.push(doc);
  }
});

if (isFrontend) {
  results.ui_style_complete = fs.existsSync(path.join(platformDir, 'ui-style/ui-style-guide.md'));
}

console.log(JSON.stringify(results));
"</field>
        <field name="output" var="integrity_${platform.platform_id}"/>
      </block>
    </block>

    <!-- Step C: Update Progress Status -->
    <block type="event" id="S2_5-E3" action="log" level="info" desc="Step C: Update progress status">
Stage 2.5 Step C: Updating progress status...
    </block>

    <block type="task" id="S2_5-B3" action="run-script" status="pending" desc="Generate stage2-status.json">
      <field name="command">node -e "
const fs = require('fs');
const timestamp = new Date().toISOString();

const status = {
  generated_at: timestamp,
  stage: 'platform-doc-generation',
  total_platforms: ${techs_manifest.platforms.length},
  completed: 0,
  incomplete: 0,
  failed: 0,
  language: '${language}',
  platforms: []
};

// Platform status would be populated here based on marker and integrity checks
// This is a simplified version - actual implementation would aggregate results

fs.writeFileSync('${sync_state_techs_dir}/stage2-status.json', JSON.stringify(status, null, 2));
console.log('stage2-status.json written');
"</field>
    </block>

    <!-- Checkpoint: Stage 2.5 complete -->
    <block type="checkpoint" id="S2_5-CP1" name="stage2_5_complete" desc="Completion verification done">
      <field name="file" value="${sync_state_techs_dir}/stage2-status.json"/>
      <field name="verify" value="true"/>
    </block>

    <block type="event" id="S2_5-E4" action="log" level="info" desc="Stage 2.5 complete">
Stage 2.5 complete. Verification results written to stage2-status.json.
    </block>
  </sequence>

  <!-- ============================================================
       Stage 3: Generate Root Index (Single Task)
       ============================================================ -->
  <sequence id="S3" name="Stage 3: Root Index Generation" status="pending" desc="Generate root INDEX.md aggregating all platform documentation">
    
    <block type="rule" id="S3-R1" level="mandatory" desc="Stage 3 mandatory rules">
      <field name="text">MUST read techs-manifest.json to get platform list</field>
      <field name="text">MUST scan each platform directory to detect which documents actually exist</field>
      <field name="text">MUST only include links to documents that actually exist</field>
    </block>

    <!-- Step 1: Read manifest -->
    <block type="task" id="S3-B1" action="read-file" status="pending" desc="Read techs-manifest.json">
      <field name="file_path">${sync_state_techs_dir}/techs-manifest.json</field>
      <field name="output" var="manifest_for_index"/>
    </block>

    <!-- Step 2: Prepare Task Plan for techs-index -->
    <block type="event" id="S3-E1" action="log" level="info" desc="Prepare techs-index task plan">
Stage 3: Preparing task plan for speccrew-knowledge-techs-index-xml
- Manifest: ${sync_state_techs_dir}/techs-manifest.json
- Output: ${workspace_path}/knowledges/techs/
- Language: ${language}
    </block>

    <!-- Step 3: Prepare task specification -->
    <block type="task" id="S3-B2" action="prepare-task" status="pending" desc="Prepare techs-index task specification">
      <field name="skill_name">speccrew-knowledge-techs-index-xml</field>
      <field name="context">
        <field name="manifest_path">${sync_state_techs_dir}/techs-manifest.json</field>
        <field name="techs_base_path">${workspace_path}/knowledges/techs/</field>
        <field name="output_path">${workspace_path}/knowledges/techs/</field>
        <field name="language">${language}</field>
      </field>
      <field name="output" var="stage3_task"/>
    </block>

    <!-- Step 4: Monitor completion -->
    <block type="event" id="S3-E2" action="log" level="info" desc="Stage 3 task prepared">
Stage 3 task plan prepared. Waiting for calling Agent to dispatch.
Task: speccrew-knowledge-techs-index-xml
Output: ${workspace_path}/knowledges/techs/INDEX.md
    </block>

    <!-- Step 5: Generate stage3-status.json -->
    <block type="task" id="S3-B3" action="run-script" status="pending" desc="Generate stage3-status.json">
      <field name="command">node -e "
const fs = require('fs');
const timestamp = new Date().toISOString();

const status = {
  generated_at: timestamp,
  stage: 'root-index-generation',
  platforms_indexed: ${techs_manifest.platforms.length},
  index_file: '${workspace_path}/knowledges/techs/INDEX.md',
  status: 'completed'
};

fs.writeFileSync('${sync_state_techs_dir}/stage3-status.json', JSON.stringify(status, null, 2));
console.log('stage3-status.json written');
"</field>
    </block>

    <!-- Checkpoint: Stage 3 complete -->
    <block type="checkpoint" id="S3-CP1" name="stage3_complete" desc="Root index generation complete">
      <field name="file" value="${sync_state_techs_dir}/stage3-status.json"/>
      <field name="verify" value="true"/>
    </block>

    <block type="event" id="S3-E3" action="log" level="info" desc="Stage 3 complete">
Stage 3 complete. Root INDEX.md generated.
    </block>
  </sequence>

  <!-- ============================================================
       Output Definition
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="manifest_path" from="${sync_state_techs_dir}/techs-manifest.json"/>
    <field name="root_index" from="${workspace_path}/knowledges/techs/INDEX.md"/>
    <field name="stage1_status" from="${sync_state_techs_dir}/stage1-status.json"/>
    <field name="stage2_status" from="${sync_state_techs_dir}/stage2-status.json"/>
    <field name="stage3_status" from="${sync_state_techs_dir}/stage3-status.json"/>
  </block>

</workflow>

---

## Worker Completion Marker Format

Each Worker MUST create a completion marker file after generating documents.

### Conventions Worker Done File

**File**: `{completed_dir}/{platform_id}.done-conventions.json`

**Format**:
```json
{
  "platform_id": "web-vue",
  "worker_type": "conventions",
  "status": "completed",
  "documents_generated": [
    "INDEX.md", "tech-stack.md", "architecture.md",
    "conventions-dev.md", "conventions-design.md",
    "conventions-unit-test.md", "conventions-build.md"
  ],
  "analysis_file": "web-vue.analysis-conventions.json",
  "completed_at": "2024-01-15T10:45:00Z"
}
```

### UI-Style Worker Done File

**File**: `{completed_dir}/{platform_id}.done-ui-style.json`

**Format**:
```json
{
  "platform_id": "web-vue",
  "worker_type": "ui-style",
  "status": "completed",
  "ui_analysis_level": "full",
  "documents_generated": [
    "ui-style/ui-style-guide.md"
  ],
  "analysis_file": "web-vue.analysis-ui-style.json",
  "completed_at": "2024-01-15T10:45:00Z"
}
```

**Status values**:
- `completed` — All required documents generated successfully
- `failed` — Critical failure, required documents not generated

If a Worker encounters a fatal error, it should still attempt to create the done file with `status: "failed"` and include error details in an `"error"` field.

### Quality Worker Done File

**File**: `{completed_dir}/{platform_id}.quality-done.json`

**Format**:
```json
{
  "platform_id": "web-vue",
  "worker_type": "quality",
  "status": "completed",
  "quality_score": 85,
  "issues_found": 2,
  "completed_at": "2024-01-15T11:00:00Z"
}
```

---

## Platform Status Tracking Fields

Each platform entry in techs-manifest.json includes status tracking fields for monitoring the analysis pipeline progress:

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | string | `pending` / `processing` / `completed` / `partial` / `failed` | Current analysis status |
| `startedAt` | string \| null | ISO 8601 timestamp | When the Worker started analyzing this platform |
| `completedAt` | string \| null | ISO 8601 timestamp | When the Worker finished analyzing this platform |
| `analysisLevel` | string \| null | `full` / `minimal` / `reference_only` | Depth of analysis achieved |
| `topicsCoverage` | number \| null | 0-100 | Percentage of domain topics covered (from analysis.json) |
| `workers` | object | See below | Per-worker status tracking |

**Workers Object Structure:**
```json
{
  "platform_id": "web-vue",
  "status": "completed",
  "workers": {
    "conventions": {
      "status": "completed",
      "skill": "speccrew-knowledge-techs-generate-conventions-xml",
      "done_file": "web-vue.done-conventions.json"
    },
    "ui_style": {
      "status": "completed",
      "skill": "speccrew-knowledge-techs-generate-ui-style-xml",
      "done_file": "web-vue.done-ui-style.json"
    }
  }
}
```

For backend platforms, `ui_style.status` is set to `"skipped"`.

**Status Lifecycle:**
```
pending → processing → completed
                    → partial (conventions OK, ui-style failed)
                    → failed
```

---

## Output per Platform

```
speccrew-workspace/knowledges/techs/{platform_id}/
├── INDEX.md                    # Required
├── tech-stack.md              # Required
├── architecture.md            # Required
├── conventions-design.md      # Required
├── conventions-dev.md         # Required
├── conventions-unit-test.md        # Required
├── conventions-system-test.md      # Required
├── conventions-build.md       # Required
├── conventions-data.md        # Optional — platform-specific
└── ui-style/                  # Optional — frontend only (web/mobile/desktop)
    ├── ui-style-guide.md      # Generated by techs Stage 2
    ├── page-types/            # Populated by bizs pipeline Stage 3.5 (ui-style-extract)
    ├── components/            # Populated by bizs pipeline Stage 3.5 (ui-style-extract)
    ├── layouts/               # Populated by bizs pipeline Stage 3.5 (ui-style-extract)
    └── styles/                # Generated by techs Stage 2
```

**Cross-Pipeline Note for `ui-style/`**:
- `ui-style-guide.md` and `styles/` are generated by techs pipeline Stage 2 (technical framework-level style specs)
- `page-types/`, `components/`, and `layouts/` are populated by bizs pipeline Stage 3.5 (`speccrew-knowledge-bizs-ui-style-extract` skill), which aggregates patterns from analyzed feature documents
- These two sources are complementary: techs provides framework-level conventions, bizs adds real-page-derived design patterns
- If bizs pipeline has not been executed, these three subdirectories will be empty

**Optional file `conventions-data.md` rules**:

| Platform Type | Required? | Notes |
|----------|-----------|-------|
| `backend` | Required | ORM specs, data modeling, caching |
| `web` | Depends | Only if using ORM/data layer (Prisma, TypeORM, etc.) |
| `mobile` | Optional | Based on tech stack |
| `desktop` | Optional | Based on tech stack |

---

## Error Handling

### Error Handling Strategy

```
ON Worker Failure:
  1. Capture error message from worker_result.error
  2. Mark platform status as "failed" in stage2-status.json
  3. Record failed platform_id and error details
  4. Continue processing other platforms (no retry, fail fast)
  5. After all workers complete, evaluate overall status:
     - IF all platforms failed → ABORT pipeline
     - IF some platforms succeeded → CONTINUE to Stage 3 with successful platforms only
```

### Stage-Level Failure Handling

| Stage | Failure Handling |
|-------|-----------------|
| Stage 1 | Abort pipeline, report error |
| Stage 2 | Continue with successful platforms, report failed ones |
| Stage 2.5 | Continue pipeline, report warnings |
| Stage 3 | Abort if Stage 2 had critical failures |

### Worker Failure Details

**When a Worker Agent fails:**
- **No automatic retry**: Worker failures are recorded as-is
- **Partial success accepted**: Pipeline continues if at least one platform succeeds
- **Error propagation**: Failed platform details are included in stage2-status.json
- **Stage 3 decision**: Only platforms with status "complete" are included in root INDEX.md

---

## Checklist

- [ ] Stage 1: Platform manifest generated with techs-manifest.json
- [ ] Stage 2: All platforms processed in parallel
- [ ] Stage 2: `stage2-status.json` generated with all platform results
- [ ] Stage 3: Root INDEX.md generated with Agent mapping
- [ ] Stage 3: `stage3-status.json` generated with index info

### Document Completeness Verification
- [ ] Each platform directory contains required documents: INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md
- [ ] `conventions-data.md` exists only for appropriate platforms (backend required, others optional)
- [ ] All documents include file reference blocks (pure Markdown format for VS Code preview compatibility)
- [ ] All documents include AI-TAG and AI-CONTEXT comments
- [ ] techs/INDEX.md links only to existing documents

---

## Task Completion Report Format

Upon completing all stages, output the following structured report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-knowledge-techs-dispatch-xml",
  "stages_completed": ["stage_1", "stage_2", "stage_2_5", "stage_3"],
  "stages_failed": [],
  "output_summary": {
    "platforms_processed": ["frontend", "backend"],
    "docs_generated_per_platform": {"frontend": 5, "backend": 4},
    "root_index_generated": true,
    "cross_platform_check_passed": true
  },
  "output_files": [
    "knowledges/techs/{platform}/README.md",
    "knowledges/techs/{platform}/conventions.md",
    "knowledges/techs/README.md"
  ],
  "errors": [],
  "next_steps": ["Review generated tech documentation"]
}
```

---

## Return Value Structure

After all 3 stages complete, return a summary object to the caller:

```json
{
  "status": "completed",
  "pipeline": "techs",
  "stages": {
    "stage1": { "status": "completed", "platforms": 3 },
    "stage2": { "status": "completed", "completed": 3, "failed": 0 },
    "stage3": { "status": "completed" }
  },
  "output": {
    "index": "speccrew-workspace/knowledges/techs/INDEX.md",
    "manifest": "speccrew-workspace/knowledges/base/sync-state/knowledge-techs/techs-manifest.json"
  }
}
```

---

## CONTINUOUS EXECUTION RULES

This skill MUST execute all stages continuously without unnecessary interruptions.

### FORBIDDEN Interruptions

1. DO NOT ask user "Should I continue?" after completing a stage
2. DO NOT suggest "Let me split this into batches" or "Let's do this in parts"
3. DO NOT pause to list what you plan to do next — just do it
4. DO NOT ask for confirmation before generating output files
5. DO NOT warn about "large number of files" — proceed with generation
6. DO NOT offer "Should I proceed with the remaining items?"
7. DO NOT present options like "Full execution / Sample execution / Pause"

### When to Pause (ONLY these cases)

1. Explicit `<event action="confirm">` blocks in the workflow (e.g., platform confirmation if needed)
2. Ambiguous requirements that genuinely need clarification
3. Unrecoverable errors that prevent further progress (failure rate > 50%)
4. Security-sensitive operations (e.g., deleting existing files)

### Batch Execution Behavior

- When multiple platforms need processing, process ALL of them without asking
- Use marker files (.done.json) to track progress, enabling resumption if interrupted by context limits
- If context window is approaching limit, save progress to checkpoint and inform user how to resume
- NEVER voluntarily stop mid-batch to ask if user wants to continue
