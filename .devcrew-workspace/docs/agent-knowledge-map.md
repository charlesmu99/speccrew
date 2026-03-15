# Agent 知识地图

> 本文档定义各 Agent 在执行任务时所需的**输入知识**和**产出内容**，遵循"确定性"和"按需加载"两大原则。
>
> - **确定性**：每个 Agent 知道去哪里读什么，路径明确，不依赖遍历或猜测
> - **按需加载**：只加载当前任务必需的内容，不预读全量文档

---

## 知识来源总览

Agent 的知识来源分为三层：

| 层级 | 目录 | 内容 | 更新频率 |
|------|------|------|----------|
| **L1 系统知识** | `.devcrew-workspace/knowledge/` | 当前系统的架构、业务功能、开发规范 | 随系统演进低频更新 |
| **L2 领域知识** | `.devcrew-workspace/knowledge/domain/` | 行业标准、业务术语、QA 经验 | 不定期补充 |
| **L3 迭代产出物** | `.devcrew-workspace/projects/pXXX/` | 当前迭代的 PRD、Solution、设计文档 | 每次迭代产出 |

---

## 各 Agent 知识地图

### PM Agent（产品经理）

**职责**：通过多轮对话挖掘真实需求，输出结构化 PRD

#### 输入知识

| 知识类型 | 路径 | 加载时机 | 用途 |
|----------|------|----------|------|
| 系统业务功能概览 | `knowledge/bizs/modules/` | 必须，首先加载 | 了解现有功能，避免重复建设 |
| 核心业务流程 | `knowledge/bizs/flows/` | 按需加载 | 新需求与现有流程的衔接点 |
| 行业知识与规范 | `knowledge/domain/standards/` | 按需加载 | 需求合理性判断 |
| 业务术语表 | `knowledge/domain/glossary/` | 按需加载 | 统一术语，避免歧义 |
| 常见问题解答 | `knowledge/domain/qa/` | 按需加载 | 识别已知问题，不重蹈覆辙 |
| 用户原始需求 | 对话输入 | 实时获取 | 核心输入 |

#### 加载策略

```
1. 必加载：knowledge/bizs/modules/ → 了解系统现有功能全貌
2. 按需加载：根据需求涉及的业务域，选择对应的 flows/ 文件
3. 按需加载：当需求涉及行业规范时，查阅 domain/standards/
4. 不加载：系统架构、技术细节（PM 不需要）
```

#### 产出物

| 产出物 | 路径 | 格式 | 说明 |
|--------|------|------|------|
| PRD 文档 | `projects/pXXX/01.prds/[功能名]-prd.md` | 按模板 | 经用户确认后方可流转 |

---

### Solution Agent（方案规划）

**职责**：基于 PRD 输出整体技术方案，保持全链路视角

#### 输入知识

| 知识类型 | 路径 | 加载时机 | 用途 |
|----------|------|----------|------|
| PRD 文档 | `projects/pXXX/01.prds/[功能名]-prd.md` | 必须，首先加载 | 核心输入 |
| 系统架构总览 | `knowledge/architecture/system/` | 必须加载 | 了解整体技术边界 |
| 业务功能模块清单 | `knowledge/bizs/modules/` | 必须加载 | 识别可复用功能 |
| 核心业务流程 | `knowledge/bizs/flows/` | 必须加载 | 设计时序图的依据 |
| 数据架构 | `knowledge/architecture/data/` | 按需加载 | 涉及数据库设计时 |
| 前端架构概览 | `knowledge/architecture/frontend/` | 按需加载 | 涉及前端页面设计时 |
| 后端架构概览 | `knowledge/architecture/backend/` | 按需加载 | 涉及后端接口设计时 |

#### 加载策略

```
1. 必加载：PRD + 系统架构总览 + 业务功能模块
2. 按需加载：根据需求类型选择：
   - 涉及数据库变更 → 加载 architecture/data/
   - 涉及前端页面 → 加载 architecture/frontend/
   - 涉及后端接口 → 加载 architecture/backend/
3. 不加载：开发规范、测试规范（Solution 不涉及实现细节）
```

