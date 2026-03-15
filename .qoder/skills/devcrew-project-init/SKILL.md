---
name: devcrew-project-init
description: 初始化项目AI协作体系。分析项目结构、诊断技术栈、识别重复操作模式和业务域，生成完整的AI协作基础设施（诊断报告、Agent、Skill、模板）。触发场景：新项目首次接入AI工程化、需要生成或更新AI协作体系文件。
tools: Read, Write, Glob, Grep, List, Search
---

# 触发场景

- 新项目首次接入 AI 工程化流程
- 需要生成或更新 AI 协作基础设施
- 用户说"初始化项目"、"创建AI协作体系"、"生成Agent"

# 工作流程

## 阶段一：项目探索（并行读取）

同时读取以下内容：

1. **根目录关键文件**：`README.md`、`AGENTS.md`、`CLAUDE.md`
2. **项目配置文件**（按存在情况）：`pyproject.toml`、`package.json`、`Cargo.toml`、`*.csproj`、`docker-compose.yml`、`.env.template`
3. **根目录结构**（一层）：识别主要子目录用途
4. **主要子目录结构**（二层）：了解代码组织方式
5. **现有 `.qoder/` 目录**：避免覆盖已有配置

## 阶段二：项目类型判断

基于读取结果判断项目类型：

| 项目类型 | 判断依据 |
|----------|----------|
| **Web 全栈** | 同时存在前端（Vue/React/Angular）和后端（FastAPI/Express/Spring）目录 |
| **纯前端** | 只有前端框架，无独立后端服务 |
| **纯后端/服务** | 无前端目录，只有服务端代码 |
| **桌面客户端** | 存在 Electron/Tauri/WPF/Qt 特征文件 |
| **移动端** | 存在 Android/iOS/Flutter/React Native 特征文件 |
| **命令行工具** | 存在 CLI 入口且无 UI 目录 |
| **混合型** | 包含上述多种类型的 monorepo |

## 阶段三：深度分析

**所有项目类型通用：**
- 数据库/存储相关文件（Model定义、Schema、迁移脚本）
- 测试目录结构和配置
- CI/CD 配置文件（`.github/workflows/`、`Makefile`）
- 代码规范配置（`.eslintrc`、`ruff.toml`）

**按项目类型额外读取：**
- Web 全栈：前端路由、后端路由/Controller、API定义目录
- 桌面客户端：主进程入口、IPC通信定义、打包配置
- 移动端：路由配置、平台特定目录
- 纯后端：服务入口、中间件目录

## 阶段四：诊断分析

识别以下内容：

**技术栈清单**
- 运行时/语言版本、核心框架、数据库/存储
- 构建/打包工具、测试框架、基础设施

**重复操作模式**（候选 Skill）
- Web 全栈：新增页面、新增 API、新增数据库表
- 桌面客户端：新增窗口、新增 IPC 通道
- 移动端：新增页面、新增本地存储
- 纯后端：新增接口模块、新增定时任务

**业务域识别**（候选 Agent）
- 项目涵盖的主要业务模块
- 各端的技术边界

**开发规范识别**
- 命名约定、目录约定、代码风格规则

## 阶段五：生成基础设施

调用 `devcrew-create-se-infrastructure` Skill 生成 Agent、Skill 和模板文件。

### 前置准备

在执行前，确保已从诊断分析中整理出以下信息：
- **项目类型**（Web全栈 / 纯前端 / 纯后端 / 桌面客户端 / 移动端 / 命令行工具 / 混合型）
- 实际使用的技术栈（语言版本、核心框架、数据库）
- 目录约定（各类文件的实际存放路径）
- 重复操作模式清单（候选 Skill）
- 代码规范（lint 工具、命名约定、运行命令）

### 执行流程

1. **生成诊断报告**
   生成 `.qoder/diagnosis.md`：
   - 项目类型及判断依据
   - 技术栈清单
   - 重复操作模式及 Skill 计划
   - 业务域及 Agent 计划
   - 完整生成清单

