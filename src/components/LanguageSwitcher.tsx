import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-2 text-xs">
      <GlobeAltIcon className="w-4 h-4 text-muted-foreground" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="bg-transparent text-muted-foreground font-bold outline-none border-none cursor-pointer focus:ring-0 uppercase text-[10px] tracking-widest"
      >
        <option value="en" className="bg-zinc-900 text-white">English</option>
        <option value="ru" className="bg-zinc-900 text-white">Русский</option>
        <option value="uk" className="bg-zinc-900 text-white">Українська</option>
        <option value="es" className="bg-zinc-900 text-white">Español</option>
        <option value="de" className="bg-zinc-900 text-white">Deutsch</option>
        <option value="fr" className="bg-zinc-900 text-white">Français</option>
        <option value="zh" className="bg-zinc-900 text-white">中文</option>
      </select>
    </div>
  );
};
