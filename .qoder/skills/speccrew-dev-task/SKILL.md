---
name: SpecCrew-dev-task
description: 开发任务执行 SOP。按详细设计文档完成代码编写，记录任务拆分、进度和偏差。
tools: Read, Write, Glob, Grep
---

# 触发场景

- 详细设计人工确认通过，用户请求启动开发
- 用户问"开始开发"、"写代码"、"实现这个功能"

# 工作流程

## 步骤一：读取输入

1. 详细设计文档：`projects/pXXX/03.designs/[frontend|backend]/[功能名]-design.md`
2. 接口契约：`projects/pXXX/02.solutions/[功能名]-api-contract.md`
3. 开发规范：`SpecCrew-workspace/knowledge/architecture/conventions/conventions.md`
4. 任务记录模板：`.qoder/skills/SpecCrew-dev-task/templates/TASK-[FRONTEND|BACKEND]-TEMPLATE.md`

## 步骤二：创建任务记录文件

在开始编码前，先创建任务记录：

路径：`projects/pXXX/04.tasks/[frontend|backend]/[功能名]-task.md`

从设计文档中提取所有需要实现的文件，列成任务清单：

```markdown
| 任务ID | 任务描述 | 涉及文件 | 状态 |
|--------|----------|----------|------|
| FE-001 | 创建 XxxComponent.vue | web/src/components/xxx/ | ⏳ 未开始 |
```

## 步骤三：逐任务实现

按任务清单顺序实现，每完成一个任务：
1. 更新任务记录状态为 ✅ 完成
2. 继续下一个任务

**编码原则**：
- 严格按设计文档中的文件路径、命名、结构实现
- 遵循 `conventions/conventions.md` 中的代码规范
- 优先复用现有代码，避免重复实现
- 如遇现有代码冲突，通过 semantic-searcher 查找现有实现

**提交前本地检查（每个任务完成后）：**

在标记任务完成前，运行以下检查确保代码质量：

1. **代码规范检查**
   - 前端：`npm run lint` 或 `npx eslint [修改的文件]`
   - 后端：`make lint` 或 `ruff check [修改的文件]`
   - 确保无错误，警告需评估是否修复

2. **类型检查**（如项目使用 TypeScript）
   - `npx tsc --noEmit`
   - 确保无类型错误

3. **单元测试**（如修改了可测试的函数）
   - 运行相关单元测试
   - 确保不破坏现有测试

4. **快速验证**
   - 前端：页面能正常渲染，无控制台报错
   - 后端：服务能正常启动，接口能响应

**检查未通过时：**
- 先修复问题，再标记任务完成
- 如问题复杂，记录到任务文件的"遗留问题"章节

**发现设计问题时：**
- 停止当前任务
- 明确描述问题给用户
- 等待用户决定：回溯设计 or 说明原因直接实现

**任务阻塞时的诊断步骤：**

当任务无法继续（编译失败、测试失败、环境异常等）时，按以下步骤诊断：

1. **查看日志**
   - 后端：`docker logs [后端容器名] --tail 100` 或查看进程输出
   - 前端：查看浏览器控制台或终端输出
   - 定位具体错误信息和堆栈

2. **检查容器状态**（如使用 Docker）
   - `docker ps` 查看服务是否正常运行
   - `docker compose ps` 检查编排状态
   - 如有服务异常，查看对应日志

3. **验证配置与环境**
   - 检查 `.env` 环境变量是否正确
   - 确认依赖服务（数据库、存储服务等）可访问

4. **定位到具体错误后**
   - 如果是已知问题，记录到任务文件的"遗留问题"章节
   - 如果是设计问题，回溯到 Design Agent
   - 如果是环境问题，告知用户并等待修复

5. **诊断记录**
   - 在任务文件中记录：症状 → 排查步骤 → 根因 → 解决方案

## 步骤四：记录偏差

如实际实现与设计有偏差（无论什么原因），记录到任务文件"偏差说明"章节：

```markdown
### 偏差说明
- FE-002：原设计使用 A 方法，因 [原因] 改用 B 方法
```

## 步骤五：完成通知

所有任务完成后，更新任务文件状态，并告知用户：

```
开发完成：
- 已实现：[X] 个任务
- 偏差记录：[Y] 条（详见任务文件）
- 技术债记录：[Z] 条（详见 tech-debt/[功能名]-tech-debt.md）
- 任务记录：projects/pXXX/04.tasks/[frontend|backend]/[功能名]-task.md

可启动测试 Agent 进行验收测试。
```

# 检查清单

- [ ] 任务记录文件已创建
- [ ] 设计文档中的所有文件都已实现
- [ ] 每个任务完成前已运行本地检查（lint/类型/测试）
- [ ] 代码遵循架构分层规范
- [ ] 命名符合规范
- [ ] 所有偏差已记录
- [ ] 如有技术债，已写入 `projects/pXXX/tech-debt/[功能名]-tech-debt.md`（基于模板 `.qoder/skills/SpecCrew-dev-task/templates/TECH-DEBT-TEMPLATE.md`）
- [ ] 任务记录状态已更新为完成

