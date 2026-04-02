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

module.exports = { IDE_CONFIGS, detectIDE, getIDEConfig, resolveIDE };
