const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Reduce header fonts by 2px
      content = content.replace(/\btext-2xl\b/g, 'text-[22px]');
      content = content.replace(/\btext-3xl\b/g, 'text-[28px]');
      content = content.replace(/\btext-4xl\b/g, 'text-[34px]');
      content = content.replace(/\btext-5xl\b/g, 'text-[46px]');
      content = content.replace(/\btext-6xl\b/g, 'text-[58px]');
      content = content.replace(/\btext-7xl\b/g, 'text-[70px]');
      content = content.replace(/\btext-8xl\b/g, 'text-[94px]');
      content = content.replace(/\btext-9xl\b/g, 'text-[126px]');
      
      content = content.replace(/md:text-2xl\b/g, 'md:text-[22px]');
      content = content.replace(/md:text-3xl\b/g, 'md:text-[28px]');
      content = content.replace(/md:text-4xl\b/g, 'md:text-[34px]');
      content = content.replace(/md:text-5xl\b/g, 'md:text-[46px]');
      content = content.replace(/md:text-6xl\b/g, 'md:text-[58px]');
      content = content.replace(/md:text-7xl\b/g, 'md:text-[70px]');
      content = content.replace(/md:text-8xl\b/g, 'md:text-[94px]');
      content = content.replace(/md:text-9xl\b/g, 'md:text-[126px]');

      content = content.replace(/lg:text-2xl\b/g, 'lg:text-[22px]');
      content = content.replace(/lg:text-3xl\b/g, 'lg:text-[28px]');
      content = content.replace(/lg:text-4xl\b/g, 'lg:text-[34px]');
      content = content.replace(/lg:text-5xl\b/g, 'lg:text-[46px]');
      content = content.replace(/lg:text-6xl\b/g, 'lg:text-[58px]');
      content = content.replace(/lg:text-7xl\b/g, 'lg:text-[70px]');
      content = content.replace(/lg:text-8xl\b/g, 'lg:text-[94px]');
      content = content.replace(/lg:text-9xl\b/g, 'lg:text-[126px]');

      content = content.replace(/sm:text-2xl\b/g, 'sm:text-[22px]');
      content = content.replace(/sm:text-3xl\b/g, 'sm:text-[28px]');
      content = content.replace(/sm:text-4xl\b/g, 'sm:text-[34px]');
      content = content.replace(/sm:text-5xl\b/g, 'sm:text-[46px]');
      content = content.replace(/sm:text-6xl\b/g, 'sm:text-[58px]');
      content = content.replace(/sm:text-7xl\b/g, 'sm:text-[70px]');
      content = content.replace(/sm:text-8xl\b/g, 'sm:text-[94px]');
      content = content.replace(/sm:text-9xl\b/g, 'sm:text-[126px]');

      // Replace padding/gap between sections to 2px
      const spacingRegex = /\b(space-y|gap|py|mb|mt)-(?:8|10|12|16|20|24|32|40)\b/g;
      content = content.replace(spacingRegex, '$1-[2px]');
      
      const mdSpacingRegex = /\bmd:(space-y|gap|py|mb|mt)-(?:8|10|12|16|20|24|32|40)\b/g;
      content = content.replace(mdSpacingRegex, 'md:$1-[2px]');

      const lgSpacingRegex = /\blg:(space-y|gap|py|mb|mt)-(?:8|10|12|16|20|24|32|40)\b/g;
      content = content.replace(lgSpacingRegex, 'lg:$1-[2px]');

      const smSpacingRegex = /\bsm:(space-y|gap|py|mb|mt)-(?:8|10|12|16|20|24|32|40)\b/g;
      content = content.replace(smSpacingRegex, 'sm:$1-[2px]');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'pages'));
processDirectory(path.join(__dirname, 'src', 'components'));
console.log('Done');
