import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Gift, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Eye, 
  EyeOff, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { NineJaPayLogo } from './NineJaPayLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: UserProfile) => void;
  prefilledRef?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onLoginSuccess,
  prefilledRef = '',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'welcome_success'>('register');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [referralCode, setReferralCode] = useState(prefilledRef);
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (prefilledRef) setReferralCode(prefilledRef);
  }, [prefilledRef]);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please enter your first and last name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg('Please create a password with at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please check and try again.');
      return;
    }

    if (!agreed) {
      setErrorMsg('Please accept 9jaPay Terms of Service and Privacy Policy to continue.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const autoUsername = (username.trim() || firstName.trim().toLowerCase() + Math.floor(100 + Math.random() * 900)).replace(/[^a-zA-Z0-9_]/g, '');

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username: autoUsername.toLowerCase(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password.trim(),
          referralCode: referralCode ? referralCode.trim().toUpperCase() : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setCreatedUser(data.user);
      setMode('welcome_success');
      soundManager.playSuccessSound();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !username.trim()) {
      setErrorMsg('Please enter your registered email or username.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: (email || username).trim(),
          password: password.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Account not found. Please check your credentials or create a new account.');
      }

      if (data.isAdmin || data.user.username === 'admin' || data.user.email === 'admin@9japay.com.ng') {
        localStorage.setItem('9japay_admin_token', '9ja-admin-authenticated-token');
      }

      soundManager.playSuccessSound();
      onLoginSuccess(data.user);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 rounded-[28px] bg-[#0C0A10] border border-purple-900/30 p-6 sm:p-9 shadow-2xl overflow-hidden text-white">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-purple-600/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        {mode !== 'welcome_success' && (
          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Welcome Success State */}
        {mode === 'welcome_success' && createdUser ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-amber-400 to-emerald-400 p-[2px] mx-auto shadow-xl shadow-purple-950/50 animate-bounce">
              <div className="w-full h-full bg-[#0E111B] rounded-[14px] flex items-center justify-center text-amber-400">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Account Created Successfully
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-serif-title mt-2">
                Welcome to 9jaPay, {createdUser.fullName.split(' ')[0]}!
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                Your account is ready. Complete simple watch & click tasks and earn daily cash.
              </p>
            </div>

            <button
              onClick={() => {
                soundManager.playSuccessSound();
                onLoginSuccess(createdUser);
                onClose();
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 mt-4"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Form Content: Register or Login */
          <div>
            {/* Top Logo Badge Container */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative w-16 h-16 rounded-2xl p-[1px] bg-gradient-to-tr from-purple-600/60 via-amber-500/40 to-indigo-600/60 shadow-lg shadow-purple-950/40 mb-3 flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#1E162B] to-[#120E1A] flex items-center justify-center p-2">
                  <NineJaPayLogo size="md" showText={false} />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white font-serif-title tracking-tight">
                {mode === 'register' ? 'Create Account' : 'Welcome Back'}
              </h2>

              <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
                {mode === 'register' ? 'Start earning in minutes — completely free.' : 'Sign in to access your wallet & daily tasks.'}
              </p>

              {mode === 'register' && (
                <div className="mt-3.5">
                  <span className="px-3.5 py-1 rounded-full bg-[#18150E] border border-[#7A5E1C]/60 text-[#F5C744] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C744]" />
                    REGISTRATION IS 100% FREE
                  </span>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            {mode === 'register' ? (
              /* REGISTER FORM MATCHING SCREENSHOT 1 */
              <form onSubmit={handleRegister} className="space-y-3.5">
                
                {/* 2-Column Name Row: FIRST NAME & LAST NAME */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      FIRST NAME
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      LAST NAME
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* EMAIL ADDRESS */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                    />
                  </div>
                </div>

                {/* PHONE NUMBER */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    PHONE NUMBER
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="+1 000 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Referral Code (Optional if prefilled) */}
                {referralCode && (
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1">
                      INVITED BY REFERRER
                    </label>
                    <div className="relative">
                      <Gift className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Terms and Privacy Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-[#131118] border-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none">
                    I agree to 9jaPay's <strong className="text-[#F5C744] font-semibold hover:underline">Terms of Service</strong> and <strong className="text-[#F5C744] font-semibold hover:underline">Privacy Policy</strong>. I understand that registration is free with no hidden charges.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#D97706] hover:from-[#6D28D9] hover:to-[#B45309] text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-purple-950/60 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create Free Account'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-400">
                    Already a member?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClickSound();
                        setMode('login');
                        setErrorMsg('');
                      }}
                      className="font-bold text-[#F5C744] hover:underline ml-1"
                    >
                      Sign In →
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    EMAIL OR USERNAME
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="john@example.com or username"
                      value={email || username}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setUsername(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#131118] border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs sm:text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-purple-950/60 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign In to Account'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClickSound();
                        setMode('register');
                        setErrorMsg('');
                      }}
                      className="font-bold text-[#F5C744] hover:underline ml-1"
                    >
                      Create Free Account →
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
