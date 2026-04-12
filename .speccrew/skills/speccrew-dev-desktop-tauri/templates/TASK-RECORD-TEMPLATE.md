# Tauri Development Task Record - [Feature Name]

> Based on Design Document: [Link to 03.system-design/{platform_id}/[feature-name]-design.md]
> Platform: {platform_id} | Framework: Tauri

## Task Checklist

| Task ID | Module | Description | Target Files | Command Name | Native Integration | Dependencies | Status |
|---------|--------|-------------|--------------|--------------|-------------------|--------------|--------|
| TR-001 | Commands | [Description] | `src-tauri/src/commands/...` | `command:name` | [None/FileSystem/etc] | - | Pending |
| TR-002 | Frontend | [Description] | `src/...` | `command:name` | - | TR-001 | Pending |

> Status: Pending / In Progress / Completed / Blocked

## Command Registry

| Command Name | Input Type | Output Type | Handler Location | Description | Status |
|--------------|------------|-------------|------------------|-------------|--------|
| [command:name] | [Input] | [Output] | `src-tauri/src/commands/[file].rs` | [Description] | [NEW/MODIFIED/EXISTING] |

## Native Integration Status

| Integration Type | Feature | Implementation File | Status | Notes |
|------------------|---------|---------------------|--------|-------|
| File System | [Read/Write/Dialog] | `src-tauri/src/commands/fs.rs` | [Done/Pending] | [Notes] |
| System Tray | [Icon/Menu] | `src-tauri/src/tray.rs` | [Done/Pending] | [Notes] |
| Notifications | [OS Notifications] | `src-tauri/src/notify.rs` | [Done/Pending] | [Notes] |
| Menu Bar | [App Menu] | `src-tauri/src/menu.rs` | [Done/Pending] | [Notes] |
| Shortcuts | [Global/Local] | `src-tauri/src/shortcuts.rs` | [Done/Pending] | [Notes] |
| Protocol Handler | [Custom Protocol] | `src-tauri/src/protocol.rs` | [Done/Pending] | [Notes] |
| Auto Update | [Check/Download/Install] | `src-tauri/src/updater.rs` | [Done/Pending] | [Notes] |

## Security Checklist

| Check Item | Configuration | Verified |
|------------|---------------|----------|
| CSP | Configured in `tauri.conf.json` | [ ] Yes / [ ] No |
| Dangerous APIs | Minimal allowlist scope | [ ] Yes / [ ] No |
| Command Validation | Input validation implemented | [ ] Yes / [ ] No |
| Permission Scope | [Limited permissions] | [ ] Yes / [ ] No |

## Window Management

| Window Name | Type | Status | Configuration |
|-------------|------|--------|---------------|
| [MainWindow] | Window | [NEW/MODIFIED/EXISTING] | [Size/frame/etc] |
| [ModalWindow] | Window | [NEW/MODIFIED/EXISTING] | [Size/frame/etc] |

## Implementation Progress

### Completed Tasks

- [TR-001] [Description] - Completed at [timestamp]
- [TR-002] [Description] - Completed at [timestamp]

### In Progress

- [TR-003] [Description] - Started at [timestamp]

### Blocked Tasks

| Task ID | Block Reason | Blocking Issue | Planned Resolution |
|---------|--------------|----------------|-------------------|
| [TR-XXX] | [Reason] | [Issue link/description] | [Resolution plan] |

## Deviation Log

| Task ID | Original Design | Implementation | Reason |
|---------|-----------------|----------------|--------|
| [TR-XXX] | [Original approach] | [Actual implementation] | [Why changed] |

## Issues and Resolutions

| Issue ID | Task ID | Description | Severity | Resolution | Status |
|----------|---------|-------------|----------|------------|--------|
| [ISSUE-001] | [TR-XXX] | [Description] | [High/Med/Low] | [How resolved] | [Resolved/Pending] |

## Local Verification Results

### Build Verification

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Rust Check | `cargo check` | [Pass/Fail] | [Notes] |
| Dev Build | `npm run tauri dev` | [Pass/Fail] | [Notes] |
| Production Build | `npm run tauri build` | [Pass/Fail] | [Notes] |

### Code Quality

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Rust Lint | `cargo clippy` | [Pass/Fail] | [Notes] |
| Rust Test | `cargo test` | [Pass/Fail] | [Notes] |
| Frontend Lint | `npm run lint` | [Pass/Fail] | [Notes] |
| Type Check | `npx tsc --noEmit` | [Pass/Fail] | [Notes] |
| Unit Tests | `npm test` | [Pass/Fail] | [Notes] |

### Security Verification

| Check | Method | Result | Notes |
|-------|--------|--------|-------|
| CSP Config | Config review | [Pass/Fail] | [Notes] |
| Allowlist Scope | Config review | [Pass/Fail] | [Notes] |
| Input Validation | Code review | [Pass/Fail] | [Notes] |

### Functional Verification

| Check | Result | Notes |
|-------|--------|-------|
| App launches without crash | [Pass/Fail] | [Notes] |
| Tauri commands respond correctly | [Pass/Fail] | [Notes] |
| Native integrations work | [Pass/Fail] | [Notes] |
| No console errors | [Pass/Fail] | [Notes] |

## Technical Debt

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
- [ ] All Tauri commands tested
- [ ] Security checklist verified
- [ ] Local checks (cargo check, lint, type, build) passing
- [ ] Deviations documented with reasons
- [ ] Technical debt recorded
- [ ] Task record updated

---

**Status**: In Progress / Completed  
**Last Updated**: [Timestamp]  
**Developer**: [Agent/User name]
