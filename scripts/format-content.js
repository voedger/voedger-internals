#!/usr/bin/env node

/**
 * Content Formatter
 * 
 * Formats and optimizes markdown content for Docusaurus.
 * Handles GitBook-specific syntax and converts it to Docusaurus format.
 */

const path = require('path');

/**
 * Format content for Docusaurus
 * @param {string} content - Original markdown content
 * @param {string} filePath - Relative file path
 * @returns {string} Formatted content
 */
function formatContent(content, filePath) {
  let formatted = content;

  // Add front matter if not present
  if (!formatted.startsWith('---')) {
    const title = extractTitle(formatted) || path.basename(filePath, '.md');
    const frontMatter = generateFrontMatter(title, filePath);
    formatted = frontMatter + '\n\n' + formatted;
  }

  // Convert GitBook hints to Docusaurus admonitions
  formatted = convertHintsToAdmonitions(formatted);

  // Fix image paths
  formatted = fixImagePaths(formatted);

  // Fix internal links
  formatted = fixInternalLinks(formatted);

  // Remove GitBook-specific syntax
  formatted = removeGitBookSyntax(formatted);

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  return formatted;
}

/**
 * Extract title from content
 * @param {string} content - Markdown content
 * @returns {string|null} Extracted title
 */
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Generate front matter
 * @param {string} title - Document title
 * @param {string} filePath - File path
 * @returns {string} Front matter
 */
function generateFrontMatter(title, filePath) {
  return `---
title: ${title}
---`;
}

/**
 * Convert GitBook hints to Docusaurus admonitions
 * @param {string} content - Markdown content
 * @returns {string} Converted content
 */
function convertHintsToAdmonitions(content) {
  // Convert {% hint style="info" %} to :::info
  content = content.replace(/{% hint style="info" %}/g, ':::info');
  content = content.replace(/{% hint style="warning" %}/g, ':::warning');
  content = content.replace(/{% hint style="danger" %}/g, ':::danger');
  content = content.replace(/{% hint style="success" %}/g, ':::tip');
  content = content.replace(/{% endhint %}/g, ':::');

  return content;
}

/**
 * Fix image paths
 * @param {string} content - Markdown content
 * @returns {string} Content with fixed paths
 */
function fixImagePaths(content) {
  // Convert relative image paths to absolute paths from static directory
  content = content.replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g, (match, alt, imagePath) => {
    // Remove leading ./ or ../
    const cleanPath = imagePath.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
    return `![${alt}](/img/${cleanPath})`;
  });

  return content;
}

/**
 * Fix internal links
 * @param {string} content - Markdown content
 * @returns {string} Content with fixed links
 */
function fixInternalLinks(content) {
  // Convert .md links to Docusaurus format
  content = content.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]+)?\)/g, (match, text, link, anchor) => {
    // Remove .md extension
    const cleanLink = link.replace(/\.md$/, '');
    return `[${text}](${cleanLink}${anchor || ''})`;
  });

  return content;
}

/**
 * Remove GitBook-specific syntax
 * @param {string} content - Markdown content
 * @returns {string} Cleaned content
 */
function removeGitBookSyntax(content) {
  // Remove GitBook variables
  content = content.replace(/\{\{\s*[^}]+\s*\}\}/g, '');

  // Remove GitBook page references
  content = content.replace(/{% page-ref page="[^"]+" %}/g, '');

  // Remove GitBook content references
  content = content.replace(/{% content-ref url="[^"]+" %}[^{]*{% endcontent-ref %}/g, '');

  return content;
}

/**
 * Optimize content
 * @param {string} content - Markdown content
 * @returns {string} Optimized content
 */
function optimizeContent(content) {
  // Remove excessive blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  // Trim trailing whitespace
  content = content.split('\n').map(line => line.trimEnd()).join('\n');

  return content;
}

module.exports = {
  formatContent,
  extractTitle,
  generateFrontMatter,
  convertHintsToAdmonitions,
  fixImagePaths,
  fixInternalLinks,
  removeGitBookSyntax,
  optimizeContent
};