2. **更新项目宪章**
   在 `AGENTS.md` 追加 **AI 工程化协作规范** 章节

3. **调用 `devcrew-create-se-infrastructure` Skill**
   
   将诊断结果传递给 `devcrew-create-se-infrastructure`，由其执行：
   - 复制通用 Agent 模板（pm-agent, solution-agent）
   - 根据项目类型生成特定的设计/开发/测试 Agent
   - 根据重复操作模式生成项目级 Skill
   - 复制产出物模板到 `.qoder/templates/`
   
   | 项目类型 | 生成的 Agent |
   |----------|-------------|
   | Web 全栈 | devcrew-designer-frontend, devcrew-designer-backend, devcrew-dev-[frontend-framework], devcrew-dev-[backend-framework], devcrew-test-[frontend-framework], devcrew-test-[backend-framework] |
   | 纯前端 | devcrew-designer-frontend, devcrew-dev-[framework], devcrew-test-[framework] |
   | 纯后端 | devcrew-designer-backend, devcrew-dev-[framework], devcrew-test-[framework] |
   | 桌面客户端 | devcrew-designer-frontend, devcrew-dev-[framework], devcrew-test-[framework] |
   | 移动端 | devcrew-designer-frontend, devcrew-dev-[framework], devcrew-test-[framework] |

4. **生成 Worker Agent**（按需创建）
   - `context-builder`：读取大量源码输出摘要
   - `file-scaffolder`：批量生成文件
   - `doc-writer`：生成大体量文档

## 阶段五（补充）：自动归档机制说明

项目迭代完成后，由 amu-agent 自动执行归档：

### 归档触发条件
- 迭代测试通过且用户确认上线
- 用户明确说"归档当前迭代"

### 归档流程
1. **移动项目文件夹**：将 `projects/pXXX-[迭代名]/` 移动至 `projects/archive/`
2. **重命名**：按格式 `pXXX-[迭代名]-archived-[YYYY-MM-DD]` 重命名
3. **更新索引**：在 `projects/archive/README.md` 中记录归档信息

### 归档命名规范
```
p[编号]-[迭代名]-archived-[YYYY-MM-DD]

示例：
- p001-user-auth-archived-2026-03-14
- p002-kb-batch-upload-archived-2026-03-20
```

### 归档后清理
- 可选：压缩归档文件夹以节省空间

## 阶段六：初始化 `.devcrew-workspace/` 目录结构

**核心原则：上下文隔离，顺序执行**

每个子目录单独处理，处理完一个后清空上下文再处理下一个，避免上下文膨胀。

### 6.1 创建 projects/ 目录结构

创建 `.devcrew-workspace/projects/` 目录：
```
projects/
└── archive/                  # 归档项目目录（初始为空）
    └── tech-debt/            # 已处理的技术债归档
```

**说明**：
- `archive/` 用于存放已完成迭代的归档项目
- `archive/tech-debt/` 用于存放已处理完成的技术债记录
- 迭代项目目录 `pXXX-[迭代名]/` 由各 Agent 在需要时创建

### 6.2 准备 knowledge/ 目录结构（按项目类型动态创建）

根据**阶段二**判断的项目类型，动态创建对应的目录结构：

**通用目录（所有项目类型）：**
```
knowledge/
├── architecture/
│   ├── system/          # 系统整体架构（必建）
│   └── conventions/     # 开发规范（必建）
├── bizs/
│   ├── modules/         # 业务模块（必建）
│   └── flows/           # 业务流程（必建）
└── domain/
    ├── standards/
    ├── glossary/
    └── qa/
```

**按项目类型可选目录：**

| 项目类型 | 额外创建的 architecture/ 子目录 |
|----------|--------------------------------|
| Web 全栈 | `frontend/`、`backend/`、`data/` |
| 纯前端 | `frontend/` |
| 纯后端/API | `backend/`、`data/` |
| Electron | `desktop/`（或沿用 `frontend/` 但内容为桌面端架构） |
| WPF/WinUI | `desktop/` |
| 移动端(Android/iOS/Flutter) | `mobile/` |
| 跨平台(含多端) | 根据实际端组合创建对应目录 |

