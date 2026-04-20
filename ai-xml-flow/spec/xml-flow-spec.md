# XML Flow 语法规范

**版本**：1.0  
**状态**：正式规范  
**关键词**：MUST / SHOULD / MAY（遵循 RFC 2119）

---

## 1. 概述

### 1.1 什么是 XML Flow

XML Flow 是 ai-xml-flow 项目定义的 AI 工作流标准格式。它采用结构化 XML 描述工作流的执行逻辑、控制流和状态管理，使 LLM（大语言模型）能够准确理解和执行复杂的多步骤工作流。

### 1.2 设计理念

XML Flow 采用 **Blockly 积木模型 + BPMN 语义分类** 的混合设计：

**Blockly 积木模型**：

- **统一积木形态**：所有操作统一为 `<block>` 积木，无需记忆多种节点类型
- **堆叠即顺序**：积木从上到下堆叠，自然形成执行顺序，无显式连线
- **C 型积木包裹**：分支、循环、异常处理使用 C 型积木包裹内部内容
- **字段即参数**：所有参数统一为 `<field>` 子节点，语法一致

**BPMN 语义分类**：

积木的 `type` 属性借鉴 BPMN 2.0 术语，保留业务流程语义：

| BPMN 概念 | 积木类型 | 用途 |
|-----------|----------|------|
| Start Event | `input` | 工作流输入参数（调用者提供） |
| End Event | `output` | 工作流输出结果（执行完成返回） |
| Task | `task` | 执行动作（调用 Skill/脚本/Worker） |
| Gateway | `gateway` | 条件分支/门禁检查 |
| Event | `event` | 日志/确认/信号 |
| Activity | `loop` | 循环遍历 |
| Error Handler | `error-handler` | 异常处理 |

### 1.3 设计目标

1. **降低 LLM 认知负担**：统一的积木形态 + 内联 Schema，LLM 无需查阅外部文档
2. **提升执行准确率**：结构化 XML 标签让 LLM 明确识别执行边界
3. **人类可维护性**：Markdown 与 XML 混合，保留人类可读性
4. **进度可追踪**：状态直接嵌入积木属性，与工作流定义统一

### 1.4 适用范围

| 场景 | 是否使用 XML Flow | 原因 |
|------|-------------------|------|
| Agent 定义中的复杂工作流段落 | ✅ 推荐 | 多 Phase、多分支、循环执行 |
| Skill 中的多步骤执行流程 | ✅ 推荐 | 需要追踪执行状态 |
| 简单 3 步以内的 Skill | ❌ 不需要 | 增加复杂度无收益 |
| 单次执行无需追踪的任务 | ❌ 不需要 | 清单开销大于收益 |

---

## 2. 文档结构

### 2.1 根元素 `<workflow>`

`<workflow>` 是 XML Flow 的顶层容器，包含所有执行积木。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | string | 是 | — | 工作流唯一标识 |
| `status` | enum | 否 | `pending` | 执行状态（见第 6 节状态管理） |
| `version` | string | 否 | — | 工作流版本号 |
| `desc` | string | 否 | — | 工作流描述 |

**子节点规则**：

- MUST 包含内联 Schema 注释（帮助 LLM 理解积木类型）
- MUST 包含至少一个 `<sequence>` 或 `<block>`
- MAY 包含 `<field>` 声明全局变量

**示例**：

```xml
<workflow id="pm-phase-1-knowledge-init" 
          status="pending"
          version="2.0"
          desc="PM Agent Phase 1: 知识库初始化">
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
  rule    : 约束声明（level: forbidden=禁止 | mandatory=强制 | note=提示, 就近放在受管控步骤前）
  == Field ==
  field   : 参数/变量/输出（name=参数名, var=绑定变量, value=值）
  -->
  <field name="workspace" value="${workspace.root}"/>
  <sequence id="S1" name="知识库检测">
    <!-- 积木内容 -->
  </sequence>
</workflow>
```

### 2.2 顺序容器 `<sequence>`

对应 Agent 的 Phase 或逻辑分组，可嵌套。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | string | 是 | — | 顺序容器唯一标识 |
| `name` | string | 否 | — | 容器名称 |
| `status` | enum | 否 | `pending` | 执行状态 |
| `required` | boolean | 否 | `true` | 是否必须执行 |
| `desc` | string | 否 | — | 容器描述 |

**子节点规则**：

- MAY 包含多个 `<block>`（任意类型）
- MAY 包含嵌套的 `<sequence>`
- MAY 包含 `<field>` 声明 sequence 级变量
- 从上到下依次执行

**示例**：

