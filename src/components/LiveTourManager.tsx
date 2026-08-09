import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Ticket,
  Clock,
  Plus,
  Bell,
  BellRing,
  Sparkles,
  Share2,
  Trash2,
  Edit3,
  Send,
  Users,
  ExternalLink,
  Check,
  Search,
  Filter,
  ShieldCheck,
  Flame,
  Radio,
  Download,
  CheckCircle2,
  X,
  Megaphone,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { ArtistEvent } from '@/types';

export interface TourEventExtended extends ArtistEvent {
  eventType?: 'Headline Tour' | 'Festival' | 'Acoustic Set' | 'Metaverse Livestream' | 'VIP Party';
  subscribersCount?: number;
  ticketPrice?: string;
  vipPerk?: string;
  status?: 'upcoming' | 'past' | 'cancelled';
  ticketStatus?: 'Selling Fast' | 'Sold Out' | 'General On-Sale' | 'VIP Only' | 'Announced';
}

interface LiveTourManagerProps {
  artistId?: string;
  artistName?: string;
  className?: string;
  isArtistView?: boolean;
}

const DEFAULT_TOUR_STOPS: TourEventExtended[] = [
  {
    id: 'tour-evt-1',
    artistId: 'current-artist',
    title: 'Solar Pulse World Tour 2026 - Opening Night',
    date: '2026-09-18',
    time: '20:00 GMT',
    venue: 'O2 Academy Brixton',
    location: 'London, United Kingdom',
    eventType: 'Headline Tour',
    ticketUrl: 'https://tonjam.io/tickets/solar-pulse-london',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    status: 'upcoming',
    ticketStatus: 'Selling Fast',
    ticketPrice: '25 TON / $120',
    subscribersCount: 1420,
    vipPerk: 'Free Backstage VIP Access for Gold Fan Token Holders'
  },
  {
    id: 'tour-evt-2',
    artistId: 'current-artist',
    title: 'Aether Waves Red Rocks Experience',
    date: '2026-10-04',
    time: '19:30 MST',
    venue: 'Red Rocks Amphitheatre',
    location: 'Morrison, Colorado, USA',
    eventType: 'Festival',
    ticketUrl: 'https://tonjam.io/tickets/red-rocks-aether',
    bannerImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    status: 'upcoming',
    ticketStatus: 'General On-Sale',
    ticketPrice: '30 TON / $145',
    subscribersCount: 890,
    vipPerk: 'Exclusive Signed Vinyl & Meet & Greet'
  },
  {
    id: 'tour-evt-3',
    artistId: 'current-artist',
    title: 'Hyperdrive Tokyo Metaverse & Live Stream',
    date: '2026-11-12',
    time: '21:00 JST',
    venue: 'Zepp DiverCity & VR Dome',
    location: 'Tokyo, Japan',
    eventType: 'Metaverse Livestream',
    ticketUrl: 'https://tonjam.io/tickets/tokyo-metaverse',
    bannerImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80',
    status: 'upcoming',
    ticketStatus: 'VIP Only',
    ticketPrice: '10 TON / $50',
    subscribersCount: 2310,
    vipPerk: 'Claimable 3D Cyberpunk Wearable NFT'
  },
  {
    id: 'tour-evt-4',
    artistId: 'current-artist',
    title: 'Echoes in the Park - Acoustic Session',
    date: '2026-06-10',
    time: '18:00 CEST',
    venue: 'Tempelhof Feld',
    location: 'Berlin, Germany',
    eventType: 'Acoustic Set',
    ticketUrl: 'https://tonjam.io/tickets/berlin-echoes',
    bannerImageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&auto=format&fit=crop&q=80',
    status: 'past',
    ticketStatus: 'Sold Out',
    ticketPrice: '15 TON',
    subscribersCount: 1650,
    vipPerk: 'Digital Live Recording NFT Airdrop'
  }
];

