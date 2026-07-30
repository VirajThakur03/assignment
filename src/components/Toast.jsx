import React from 'react';
import { usePlatformStore } from '../store/usePlatformStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function Toast() {
  const { toastNotification } = usePlatformStore();

  if (!toastNotification) return null;

  const { message, type } = toastNotification;
  const isSuccess = type === 'success';
  const isWarn = type === 'warn';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center space-x-3 text-xs font-medium backdrop-blur-md ${
        isSuccess ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50' :
        isWarn ? 'bg-amber-950/90 text-amber-200 border-amber-500/50' :
        'bg-slate-900/90 text-cyan-200 border-cyan-500/50'
      }`}>
        {isSuccess ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
         isWarn ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
         <Info className="w-4 h-4 text-cyan-400" />}
        <span>{message}</span>
      </div>
    </div>
  );
}
