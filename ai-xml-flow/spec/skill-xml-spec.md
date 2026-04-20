# SKILL.xml 格式规范

**版本**：1.0  
**状态**：正式规范  
**关键词**：MUST / SHOULD / MAY（遵循 RFC 2119）  
**依赖规范**：[xml-flow-spec.md](./xml-flow-spec.md)

---

## 1. SKILL.xml 概述

### 1.1 用途

SKILL.xml 定义 Skill 级工作流的标准格式。Skill 级工作流具有以下特点：

- 单一技能的执行步骤
- 明确的输入输出契约
- 包含错误处理逻辑
- 可被 AGENT.xml 调用
- 不具备编排权（不能直接调度 Worker）

### 1.2 与 AGENT.xml 的区别

| 特性 | SKILL.xml | AGENT.xml |
|------|-----------|-----------|
| **定位** | Skill 级工作流 | Agent 级工作流 |
| **编排权层级** | 单一技能的执行步骤 | 多 Phase、编排权、Worker 调度 |
| **典型场景** | 模块匹配 Skill、代码分析 Skill | PM Agent 的 Phase 1 → Phase 2 → Phase 3 |
| **Worker 调度** | **禁止**直接使用 `dispatch-to-worker` | 可直接 dispatch Workers |
| **Phase 管理** | 单一执行单元 | 支持多 Phase 协调 |
| **复杂度** | 中（单一技能内部流程） | 高（跨 Phase 状态管理） |

### 1.3 编排权约束

根据 Harness 原则 17（编排权分层），SKILL.xml 位于 Skill 层级：

| 层级 | 角色 | 职责 | 禁止行为 |
|------|------|------|----------|
| **Agent** | 编排者 | 决策、路由、dispatch Workers、汇总结果 | 自身执行 Skill 生成大文档 |
| **Worker** | 执行者 | 接收 Skill，执行单一任务，返回结果 | dispatch 其他 Worker |
| **Skill** | 操作手册 | 定义"做什么"和"怎么做" | **包含 dispatch Worker 指令** |

**SKILL.xml 关键约束**：

- **禁止**使用 `action="dispatch-to-worker"`
- **禁止**包含 "Launch Worker"、"Dispatch Worker"、"Use Agent tool" 等指令
- **只能**使用 `run-skill` 和 `run-script` 两种 action

---

## 2. 文档结构

### 2.1 根元素结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="skill-workflow-id"
          version="1.0"
          status="pending"
          desc="Skill 工作流描述">
  <!-- 内联 Schema 注释 -->
  <!-- 输入参数定义 -->
  <!-- 单一执行序列 -->
  <!-- 输出结果定义 -->
</workflow>
```

### 2.2 单一技能的组织方式

与 AGENT.xml 的多 Phase 不同，SKILL.xml 通常只包含一个或少量 `<sequence>`：

```xml
<workflow id="module-matcher" status="pending">
  <!-- 输入参数 -->
  <block type="input" id="I1" desc="输入参数">
    <!-- 参数定义 -->
  </block>
  
  <!-- 执行序列 -->
  <sequence id="S1" name="模块匹配执行" status="pending">
    <!-- 执行积木 -->
  </sequence>
  
  <!-- 输出结果 -->
  <block type="output" id="O1" desc="输出结果">
    <!-- 输出定义 -->
  </block>
</workflow>
```

### 2.3 完整结构示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="module-matcher" 
          version="1.0"
          status="pending"
          desc="模块匹配 Skill">
  
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
  <block type="input" id="I1" desc="模块匹配输入参数">
    <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
    <field name="output_path" required="false" type="string" default="./matcher-result.json" desc="输出文件路径"/>
  </block>
  
  <!-- 执行序列 -->
  <sequence id="S1" name="模块匹配执行" status="pending">
    <!-- 执行积木 -->
  </sequence>
  
  <!-- 输出结果定义 -->
  <block type="output" id="O1" desc="模块匹配输出结果">
    <field name="matched_modules" from="${matcherResult.matched_modules}" type="array" desc="匹配到的模块列表"/>
    <field name="confidence" from="${matcherResult.confidence}" type="string" desc="匹配置信度"/>
  </block>
</workflow>
```

---

## 3. Skill 级约束

### 3.1 不具备的编排能力

SKILL.xml **禁止**以下编排能力：

