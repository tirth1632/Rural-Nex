import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2,
  Leaf, 
  Lightbulb, 
  BarChart3, 
  Landmark, 
  Users, 
  Globe2, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import LanguageSelector from '../../components/LanguageSelector';
import { registerUser, loginUser, updateProfile } from '../../services/auth.service';
import type { AccountFormValues } from '../../schemas/registration.schema';
import type { ProfileFormValues } from '../../schemas/registration.schema';
import { RegistrationProgress } from './components/RegistrationProgress';
import { AccountStep } from './components/AccountStep';
import { ProfileStep } from './components/ProfileStep';



// ── Helper: parse DRF errors into field-keyed map ───────────────────────────
type DRFError = { status: number; data: Record<string, string[]> };

function parseDRFErrors(err: unknown): { fields: Record<string, string[]>; general: string } {
  if (!err || typeof err !== 'object') return { fields: {}, general: 'auth.register.err.server' };
  const e = err as DRFError;
  if (!e.data) return { fields: {}, general: 'auth.register.err.network' };
  const { detail, ...fields } = e.data as Record<string, string[]> & { detail?: string };
  return {
    fields: fields as Record<string, string[]>,
    general: detail ?? '',
  };
}

// ── Main component ──────────────────────────────────────────────────────────
const Register: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<AccountFormValues | null>(null);
  const [stepToken, setStepToken] = useState<string | null>(null); // access token after step 1
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  // Focus heading on step change for screen readers
  const headingRef = useRef<HTMLHeadingElement>(null);

  // ── Step 1 submit ─────────────────────────────────────────────────────────
  const handleAccountSubmit = async (data: AccountFormValues) => {
    setLoading(true);
    setServerErrors({});
    setGeneralError('');

    try {
      // 1. Register user
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
      });

      // 2. Immediately auto-login to get tokens for step 2
      const tokens = await loginUser(data.username, data.password);
      setStepToken(tokens.access);

      // Store refresh token now; access token only after step 2 completes
      localStorage.setItem('refresh_token', tokens.refresh);

      // 3. Save step 1 data and advance
      setStep1Data(data);
      setStep(2);
      setTimeout(() => headingRef.current?.focus(), 50);
    } catch (err) {
      const { fields, general } = parseDRFErrors(err);
      setServerErrors(fields);
      if (general) setGeneralError(general.includes('.') ? t(general) : general);
      else if (Object.keys(fields).length === 0) setGeneralError(t('auth.register.err.network'));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 submit ─────────────────────────────────────────────────────────
  const handleProfileSubmit = async (data: ProfileFormValues) => {
    if (!stepToken || !step1Data) return;

    setLoading(true);
    setGeneralError('');

    try {
      // PATCH profile with token from post-registration auto-login
      await updateProfile(
        {
          preferred_language: data.preferred_language,
          entrepreneur_type: data.entrepreneur_type,
          experience: data.experience,
          own_capital: data.own_capital ?? null,
          business_interest: data.business_interest || undefined,
          default_state: data.default_state,
          default_district: data.default_district,
          default_block: data.default_block,
          default_village: data.default_village,
        },
        stepToken
      );

      // Now fully log in — store the access token and trigger auth context
      setSuccess(true);

      // Re-login to get a fresh set of tokens (profile language may affect UX)
      const freshTokens = await loginUser(step1Data.username, step1Data.password);
      login(freshTokens.access, freshTokens.refresh);

      // Navigate after brief success moment
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      const { general } = parseDRFErrors(err);
      setGeneralError(general || t('auth.register.err.server'));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setGeneralError('');
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
          setGeneralError(data.detail || 'Google authentication failed.');
        }
      } catch (err) {
        setGeneralError('Network connection error. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setGeneralError('Google login failed.'),
  });

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.register.success.title')}</h1>
          <p className="text-gray-500">{t('auth.register.success.subtitle')}</p>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
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

      {/* RIGHT PANEL - REGISTRATION FORM */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col relative bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] z-20 overflow-y-auto">
        
        {/* Top Bar - Language */}
        <div className="absolute top-6 right-6 xl:right-8">
          <LanguageSelector />
        </div>

        {/* Main Form Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 xl:px-24 py-10 w-full max-w-[540px] mx-auto min-h-screen">
        
          {/* Form Logo */}
          <div className="flex flex-col items-center mb-6 pt-8">
            <div className="bg-green-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md mb-2.5">
              <Leaf size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">RuralNex</h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">Empowering Rural Dreams</p>
          </div>

          {/* Progress indicator */}
          <RegistrationProgress currentStep={step} />

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 sm:px-8 mt-4">

            {/* Step heading */}
            <div className="mb-6">
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-bold text-gray-900 outline-none"
              >
                {step === 1 ? t('auth.register.step1.title') : t('auth.register.step2.title')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 ? t('auth.register.step1.subtitle') : t('auth.register.step2.subtitle')}
              </p>
            </div>

            {/* General server error */}
            {generalError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span className="shrink-0">⚠</span>
                <span>{generalError}</span>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <AccountStep
                onSuccess={handleAccountSubmit}
                serverErrors={serverErrors}
                isLoading={loading}
              />
            )}

            {/* Step 2 */}
            {step === 2 && (
              <ProfileStep
                onSuccess={handleProfileSubmit}
                onBack={() => {
                  setStep(1);
                  setGeneralError('');
                  setTimeout(() => headingRef.current?.focus(), 50);
                }}
                isLoading={loading}
                serverError={generalError}
              />
            )}
          </div>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-100"></div>
            <span className="px-3 text-[10px] font-bold text-gray-400 tracking-widest uppercase">Or</span>
            <div className="flex-grow h-px bg-gray-100"></div>
          </div>

          {/* Social Buttons */}
          <div className="mb-2">
            <button 
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm font-semibold text-gray-700 text-sm"
            >
              <GoogleIcon /> Continue with Google
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-bold text-green-600 hover:text-green-700 transition">
              Already have an account? Sign in
            </Link>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-gray-400 pb-8">
            By creating an account, you acknowledge that this is a financial advisory tool.
            Loan approvals are subject to lender decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
