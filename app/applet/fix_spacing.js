import fs from 'fs';

const grepOutput = fs.readFileSync('/app/applet/grep_output.txt', 'utf8');
const lines = grepOutput.split('\n').filter(Boolean);

// Group by file
const fileMap = {};
for (const line of lines) {
  const firstColon = line.indexOf(':');
  if (firstColon === -1) continue;
  const file = line.substring(0, firstColon);
  const content = line.substring(firstColon + 1);
  if (!fileMap[file]) fileMap[file] = [];
  fileMap[file].push(content);
}

for (const [file, originalLines] of Object.entries(fileMap)) {
  try {
    let fileContent = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    for (const originalLine of originalLines) {
      // The original line has "2.5". We want to change it to "3".
      // But wait, the file currently has "-3" instead of "2.5".
      // Let's create the current broken line by replacing 2.5 with -3 in the original line.
      // Wait, the regex replaced `(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y|w|h|stroke)-2\.5` with `-3`.
      
      let brokenLine = originalLine.replace(/(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y|w|h|stroke)-2\.5/g, '-3');
      let fixedLine = originalLine.replace(/(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y|w|h|stroke)-2\.5/g, '$1-3');
      
      if (fileContent.includes(brokenLine)) {
        fileContent = fileContent.replace(brokenLine, fixedLine);
        changed = true;
      } else {
        // Try to find it with trim
        const brokenLineTrimmed = brokenLine.trim();
        const fixedLineTrimmed = fixedLine.trim();
        if (fileContent.includes(brokenLineTrimmed)) {
          fileContent = fileContent.replace(brokenLineTrimmed, fixedLineTrimmed);
          changed = true;
        } else {
          console.log(`Could not find broken line in ${file}:`, brokenLineTrimmed);
        }
      }
    }
    
    if (changed) {
      fs.writeFileSync(file, fileContent);
      console.log(`Fixed ${file}`);
    }
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
}
