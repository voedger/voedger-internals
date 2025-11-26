#!/usr/bin/env node

/**
 * Link Validator
 * 
 * Validates internal and external links in markdown files.
 * Used during content migration and in CI/CD pipeline.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Validate all links in a directory
 * @param {string} docsPath - Path to docs directory
 * @returns {Promise<Object>} Validation results
 */
async function validateLinks(docsPath) {
  console.log('Validating links...');

  const files = getAllMarkdownFiles(docsPath);
  const brokenLinks = [];
  const validLinks = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractLinks(content);

    for (const link of links) {
      const result = await validateLink(link, file, docsPath);
      
      if (result.valid) {
        validLinks.push(result);
      } else {
        brokenLinks.push(result);
        console.warn(`Broken link in ${file}: ${link.url}`);
      }
    }
  }

  return {
    totalLinks: validLinks.length + brokenLinks.length,
    validLinks: validLinks.length,
    brokenLinks: brokenLinks
  };
}

/**
 * Extract links from markdown content
 * @param {string} content - Markdown content
 * @returns {Array<Object>} Array of link objects
 */
function extractLinks(content) {
  const links = [];
  
  // Match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      type: match[2].startsWith('http') ? 'external' : 'internal'
    });
  }

  return links;
}

/**
 * Validate a single link
 * @param {Object} link - Link object
 * @param {string} sourceFile - Source file path
 * @param {string} docsPath - Docs directory path
 * @returns {Promise<Object>} Validation result
 */
async function validateLink(link, sourceFile, docsPath) {
  if (link.type === 'internal') {
    return validateInternalLink(link, sourceFile, docsPath);
  } else {
    return validateExternalLink(link, sourceFile);
  }
}

/**
 * Validate internal link
 * @param {Object} link - Link object
 * @param {string} sourceFile - Source file path
 * @param {string} docsPath - Docs directory path
 * @returns {Object} Validation result
 */
function validateInternalLink(link, sourceFile, docsPath) {
  // Remove anchor
  const [linkPath] = link.url.split('#');
  
  // Resolve relative path
  const sourceDir = path.dirname(sourceFile);
  let targetPath = path.resolve(sourceDir, linkPath);

  // Add .md extension if not present
  if (!targetPath.endsWith('.md') && !fs.existsSync(targetPath)) {
    targetPath += '.md';
  }

  const exists = fs.existsSync(targetPath);

  return {
    link: link.url,
    sourceFile,
    type: 'internal',
    valid: exists,
    error: exists ? null : 'File not found'
  };
}

/**
 * Validate external link
 * @param {Object} link - Link object
 * @param {string} sourceFile - Source file path
 * @returns {Promise<Object>} Validation result
 */
async function validateExternalLink(link, sourceFile) {
  try {
    const statusCode = await checkUrl(link.url);
    const valid = statusCode >= 200 && statusCode < 400;

    return {
      link: link.url,
      sourceFile,
      type: 'external',
      valid,
      statusCode,
      error: valid ? null : `HTTP ${statusCode}`
    };
  } catch (error) {
    return {
      link: link.url,
      sourceFile,
      type: 'external',
      valid: false,
      error: error.message
    };
  }
}

/**
 * Check URL status
 * @param {string} url - URL to check
 * @returns {Promise<number>} HTTP status code
 */
function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, { timeout: 5000 }, (response) => {
      resolve(response.statusCode);
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Get all markdown files recursively
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of file paths
 */
function getAllMarkdownFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    if (!fs.existsSync(currentPath)) {
      return;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node validate-links.js <docs-path>');
    process.exit(1);
  }

  const docsPath = args[0];
  
  validateLinks(docsPath)
    .then(results => {
      console.log('\nValidation Results:');
      console.log(`Total links: ${results.totalLinks}`);
      console.log(`Valid links: ${results.validLinks}`);
      console.log(`Broken links: ${results.brokenLinks.length}`);
      
      if (results.brokenLinks.length > 0) {
        console.log('\nBroken links:');
        results.brokenLinks.forEach(link => {
          console.log(`  ${link.sourceFile}: ${link.link} (${link.error})`);
        });
        process.exit(1);
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { validateLinks, extractLinks, validateLink };

