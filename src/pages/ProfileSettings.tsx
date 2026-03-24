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
          <div className="border-b border-white/10 pb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
            <p className="text-sm text-gray-400">
              Customize your TonJam Web3 identity. This information will be displayed publicly.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              {/* Wallet Connection Section */}
              <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Web3 Wallet</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Connect your TON wallet to mint NFTs, stake JAM, and earn rewards.
                  </p>
                  {tonAddress && (
                    <p className="text-xs font-mono text-blue-400 mt-2 bg-blue-400/10 px-2 py-1 rounded inline-block">
                      {tonAddress.slice(0, 6)}...{tonAddress.slice(-4)}
                    </p>
                  )}
                </div>
                <TonConnectButton />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Display Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline-none border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="handle" className="block text-sm font-medium text-white">
                  Handle
                </label>
                <div className="mt-2 flex rounded-md bg-white/5 border border-white/10 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">@</span>
                  <input
                    id="handle"
                    name="handle"
                    type="text"
                    value={profile.handle}
                    onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                    className="block w-full min-w-0 grow bg-transparent py-2 pl-1 pr-3 text-white placeholder:text-gray-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <div className="flex items-center justify-between">
                  <label htmlFor="bio" className="block text-sm font-medium text-white">
                    Bio
                  </label>
                  <button
                    type="button"
                    onClick={generateAIBio}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
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
                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline-none border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">Brief description for your profile. URLs are hyperlinked.</p>
              </div>

              <div className="col-span-full">
                <label htmlFor="avatar" className="block text-sm font-medium text-white">
                  Avatar URL
                </label>
                <div className="mt-2 flex items-center gap-x-4">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover bg-white/10" />
                  ) : (
                    <UserCircleIcon aria-hidden="true" className="h-12 w-12 text-gray-500" />
                  )}
                  <input
                    id="avatar"
                    name="avatar"
                    type="text"
                    placeholder="https://example.com/avatar.png"
                    value={profile.avatar}
                    onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                    className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline-none border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-end gap-x-4">
            <button 
              type="button" 
              className="text-sm font-semibold text-white hover:text-gray-300"
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
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 flex items-center gap-2"
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