| 禁止项 | 说明 | 原因 |
|--------|------|------|
| `dispatch-to-worker` | 禁止直接 dispatch Workers | 编排权只在 Agent 层 |
| 多 Phase 协调 | 禁止跨 Phase 状态管理 | Skill 是单一执行单元 |
| Worker 任务清单生成 | 禁止生成 DISPATCH-PROGRESS.json | 清单驱动是 Agent 职责 |
| 复杂分支路由 | 避免过多执行路径 | 复杂逻辑应拆分为多个 Skill |

### 3.2 允许的 action 类型

SKILL.xml 只能使用以下两种 action：

| action | 用途 | 示例场景 |
|--------|------|----------|
| `run-skill` | 调用辅助 Skill | 调用分析子模块的 Skill |
| `run-script` | 执行脚本命令 | 文件操作、数据处理等 |

**示例：允许的 task 用法**

```xml
<!-- 正确：调用辅助 Skill -->
<block type="task" id="B1" action="run-skill" desc="调用代码分析 Skill">
  <field name="skill">speccrew-code-analyzer</field>
  <field name="source_path" value="${source_path}"/>
  <field name="output" var="analysisResult"/>
</block>

<!-- 正确：执行脚本 -->
<block type="task" id="B2" action="run-script" desc="执行数据处理脚本">
  <field name="command">node scripts/process-data.js</field>
  <field name="arg">--input</field>
  <field name="arg">${input_file}</field>
  <field name="output" var="processResult"/>
</block>

<!-- 错误：禁止 dispatch Worker -->
<!-- <block type="task" action="dispatch-to-worker"> ... </block> -->
```

### 3.3 与 AGENT.xml 的协作

当 Skill 需要涉及 Worker 调度时，应采用"任务清单生成器"模式：

1. **Skill 输出任务清单 JSON**（而非直接 dispatch）
2. **Agent 消费任务清单**并 dispatch Workers
3. **Skill 只描述"做什么"**，Agent 负责"调度执行"

**示例：任务清单生成器模式**

```xml
<!-- SKILL.xml：输出任务清单 -->
<block type="task" id="B3" action="run-skill" desc="生成任务清单">
  <field name="skill">speccrew-task-list-generator</field>
  <field name="modules" value="${matched_modules}"/>
  <field name="output_path" value="${output_dir}/tasks.json"/>
  <field name="output" var="taskListResult"/>
</block>

<!-- 输出格式示例（JSON）：
{
  "tasks": [
    {"id": "T1", "module": "user", "skill_path": "...", "context": {...}},
    {"id": "T2", "module": "order", "skill_path": "...", "context": {...}}
  ]
}
-->
```

```xml
<!-- AGENT.xml：消费任务清单并 dispatch -->
<block type="task" id="B4" action="run-script" desc="读取任务清单">
  <field name="command">cat ${output_dir}/tasks.json</field>
  <field name="output" var="tasks"/>
</block>

<block type="loop" id="L1" over="${tasks}" as="task">
  <block type="task" action="dispatch-to-worker" desc="Dispatch Worker">
    <field name="agent">speccrew-task-worker</field>
    <field name="skill_path">${task.skill_path}</field>
    <field name="context">${task.context}</field>
  </block>
</block>
```

---

## 4. 输入输出契约

### 4.1 input 积木在 Skill 级的标准用法

Skill 的 input block 定义单一技能的输入参数，类似函数签名：

```xml
<block type="input" id="I1" desc="模块匹配输入参数">
  <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
  <field name="platform_id" required="true" type="string" desc="平台标识，如 web-vue"/>
  <field name="output_path" required="false" type="string" default="./matcher-result.json" desc="输出文件路径"/>
</block>
```

**设计原则**：

1. **参数完整**：所有必需参数必须声明
2. **类型明确**：使用 type 属性提示参数类型
3. **默认值合理**：可选参数提供合理的默认值
4. **描述清晰**：desc 属性说明参数的用途和格式

### 4.2 output 积木在 Skill 级的标准用法

Skill 的 output block 定义单一技能的输出结果，类似函数返回值：

```xml
<block type="output" id="O1" desc="模块匹配输出结果">
  <field name="matched_modules" from="${matcherResult.matched_modules}" type="array" desc="匹配到的模块列表"/>
  <field name="confidence" from="${matcherResult.confidence}" type="string" desc="匹配置信度"/>
  <field name="output_file" from="${output_path}" type="string" desc="输出文件路径"/>
</block>
```

