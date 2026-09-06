import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  bullets?: string[];
  confirmText?: string;
  requireTypingText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  bullets,
  confirmText = 'Confirm',
  requireTypingText,
  variant = 'danger',
  isLoading = false,
}) => {
  const [typedInput, setTypedInput] = useState('');

  if (!isOpen) return null;

  const isConfirmDisabled = isLoading || (requireTypingText ? typedInput.trim() !== requireTypingText : false);

  const handleConfirm = () => {
    onConfirm();
    setTypedInput('');
  };

  const handleClose = () => {
    if (isLoading) return;
    setTypedInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>

          {bullets && bullets.length > 0 && (
            <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-lg space-y-1 text-xs text-gray-700">
              <span className="font-semibold block mb-1">The following will be removed:</span>
              {bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          )}

          {requireTypingText && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-gray-700">
                To confirm, type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600 font-bold">{requireTypingText}</span> below:
              </label>
              <input
                type="text"
                value={typedInput}
                onChange={e => setTypedInput(e.target.value)}
                placeholder={requireTypingText}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs flex items-center gap-2 ${
              isConfirmDisabled
                ? 'bg-red-300 cursor-not-allowed'
                : variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                : 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

