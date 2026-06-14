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
    <div className="section-container relative overflow-hidden rounded-2xl bg-transparent dark:bg-black p-4 md:p-6 text-foreground shadow-2xl">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 md:h-8 md:w-8 text-foreground" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-bold">Complete your profile</h3>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            {isAvatarMissing && isBioMissing 
              ? "Add an avatar and a bio to stand out in the community."
              : isAvatarMissing 
                ? "Add an avatar to personalize your profile."
                : "Add a bio to tell the community about yourself."}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/settings')}
          className="md:ml-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest rounded-full text-[10px] md:text-xs shadow-lg px-4 py-1.5 h-auto"
        >
          Complete Profile
        </Button>
      </div>
    </div>
  );
};

export default CompleteProfilePrompt;