**设计原则**：

1. **输出完整**：所有关键输出必须声明
2. **来源明确**：from 属性指明数据来源变量
3. **类型一致**：输出类型与实际数据类型一致
4. **文件路径**：如果输出到文件，应在 output 中声明文件路径

### 4.3 输入输出契约示例

**完整的输入输出契约示例**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="ui-analyzer" 
          version="1.0"
          status="pending"
          desc="UI 分析 Skill">
  
  <!-- ========== 输入参数 ========== -->
  <block type="input" id="I1" desc="UI 分析输入参数">
    <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
    <field name="module_name" required="true" type="string" desc="模块名称"/>
    <field name="output_dir" required="false" type="string" default="./output" desc="输出目录"/>
    <field name="include_tests" required="false" type="boolean" default="false" desc="是否包含测试文件"/>
  </block>
  
  <!-- ========== 执行序列 ========== -->
  <sequence id="S1" name="UI 分析执行" status="pending">
    <!-- 参数校验 -->
    <block type="gateway" id="G1" mode="guard" 
            test="${source_path} != '' &amp;&amp; ${platform_id} != ''" 
            fail-action="stop"
            desc="参数校验">
      <field name="message">source_path 和 platform_id 不能为空</field>
    </block>
    
    <!-- 执行分析 -->
    <block type="task" id="B1" action="run-script" desc="扫描 UI 组件">
      <field name="command">node scripts/scan-ui-components.js</field>
      <field name="arg">--source</field>
      <field name="arg">${source_path}</field>
      <field name="arg">--platform</field>
      <field name="arg">${platform_id}</field>
      <field name="output" var="scanResult"/>
    </block>
    
    <!-- 处理结果 -->
    <block type="task" id="B2" action="run-script" desc="生成 UI 分析报告">
      <field name="command">node scripts/generate-ui-report.js</field>
      <field name="arg">--output</field>
      <field name="arg">${output_dir}/${module_name}-ui-report.md</field>
      <field name="output" var="reportResult"/>
    </block>
  </sequence>
  
  <!-- ========== 输出结果 ========== -->
  <block type="output" id="O1" desc="UI 分析输出结果">
    <field name="components" from="${scanResult.components}" type="array" desc="发现的 UI 组件列表"/>
    <field name="component_count" from="${scanResult.components.length}" type="number" desc="组件数量"/>
    <field name="report_path" from="${reportResult.file_path}" type="string" desc="报告文件路径"/>
    <field name="success" from="${reportResult.success}" type="boolean" desc="分析是否成功"/>
  </block>
</workflow>
```

---

## 5. 错误处理

### 5.1 error-handler 在 Skill 级的标准模式

Skill 的错误处理相对简单，主要用于包裹单一 Skill 执行或脚本执行：

```xml
<block type="error-handler" id="EH1" desc="分析执行异常处理">
  <try>
    <block type="task" id="B1" action="run-skill" desc="执行分析">
      <field name="skill">speccrew-analyzer</field>
      <field name="source_path" value="${source_path}"/>
      <field name="output" var="analysisResult"/>
    </block>
  </try>
  <catch error-type="skill_not_found">
    <block type="event" action="log" level="error" desc="记录错误">Skill 未找到: ${error.skill}</block>
    <field name="analysisResult.success" value="false"/>
  </catch>
  <catch>
    <block type="event" action="log" level="error" desc="记录错误">分析失败: ${error.message}</block>
    <field name="analysisResult.success" value="false"/>
  </catch>
</block>
```

### 5.2 错误处理模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| **直接失败** | 捕获错误后设置失败状态 | 关键步骤失败应终止 |
| **降级处理** | 捕获错误后使用备用方案 | 可选功能失败可降级 |
| **重试机制** | 捕获错误后重试 | 临时性失败可重试 |

**降级处理示例**：

```xml
<block type="error-handler" id="EH1" desc="模板加载异常处理">
  <try>
    <block type="task" id="B1" action="run-script" desc="加载特定平台模板">
      <field name="command">cat templates/${platform_id}-template.md</field>
      <field name="output" var="templateContent"/>
    </block>
  </try>
  <catch>
    <block type="event" action="log" level="warn" desc="记录警告">特定平台模板不存在，使用默认模板</block>
    <block type="task" id="B2" action="run-script" desc="加载默认模板">
      <field name="command">cat templates/default-template.md</field>
      <field name="output" var="templateContent"/>
    </block>
  </catch>
