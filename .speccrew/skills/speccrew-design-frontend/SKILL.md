---
name: speccrew-design-frontend
description: 前端详细设计 SOP。基于 Solution 和接口契约，输出前端组件设计、状态管理、API 层、路由规划等详细设计文档。
tools: Read, Write, Glob, Grep
---

# 触发场景

- Solution 人工确认通过，用户请求前端详细设计
- 用户问"怎么做前端设计"、"前端怎么实现"

# 工作流程

## 步骤一：读取输入

1. Solution 文档：`projects/pXXX/02.solutions/[功能名]-solution.md`
2. 接口契约：`projects/pXXX/02.solutions/[功能名]-api-contract.md`
3. 前端架构规范：`speccrew-workspace/knowledge/architecture/frontend/README.md`
4. 前端设计模板：`speccrew-design-frontend/templates/DESIGN-TEMPLATE.md`

## 步骤二：分析现有代码结构（按需）

如需了解现有组件、API 封装，通过 semantic-searcher 或直接读取：
- `web/src/apis/` - 现有 API 封装，避免重复定义
- `web/src/components/` - 现有公共组件，尽量复用
- `web/src/stores/` - 现有状态管理，确认命名不冲突
- `web/src/router/` - 现有路由，规划新路由

## 步骤三：撰写前端设计文档

按模板结构填写：

**组件清单**
- 列出新增/修改的所有组件
- 说明每个组件的职责、所在目录

**组件详情**（对每个核心组件）
- Props 定义（名称、类型、必填/说明）
- Emits 事件（名称、参数、说明）
- 关键逻辑伪代码
- 引用的接口

**状态管理**
- 是否需要新 Store？
- Store 文件路径、state 结构、关键 actions

**API 层封装**
- 对应接口契约中每个接口的前端封装函数
- 文件路径（遵循 `web/src/apis/` 规范）

**路由规划**
- 新增路由：path、name、component 映射
- 是否需要权限控制？

## 步骤四：接口契约核对

逐条核对接口契约，确认：
- [ ] 所有需要的接口都在契约中有定义
- [ ] 请求参数与前端的数据结构匹配
- [ ] 响应字段满足前端展示需求

如发现契约问题：**停止设计，回溯至 Solution Agent 修正**，不得自行修改契约。

## 步骤五：写入文件并请求确认

写入路径：`projects/pXXX/03.designs/frontend/[功能名]-design.md`

完成后向用户展示摘要，说明等待后端设计完成后统一确认。

# 检查清单

- [ ] 已读取并遵循前端架构规范
- [ ] 组件清单完整，无遗漏
- [ ] 所有新增接口调用都有 API 层封装定义
- [ ] 路由规划与现有路由无冲突
- [ ] 接口契约核对通过（或已回溯修正）
- [ ] 文件已写入正确路径

