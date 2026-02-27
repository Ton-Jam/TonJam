const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Replace border radius classes (except rounded-full, rounded-none)
      content = content.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-[10px]');
      content = content.replace(/\brounded-\[[^\]]+\]/g, 'rounded-[10px]');
      
      // Remove all border-related classes
      content = content.replace(/\bborder\b/g, '');
      content = content.replace(/\bborder-[a-z]+-[0-9]+\/[0-9]+\b/g, '');
      content = content.replace(/\bborder-[a-z]+-[0-9]+\b/g, '');
      content = content.replace(/\bborder-[a-z]+\b/g, ''); // e.g., border-b, border-t
      content = content.replace(/\bborder-[a-z]+\/[0-9]+\b/g, ''); // e.g., border-white/10
      content = content.replace(/\bhover:border-[a-z]+-[0-9]+\/[0-9]+\b/g, '');
      content = content.replace(/\bhover:border-[a-z]+-[0-9]+\b/g, '');
      content = content.replace(/\bfocus:border-[a-z]+-[0-9]+\b/g, '');
      content = content.replace(/\bfocus:border-[a-z]+-[0-9]+\/[0-9]+\b/g, '');
      content = content.replace(/\bgroup-hover:border-[a-z]+-[0-9]+\b/g, '');
      content = content.replace(/\bactive:border-[a-z]+-[0-9]+\b/g, '');
      
      // Clean up double spaces created by removals
      // content = content.replace(/\s+/g, ' ');
      
      // Remove overlays
      content = content.replace(/\bbg-black\/40 backdrop-blur-\[2px\]\b/g, '');
      content = content.replace(/\bbg-black\/60\b/g, '');
      content = content.replace(/\bbg-black\/40\b/g, '');
      content = content.replace(/\bbg-black\/80\b/g, '');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'components'));
processDirectory(path.join(__dirname, 'pages'));
processDirectory(path.join(__dirname, 'context'));

// Also process App.tsx
const appPath = path.join(__dirname, 'App.tsx');
if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf8');
  let originalContent = content;
  content = content.replace(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/g, 'rounded-[10px]');
  content = content.replace(/\brounded-\[[^\]]+\]/g, 'rounded-[10px]');
  if (content !== originalContent) {
    fs.writeFileSync(appPath, content, 'utf8');
    console.log(`Updated App.tsx`);
  }
}
