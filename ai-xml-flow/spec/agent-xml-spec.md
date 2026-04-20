# AGENT.xml 格式规范

**版本**：1.0  
**状态**：正式规范  
**关键词**：MUST / SHOULD / MAY（遵循 RFC 2119）  
**依赖规范**：[xml-flow-spec.md](./xml-flow-spec.md)

---

## 1. AGENT.xml 概述

### 1.1 用途

AGENT.xml 定义 Agent 级工作流的标准格式。Agent 级工作流具有以下特点：

- 包含多个 Phase（阶段）
- 涉及 Worker 调度决策
- 包含复杂条件分支和循环
- 需要断点续执能力
- 具备编排权和调度权

### 1.2 与 SKILL.xml 的区别

| 特性 | AGENT.xml | SKILL.xml |
|------|-----------|-----------|
| **定位** | Agent 级工作流 | Skill 级工作流 |
| **编排权层级** | 多 Phase、编排权、Worker 调度 | 单一技能的执行步骤 |
| **典型场景** | PM Agent 的 Phase 1 → Phase 2 → Phase 3 | 模块匹配 Skill、代码分析 Skill |
| **Worker 调度** | 可直接使用 `dispatch-to-worker` | 仅声明意图，实际调度由 Agent 执行 |
| **Phase 管理** | 支持多 Phase 协调 | 单一执行单元 |
| **复杂度** | 高（跨 Phase 状态管理） | 中（单一技能内部流程） |

### 1.3 编排权层级

在 ai-xml-flow 体系中，编排权严格分层：

| 层级 | 角色 | 职责 | 禁止行为 |
|------|------|------|----------|
| **Agent** | 编排者 | 决策、路由、dispatch Workers、汇总结果 | 自身执行 Skill 生成大文档 |
| **Worker** | 执行者 | 接收 Skill，执行单一任务，返回结果 | dispatch 其他 Worker |
| **Skill** | 操作手册 | 定义"做什么"和"怎么做" | 包含 dispatch Worker 指令 |

AGENT.xml 位于 Agent 层级，拥有完整的编排权。

---

## 2. 文档结构

### 2.1 根元素结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="agent-workflow-id"
          version="1.0"
          status="pending"
          desc="Agent 工作流描述">
  <!-- 内联 Schema 注释 -->
  <!-- 输入参数定义 -->
  <!-- 全局变量声明 -->
  <!-- 多个 Phase（sequence） -->
  <!-- 输出结果定义 -->
</workflow>
```

### 2.2 多 Phase 组织方式

AGENT.xml 通常包含多个 `<sequence>` 元素，每个 sequence 对应一个 Phase：

```xml
<workflow id="pm-agent-workflow" status="pending">
  <!-- Phase 1: 知识库初始化 -->
  <sequence id="S1" name="Phase 1: 知识库初始化" status="pending">
    <!-- 积木内容 -->
  </sequence>
  
  <!-- Phase 2: 需求分析 -->
  <sequence id="S2" name="Phase 2: 需求分析" status="pending">
    <!-- 积木内容 -->
  </sequence>
  
  <!-- Phase 3: 功能设计 -->
  <sequence id="S3" name="Phase 3: 功能设计" status="pending">
    <!-- 积木内容 -->
  </sequence>
</workflow>
```

### 2.3 完整结构示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="pm-agent-phase-1" 
          version="1.0"
          status="pending"
          desc="PM Agent Phase 1: 知识库检测与初始化">
  
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
  
  <!-- 输入参数定义 -->
  <block type="input" id="I1" desc="工作流输入参数">
    <field name="workspace" required="true" type="string" desc="工作空间根目录"/>
    <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
  </block>
  
  <!-- 全局变量声明 -->
  <field name="workspace" value="${workspace.root}" scope="workflow"/>
  <field name="knowledgeDir" value="${workspace}/knowledges/bizs" scope="workflow"/>
  <field name="progressFile" value="${knowledgeDir}/DISPATCH-PROGRESS.json" scope="workflow"/>
  
  <!-- Phase 1.1: 知识库检测 -->
  <sequence id="S1.1" name="知识库检测" status="pending">
    <!-- 积木内容 -->
  </sequence>
  
  <!-- Phase 1.2: 全量初始化 -->
  <sequence id="S1.2" name="知识库全量初始化" status="pending">
    <!-- 积木内容 -->
  </sequence>
  
  <!-- Phase 2.0: 入口门禁检查 -->
  <sequence id="S2.0" name="Phase 2 入口检查" status="pending">
    <!-- 积木内容 -->
  </sequence>
  
  <!-- 输出结果定义 -->
  <block type="output" id="O1" desc="工作流输出结果">
    <field name="execution_path" from="${executionPath}" type="string" desc="实际执行路径"/>
    <field name="task_count" from="${tasks.length}" type="number" desc="处理的任务总数"/>
    <field name="success" from="${workflow.status} == 'completed'" type="boolean" desc="工作流是否成功"/>
  </block>
</workflow>
```

