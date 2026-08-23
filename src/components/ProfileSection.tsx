import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  ChevronLeft, 
  Pencil, 
  Clock, 
  Save, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Crown,
  ShieldCheck,
  User
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { supabaseDb } from '../lib/supabaseDb';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface ProfileSectionProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onBack: () => void;
  onOpenUpgrade: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  onUpdateUser,
  onBack,
  onOpenUpgrade,
}) => {
  // Parse First & Last Name
  const nameParts = (user.fullName || user.username || '').trim().split(' ');
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(user.phone || '+234');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status & loading
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [detailsFeedback, setDetailsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Avatar initial
  const displayInitial = (firstName.trim() ? firstName.trim().charAt(0) : user.username.charAt(0)).toUpperCase();
  const fullDisplayName = `${firstName} ${lastName}`.trim() || user.username;

  // Format joined date
  const memberDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'August 23, 2026';

  // Save profile details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setDetailsFeedback({ type: 'error', message: 'First name is required.' });
      return;
    }

    setIsSavingDetails(true);
    soundManager.playClickSound();

    const updatedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const updatedUser: UserProfile = {
      ...user,
      fullName: updatedFullName,
      phone: phone.trim()
    };

    try {
      await supabaseDb.updateProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim()
      });
      
      onUpdateUser(updatedUser);
      soundManager.speakProfileUpdated();
      setDetailsFeedback({ type: 'success', message: 'Profile details saved successfully!' });
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => setDetailsFeedback(null), 4000);
    } catch {
      onUpdateUser(updatedUser);
      setDetailsFeedback({ type: 'success', message: 'Profile details saved locally!' });
      setTimeout(() => setDetailsFeedback(null), 4000);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Passwords do not match. Please check and try again.' });
      return;
    }

    setIsUpdatingPassword(true);
    soundManager.playClickSound();

    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
      }
      
      soundManager.playSuccessSound();
      setPasswordFeedback({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setPasswordFeedback({ type: 'error', message: msg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 text-white">
      
      {/* Top Header Bar with Back Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playClickSound();
            onBack();
          }}
          className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl sm:text-2xl font-black font-display flex items-center gap-1.5">
          <span className="text-white">My</span>
          <span className="text-[#FFB800]">Profile</span>
        </h1>
      </div>

      {/* Main Center Avatar & User Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0E0C15] border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 w-64 h-64 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Big Avatar with gold gradient & pencil icon */}
        <div className="relative mb-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#FFB800] via-[#FFD700] to-[#E6A100] border-4 border-[#FFB800]/40 flex items-center justify-center shadow-xl shadow-amber-950/50">
            <span className="text-4xl sm:text-5xl font-black text-black select-none">
              {displayInitial}
            </span>
          </div>

          {/* Yellow Pencil Edit Badge */}
          <div className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-[#FFB800] border-2 border-[#0E0C15] flex items-center justify-center text-black shadow-md">
            <Pencil className="w-3.5 h-3.5 fill-black" />
          </div>
        </div>

        {/* Full Name & Email */}
        <h2 className="text-xl sm:text-2xl font-black text-white font-display">
          {fullDisplayName}
        </h2>
        <p className="text-xs sm:text-sm text-[#A8B5AB] mt-0.5">
          {user.email || `${user.username}@9japay.com.ng`}
        </p>

        {/* Plan Status Pill */}
        <div className="mt-3">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border ${
            user.tier === 'PREMIUM'
              ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30 shadow-sm'
              : 'bg-white/5 text-gray-300 border-white/10'
          }`}>
            {user.tier === 'PREMIUM' ? (
              <>
                <Crown className="w-3.5 h-3.5 fill-[#FFB800]" />
                <span>VIP PREMIUM</span>
              </>
            ) : (
              <span>FREE PLAN</span>
            )}
          </span>
        </div>
      </div>

      {/* 1. EDIT DETAILS CARD */}
      <form onSubmit={handleSaveDetails} className="space-y-4">
        <div className="rounded-3xl p-6 sm:p-7 bg-[#0E0C15] border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFB800]">
            <Pencil className="w-4 h-4 text-[#FFB800]" />
            <span>EDIT DETAILS</span>
          </div>

          <div className="space-y-4">
            {/* FIRST NAME */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                FIRST NAME
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full px-4 py-3 rounded-2xl bg-[#171422] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#FFB800] transition-colors"
                required
              />
            </div>

            {/* LAST NAME */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                LAST NAME
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full px-4 py-3 rounded-2xl bg-[#171422] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#FFB800] transition-colors"
              />
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                PHONE NUMBER
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
                className="w-full px-4 py-3 rounded-2xl bg-[#171422] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#FFB800] transition-colors"
              />
            </div>

            {/* EMAIL ADDRESS */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={user.email || `${user.username}@9japay.com.ng`}
                disabled
                className="w-full px-4 py-3 rounded-2xl bg-[#171422]/60 border border-white/5 text-gray-400 font-medium text-sm cursor-not-allowed select-all"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Email cannot be changed. Contact support to update.
              </p>
            </div>
          </div>
        </div>

        {/* 2. ACCOUNT INFO CARD */}
        <div className="rounded-3xl p-6 sm:p-7 bg-[#0E0C15] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFB800]">
            <Clock className="w-4 h-4 text-[#FFB800]" />
            <span>ACCOUNT INFO</span>
          </div>

          <div className="divide-y divide-white/5 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-gray-400">Member Since</span>
              <span className="font-bold text-white">{memberDate}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-gray-400">Plan</span>
              <span className="font-bold text-white">
                {user.tier === 'PREMIUM' ? 'VIP Premium' : 'Free'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-gray-400">Referral Code</span>
              <span className="font-black font-mono text-[#FFB800] select-all">
                {user.referralCode || `KLP-${user.username.toUpperCase()}`}
              </span>
            </div>
          </div>
        </div>

        {detailsFeedback && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            detailsFeedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {detailsFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{detailsFeedback.message}</span>
          </div>
        )}

        {/* Big Yellow Save Changes Button */}
        <button
          type="submit"
          disabled={isSavingDetails}
          className="w-full py-4 rounded-2xl bg-[#FFB800] hover:bg-[#FFA500] active:scale-[0.99] text-black font-black text-sm sm:text-base shadow-xl shadow-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 fill-black" />
          <span>{isSavingDetails ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </form>

      {/* 3. CHANGE PASSWORD CARD */}
      <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
        <div className="rounded-3xl p-6 sm:p-7 bg-[#0E0C15] border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFB800]">
            <Lock className="w-4 h-4 text-[#FFB800]" />
            <span>CHANGE PASSWORD</span>
          </div>

          <div className="space-y-4">
            {/* CURRENT PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                CURRENT PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-[#171422] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#FFB800] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-2xl bg-[#171422] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#FFB800] transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CONFIRM NEW PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                CONFIRM NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 rounded-2xl bg-[#171422] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#FFB800] transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Use at least 6 characters. You'll use this to log in next time.
              </p>
            </div>
          </div>
        </div>

        {passwordFeedback && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            passwordFeedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {passwordFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passwordFeedback.message}</span>
          </div>
        )}

        {/* Purple Update Password Button */}
        <button
          type="submit"
          disabled={isUpdatingPassword}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-xl shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
        </button>
      </form>
    </div>
  );
};