```xml
<sequence id="S1.2B" name="知识库全量初始化" status="pending" desc="执行全量初始化流程">
  <block type="task" id="B1" action="run-skill" desc="执行模块匹配">
    <!-- 积木内容 -->
  </block>
  <block type="task" id="B2" action="run-script" desc="初始化任务清单">
    <!-- 积木内容 -->
  </block>
</sequence>
```

### 2.3 积木嵌套规则

```
workflow
├── field*（全局变量）
├── block type="input"（最多 1 个，首位置）
├── sequence+（可嵌套）
│   ├── field*（sequence 级变量）
│   ├── block+（任意类型）
│   └── sequence*（嵌套）
└── block type="output"（最多 1 个，末位置）
```

**嵌套约束**：

- `<block type="input">` MUST 放在 workflow 的第一个 block 位置
- `<block type="output">` MUST 放在 workflow 的最后一个 block 位置
- `<block type="error-handler">` 内部 MUST 包含 `<try>`，MAY 包含 `<catch>` 和 `<finally>`
- `<block type="loop">` 内部 MUST 包含至少一个 `<block>`
- `<block type="gateway" mode="exclusive|parallel">` 内部 MUST 包含 `<branch>`
- `<block type="gateway" mode="guard">` 内部 MAY 包含 `<field>`
- `<block type="event" action="confirm">` 内部 MAY 包含 `<on-confirm>` 和 `<on-cancel>`

---

## 3. 九种积木类型完整规范

### 3.1 输入积木 `<block type="input">`

定义工作流的输入参数，对应 BPMN Start Event (with data) 和 Blockly Hat Block。

**概念对应**：

- **BPMN**：Start Event with Data Input
- **Blockly**：Hat Block（顶部带"帽子"的起始块）

**功能**：

- 定义工作流的输入参数，类似函数签名中的参数列表
- MUST 放在 workflow 的第一个 block 位置
- 调用者 MUST 提供 `required="true"` 的参数

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `input` |
| `id` | string | 是 | — | 积木唯一标识 |
| `desc` | string | 是 | — | 自然语言描述 |
| `status` | enum | 否 | `pending` | 执行状态 |

**子节点规则**：

包含多个 `<field>`，每个 field 表示一个输入参数：

| field 属性 | 类型 | 必填 | 默认值 | 说明 |
|------------|------|------|--------|------|
| `name` | string | 是 | — | 参数名 |
| `required` | boolean | 否 | `true` | 是否必填 |
| `default` | string | 否 | — | 默认值（当 required=false 时使用） |
| `type` | string | 否 | `string` | 参数类型提示（string/number/array/object/boolean） |
| `desc` | string | 否 | — | 参数描述 |

**自动变量声明**：

input block 中的 field 会自动成为 workflow 作用域的变量，无需额外声明。

**示例**：

```xml
<block type="input" id="I1" desc="工作流输入参数">
  <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
  <field name="platform_id" required="true" type="string" desc="平台标识，如 web-vue"/>
  <field name="knowledge_dir" required="false" type="string" default="${workspace}/knowledges/bizs" desc="知识库输出目录"/>
</block>
```

### 3.2 输出积木 `<block type="output">`

定义工作流的输出结果，对应 BPMN End Event (with data) 和 Blockly Cap Block。

**概念对应**：

- **BPMN**：End Event with Data Output
- **Blockly**：Cap Block（底部带"盖子"的结束块）

**功能**：

- 定义工作流的输出结果，类似函数返回值
- MUST 放在 workflow 的最后一个 block 位置
- 执行完成后返回给调用者

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `output` |
| `id` | string | 是 | — | 积木唯一标识 |
| `desc` | string | 是 | — | 自然语言描述 |
| `status` | enum | 否 | `pending` | 执行状态 |

**子节点规则**：

包含多个 `<field>`，每个 field 表示一个输出值：

| field 属性 | 类型 | 必填 | 默认值 | 说明 |
|------------|------|------|--------|------|
| `name` | string | 是 | — | 输出名 |
| `from` | string | 是 | — | 数据来源变量引用 |
| `type` | string | 否 | `string` | 类型提示（string/number/array/object/boolean） |
| `desc` | string | 否 | — | 输出描述 |

**示例**：

```xml
<block type="output" id="O1" desc="工作流输出结果">
  <field name="matched_modules" from="${matcherResult.matched_modules}" type="array" desc="匹配到的模块列表"/>
  <field name="execution_path" from="${executionPath}" type="string" desc="执行路径 A 或 B"/>
  <field name="success" from="${validationResult.valid}" type="boolean" desc="工作流是否成功完成"/>
</block>
```

**函数签名风格**：

input + output 组合使用，让工作流像函数一样清晰：

