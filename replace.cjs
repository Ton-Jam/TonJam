const fs = require('fs');
const path = './src/pages/ArtistProfile.tsx';
let content = fs.readFileSync(path, 'utf8');

// The user wants ALL border lines in artist profile blue.
// Let's replace all border-* classes that dictate color.
content = content.replace(/border-neutral-500\/20/g, 'border-blue-500/30');
content = content.replace(/border-neutral-500\/10/g, 'border-blue-500/20');
content = content.replace(/border-neutral-500\/50/g, 'border-blue-500/50');
content = content.replace(/border-border\/50/g, 'border-blue-500/30');
content = content.replace(/border-border/g, 'border-blue-500/40');
content = content.replace(/border-white\/10/g, 'border-blue-500/30');
content = content.replace(/border-t-white\/10/g, 'border-t-blue-500/30');
content = content.replace(/border-amber-500\/20/g, 'border-blue-500/30');
content = content.replace(/border-amber-500\/30/g, 'border-blue-500/40');
content = content.replace(/border-amber-500/g, 'border-blue-500');

fs.writeFileSync(path, content);
console.log('Done');
