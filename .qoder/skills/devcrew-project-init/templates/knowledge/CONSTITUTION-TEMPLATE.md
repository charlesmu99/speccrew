# 项目宪法（Constitution）

> **所有 Agent 优先读此文件**，获取项目全局认知后，再按需加载子文档。  
> 维护者：amu-agent 初始化生成，项目重大调整时更新  
> 数据来源：各子文档摘要汇总

---

## 一、系统定位

[一句话描述系统是什么，解决什么问题]

> 详细见：[`architecture/system/system-arch.md`](architecture/system/system-arch.md)

---

## 二、技术栈速览

| 层 | 技术 | 版本 |
|----|------|------|
| 前端 | [框架] | [版本] |
| 后端 | [框架] | [版本] |
| 主数据库 | [数据库] | [版本] |
| 向量数据库 | [数据库] | [版本] |
| 部署方式 | [如 Docker Compose] | - |

> 详细见：[`architecture/system/system-arch.md`](architecture/system/system-arch.md)

---

## 三、架构原则

> **这是整个项目的根本约束，所有 Agent 必须遵守，不得自行突破。**

1. **分层隔离**：Router 层不写业务逻辑，Service 层不直接操作数据库，Repository 层不写业务规则
2. **接口契约只读**：设计/开发阶段只读引用接口契约，变更必须回到 Solution 阶段重新确认
3. **规范先行**：遇到规范不明确，先补规范再继续实现
4. **偏差申报**：实现与设计有偏差时，必须在任务记录中申报原因，禁止静默偏差

---

## 四、代码规范要点

### 前端
- [关键规范，如：组件命名 PascalCase、样式用 less、颜色用 CSS 变量]

### 后端
- [关键规范，如：Python 3.12+、snake_case 命名、类型注解必须]

> 详细见：[`architecture/conventions/conventions.md`](architecture/conventions/conventions.md)

---

## 五、业务模块速览

| 模块 | 状态 | 简述 |
|------|------|------|
| [模块名] | 已上线 | [一句话描述] |

> 详细见：[`bizs/modules/modules.md`](bizs/modules/modules.md)

---

## 六、知识库导航

| 文档 | 路径 | 必须读的 Agent |
|------|------|-------------|
| 整体架构 | [`architecture/system/system-arch.md`](architecture/system/system-arch.md) | Solution Agent |
| 前端架构 | [`architecture/frontend/frontend-arch.md`](architecture/frontend/frontend-arch.md) | 前端设计/开发 Agent |
| 后端架构 | [`architecture/backend/backend-arch.md`](architecture/backend/backend-arch.md) | 后端设计/开发 Agent |
| 数据架构 | [`architecture/data/data-arch.md`](architecture/data/data-arch.md) | 涉及数据库时按需读 |
| 开发规范 | [`architecture/conventions/conventions.md`](architecture/conventions/conventions.md) | 开发/测试 Agent |
| 业务模块 | [`bizs/modules/modules.md`](bizs/modules/modules.md) | PM + Solution Agent |
| 业务流程 | [`bizs/flows/flows.md`](bizs/flows/flows.md) | PM + Solution Agent 按需 |
| 领域术语 | [`domain/glossary/glossary.md`](domain/glossary/glossary.md) | PM Agent 按需 |
| QA 知识 | [`domain/qa/qa.md`](domain/qa/qa.md) | 所有 Agent 按需 |
