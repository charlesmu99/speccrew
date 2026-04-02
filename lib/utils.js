const fs = require('fs');
const path = require('path');

// 递归复制目录，支持过滤函数
function copyDirRecursive(src, dest, filter) {
  if (!fs.existsSync(src)) return { copied: 0, skipped: 0 };
  
  fs.mkdirSync(dest, { recursive: true });
  let copied = 0, skipped = 0;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (filter && !filter(entry.name, srcPath, entry.isDirectory())) {
      skipped++;
      continue;
    }
    
    if (entry.isDirectory()) {
      const sub = copyDirRecursive(srcPath, destPath, filter);
      copied += sub.copied;
      skipped += sub.skipped;
    } else {
      fs.copyFileSync(srcPath, destPath);
      copied++;
    }
  }
  return { copied, skipped };
}

// 判断是否 speccrew-* 前缀的文件/目录
function isSpeccrewFile(name) {
  return name.startsWith('speccrew-');
}

// 读取 .speccrewrc 配置
function readSpeccrewRC(projectRoot) {
  const rcPath = path.join(projectRoot, '.speccrewrc');
  if (!fs.existsSync(rcPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(rcPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

// 写入 .speccrewrc 配置
function writeSpeccrewRC(projectRoot, config) {
  const rcPath = path.join(projectRoot, '.speccrewrc');
  fs.writeFileSync(rcPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

// 获取包版本
function getPackageVersion() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

// 获取包内 .speccrew 源文件目录
function getSourceRoot() {
  return path.join(__dirname, '..', '.speccrew');
}

// 获取包内 workspace-template 目录
function getWorkspaceTemplatePath() {
  return path.join(__dirname, '..', 'workspace-template');
}

// 递归创建目录结构（数组形式）
function ensureDirectories(baseDir, dirs) {
  for (const dir of dirs) {
    fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
  }
}

// 递归删除目录
function removeDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeDirRecursive(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dirPath);
}

module.exports = {
  copyDirRecursive,
  isSpeccrewFile,
  readSpeccrewRC,
  writeSpeccrewRC,
  getPackageVersion,
  getSourceRoot,
  getWorkspaceTemplatePath,
  ensureDirectories,
  removeDirRecursive,
};
