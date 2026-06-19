import React from "react";
import { Avatar } from "@/components/ui/avatar";

interface CommunityFeedCardProps {
  username: string;
  action: string;
  target: string;
  time: string;
  avatar: string;
  accentColor: string;
}

const CommunityFeedCard: React.FC<CommunityFeedCardProps> = ({
  username,
  action,
  target,
  time,
  avatar,
  accentColor,
}) => {
  return (
    <div className="flex items-start justify-between gap-3 text-xs pb-3 border-b border-white/[0.02] last:border-b-0 last:pb-0 text-left">
      <div className="flex items-start gap-2.5 min-w-0">
        <Avatar className="w-7 h-7 bg-[#050A24] rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
          <img src={avatar} alt="" className="w-6 h-6 object-contain" />
        </Avatar>
        <div className="min-w-0">
          <p className="text-[11.5px] leading-tight text-[#9AA0AE]">
            <span className="font-extrabold text-white">{username}</span> {action}{" "}
            <span className="font-semibold text-white tracking-tight" style={{ color: accentColor }}>{target}</span>
          </p>
          <span className="text-[9px] text-[#9AA0AE]/60 block mt-0.5 font-medium">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeedCard;
