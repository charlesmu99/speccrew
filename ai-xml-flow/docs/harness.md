# Harness 原则

Harness 原则是指导 SpecCrew 体系设计的核心规范，涵盖 Skill 定义、Agent 行为、任务委派等多个层面，确保整个系统具备高可读性、可维护性和执行可靠性。

---

## 1. 操作手册原则（SOP 连续性）

Skill 中定义的是标准操作流程（SOP），必须具备：

- **顺序性**：步骤按执行顺序排列，编号清晰
- **连续性**：每步操作在步骤内完整描述，不跳转到其他章节
- **自包含**：禁止出现"详见第 X 章"、"参考外部文档"等模糊指引
- **无穿插**：步骤间不交叉引用，大模型无需推理步骤关联关系

**反例**：
```markdown
## 步骤 1: 分析需求
（详细分析过程见第 3 节）  ← 错误

## 步骤 3: 详细分析
...  ← 步骤 1 未完成，依赖后续内容
```

**正例**：
```markdown
## 步骤 1: 分析需求
1. 读取 PRD 文档路径: `{{input.prd_path}}`
2. 提取功能模块列表
3. 输出模块清单到: `{{output.module_list}}`

## 步骤 2: 生成文档
1. 读取模块清单: `{{output.module_list}}`
2. 按模板生成技术文档
3. 输出到: `{{output.tech_doc}}`
```

**职责聚焦**：

Skill 只描述"做什么"和"怎么做"，不涉及：
- 输出结果的最终用途或受众
- 其他系统的消费方式
- 业务价值或目标

**反例**：
```markdown
## Target Audience          ← 错误：与 Skill 职责无关
Generated documents serve:
- **devcrew-designer**: Architecture patterns...
```

**正例**：
```markdown
## Output                   ← 正确：只描述输出什么
- 技术文档：`{{output_dir}}/tech-stack.md`
- 架构文档：`{{output_dir}}/architecture.md`
```

---

## 2. 按需加载原则（模板分离）

当 Skill 涉及多种场景或输出格式时：

- **模板外置**：不同格式的文档模板放到 `templates/` 文件夹
- **条件加载**：Skill 根据参数判断，仅加载所需模板
- **避免混淆**：用不到的模板内容不混入 Skill 正文

**结构示例**：
```
skill-name/
├── SKILL.md              # 核心流程，通过参数决定加载哪个模板
├── templates/
│   ├── web-template.md   # Web 端文档模板
│   ├── mobile-template.md # 移动端文档模板
│   └── api-template.md   # API 文档模板
```

**路径规范**：
- **使用相对路径**：SKILL.md 中引用模板/配置时，使用相对于当前 Skill 目录的相对路径
- **禁止绝对路径**：不使用 `skill-name/templates/xxx.md` 这类带 Skill 名称的路径
- **禁止上级路径**：不使用 `../other-skill/templates/xxx.md` 跨 Skill 引用

**路径示例**：
| 场景 | 正确路径 | 错误路径 |
|------|---------|---------|
| 引用自身模板 | `templates/web-template.md` | `skill-name/templates/web-template.md` |
| 引用自身配置 | `reference.md` | `./skill-name/reference.md` |
| 引用外部配置 | 通过输入参数传入路径 | `../other-skill/config.json` |

**SKILL.md 中的条件加载**：
```markdown
## 步骤 2: 加载对应模板
根据 `{{input.platform_type}}` 加载模板：
- `web` → 加载 `templates/web-template.md`
- `mobile` → 加载 `templates/mobile-template.md`
```

---

## 3. 输入输出原则（接口契约）

每个 Skill 必须明确定义输入输出契约：

| 要素 | 短内容 | 长内容（文档） |
|------|--------|----------------|
| **输入** | 变量形式 `{{input.param}}` | 明确文件路径 `{{input.config_path}}` |
| **输出** | 变量形式 `{{output.result}}` | 模板 + 路径 + 命名规则 |
| **过程** | 步骤内联处理 | 不依赖外部隐式逻辑 |

**输入定义示例**：
```markdown
## 输入参数
- `prd_path`: PRD 文档路径（必填）
- `platform_type`: 平台类型，枚举值：web/mobile/desktop
- `output_dir`: 输出目录（默认：./output）
```

**输出定义示例**：
```markdown
## 输出产物
- 技术设计文档：`{{output_dir}}/TECH-DESIGN-{{module_name}}.md`
  - 使用模板：`templates/tech-design-template.md`
  - 命名规则：大写模块名替换 `{{module_name}}`
```

---

## 4. 编程严谨原则（伪代码设计）

Skill 设计应像编程一样严谨：

- **明确输入**：所有依赖前置定义，无隐式假设
- **瀑布执行**：步骤线性执行，无跳转、无循环（除非显式声明）
- **按需引用**：外部资源显式加载，不自动继承
- **确定性输出**：相同输入产生相同输出

**Skill 即伪代码**：
```markdown
## 执行流程

INPUT: prd_path, platform_type, output_dir

STEP 1: 验证输入
  IF prd_path 不存在 THEN 报错并退出
  IF platform_type 不在 [web, mobile, desktop] THEN 报错并退出

STEP 2: 加载模板
  template = LOAD("templates/" + platform_type + "-template.md")

STEP 3: 生成文档
  content = RENDER(template, {prd_data: READ(prd_path)})
  WRITE(output_dir + "/output.md", content)

OUTPUT: output_dir + "/output.md"
```

**条件执行显式声明**：

条件逻辑必须在步骤内显式声明，不能使用前置章节的"适用条件"代替执行判断。

**反例**：
```markdown
### When to Invoke        ← 错误：前置条件说明
- `platform_type` is `web`, `mobile`, `desktop`

### Step 4: Analyze UI
Invoke `ui-analyzer`...    ← 错误：未显式判断条件
```

**正例**：
```markdown
### Step 4: Analyze UI
If `platform_type` in [`web`, `mobile`, `desktop`]:
1. **Invoke** `speccrew-knowledge-techs-ui-analyze`
Else:
1. **Skip** this step
```

---

## 5. 逐级披露原则（渐进式信息架构）

信息按重要性分层，避免一次性暴露所有细节：

| 层级 | 位置 | 内容 | 读取时机 |
|------|------|------|----------|
| **L1 核心** | `SKILL.md` | 执行流程、关键步骤、输入输出定义 | 每次必载 |
| **L2 参考** | `reference.md` | API 详情、配置选项、错误代码表 | 按需查阅 |
| **L3 示例** | `examples.md` | 具体使用案例、输入输出样例 | 需要时参考 |
| **L4 模板** | `templates/*.md` | 各类输出格式模板 | 条件加载 |
| **L5 脚本** | `scripts/*` | 辅助工具、验证脚本 | 执行时调用 |

**设计要点**：
- **一层深度**：SKILL.md 直接链接到同级文件，不嵌套目录
- **显式引用**：使用 `[reference.md](reference.md)` 明确告知存在附加资料
- **渐进加载**：Agent 先读核心流程，需要时再深入细节
- **先定义后使用**：引用外部配置前必须显式声明读取，不能在读取前描述其内容

**配置引用规范（变量定义-使用原则）**：

