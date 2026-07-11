const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('bg-[#090b11]') || content.includes('bg-[#0c133a]')) {
        content = content.replace(/bg-\[#090b11\]/g, 'bg-blue-950');
        content = content.replace(/bg-\[#0c133a\]/g, 'bg-blue-950');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('src/pages/JamSpace');
