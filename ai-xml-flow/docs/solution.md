# ai-xml-flow 项目方案

## 1. 项目定位

### 1.1 核心定位

**ai-xml-flow 定义了一套平台无关的 AI 工作流标准格式**。

- **核心产出物**：**AGENT.xml** 和 **SKILL.xml** —— 标准化的 XML 工作流定义文件
- **平台无关**：不绑定任何特定 AI IDE，任何 Agent 平台的 agent/skill 文档均可加载并执行这些 XML 文件
- **消费模式**：类似 speccrew 项目——平台侧的 Agent 或 Skill 文档引用 AGENT.xml / SKILL.xml 并按其定义的流程执行
- **可视化编辑器**：可选增值功能，非核心依赖

**类比理解**：BPMN 是流程引擎的通用标准 → ai-xml-flow 是 AI Agent/Skill 工作流的通用标准

### 1.2 产出物构成

| 产出物 | 说明 |
|--------|------|
| **标准格式规范** | AGENT.xml / SKILL.xml 格式定义 + XSD Schema |
| **配套 Skill** | 帮助用户生成 AGENT.xml / SKILL.xml 的引导工具 |
| **可选可视化编辑器** | Web 界面拖拽创建/编辑/查看工作流 |

### 1.3 目标用户

- **Agent/Skill 设计者**：需要定义复杂、可追踪工作流的开发者
- **Agent 平台开发者**：希望支持标准工作流格式的平台方

### 1.4 与 speccrew 的关系

- **独立开源项目**：ai-xml-flow 是独立于 speccrew 的开源项目
- **方法论来源**：源自 speccrew 的 xml-workflow-spec 方法论提炼
- **首个实现平台**：speccrew 自身是该标准的首个实现平台，其 Agent/Skill 加载 ai-xml-flow.xml 的模式即为标准参考

---

## 2. 标准格式定义（AGENT.xml / SKILL.xml）

### 2.1 格式层级

ai-xml-flow 定义两种工作流格式，共享同一套 XML Flow 语法，区别在于编排权层级：

| 格式 | 定义内容 | 编排权层级 |
|------|----------|-----------|
| **AGENT.xml** | Agent 级工作流 | 多 Phase、编排权、Worker 调度 |
| **SKILL.xml** | Skill 级工作流 | 单一技能的执行步骤、输入输出、错误处理 |

### 2.2 AGENT.xml

定义 Agent 级工作流，特点：

- 包含多个 Phase（阶段）
- 涉及 Worker 调度决策
- 包含复杂条件分支和循环
- 需要断点续执能力

**典型场景**：PM Agent 的 Phase 1 知识库初始化 → Phase 2 需求分析 → Phase 3 功能设计

### 2.3 SKILL.xml

定义 Skill 级工作流，特点：

- 单一技能的执行步骤
- 明确的输入输出契约
- 包含错误处理逻辑
- 可被 AGENT.xml 调用

**典型场景**：模块匹配 Skill、代码分析 Skill、文档生成 Skill

### 2.4 平台消费模式

任何 Agent 平台均可消费 AGENT.xml / SKILL.xml：

```
┌─────────────────────────────────────────────────────────────┐
│                      Agent 平台                              │
│  ┌─────────────┐    引用并执行    ┌─────────────────────┐  │
│  │ Agent 文档   │ ───────────────→ │   AGENT.xml         │  │
│  │ (Markdown)  │                  │   (工作流定义)       │  │
│  └─────────────┘                  └─────────────────────┘  │
│                                                                   │
│  ┌─────────────┐    引用并执行    ┌─────────────────────┐  │
│  │ Skill 文档   │ ───────────────→ │   SKILL.xml         │  │
│  │ (Markdown)  │                  │   (工作流定义)       │  │
│  └─────────────┘                  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**speccrew 参考实现**：
- Agent 文档（如 `speccrew-product-manager.md`）在 Workflow 章节引用 `ai-xml-flow.xml`
- Worker 执行时读取 XML 并按 block 顺序执行
- 状态更新同步到 XML 和 JSON 进度文件

---

## 3. 项目结构

```
ai-xml-flow/
├── spec/                                # 标准格式规范
│   ├── xml-flow-spec.md                 # XML Flow 语法规范（积木类型、变量、状态等）
│   ├── agent-xml-spec.md                # AGENT.xml 格式规范
│   ├── skill-xml-spec.md                # SKILL.xml 格式规范
│   └── schema.xsd                       # XSD Schema 定义
│
├── skill/                               # 配套 Skill（帮助用户生成 AGENT.xml / SKILL.xml）
│   ├── SKILL.md                         # Skill 入口：教 Agent 如何生成 XML Flow
│   ├── ai-xml-flow.xml                  # Skill 自身的执行工作流
│   └── reference.md                     # XML Flow 语法速查参考
│
├── templates/                           # 模板
│   ├── simple-skill.xml                 # 简单 SKILL.xml 模板
│   ├── complex-agent.xml                # 复杂 AGENT.xml 模板
│   └── skill-scaffold/                  # Skill 脚手架模板
│
├── examples/                            # 示例
│   ├── pm-agent-phase1.xml              # PM Agent Phase 1 完整示例（AGENT.xml）
│   ├── module-matcher.xml               # 模块匹配示例（SKILL.xml）
│   └── loop-dispatch.xml                # 循环 dispatch 示例
│
└── docs/                                # 方案文档
    ├── solution.md                      # 本方案
    ├── editor-design.md                 # 可视化编辑器设计
    └── platform-integration-guide.md    # 平台集成指南
