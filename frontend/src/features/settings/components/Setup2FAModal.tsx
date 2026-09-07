import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Smartphone, QrCode, RefreshCw } from 'lucide-react';
import { authService, type Setup2FAResponse } from '../../../services/authService';

interface Setup2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  verifiedPhoneNumber?: string;
}

export const Setup2FAModal: React.FC<Setup2FAModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  verifiedPhoneNumber,
}) => {
  const [method, setMethod] = useState<'totp' | 'sms'>('totp');
  const [step, setStep] = useState<1 | 2>(1);
  const [setupData, setSetupData] = useState<Setup2FAResponse | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleStartSetup = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authService.setup2FA(method, verifiedPhoneNumber);
      setSetupData(res);
      setStep(2);
      if (method === 'sms') {
        setCountdown(res.cooldown || 60);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to initialize 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendSMS = async () => {
    if (countdown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await authService.setup2FA('sms', verifiedPhoneNumber);
      setCountdown(res.cooldown || 60);
    } catch (e: any) {
      setError(e.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await authService.verify2FA(method, code, verifiedPhoneNumber);
    setLoading(false);

    if (res.success) {
      setCode('');
      onSuccess();
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="text-primary" size={20} />
            <h3 className="text-base font-semibold text-gray-900">Enable Two-Factor Authentication</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Select Method */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Choose Authentication Method:
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('totp')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                    method === 'totp'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <QrCode size={22} className={method === 'totp' ? 'text-primary' : 'text-gray-500'} />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">Authenticator App</span>
                    <span className="text-xs text-gray-500 block mt-0.5 leading-relaxed">
                      Use Google Authenticator, Authy, or Microsoft Authenticator to scan a QR code.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('sms')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
                    method === 'sms'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Smartphone size={22} className={method === 'sms' ? 'text-primary' : 'text-gray-500'} />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">SMS Verification</span>
                    <span className="text-xs text-gray-500 block mt-0.5 leading-relaxed">
                      Receive a 6-digit OTP code on your verified mobile number ({verifiedPhoneNumber || '+91 9979137649'}).
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

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
                onClick={handleStartSetup}
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg shadow-2xs transition-colors"
              >
                {loading ? 'Initializing...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verification Flow */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {method === 'totp' ? (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl inline-block mx-auto">
                  <img
                    src={setupData?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=RuralNex'}
                    alt="Authenticator QR Code"
                    className="w-40 h-40 object-contain mx-auto rounded"
                  />
                </div>
                <div className="text-left space-y-1 bg-blue-50/70 border border-blue-200/70 p-3 rounded-lg">
                  <span className="text-[11px] font-semibold text-blue-900 block">Secret Key (Manual Entry):</span>
                  <code className="text-xs font-mono font-bold text-primary tracking-wider select-all block">
                    {setupData?.secret || 'JBSWY3DPEHPK3PXP'}
                  </code>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-lg">
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  OTP sent to <span className="font-bold">{verifiedPhoneNumber || '+91 9979137649'}</span> via SMS.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Enter 6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                autoFocus
                className="w-full text-center tracking-[0.4em] text-xl font-mono font-bold px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {method === 'sms' ? (
                <button
                  type="button"
                  onClick={handleResendSMS}
                  disabled={countdown > 0 || loading}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    countdown > 0 || loading ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:underline cursor-pointer'
                  }`}
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  {countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  ← Change Method
                </button>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-2xs ${
                    code.length === 6 && !loading ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
