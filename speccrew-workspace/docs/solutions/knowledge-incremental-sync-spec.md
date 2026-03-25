# 知识库增量同步方案（Git-based Incremental Sync）

> **Purpose**: 定义基于 Git 版本比较的知识库（Bizs & Techs）增量同步机制
> **Last Updated**: 2025-03
> **Related Skills**: `speccrew-knowledge-dispatch`

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
│  │  │  Stage 4     │              │  Stage 3     │         │  │
│  │  │ (系统聚合)    │              │ (索引聚合)    │         │  │
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
# speccrew 知识库自动同步钩子

echo "[speccrew] 检测知识库同步需求..."

# 调用增量同步 Skill
speccrew knowledge-sync \
  --mode=incremental \
  --source=bizs,techs \
  --report=console

# 如果有文档变更，自动添加到暂存区（供下次提交）
if [ -f "speccrew-workspace/knowledges/base/sync-state/sync-report.json" ]; then
    echo "[speccrew] 文档已更新，请查看变更并提交"
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

Leader Agent（speccrew-knowledge-dispatch）根据变更文件类型自动判定更新粒度：

**输入参数**（由调用方通过 context 传入）：
- `changed_files`: 变更文件路径列表（相对于项目根目录）
- `modules.json`: 当前模块配置（已读取的 JSON 对象）

**判定逻辑**（在 Leader Agent 中执行）：

```
Step 1: 遍历 changed_files 中的每个文件路径

Step 2: 检查文件是否匹配技术配置文件模式
  - 模式列表: ["**/package.json", "**/pom.xml", "**/go.mod", "**/requirements.txt", "**/Cargo.toml"]
  - IF 匹配 → 返回 UpdateType.TECHS_FULL

Step 3: 检查文件是否匹配构建配置文件模式
  - 模式列表: ["**/tsconfig.json", "**/vite.config.*", "**/webpack.config.*", "**/nest-cli.json"]
  - IF 匹配 → 返回 UpdateType.TECHS_PLATFORM

Step 4: 检查文件是否匹配约定配置文件模式
  - 模式列表: ["**/.eslintrc*", "**/.prettierrc*", "**/.editorconfig", "**/jest.config.*"]
  - IF 匹配 → 返回 UpdateType.TECHS_CONVENTION

Step 5: 检查文件是否属于模块入口文件
  - 根据 modules.json 中的 entry_points 进行匹配
  - IF 匹配 → 返回 UpdateType.MODULE_LEVEL(模块名)

Step 6: 检查文件是否属于共享工具代码
  - 路径包含: ["**/utils/**", "**/common/**", "**/shared/**"]
  - IF 匹配 → 查找引用该文件的所有模块，返回 UpdateType.MODULES_LEVEL(模块列表)

Step 7: 默认情况 → 返回 UpdateType.FEATURE_LEVEL(推断的功能ID)
```

**输出结果**：返回更新类型枚举值，Dispatcher 据此决定后续执行策略。

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
│    ├─ 运行 speccrew-knowledge-bizs-init                     │
│    ├─ 运行 speccrew-knowledge-techs-init (如需要)            │
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
│    ├─ Stage 4 (Bizs): 总是重新生成 system-overview.md        │
│    ├─ Stage 3 (Techs): 总是重新生成根 INDEX.md               │
│    └─ 清理 DELETED 模块的文档                                │
├─────────────────────────────────────────────────────────────┤
│ 6. 状态更新                                                  │
│    ├─ 保存新的 modules.json (更新 source_commit = HEAD)     │
│    ├─ 自动生成同步报告                                        │
│    └─ 如有文档变更，添加到 Git 暂存区                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 模块状态判定

Leader Agent 根据新旧 modules.json 和变更文件列表，判定每个模块的状态。

**输入参数**：
- `old_modules.json`: 上次同步时的模块配置（从 sync-state 目录读取）
- `new_modules.json`: 本次 Stage 1 新生成的模块配置
- `changed_files`: Git diff 获取的变更文件列表

**判定逻辑**：

