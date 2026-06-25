const fs = require('fs');

let code = fs.readFileSync('src/pages/Marketplace.tsx', 'utf8');

// The goal is to remove px-4 md:px-8 from the section wrapper and put it where needed.
// 1. Replace the section wrapper className
code = code.replace(/<motion\.section variants=\{itemVariants\} className="w-full px-4 md:px-8(.*?)"/g, '<motion.section variants={itemVariants} className="w-full$1"');

// 2. We need to add px-4 md:px-8 to the header divs and carousels.

// For Section 2 Analytics
code = code.replace(
  /<div className="-mx-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory px-4">/g,
  '<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory px-4 md:px-8">'
);

// For Section 4 Featured Carousel
code = code.replace(
  /<div className="relative rounded-2xl bg-\[#0A113A\] border border-white\/\[0\.04\] overflow-hidden min-h-\[220px\] sm:min-h-\[280px\] flex flex-col justify-end p-6 md:p-8">/g,
  '<div className="relative rounded-2xl bg-[#0A113A] border border-white/[0.04] overflow-hidden min-h-[220px] sm:min-h-[280px] flex flex-col justify-end p-6 md:p-8 mx-4 md:mx-8">'
);

// For Section 3 Filter Pills
code = code.replace(
  /<div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">/g,
  '<div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-4 md:px-8">'
);

// For headers in sections 5, 6, 7, 8, 10, 11
code = code.replace(
  /<div className="flex items-center justify-between mb-4">/g,
  '<div className="flex items-center justify-between mb-4 px-4 md:px-8">'
);

// For headers in Section 12 Categories
code = code.replace(
  /<div className="flex items-center justify-between mb-6">/g,
  '<div className="flex items-center justify-between mb-6 px-4 md:px-8">'
);

// For carousels in sections 5, 6, 10, 11
code = code.replace(
  /<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">/g,
  '<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory px-4 md:px-8">'
);

// For Section 7 Top Collections List
code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">/g,
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-4 md:px-8">'
);

// For Section 8 Rankings List
code = code.replace(
  /<div className="space-y-3">/g,
  '<div className="space-y-3 px-4 md:px-8">'
);

// For Section 12 Categories Grid
code = code.replace(
  /<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">/g,
  '<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 px-4 md:px-8">'
);

fs.writeFileSync('src/pages/Marketplace.tsx', code);
