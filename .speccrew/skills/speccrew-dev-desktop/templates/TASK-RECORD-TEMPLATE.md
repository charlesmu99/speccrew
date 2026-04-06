# Desktop Development Task Record - [Feature Name]

> Based on Design Document: [Link to 03.system-design/{platform_id}/[feature-name]-design.md]
> Platform: {platform_id} | Framework: {Electron/Tauri}

## Task Checklist

| Task ID | Module | Description | Target Files | IPC Channel | Native Integration | Dependencies | Status |
|---------|--------|-------------|--------------|-------------|-------------------|--------------|--------|
| DT-001 | MainProcess | [Description] | `src/main/...` | - | [None/FileSystem/etc] | - | Pending |
| DT-002 | IPC | [Description] | `src/main/ipc/...` | `channel:name` | [None/etc] | DT-001 | Pending |
| DT-003 | Renderer | [Description] | `src/renderer/...` | `channel:name` | - | DT-002 | Pending |

> Status: Pending / In Progress / Completed / Blocked

## IPC Channel Registry

<!-- AI-NOTE: Record all IPC channels created or modified during implementation -->

| Channel Name | Direction | Payload Type | Handler Location | Description | Status |
|--------------|-----------|--------------|------------------|-------------|--------|
| [channel:name] | Renderer->Main | [Type] | `src/main/ipc/[file].ts` | [Description] | [NEW/MODIFIED/EXISTING] |
| [channel:name] | Main->Renderer | [Type] | `src/main/window/[file].ts` | [Description] | [NEW/MODIFIED/EXISTING] |
| [channel:name] | Bidirectional | [Type] | [Location] | [Description] | [NEW/MODIFIED/EXISTING] |

## Native Integration Status

<!-- AI-NOTE: Track all native integrations implemented -->

| Integration Type | Feature | Implementation File | Status | Notes |
|------------------|---------|---------------------|--------|-------|
| File System | [Read/Write/Dialog] | `src/main/native/fs.ts` | [Done/Pending] | [Notes] |
| System Tray | [Icon/Menu] | `src/main/tray.ts` | [Done/Pending] | [Notes] |
| Notifications | [OS Notifications] | `src/main/notify.ts` | [Done/Pending] | [Notes] |
| Menu Bar | [App Menu] | `src/main/menu.ts` | [Done/Pending] | [Notes] |
| Shortcuts | [Global/Local] | `src/main/shortcuts.ts` | [Done/Pending] | [Notes] |
| Protocol Handler | [Custom Protocol] | `src/main/protocol.ts` | [Done/Pending] | [Notes] |
| Auto Update | [Check/Download/Install] | `src/main/updater.ts` | [Done/Pending] | [Notes] |

## Security Checklist

<!-- AI-NOTE: Verify all security configurations -->

| Check Item | Configuration | Verified |
|------------|---------------|----------|
| Context Isolation | `contextIsolation: true` | [ ] Yes / [ ] No |
| nodeIntegration | `nodeIntegration: false` | [ ] Yes / [ ] No |
| enableRemoteModule | `enableRemoteModule: false` | [ ] Yes / [ ] No |
| Preload Script | All IPC through preload | [ ] Yes / [ ] No |
| CSP Header | [Policy string] | [ ] Yes / [ ] No |
| Permission Scope | [Limited permissions] | [ ] Yes / [ ] No |

## Window Management

<!-- AI-NOTE: Track all windows created/modified -->

| Window Name | Type | Status | Configuration |
|-------------|------|--------|---------------|
| [MainWindow] | BrowserWindow/Window | [NEW/MODIFIED/EXISTING] | [Size/frame/etc] |
| [ModalWindow] | BrowserWindow/Window | [NEW/MODIFIED/EXISTING] | [Size/frame/etc] |

## Implementation Progress

### Completed Tasks

- [DT-001] [Description] - Completed at [timestamp]
- [DT-002] [Description] - Completed at [timestamp]

### In Progress

- [DT-003] [Description] - Started at [timestamp]

### Blocked Tasks

| Task ID | Block Reason | Blocking Issue | Planned Resolution |
|---------|--------------|----------------|-------------------|
| [DT-XXX] | [Reason] | [Issue link/description] | [Resolution plan] |

## Deviation Log

<!-- AI-NOTE: Record any deviations from design document with reasons -->

| Task ID | Original Design | Implementation | Reason |
|---------|-----------------|----------------|--------|
| [DT-XXX] | [Original approach] | [Actual implementation] | [Why changed] |

## Issues and Resolutions

<!-- AI-NOTE: Record issues encountered during development -->

| Issue ID | Task ID | Description | Severity | Resolution | Status |
|----------|---------|-------------|----------|------------|--------|
| [ISSUE-001] | [DT-XXX] | [Description] | [High/Med/Low] | [How resolved] | [Resolved/Pending] |

## Local Verification Results

### Build Verification

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Dev Build | `npm run electron:dev` / `npm run tauri dev` | [Pass/Fail] | [Notes] |
| Production Build | `npm run build` | [Pass/Fail] | [Notes] |

### Code Quality

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Lint | `npm run lint` | [Pass/Fail] | [Notes] |
| Type Check | `npx tsc --noEmit` | [Pass/Fail] | [Notes] |
| Unit Tests | `npm test` | [Pass/Fail] | [Notes] |

### Security Verification

| Check | Method | Result | Notes |
|-------|--------|--------|-------|
| Context Isolation | Code review | [Pass/Fail] | [Notes] |
| Preload Script | Code review | [Pass/Fail] | [Notes] |
| CSP Compliance | Header check | [Pass/Fail] | [Notes] |

### Functional Verification

| Check | Result | Notes |
|-------|--------|-------|
| App launches without crash | [Pass/Fail] | [Notes] |
| IPC channels respond correctly | [Pass/Fail] | [Notes] |
| Native integrations work | [Pass/Fail] | [Notes] |
| No console errors | [Pass/Fail] | [Notes] |

## Technical Debt

<!-- AI-NOTE: Link to tech debt document if created -->

Technical debt recorded in: `../tech-debt/[feature-name]-tech-debt.md`

| Item | Category | Description | Priority |
|------|----------|-------------|----------|
| [TD-001] | [Security/Performance/Refactor] | [Description] | [High/Med/Low] |

## Completion Summary

- **Total Tasks**: [N]
- **Completed**: [N]
- **Blocked**: [N]
- **Deviations**: [N]
- **Technical Debt Items**: [N]

### Final Checklist

- [ ] All tasks completed or documented as blocked
- [ ] All IPC channels tested
- [ ] Security checklist verified
- [ ] Local checks (lint, type, build) passing
- [ ] Deviations documented with reasons
- [ ] Technical debt recorded
- [ ] Task record updated

---

**Status**: In Progress / Completed  
**Last Updated**: [Timestamp]  
**Developer**: [Agent/User name]
