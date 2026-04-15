#!/usr/bin/env node

/**
 * AgentFlow XML Validator
 * Validates .agentflow.xml files for syntax and semantic correctness
 * Zero dependencies - uses regex and string parsing only
 */

const fs = require('fs');
const path = require('path');

// Valid block types per specification
const VALID_BLOCK_TYPES = [
  'input',
  'output',
  'task',
  'gateway',
  'loop',
  'event',
  'error-handler',
  'checkpoint',
  'rule'
];

// Built-in variables that don't need prior definition
const BUILTIN_VARIABLES = [
  'workspace',
  'platform',
  'timestamp',
  'workflow.id',
  'workflow.status'
];

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    target: null,
    format: 'text',
    strict: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--format' && i + 1 < args.length) {
      result.format = args[i + 1];
      i++;
    } else if (arg === '--strict') {
      result.strict = true;
    } else if (!arg.startsWith('--') && !result.target) {
      result.target = arg;
    }
  }

  return result;
}

/**
 * Get line number for a position in content
 * @param {string} content - File content
 * @param {number} position - Character position
 * @returns {number} Line number (1-based)
 */
function getLineNumber(content, position) {
  const lines = content.substring(0, position).split('\n');
  return lines.length;
}

/**
 * Extract all block elements from XML content
 * @param {string} content - XML content
 * @returns {Array} Array of block objects with metadata
 */
function extractBlocks(content) {
  const blocks = [];
  // Match block elements with their attributes
  const blockRegex = /<block\s+([^>]+)>/g;
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    const attrsString = match[1];
    const startPos = match.index;
    const line = getLineNumber(content, startPos);

    // Parse attributes
    const attrs = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    blocks.push({
      line,
      position: startPos,
      attributes: attrs,
      raw: match[0]
    });
  }

  return blocks;
}

/**
 * Extract all field elements from XML content
 * @param {string} content - XML content
 * @returns {Array} Array of field objects
 */
function extractFields(content) {
  const fields = [];
  const fieldRegex = /<field\s+([^>]+)\/?>/g;
  let match;

  while ((match = fieldRegex.exec(content)) !== null) {
    const attrsString = match[1];
    const line = getLineNumber(content, match.index);

    const attrs = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    fields.push({
      line,
      attributes: attrs,
      raw: match[0]
    });
  }

  return fields;
}

/**
 * Extract branch elements from XML content
 * @param {string} content - XML content
 * @returns {Array} Array of branch objects
 */
function extractBranches(content) {
  const branches = [];
  const branchRegex = /<branch\s+([^>]*)>/g;
  let match;

  while ((match = branchRegex.exec(content)) !== null) {
    const attrsString = match[1];
    const line = getLineNumber(content, match.index);

    const attrs = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    branches.push({
      line,
      attributes: attrs,
      raw: match[0]
    });
  }

  return branches;
}

/**
 * Extract variable references from a string
 * @param {string} str - String to search
 * @returns {Array} Array of variable names
 */
function extractVariableRefs(str) {
  const vars = [];
  const varRegex = /\$\{([^}]+)\}/g;
  let match;

  while ((match = varRegex.exec(str)) !== null) {
    // Extract base variable name (remove property access)
    const varName = match[1].split('.')[0].split('[')[0];
    if (!vars.includes(varName)) {
      vars.push(varName);
    }
  }

  return vars;
}

/**
 * Check if XML has proper structure
 * @param {string} content - XML content
 * @param {string} filePath - File path for error reporting
 * @returns {Array} Array of error objects
 */
