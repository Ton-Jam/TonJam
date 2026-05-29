import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ArtistVerificationRequest } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const VerificationTracker: React.FC = () => {
  const [requests, setRequests] = useState<ArtistVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "verificationRequests"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("submittedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data() as ArtistVerificationRequest);
      setRequests(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching verification requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoadingSpinner size={32} />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Querying Identity Registry...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
          <ShieldCheck className="w-8 h-8 text-blue-500 opacity-40" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-black text-white uppercase tracking-tighter">No Active Protocols</h4>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
            You haven't submitted any artist verification requests yet. Start your journey as a verified architect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Identity Submission Logs</h4>
        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{requests.length} Requests Found</span>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <div 
            key={request.id}
            className="group relative bg-white/[0.03] border border-white/5 rounded-[4px] overflow-hidden hover:bg-white/[0.05] transition-all duration-500"
          >
            <div className="p-5 flex items-start gap-5">
              {/* Status Icon */}
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                  request.status === 'pending' && "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
                  request.status === 'approved' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                  request.status === 'rejected' && "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                )}>
                  {request.status === 'pending' && <Clock className="w-6 h-6 animate-pulse" />}
                  {request.status === 'approved' && <CheckCircle2 className="w-6 h-6" />}
                  {request.status === 'rejected' && <XCircle className="w-6 h-6" />}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-black text-white uppercase tracking-tight truncate pr-4">
                    {request.artistName}
                  </h5>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                    request.status === 'pending' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                    request.status === 'approved' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                    request.status === 'rejected' && "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {request.status}
                  </span>
                </div>
                
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mb-3">
                  Submitted {format(new Date(request.createdAt), 'MMM dd, yyyy • HH:mm')}
                </p>

                {request.reviewerNotes && (
                  <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">
                      <MessageSquare className="w-3 h-3" /> Architect Notes
                    </div>
                    <p className="text-[10px] font-medium text-white/80 leading-relaxed italic">
                      "{request.reviewerNotes}"
                    </p>
                  </div>
                )}

                {request.statement && (
                  <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">
                      <FileText className="w-3 h-3" /> Artist Statement
                    </div>
                    <p className="text-[10px] font-medium text-white/80 leading-relaxed">
                      {request.statement}
                    </p>
                  </div>
                )}

                {/* Portfolio Links Preview */}
                {request.portfolioUrls && request.portfolioUrls.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {request.portfolioUrls.slice(0, 3).map((url, i) => (
                      <a 
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[8px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-all"
                      >
                        Evidence {i + 1} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                    {request.portfolioUrls.length > 3 && (
                      <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest py-1.5">+ {request.portfolioUrls.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="self-center pl-2">
                <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Bottom Glow */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-1 blur-xl opacity-20",
              request.status === 'pending' && "bg-amber-500",
              request.status === 'approved' && "bg-emerald-500",
              request.status === 'rejected' && "bg-red-500"
            )} />
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[4px] flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 flex-shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Verification Timeline</h5>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
            Standard review cycles take 24-72 hours. Our architects will analyze your social footprint and portfolio evidence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationTracker;
