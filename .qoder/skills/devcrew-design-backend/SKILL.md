---
name: devcrew-design-backend
description: 后端详细设计 SOP。基于 Solution 和接口契约，输出后端模块划分、接口实现伪代码、Repository 设计、异常处理等详细设计文档。
tools: Read, Write, Glob, Grep
---

# 触发场景

- Solution 人工确认通过，用户请求后端详细设计
- 用户问"做后端设计"、"后端怎么实现"

# 工作流程

## 步骤一：读取输入

1. Solution 文档：`projects/pXXX/02.solutions/[功能名]-solution.md`
2. 接口契约：`projects/pXXX/02.solutions/[功能名]-api-contract.md`
3. 后端架构规范：`devcrew-workspace/knowledge/architecture/backend/README.md`
4. 后端设计模板：`.qoder/skills/devcrew-design-backend/templates/DESIGN-TEMPLATE.md`

## 步骤二：分析现有代码结构（按需）

如需了解现有实现，通过 semantic-searcher 或直接读取：
- `server/routers/` - 现有路由，确认命名规范
- `src/services/` - 现有 Service 层
- `src/repositories/` - 现有 Repository 层
- `src/storage/db/` - 数据库 Model 定义

## 步骤三：撰写后端设计文档

按模板结构填写：

**模块划分**
- 列出需要新增/修改的文件（Router/Service/Repository/Model）
- 说明每个文件的职责

**接口实现伪代码**（对每个接口）
- Router 层：参数校验逻辑
- Service 层：业务逻辑步骤（伪代码形式）
- Repository 层：数据库操作方法

**数据库设计**
- 新增/修改的 Model 类定义（字段、类型/约束）
- 是否需要数据库迁移？迁移内容是什么？

**异常处理**
- 各接口可能抛出的异常类型
- 对应的错误码（参照接口契约）

**业务规则**
- 需要在代码中实现的业务约束（如唯一性检查、权限校验）

## 步骤四：接口契约核对

逐条核对接口契约，确认：
- [ ] 所有接口都有对应的 Router/Service 实现设计
- [ ] 请求参数校验覆盖所有必填字段
- [ ] 响应结构与契约定义一致
- [ ] 错误码与契约中的错误码清单一致

如发现契约问题：**停止设计，回溯至 Solution Agent 修正**，不得自行修改契约。

## 步骤五：写入文件

写入路径：`projects/pXXX/03.designs/backend/[功能名]-design.md`

完成后向用户展示摘要，说明等待前端设计完成后统一确认。

## 步骤六：联合人工确认（前后端都完成时�?

当前端和后端设计都完成后，向用户请求确认：

```
设计阶段产出物已就绪：
- 前端设计：projects/pXXX/03.designs/frontend/[功能名]-design.md
- 后端设计：projects/pXXX/03.designs/backend/[功能名]-design.md

请确认以下关键点：
1. 模块划分是否合理？
2. 数据库设计是否满足业务需求？
3. 异常处理是否完整？

确认无误后，可分别启动前端/后端开发 Agent。
```

# 检查清单

- [ ] 已读取并遵循后端架构分层规范
- [ ] 所有接口都有 Router/Service/Repository 三层设计
- [ ] 数据库 Model 有完整字段定义
- [ ] 是否需要迁移已明确说明
- [ ] 错误码与接口契约一致
- [ ] 接口契约核对通过（或已回溯修正）
- [ ] 文件已写入正确路径
