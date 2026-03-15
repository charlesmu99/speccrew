---
name: devcrew-solution-api-contract
description: 接口契约生成 SOP。基于 Solution 文档，输出结构化的前后端接口契约文档。契约确认后不可在下游阶段修改。
tools: Read, Write, Glob, Grep
---

# 触发场景

- Solution 文档完成后，自动由 devcrew-solution-plan Skill 触发
- 用户说"生成接口文档"、"定义 API 契约"

# 工作流程

## 步骤一：读取输入

1. Solution 文档：`projects/pXXX/02.solutions/[功能名]-solution.md`
2. 接口契约模板：`.qoder/skills/devcrew-solution-api-contract/templates/API-CONTRACT-TEMPLATE.md`
3. 系统架构（接口规范部分）：`.devcrew-workspace/knowledge/architecture/backend/README.md`（查阅接口命名规范）

## 步骤二：梳理接口清单

从 Solution 文档中提取所有接口，整理成清单：

| 接口名称 | 方法 | URL | 说明 | 调用方 |
|----------|------|-----|------|--------|
| [接口] | GET/POST/PUT/DELETE | `/api/v1/...` | [描述] | 前端 |

命名规范：
- URL 使用 RESTful 风格，名词复数
- 遵循 `.devcrew-workspace/knowledge/architecture/backend/README.md` 中的接口规范

## 步骤三：逐接口定义契约

对每个接口完整定义：
- 请求方法、URL、是否需要认证
- 请求参数（含类型、是否必填、示例值）
- 响应结构（含每个字段的类型和说明）
- 成功响应示例（JSON）
- 错误码清单

## 步骤四：写入文件

写入路径：`projects/pXXX/02.solutions/[功能名]-api-contract.md`

## 步骤五：联合确认

两份文档（Solution + API Contract）都就绪后，向用户请求确认：

```
方案阶段产出物已就绪：
- Solution：projects/pXXX/02.solutions/[功能名]-solution.md
- API 契约：projects/pXXX/02.solutions/[功能名]-api-contract.md

请确认以下关键点：
1. 整体技术方案是否可行？
2. 接口定义是否满足前端需求？
3. 数据模型是否合理？

⚠️ 确认后，接口契约将作为前后端协作唯一基准。
  设计/开发阶段只读引用，不得修改。
  如需变更，必须回到此阶段重新确认。

确认无误后，可分别启动前端/后端设计 Agent。
```

# 检查清单

- [ ] 所有 Solution 中提及的接口都已定义契约
- [ ] 每个接口都有完整的请求/响应结构定义
- [ ] URL 命名符合后端架构规范
- [ ] 错误码清单完整
- [ ] 文件已写入正确路径
- [ ] 已向用户展示两份文档摘要并请求确认