export const LiveTourManager: React.FC<LiveTourManagerProps> = ({
  artistId = 'current-artist',
  artistName = 'Verified Artist',
  className = '',
  isArtistView = true
}) => {
  const { addNotification, userProfile } = useAudio();

  // Load tour dates from localStorage or fallback
  const [events, setEvents] = useState<TourEventExtended[]>(() => {
    try {
      const saved = localStorage.getItem(`tonjam_tour_events_${artistId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tour events:', e);
    }
    return DEFAULT_TOUR_STOPS;
  });

  // Track user subscriptions to events
  const [subscribedEventIds, setSubscribedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`tonjam_subscribed_tours_${userProfile?.uid || 'guest'}`);
      return saved ? JSON.parse(saved) : ['tour-evt-1'];
    } catch {
      return ['tour-evt-1'];
    }
  });

  // Subscribed to all updates state
  const [isAllSubscribed, setIsAllSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`tonjam_all_tour_sub_${artistId}`) === 'true';
    } catch {
      return false;
    }
  });

  // UI Filter & Modal states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TourEventExtended | null>(null);

  // Broadcast modal input
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<TourEventExtended>>({
    title: '',
    eventType: 'Headline Tour',
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    venue: '',
    location: '',
    ticketUrl: '',
    ticketPrice: '20 TON',
    ticketStatus: 'General On-Sale',
    vipPerk: '',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80'
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`tonjam_tour_events_${artistId}`, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving tour events:', e);
    }
  }, [events, artistId]);

  useEffect(() => {
    try {
      localStorage.setItem(`tonjam_subscribed_tours_${userProfile?.uid || 'guest'}`, JSON.stringify(subscribedEventIds));
    } catch (e) {
      console.error('Error saving subscriptions:', e);
    }
  }, [subscribedEventIds, userProfile]);

  // Handle Event Subscribe Toggle
  const handleToggleSubscribe = (eventId: string, eventTitle: string) => {
    if (subscribedEventIds.includes(eventId)) {
      setSubscribedEventIds((prev) => prev.filter((id) => id !== eventId));
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === eventId
            ? { ...evt, subscribersCount: Math.max(0, (evt.subscribersCount || 1) - 1) }
            : evt
        )
      );
      addNotification(`Unsubscribed from alerts for "${eventTitle}"`, 'info');
    } else {
      setSubscribedEventIds((prev) => [...prev, eventId]);
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === eventId
            ? { ...evt, subscribersCount: (evt.subscribersCount || 0) + 1 }
            : evt
        )
      );
      addNotification(`Subscribed to tour alerts for "${eventTitle}"! 🎟️🔔`, 'success');
    }
  };

  // Toggle Subscribe All Tour Alerts
  const handleToggleAllSubscribe = () => {
    const nextState = !isAllSubscribed;
    setIsAllSubscribed(nextState);
    try {
      localStorage.setItem(`tonjam_all_tour_sub_${artistId}`, String(nextState));
    } catch (e) {
      console.error(e);
    }
    if (nextState) {
      addNotification(`Subscribed to ALL tour dates & instant announcements for ${artistName}! 🚀`, 'success');
    } else {
      addNotification(`Unsubscribed from global tour notifications for ${artistName}`, 'info');
    }
  };

  // Form Submit (Add / Edit)
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.venue || !formData.location || !formData.date) {
      addNotification('Please fill in all required tour fields.', 'warning');
      return;
    }

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === editingEvent.id
            ? ({
                ...evt,
                ...formData,
                status: new Date(formData.date!) >= new Date() ? 'upcoming' : 'past'
              } as TourEventExtended)
            : evt
        )
      );
      addNotification(`Updated tour stop "${formData.title}"`, 'success');
    } else {
      const newEvent: TourEventExtended = {
        id: `tour-evt-${Date.now()}`,
        artistId,
        title: formData.title!,
        eventType: formData.eventType || 'Headline Tour',
        date: formData.date!,
        time: formData.time || '20:00 GMT',
        venue: formData.venue!,
        location: formData.location!,
        ticketUrl: formData.ticketUrl || `https://tonjam.io/tickets/${Date.now()}`,
        bannerImageUrl:
          formData.bannerImageUrl ||
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        status: new Date(formData.date!) >= new Date() ? 'upcoming' : 'past',
        ticketStatus: formData.ticketStatus || 'General On-Sale',
        ticketPrice: formData.ticketPrice || '20 TON',
        subscribersCount: 1,
        vipPerk: formData.vipPerk || 'Exclusive VIP Access'
      };
      setEvents((prev) => [newEvent, ...prev]);
      addNotification(`Added new tour stop "${newEvent.title}" to live timeline! 📍🎟️`, 'success');
    }

    setIsAddModalOpen(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      eventType: 'Headline Tour',
      date: new Date().toISOString().split('T')[0],
      time: '20:00',
      venue: '',
      location: '',
      ticketUrl: '',
      ticketPrice: '20 TON',
      ticketStatus: 'General On-Sale',
      vipPerk: '',
      bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80'
    });
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove tour stop "${title}"?`)) {
      setEvents((prev) => prev.filter((evt) => evt.id !== id));
      addNotification(`Removed tour stop "${title}"`, 'info');
    }
  };

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    const totalSubs = events.reduce((acc, curr) => acc + (curr.subscribersCount || 0), 1200);
    addNotification(
      `Broadcast sent! Alerted ${totalSubs} subscribed fans about: "${broadcastMessage.substring(0, 40)}..." 📣💎`,
      'success'
    );
    setBroadcastMessage('');
    setIsBroadcastModalOpen(false);
  };

  // Google Calendar generator
  const getGoogleCalendarUrl = (evt: TourEventExtended) => {
    const startDate = evt.date.replace(/-/g, '');
    const details = encodeURIComponent(
      `TonJam Live Tour Event: ${evt.title}\nVenue: ${evt.venue}\nLocation: ${evt.location}\nTickets: ${evt.ticketUrl}\nVIP Perk: ${evt.vipPerk || 'N/A'}`
    );
    const location = encodeURIComponent(`${evt.venue}, ${evt.location}`);
    const text = encodeURIComponent(`${artistName} - ${evt.title}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}T200000Z/${startDate}T230000Z&details=${details}&location=${location}`;
  };

  // .ics File Generator function for personal digital calendars
  const generateIcsFile = (eventsToSync: TourEventExtended[], fileName = 'TonJam_Tour_Dates') => {
    if (!eventsToSync || eventsToSync.length === 0) {
      addNotification('No tour dates available to export.', 'warning');
      return;
    }

    const parseDateTime = (dateStr: string, timeStr?: string) => {
      try {
        const cleanDate = dateStr.replace(/-/g, '');
        let hours = '20';
        let mins = '00';
        if (timeStr) {
          const match = timeStr.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            hours = match[1].padStart(2, '0');
            mins = match[2];
          }
        }
        return `${cleanDate}T${hours}${mins}00Z`;
      } catch {
        return `${dateStr.replace(/-/g, '')}T200000Z`;
      }
    };

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TonJam//Live Tour Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${artistName} Tour Dates`,
      'X-WR-TIMEZONE:UTC'
    ];

    eventsToSync.forEach((evt) => {
      const dtStart = parseDateTime(evt.date, evt.time);
      const dtEnd = `${evt.date.replace(/-/g, '')}T230000Z`;
      const summary = `${artistName} - ${evt.title}`;
      const description = `Live Performance: ${evt.title}\\nVenue: ${evt.venue}\\nLocation: ${evt.location}\\nTickets: ${evt.ticketUrl || 'https://tonjam.io'}${evt.vipPerk ? '\\nVIP Perk: ' + evt.vipPerk : ''}`;
      const location = `${evt.venue}, ${evt.location}`;

      icsLines.push(
        'BEGIN:VEVENT',
        `UID:${evt.id}-${Date.now()}@tonjam.io`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsLines.push('END:VCALENDAR');

    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification(
      `Generated & downloaded .ics calendar file with ${eventsToSync.length} tour ${eventsToSync.length === 1 ? 'stop' : 'stops'}! 📅`,
      'success'
    );
  };

  // Filtered Events
  const filteredEvents = events
    .filter((evt) => {
      if (statusFilter === 'upcoming') return evt.status === 'upcoming';
      if (statusFilter === 'past') return evt.status === 'past';
      return true;
    })
    .filter(
      (evt) =>
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.venue.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Stats calculation
  const totalSubscribers = events.reduce((acc, curr) => acc + (curr.subscribersCount || 0), 0);
  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;
  const nextShow = events
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner & Tour Metrics Overview */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0A1128] border border-blue-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Live Tour & Events Protocol
              </span>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <Users className="w-3 h-3" /> {totalSubscribers.toLocaleString()} Fan Subscribers
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Live Tour Timeline & Calendar
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl mt-1 leading-relaxed">
              Manage concert dates, venue drops, ticket presales, and VIP perks. Fans can subscribe to real-time notification alerts, claim Web3 passes, and add tour stops to their calendars.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isArtistView && (
              <>
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2 active:scale-95"
                >
                  <Megaphone className="w-4 h-4" /> Broadcast Alert
                </button>

                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      eventType: 'Headline Tour',
                      date: new Date().toISOString().split('T')[0],
                      time: '20:00',
                      venue: '',
                      location: '',
                      ticketUrl: '',
                      ticketPrice: '20 TON',
                      ticketStatus: 'General On-Sale',
                      vipPerk: '',
                      bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80'
                    });
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Tour Stop
                </button>
              </>
            )}

            <button
              onClick={() => generateIcsFile(filteredEvents, `${artistName.replace(/\s+/g, '_')}_Tour_Dates`)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-600/25 flex items-center gap-2 active:scale-95"
              title="Download .ics file to sync all tour dates with Apple Calendar, Outlook, Google Calendar, and mobile devices"
            >
              <Download className="w-4 h-4" /> Sync to Calendar (.ics)
            </button>

            <button
              onClick={handleToggleAllSubscribe}
              className={`px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 ${
                isAllSubscribed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isAllSubscribed ? <BellRing className="w-4 h-4 text-emerald-400" /> : <Bell className="w-4 h-4" />}
              {isAllSubscribed ? 'Subscribed to Tour' : 'Subscribe to Tour'}
            </button>
          </div>
        </div>

        {/* Quick Tour Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 relative z-10">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Upcoming Shows
              </div>
              <div className="text-lg font-black text-white">{upcomingCount} Dates Scheduled</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Total Tour Reach
              </div>
              <div className="text-lg font-black text-white">{totalSubscribers.toLocaleString()} Fans Registered</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Next Upcoming Stop
              </div>
              <div className="text-sm font-black text-white truncate">
                {nextShow ? `${nextShow.venue} (${nextShow.location.split(',')[0]})` : 'No upcoming shows'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, venue or show..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                statusFilter === 'upcoming' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Upcoming ({events.filter((e) => e.status === 'upcoming').length})
            </button>
            <button
              onClick={() => setStatusFilter('past')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                statusFilter === 'past' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Past ({events.filter((e) => e.status === 'past').length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                statusFilter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({events.length})
            </button>
          </div>
        </div>
      </div>

      {/* Vertical Interactive Tour Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-purple-500 before:to-transparent">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-400">
            <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-black uppercase tracking-wider text-zinc-300">
              No tour stops found for this filter
            </p>
            {isArtistView && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Tour Stop
              </button>
            )}
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const dateObj = new Date(evt.date);
            const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
            const dayNum = dateObj.getDate();
            const yearNum = dateObj.getFullYear();
            const isSubscribed = subscribedEventIds.includes(evt.id);

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative group"
              >
                {/* Glowing Timeline Node */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full border-2 transition-all group-hover:scale-125 ${
                    evt.status === 'upcoming'
                      ? 'bg-blue-500 border-cyan-300 shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                      : 'bg-zinc-700 border-zinc-500'
                  }`}
                />

                <div className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all shadow-xl backdrop-blur-md relative overflow-hidden">
                  {/* Background Banner Image preview */}
                  {evt.bannerImageUrl && (
                    <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-15 transition-opacity">
                      <img src={evt.bannerImageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B] via-[#0B132B]/90 to-transparent" />
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* Left: Date Badge + Main Info */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="shrink-0 text-center p-3 rounded-2xl bg-gradient-to-b from-blue-600/30 to-purple-600/30 border border-white/10 min-w-[70px] shadow-lg">
                        <div className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                          {monthName}
                        </div>
                        <div className="text-2xl font-black text-white my-0.5">{dayNum}</div>
                        <div className="text-[9px] font-bold text-zinc-400">{yearNum}</div>
                      </div>

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-wider">
                            {evt.eventType || 'Tour Stop'}
                          </span>

                          {evt.ticketStatus && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                evt.ticketStatus === 'Sold Out'
                                  ? 'bg-red-500/20 text-red-400'
                                  : evt.ticketStatus === 'Selling Fast'
                                  ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {evt.ticketStatus}
                            </span>
                          )}

                          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                            <Users className="w-3 h-3 text-zinc-500" />
                            {evt.subscribersCount || 0} Subscribed
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                          {evt.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
                          <div className="flex items-center gap-1 font-bold text-white">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            {evt.venue}, {evt.location}
                          </div>
                          <div className="flex items-center gap-1 font-medium text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            {evt.time}
                          </div>
                        </div>

                        {evt.vipPerk && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold">
                            <Sparkles className="w-3 h-3 text-yellow-400" /> VIP Perk: {evt.vipPerk}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                      <button
                        onClick={() => handleToggleSubscribe(evt.id, evt.title)}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                          isSubscribed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {isSubscribed ? (
                          <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                        {isSubscribed ? 'Subscribed' : 'Remind Me'}
                      </button>

                      <a
                        href={getGoogleCalendarUrl(evt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        title="Add to Google Calendar"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Cal
                      </a>

                      <button
                        onClick={() => generateIcsFile([evt], `${evt.title.replace(/\s+/g, '_')}`)}
                        className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        title="Download .ics calendar event file for this tour stop"
                      >
                        <Download className="w-3.5 h-3.5" /> Sync .ics
                      </button>

                      {evt.ticketUrl && (
                        <a
                          href={evt.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-1.5 active:scale-95"
                        >
                          <Ticket className="w-3.5 h-3.5" /> Get Tickets ({evt.ticketPrice || 'TON'})
                        </a>
                      )}

                      {isArtistView && (
                        <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                          <button
                            onClick={() => {
                              setEditingEvent(evt);
                              setFormData({
                                ...evt
                              });
                              setIsAddModalOpen(true);
                            }}
                            className="p-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl transition-all"
                            title="Edit Tour Stop"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                            title="Remove Tour Stop"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT TOUR STOP MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B132B] border border-blue-500/30 rounded-2xl p-6 w-full max-w-xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black uppercase text-white tracking-wide">
                    {editingEvent ? 'Edit Tour Stop' : 'Add New Tour Stop'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                    Tour / Concert Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Solar Pulse World Tour - Live in Paris"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Event Category
                    </label>
                    <select
                      value={formData.eventType || 'Headline Tour'}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="Headline Tour">Headline Tour</option>
                      <option value="Festival">Festival</option>
                      <option value="Acoustic Set">Acoustic Set</option>
                      <option value="Metaverse Livestream">Metaverse Livestream</option>
                      <option value="VIP Party">VIP Party</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Ticket Availability Status
                    </label>
                    <select
                      value={formData.ticketStatus || 'General On-Sale'}
                      onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value as any })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="General On-Sale">General On-Sale</option>
                      <option value="Selling Fast">Selling Fast</option>
                      <option value="VIP Only">VIP Only</option>
                      <option value="Sold Out">Sold Out</option>
                      <option value="Announced">Announced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Time & Timezone
                    </label>
                    <input
                      type="text"
                      value={formData.time || ''}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="e.g., 20:00 CEST"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.venue || ''}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="e.g. Accor Arena"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      City & Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Paris, France"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Ticket Purchase / Web3 Booking URL
                    </label>
                    <input
                      type="url"
                      value={formData.ticketUrl || ''}
                      onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
                      placeholder="https://tonjam.io/tickets/..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                      Ticket Price
                    </label>
                    <input
                      type="text"
                      value={formData.ticketPrice || ''}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      placeholder="e.g. 20 TON / $95"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                    Fan Token VIP Perk (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.vipPerk || ''}
                    onChange={(e) => setFormData({ ...formData, vipPerk: e.target.value })}
                    placeholder="e.g., Free VIP Backstage Pass for Gold Fan Token holders"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/20"
                  >
                    {editingEvent ? 'Save Changes' : 'Publish Tour Stop'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BROADCAST ALERT MODAL */}
      <AnimatePresence>
        {isBroadcastModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B132B] border border-purple-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-white tracking-wide">
                      Broadcast Tour Alert
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Send instant push & feed alerts to all {totalSubscribers.toLocaleString()} subscribed fans.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBroadcastAlert} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. London presale codes are live now! Gold Fan Token holders claim free VIP upgrades..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs font-black uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Broadcast
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveTourManager;
