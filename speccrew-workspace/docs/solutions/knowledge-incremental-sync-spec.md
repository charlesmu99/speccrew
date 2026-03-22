# 知识库增量同步方案（Git-based Incremental Sync）

> **Purpose**: 定义基于 Git 版本比较的知识库（Bizs & Techs）增量同步机制
> **Last Updated**: 2024-03-21
> **Related Skills**: `SpecCrew-knowledge-dispatch`, `SpecCrew-knowledge-bizs-sync`, `SpecCrew-knowledge-techs-sync`

---

## 1. 架构概述

本方案定义了基于 Git 版本比较的知识库增量同步机制，支持业务知识（Bizs）和技术知识（Techs）的自动更新。

```
┌─────────────────────────────────────────────────────────────────┐
│              Git-based Incremental Sync Architecture            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Git Hook   │    │   Manual    │    │  Scheduled  │         │
│  │  (自动)      │    │  (手动)      │    │  (定时)      │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         └──────────────────┼──────────────────┘                │
│                            ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Sync Dispatcher (统一入口)                   │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  1. Detect Changes (Git diff)                   │    │  │
│  │  │  2. Determine Granularity (模块级/功能级)         │    │  │
│  │  │  3. Check Conflicts (人工编辑检测)               │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Pipeline Router                             │  │
│  │  ┌──────────────┐              ┌──────────────┐         │  │
│  │  │  Bizs Pipe   │◄────────────►│  Techs Pipe  │         │  │
│  │  │  (业务知识)   │   联动触发    │  (技术知识)   │         │  │
│  │  └──────┬───────┘              └──────┬───────┘         │  │
│  │         │                             │                  │  │
│  │  ┌──────▼───────┐              ┌──────▼───────┐         │  │
│  │  │ Stage 2/3    │              │ Stage 2/3    │         │  │
│  │  │ (增量Worker) │              │ (增量Worker) │         │  │
│  │  └──────┬───────┘              └──────┬───────┘         │  │
│  │         │                             │                  │  │
│  │  ┌──────▼───────┐              ┌──────▼───────┐         │  │
│  │  │  Stage 4     │              │  Stage 4     │         │  │
│  │  │ (全量聚合)    │              │ (全量聚合)    │         │  │
│  │  └──────────────┘              └──────────────┘         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Output & Report                             │  │
│  │  - 自动生成文档 → Git 暂存区                              │  │
│  │  - 生成变更报告 → 提交信息/通知                           │  │
│  │  - 冲突标记 → 等待人工解决                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 触发机制

### 2.1 触发方式（全支持）

| 触发方式 | 触发时机 | 适用场景 | 配置方式 |
|----------|----------|----------|----------|
| **Git Hook 自动** | pre-commit / post-merge / post-checkout | 日常开发，保持文档实时同步 | 项目初始化时自动配置到 `.git/hooks/` |
| **手动触发** | 开发者主动执行 | 需要精确控制更新范围 | Leader Agent 调用 Skill |
| **定时触发** | 定时任务扫描 | 长时间未提交的场景 | CI/CD Pipeline 配置 |

### 2.2 Git Hook 配置示例

```bash
# .git/hooks/post-commit
#!/bin/bash
# SpecCrew 知识库自动同步钩子

echo "[SpecCrew] 检测知识库同步需求..."

# 调用增量同步 Skill
speccrew knowledge-sync \
  --mode=incremental \
  --source=bizs,techs \
  --report=console

# 如果有文档变更，自动添加到暂存区（供下次提交）
if [ -f "speccrew-workspace/docs/crew-init/sync-report.json" ]; then
    echo "[SpecCrew] 文档已更新，请查看变更并提交"
fi
```

### 2.3 手动触发命令

```bash
# 完整同步（全量）
speccrew knowledge-sync --mode=full

# 增量同步（仅变更模块）
speccrew knowledge-sync --mode=incremental

# 仅同步业务知识
speccrew knowledge-sync --source=bizs

# 仅同步技术知识
speccrew knowledge-sync --source=techs