```xml
<workflow id="knowledge-init" status="pending">
  <!-- "函数签名"：输入 -->
  <block type="input" id="I1" desc="输入参数">
    <field name="source_path" required="true" type="string" desc="源码路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
  </block>
  <!-- 执行逻辑 -->
  <sequence id="S1">...</sequence>
  <!-- "函数返回值"：输出 -->
  <block type="output" id="O1" desc="输出结果">
    <field name="matched_modules" from="${matcherResult.matched_modules}" type="array"/>
  </block>
</workflow>
```

### 3.3 任务积木 `<block type="task">`

最基本的执行积木，执行一个具体动作。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `task` |
| `id` | string | 是 | — | 积木唯一标识 |
| `action` | enum | 是 | — | 动作类型（见下表） |
| `desc` | string | 是 | — | 积木描述（自然语言说明做什么） |
| `status` | enum | 否 | `pending` | 执行状态 |
| `timeout` | number | 否 | — | 超时时间（秒） |

**动作类型说明**：

| action | 用途 | 必需字段 |
|--------|------|----------|
| `run-skill` | 调用 Skill | `<field name="skill">` |
| `run-script` | 执行脚本命令 | `<field name="command">` |
| `dispatch-to-worker` | 分发任务给 Worker | `<field name="agent">` |

**子节点规则**：

MAY 包含多个 `<field>` 定义参数和输出。

**示例：调用 Skill**

```xml
<block type="task" id="B1" action="run-skill" desc="执行模块匹配 Skill">
  <field name="skill">speccrew-knowledge-module-matcher</field>
  <field name="source_path" value="${source.path}"/>
  <field name="platform_id" value="${platform.id}"/>
  <field name="output" var="matcherResult"/>
</block>
```

**示例：执行脚本**

```xml
<block type="task" id="B2" action="run-script" desc="检查知识库目录状态">
  <field name="command">node scripts/check-knowledge.js</field>
  <field name="arg">--dir</field>
  <field name="arg">${knowledgeDir}</field>
  <field name="output" var="knowledgeStatus" from="${knowledgeDir}/status.json"/>
</block>
```

**示例：分发 Worker**

```xml
<block type="task" id="B3" action="dispatch-to-worker" desc="Dispatch Worker 执行分析任务">
  <field name="agent">speccrew-task-worker</field>
  <field name="skill_path">${task.analyzer_skill}/SKILL.md</field>
  <field name="context">{
    "module": "${task.module}",
    "platform_id": "${task.platform_id}",
    "output_path": "${output.dir}/${task.module}/${task.fileName}.md"
  }</field>
  <field name="output" var="dispatchResult"/>
</block>
```

### 3.4 网关积木 `<block type="gateway">`

条件分支和门禁检查，借鉴 BPMN Gateway 概念。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `gateway` |
| `id` | string | 是 | — | 积木唯一标识 |
| `mode` | enum | 是 | — | 网关模式（见下表） |
| `test` | string | 条件 | — | 条件表达式（guard 模式必填） |
| `fail-action` | enum | 否 | `stop` | 失败动作（guard 模式，见下表） |
| `desc` | string | 是 | — | 积木描述 |
| `status` | enum | 否 | `pending` | 执行状态 |

**网关模式说明**：

| mode | BPMN 对应 | 说明 |
|------|-----------|------|
| `exclusive` | XOR Gateway | 排他网关，走第一个匹配的 branch |
| `guard` | — | 门禁模式，test 不通过则执行 fail-action |
| `parallel` | AND Gateway | 并行网关，所有 branch 同时执行 |

**fail-action 选项**：

| fail-action | 说明 |
|-------------|------|
| `stop` | 终止工作流 |
| `retry` | 重试当前积木 |
| `skip` | 跳过当前积木继续执行 |
| `fallback` | 跳转到指定的 fallback 积木 |

#### 3.4.1 排他网关模式（exclusive）

走第一个匹配的 branch，使用 C 型积木包裹分支内容：

```xml
<block type="gateway" id="G1" mode="exclusive" desc="根据检测结果选择执行路径">
  <branch test="${executionPath} == 'A'" name="增量更新">
    <block type="task" id="B1" action="run-skill" desc="执行增量同步">
      <field name="skill">speccrew-knowledge-incremental-sync</field>
      <field name="knowledge_dir" value="${knowledgeDir}"/>
    </block>
  </branch>
  <branch test="${executionPath} == 'B'" name="全量初始化">
    <block type="task" id="B2" action="run-skill" desc="执行全量初始化">
      <field name="skill">speccrew-knowledge-full-init</field>
    </block>
  </branch>
  <branch default="true" name="兜底">
    <block type="event" action="log" level="error" desc="未知执行路径">未知执行路径，终止工作流</block>
  </branch>
</block>
```

