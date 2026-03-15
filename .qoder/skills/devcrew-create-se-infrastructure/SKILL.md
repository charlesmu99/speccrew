---
name: devcrew-create-se-infrastructure
description: 依据项目诊断报告，创建或更新 AI 软件工程化基础设施。包括生成各角色 Agent、项目级 Skill、.devcrew-workspace 目录结构及产出物模板。触发场景：完成项目诊断后、需要重建 AI 协作体系、更新 Agent/Skill 配置。
tools: Read, Write, Glob
---

# Create SE Infrastructure

依据 `.devcrew-workspace/diagnosis-reports/` 下的诊断报告，为项目生成或更新 AI 软件工程化基础设施。

## 前置要求

**必须先完成项目诊断**，确保 `.devcrew-workspace/diagnosis-reports/diagnosis-report-{日期}.md` 存在且包含完整信息。若不存在，提示用户先执行 `devcrew-project-diagnosis` Skill。

**读取最新的诊断报告**：
1. 列出 `.devcrew-workspace/diagnosis-reports/` 目录下的所有诊断报告文件
2. 按文件名日期排序，选择最新的报告
3. 读取报告内容作为生成依据

## 附属资源

本 Skill 目录下包含以下预定义文件：

**通用 Agent 模板**（`templates/agents/`，所有项目类型均适用）：
- [templates/agents/pm-agent.md](templates/agents/pm-agent.md)：产品经理 Agent
- [templates/agents/solution-agent.md](templates/agents/solution-agent.md)：规划 Agent

**产出物文档模板**：
- 引用 `devcrew-project-init` Skill 中的模板文件：
  - `templates/prd-template.md`：PRD 文档模板
  - `templates/solution-template.md`：Solution 文档模板
  - `templates/design-template.md`：详细设计文档模板
  - `templates/test-case-template.md`：测试用例文档模板

## 前提条件

执行前确认已从最新诊断报告中获取：
- **项目类型**（Web全栈 / 纯前端 / 纯后端 / 桌面客户端 / 移动端 / 命令行工具 / 混合型）
- 实际使用的技术栈（语言版本、核心框架、数据库）
- 目录约定（各类文件的实际存放路径）
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

在 `.qoder/skills/` 下创建项目级 Skill 目录结构。

**注意**：具体的 Skill 内容（如 add-page、add-api 等）不在此阶段生成，而是由 Dev Agent 在开发过程中识别重复操作模式后，通过 `devcrew-skill-develop` Skill 逐步创建。

此步骤仅创建必要的目录结构和基础配置 Skill（如 pre-commit-check，如有配置）。

### Step 5：复制产出物模板到项目

从 `devcrew-project-diagnosis` Skill 复制模板文件到 `.qoder/templates/`（已存在则跳过）：

- `devcrew-project-diagnosis/templates/prd-template.md` → `.qoder/templates/prd-template.md`
- `devcrew-project-diagnosis/templates/solution-template.md` → `.qoder/templates/solution-template.md`
- `devcrew-project-diagnosis/templates/design-template.md` → `.qoder/templates/design-template.md`
- `devcrew-project-diagnosis/templates/test-case-template.md` → `.qoder/templates/test-case-template.md`

**注意**：`design-template.md` 是通用结构模板，各端 Agent 在生成具体设计文档时参照此模板并根据端的技术特点填充。

### Step 6：输出生成摘要

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
