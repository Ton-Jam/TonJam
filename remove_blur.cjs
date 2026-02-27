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

      content = content.replace(/\bbackdrop-blur-\[2px\]\b/g, '');
      
      // Fix double spaces inside className strings
      content = content.replace(/className="([^"]+)"/g, (match, p1) => {
        return `className="${p1.replace(/\s{2,}/g, ' ')}"`;
      });
      content = content.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
        return `className={\`${p1.replace(/\s{2,}/g, ' ')}\`}`;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'components'));
processDirectory(path.join(__dirname, 'pages'));
processDirectory(path.join(__dirname, 'context'));
