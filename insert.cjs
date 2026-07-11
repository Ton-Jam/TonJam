const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `        {/* ==========================================
            SECTION 2: TRENDING TRACKS`;

const replacement = `        {/* ==========================================
            NEW SECTION: WEB3 MUSIC TRENDS
            ========================================== */}
        <div className="space-y-3 text-left">
          <Web3MusicTrends />
        </div>

        {/* ==========================================
            SECTION 2: TRENDING TRACKS`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Home.tsx', code);
