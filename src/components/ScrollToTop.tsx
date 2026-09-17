import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Scroll window and documents
    if (typeof window !== 'undefined') {
      window.scrollTo?.({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
    if (typeof document !== 'undefined') {
      if (typeof document.documentElement?.scrollTo === 'function') {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      } else if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }

      if (typeof document.body?.scrollTo === 'function') {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      } else if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
    }

    // 2. Scroll the main wrapper
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (typeof mainContent.scrollTo === 'function') {
        mainContent.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      } else {
        mainContent.scrollTop = 0;
      }
    }

    // 3. Scroll any matching inner containers
    const containers = document.querySelectorAll('.overflow-y-auto, [class*="overflow-y-"]');
    containers.forEach((container) => {
      try {
        if (typeof container.scrollTo === 'function') {
          container.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        } else {
          container.scrollTop = 0;
        }
      } catch (e) {
        container.scrollTop = 0;
      }
    });

    // 4. Robust micro-timeout fallback for dynamic loading
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo?.(0, 0);
      }
      if (typeof document !== 'undefined') {
        if (typeof document.documentElement?.scrollTo === 'function') {
          document.documentElement.scrollTo(0, 0);
        } else if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (typeof document.body?.scrollTo === 'function') {
          document.body.scrollTo(0, 0);
        } else if (document.body) {
          document.body.scrollTop = 0;
        }
      }
      if (mainContent) {
        if (typeof mainContent.scrollTo === 'function') {
          mainContent.scrollTo(0, 0);
        }
        mainContent.scrollTop = 0;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
