import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const initials = username
    ? username.split(/\s+/).map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex items-start justify-between gap-3 text-xs pb-3 border-b border-white/[0.02] last:border-b-0 last:pb-0 text-left">
      <div className="flex items-start gap-2.5 min-w-0">
        <Avatar className="w-8 h-8 rounded-full shrink-0 border border-white/5 bg-[#050A24] flex items-center justify-center">
          <AvatarImage src={avatar} alt={username} className="object-cover" />
          <AvatarFallback className="text-[10px] font-black text-white bg-[#5B6BFF]">{initials}</AvatarFallback>
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
