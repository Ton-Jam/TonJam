import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'uk';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.discover': 'Discover',
    'nav.library': 'Library',
    'nav.marketplace': 'Marketplace',
    'nav.profile': 'Profile',
    'refer.title': 'Refer-a-Fan',
    'refer.desc': 'Invite friends and earn JAM coins!',
    'nav.search': 'Search',
    'nav.jamspace': 'JamSpace',
    'nav.auctions': 'Auctions',
    'nav.genesis': 'Genesis',
    'nav.account': 'Account',
    'nav.artist_profile': 'Artist Profile',
    'nav.artist_dashboard': 'Artist Dashboard',
    'nav.portfolio': 'Portfolio',
    'nav.admin_console': 'Admin Console',
    'nav.user_profile': 'User Profile',
    'nav.my_nfts': 'My NFTs',
    'nav.wallet': 'Wallet',
    'nav.governance': 'Governance',
    'nav.staking': 'Staking',
    'nav.about': 'About Us',
    'nav.settings': 'Settings',
    'nav.sign_out': 'Sign Out',
    'nav.upload_track': 'Upload Track',
    'nav.mint_nft': 'Mint NFT',
    'nav.become_artist': 'Become Artist',
    'nav.jam_price': 'JAM Price',
    'nav.your_balance': 'Your Balance',
    'nav.referrals': 'Referrals',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.discover': 'Обзор',
    'nav.library': 'Библиотека',
    'nav.marketplace': 'Маркетплейс',
    'nav.profile': 'Профиль',
    'refer.title': 'Пригласи фаната',
    'refer.desc': 'Приглашайте друзей и зарабатывайте монеты JAM!',
    'nav.search': 'Поиск',
    'nav.jamspace': 'JamSpace',
    'nav.auctions': 'Аукционы',
    'nav.genesis': 'Генезис',
    'nav.account': 'Аккаунт',
    'nav.artist_profile': 'Профиль артиста',
    'nav.artist_dashboard': 'Панель артиста',
    'nav.portfolio': 'Портфолио',
    'nav.admin_console': 'Панель админа',
    'nav.user_profile': 'Профиль',
    'nav.my_nfts': 'Мои NFT',
    'nav.wallet': 'Кошелек',
    'nav.governance': 'Управление',
    'nav.staking': 'Стейкинг',
    'nav.about': 'О нас',
    'nav.settings': 'Настройки',
    'nav.sign_out': 'Выйти',
    'nav.upload_track': 'Загрузить трек',
    'nav.mint_nft': 'Создать NFT',
    'nav.become_artist': 'Стать артистом',
    'nav.jam_price': 'Цена JAM',
    'nav.your_balance': 'Ваш баланс',
    'nav.referrals': 'Рефералы',
  },
  uk: {
    'nav.home': 'Головна',
    'nav.discover': 'Огляд',
    'nav.library': 'Бібліотека',
    'nav.marketplace': 'Маркетплейс',
    'nav.profile': 'Профіль',
    'refer.title': 'Запроси фаната',
    'refer.desc': 'Запрошуйте друзів та заробляйте монети JAM!',
    'nav.search': 'Пошук',
    'nav.jamspace': 'JamSpace',
    'nav.auctions': 'Аукціони',
    'nav.genesis': 'Генезис',
    'nav.account': 'Акаунт',
    'nav.artist_profile': 'Профіль артиста',
    'nav.artist_dashboard': 'Панель артиста',
    'nav.portfolio': 'Портфоліо',
    'nav.admin_console': 'Панель адміна',
    'nav.user_profile': 'Профіль',
    'nav.my_nfts': 'Мої NFT',
    'nav.wallet': 'Гаманець',
    'nav.governance': 'Управління',
    'nav.staking': 'Стейкінг',
    'nav.about': 'Про нас',
    'nav.settings': 'Налаштування',
    'nav.sign_out': 'Вийти',
    'nav.upload_track': 'Завантажити трек',
    'nav.mint_nft': 'Створити NFT',
    'nav.become_artist': 'Стати артистом',
    'nav.jam_price': 'Ціна JAM',
    'nav.your_balance': 'Ваш баланс',
    'nav.referrals': 'Реферали',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tonjam_language');
    if (saved === 'ru' || saved === 'uk' || saved === 'en') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tonjam_language', lang);
  };

  const t = (key: string) => {
    return translations[language]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
