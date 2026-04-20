# ai-xml-flow 平台集成指南

> 本文档面向 Agent 平台开发者，指导如何集成 ai-xml-flow 标准格式，实现对 AGENT.xml / SKILL.xml 的解析、执行和状态管理。

---

## 1. 概述与快速接入

### 1.1 ai-xml-flow 标准简介

ai-xml-flow 定义了一套**平台无关的 AI 工作流标准格式**，核心产出物为 **AGENT.xml** 和 **SKILL.xml**——标准化的 XML 工作流定义文件。

**核心特点**：

| 特点 | 说明 |
|------|------|
| **平台无关** | 不绑定任何特定 AI IDE，任何 Agent 平台均可接入 |
| **积木模型** | 采用 Blockly 积木模型 + BPMN 语义分类，9 种积木类型覆盖所有工作流场景 |
| **自解释性** | 每个工作流顶部包含内联 Schema 注释，LLM 无需查阅外部文档即可理解 |
| **状态内嵌** | 执行状态直接嵌入积木属性，与工作流定义统一 |
| **断点续执** | 原生支持检查点和恢复机制 |

**两种工作流格式**：

| 格式 | 定义内容 | 编排权层级 |
|------|----------|-----------|
| **AGENT.xml** | Agent 级工作流：多 Phase、编排权、Worker 调度 | 高 |
| **SKILL.xml** | Skill 级工作流：单一技能的执行步骤、输入输出、错误处理 | 低 |

**平台消费模式**：

```
┌─────────────────────────────────────────────────────────────┐
│                      Agent 平台                              │
│  ┌─────────────┐    引用并执行    ┌─────────────────────┐   │
│  │ Agent 文档   │ ───────────────→ │   AGENT.xml         │   │
│  │ (Markdown)  │                  │   (工作流定义)       │   │
│  └─────────────┘                  └─────────────────────┘   │
│                                                             │
│  ┌─────────────┐    引用并执行    ┌─────────────────────┐   │
│  │ Skill 文档   │ ───────────────→ │   SKILL.xml         │   │
│  │ (Markdown)  │                  │   (工作流定义)       │   │
│  └─────────────┘                  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 快速接入 3 步教程

任何 Agent 平台只需实现以下 3 步即可接入 ai-xml-flow：

| 步骤 | 操作 | 说明 |
|------|------|------|
| **1. 解析** | 解析 AGENT.xml / SKILL.xml | 基于公开的 XSD Schema |
| **2. 执行** | 按 XML Flow 定义的积木序列执行工作流 | 从上到下逐 block 执行 |
| **3. 恢复** | 遵循状态管理和检查点协议实现断点续执 | 跳过 completed，重试 failed |

### 1.3 最小可用实现示例

以下伪代码展示一个最小可用的 ai-xml-flow 执行引擎：

```javascript
// 最小可用实现：解析 → 执行 → 恢复
class MinimalXmlFlowEngine {
  constructor(xmlFilePath) {
    this.xmlFilePath = xmlFilePath;
    this.variables = {};  // 变量存储
    this.status = {};     // 积木状态存储
  }

  // 步骤 1：解析
  async parse() {
    const xml = await readFile(this.xmlFilePath);
    const workflow = await parseXml(xml);  // 使用 xml2js 等库
    // 读取内联 Schema 注释
    this.schema = extractInlineSchema(workflow);
    // 递归构建积木树
    this.blockTree = buildBlockTree(workflow);
    // 初始化变量和状态
    this.initVariables(workflow);
    this.initStatus(workflow);
    return this.blockTree;
  }

  // 步骤 2：执行
  async execute() {
    for (const block of this.blockTree) {
      if (this.status[block.id] === 'completed') continue;  // 跳过已完成
      if (this.status[block.id] === 'skipped') continue;    // 跳过已跳过

      this.status[block.id] = 'running';
      await this.executeBlock(block);                       // 执行积木
      this.status[block.id] = 'completed';
    }
  }

  // 步骤 3：恢复
  async resume() {
    // 从持久化文件读取状态
    await this.loadProgress();
    // 从第一个非 completed 积木继续
    await this.execute();
  }

  async executeBlock(block) {
    switch (block.type) {
      case 'input':    this.handleInput(block); break;
      case 'output':   this.handleOutput(block); break;
      case 'task':     await this.handleTask(block); break;
      case 'gateway':  await this.handleGateway(block); break;
      case 'loop':     await this.handleLoop(block); break;
      case 'event':    this.handleEvent(block); break;
      case 'error-handler': await this.handleErrorHandler(block); break;
      case 'checkpoint': this.handleCheckpoint(block); break;
      case 'rule':     this.handleRule(block); break;
    }
  }
}
```

---

## 2. AGENT.xml / SKILL.xml 解析器接口规范

### 2.1 解析器输入输出定义

**输入**：XML 工作流文件路径（AGENT.xml 或 SKILL.xml）

**输出**：结构化 JSON 表示

```typescript
interface ParsedWorkflow {
  success: boolean;
  data: {
    workflow: {
      id: string;           // 工作流唯一标识
      version?: string;     // 版本号
      status: StatusType;   // 执行状态
      desc?: string;        // 描述
      fields: FieldDef[];   // 全局变量声明
      sequences: Sequence[]; // 顺序容器列表
      blocks: Block[];      // 顶层积木列表
    }
  }
}

type StatusType = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

interface FieldDef {
  name: string;
  value?: string;
  var?: string;
  from?: string;
  scope?: 'workflow' | 'sequence' | 'block';
  required?: boolean;
  default?: string;
  type?: string;
  desc?: string;
}

interface Sequence {
  id: string;
  name?: string;
  status?: StatusType;
  desc?: string;
  required?: boolean;
  fields: FieldDef[];
  blocks: Block[];
  sequences: Sequence[];  // 嵌套
}

interface Block {
  id: string;
  type: BlockType;
  status?: StatusType;
  desc: string;
  // task 相关
  action?: 'run-skill' | 'run-script' | 'dispatch-to-worker';
  timeout?: number;
  // gateway 相关
  mode?: 'exclusive' | 'guard' | 'parallel';
  test?: string;
  failAction?: 'stop' | 'retry' | 'skip' | 'fallback';
  branches?: Branch[];
  // loop 相关
  over?: string;
  as?: string;
  where?: string;
  parallel?: boolean;
  maxConcurrency?: number;
  // event 相关
  level?: 'debug' | 'info' | 'warn' | 'error';
  title?: string;
  // checkpoint 相关
  checkpointName?: string;
  // rule 相关
  ruleLevel?: 'forbidden' | 'mandatory' | 'note';
  scope?: string;
  // 子节点
  fields: FieldDef[];
  children: Block[];       // 嵌套积木
  tryBlocks?: Block[];     // error-handler
  catchBlocks?: CatchDef[];
  finallyBlocks?: Block[];
  onConfirm?: { blocks: Block[]; fields: FieldDef[] };
  onCancel?: { blocks: Block[]; fields: FieldDef[] };
  // 文本内容
  textContent?: string;
}

