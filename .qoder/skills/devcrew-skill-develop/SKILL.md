---
name: devcrew-skill-develop
description: 创建或更新Skill文件。基于重复操作模式识别，将SOP沉淀为可复用的Skill。触发场景：用户说"创建Skill"、"更新Skill"、"新增重复操作"、"把这段流程做成Skill"。
tools: Read, Write, Glob
---

# 触发场景

- 识别到项目中存在重复操作模式
- 需要将某个操作流程标准化
- 用户说"创建Skill"、"新增Skill"、"把这段流程做成Skill"
- 需要更新现有 Skill 的内容

# 工作流程

## 1. 识别重复操作模式

分析用户描述或项目代码，识别以下特征：
- 同一类型的任务被执行多次
- 有明确的步骤和检查点
- 可被多个 Agent 复用

**常见 Skill 类型：**

| 项目类型 | 典型 Skill |
|----------|------------|
| Web 全栈 | 新增页面、新增 API、新增数据库表、提交前检查 |
| 桌面客户端 | 新增窗口、新增 IPC 通道、打包发布 |
| 移动端 | 新增页面、新增本地存储、发布到应用商店 |
| 纯后端 | 新增接口模块、新增定时任务、数据库迁移 |

## 2. 设计 Skill 结构

确定 Skill 的元数据：
- **name**: 小写字母+连字符，如 `add-api-endpoint`
- **description**: 包含功能描述和触发场景
- **tools**: 执行此 Skill 需要的工具

## 3. 编写 Skill 内容

Skill 文件必须包含以下章节：

```markdown
---
name: skill-name
description: [功能描述。触发场景：xxx]
tools: [所需工具]
---

# 触发场景
[什么情况下使用此 Skill]

# 操作步骤
[含具体文件路径的完整步骤]

# 验证检查
[完成后如何验证]
```

## 4. 创建 Skill 文件

创建 `.qoder/skills/{skill-name}/SKILL.md`

**注意：**
- Skill 存储在独立的目录中
- 目录名与 Skill name 一致
- 主文件必须命名为 `SKILL.md`

## 5. 可选：添加辅助文件

复杂 Skill 可添加：
- `reference.md` - 详细参考文档
- `examples.md` - 使用示例
- `scripts/` - 辅助脚本

```
skill-name/
├── SKILL.md          # 必需
├── reference.md      # 可选
├── examples.md       # 可选
└── scripts/          # 可选
    └── helper.py
```

# Skill 编写规范

## 描述（description）

必须包含 **WHAT** 和 **WHEN**：
- **Good**: "新增 API 端点。创建路由、控制器、服务层和测试文件。触发场景：需要新增后端接口时。"
- **Bad**: "帮助创建 API"

## 操作步骤

- 使用具体文件路径
- 包含检查清单（checkbox）
- 步骤可执行、可验证

**示例：**
```markdown
## 操作步骤

1. 创建路由文件
   - [ ] 在 `src/routers/` 下创建 `{name}_router.py`
   - [ ] 定义路由前缀和标签

2. 注册路由
   - [ ] 在 `src/main.py` 中导入并注册
```

## 验证检查

每个 Skill 必须有明确的验证标准：
```markdown
# 验证检查

- [ ] 文件已创建
- [ ] 配置已更新
- [ ] 功能可正常运行
```

# 更新现有 Skill

如需更新现有 Skill：

1. 读取 `.qoder/skills/{skill-name}/SKILL.md`
2. 识别需要更新的部分
3. 修改并保存
4. 验证格式正确

# 验证检查

- [ ] Skill name 符合规范（小写、连字符分隔）
- [ ] description 包含功能描述和触发场景
- [ ] 操作步骤清晰、可执行
- [ ] 包含验证检查清单
- [ ] YAML frontmatter 格式正确

# 输出格式

```
## Skill 创建完成

### 文件位置
- `.qoder/skills/{skill-name}/SKILL.md`

### Skill 信息
- **名称**: {skill-name}
- **功能**: [功能描述]
- **触发场景**: [触发场景]

### 建议
通知相关 Agent 此 Skill 已可用
```
