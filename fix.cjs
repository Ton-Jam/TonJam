const { execSync } = require('child_process');

try {
  execSync('git checkout -- src/components/*.tsx src/pages/*.tsx src/components/ui/*.tsx src/components/kokonutui/*.tsx');
  console.log('Reverted changes successfully');
} catch (e) {
  console.error('Error:', e.message);
}
