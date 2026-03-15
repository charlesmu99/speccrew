# Knowledge 知识库

本目录是项目的**长期知识库**，存放系统现状和领域知识，供各 Agent 按需加载参考。

> 内容由 amu-agent 初始化生成，并随项目演进持续更新。**不存放迭代产出物**（那些在 `projects/` 下）。

---

## 目录结构

```
knowledge/
├── constitution.md                  # 项目寪法 → 所有 Agent 优先读（全局认知入口）
├── architecture/                    # 系统架构（现状）
│   ├── system/system-arch.md        # 整体架构 → Solution Agent 必须读
│   ├── frontend/frontend-arch.md    # 前端架构 → 前端设计/开发 Agent 必须读
│   ├── backend/backend-arch.md      # 后端架构 → 后端设计/开发 Agent 必须读
│   ├── data/data-arch.md            # 数据架构 → 涉及数据库时按需读
│   └── conventions/conventions.md   # 开发规范 → 开发/测试 Agent 必须读
│
├── bizs/                            # 业务功能（现状）
│   ├── modules/modules.md           # 业务模块清单 → PM + Solution Agent 必须读
│   └── flows/flows.md               # 核心业务流程 → PM + Solution Agent 按需读
│
└── domain/                          # 领域知识（长期积累）
    ├── standards/standards.md       # 行业标准规范 → PM Agent 按需读
    ├── glossary/glossary.md         # 业务术语表 → PM Agent 按需读
    └── qa/qa.md                     # 常见问题解决方案 → 所有 Agent 按需读
```

---

## 更新规则

| 目录 | 更新时机 | 更新人 |
|------|----------|--------|
| `architecture/` | 系统架构变更后 | amu-agent / 开发负责人 |
| `bizs/` | 新功能上线后 | amu-agent / 业务负责人 |
| `domain/standards/` | 行业规范变化时 | 人工维护 |
| `domain/glossary/` | 新术语出现时 | PM Agent / 人工维护 |
| `domain/qa/` | 遇到新的疑难问题解决后 | 人工沉淀 |
