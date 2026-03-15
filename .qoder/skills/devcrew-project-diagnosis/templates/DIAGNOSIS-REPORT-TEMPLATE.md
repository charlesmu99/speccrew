# 项目诊断报告

生成时间：{{生成时间}}

## 1. 项目基本信息

| 项目 | 内容 |
|------|------|
| 项目名称 | {{项目名称}} |
| 项目类型 | {{Web全栈/纯前端/纯后端/桌面客户端/移动端/命令行工具/混合型}} |
| 判定依据 | {{判定依据}} |

## 2. 技术栈清单

### 2.1 运行时与语言
- 语言：{{语言及版本}}
- 运行时：{{运行时环境}}

### 2.2 核心框架
- 前端：{{前端框架及版本}}
- 后端：{{后端框架及版本}}
- 数据库：{{数据库类型}}

### 2.3 工具链
- 构建：{{构建工具}}
- 包管理：{{包管理器}}
- 测试：{{测试框架}}

## 3. 项目目录结构约定

被诊断项目的源代码目录结构：

```
{{项目根目录结构}}
```

## 4. 开发规范

- 代码检查：{{代码检查工具及配置}}
- 命名风格：{{命名约定}}
- 提交规范：{{提交规范}}

## 5. 后续工作建议

基于诊断结果，建议创建以下内容：

### 5.1 建议生成的 Agent

根据项目类型 `{{项目类型}}`，建议生成以下 Agent：

| Agent | 职责 |
|-------|------|
| devcrew-pm | 产品需求文档撰写 |
| devcrew-planner | 技术方案规划 |
| devcrew-designer-[技术栈] | 详细设计（前端/后端按技术栈分） |
| devcrew-dev-[技术栈] | 开发实现 |
| devcrew-test-[技术栈] | 测试验证 |

### 5.2 建议创建的 .devcrew-workspace 目录结构

基于项目类型和诊断结果，建议创建以下目录结构：

```
.devcrew-workspace/
├── diagnosis-reports/          # 诊断报告
│   └── diagnosis-report-{日期}.md
├── docs/                       # 管理性文档
│   ├── README.md
│   └── AGENTS.md
├── knowledge/                  # 项目知识库
│   ├── README.md
│   ├── constitution.md
│   ├── architecture/           # 架构文档（根据项目类型创建子目录）
│   │   ├── system/             # 系统整体架构
│   │   ├── conventions/        # 开发规范
│   │   {{#if 含前端}}├── frontend/           # 前端架构{{/if}}
│   │   {{#if 含后端}}├── backend/            # 后端架构{{/if}}
│   │   {{#if 含数据库}}├── data/               # 数据架构{{/if}}
│   │   {{#if 桌面客户端}}├── desktop/            # 桌面端架构{{/if}}
│   │   {{#if 移动端}}└── mobile/             # 移动端架构{{/if}}
│   ├── bizs/                   # 业务知识（初建空文件夹，内容后续沉淀）
│   │   ├── modules/            # 业务模块：{{检测到的模块名列表}}
│   │   └── flows/              # 业务流程：待PM Agent梳理
│   └── domain/                 # 领域知识（初建空文件夹，内容后续沉淀）
│       ├── standards/
│       ├── glossary/
│       └── qa/
└── projects/                   # 迭代项目
    └── archive/                # 归档目录
```

**architecture/ 子目录说明**：
根据项目类型 `[{{项目类型}}]`，建议创建以下 architecture 子目录：

| 项目类型 | 建议创建的子目录 |
|----------|------------------|
| Web全栈 | system, conventions, frontend, backend, data |
| 纯前端 | system, conventions, frontend |
| 纯后端 | system, conventions, backend, data |
| 桌面客户端 | system, conventions, desktop |
| 移动端 | system, conventions, mobile |
| 混合型 | 根据实际包含的端组合创建 |

**bizs/modules/ 初识线索**：
从代码结构中检测到的潜在业务模块（仅作为初稿，需PM Agent确认）：
- {{从路由/目录分析出的模块1}}
- {{从路由/目录分析出的模块2}}
- ...

### 5.3 待深度识别的内容

以下需在 Agent 使用过程中逐步沉淀：
- **业务域**：由 PM Agent 在 PRD 阶段梳理
- **重复操作模式**：由 Dev Agent 在开发过程中识别并沉淀为 Skill
