import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sparkles, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';

const CompleteProfilePrompt = () => {
  const { userProfile } = useAudio();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!userProfile) return null;

  const isAvatarMissing = !userProfile.avatar || userProfile.avatar.includes('placeholder');
  const isBioMissing = !userProfile.bio || userProfile.bio.trim() === '';

  if (!isAvatarMissing && !isBioMissing) return null;
  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-[4px] bg-gradient-to-r from-purple-600 to-blue-600 p-4 md:p-6 text-white shadow-2xl mb-8">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-950/40 backdrop-blur-md border border-blue-500/10 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-bold">Complete your profile</h3>
          <p className="text-white/80 text-xs md:text-sm">
            {isAvatarMissing && isBioMissing 
              ? "Add an avatar and a bio to stand out in the community."
              : isAvatarMissing 
                ? "Add an avatar to personalize your profile."
                : "Add a bio to tell the community about yourself."}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/settings')}
          className="md:ml-auto bg-white text-purple-600 hover:bg-neutral-100 font-bold uppercase tracking-widest rounded-full text-[10px] md:text-xs shadow-lg px-4 py-1.5 h-auto"
        >
          Complete Profile
        </Button>
      </div>
    </div>
  );
};

export default CompleteProfilePrompt;