#### 3.4.2 门禁模式（guard）

test 不通过则执行 fail-action：

```xml
<block type="gateway" id="G2" mode="guard" 
        test="${matcherResult.matched_modules.length} > 0" 
        fail-action="stop" 
        desc="验证模块匹配结果：必须至少匹配一个模块">
  <field name="message">模块匹配失败：未找到匹配的模块，请检查源码路径和平台配置</field>
</block>
```

#### 3.4.3 并行网关模式（parallel）

所有 branch 同时执行：

```xml
<block type="gateway" id="G3" mode="parallel" desc="并行执行多个分析任务">
  <branch name="分析用户模块">
    <block type="task" id="B1" action="dispatch-to-worker" desc="分析用户模块">
      <field name="agent">speccrew-analyzer</field>
      <field name="module">user</field>
    </block>
  </branch>
  <branch name="分析订单模块">
    <block type="task" id="B2" action="dispatch-to-worker" desc="分析订单模块">
      <field name="agent">speccrew-analyzer</field>
      <field name="module">order</field>
    </block>
  </branch>
</block>
```

### 3.5 循环积木 `<block type="loop">`

遍历集合逐个执行，使用 C 型积木包裹循环体。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `loop` |
| `id` | string | 是 | — | 积木唯一标识 |
| `over` | string | 是 | — | 遍历的集合变量（如 `${tasks}`） |
| `as` | string | 是 | — | 当前项变量名 |
| `where` | string | 否 | — | 过滤条件 |
| `parallel` | boolean | 否 | `false` | 是否并行执行 |
| `max-concurrency` | number | 否 | — | 最大并发数（并行时有效） |
| `desc` | string | 是 | — | 积木描述 |
| `status` | enum | 否 | `pending` | 执行状态 |

**子节点规则**：

循环体内 MUST 包含至少一个 `<block>` 积木，通过 `${as}` 引用当前项（as 指定的变量名）。

**示例**：

```xml
<block type="loop" id="L1" over="${tasks}" as="task" 
        where="${task.status} == 'pending'" 
        parallel="true" max-concurrency="5"
        desc="遍历任务清单，逐个 dispatch Worker 执行分析">
  <block type="event" action="log" level="info" desc="记录 dispatch">Dispatching task: ${task.name}</block>
  <block type="task" action="dispatch-to-worker" timeout="300" desc="Dispatch Worker 执行任务: ${task.name}">
    <field name="agent">speccrew-task-worker</field>
    <field name="skill_path">${task.analyzer_skill}/SKILL.md</field>
    <field name="context">{
      "module": "${task.module}",
      "platform_id": "${task.platform_id}",
      "output_path": "${knowledgeDir}/${task.module}/${task.fileName}.md"
    }</field>
  </block>
  <block type="task" action="run-script" desc="更新任务状态为 completed">
    <field name="command">node scripts/update-progress.js update-task</field>
    <field name="arg">--task-id</field>
    <field name="arg">${task.id}</field>
    <field name="arg">--status</field>
    <field name="arg">completed</field>
  </block>
</block>
```

### 3.6 事件积木 `<block type="event">`

日志输出、用户确认、信号发送，借鉴 BPMN Event 概念。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `event` |
| `id` | string | 是 | — | 积木唯一标识 |
| `action` | enum | 是 | — | 事件动作：`log` / `confirm` / `signal` |
| `level` | enum | 否 | `info` | 日志级别（log 动作）：`debug` / `info` / `warn` / `error` |
| `title` | string | 否 | — | 确认框标题（confirm 动作） |
| `name` | string | 否 | — | 信号名称（signal 动作） |
| `desc` | string | 是 | — | 积木描述 |
| `status` | enum | 否 | `pending` | 执行状态 |

**三种动作类型**：

| action | 用途 | 说明 |
|--------|------|------|
| `log` | 日志输出 | 输出信息给用户，文本内容为日志消息，支持变量插值 |
| `confirm` | 用户确认 | 暂停等待用户确认（替代 HARD STOP），包含 `<on-confirm>` 和 `<on-cancel>` 子节点 |
| `signal` | 信号发送 | 发送信号给外部系统 |

**子节点规则**：

- **log**：文本内容为日志消息，支持变量插值
- **confirm**：包含 `<field name="preview">`（预览内容）、`<on-confirm>`（确认后执行）、`<on-cancel>`（取消后执行）
- **signal**：包含 `<field>` 定义信号参数

**示例：日志事件**

```xml
<block type="event" id="E1" action="log" level="info" desc="记录执行进度">
  开始执行知识库初始化，检测到 ${modules.count} 个模块
</block>
```

**示例：确认事件（HARD STOP）**

