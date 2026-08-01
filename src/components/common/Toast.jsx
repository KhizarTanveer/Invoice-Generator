import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-slate-900 text-white border-brand-500/40',
    error: 'bg-rose-900 text-white border-rose-500/40',
    info: 'bg-brand-900 text-white border-brand-400/40'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-2xl border ${bgStyles[toast.type || 'success']} min-w-[300px] max-w-md transition-all duration-300`}>
        {icons[toast.type || 'success']}
        <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
