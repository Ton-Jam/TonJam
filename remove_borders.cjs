const fs = require('fs');

function removeBorders(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove border classes
  content = content.replace(/\bborder-border\b/g, '');
  content = content.replace(/\bborder-border\/50\b/g, '');
  content = content.replace(/\bborder-border\/20\b/g, '');
  content = content.replace(/\bborder-dashed\b/g, '');
  content = content.replace(/\bborder-t\b/g, '');
  content = content.replace(/\bborder-b\b/g, '');
  content = content.replace(/\bborder-l\b/g, '');
  content = content.replace(/\bborder-r\b/g, '');
  content = content.replace(/\bborder-orange-500\/20\b/g, '');
  content = content.replace(/\bborder-orange-500\/50\b/g, '');
  content = content.replace(/\bborder-blue-500\/20\b/g, '');
  content = content.replace(/\bborder-blue-500\/30\b/g, '');
  content = content.replace(/\bborder-blue-500\/40\b/g, '');
  content = content.replace(/\bborder-blue-500\/50\b/g, '');
  content = content.replace(/\bborder-blue-500\b/g, '');
  content = content.replace(/\bborder-neutral-500\/30\b/g, '');
  content = content.replace(/\bborder-neutral-500\b/g, '');
  content = content.replace(/\bborder-white\/10\b/g, '');
  content = content.replace(/\bborder-white\/30\b/g, '');
  content = content.replace(/\bborder-black\/30\b/g, '');
  content = content.replace(/\bborder-transparent\b/g, '');
  content = content.replace(/\bborder-t-blue-500\/30\b/g, '');
  content = content.replace(/\bborder-t-white\b/g, '');
  content = content.replace(/\bborder-t-black\b/g, '');
  content = content.replace(/\bborder\b/g, '');
  
  // Clean up multiple spaces that might have been left behind
  content = content.replace(/  +/g, ' ');
  content = content.replace(/ "/g, '"');
  content = content.replace(/" /g, '"');
  
  fs.writeFileSync(filePath, content);
  console.log(`Removed borders from ${filePath}`);
}

removeBorders('/src/pages/Profile.tsx');
removeBorders('/src/pages/ArtistProfile.tsx');
