---
name: devcrew-solution-plan
description: 技术方案规划 SOP。引导 Solution Agent 完成方案分析、技术选型、数据模型设计，输出 Solution 文档。
tools: Read, Write, Glob, Grep
---

# 触发场景

- PRD 人工确认通过，用户请求启动方案规划
- 用户说"做方案"、"技术规划"、"怎么实现这个需求"

# 工作流程

## 步骤一：读取输入

按顺序读取：

1. 当前迭代 PRD：`projects/pXXX/01.prds/[功能名]-prd.md`
2. 系统架构现状：`.devcrew-workspace/knowledge/architecture/system/system-arch.md`
3. 业务模块清单：`.devcrew-workspace/knowledge/bizs/modules/modules.md`
4. Solution 模板：`.qoder/skills/devcrew-solution-plan/templates/SOLUTION-TEMPLATE.md`

## 步骤二：方案分析

基于 PRD 和架构现状，分析以下内容：

**功能拆解**
- 将 PRD 中的功能需求拆解为可实现的技术子任务
- 识别前端、后端、数据库各层的变更范围

**技术决策**
- 是否复用现有模块？还是新建？
- 有无第三方依赖？
- 数据如何存储？（关系型 / 向量 / 图）
- 是否涉及异步任务？

**UI/交互方案**
- 新增哪些页面或组件？
- 关键交互流程是什么？（用文字描述主流程）

**数据模型**
- 新增/修改哪些数据表？
- 关键字段和关系是什么？

## 步骤三：撰写 Solution 文档

按模板结构填写，要求：
- **方案概述**：一段话说明整体思路
- **功能拆解**：对应 PRD 中每条功能需求的实现思路
- **时序图**：核心流程的 Mermaid 时序图（至少一张）
- **数据模型**：ER 图或表结构说明
- **UI 方案**：页面/组件清单和交互说明
- **风险与约束**：识别实现中的潜在风险

## 步骤四：写入文件

写入路径：`projects/pXXX/02.solutions/[功能名]-solution.md`

如迭代目录不存在，参考 `p000-sample` 创建完整目录结构。

## 步骤五：同步执行接口契约

Solution 文档完成后，继续调用 `devcrew-solution-api-contract/SKILL.md` 生成接口契约文档。

# 检查清单

- [ ] 已读取 PRD，方案覆盖所有 P0 功能需求
- [ ] 已读取系统架构，方案与现有架构兼容
- [ ] 时序图包含核心流程
- [ ] 数据模型有明确的表结构说明
- [ ] UI 方案有页面/组件清单
- [ ] 文件已写入正确路径
