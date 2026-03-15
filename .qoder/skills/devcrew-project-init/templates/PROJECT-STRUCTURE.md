# 项目迭代目录结构

> 由 `devcrew-project-init` 初始化创建，每个迭代一个目录

## 目录结构定义

```
projects/
└── p[编号]-[迭代名]/
    ├── 00.meta/              # 迭代元信息
    │   ├── checklist.md      # 阶段检查清单
    │   └── status.md         # 迭代状态跟踪
    ├── 01.prds/              # PRD 文档
    │   └── [功能名]-prd.md
    ├── 02.solutions/         # 技术方案
    │   ├── [功能名]-solution.md
    │   └── [功能名]-api-contract.md
    ├── 03.designs/           # 详细设计
    │   ├── frontend/
    │   │   └── [功能名]-design.md
    │   └── backend/
    │       └── [功能名]-design.md
    ├── 04.tasks/             # 开发任务记录
    │   ├── frontend/
    │   │   └── [功能名]-task.md
    │   └── backend/
    │       └── [功能名]-task.md
    ├── 05.tests/             # 测试相关
    │   ├── cases/
    │   │   └── [功能名]-test-cases.md
    │   └── reports/
    │       └── [功能名]-test-report.md
    └── tech-debt/            # 技术债记录
        └── [功能名]-tech-debt.md
```

## 各目录说明

| 目录 | 用途 | 创建时机 |
|------|------|----------|
| `00.meta/` | 迭代元信息、检查清单、状态跟踪 | 初始化时 |
| `01.prds/` | PRD 需求文档 | PM Agent |
| `02.solutions/` | Solution 方案 + API 契约 | Solution Agent |
| `03.designs/` | 前端/后端详细设计 | Design Agent |
| `04.tasks/` | 开发任务记录 | Dev Agent |
| `05.tests/` | 测试用例 + 测试报告 | Test Agent |
| `tech-debt/` | 技术债记录 | Dev Agent |

## 归档目录

```
projects/
└── archive/                  # 归档项目
    ├── p[编号]-[迭代名]-archived-[YYYY-MM-DD]/
    └── tech-debt/            # 已处理的技术债
```