```

---

## 4. 使用场景

### 场景 A：从零创建

用户描述需求，配套 Skill 引导 Agent 生成 AGENT.xml 或 SKILL.xml。

**流程**：
1. 用户提供需求描述
2. Skill 分析需求复杂度
3. Skill 引导 Agent 生成对应的 XML 工作流
4. 输出生成的 AGENT.xml / SKILL.xml

### 场景 B：迁移已有 Skill

用户提供 Markdown Skill，Skill 引导 Agent 转换为标准 XML 格式。

**流程**：
1. 用户传入现有 SKILL.md
2. Skill 分析现有工作流结构
3. 识别可转换为 XML 的部分
4. 生成 SKILL.xml + 更新后的 SKILL.md（引用 XML）

### 场景 C：可视化编辑

用户通过 Web 界面拖拽创建/编辑/查看工作流，导出 AGENT.xml / SKILL.xml。

**三种使用模式**：
- **查看模式**：加载现有 XML，可视化展示工作流结构
- **编辑模式**：修改现有 XML 工作流
- **新建模式**：从零开始创建工作流

### 场景 D：平台集成

Agent 平台开发者参照集成指南，实现对 AGENT.xml / SKILL.xml 的解析和执行。

**集成步骤**：
1. 实现 XML 解析器（基于 XSD Schema）
2. 实现工作流执行引擎
3. 实现状态管理和断点续执
4. 对接现有 Agent/Skill 体系

---

## 5. 方法论核心提炼

### 5.1 设计理念：Blockly 积木模型 + BPMN 语义分类

ai-xml-flow 采用 **Blockly 积木模型 + BPMN 语义分类** 的混合设计：

**Blockly 积木模型**：
- **统一积木形态**：所有操作统一为 `<block>` 积木，无需记忆多种节点类型
- **堆叠即顺序**：积木从上到下堆叠，自然形成执行顺序，无显式连线
- **C 型积木包裹**：分支、循环、异常处理使用 C 型积木包裹内部内容
- **字段即参数**：所有参数统一为 `<field>` 子节点，语法一致

**BPMN 语义分类**：

| BPMN 概念 | 积木类型 | 用途 |
|-----------|----------|------|
| Start Event | `input` | 工作流输入参数（调用者提供） |
| End Event | `output` | 工作流输出结果（执行完成返回） |
| Task | `task` | 执行动作（调用 Skill/脚本/Worker） |
| Gateway | `gateway` | 条件分支/门禁检查 |
| Event | `event` | 日志/确认/信号 |
| Activity | `loop` | 循环遍历 |
| Error Handler | `error-handler` | 异常处理 |

### 5.2 九种积木类型完整定义

#### 5.2.1 input — 输入积木

**用途**：定义工作流的输入参数，对应函数签名中的参数列表。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `desc` | 自然语言描述 |

**子节点规则**：包含多个 `<field>`，每个 field 表示一个输入参数：
- `name`：参数名（必填）
- `required`：是否必填，默认 true
- `default`：默认值（当 required=false 时使用）
- `type`：参数类型提示（string/number/array/object/boolean）
- `desc`：参数描述

**示例**：
```xml
<block type="input" id="I1" desc="工作流输入参数">
  <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
  <field name="platform_id" required="true" type="string" desc="平台标识"/>
  <field name="knowledge_dir" required="false" type="string" 
         default="${workspace}/knowledges/bizs" desc="知识库输出目录"/>
