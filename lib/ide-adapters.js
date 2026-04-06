const fs = require('fs');
const path = require('path');

const IDE_CONFIGS = {
  qoder: {
    name: 'Qoder',
    baseDir: '.qoder',
    skillsDir: '.qoder/skills',
    agentsDir: '.qoder/agents',
  },
  cursor: {
    name: 'Cursor',
    baseDir: '.cursor',
    skillsDir: '.cursor/skills',
    agentsDir: '.cursor/agents',
    transformFrontmatter: true,
    agentDefaults: {
      model: 'inherit',
      readonly: false,
      is_background: false,
    },
    unsupportedTools: ['WebFetch', 'WebSearch', 'Task', 'Skill', 'SearchCodebase'],
  },
  claude: {
    name: 'Claude',
    baseDir: '.claude',
    skillsDir: '.claude/skills',
    agentsDir: '.claude/agents',
    transformFrontmatter: true,
    agentToolsAction: 'filter',       // 保留 tools 但过滤不支持的
    skillToolsAction: 'rename',       // tools → allowed-tools
    unsupportedTools: ['WebFetch', 'WebSearch', 'Task', 'Skill', 'SearchCodebase'],
  },
};

// 自动检测项目根目录下存在的 IDE 目录
function detectIDE(projectRoot) {
  const detected = [];
  for (const [key, config] of Object.entries(IDE_CONFIGS)) {
    const basePath = path.join(projectRoot, config.baseDir);
    if (fs.existsSync(basePath)) {
      detected.push({ id: key, ...config });
    }
  }
  return detected;
}

// 获取指定 IDE 的配置
function getIDEConfig(ideId) {
  const config = IDE_CONFIGS[ideId];
  if (!config) {
    const validIds = Object.keys(IDE_CONFIGS).join(', ');
    throw new Error(`Unknown IDE: ${ideId}. Valid options: ${validIds}`);
  }
  return { id: ideId, ...config };
}

// 解析 IDE 参数：优先用 --ide 参数，其次自动检测，最后从 .speccrewrc 读取
function resolveIDE(projectRoot, cliIdeArg) {
  // 1. CLI 参数优先
  if (cliIdeArg) {
    return [getIDEConfig(cliIdeArg)];
  }
  
  // 2. 从 .speccrewrc 读取
  const rcPath = path.join(projectRoot, '.speccrewrc');
  if (fs.existsSync(rcPath)) {
    try {
      const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
      if (rc.ide) {
        const ides = Array.isArray(rc.ide) ? rc.ide : [rc.ide];
        return ides.map(id => getIDEConfig(id));
      }
    } catch (e) {
      // ignore malformed .speccrewrc
    }
  }
  
  // 3. 自动检测
  const detected = detectIDE(projectRoot);
  if (detected.length === 0) {
    throw new Error(
      'No supported IDE detected. Please specify with --ide <name>.\n' +
      `Supported IDEs: ${Object.keys(IDE_CONFIGS).join(', ')}`
    );
  }
  return detected;
}

/**
 * 解析 frontmatter，返回 { frontmatter: string, body: string, parsed: object }
 * 如果没有 frontmatter，返回 { frontmatter: null, body: content, parsed: null }
 */
function parseFrontmatter(content) {
  // Normalize line endings for cross-platform compatibility
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: null, body: content, parsed: null };
  }
  
  const frontmatter = match[1];
  const body = content.slice(match[0].length);
  
  // 简单解析 YAML 为对象（只处理简单的 key: value 格式）
  const parsed = {};
  const lines = frontmatter.split('\n');
  let currentKey = null;
  let currentValue = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 跳过空行
    if (!trimmed) continue;
    
    // 检测 key: value 格式（支持多行列表）
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    
    if (keyMatch) {
      // 保存之前的 key
      if (currentKey !== null) {
        parsed[currentKey] = currentValue;
      }
      currentKey = keyMatch[1];
      currentValue = keyMatch[2].trim();
    } else if (currentKey !== null && line.startsWith('  - ')) {
      // 多行列表项
      if (!Array.isArray(currentValue)) {
        currentValue = currentValue ? [currentValue] : [];
      }
      currentValue.push(trimmed.replace(/^- /, ''));
    }
  }
  
  // 保存最后一个 key
  if (currentKey !== null) {
    parsed[currentKey] = currentValue;
  }
  
  return { frontmatter, body, parsed };
}

/**
 * 将对象序列化为 YAML frontmatter 字符串
 */
function serializeFrontmatter(obj) {
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return `---\n${lines.join('\n')}\n---\n`;
}