# 指定模块强制更新
speccrew knowledge-sync --module=order,payment --force
```

---

## 3. 变更粒度判定

### 3.1 自动判定策略

系统根据变更文件类型自动判定更新粒度：

```python
def determine_update_granularity(changed_files, module_config):
    """
    根据变更文件类型自动判定更新粒度
    """
    for changed_file in changed_files:
        # 1. 技术配置文件变更 → 触发 Techs 全量更新
        if is_tech_config_file(changed_file):
            return UpdateType.TECHS_FULL
        
        # 2. 模块入口文件变更 → 模块级更新
        if is_module_entry_file(changed_file, module_config):
            return UpdateType.MODULE_LEVEL
        
        # 3. 具体功能文件变更 → 功能级更新
        if is_feature_file(changed_file):
            feature_id = extract_feature_id(changed_file)
            return UpdateType.FEATURE_LEVEL(feature_id)
        
        # 4. 共享代码变更 → 保守策略，模块级更新
        if is_shared_util_file(changed_file):
            affected_modules = find_dependent_modules(changed_file)
            return UpdateType.MODULES_LEVEL(affected_modules)
```

### 3.2 文件类型映射表

| 文件类型 | 判定规则 | 更新粒度 | 示例 |
|----------|----------|----------|------|
| **技术配置** | `package.json`, `pom.xml`, `go.mod` 等 | Techs 全量 | 依赖升级、框架变更 |
| **构建配置** | `tsconfig.json`, `vite.config.*` 等 | Techs 平台级 | 构建设置调整 |
| **约定配置** | `.eslintrc*`, `.prettierrc*` 等 | Techs 约定级 | 代码规范变更 |
| **模块入口** | `module.ts`, `index.ts` (模块根) | Bizs 模块级 | 模块结构变更 |
| **功能文件** | `*.controller.ts`, `*.service.ts` | Bizs 功能级 | 接口/逻辑变更 |
| **共享工具** | `utils/`, `common/`, `shared/` | Bizs 多模块级 | 工具函数变更 |

### 3.3 跨模块依赖处理

当共享代码变更时，采用**保守策略**：

```
变更文件: src/shared/utils/order-helper.ts

处理流程:
1. 识别文件属于 shared 模块
2. 查找所有引用该文件的模块
   - order.module.ts (import)
   - payment.module.ts (import)
3. 标记 order 和 payment 模块为 CHANGED
4. 触发这两个模块的 Stage 2/3 更新
```

---

## 4. 增量同步算法

### 4.1 核心流程

```
输入: BASE_COMMIT (上次同步提交), HEAD (当前提交)
输出: 更新的文档 + 同步报告

算法步骤:
┌─────────────────────────────────────────────────────────────┐
│ 1. 变更检测                                                  │
│    ├─ git diff --name-only BASE_COMMIT HEAD                 │
│    └─ 获取 changed_files 列表                                │
├─────────────────────────────────────────────────────────────┤
│ 2. 重新扫描 (Stage 1)                                        │
│    ├─ 运行 SpecCrew-knowledge-bizs-init                     │
│    ├─ 运行 SpecCrew-knowledge-techs-init (如需要)            │
│    └─ 生成新的 modules.json / techs-manifest.json           │
├─────────────────────────────────────────────────────────────┤
│ 3. 变更映射                                                  │
│    ├─ 对比新旧 modules.json                                  │
│    ├─ 根据 entry_points 映射文件到模块                        │
│    ├─ 标记模块状态: NEW / CHANGED / DELETED / UNMODIFIED    │
│    └─ 构建 affected_modules 列表                             │
├─────────────────────────────────────────────────────────────┤
│ 4. 冲突检测                                                  │
│    ├─ 检查 affected_modules 对应文档是否有人工编辑            │
│    ├─ 如有冲突，生成冲突报告并标记 NEED_MANUAL_REVIEW       │
│    └─ 无冲突则继续                                           │
├─────────────────────────────────────────────────────────────┤
│ 5. 增量执行                                                  │
│    ├─ Stage 2: 仅对 NEW/CHANGED 模块派发 Worker              │
│    ├─ Stage 3: 仅对 NEW/CHANGED 模块派发 Worker              │
│    ├─ Stage 4: 总是重新生成聚合文档                          │
│    └─ 清理 DELETED 模块的文档                                │
├─────────────────────────────────────────────────────────────┤
│ 6. 状态更新                                                  │
│    ├─ 保存新的 modules.json (更新 source_commit = HEAD)     │
│    ├─ 自动生成同步报告                                        │
│    └─ 如有文档变更，添加到 Git 暂存区                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 模块状态判定

