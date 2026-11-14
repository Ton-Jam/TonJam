import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Megaphone, ExternalLink } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { getPlaceholderImage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SponsoredCampaignItem {
  id: string;
  title: string;
  artist: string;
  banner: string;
  targetUrl?: string;
}

export const SponsoredJamFeed: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<SponsoredCampaignItem[]>([]);

  useEffect(() => {
    let active = true;
    const fetchCampaigns = async () => {
      try {
        const q = query(
          collection(db, "sponsoredCampaigns"),
          where("status", "==", "active")
        );
        const snap = await getDocs(q);
        if (!active) return;
        const now = Date.now();
        const items: SponsoredCampaignItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const start = data.startDate ? new Date(data.startDate).getTime() : 0;
          const end = data.endDate ? new Date(data.endDate).getTime() : Infinity;
          if ((!start || now >= start) && (!end || now <= end)) {
            items.push({
              id: docSnap.id,
              title: data.title || data.campaignName || "Sponsored Release",
              artist: data.artist || data.sponsorName || "",
              banner: data.bannerUrl || data.imageUrl || getPlaceholderImage("banner"),
              targetUrl: data.targetUrl || data.link,
            });
          }
        });
        setCampaigns(items);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "sponsoredCampaigns");
      }
    };
    fetchCampaigns();
    return () => {
      active = false;
    };
  }, []);

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Megaphone className="w-3 h-3" /> Featured Ads
          </span>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Sponsored Jam Feed</h3>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
        {campaigns.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            onClick={() => {
              if (item.targetUrl) {
                if (item.targetUrl.startsWith("/")) {
                  navigate(item.targetUrl);
                } else {
                  window.open(item.targetUrl, "_blank", "noopener,noreferrer");
                }
              }
            }}
            className="w-72 shrink-0 bg-[#0c133a] rounded-[12px] overflow-hidden group cursor-pointer"
          >
            <div className="relative h-32 w-full overflow-hidden">
              <img
                src={item.banner}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c133a] to-transparent opacity-60" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-[#00B4D8] transition-colors">
                  {item.title}
                </h4>
                {item.artist && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.artist}</p>
                )}
              </div>
              <div className="text-[#00B4D8]">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
