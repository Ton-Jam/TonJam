import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, description?: string, duration?: number) => void;
  success: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, description?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, description, duration }]);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => toast('success', title, description), [toast]);
  const warning = useCallback((title: string, description?: string) => toast('warning', title, description), [toast]);
  const error = useCallback((title: string, description?: string) => toast('error', title, description), [toast]);
  const info = useCallback((title: string, description?: string) => toast('info', title, description), [toast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    return 'bg-[#0A122C]/95';
  };

  return (
    <ToastContext.Provider value={{ toast, success, warning, error, info }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-20 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none sm:left-auto sm:right-6 sm:w-96">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`
                w-full p-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto backdrop-blur-md select-none
                ${getBgColor(item.type)}
              `}
            >
              {getIcon(item.type)}
              <div className="flex-1 min-w-0">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-white">
                  {item.title}
                </h5>
                {item.description && (
                  <p className="text-[10px] font-semibold text-slate-300 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-white/40 hover:text-white p-0.5 rounded-lg hover:bg-white/5 active:scale-90 transition-all flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
export default ToastProvider;
