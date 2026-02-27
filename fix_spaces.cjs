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

      // Fix dangling hover:
      content = content.replace(/hover:\s+/g, ' ');
      
      // Fix double spaces inside className strings
      content = content.replace(/className="([^"]+)"/g, (match, p1) => {
        return `className="${p1.replace(/\s{2,}/g, ' ')}"`;
      });
      content = content.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
        return `className={\`${p1.replace(/\s{2,}/g, ' ')}\`}`;
      });

      // Restore modal backdrops that were accidentally removed
      // We removed bg-black/80 and bg-black/60 globally, but they are needed for modals
      // Let's add them back to the specific modal backdrops
      content = content.replace(/className="absolute inset-0 backdrop-blur-md"/g, 'className="absolute inset-0 bg-black/80 backdrop-blur-md"');
      content = content.replace(/className="absolute inset-0 backdrop-blur-xl"/g, 'className="absolute inset-0 bg-black/80 backdrop-blur-xl"');

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
