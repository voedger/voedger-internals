#!/usr/bin/env node

/**
 * Content Migration Script
 * 
 * Migrates content from GitBook export to Docusaurus format.
 * 
 * Usage:
 *   node scripts/migrate-content.js <gitbook-export-path> <output-path>
 * 
 * Example:
 *   node scripts/migrate-content.js ./gitbook-export ./docs
 */

const fs = require('fs');
const path = require('path');
const { formatContent } = require('./format-content');
const { validateLinks } = require('./validate-links');

/**
 * Main migration function
 * @param {string} sourcePath - Path to GitBook export
 * @param {string} outputPath - Path to output directory
 */
async function migrateContent(sourcePath, outputPath) {
  console.log('Starting content migration...');
  console.log(`Source: ${sourcePath}`);
  console.log(`Output: ${outputPath}`);

  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Read GitBook export structure
    const files = getAllMarkdownFiles(sourcePath);
    console.log(`Found ${files.length} markdown files to migrate`);

    const migrationResults = [];

    // Process each file
    for (const file of files) {
      console.log(`Processing: ${file}`);
      
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(sourcePath, file);
      const outputFile = path.join(outputPath, relativePath);

      // Format content for Docusaurus
      const formattedContent = formatContent(content, relativePath);

      // Ensure output directory exists
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Write formatted content
      fs.writeFileSync(outputFile, formattedContent, 'utf-8');
      
      migrationResults.push({
        source: file,
        output: outputFile,
        status: 'success'
      });
    }

    // Validate links in migrated content
    console.log('\nValidating links...');
    const linkValidation = await validateLinks(outputPath);

    // Generate migration report
    const report = {
      timestamp: new Date().toISOString(),
      filesProcessed: files.length,
      results: migrationResults,
      linkValidation: linkValidation
    };

    // Write report
    const reportPath = path.join(outputPath, '../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\nMigration completed successfully!');
    console.log(`Report saved to: ${reportPath}`);

    if (linkValidation.brokenLinks.length > 0) {
      console.warn(`\nWarning: Found ${linkValidation.brokenLinks.length} broken links`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Get all markdown files recursively
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of file paths
 */
function getAllMarkdownFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
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
  
  if (args.length < 2) {
    console.error('Usage: node migrate-content.js <source-path> <output-path>');
    process.exit(1);
  }

  const [sourcePath, outputPath] = args;
  
  migrateContent(sourcePath, outputPath)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { migrateContent, getAllMarkdownFiles };

