import React from "react";
import { motion } from "motion/react";

interface TopicPillProps {
  label: string;
  onClick: () => void;
}

const TopicPill: React.FC<TopicPillProps> = ({ label, onClick }) => {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="shrink-0 outline-none p-0 cursor-pointer border-none bg-transparent"
    >
      <div className="px-3.5 py-2 rounded-full bg-[#0A113A]/60 hover:bg-[#101A3B] text-xs font-black tracking-widest uppercase text-[#9AA0AE] hover:text-white transition-all">
        {label}
      </div>
    </motion.button>
  );
};

export default TopicPill;
