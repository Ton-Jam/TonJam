import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';

export const MusicNews: React.FC = () => {
  const { posts } = useAudio();
  const navigate = useNavigate();

  const newsPosts = (posts || [])
    .filter((p: any) => p.category === 'news' || p.category === 'announcement' || p.isPinned)
    .slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-purple-400" />
          <h2 className="section-title">Ecosystem Signals & News</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">TonJam Gazette</span>
      </div>

      {newsPosts.length === 0 ? (
        <div className="bg-white/[0.02] rounded-2xl p-6 text-center text-xs text-zinc-400">
          No verified ecosystem announcements or music news posts yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newsPosts.map((news: any) => (
            <motion.div
              key={news.id}
              onClick={() => navigate(`/post/${news.id}`)}
              className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl overflow-hidden flex flex-col sm:flex-row border-none transition-colors cursor-pointer"
              whileHover={{ y: -2 }}
            >
              {(news.imageUrl || news.userAvatar) && (
                <img
                  src={news.imageUrl || news.userAvatar}
                  alt={news.userName || 'News'}
                  className="w-full sm:w-32 h-32 object-cover shrink-0"
                />
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                    <span>{news.category || 'Announcement'}</span>
                    <span>{news.userName || 'TonJam'}</span>
                  </div>
                  <p className="text-xs text-zinc-200 line-clamp-3 font-normal">
                    {news.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 mt-2">
                  <span>{news.timestamp || 'Recent'}</span>
                  <span className="flex items-center gap-1 text-[#00B4D8] font-bold">
                    <span>View Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