```xml
<block type="event" id="E2" action="confirm" title="确认模块匹配结果" desc="等待用户确认模块匹配结果">
  <field name="preview">
匹配到 ${matcherResult.matched_modules.length} 个模块：
- ${matcherResult.matched_modules[0].module_name} (置信度: ${matcherResult.matched_modules[0].confidence})
是否继续执行知识库初始化？
  </field>
  <on-confirm>
    <block type="event" action="log" level="info" desc="用户确认">用户确认，继续执行</block>
    <field name="matcherConfirmed" value="true"/>
  </on-confirm>
  <on-cancel>
    <block type="event" action="log" level="warn" desc="用户取消">用户取消，终止工作流</block>
    <field name="workflow.status" value="cancelled"/>
  </on-cancel>
</block>
```

**示例：信号事件**

```xml
<block type="event" id="E3" action="signal" name="phase-complete" desc="发送阶段完成信号">
  <field name="phase">1.2B</field>
  <field name="result">success</field>
</block>
```

### 3.7 异常处理积木 `<block type="error-handler">`

错误恢复机制，使用 C 型积木包裹 try/catch/finally。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `error-handler` |
| `id` | string | 是 | — | 积木唯一标识 |
| `desc` | string | 是 | — | 积木描述 |
| `status` | enum | 否 | `pending` | 执行状态 |

**子节点规则**：

| 子节点 | 必填 | 说明 |
|--------|------|------|
| `<try>` | 是 | 内部包含正常执行逻辑 |
| `<catch>` | 否 | 捕获异常，可包含 `error-type` 属性过滤异常类型；可定义多个 catch，按顺序匹配 |
| `<finally>` | 否 | 最终执行逻辑，无论是否异常都会执行 |

catch 中可通过 `${error.message}`、`${error.taskId}` 等引用异常信息。

**示例**：

```xml
<block type="error-handler" id="EH1" desc="Worker dispatch 批量执行异常处理">
  <try>
    <block type="loop" id="L1" over="${tasks}" as="task" desc="遍历任务执行">
      <block type="task" action="dispatch-to-worker" desc="Dispatch Worker">
        <field name="agent">speccrew-task-worker</field>
        <field name="skill_path">${task.skill_path}</field>
      </block>
    </block>
  </try>
  <catch error-type="dispatch_timeout">
    <block type="event" action="log" level="error" desc="记录超时错误">
      Worker dispatch timeout: ${error.taskId}
    </block>
    <block type="task" action="run-script" desc="更新任务失败状态">
      <field name="command">node scripts/update-progress.js update-task</field>
      <field name="arg">--task-id</field>
      <field name="arg">${error.taskId}</field>
      <field name="arg">--status</field>
      <field name="arg">failed</field>
    </block>
  </catch>
  <catch>
    <block type="event" action="log" level="error" desc="记录未知错误">
      Unexpected error: ${error.message}
    </block>
  </catch>
  <finally>
    <block type="event" action="log" level="info" desc="记录完成">Batch dispatch completed</block>
    <block type="task" action="run-script" desc="写入检查点">
      <field name="command">node scripts/update-progress.js write-checkpoint</field>
      <field name="arg">--checkpoint</field>
      <field name="arg">batch_dispatch</field>
    </block>
  </finally>
</block>
```

### 3.8 检查点积木 `<block type="checkpoint">`

显式标记工作流的关键里程碑，支持断点续执时自动识别恢复点。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `checkpoint` |
| `id` | string | 是 | — | 积木唯一标识 |
| `name` | string | 是 | — | 检查点名称（用于持久化文件中的 key） |
| `desc` | string | 是 | — | 自然语言描述 |
| `status` | enum | 否 | `pending` | 执行状态 |

**子节点**：

`<field>` 定义检查点参数：

| field name | 必填 | 说明 |
|------------|------|------|
| `file` | 是 | 检查点持久化的目标文件路径 |
| `verify` | 否 | 验证条件表达式（通过才标记 passed） |
| `passed` | 否 | 直接标记通过（与 verify 二选一） |

**执行语义**：

1. 评估 verify 条件（如果有）
2. 条件通过 → 将 `{name, passed: true, timestamp}` 写入目标文件
3. 条件不通过 → 标记 `passed: false`
4. 断点续执时，系统扫描所有 checkpoint block，跳过已 passed 的部分

**示例**：

