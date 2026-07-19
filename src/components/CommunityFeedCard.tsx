import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_ARTISTS, MOCK_USERS } from "@/constants";

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
  const navigate = useNavigate();
  const initials = username
    ? username.split(/\s+/).map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!username) return;

    // Search in MOCK_ARTISTS first
    const artist = MOCK_ARTISTS.find(a => 
      a.name.toLowerCase() === username.toLowerCase() || 
      (a.username && a.username.toLowerCase() === username.toLowerCase()) ||
      (a.username && a.username.toLowerCase() === `@${username.toLowerCase()}`)
    );
    if (artist) {
      navigate(`/artist/${artist.uid}`);
      return;
    }

    // Search in MOCK_USERS
    const user = MOCK_USERS.find(u => 
      u.name.toLowerCase() === username.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase() ||
      u.username.toLowerCase() === `@${username.toLowerCase()}`
    );
    if (user) {
      navigate(`/user/${user.uid}`);
      return;
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 text-xs pb-3 border-b border-white/[0.02] last:border-b-0 last:pb-0 text-left animate-none">
      <div className="flex items-start gap-2.5 min-w-0">
        <Avatar 
          className="w-8 h-8 rounded-full shrink-0 border border-white/5 bg-[#050A24] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity animate-none"
          onClick={handleProfileClick}
        >
          <AvatarImage src={avatar} alt={username} className="object-cover" />
          <AvatarFallback className="text-[10px] font-black text-white bg-[#5B6BFF]">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-[11.5px] leading-tight text-[#9AA0AE]">
            <span 
              className="font-extrabold text-white cursor-pointer hover:text-blue-400 transition-colors"
              onClick={handleProfileClick}
            >
              {username}
            </span>{" "}
            {action}{" "}
            <span className="font-semibold text-white tracking-tight" style={{ color: accentColor }}>{target}</span>
          </p>
          <span className="text-[9px] text-[#9AA0AE]/60 block mt-0.5 font-medium">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeedCard;
