---
name: speccrew-dev-mobile
description: Mobile Development SOP. Guide System Developer Agent to implement mobile app code (Flutter/React Native) according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- System design documents confirmed, user requests mobile development
- User asks "Start mobile development", "Implement mobile app", "Write mobile code"
- System Developer Agent dispatches this skill with platform context (platform_id, techs paths)

# Workflow

## Absolute Constraints

> **These rules apply to Task Record document generation. Violation = task failure.**

1. **FORBIDDEN: `create_file` for Task Record** — NEVER use `create_file` to write the Task Record document. It MUST be created by copying the template then filling sections with `search_replace`. `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire Task Record content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before fill sections. Skipping copy and writing content directly is FORBIDDEN.

4. **CLARIFICATION: Source code is NOT template-filled** — Actual source code files are written directly based on design blueprints. The template-fill workflow applies ONLY to the Task Record document.

## Step 1: Read Design Documents

Read in order:

1. **INDEX.md**: `speccrew-workspace/iterations/{iteration}/03.system-design/{platform_id}/INDEX.md`
2. **Module design documents**: `speccrew-workspace/iterations/{iteration}/03.system-design/{platform_id}/{module}-design.md`
3. **API Contract**: `speccrew-workspace/iterations/{iteration}/02.feature-design/{feature-name}-api-contract.md`
4. **Task record template**: `speccrew-dev-mobile/templates/TASK-RECORD-TEMPLATE.md`

## Step 2: Read Techs Knowledge

Read platform-specific development conventions:

| Document | Path | Purpose |
|----------|------|---------|
| conventions-dev.md | `knowledges/techs/{platform_id}/conventions-dev.md` | Code style, naming, patterns |
| architecture.md | `knowledges/techs/{platform_id}/architecture.md` | Layer structure, state management |
| tech-stack.md | `knowledges/techs/{platform_id}/tech-stack.md` | Framework version, dependencies |

### Platform-Specific Patterns

**Flutter:**
- Widget patterns (StatelessWidget vs StatefulWidget)
- State management (Provider, Bloc, Riverpod)
- Navigation (GoRouter, Navigator)
- Platform channels for native integration

**React Native:**
- Component patterns (Functional components with Hooks)
- State management (Redux, MobX, Zustand)
- Navigation (React Navigation)
- Native modules bridge

## Step 3: Extract Task List

Parse module design documents to extract all implementation tasks.

### Mobile-Specific Task Types

| Task Type | Description | Example |
|-----------|-------------|---------|
| Screen/Page | Full screen UI implementation | LoginScreen, ProductDetailPage |
| Widget/Component | Reusable UI components | ProductCard, SearchBar |
| Navigation flow | Route configuration | GoRouter config, Stack navigator |
| State management | Store/provider setup | CartBloc, UserStore |
| API service | HTTP client integration | ProductService, AuthApi |
| Local storage | Persistence layer | Hive box, SQLite schema |
| Platform channel | Native module integration | BiometricAuth, CameraAccess |
| Asset management | Images, fonts, icons | pubspec.yaml, asset bundling |

### Task ID Prefix

Use `MB-001`, `MB-002`, etc. for mobile tasks.

### Task Checklist Table

```markdown
| Task ID | Module | Description | Target Files | Platform Specific | Offline Support | Dependencies | Status |
|---------|--------|-------------|--------------|-------------------|-----------------|--------------|--------|
| MB-001 | Auth | LoginScreen implementation | lib/screens/auth/ | iOS/Android | Yes | - | ⏳ Pending |
| MB-002 | Auth | BiometricAuth channel | lib/channels/ | iOS (Face ID) / Android (Biometric) | Yes | MB-001 | ⏳ Pending |
```

**Status Values**: ⏳ Pending | 🔄 In Progress | ✅ Complete | 🚫 Blocked

**Checkpoint A: Present task extraction summary to user for confirmation.**

## Step 4: Create Task Record File

Before writing code, create task record file using template-fill workflow:

**Path**: `speccrew-workspace/iterations/{iteration}/04.development/{platform_id}/{module}-task.md`

### 4a Copy Template to Task Record Path

1. **Read the template file**: `speccrew-dev-mobile/templates/TASK-RECORD-TEMPLATE.md`
2. **Replace top-level placeholders** (module name, feature name, platform ID, iteration info)
3. **Create the document** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{iteration}/04.development/{platform_id}/{module}-task.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document has complete section structure ready for filling

### 4b Fill Task Record Sections Using search_replace

Fill each section with task checklist and design metadata extracted from input documents.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

## Step 5: Execute Task by Task

Implement tasks sequentially, following dependencies.

### Implementation Principles

1. **Follow Design Blueprint**: Strictly follow file paths, naming, structure from design documents
2. **Direct Code Writing**: Write actual code directly according to design (no template filling for source code)
3. **Reuse Existing Code**: Use Glob/Grep to find existing widgets/stores before creating new ones
4. **Platform Conventions**: Follow techs knowledge for naming, patterns, directory structure
5. **Cross-Platform Consideration**: Handle iOS/Android differences where specified

### Local Checks (After Each Task)

Before marking task complete, run these checks:

| Check | Flutter Command | React Native Command |
|-------|-----------------|---------------------|
| Static analysis | `flutter analyze` | `npx react-native lint` |
| Build verification | `flutter build [ios/android]` | `npx react-native build-ios/build-android` |
| Unit tests | `flutter test` | `npm test` |
| Quick verify | App launches on simulator without crash | App launches on emulator without crash |

**Check Failure Handling:**
- Fix issues before marking task complete
- Complex issues: record in task file "Known Issues" section
- Design issues: stop and describe problem to user

### Blocked Task Diagnosis

When task is blocked (build failure, test failure, environment issues):

1. **Check Logs**
   - Flutter: `flutter logs` or IDE debug console
   - React Native: Metro bundler output, `adb logcat` (Android), Xcode console (iOS)

2. **Verify Dependencies**
   - Flutter: `flutter pub get`, check `pubspec.yaml`
   - React Native: `npm install`, check `package.json`

3. **Platform-Specific Issues**
   - iOS: Check Xcode build settings, CocoaPods
   - Android: Check Gradle config, SDK versions

4. **Record Diagnosis**
   - In task file: Symptom → Investigation Steps → Root Cause → Solution

## Step 6: Record Deviations

If actual implementation differs from design, record in task file:

```markdown
### Deviation Notes
- MB-003: Originally designed with Provider, switched to Riverpod due to [reason]
- MB-005: Added iOS-specific permission handling not in original design
```

## Step 7: Record Technical Debt

If technical debt identified during implementation:

**Path**: `speccrew-workspace/iterations/{iteration}/tech-debt/{feature-name}-tech-debt.md`

Common mobile technical debts:
- Platform-specific workarounds
- Temporary offline sync solutions
- Missing error handling for edge cases
- Deferred accessibility features
- Incomplete test coverage

## Step 8: Completion Notification

After all tasks complete, update task record and notify user:

```
Mobile Development Complete:
- Tasks implemented: [X]
- Deviation records: [Y] (see task file)
- Technical debt records: [Z] (see tech-debt file)
- Task record: speccrew-workspace/iterations/{iteration}/04.development/{platform_id}/{module}-task.md

