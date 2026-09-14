import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, Bell, ExternalLink } from 'lucide-react';
import { MusicNews as NewsType } from '../types';
import { MOCK_NEWS } from '../mock';

export const MusicNews: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-purple-400" />
          <h2 className="section-title">Ecosystem Signals & News</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">TonJam Gazette</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_NEWS.map((news) => (
          <motion.div
            key={news.id}
            className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl overflow-hidden flex flex-col sm:flex-row border-none transition-colors"
            whileHover={{ y: -2 }}
          >
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full sm:w-32 h-32 object-cover shrink-0"
            />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                  <span>{news.category}</span>
                  <span>{news.readTime}</span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2">
                  {news.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 font-normal">
                  {news.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 mt-2">
                <span>{news.timestamp}</span>
                <button className="flex items-center gap-1 text-[#00B4D8] font-bold hover:underline cursor-pointer border-none bg-transparent">
                  <span>Read Article</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
