/**
 * Watch script for SUMMARY.md
 * Automatically regenerates sidebars.js when SUMMARY.md changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const summaryPath = path.join(__dirname, 'docs', 'SUMMARY.md');

console.log('👀 Watching docs/SUMMARY.md for changes...');
console.log('Press Ctrl+C to stop watching.\n');

// Initial generation
console.log('🔄 Generating sidebar...');
try {
  execSync('node generate-sidebar.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error generating sidebar:', error.message);
}

// Watch for changes
fs.watch(summaryPath, (eventType, filename) => {
  if (eventType === 'change') {
    console.log('\n📝 SUMMARY.md changed, regenerating sidebar...');
    try {
      execSync('node generate-sidebar.js', { stdio: 'inherit' });
      console.log('✅ Sidebar regenerated successfully!\n');
    } catch (error) {
      console.error('❌ Error generating sidebar:', error.message);
    }
  }
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopped watching SUMMARY.md');
  process.exit(0);
});