```xml
<!-- 简单检查点：直接标记通过 -->
<block type="checkpoint" id="CP1" name="matcher_completed" desc="模块匹配完成">
  <field name="file" value="${progressFile}"/>
  <field name="passed" value="true"/>
</block>

<!-- 带验证的检查点：条件通过才标记 -->
<block type="checkpoint" id="CP2" name="tasks_initialized" desc="任务清单初始化完成">
  <field name="file" value="${progressFile}"/>
  <field name="verify" value="${tasks.length} > 0"/>
</block>

<!-- 阶段完成检查点 -->
<block type="checkpoint" id="CP3" name="phase_1_complete" desc="Phase 1 全部完成">
  <field name="file" value="${progressFile}"/>
  <field name="verify" value="${counts.pending} == 0 &amp;&amp; ${counts.failed} == 0"/>
</block>
```

### 3.9 规则声明积木 `<block type="rule">`

在执行流程中显式声明约束规则，确保 LLM 在执行关键步骤时"看到"约束。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | string | 是 | — | 固定值 `rule` |
| `id` | string | 是 | — | 积木唯一标识 |
| `level` | enum | 是 | — | 规则级别（见下表） |
| `desc` | string | 是 | — | 自然语言描述 |
| `scope` | string | 否 | — | 受管控的 block ID 列表（逗号分隔） |

**规则级别说明**：

| level | 说明 |
|-------|------|
| `forbidden` | 禁止事项（否定清单） |
| `mandatory` | 强制事项（必须执行） |
| `note` | 提示事项（思维指引） |

**子节点**：

多个 `<field name="text">` 定义规则条目。

**执行语义**：

- rule block 是**声明型积木**，不执行动作，而是声明约束
- LLM 执行到 rule block 时，MUST 将其内容加载到当前上下文的"活跃约束"中
- rule block 管控其后的 block，直到 sequence 结束或遇到下一个同 scope 的 rule

**放置原则（就近声明）**：

- rule block SHOULD 放在它管控的步骤**前面**
- 支持三重保障：同一规则可以在 Phase 开头、关键步骤前、Phase 结尾三个位置放置 rule block

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

**三重保障模式（Triple Enforcement）**：

```xml
<sequence name="Phase 4: Sub-PRD 生成">
  <!-- 位置 1：Phase 开头声明 -->
  <block type="rule" id="R-P4-1" level="mandatory" desc="Phase 4 强制规则">
    <field name="text">MUST dispatch Workers for Sub-PRD generation</field>
  </block>

  <block type="task" id="B10" action="run-script" desc="初始化调度任务">...</block>

  <!-- 位置 2：关键步骤前重复 -->
  <block type="rule" id="R-P4-2" level="forbidden" desc="dispatch 前再次提醒">
    <field name="text">DO NOT generate Sub-PRDs yourself</field>
  </block>

  <block type="loop" id="L1" over="${tasks}" as="task">
    <block type="task" action="dispatch-to-worker" desc="分发 Worker">...</block>
  </block>

  <!-- 位置 3：Phase 结尾验证 -->
  <block type="checkpoint" id="CP-P4" name="phase4_complete" desc="Phase 4 完成">
    <field name="file" value="${progressFile}"/>
    <field name="verify" value="${counts.pending} == 0"/>
  </block>
</sequence>
```

### 3.10 字段节点 `<field>`

统一参数/变量/输出定义，借鉴 Blockly field 概念。

**属性列表**：

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | 条件 | — | 参数名或变量名 |
| `value` | string | 条件 | — | 参数值（支持变量引用） |
| `var` | string | 条件 | — | 输出绑定变量名 |
| `from` | string | 否 | — | 输出来源（文件路径或表达式） |
| `required` | boolean | 否 | `true` | 是否必填（input block 中） |
| `default` | string | 否 | — | 默认值（input block 中） |
| `type` | string | 否 | `string` | 类型提示（string/number/array/object/boolean） |
| `scope` | enum | 否 | `workflow` | 作用域：workflow / sequence / block |
| `desc` | string | 否 | — | 参数描述 |

> `name`/`value` 和 `var` 至少提供一组。`<field>` 支持混合内容（文本作为值）。

**使用场景**：

| 场景 | 语法 |
|------|------|
| 声明变量 | `<field name="workspace" value="${workspace.root}"/>` |
| 传递参数 | `<field name="source_path" value="${source.path}"/>` |
| 输出绑定 | `<field name="output" var="matcherResult"/>` |
| 规则条目 | `<field name="text">DO NOT skip this step</field>` |

---

## 4. 变量系统

### 4.1 变量引用语法

**格式**：`${varName}` 或 `${object.property}`

```xml
<!-- 简单变量 -->
<field name="platform" value="web-vue"/>
<block type="event" action="log" level="info" desc="输出平台">当前平台: ${platform}</block>

<!-- 对象属性 -->
<block type="event" action="log" level="info" desc="输出模块数">
  匹配模块数: ${matcherResult.matched_modules.length}
</block>

<!-- 数组索引 -->
<block type="event" action="log" level="info" desc="输出第一个模块">
  第一个模块: ${matcherResult.matched_modules[0].module_name}
</block>
```