Ready for QA Agent acceptance testing.
```

# Key Rules

| Rule | Description |
|------|-------------|
| **Direct Implementation** | Write code directly according to design documents, NOT template filling |
| **Platform-Specific Handling** | Properly handle iOS/Android differences, permissions, native integrations |
| **Offline-First Consideration** | Consider offline patterns where applicable |
| **API Contract READ-ONLY** | API Contract is reference only - do not modify |
| **Status Markers Consistent** | Use same markers as design: [EXISTING], [MODIFIED], [NEW] |
| **Follow Techs Conventions** | Naming, directory structure, patterns must follow techs knowledge |
| **Tech Debt to Unified Path** | Write technical debt to `iterations/{iter}/tech-debt/` directory |

# Checklist

- [ ] Design documents loaded (INDEX.md + module designs)
- [ ] Techs knowledge loaded (conventions-dev, architecture, tech-stack)
- [ ] Task record file created
- [ ] All design tasks extracted to checklist
- [ ] Each task has local checks passed (analyze/build/test/quick verify)
- [ ] Code follows architecture layer conventions
- [ ] Naming follows conventions-dev.md
- [ ] Platform-specific features properly handled
- [ ] Navigation flow matches design
- [ ] All deviations recorded
- [ ] Technical debt written to `iterations/{iter}/tech-debt/`
- [ ] Task record status updated to complete
- [ ] Checkpoint A passed: task extraction confirmed with user
