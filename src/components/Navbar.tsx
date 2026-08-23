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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#020805]/90 border-b border-[#7CFF00]/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Area */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleLogoClick}>
            <NineJaPayLogo size="md" showText={true} />
            {user?.tier === 'PREMIUM' && (
              <span className="px-2 py-0.5 rounded-md bg-[#FFB800]/15 text-[#FFB800] text-[10px] font-extrabold border border-[#FFB800]/30 flex items-center gap-0.5 ml-1">
                <Crown className="w-2.5 h-2.5 fill-[#FFB800]" /> VIP
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-[#071A0C]/90 border border-[#7CFF00]/20 p-1.5 rounded-2xl">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'videos', label: 'Watch & Earn' },
                { id: 'quiz', label: 'Daily Quiz (+₦500)' },
                { id: 'socials', label: 'Click & Earn' },
                { id: 'referral', label: 'Referral (+₦10k)' },
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7CFF00] to-[#39E600] text-black font-extrabold shadow-md shadow-[#7CFF00]/25'
                        : 'text-[#A8B5AB] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center space-x-6 text-xs font-bold tracking-wider text-[#A8B5AB]">
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  soundManager.playClickSound();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-[#7CFF00] transition-colors uppercase"
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
                className="hover:text-[#7CFF00] transition-colors uppercase"
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
                className="hover:text-[#7CFF00] transition-colors uppercase"
              >
                EARNINGS
              </a>
            </nav>
          )}

          {/* User Controls / Auth Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {!user ? (
              /* Public / Guest Visitor Buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    onOpenAuth('login');
                  }}
                  className="hidden sm:flex px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#071A0C] hover:bg-[#063B16]/50 text-white text-xs sm:text-sm font-bold transition-all items-center gap-1.5 border border-[#7CFF00]/20"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#7CFF00]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    onOpenAuth('register');
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] hover:opacity-95 text-black text-xs sm:text-sm font-black shadow-lg shadow-[#7CFF00]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
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
                  className="cursor-pointer bg-[#071A0C] hover:bg-[#063B16]/40 border border-[#7CFF00]/20 hover:border-[#7CFF00]/40 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 transition-all shadow-sm group"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#39E600]/20 text-[#7CFF00] flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold text-[#A8B5AB] leading-none">Wallet</p>
                    <p className="text-xs sm:text-sm font-black text-[#FFB800] font-mono leading-tight mt-0.5">
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
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FFCC33] via-[#FFB800] to-[#D99100] text-black text-xs font-black shadow-md shadow-[#FFB800]/30 hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-black" />
                    <span>Upgrade VIP</span>
                  </button>
                )}

                {/* Admin Portal Shortcut for Admins */}
                {isUserAdmin && (
                  <button
                    onClick={() => {
                      soundManager.playClickSound();
                      onOpenAdmin();
                    }}
                    className="p-2 rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] transition-colors cursor-pointer"
                    title="Admin Management Portal"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}

                {/* User Profile Avatar with First Name Initial */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      soundManager.playClickSound();
                      setActiveTab('profile');
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#FFB800] via-[#FFD700] to-[#E6A100] border border-[#FFB800]/40 text-black font-black text-sm flex items-center justify-center hover:opacity-90 shadow-md shadow-amber-950/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title={`View Profile: ${user.fullName || user.username}`}
                  >
                    <span>{userInitial}</span>
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#071A0C] hover:bg-red-500/20 text-[#A8B5AB] hover:text-red-400 border border-[#7CFF00]/10 transition-colors"
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
                className="md:hidden p-2 rounded-xl bg-[#071A0C] border border-[#7CFF00]/20 text-gray-300 hover:text-white"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-[#7CFF00]" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-[#071A0C] border-b border-[#7CFF00]/20 px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          <div 
            onClick={() => {
              soundManager.playClickSound();
              setActiveTab('profile');
              setIsMenuOpen(false);
            }}
            className="p-3 rounded-2xl bg-[#020805] border border-[#7CFF00]/20 flex items-center justify-between mb-2 cursor-pointer hover:border-[#FFB800]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFB800] via-[#FFD700] to-[#E6A100] text-black font-black text-xs flex items-center justify-center shadow-sm">
                {userInitial}
              </div>
              <div>
                <p className="text-xs text-[#A8B5AB]">Signed in as</p>
                <p className="text-sm font-bold text-white">@{user.username}</p>
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              user.tier === 'PREMIUM' 
                ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40' 
                : 'bg-[#39E600]/15 text-[#7CFF00] border-[#7CFF00]/30'
            }`}>
              {user.tier} MEMBER
            </span>
          </div>

          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'profile', label: 'My Profile' },
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
                  ? 'bg-gradient-to-r from-[#7CFF00] to-[#39E600] text-black font-black'
                  : 'text-[#E8F0EA] hover:bg-white/5'
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
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/25 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFB800]" />
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