```typescript
enum ModuleStatus {
  NEW,        // 新模块（旧快照不存在）
  CHANGED,    // 模块存在且关联文件有变更
  DELETED,    // 模块已删除（新快照不存在）
  UNMODIFIED  // 模块存在且无关联文件变更
}

function determineModuleStatus(
  moduleName: string,
  oldModules: ModulesJson,
  newModules: ModulesJson,
  changedFiles: string[]
): ModuleStatus {
  const oldMod = findModule(oldModules, moduleName);
  const newMod = findModule(newModules, moduleName);
  
  if (!oldMod && newMod) return ModuleStatus.NEW;
  if (oldMod && !newMod) return ModuleStatus.DELETED;
  if (!oldMod && !newMod) return ModuleStatus.UNMODIFIED;
  
  // 检查模块关联文件是否变更
  const moduleFiles = getModuleFilePatterns(newMod);
  const hasChanges = changedFiles.some(f => 
    moduleFiles.some(pattern => matches(f, pattern))
  );
  
  return hasChanges ? ModuleStatus.CHANGED : ModuleStatus.UNMODIFIED;
}
```

---

## 5. 冲突处理

### 5.1 冲突检测策略

```python
def detect_edit_conflict(module_name, doc_path):
    """
    检测文档是否有人工编辑
    """
    # 策略1: 检查 .editing 标记文件
    editing_marker = f"{doc_path}.editing"
    if os.path.exists(editing_marker):
        return ConflictType.MARKED_EDITING
    
    # 策略2: 对比 Git 版本与工作区
    last_committed = get_git_version(doc_path)
    current_working = read_file(doc_path)
    
    if last_committed != current_working:
        # 文件已被修改但未提交
        return ConflictType.UNCOMMITTED_CHANGES
    
    # 策略3: 检查文件修改时间
    if get_mtime(doc_path) > last_sync_time:
        return ConflictType.RECENTLY_MODIFIED
    
    return ConflictType.NONE
```

### 5.2 冲突处理流程

当检测到冲突时，系统生成冲突报告并暂停自动更新：

```
冲突处理流程:
┌─────────────────────────────────────────────────────────────┐
│ 1. 检测到冲突                                                │
│    └─ 模块: order, 文档: order-overview.md                  │
├─────────────────────────────────────────────────────────────┤
│ 2. 生成三向对比                                               │
│    ├─ BASE: 上次提交的版本                                    │
│    ├─ OURS: 当前工作区版本（人工编辑）                         │
│    └─ THEIRS: 自动生成版本                                    │
├─────────────────────────────────────────────────────────────┤
│ 3. 保存冲突报告                                               │
│    └─ speccrew-workspace/docs/conflicts/order.conflict.md   │
├─────────────────────────────────────────────────────────────┤
│ 4. 标记模块状态                                               │
│    └─ modules.json: order.status = "CONFLICT"               │
├─────────────────────────────────────────────────────────────┤
│ 5. 通知开发者                                                 │
│    ├─ 控制台输出冲突摘要                                      │
│    ├─ 同步报告标记冲突模块                                    │
│    └─ 跳过该模块的自动更新                                    │
├─────────────────────────────────────────────────────────────┤
│ 6. 等待人工解决                                               │
│    ├─ 查看冲突报告: cat conflicts/order.conflict.md         │
│    ├─ 选择策略并执行                                          │
│    └─ 标记解决: speccrew knowledge-resolve --module=order   │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 冲突解决命令

```bash
# 查看冲突详情
cat speccrew-workspace/docs/conflicts/order.conflict.md

# 策略1: 保留人工版本
speccrew knowledge-resolve --module=order --strategy=keep-ours

# 策略2: 采用生成版本
speccrew knowledge-resolve --module=order --strategy=keep-theirs

# 策略3: 手动合并后标记解决
# 编辑文件后执行:
speccrew knowledge-resolve --module=order --strategy=resolved

# 批量解决所有冲突
speccrew knowledge-resolve --all --strategy=keep-ours
```

### 5.4 冲突报告格式

```markdown
# 文档冲突待解决: order-overview.md