```
Step 1: 遍历 new_modules.json 中的所有模块

Step 2: 对于每个模块，获取其 code_name

Step 3: 在 old_modules.json 中查找同名模块

Step 4: 判定状态
  IF old_modules 中不存在 AND new_modules 中存在
    → 标记为 NEW
    
  IF old_modules 中存在 AND new_modules 中不存在
    → 标记为 DELETED
    
  IF old_modules 和 new_modules 中都存在
    → 检查 entry_points 关联文件是否在 changed_files 中
      - 构建模块文件路径: platform.source_path + entry_points[*]
      - IF 任一文件匹配 changed_files → 标记为 CHANGED
      - ELSE → 标记为 UNMODIFIED

Step 5: 返回模块状态映射表
  {
    "web/order": "CHANGED",
    "web/payment": "NEW",
    "web/user": "UNMODIFIED",
    "mobile-flutter/order": "DELETED"
  }
```

**状态说明**：

| 状态 | 含义 | Stage 2/3 处理策略 |
|------|------|-------------------|
| `NEW` | 新模块（旧快照不存在） | 派发 Worker 生成文档 |
| `CHANGED` | 模块存在且关联文件有变更 | 派发 Worker 更新文档 |
| `DELETED` | 模块已删除（新快照不存在） | 清理对应文档目录 |
| `UNMODIFIED` | 模块存在且无关联文件变更 | 跳过，不派发 Worker |

---

## 5. 冲突处理

### 5.1 冲突检测策略

Leader Agent 在派发 Worker 前，检查目标文档是否有人工编辑。

**输入参数**：
- `module_name`: 模块代码名（如 "order"）
- `doc_path`: 文档完整路径（如 "speccrew-workspace/knowledges/bizs/web/order/order-overview.md"）

**检测逻辑**：

```
Step 1: 检查 .editing 标记文件
  - 检查文件是否存在: "{doc_path}.editing"
  - IF 存在 → 返回 MARKED_EDITING

Step 2: 对比 Git 版本与工作区（通过工具调用）
  - 使用 read_file 读取当前工作区内容
  - 使用 git show HEAD:{doc_path} 获取上次提交版本
  - IF 两者不一致 → 返回 UNCOMMITTED_CHANGES

Step 3: 检查文件修改时间
  - 获取 doc_path 的 mtime（文件系统元数据）
  - 与 stage2-status.json 中该模块的 completed_at 对比
  - IF mtime > completed_at → 返回 RECENTLY_MODIFIED

Step 4: 默认情况
  → 返回 NONE
```

**冲突类型说明**：

| 类型 | 含义 | 处理建议 |
|------|------|----------|
| `MARKED_EDITING` | 用户创建了 .editing 标记文件 | 完全跳过该模块，等待用户完成编辑 |
| `UNCOMMITTED_CHANGES` | 文档已被修改但未提交 | 生成冲突报告，暂停自动更新 |
| `RECENTLY_MODIFIED` | 文档在同步后被人修改过 | 生成冲突报告，提示用户确认 |
| `NONE` | 无冲突 | 正常派发 Worker |

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
- 文档路径: speccrew-workspace/knowledges/bizs/web/order/order-overview.md
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
│    └─ Techs: 同时启动 Techs Stage 1/2/3                     │
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
## speccrew 知识库同步报告

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
见: speccrew-workspace/knowledges/base/sync-state/sync-history/sync-20240321-001.log
```

### 7.2 报告存储位置

```
speccrew-workspace/
└── knowledges/
    └── base/
        └── sync-state/
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

