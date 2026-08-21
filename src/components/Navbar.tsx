import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Sparkles, 
  Crown, 
  ArrowUpRight, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Zap, 
  Landmark, 
  Wallet,
  LogIn,
  UserPlus
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { NineJaPayLogo } from './NineJaPayLogo';
import appLogo from '../assets/images/9japay_logo_1787151742060.jpg';

interface NavbarProps {
  user: UserProfile | null;
  onOpenUpgrade: () => void;
  onOpenWithdraw: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenUpgrade,
  onOpenWithdraw,
  onOpenAdmin,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Hidden admin shortcut: 5 clicks on logo opens admin modal
  const handleLogoClick = () => {
    soundManager.playClickSound();
    if (user) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('landing');
    }

    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 5) {
      onOpenAdmin();
      setLogoClickCount(0);
    }
  };

  // Keyboard shortcut for admin: Alt+A or Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        onOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdmin]);

  const isUserAdmin = user?.username === 'admin' || user?.email === 'admin@9japay.com.ng' || user?.upgradeStatus === 'APPROVED' && user?.id === 'admin-root';

  const userInitial = user 
    ? (user.fullName?.trim() ? user.fullName.trim().charAt(0) : user.username.charAt(0)).toUpperCase() 
    : '9';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#070509]/90 border-b border-purple-900/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoClick}>
            <NineJaPayLogo size="md" showText={false} />

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  9ja<span className="text-amber-400">Pay</span>
                </span>
                {user?.tier === 'PREMIUM' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5 fill-amber-300" /> VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-[#120E1A]/80 border border-purple-900/30 p-1 rounded-2xl">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'videos', label: 'Watch & Earn' },
                { id: 'quiz', label: 'Daily Quiz (+₦500)' },
                { id: 'socials', label: 'Click & Earn' },
                { id: 'referral', label: 'Refer (₦1.5k)' },
                { id: 'history', label: 'Transactions' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundManager.playClickSound();
                      setActiveTab(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center space-x-6 text-xs font-bold tracking-wider text-gray-300">
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  soundManager.playClickSound();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors uppercase"
              >
                FEATURES
              </a>
              <a 
                href="#how-it-works" 
                onClick={(e) => {
                  e.preventDefault();
                  soundManager.playClickSound();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors uppercase"
              >
                HOW IT WORKS
              </a>
              <a 
                href="#earnings" 
                onClick={(e) => {
                  e.preventDefault();
                  soundManager.playClickSound();
                  document.getElementById('earnings')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors uppercase"
              >
                EARNINGS
              </a>
            </nav>
          )}

          {/* User Controls / Auth Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {!user ? (
              /* Public / Guest Visitor Buttons matching Screenshot 2 */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    onOpenAuth('login');
                  }}
                  className="hidden sm:flex px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-bold transition-all items-center gap-1.5 border border-white/10"
                >
                  <LogIn className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    onOpenAuth('register');
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-950/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>START EARNING</span>
                </button>
              </div>
            ) : (
              /* Logged In User Pill */
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Balance Pill */}
                <div 
                  onClick={() => {
                    soundManager.playClickSound();
                    onOpenWithdraw();
                  }}
                  className="cursor-pointer bg-[#120E1A] hover:bg-[#1A1424] border border-purple-900/40 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 transition-all shadow-sm group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold text-gray-400 leading-none">Wallet</p>
                    <p className="text-xs sm:text-sm font-black text-white font-mono leading-tight mt-0.5">
                      ₦{Math.floor(user.walletBalance).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Upgrade VIP button for Free Users */}
                {user.tier !== 'PREMIUM' && (
                  <button
                    onClick={() => {
                      soundManager.playClickSound();
                      onOpenUpgrade();
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black shadow-md shadow-amber-950/40 hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade VIP</span>
                  </button>
                )}

                {/* User Menu / Admin Link if Admin */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      soundManager.playClickSound();
                      if (isUserAdmin) onOpenAdmin();
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-purple-800 via-indigo-700 to-amber-500 border border-purple-500/40 text-white font-black text-sm flex items-center justify-center hover:opacity-90 shadow-md transition-all"
                    title={`@${user.username} (${user.fullName})`}
                  >
                    {isUserAdmin ? (
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/5 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            {user && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-[#120E1A] border border-purple-900/30 text-gray-300 hover:text-white"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-[#0F0B17] border-b border-purple-900/30 px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-sm">
                {userInitial}
              </div>
              <div>
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-bold text-white">@{user.username}</p>
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              user.tier === 'PREMIUM' 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-purple-900/40 text-purple-300 border-purple-500/30'
            }`}>
              {user.tier} MEMBER
            </span>
          </div>

          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'videos', label: 'Watch & Earn Videos' },
            { id: 'quiz', label: 'Daily Quiz Challenge' },
            { id: 'socials', label: 'Click & Earn Socials' },
            { id: 'referral', label: 'Refer & Earn' },
            { id: 'history', label: 'Transaction History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClickSound();
                setActiveTab(tab.id);
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {isUserAdmin && (
            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenAdmin();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </button>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onLogout();
              }}
              className="w-full py-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
