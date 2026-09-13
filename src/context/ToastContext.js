'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-md w-full px-4">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-luxury backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
                isSuccess
                  ? 'bg-ivory-50/95 border-gold-300/60 text-obsidian-900'
                  : isError
                  ? 'bg-red-50/95 border-red-200 text-red-900'
                  : 'bg-obsidian-900/95 border-gold-500/40 text-ivory-50'
              }`}
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-gold-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
                {isInfo && <Info className="w-5 h-5 text-gold-400" />}
              </div>
              <div className="flex-1 text-sm font-medium tracking-wide leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 flex-shrink-0 text-obsidian-400 hover:text-obsidian-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
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