外部配置文件如同变量，必须先"定义"（声明读取）后"使用"（引用内容）：

| 顺序 | 操作 | 说明 |
|------|------|------|
| 1 | **声明读取** | 在 Step 开头明确声明："读取配置文件 X" |
| 2 | **描述内容** | 声明后才能描述该配置的内容和用途 |
| 3 | **使用配置** | 基于已读取的配置执行操作 |

**反例 - 先使用后定义**：
```markdown
## 步骤 1: 分析源码
根据技术栈映射表确定文件扩展名...  ← 错误：未声明读取就使用

> **配置引用**: 读取 `tech-stack-mappings.json`  ← 声明放在后面
```

**正例 - 先定义后使用**：
```markdown
## 步骤 1: 分析源码

1. **读取配置**: 读取 `speccrew-workspace/docs/configs/tech-stack-mappings.json`
2. **确定扩展名**: 根据 `tech_stack` 参数查询配置，确定源码文件扩展名
3. **定位文件**: 使用确定的扩展名搜索源码文件
```

**多配置引用示例**：
```markdown
## 步骤 3: 识别功能

1. **读取配置**:
   - 读取 `feature-granularity-rules.json` - 确定功能拆分策略
   - 读取 `validation-rules.json` - 验证功能命名规范

2. **确定拆分策略**: 根据功能复杂度查询 `feature-granularity-rules.json`...
3. **验证命名**: 使用 `validation-rules.json` 验证功能名称...
```

**SKILL.md 中的引用示例**：
```markdown
## 快速开始
[核心步骤...]

## 详细参考
- API 完整说明：[reference.md](reference.md)
- 使用示例：[examples.md](examples.md)
- 输出模板：见 `templates/` 目录
```

**执行细节位置规范**：

执行逻辑必须放在 Workflow 对应 Step 内，禁止在 Output 或其他前置章节描述执行细节。

| 内容类型 | 正确位置 | 错误位置 |
|---------|---------|---------|
| 步骤执行逻辑 | Workflow 对应 Step 内 | Output 章节前置说明 |
| 子 Agent 调用参数 | Step 执行指令中 | 独立章节前置描述 |
| 输出格式示例 | Reference Guides | Workflow 步骤中 |

**反例**：
```markdown
## Output
### UI Style Analysis Integration    ← 错误：执行细节混入输出定义
For frontend platforms, invoke `ui-analyzer`:
- Input: `source_path`, `platform_id`
- Output: ui-style docs

## Workflow
### Step 4: UI Style Analysis        ← 错误：只有标题，无执行细节
```

**正例**：
```markdown
## Output
- UI 风格文档：`{{output_dir}}/ui-style/` (frontend platforms only)

## Workflow
### Step 4: UI Style Analysis
If `platform_type` in [web, mobile, desktop]:
1. **Invoke** `speccrew-knowledge-techs-ui-analyze` with:
   - `source_path`: `{{source_path}}`
   - `platform_id`: `{{platform_id}}`
   - `output_path`: `{{output_path}}/ui-style/`
2. **Wait** for completion
```

**章节结构规范**：

```
## Workflow              ← 只包含执行步骤
### Step 1: ...
### Step 2: ...

---                      ← 分隔线明确区分

## Reference Guides      ← 详细规范、示例、模板说明
### Mermaid Guide
### Document Structure

---                      ← 分隔线

## Template Usage        ← 模板使用说明
```

**禁止**：在 Workflow 前插入执行细节说明章节
**禁止**：在 Step 中嵌套子章节描述详细规范

---

## 6. 工作外包原则（子 Agent 委派）

复杂任务通过子 Agent 处理，当前 Agent 只关注结果，不关注过程：

- **上下文减负**：将复杂子任务外包，减少当前 Agent 上下文负担
- **小颗粒度 Skill**：配合细粒度的 Skill，每个 Skill 专注单一职责
- **通用子 Agent**：指派通用子 Agent，动态赋予所需 Skill
- **输入完备**：子 Agent 调用时提供 Skill 所需的全部输入参数
- **结果导向**：只接收子 Agent 返回的最终结果，不介入执行过程

**适用场景**：
| 场景 | 当前 Agent | 子 Agent |
|------|-----------|----------|
| 代码审查 | 接收审查报告 | 执行代码分析、生成审查意见 |
| 文档生成 | 接收生成文档 | 读取模板、填充数据、格式化输出 |
| 批量处理 | 接收汇总结果 | 并行处理多个文件、聚合结果 |
| 复杂计算 | 接收计算结果 | 执行算法、返回数值/结论 |

**调用模式（使用 speccrew-task-worker）**：

`speccrew-task-worker` 是一个通用无职能的 Worker Agent，必须通过 `skill_path` 参数赋予具体 Skill 才能执行任务。

```markdown
## 步骤 3: 批量生成模块文档（外包给子 Agent）

并行调用多个 `speccrew-task-worker` 实例：

**Worker 实例 1 - 生成用户模块文档：**
- **skill_path**: `.speccrew/skills/module-doc-gen/SKILL.md`
- **context**:
  - `module_name`: `user`
  - `module_path`: `./src/modules/user`
  - `output_path`: `./docs/modules/user.md`
  - `template_path`: `./templates/module-doc-template.md`

**Worker 实例 2 - 生成分单模块文档：**
- **skill_path**: `.speccrew/skills/module-doc-gen/SKILL.md`
- **context**:
  - `module_name`: `dispatch`
  - `module_path`: `./src/modules/dispatch`
  - `output_path`: `./docs/modules/dispatch.md`
  - `template_path`: `./templates/module-doc-template.md`

**子 Agent 返回格式**:
```json
{
  "status": "success",
  "output_path": "./docs/modules/user.md",
  "summary": "Generated user module documentation"
}
```

**当前 Agent 继续**: 收集所有 Worker 返回结果，生成索引文档
```

**任务清单生成器模式（Task List Generator）**：

当编排逻辑复杂（涉及动态数量的 Worker 调度）时，Skill 可充当"任务清单生成器"：输出结构化 JSON 任务清单，由调用方 Agent 消费并循环 dispatch Workers。

**适用场景**：
| 场景 | 传统模式（错误） | 任务清单模式（正确） |
|------|-----------------|-------------------|
| 动态数量模块分析 | Skill 内部循环 dispatch Workers | Skill 输出任务清单 JSON，Agent 循环 dispatch |
| 条件性任务调度 | Skill 判断条件后 dispatch | Skill 输出带条件标记的任务清单，Agent 决策 dispatch |

**Skill 输出格式示例**：
```json
{
  "tasks": [
    {
      "skill_path": ".speccrew/skills/module-analyze/SKILL.md",
      "context": { "module_name": "user", "platform": "backend-spring" },
      "priority": "high"
    },
    {
      "skill_path": ".speccrew/skills/module-analyze/SKILL.md",
      "context": { "module_name": "dashboard", "platform": "web-vue" },
      "priority": "high"
    }
  ]
}
```

**Agent 消费示例**：
```markdown
## Step 3: 根据任务清单循环 dispatch Workers
读取 Step 2 输出的任务清单 JSON，对每个 task 条目：
1. 使用 Agent tool dispatch `speccrew-task-worker`
2. 传入 `skill_path` 和 `context`
3. 等待所有 Workers 完成后继续
```