```
speccrew-workspace/
└── knowledges/
    └── base/
        └── sync-state/
            ├── knowledge-bizs/
            │   ├── modules.json              # 模块清单（含 source_commit）
            │   ├── stage2-status.json        # Stage 2 执行状态
            │   ├── stage3-status.json        # Stage 3 执行状态
            │   └── final-report.json         # 最终报告
            │
            ├── knowledge-techs/
            │   ├── techs-manifest.json       # 技术栈清单
            │   ├── stage2-status.json        # Stage 2 执行状态
            │   ├── stage3-status.json        # Stage 3 执行状态
            │   └── final-report.json         # 最终报告
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

增量同步在标准 `modules.json` 结构基础上，依赖 `source_commit` 字段作为基准版本标记：

```json
{
  "generated_at": "2024-03-21T10:30:00Z",
  "source_commit": "def5678",
  "last_sync_id": "sync-20240321-001",
  "source_path": "/project",
  "language": "zh",
  "analysis_method": "ui-based",
  "platform_count": 2,
  "platforms": [
    {
      "platform_name": "Web Frontend",
      "platform_type": "web",
      "source_path": "src/web",
      "tech_stack": ["react", "typescript"],
      "module_count": 3,
      "modules": [
        {
          "name": "Order Management",
          "code_name": "order",
          "user_value": "订单生命周期管理",
          "system_type": "ui",
          "entry_points": [
            "src/pages/orders/index.tsx",
            "src/pages/orders/[id].tsx"
          ],
          "backend_apis": [
            "GET /api/orders",
            "POST /api/orders",
            "GET /api/orders/:id"
          ],
          "status": "active",
          "last_sync": "2024-03-21T10:30:00Z"
        }
      ]
    },
    {
      "platform_name": "Mobile App",
      "platform_type": "mobile",
      "platform_subtype": "flutter",
      "source_path": "src/mobile",
      "tech_stack": ["flutter", "dart"],
      "module_count": 3,
      "modules": [
        {
          "name": "Order Management",
          "code_name": "order",
          "user_value": "订单生命周期管理",
          "system_type": "ui",
          "entry_points": [
            "lib/pages/orders/list.dart",
            "lib/pages/orders/detail.dart"
          ],
          "status": "active",
          "last_sync": "2024-03-21T10:30:00Z"
        }
      ]
    }
  ]
}
```

**增量同步关键字段说明**：

| 字段 | 说明 | 增量同步用途 |
|------|------|-------------|
| `source_commit` | 生成时的 Git commit hash (HEAD) | 作为下次增量同步的 `base_commit` 基准 |
| `last_sync_id` | 最近一次同步 ID | 关联同步历史记录 |
| `platforms[].source_path` | 平台源码根路径 | 结合 `entry_points` 构建文件映射 |
| `modules[].entry_points` | 模块入口文件（相对于平台 source_path） | 映射 changed_files 到模块 |
| `modules[].backend_apis` | 关联后端 API（ui 类型模块） | 辅助判断 API 变更影响的业务模块 |
| `modules[].status` | 模块状态（active / CONFLICT 等） | 标记需人工处理的模块 |

---

## 9. 中断恢复机制

### 9.1 设计目标

Pipeline 执行过程中可能因断电、系统崩溃或用户手动停止而中断。中断恢复机制确保再次执行时：
- **Stage 1 中断**：重新运行 Stage 1（成本低，直接重新生成 `modules.json` / `techs-manifest.json`）
- **Stage 2/3 中断**：基于 `stage2-status.json` / `stage3-status.json` 恢复，跳过已完成的 Worker，仅补跑未完成部分
- **Stage 4 (Bizs) / Stage 3 (Techs) 中断**：重新运行聚合阶段（单任务，成本低）

### 9.2 stage-status.json 实时写入机制

**关键调整**：`stage2-status.json` 和 `stage3-status.json` 改为**实时增量写入**，而非等整个 Stage 完成后才生成。

**写入时机**：
- Stage 开始时：生成文件框架，所有 Worker 状态设为 `pending`
- **每个 Worker 完成时**：立即更新该 Worker 的状态为 `completed` 并写入文件
- Stage 全部完成时：更新顶层 `completed_at` 字段

**调整后的 stage2-status.json 结构**：
```json
{
  "pipeline": "bizs",
  "stage": 2,
  "sync_mode": "full",
  "source_commit": "def5678",
  "language": "zh",
  "started_at": "2024-03-21T14:30:22Z",
  "last_updated_at": "2024-03-21T14:38:44Z",
  "completed_at": null,
  "total_modules": 18,
  "completed": 5,
  "failed": 0,
  "platforms": [
    {
      "platform_type": "web/vue",
      "platform_name": "管理后台 Web（Vue3）",
      "modules": [
        {
          "module_name": "system",
          "status": "completed",
          "completed_at": "2024-03-21T14:32:10Z",
          "features_count": 18,
          "output_path": "speccrew-workspace/knowledges/bizs/web-vue/system/"
        },
        {
          "module_name": "infra",
          "status": "in_progress",
          "started_at": "2024-03-21T14:38:44Z",
          "completed_at": null,
          "features_count": null,
          "output_path": "speccrew-workspace/knowledges/bizs/web-vue/infra/"
        },
        {
          "module_name": "bpm",
          "status": "pending",
          "output_path": "speccrew-workspace/knowledges/bizs/web-vue/bpm/"
        }
      ]
    }
  ]
}
```

**Worker 状态说明**：

| 状态 | 含义 | 恢复策略 |
|------|------|----------|
| `pending` | 尚未开始 | 正常派发 Worker |
| `in_progress` | 已派发但未完成 | **重新派发**（可能中断时未完成） |
| `completed` | 已完成 | **跳过**，不重复执行 |
| `failed` | 执行失败 | 根据重试策略处理 |

### 9.3 Dispatcher 恢复逻辑

**执行主体**：Leader Agent（speccrew-knowledge-dispatch）

**输入参数**：
- `pipeline_type`: "bizs" 或 "techs"
- `sync_mode`: "full" 或 "incremental"
- `source_commit`: 当前 HEAD commit（由调用方传入）

**Stage 2 恢复流程**：

```
Step 1: 检查 stage2-status.json 是否存在
  - 文件路径: "speccrew-workspace/knowledges/base/sync-state/knowledge-{bizs|techs}/stage2-status.json"
  - IF 文件不存在 → 跳转到 Step 6 (全新执行)
  - IF 文件存在 → 读取 JSON 内容，继续 Step 2