</block>
```

#### 5.2.2 output — 输出积木

**用途**：定义工作流的输出结果，对应函数返回值。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `desc` | 自然语言描述 |

**子节点规则**：包含多个 `<field>`，每个 field 表示一个输出值：
- `name`：输出名（必填）
- `from`：数据来源变量引用（必填）
- `type`：类型提示
- `desc`：输出描述

**示例**：
```xml
<block type="output" id="O1" desc="工作流输出结果">
  <field name="matched_modules" from="${matcherResult.matched_modules}" 
         type="array" desc="匹配到的模块列表"/>
  <field name="execution_path" from="${executionPath}" 
         type="string" desc="执行路径 A 或 B"/>
</block>
```

#### 5.2.3 task — 任务积木

**用途**：执行具体动作，是最基本的执行积木。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `action` | 动作类型：run-skill / run-script / dispatch-to-worker |
| `desc` | 积木描述 |
| `timeout` | 超时时间（秒） |

**动作类型说明**：
| action | 用途 | 必需字段 |
|--------|------|----------|
| `run-skill` | 调用 Skill | `<field name="skill">` |
| `run-script` | 执行脚本命令 | `<field name="command">` |
| `dispatch-to-worker` | 分发任务给 Worker | `<field name="agent">` |

**示例**：
```xml
<!-- 调用 Skill -->
<block type="task" id="B1" action="run-skill" desc="执行模块匹配 Skill">
  <field name="skill">speccrew-knowledge-module-matcher</field>
  <field name="source_path" value="${source.path}"/>
  <field name="output" var="matcherResult"/>
</block>

<!-- 执行脚本 -->
<block type="task" id="B2" action="run-script" desc="检查知识库目录状态">
  <field name="command">node scripts/check-knowledge.js --dir ${knowledgeDir}</field>
  <field name="output" var="knowledgeStatus"/>
</block>
```

#### 5.2.4 gateway — 网关积木

**用途**：条件分支和门禁检查，借鉴 BPMN Gateway 概念。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `mode` | 网关模式：exclusive / guard / parallel |
| `test` | 条件表达式（guard 模式必填） |
| `fail-action` | 失败动作（guard 模式）：stop / retry / skip / fallback |
| `desc` | 积木描述 |

**网关模式说明**：
| mode | 说明 |
|------|------|
| `exclusive` | 排他网关，走第一个匹配的 branch |
| `guard` | 门禁模式，test 不通过则执行 fail-action |
| `parallel` | 并行网关，所有 branch 同时执行 |

**示例**：
```xml
<!-- 排他网关 -->
<block type="gateway" id="G1" mode="exclusive" desc="选择执行路径">
  <branch test="${executionPath} == 'A'" name="增量更新">
    <field name="executionPath" value="A"/>
  </branch>
  <branch default="true" name="全量初始化">
    <field name="executionPath" value="B"/>
  </branch>
</block>

<!-- 门禁模式 -->
<block type="gateway" id="G2" mode="guard" 
        test="${matcherResult.matched_modules.length} > 0" 
        fail-action="stop" 
        desc="验证模块匹配结果">
  <field name="message">模块匹配失败：未找到匹配的模块</field>
</block>
```

#### 5.2.5 loop — 循环积木

**用途**：遍历集合逐个执行，使用 C 型积木包裹循环体。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `over` | 遍历的集合变量（`${tasks}`） |
| `as` | 当前项变量名 |
| `where` | 过滤条件 |
| `parallel` | 是否并行执行，默认 false |
| `max-concurrency` | 最大并发数（并行时有效） |
| `desc` | 积木描述 |

**示例**：
```xml
<block type="loop" id="L1" over="${tasks}" as="task" 
        where="${task.status} == 'pending'" 
        parallel="true" max-concurrency="5"
        desc="遍历任务清单执行">
  <block type="event" action="log" level="info">Processing: ${task.name}</block>
  <block type="task" action="dispatch-to-worker" desc="Dispatch Worker">
    <field name="agent">speccrew-task-worker</field>
    <field name="skill_path">${task.skill_path}</field>
  </block>
</block>
```

#### 5.2.6 event — 事件积木

**用途**：日志输出、用户确认、信号发送。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `action` | 事件动作：log / confirm / signal |
| `level` | 日志级别（log 动作）：debug / info / warn / error |
| `desc` | 积木描述 |

**示例**：
```xml
<!-- 日志事件 -->
<block type="event" id="E1" action="log" level="info" desc="记录执行进度">
  开始执行知识库初始化，检测到 ${modules.count} 个模块