**判断依据：**
- 存在 `package.json` + `web/` 或 `src/` 且有 DOM 操作 → 创建 `frontend/`
- 存在 `pyproject.toml`/`requirements.txt` 或 `server/` → 创建 `backend/`
- 存在数据库配置/Model 文件/迁移脚本 → 创建 `data/`
- 存在 `electron/` 或 `main.js`（Electron 入口）→ 创建 `desktop/`
- 存在 `android/`、`ios/` 或 `flutter/` → 创建 `mobile/`

### 6.3 顺序初始化 knowledge/ 各子目录

**按以下顺序逐个处理，每个子目录独立上下文：**

#### ① knowledge/README.md（所有项目类型）
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/README-TEMPLATE.md`
**输出**：`knowledge/README.md`
**内容**：知识库目录结构说明、各目录用途、更新规则

#### ② knowledge/constitution.md（所有项目类型）
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/CONSTITUTION-TEMPLATE.md`
**输入**：RepoWiki 整体架构章节摘要 + 技术栈信息
**输出**：`knowledge/constitution.md`
**内容**：系统定位、技术栈速览、架构原则、代码规范要点、业务模块速览、知识库导航

#### ③ architecture/system/（所有项目类型）
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/architecture/system/SYSTEM-ARCH-TEMPLATE.md`
**输入**：RepoWiki 整体架构章节 + 根目录配置文件（docker-compose.yml、pyproject.toml 等）
**输出**：`knowledge/architecture/system/system-arch.md`
**内容**：系统定位、技术栈概览、系统分层、核心模块清单、外部依赖、部署架构

#### ④ architecture/frontend/（Web/纯前端项目）
**条件**：项目类型为 Web 全栈 或 纯前端
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/architecture/frontend/FRONTEND-ARCH-TEMPLATE.md`
**输入**：前端目录结构 + 配置文件（package.json、vite.config.js 等）+ RepoWiki 前端章节
**输出**：`knowledge/architecture/frontend/frontend-arch.md`
**内容**：技术栈、目录结构约定、路由规范、状态管理规范、API 调用规范、组件规范、样式规范

#### ④' architecture/desktop/（桌面客户端项目）
**条件**：项目类型为 Electron/WPF/WinUI
**输入**：桌面端目录结构 + 配置文件 + RepoWiki 桌面端章节
**输出**：`knowledge/architecture/desktop/desktop-arch.md`
**内容**：技术栈、主进程/渲染进程架构、IPC 通信规范、窗口管理、打包配置

#### ④'' architecture/mobile/（移动端项目）
**条件**：项目类型为 Android/iOS/Flutter/React Native
**输入**：移动端目录结构 + 配置文件 + RepoWiki 移动端章节
**输出**：`knowledge/architecture/mobile/mobile-arch.md`
**内容**：技术栈、导航规范、状态管理、原生模块调用、打包发布

#### ⑤ architecture/backend/（含后端项目）
**条件**：项目类型为 Web 全栈 或 纯后端
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/architecture/backend/BACKEND-ARCH-TEMPLATE.md`
**输入**：后端目录结构 + 配置文件（pyproject.toml、requirements.txt 等）+ RepoWiki 后端章节
**输出**：`knowledge/architecture/backend/backend-arch.md`
**内容**：技术栈、目录结构约定、分层规范、接口规范、异常处理规范、依赖注入规范、日志规范

#### ⑥ architecture/data/（含数据库项目）
**条件**：检测到数据库配置或 Model 文件
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/architecture/data/DATA-ARCH-TEMPLATE.md`
**输入**：Model 定义文件 + Schema 文件 + 数据库迁移脚本
**输出**：`knowledge/architecture/data/data-arch.md`
**内容**：数据库清单、关系型数据库核心表清单、命名规范、迁移规范、向量数据库配置、其他存储

