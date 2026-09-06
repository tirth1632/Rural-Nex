import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-800 text-xs font-medium animate-in slide-in-from-bottom-5 duration-200">
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      <span>{message}</span>
      <button onClick={onClose} className="p-0.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white ml-2">
        <X size={14} />
      </button>
    </div>
  );
};