**核心原则**：Skill 只负责"规划做什么"，Agent 负责"执行调度"。

**强制委派规则（Worker Mandatory）：**

Agent 在以下情况下 **必须** 委派 Worker，禁止自身直接执行 Skill：

| 场景 | 必须委派 | 原因 |
|------|---------|------|
| 需要处理 2 个以上同类任务 | ✅ | 并行处理效率更高，且避免 Agent 上下文溢出 |
| 单个任务预计产出超过 500 行 | ✅ | LLM 单次输出有限，Worker 可分段处理 |
| 任务涉及读取+生成完整文档 | ✅ | 保持 Agent 作为编排者，不陷入执行细节 |
| 简单的状态查询或脚本调用 | ❌ | Agent 可直接执行轻量操作 |

**Agent 文档中的强制声明**：
```markdown
## WORKER DELEGATION RULES
1. **MANDATORY**: When processing multiple features, MUST dispatch speccrew-task-worker for each feature
2. **FORBIDDEN**: DO NOT directly invoke skill to generate documents yourself when worker delegation is applicable
3. **MANDATORY**: For batch operations, MUST use script-based initialization (e.g., init-tasks, init-dispatch)
```

**设计要点**：
- **Skill 可复用**：子 Agent 使用的 Skill 应通用化，可被不同父 Agent 调用
- **输入自给自足**：子 Agent 不依赖父 Agent 的上下文，所有输入通过参数传递
- **输出标准化**：子 Agent 输出格式固定，便于父 Agent 解析和集成
- **错误隔离**：子 Agent 失败不影响父 Agent，可重试或降级处理

---

## 7. 检查点与恢复原则（断点续接）

SpecCrew 的任何多步骤流程都必须支持中断恢复，通过检查点机制实现：

**核心文件：**
| 文件 | 用途 | 粒度 |
|------|------|------|
| `.checkpoints.json` | 阶段级检查点状态 | 每个关键里程碑一个 checkpoint |
| `DISPATCH-PROGRESS.json` | Worker 调度进度 | 每个 Worker 任务一条记录 |
| `WORKFLOW-PROGRESS.json` | 全流程阶段管理 | 每个阶段一个状态 |

**设计要点：**
- **多层检查点**：每个阶段应有 3-5 个检查点，对应关键里程碑（如澄清完成、文档生成完成、用户确认）
- **细粒度追踪**：对于并行 Worker 任务，每个 Worker 独立追踪状态（pending → in_progress → completed/failed）
- **恢复逻辑**：Skill 启动时检查检查点文件，跳过已完成步骤，重试失败任务
- **真实时间戳**：所有时间戳使用 `node -e "console.log(new Date().toISOString())"` 生成，禁止占位符

**反例**：
```markdown
## Step 13: 完成确认
将 .checkpoints.json 中 prd_review.passed 设为 true  ← 错误：只有一个检查点，无法定位中断位置
```

**正例**：
```markdown
## Phase 0.2: 检查恢复状态
1. 读取 `.checkpoints.json`
2. 评估各检查点状态：
   | Checkpoint | 若已通过 | 恢复位置 |
   |-----------|---------|---------|
   | requirement_clarification | 跳过澄清 | Step 4 |
   | sub_prd_dispatch | 跳过生成 | Phase 4 |
   | prd_review | 全部完成 | 询问用户 |
3. 检查 DISPATCH-PROGRESS.json，跳过 completed 任务，重试 failed 任务
```

---

## 8. 复杂度自适应原则（按需选路）

当同一职责存在轻量和复杂两种场景时，应拆分为独立 Skill，由 Agent 自动路由：

**设计要点：**
- **拆分而非分支**：不在一个 Skill 中用 if-else 处理两种复杂度，而是拆为两个独立 Skill
- **Agent 层路由**：复杂度判断逻辑放在 Agent 中，不在 Skill 中
- **判断指标明确**：提供可量化的判断依据（如模块数、Feature 数），避免主观判断
- **默认走轻量路径**：不确定时默认简单，升级比降级容易
- **可升级**：轻量 Skill 执行中发现复杂度升级时，应能中止并切换到复杂 Skill

**反例**：
```markdown
## Step 1: 判断复杂度
如果需求复杂：
  执行 Step 2-15（完整流程）
如果需求简单：
  执行 Step 2-6（精简流程）  ← 错误：一个 Skill 内混合两套流程
```

**正例**：
```
speccrew-product-manager.md (Agent)
├── Phase 1: 复杂度评估
│   ├── 简单（≤2模块, ≤5 Features）→ 调用 pm-requirement-simple/SKILL.md
│   └── 复杂（3+模块, 6+ Features）→ 调用 pm-requirement-analysis/SKILL.md
```

---

## 9. 方法论内化原则（思维指引）

领域方法论（如 ISA-95、DDD 等）应作为 Skill 的内化思维框架，而非独立交付物：

**设计要点：**
- **融入而非独立**：方法论指导以 blockquote 形式嵌入 Skill 步骤中，不生成独立的方法论文档
- **步骤对齐**：方法论的每个阶段映射到 Skill 的具体步骤
- **思维提示**：在关键步骤前用 `> ISA-95 Stage X Thinking` 提示思考方向
- **不增加产出物**：方法论只影响思考过程和产出质量，不增加新的输出文件

**反例**：
```markdown
## Step 5: 生成建模文档
输出 `crm-system-bizs-modeling.md`  ← 错误：方法论变成了独立交付物
```

**正例**：
```markdown
## Step 5: 生成 PRD 功能需求

> **ISA-95 Stage 2 Thinking — Functions in Domain**
> - 从业务活动分解功能，而非从技术实现分解
> - 关注"做什么"而非"怎么做"
> - 每个功能对应一个可验证的业务目标

1. 读取 PRD 模板 Section 3
2. 按业务活动维度填写功能需求...
```

---

## 10. 阶段内容边界原则（职责分离）

每个阶段（PM、Feature Designer、System Developer）有明确的内容边界，禁止越界输出：

**边界定义：**
| 阶段 | 允许输出 | 禁止输出 |
|------|---------|---------|
| PM | 业务需求、用户故事、功能列表、验收标准 | API 定义、类图、代码、数据库设计 |
| Feature Designer | 交互流程、数据字段、业务规则、API 契约 | 业务决策、优先级调整 |
| System Developer | 技术方案、代码实现、架构设计 | 需求变更、功能增删 |

**设计要点：**
- **术语匹配阶段**：PM 用业务语言（"用户交互"），Feature Designer 用设计语言（"交互流程"），System Developer 用技术语言（"API 端点"）
- **模板约束**：模板字段设计应天然排除越界内容（如 PM 模板不包含 API 字段）
- **边界声明**：每个 Skill 开头声明本阶段的内容边界

**反例**：
```markdown
## PM Skill - Step 8: Feature Breakdown
| Feature | Type | Pages/Endpoints |   ← 错误：PM 阶段出现 Endpoints（技术概念）
```

**正例**：
```markdown
## PM Skill - Step 8: Feature Breakdown
| Feature | Type | Scope |              ← 正确：用业务概念 Scope 替代技术概念
```

