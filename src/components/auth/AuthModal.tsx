import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Phone, Lock, User, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState(['4', '8', '2', '1', '9', '0']);
  const [selectedRole, setSelectedRole] = useState<UserRole>('entrepreneur');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setMode('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Authentication successful! Welcome to GramUdyog.');
    setTimeout(() => {
      onLoginSuccess(selectedRole);
      onClose();
      setSuccessMsg('');
      setMode('login');
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'Sign In to GramUdyog' : mode === 'register' ? 'Register New Entrepreneur Account' : 'Verify Mobile OTP'} maxWidth="md">
      {successMsg ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <div className="text-base font-bold text-slate-900">{successMsg}</div>
          <p className="text-xs text-slate-500">Redirecting to your personalized decision dashboard...</p>
        </div>
      ) : mode === 'otp' ? (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center">
            <ShieldCheck className="w-10 h-10 text-gov-800 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-900">Enter 6-Digit Verification Code</h4>
            <p className="text-xs text-slate-500 mt-1">Sent to +91 {phone} via SMS</p>
          </div>

          <div className="flex justify-center gap-2 py-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value;
                  setOtp(newOtp);
                }}
                className="w-10 h-11 text-center text-base font-bold border border-slate-300 rounded focus:border-gov-800 focus:ring-1 focus:ring-gov-800"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gov-800 hover:bg-gov-900 text-white font-semibold rounded text-xs shadow-sm transition-colors"
          >
            Verify & Continue
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs text-slate-500 hover:text-gov-800 underline"
            >
              Back to Mobile Number Entry
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select User Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'entrepreneur', label: 'Entrepreneur', icon: User },
                { id: 'analyst', label: 'Analyst', icon: Building },
                { id: 'admin', label: 'Nodal Officer', icon: ShieldCheck },
              ].map((r) => {
                const Icon = r.icon;
                const isSel = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id as UserRole)}
                    className={`flex flex-col items-center p-2 rounded border text-xs font-medium transition-colors ${
                      isSel
                        ? 'border-gov-800 bg-gov-50 text-gov-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (Aadhaar Linked)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="As per Aadhaar Card"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                    <option>Haryana</option>
                    <option>Punjab</option>
                    <option>Uttar Pradesh</option>
                    <option>Rajasthan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <select className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                    <option>Karnal</option>
                    <option>Ambala</option>
                    <option>Kurukshetra</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password / PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                defaultValue="123456"
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gov-800 hover:bg-gov-900 text-white font-semibold rounded text-xs shadow-sm transition-colors"
          >
            {mode === 'login' ? 'Send OTP & Sign In' : 'Register & Send OTP'}
          </button>

          <div className="text-center pt-2 border-t border-slate-200">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600">
                New to GramUdyog?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-gov-800 underline"
                >
                  Create Entrepreneur Profile
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-gov-800 underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
};