</block>

<!-- 确认事件（HARD STOP） -->
<block type="event" id="E2" action="confirm" title="确认模块匹配结果" type="yesno"
        desc="等待用户确认">
  <field name="preview">匹配到 ${matcherResult.matched_modules.length} 个模块，是否继续？</field>
  <on-confirm>
    <field name="matcherConfirmed" value="true"/>
  </on-confirm>
  <on-cancel>
    <field name="workflow.status" value="cancelled"/>
  </on-cancel>
</block>
```

#### 5.2.7 error-handler — 异常处理积木

**用途**：错误恢复机制，使用 C 型积木包裹 try/catch/finally。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `desc` | 积木描述 |

**子节点规则**：
- `<try>` 内部包含正常执行逻辑
- `<catch>` 捕获异常，可以包含 `error-type` 属性过滤异常类型
- `<finally>` 最终执行逻辑（可选）

**示例**：
```xml
<block type="error-handler" id="EH1" desc="Worker dispatch 异常处理">
  <try>
    <block type="loop" over="${tasks}" as="task" desc="遍历任务执行">
      <block type="task" action="dispatch-to-worker" desc="Dispatch Worker">
        <field name="agent">speccrew-task-worker</field>
      </block>
    </block>
  </try>
  <catch error-type="dispatch_timeout">
    <block type="event" action="log" level="error">Timeout: ${error.taskId}</block>
  </catch>
  <catch>
    <block type="event" action="log" level="error">Error: ${error.message}</block>
  </catch>
  <finally>
    <block type="event" action="log" level="info">Batch dispatch completed</block>
  </finally>
</block>
```

#### 5.2.8 checkpoint — 检查点积木

**用途**：显式标记工作流的关键里程碑，支持断点续执时自动识别恢复点。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `name` | 检查点名称（用于持久化文件中的 key） |
| `desc` | 自然语言描述 |

**子节点**：
- `file`：检查点持久化的目标文件路径
- `verify`：验证条件表达式（可选，通过才标记 passed）
- `passed`：直接标记通过（与 verify 二选一）

**示例**：
```xml
<!-- 简单检查点 -->
<block type="checkpoint" id="CP1" name="matcher_completed" desc="模块匹配完成">
  <field name="file" value="${progressFile}"/>
  <field name="passed" value="true"/>
</block>

<!-- 带验证的检查点 -->
<block type="checkpoint" id="CP2" name="tasks_initialized" desc="任务清单初始化完成">
  <field name="file" value="${progressFile}"/>
  <field name="verify" value="${tasks.length} > 0"/>
</block>
```

#### 5.2.9 rule — 规则声明积木

**用途**：在执行流程中显式声明约束规则，确保 LLM 在执行关键步骤时"看到"约束。

**关键属性**：
| 属性 | 说明 |
|------|------|
| `id` | 积木唯一标识 |
| `level` | 规则级别：forbidden / mandatory / note |
| `desc` | 自然语言描述 |
| `scope` | 受管控的 block ID 列表（逗号分隔） |

**规则级别说明**：
| level | 说明 |
|-------|------|
| `forbidden` | 禁止事项（否定清单） |
| `mandatory` | 强制事项（必须执行） |
| `note` | 提示事项（思维指引） |

**示例**：
```xml
<!-- FORBIDDEN 规则 -->
<block type="rule" id="R1" level="forbidden" desc="Phase 4 内容约束">
  <field name="text">DO NOT generate Sub-PRDs yourself — MUST dispatch Workers</field>
  <field name="text">DO NOT fabricate timestamps — let scripts generate them</field>
</block>

<!-- MANDATORY 规则（HARD GATE） -->
<block type="rule" id="R2" level="mandatory" desc="禁止跳过 Steps B2-B5" scope="B2,B3,B4,B5">
  <field name="text">必须逐步执行 B2→B3→B4→B5，不得跳转到后续 Phase</field>
</block>

<!-- NOTE 提示 -->
<block type="rule" id="R3" level="note" desc="ISA-95 Stage 2 思维指引">
  <field name="text">从业务活动分解功能，而非从技术实现分解</field>
</block>
```

### 5.3 变量系统

#### 5.3.1 变量引用语法

**格式**：`${varName}` 或 `${object.property}`

```xml
<!-- 简单变量 -->
<field name="platform" value="web-vue"/>
<block type="event" action="log">当前平台: ${platform}</block>