/**
 * 从正文提取第一个非空非标题段落作为 description
 */
function extractDescriptionFromBody(body) {
  const lines = body.split('\n');
  let inCodeBlock = false;
  let paragraph = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 处理代码块
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    if (inCodeBlock) continue;
    
    // 跳过标题行和空行
    if (trimmed.startsWith('#') || !trimmed) {
      // 如果已经积累了段落内容，返回它
      if (paragraph) {
        return paragraph.slice(0, 200).trim();
      }
      continue;
    }
    
    // 积累段落内容
    paragraph += (paragraph ? ' ' : '') + trimmed;
    
    // 如果遇到空行且已有段落内容，结束段落
    if (paragraph && !trimmed) {
      return paragraph.slice(0, 200).trim();
    }
  }
  
  return paragraph ? paragraph.slice(0, 200).trim() : '';
}

/**
 * 过滤工具列表，移除不支持的工具
 * @param {string} toolsStr - 逗号或空格分隔的工具列表字符串
 * @param {string[]} unsupportedTools - 不支持的工具名数组
 * @returns {string} - 过滤后的工具列表字符串（逗号+空格分隔）
 */
function filterTools(toolsStr, unsupportedTools) {
  if (!toolsStr || !unsupportedTools || unsupportedTools.length === 0) {
    return toolsStr;
  }
  const tools = toolsStr.split(/[,\s]+/).map(t => t.trim()).filter(Boolean);
  const filtered = tools.filter(t => !unsupportedTools.includes(t));
  return filtered.join(', ');
}

/**
 * 将 Agent .md 文件的 frontmatter 从 Qoder 格式转为 Cursor 格式
 * @param {string} content - 原始文件内容
 * @param {object} ideConfig - IDE 配置对象
 * @returns {string} - 转换后的内容
 */
function transformAgentForIDE(content, ideConfig) {
  const { frontmatter, body, parsed } = parseFrontmatter(content);
  
  if (!parsed) {
    // 没有 frontmatter，直接返回原内容
    return content;
  }

  // 处理 tools 字段
  if (ideConfig.agentToolsAction === 'filter' && parsed.tools) {
    // Claude: 保留 tools 但过滤掉不支持的工具
    const filtered = filterTools(parsed.tools, ideConfig.unsupportedTools);
    if (filtered) {
      parsed.tools = filtered;
    } else {
      delete parsed.tools;
    }
  } else {
    // 默认行为（Cursor等）：移除 tools 字段
    delete parsed.tools;
  }

  // 如果没有 description，从正文提取
  if (!parsed.description) {
    const extractedDesc = extractDescriptionFromBody(body);
    if (extractedDesc) {
      parsed.description = extractedDesc;
    }
  }

  // 添加 agentDefaults 中的字段（不覆盖已存在的）
  if (ideConfig.agentDefaults) {
    for (const [key, value] of Object.entries(ideConfig.agentDefaults)) {
      if (!(key in parsed)) {
        parsed[key] = value;
      }
    }
  }

  // 重新组装 frontmatter 和 body
  const newFrontmatter = serializeFrontmatter(parsed);
  return newFrontmatter + body;
}

/**
 * 将 Skill SKILL.md 的 frontmatter 转化
 * @param {string} content - 原始文件内容
 * @param {object} ideConfig - IDE 配置对象
 * @returns {string} - 转换后的内容
 */
function transformSkillForIDE(content, ideConfig) {
  const { frontmatter, body, parsed } = parseFrontmatter(content);

  if (!parsed) {
    // 没有 frontmatter，直接返回原内容
    return content;
  }

  // 处理 tools 字段
  if (ideConfig.skillToolsAction === 'rename' && parsed.tools) {
    // Claude: tools → allowed-tools（过滤后）
    const filtered = filterTools(parsed.tools, ideConfig.unsupportedTools);
    if (filtered) {
      parsed['allowed-tools'] = filtered;
    }
    delete parsed.tools;
  } else {
    // 默认行为（Cursor等）：移除 tools 字段
    delete parsed.tools;
  }
  
  // 如果没有 description，从正文提取
  if (!parsed.description) {
    const extractedDesc = extractDescriptionFromBody(body);
    if (extractedDesc) {
      parsed.description = extractedDesc;
    }
  }
  
  // 重新组装 frontmatter 和 body
  const newFrontmatter = serializeFrontmatter(parsed);
  return newFrontmatter + body;
}

module.exports = {
  IDE_CONFIGS,
  detectIDE,
  getIDEConfig,
  resolveIDE,
  transformAgentForIDE,
  transformSkillForIDE,
  filterTools,
};