## 冲突摘要
- 模块: order
- 文档路径: knowledge/bizs/order/order-overview.md
- 检测时间: 2024-03-21 10:30:00
- 冲突类型: UNCOMMITTED_CHANGES

## 冲突位置详情

### Section 3: 业务实体
| 版本 | 内容摘要 |
|------|----------|
| BASE | Order, OrderItem, Payment |
| OURS | Order, OrderItem, Payment, Refund |
| THEIRS | Order, OrderItem, Payment, Shipping |

**分析**: 人工版本添加了 Refund 实体，自动生成版本添加了 Shipping 实体

### Section 5: 核心流程
| 版本 | 变更 |
|------|------|
| OURS | 补充了异常处理流程说明 |
| THEIRS | 根据新代码更新了流程步骤 |

## 建议
- 业务实体: 建议合并两个版本（同时保留 Refund 和 Shipping）
- 核心流程: 建议保留人工版本（异常处理说明有价值）

## 解决命令
```bash
# 手动编辑文件后标记解决
speccrew knowledge-resolve --module=order --strategy=resolved
```
```

---

## 6. Techs 联动更新

### 6.1 联动触发规则

```yaml
# speccrew-workspace/docs/techs-trigger-rules.yaml
techs_update_triggers:
  # 依赖文件变更 → 全量 Techs 更新
  - name: "dependency_change"
    patterns:
      - "**/package.json"
      - "**/pom.xml"
      - "**/go.mod"
      - "**/requirements.txt"
      - "**/Cargo.toml"
    action: trigger_techs_full_sync
    priority: high
  
  # 构建配置变更 → 对应平台更新
  - name: "build_config_change"
    patterns:
      - "**/tsconfig.json"
      - "**/vite.config.*"
      - "**/webpack.config.*"
      - "**/nest-cli.json"
      - "**/next.config.*"
    action: trigger_techs_platform_sync
    priority: medium
  
  # 约定配置变更 → 约定文档更新
  - name: "convention_change"
    patterns:
      - "**/.eslintrc*"
      - "**/.prettierrc*"
      - "**/.editorconfig"
      - "**/jest.config.*"
    action: trigger_techs_conventions_sync
    priority: low
```

### 6.2 联动执行流程

```
Bizs Pipeline 执行时:
┌─────────────────────────────────────────────────────────────┐
│ 1. Stage 1 扫描变更文件                                       │
│    └─ 识别到 package.json 变更                               │
├─────────────────────────────────────────────────────────────┤
│ 2. 匹配触发规则                                               │
│    └─ 命中 dependency_change → trigger_techs_full_sync      │
├─────────────────────────────────────────────────────────────┤
│ 3. 并行启动 Techs Pipeline                                    │
│    ├─ Bizs: 继续执行 Stage 2/3/4                             │
│    └─ Techs: 同时启动 Techs Stage 1/2/3/4                    │
├─────────────────────────────────────────────────────────────┤
│ 4. 记录联动关系                                               │
│    └─ 保存到 sync-relationship.json                          │
├─────────────────────────────────────────────────────────────┤
│ 5. 合并执行报告                                               │
│    └─ 生成统一的同步报告                                      │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 联动关系记录

```json
{
  "sync_id": "sync-20240321-001",
  "triggered_at": "2024-03-21T10:30:00Z",
  "trigger_commit": "def5678",
  "trigger_reason": "package.json changed",
  "pipelines": [
    {
      "type": "bizs",
      "status": "completed",
      "affected_modules": ["order", "payment"],
      "execution_time_ms": 45000
    },
    {
      "type": "techs",
      "status": "completed",
      "trigger_reason": "dependency_change",
      "affected_platforms": ["web-react", "backend-nestjs"],
      "execution_time_ms": 32000
    }
  ],
  "summary": {
    "total_docs_generated": 12,
    "total_docs_updated": 5,
    "conflicts_detected": 0
  }
}
```

---

## 7. 同步报告

### 7.1 报告格式