---

## 3. 编排权

### 3.1 Agent 级特有的编排能力

AGENT.xml 拥有以下特有的编排能力：

#### 3.1.1 Worker 调度

Agent 可以直接 dispatch Workers：

```xml
<block type="task" action="dispatch-to-worker" desc="Dispatch Worker 执行分析任务">
  <field name="agent">speccrew-task-worker</field>
  <field name="skill_path">${task.analyzer_skill}/SKILL.md</field>
  <field name="context">{
    "module": "${task.module}",
    "platform_id": "${task.platform_id}",
    "output_path": "${output.dir}/${task.module}.md"
  }</field>
</block>
```

#### 3.1.2 Phase 管理

Agent 负责管理多个 Phase 的执行顺序和状态：

```xml
<!-- Phase 1 完成后进入 Phase 2 -->
<sequence id="S1" name="Phase 1" status="pending">
  <!-- Phase 1 积木 -->
  <block type="checkpoint" id="CP1" name="phase_1_complete" desc="Phase 1 完成">
    <field name="file" value="${progressFile}"/>
    <field name="passed" value="true"/>
  </block>
</sequence>

<!-- Phase 2 入口门禁检查 -->
<sequence id="S2.0" name="Phase 2 入口检查" status="pending">
  <block type="task" action="run-script" desc="验证 Phase 1 完成状态">
    <field name="command">node scripts/update-progress.js read</field>
    <field name="arg">--file</field>
    <field name="arg">${progressFile}</field>
    <field name="output" var="progressSummary"/>
  </block>
  <block type="gateway" mode="guard" 
          test="${progressSummary.counts.pending} == 0 &amp;&amp; ${progressSummary.counts.failed} == 0" 
          fail-action="stop"
          desc="Phase 2 入口门禁">
    <field name="message">Phase 1 未完成，禁止进入 Phase 2</field>
  </block>
</sequence>
```

#### 3.1.3 多 Sequence 协调

Agent 可以协调多个 sequence 的执行：

```xml
<!-- 根据条件选择执行不同的 Sequence -->
<block type="gateway" id="G1" mode="exclusive" desc="根据复杂度选择执行路径">
  <branch test="${complexity} == 'simple'" name="简单路径">
    <field name="executionPath" value="simple"/>
  </branch>
  <branch test="${complexity} == 'complex'" name="复杂路径">
    <field name="executionPath" value="complex"/>
  </branch>
</block>

<!-- 简单路径 Sequence -->
<sequence id="S-simple" name="简单处理流程" status="pending">
  <block type="gateway" mode="guard" test="${executionPath} == 'simple'" fail-action="skip"/>
  <!-- 简单处理积木 -->
</sequence>

<!-- 复杂路径 Sequence -->
<sequence id="S-complex" name="复杂处理流程" status="pending">
  <block type="gateway" mode="guard" test="${executionPath} == 'complex'" fail-action="skip"/>
  <!-- 复杂处理积木 -->
</sequence>
```

### 3.2 编排权约束

1. Agent MUST 遵循 Harness 原则 17（编排权分层）
2. Agent SHOULD 使用 `dispatch-to-worker` 而非自身直接执行复杂任务
3. Agent MUST 在关键决策点设置 checkpoint
4. Agent SHOULD 在 Phase 过渡时进行程序化验证

---

## 4. Agent 特有积木用法

### 4.1 task 积木在 Agent 级的用法