Step 2: 一致性校验
  - 检查 stage2-status.json 中的 source_commit 是否等于传入的 source_commit
    - IF 不匹配 → 输出警告: "源代码已变更，建议重新运行 Stage 1"
      - 等待用户确认: [重新全量执行 / 强制继续恢复]
  - 检查 stage2-status.json 中的 sync_mode 是否等于传入的 sync_mode
    - IF 不匹配 → 输出提示: "同步模式变更，按当前模式重新执行"
      - 跳转到 Step 6 (全新执行)

Step 3: 判断 Stage 2 整体完成状态
  - 检查 stage2-status.json 中的 completed_at 字段
    - IF completed_at 有值（非 null）→ Stage 2 已完成
      - 输出: "Stage 2 已完成，跳过进入 Stage 3"
      - 跳转到 Stage 3 执行流程
    - IF completed_at 为 null → Stage 2 未完成，进入 Step 4

Step 4: Worker 级恢复（遍历所有模块）
  - 遍历 stage2-status.json 中的 platforms[].modules[]
  - 对于每个模块，检查其 status 字段:
    
    CASE status = "completed":
      - 输出: "模块 {platform}/{module} 已完成，跳过"
      - 不派发 Worker
    
    CASE status = "in_progress":
      - 输出: "模块 {platform}/{module} 上次中断，重新派发 Worker"
      - 调用 speccrew-task-worker 执行 speccrew-knowledge-module-analyze
      - Worker 完成后，更新该模块 status 为 "completed"
      - 立即写入 stage2-status.json（实时更新）
    
    CASE status = "pending":
      - 输出: "模块 {platform}/{module} 待执行，派发 Worker"
      - 调用 speccrew-task-worker 执行 speccrew-knowledge-module-analyze
      - Worker 完成后，更新该模块 status 为 "completed"
      - 立即写入 stage2-status.json（实时更新）
    
    CASE status = "failed":
      - 根据重试策略处理（如：重试3次后仍失败则跳过，记录错误）

Step 5: Stage 2 收尾
  - 等待所有 Worker 完成
  - 更新 stage2-status.json:
    - completed_at = 当前时间
    - completed = 已完成模块数
  - 进入 Stage 3 执行流程

Step 6: 全新执行 Stage 2（无恢复文件或用户选择重新执行）
  - 从 modules.json 读取所有模块列表
  - 初始化 stage2-status.json:
    - 所有模块 status = "pending"
    - completed_at = null
    - started_at = 当前时间
  - 跳转到 Step 4（按 pending 状态派发所有 Worker）
```

**关键文件操作**：

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 读取 | `sync-state/knowledge-bizs/stage2-status.json` | 判断是否需要恢复 |
| 写入 | `sync-state/knowledge-bizs/stage2-status.json` | 每个 Worker 完成后立即更新 |
| 读取 | `sync-state/knowledge-bizs/modules.json` | 获取模块列表（全新执行时） |
| 读取 | `sync-state/knowledge-techs/techs-manifest.json` | Techs Pipeline 恢复时 |

### 9.4 跨 Stage 依赖处理

**Stage 3 启动前的前置检查流程**：

```
Step 1: 检查 Stage 2 是否完成
  - 读取文件: "sync-state/knowledge-bizs/stage2-status.json"
  - 检查字段: completed_at
    - IF completed_at 有值（非 null）→ Stage 2 已完成，继续 Step 2
    - IF completed_at 为 null → Stage 2 未完成
      - 输出: "Stage 2 未完成，先恢复 Stage 2"
      - 跳转到 Stage 2 恢复流程（9.3 节）