<!-- 对象属性 -->
<block type="event" action="log">匹配模块数: ${matcherResult.matched_modules.length}</block>

<!-- 数组索引 -->
<block type="event" action="log">第一个模块: ${matcherResult.matched_modules[0].module_name}</block>
```

#### 5.3.2 三层作用域

| 作用域 | 范围 | 生命周期 | 声明方式 |
|--------|------|----------|----------|
| `workflow` | 整个工作流 | 工作流执行期间 | `<field scope="workflow">` |
| `sequence` | 当前顺序容器 | 容器执行期间 | `<field scope="sequence">` |
| `block` | 当前积木 | 积木执行期间 | `<field scope="block">` 或输出绑定 |

#### 5.3.3 内置变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `${workspace}` | 工作空间根目录 | `/d/dev/project` |
| `${platform}` | 当前平台标识 | `web-vue` |
| `${timestamp}` | 当前时间戳 | `2026-04-14T10:30:00.000+08:00` |
| `${workflow.id}` | 当前工作流 ID | `pm-phase-1` |
| `${workflow.status}` | 当前工作流状态 | `running` |
| `${sequence.id}` | 当前顺序容器 ID | `1.2` |
| `${block.id}` | 当前积木 ID | `1.2.1` |

### 5.4 状态管理

#### 5.4.1 五种状态

```
pending → running → completed
   ↓         ↓
skipped   failed
```

| 状态 | 说明 |
|------|------|
| `pending` | 等待执行 |
| `running` | 正在执行 |
| `completed` | 执行完成 |
| `failed` | 执行失败 |
| `skipped` | 被跳过（条件不满足或依赖失败） |

#### 5.4.2 状态持久化

状态保存在积木的 `status` 属性中，同时同步到 JSON 文件：

```xml
<workflow id="phase-1" status="running">
  <sequence id="S1" status="completed">
    <block type="task" id="B1" status="completed" desc="检查知识库"/>
  </sequence>
  <sequence id="S2" status="running">
    <block type="task" id="B2" status="running" desc="模块匹配"/>
  </sequence>
</workflow>
```

#### 5.4.3 断点续执

中断后从上次位置恢复，跳过 completed 状态积木：

```xml
<workflow id="phase-1" status="resuming">
  <!-- 状态为 completed 的积木会被跳过 -->
  <block type="task" id="B1" status="completed" desc="已完成"/>
  
  <!-- 从第一个非 completed 积木继续 -->
  <block type="task" id="B2" status="pending" resume-point="true" desc="从这里继续">
</workflow>
```

### 5.5 内联 Schema 自解释性机制

每个工作流顶部包含 Block Types 注释帮助 LLM 理解：

```xml
<workflow id="example" status="pending">
  <!--
  == Block Types ==
  input   : 工作流输入参数（required=必填, default=默认值）
  output  : 工作流输出结果（from=数据来源变量）
  task    : 执行动作（action: run-skill | run-script | dispatch-to-worker）
  gateway : 条件分支/门禁（mode: exclusive | guard | parallel）
  loop    : 遍历集合逐个执行（over=集合, as=当前项）
  event   : 日志/确认/信号（action: log | confirm | signal）
  error-handler : 异常处理（try > catch > finally）
  checkpoint : 持久化里程碑（name=检查点名, verify=验证条件）
  rule    : 约束声明（level: forbidden=禁止 | mandatory=强制 | note=提示）
  == Field ==
  field   : 参数/变量/输出（name=参数名, var=绑定变量, value=值）
  -->
  <!-- 积木定义 -->
</workflow>
```

### 5.6 Markdown + XML 混合模式

- **Markdown**：负责说明描述、业务背景、约束规则
- **XML**：负责执行逻辑、控制流、状态管理

```markdown
## Phase 1: 知识库初始化

> 本阶段负责检测和初始化知识库...

<workflow id="phase-1" status="pending">
  <!-- XML 工作流定义 -->
</workflow>

## 详细说明

### Sequence S1.1: 知识库检测

详细说明...
```

---

## 6. 平台集成机制

### 6.1 标准消费协议

任何 Agent 平台只需实现 3 步即可接入 ai-xml-flow：

| 步骤 | 操作 | 说明 |
|------|------|------|
| **1. 解析** | 解析 AGENT.xml / SKILL.xml | 基于公开的 XSD Schema |
| **2. 执行** | 按 XML Flow 定义的积木序列执行工作流 | 从上到下逐 block 执行 |
| **3. 恢复** | 遵循状态管理和检查点协议实现断点续执 | 跳过 completed，重试 failed |

### 6.2 speccrew 参考实现

speccrew 项目作为首个实现平台，其集成模式如下：

```
speccrew-product-manager.md (Agent 文档)
  └── Workflow 章节引用 ai-xml-flow.xml
       └── Worker 读取 XML 并按 block 顺序执行
            ├── 播报 "[Block P1-B3] 加载问题模板"
            ├── 执行 block 内容
            ├── 更新 block status
            └── 继续下一个 block