Agent 级 task 积木可以使用全部三种 action：

| action | 用途 | Agent 级特殊用法 |
|--------|------|------------------|
| `run-skill` | 调用 Skill | 用于调用辅助 Skill 获取信息或执行轻量任务 |
| `run-script` | 执行脚本命令 | 用于状态查询、进度更新、检查点写入等 |
| `dispatch-to-worker` | 分发任务给 Worker | **Agent 特有**，用于批量任务并行处理 |

**示例：Agent 级 task 使用模式**

```xml
<!-- 模式 1：调用辅助 Skill 获取信息 -->
<block type="task" id="B1" action="run-skill" desc="执行模块匹配 Skill">
  <field name="skill">speccrew-knowledge-module-matcher</field>
  <field name="source_path" value="${source.path}"/>
  <field name="platform_id" value="${platform.id}"/>
  <field name="output" var="matcherResult"/>
</block>

<!-- 模式 2：执行脚本更新状态 -->
<block type="task" id="B2" action="run-script" desc="初始化任务清单">
  <field name="command">node scripts/update-progress.js init-tasks</field>
  <field name="arg">--file</field>
  <field name="arg">${progressFile}</field>
  <field name="arg">--matcher-result</field>
  <field name="arg">${matcherResultFile}</field>
</block>

<!-- 模式 3：Dispatch Worker 执行批量任务 -->
<block type="loop" id="L1" over="${tasks}" as="task" desc="遍历任务清单">
  <block type="task" action="dispatch-to-worker" desc="Dispatch Worker">
    <field name="agent">speccrew-task-worker</field>
    <field name="skill_path">${task.skill_path}</field>
    <field name="context">{
      "module": "${task.module}",
      "output_path": "${task.output_path}"
    }</field>
  </block>
</block>
```

### 4.2 gateway 积木在 Agent 级的用法

Agent 级 gateway 积木用于：

1. **多分支路径选择**：根据条件选择 Path A/B/C
2. **Phase 间门禁**：验证前一 Phase 完成状态
3. **复杂条件判断**：多条件组合判断

**示例：Phase 间门禁**

```xml
<sequence id="S2.0" name="Phase 2 入口检查" status="pending">
  <!-- 读取 Phase 1 进度 -->
  <block type="task" id="B2.0.1" action="run-script" desc="读取 Phase 1 完成状态">
    <field name="command">node scripts/update-progress.js read</field>
    <field name="arg">--file</field>
    <field name="arg">${progressFile}</field>
    <field name="output" var="progressSummary"/>
  </block>
  
  <!-- 根据进度决定进入 Phase 2 或回退 -->
  <block type="gateway" id="G2.0.2" mode="exclusive" desc="根据进度决定执行路径">
    <branch test="${progressSummary.counts.pending} == 0 &amp;&amp; ${progressSummary.counts.failed} == 0" name="允许进入 Phase 2">
      <block type="event" action="log" level="info" desc="记录进度">Phase 1 所有任务已完成</block>
    </branch>
    <branch test="${progressSummary.counts.pending} > 0" name="回退继续执行">
      <block type="event" action="log" level="warn" desc="记录警告">Phase 1 有待处理任务，回退继续</block>
      <field name="workflow.resumePoint" value="S1.2"/>
    </branch>
    <branch default="true" name="处理失败任务">
      <block type="event" action="log" level="error" desc="记录错误">Phase 1 有失败任务</block>
      <field name="workflow.resumePoint" value="S1.2"/>
    </branch>
  </block>
  
  <!-- Phase 2 入口门禁 -->
  <block type="gateway" id="G2.0.3" mode="guard" 
          test="${progressSummary.counts.pending} == 0 &amp;&amp; ${progressSummary.counts.failed} == 0" 
          fail-action="stop"
          desc="Phase 2 入口门禁：必须完成所有 Phase 1 任务">
    <field name="message">Phase 1 未完成，禁止进入 Phase 2</field>
  </block>
</sequence>
```

### 4.3 loop 积木在 Agent 级的用法

Agent 级 loop 积木主要用于批量 dispatch Workers：

