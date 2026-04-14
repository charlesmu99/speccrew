#!/usr/bin/env node
/**
 * Get current timestamp in specified format
 * Usage: node get-timestamp.js [format]
 * Default format: YYYY-MM-DD-HHmmss
 */

const FORMATS = {
  'YYYY-MM-DD-HHmmss': () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  },
  'YYYY-MM-DD': () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },
  'HHmm': () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  },
  'ISO': () => new Date().toISOString()
};

function getTimestamp(format = 'YYYY-MM-DD-HHmmss') {
  const formatter = FORMATS[format];
  if (formatter) {
    return formatter();
  }
  // Default fallback
  return FORMATS['YYYY-MM-DD-HHmmss']();
}

// Main execution
const format = process.argv[2] || 'YYYY-MM-DD-HHmmss';
console.log(getTimestamp(format));