### 4.2 三层作用域

| 作用域 | 范围 | 生命周期 | 声明方式 |
|--------|------|----------|----------|
| `workflow` | 整个工作流 | 工作流执行期间 | `<field scope="workflow">` 或 input block 中的 field |
| `sequence` | 当前顺序容器 | 容器执行期间 | `<field scope="sequence">` |
| `block` | 当前积木 | 积木执行期间 | `<field scope="block">` 或输出绑定 |

**作用域示例**：

```xml
<workflow id="example">
  <field name="globalVar" value="global" scope="workflow"/>

  <sequence id="S1">
    <field name="sequenceVar" value="seq1" scope="sequence"/>

    <block type="task" action="run-skill" desc="执行任务">
      <field name="output" var="blockVar"/>
      <!-- 可访问: globalVar, sequenceVar, blockVar -->
    </block>
  </sequence>

  <sequence id="S2">
    <!-- 可访问: globalVar -->
    <!-- 无法访问: sequenceVar (属于 S1), blockVar -->
  </sequence>
</workflow>
```

### 4.3 内置变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `${workspace}` | 工作空间根目录 | `/d/dev/project` |
| `${platform}` | 当前平台标识 | `web-vue` |
| `${timestamp}` | 当前时间戳 | `2026-04-14T10:30:00.000+08:00` |
| `${workflow.id}` | 当前工作流 ID | `pm-phase-1` |
| `${workflow.status}` | 当前工作流状态 | `running` |
| `${sequence.id}` | 当前顺序容器 ID | `1.2` |
| `${block.id}` | 当前积木 ID | `1.2.1` |

### 4.4 变量声明和引用规则

1. input block 中的 field 自动声明为 workflow 作用域变量
2. `<field scope="workflow">` 声明全局变量
3. `<field name="output" var="resultVar"/>` 通过输出绑定声明 block 级变量
4. 变量引用 MUST 在声明之后
5. 跨 sequence 引用变量 SHOULD 使用 workflow 级变量

---

## 5. 条件表达式

条件表达式用于 gateway 的 `test` 属性、branch 的 `test` 属性、checkpoint 的 `verify` 属性。

### 5.1 支持的运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `==` | 等于 | `${executionPath} == 'A'` |
| `!=` | 不等于 | `${status} != 'failed'` |
| `>` | 大于 | `${matcherResult.matched_modules.length} > 0` |
| `<` | 小于 | `${counts.pending} < 5` |
| `>=` | 大于等于 | `${progress} >= 100` |
| `<=` | 小于等于 | `${retryCount} <= 3` |
| `&&` | 逻辑与 | `${counts.pending} == 0 && ${counts.failed} == 0` |
| `\|\|` | 逻辑或 | `${status} == 'completed' \|\| ${status} == 'skipped'` |
| `in` | 包含于 | `${platform} in ['web-vue', 'web-react']` |

### 5.2 XML 转义规则

在 XML 属性值中，以下字符 MUST 进行转义：

| 字符 | 转义 | 示例 |
|------|------|------|
| `&` | `&amp;` | `${a} == 0 &amp;&amp; ${b} == 0` |
| `<` | `&lt;` | `${count} &lt; 5` |
| `>` | `&gt;` | `${count} > 0`（大于号可不转义，但建议保持一致） |
| `'` | `&apos;` | 在单引号属性中 |
| `"` | `&quot;` | 在双引号属性中 |

### 5.3 表达式示例

```xml
<!-- 简单比较 -->
<block type="gateway" mode="guard" test="${knowledgeStatus.exists} == true" .../>

<!-- 数值比较 -->
<block type="gateway" mode="guard" test="${matcherResult.matched_modules.length} > 0" .../>

<!-- 逻辑与（注意 XML 转义） -->
<block type="gateway" mode="guard"
        test="${counts.pending} == 0 &amp;&amp; ${counts.failed} == 0" .../>

<!-- branch 条件 -->
<branch test="${executionPath} == 'A'" name="增量更新"/>

<!-- checkpoint 验证 -->
<block type="checkpoint" name="tasks_initialized">
  <field name="verify" value="${tasks.length} > 0"/>
</block>
```

---

## 6. 状态管理

### 6.1 五种状态

| 状态 | 说明 |
|------|------|
| `pending` | 等待执行 |
| `running` | 正在执行 |
| `completed` | 执行完成 |
| `failed` | 执行失败 |
| `skipped` | 被跳过（条件不满足或依赖失败） |

### 6.2 状态流转规则

