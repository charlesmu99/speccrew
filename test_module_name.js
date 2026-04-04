// 模拟 reindex-modules.js 的 getModuleName 函数
const STANDARD_SOURCE_PREFIXES = [
  'src/main/java',
  'src/main/kotlin',
  'src/main/scala',
  'src/main/groovy',
  'src/main/resources',
  'src/test/java',
  'src/test/kotlin',
];

function normalizePath(filePath) {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/');
}

function getModuleName(dirPath, excludeDirs, fallbackModuleName) {
  let normalized = normalizePath(dirPath);
  
  console.log('  Input dirPath: ' + dirPath);
  console.log('  After normalize: ' + normalized);
  
  // Strip standard source directory prefixes
  for (const prefix of STANDARD_SOURCE_PREFIXES) {
    if (normalized.startsWith(prefix + '/')) {
      normalized = normalized.slice(prefix.length + 1);
      console.log('  After stripping prefix "  + prefix +  \: ' + normalized);
 break;
 }
 }
 
 const parts = normalized.split('/').filter(p => p && p !== '.');
 console.log(' Parts: [' + parts.join(', ') + ']');
 console.log(' Exclude dirs count: ' + excludeDirs.length);
 
 for (const part of parts) {
 console.log(' Checking part \ + part + \...');
 if (!excludeDirs.includes(part)) {
 console.log(' -> NOT in excludeDirs, RETURN: \ + part + \');
 return part;
 }
 console.log(' -> IN excludeDirs, skip');
 }
 
 console.log(' All parts excluded, RETURN: \_root\');
 return '_root';
}

// 测试 1: backend-ai 示例
console.log('\n=== Test 1: Backend-AI (Java) ===');
const backendAIExcludeDirs = ['controller', 'controllers', 'admin', 'app', 'api', 'service', 'services', 'repository', 'repositories', 'dao', 'dal', 'mysql', 'redis', 'dataobject', 'entity', 'entities', 'model', 'models', 'dto', 'dtos', 'vo', 'vos', 'mapper', 'mappers', 'convert', 'converter', 'converters', 'config', 'configs', 'util', 'utils', 'common', 'exception', 'exceptions', 'enums', 'framework', 'job', 'mq', 'listener', 'listeners', 'producer', 'consumer'];
const dirPath1 = 'controller/admin/chat';
console.log('Expected: \chat\, Actual: \ + getModuleName(dirPath1, backendAIExcludeDirs) + \\n');

// 测试 2: web-vue 示例
console.log('\n=== Test 2: Web-Vue (Frontend) ===');
const webVueExcludeDirs = ['components', 'composables', 'hooks', 'utils', 'mixins', 'directives', 'src', 'views', 'pages', 'api', 'layout', 'layouts', 'assets', 'store', 'stores', 'router', 'routes', 'plugins', 'styles', 'types', 'typings', 'locales', 'i18n', 'lang', 'config', 'configs'];
const dirPath2 = 'views/system/user';
console.log('Expected: \system\, Actual: \ + getModuleName(dirPath2, webVueExcludeDirs) + \\n');
