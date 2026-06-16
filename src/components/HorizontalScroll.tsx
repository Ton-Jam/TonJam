'use client';

import * as React from 'react';
import { ReactLenis } from 'lenis/react';
import { motion, useTransform, useScroll } from 'motion/react';

interface HorizontalScrollProps {
  children?: React.ReactNode;
  items?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    description?: string;
    color?: string;
  }>;
}

export default function HorizontalScroll({ children, items }: HorizontalScrollProps): JSX.Element {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Transform vertical scrolling progress into horizontal translation of the content track
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  // Render a lovely modern landing or dynamic section that demonstrates the Lenis-powered horizontal scroll
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <div className="relative min-h-[100vh] bg-background">
        {children ? (
          children
        ) : (
          <div ref={targetRef} className="relative h-[300vh] bg-neutral-900">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
              {/* Decorative Background Glows */}
              <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <motion.div style={{ x }} className="flex gap-12 px-12 md:px-24">
                {/* Intro Card */}
                <div className="group relative flex h-[60vh] w-[450px] flex-col justify-between overflow-hidden rounded-3xl bg-neutral-950/40 p-8 md:p-10 border border-neutral-800 backdrop-blur-md transition-all duration-300 hover:border-neutral-700/80 shrink-0">
                  <div className="space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary/80 font-mono">Lenis Scroll</span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                      Smooth Horizontal Canvas
                    </h2>
                    <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-[320px]">
                      Scroll down vertically to discover releases, artwork, and statistics sliding seamlessly from left to right.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                    <span>SCROLL DOWN</span>
                    <span className="animate-bounce">↓</span>
                  </div>
                </div>

                {/* Dynamic Items list */}
                {(items && items.length > 0 ? items : DEFAULT_SCROLL_ITEMS).map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative flex h-[60vh] w-[420px] flex-col justify-between overflow-hidden rounded-3xl bg-neutral-950/20 p-8 border border-neutral-800/60 backdrop-blur-sm transition-all duration-300 hover:border-neutral-700/50 shrink-0"
                  >
                    {/* Visual Background/Accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/50 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {item.image && (
                      <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 hover:scale-105 duration-700">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-xs font-semibold font-mono text-neutral-500">
                        {String(index + 1).padStart(2, '0')} / {String((items?.length || DEFAULT_SCROLL_ITEMS.length)).padStart(2, '0')}
                      </span>
                      {item.color && (
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      )}
                    </div>

                    <div className="relative z-10 space-y-3">
                      {item.subtitle && (
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 font-mono">
                          {item.subtitle}
                        </p>
                      )}
                      <h3 className="text-2xl font-bold tracking-normal text-white group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-mono">TONJAM PROJECT</span>
                      <button className="text-white hover:text-primary transition-colors font-semibold">
                        View Info →
                      </button>
                    </div>
                  </div>
                ))}

                {/* Closing Card */}
                <div className="group relative flex h-[60vh] w-[450px] flex-col justify-between overflow-hidden rounded-3xl bg-neutral-950/40 p-8 md:p-10 border border-neutral-800 backdrop-blur-md shrink-0">
                  <div className="space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#0088cc] font-mono">Blockchain Ready</span>
                    <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
                      Empowering Global Artists
                    </h2>
                    <p className="text-sm text-neutral-400 leading-relaxed max-w-[320px]">
                      Harnessing the speed and composability of TON blockchain to build the future of decentralized music, royalty tokenization, and digital art.
                    </p>
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    © TONJAM 2026
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </ReactLenis>
  );
}

const DEFAULT_SCROLL_ITEMS = [
  {
    id: "item-1",
    title: "NFT Collectibles",
    subtitle: "Digital Souvenirs",
    description: "Exclusive limited-edition music tracks and album art minted directly on the TON blockchain as immutable assets.",
    image: "/dist/default_tonjam_banner.jpg",
    color: "#0088cc",
  },
  {
    id: "item-2",
    title: "In-Browser Studio",
    subtitle: "Collaborative Mixing",
    description: "Live browser-based virtual synthesizer allowing producers and fans to jam in real-time, share files, and co-create hits.",
    color: "#8b5cf6",
  },
  {
    id: "item-3",
    title: "Instant Royalty Flows",
    subtitle: "Automated Splits",
    description: "Smart contracts autonomously distribute song revenue streams to artists, collaborators, and token-holders in fractions of a second.",
    color: "#10b981",
  }
];
