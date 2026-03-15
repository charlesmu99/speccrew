---
name: devcrew-project-diagnosis
description: 项目诊断评估 Skill。分析项目结构、诊断技术栈，输出标准化诊断报告。触发场景：新项目首次接入AI工程化、需要重新评估项目技术栈、准备创建AI协作基础设施前。
tools: Read, Glob, Grep, List, ReadFile, Search
---

# 触发场景

- 新项目首次接入 AI 工程化流程，需要全面诊断
- 项目技术栈发生重大变更，需要重新评估
- 准备创建或重建 AI 协作基础设施前
- 用户说"诊断项目"、"评估技术栈"、"分析项目结构"

# 诊断目标

> 注：业务域和重复操作模式的深度识别需在基础设施创建后，由具体 Agent 在使用过程中逐步沉淀。

---

**诊断报告输出**：`.devcrew-workspace/diagnosis-reports/diagnosis-report-{YYYY-MM-DD-HHmm}.md`

- **模板**：[templates/DIAGNOSIS-REPORT-TEMPLATE.md](templates/DIAGNOSIS-REPORT-TEMPLATE.md)
- **命名规范**：日期时间后缀，如 `diagnosis-report-2026-03-15-1430.md`，支持同一天多次诊断区分

# 诊断工作流程

## 阶段一：项目探索（并行读取）

同时读取以下内容：

1. **根目录关键文件**（示例）：`README.md`、`package.json`、`pyproject.toml`、`Cargo.toml`、`*.csproj`、`go.mod`、`pom.xml` 等
2. **配置文件**（示例）：`docker-compose.yml`、`.env.template`、`.env.example`、`Dockerfile` 等
3. **目录结构**：先读取根目录，再根据项目复杂度决定是否深入子目录（通常 2-3 层）
4. **现有 `.qoder/` 目录**：记录已有配置

## 阶段二：项目类型判定

基于读取结果判断项目类型：

| 项目类型 | 常见判定依据（示例） |
|----------|----------------------|
| **Web 全栈** | 同时存在前端（Vue/React/Angular/Svelte 等）和后端（FastAPI/Express/Spring/Django 等）目录 |
| **纯前端** | 只有前端框架，无独立后端服务 |
| **纯后端/API** | 无前端目录，只有服务端代码 |
| **桌面客户端** | 存在 Electron/Tauri/WPF/Qt 等特征文件 |
| **移动端** | 存在 Android/iOS/Flutter/React Native 等特征文件 |
| **命令行工具** | 存在 CLI 入口且无 UI 目录 |
| **混合型** | 包含上述多种类型的 monorepo |

## 阶段三：深度分析

### 3.1 技术栈识别

**运行时与语言**（示例）
- 语言版本（Node.js、Python、Go、Rust、Java、C# 等）
- 运行时环境要求

**核心框架与库**（示例）
- 前端：Vue/React/Angular/Svelte 等
- 后端：Express/FastAPI/Spring/Django 等
- 数据库：PostgreSQL/MySQL/MongoDB/Redis 等
- 其他关键依赖

**构建与工具链**（示例）
- 构建工具：Vite/Webpack/rollup/esbuild 等
- 包管理器：npm/pnpm/yarn/poetry/cargo 等
- 测试框架：Jest/Vitest/Pytest/Playwright 等

### 3.2 目录结构分析

记录实际目录约定（示例）：
- 源代码目录（`src/`、`app/`、`lib/`、`packages/` 等）
- 配置文件位置
- 测试文件位置
- 静态资源位置
- 文档位置

### 3.3 业务模块线索收集（仅用于创建空文件夹）

从以下位置收集业务模块名称（示例，不需要深度理解，仅列出检测到的名称）：
- 前端路由配置中的路由名称
- 后端 API 路由前缀
- 数据库 Model/Entity 文件名称
- 功能目录名称（如 `modules/`、`features/`、`domains/` 下的子目录）

**输出格式**：列出检测到的模块名称列表，标注"待PM Agent确认"

### 3.4 开发规范识别

- **代码风格**（示例）：ESLint、Prettier、Ruff、Black、Checkstyle 等配置
- **命名约定**：文件命名、变量命名风格
- **提交规范**（示例）：commitlint、conventional commits 等
- **运行命令**（示例）：package.json scripts、Makefile、Gradle 任务等

## 阶段四：生成诊断报告

### 4.1 创建诊断报告目录

确保 `.devcrew-workspace/diagnosis-reports/` 目录存在。

### 4.2 生成诊断报告

基于模板 `templates/DIAGNOSIS-REPORT-TEMPLATE.md`，生成诊断报告。

**动态内容填充规则**：

1. **architecture/ 子目录**：根据阶段二判定的项目类型，选择对应的子目录组合
   - Web全栈 → system, conventions, frontend, backend, data
   - 纯前端 → system, conventions, frontend
   - 纯后端 → system, conventions, backend, data
   - 桌面客户端 → system, conventions, desktop
   - 移动端 → system, conventions, mobile

2. **bizs/modules/ 初识线索**：填入阶段 3.3 收集的业务模块名称列表

# 输出要求

1. **诊断报告必须完整**：涵盖上述所有章节，不确定的内容标注"待确认"
2. **信息必须准确**：所有技术栈版本、路径必须来自实际文件，不得猜测
3. **格式标准化**：使用上述模板格式，便于后续 Skill 读取解析

# 验证检查

- [ ] 项目类型判定有明确依据
- [ ] 技术栈版本信息来自实际配置文件
- [ ] 目录结构来自实际扫描结果
- [ ] 业务模块线索已列出（标注"待PM Agent确认"）
- [ ] 重复操作模式识别已说明"待后续沉淀"
- [ ] 诊断报告已保存到指定路径

# 输出摘要

```
## 项目诊断完成

### 诊断结果摘要
- 项目类型：xxx
- 主要技术栈：xxx, xxx, xxx
- 识别业务域：x 个
- 候选 Skill：x 个

### 诊断报告位置
见上文「诊断报告输出」

### 建议下一步
调用 `devcrew-create-se-infrastructure` Skill，基于本诊断报告创建 AI 协作基础设施
```
