# SpecCrew 快速开始指南

<p align="center">
  <a href="./GETTING-STARTED.md">简体中文</a> |
  <a href="./GETTING-STARTED.en.md">English</a> |
  <a href="./GETTING-STARTED.ja.md">日本語</a> |
  <a href="./GETTING-STARTED.ru.md">Русский</a> |
  <a href="./GETTING-STARTED.es.md">Español</a> |
  <a href="./GETTING-STARTED.de.md">Deutsch</a> |
  <a href="./GETTING-STARTED.fr.md">Français</a> |
  <a href="./GETTING-STARTED.pt-BR.md">Português (Brasil)</a> |
  <a href="./GETTING-STARTED.ar.md">العربية</a> |
  <a href="./GETTING-STARTED.hi.md">हिन्दी</a>
</p>

本文档帮助您快速了解如何使用 SpecCrew 的 Agent 团队，按照标准工程流程逐步完成从需求到交付的完整开发。

---

## 1. 前置准备

### 安装 SpecCrew

```bash
npm install -g speccrew
```

### 初始化项目

```bash
speccrew init --ide qoder
```

支持的 IDE：`qoder`、`cursor`、`claude`、`codex`

### 初始化后的目录结构

```
.
├── .qoder/
│   ├── agents/          # Agent 定义文件
│   └── skills/          # Skill 定义文件
├── speccrew-workspace/  # 工作空间
│   ├── docs/            # 配置、规则、模板、解决方案
│   ├── iterations/      # 当前进行中的迭代
│   ├── iteration-archives/  # 归档的迭代
│   └── knowledges/      # 知识库
│       ├── base/        # 基础信息（诊断报告、技术债务）
│       ├── bizs/        # 业务知识库
│       └── techs/       # 技术知识库
```

### CLI 命令速查

| 命令 | 说明 |
|------|------|
| `speccrew list` | 列出所有可用的 Agent 和 Skill |
| `speccrew doctor` | 检查安装完整性 |
| `speccrew update` | 更新项目配置到最新版本 |
| `speccrew uninstall` | 卸载 SpecCrew |

---

## 2. 安装后5分钟快速开始

执行 `speccrew init` 后，按以下步骤快速进入工作状态：

### 第1步：选择你的 IDE

| IDE | 初始化命令 | 适用场景 |
|-----|-----------|----------|
| **Qoder**（推荐） | `speccrew init --ide qoder` | 完整Agent编排、并行Worker |
| **Cursor** | `speccrew init --ide cursor` | 基于Composer的工作流 |
| **Claude Code** | `speccrew init --ide claude` | CLI优先开发 |
| **Codex** | `speccrew init --ide codex` | OpenAI生态集成 |

### 第2步：初始化知识库（推荐）

对于已有源码的项目，建议先初始化知识库，让Agent理解你的代码库：

```
/speccrew-team-leader 初始化技术知识库
```

然后：

```
/speccrew-team-leader 初始化业务知识库
```

### 第3步：开始你的第一个任务

```
/speccrew-product-manager 我有一个新需求：[描述你的功能需求]
```

> **提示**：如果不确定该做什么，直接说 `/speccrew-team-leader 帮我开始` — Team Leader 会自动检测项目状态并引导你。

---

## 3. 快速决策树

不确定该做什么？找到你的场景：

- **我有新的功能需求**
  → `/speccrew-product-manager 我有一个新需求：[描述你的功能需求]`

- **我想扫描现有项目的知识**
  → `/speccrew-team-leader 初始化技术知识库`
  → 然后：`/speccrew-team-leader 初始化业务知识库`

- **我想继续之前的工作**
  → `/speccrew-team-leader 当前进度是什么？`

- **我想检查系统健康状态**
  → 在终端运行：`speccrew doctor`

- **我不确定该做什么**
  → `/speccrew-team-leader 帮我开始`
  → Team Leader 会自动检测项目状态并引导你

---

## 4. Agent 快速参考