```

**关键实现点**：
- Worker 执行前必须读取 `workflow.agentflow.xml`
- Worker 必须按 XML 文档顺序逐 block 执行
- Worker 播报当前执行的 block ID
- 状态更新同步到 XML 和 JSON 进度文件

### 6.3 平台集成指南

详细接入指南见 `docs/platform-integration-guide.md`，包含：

- XML 解析器实现参考
- 工作流执行引擎设计
- 状态管理最佳实践
- 与现有 Agent/Skill 体系对接方案
- 测试验证清单

---

## 7. Harness 原则深度集成

ai-xml-flow 将 Harness 23 条原则深度融入标准格式设计中。

### 7.1 原则在格式中的体现

#### 原则 1：SOP 连续性（操作手册原则）

**Skill 设计体现**：
- XML 积木从上到下堆叠，自然形成执行顺序
- 每个 block 的 `desc` 属性清晰说明"做什么"
- 禁止跳转引用，所有信息在 block 内自包含

**程序化检查策略**：
- 验证器检查 block ID 是否按顺序排列
- 检查是否存在前向引用（引用后续 block）

#### 原则 3：输入输出原则（接口契约）

**格式体现**：
- `<block type="input">` 明确定义输入参数（required, default, type, desc）
- `<block type="output">` 明确定义输出结果（from, type, desc）
- 函数签名风格让工作流像函数一样清晰

**示例**：
```xml
<!-- "函数签名"：输入 -->
<block type="input" id="I1" desc="输入参数">
  <field name="source_path" required="true" type="string" desc="源码路径"/>
</block>

<!-- "函数返回值"：输出 -->
<block type="output" id="O1" desc="输出结果">
  <field name="matched_modules" from="${matcherResult.matched_modules}" type="array"/>
</block>
```

#### 原则 5：逐级披露原则（渐进式信息架构）

**格式体现**：
- 内联 Schema 注释提供 L1 核心信息
- 复杂参数通过 `desc` 属性渐进说明
- 详细规范通过外部 reference.md 提供

#### 原则 7：检查点与恢复原则

**格式体现**：
- `<block type="checkpoint">` 显式标记关键里程碑
- `status` 属性嵌入积木，与工作流定义统一
- 支持断点续执时自动识别恢复点

**程序化检查策略**：
- 验证器检查复杂工作流是否包含足够检查点（建议 3-5 个 per Phase）
- 检查 checkpoint 是否有对应的 verify 条件或 passed 标记

#### 原则 12：上下文管理原则

**格式体现**：
- `<block type="rule">` 就近声明约束，放在受管控步骤前面
- 支持三重保障模式：Phase 开头、关键步骤前、Phase 结尾都放置 rule block

**示例**：
```xml
<sequence name="Phase 4">
  <!-- 位置 1：Phase 开头声明 -->
  <block type="rule" level="mandatory" desc="Phase 4 强制规则">
    <field name="text">MUST dispatch Workers for Sub-PRD generation</field>
  </block>
  
  <!-- 位置 2：关键步骤前重复 -->
  <block type="rule" level="forbidden" desc="dispatch 前再次提醒">
    <field name="text">DO NOT generate Sub-PRDs yourself</field>
  </block>
</sequence>
```

#### 原则 14：否定清单原则（FORBIDDEN 模式）

**格式体现**：
- `<block type="rule" level="forbidden">` 显式声明禁止事项
- Include + Exclude 并行，FORBIDDEN 清单有具体示例

**示例**：
```xml
<block type="rule" id="R1" level="forbidden" desc="内容约束">
  <field name="text">FORBIDDEN: Do NOT include file paths like src/views/...</field>
  <field name="text">FORBIDDEN: Do NOT include Java classes, SQL DDL, Vue templates</field>
  <field name="text">FORBIDDEN: Do NOT mention el-button, wd-cell, ElDatePicker</field>