#### 产出物

| 产出物 | 路径 | 格式 | 说明 |
|--------|------|------|------|
| Solution 文档 | `projects/pXXX/02.solutions/[功能名]-solution.md` | 按模板（含 Mermaid 时序图/ER图） | 经用户确认后方可流转 |
| 接口契约文档 | `projects/pXXX/02.solutions/[功能名]-api-contract.md` | 结构化表格 | 前后端共同边界，设计/开发阶段只引用不修改 |

---

### 设计 Agent（前端/后端）

**职责**：基于 Solution 输出伪代码级详细设计

#### 输入知识

| 知识类型 | 路径 | 加载时机 | 用途 |
|----------|------|----------|------|
| Solution 文档 | `projects/pXXX/02.solutions/[功能名]-solution.md` | 必须，首先加载 | 核心输入 |
| 前端架构详情 | `knowledge/architecture/frontend/` | 前端设计必须 | 组件规范、状态管理约定 |
| 后端架构详情 | `knowledge/architecture/backend/` | 后端设计必须 | 服务分层规范、依赖注入约定 |
| 数据架构详情 | `knowledge/architecture/data/` | 按需加载 | 涉及数据库操作时 |
| 开发规范 | `knowledge/architecture/conventions/` | 必须加载 | 命名规范、目录约定、代码风格 |
| 同类已实现模块 | `knowledge/bizs/modules/` | 按需加载 | 参考现有实现方式，保持一致 |

#### 加载策略

```
前端设计 Agent：
1. 必加载：Solution + 前端架构详情 + 开发规范（前端部分）
2. 按需加载：参考同类组件的已有实现

后端设计 Agent：
1. 必加载：Solution + 后端架构详情 + 开发规范（后端部分）
2. 按需加载：涉及数据库时加载 architecture/data/
```

#### 产出物

| 产出物 | 路径 | 格式 | 说明 |
|--------|------|------|------|
| 前端详细设计 | `projects/pXXX/03.designs/frontend/[功能名]-design.md` | 按模板 | 伪代码级，不含实际代码 |
| 后端详细设计 | `projects/pXXX/03.designs/backend/[功能名]-design.md` | 按模板 | 伪代码级，不含实际代码 |

> 接口契约文档由 Solution Agent 输出，路径为 `02.solutions/[功能名]-api-contract.md`，设计阶段**只读引用，不修改**。如发现契约需要变更，回溯至 Solution Agent 修正。

---

### 开发 Agent（前端/后端）

**职责**：基于详细设计实现功能代码并编写单元测试

#### 输入知识

| 知识类型 | 路径 | 加载时机 | 用途 |
|----------|------|----------|------|
| 前端/后端详细设计 | `projects/pXXX/03.designs/[端]/[功能名]-design.md` | 必须，首先加载 | 核心输入 |
| 开发规范 | `knowledge/architecture/conventions/` | 必须加载 | 代码规范、提交规范 |
| 前端/后端架构详情 | `knowledge/architecture/[端]/` | 按需加载 | 设计文档有歧义时参考 |
| 单元测试规范 | `knowledge/architecture/conventions/testing.md` | 必须加载 | 测试编写规范 |

#### 加载策略

```
1. 必加载：详细设计文档 + 开发规范 + 测试规范
2. 按需加载：设计文档有歧义时，加载架构详情补充理解
3. 不加载：PRD、Solution（已由设计文档提炼，避免上下文膨胀）
4. 发现歧义时：不自行假设，必须回溯到设计 Agent 修正
```

#### 产出物

| 产出物 | 路径 | 说明 |
|--------|------|------|
| 功能代码 | 源码仓库对应目录 | 按架构规范组织 |
| 单元测试代码 | 源码仓库 test 目录 | 与功能代码同步提交 |
| 开发任务记录 | `projects/pXXX/04.tasks/[端]/[功能名]-tasks.md` | 记录完成情况和遗留问题 |