---

## 11. 确认门控原则（HARD STOP）

关键决策点必须设置强制确认门控，禁止 LLM 自动跳过：

**设计要点：**
- **显式标记**：使用 `⚠️ HARD STOP` 标记确认点，确保 LLM 不会跳过
- **禁止自动继续**：门控后禁止一切自动操作（不更新状态、不建议下一步、不调用工具）
- **状态保护**：门控期间不修改任何进度文件，等用户确认后再更新
- **修改循环**：用户要求修改时，执行修改后重新呈现，再次进入门控

**防绕过强制规则：**

- **禁止自动化借口**：Worker 不得以"自动化执行场景"、"无用户在场"、"批处理模式"等理由绕过 HARD STOP
- HARD STOP 是 **不可协商** 的暂停点，无论执行场景如何都必须暂停
- 如果确实需要跳过确认（如自动化测试场景），必须通过 Skill 参数显式传入 `skip_confirmation: true`，而非 Worker 自行决定

**反例**：
```markdown
⚠️ **HARD STOP — WAIT FOR USER CONFIRMATION**

由于这是自动化执行场景，我将继续下一步...  ← 错误：Worker 自行决定绕过门控
```

**正例**：
```markdown
⚠️ **HARD STOP — WAIT FOR USER CONFIRMATION**

呈现摘要后停止，等待用户明确确认后才继续。
若需跳过确认，应在调用时传入 skip_confirmation=true。
```

**反例**：
```markdown
## Step 12: 完成
PRD 已生成，建议进入下一阶段。  ← 错误：未等用户确认就建议继续
```

**正例**：
```markdown
## Step 12: 用户确认

⚠️ **HARD STOP — WAIT FOR USER CONFIRMATION**

呈现摘要后停止，禁止：
- 更新状态文件
- 建议下一阶段
- 调用任何工具

仅在用户明确确认后：
→ 更新 .checkpoints.json
→ 更新 WORKFLOW-PROGRESS.json
→ 输出完成消息
```

**HARD GATE（强制执行门控）**：

HARD STOP 用于等待用户确认，HARD GATE 用于强制执行不可跳过的步骤序列。两者互补：

| 类型 | 目的 | 触发方式 | 行为 |
|------|------|---------|------|
| HARD STOP | 等待用户确认 | 用户决策点 | 停止一切操作，等用户回复 |
| HARD GATE | 强制执行后续步骤 | 关键流程节点 | 禁止跳过后续步骤，必须逐步执行完毕 |

**HARD GATE 使用场景**：
- 前一步的输出是后续多步骤的必要输入（如 matcher 结果 → 初始化 → 分析 → 汇总）
- Agent 倾向于"总结并继续"而跳过中间步骤时
- 多步骤流程中，中间步骤无需用户确认但不可省略

**HARD GATE 示例**：
```markdown
### Step 1: Module Matching
...matcher 完成后输出匹配结果...

> 🛑 **HARD GATE — DO NOT SKIP Steps 2-5**
> matcher 输出是 Step 2 的输入，不是最终结果。
> 必须逐步执行 Step 2→3→4→5，不得跳转到后续 Phase。

### Step 2: Generate Task Plan
...

### Step 5: Update Status
...
```

**多重保障模式（Triple Enforcement）**：

对于关键 HARD GATE，在三个位置重复声明以防止大模型遗忘：

| 位置 | 内容 | 作用 |
|------|------|------|
| 触发步骤之后 | `🛑 HARD GATE — DO NOT SKIP Steps X-Y` | 即时拦截跳过意图 |
| 最后一步之后 | `🛑 Completion Check — verify all steps completed` | 完成确认 |
| 下一 Phase 开头 | `PRE-CONDITION: Steps X-Y must be completed` | 兜底防护 |

---

## 12. 上下文管理原则（长文档防混乱）

当 Skill 文档超过 300 行时，大模型容易出现"前面的指令后面忘"的问题，导致执行混乱。必须通过以下策略管理上下文：

**核心策略：**

| 策略 | 说明 | 目的 |
|------|------|------|
| **关键规则就近重复** | 强制规则放在它管控的 Step 前面，而非仅在文档末尾的 Constraints 中 | 防止大模型执行到中段时遗忘开头的规则 |
| **步骤完全自包含** | 每个 Step 必须包含执行所需的全部信息，不引用其他 Step 的内容 | 消除跨步骤记忆依赖 |
| **禁止前向引用** | 不引用后续步骤的内容（如"详见 Step 12"） | 保持线性执行，不产生记忆干扰 |
| **阶段里程碑摘要** | 复杂阶段完成后，输出"已完成 / 下一步"的简短摘要 | 帮助大模型重新锚定当前位置 |
| **Phase 级规则前置** | 每个 Phase 开头重复该 Phase 的核心强制规则 | 即使大模型遗忘了全局 Constraints，Phase 级规则仍能约束行为 |

**关键规则就近重复：**

对于重要的强制规则（如"不要自己生成文档，必须调度 Worker"），不能只写在文件末尾的 Constraints 中。必须在它生效的 Step/Phase 前面再次声明。

**反例**：
```markdown
## Constraints (文件第 400 行)
- Must dispatch workers for Sub-PRD generation  ← 大模型执行到第 250 行时早已忘记

## Phase 4: Sub-PRD Generation (文件第 250 行)
Initialize dispatch tracking...  ← 没有重复强制规则，大模型可能自己生成
```

**正例**：
```markdown
## Phase 4: Sub-PRD Generation (文件第 250 行)

> ⚠️ **MANDATORY RULES FOR THIS PHASE:**
> 1. DO NOT generate Sub-PRDs yourself
> 2. MUST dispatch speccrew-task-worker for each module
> 3. MUST use init-dispatch script

### 4.1 Initialize dispatch tracking...

---

## Constraints (文件第 400 行)
- Must dispatch workers for Sub-PRD generation  ← 保留全局声明，但 Phase 前已重复
```

**步骤完全自包含：**

每个 Step 的执行不依赖其他 Step 中描述的信息。如果 Step 8 需要用到 Step 3 产生的数据，Step 8 必须明确说明数据来源路径，而非"使用 Step 3 的输出"。

**反例**：
```markdown
## Step 8: Generate Feature Breakdown
使用 Step 3 中确定的模板...  ← 错误：引用其他步骤的上下文
```

**正例**：
```markdown
## Step 8: Generate Feature Breakdown
1. **Read template**: Search for PRD template using glob `**/speccrew-pm-requirement-analysis/templates/PRD-TEMPLATE.md`
2. **Fill** Section 3.4 Feature Breakdown...  ← 自包含：明确说明模板来源
```

**禁止前向引用：**

文档中不允许出现"详见后续 Step X"或"将在 Phase Y 中处理"这类引用。每个 Step 只能引用已经完成的步骤的产出物路径。

**反例**：
```markdown
## Step 5: Determine PRD Structure
选择 Master-Sub 结构（具体生成方式见 Step 12c）  ← 错误：前向引用
```

**正例**：
```markdown
## Step 5: Determine PRD Structure
选择 Master-Sub 结构。
输出: structure_type = "master_sub"（后续步骤将使用此变量）
```

