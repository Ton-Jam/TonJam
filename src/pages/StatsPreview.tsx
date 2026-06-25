import React from 'react';
import { AdvancedStats } from '@/components/AdvancedStats';
import Layout from '@/components/Layout';

export default function StatsPreviewPage() {
  return (
    <Layout>
      <div className="py-12">
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Advanced Stats Dashboard
            </h1>
            <p className="mt-4 text-xl text-neutral-400">
              Interactive analytics component with smooth timeline animations.
            </p>
          </div>
          
          <div className="rounded-3xl overflow-hidden border border-white/5 bg-white">
            <AdvancedStats />
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-neutral-950 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4">Implementation Details</h2>
            <ul className="space-y-4 text-neutral-400">
              <li>• <span className="text-blue-400 font-mono">AdvancedStats.tsx</span>: The main container component with KPI grid and chart sections.</li>
              <li>• <span className="text-blue-400 font-mono">charts.tsx</span>: High-fidelity Recharts implementation for data visualization.</li>
              <li>• <span className="text-blue-400 font-mono">timeline-animation.tsx</span>: Framer Motion orchestration for staggered entrance effects.</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