type BlockType = 'input' | 'output' | 'task' | 'gateway' | 'loop' | 'event' 
  | 'error-handler' | 'checkpoint' | 'rule';

interface Branch {
  name?: string;
  test?: string;
  default?: boolean;
  blocks: Block[];
  fields: FieldDef[];
}

interface CatchDef {
  errorType?: string;
  blocks: Block[];
}
```

**输出示例**：

```json
{
  "success": true,
  "data": {
    "workflow": {
      "id": "pm-phase-1-knowledge-init",
      "version": "2.0",
      "status": "pending",
      "desc": "PM Agent Phase 1: 知识库检测与初始化",
      "fields": [
        { "name": "workspace", "value": "${workspace.root}", "scope": "workflow" }
      ],
      "sequences": [
        {
          "id": "S1.1",
          "name": "知识库检测",
          "status": "pending",
          "blocks": [
            {
              "id": "B1.1.1",
              "type": "task",
              "action": "run-script",
              "status": "pending",
              "desc": "读取知识库目录状态",
              "fields": [
                { "name": "command", "value": "node scripts/check-knowledge.js" },
                { "name": "output", "var": "knowledgeStatus" }
              ]
            },
            {
              "id": "G1.1.2",
              "type": "gateway",
              "mode": "exclusive",
              "status": "pending",
              "desc": "根据检测结果选择执行路径",
              "branches": [
                { "test": "${knowledgeStatus.exists} == true", "name": "增量更新", "blocks": [] },
                { "default": true, "name": "全量初始化", "blocks": [] }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### 2.2 XML 节点遍历规则

解析器必须按以下规则遍历 XML 节点：

1. **根节点**：`<workflow>` 为唯一根元素
2. **顶层子节点**：`<field>`、`<sequence>`、`<block>` 按文档顺序排列
3. **sequence 内部**：`<field>`、`<sequence>`（嵌套）、`<block>` 按文档顺序排列
4. **block 内部**：根据 block type 不同，子节点规则不同（见下表）
5. **遍历方向**：从上到下，深度优先

**各积木类型的子节点规则**：

| 积木类型 | 允许的子节点 | 说明 |
|----------|-------------|------|
| `input` | `<field>` | 每个 field 定义一个输入参数 |
| `output` | `<field>` | 每个 field 定义一个输出值 |
| `task` | `<field>` | 参数和输出绑定 |
| `gateway` | `<branch>` | 每个 branch 内含 `<block>` 和 `<field>` |
| `loop` | `<block>`、`<field>` | 循环体内的积木 |
| `event` | `<field>`、`<on-confirm>`、`<on-cancel>` | 事件参数和回调 |
| `error-handler` | `<try>`、`<catch>`、`<finally>` | 异常处理三段式 |
| `checkpoint` | `<field>` | 检查点参数 |
| `rule` | `<field name="text">` | 规则条目 |

### 2.3 积木类型识别和属性提取

**积木类型识别**：通过 `<block>` 元素的 `type` 属性识别。

**9 种积木类型的必填属性**：

| 积木类型 | 必填属性 | 条件必填属性 |
|----------|---------|-------------|
| `input` | `id`, `desc` | — |
| `output` | `id`, `desc` | — |
| `task` | `id`, `action`, `desc` | — |
| `gateway` | `id`, `mode`, `desc` | `test`（guard 模式） |
| `loop` | `id`, `over`, `as`, `desc` | — |
| `event` | `id`, `action`, `desc` | — |
| `error-handler` | `id`, `desc` | — |
| `checkpoint` | `id`, `name`, `desc` | — |
| `rule` | `id`, `level`, `desc` | — |

**属性提取规则**：

| 来源 | 提取方式 | 说明 |
|------|---------|------|
| XML 属性 | `block.getAttribute('id')` | 如 `id`、`type`、`action` 等 |
| `<field>` 子节点 | `field.getAttribute('name')` / `field.textContent` | 如参数名和参数值 |
| 文本内容 | `block.textContent.trim()` | 如 event 积木的日志消息 |
| 内联 Schema | 解析 `<!-- == Block Types == -->` 注释 | 提取积木类型说明 |

### 2.4 变量系统解析

#### 2.4.1 变量引用语法

**格式**：`${varName}` 或 `${object.property}`

| 语法 | 说明 | 示例 |
|------|------|------|
| `${var}` | 简单变量 | `${workspace}` → `/d/dev/project` |
| `${obj.prop}` | 对象属性 | `${matcherResult.matched_modules.length}` → `5` |
| `${arr[0]}` | 数组索引 | `${tasks[0].name}` → `user-analysis` |
| `${workflow.id}` | 内置变量 | `${workflow.status}` → `running` |

#### 2.4.2 变量替换处理

解析器在执行时必须实现变量替换：

```javascript
function resolveVariable(expression, variables) {
  return expression.replace(/\$\{([^}]+)\}/g, (match, path) => {
    const parts = path.split('.');
    let value = variables;
    for (const part of parts) {
      // 处理数组索引：arr[0] → arr.0
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        value = value[arrayMatch[1]][parseInt(arrayMatch[2])];
      } else {
        value = value[part];
      }
      if (value === undefined) return match; // 未找到变量，保留原文
    }
    return value;
  });
}
```

#### 2.4.3 三层作用域

| 作用域 | 范围 | 生命周期 | 声明方式 |
|--------|------|----------|----------|
| `workflow` | 整个工作流 | 工作流执行期间 | `<field scope="workflow">` |
| `sequence` | 当前顺序容器 | 容器执行期间 | `<field scope="sequence">` |
| `block` | 当前积木 | 积木执行期间 | `<field scope="block">` 或输出绑定 |

**变量查找顺序**：`block` → `sequence` → `workflow` → 内置变量

#### 2.4.4 内置变量

解析器必须提供以下内置变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `${workspace}` | 工作空间根目录 | `/d/dev/project` |
| `${platform}` | 当前平台标识 | `web-vue` |
| `${timestamp}` | 当前时间戳（ISO 8601） | `2026-04-14T10:30:00.000+08:00` |
| `${workflow.id}` | 当前工作流 ID | `pm-phase-1` |
| `${workflow.status}` | 当前工作流状态 | `running` |
| `${sequence.id}` | 当前顺序容器 ID | `1.2` |
| `${block.id}` | 当前积木 ID | `1.2.1` |

#### 2.4.5 input block 的自动变量声明

`input` block 中的 field 会自动成为 `workflow` 作用域的变量：

```xml
<block type="input" id="I1" desc="输入参数">
  <field name="workspace" required="true" type="string" desc="工作空间"/>
  <!-- 自动声明: ${workspace} 可在整个工作流中使用 -->
</block>
```

解析器在处理 input block 时，必须将其所有 field 注册到 workflow 作用域。

### 2.5 Schema 验证（XSD）

解析器应基于 XSD Schema 对 XML 文件进行结构验证。XSD Schema 定义了所有合法的元素和属性。

**核心 XSD 定义**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- 根元素：workflow -->
  <xs:element name="workflow">
    <xs:complexType>
      <xs:sequence>
        <xs:any minOccurs="0" maxOccurs="1" processContents="skip"/>
        <xs:choice maxOccurs="unbounded">
          <xs:element ref="field"/>
          <xs:element ref="sequence"/>
          <xs:element ref="block"/>
        </xs:choice>
      </xs:sequence>
      <xs:attribute name="id" type="xs:string" use="required"/>
      <xs:attribute name="version" type="xs:string"/>
      <xs:attribute name="status" type="statusType"/>
      <xs:attribute name="desc" type="xs:string"/>
    </xs:complexType>
  </xs:element>

  <!-- 状态类型枚举 -->
  <xs:simpleType name="statusType">
    <xs:restriction base="xs:string">
      <xs:enumeration value="pending"/>
      <xs:enumeration value="running"/>
      <xs:enumeration value="completed"/>
      <xs:enumeration value="failed"/>
      <xs:enumeration value="skipped"/>
    </xs:restriction>
  </xs:simpleType>

  <!-- 顺序容器：sequence -->
  <xs:element name="sequence">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded">
          <xs:element ref="field"/>
          <xs:element ref="sequence"/>
          <xs:element ref="block"/>
        </xs:choice>
      </xs:sequence>
      <xs:attribute name="id" type="xs:string" use="required"/>
      <xs:attribute name="name" type="xs:string"/>
      <xs:attribute name="status" type="statusType"/>
      <xs:attribute name="desc" type="xs:string"/>
      <xs:attribute name="required" type="xs:boolean"/>
    </xs:complexType>
  </xs:element>

  <!-- 积木：block -->
  <xs:element name="block">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded" minOccurs="0">
          <xs:element ref="field"/>
          <xs:element ref="branch"/>
          <xs:element ref="try"/>
          <xs:element ref="catch"/>
          <xs:element ref="finally"/>
          <xs:element ref="on-confirm"/>
          <xs:element ref="on-cancel"/>
          <xs:element ref="block"/>
        </xs:choice>
      </xs:sequence>
      <xs:attribute name="id" type="xs:string" use="required"/>
      <xs:attribute name="type" type="blockType" use="required"/>
      <xs:attribute name="action" type="actionType"/>
      <xs:attribute name="mode" type="gatewayMode"/>
      <xs:attribute name="status" type="statusType"/>
      <xs:attribute name="desc" type="xs:string" use="required"/>
      <xs:attribute name="test" type="xs:string"/>
      <xs:attribute name="fail-action" type="failActionType"/>
      <xs:attribute name="over" type="xs:string"/>
      <xs:attribute name="as" type="xs:string"/>
      <xs:attribute name="where" type="xs:string"/>
      <xs:attribute name="parallel" type="xs:boolean"/>
      <xs:attribute name="max-concurrency" type="xs:integer"/>
      <xs:attribute name="level" type="logLevelType"/>
      <xs:attribute name="name" type="xs:string"/>
      <xs:attribute name="title" type="xs:string"/>
      <xs:attribute name="timeout" type="xs:integer"/>
      <xs:attribute name="wait-for-completion" type="xs:boolean"/>
      <xs:attribute name="resume-point" type="xs:boolean"/>
    </xs:complexType>
  </xs:element>

  <!-- 积木类型枚举 -->
  <xs:simpleType name="blockType">
    <xs:restriction base="xs:string">
      <xs:enumeration value="task"/>
      <xs:enumeration value="gateway"/>
      <xs:enumeration value="loop"/>
      <xs:enumeration value="event"/>
      <xs:enumeration value="error-handler"/>
    </xs:simpleType>
  </xs:simpleType>

  <!-- 动作类型枚举 -->
  <xs:simpleType name="actionType">
    <xs:restriction base="xs:string">
      <xs:enumeration value="run-skill"/>
      <xs:enumeration value="run-script"/>
      <xs:enumeration value="dispatch-to-worker"/>
      <xs:enumeration value="log"/>
      <xs:enumeration value="confirm"/>
      <xs:enumeration value="signal"/>
    </xs:restriction>
  </xs:simpleType>

  <!-- 网关模式枚举 -->
  <xs:simpleType name="gatewayMode">
    <xs:restriction base="xs:string">
      <xs:enumeration value="exclusive"/>
      <xs:enumeration value="guard"/>
      <xs:enumeration value="parallel"/>
    </xs:restriction>
  </xs:simpleType>

  <!-- 失败动作枚举 -->
  <xs:simpleType name="failActionType">
    <xs:restriction base="xs:string">
      <xs:enumeration value="stop"/>
      <xs:enumeration value="retry"/>
      <xs:enumeration value="skip"/>
      <xs:enumeration value="fallback"/>
    </xs:restriction>
  </xs:simpleType>

  <!-- 日志级别枚举 -->
  <xs:simpleType name="logLevelType">
    <xs:restriction base="xs:string">
      <xs:enumeration value="debug"/>
      <xs:enumeration value="info"/>
      <xs:enumeration value="warn"/>
      <xs:enumeration value="error"/>
    </xs:restriction>
  </xs:simpleType>

  <!-- 字段：field -->
  <xs:element name="field">
    <xs:complexType mixed="true">
      <xs:attribute name="name" type="xs:string"/>
      <xs:attribute name="value" type="xs:string"/>
      <xs:attribute name="var" type="xs:string"/>
      <xs:attribute name="from" type="xs:string"/>
      <xs:attribute name="scope" type="scopeType"/>
    </xs:complexType>
  </xs:element>

  <!-- 作用域枚举 -->
  <xs:simpleType name="scopeType">
    <xs:restriction base="xs:string">
      <xs:enumeration value="workflow"/>
      <xs:enumeration value="sequence"/>
      <xs:enumeration value="block"/>
    </xs:restriction>
  </xs:simpleType>

  <!-- 分支：branch -->
  <xs:element name="branch">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded" minOccurs="0">
          <xs:element ref="field"/>
          <xs:element ref="block"/>
        </xs:choice>
      </xs:sequence>
      <xs:attribute name="name" type="xs:string"/>
      <xs:attribute name="test" type="xs:string"/>
      <xs:attribute name="default" type="xs:boolean"/>
    </xs:complexType>
  </xs:element>

  <!-- 异常处理元素 -->
  <xs:element name="try">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded" minOccurs="0">
          <xs:element ref="block"/>
        </xs:choice>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <xs:element name="catch">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded" minOccurs="0">
          <xs:element ref="block"/>
        </xs:choice>
      </xs:sequence>
      <xs:attribute name="error-type" type="xs:string"/>
    </xs:complexType>
  </xs:element>

  <xs:element name="finally">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded" minOccurs="0">
          <xs:element ref="block"/>
        </xs:choice>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <!-- 确认事件元素 -->
  <xs:element name="on-confirm">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded" minOccurs="0">
          <xs:element ref="block"/>
          <xs:element ref="field"/>
        </xs:choice>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <xs:element name="on-cancel">
    <xs:complexType>
      <xs:sequence>
        <xs:choice maxOccurs="unbounded" minOccurs="0">
          <xs:element ref="block"/>
          <xs:element ref="field"/>
        </xs:choice>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

**验证检查项**：

| 校验项 | 说明 | 级别 |
|--------|------|------|
| 内联 Schema | 是否包含 Block Types 注释 | error |
| 必填属性 | `id`、`type`、`desc` 等必填属性是否存在 | error |
| 积木结构 | 子节点是否符合规则（如 gateway 必须包含 branch） | error |
| 变量引用 | `${var}` 引用的变量是否已声明 | warning |
| 积木引用 | fallback-to 等引用的积木是否存在 | error |
| 条件表达式 | test 属性语法是否正确 | warning |
| 重复 ID | 积木 ID 是否唯一 | error |
| 类型一致性 | type 属性是否为有效值 | error |

### 2.6 错误处理和回退

解析器应实现分层错误处理：

| 错误级别 | 处理方式 | 示例 |
|---------|---------|------|
| **致命错误** | 中止解析，返回错误信息 | XML 格式无效、缺少根元素 |
| **结构错误** | 记录错误，拒绝执行 | 必填属性缺失、积木 ID 重复 |
| **引用警告** | 记录警告，允许继续 | 未定义变量引用、条件表达式语法问题 |
| **Schema 警告** | 记录警告，允许继续 | 内联 Schema 不完整 |

**错误输出格式**：

```json
{
  "success": false,
  "errors": [
    {
      "type": "missing-attribute",
      "block": "B1.2.1",
      "attribute": "desc",
      "message": "Block must have 'desc' attribute"
    }
  ],
  "warnings": [
    {
      "type": "undefined-variable",
      "block": "B1.2.2",
      "variable": "unknownVar",
      "message": "Variable 'unknownVar' is not defined"
    }
  ]
}
```

---

## 3. 工作流执行器接口规范

### 3.1 执行器生命周期

```
初始化 → 执行 → 完成/失败
   ↑                    ↓
   └──── 恢复 ←─────────┘
```

**生命周期阶段**：

| 阶段 | 操作 | 说明 |
|------|------|------|
| **初始化** | 加载 XML、解析积木树、初始化变量和状态 | 读取 WORKFLOW-PROGRESS.json（如存在则恢复） |
| **执行** | 从上到下逐 block 执行 | 播报当前 block ID，更新状态 |
| **完成** | 所有积木执行完毕 | 更新 workflow status 为 completed |
| **失败** | 某积木执行失败 | 记录错误信息，更新 status 为 failed |
| **恢复** | 从中断点继续执行 | 跳过 completed 积木，从第一个 pending 积木继续 |

**执行器接口定义**：

```typescript
interface WorkflowExecutor {
  // 初始化
  initialize(xmlPath: string, inputs: Record<string, any>): Promise<void>;
  
  // 执行
  execute(): Promise<ExecutionResult>;
  
  // 恢复
  resume(progressFilePath: string): Promise<ExecutionResult>;
  
  // 查询状态
  getStatus(blockId?: string): Promise<BlockStatus>;
  
  // 更新状态
  updateStatus(blockId: string, status: StatusType): Promise<void>;
}

interface ExecutionResult {
  success: boolean;
  outputs: Record<string, any>;  // output block 定义的输出值
  error?: string;
  checkpointStatus: Record<string, boolean>;  // 各检查点通过状态
}

interface BlockStatus {
  blockId: string;
  type: BlockType;
  status: StatusType;
  startedAt?: string;
  completedAt?: string;
  parent?: string;
  progress?: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
  };
}
```

### 3.2 积木类型执行规则（9 种积木的执行语义）

#### 3.2.1 input — 输入积木

**执行语义**：

1. 读取调用者提供的输入参数
2. 验证 `required=true` 的参数是否已提供
3. 为缺失的可选参数应用 `default` 值
4. 将所有参数注册到 `workflow` 作用域变量表

**验证规则**：
- 缺少 required 参数时，工作流执行失败
- 参数类型提示（`type` 属性）仅供参考，不做强制类型转换

**执行伪代码**：

```javascript
function handleInput(block, inputs) {
  for (const field of block.fields) {
    if (field.required && !(field.name in inputs)) {
      throw new Error(`缺少必填参数: ${field.name}`);
    }
    const value = inputs[field.name] ?? field.default;
    setVariable(field.name, value, 'workflow');
  }
  block.status = 'completed';
}
```

#### 3.2.2 output — 输出积木

**执行语义**：

1. 读取每个 field 的 `from` 属性引用的变量值
2. 将变量值映射为输出结果
3. 返回给调用者

**执行伪代码**：

```javascript
function handleOutput(block) {
  const outputs = {};
  for (const field of block.fields) {
    outputs[field.name] = resolveVariable(field.from, variables);
  }
  block.status = 'completed';
  return outputs;
}
```

#### 3.2.3 task — 任务积木

**执行语义**：

根据 `action` 属性执行不同动作：

| action | 执行行为 | 必需字段 |
|--------|---------|---------|
| `run-skill` | 调用指定 Skill | `<field name="skill">` |
| `run-script` | 执行脚本命令 | `<field name="command">` |
| `dispatch-to-worker` | 分发任务给 Worker | `<field name="agent">` |

**run-skill**：
1. 解析 `skill` 字段获取 Skill 标识
2. 解析其他 field 作为 Skill 输入参数
3. 调用平台 Skill 执行机制
4. 如果有 `<field name="output" var="..."/>`, 将返回值绑定到变量

**run-script**：
1. 解析 `command` 字段获取脚本命令
2. 替换命令中的 `${var}` 变量
3. 执行脚本命令
4. 如果有 `<field name="output" var="..."/>`, 将输出绑定到变量
5. 如果指定了 `from` 属性，从指定文件读取输出

**dispatch-to-worker**：
1. 解析 `agent` 字段获取目标 Agent 标识
2. 解析 `context` 字段获取 dispatch 上下文
3. 平台侧执行 Worker 分发
4. 等待 Worker 完成（如 `wait-for-completion=true`）
5. 将结果绑定到输出变量

**超时处理**：如果指定 `timeout` 属性，超过指定秒数后中断执行并标记为 failed。

#### 3.2.4 gateway — 网关积木

三种执行模式：

**排他网关（exclusive）**：
1. 按顺序评估每个 branch 的 `test` 条件
2. 执行第一个匹配的 branch 内的所有 block
3. 如果没有匹配，执行 `default="true"` 的 branch
4. branch 内的 `<field>` 赋值在 branch 执行后生效

**门禁模式（guard）**：
1. 评估 `test` 条件
2. 条件通过 → 继续执行后续积木
3. 条件不通过 → 执行 `fail-action`：

| fail-action | 行为 |
|-------------|------|
| `stop` | 终止工作流，标记为 failed |
| `retry` | 重试当前积木 |
| `skip` | 跳过当前积木，继续后续 |
| `fallback` | 跳转到指定的 fallback 积木 |

**并行网关（parallel）**：
1. 同时启动所有 branch 的执行
2. 等待所有 branch 完成后继续
3. 任何一个 branch 失败则整个 gateway 失败

#### 3.2.5 loop — 循环积木

**执行语义**：

1. 解析 `over` 属性获取集合变量
2. 如果指定 `where` 条件，过滤集合
3. 如果 `parallel=true`，并行执行循环体；否则顺序执行
4. 如果指定 `max-concurrency`，限制并行数
5. 每次迭代中，当前项绑定到 `as` 指定的变量名

**执行伪代码**：

```javascript
async function handleLoop(block) {
  const collection = resolveVariable(block.over, variables);
  const filtered = block.where 
    ? collection.filter(item => evaluateCondition(block.where, { ...variables, [block.as]: item }))
    : collection;
  
  if (block.parallel) {
    const semaphore = new Semaphore(block.maxConcurrency || Infinity);
    await Promise.all(filtered.map(item => 
      semaphore.run(() => executeLoopBody(block.children, item))
    ));
  } else {
    for (const item of filtered) {
      await executeLoopBody(block.children, item);
    }
  }
}
```

#### 3.2.6 event — 事件积木

三种事件动作：

**log**：
1. 解析事件文本内容，替换变量
2. 按 `level` 级别输出日志
3. 不阻塞执行流

**confirm**：
1. 解析 `preview` 字段内容，替换变量
2. 暂停执行，呈现确认信息给用户
3. 用户确认 → 执行 `<on-confirm>` 内的 block 和 field 赋值
4. 用户取消 → 执行 `<on-cancel>` 内的 block 和 field 赋值
5. **此为 HARD STOP 点，必须等待用户响应**

**signal**：
1. 解析信号名称和参数
2. 发送信号给外部系统
3. 不阻塞执行流

#### 3.2.7 error-handler — 异常处理积木

**执行语义**：

1. 执行 `<try>` 内的所有 block
2. 如果执行过程中发生异常：
   a. 遍历 `<catch>` 块，匹配 `error-type`
   b. 执行第一个匹配的 catch 块内的 block
   c. 如果没有指定 `error-type` 的 catch，则匹配通用 catch
3. 无论是否发生异常，都执行 `<finally>` 内的 block（如有）

**异常对象**：
- `${error.message}` — 错误消息
- `${error.type}` — 错误类型
- `${error.taskId}` — 相关任务 ID（如适用）

#### 3.2.8 checkpoint — 检查点积木

**执行语义**：

1. 如果指定 `verify` 条件，评估条件：
   - 条件通过 → 标记 `passed: true`
   - 条件不通过 → 标记 `passed: false`
2. 如果指定 `passed` 值，直接标记
3. 将检查点状态写入 `file` 指定的持久化文件
4. 断点续执时，系统扫描所有 checkpoint，跳过已 passed 的部分

**持久化格式**：

```json
{
  "checkpoints": {
    "matcher_completed": { "passed": true, "timestamp": "2026-04-14T10:30:00.000+08:00" },
    "tasks_initialized": { "passed": true, "timestamp": "2026-04-14T10:35:00.000+08:00" }
  }
}
```

#### 3.2.9 rule — 规则声明积木

**执行语义**：

- rule block 是**声明型积木**，不执行动作
- 执行器遇到 rule block 时，必须将其内容加载到当前上下文的"活跃约束"中
- rule block 管控其后的 block，直到 sequence 结束或遇到下一个同 scope 的 rule

**规则级别**：

| level | 执行器行为 |
|-------|-----------|
| `forbidden` | 后续 block 执行时必须检查是否违反禁止项，违反则中止 |
| `mandatory` | 后续 block 必须满足强制要求，不满足则中止 |
| `note` | 提示信息，加载到上下文但不强制执行 |

**放置原则**：rule block 放在它管控的步骤**前面**（就近声明），支持三重保障模式。

### 3.3 顺序执行流程

**默认执行规则**：

1. 积木从上到下按文档顺序执行
2. `<sequence>` 内的 block 按顺序执行
3. `<sequence>` 可以嵌套，嵌套的 sequence 也按顺序执行
4. 每个积木执行前检查 `status` 属性：
   - `completed` → 跳过
   - `skipped` → 跳过
   - `pending` → 执行
   - `running` → 恢复执行
   - `failed` → 根据错误处理策略决定

**执行播报**：

执行器必须在每个积木执行时播报当前 block ID，帮助追踪执行进度：

```
[Block I1] 处理输入参数
[Block B1.1.1] 读取知识库目录状态
[Block G1.1.2] 根据检测结果选择执行路径
  → 匹配 branch: 增量更新
[Block B1.2A.1] 扫描知识库变更
...
```

### 3.4 条件分支处理（gateway）

**排他网关执行流程**：

```
gateway (exclusive)
  ├── branch test="条件1" → 条件1满足? → 执行 branch 1 内的 block
  ├── branch test="条件2" → 条件2满足? → 执行 branch 2 内的 block
  └── branch default=true → 无匹配时 → 执行默认 branch 内的 block
```

- 只执行第一个匹配的 branch
- `test` 条件中使用 `&&` 和 `||` 组合，XML 中需转义为 `&amp;&amp;`
- branch 内的 `<field>` 赋值在 branch 执行后立即生效

**门禁网关执行流程**：

```
gateway (guard, test="条件", fail-action="stop")
  ├── 条件通过 → 继续执行后续积木
  └── 条件不通过 → 执行 fail-action
       ├── stop    → 终止工作流
       ├── retry   → 重新评估条件（最多重试 N 次）
       ├── skip    → 跳过此 gateway，继续后续
       └── fallback → 跳转到 fallback 积木
```

### 3.5 循环处理（loop）

**顺序循环**：

```
loop (over=${tasks}, as=task, where=${task.status}=='pending')
  ├── 迭代 1: task = tasks[0], 执行循环体
  ├── 迭代 2: task = tasks[1], 执行循环体
  └── ...
```

**并行循环**：

```
loop (over=${tasks}, as=task, parallel=true, max-concurrency=5)
  ├── 并行执行迭代 1-5
  ├── 等待某个完成，启动迭代 6
  └── 直到所有迭代完成
```

**注意事项**：
- `where` 过滤在迭代前执行，不是在执行中
- 并行循环中，变量修改需考虑线程安全
- 循环体内的 `status` 更新应使用脚本而非直接修改变量

### 3.6 事件触发处理（event）

**log 事件**：直接输出，不阻塞

**confirm 事件**：HARD STOP，必须暂停等待用户响应

| 用户操作 | 执行器行为 |
|---------|-----------|
| 确认 | 执行 `<on-confirm>` 内的 block，应用 field 赋值，继续后续 |
| 取消 | 执行 `<on-cancel>` 内的 block，应用 field 赋值，按取消逻辑处理 |

**signal 事件**：发送信号，不阻塞

### 3.7 错误处理流程（error-handler）

```
error-handler
  ├── try → 正常执行（可能抛出异常）
  ├── catch error-type="特定类型" → 捕获特定异常，执行恢复逻辑
  ├── catch → 捕获所有其他异常
  └── finally → 无论是否异常都执行
```

**异常变量**：
- `${error.message}` — 异常消息
- `${error.type}` — 异常类型标识
- `${error.taskId}` — 相关任务 ID

### 3.8 检查点处理（checkpoint）

**执行流程**：

```
checkpoint (name="xxx", verify="条件")
  ├── 评估 verify 条件
  │   ├── 通过 → 写入 {name: passed: true, timestamp}
  │   └── 不通过 → 写入 {name: passed: false, timestamp}
  └── 持久化到指定文件
```

**断点续执时的行为**：

```
恢复执行
  ├── 读取检查点文件
  ├── 扫描所有 checkpoint block
  │   ├── passed=true → 标记为 completed，跳过
  │   └── passed=false → 需要重新执行
  └── 从第一个未通过的 checkpoint 之前继续
```

---

## 4. 状态持久化与断点续执接口

### 4.1 五种状态

```
pending → running → completed
   ↓         ↓
skipped   failed
```

| 状态 | 说明 | 触发条件 |
|------|------|---------|
| `pending` | 等待执行 | 初始状态 |
| `running` | 正在执行 | 积木开始执行 |
| `completed` | 执行完成 | 积木执行成功 |
| `failed` | 执行失败 | 积木执行出错 |
| `skipped` | 被跳过 | 条件不满足或依赖失败 |

### 4.2 状态持久化接口定义

```typescript
interface StatePersistence {
  // 初始化工作流状态
  initWorkflow(workflowId: string, xmlPath: string): Promise<void>;
  
  // 读取积木状态
  getBlockStatus(blockId: string): Promise<StatusType>;
  
  // 更新积木状态
  updateBlockStatus(blockId: string, status: StatusType): Promise<void>;
  
  // 读取工作流状态
  getWorkflowStatus(): Promise<WorkflowProgress>;
  
  // 写入检查点
  writeCheckpoint(name: string, passed: boolean, filePath: string): Promise<void>;
  
  // 读取检查点
  readCheckpoints(filePath: string): Promise<Record<string, CheckpointStatus>>;
  
  // 获取恢复点
  getResumePoint(): Promise<string | null>;  // 返回 block ID
  
  // 同步 XML 状态属性
  syncToXml(xmlPath: string): Promise<void>;
}
```

### 4.3 断点续执协议

**恢复流程**：

1. 读取 `WORKFLOW-PROGRESS.json` 获取历史状态
2. 扫描所有积木的 `status` 属性
3. 跳过 `completed` 和 `skipped` 状态的积木
4. 从第一个 `pending` 或 `failed` 状态的积木开始恢复
5. 重试 `failed` 状态的积木（如果策略允许）
6. 继续后续积木的执行

**恢复条件判断**：

| 条件 | 动作 |
|------|------|
| `WORKFLOW-PROGRESS.json` 不存在 | 从头开始执行 |
| 文件存在且有 `completed` 积木 | 跳过已完成，从恢复点继续 |
| 文件存在且有 `failed` 积木 | 重试失败积木，然后继续 |
| 所有积木都是 `completed` | 工作流已完成，无需恢复 |

### 4.4 WORKFLOW-PROGRESS.json 格式

```json
{
  "workflow_id": "pm-phase-1-knowledge-init",
  "workflow_xml": "pm-phase-1.xml",
  "status": "running",
  "created_at": "2026-04-14T10:00:00.000+08:00",
  "updated_at": "2026-04-14T10:30:00.000+08:00",
  "current_sequence": "S1.2B",
  "current_block": "B1.2B.5",
  "sequences": {
    "S1.1": { "status": "completed", "completed_at": "2026-04-14T10:10:00.000+08:00" },
    "S1.2B": { "status": "running", "started_at": "2026-04-14T10:15:00.000+08:00" }
  },
  "blocks": {
    "B1.1.1": { "status": "completed" },
    "G1.1.2": { "status": "completed" },
    "B1.2B.1": { "status": "completed" },
    "B1.2B.2": { "status": "completed" },
    "B1.2B.3": { "status": "completed" },
    "B1.2B.4": { "status": "completed" },
    "B1.2B.5": { "status": "running" }
  },
  "checkpoints": {
    "matcher_completed": { "passed": true, "timestamp": "2026-04-14T10:20:00.000+08:00" },
    "tasks_initialized": { "passed": true, "timestamp": "2026-04-14T10:25:00.000+08:00" }
  },
  "counts": {
    "total": 156,
    "pending": 100,
    "in_progress": 5,
    "completed": 50,
    "failed": 1
  },
  "tasks": [
    { "id": "ki-web-vue-user-UserController", "status": "completed" }
  ]
}
```

**与 DISPATCH-PROGRESS.json 的统一**：

XML 工作流状态与 DISPATCH-PROGRESS.json 统一存储，`workflow_xml` 字段关联 XML 文件，`blocks` 字段记录积木状态，`tasks` 字段记录 Worker 任务状态。

### 4.5 恢复流程

**完整恢复流程图**：

```
启动工作流
  ↓
WORKFLOW-PROGRESS.json 是否存在?
  ├── 否 → 从头开始执行
  └── 是 → 读取状态
       ↓
     检查 workflow status
       ├── completed → 工作流已完成，输出结果
       ├── failed → 从失败积木重试
       └── running → 检查恢复点
            ↓
          读取 checkpoints
            ↓
          确定恢复点
            ├── 有 resume-point 的积木 → 从该积木恢复
            └── 无 → 从第一个 pending/failed 积木恢复
                 ↓
               执行恢复
                 ├── 跳过 completed 积木
                 ├── 重试 failed 积木
                 └── 继续执行 pending 积木
                      ↓
                    更新状态和检查点
```

**恢复时的状态同步**：

1. 恢复后，将 workflow 的 `status` 从 `running` 更新为 `resuming`
2. 定位到恢复点积木后，更新 `status` 为 `running`
3. 执行完成后，更新为 `completed` 或 `failed`
4. 同步更新 XML 文件中的 `status` 属性和 JSON 进度文件

---

## 5. speccrew 参考实现解析

### 5.1 speccrew 如何加载 ai-xml-flow.xml

speccrew 是 ai-xml-flow 的首个实现平台。其加载流程如下：

```
Agent 文档 (Markdown)
  └── Workflow 章节引用 ai-xml-flow.xml
       └── Worker 接收任务
            ├── 1. 读取 workflow.agentflow.xml（必须）
            ├── 2. 解析内联 Schema 注释
            ├── 3. 按 block 顺序逐个执行
            ├── 4. 播报 "[Block P1-B3] 加载问题模板"
            ├── 5. 执行 block 内容
            ├── 6. 更新 block status
            └── 7. 继续下一个 block
```

**关键实现点**：

| 要点 | 说明 |
|------|------|
| Worker 执行前必须读取 `workflow.agentflow.xml` | 执行权威分层原则（L1 执行计划） |
| Worker 必须按 XML 文档顺序逐 block 执行 | 顺序性保证 |
| Worker 播报当前执行的 block ID | 进度可追踪 |
| 状态更新同步到 XML 和 JSON 进度文件 | 双重持久化 |

### 5.2 Agent 文档如何引用 XML 工作流

Agent 定义采用 **Markdown + XML** 混合模式：

```markdown
# PM Agent - Phase 1: 知识库初始化

## 概述

本阶段负责检测和初始化知识库...

## 执行流程

<workflow id="pm-phase-1" status="pending">
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
  <block type="input" id="I1" desc="输入参数">...</block>
  <sequence id="S1" name="知识库检测">...</sequence>
  <block type="output" id="O1" desc="输出结果">...</block>
</workflow>

## 详细说明

### Sequence S1.1: 知识库检测

详细说明...

## 约束规则

- FORBIDDEN: 跳过 gateway 门禁检查
- MANDATORY: 使用脚本更新进度
```

**关键约定**：
- Agent 文档的 Workflow 章节直接嵌入 `<workflow>` XML
- Markdown 负责说明描述、业务背景、约束规则
- XML 负责执行逻辑、控制流、状态管理
- 如果 XML 工作流以独立文件存在，Agent 文档通过路径引用

### 5.3 Skill 文档如何引用 XML 工作流

```markdown
# Skill: speccrew-knowledge-module-matcher

## 输入

- `source_path`: 源码路径
- `platform_id`: 平台标识

## 输出

- `matched_modules`: 匹配模块列表

## 执行流程

<workflow id="module-matcher" status="pending">
  <!--
  == Block Types ==
  input   : 工作流输入参数
  output  : 工作流输出结果
  task    : 执行动作
  gateway : 条件分支/门禁
  -->
  <block type="input" id="I1" desc="模块匹配输入参数">
    <field name="source_path" required="true" type="string" desc="源码路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
  </block>
  <sequence id="S1" name="模块匹配">
    <block type="task" id="B1" action="run-script" desc="扫描源码目录">
      <field name="command">find ${source_path} -name '*.java' -o -name '*.vue'</field>
      <field name="output" var="sourceFiles"/>
    </block>
  </sequence>
  <block type="output" id="O1" desc="模块匹配输出结果">
    <field name="matched_modules" from="${sourceFiles.matched}" type="array" desc="匹配模块列表"/>
  </block>
</workflow>

## 输出格式

\```json
{
  "matched_modules": [
    {"module_name": "user", "confidence": "high"}
  ]
}
\```
```

**关键约定**：
- Skill 的 input/output 积木与 SKILL.md 的输入输出定义对应
- 函数签名风格：input + output 让工作流像函数一样清晰
- 简单 Skill（3 步以内）可不使用 XML 工作流

### 5.4 平台侧的消费模式详解

**三层权威体系**：

| 层级 | 来源 | 作用 | 优先级 |
|------|------|------|--------|
| **L1 执行计划** | `workflow.agentflow.xml` | 定义执行顺序、分支、门控 | 最高 |
| **L2 元数据** | `SKILL.md` | 输入输出定义、模板引用、补充上下文 | 次要 |
| **L3 数据参数** | Agent dispatch context | 路径、ID、配置值等数据参数 | 仅数据 |

**消费流程**：

```
Agent 接收任务
  ↓
读取 Agent 文档 → 找到 Workflow 章节的 XML 引用
  ↓
解析 <workflow> XML
  ↓
按 block 顺序执行：
  ├── input block → 验证输入参数
  ├── sequence → 按顺序执行积木
  │   ├── task → 调用 Skill / 执行脚本 / 分发 Worker
  │   ├── gateway → 条件分支 / 门禁检查
  │   ├── loop → 循环遍历
  │   ├── event → 日志输出 / 用户确认
  │   ├── error-handler → 异常处理
  │   ├── checkpoint → 持久化检查点
  │   └── rule → 加载约束规则
  └── output block → 收集输出结果
  ↓
同步状态到 WORKFLOW-PROGRESS.json
  ↓
完成或等待恢复
```

**dispatch 上下文纯净原则**：

dispatch Worker 时的 context 字段**只传数据参数**，禁止混入执行指令：

| 允许 | 禁止 |
|------|------|
| `"iteration_path": "..."` | `"Execution Requirements": "..."` |
| `"complexity": "simple"` | `"Step 1: Create ..."` |
| `"prd_path": "..."` | `"You should..."` |
| `"module_id": "M-001"` | `"Generate questions..."` |

执行逻辑由 Skill 的 `workflow.agentflow.xml` 定义，不由调度方覆盖。

---

## 6. Harness 原则合规检查

### 6.1 平台实现需要关注的关键 Harness 原则

ai-xml-flow 将 Harness 23 条原则深度融入标准格式设计中。平台实现者需重点关注以下原则：

#### 原则 1：SOP 连续性（操作手册原则）

**格式体现**：
- XML 积木从上到下堆叠，自然形成执行顺序
- 每个 block 的 `desc` 属性清晰说明"做什么"
- 禁止跳转引用，所有信息在 block 内自包含

**平台合规要求**：
- 执行器必须按文档顺序逐 block 执行
- 不得跳过积木（除非 status 为 completed/skipped）
- 每个积木的执行不依赖其他积木的上下文

#### 原则 3：输入输出原则（接口契约）

**格式体现**：
- `<block type="input">` 明确定义输入参数
- `<block type="output">` 明确定义输出结果
- 函数签名风格让工作流像函数一样清晰

**平台合规要求**：
- 执行器必须验证 required 参数是否提供
- 输出结果必须按 output block 定义返回
- 参数传递链路必须完整

#### 原则 7：检查点与恢复原则

**格式体现**：
- `<block type="checkpoint">` 显式标记关键里程碑
- `status` 属性嵌入积木，与工作流定义统一
- 支持断点续执时自动识别恢复点

**平台合规要求**：
- 实现检查点持久化机制
- 恢复时正确跳过已通过检查点
- 复杂工作流建议每个 Phase 包含 3-5 个检查点

#### 原则 11：确认门控原则（HARD STOP）

**格式体现**：
- `<block type="event" action="confirm">` 实现 HARD STOP
- `<on-confirm>` 和 `<on-cancel>` 定义确认/取消行为
- 确认期间禁止一切自动操作

**平台合规要求**：
- confirm 事件必须暂停等待用户响应
- 禁止以"自动化执行场景"等理由绕过 HARD STOP
- 确认期间不修改任何进度文件

#### 原则 12：上下文管理原则

**格式体现**：
- `<block type="rule">` 就近声明约束
- 支持三重保障模式
- 规则放在受管控步骤前面

**平台合规要求**：
- 执行 rule block 时将其内容加载到活跃约束
- 后续 block 执行时检查是否违反 forbidden 规则
- mandatory 规则必须满足才能继续

#### 原则 14：否定清单原则（FORBIDDEN 模式）

**格式体现**：
- `<block type="rule" level="forbidden">` 显式声明禁止事项
- 每个 rule 可包含多个禁止条目

**平台合规要求**：
- 执行器必须检查后续 block 是否违反 forbidden 规则
- 违反禁止规则时应中止执行
- 提供清晰的违规报告

#### 原则 17：编排权分层原则

**格式体现**：
- `action="dispatch-to-worker"` 只是声明意图，实际 dispatch 由 Agent 执行
- Skill 输出任务清单 JSON，Agent 消费并 dispatch Workers

**平台合规要求**：
- 编排权只在 Agent 层
- Worker 不嵌套 dispatch
- dispatch context 只传数据，不传执行指令

#### 原则 20：清单驱动执行原则

**格式体现**：
- `<block type="loop">` 遍历任务清单，状态追踪
- checkpoint 验证 `counts.pending == 0`
- 程序化自检替代文本约束

**平台合规要求**：
- 实现 DISPATCH-PROGRESS.json 的创建和更新
- 阶段入口进行程序化自检
- 支持从清单文件恢复进度

#### 原则 21：执行权威分层原则

**格式体现**：
- `workflow.agentflow.xml` 是 L1 执行计划（最高权威）
- `SKILL.md` 是 L2 元数据
- Agent dispatch 的 context 是 L3 数据参数

**平台合规要求**：
- Worker 执行前必须读取 XML 工作流
- 不得仅依据 SKILL.md 或 context 执行
- 按 XML 文档顺序逐 block 执行

#### 原则 22：调度上下文纯净原则

**平台合规要求**：
- dispatch context 只包含数据参数
- 禁止 context 中包含执行指令
- 执行逻辑由 XML 工作流定义

#### 原则 23：最小创建原则

**平台合规要求**：
- Worker 只创建 XML 工作流中显式定义的文件和目录
- 禁止基于"预判"创建未定义的产物
- 结构化输出必须有对应模板

### 6.2 合规检查清单

平台集成完成时，应逐项验证以下合规项：

**解析器合规**：

- [ ] 基于 XSD Schema 验证 XML 结构
- [ ] 正确识别 9 种积木类型
- [ ] 提取所有必填属性
- [ ] 解析内联 Schema 注释
- [ ] 变量引用语法正确解析（`${var}`、`${obj.prop}`、`${arr[0]}`）
- [ ] 三层作用域正确实现（workflow/sequence/block）
- [ ] 内置变量正确提供

**执行器合规**：

- [ ] 按文档顺序逐 block 执行
- [ ] 9 种积木类型执行语义正确实现
- [ ] input block 必填参数验证
- [ ] output block 输出映射正确
- [ ] gateway 三种模式（exclusive/guard/parallel）正确执行
- [ ] loop 顺序和并行模式正确实现
- [ ] event confirm 实现 HARD STOP（不绕过）
- [ ] error-handler try/catch/finally 正确执行
- [ ] checkpoint 持久化写入
- [ ] rule block 加载到活跃约束
- [ ] 执行时播报 block ID

**状态管理合规**：

- [ ] 5 种状态正确流转
- [ ] WORKFLOW-PROGRESS.json 格式正确
- [ ] 断点续执：跳过 completed，重试 failed
- [ ] 检查点恢复：读取并应用已通过检查点
- [ ] 状态同步到 XML 和 JSON
- [ ] 恢复点定位正确

**Harness 原则合规**：

- [ ] 原则 1：执行顺序性保证，无跳转
- [ ] 原则 3：输入输出接口契约完整
- [ ] 原则 7：检查点持久化和恢复
- [ ] 原则 11：confirm 事件为 HARD STOP，不可绕过
- [ ] 原则 12：rule block 就近声明约束
- [ ] 原则 14：forbidden 规则检查
- [ ] 原则 17：编排权分层（Agent 编排，Worker 执行）
- [ ] 原则 20：清单驱动执行，程序化自检
- [ ] 原则 21：XML 为 L1 执行权威
- [ ] 原则 22：dispatch context 只传数据
- [ ] 原则 23：只创建显式定义的产物

**完整性合规**：

- [ ] 积木 ID 唯一性
- [ ] 变量引用有效性
- [ ] gateway 必须包含 branch
- [ ] loop 必须指定 over 和 as
- [ ] error-handler 必须包含 try
- [ ] checkpoint 必须指定 file 和 name

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
| `event` | 日志/确认/信号 | action, level, desc |
| `error-handler` | 异常处理 | desc |
| `checkpoint` | 持久化里程碑 | name, verify, desc |
| `rule` | 约束声明 | level, scope, desc |

### 动作类型速查

| action | 用途 | 必需字段 |
|--------|------|----------|
| `run-skill` | 调用 Skill | `<field name="skill">` |
| `run-script` | 执行脚本 | `<field name="command">` |
| `dispatch-to-worker` | 分发 Worker | `<field name="agent">` |

### 网关模式速查

| 模式 | 用途 | BPMN 对应 |
|------|------|-----------|
| `exclusive` | 排他分支（走第一个匹配） | XOR Gateway |
| `guard` | 门禁检查（不通过则停止） | — |
| `parallel` | 并行执行（所有分支同时） | AND Gateway |

### 变量引用速查

| 语法 | 说明 |
|------|------|
| `${var}` | 简单变量 |
| `${obj.prop}` | 对象属性 |
| `${arr[0]}` | 数组索引 |
| `${workflow.id}` | 内置变量 |

### 状态流转速查

| 转换 | 触发条件 |
|------|---------|
| `pending → running` | 积木开始执行 |
| `running → completed` | 积木执行成功 |
| `running → failed` | 积木执行出错 |
| `pending → skipped` | 条件不满足或依赖失败 |
