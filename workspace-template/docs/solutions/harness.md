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

**设计要点**：
- **Skill 可复用**：子 Agent 使用的 Skill 应通用化，可被不同父 Agent 调用
- **输入自给自足**：子 Agent 不依赖父 Agent 的上下文，所有输入通过参数传递
- **输出标准化**：子 Agent 输出格式固定，便于父 Agent 解析和集成
- **错误隔离**：子 Agent 失败不影响父 Agent，可重试或降级处理

---

## 原则关系图

```
┌─────────────────────────────────────────────────────────┐
│                    Harness 原则体系                      │
├─────────────────────────────────────────────────────────┤
│  操作手册原则 ──→ 确保步骤清晰、连续、自包含              │
│       ↓                                                 │
│  输入输出原则 ──→ 明确定义接口契约                        │
│       ↓                                                 │
│  编程严谨原则 ──→ 像伪代码一样严谨设计                    │
│       ↓                                                 │
│  按需加载原则 ──→ 模板/资源条件分离                       │
│       ↓                                                 │
│  逐级披露原则 ──→ 信息分层，渐进展示                      │
│       ↓                                                 │
│  工作外包原则 ──→ 复杂任务子 Agent 委派                   │
└─────────────────────────────────────────────────────────┘
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