| 角色 | Agent | 职责 | 示例指令 |
|------|-------|------|----------|
| 团队负责人 | `/speccrew-team-leader` | 项目导航、知识库初始化、状态查看 | "帮我开始" |
| 产品经理 | `/speccrew-product-manager` | 需求分析、PRD 生成 | "我有一个新需求：..." |
| 功能设计师 | `/speccrew-feature-designer` | 功能分析、规格设计、API 契约 | "开始迭代X的功能设计" |
| 系统设计师 | `/speccrew-system-designer` | 架构设计、平台详细设计 | "开始迭代X的系统设计" |
| 系统开发者 | `/speccrew-system-developer` | 开发协调、代码生成 | "开始迭代X的开发" |
| 测试经理 | `/speccrew-test-manager` | 测试规划、用例设计、执行 | "开始迭代X的测试" |

> **提示**：你不需要记住所有 Agent。只需与 `/speccrew-team-leader` 对话，它会将你的请求路由到合适的 Agent。

---

## 5. 工作流程总览

### 完整流程图

```mermaid
flowchart LR
    PRD[阶段一<br/>需求分析<br/>Product Manager] --> FD[阶段二<br/>功能设计<br/>Feature Designer]
    FD --> SD[阶段三<br/>系统设计<br/>System Designer]
    SD --> DEV[阶段四<br/>开发实现<br/>System Developer]
    DEV --> DEPLOY[阶段五<br/>部署实施<br/>System Deployer]
    DEPLOY --> TEST[阶段六<br/>系统测试<br/>Test Manager]
    TEST --> ARCHIVE[阶段七<br/>归档]
    
    KB[(知识库<br/>贯穿始终)] -.-> PRD
    KB -.-> FD
    KB -.-> SD
    KB -.-> DEV
    KB -.-> DEPLOY
    KB -.-> TEST
```

### 核心原则

1. **阶段依赖**：每阶段产出物是下一阶段的输入
2. **Checkpoint 确认**：每个阶段都有确认点，需用户确认后才能进入下一阶段
3. **知识库驱动**：知识库贯穿始终，为各阶段提供上下文

---

## 6. 第零步：知识库初始化

在开始正式工程流程前，需要先初始化项目知识库。

### 6.1 技术知识库初始化

**对话示例**：
```
/speccrew-team-leader 初始化技术知识库
```

**三阶段流程**：
1. 平台检测 — 识别项目中的技术平台
2. 技术文档生成 — 为每个平台生成技术规约文档
3. 索引生成 — 建立知识库索引

**产出物**：
```
speccrew-workspace/knowledges/techs/{platform-id}/
├── tech-stack.md          # 技术栈定义
├── architecture.md        # 架构约定
├── dev-spec.md            # 开发规约
├── test-spec.md           # 测试规约
└── INDEX.md               # 索引文件
```

### 6.2 业务知识库初始化

**对话示例**：
```
/speccrew-team-leader 初始化业务知识库
```

**四阶段流程**：
1. 特性清单 — 扫描代码识别所有功能特性
2. 特性分析 — 分析每个特性的业务逻辑
3. 模块总结 — 按模块汇总特性
4. 系统总结 — 生成系统级业务概览

