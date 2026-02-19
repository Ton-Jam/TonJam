
import React from 'react';
import { APP_LOGO } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      <img
        src={APP_LOGO}
        alt="TonJam"
        className="w-28 h-28 md:w-40 md:h-40 object-contain animate-breathe"
      />

      <style jsx>{`
        @keyframes breathe {
          0% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
        }

        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;