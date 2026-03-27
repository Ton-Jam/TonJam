import React, { useState, useEffect } from 'react';
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useAudio } from '@/context/AudioContext';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { GoogleGenAI } from '@google/genai';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfileSettings() {
  const { userProfile, addNotification } = useAudio();
  const tonAddress = useTonAddress();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    handle: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name || '',
        handle: userProfile.handle || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatar || '',
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addNotification('You must be logged in to update your profile.', 'error');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          handle: profile.handle,
          bio: profile.bio,
          avatar: profile.avatar,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification('Error updating profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateAIBio = async () => {
    setAiLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
You are an expert Web3 and music profile bio generator.
Generate a short, catchy, and creative bio (max 150 characters) for a user on a Web3 music streaming platform called TonJam.
The user's name is "${profile.name || 'Anonymous'}" and their handle is "@${profile.handle || 'user'}".
Make it sound cool, crypto-native, and passionate about music.
Return ONLY the bio text, nothing else.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const generatedBio = response.text?.trim() || '';
      if (generatedBio) {
        setProfile(prev => ({ ...prev, bio: generatedBio }));
        addNotification('AI Bio generated!', 'success');
      }
    } catch (error) {
      console.error("AI Bio Generation Error:", error);
      addNotification("Failed to generate AI bio. Try again later.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen pb-24 lg:pb-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="pb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Profile Settings</h2>
            <p className="text-sm text-muted-foreground">
              Customize your TonJam Web3 identity. This information will be displayed publicly.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              {/* Wallet Connection Section */}
              <div className="col-span-full bg-muted/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Web3 Wallet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect your TON wallet to mint NFTs, stake JAM, and earn rewards.
                  </p>
                  {tonAddress && (
                    <p className="text-xs font-mono text-blue-500 mt-2 bg-blue-500/10 px-2 py-1 rounded inline-block">
                      {tonAddress.slice(0, 6)}...{tonAddress.slice(-4)}
                    </p>
                  )}
                </div>
                <TonConnectButton />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Display Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="block w-full rounded-xl bg-muted/20 px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-foreground transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="handle" className="block text-sm font-medium text-foreground">
                  Handle
                </label>
                <div className="mt-2 flex rounded-xl bg-muted/20 focus-within:ring-2 focus-within:ring-foreground transition-all">
                  <span className="flex select-none items-center pl-4 text-muted-foreground sm:text-sm">@</span>
                  <input
                    id="handle"
                    name="handle"
                    type="text"
                    value={profile.handle}
                    onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                    className="block w-full min-w-0 grow bg-transparent py-3 pl-1 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <div className="flex items-center justify-between">
                  <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                    Bio
                  </label>
                  <button
                    type="button"
                    onClick={generateAIBio}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
                    Generate with AI
                  </button>
                </div>
                <div className="mt-2">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="block w-full rounded-xl bg-muted/20 px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-foreground transition-all sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Brief description for your profile. URLs are hyperlinked.</p>
              </div>

              <div className="col-span-full">
                <label htmlFor="avatar" className="block text-sm font-medium text-foreground">
                  Avatar URL
                </label>
                <div className="mt-2 flex items-center gap-x-4">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover bg-muted" />
                  ) : (
                    <UserCircleIcon aria-hidden="true" className="h-12 w-12 text-muted-foreground" />
                  )}
                  <input
                    id="avatar"
                    name="avatar"
                    type="text"
                    placeholder="https://example.com/avatar.png"
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    className="block w-full rounded-xl bg-muted/20 px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-foreground transition-all sm:text-sm"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4">
            <button 
              type="button" 
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                setProfile({
                  name: userProfile?.name || '',
                  handle: userProfile?.handle || '',
                  bio: userProfile?.bio || '',
                  avatar: userProfile?.avatar || '',
                });
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-foreground px-6 py-2 text-sm font-semibold text-background shadow-sm hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