```
pending → running → completed
   ↓         ↓
skipped   failed
```

| 起始状态 → 目标状态 | 触发条件 |
|---------------------|----------|
| `pending` → `running` | 积木开始执行 |
| `running` → `completed` | 积木执行成功 |
| `running` → `failed` | 积木执行失败 |
| `pending` → `skipped` | 条件不满足（如 guard 门禁 fail-action=skip、分支未命中、loop where 过滤无匹配） |

### 6.3 状态持久化

状态保存在积木的 `status` 属性中，同时 MUST 同步到 JSON 进度文件：

```xml
<workflow id="phase-1" status="running">
  <sequence id="S1" status="completed">
    <block type="task" id="B1" status="completed" action="run-script" desc="检查知识库"/>
  </sequence>
  <sequence id="S2" status="running">
    <block type="task" id="B2" status="running" action="run-skill" desc="模块匹配"/>
  </sequence>
</workflow>
```

### 6.4 断点续执

中断后从上次位置恢复，跳过所有 `completed` 状态的积木：

```xml
<workflow id="phase-1" status="resuming">
  <!-- 已完成，跳过 -->
  <sequence id="S1" status="completed">
    <block type="task" id="B1" status="completed" desc="已完成"/>
  </sequence>

  <!-- 从第一个非 completed 积木继续 -->
  <sequence id="S2" status="running">
    <block type="task" id="B2" status="completed" desc="已完成"/>
    <block type="task" id="B3" status="pending" resume-point="true" desc="从这里继续"/>
  </sequence>
</workflow>
```

---

## 7. 内联 Schema 自解释性

### 7.1 机制说明

每个工作流顶部 MUST 包含 Block Types 注释，帮助 LLM 无需查阅外部文档即可理解积木类型。

### 7.2 标准格式

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

### 7.3 要求

1. 内联 Schema 注释 MUST 紧跟 `<workflow>` 开头标签
2. MUST 包含所有当前工作流使用的积木类型
3. SHOULD 包含 Field 说明
4. 验证器 MUST 检查内联 Schema 完整性

---

## 8. Markdown + XML 混合模式

### 8.1 分工原则

- **Markdown**：负责说明描述、业务背景、约束规则
- **XML**：负责执行逻辑、控制流、状态管理

### 8.2 混合模式示例

```markdown
## Phase 1: 知识库初始化

> 本阶段负责检测和初始化知识库。根据检测结果选择 Path A（增量）或 Path B（全量）。

<workflow id="phase-1-knowledge-init" status="pending">
  <!--
  == Block Types ==
  input   : 工作流输入参数
  output  : 工作流输出结果
  task    : 执行动作
  gateway : 条件分支/门禁
  loop    : 循环遍历
  event   : 日志/确认
  error-handler : 异常处理
  checkpoint : 持久化里程碑
  rule    : 约束声明
  -->
  <block type="input" id="I1" desc="工作流输入参数">
    <field name="workspace" required="true" type="string" desc="工作空间根目录"/>
  </block>
  <sequence id="S1" name="知识库检测">
    <!-- 积木内容 -->
  </sequence>
</workflow>

## 详细说明

### Sequence S1.1: 知识库检测

详细说明...
```

---

## 附录 A：积木类型速查表

| 积木类型 | 用途 | 关键属性 |
|----------|------|----------|
| `input` | 工作流输入参数 | required, default, desc |
| `output` | 工作流输出结果 | from, desc |
| `task` | 执行动作 | action, desc |
| `gateway` | 条件分支/门禁 | mode, test, fail-action, desc |
| `loop` | 循环遍历 | over, as, where, parallel, desc |
| `event` | 日志/确认/信号 | action, level, desc |
| `error-handler` | 异常处理 | desc |
| `checkpoint` | 持久化里程碑 | name, verify, desc |
| `rule` | 约束声明 | level, scope, desc |

## 附录 B：变量引用速查

| 语法 | 说明 |
|------|------|
| `${var}` | 简单变量 |
| `${obj.prop}` | 对象属性 |
| `${arr[0]}` | 数组索引 |
| `${arr.length}` | 数组长度 |
| `${workflow.id}` | 内置变量 |

## 附录 C：条件表达式速查

| 运算符 | 说明 | XML 转义 |
|--------|------|----------|
| `==` | 等于 | 不需要 |
| `!=` | 不等于 | 不需要 |
| `>`, `<` | 大于/小于 | `<` → `&lt;` |
| `>=`, `<=` | 大于等于/小于等于 | `<` → `&lt;` |
| `&&` | 逻辑与 | `&amp;&amp;` |
| `\|\|` | 逻辑或 | 不需要 |
| `in` | 包含于 | 不需要 |
