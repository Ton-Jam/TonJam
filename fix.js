const fs = require('fs');
const { execSync } = require('child_process');

try {
  // Let's just use git to checkout the files!
  execSync('git checkout -- src/components/*.tsx src/pages/*.tsx');
  console.log('Reverted changes successfully');
} catch (e) {
  console.error('Error:', e.message);
}