</block>
```

#### 原则 17：编排权分层原则

**格式体现**：
- XML 定义执行逻辑，但**不含 dispatch Worker 指令**
- Skill 只描述"做什么"，Agent 负责"调度执行"
- 编排权只在 Agent 层

**关键设计**：
- `action="dispatch-to-worker"` 只是声明意图，实际 dispatch 由 Agent 执行
- Skill 输出任务清单 JSON，Agent 消费并 dispatch Workers

#### 原则 20：清单驱动执行原则

**格式体现**：
- `<block type="loop">` 遍历任务清单，状态追踪
- checkpoint 验证 `counts.pending == 0`
- 程序化自检替代文本约束

**示例**：
```xml
<block type="task" action="run-script" desc="验证所有任务完成">
  <field name="command">node scripts/check-progress.js</field>
  <field name="condition">counts.pending == 0</field>
</block>

<block type="gateway" mode="guard" test="${counts.pending} == 0" fail-action="stop"
        desc="程序化自检：所有任务必须完成">
  <field name="message">还有 ${counts.pending} 个任务待处理</field>
</block>
```

#### 原则 21：执行权威分层原则

**格式体现**：
- `workflow.agentflow.xml` 是 L1 执行计划（最高权威）
- `SKILL.md` 是 L2 元数据（输入输出定义、模板引用）
- Agent dispatch 的 context 是 L3 数据参数（仅数据，无执行指令）

### 7.2 配套 Skill 的 Harness 保障

配套 Skill 确保生成的 XML 遵循 Harness 原则：

| 原则 | Skill 保障机制 |
|------|---------------|
| 检查点完整性（原则 7） | Skill 在生成复杂工作流时自动插入 checkpoint block |
| 上下文管理（原则 12） | Skill 在关键步骤前自动插入 rule block 声明约束 |
| 否定清单（原则 14） | Skill 根据场景自动添加 FORBIDDEN rule block |
| 编排权分层（原则 17） | Skill 确保 XML 中不出现 dispatch 指令，只声明意图 |
| 清单驱动（原则 20） | Skill 为循环执行场景生成任务清单结构 |

---

## 8. 配套工具设计

### 8.1 工具包结构

```
@ai-xml-flow/
├── core/                    # 核心库
├── cli/                     # 命令行工具
└── editor/                  # 可视化编辑器（可选）
```

### 8.2 @ai-xml-flow/core

**功能模块**：

| 模块 | 功能 |
|------|------|
| `parser.js` | XML 解析器，输出结构化 JSON |
| `validator.js` | 工作流验证器（含 Harness 规则引擎） |
| `renderer.js` | Mermaid 流程图渲染器 |
| `executor.js` | 工作流执行引擎（可选） |

**验证规则（Harness 集成）**：

| 验证项 | 对应 Harness 原则 | 级别 |
|--------|------------------|------|
| 内联 Schema 完整性 | 原则 12（上下文管理） | error |
| 必填属性检查 | 原则 4（编程严谨） | error |
| 积木结构规则 | 原则 1（SOP 连续性） | error |
| 变量引用有效性 | 原则 3（输入输出） | warning |
| 积木 ID 唯一性 | 原则 4（确定性输出） | error |
| checkpoint 完整性 | 原则 7（检查点与恢复） | warning |
| rule block 就近声明 | 原则 12（规则就近重复） | warning |

### 8.3 @ai-xml-flow/cli

**命令设计**：

```bash
# 解析 XML 工作流
ai-xml-flow parse workflow.xml --output workflow.json

# 验证工作流
ai-xml-flow validate workflow.xml --strict --check-refs

# 渲染为 Mermaid
ai-xml-flow render workflow.xml --output diagram.md

# 执行工作流（高级用户）
ai-xml-flow execute workflow.xml --vars workspace=/path

# 生成 Skill 模板
ai-xml-flow init --template simple-skill --output ./my-skill