Step 2: 检查 Stage 3 恢复文件
  - 读取文件: "sync-state/knowledge-bizs/stage3-status.json"
    - IF 文件不存在 → 全新执行 Stage 3（跳转到 Step 4）
    - IF 文件存在 → 继续 Step 3

Step 3: Stage 3 恢复判断
  - 检查 stage3-status.json 中的 completed_at
    - IF completed_at 有值 → Stage 3 已完成
      - 输出: "Stage 3 已完成，跳过进入 Stage 4"
      - 跳转到 Stage 4 执行流程
    - IF completed_at 为 null → Stage 3 未完成，进入 Step 4

Step 4: 执行 Stage 3（全新或恢复）
  - IF 恢复模式（stage3-status.json 存在）:
    - 遍历 modules，按 status 派发 Worker:
      - "completed" → 跳过
      - "in_progress" / "pending" → 派发 speccrew-knowledge-module-summarize
  - IF 全新执行:
    - 从 stage2-status.json 获取所有 completed 的模块
    - 初始化 stage3-status.json（所有 status = "pending"）
    - 为所有模块派发 Worker

Step 5: Worker 完成处理
  - 每个 Worker 完成后:
    - 更新对应模块 status 为 "completed"
    - 立即写入 stage3-status.json

Step 6: Stage 3 收尾
  - 所有 Worker 完成后:
    - 更新 stage3-status.json: completed_at = 当前时间
    - 进入 Stage 4 执行流程
```

**关键原则**：
- Stage N 的恢复**必须**确认 Stage N-1 的 `completed_at` 已设置
- 防止因前一阶段未完成导致数据不一致
- 各 Pipeline（Bizs/Techs）独立检查，互不影响

### 9.5 文件清单与恢复能力

| 文件 | 支持恢复 | 恢复策略 |
|------|----------|----------|
| `modules.json` | ❌ | Stage 1 重新运行 |
| `techs-manifest.json` | ❌ | Stage 1 重新运行 |
| `stage2-status.json` | ✅ | 实时写入，Worker 级恢复 |
| `stage3-status.json` | ✅ | 实时写入，Worker 级恢复 |
| `final-report.json` | ❌ | 最终阶段，重新生成 |

---

## 10. 实施阶段

### Phase 1: MVP（基础增量同步）

- [ ] Git diff 检测实现
- [ ] 文件到模块的映射算法
- [ ] 增量 Stage 2/3 调度逻辑
- [ ] 基础同步报告生成
- [ ] **stage-status.json 实时写入机制**
- [ ] **Stage 2/3 中断恢复逻辑**

### Phase 2: 增强功能

- [ ] 跨模块依赖追踪
- [ ] 人工编辑检测与冲突处理
- [ ] Techs 联动更新
- [ ] 性能优化（缓存、并行）
- [ ] **source_commit 一致性校验**
- [ ] **跨 Stage 恢复依赖检查**

### Phase 3: 高级特性

- [ ] 智能合并建议
- [ ] 变更影响分析
- [ ] 历史版本对比
- [ ] 自动化测试集成

---

## 11. 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| Bizs Pipeline | `bizs-knowledge-pipeline.md` | 业务知识生成流程 |
| Techs Pipeline | `techs-knowledge-pipeline.md` | 技术知识生成流程 |
| Agent 知识地图 | `agent-knowledge-map.md` | Agent 知识需求映射 |

---

## 12. 维护日志

| Date | Changes | Owner |
|------|---------|-------|
| 2024-03-21 | 初始版本，定义增量同步完整方案 | - |
| 2025-03 | 对齐 bizs/techs pipeline 最新实现：更新技能名称、状态文件路径、modules.json 结构（含 platforms 层级）、Techs 改为 3 Stage 架构 | - |
| 2025-03 | 新增中断恢复机制：stage-status.json 实时写入、Worker 级恢复、source_commit 一致性校验 | - |
