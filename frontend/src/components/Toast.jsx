import React from 'react';
import { useTeam } from '../context/TeamContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = useTeam();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-100',
    warning: 'border-amber-500/40 bg-slate-900/95 text-amber-100',
    info: 'border-blue-500/40 bg-slate-900/95 text-blue-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md animate-bounce-subtle">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${borders[toastMessage.type || 'info']}`}>
        {icons[toastMessage.type || 'info']}
        <span className="text-xs font-bold tracking-wide">
          {toastMessage.message}
        </span>
      </div>
    </div>
  );
}