</block>
```

---

## 6. 平台消费方式

### 6.1 标准消费协议

任何 Agent 平台消费 SKILL.xml 只需实现 3 步：

| 步骤 | 操作 | 说明 |
|------|------|------|
| **1. 解析** | 解析 SKILL.xml | 基于公开的 XSD Schema |
| **2. 执行** | 按 XML Flow 定义的积木序列执行工作流 | 从上到下逐 block 执行 |
| **3. 返回** | 收集 output block 定义的结果返回给调用者 | 遵循输入输出契约 |

### 6.2 平台侧 Skill 文档如何引用 SKILL.xml

Skill 文档（Markdown）在 Workflow 章节引用 SKILL.xml：

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
  
  <!-- 输入参数：像函数签名一样清晰 -->
  <block type="input" id="I1" desc="模块匹配输入参数">
    <field name="source_path" required="true" type="string" desc="源码路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
  </block>
  
  <sequence id="S1" name="模块匹配">
    <block type="task" id="B1" action="run-script" desc="扫描源码目录">
      <!-- 积木内容 -->
    </block>
    <block type="task" id="B2" action="run-script" desc="匹配模块">
      <!-- 积木内容 -->
    </block>
  </sequence>
  
  <!-- 输出结果：像函数返回值一样清晰 -->
  <block type="output" id="O1" desc="模块匹配输出结果">
    <field name="matched_modules" from="${matcherResult.matched_modules}" type="array"/>
  </block>
</workflow>

## 输出格式

```json
{
  "matched_modules": [
    {"module_name": "user", "confidence": "high"}
  ]
}
```
```

### 6.3 执行流程

```
Agent/Worker 读取 SKILL.xml
    ↓
解析内联 Schema，理解积木类型
    ↓
提取 input block，验证输入参数
    ↓
按顺序执行 sequence 中的积木
    ↓
收集 output block 定义的结果
    ↓
返回结果给调用者
```

### 6.4 与 AGENT.xml 的协作执行

当 AGENT.xml 调用 SKILL.xml 时：

```
Agent 执行 AGENT.xml
    ↓
遇到 task action="run-skill"
    ↓
加载对应的 SKILL.xml
    ↓
传递输入参数（context）
    ↓
执行 SKILL.xml 工作流
    ↓
接收输出结果
    ↓
继续执行 AGENT.xml
```

---

## 7. 完整示例