**产出物**：
```
speccrew-workspace/knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

---

## 7. 逐阶段对话指南

### 7.1 阶段一：需求分析（Product Manager）

**如何启动**：
```
/speccrew-product-manager 我有一个新需求：[描述你的需求]
```

**Agent 工作流程**：
1. 读取系统概览了解现有模块
2. 分析用户需求
3. 生成结构化 PRD 文档

**产出物**：
```
iterations/{序号}-{类型}-{名称}/01.product-requirement/
├── [feature-name]-prd.md           # 产品需求文档
└── [feature-name]-bizs-modeling.md # 业务建模（复杂需求时）
```

**确认要点**：
- [ ] 需求描述是否准确反映用户意图
- [ ] 业务规则是否完整
- [ ] 与现有系统的集成点是否明确
- [ ] 验收标准是否可度量

---

### 7.2 阶段二：功能设计（Feature Designer）

**如何启动**：
```
/speccrew-feature-designer 开始功能设计
```

**Agent 工作流程**：
1. 自动定位已确认的 PRD 文档
2. 加载业务知识库
3. 生成功能设计（含 UI 线框图、交互流、数据定义、API 契约）
4. 多 PRD 时通过 Task Worker 并行设计

**产出物**：
```
iterations/{iter}/02.feature-design/
└── [feature-name]-feature-spec.md  # 功能设计文档
```

**确认要点**：
- [ ] 所有用户场景是否都被覆盖
- [ ] 交互流程是否清晰
- [ ] 数据字段定义是否完整
- [ ] 异常处理是否完善

---

### 7.3 阶段三：系统设计（System Designer）

**如何启动**：
```
/speccrew-system-designer 开始系统设计
```

**Agent 工作流程**：
1. 定位 Feature Spec 和 API Contract
2. 加载技术知识库（各端技术栈、架构、规约）
3. **Checkpoint A**：框架评估 — 分析技术差距，推荐新框架（如需要），等待用户确认
4. 生成 DESIGN-OVERVIEW.md
5. 通过 Task Worker 并行分派各端设计（前端/后端/移动端/桌面端）
6. **Checkpoint B**：联合确认 — 展示所有平台设计汇总，等待用户确认

**产出物**：
```
iterations/{iter}/03.system-design/
├── DESIGN-OVERVIEW.md              # 设计概览
├── {platform-id}/
│   ├── INDEX.md                    # 各平台设计索引
│   └── {module}-design.md          # 伪代码级模块设计
```

**确认要点**：
- [ ] 伪代码是否使用了实际框架语法
- [ ] 跨端 API 契约是否一致
- [ ] 错误处理策略是否统一

---

### 7.4 阶段四：开发实现（System Developer）

**如何启动**：
```
/speccrew-system-developer 开始开发
```

**Agent 工作流程**：
1. 读取系统设计文档
2. 加载各端技术知识
3. **Checkpoint A**：环境预检 — 检查运行时版本、依赖、服务可用性，失败时等待用户解决
4. 通过 Task Worker 并行分派各端开发
5. 集成检查：API 契约对齐、数据一致性
6. 输出交付报告

**产出物**：
```
# 源代码写入项目实际源码目录
iterations/{iter}/04.development/
├── {platform-id}/
│   └── tasks/                      # 开发任务记录
└── delivery-report.md
```

**确认要点**：
- [ ] 环境是否就绪
- [ ] 集成问题是否在可接受范围
- [ ] 代码是否符合开发规约

---

### 7.5 阶段五：部署实施（System Deployer）

**如何启动**：

```
/speccrew-system-deployer 开始部署
```

**Agent 工作流程**：
1. 验证开发阶段已完成（Stage Gate）
2. 加载技术知识库（构建配置、数据库迁移配置、服务启动命令）
3. **Checkpoint**：环境预检 — 验证构建工具、运行时版本、依赖可用性
4. 按顺序执行部署技能：构建（Build）→ 数据库迁移（Migrate）→ 服务启动（Startup）→ 烟雾测试（Smoke Test）
5. 输出部署报告

> 💡 **提示**：对于无数据库的项目，迁移步骤会自动跳过；对于客户端应用（桌面/移动端），会使用进程验证模式替代 HTTP 健康检查。

**产出物**：

```
iterations/{iter}/05.deployment/
├── {platform-id}/
│   ├── deployment-plan.md          # 部署计划
│   └── deployment-log.md           # 部署执行日志
└── deployment-report.md            # 部署完成报告
```

**确认要点**：
- [ ] 构建是否成功完成
- [ ] 数据库迁移脚本是否全部执行成功（如适用）
- [ ] 应用是否正常启动并通过健康检查
- [ ] 烟雾测试是否全部通过

---

### 7.6 阶段六：系统测试（Test Manager）

**如何启动**：
```
/speccrew-test-manager 开始测试
```

**三阶段测试流程**：

| 阶段 | 说明 | Checkpoint |
|------|------|------------|
| 测试用例设计 | 基于 PRD 和 Feature Spec 生成测试用例 | A：展示用例覆盖统计和追溯矩阵，等待用户确认覆盖足够 |
| 测试代码生成 | 生成可执行的测试代码 | B：展示生成的测试文件和用例映射，等待用户确认 |
| 测试执行与 Bug 报告 | 自动执行测试，生成报告 | 无（自动执行） |

**产出物**：
```
iterations/{iter}/06.system-test/
├── cases/
│   └── {platform-id}/              # 测试用例文档
├── code/
│   └── {platform-id}/              # 测试代码计划
├── reports/
│   └── test-report-{date}.md       # 测试报告
└── bugs/
    └── BUG-{id}-{title}.md         # Bug 报告（每个 Bug 一个文件）