function validateXmlStructure(content, filePath) {
  const errors = [];

  // Check for workflow root element
  const workflowMatch = content.match(/<workflow\s+[^>]*>/);
  if (!workflowMatch) {
    errors.push({
      line: 1,
      rule: 'root-element',
      message: 'Missing root element <workflow>'
    });
  }

  // Check for unclosed tags (basic check)
  const openTags = content.match(/<block\s+[^>]*>/g) || [];
  const closeTags = content.match(/<\/block>/g) || [];

  // Check for self-closing blocks vs properly closed blocks
  const selfClosingBlocks = content.match(/<block\s+[^>]*\/>/g) || [];
  const nonSelfClosingBlocks = openTags.length - selfClosingBlocks.length;

  if (nonSelfClosingBlocks !== closeTags.length) {
    errors.push({
      line: 1,
      rule: 'unclosed-tags',
      message: `Block tag mismatch: ${openTags.length} opening, ${closeTags.length} closing tags`
    });
  }

  // Check for unquoted attributes
  const unquotedAttrRegex = /<block\s+[^>]*\w+=[^"'][^>]*>/g;
  let match;
  while ((match = unquotedAttrRegex.exec(content)) !== null) {
    const line = getLineNumber(content, match.index);
    errors.push({
      line,
      rule: 'unquoted-attribute',
      message: 'Attribute values must be quoted'
    });
  }

  return errors;
}

/**
 * Validate block types
 * @param {Array} blocks - Extracted blocks
 * @returns {Array} Array of error objects
 */
function validateBlockTypes(blocks) {
  const errors = [];

  for (const block of blocks) {
    const type = block.attributes.type;
    if (!type) {
      errors.push({
        line: block.line,
        rule: 'missing-type',
        message: 'Block is missing required "type" attribute'
      });
    } else if (!VALID_BLOCK_TYPES.includes(type)) {
      errors.push({
        line: block.line,
        rule: 'invalid-type',
        message: `Invalid block type "${type}". Valid types: ${VALID_BLOCK_TYPES.join(', ')}`
      });
    }
  }

  return errors;
}

/**
 * Validate block ID uniqueness
 * @param {Array} blocks - Extracted blocks
 * @returns {Array} Array of error objects
 */
function validateUniqueIds(blocks) {
  const errors = [];
  const idMap = new Map();

  for (const block of blocks) {
    const id = block.attributes.id;
    if (id) {
      if (idMap.has(id)) {
        errors.push({
          line: block.line,
          rule: 'unique-id',
          message: `Duplicate block id "${id}" (first defined at line ${idMap.get(id)})`
        });
      } else {
        idMap.set(id, block.line);
      }
    }
  }

  return errors;
}

/**
 * Validate required attributes for each block type
 * @param {Array} blocks - Extracted blocks
 * @returns {Array} Array of error objects
 */
function validateRequiredAttributes(blocks) {
  const errors = [];

  for (const block of blocks) {
    const type = block.attributes.type;
    const id = block.attributes.id;

    // All blocks must have id
    if (!id) {
      errors.push({
        line: block.line,
        rule: 'missing-id',
        message: 'Block is missing required "id" attribute'
      });
    }

    // Type-specific required attributes
    if (type === 'task') {
      if (!block.attributes.action) {
        errors.push({
          line: block.line,
          rule: 'missing-action',
          message: 'Task block is missing required "action" attribute'
        });
      }
      if (!block.attributes.desc) {
        errors.push({
          line: block.line,
          rule: 'missing-desc',
          message: 'Task block is missing required "desc" attribute'
        });
      }
    }

    if (type === 'input' || type === 'output') {
      if (!block.attributes.desc) {
        errors.push({
          line: block.line,
          rule: 'missing-desc',
          message: `${type} block is missing required "desc" attribute`
        });
      }
    }
  }

  return errors;
}

/**
 * Validate next references
 * @param {string} content - XML content
 * @param {Array} blocks - Extracted blocks
 * @returns {Array} Array of error objects
 */
function validateNextReferences(content, blocks) {
  const errors = [];
  const validIds = new Set(blocks.map(b => b.attributes.id).filter(Boolean));

  // Check field name="next" references
  const fieldRegex = /<field\s+name=["']next["'][^>]*>([^<]*)<\/field>/g;
  let match;

  while ((match = fieldRegex.exec(content)) !== null) {
    const nextId = match[1].trim();
    const line = getLineNumber(content, match.index);

    if (nextId && !validIds.has(nextId)) {
      errors.push({
        line,
        rule: 'invalid-next-ref',
        message: `Reference to undefined block id "${nextId}"`
      });
    }
  }

  // Check branch default="true" and test attributes for next references
  const branches = extractBranches(content);
  for (const branch of branches) {
    // Check test attribute for variable references (these are warnings, not errors)
    // But we don't validate variable content here, just structural issues
  }

  return errors;
}

/**
 * Validate variable references
 * @param {string} content - XML content
 * @param {Array} blocks - Extracted blocks
 * @returns {Array} Array of warning objects
 */
function validateVariableRefs(content, blocks) {
  const warnings = [];
  const definedVars = new Set(BUILTIN_VARIABLES);

  // Collect output variables from blocks
  for (const block of blocks) {
    // Check for output var attribute
    const blockContent = content.substring(block.position, content.indexOf('</block>', block.position) || block.position + 500);
    const outputMatch = blockContent.match(/<field[^>]*\s+var=["']([^"']+)["']/);
    if (outputMatch) {
      definedVars.add(outputMatch[1]);
    }

    // Check for output field in task blocks
    const outputFieldMatch = blockContent.match(/<field\s+name=["']output["'][^>]*\s+var=["']([^"']+)["']/);
    if (outputFieldMatch) {
      definedVars.add(outputFieldMatch[1]);
    }

    // Loop variables
    if (block.attributes.type === 'loop') {
      const asAttr = block.attributes.as;
      if (asAttr) {
        definedVars.add(asAttr);
      }
    }
  }

  // Check all variable references
  const varRegex = /\$\{([^}]+)\}/g;
  let match;

  while ((match = varRegex.exec(content)) !== null) {
    const fullVar = match[1];
    const baseVar = fullVar.split('.')[0].split('[')[0];
    const line = getLineNumber(content, match.index);

    if (!definedVars.has(baseVar) && !BUILTIN_VARIABLES.includes(baseVar)) {
      // Check if it's a property of a defined variable
      const parentVar = fullVar.split('.')[0];
      if (!definedVars.has(parentVar)) {
        warnings.push({
          line,
          rule: 'var-ref',
          message: `Variable "${baseVar}" may not be defined before use`
        });
      }
    }
  }

  return warnings;
}

/**
 * Validate a single AgentFlow XML file
 * @param {string} filePath - Path to the XML file
 * @returns {Object} Validation result
 */
function validateFile(filePath) {
  const result = {
    file: filePath,
    errors: [],
    warnings: [],
    summary: {
      blocks: 0,
      errors: 0,
      warnings: 0
    }
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract all blocks
    const blocks = extractBlocks(content);
    result.summary.blocks = blocks.length;

    // Run all validations
    result.errors.push(...validateXmlStructure(content, filePath));
    result.errors.push(...validateBlockTypes(blocks));
    result.errors.push(...validateUniqueIds(blocks));
    result.errors.push(...validateRequiredAttributes(blocks));
    result.errors.push(...validateNextReferences(content, blocks));
    result.warnings.push(...validateVariableRefs(content, blocks));

    // Update summary
    result.summary.errors = result.errors.length;
    result.summary.warnings = result.warnings.length;

  } catch (error) {
    result.errors.push({
      line: 0,
      rule: 'file-error',
      message: `Failed to read file: ${error.message}`
    });
    result.summary.errors = 1;
  }

  return result;
}

/**
 * Find all .agentflow.xml files in a directory recursively
 * @param {string} dir - Directory to search
 * @returns {Array} Array of file paths
 */
function findAgentFlowFiles(dir) {
  const files = [];

  function scan(directory) {
    if (!fs.existsSync(directory)) return;

    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('.agentflow.xml')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

/**
 * Format output as text
 * @param {Array} results - Validation results
 * @param {boolean} strict - Treat warnings as errors
 * @returns {string} Formatted text output
 */
function formatTextOutput(results, strict) {
  const lines = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalBlocks = 0;

  for (const result of results) {
    lines.push('');
    lines.push(result.file);

    if (result.errors.length === 0 && result.warnings.length === 0) {
      lines.push('  PASS  No issues found');
    } else {
      for (const error of result.errors) {
        lines.push(`  ERROR  Line ${error.line}: [${error.rule}] ${error.message}`);
      }
      for (const warning of result.warnings) {
        const label = strict ? 'ERROR' : 'WARN';
        lines.push(`  ${label}   Line ${warning.line}: [${warning.rule}] ${warning.message}`);
      }
    }

    totalErrors += result.summary.errors;
    totalWarnings += result.summary.warnings;
    totalBlocks += result.summary.blocks;
  }

  lines.push('');
  lines.push('─'.repeat(50));
  lines.push(`Summary: ${results.length} file(s), ${totalBlocks} block(s), ${totalErrors} error(s), ${totalWarnings} warning(s)`);

  if (strict) {
    const totalIssues = totalErrors + totalWarnings;
    lines.push(`Strict mode: ${totalIssues} total issue(s)`);
  }

  return lines.join('\n');
}

/**
 * Format output as JSON
 * @param {Array} results - Validation results
 * @returns {string} JSON string
 */
function formatJsonOutput(results) {
  return JSON.stringify(results, null, 2);
}

/**
 * Main entry point
 */
function main() {
  const args = parseArgs();

  // Determine target
  let target = args.target;
  if (!target) {
    // Default to speccrew-workspace directory
    target = path.join(process.cwd(), 'speccrew-workspace');
  }

  // Resolve to absolute path
  target = path.resolve(target);

  // Collect files to validate
  let files = [];
  if (fs.existsSync(target)) {
    const stats = fs.statSync(target);
    if (stats.isDirectory()) {
      files = findAgentFlowFiles(target);
    } else if (target.endsWith('.agentflow.xml')) {
      files = [target];
    }
  }

  if (files.length === 0) {
    console.error(`No .agentflow.xml files found in ${target}`);
    process.exit(1);
  }

  // Validate all files
  const results = files.map(file => validateFile(file));

  // Calculate exit code
  let totalErrors = 0;
  for (const result of results) {
    totalErrors += result.summary.errors;
    if (args.strict) {
      totalErrors += result.summary.warnings;
    }
  }

  // Output results
  if (args.format === 'json') {
    console.log(formatJsonOutput(results));
  } else {
    console.log(formatTextOutput(results, args.strict));
  }

  process.exit(totalErrors > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  validateFile,
  findAgentFlowFiles,
  VALID_BLOCK_TYPES,
  BUILTIN_VARIABLES
};