### 7.1 模块匹配 Skill（SKILL.xml 示例）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="module-matcher" 
          version="1.0"
          status="pending"
          desc="模块匹配 Skill：根据源码和平台标识匹配业务模块">
  
  <!--
  == Block Types ==
  input   : 工作流输入参数（required=必填, default=默认值）
  output  : 工作流输出结果（from=数据来源变量）
  task    : 执行动作（action: run-skill | run-script）
  gateway : 条件分支/门禁（mode: exclusive | guard）
  event   : 日志/确认（action: log）
  error-handler : 异常处理（try > catch）
  checkpoint : 持久化里程碑（name=检查点名）
  == Field ==
  field   : 参数/变量/输出（name=参数名, var=绑定变量, value=值）
  -->
  
  <!-- ========== 输入参数定义 ========== -->
  <block type="input" id="I1" desc="模块匹配输入参数">
    <field name="source_path" required="true" type="string" desc="源码根目录路径"/>
    <field name="platform_id" required="true" type="string" desc="平台标识，如 web-vue"/>
    <field name="output_path" required="false" type="string" default="./matcher-result.json" desc="输出文件路径"/>
  </block>
  
  <!-- ========== 执行序列 ========== -->
  <sequence id="S1" name="模块匹配执行" status="pending">
    
    <!-- 参数校验 -->
    <block type="gateway" id="G1" mode="guard" 
            test="${source_path} != '' &amp;&amp; ${platform_id} != ''" 
            fail-action="stop"
            desc="参数非空校验">
      <field name="message">source_path 和 platform_id 不能为空</field>
    </block>
    
    <!-- Step 1: 扫描源码目录 -->
    <block type="task" id="B1" action="run-script" status="pending" desc="扫描源码目录">
      <field name="command">node scripts/scan-source.js</field>
      <field name="arg">--source</field>
      <field name="arg">${source_path}</field>
      <field name="arg">--platform</field>
      <field name="arg">${platform_id}</field>
      <field name="output" var="scanResult"/>
    </block>
    
    <!-- Step 2: 加载平台配置 -->
    <block type="task" id="B2" action="run-script" status="pending" desc="加载平台配置">
      <field name="command">node scripts/load-platform-config.js</field>
      <field name="arg">--platform</field>
      <field name="arg">${platform_id}</field>
      <field name="output" var="platformConfig"/>
    </block>
    
    <!-- Step 3: 执行模块匹配 -->
    <block type="error-handler" id="EH1" desc="模块匹配异常处理">
      <try>
        <block type="task" id="B3" action="run-script" status="pending" desc="执行模块匹配算法">
          <field name="command">node scripts/match-modules.js</field>
          <field name="arg">--source-files</field>
          <field name="arg">${scanResult.files}</field>
          <field name="arg">--patterns</field>
          <field name="arg">${platformConfig.patterns}</field>
          <field name="output" var="matcherResult"/>
        </block>
      </try>
      <catch>
        <block type="event" action="log" level="error" desc="记录错误">模块匹配失败: ${error.message}</block>
        <field name="matcherResult.matched_modules" value="[]"/>
        <field name="matcherResult.confidence" value="none"/>
      </catch>
    </block>
    
    <!-- Step 4: 验证匹配结果 -->
    <block type="gateway" id="G2" mode="guard" 
            test="${matcherResult.matched_modules.length} > 0" 
            fail-action="stop"
            desc="验证匹配结果">
      <field name="message">未匹配到任何模块，请检查源码路径和平台配置</field>
    </block>
    
    <!-- Checkpoint: 匹配完成 -->
    <block type="checkpoint" id="CP1" name="matching_complete" desc="模块匹配完成">
      <field name="file" value="${output_path}"/>
      <field name="passed" value="true"/>
    </block>
    
    <!-- Step 5: 写入输出文件 -->
    <block type="task" id="B4" action="run-script" status="pending" desc="写入匹配结果">
      <field name="command">node scripts/write-json.js</field>
      <field name="arg">--file</field>
      <field name="arg">${output_path}</field>
      <field name="arg">--data</field>
      <field name="arg">${matcherResult}</field>
    </block>
    
    <!-- 完成日志 -->
    <block type="event" id="E1" action="log" level="info" desc="记录完成">
      模块匹配完成，共匹配 ${matcherResult.matched_modules.length} 个模块
    </block>
  </sequence>
  
  <!-- ========== 输出结果定义 ========== -->
  <block type="output" id="O1" desc="模块匹配输出结果">
    <field name="matched_modules" from="${matcherResult.matched_modules}" type="array" desc="匹配到的模块列表"/>
    <field name="module_count" from="${matcherResult.matched_modules.length}" type="number" desc="匹配模块数量"/>
    <field name="confidence" from="${matcherResult.confidence}" type="string" desc="匹配置信度"/>
    <field name="output_file" from="${output_path}" type="string" desc="输出文件路径"/>
    <field name="success" from="${matcherResult.matched_modules.length} > 0" type="boolean" desc="匹配是否成功"/>
  </block>
