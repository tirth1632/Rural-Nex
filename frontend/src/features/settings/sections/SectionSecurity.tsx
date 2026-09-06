import React, { useState, useEffect } from 'react';
import { useSettings } from '../SettingsContext';
import { PasswordModal } from '../components/PasswordModal';
import { Setup2FAModal } from '../components/Setup2FAModal';
import { Disable2FAModal } from '../components/Disable2FAModal';
import { RevokeSessionsModal } from '../components/RevokeSessionsModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ShieldCheck, Lock, Smartphone, Monitor, Trash2, AlertCircle, Sparkles, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authService, type SessionDevice } from '../../../services/authService';
import { FaceDetectorInput } from '../../auth/components/FaceDetectorInput';
import { updateProfile } from '../../../services/auth.service';

export const SectionSecurity: React.FC = () => {
  const { draftSettings, updateDraft, setToastMessage } = useSettings();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSetup2FAModalOpen, setIsSetup2FAModalOpen] = useState(false);
  const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false);
  const [isRevokeSessionsModalOpen, setIsRevokeSessionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFaceScannerOpen, setIsFaceScannerOpen] = useState(false);

  const [sessions, setSessions] = useState<SessionDevice[]>([]);

  const handleFaceSaved = async (dataUrl: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await updateProfile({ face_data: dataUrl, face_verified: true }, token);
        updateUser({ profile: { face_data: dataUrl, face_verified: true } });
        setToastMessage('Face biometric updated for login successfully!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e) {
      console.error('Failed to update face biometric', e);
    }
  };

  useEffect(() => {
    authService.getSessions().then(res => setSessions(res));
  }, []);

  const handle2FAToggleClick = () => {
    if (draftSettings.twoFactorEnabled) {
      setIsDisable2FAModalOpen(true);
    } else {
      setIsSetup2FAModalOpen(true);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    const res = await authService.deleteAccount('DELETE');
    if (res.success) {
      setToastMessage('Account deleted successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Security</h2>
        <p className="text-xs text-gray-500 mt-1">Manage your password and account security.</p>
      </div>

      {/* Password Section */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Password</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">••••••••••••</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Face Authentication (MediaPipe AI) */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                user?.profile?.face_verified || user?.profile?.face_data
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Face Biometric Authentication</h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    user?.profile?.face_verified || user?.profile?.face_data
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {user?.profile?.face_verified || user?.profile?.face_data ? 'Verified & Configured' : 'Not Set'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Configure your MediaPipe AI face detection profile for 1-click biometric sign-in.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFaceScannerOpen(!isFaceScannerOpen)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Camera size={14} />
            <span>
              {isFaceScannerOpen
                ? 'Close Scanner'
                : user?.profile?.face_data
                ? 'Update Face Scan'
                : 'Scan & Setup Face'}
            </span>
          </button>
        </div>

        {/* MediaPipe Scanner Drawer */}
        {isFaceScannerOpen && (
          <div className="pt-4 border-t border-gray-100">
            <FaceDetectorInput onFaceCaptured={handleFaceSaved} />
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${draftSettings.twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication (2FA)</h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    draftSettings.twoFactorEnabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {draftSettings.twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Add an extra layer of security to your RuralNex account by requiring an authentication code upon login.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handle2FAToggleClick}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0 ${
              draftSettings.twoFactorEnabled
                ? 'text-red-700 bg-white border-red-200 hover:bg-red-50'
                : 'text-gray-900 bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {draftSettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Active Sessions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Devices currently signed into your RuralNex account.</p>
          </div>
          {sessions.length > 1 && (
            <button
              type="button"
              onClick={() => setIsRevokeSessionsModalOpen(true)}
              className="text-xs font-semibold text-primary hover:underline transition-colors cursor-pointer"
            >
              Log out of all other devices
            </button>
          )}
        </div>

        <div className="space-y-3 pt-1">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3.5 rounded-lg bg-gray-50/80 border border-gray-100">
              <div className="flex items-center gap-3">
                {session.iconType === 'mobile' ? (
                  <Smartphone size={18} className="text-gray-600 shrink-0" />
                ) : (
                  <Monitor size={18} className="text-gray-600 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{session.device}</span>
                    {session.isCurrent && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded">
                        Current Device
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-500">{session.lastActive}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-50/40 border border-red-200/70 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Delete Account</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Permanently delete your RuralNex account, assessments, and saved business preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Modals */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setToastMessage('Password changed successfully.');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      <Setup2FAModal
        isOpen={isSetup2FAModalOpen}
        onClose={() => setIsSetup2FAModalOpen(false)}
        onSuccess={() => {
          updateDraft('twoFactorEnabled', true);
          setToastMessage('Two-Factor Authentication enabled successfully.');
          setTimeout(() => setToastMessage(null), 4000);
        }}
        verifiedPhoneNumber={draftSettings.phoneNumber}
      />

      <Disable2FAModal
        isOpen={isDisable2FAModalOpen}
        onClose={() => setIsDisable2FAModalOpen(false)}
        onSuccess={() => {
          updateDraft('twoFactorEnabled', false);
          setToastMessage('Two-Factor Authentication disabled.');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      <RevokeSessionsModal
        isOpen={isRevokeSessionsModalOpen}
        onClose={() => setIsRevokeSessionsModalOpen(false)}
        onSuccess={() => {
          setSessions(prev => prev.filter(s => s.isCurrent));
          setToastMessage('Logged out of all other devices successfully.');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete RuralNex Account"
        description="Are you sure you want to delete your account? All saved business feasibility assessments, financial models, and profile data will be permanently removed. This action cannot be undone."
        confirmText="Delete Account"
        requireTypingText="DELETE"
        variant="danger"
      />
    </div>
  );
};
