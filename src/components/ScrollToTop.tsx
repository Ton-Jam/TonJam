import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Scroll window and documents
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    // 2. Scroll the main wrapper
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }

    // 3. Scroll any matching inner containers
    const containers = document.querySelectorAll('.overflow-y-auto, [class*="overflow-y-"]');
    containers.forEach((container) => {
      try {
        container.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      } catch (e) {
        container.scrollTop = 0;
      }
    });

    // 4. Robust micro-timeout fallback for dynamic loading
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
      if (mainContent) {
        mainContent.scrollTo(0, 0);
        mainContent.scrollTop = 0;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