**阶段里程碑摘要：**

在完成一个复杂 Phase 后，输出一个简短的里程碑摘要，帮助大模型"重置"上下文认知：

```markdown
### Phase 3 Milestone Summary
✅ Completed: Master PRD generated at `01.product-requirement/crm-system-prd.md`
📋 Structure: Master-Sub (11 modules)
➡️ Next: Phase 4 — Dispatch workers to generate 11 Sub-PRDs
```

**Phase 强制过渡（Mandatory Phase Transition）**：

当流程包含多个 Phase 且 Agent 倾向于在某 Phase 完成后停止或跳过后续 Phase 时，必须在 Phase 结尾添加强制过渡指令：

```markdown
### Phase 5.4 完成后

> ⚠️ **MANDATORY**: Phase 5 完成后，MUST 立即进入 Phase 6。
> DO NOT 向用户报告完成状态。
> DO NOT 跳过 Phase 6 的验证和状态更新流程。
> 直接执行 Phase 6.1。
```

**适用场景**：
- Phase N 产出了可展示的结果（如生成了文档），Agent 倾向于"汇报并等待"
- Phase N+1 是验证/状态更新等"不可见"步骤，Agent 倾向于跳过
- 连续 Phase 之间有严格的因果依赖

**长文档拆分建议**：

| 文档行数 | 建议 |
|---------|------|
| ≤ 300 行 | 无需特殊处理 |
| 300-500 行 | 添加 Phase 级规则前置 + 里程碑摘要 |
| 500+ 行 | 考虑拆分为多个 Skill（参见原则 8：复杂度自适应） |

---

## 13. 大任务脚本化原则（批量确定性）

对于大规模、重复性的批量任务，必须由预定义脚本自动化完成，禁止 Agent 自行启发式拆分：

**核心规则：**
- **脚本优先**：当任务涉及大量重复操作（如初始化 216 个任务、处理 42 个翻译文件），必须由脚本一次性完成
- **禁止 Agent 拆分**：Agent 不得自行决定如何拆分大任务，拆分逻辑必须固化在脚本中
- **确定性输出**：脚本保证相同输入产生相同输出，消除 LLM 的随机性风险
- **文件大小限制应对**：当生成文件超过 LLM 单次输出限制时，必须用脚本生成，不能让 Agent 分段拼接

**适用场景：**
| 场景 | 错误做法 | 正确做法 |
|------|---------|---------|
| 初始化 216 个设计任务 | Agent 手动构造 JSON | `update-progress.js init-tasks` 脚本自动扫描生成 |
| 同步 42 个翻译文件 | Agent 逐文件手动修改 | 脚本批量读取源文件差异并应用 |
| 生成 72 × 3 的任务矩阵 | Agent 自行决定分批逻辑 | 脚本交叉生成 feature × platform 矩阵 |

**反例**：
```markdown
## Step 5: 初始化调度任务
手动创建 tasks-list.json，包含所有 216 个任务...  ← 错误：Agent 自行生成大文件
```

**正例**：
```markdown
## Step 5: 初始化调度任务
执行脚本自动生成任务列表：
```bash
node update-progress.js init-tasks \
  --file DISPATCH-PROGRESS.json \
  --stage 03_system_design \
  --features-dir ../02.feature-design \
  --platforms backend-spring,web-vue,mobile-uniapp
```
```

---

## 14. 否定清单原则（FORBIDDEN 模式）

仅靠正面规则（"描述业务视角"）不足以约束 LLM 行为，必须配合明确的否定清单：

**核心规则：**
- **Include + Exclude 并行**：每个内容约束同时提供"应该包含"和"禁止包含"两张清单
- **具体反例**：FORBIDDEN 清单必须包含具体示例，而非抽象描述
- **就近声明**：FORBIDDEN 规则在它管控的章节/Step 前面声明，不仅放在文件末尾
- **AI-NOTE 嵌入模板**：在模板的关键章节添加 AI-NOTE 注释，提醒 LLM 内容边界

**清单模式示例：**
```markdown
# Key Rules

| Rule | Description |
|------|-------------|
| **FORBIDDEN: File Paths** | Do NOT include file paths like `src/views/...`, `yudao-module-xxx/...` |
| **FORBIDDEN: Framework Code** | Do NOT include Java classes, SQL DDL, Vue templates, TypeScript API code |
| **FORBIDDEN: Component Names** | Do NOT mention `el-button`, `wd-cell`, `ElDatePicker` etc. |
| **FORBIDDEN: TODO/FIXME** | Design docs MUST have complete implementation, no placeholder comments |
```

**模板中的 AI-NOTE 示例：**
```markdown
<!-- AI-NOTE: CRITICAL — This section describes business data entities.
FORBIDDEN: database table names, column names, SQL types (VARCHAR, BIGINT).
USE: business types (Text, Number, Date, Enum). -->
```

**反例**：
```markdown
| Focus on WHAT not HOW | Describe what system does, not how it's implemented |
← 错误：过于抽象，LLM 仍会生成技术细节
```

**正例**：
```markdown
| **FORBIDDEN: Framework Code** | Do NOT include actual code — no Java `@TableName`, SQL `CREATE TABLE`, Vue `<el-button>`. Use conceptual business descriptions instead. |
← 正确：具体到框架名、注解名、代码片段类型
```

---

## 15. 时间戳完整性原则（防伪造）

LLM 生成的时间戳不可信，必须通过多层防御确保时间戳来源于系统：

**三层防御机制：**

| 层级 | 防御手段 | 具体措施 |
|------|---------|---------|
| **脚本层** | 移除外部参数 | `update-progress.js` 不接受 `--started-at`/`--completed-at` 参数，强制使用 `getTimestamp()` |
| **Agent 层** | FORBIDDEN 规则 | Agent 文档中声明 `FORBIDDEN: Timestamp fabrication` — 禁止生成、构造或传递时间戳 |
| **Skill 层** | 禁止手动创建 | Skill 中声明 `FORBIDDEN: Manual JSON creation` — 禁止用 create_file 创建进度文件 |

**反例**：
```markdown
## Step 7: 更新进度
node update-progress.js update-task --task-id F-001 --status completed --completed-at "2026-04-11T10:30:00Z"
← 错误：时间戳由 Agent 构造
```

**正例**：
```markdown
## Step 7: 更新进度
node update-progress.js update-task --task-id F-001 --status completed
← 正确：脚本自动生成时间戳
```

---

## 16. 跨产出物一致性原则（契约对齐）

当多个 Skill/Agent 的产出物相互引用时，必须确保一致性：

**核心规则：**
- **API 路由一致性**：前端/移动端的 API 调用路径必须与 API Contract 和后端设计完全一致，逐路由验证
- **跨 Feature 依赖标记**：引用其他 Feature 的功能时，必须使用 `[DEPENDENCY: F-XXX-NNN]` 标记并定义降级策略
- **数据模型一致性**：同一数据实体在不同平台设计文档中的字段定义必须一致

**依赖标记示例：**
```markdown
### 冲突检测集成
[DEPENDENCY: F-APPT-002] — 预约冲突检测功能

**降级策略**：当 F-APPT-002 未实现时：
- 前端：隐藏"冲突检测"按钮
- 后端：跳过冲突校验，仅记录日志
- 移动端：显示"冲突检测暂不可用"提示
```

