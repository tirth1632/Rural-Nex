import React, { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { authService } from '../../../services/authService';

interface RevokeSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RevokeSessionsModal: React.FC<RevokeSessionsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await authService.revokeOtherSessions();
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <LogOut className="text-primary" size={20} />
            <h3 className="text-base font-semibold text-gray-900">Sign out of all other devices?</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            This will sign you out everywhere except your current device. You will need to log back in on any other browsers or devices.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg shadow-2xs transition-colors"
            >
              {loading ? 'Signing out...' : 'Sign Out Other Devices'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