```xml
<block type="error-handler" id="EH1" desc="Worker dispatch 批量执行异常处理">
  <try>
    <block type="loop" id="L1" over="${tasks}" as="task" 
            where="${task.status} == 'pending'" 
            parallel="true" max-concurrency="5"
            desc="遍历任务清单，逐个 dispatch Worker">
      
      <block type="event" action="log" level="info" desc="记录 dispatch">Dispatching: ${task.name}</block>
      
      <block type="task" action="dispatch-to-worker" timeout="300" desc="Dispatch Worker">
        <field name="agent">speccrew-task-worker</field>
        <field name="skill_path">${task.skill_path}</field>
        <field name="context">{
          "module": "${task.module}",
          "platform_id": "${task.platform_id}",
          "output_path": "${task.output_path}"
        }</field>
      </block>
      
      <block type="task" action="run-script" desc="更新任务状态">
        <field name="command">node scripts/update-progress.js update-task</field>
        <field name="arg">--file</field>
        <field name="arg">${progressFile}</field>
        <field name="arg">--task-id</field>
        <field name="arg">${task.id}</field>
        <field name="arg">--status</field>
        <field name="arg">completed</field>
      </block>
    </block>
  </try>
  <catch error-type="dispatch_timeout">
    <block type="event" action="log" level="error" desc="记录超时">Timeout: ${error.taskId}</block>
    <block type="task" action="run-script" desc="更新失败状态">
      <field name="command">node scripts/update-progress.js update-task</field>
      <field name="arg">--task-id</field>
      <field name="arg">${error.taskId}</field>
      <field name="arg">--status</field>
      <field name="arg">failed</field>
    </block>
  </catch>
</block>
```

### 4.4 checkpoint 积木在 Agent 级的用法

Agent 级 checkpoint 积木用于标记 Phase 完成状态，支持跨 Phase 断点续执：

```xml
<!-- Phase 1 完成检查点 -->
<block type="checkpoint" id="CP1" name="phase_1_complete" desc="Phase 1 全部完成">
  <field name="file" value="${progressFile}"/>
  <field name="verify" value="${counts.pending} == 0 &amp;&amp; ${counts.failed} == 0"/>
</block>

<!-- Phase 2 完成检查点 -->
<block type="checkpoint" id="CP2" name="phase_2_complete" desc="Phase 2 全部完成">
  <field name="file" value="${progressFilePhase2}"/>
  <field name="verify" value="${countsPhase2.pending} == 0"/>
</block>
```

### 4.5 rule 积木在 Agent 级的用法

Agent 级 rule 积木用于声明 Phase 级强制规则和 FORBIDDEN 清单：

```xml
<sequence id="S4" name="Phase 4: Sub-PRD 生成" status="pending">
  <!-- Phase 开头声明强制规则 -->
  <block type="rule" id="R-P4-1" level="mandatory" desc="Phase 4 强制规则">
    <field name="text">MUST dispatch Workers for Sub-PRD generation</field>
    <field name="text">DO NOT generate Sub-PRDs yourself</field>
  </block>
  
  <!-- 关键步骤前再次提醒 -->
  <block type="rule" id="R-P4-2" level="forbidden" desc="dispatch 前再次提醒">
    <field name="text">DO NOT generate Sub-PRDs yourself — MUST dispatch Workers</field>
  </block>
  
  <block type="loop" id="L1" over="${tasks}" as="task">
    <block type="task" action="dispatch-to-worker" desc="分发 Worker">...</block>
  </block>
</sequence>
```

---

## 5. 平台消费方式

### 5.1 标准消费协议

任何 Agent 平台消费 AGENT.xml 只需实现 3 步：

| 步骤 | 操作 | 说明 |
|------|------|------|
| **1. 解析** | 解析 AGENT.xml | 基于公开的 XSD Schema |
| **2. 执行** | 按 XML Flow 定义的积木序列执行工作流 | 从上到下逐 block 执行 |
| **3. 恢复** | 遵循状态管理和检查点协议实现断点续执 | 跳过 completed，重试 failed |

### 5.2 平台侧 Agent 文档如何引用 AGENT.xml

Agent 文档（Markdown）在 Workflow 章节引用 AGENT.xml：

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
  <!-- XML 工作流定义 -->
</workflow>

## 详细说明

