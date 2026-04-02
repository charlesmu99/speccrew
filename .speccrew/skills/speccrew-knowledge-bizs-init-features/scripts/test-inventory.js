const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'generate-inventory.js');
const sourcePath = 'd:/dev/speccrew/ruoyi-vue-pro/yudao-ui/yudao-ui-admin-vue3/src/views';

// Build arguments array - avoids shell escaping issues
const args = [
  scriptPath,
  '--sourcePath', sourcePath,
  '--outputFileName', 'features-vue3.json',
  '--platformName', 'Vue3 Admin',
  '--platformType', 'web',
  '--platformSubtype', 'vue3',
  '--techStack', '["vue3","typescript"]',
  '--fileExtensions', '[".vue",".ts"]',
  '--analysisMethod', 'ui-based',
  '--excludeDirs', '["components","composables","hooks","utils"]'
];

console.log('Testing generate-inventory.js...');
const result = spawnSync(process.execPath, args, { encoding: 'utf8', stdio: 'inherit' });
console.log('Exit code:', result.status);
if (result.error) {
  console.error('Error:', result.error.message);
}
