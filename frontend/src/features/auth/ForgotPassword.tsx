import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { PasswordInput } from './components/PasswordInput';

const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/v1/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('OTP has been sent to your email.');
        setStep(2);
      } else {
        setError(data.detail || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/v1/auth/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        setResetToken(data.reset_token);
        setStep(3);
      } else {
        setError(data.detail || 'Invalid OTP.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/reset-password/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resetToken}`
        },
        body: JSON.stringify({ new_password: password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.detail || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Abstract Background Design */}
      <div className="absolute top-0 left-0 w-full h-96 bg-green-600 rounded-b-[40%] shadow-2xl opacity-10 blur-3xl transform -translate-y-32"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="RuralNex Logo" className="h-14 w-auto object-contain mb-2 drop-shadow-sm" />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">RuralNex</h1>
        </div>
        
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          {step === 1 && 'Reset your password'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'Create new password'}
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-gray-500">
          {step === 1 && "Enter your email and we'll send you an OTP to reset your password."}
          {step === 2 && `We sent a 6-digit code to ${email}`}
          {step === 3 && "Please choose a strong password."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px] z-10 relative">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-sm font-semibold">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-green-700 text-sm font-semibold">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <p>{success}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 text-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-2xl tracking-[0.5em] text-center font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                  placeholder="••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Code'}
              </button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-xs font-bold text-green-600 hover:text-green-700 transition"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <PasswordInput
                  id="new_password"
                  label="New Password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  showStrength={true}
                />
              </div>

              <div>
                <PasswordInput
                  id="confirm_password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
