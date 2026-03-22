# SpecCrew Workspace 目录结构

本文档描述 `SpecCrew-workspace` 工作空间的目录结构和用途。

---

## 目录树概览

```
SpecCrew-workspace/
├── docs/                          # 文档目录
│   ├── rules/                     # 规则配置
│   └── solutions/                 # 解决方案文档
│
├── iterations/                    # 迭代工作目录
│   └── {序号}-{类型}-{名称}/      # 如 001-feature-order
│       ├── 00.docs/               # 原始需求文档
│       ├── 01.prd/                # 产品需求文档
│       ├── 02.solution/           # 解决方案
│       ├── 03.design/             # 设计文档
│       ├── 04.dev/                # 开发阶段
│       ├── 05.test/               # 测试阶段
│       └── 06.delivery/           # 交付阶段
│
├── iteration-archives/            # 迭代归档
│   └── {序号}-{类型}-{名称}-{日期}/  # 如 001-feature-order-20260322
│
└── knowledges/                    # 知识库
    ├── base/                      # 基础/元数据
    │   ├── diagnosis-reports/     # 诊断报告
    │   ├── sync-state/            # 同步状态
    │   └── tech-debts/            # 技术债
    │
    ├── bizs/                      # 业务知识
    │   └── {platform-type}/
    │       └── {module-name}/
    │
    └── techs/                     # 技术知识
        └── {platform-id}/
```

---

## 一级目录说明

| 目录 | 说明 |
|------|------|
| `docs/` | 项目文档，包括规则配置和解决方案文档 |
| `iterations/` | 当前进行中的迭代工作目录 |
| `iteration-archives/` | 已完成的迭代归档 |
| `knowledges/` | 知识库，包括业务知识、技术知识和基础元数据 |

---

## 二级目录详解

### 1. docs/ - 文档目录

```
docs/
├── rules/                         # 规则配置
│   └── mermaid-rule.md            # Mermaid 图表规则
│
└── solutions/                     # 解决方案文档
    ├── agent-knowledge-map.md     # Agent 知识地图
    ├── bizs-knowledge-pipeline.md # 业务知识流水线
    ├── techs-knowledge-pipeline.md# 技术知识流水线
    └── knowledge-incremental-sync-spec.md  # 增量同步规范
```

| 子目录 | 说明 |
|--------|------|
| `rules/` | 代码生成、文档生成等规则配置 |
| `solutions/` | 解决方案级别的规范文档，指导 Agent 行为 |

### 2. iterations/ - 迭代工作目录

```
iterations/
├── 001-feature-order/             # 订单功能迭代
│   ├── 00.docs/                   # 用户需求原始文档
│   ├── 01.prd/                    # 产品需求文档
│   ├── 02.solution/               # 解决方案
│   ├── 03.design/                 # 设计文档
│   ├── 04.dev/                    # 开发阶段
│   ├── 05.test/                   # 测试阶段
│   └── 06.delivery/               # 交付阶段
│
└── 002-bugfix-payment/            # 支付修复迭代（后启动）
    └── ...
```

**迭代阶段说明**：

| 阶段 | 目录 | 说明 |
|------|------|------|
| 原始需求 | `00.docs/` | 用户需求的原始文档，保持原样 |
| PRD | `01.prd/` | 产品需求文档，需求分析和规格说明 |
| 解决方案 | `02.solution/` | 技术方案、API 契约、架构设计 |
| 设计 | `03.design/` | 详细设计、数据库设计、接口设计 |
| 开发 | `04.dev/` | 代码实现、开发日志 |
| 测试 | `05.test/` | 测试用例、测试报告 |
| 交付 | `06.delivery/` | 部署文档、验收报告、交付清单 |
```

**迭代命名规范**：

格式：`{序号}-{类型}-{名称}`

| 组成部分 | 说明 | 示例 |
|----------|------|------|
| 序号 | 三位数字，保证唯一性和排序 | `001`, `002`, `003` |
| 类型 | 迭代类型 | `feature`, `bugfix`, `refactor`, `docs` |
| 名称 | 语义化描述 | `order`, `payment-api`, `user-auth` |

**命名示例**：
- `001-feature-order` - 第一个迭代，新增订单功能
- `002-feature-payment` - 第二个迭代，新增支付功能
- `003-bugfix-checkout` - 第三个迭代，修复结账问题
- `004-refactor-auth` - 第四个迭代，重构认证模块

**设计目标**：
1. **可读性**：看名字即知迭代内容
2. **唯一性**：序号保证不重复
3. **有序性**：按序号排序，可知先后顺序

### 3. iteration-archives/ - 迭代归档

```
iteration-archives/
├── 001-feature-order-20260322/    # 归档时加归档日期
│   └── ...                        # 完整保留迭代内容
│
└── 002-bugfix-payment-20260325/
    └── ...