**Checklist 验证项：**
```markdown
- [ ] API routes match API Contract exactly — verified route-by-route
- [ ] Cross-Feature dependencies explicitly marked with [DEPENDENCY: F-XXX-NNN]
- [ ] Data model fields consistent across all platform design documents
```

---

## 17. 编排权分层原则（编排权分层）

Agent-Worker-Skill 三层架构中，编排权严格分层：

**层级定义：**
| 层级 | 角色 | 职责 | 禁止行为 |
|------|------|------|---------|
| **Agent** | 编排者 | 决策、路由、dispatch Workers、汇总结果 | 自身执行 Skill 生成大文档 |
| **Worker** | 执行者 | 接收 Skill，执行单一任务，返回结果 | dispatch 其他 Worker |
| **Skill** | 操作手册 | 定义"做什么"和"怎么做" | 包含 dispatch Worker 指令 |

**核心规则：**
- **编排权只在 Agent 层**：只有 Agent 可以使用 Agent tool dispatch Workers
- **Worker 不嵌套**：Worker 接收 Skill 后执行任务并返回结果，绝不 dispatch 其他 Worker
- **Skill 无调度逻辑**：Skill 中禁止出现 "Launch Worker"、"Dispatch Worker"、"Use Agent tool to invoke worker" 等指令
- **Agent Tool 声明一致性**：需要 dispatch Worker 的 Agent，其定义文件的 `tools` 列表中必须包含 `Agent`

**反例**：
```markdown
## Skill: module-initializer/SKILL.md
### Step 3: Dispatch Analysis Workers          ← 错误：Skill 中出现 dispatch
For each matched module:
  Use Agent tool to invoke speccrew-task-worker  ← 错误：Worker 没有 Agent tool
    with skill: module-analyze/SKILL.md
```

**正例**：
```markdown
## Skill: module-initializer/SKILL.md
### Step 3: Generate Task Plan                  ← 正确：Skill 输出任务清单
Output JSON task list for each matched module.

## Agent: product-manager.md
### Path B Step 3: Execute Analysis             ← 正确：Agent 消费清单并 dispatch
Read task plan from Step 2 output.
For each task entry:
  dispatch speccrew-task-worker with skill and context
```

**判断口诀**：
- "谁来决定做几次？" → Agent（基于任务清单）
- "每次做什么？" → Skill（操作手册）
- "谁来执行？" → Worker（被 Agent dispatch）

---

## 18. 连续执行原则（无干扰工作流）

Agent 在工作流中应保持连续执行，禁止非必要的中断和确认请求：

**禁止的中断行为：**
| 中断类型 | 示例 | 为什么禁止 |
|---------|------|-----------|
| 分段确认 | "是否继续下一步？" | 打断工作流连贯性 |
| 预告式确认 | "接下来我将生成 PRD，确认？" | 增加不必要的交互轮次 |
| 进度汇报中断 | "Step 3 已完成，是否继续 Step 4？" | 每步都中断严重影响效率 |
| 选项确认 | "建议 A/B/C，请选择" | 除非是真正的决策点 |
| 分段输出 | "文档较长，先输出前半段" | 应委派 Worker 处理 |
| 能力声明 | "我可以帮你做 X/Y/Z" | 直接执行，不需要声明 |

**允许的暂停点：**
| 暂停类型 | 条件 |
|---------|------|
| HARD STOP 门控 | Skill/Agent 中显式标记的用户确认点 |
| 真正模糊的需求 | 无法从上下文推断用户意图 |
| 不可恢复错误 | 关键文件缺失、权限问题等 |
| 安全敏感操作 | 涉及删除、发布等不可逆操作 |

**设计要点**：
- Agent 定义中应包含 `CONTINUOUS EXECUTION RULES` 章节
- 规则必须同时列出"禁止"和"允许"，给出明确边界
- 新 Agent 设计时默认添加此规则，防止首次使用体验断裂

---

## 19. 脚本语言一致性原则（代码语言统一）

项目中所有脚本、配置注释、Skill 文档的语言应保持一致：

**核心规则：**
- **代码注释统一英文**：所有 `.js`、`.py`、`.sh` 等脚本文件的注释使用英文
- **Skill 文档统一英文**：所有 `SKILL.md` 文件使用英文编写（遵循 Agent 语言自适应原则，Agent 输出跟随用户语言，但 Skill 定义作为"代码"保持英文）
- **Agent 文档统一英文**：Agent 定义文件使用英文编写（同上）
- **用户交互跟随用户**：Agent 与用户的对话输出跟随用户输入语言（参见语言自适应原则）

**判断标准**：
| 文件类型 | 语言 | 原因 |
|---------|------|------|
| 脚本注释 (.js/.py/.sh) | 英文 | 代码可移植性 |
| SKILL.md | 英文 | Skill 是"代码"级指令 |
| Agent 定义 (.md) | 英文 | Agent 行为定义 |
| 模板文档 (templates/) | 英文 | 国际化兼容 |
| 用户面对的输出 | 跟随用户语言 | 语言自适应 |
| README / 文档 | 多语言版本 | 国际化支持 |

---

## 20. 清单驱动执行原则（清单驱动执行）

LLM 执行长流程时容易"遗忘"或"跳过"中间步骤，纯文本约束（如 HARD GATE）效果有限。通过可追踪的任务清单文件驱动执行，可有效防止步骤跳过并支持断点恢复。

**核心流程（三步循环）：**

| 步骤 | 操作 | 产出 |
|------|------|------|
| **生成清单** | 在开始多步骤工作前，通过脚本生成可追踪的任务清单文件 | `DISPATCH-PROGRESS.json` 或等效文件 |
| **逐项执行** | 按清单顺序执行，每完成一项通过脚本更新状态 | `status: pending → in_progress → completed` |
| **自检验证** | 进入下一阶段前，读取清单文件验证所有项目已完成 | 程序化检查 `counts.pending == 0` |

**为什么文本约束不够：**
| 约束方式 | 失败模式 | 可靠性 |
|---------|---------|--------|
| 文本 HARD GATE（"DO NOT SKIP"） | LLM 上下文窗口遗忘，自然按章节跳转 | ❌ 低 |
| 多点重复声明（三重保障） | 仍属文本约束，LLM 可以推理绕过 | ⚠️ 中 |
| **程序化检查**（读文件 + 判断条件） | LLM 必须执行命令获取结果，无法绕过 | ✅ 高 |

**程序化自检示例**：
```markdown
### Phase 2.0: 知识库初始化验证（MANDATORY）

Step 1: 读取 DISPATCH-PROGRESS.json
Step 2: 评估条件：
  | 条件 | 动作 |
  |------|------|
  | 文件不存在 | 回退到 Path B Step 1 |
  | counts.pending > 0 | 回退到 Path B Step 3 |
  | counts.pending == 0 && counts.completed > 0 | 继续 Phase 2.1 |
  | counts.total == 0 | 无需分析，继续 Phase 2.1 |
```

