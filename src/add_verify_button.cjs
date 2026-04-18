const fs = require('fs');

const filePath = 'src/pages/ArtistProfile.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `{isOwnProfile && (
  <button onClick={() => setShowEditProfileModal(true)} className="px-8 py-3 bg-muted text-foreground rounded-full font-bold text-sm hover:bg-muted/80 transition-all shadow-sm">
  Edit Profile
  </button>
  )}`;

const replacement = `{isOwnProfile && (
  <>
  {!artist.verified && (
  <button onClick={() => setShowVerifyModal(true)} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-500 transition-all shadow-sm flex items-center gap-2">
  <ShieldCheck className="h-4 w-4" />
  Verify Artist
  </button>
  )}
  <button onClick={() => setShowEditProfileModal(true)} className="px-8 py-3 bg-muted text-foreground rounded-full font-bold text-sm hover:bg-muted/80 transition-all shadow-sm">
  Edit Profile
  </button>
  </>
  )}`;

// Try exact match first
if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content);
  console.log('Replaced successfully (exact match)');
} else {
  // Try regex if exact match fails due to whitespace
  const regexTarget = /\{isOwnProfile && \(\s*<button onClick=\{\(\) => setShowEditProfileModal\(true\)\} className="px-8 py-3 bg-muted text-foreground rounded-full font-bold text-sm hover:bg-muted\/80 transition-all shadow-sm">\s*Edit Profile\s*<\/button>\s*\)\}/;
  if (regexTarget.test(content)) {
    content = content.replace(regexTarget, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Replaced successfully (regex match)');
  } else {
    console.log('Target not found');
  }
}
