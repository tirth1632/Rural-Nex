import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Leaf, 
  Lightbulb, 
  BarChart3, 
  Landmark, 
  Users, 
  Globe2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2,
  ChevronDown,
  Sparkles,
  UserCheck,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import LanguageSelector from '../../components/LanguageSelector';
import { FaceDetectorInput } from './components/FaceDetectorInput';
import { faceLogin, type FaceAccountChoice } from '../../services/auth.service';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [accountChoices, setAccountChoices] = useState<FaceAccountChoice[] | null>(null);
  const [capturedFaceImage, setCapturedFaceImage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleFaceLogin = async (capturedDataUrl: string, selectedUserId?: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await faceLogin(capturedDataUrl, undefined, selectedUserId);
      if (data.multiple_accounts && data.accounts && data.accounts.length > 0) {
        setAccountChoices(data.accounts);
        setCapturedFaceImage(capturedDataUrl);
        return;
      }
      if (data.access && data.refresh) {
        login(data.access, data.refresh);
        setAccountChoices(null);
        setCapturedFaceImage(null);
        navigate('/');
      } else {
        setError(data.detail || 'Face login verification failed.');
      }
    } catch (err: any) {
      setError(err?.data?.detail || err?.data?.message || 'Face login verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('rn_remembered_user');
    if (saved) { setUsername(saved); setRememberMe(true); }
  }, []);

  const validate = () => {
    const e: { username?: string; password?: string } = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password) e.password = 'Password is required';
    setFieldErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (rememberMe) localStorage.setItem('rn_remembered_user', username);
        else localStorage.removeItem('rn_remembered_user');
        login(data.access, data.refresh);
        navigate('/');
      } else {
        setError(data.detail || 'Invalid credentials. Please verify your username and password.');
      }
    } catch {
      setError('Network connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/v1/auth/google/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (res.ok) {
          login(data.access, data.refresh);
          navigate('/');
        } else {
          setError(data.detail || 'Google authentication failed.');
        }
      } catch (err) {
        setError('Network connection error. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google login failed.'),
  });

  // SVG components for Social Buttons to avoid extra dependencies
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex w-full font-sans bg-gray-50">
      
      {/* LEFT PANEL - MARKETING (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col justify-between overflow-hidden bg-green-50">
        
        {/* Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center blur-[3px] scale-105"
          style={{ backgroundImage: 'url("/bg-farm.jpg")' }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white via-white/80 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/3 z-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Top Section */}
        <div className="relative z-10 px-10 xl:px-16 pt-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="bg-green-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-lg">
              <Leaf size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">RuralNex</h1>
              <p className="text-[11px] font-semibold text-gray-500 tracking-wide mt-0.5 uppercase">Empowering Rural Dreams</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <h2 className="text-2xl xl:text-3xl font-black text-gray-900 leading-tight">
              Smarter Ideas.<br/>
              Stronger Villages.<br/>
              <span className="text-green-600">Brighter Tomorrow.</span>
            </h2>
            <p className="mt-3 text-gray-600 font-medium text-sm max-w-sm leading-relaxed">
              AI-powered business advisory, market insights and loan assistance for rural and semi-urban entrepreneurs.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1.5 rounded-full text-green-700 mt-0.5 shadow-sm">
                <Lightbulb size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">AI Business Ideas</h3>
                <p className="text-gray-600 text-xs font-medium">Get personalized, location-based<br/>business recommendations</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1.5 rounded-full text-green-700 mt-0.5 shadow-sm">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Market Insights</h3>
                <p className="text-gray-600 text-xs font-medium">Analyze demand, competition<br/>and profitability</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1.5 rounded-full text-green-700 mt-0.5 shadow-sm">
                <Landmark size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Loan Assistance</h3>
                <p className="text-gray-600 text-xs font-medium">Discover government schemes<br/>and easy financing options</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1.5 rounded-full text-green-700 mt-0.5 shadow-sm">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Expert Guidance</h3>
                <p className="text-gray-600 text-xs font-medium">Connect with mentors and experts</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1.5 rounded-full text-green-700 mt-0.5 shadow-sm">
                <Globe2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Available in Multiple Languages</h3>
                <p className="text-gray-600 text-xs font-medium">Built for every Indian, in every region</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quote */}
        <div className="absolute right-8 top-[55%] mt-10 z-10 transform -rotate-6">
          <p className="font-serif italic text-lg xl:text-xl text-gray-800 leading-snug drop-shadow-md">
            Rural<br/>
            Entrepreneurs<br/>
            Rural India<br/>
            <span className="font-bold border-b-2 border-gray-800 pb-0.5">Stronger India</span>
          </p>
        </div>

        {/* Footer Stats */}
        <div className="relative z-10 px-10 xl:px-16 pb-10 w-full">
          <div className="mb-5">
            <p className="italic font-serif text-lg text-white drop-shadow-lg font-medium">
              "Viksit Bharat begins with<br/>Viksit Gaon."
            </p>
            <div className="h-1 w-10 bg-green-500 mt-2"></div>
          </div>

          <div className="flex items-center gap-6 xl:gap-8 text-white drop-shadow-md border-t border-white/20 pt-4">
            <div>
              <p className="text-xl font-black">10K+</p>
              <p className="text-[9px] font-semibold opacity-90 uppercase tracking-widest mt-0.5">Rural Entrepreneurs</p>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div>
              <p className="text-xl font-black">500+</p>
              <p className="text-[9px] font-semibold opacity-90 uppercase tracking-widest mt-0.5">Villages Covered</p>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div>
              <p className="text-xl font-black">95%</p>
              <p className="text-[9px] font-semibold opacity-90 uppercase tracking-widest mt-0.5">User Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col relative bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] z-20">
        
        {/* Top Bar - Language */}
        <div className="absolute top-6 right-6 xl:right-8">
          <LanguageSelector />
        </div>

        {/* Main Form Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 xl:px-24 py-10 max-w-[480px] w-full mx-auto">
          
          {/* Form Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-green-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md mb-2.5">
              <Leaf size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">RuralNex</h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">Empowering Rural Dreams</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-1.5 text-sm font-medium">Sign in to continue your journey with RuralNex</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-xs font-semibold">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5" htmlFor="username">
                Username / Email / Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="off"
                  className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border ${fieldErrors.username ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'} rounded-lg text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all`}
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) setFieldErrors(p => ({ ...p, username: undefined }));
                  }}
                />
              </div>
              {fieldErrors.username && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border ${fieldErrors.password ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200'} rounded-lg text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all tracking-wide`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }));
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.password}</p>}
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer" 
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span className="text-xs font-semibold text-gray-600 select-none">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-green-600 hover:text-green-700 transition">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>

            {/* Face Login Option directly below Sign In button */}
            <button
              type="button"
              onClick={() => {
                const nextState = !showFaceScanner;
                setShowFaceScanner(nextState);
                setError('');
                if (nextState) {
                  // Reset form fields so face login operates purely on biometric scan
                  setUsername('');
                  setPassword('');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 rounded-lg transition shadow-sm font-bold text-sm mt-3"
            >
              <Sparkles size={16} className="text-emerald-600" />
              <span>{showFaceScanner ? 'Close Face Scanner' : 'Sign in with Face AI (MediaPipe)'}</span>
            </button>

            {/* MediaPipe Face Scanner Drawer */}
            {showFaceScanner && (
              <div className="mt-3">
                <FaceDetectorInput
                  autoStart={true}
                  onFaceCaptured={handleFaceLogin}
                />
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-100"></div>
            <span className="px-3 text-[10px] font-bold text-gray-400 tracking-widest uppercase">Or Continue With</span>
            <div className="flex-grow h-px bg-gray-100"></div>
          </div>

          {/* Social Buttons */}
          <div className="mb-6">
            <button 
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm font-semibold text-gray-700 text-sm"
            >
              <GoogleIcon /> Continue with Google
            </button>
          </div>

          {/* Create Account */}
          <Link to="/register" className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg border-2 border-green-600 text-green-700 font-bold text-sm hover:bg-green-50 transition bg-white mt-4">
            Create a New Account
          </Link>
          
        </div>

      </div>

      {/* Account Selection Modal if multiple accounts match face scan */}
      {accountChoices && accountChoices.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">Select Account</h3>
                  <p className="text-xs text-gray-500 font-medium">Multiple matching accounts found</p>
                </div>
              </div>
              <button 
                onClick={() => { setAccountChoices(null); setCapturedFaceImage(null); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 font-medium">
              This face scan matches multiple accounts. Which account would you like to sign into?
            </p>

            {/* Candidate Account list */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {accountChoices.map((acc) => (
                <button
                  key={acc.id}
                  disabled={loading}
                  onClick={() => capturedFaceImage && handleFaceLogin(capturedFaceImage, acc.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group text-left shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                      {acc.name ? acc.name.charAt(0).toUpperCase() : acc.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition">{acc.name}</h4>
                      <p className="text-xs text-gray-500">@{acc.username} {acc.email ? `• ${acc.email}` : ''}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                    {acc.role ? acc.role.toUpperCase() : 'USER'}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => { setAccountChoices(null); setCapturedFaceImage(null); }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
