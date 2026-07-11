const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!code.includes('import NFTExplorer from')) {
  code = code.replace(
    /import { Artist, Track, NFTItem } from "@\/types";/,
    `import { Artist, Track, NFTItem } from "@/types";\nimport NFTExplorer from "@/components/NFTExplorer";`
  );
}

const target = `        {/* ==========================================
            SECTION 2: TRENDING TRACKS`;

const replacement = `        {/* ==========================================
            SECTION: NFT EXPLORER
            ========================================== */}
        <div className="space-y-3 text-left">
          <NFTExplorer />
        </div>

        {/* ==========================================
            SECTION 2: TRENDING TRACKS`;

if (!code.includes('<NFTExplorer />')) {
  code = code.replace(target, replacement);
}

fs.writeFileSync('src/pages/Home.tsx', code);
