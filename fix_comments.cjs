
const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/app/applet/components/BidModal.tsx',
  '/app/applet/components/BuyNFTModal.tsx',
  '/app/applet/components/FullAudioPlayer.tsx',
  '/app/applet/components/MintModal.tsx',
  '/app/applet/components/NFTCard.tsx',
  '/app/applet/components/SellNFTModal.tsx',
  '/app/applet/context/AudioContext.tsx',
  '/app/applet/context/AuthContext.tsx',
  '/app/applet/pages/ArtistDashboard.tsx',
  '/app/applet/pages/ArtistOnboarding.tsx',
  '/app/applet/pages/Discover.tsx',
  '/app/applet/pages/ExploreList.tsx',
  '/app/applet/pages/Home.tsx',
  '/app/applet/pages/JamSpace.tsx',
  '/app/applet/pages/Marketplace.tsx',
  '/app/applet/pages/NFTDetail.tsx',
  '/app/applet/pages/PlaylistDetail.tsx',
  '/app/applet/pages/Profile.tsx',
  '/app/applet/pages/ProtocolForge.tsx',
  '/app/applet/pages/Settings.tsx',
  '/app/applet/components/LoadingScreen.tsx',
  '/app/applet/components/Layout.tsx'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file is likely minified (one long line)
  if (content.split('\n').length < 10 && content.length > 1000) {
    console.log(`Fixing ${filePath}...`);
    
    // Strategy: Replace // comment... with /* comment... */ 
    // We look for // followed by text, then followed by a keyword that likely starts code.
    
    // Keywords to look for that might start code after a comment
    const keywords = ['const', 'let', 'var', 'if', 'return', 'export', 'import', 'function', 'class', 'interface', 'type', '}', '<', 'navigate', 'set', 'addNotification'];
    
    // Construct regex
    // (?<!:) checks it's not http://
    // \/\/ matches //
    // (.*?) matches the comment content non-greedily
    // (?=...) lookahead for a keyword
    
    // We iterate because we might have multiple comments
    let newContent = content;
    
    // Naive approach: Split by //, then try to find where the code resumes in the chunk
    // This is hard.
    
    // Alternative: regex replace.
    // We want to turn `// comment code` into `/* comment */ code`
    // But we need to know where `code` starts.
    
    // Let's try to match specific patterns seen in the errors.
    
    // Pattern 1: // ... if (
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (if\s*\()/g, '/* $1 */ $2');
    
    // Pattern 2: // ... const 
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (const\s+)/g, '/* $1 */ $2');
    
    // Pattern 3: // ... return
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (return\s+)/g, '/* $1 */ $2');
    
    // Pattern 4: // ... }
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (})/g, '/* $1 */ $2');
    
    // Pattern 5: // ... <
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (<)/g, '/* $1 */ $2');

    // Pattern 6: // ... set
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (set[A-Z])/g, '/* $1 */ $2');
    
    // Pattern 7: // ... navigate
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (navigate\()/g, '/* $1 */ $2');

    // Pattern 8: // ... addNotification
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (addNotification\()/g, '/* $1 */ $2');

    // Pattern 9: // ... else
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (else\s*\{)/g, '/* $1 */ $2');

    // Pattern 10: // ... setTimeout
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (setTimeout\()/g, '/* $1 */ $2');

    // Pattern 11: // ... try
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (try\s*\{)/g, '/* $1 */ $2');

    // Pattern 12: // ... catch
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (catch\s*\()/g, '/* $1 */ $2');

    // Pattern 13: // ... finally
    newContent = newContent.replace(/(?<!:)\/\/ (.*?) (finally\s*\{)/g, '/* $1 */ $2');
    
    // Also replace any remaining // at the very end of the file (if any)
    // But be careful about URLs
    
    // Special case for NFTCard.tsx: `*/, //`
    newContent = newContent.replace(/\*\/\, \/\//g, '*/, /*');

    // Special case: `// ...` followed by another `//`
    // `// comment 1 // comment 2` -> `/* comment 1 */ /* comment 2 ...`
    // This is tricky.
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated ${filePath}`);
    } else {
      console.log(`No changes made to ${filePath} (patterns not matched)`);
    }
  } else {
    console.log(`Skipping ${filePath} (not minified)`);
  }
}

filesToFix.forEach(fixFile);
