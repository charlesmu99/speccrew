# 开发规范

> 使用者：前端/后端开发 Agent（必须读）、测试 Agent（必须读）
> 维护者：amu-agent 初始化生成，规范变化时更新
> 数据来源：AGENTS.md / CLAUDE.md / ESLint 配置 / pyproject.toml 工具配置

---

## 引言

[描述项目整体编程规范的守守原则，如：代码可读性、一致性、可维护性目标]

## 技术栈工具配置

| 工具 | 配置文件 | 用途 |
|------|----------|------|
| [工具名] | [配置文件路径] | [代码检查/格式化/测试] |

> 数据来源：`eslint.config.js` `pyproject.toml` `.prettierrc.json` 分析

## 代码风格

### 前端

[描述 ESLint 规则要点、Prettier 配置、禁止的写法]

> 数据来源：`eslint.config.js` `.prettierrc.json` 配置内容

### 后端

[描述 Ruff/Flake8 规则要点、类型注解要求、禁止的写法]

> 数据来源：`pyproject.toml` `[tool.ruff]` 配置内容

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 前端组件 | PascalCase | `UserProfile.vue` |
| 前端函数 | camelCase | `getUserInfo()` |
| 后端类 | PascalCase | `UserService` |
| 后端函数 | snake_case | `get_user_info()` |
| 数据库表 | snake_case | `user_profile` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

## 提交规范

```
<type>(<scope>): <subject>

type: feat / fix / docs / style / refactor / test / chore
scope: 影响范围（可选）
subject: 简短描述（中文或英文）

示例：
feat(knowledge): 新增知识库批量上传功能
fix(auth): 修复 token 过期后未跳转登录页的问题
```

> 数据来源：AGENTS.md 开发规范章节

## 运行与调试命令

### 前端

```bash
# 启动开发服务器
[命令]

# 代码检查
[命令]
```

### 后端

```bash
# 启动服务
[命令]

# 代码格式化
[命令]

# 运行测试
[命令]
```

> 数据来源：AGENTS.md 开发与调试工作流章节

## 测试规范

[描述单元测试框架、测试文件命名规则、测试覆盖率要求]

> 数据来源：`test/` 目录结构分析

---

## 附录

- 详细测试规范详见：[testing.md](./testing.md)
- 前端架构详见：[`architecture/frontend/frontend-arch.md`](../frontend/frontend-arch.md)
- 后端架构详见：[`architecture/backend/backend-arch.md`](../backend/backend-arch.md)
