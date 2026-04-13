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
    agentToolsAction: 'filter',       // Keep tools but filter unsupported ones
    skillToolsAction: 'rename',       // tools → allowed-tools
    unsupportedTools: ['WebFetch', 'WebSearch', 'Task', 'Skill', 'SearchCodebase'],
  },
};

// Auto-detect IDE directories in project root
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

// Get configuration for specified IDE
function getIDEConfig(ideId) {
  const config = IDE_CONFIGS[ideId];
  if (!config) {
    const validIds = Object.keys(IDE_CONFIGS).join(', ');
    throw new Error(`Unknown IDE: ${ideId}. Valid options: ${validIds}`);
  }
  return { id: ideId, ...config };
}

// Resolve IDE parameter: CLI arg first, then auto-detect, then read from .speccrewrc
function resolveIDE(projectRoot, cliIdeArg) {
  // 1. CLI argument takes priority
  if (cliIdeArg) {
    return [getIDEConfig(cliIdeArg)];
  }
  
  // 2. Read from .speccrewrc (check workspace dir first, then old location)
  const workspaceRcPath = path.join(projectRoot, 'speccrew-workspace', '.speccrewrc');
  const oldRcPath = path.join(projectRoot, '.speccrewrc');
  const rcPath = fs.existsSync(workspaceRcPath) ? workspaceRcPath : oldRcPath;
  
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
  
  // 3. Auto-detect
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
 * Parse frontmatter, returns { frontmatter: string, body: string, parsed: object }
 * If no frontmatter, returns { frontmatter: null, body: content, parsed: null }
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
  
  // Simple YAML parser (only handles simple key: value format)
  const parsed = {};
  const lines = frontmatter.split('\n');
  let currentKey = null;
  let currentValue = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Detect key: value format (supports multi-line lists)
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    
    if (keyMatch) {
      // Save previous key
      if (currentKey !== null) {
        parsed[currentKey] = currentValue;
      }
      currentKey = keyMatch[1];
      currentValue = keyMatch[2].trim();
    } else if (currentKey !== null && line.startsWith('  - ')) {
      // Multi-line list item
      if (!Array.isArray(currentValue)) {
        currentValue = currentValue ? [currentValue] : [];
      }
      currentValue.push(trimmed.replace(/^- /, ''));
    }
  }
  
  // Save last key
  if (currentKey !== null) {
    parsed[currentKey] = currentValue;
  }
  
  return { frontmatter, body, parsed };
}

/**
 * Serialize object to YAML frontmatter string
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
 * Extract first non-empty, non-heading paragraph from body as description
 */
function extractDescriptionFromBody(body) {
  const lines = body.split('\n');
  let inCodeBlock = false;
  let paragraph = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Handle code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    if (inCodeBlock) continue;
    
    // Skip heading lines and empty lines
    if (trimmed.startsWith('#') || !trimmed) {
      // If paragraph content already accumulated, return it
      if (paragraph) {
        return paragraph.slice(0, 200).trim();
      }
      continue;
    }
    
    // Accumulate paragraph content
    paragraph += (paragraph ? ' ' : '') + trimmed;
    
    // If empty line encountered and paragraph content exists, end paragraph
    if (paragraph && !trimmed) {
      return paragraph.slice(0, 200).trim();
    }
  }
  
  return paragraph ? paragraph.slice(0, 200).trim() : '';
}

/**
 * Filter tools list, remove unsupported tools
 * @param {string} toolsStr - Comma or space separated tools string
 * @param {string[]} unsupportedTools - Array of unsupported tool names
 * @returns {string} - Filtered tools string (comma + space separated)
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
 * Transform Agent .md file frontmatter from Qoder format to Cursor format
 * @param {string} content - Original file content
 * @param {object} ideConfig - IDE configuration object
 * @returns {string} - Transformed content
 */
function transformAgentForIDE(content, ideConfig) {
  const { frontmatter, body, parsed } = parseFrontmatter(content);
  
  if (!parsed) {
    // No frontmatter, return original content directly
    return content;
  }

  // Process tools field
  if (ideConfig.agentToolsAction === 'filter' && parsed.tools) {
    // Claude: Keep tools but filter unsupported ones
    const filtered = filterTools(parsed.tools, ideConfig.unsupportedTools);
    if (filtered) {
      parsed.tools = filtered;
    } else {
      delete parsed.tools;
    }
  } else {
    // Default behavior (Cursor, etc.): Remove tools field
    delete parsed.tools;
  }

  // If no description, extract from body
  if (!parsed.description) {
    const extractedDesc = extractDescriptionFromBody(body);
    if (extractedDesc) {
      parsed.description = extractedDesc;
    }
  }

  // Add fields from agentDefaults (don't override existing)
  if (ideConfig.agentDefaults) {
    for (const [key, value] of Object.entries(ideConfig.agentDefaults)) {
      if (!(key in parsed)) {
        parsed[key] = value;
      }
    }
  }

  // Reassemble frontmatter and body
  const newFrontmatter = serializeFrontmatter(parsed);
  return newFrontmatter + body;
}

/**
 * Transform Skill SKILL.md frontmatter
 * @param {string} content - Original file content
 * @param {object} ideConfig - IDE configuration object
 * @returns {string} - Transformed content
 */
function transformSkillForIDE(content, ideConfig) {
  const { frontmatter, body, parsed } = parseFrontmatter(content);

  if (!parsed) {
    // No frontmatter, return original content directly
    return content;
  }

  // Process tools field
  if (ideConfig.skillToolsAction === 'rename' && parsed.tools) {
    // Claude: tools → allowed-tools (filtered)
    const filtered = filterTools(parsed.tools, ideConfig.unsupportedTools);
    if (filtered) {
      parsed['allowed-tools'] = filtered;
    }
    delete parsed.tools;
  } else {
    // Default behavior (Cursor, etc.): Remove tools field
    delete parsed.tools;
  }
  
  // If no description, extract from body
  if (!parsed.description) {
    const extractedDesc = extractDescriptionFromBody(body);
    if (extractedDesc) {
      parsed.description = extractedDesc;
    }
  }
  
  // Reassemble frontmatter and body
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
