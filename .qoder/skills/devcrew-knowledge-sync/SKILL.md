---
name: devcrew-knowledge-sync
description: 知识库同步检查 SOP。检查 knowledge/ 各文档与代码现状是否一致，生成待更新清单，防止知识库腐化。
tools: Read, Write, Glob, Grep
---

# 触发场景

- 用户说"检查知识库"、"同步知识库"、"知识库过时了"
- 重大重构或架构变更完成后
- amu-agent 周期性维护时主动触发

# 工作流程

> 每个子目录独立执行，保持上下文隔离，避免单次处理过多内容。

## 步骤一：读取知识库导航

读取 `.devcrew-workspace/knowledge/constitution.md` 和 `.devcrew-workspace/knowledge/README.md`，获取所有知识主文档路径清单。

## 步骤二：逐文档对照检查

按以下顺序逐一处理，**每个文档检查完后记录结论再处理下一个**：

### ① 整体架构 `architecture/system/system-arch.md`

对照检查：
- `docker-compose.yml` 服务声明 vs 文档中的技术栈表格
- `pyproject.toml` / `package.json` 依赖版本 vs 文档中的版本号
- 项目目录结构 vs 文档中的架构总览

### ② 前端架构 `architecture/frontend/frontend-arch.md`

对照检查：
- `web/src/` 目录结构 vs 文档描述
- `web/package.json` 依赖 vs 文档技术栈
- `web/src/apis/` 接口层组织 vs 文档说明

### ③ 后端架构 `architecture/backend/backend-arch.md`

对照检查：
- `src/` `server/` 目录结构 vs 文档描述
- `pyproject.toml` 后端依赖 vs 文档技术栈
- Router/Service/Repository 实际分层 vs 文档分层规范

### ④ 数据架构 `architecture/data/data-arch.md`

对照检查：
- `docker-compose.yml` 数据库服务 vs 文档存储系统总览
- ORM 模型文件（如 `src/storage/`）vs 文档核心表清单

### ⑤ 开发规范 `architecture/conventions/conventions.md`

对照检查：
- `eslint.config.js` `.prettierrc.json` vs 文档前端规范
- `pyproject.toml [tool.ruff]` vs 文档后端规范
- `AGENTS.md` / `CLAUDE.md` 命令列表 vs 文档运行命令

### ⑥ 业务模块 `bizs/modules/modules.md`

对照检查：
- `server/routers/` 路由文件 vs 文档模块清单
- `web/src/` 页面路由 vs 文档模块清单
- 是否有新增路由但未录入模块清单

### ⑦ 业务流程 `bizs/flows/flows.md`

对照检查：
- 现有流程详情文件 vs 代码中的核心调用链
- 是否有流程已变更但文档未同步

## 步骤三：生成待更新清单

将所有检查结论汇总，输出格式如下：

```markdown
## 知识库同步检查报告 - [日期]

### 同步状态总览

| 文档 | 状态 | 问题数 |
|------|------|--------|
| system-arch.md | ✅ 同步 / ⚠️ 需更新 / ❌ 严重偏差 | [N] |
| frontend-arch.md | ... | [N] |
| ...（其余文档） | ... | [N] |

### 待更新清单

#### [文档名]
- [ ] [具体需要更新的内容，如：版本号 X.X → X.X]
- [ ] [需要新增的内容描述]
- [ ] [需要删除/修正的内容描述]

### 建议优先级

| 优先级 | 文档 | 原因 |
|--------|------|------|
| 高（影响 Agent 决策） | [文档] | [原因] |
| 中（信息过时） | [文档] | [原因] |
| 低（细节偏差） | [文档] | [原因] |
```

输出到：`.devcrew-workspace/docs/knowledge-sync-[YYYY-MM-DD].md`

## 步骤四：提示用户处理

```
知识库同步检查完成：
- 检查文档：7 份
- 需更新：[N] 份
- 待更新清单：.devcrew-workspace/docs/knowledge-sync-[日期].md

建议优先更新影响 Agent 决策的高优先级文档。
是否现在开始逐项更新？
```

# 检查清单

- [ ] 已读取 constitution.md 获取文档路径清单
- [ ] 已逐一对照代码现状检查 7 份知识主文档
- [ ] 每份文档的检查结论已记录
- [ ] 已生成待更新清单文件
- [ ] 已向用户展示摘要并提示下一步