**适用场景判断：**
| 条件 | 是否需要清单驱动 | 原因 |
|------|-----------------|------|
| 动态数量的并行任务（dispatch N 个 Workers） | ✅ 必须 | 数量不确定，需追踪每个任务状态 |
| 多阶段串行流程（5+ 步骤，Agent 容易跳过） | ✅ 推荐 | 防止 LLM 跳步，提供恢复点 |
| 需要断点恢复的长流程 | ✅ 推荐 | 上下文压缩后可从文件恢复进度 |
| 固定 3 步以内的简单流程 | ❌ 不需要 | 增加复杂度无收益 |
| 单次执行无需追踪的任务 | ❌ 不需要 | 清单开销大于收益 |

**清单文件标准格式：**
```json
{
  "stage": "阶段名称",
  "created_at": "ISO8601 时间戳（脚本生成）",
  "updated_at": "ISO8601 时间戳（脚本生成）",
  "counts": {
    "total": 0,
    "pending": 0,
    "in_progress": 0,
    "completed": 0,
    "failed": 0
  },
  "tasks": [
    {
      "id": "全局唯一 ID",
      "name": "任务描述",
      "status": "pending | in_progress | completed | failed",
      "created_at": "ISO8601"
    }
  ]
}
```

**生命周期管理：**
- **创建**：通过 `update-progress.js` 的 `init` 或 `init-knowledge-tasks` 等子命令生成
- **更新**：每个任务完成后通过 `update-progress.js update-task` 更新状态
- **验证**：进入下一阶段前读取文件，检查 `counts.pending == 0`
- **恢复**：上下文压缩后重新加载文件，跳过 `completed` 任务，重试 `failed` 任务

**已验证的应用场景：**
| 场景 | 清单文件位置 | 效果 |
|------|-------------|------|
| PM Agent Phase 5 Sub-PRD 分发 | `01.product-requirement/DISPATCH-PROGRESS.json` | 追踪每个模块的 Sub-PRD 生成进度 |
| PM Agent Path B 知识库初始化 | `knowledges/bizs/DISPATCH-PROGRESS.json` | 追踪每个特征的分析进度 |

**反例**：
```markdown
## Step 3: 执行分析
对每个匹配模块执行分析...
（分析了 3 个后停下来问用户是否继续）  ← 错误：无清单追踪，Agent 自行决定停止
```

**正例**：
```markdown
## Step 3: 执行分析（清单驱动）
读取 DISPATCH-PROGRESS.json：
- 总任务 156 个，已完成 0 个，待处理 156 个
对每个 status=pending 的任务：
1. dispatch Worker 执行分析
2. 完成后调用脚本更新状态
3. 继续下一个，直到所有任务完成
（不停止、不询问、不跳过）
```

---

## 原则关系图

```
┌───────────────────────────────────────────────────────────────┐
│                      Harness 原则体系                          │
├───────────────────────────────────────────────────────────────┤
│  ── 基础设计层 ──                                             │
│  1. 操作手册原则 ──→ 步骤清晰、连续、自包含                    │
│  2. 按需加载原则 ──→ 模板/资源条件分离                         │
│  3. 输入输出原则 ──→ 明确定义接口契约                          │
│  4. 编程严谨原则 ──→ 像伪代码一样严谨设计                      │
│  5. 逐级披露原则 ──→ 信息分层，渐进展示                        │
│  6. 工作外包原则 ──→ 复杂任务子 Agent 委派（含强制委派规则）   │
│                                                               │
│  ── 流程治理层 ──                                             │
│  7. 检查点与恢复原则 ──→ 断点续接，进度可见                    │
│  8. 复杂度自适应原则 ──→ 按需选路，拆分 Skill                  │
│  9. 方法论内化原则 ──→ 思维指引，非独立文档                    │
│  10. 阶段内容边界原则 ──→ 职责分离，禁止越界                   │
│  11. 确认门控原则 ──→ HARD STOP，强制确认                      │
│  12. 上下文管理原则 ──→ 长文档防混乱，规则就近重复             │
│                                                               │
│  ── 质量保障层 ──                                             │
│  13. 大任务脚本化原则 ──→ 批量确定性，禁止 Agent 自行拆分      │
│  14. 否定清单原则 ──→ FORBIDDEN 模式，Include + Exclude 并行   │
│  15. 时间戳完整性原则 ──→ 防伪造，三层防御机制                 │
│  16. 跨产出物一致性原则 ──→ 契约对齐，依赖标记                 │
│                                                               │
│  ── 架构治理层 ──                                             │
│  17. 编排权分层原则 ──→ Agent编排、Worker执行、Skill无调度     │
│  18. 连续执行原则 ──→ 无干扰工作流，禁止非必要中断             │
│  19. 脚本语言一致性原则 ──→ 代码英文、交互跟随用户             │
│  20. 清单驱动执行原则 ──→ 任务清单追踪，程序化自检，断点恢复   │
│  21. 执行权威分层原则 ──→ XML工作流为权威，SKILL.md为元数据    │
│  22. 调度上下文纯净原则 ──→ Context只传数据，禁止执行指令      │
│  23. 最小创建原则 ──→ 只创建显式定义产物，禁止预判创建         │
└───────────────────────────────────────────────────────────────┘
```

---

## 验收清单

创建或评审 Skill 时，检查：

- [ ] 步骤是否顺序编号，无跳转引用？
- [ ] 每步操作是否在步骤内完整描述？
- [ ] 输入参数是否有明确路径或变量定义？
- [ ] 输出文档是否有模板 + 路径 + 命名规则？
- [ ] 多场景模板是否分离到 `templates/`？
- [ ] 是否存在"详见 XX"等模糊指引？
- [ ] 流程是否像伪代码一样可线性执行？
- [ ] 详细信息是否通过链接渐进披露？
- [ ] 复杂任务是否考虑子 Agent 外包？子 Agent 输入是否完备？
- [ ] 是否包含与 Skill 职责无关的内容（如 Target Audience）？
- [ ] 执行细节是否放在 Workflow 对应 Step 内，而非前置章节？
- [ ] 条件执行是否在 Step 内显式声明，而非依赖前置条件说明？
- [ ] 是否定义了 .checkpoints.json 多层检查点？恢复逻辑是否完整？
- [ ] 复杂度不同的场景是否拆分为独立 Skill？路由逻辑是否在 Agent 层？
- [ ] 方法论是否以思维指引形式融入步骤？是否产生了不必要的独立文档？
- [ ] 各阶段的内容边界是否明确声明？模板字段是否排除越界内容？
- [ ] 关键决策点是否设置了 HARD STOP 门控？门控期间是否禁止自动操作？
- [ ] 超过 300 行的 Skill 是否在每个 Phase 前重复了核心强制规则？
- [ ] 步骤是否完全自包含，不引用其他步骤的上下文？
- [ ] 是否存在前向引用（"详见 Step X"、"将在 Phase Y 处理"）？
- [ ] 复杂阶段完成后是否有里程碑摘要？
- [ ] 大规模批量任务是否使用脚本自动化？是否禁止 Agent 自行拆分？
- [ ] 内容约束是否同时提供 Include 和 Exclude 清单？FORBIDDEN 规则是否有具体示例？
- [ ] 时间戳是否由脚本自动生成？是否禁止 Agent 构造时间戳？
- [ ] 多平台产出物的 API 路由、数据模型是否一致？跨 Feature 依赖是否标记？
- [ ] Agent 处理多任务时是否强制委派 Worker？是否禁止自身直接执行 Skill？
- [ ] Skill 中是否包含 dispatch Worker 指令？（禁止 — 编排权分层原则）
- [ ] 需要 dispatch Worker 的 Agent 是否在 tools 中声明了 Agent？
- [ ] 动态数量的 Worker 调度是否使用了任务清单生成器模式？
- [ ] 关键步骤序列是否设置了 HARD GATE + 多重保障（三点声明）？
- [ ] Phase 之间是否有强制过渡指令防止跳过？
- [ ] Agent 是否包含 CONTINUOUS EXECUTION RULES？是否禁止了非必要中断？
- [ ] 脚本注释和 Skill/Agent 文档是否统一使用英文？
- [ ] 涉及动态数量 Worker 调度的流程是否使用了 DISPATCH-PROGRESS.json 清单驱动？
- [ ] 多阶段串行流程是否在阶段入口添加了程序化自检（读文件 + 条件判断）？
- [ ] 清单文件的创建和更新是否通过脚本完成（禁止 Agent 手动构造 JSON）？
- [ ] Worker 是否读取了 workflow.agentflow.xml 并按 block 顺序执行？（执行权威分层原则）
- [ ] dispatch context 是否只包含数据参数，无执行指令？（调度上下文纯净原则）
- [ ] Worker 是否只创建了显式定义的文件和目录，无"预判"创建？（最小创建原则）
- [ ] 结构化输出（JSON/YAML）是否从模板复制生成，非手动构造？（最小创建原则）
- [ ] HARD STOP 是否被绕过？Worker 是否以"自动化"等理由自行继续？（确认门控原则 - 防绕过）