```

**归档命名规范**：

格式：`{原迭代名}-{归档日期}`

- 原迭代名：保持原有目录名不变
- 归档日期：`YYYYMMDD` 格式

**归档时机**：
- 迭代交付完成并验收通过
- 迭代取消或中止

**示例**：
- `001-feature-order` → `001-feature-order-20260322`
- `002-bugfix-payment` → `002-bugfix-payment-20260325`

### 4. knowledges/ - 知识库

```
knowledges/
├── base/                          # 基础/元数据
│   ├── diagnosis-reports/         # 项目诊断报告
│   │   └── diagnosis-report-{YYYY-MM-DD-HHmm}.md
│   │
│   └── sync-state/                # 知识库同步状态
│       ├── bizs/                  # 业务知识同步状态
│       │   ├── modules.json       # 模块清单
│       │   ├── stage2-status.json # Stage 2 状态
│       │   └── final-report.json  # 最终报告
│       │
│       ├── techs/                 # 技术知识同步状态
│       │   ├── techs-manifest.json# 技术平台清单
│       │   └── ...
│       │
│       ├── conflicts/             # 冲突报告
│       │   └── {module}.conflict.md
│       │
│       └── sync-history/          # 同步历史
│
├── bizs/                          # 业务知识
│   ├── system-overview.md         # 系统整体概览（聚合所有模块）
│   └── {platform-type}/           # web, mobile-flutter, api
│       └── {module-name}/         # 业务模块
│           ├── {name}-overview.md # 模块概览
│           └── features/          # 功能详情
│               └── {feature}.md
│
└── techs/                         # 技术知识
    ├── system-overview.md         # 技术系统整体概览（聚合所有技术平台）
    └── {platform-id}/             # web-react, backend-nestjs
        ├── INDEX.md               # 平台索引
        ├── tech-stack.md          # 技术栈
        ├── architecture.md        # 架构约定
        ├── conventions-design.md  # 设计约定
        ├── conventions-dev.md     # 开发约定
        └── conventions-test.md    # 测试约定
```

#### 4.1 base/ - 基础元数据

| 子目录 | 说明 |
|--------|------|
| `diagnosis-reports/` | 项目诊断报告，按日期时间命名 |
| `sync-state/` | 知识库初始化和增量同步的状态管理 |
| `tech-debts/` | 技术债记录，跨迭代累积管理 |

**技术债管理**：

```
tech-debts/
├── INDEX.md                       # 技术债索引
├── {debt-id}.md                   # 单个技术债详情
└── ...
```

技术债文档命名：`{类型}-{简述}.md`
- 类型：`arch`（架构）、`code`（代码）、`perf`（性能）、`sec`（安全）
- 示例：`arch-auth-refactor.md`、`code-duplicate-payment.md`

技术债生命周期：
1. 迭代中产生 → 记录到 `tech-debts/`
2. 后续迭代偿还 → 更新状态为 `resolved`
3. 定期评审 → 优先级调整

#### 4.2 bizs/ - 业务知识

业务知识按平台类型组织，每个平台下按业务模块组织：

```
bizs/
└── web/                           # Web 平台
    ├── order/                     # 订单模块
    │   ├── order-overview.md
    │   └── features/
    │       ├── create-order.md
    │       └── list-orders.md
    └── payment/                   # 支付模块
        └── ...
```

#### 4.3 techs/ - 技术知识

技术知识按技术平台组织，每个平台包含完整的技术文档：

```
techs/
└── web-react/                     # React Web 平台
    ├── INDEX.md                   # 索引和导航
    ├── tech-stack.md              # 技术栈详情
    ├── architecture.md            # 架构模式和约定
    ├── conventions-design.md      # 设计阶段约定
    ├── conventions-dev.md         # 开发阶段约定
    └── conventions-test.md        # 测试阶段约定
```

---

## 目录职责速查表

| 目录 | 创建时机 | 维护者 | 说明 |
|------|----------|--------|------|
| `docs/rules/` | 安装脚本 | 用户 | 规则配置 |
| `docs/solutions/` | 安装脚本 | SpecCrew | 解决方案文档 |
| `iterations/` | create-workspace | Leader Agent | 迭代工作 |
| `iteration-archives/` | 迭代完成 | Leader Agent | 迭代归档 |
| `knowledges/base/diagnosis-reports/` | project-diagnosis | project-diagnosis | 诊断报告 |
| `knowledges/base/sync-state/` | knowledge-* init | knowledge-* skills | 同步状态 |
| `knowledges/base/tech-debts/` | 迭代过程 | Leader Agent | 技术债 |
| `knowledges/bizs/` | knowledge-module-analyze | knowledge-module-* | 业务知识 |
| `knowledges/techs/` | knowledge-techs-generate | knowledge-techs-* | 技术知识 |

---

## 设计原则

1. **迭代与知识分离**：`iterations/` 存放单次迭代产出，`knowledges/` 存放跨迭代共享知识
2. **元数据集中管理**：诊断报告、同步状态统一放在 `knowledges/base/`
3. **架构知识合并**：架构约定合并到 `techs/{platform}/architecture.md`，减少目录层级
4. **阶段目录有序**：迭代阶段使用数字前缀（00.docs ~ 06.delivery），便于排序和理解