#### ⑦ architecture/conventions/（所有项目类型）
**模板**：
- `.qoder/skills/devcrew-project-init/templates/knowledge/architecture/conventions/CONVENTIONS-TEMPLATE.md`
- `.qoder/skills/devcrew-project-init/templates/knowledge/architecture/conventions/TESTING-TEMPLATE.md`
**输入**：AGENTS.md + 代码规范配置文件（.eslintrc、ruff.toml 等）+ Makefile
**输出**：
- `knowledge/architecture/conventions/conventions.md`（代码风格、命名规范、提交规范、运行命令）
- `knowledge/architecture/conventions/testing.md`（测试策略、单元测试规范、测试数据规范）

#### ⑧ bizs/modules/
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/bizs/modules/MODULES-TEMPLATE.md`
**输入**：RepoWiki 业务功能章节 + 后端路由文件 + 前端路由文件
**输出**：
- `knowledge/bizs/modules/modules.md`（模块清单表格）
- `knowledge/bizs/modules/[模块名].md`（每个模块的详情文件）

**注意**：此为**初稿**，需人工校验准确性

#### ⑨ bizs/flows/
**模板**：`.qoder/skills/devcrew-project-init/templates/knowledge/bizs/flows/FLOWS-TEMPLATE.md`
**输入**：
1. **优先**：RepoWiki 核心业务流程章节
2. **其次**：从代码中梳理 — 分析前后端路由的调用关系，识别核心业务流程

**输出**：
- `knowledge/bizs/flows/flows.md`（流程清单表格）
- `knowledge/bizs/flows/[流程名].md`（每个流程的详情文件，含 Mermaid 流程图）

**注意**：此为**初稿**，复杂业务逻辑需人工补充

#### ⑩ domain/（所有项目类型）
**模板**：
- `.qoder/skills/devcrew-project-init/templates/knowledge/domain/standards/STANDARDS-TEMPLATE.md`
- `.qoder/skills/devcrew-project-init/templates/knowledge/domain/glossary/GLOSSARY-TEMPLATE.md`
- `.qoder/skills/devcrew-project-init/templates/knowledge/domain/qa/QA-TEMPLATE.md`
**处理方式**：创建框架文件，内容标注为**待人工填写**
- `knowledge/domain/standards/standards.md`：规范清单表格 + "待人工填写" 标注
- `knowledge/domain/glossary/glossary.md`：术语列表表格 + "待人工填写" 标注
- `knowledge/domain/qa/qa.md`：QA 清单表格 + "待人工填写" 标注

# 验证检查

- [ ] `diagnosis.md` 已生成且包含完整信息
- [ ] `AGENTS.md` 已更新协作规范章节
- [ ] Agent 文件已生成（检查 `.qoder/agents/`）
- [ ] Skill 文件已生成（检查 `.qoder/skills/`）
- [ ] 模板文件已生成（检查 `.qoder/templates/`）
- [ ] `.devcrew-workspace/knowledge/` 目录结构已创建（按项目类型动态）
- [ ] `knowledge/architecture/` 下知识主文档已生成（system-arch 和 conventions 必建，其余按项目类型）
- [ ] `knowledge/bizs/modules/` 模块清单已生成（初稿）
- [ ] `knowledge/bizs/flows/` 流程清单已生成（初稿）
- [ ] `knowledge/domain/` 框架已创建（标注待人工填写）
- [ ] 所有生成的文件未覆盖已有文件（存在则跳过）

# 输出摘要格式

```
## 项目初始化完成

### 已生成文件
- `.qoder/diagnosis.md` - 项目诊断报告
- `.qoder/agents/pm-agent.md` - 产品经理 Agent
- ...

### 跳过文件
- `.qoder/agents/solution-agent.md` - 文件已存在

### 建议下一步
1. 校验 `knowledge/bizs/modules/` 中的业务模块清单（初稿需人工确认）
2. 填写 `knowledge/bizs/flows/` 和 `knowledge/domain/` 中的待填内容
3. 使用 `pm-agent` 开始第一个需求
```