### Sequence S1.1: 知识库检测

详细说明...
```

### 5.3 执行流程

```
Agent 读取 AGENT.xml
    ↓
解析内联 Schema，理解积木类型
    ↓
识别当前执行点（通过 status 属性）
    ↓
按顺序执行 pending 状态的积木
    ↓
播报当前执行的 block ID
    ↓
执行 block 内容
    ↓
更新 block status
    ↓
同步更新 JSON 进度文件
    ↓
继续下一个 block
```

### 5.4 断点续执

Agent 在执行前 MUST 检查状态：

```xml
<workflow id="phase-1" status="resuming">
  <!-- 状态为 completed 的积木会被跳过 -->
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

## 6. 完整示例

### 6.1 PM Agent Phase 1 知识库初始化（AGENT.xml 示例）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="pm-phase-1-knowledge-init" 
          version="2.0"
          status="pending"
          desc="PM Agent Phase 1: 知识库检测与初始化">
  
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
  
  <!-- ==================== 输入参数定义 ==================== -->
  <block type="input" id="I1" desc="工作流输入参数">
    <field name="workspace" required="true" type="string" desc="工作空间根目录"/>
    <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
  </block>
  
  <!-- ==================== 全局变量声明 ==================== -->
  <field name="workspace" value="${workspace.root}" scope="workflow"/>
  <field name="knowledgeDir" value="${workspace}/knowledges/bizs" scope="workflow"/>
  <field name="progressFile" value="${knowledgeDir}/DISPATCH-PROGRESS.json" scope="workflow"/>
  <field name="matcherResultFile" value="${knowledgeDir}/matcher-result.json" scope="workflow"/>
  <field name="executionPath" value="" scope="workflow"/>
  <field name="modules" value="[]" scope="workflow"/>
  <field name="tasks" value="[]" scope="workflow"/>

  <!-- ==================== Sequence 1.1: 知识库检测 ==================== -->
  <sequence id="S1.1" name="知识库检测" status="pending" desc="检测知识库是否存在">
    
    <block type="task" id="B1.1.1" action="run-script" status="pending" desc="读取知识库目录状态">
      <field name="command">node scripts/check-knowledge.js</field>
      <field name="arg">--dir</field>
      <field name="arg">${knowledgeDir}</field>
      <field name="output" var="knowledgeStatus"/>
    </block>
    
    <block type="gateway" id="G1.1.2" mode="exclusive" status="pending" desc="根据检测结果选择执行路径">
      <branch test="${knowledgeStatus.exists} == true &amp;&amp; ${knowledgeStatus.hasModules} == true" name="增量更新">
        <block type="event" action="log" level="info" desc="记录路径选择">知识库已存在，进入 Path A</block>
        <field name="executionPath" value="A"/>
      </branch>
      <branch default="true" name="全量初始化">
        <block type="event" action="log" level="info" desc="记录路径选择">知识库不存在，进入 Path B</block>
        <field name="executionPath" value="B"/>
      </branch>
    </block>
  </sequence>

  <!-- ==================== Sequence 1.2B: 全量初始化 ==================== -->
  <sequence id="S1.2B" name="知识库全量初始化" status="pending" desc="执行全量初始化流程">
    
    <block type="gateway" id="G1.2B.0" mode="guard" 
            test="${executionPath} == 'B'" 
            fail-action="skip"
            desc="Path B 入口门禁">
      <field name="message">非 Path B，跳过此 Sequence</field>
    </block>
    
    <!-- Step 1: 模块匹配 -->
    <block type="task" id="B1.2B.1" action="run-skill" status="pending" desc="执行模块匹配 Skill">
      <field name="skill">speccrew-knowledge-module-matcher</field>
      <field name="source_path" value="${source.path}"/>
      <field name="platform_id" value="${platform.id}"/>
      <field name="output" var="matcherResult"/>
    </block>
    
    <!-- HARD GATE: 验证匹配结果 -->
    <block type="gateway" id="G1.2B.2" mode="guard" 
            test="${matcherResult.matched_modules.length} > 0" 
            fail-action="stop"
            desc="验证模块匹配结果">
      <field name="message">模块匹配失败：未找到匹配的模块</field>
    </block>
    
    <!-- Checkpoint: 模块匹配完成 -->
    <block type="checkpoint" id="CP1" name="matcher_completed" desc="模块匹配完成">
      <field name="file" value="${progressFile}"/>
      <field name="verify" value="${matcherResult.matched_modules.length} > 0"/>
    </block>
    
    <!-- Step 2: 初始化任务清单 -->
    <block type="task" id="B1.2B.4" action="run-script" status="pending" desc="初始化任务清单">
      <field name="command">node scripts/update-progress.js init-knowledge-tasks</field>
      <field name="arg">--file</field>
      <field name="arg">${progressFile}</field>
      <field name="output" var="initResult"/>
    </block>
    
    <field name="tasks" value="${initResult.tasks}"/>
    
    <!-- Rule: dispatch 前强制规则 -->
    <block type="rule" id="R1" level="mandatory" desc="HARD GATE: 必须逐个 dispatch">
      <field name="text">必须遍历所有 pending 任务逐个 dispatch Worker</field>
      <field name="text">禁止跳过 dispatch 直接进入汇总步骤</field>
    </block>
    
    <!-- Step 3: 循环 dispatch Workers -->
    <block type="error-handler" id="EH1.2B.6" status="pending" desc="Worker dispatch 异常处理">
      <try>
        <block type="loop" id="L1.2B.6" over="${tasks}" as="task" 
                where="${task.status} == 'pending'" 
                parallel="true" max-concurrency="5"
                desc="遍历任务清单">
          
          <block type="event" action="log" level="info">Dispatching: ${task.name}</block>
          
          <block type="task" action="dispatch-to-worker" timeout="300" desc="Dispatch Worker">
            <field name="agent">speccrew-task-worker</field>
            <field name="skill_path">${task.skill_path}</field>
            <field name="context">{
              "module": "${task.module}",
              "platform_id": "${task.platform_id}",
              "output_path": "${knowledgeDir}/${task.module}/${task.fileName}.md"
            }</field>
          </block>
          
          <block type="task" action="run-script" desc="更新任务状态">
            <field name="command">node scripts/update-progress.js update-task</field>
            <field name="arg">--task-id</field>
            <field name="arg">${task.id}</field>
            <field name="arg">--status</field>
            <field name="arg">completed</field>
          </block>
        </block>
      </try>
      <catch error-type="dispatch_timeout">
        <block type="event" action="log" level="error">Timeout: ${error.taskId}</block>
        <block type="task" action="run-script" desc="更新失败状态">
          <field name="command">node scripts/update-progress.js update-task</field>
          <field name="arg">--task-id</field>
          <field name="arg">${error.taskId}</field>
          <field name="arg">--status</field>
          <field name="arg">failed</field>
        </block>
      </catch>
    </block>
    
    <!-- Checkpoint: 所有 Worker 任务完成 -->
    <block type="checkpoint" id="CP2" name="dispatch_complete" desc="所有 Worker 任务完成">
      <field name="file" value="${progressFile}"/>
      <field name="verify" value="${counts.pending} == 0 &amp;&amp; ${counts.failed} == 0"/>
    </block>
    
    <!-- Step 4: 汇总分析结果 -->
    <block type="task" id="B1.2B.7" action="run-skill" status="pending" desc="汇总分析结果">
      <field name="skill">speccrew-knowledge-bizs-summarize</field>
      <field name="knowledge_dir" value="${knowledgeDir}"/>
      <field name="output" var="summaryResult"/>
    </block>
  </sequence>

  <!-- ==================== Sequence 2.0: Phase 2 入口门禁检查 ==================== -->
  <sequence id="S2.0" name="Phase 2 入口检查" status="pending" desc="程序化验证 Phase 1 完成状态">
    
    <block type="task" id="B2.0.1" action="run-script" status="pending" desc="读取进度">
      <field name="command">node scripts/update-progress.js read</field>
      <field name="arg">--file</field>
      <field name="arg">${progressFile}</field>
      <field name="output" var="progressSummary"/>
    </block>
    
    <block type="gateway" id="G2.0.2" mode="exclusive" status="pending" desc="根据进度决定路径">
      <branch test="${progressSummary.counts.pending} == 0 &amp;&amp; ${progressSummary.counts.failed} == 0" name="允许进入 Phase 2">
        <block type="event" action="log" level="info">Phase 1 所有任务已完成</block>
      </branch>
      <branch test="${progressSummary.counts.pending} > 0" name="回退继续执行">
        <block type="event" action="log" level="warn">Phase 1 有待处理任务</block>
        <field name="workflow.resumePoint" value="S1.2B"/>
      </branch>
    </block>
    
    <block type="gateway" id="G2.0.3" mode="guard" 
            test="${progressSummary.counts.pending} == 0 &amp;&amp; ${progressSummary.counts.failed} == 0" 
            fail-action="stop"
            desc="Phase 2 入口门禁">
      <field name="message">Phase 1 未完成，禁止进入 Phase 2</field>
    </block>
  </sequence>

  <!-- ==================== 工作流完成 ==================== -->
  <block type="task" id="B-final" action="run-script" status="pending" desc="更新工作流完成状态">
    <field name="command">node scripts/update-progress.js update-workflow</field>
    <field name="arg">--stage</field>
    <field name="arg">phase_1</field>
    <field name="arg">--status</field>
    <field name="arg">completed</field>
  </block>
  
  <block type="checkpoint" id="CP3" name="phase_1_complete" desc="Phase 1 全部完成">
    <field name="file" value="${progressFile}"/>
    <field name="passed" value="true"/>
  </block>

  <!-- ==================== 输出结果定义 ==================== -->
  <block type="output" id="O1" desc="工作流输出结果">
    <field name="execution_path" from="${executionPath}" type="string" desc="实际执行路径"/>
    <field name="task_count" from="${tasks.length}" type="number" desc="处理的任务总数"/>
    <field name="success" from="${workflow.status} == 'completed'" type="boolean" desc="工作流是否成功"/>
  </block>

