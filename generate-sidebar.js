/**
 * Generate Docusaurus sidebar from SUMMARY.md
 * This script parses docs/SUMMARY.md and creates a sidebar structure
 */

const fs = require('fs');
const path = require('path');

function parseSummaryMd(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/); // Handle both \n and \r\n

  const sidebar = [];
  const stack = [{ items: sidebar, level: -1 }];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim(); // Trim to remove any trailing whitespace
    // Skip empty lines and the title
    if (!line || line.startsWith('# ')) continue;

    // Check if it's a section header (## Something)
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      const label = headerMatch[1].trim();
      const sectionCategory = {
        type: 'category',
        label: label,
        items: [],
        collapsible: false,
        className: 'sidebar-section-header',
      };
      sidebar.push(sectionCategory);
      stack.length = 1; // Reset stack to root
      stack.push({ items: sectionCategory.items, level: 0 });
      continue;
    }

    // Get original line with indentation for level calculation
    const originalLine = lines[i];
    const indent = originalLine.match(/^(\s*)/)[1].length;
    // Level 0 = root items (under section headers)
    // Level 1 = first level of nesting, etc.
    const level = Math.floor(indent / 2) + 1; // +1 because section headers are level 0

    // Check if it's a folder marker (📁Folder Name)
    const folderMatch = line.match(/^-\s+(📁.+)$/);
    if (folderMatch) {
      const label = folderMatch[1].trim(); // Keep the emoji in the label
      const category = {
        type: 'category',
        label: label,
        items: [],
        collapsed: true,
      };

      // Find the right parent
      while (stack.length > level && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      if (parent.items) {
        parent.items.push(category);
      }

      stack.push({ items: category.items, level: level });
      continue;
    }

    // Check if it's a link ([Label](path.md))
    const linkMatch = line.match(/^-\s+\[(.+?)\]\((.+?)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      let docPath = linkMatch[2];

      // Convert path to Docusaurus doc ID
      // Remove .md extension
      docPath = docPath.replace(/\.md$/, '');
      // Keep README as-is (both root and folder READMEs)
      // Docusaurus will use the document ID based on the file name

      const docItem = {
        type: 'doc',
        id: docPath,
        label: label,
      };

      // Find the right parent
      while (stack.length > level && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      if (parent.items) {
        parent.items.push(docItem);
      }
    }
  }

  return sidebar;
}

function generateSidebarsJs(sidebar) {
  // Convert sidebar to JSON string while preserving Unicode characters (emojis)
  const sidebarJson = JSON.stringify(sidebar, null, 2)
    .replace(/\\u[\dA-F]{4}/gi, (match) => {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });

  const sidebarCode = `/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 This file is auto-generated from docs/SUMMARY.md
 Run 'node generate-sidebar.js' to regenerate
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: ${sidebarJson},
};

module.exports = sidebars;
`;

  return sidebarCode;
}

// Main execution
try {
  const summaryPath = path.join(__dirname, 'docs', 'SUMMARY.md');
  const sidebarPath = path.join(__dirname, 'sidebars.js');
  
  console.log('Parsing SUMMARY.md...');
  const sidebar = parseSummaryMd(summaryPath);
  
  console.log('Generating sidebars.js...');
  console.log('Sidebar structure:', JSON.stringify(sidebar, null, 2).substring(0, 500));
  const sidebarCode = generateSidebarsJs(sidebar);

  fs.writeFileSync(sidebarPath, sidebarCode, 'utf-8');
  console.log(`Wrote ${sidebarCode.length} bytes to ${sidebarPath}`);

  console.log('✅ Successfully generated sidebars.js from SUMMARY.md');
  console.log(`   Found ${sidebar.length} top-level items`);
} catch (error) {
  console.error('❌ Error generating sidebar:', error.message);
  process.exit(1);
}