---

## 21. 执行权威分层原则（XML 工作流为权威）

Worker 执行 Skill 时必须遵循三层权威体系，确保执行流程的一致性和可预测性：

**三层权威：**

| 层级 | 来源 | 作用 | 优先级 |
|------|------|------|--------|
| **L1 执行计划** | `workflow.agentflow.xml` | 定义执行顺序、分支、门控 | 最高 |
| **L2 元数据** | `SKILL.md` | 输入输出定义、模板引用、补充上下文 | 次要 |
| **L3 数据参数** | Agent dispatch context | 路径、ID、配置值等数据参数 | 仅数据 |

**核心规则：**

- `workflow.agentflow.xml` 是 **唯一权威的执行计划**，定义了执行顺序、分支、门控
- `SKILL.md` 是 **元数据和补充上下文**（输入输出定义、模板引用等），不是执行计划
- Agent dispatch 的 context 是 **数据参数**，不是执行指令
- Worker **必须**在执行前读取 `workflow.agentflow.xml`
- Worker **必须**按 XML 文档顺序逐 block 执行并播报当前执行的 block

**执行流程：**

```
Worker 接收任务
    ↓
读取 workflow.agentflow.xml（必须）
    ↓
按 block 顺序逐个执行
    ↓
播报 "[Block P1-B3] 加载问题模板"
    ↓
执行 block 内容
    ↓
播报 "[Block P1-B4] 分析问题..."
    ↓
继续下一个 block
```

**反例**：
```markdown
Worker 只读 SKILL.md 就开始执行
跳过了 XML 中定义的问题生成步骤
直接生成 summary（完全忽略 XML 工作流）
```

**正例**：
```markdown
Worker 读取 workflow.agentflow.xml
按 block 顺序执行
播报 "[Block P1-B3] 加载问题模板" → 执行
播报 "[Block P1-B4] 生成问题列表" → 执行
播报 "[Block P1-B5] 用户确认" → 执行
```

---

## 22. 调度上下文纯净原则（Context 只传数据）

dispatch Worker 时的 context 字段必须保持纯净，只传递数据参数，禁止混入执行指令：

**核心规则：**

- dispatch Worker 时的 context 字段 **只传数据参数**（路径、ID、配置值等）
- **禁止** context 中包含执行指令、步骤序列、"Execution Requirements"
- 执行逻辑由 Skill 的 `workflow.agentflow.xml` 定义，不由调度方覆盖
- 违反此原则会导致 Worker 忽略 Skill 自身的工作流，直接执行 context 中的指令

**Context 内容规范：**

| 允许内容 | 禁止内容 |
|---------|---------|
| `"iteration_path": "..."` | `"Execution Requirements": "..."` |
| `"complexity": "simple"` | `"Step 1: Create ..."` |
| `"prd_path": "..."` | `"You should..."` |
| `"module_id": "M-001"` | `"Generate questions..."` |

**反例**：
```json
{
  "iteration_path": "...",
  "Execution Requirements": [
    "1. Create .clarification-summary.md",
    "2. Generate questions...",
    "3. Output JSON..."
  ]
}
← 错误：Worker 照做了这些指令，完全绕过了 Skill 工作流
```

**正例**：
```json
{
  "iteration_path": "d:/dev/project/iterations/001",
  "complexity": "simple",
  "prd_path": "d:/dev/project/iterations/001/01.product-requirement/prd.md"
}
← 正确：只传数据参数，执行逻辑由 XML 工作流定义
```

---

## 23. 最小创建原则（只创建显式定义的产物）

Worker 只能创建 Skill/XML 工作流中显式定义的文件和目录，禁止基于"预判"或"惯例"创建未定义的产物：

**核心规则：**

- Worker **只能** 创建 Skill/XML 工作流中 **显式定义** 的文件和目录
- **禁止** Worker 基于"预判"或"惯例"创建未定义的产物
- 每个阶段只创建本阶段定义的目录，后续阶段的目录由各自阶段创建
- 所有结构化输出（JSON、YAML 等）**必须** 有对应模板，禁止 Worker 自行编写结构

**目录创建规范：**

| 阶段 | 允许创建 | 禁止创建 |
|------|---------|---------|
| Phase 0 | `00.docs/`, `01.product-requirement/` | `02.technical-design/`（属于 Phase 1） |
| Phase 1 | `02.technical-design/` | `03.task-breakdown/`（属于 Phase 2） |

**JSON 生成规范：**

| 场景 | 正确做法 | 错误做法 |
|------|---------|---------|
| WORKFLOW-PROGRESS.json | 从 `WORKFLOW-PROGRESS-TEMPLATE.json` 复制生成 | Worker 自行编写 JSON 结构 |
| DISPATCH-PROGRESS.json | 通过脚本 `update-progress.js init` 生成 | Worker 手动构造 JSON |

**反例**：
```markdown
Phase 0 只定义了 00.docs 和 01.product-requirement
Worker 自行创建了 02.technical-design（"预判后续需要"）
Worker 自行编写了 WORKFLOW-PROGRESS.json
stage 命名为 "phase0_initialization"（与规范 "01_prd" 完全不符）
```

**正例**：
```markdown
Phase 0 只创建 00.docs 和 01.product-requirement
后续目录在各自阶段创建
WORKFLOW-PROGRESS.json 从 WORKFLOW-PROGRESS-TEMPLATE.json 复制生成
禁止手动构造 JSON 结构
```
