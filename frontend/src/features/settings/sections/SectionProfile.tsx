import React, { useState, useEffect } from 'react';
import { useSettings } from '../SettingsContext';
import { useAuth } from '../../../context/AuthContext';
import { Camera, CheckCircle2, ShieldAlert, X, RefreshCw, KeyRound } from 'lucide-react';

const INDIAN_MOBILE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const compressAvatarImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = err => reject(err);
    };
    reader.onerror = err => reject(err);
  });
};

export const SectionProfile: React.FC = () => {
  const { draftSettings, updateDraft, setToastMessage } = useSettings();
  const { updateUser } = useAuth();
  
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setToastMessage('Processing avatar image...');
      const resizedDataUrl = await compressAvatarImage(file);

      // 1. Update Settings Context live
      updateDraft('avatarUrl', resizedDataUrl);

      // 2. Update Auth Context live for topbar/sidebar
      updateUser({
        profile: {
          avatar_url: resizedDataUrl,
        },
      });

      // 3. Patch Django Backend
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/v1/auth/profile/', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ avatar_url: resizedDataUrl }),
      });

      setToastMessage('Profile photo updated successfully.');
    } catch (err) {
      setToastMessage('Failed to process image file.');
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRemoveAvatar = async () => {
    updateDraft('avatarUrl', '');
    updateUser({
      profile: {
        avatar_url: '',
      },
    });

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/v1/auth/profile/', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ avatar_url: '' }),
      });
    } catch (e) {
      // fallback
    }

    setToastMessage('Profile photo removed.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const initials = draftSettings.fullName
    ? draftSettings.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TP';

  // Resend OTP 60-second countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const sendOtp = async () => {
    const rawPhone = draftSettings.phoneNumber.trim();
    if (!rawPhone) {
      setToastMessage('Please enter your mobile number first.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    if (!INDIAN_MOBILE_REGEX.test(rawPhone.replace(/\s+/g, ''))) {
      setToastMessage('Please enter a valid 10-digit Indian mobile number.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/auth/send-phone-otp/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ phone_number: rawPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpCode('');
        setIsVerifyingPhone(true);
        setResendCountdown(data.cooldown || 60);
        
        const notice = data.dev_otp
          ? `[DEV MOCK] OTP sent to ${rawPhone}. Code: ${data.dev_otp}`
          : `OTP SMS dispatched to ${rawPhone}.`;
        setToastMessage(notice);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setOtpError(data.detail || 'Failed to send OTP.');
        setIsVerifyingPhone(true);
      }
    } catch (err) {
      setOtpError('Network error while requesting OTP.');
      setIsVerifyingPhone(true);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/auth/verify-phone-otp/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone_number: draftSettings.phoneNumber,
          otp: otpCode
        })
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        updateDraft('phoneVerified', true);
        setIsVerifyingPhone(false);
        setOtpCode('');
        setOtpError('');
        setToastMessage('Phone number verified successfully!');
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setOtpError(data.detail || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setOtpError('Network error verifying code.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Profile</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 font-medium">Manage your personal information.</p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Top Profile Section: Avatar & Account Info */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 border-b border-gray-100 dark:border-zinc-800/80">
          <div className="relative shrink-0">
            {draftSettings.avatarUrl ? (
              <img
                src={draftSettings.avatarUrl}
                alt={draftSettings.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-extrabold text-2xl sm:text-3xl flex items-center justify-center border-2 border-primary/20 shadow-sm">
                {initials}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-gray-700 dark:text-zinc-200 hover:text-primary hover:border-primary shadow-md cursor-pointer transition-colors">
              <Camera size={15} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">{draftSettings.fullName || 'User'}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-medium">{draftSettings.email}</p>
            <div className="flex items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 cursor-pointer transition-colors">
                <Camera size={15} />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
              {draftSettings.avatarUrl && (
                <>
                  <span className="text-xs text-gray-300 dark:text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
                  >
                    Remove Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Fields */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">Full Name</label>
            <input
              type="text"
              value={draftSettings.fullName}
              onChange={e => updateDraft('fullName', e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-zinc-800 rounded-xl text-sm sm:text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-zinc-900/90 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-xs"
              placeholder="Tirth Patel"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">Email Address</label>
            <input
              type="email"
              value={draftSettings.email}
              readOnly
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/80 rounded-xl text-sm sm:text-base font-medium text-gray-600 dark:text-zinc-400 cursor-not-allowed outline-none"
            />
            <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5 block">Account primary email (Read-only)</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                Phone Number <span className="text-gray-400 dark:text-zinc-500 font-normal lowercase">(optional)</span>
              </label>
              <div className="flex items-center gap-1.5">
                {draftSettings.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" /> Verified
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" /> Not verified
                    </span>
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={isSendingOtp}
                      className="text-xs font-bold text-gray-900 dark:text-white hover:text-primary transition-colors cursor-pointer ml-1 disabled:opacity-50"
                    >
                      {isSendingOtp ? 'Sending...' : 'Verify'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center bg-white dark:bg-[#14151a] border border-gray-300 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
              <span className="px-4 py-2.5 sm:py-3 text-sm sm:text-base font-extrabold text-gray-700 dark:text-zinc-300 select-none border-r border-gray-300 dark:border-zinc-700/80 bg-gray-50 dark:bg-zinc-800/30 shrink-0 flex items-center">
                +91
              </span>
              <input
                type="text"
                value={draftSettings.phoneNumber.replace(/^(\+91[\s-]?)?/, '')}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  const formatted = digits ? `+91 ${digits}` : '';
                  updateDraft('phoneNumber', formatted);
                  if (draftSettings.phoneVerified) {
                    updateDraft('phoneVerified', false);
                  }
                }}
                placeholder="99791 37649"
                className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-gray-900 dark:text-white bg-transparent outline-none border-none focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-2">Account Type</label>
            <select
              value={draftSettings.accountType}
              onChange={e => updateDraft('accountType', e.target.value as any)}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-zinc-800 rounded-xl text-sm sm:text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-zinc-900/90 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-xs"
            >
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Student">Student</option>
              <option value="Advisor">Advisor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Phone OTP Verification Modal */}
      {isVerifyingPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                <KeyRound size={18} className="text-primary" />
                <span>Verify Mobile Number</span>
              </div>
              <button onClick={() => setIsVerifyingPhone(false)} className="text-gray-400 hover:text-gray-600 rounded-md p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-lg">
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                OTP sent to <span className="font-bold text-blue-950">{draftSettings.phoneNumber}</span>
              </p>
            </div>

            {otpError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg">
                {otpError}
              </p>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  autoFocus
                  className="w-full text-center tracking-[0.4em] text-xl font-mono font-bold px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={resendCountdown > 0 || isSendingOtp}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    resendCountdown > 0 || isSendingOtp
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-primary hover:underline cursor-pointer'
                  }`}
                >
                  <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                  {resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : 'Resend OTP'}
                </button>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVerifyingPhone(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg shadow-2xs"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

