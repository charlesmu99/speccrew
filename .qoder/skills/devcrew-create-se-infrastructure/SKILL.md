---
name: create-se-infrastructure
description: 基于项目诊断结果，按标准格式批量生成AI软件工程化基础设施文件，包括各角色Agent、项目级Skill和产出物模板，输出到 .qoder/ 目录。在 se-bootstrap Agent 完成诊断分析后调用，或在需要初始化/重建项目AI协作体系时使用。
---

# Create SE Infrastructure

基于诊断分析结果，为项目生成完整的 AI 软件工程化基础设施。

## 附属资源

本 Skill 目录下包含以下预定义文件，可直接复制到目标目录：

**通用 Agent 模板**（`templates/agents/`，所有项目类型均适用）：
- [templates/agents/pm-agent.md](templates/agents/pm-agent.md)：产品经理 Agent
- [templates/agents/solution-agent.md](templates/agents/solution-agent.md)：规划 Agent

**产出物文档模板**（`templates/documents/`，所有项目类型均适用）：
- [templates/documents/prd-template.md](templates/documents/prd-template.md)：PRD 文档模板
- [templates/documents/solution-template.md](templates/documents/solution-template.md)：Solution 文档模板
- [templates/documents/design-template.md](templates/documents/design-template.md)：详细设计文档模板（各端通用结构）
- [templates/documents/test-case-template.md](templates/documents/test-case-template.md)：测试用例文档模板

## 前提条件

执行前确认已从诊断分析中获取：
- **项目类型**（Web全栈 / 纯前端 / 纯后端 / 桌面客户端 / 移动端 / 命令行工具 / 混合型）
- 实际使用的技术栈（语言版本、核心框架、数据库）
- 目录约定（各类文件的实际存放路径）
- 重复操作模式清单（候选 Skill）
- 代码规范（lint 工具、命名约定、运行命令）

## 执行步骤

### Step 1：检查现有文件

扫描 `.qoder/agents/` 和 `.qoder/skills/` 目录，记录已存在的文件，后续跳过这些文件不覆盖。

### Step 2：复制通用 Agent 到项目

将 `templates/agents/` 下的通用 Agent 定义文件复制到 `.qoder/agents/`（已存在则跳过）：

- `templates/agents/pm-agent.md` → `.qoder/agents/pm-agent.md`
- `templates/agents/solution-agent.md` → `.qoder/agents/solution-agent.md`

### Step 3：生成项目特定 Agent

根据项目类型，在 `.qoder/agents/` 下生成项目特定的设计/开发/测试 Agent（已存在则跳过）：

| 项目类型 | 需要生成的 Agent |
|----------|----------------|
| Web 全栈 | frontend-design, backend-design, frontend-dev, backend-dev, frontend-test, backend-test |
| 纯前端 | frontend-design, frontend-dev, frontend-test |
| 纯后端/服务 | backend-design, backend-dev, backend-test |
| 桌面客户端 | client-design, client-dev, client-test |
| 移动端 | mobile-design, mobile-dev, mobile-test |
| 混合型 | 根据包含的子类型组合生成 |

**每个 Agent 文件必须内嵌项目实际信息：**
- 实际的技术栈名称和版本
- 实际的目录路径（从诊断中获取，不得猜测）
- 实际的运行/调试命令
- 实际的代码规范要求

### Step 4：生成项目级 Skill 文件

在 `.qoder/skills/` 下为识别出的每个重复操作模式创建对应目录和 `SKILL.md`。

**Skill 清单完全由诊断结果决定**，不预设固定清单。根据项目类型，以下是各类型的典型 Skill 参考（实际生成以诊断识别为准）：

| 项目类型 | 典型 Skill |
|----------|----------|
| Web 全栈 | add-page, add-api-router, add-db-model, pre-commit-check |
| 桌面客户端 | add-window, add-ipc-channel, build-release |
| 移动端 | add-screen, add-native-module, publish-to-store |
| 纯后端 | add-api-module, add-cron-job, db-migration |
| 命令行工具 | add-subcommand, add-config-option |
| 所有类型 | pre-commit-check（命令依项目实际工具调整） |

每个 Skill 必须包含项目实际路径和命令；若操作涉及代码模板（如新增页面/模块），将模板作为附属文件放在同一目录下并在 SKILL.md 中引用。

### Step 5：复制产出物模板到项目

将 `templates/documents/` 下的模板文件复制到 `.qoder/templates/documents/`（已存在则跳过）：

- `templates/documents/prd-template.md` → `.qoder/templates/documents/prd-template.md`
- `templates/documents/solution-template.md` → `.qoder/templates/documents/solution-template.md`
- `templates/documents/design-template.md` → `.qoder/templates/documents/design-template.md`
- `templates/documents/test-case-template.md` → `.qoder/templates/documents/test-case-template.md`

**注意**：`design-template.md` 是通用结构模板，各端 Agent 在生成具体设计文档时参照此模板并根据端的技术特点填充。

### Step 5：输出生成摘要

列出：
- 已创建文件清单（路径 + 说明）
- 跳过文件清单（路径 + 原因）
- 建议下一步操作

## Agent 文件内容规范

每个 Agent 文件必须：
1. **内嵌项目具体信息**，不使用泛化描述
2. 明确"上下文输入"（读取哪个目录下的哪类文件）
3. 明确"输出规范"（产出物存放到哪个目录）
4. 包含"发现歧义时向上回溯"的约束

## Skill 文件内容规范

每个 Skill 文件必须：
1. 包含**具体文件路径**（如 `server/routers/` 而非"路由目录"）
2. 包含**验证检查项**（完成后如何确认操作成功）
3. 步骤数量控制在 10 步以内

## 注意事项

- 所有文件写入前检查是否已存在，已存在则跳过（不覆盖）
- 产出物模板使用 Markdown 格式，占位符用 `[...]` 标记
- Agent 描述字段必须包含"何时触发"的明确说明
