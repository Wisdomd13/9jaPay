import React, { useState, useEffect } from 'react';
import { UserProfile, ReferralLeaderboardEntry } from '../types';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Gift, 
  Crown, 
  ArrowUpRight,
  UserCheck,
  Trophy,
  Medal,
  Lock,
  Unlock,
  TrendingUp,
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface ReferralSectionProps {
  user: UserProfile;
  onOpenUpgrade: () => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({
  user,
  onOpenUpgrade,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<ReferralLeaderboardEntry | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [activeView, setActiveView] = useState<'invite' | 'leaderboard'>('invite');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://9japay.com.ng';
  const referralLink = `${origin}/register.php?ref=${user.username}`;

  // Fetch Referral Leaderboard
  const fetchLeaderboard = async () => {
    try {
      setIsLoadingLeaderboard(true);
      const res = await fetch(`/api/leaderboard/referrals?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setCurrentUserRank(data.currentUser || null);
      }
    } catch (err) {
      console.error('Failed to load referral leaderboard', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user.id, user.referralsCount, user.tier]);

  const handleCopyLink = () => {
    soundManager.playClickSound();
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    soundManager.playClickSound();
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join 9jaPay — Earn Daily in Nigeria',
        text: `Earn instant cash watching videos & solving quizzes on 9jaPay! Sign up with my link to get started: ${referralLink}`,
        url: referralLink,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const isFreeTier = user.tier !== 'PREMIUM';
  const hasLockedCommissions = Boolean(user.lockedReferralCommission && user.lockedReferralCommission > 0);

  return (
    <div className="space-y-6">
      
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-400" />
              Referral Program & Leaderboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              ₦6,000 per VIP Upgrade
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Invite friends to 9jaPay. Earn ₦6,000 VIP commission whenever your referred friends upgrade to the Premium plan!
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-900/90 border border-gray-800 self-start sm:self-auto">
          <button
            onClick={() => {
              soundManager.playClickSound();
              setActiveView('invite');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'invite'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>My Invite Hub</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClickSound();
              setActiveView('leaderboard');
              fetchLeaderboard();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black shadow-lg shadow-amber-950/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>National Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Locked Commission Callout for Free Users */}
      {isFreeTier && (
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          hasLockedCommissions
            ? 'bg-gradient-to-r from-red-950/40 via-purple-950/40 to-[#121524] border-red-500/40 shadow-xl'
            : 'bg-[#121524]/90 border-amber-500/30'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                hasLockedCommissions ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {hasLockedCommissions ? <Lock className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">
                    {hasLockedCommissions 
                      ? `⚠️ ₦${(user.lockedReferralCommission || 0).toLocaleString()} in VIP Referral Commissions Locked`
                      : 'Free Member Referral Policy'}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
                    FREE TIER
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                  {hasLockedCommissions ? (
                    <>
                      One or more of your referred users upgraded to VIP Premium. Because your account is currently on the <strong>FREE tier</strong>, you do not have access to the <strong>₦6,000 commission</strong> per upgrade until you activate your own Premium Package!
                    </>
                  ) : (
                    <>
                      You earn <strong>₦6,000</strong> every time your referred friends upgrade to the VIP Premium package. Because your account is on the Free tier, any upgrade commissions are held and will <strong>unlock immediately</strong> once you activate your Premium account.
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenUpgrade();
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs shadow-lg shadow-amber-950/50 hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Crown className="w-4 h-4" />
              <span>{hasLockedCommissions ? `Unlock ₦${(user.lockedReferralCommission || 0).toLocaleString()}` : 'Upgrade to VIP for ₦6k Reward'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: MY INVITE HUB */}
      {activeView === 'invite' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-800/30 shadow-2xl relative overflow-hidden space-y-6">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Link Generator Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                Your Unique Referral Invite Link
              </label>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Direct Tracking Active
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="flex-1 px-4 py-3.5 rounded-2xl bg-black/60 border border-gray-700 text-sm font-mono text-gray-200 truncate flex items-center">
                {referralLink}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-950/50 hover:scale-105 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white shadow-md transition-colors"
                  title="Share Referral Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Referral Code Chip & User Rank Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Promo Code */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-[#121524] border border-purple-800/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                  #
                </div>
                <div>
                  <p className="text-xs text-gray-400">Your Referral Code</p>
                  <p className="text-base font-black font-mono text-white tracking-wider">
                    {user.referralCode}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* National Rank Position */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#121524] to-[#121524] border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Leaderboard Rank</p>
                  <p className="text-base font-black font-mono text-amber-300">
                    {currentUserRank ? `#${currentUserRank.rank} in Nigeria` : 'Unranked (0 Invites)'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveView('leaderboard');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/30"
              >
                <span>View Board</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

          </div>

          {/* Tier-Based Reward Breakdown Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Referral Reward Earnings Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Free Tier Reward Card */}
              <div className={`p-5 rounded-2xl border space-y-2.5 ${
                isFreeTier ? 'bg-purple-950/30 border-purple-500/50' : 'bg-gray-900/60 border-gray-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-300 uppercase">Non-Premium Referrers</span>
                    {isFreeTier && <span className="text-[10px] px-2 py-0.2 rounded bg-purple-500/30 text-purple-200 font-bold">YOUR CURRENT TIER</span>}
                  </div>
                  <span className="text-base font-black text-white font-mono">₦6,000 Locked</span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1.5">
                  <li className="flex items-center gap-2 text-purple-300">
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>Free signups tracked to your account</span>
                  </li>
                  <li className="flex items-center gap-2 text-amber-300">
                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span><strong>₦6,000</strong> per VIP upgrade (Locked until you activate VIP)</span>
                  </li>
                </ul>
              </div>

              {/* Premium Tier Reward Card */}
              <div className={`p-5 rounded-2xl border space-y-2.5 ${
                !isFreeTier ? 'bg-amber-950/30 border-amber-500/50' : 'bg-gradient-to-br from-amber-500/10 to-purple-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" /> VIP Premium Referrers
                    </span>
                    {!isFreeTier && <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/30 text-amber-200 font-bold">YOUR CURRENT TIER</span>}
                  </div>
                  <span className="text-base font-black text-amber-400 font-mono">₦6,000 / Upgrade</span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1.5">
                  <li className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Free signups tracked to your affiliate link</span>
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <Unlock className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>+₦6,000 Instant Cash</strong> credited on every referee VIP upgrade!</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-800/80">
            <div className="p-3.5 rounded-2xl bg-[#0D101C] border border-gray-800 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Referrals</span>
              <p className="text-xl font-black text-white font-mono mt-0.5">{user.referralsCount}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0D101C] border border-gray-800 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300">VIP Upgrades</span>
              <p className="text-xl font-black text-amber-300 font-mono mt-0.5">{user.vipReferralsCount || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0D101C] border border-gray-800 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Earned Payouts</span>
              <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">₦{(user.totalEarned || 0).toLocaleString()}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0D101C] border border-gray-800 text-center">
              <span className="text-[10px] uppercase font-bold text-red-400">Locked Bonus</span>
              <p className="text-xl font-black text-red-400 font-mono mt-0.5">₦{(user.lockedReferralCommission || 0).toLocaleString()}</p>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: REFERRAL LEADERBOARD */}
      {activeView === 'leaderboard' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                9jaPay Top Referrers Leaderboard
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Live national rankings of the highest earning affiliate members in Nigeria.
              </p>
            </div>

            <button
              onClick={fetchLeaderboard}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Refresh Rankings</span>
            </button>
          </div>

          {/* Top 3 Podium (when leaderboard has entries) */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {top3.map((entry, idx) => {
                const podiumColors = [
                  'border-amber-400/60 bg-gradient-to-b from-amber-500/20 to-black/40', // #1 Gold
                  'border-gray-400/40 bg-gradient-to-b from-gray-400/20 to-black/40', // #2 Silver
                  'border-amber-700/40 bg-gradient-to-b from-amber-700/20 to-black/40', // #3 Bronze
                ];
                const podiumBadges = ['🥇 Gold #1', '🥈 Silver #2', '🥉 Bronze #3'];

                return (
                  <div key={entry.userId} className={`p-4 rounded-2xl border ${podiumColors[idx]} space-y-2 text-center relative overflow-hidden`}>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                      {podiumBadges[idx]}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-gray-700 text-white font-black text-base flex items-center justify-center mx-auto shadow-lg">
                      {entry.fullName[0] || entry.username[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate">{entry.fullName}</p>
                      <p className="text-xs text-gray-400 font-mono">@{entry.username}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-300">{entry.totalReferrals} invites</span>
                      <span className="text-emerald-400 font-bold">₦{entry.totalReferralEarned.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3 text-center">Package Tier</th>
                  <th className="py-3 px-3 text-center">Total Invites</th>
                  <th className="py-3 px-3 text-center">VIP Conversions</th>
                  <th className="py-3 px-3 text-right">Referral Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {isLoadingLeaderboard ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-sans">
                      Loading latest rankings...
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-sans">
                      No referral data recorded yet. Be the first to invite friends and take the #1 spot!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => (
                    <tr 
                      key={entry.userId}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        entry.isCurrentUser ? 'bg-purple-950/40 border-l-4 border-purple-500' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-white">
                        {entry.rank === 1 ? '🥇 #1' : entry.rank === 2 ? '🥈 #2' : entry.rank === 3 ? '🥉 #3' : `#${entry.rank}`}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gray-800 text-gray-300 font-bold flex items-center justify-center text-xs">
                            {entry.fullName[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white font-sans">{entry.fullName}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">@{entry.username}</span>
                          </div>
                          {entry.isCurrentUser && (
                            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-purple-500 text-white font-bold font-sans">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {entry.tier === 'PREMIUM' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                            PREMIUM VIP
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-bold text-[10px]">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-white">
                        {entry.totalReferrals}
                      </td>
                      <td className="py-3 px-3 text-center text-amber-300 font-bold">
                        {entry.vipReferrals}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400">
                        ₦{entry.totalReferralEarned.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Call to Action */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#121524] border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-400" />
              <p className="text-xs text-gray-300">
                Want to climb to the top? Share your referral link on WhatsApp status, TikTok, and Twitter!
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-md"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'Copy Referral Link'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