</workflow>
```

### 7.2 代码分析 Skill（SKILL.xml 示例）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="code-analyzer" 
          version="1.0"
          status="pending"
          desc="代码分析 Skill：分析源码并生成分析报告">
  
  <!--
  == Block Types ==
  input   : 工作流输入参数
  output  : 工作流输出结果
  task    : 执行动作
  gateway : 条件分支/门禁
  loop    : 循环遍历
  event   : 日志/确认
  error-handler : 异常处理
  == Field ==
  field   : 参数/变量/输出
  -->
  
  <!-- 输入参数 -->
  <block type="input" id="I1" desc="代码分析输入参数">
    <field name="source_path" required="true" type="string" desc="源码路径"/>
    <field name="module_name" required="true" type="string" desc="模块名称"/>
    <field name="platform_id" required="true" type="string" desc="平台标识"/>
    <field name="output_dir" required="false" type="string" default="./output" desc="输出目录"/>
  </block>
  
  <!-- 执行序列 -->
  <sequence id="S1" name="代码分析执行" status="pending">
    
    <!-- 校验输入 -->
    <block type="gateway" id="G1" mode="guard" 
            test="${source_path} != ''" 
            fail-action="stop"
            desc="输入校验">
      <field name="message">source_path 不能为空</field>
    </block>
    
    <!-- 扫描源码文件 -->
    <block type="task" id="B1" action="run-script" desc="扫描源码文件">
      <field name="command">find ${source_path} -name "*.java" -o -name "*.vue" -o -name "*.ts"</field>
      <field name="output" var="sourceFiles"/>
    </block>
    
    <!-- 遍历文件分析 -->
    <block type="loop" id="L1" over="${sourceFiles}" as="file" desc="遍历源码文件">
      <block type="task" action="run-script" desc="分析单个文件">
        <field name="command">node scripts/analyze-file.js</field>
        <field name="arg">--file</field>
        <field name="arg">${file}</field>
        <field name="output" var="fileAnalysis"/>
      </block>
    </block>
    
    <!-- 生成分析报告 -->
    <block type="task" id="B2" action="run-script" desc="生成分析报告">
      <field name="command">node scripts/generate-report.js</field>
      <field name="arg">--module</field>
      <field name="arg">${module_name}</field>
      <field name="arg">--output</field>
      <field name="arg">${output_dir}/${module_name}-analysis.md</field>
    </block>
    
  </sequence>
  
  <!-- 输出结果 -->
  <block type="output" id="O1" desc="代码分析输出结果">
    <field name="report_path" from="${output_dir}/${module_name}-analysis.md" type="string" desc="分析报告路径"/>
    <field name="file_count" from="${sourceFiles.length}" type="number" desc="分析文件数量"/>
  </block>
</workflow>
```

---

## 8. 最佳实践

### 8.1 SKILL.xml 设计原则

1. **单一职责**：每个 Skill 只做一件事
2. **输入输出明确**：像函数一样定义清晰的输入输出契约
3. **错误处理完善**：关键步骤使用 error-handler 包裹
4. **无调度逻辑**：不涉及 Worker dispatch，只声明执行步骤
5. **参数校验前置**：在 sequence 开头校验输入参数

### 8.2 典型组合模式

```
input → gateway(参数校验) → task(run-script/run-skill) → task(run-script) → output
```

### 8.3 常见错误

| 错误 | 说明 | 正确做法 |
|------|------|----------|
| 使用 dispatch-to-worker | 违反编排权分层原则 | 输出任务清单，由 Agent dispatch |
| 缺少输入输出定义 | 契约不清晰 | 明确定义 input 和 output block |
| 参数无校验 | 可能导致执行失败 | 使用 gateway guard 校验参数 |
| 错误未处理 | 异常时行为不确定 | 使用 error-handler 包裹关键步骤 |

### 8.4 与 AGENT.xml 协作最佳实践

| 场景 | SKILL.xml 职责 | AGENT.xml 职责 |
|------|----------------|----------------|
| 批量任务处理 | 输出任务清单 JSON | 读取清单并 dispatch Workers |
| 复杂分析 | 执行分析并返回结果 | 接收结果并决定下一步 |
| 文件生成 | 生成单个文件 | 协调多个文件的生成顺序 |
| 状态查询 | 查询并返回状态 | 根据状态决定执行路径 |

---

## 附录：SKILL.xml 与 AGENT.xml 积木使用对比

| 积木类型 | SKILL.xml 中的用法 | AGENT.xml 中的用法 |
|----------|-------------------|-------------------|
| `input` | 定义单一技能的输入参数 | 定义多 Phase 共享的输入参数 |
| `output` | 输出单一技能的执行结果 | 输出跨 Phase 的汇总结果 |
| `task` | 主要使用 run-skill 和 run-script | 可使用全部三种 action（含 dispatch-to-worker） |
| `gateway` | 简单条件判断和输入校验 | 多分支路径选择、Phase 间门禁 |
| `loop` | 遍历文件列表、配置项等 | 遍历任务清单批量 dispatch Worker |
| `event` | 日志输出为主 | 阶段进度播报、用户确认关键决策 |
| `error-handler` | 包裹单一 Skill 执行的异常处理 | 包裹 Worker 批量 dispatch 的异常处理 |
| `checkpoint` | 标记技能关键步骤完成 | 标记 Phase 完成状态 |
| `rule` | 技能内部的约束和提示 | Phase 级强制规则、FORBIDDEN 清单 |
