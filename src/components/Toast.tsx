import React from 'react';

interface ToastProps {
  message: string | null;
  icon?: string;
}

export const Toast: React.FC<ToastProps> = ({ message, icon = '✨' }) => {
  if (!message) return null;

  return (
    <div role="status" aria-live="polite" className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
      <div className="bg-[#2b170c] border-2 border-amber-300 text-amber-100 text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="font-medium tracking-wide drop-shadow-sm">{message}</span>
      </div>
    </div>
  );
};
