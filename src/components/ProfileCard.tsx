import React from 'react';
import { Star, Users, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProfileCardProps {
  name: string;
  title: string;
  bannerUrl: string;
  avatarUrl: string;
  stats: {
    followers: string;
    following: string;
    assets: string;
  };
  onFollow?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  title,
  bannerUrl,
  avatarUrl,
  stats,
  onFollow,
}) => {
  return (
    <Card className="max-w-sm mx-auto bg-card shadow-xl rounded-lg text-card-foreground overflow-hidden">
      <div className="rounded-t-lg h-32 overflow-hidden">
        <img className="object-cover object-top w-full h-full" src={bannerUrl} alt="Banner" />
      </div>
      <div className="mx-auto w-32 h-32 relative -mt-16 rounded-full overflow-hidden bg-muted">
        <img className="object-cover object-center h-32 w-32" src={avatarUrl} alt={name} />
      </div>
      <div className="flex flex-col items-center mt-2 px-4">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <h2 className="font-semibold text-lg">{name}</h2>
          <span className="text-xs font-bold text-blue-500/70 bg-blue-500/5 px-2 py-0.5 rounded-full uppercase tracking-wider">{title}</span>
        </div>
      </div>
      <ul className="py-4 mt-2 text-muted-foreground flex items-center justify-around">
        <li className="flex flex-col items-center justify-around gap-1">
          <Star className="w-4 h-4 text-primary" />
          <div className="font-bold">{stats.followers}</div>
        </li>
        <li className="flex flex-col items-center justify-between gap-1">
          <Users className="w-4 h-4 text-primary" />
          <div className="font-bold">{stats.following}</div>
        </li>
        <li className="flex flex-col items-center justify-around gap-1">
          <Briefcase className="w-4 h-4 text-primary" />
          <div className="font-bold">{stats.assets}</div>
        </li>
      </ul>
      <CardContent className="p-4 mx-8 mt-2">
        <Button 
          className="w-1/2 block mx-auto rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-6 py-2"
          onClick={onFollow}
        >
          Follow
        </Button>
      </CardContent>
    </Card>
  );
};
