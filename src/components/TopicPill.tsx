import React from "react";
import { motion } from "motion/react";

interface TopicPillProps {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const TopicPill: React.FC<TopicPillProps> = ({ label, onClick, isActive = false }) => {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="shrink-0 outline-none p-0 cursor-pointer border-none bg-transparent"
    >
      <div className={`px-3.5 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all ${
        isActive
          ? "bg-[#0088CC] text-white shadow-[0_0_15px_rgba(0,136,204,0.4)]"
          : "bg-[#0A113A]/60 hover:bg-[#0088CC]/20 text-[#9AA0AE] hover:text-white"
      }`}>
        {label}
      </div>
    </motion.button>
  );
};

export default TopicPill;