---

### 测试 Agent（前端/后端）

**职责**：基于设计文档和代码生成测试用例，执行测试，输出报告

#### 输入知识

| 知识类型 | 路径 | 加载时机 | 用途 |
|----------|------|----------|------|
| 前端/后端详细设计 | `projects/pXXX/03.designs/[端]/[功能名]-design.md` | 必须，首先加载 | 生成测试用例的依据 |
| Solution 文档 | `projects/pXXX/02.solutions/[功能名]-solution.md` | 必须加载 | 验收测试用例的依据 |
| 测试规范 | `knowledge/architecture/conventions/testing.md` | 必须加载 | 测试用例格式、覆盖率要求 |
| PRD 文档 | `projects/pXXX/01.prds/[功能名]-prd.md` | 按需加载 | 验收标准有争议时溯源 |

#### 加载策略

```
1. 必加载：详细设计 + Solution + 测试规范
2. 按需加载：验收标准有歧义时，加载 PRD 溯源
3. 不加载：架构文档、开发规范（测试不关注实现方式）
```

#### 产出物

| 产出物 | 路径 | 格式 | 说明 |
|--------|------|------|------|
| 测试用例文档 | `projects/pXXX/05.tests/cases/[功能名]-test-cases.md` | 按模板 | 含验收测试和单元测试 |
| 测试报告 | `projects/pXXX/05.tests/reports/[功能名]-test-report.md` | 结构化报告 | 含通过率、失败详情 |

---

## 知识流转全景图

```
knowledge/                          projects/pXXX/
├── bizs/modules/     ──────┐       ├── 01.prds/          ←── PM Agent 输出
├── bizs/flows/       ──────┤       │                          (经用户确认)
├── domain/standards/ ──────┤       │                              ↓
├── domain/glossary/  ──────┘       ├── 02.solutions/     ←── Solution Agent 输出
│                    PM Agent ──────┘   (经用户确认)
│                                           ↓
├── architecture/system/   ─────────── Solution Agent
├── architecture/frontend/ ───┐
├── architecture/backend/  ───┤       ├── 03.designs/
├── architecture/data/     ───┤       │   ├── frontend/   ←── 前端设计 Agent 输出
├── architecture/conventions/ ┘       │   └── backend/    ←── 后端设计 Agent 输出
│                  设计 Agent ─────────┘           ↓
│                                           ├── 04.tasks/
│                                           │   ├── frontend/ ←── 前端开发 Agent 输出
├── architecture/conventions/ ─────────────┘   └── backend/  ←── 后端开发 Agent 输出
│                  开发 Agent                              ↓
│                                           └── 05.tests/
└── architecture/conventions/testing.md        ├── cases/    ←── 测试 Agent 输出
                   测试 Agent ────────────────── └── reports/
```

---

## 回溯机制

当下游发现问题，按以下路径回溯修正：

```
测试失败
  └→ 开发 Agent 修复代码
       └→ 若是设计问题 → 设计 Agent 修正详细设计
            └→ 若是方案问题 → Solution Agent 修正 Solution
                 └→ 若是需求问题 → PM Agent + 用户确认
```

**原则**：不自行假设，不跳级修改，必须向上追溯到问题根源。

---

## 人工确认节点

| 节点 | 触发条件 | 说明 |
|------|----------|------|
| PRD 确认 | PM Agent 完成 PRD 草稿 | 用户确认需求边界无误后，方可启动 Solution 阶段 |
| Solution 确认 | Solution Agent 完成方案 | 用户确认整体方案（UI/接口/数据模型）无误后，方可启动设计阶段 |
| 详细设计确认 | 设计 Agent 完成前端/后端详细设计 | 用户确认设计方案无误后，方可启动开发阶段 |
| 上线确认 | 测试 Agent 完成测试报告 | 用户确认测试通过、无遗留缺陷后，方可上线 |
