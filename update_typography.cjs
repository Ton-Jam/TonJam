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

      // Replace tiny fonts with text-xs (12px)
      content = content.replace(/\btext-\[6px\]\b/g, 'text-xs');
      content = content.replace(/\btext-\[7px\]\b/g, 'text-xs');
      content = content.replace(/\btext-\[8px\]\b/g, 'text-xs');
      content = content.replace(/\btext-\[9px\]\b/g, 'text-xs');
      
      // Replace small fonts with text-sm (14px)
      content = content.replace(/\btext-\[10px\]\b/g, 'text-sm');
      content = content.replace(/\btext-\[11px\]\b/g, 'text-sm');
      
      // Replace text-xs with text-sm if it's not already replaced
      // Wait, if I do this, it will replace the text-xs I just added.
      // Let's do it carefully.
      
      // Replace font-black with font-bold
      content = content.replace(/\bfont-black\b/g, 'font-bold');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated typography in ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'components'));
processDirectory(path.join(__dirname, 'pages'));
processDirectory(path.join(__dirname, 'context'));

// Update App.tsx
const appPath = path.join(__dirname, 'App.tsx');
if (fs.existsSync(appPath)) {
  let content = fs.readFileSync(appPath, 'utf8');
  let originalContent = content;
  content = content.replace(/\btext-\[6px\]\b/g, 'text-xs');
  content = content.replace(/\btext-\[7px\]\b/g, 'text-xs');
  content = content.replace(/\btext-\[8px\]\b/g, 'text-xs');
  content = content.replace(/\btext-\[9px\]\b/g, 'text-xs');
  content = content.replace(/\btext-\[10px\]\b/g, 'text-sm');
  content = content.replace(/\btext-\[11px\]\b/g, 'text-sm');
  content = content.replace(/\bfont-black\b/g, 'font-bold');
  if (content !== originalContent) {
    fs.writeFileSync(appPath, content, 'utf8');
    console.log(`Updated typography in App.tsx`);
  }
}
