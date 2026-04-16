# speccrew-pm-phase5-subprd-dispatch

## Description

PM Phase 5 Sub-PRD 批量派遣 Skill。负责将复杂需求拆分后的 Sub-PRD 生成任务批量派遣给 Worker Agents 执行。

本 Skill 是 Master-Sub PRD 工作流的核心编排组件，实现：
- 从 Master PRD 读取 Dispatch Plan（Sub-PRD 分组信息）
- 初始化派遣进度追踪文件 DISPATCH-PROGRESS.json
- 批量并行派遣 Workers 生成各模块 Sub-PRD
- 失败重试机制（最多 1 次）
- 结果收集与完整性验证

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prd_output` | object | true | Phase 4 PRD 生成输出，包含 master_prd_path、dispatch_plan_path 等 |
| `iteration_path` | string | true | 当前迭代目录绝对路径 |
| `language` | string | false | 用户语言（默认 zh） |
| `workspace_path` | string | true | speccrew-workspace 根目录绝对路径 |
| `update_progress_script` | string | true | update-progress.js 脚本绝对路径 |
| `max_concurrent_workers` | number | false | 最大并行 Worker 数（默认 5） |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `dispatch_result` | string | 派遣结果状态：success / partial / failed |
| `total_subprds` | number | Sub-PRD 总数 |
| `success_count` | number | 成功生成的 Sub-PRD 数量 |
| `failure_count` | number | 失败的 Sub-PRD 数量 |
| `sub_prd_files` | array | 生成的 Sub-PRD 文件路径列表 |
| `feature_list_path` | string | Feature List 文件路径 |

<!-- @agentflow: workflow.agentflow.xml -->

## Checklist

### Step 5.1: 读取 Dispatch Plan
- [ ] 读取 Master PRD 中的 dispatch-plan（Sub-PRD 分组信息）
- [ ] 解析 sub_prd_groups 数组
- [ ] 验证每组包含必需字段：module_id, module_name, module_key, module_scope, module_entities

### Step 5.2: 初始化进度追踪
- [ ] 创建临时任务定义文件 .tasks-temp.json
- [ ] 使用 update-progress.js 脚本初始化 DISPATCH-PROGRESS.json
- [ ] 验证初始化成功（Total: N | Pending: N | Completed: 0）

### Step 5.3: 批量派遣 Workers
- [ ] 按 5 个一批分组进行并行派遣
- [ ] 每个 Worker 携带完整 context 参数
- [ ] 每批完成后更新 DISPATCH-PROGRESS.json
- [ ] 继续下一批直到所有模块处理完成

### Step 5.4: 失败重试
- [ ] 检查是否有 failed 状态的任务
- [ ] 有失败 -> 重试一次（单次重试机制）
- [ ] 重试后仍有失败 -> 记录并继续

### Step 5.5: 结果收集与验证
- [ ] 读取最终 DISPATCH-PROGRESS.json
- [ ] 验证所有 Sub-PRD 文件存在且大小 > 3KB
- [ ] 生成汇总报告
- [ ] 更新 checkpoint
- [ ] 验证 feature list 完整性

### Step 5.6: 用户确认
- [ ] 等待用户确认 Sub-PRD 生成结果

## Key Rules

### MANDATORY - Worker 派遣规则
- **ONE Worker per Module** - 每个 Sub-PRD 模块派遣一个独立 Worker
- **禁止 PM 自行生成** - PM Agent 不得直接生成 Sub-PRD 内容
- **必须通过 dispatch-to-worker** - 所有 Worker 必须通过 `dispatch-to-worker` action 执行
- **禁止直接调用 Skill** - 不得直接调用 `speccrew-pm-sub-prd-generate` skill

### MANDATORY - 批处理规则
- **Batch Size = 5** - 每批最多 5 个并行 Worker
- **并行派遣** - 同一批次的 Worker 必须同时派遣
- **顺序等待** - 等待当前批次完成后再派遣下一批
- **进度更新** - 每个 Worker 完成后立即更新 DISPATCH-PROGRESS.json

### MANDATORY - 进度追踪规则
- **脚本初始化** - DISPATCH-PROGRESS.json 必须通过 update-progress.js 创建
- **禁止手动创建** - 不得通过 create_file 或 PowerShell 直接创建进度文件
- **幂等更新** - 使用 `update-task` 命令更新单个任务状态

### FORBIDDEN - 禁止行为
- 禁止 PM Agent 直接生成 Sub-PRD 文件
- 禁止派遣一个 Worker 处理多个模块
- 禁止跳过 Worker 派遣作为失败后的回退方案
- 禁止在用户确认前标记 checkpoint 为 passed
