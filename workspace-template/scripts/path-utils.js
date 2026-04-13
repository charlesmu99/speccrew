'use strict';

const path = require('path');

/**
 * Path utility functions for speccrew workspace.
 * All functions expect absolute paths as input.
 */

/**
 * Get the sync-state bizs directory path.
 * @param {string} workspacePath - Absolute path to speccrew-workspace
 * @returns {string} Absolute path to knowledges/base/sync-state/knowledge-bizs/
 */
function getSyncStateBizsDir(workspacePath) {
  return path.join(workspacePath, 'knowledges', 'base', 'sync-state', 'knowledge-bizs');
}

/**
 * Get the sync-state techs directory path.
 * @param {string} workspacePath - Absolute path to speccrew-workspace
 * @returns {string} Absolute path to knowledges/base/sync-state/knowledge-techs/
 */
function getSyncStateTechsDir(workspacePath) {
  return path.join(workspacePath, 'knowledges', 'base', 'sync-state', 'knowledge-techs');
}

/**
 * Get the features JSON file path for a platform.
 * @param {string} syncStateBizsDir - Absolute path to sync-state/knowledge-bizs/
 * @param {string} platformId - Platform identifier (e.g., 'backend-spring')
 * @returns {string} Absolute path to features-{platformId}.json
 */
function getFeaturesFilePath(syncStateBizsDir, platformId) {
  return path.join(syncStateBizsDir, `features-${platformId}.json`);
}

/**
 * Get the entry-dirs JSON file path for a platform.
 * @param {string} syncStateBizsDir - Absolute path to sync-state/knowledge-bizs/
 * @param {string} platformId - Platform identifier
 * @returns {string} Absolute path to entry-dirs-{platformId}.json
 */
function getEntryDirsFilePath(syncStateBizsDir, platformId) {
  return path.join(syncStateBizsDir, `entry-dirs-${platformId}.json`);
}

/**
 * Get the feature document path in bizs knowledge base.
 * @param {string} workspacePath - Absolute path to speccrew-workspace
 * @param {string} platformId - Platform identifier
 * @param {string} moduleName - Business module name
 * @param {string} fileName - Document file name (without extension)
 * @returns {string} Absolute path to the feature document
 */
function getFeatureDocPath(workspacePath, platformId, moduleName, fileName) {
  return path.join(workspacePath, 'knowledges', 'bizs', platformId, moduleName, `${fileName}.md`);
}

/**
 * Get the graph knowledge file path.
 * @param {string} workspacePath - Absolute path to speccrew-workspace
 * @param {string} platformId - Platform identifier
 * @param {string} moduleName - Business module name
 * @param {string} fileName - Graph file name (e.g., 'knowledge-graph.json')
 * @returns {string} Absolute path to the graph file
 */
function getGraphFilePath(workspacePath, platformId, moduleName, fileName) {
  return path.join(workspacePath, 'knowledges', 'bizs', platformId, moduleName, fileName);
}

/**
 * Generate a standardized marker file name for dispatch tracking.
 * Format: {module}-{subpath}-{fileName}.{type}.json
 * @param {string} moduleName - Business module name
 * @param {string} subpath - Sub-path within module (use '-' separator, empty string if none)
 * @param {string} fileName - Source file name (without extension)
 * @param {string} [type='done'] - Marker type ('done', 'error', 'skip')
 * @returns {string} Marker file name
 */
function getMarkerFileName(moduleName, subpath, fileName, type = 'done') {
  const subpathPart = subpath ? `-${subpath.replace(/[\/\\]/g, '-')}` : '';
  return `${moduleName}${subpathPart}-${fileName}.${type}.json`;
}

/**
 * Get the completed markers directory path.
 * @param {string} syncStateBizsDir - Absolute path to sync-state/knowledge-bizs/
 * @returns {string} Absolute path to completed/ directory
 */
function getCompletedDir(syncStateBizsDir) {
  return path.join(syncStateBizsDir, 'completed');
}

/**
 * Get the iterations directory path.
 * @param {string} workspacePath - Absolute path to speccrew-workspace
 * @returns {string} Absolute path to iterations/
 */
function getIterationsDir(workspacePath) {
  return path.join(workspacePath, 'iterations');
}

/**
 * Get the configs directory path.
 * @param {string} workspacePath - Absolute path to speccrew-workspace
 * @returns {string} Absolute path to docs/configs/
 */
function getConfigsDir(workspacePath) {
  return path.join(workspacePath, 'docs', 'configs');
}

/**
 * Get the update-progress.js script path.
 * @param {string} workspacePath - Absolute path to speccrew-workspace
 * @returns {string} Absolute path to scripts/update-progress.js
 */
function getUpdateProgressScript(workspacePath) {
  return path.join(workspacePath, 'scripts', 'update-progress.js');
}

module.exports = {
  getSyncStateBizsDir,
  getSyncStateTechsDir,
  getFeaturesFilePath,
  getEntryDirsFilePath,
  getFeatureDocPath,
  getGraphFilePath,
  getMarkerFileName,
  getCompletedDir,
  getIterationsDir,
  getConfigsDir,
  getUpdateProgressScript
};
