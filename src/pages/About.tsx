import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Users, Zap, Music2 } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <header className="space-y-4">
          <h1 className="text-[44px] md:text-[68px] font-black tracking-tighter uppercase text-foreground">About Us</h1>
          <p className="text-xl text-muted-foreground/80 font-medium max-w-2xl">
            Empowering creators and listeners through decentralized audio technology.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-[20px] font-bold uppercase tracking-widest text-blue-500">Our Mission</h2>
          <p className="text-lg text-muted-foreground/90 leading-relaxed">
            TonJam is a decentralized music platform built on the TON blockchain. We believe in a future where creators have full ownership of their work, and listeners can directly support the artists they love without intermediaries.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: ShieldCheck, title: 'Decentralized', desc: 'Your assets are secured on-chain.' },
            { icon: Users, title: 'Creator-First', desc: 'Artists retain ownership and control.' },
            { icon: Zap, title: 'Instant', desc: 'Fast transactions on the TON network.' },
            { icon: Music2, title: 'Immersive', desc: 'A new way to experience music.' },
          ].map((item, idx) => (
            <div key={`feature-${idx}`} className="p-4 rounded-2xl bg-muted/50 border border-border/50 flex items-start gap-4">
              <item.icon className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-4">{item.title}</h3>
                <p className="text-sm text-muted-foreground/80">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-[20px] font-bold uppercase tracking-widest text-blue-500">The Creators</h2>
          <p className="text-lg text-muted-foreground/90 leading-relaxed">
            TonJam was built by a passionate team of developers, designers, and music enthusiasts dedicated to pushing the boundaries of Web3 audio. We are constantly iterating to bring you the best experience possible.
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export default About;
