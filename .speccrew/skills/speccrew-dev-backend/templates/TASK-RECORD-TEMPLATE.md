# Backend Development Task Record - [Module Name]

> Based on design document: [Link to 03.system-design/{platform_id}/[module]-design.md]  
> Platform: {platform_id}  
> Created: [Date]

---

## Task Checklist

| Task ID | Module | Description | Target Files | API Endpoint | DB Migration | Dependencies | Status |
|---------|--------|-------------|--------------|--------------|--------------|--------------|--------|
| BE-001 | [Module] | [Description] | `src/...` | - | V001__xxx.sql | - | ⏳ Pending |
| BE-002 | [Module] | [Description] | `src/...` | POST /api/xxx | - | BE-001 | ⏳ Pending |

> Status: ⏳ Pending / 🔄 In Progress / ✅ Complete / 🚫 Blocked

---

## API Endpoint Tracking

| Method | Endpoint | Controller | Service | Repository | Status | Notes |
|--------|----------|------------|---------|------------|--------|-------|
| POST | /api/auth/login | AuthController | AuthService | UserRepository | ⏳ Pending | - |
| GET | /api/users/:id | UserController | UserService | UserRepository | ⏳ Pending | - |

> Track implementation status of each API endpoint from API Contract.

---

## Database Migration Log

| Migration ID | Description | Tables Created | Tables Modified | Status |
|--------------|-------------|----------------|-----------------|--------|
| V001 | Create user table | users | - | ⏳ Pending |
| V002 | Add email column | - | users | ⏳ Pending |

> Track all database schema changes and migration file status.

---

## Progress Summary

### Completed Tasks

- [No completed tasks yet]

### In Progress

- [No tasks in progress]

### Blocked Tasks

| Task ID | Blocker | Blocking Since | Resolution Plan |
|---------|---------|----------------|-----------------|
| - | - | - | - |

---

## Deviation Log

| Task ID | Design Specification | Actual Implementation | Reason |
|---------|---------------------|----------------------|--------|
| - | - | - | - |

> Record ALL deviations from design documents. If no deviations, write "None".

---

## Pending Issues

| Issue | Severity | Affected Tasks | Resolution | Status |
|-------|----------|----------------|------------|--------|
| - | - | - | - | - |

> Severity: 🔴 High / 🟡 Medium / 🟢 Low  
> Status: ⏳ Unresolved / 🔄 Investigating / ✅ Resolved

---

## Technical Debt Recorded

| Debt ID | Description | File | Tech Debt Document |
|---------|-------------|------|-------------------|
| - | - | - | - |

> If technical debt was created during implementation, record reference here.  
> Tech debt files are stored in: `iterations/{number}-{type}-{name}/tech-debt/`

---

## Local Checks Log

### BE-001 Checks

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Compile | `mvn compile` | ⏳ Pending | - |
| Lint | `mvn checkstyle:check` | ⏳ Pending | - |
| Unit Test | `mvn test -Dtest=XxxTest` | ⏳ Pending | - |

> Update check results as tasks are completed.  
> Result: ⏳ Pending / ✅ Pass / ❌ Fail

---

## Completion Status

- Overall Progress: `0 / {total} tasks complete`
- Deviations: `0`
- Technical Debt Items: `0`
- Status: ⏳ In Progress / ✅ Complete / 🚫 Blocked

---

## Notes

[Any additional notes or context about the implementation]