</workflow>
```

---

## 7. 最佳实践

### 7.1 AGENT.xml 设计原则

1. **Phase 划分清晰**：每个 sequence 对应一个明确的 Phase
2. **检查点完整**：每个 Phase 建议包含 3-5 个 checkpoint
3. **规则就近声明**：关键规则放在受管控步骤前面
4. **异常处理完善**：批量 dispatch 必须用 error-handler 包裹
5. **状态同步及时**：每个关键步骤后更新状态文件

### 7.2 典型组合模式

```
input → [rule] → sequence(检测) → gateway(选路) → sequence(Path A/B)
  → [rule] → loop(dispatch Workers) → error-handler(包裹 loop) → checkpoint → output
```

### 7.3 常见错误

| 错误 | 说明 | 正确做法 |
|------|------|----------|
| 缺少 checkpoint | 无法断点续执 | 在关键里程碑添加 checkpoint |
| rule 放在步骤后 | LLM 执行时看不到约束 | rule 放在受管控步骤前 |
| 跳过 gateway 检查 | 条件判断不完整 | 所有分支必须有明确条件或 default |
| loop 内不更新状态 | 无法追踪进度 | loop 内必须更新任务状态 |

---

## 附录：AGENT.xml 与 SKILL.xml 积木使用对比

| 积木类型 | AGENT.xml 中的用法 | SKILL.xml 中的用法 |
|----------|-------------------|-------------------|
| `input` | 定义多 Phase 共享的输入参数 | 定义单一技能的输入参数 |
| `output` | 输出跨 Phase 的汇总结果 | 输出单一技能的执行结果 |
| `task` | 可使用全部三种 action（含 dispatch-to-worker） | 主要使用 run-skill 和 run-script |
| `gateway` | 多分支路径选择、Phase 间门禁 | 简单条件判断和输入校验 |
| `loop` | 遍历任务清单批量 dispatch Worker | 遍历文件列表、配置项等 |
| `event` | 阶段进度播报、用户确认关键决策 | 日志输出为主 |
| `error-handler` | 包裹 Worker 批量 dispatch 的异常处理 | 包裹单一 Skill 执行的异常处理 |
| `checkpoint` | 标记 Phase 完成状态 | 标记技能关键步骤完成 |
| `rule` | Phase 级强制规则、FORBIDDEN 清单 | 技能内部的约束和提示 |