```markdown
## SpecCrew 知识库同步报告

### 基本信息
- 同步ID: sync-20240321-001
- 触发方式: git-hook (post-commit)
- 提交范围: abc1234 → def5678
- 执行时间: 2024-03-21 10:30:00

### 变更检测
- 变更文件数: 5
- 新增文件: 1
- 修改文件: 3
- 删除文件: 1

### Bizs 知识库更新

| 模块 | 状态 | 更新粒度 | 生成文档 |
|------|------|----------|----------|
| order | CHANGED | 功能级 | order-overview.md, features/create-order.md |
| payment | UNMODIFIED | - | - |
| user | NEW | 模块级 | user-overview.md, features/*.md (4个) |
| inventory | DELETED | - | 文档已归档 |

### Techs 知识库更新

| 平台 | 触发原因 | 更新文档 |
|------|----------|----------|
| web-react | dependency_change | tech-stack.md, conventions-dev.md |
| backend-nestjs | dependency_change | tech-stack.md |

### 冲突情况
- 冲突模块数: 0
- 详情: 无

### 建议操作
- [x] 文档已自动添加到 Git 暂存区
- [ ] 请 review 变更内容
- [ ] 执行 `git commit` 提交文档更新

### 详细日志
见: speccrew-workspace/docs/crew-init/sync-20240321-001.log
```

### 7.2 报告存储位置

```
speccrew-workspace/
└── docs/
    └── crew-init/
        ├── sync-report.json              # 最新报告（JSON格式）
        ├── sync-report.md                # 最新报告（Markdown格式）
        └── sync-history/
            ├── sync-20240321-001.json    # 历史报告
            ├── sync-20240321-001.log     # 详细日志
            └── sync-20240320-003.json
```

---

## 8. 存储结构

### 8.1 状态文件位置

保持现有结构不变：

```
speccrew-workspace/
└── docs/
    └── crew-init/
        ├── knowledge-bizs/
        │   ├── modules.json              # 模块清单（含 source_commit）
        │   ├── stage2-status.json        # Stage 2 执行状态
        │   ├── stage3-status.json        # Stage 3 执行状态
        │   ├── final-report.json         # 最终报告
        │   └── sync-history/             # 同步历史记录
        │
        ├── knowledge-techs/
        │   ├── techs-manifest.json       # 技术栈清单
        │   ├── stage2-status.json
        │   └── final-report.json
        │
        ├── conflicts/                    # 冲突报告目录
        │   ├── order.conflict.md
        │   └── payment.conflict.md
        │
        ├── sync-report.json              # 最新同步报告
        ├── sync-report.md
        └── sync-history/                 # 历史报告归档
```

### 8.2 modules.json 扩展结构

```json
{
  "generated_at": "2024-03-21T10:30:00Z",
  "source_commit": "def5678",
  "last_sync_id": "sync-20240321-001",
  "source_path": "/project/src",
  "language": "zh",
  "analysis_method": "ui-based",
  "platforms": [
    {
      "platform_name": "Web Frontend",
      "platform_type": "web",
      "tech_stack": ["React", "TypeScript"],
      "source_path": "src/web",
      "modules": [
        {
          "name": "order",
          "code_name": "order",
          "user_value": "订单生命周期管理",
          "system_type": "ui",
          "entry_points": [
            "modules/order/index.ts",
            "modules/order/order.module.ts"
          ],
          "backend_apis": ["/api/orders", "/api/orders/{id}"],
          "status": "active",
          "last_sync": "2024-03-21T10:30:00Z"
        }
      ]
    }
  ]
}
```

---

## 9. 实施阶段

### Phase 1: MVP（基础增量同步）

- [ ] Git diff 检测实现
- [ ] 文件到模块的映射算法
- [ ] 增量 Stage 2/3 调度逻辑
- [ ] 基础同步报告生成

### Phase 2: 增强功能

- [ ] 跨模块依赖追踪
- [ ] 人工编辑检测与冲突处理
- [ ] Techs 联动更新
- [ ] 性能优化（缓存、并行）

### Phase 3: 高级特性

- [ ] 智能合并建议
- [ ] 变更影响分析
- [ ] 历史版本对比
- [ ] 自动化测试集成

---

## 10. 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| Bizs Pipeline | `bizs-knowledge-pipeline.md` | 业务知识生成流程 |
| Techs Pipeline | `techs-knowledge-pipeline.md` | 技术知识生成流程 |
| Agent 知识地图 | `agent-knowledge-map.md` | Agent 知识需求映射 |

---

## 11. 维护日志

| Date | Changes | Owner |
|------|---------|-------|
| 2024-03-21 | 初始版本，定义增量同步完整方案 | - |