```

**确认要点**：
- [ ] 用例覆盖是否完整
- [ ] 测试代码是否可运行
- [ ] Bug 严重程度判定是否准确

---

### 7.7 阶段七：归档

迭代完成后自动归档：

```
speccrew-workspace/iteration-archives/
└── {序号}-{类型}-{名称}-{日期}/
    ├── 01.product-requirement/
    ├── 02.feature-design/
    ├── 03.system-design/
    ├── 04.development/
    ├── 05.deployment/
    └── 06.system-test/
```

---

## 8. 知识库说明

### 8.1 业务知识库（bizs）

**作用**：存储项目的业务功能描述、模块划分、API 特征

**目录结构**：
```
knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

**使用场景**：Product Manager、Feature Designer

### 8.2 技术知识库（techs）

**作用**：存储项目的技术栈、架构约定、开发规约、测试规约

**目录结构**：
```
knowledges/techs/{platform-id}/
├── tech-stack.md
├── architecture.md
├── dev-spec.md
├── test-spec.md
└── INDEX.md
```

**使用场景**：System Designer、System Developer、Test Manager

---

## 9. 流水线进度管理

SpecCrew 虚拟团队遵循严格的阶段门控机制，每个阶段必须经过用户确认后才能推进到下一阶段。同时支持断点续传 —— 中断后重新启动时，自动从上次停止的位置继续。

### 9.1 三层进度文件

工作流自动维护三类 JSON 进度文件，位于迭代目录下：

| 文件 | 位置 | 作用 |
|------|------|------|
| `WORKFLOW-PROGRESS.json` | `iterations/{iter}/` | 记录整条流水线各阶段状态 |
| `.checkpoints.json` | 各阶段目录下 | 记录用户确认点（Checkpoint）通过状态 |
| `DISPATCH-PROGRESS.json` | 各阶段目录下 | 记录并行任务（多平台/多模块）的逐项进度 |

### 9.2 阶段状态流转

每个阶段遵循以下状态流转：

```
pending → in_progress → completed → confirmed
```

- **pending**：尚未开始
- **in_progress**：正在执行中
- **completed**：Agent 执行完成，等待用户确认
- **confirmed**：用户通过最终 Checkpoint 确认，下一阶段可以启动

### 9.3 断点续传

当重新启动某个阶段的 Agent 时：

1. **自动检查上游**：验证前一阶段是否已 confirmed，未确认则阻塞并提示
2. **恢复 Checkpoint**：读取 `.checkpoints.json`，跳过已通过的确认点，从上次中断处继续
3. **恢复并行任务**：读取 `DISPATCH-PROGRESS.json`，只重新执行 `pending` 或 `failed` 状态的任务，跳过已 `completed` 的任务

### 9.4 查看当前进度

通过 Team Leader Agent 查看流水线全景状态：

```
/speccrew-team-leader 查看当前迭代进度
```

Team Leader 会读取进度文件并展示类似以下的状态概览：

```
Pipeline Status: i001-user-management
  01 PRD:            ✅ Confirmed
  02 Feature Design: 🔄 In Progress (Checkpoint A passed)
  03 System Design:  ⏳ Pending
  04 Development:    ⏳ Pending
  05 Deployment:     ⏳ Pending
  06 System Test:    ⏳ Pending
```

### 9.5 向下兼容

进度文件机制完全向下兼容 —— 如果进度文件不存在（如旧项目或全新迭代），所有 Agent 将按照原有逻辑正常执行。

---

## 10. 常见问题（FAQ）

### Q1: Agent 不按预期工作怎么办？

1. 运行 `speccrew doctor` 检查安装完整性
2. 确认知识库已初始化
3. 确认当前迭代目录中有上一阶段的产出物

### Q2: 如何跳过某个阶段？

**不建议跳过**，每阶段产出是下阶段输入。

如必须跳过，需手动准备对应阶段的输入文档，并确保格式符合规范。

### Q3: 如何处理多个需求并行？

每个需求创建独立迭代目录：
```
iterations/
├── 001-feature-xxx/
├── 002-feature-yyy/
└── 003-feature-zzz/
```

各迭代完全隔离，互不影响。

