import * as React from "react";
import { Artist } from "@/types";
import { 
  Award, Globe, Music, MapPin, Calendar, Heart, Star, 
  Users, ExternalLink, Disc, Wallet, CheckCircle2, Copy, Check,
  Send, Sparkles, Radio, ShieldCheck, QrCode
} from "lucide-react";
import { toast } from "sonner";
import { ArtistWalletQRModal } from "@/components/ArtistWalletQRModal";
import { getPlaceholderImage } from "@/lib/utils";

interface AboutTabProps {
  artist: Artist;
}

export const AboutTab: React.FC<AboutTabProps> = ({ artist }) => {
  const [copied, setCopied] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const activeWallet = artist.walletAddress || "";

  const handleCopyWallet = () => {
    if (!activeWallet) return;
    navigator.clipboard.writeText(activeWallet);
    setCopied(true);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const topCities: { city: string; listeners: string }[] = Array.isArray((artist as any).topCities)
    ? (artist as any).topCities
    : [];

  // Social Links mapping — include only URLs actually saved on the artist profile
  const socials = [
    { key: "x", label: "X / Twitter", url: artist.socials?.x, color: "hover:text-blue-400" },
    { key: "telegram", label: "Telegram", url: artist.socials?.telegram, color: "hover:text-[#0098EA]" },
    { key: "instagram", label: "Instagram", url: artist.socials?.instagram, color: "hover:text-pink-400" },
    { key: "spotify", label: "Spotify", url: artist.socials?.spotify, color: "hover:text-[#1DB954]" },
    { key: "website", label: "Official Web", url: artist.socials?.website, color: "hover:text-amber-400" },
    { key: "discord", label: "Discord", url: (artist.socials as any)?.discord, color: "hover:text-indigo-400" },
    { key: "youtube", label: "YouTube Music", url: (artist.socials as any)?.youtube, color: "hover:text-red-400" }
  ].filter((s): s is { key: string; label: string; url: string; color: string } => Boolean(s.url));

  const accolades: { title: string; description: string }[] = Array.isArray((artist as any).accolades)
    ? (artist as any).accolades
    : [];

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl" id="tonjam-about-tab">
      
      {/* 1. ARTIST HERO BANNER & BIO PREVIEW */}
      <div className="relative min-h-[380px] sm:min-h-[420px] rounded-3xl overflow-hidden p-8 sm:p-10 flex flex-col justify-between bg-neutral-950 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65"
          style={{
            backgroundImage: `url(${artist.bannerUrl || artist.bannerImageUrl || artist.coverPhoto || artist.avatarUrl || getPlaceholderImage('banner')})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(artist as any).globalRank && (
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                #{(artist as any).globalRank} Global Rank
              </span>
            )}
            {artist.verified && (
              <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Artist
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {artist.genre && (
              <span className="bg-white/10 backdrop-blur-md text-neutral-200 text-xs font-semibold px-3 py-1 rounded-full">
                {artist.genre}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Hero Info: Monthly Listeners & Bio */}
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="space-y-0.5">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {(artist.monthlyListeners || 0).toLocaleString()}
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-300 block">
              MONTHLY ON-CHAIN LISTENERS
            </span>
          </div>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal">
            {artist.bio || "No biography provided yet."}
          </p>
        </div>
      </div>

      {/* 2. SOCIAL MEDIA CHANNELS (DARK GLASS) */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Official Socials & Channels
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            {socials.length} Verified Links
          </span>
        </div>

        {socials.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {socials.map((social) => (
              <a
                key={social.key}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 ${social.color} transition-all group`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe className="w-4 h-4 text-neutral-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-bold truncate">{social.label}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No external social links connected yet.</p>
        )}
      </div>

      {/* 3. CONNECTED TON WALLET & ROYALTY ROUTING */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#0098EA]/10 text-[#0098EA]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                TON Royalty Payout Recipient
              </h3>
              <p className="text-xs text-neutral-400">
                Payouts for streams and NFT resale cuts route to the connected creator address.
              </p>
            </div>
          </div>

          {activeWallet && (
            <span className="self-start sm:self-center px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Wallet Linked
            </span>
          )}
        </div>

        {activeWallet ? (
          <div className="flex items-center gap-2 bg-white/[0.03] px-4 py-3 rounded-2xl">
            <span className="text-xs font-mono text-neutral-300 truncate flex-1">
              {activeWallet}
            </span>
            <button
              onClick={() => setShowQRModal(true)}
              className="p-2 hover:bg-white/[0.08] text-[#0098EA] hover:text-[#38bdf8] rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold"
              title="Generate Tip QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Tip QR</span>
            </button>
            <button
              onClick={handleCopyWallet}
              className="p-2 hover:bg-white/[0.08] text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <a
              href={`https://tonscan.org/address/${activeWallet}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 hover:bg-white/[0.08] text-neutral-400 hover:text-[#0098EA] rounded-xl transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Explorer</span>
            </a>
          </div>
        ) : (
          <div className="bg-white/[0.03] px-4 py-3 rounded-2xl text-xs text-neutral-400">
            No TON wallet linked for this artist yet.
          </div>
        )}
      </div>

      {/* 4. BIOGRAPHY, SOUND PROFILE & ACCOLADES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Detailed Story */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-neutral-900/60 backdrop-blur-md p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sound Profile & Influences</h3>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {artist.bio || "No artist biography available yet."}
            </p>
            
            <div className="pt-2 flex flex-wrap gap-2">
              {artist.genre && (
                <span className="px-3 py-1 rounded-xl bg-white/[0.04] text-neutral-300 text-xs font-semibold">
                  {artist.genre}
                </span>
              )}
              <span className="px-3 py-1 rounded-xl bg-white/[0.04] text-neutral-300 text-xs font-semibold">
                TON Ecosystem Creator
              </span>
            </div>
          </div>

          {accolades.length > 0 && (
            <div className="bg-neutral-900/60 backdrop-blur-md p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Accolades & Milestones</h3>
              <div className="space-y-3">
                {accolades.map((acc, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/[0.02] p-3.5 rounded-2xl">
                    <Star className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{acc.title}</h5>
                      <p className="text-[11px] text-neutral-400">{acc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Top Cities Listening & Details */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-neutral-900/60 backdrop-blur-md p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Top Listening Cities</h3>
              <MapPin className="w-4 h-4 text-neutral-400" />
            </div>

            {topCities.length > 0 ? (
              <div className="space-y-3">
                {topCities.map((item, idx) => (
                  <div key={item.city} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-neutral-500 w-4">{idx + 1}</span>
                      <span className="text-xs font-bold text-white">{item.city}</span>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">{item.listeners}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">Listener geography data not yet collected.</p>
            )}
          </div>

          {/* Quick Specifications */}
          <div className="bg-neutral-900/60 backdrop-blur-md p-6 rounded-3xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Artist Details</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Location</span>
                <span className="text-white font-semibold">{artist.location || "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Joined TonJam</span>
                <span className="text-white font-semibold">
                  {(artist as any).createdAt
                    ? new Date((artist as any).createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Followers</span>
                <span className="text-white font-semibold">{(artist.followers || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ArtistWalletQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        artist={artist}
      />
    </div>
  );
};

export default AboutTab;
