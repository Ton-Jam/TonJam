import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  isMobileNavHidden?: boolean;
  hasMiniPlayer?: boolean;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ isMobileNavHidden = true, hasMiniPlayer = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const bottomOffset = isDesktop 
    ? (hasMiniPlayer ? 'bottom-28' : 'bottom-8') 
    : (hasMiniPlayer ? 'bottom-44' : (!isMobileNavHidden ? 'bottom-24' : 'bottom-8'));

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed ${bottomOffset} right-6 lg:right-8 z-50 p-3 rounded-[2px] bg-blue-600 text-white shadow-lg transition-all duration-300 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTopButton;
