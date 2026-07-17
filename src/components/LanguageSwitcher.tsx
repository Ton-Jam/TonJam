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
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ru' | 'uk')}
        className="bg-transparent text-muted-foreground font-bold outline-none border-none cursor-pointer focus:ring-0 uppercase text-[10px] tracking-widest"
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
        <option value="uk">Українська</option>
      </select>
    </div>
  );
};