### Q4: 如何更新 SpecCrew 版本？

更新分为两步：

```bash
# Step 1: 更新全局 CLI 工具
npm install -g speccrew@latest

# Step 2: 在项目目录中同步 Agents 和 Skills
cd /path/to/your-project
speccrew update
```

- `npm install -g speccrew@latest`：更新 CLI 工具本身（新版本可能包含新的 Agent/Skill 定义、Bug 修复等）
- `speccrew update`：将项目中的 Agent 和 Skill 定义文件同步到最新版本
- `speccrew update --ide cursor`：仅更新指定 IDE 的配置

> **注意**：两步都需要执行。仅执行 `speccrew update` 不会更新 CLI 工具本身；仅执行 `npm install` 不会更新项目中的文件。

### Q5: `speccrew update` 提示有新版本但 `npm install -g speccrew@latest` 安装后仍是旧版本？

这通常是 npm 缓存问题。解决方法：

```bash
# 清除 npm 缓存后重新安装
npm cache clean --force
npm install -g speccrew@latest

# 验证版本
npm list -g speccrew
```

如果仍然不行，尝试指定具体版本号安装：
```bash
npm install -g speccrew@0.5.6
```

### Q6: 如何查看历史迭代？

归档后在 `speccrew-workspace/iteration-archives/` 中查看，按 `{序号}-{类型}-{名称}-{日期}/` 格式组织。

### Q7: 知识库需要定期更新吗？

以下情况需要重新初始化：
- 项目结构发生重大变化
- 技术栈升级或更换
- 新增/删除业务模块

---

## 11. 快速参考

### Agent 启动速查表

| 阶段 | Agent | 启动对话 |
|------|-------|----------|
| 初始化 | Team Leader | `/speccrew-team-leader 初始化技术知识库` |
| 需求分析 | Product Manager | `/speccrew-product-manager 我有一个新需求：[描述]` |
| 功能设计 | Feature Designer | `/speccrew-feature-designer 开始功能设计` |
| 系统设计 | System Designer | `/speccrew-system-designer 开始系统设计` |
| 开发实现 | System Developer | `/speccrew-system-developer 开始开发` |
| 部署实施 | System Deployer | `/speccrew-system-deployer 开始部署` |
| 系统测试 | Test Manager | `/speccrew-test-manager 开始测试` |

### Checkpoint 检查清单

| 阶段 | Checkpoint 数量 | 关键检查项 |
|------|-----------------|------------|
| 需求分析 | 1 | 需求准确性、业务规则完整性、验收标准可度量性 |
| 功能设计 | 1 | 场景覆盖、交互清晰度、数据完整性、异常处理 |
| 系统设计 | 2 | A: 框架评估；B: 伪代码语法、跨端一致性、错误处理 |
| 开发实现 | 1 | A: 环境就绪、集成问题、代码规约 |
| 部署实施 | 1 | 构建成功、迁移完成、服务启动、烟雾测试通过 |
| 系统测试 | 2 | A: 用例覆盖；B: 测试代码可运行性 |

### 产出物路径速查

| 阶段 | 产出目录 | 文件格式 |
|------|----------|----------|
| 需求分析 | `iterations/{iter}/01.product-requirement/` | `[name]-prd.md`, `[name]-bizs-modeling.md` |
| 功能设计 | `iterations/{iter}/02.feature-design/` | `[name]-feature-spec.md` |
| 系统设计 | `iterations/{iter}/03.system-design/` | `DESIGN-OVERVIEW.md`, `{platform}/INDEX.md`, `{platform}/{module}-design.md` |
| 开发实现 | `iterations/{iter}/04.development/` | 源代码 + `delivery-report.md` |
| 部署实施 | `iterations/{iter}/05.deployment/` | `deployment-plan.md`, `deployment-log.md`, `deployment-report.md` |
| 系统测试 | `iterations/{iter}/06.system-test/` | `cases/`, `code/`, `reports/`, `bugs/` |
| 归档 | `iteration-archives/{iter}-{date}/` | 完整迭代副本 |

---

## 下一步

1. 运行 `speccrew init --ide qoder` 初始化您的项目
2. 执行第零步：知识库初始化
3. 按照工作流程逐阶段推进，享受规范驱动的开发体验！