# 查询状态
ai-xml-flow status workflow.xml --block-id B3
```

### 8.4 @ai-xml-flow/editor

**定位**：可选的可视化编辑器

**技术选型**：
- **前端框架**：React 18 + Vite
- **可视化引擎**：Google Blockly
- **UI 组件**：Ant Design

**核心功能**：
- Blockly 积木画布（拖拽、堆叠、C 型包裹）
- 积木面板（按类型分组显示可用积木）
- 属性编辑面板（编辑 block 属性、field 子节点）
- 实时预览（XML 源码、Mermaid 流程图）
- 导入导出（加载现有 XML、导出 AGENT.xml / SKILL.xml）

---

## 9. 可视化编辑器定位

### 9.1 定位说明

可视化编辑器是**可选增值功能**，用户可选择性地通过可视化页面查看、编辑或新建 AGENT.xml / SKILL.xml。

**核心原则**：
- 可视化编辑器是可选的，非核心依赖
- XML 文本格式是权威，可视化编辑器只是辅助工具
- 所有功能均可通过文本编辑完成

### 9.2 三种使用模式

| 模式 | 说明 |
|------|------|
| **查看模式** | 加载现有 XML，可视化展示工作流结构，帮助理解复杂流程 |
| **编辑模式** | 修改现有 XML 工作流，适合调整参数、添加步骤 |
| **新建模式** | 从零开始创建工作流，适合初学者 |

### 9.3 详细设计

详细设计见 `docs/editor-design.md`，包含：

- 界面布局设计（画布、面板、工具栏）
- 自定义 Blockly 积木定义
- XML 导入导出逻辑
- 与 Core 库的集成方案

---

## 10. 开发计划

### Phase 1（1 周）：标准格式规范

| 任务 | 交付物 |
|------|--------|
| AGENT.xml 格式规范 | `spec/agent-xml-spec.md` |
| SKILL.xml 格式规范 | `spec/skill-xml-spec.md` |
| XSD Schema 定义 | `spec/schema.xsd` |
| 平台集成指南 | `docs/platform-integration-guide.md` |

### Phase 2（1 周）：配套 Skill + 模板 + 示例

| 任务 | 交付物 |
|------|--------|
| 配套 Skill | `skill/SKILL.md` + `skill/ai-xml-flow.xml` |
| Skill 模板 | `templates/simple-skill.xml` + `templates/complex-agent.xml` |
| 示例库 | `examples/pm-agent-phase1.xml` + `examples/module-matcher.xml` |

### Phase 3（2 周）：Core 库 + CLI

| 任务 | 交付物 |
|------|--------|
| Core 库 | `@ai-xml-flow/core`（parser + validator + renderer） |
| CLI 工具 | `@ai-xml-flow/cli`（parse/validate/render/init/status） |
| 单元测试 | 覆盖核心功能 |

### Phase 4（3 周）：可视化编辑器

| 任务 | 交付物 |
|------|--------|
| 编辑器基础 | `@ai-xml-flow/editor`（React + Blockly 集成） |
| 核心功能 | 积木画布、属性面板、导入导出 |
| 预览功能 | XML 预览、Mermaid 渲染 |

### Phase 5（1 周）：测试 + 发布 + 文档完善

| 任务 | 交付物 |
|------|--------|
| 集成测试 | 端到端测试用例 |
| npm 发布 | `@ai-xml-flow/core`, `@ai-xml-flow/cli`, `@ai-xml-flow/editor` |
| 文档完善 | README、API 文档、示例教程 |

**总计：约 8 周**

---

## 11. 开源策略

### 11.1 许可证

**MIT License** — 最大化传播和采用

### 11.2 发布平台

| 平台 | 内容 |
|------|------|
| **npm** | `@ai-xml-flow/core`, `@ai-xml-flow/cli`, `@ai-xml-flow/editor` |
| **GitHub** | 源码仓库 + Issue 跟踪 + Discussions |

### 11.3 社区建设

- **Examples 仓库**：社区贡献的工作流示例
- **Plugin 生态**：第三方积木类型扩展
- **IDE 插件**：VS Code / Cursor / Qoder 插件（后续）

---

## 附录：快速参考

### 积木类型速查

| 积木类型 | 用途 | 关键属性 |
|----------|------|----------|
| `input` | 工作流输入参数 | required, default, desc |
| `output` | 工作流输出结果 | from, desc |
| `task` | 执行动作 | action, desc |
| `gateway` | 条件分支/门禁 | mode, test, desc |
| `loop` | 循环遍历 | over, as, desc |
| `event` | 日志/确认 | action, level, desc |
| `error-handler` | 异常处理 | desc |
| `checkpoint` | 持久化里程碑 | name, verify, desc |
| `rule` | 约束声明 | level, scope, desc |

### 变量引用速查

| 语法 | 说明 |
|------|------|
| `${var}` | 简单变量 |
| `${obj.prop}` | 对象属性 |
| `${arr[0]}` | 数组索引 |
| `${workflow.id}` | 内置变量 |

### 网关模式速查

| 模式 | 用途 |
|------|------|
| `exclusive` | 排他分支（走第一个匹配） |
| `guard` | 门禁检查（不通过则停止） |
| `parallel` | 并行执行（所有分支同时） |
