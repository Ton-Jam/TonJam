const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // To avoid overlapping replacements, we use a temporary token or do it carefully
  // text-white/60 -> text-white/80
  // text-white/50 -> text-white/70
  // text-white/40 -> text-white/60
  // text-white/30 -> text-white/50
  // text-white/20 -> text-white/40
  // text-white/10 -> text-white/30
  
  content = content.replace(/text-white\/60/g, 'text-white_TMP_80');
  content = content.replace(/text-white\/50/g, 'text-white_TMP_70');
  content = content.replace(/text-white\/40/g, 'text-white_TMP_60');
  content = content.replace(/text-white\/30/g, 'text-white_TMP_50');
  content = content.replace(/text-white\/20/g, 'text-white_TMP_40');
  content = content.replace(/text-white\/10/g, 'text-white_TMP_30');
  
  content = content.replace(/text-white_TMP_/g, 'text-white/');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Done replacing text-white opacities.');
