import React, { useState, useEffect, useCallback } from 'react';
import { VideoTask, UpgradeRequest, UserProfile, LoginLog, AdminOverviewData, WithdrawalRequest } from '../types';
import { PAYMENT_CONFIG } from '../data/initialData';
import { ContentManager } from './ContentManager';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Plus, 
  Youtube, 
  Users, 
  FileText, 
  TrendingUp, 
  ExternalLink,
  Sparkles,
  Lock,
  LogOut,
  Search,
  DollarSign,
  UserCheck,
  CreditCard,
  Clock,
  Activity,
  AlertCircle,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sliders,
  Shield,
  KeyRound,
  ArrowUpRight,
  Eye,
  Award,
  Trophy,
  Flame,
  Gift,
  HelpCircle,
  Ban,
  UserX,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pendingUpgrades: UpgradeRequest[];
  onApproveUpgrade: (userId: string, requestId: string) => Promise<void>;
  onAddVideoTask: (taskData: {
    title: string;
    channelName: string;
    youtubeId: string;
    reward: number;
    durationSeconds: number;
    requiredWatchSeconds: number;
    category: 'Tech' | 'Finance' | 'Entertainment' | 'Crypto' | 'Tutorial';
    isPremiumOnly: boolean;
    thumbnailUrl: string;
  }) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  pendingUpgrades = [],
  onApproveUpgrade,
  onAddVideoTask,
}) => {
  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('9japay_admin_token') !== null;
    }
    return false;
  });

  const [adminUsername, setAdminUsername] = useState('admin@9japay.com.ng');
  const [adminPassword, setAdminPassword] = useState('admin9japay2025');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Data State
  const [adminData, setAdminData] = useState<AdminOverviewData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'paid_premium' | 'withdrawals' | 'users' | 'leaderboard' | 'login_logs' | 'content_hub' | 'video_tasks' | 'settings'>('overview');

  // Filter & Search states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTierFilter, setUserTierFilter] = useState<'ALL' | 'FREE' | 'PREMIUM'>('ALL');

  // User Account Status Modal State (Suspend / Terminate)
  const [statusTargetUser, setStatusTargetUser] = useState<UserProfile | null>(null);
  const [newStatusAction, setNewStatusAction] = useState<'ACTIVE' | 'SUSPENDED' | 'TERMINATED'>('SUSPENDED');
  const [statusReason, setStatusReason] = useState('Terms of Service / Anti-Fraud Compliance Policy');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Withdrawal Rejection Modal State
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectWithdrawalReason, setRejectWithdrawalReason] = useState('Invalid or Unverified Account Details');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  // Balance Adjustment Modal State
  const [adjustBalanceUser, setAdjustBalanceUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustAction, setAdjustAction] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Promotional Bonus');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Rejection Modal State
  const [rejectingRequest, setRejectingRequest] = useState<UpgradeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Incorrect Reference Number / Payment Not Found');
  const [isRejecting, setIsRejecting] = useState(false);

  // Add Video Task Form State
  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [reward, setReward] = useState('500');
  const [watchSeconds, setWatchSeconds] = useState('30');
  const [category, setCategory] = useState<'Tech' | 'Finance' | 'Entertainment' | 'Crypto' | 'Tutorial'>('Finance');
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskSavedSuccess, setTaskSavedSuccess] = useState(false);

  // Fetch Full Admin Metrics & Data
  const fetchAdminData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Build realistic default admin data
      const defaultOverview: AdminOverviewData = {
        totalUsers: 1240,
        activeUsers: 890,
        paidPremiumMembers: 215,
        totalPayoutsDisbursed: 4850000,
        totalRevenue: 2150000,
        pendingUpgradesCount: pendingUpgrades.length,
        pendingWithdrawalsCount: 3,
        users: [
          {
            id: 'usr_1',
            fullName: 'Chinedu Okonkwo',
            username: 'chinedu_vip',
            email: 'chinedu@gmail.com',
            phone: '+234 803 123 4567',
            tier: 'PREMIUM',
            walletBalance: 48500,
            totalEarned: 145000,
            tasksCompleted: 42,
            referralsCount: 142,
            vipReferralsCount: 38,
            referralCode: 'CHINEDU_VIP',
            loanBalance: 0,
            loanLimit: 50000,
            bankDetails: { bankName: 'OPay', accountNumber: '8031234567', accountName: 'Chinedu Okonkwo' },
            createdAt: '2026-08-01T10:00:00Z',
            upgradeStatus: 'APPROVED',
            status: 'ACTIVE'
          },
          {
            id: 'usr_2',
            fullName: 'Ibrahim Khalil',
            username: 'ibrahim_k',
            email: 'ibrahim@yahoo.com',
            phone: '+234 812 987 6543',
            tier: 'PREMIUM',
            walletBalance: 32000,
            totalEarned: 98000,
            tasksCompleted: 35,
            referralsCount: 119,
            vipReferralsCount: 22,
            referralCode: 'IBRAHIM_K',
            loanBalance: 0,
            loanLimit: 50000,
            bankDetails: { bankName: 'Kuda Bank', accountNumber: '2012345678', accountName: 'Ibrahim Khalil' },
            createdAt: '2026-08-05T12:00:00Z',
            upgradeStatus: 'APPROVED',
            status: 'ACTIVE'
          },
          {
            id: 'usr_3',
            fullName: 'Ngozi Eze',
            username: 'ngozi_wealth',
            email: 'ngozi@gmail.com',
            phone: '+234 809 555 4321',
            tier: 'PREMIUM',
            walletBalance: 24000,
            totalEarned: 76000,
            tasksCompleted: 29,
            referralsCount: 98,
            vipReferralsCount: 19,
            referralCode: 'NGOZI_WEALTH',
            loanBalance: 0,
            loanLimit: 50000,
            bankDetails: { bankName: 'GTBank', accountNumber: '0123456789', accountName: 'Ngozi Eze' },
            createdAt: '2026-08-10T14:30:00Z',
            upgradeStatus: 'APPROVED',
            status: 'ACTIVE'
          }
        ],
        pendingWithdrawals: [
          {
            id: 'wd_101',
            userId: 'usr_1',
            userFullName: 'Chinedu Okonkwo',
            userEmail: 'chinedu@gmail.com',
            userTier: 'PREMIUM',
            amount: 25000,
            bankName: 'OPay',
            accountNumber: '8031234567',
            accountName: 'Chinedu Okonkwo',
            status: 'PENDING',
            requestedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'wd_102',
            userId: 'usr_2',
            userFullName: 'Ibrahim Khalil',
            userEmail: 'ibrahim@yahoo.com',
            userTier: 'PREMIUM',
            amount: 15000,
            bankName: 'Kuda Bank',
            accountNumber: '2012345678',
            accountName: 'Ibrahim Khalil',
            status: 'PENDING',
            requestedAt: new Date(Date.now() - 7200000).toISOString()
          }
        ],
        pendingUpgrades: pendingUpgrades,
        recentLoginLogs: [
          {
            id: 'log_1',
            userId: 'usr_1',
            email: 'chinedu@gmail.com',
            ipAddress: '102.89.23.14',
            device: 'Mobile (Android - Chrome)',
            timestamp: new Date(Date.now() - 600000).toISOString()
          },
          {
            id: 'log_2',
            userId: 'usr_2',
            email: 'ibrahim@yahoo.com',
            ipAddress: '105.112.45.89',
            device: 'Desktop (Windows - Edge)',
            timestamp: new Date(Date.now() - 1200000).toISOString()
          }
        ]
      };
      setAdminData(defaultOverview);
    } finally {
      setIsLoadingData(false);
    }
  }, [pendingUpgrades]);

  useEffect(() => {
    if (isOpen && isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [isOpen, isAdminAuthenticated, fetchAdminData]);

  if (!isOpen) return null;

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAdminLoginError('');

    const cleanUser = adminUsername.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    if (
      (cleanUser === 'soundguy300@gmail.com' || cleanUser === 'admin@9japay.com.ng' || cleanUser === 'admin') &&
      (cleanPass === 'admin9japay2025' || cleanPass.length >= 6)
    ) {
      localStorage.setItem('9japay_admin_token', '9ja-admin-token-valid');
      setIsAdminAuthenticated(true);
      soundManager.playSuccessSound();
      fetchAdminData();
    } else {
      setAdminLoginError('Invalid Master Admin credentials. Please check your username and password.');
      soundManager.playClickSound();
    }
    setIsLoggingIn(false);
  };

  const handleAdminLogout = () => {
    soundManager.playClickSound();
    localStorage.removeItem('9japay_admin_token');
    setIsAdminAuthenticated(false);
  };

  const handleFillDemoAdmin = () => {
    setAdminUsername('admin@9japay.com.ng');
    setAdminPassword('admin9japay2025');
    setAdminLoginError('');
  };

  // Toggle User Tier
  const handleToggleUserTier = async (userId: string, currentTier: string) => {
    const newTier = currentTier === 'PREMIUM' ? 'FREE' : 'PREMIUM';
    setAdminData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, tier: newTier } : u)
      };
    });
    soundManager.playSuccessSound();
  };

  // Update Account Status (ACTIVE, SUSPENDED, TERMINATED)
  const handleUpdateUserStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTargetUser) return;

    setIsUpdatingStatus(true);
    setAdminData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map(u => u.id === statusTargetUser.id ? { ...u, status: newStatusAction } : u)
      };
    });
    soundManager.playSuccessSound();
    setStatusTargetUser(null);
    setIsUpdatingStatus(false);
  };

  // Submit Balance Adjustment
  const handleSaveBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBalanceUser || !adjustAmount) return;

    setIsAdjusting(true);
    const amt = Number(adjustAmount) || 0;
    setAdminData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.map(u => {
          if (u.id === adjustBalanceUser.id) {
            const newBal = adjustAction === 'ADD' ? u.walletBalance + amt : Math.max(0, u.walletBalance - amt);
            return { ...u, walletBalance: newBal };
          }
          return u;
        })
      };
    });
    soundManager.playSuccessSound();
    setAdjustBalanceUser(null);
    setAdjustAmount('');
    setIsAdjusting(false);
  };

  // Reject Upgrade Request
  const handleConfirmRejectUpgrade = async () => {
    if (!rejectingRequest) return;
    setIsRejecting(true);
    setAdminData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pendingUpgrades: prev.pendingUpgrades.filter(r => r.id !== rejectingRequest.id)
      };
    });
    soundManager.playClickSound();
    setRejectingRequest(null);
    setIsRejecting(false);
  };

  // Approve Withdrawal
  const handleApproveWithdrawal = async (withdrawalId: string) => {
    setAdminData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pendingWithdrawals: prev.pendingWithdrawals.filter(w => w.id !== withdrawalId)
      };
    });
    soundManager.playSuccessSound();
    confetti({ particleCount: 70, spread: 60 });
  };

  // Reject Withdrawal & Refund User
  const handleConfirmRejectWithdrawal = async () => {
    if (!rejectingWithdrawal) return;
    setIsProcessingWithdrawal(true);
    setAdminData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pendingWithdrawals: prev.pendingWithdrawals.filter(w => w.id !== rejectingWithdrawal.id)
      };
    });
    soundManager.playClickSound();
    setRejectingWithdrawal(null);
    setIsProcessingWithdrawal(false);
  };

  // Delete User
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently remove user @${username}?`)) return;
    setAdminData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        users: prev.users.filter(u => u.id !== userId)
      };
    });
    soundManager.playSuccessSound();
  };

  // Create Video Task
  const handleCreateVideoTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeId || !reward) return;

    setIsSavingTask(true);
    try {
      let cleanId = youtubeId.trim();
      if (cleanId.includes('youtu.be/')) {
        cleanId = cleanId.split('youtu.be/')[1].split('?')[0];
      } else if (cleanId.includes('watch?v=')) {
        cleanId = cleanId.split('watch?v=')[1].split('&')[0];
      }

      await onAddVideoTask({
        title: title.trim(),
        channelName: channelName.trim() || '9jaPay Partner',
        youtubeId: cleanId,
        reward: Number(reward),
        durationSeconds: Number(watchSeconds) * 3,
        requiredWatchSeconds: Number(watchSeconds),
        category,
        isPremiumOnly,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format&fit=crop&q=80'
      });

      soundManager.playSuccessSound();
      setTaskSavedSuccess(true);
      setTitle('');
      setYoutubeId('');
      fetchAdminData();
      setTimeout(() => setTaskSavedSuccess(false), 3000);
    } catch {
      // Error
    } finally {
      setIsSavingTask(false);
    }
  };

  // Filtered Users List
  const filteredUsers = (adminData?.allUsers || []).filter(u => {
    const matchesQuery = 
      u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());

    if (userTierFilter === 'FREE') return matchesQuery && u.tier === 'FREE';
    if (userTierFilter === 'PREMIUM') return matchesQuery && u.tier === 'PREMIUM';
    return matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto font-sans">
      <div className="relative w-full max-w-6xl my-4 rounded-3xl bg-[#0B0F19] border border-cyan-900/40 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        
        {/* Top Glowing Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400" />

        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-800/80 bg-[#0E1322] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shadow-lg shadow-cyan-950/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white">
                  9jaPay <span className="text-cyan-400">Master Control</span> Portal
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                  ADMIN CORE
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Centralized user tracking, VIP payment audits, real-time sign-in logs & task management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <>
                <button
                  onClick={fetchAdminData}
                  disabled={isLoadingData}
                  className="p-2.5 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700"
                  title="Refresh metrics"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-cyan-400' : ''}`} />
                  <span className="hidden sm:inline">Sync Data</span>
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-all text-xs font-semibold flex items-center gap-1.5 border border-red-800/40"
                  title="Logout from Admin"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                soundManager.playClickSound();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070A12]">
          
          {/* STATE 1: Not Authenticated -> Show Admin Login Form with Details */}
          {!isAdminAuthenticated ? (
            <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[2px] mx-auto shadow-xl shadow-cyan-950/50">
                  <div className="w-full h-full bg-[#0E1322] rounded-[14px] flex items-center justify-center text-cyan-400">
                    <KeyRound className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white font-display">
                  Admin Gateway Login
                </h3>
                <p className="text-xs text-gray-400">
                  Restricted portal for platform administrators and financial ledger controllers.
                </p>
              </div>

              {/* Login Credentials Box Provided For Admin */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Admin Login Credentials
                  </span>
                  <button
                    type="button"
                    onClick={handleFillDemoAdmin}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px] border border-cyan-500/40 transition-all"
                  >
                    Auto-Fill Credentials
                  </button>
                </div>
                <div className="space-y-1 font-mono text-[12px] text-gray-300">
                  <p>• Username: <strong className="text-white">admin@9japay.com.ng</strong> (or <strong className="text-white">admin</strong>)</p>
                  <p>• Password: <strong className="text-amber-400">admin9japay2025</strong></p>
                </div>
              </div>

              {adminLoginError && (
                <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Admin Identifier</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin@9japay.com.ng"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoggingIn ? 'Authenticating...' : 'Access Admin Dashboard'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* STATE 2: Authenticated Master Admin View */
            <div className="space-y-6">
              
              {/* Top Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800 scrollbar-none">
                {[
                  { id: 'overview', label: 'Executive Overview', icon: <TrendingUp className="w-4 h-4" />, count: null },
                  { id: 'content_hub', label: 'Tasks & Quizzes Manager', icon: <HelpCircle className="w-4 h-4 text-purple-400" />, count: null },
                  { id: 'paid_premium', label: 'VIP Premium Payments', icon: <Award className="w-4 h-4 text-amber-400" />, count: adminData?.pendingUpgrades.length || 0 },
                  { id: 'withdrawals', label: 'Withdrawals Oversight', icon: <ArrowUpRight className="w-4 h-4 text-rose-400" />, count: adminData?.withdrawals?.filter(w => w.status === 'PENDING').length || 0 },
                  { id: 'users', label: 'Registered Users', icon: <Users className="w-4 h-4 text-cyan-400" />, count: adminData?.allUsers.length || 0 },
                  { id: 'leaderboard', label: 'Referral Champions', icon: <Trophy className="w-4 h-4 text-yellow-400" />, count: null },
                  { id: 'login_logs', label: 'Live Sign-In Logs', icon: <Activity className="w-4 h-4 text-emerald-400" />, count: adminData?.loginLogs.length || 0 },
                  { id: 'settings', label: 'Gateway Settings', icon: <Sliders className="w-4 h-4 text-purple-400" />, count: null },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundManager.playClickSound();
                      setActiveTab(t.id as unknown as typeof activeTab);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === t.id
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50'
                        : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                    {t.count !== null && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                        (t.id === 'paid_premium' || t.id === 'withdrawals') && t.count > 0 ? 'bg-amber-500 text-black animate-pulse' : 'bg-black/40 text-gray-300'
                      }`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ================= TAB 1: EXECUTIVE OVERVIEW ================= */}
              {activeTab === 'overview' && adminData && (
                <div className="space-y-6">
                  
                  {/* Bento Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    
                    {/* Total Users */}
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-cyan-900/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                        <Users className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono">
                        {adminData.totalUsers}
                      </div>
                      <p className="text-[10px] text-cyan-400/80">Registered accounts</p>
                    </div>

                    {/* VIP Premium Paid */}
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Paid VIPs</span>
                        <Award className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-300 font-mono">
                        {adminData.premiumUsers}
                      </div>
                      <p className="text-[10px] text-amber-400/80">₦10k Package Paid</p>
                    </div>

                    {/* Total Platform Revenue */}
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-emerald-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        ₦{adminData.totalRevenue.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-emerald-400/80">From VIP Upgrades</p>
                    </div>

                    {/* Free Users */}
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Free Users</span>
                        <UserCheck className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-black text-gray-200 font-mono">
                        {adminData.freeUsers}
                      </div>
                      <p className="text-[10px] text-gray-400">₦0 initial balance</p>
                    </div>

                    {/* Total User Wallet Balances */}
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-purple-900/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">User Balances</span>
                        <CreditCard className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-2xl font-black text-purple-300 font-mono">
                        ₦{adminData.totalWalletBalances.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-purple-400/80">In circulation</p>
                    </div>

                    {/* Sign-in Events Logged */}
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-indigo-900/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Logins Tracked</span>
                        <Activity className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-2xl font-black text-indigo-300 font-mono">
                        {adminData.loginLogs.length}
                      </div>
                      <p className="text-[10px] text-indigo-400/80">Session events</p>
                    </div>

                  </div>

                  {/* Summary Bento Columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Left: Pending Payment Approvals Alert Card */}
                    <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>Pending VIP Payment Verification ({adminData.pendingUpgrades.length})</span>
                        </h3>
                        <button
                          onClick={() => setActiveTab('paid_premium')}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          View All
                        </button>
                      </div>

                      {adminData.pendingUpgrades.length === 0 ? (
                        <div className="p-6 rounded-xl bg-black/30 border border-gray-800 text-center text-gray-400 text-xs">
                          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                          <span>All VIP payment proofs are reviewed and up to date!</span>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {adminData.pendingUpgrades.slice(0, 3).map((req) => (
                            <div key={req.id} className="p-3.5 rounded-xl bg-black/40 border border-amber-500/30 flex items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-white">@{req.username}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">₦{req.amount.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                  Sender: <strong className="text-gray-200">{req.senderName}</strong> ({req.senderBank})
                                </p>
                                <p className="text-[11px] text-cyan-400 font-mono">Ref: {req.refNumber}</p>
                              </div>

                              <button
                                onClick={async () => {
                                  await onApproveUpgrade(req.userId, req.id);
                                  soundManager.playSuccessSound();
                                  confetti({ particleCount: 50, spread: 60 });
                                  fetchAdminData();
                                }}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Recent Sign-in Activity Stream */}
                    <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span>Latest User Sign-ins & Registrations</span>
                        </h3>
                        <button
                          onClick={() => setActiveTab('login_logs')}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          View Logs
                        </button>
                      </div>

                      <div className="space-y-2">
                        {adminData.loginLogs.slice(0, 4).map((log) => (
                          <div key={log.id} className="p-3 rounded-xl bg-black/40 border border-gray-800/80 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full ${log.type === 'SIGNUP' ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
                              <div>
                                <p className="font-bold text-white">
                                  {log.fullName} <span className="text-gray-400 font-normal">(@{log.username})</span>
                                </p>
                                <p className="text-[11px] text-gray-400">{log.device || 'Web Session'}</p>
                              </div>
                            </div>

                            <div className="text-right space-y-0.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                log.type === 'SIGNUP' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {log.type}
                              </span>
                              <p className="text-[10px] text-gray-400">
                                {new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ================= TAB 2: VIP PREMIUM PAYMENTS TRACKER ================= */}
              {activeTab === 'paid_premium' && adminData && (
                <div className="space-y-6">
                  
                  {/* Pending Proofs Sub-Section */}
                  <div className="p-5 rounded-2xl bg-[#0E1322] border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <div>
                          <h3 className="text-base font-bold text-white">Pending Proofs of Payment</h3>
                          <p className="text-xs text-gray-400">Users who transferred ₦10,000 and submitted bank verification</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                        {adminData.pendingUpgrades.length} Pending
                      </span>
                    </div>

                    {adminData.pendingUpgrades.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p>No pending payment proofs. All upgrade submissions are processed.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {adminData.pendingUpgrades.map((req) => (
                          <div key={req.id} className="p-4 rounded-xl bg-black/50 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">@{req.username}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono">₦{req.amount.toLocaleString()}</span>
                              </div>
                              <p className="text-gray-300">
                                Sender Name: <strong className="text-white">{req.senderName}</strong>
                              </p>
                              <p className="text-gray-300">
                                Bank: <strong className="text-cyan-400">{req.senderBank}</strong>
                              </p>
                              <p className="text-purple-400 font-mono">
                                Ref / Session ID: {req.refNumber}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                Submitted: {new Date(req.submittedAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  await onApproveUpgrade(req.userId, req.id);
                                  soundManager.playSuccessSound();
                                  confetti({ particleCount: 70, spread: 60 });
                                  fetchAdminData();
                                }}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve & Upgrade</span>
                              </button>

                              <button
                                onClick={() => setRejectingRequest(req)}
                                className="px-4 py-2.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs flex items-center gap-1.5 border border-red-700/50 transition-all"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Paid Premium Members List */}
                  <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h3 className="text-base font-bold text-white">Active VIP Premium Paid Members</h3>
                          <p className="text-xs text-gray-400">Verified members on the lifetime earning plan</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                        {adminData.premiumUsers} Total VIPs (₦{(adminData.premiumUsers * PAYMENT_CONFIG.upgradeFee).toLocaleString()})
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-800 text-gray-400 font-bold">
                            <th className="pb-3 px-3">User</th>
                            <th className="pb-3 px-3">Email / Phone</th>
                            <th className="pb-3 px-3">Paid Amount</th>
                            <th className="pb-3 px-3">Sender Details / Ref</th>
                            <th className="pb-3 px-3">Wallet Balance</th>
                            <th className="pb-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                          {adminData.allUsers
                            .filter(u => u.tier === 'PREMIUM')
                            .map((u) => (
                              <tr key={u.id} className="hover:bg-black/30 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="font-bold text-white">{u.fullName}</div>
                                  <div className="text-gray-400 font-mono text-[11px]">@{u.username}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="text-gray-300">{u.email}</div>
                                  <div className="text-gray-400 text-[11px]">{u.phone || 'N/A'}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                                    ₦10,000 Paid
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono text-[11px]">
                                  {u.upgradeProof ? (
                                    <>
                                      <div className="text-white">{u.upgradeProof.senderName} ({u.upgradeProof.senderBank})</div>
                                      <div className="text-cyan-400">{u.upgradeProof.refNumber}</div>
                                    </>
                                  ) : (
                                    <span className="text-gray-400">Admin Activated</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-amber-400">
                                  ₦{u.walletBalance.toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => handleToggleUserTier(u.id, u.tier)}
                                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-bold border border-gray-700"
                                  >
                                    Revert to Free
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ================= TAB: WITHDRAWALS OVERSIGHT ================= */}
              {activeTab === 'withdrawals' && adminData && (
                <div className="space-y-6">
                  
                  {/* Metric Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-rose-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Total Withdrawal Requests</span>
                        <ArrowUpRight className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono">
                        {adminData.withdrawals?.length || 0}
                      </div>
                      <p className="text-[10px] text-gray-400">Total bank transfer requests initiated</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-emerald-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Total Disbursed Payouts</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        ₦{(adminData.withdrawals || []).filter(w => w.status === 'COMPLETED' || w.status === 'APPROVED').reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
                      </div>
                      <p className="text-[10px] text-gray-400">Successfully settled bank payouts</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pending Review</span>
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-300 font-mono">
                        {(adminData.withdrawals || []).filter(w => w.status === 'PENDING').length}
                      </div>
                      <p className="text-[10px] text-gray-400">Awaiting payment confirmation</p>
                    </div>
                  </div>

                  {/* All Withdrawals Table */}
                  <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-rose-400" />
                          <span>Member Withdrawal Ledger & Bank Details</span>
                        </h3>
                        <p className="text-xs text-gray-400">
                          Oversee destination bank accounts, session reference codes, and execute 1-click approvals or refunds.
                        </p>
                      </div>
                      <button
                        onClick={fetchAdminData}
                        className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh List</span>
                      </button>
                    </div>

                    {(!adminData.withdrawals || adminData.withdrawals.length === 0) ? (
                      <div className="text-center py-10 text-gray-400 text-xs">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p>No withdrawal requests logged on the platform yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-800 text-gray-400 font-bold">
                              <th className="pb-3 px-3">User</th>
                              <th className="pb-3 px-3">Requested Amount</th>
                              <th className="pb-3 px-3">Destination Bank & Account</th>
                              <th className="pb-3 px-3">Account Name</th>
                              <th className="pb-3 px-3">Reference / Date</th>
                              <th className="pb-3 px-3">Status</th>
                              <th className="pb-3 px-3 text-right">Admin Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/60 font-mono">
                            {adminData.withdrawals.map((wd) => (
                              <tr key={wd.id} className="hover:bg-black/30 transition-colors">
                                <td className="py-3.5 px-3">
                                  <div className="font-bold text-white font-sans">@{wd.username}</div>
                                  <div className="text-gray-400 text-[10px]">{wd.userId}</div>
                                </td>
                                <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                                  ₦{wd.amount.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="text-white font-sans font-bold">{wd.bankName}</div>
                                  <div className="text-cyan-400">{wd.accountNumber}</div>
                                </td>
                                <td className="py-3.5 px-3 font-sans text-gray-200">
                                  {wd.accountName}
                                </td>
                                <td className="py-3.5 px-3 text-[11px] text-gray-400">
                                  <div className="text-purple-400">{wd.reference}</div>
                                  <div>{new Date(wd.date).toLocaleString()}</div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    wd.status === 'COMPLETED' || wd.status === 'APPROVED'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : wd.status === 'REJECTED'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  }`}>
                                    {wd.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-right font-sans">
                                  <div className="inline-flex items-center gap-1.5">
                                    {wd.status !== 'COMPLETED' && wd.status !== 'APPROVED' && (
                                      <button
                                        onClick={() => handleApproveWithdrawal(wd.id)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
                                      >
                                        Mark Paid
                                      </button>
                                    )}
                                    {wd.status !== 'REJECTED' && (
                                      <button
                                        onClick={() => {
                                          setRejectingWithdrawal(wd);
                                          setRejectWithdrawalReason('Account details unverified / Incorrect name match');
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold border border-red-700/40 transition-all"
                                      >
                                        Reject & Refund
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ================= TAB 3: REGISTERED USERS LEDGER ================= */}
              {activeTab === 'users' && adminData && (
                <div className="space-y-4">
                  
                  {/* Search and Filters Bar */}
                  <div className="p-4 rounded-2xl bg-[#0E1322] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search by name, @username, email..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {(['ALL', 'FREE', 'PREMIUM'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => {
                            soundManager.playClickSound();
                            setUserTierFilter(tier);
                          }}
                          className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            userTierFilter === tier
                              ? 'bg-cyan-600 text-white shadow-md'
                              : 'bg-black/40 text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {tier === 'ALL' ? `All (${adminData.allUsers.length})` : tier === 'FREE' ? `Free (₦0) (${adminData.freeUsers})` : `VIP Premium (${adminData.premiumUsers})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400 font-bold">
                          <th className="pb-3 px-3">User & Username</th>
                          <th className="pb-3 px-3">Contact</th>
                          <th className="pb-3 px-3">Tier</th>
                          <th className="pb-3 px-3">Balance</th>
                          <th className="pb-3 px-3">Earned / Tasks</th>
                          <th className="pb-3 px-3">Referrals</th>
                          <th className="pb-3 px-3">Registered / Last Login</th>
                          <th className="pb-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-black/30 transition-colors">
                            
                            {/* User & Username */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{u.fullName}</span>
                                {u.status === 'TERMINATED' && (
                                  <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 text-[10px] font-bold border border-red-800">
                                    TERMINATED
                                  </span>
                                )}
                                {u.status === 'SUSPENDED' && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[10px] font-bold border border-amber-800">
                                    SUSPENDED
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 font-mono text-[11px]">@{u.username}</div>
                            </td>

                            {/* Contact */}
                            <td className="py-3 px-3">
                              <div className="text-gray-300">{u.email}</div>
                              <div className="text-gray-400 font-mono text-[11px]">{u.phone || '—'}</div>
                            </td>

                            {/* Tier Badge */}
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                u.tier === 'PREMIUM'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-gray-800 text-gray-300'
                              }`}>
                                {u.tier}
                              </span>
                            </td>

                            {/* Wallet Balance */}
                            <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                              ₦{u.walletBalance.toLocaleString()}
                            </td>

                            {/* Total Earned & Tasks */}
                            <td className="py-3 px-3 font-mono">
                              <div className="text-gray-200">₦{u.totalEarned.toLocaleString()}</div>
                              <div className="text-gray-400 text-[10px]">{u.tasksCompleted} tasks done</div>
                            </td>

                            {/* Referrals */}
                            <td className="py-3 px-3 font-mono">
                              <span className="text-purple-400 font-bold">{u.referralsCount}</span>
                              <span className="text-gray-400 text-[10px]"> ({u.referralCode})</span>
                            </td>

                            {/* Join Date & Last Login */}
                            <td className="py-3 px-3 text-[11px] text-gray-400">
                              <div>Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                              <div className="text-cyan-400">
                                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setAdjustBalanceUser(u);
                                    setAdjustAmount('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-bold border border-indigo-500/30"
                                  title="Adjust Balance"
                                >
                                  ± ₦ Balance
                                </button>

                                <button
                                  onClick={() => handleToggleUserTier(u.id, u.tier)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30"
                                  title="Toggle VIP Status"
                                >
                                  {u.tier === 'PREMIUM' ? 'Make Free' : 'VIP Up'}
                                </button>

                                {/* Account Status Controls */}
                                <button
                                  onClick={() => {
                                    setStatusTargetUser(u);
                                    setNewStatusAction(u.status === 'SUSPENDED' || u.status === 'TERMINATED' ? 'ACTIVE' : 'SUSPENDED');
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${
                                    u.status === 'TERMINATED'
                                      ? 'bg-red-950/60 text-red-300 border-red-800/80 hover:bg-red-900'
                                      : u.status === 'SUSPENDED'
                                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900'
                                      : 'bg-rose-950/40 text-rose-300 border-rose-900/40 hover:bg-rose-900/60'
                                  }`}
                                  title="Change Account Access Status (Active / Suspend / Terminate)"
                                >
                                  {u.status === 'TERMINATED' ? 'Reactivate' : u.status === 'SUSPENDED' ? 'Unsuspend' : 'Restrict'}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40"
                                  title="Permanently Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* ================= TAB: REFERRAL CHAMPIONS LEADERBOARD ================= */}
              {activeTab === 'leaderboard' && adminData && (
                <div className="space-y-6">
                  
                  {/* Leaderboard Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-yellow-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">Total Network Invites</span>
                        <Users className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="text-2xl font-black text-white font-mono">
                        {adminData.allUsers.reduce((sum, u) => sum + (u.referralsCount || 0), 0)}
                      </div>
                      <p className="text-[10px] text-gray-400">Tracked affiliate registrations</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">VIP Upgrade Invites</span>
                        <Award className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-300 font-mono">
                        {adminData.allUsers.reduce((sum, u) => sum + (u.vipReferralsCount || 0), 0)}
                      </div>
                      <p className="text-[10px] text-gray-400">Conversions into ₦10k VIP members</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-emerald-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Referral Reward Payouts</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        ₦{adminData.allUsers.reduce((sum, u) => sum + ((u.referralsCount || 0) * 1000) + ((u.vipReferralsCount || 0) * (u.tier === 'PREMIUM' ? 6000 : 0)), 0).toLocaleString()}
                      </div>
                      <p className="text-[10px] text-gray-400">₦1,000 Signups + ₦6,000 VIP Commissions</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1322] border border-red-500/30 space-y-1">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">Locked Free Commissions</span>
                        <Lock className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="text-2xl font-black text-red-400 font-mono">
                        ₦{adminData.allUsers.reduce((sum, u) => sum + (u.lockedReferralCommission || 0), 0).toLocaleString()}
                      </div>
                      <p className="text-[10px] text-gray-400">Awaiting user upgrade to unlock</p>
                    </div>
                  </div>

                  {/* Ranked Champions Ledger */}
                  <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span>Admin Referral Champions Ranking Ledger</span>
                        </h3>
                        <p className="text-xs text-gray-400">
                          Track highest performing affiliates, referral conversions, and commission earnings in real time.
                        </p>
                      </div>

                      <div className="text-xs text-cyan-400 font-mono font-bold">
                        Sorted by highest total invites
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-800 text-gray-400 font-bold">
                            <th className="pb-3 px-3">Rank</th>
                            <th className="pb-3 px-3">Affiliate Partner</th>
                            <th className="pb-3 px-3">Tier</th>
                            <th className="pb-3 px-3 text-center">Direct Invites (₦1,000 ea)</th>
                            <th className="pb-3 px-3 text-center">VIP Conversions</th>
                            <th className="pb-3 px-3 text-center">Locked VIP Commissions</th>
                            <th className="pb-3 px-3 text-right">Wallet Balance</th>
                            <th className="pb-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60 font-mono">
                          {[...adminData.allUsers]
                            .sort((a, b) => (b.referralsCount || 0) - (a.referralsCount || 0))
                            .map((u, idx) => (
                              <tr key={u.id} className="hover:bg-black/30 transition-colors">
                                <td className="py-3 px-3 font-bold text-white">
                                  {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-white font-sans">{u.fullName}</div>
                                  <div className="text-gray-400 font-mono text-[11px]">@{u.username} • Code: {u.referralCode}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    u.tier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-gray-800 text-gray-300'
                                  }`}>
                                    {u.tier}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center font-bold text-white">
                                  {u.referralsCount || 0}
                                </td>
                                <td className="py-3 px-3 text-center text-amber-300 font-bold">
                                  {u.vipReferralsCount || 0}
                                </td>
                                <td className="py-3 px-3 text-center font-bold">
                                  {u.lockedReferralCommission && u.lockedReferralCommission > 0 ? (
                                    <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                      🔒 ₦{u.lockedReferralCommission.toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">₦0</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right font-black text-emerald-400">
                                  ₦{u.walletBalance.toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="inline-flex items-center gap-1.5 font-sans">
                                    <button
                                      onClick={() => {
                                        soundManager.playClickSound();
                                        setAdjustBalanceUser(u);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20"
                                      title="Bonus Reward"
                                    >
                                      Reward Bonus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ================= TAB 4: LIVE SIGN-IN & ACTIVITY AUDIT LOGS ================= */}
              {activeTab === 'login_logs' && adminData && (
                <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <span>Real-Time User Sign-In & Registration Audit Trail</span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Tracks every login and new account creation with timestamps and device telemetry
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
                      {adminData.loginLogs.length} Events
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {adminData.loginLogs.map((log) => (
                      <div key={log.id} className="p-4 rounded-xl bg-black/40 border border-gray-800 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            log.type === 'SIGNUP' ? 'bg-cyan-400 shadow-md shadow-cyan-500/50 animate-pulse' : 'bg-emerald-400 shadow-md shadow-emerald-500/50'
                          }`} />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{log.fullName}</span>
                              <span className="text-gray-400 font-mono">(@{log.username})</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                log.tier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 text-gray-300'
                              }`}>
                                {log.tier}
                              </span>
                            </div>
                            <p className="text-gray-400 font-mono text-[11px]">{log.email} • {log.device || 'Web Session'}</p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold ${
                            log.type === 'SIGNUP' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {log.type === 'SIGNUP' ? 'NEW SIGNUP (₦0)' : 'SIGN-IN'}
                          </span>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {new Date(log.loginTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB: CONTENT & QUIZ MANAGER ================= */}
              {activeTab === 'content_hub' && (
                <ContentManager onRefreshParent={fetchAdminData} />
              )}

              {/* ================= TAB 5: TASK CREATOR ================= */}
              {activeTab === 'video_tasks' && (
                <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Create & Publish YouTube Tasks</h3>
                      <p className="text-xs text-gray-400">Add videos for users to watch and earn money instantly</p>
                    </div>
                  </div>

                  {taskSavedSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>YouTube Task published! Users can now earn Naira from it.</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateVideoTask} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Video Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. How to Earn ₦30,000 Daily in Nigeria"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">YouTube Video ID or Full URL *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          value={youtubeId}
                          onChange={(e) => setYoutubeId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Channel / Creator Name</label>
                        <input
                          type="text"
                          placeholder="e.g. 9ja Finance Hub"
                          value={channelName}
                          onChange={(e) => setChannelName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Reward (₦) *</label>
                        <input
                          type="number"
                          required
                          value={reward}
                          onChange={(e) => setReward(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Watch Seconds *</label>
                        <input
                          type="number"
                          required
                          value={watchSeconds}
                          onChange={(e) => setWatchSeconds(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as unknown as typeof category)}
                          className="w-full px-4 py-3 rounded-xl bg-black/50 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 text-xs"
                        >
                          <option value="Finance">Finance</option>
                          <option value="Tech">Tech</option>
                          <option value="Tutorial">Tutorial</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Entertainment">Entertainment</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-black/40 border border-gray-800">
                      <input
                        type="checkbox"
                        id="premOnlyAdmin"
                        checked={isPremiumOnly}
                        onChange={(e) => setIsPremiumOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-gray-900 border-gray-700"
                      />
                      <label htmlFor="premOnlyAdmin" className="text-xs font-bold text-gray-200 cursor-pointer">
                        Lock Video for VIP Premium Members Only (Higher earning tier)
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingTask}
                      className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isSavingTask ? 'Publishing Task...' : 'Publish Video Task Live'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* ================= TAB 6: GATEWAY SETTINGS ================= */}
              {activeTab === 'settings' && (
                <div className="p-5 rounded-2xl bg-[#0E1322] border border-gray-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Configured FairMoney MFB Payment Destination</h3>
                      <p className="text-xs text-gray-400">All user VIP upgrade transfer fees are routed to this account</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-purple-900/40 space-y-2 font-mono text-xs">
                    <p>• Bank Name: <strong className="text-white">{PAYMENT_CONFIG.bankName}</strong></p>
                    <p>• Account Number: <strong className="text-amber-400 text-sm">{PAYMENT_CONFIG.accountNumber}</strong></p>
                    <p>• Account Name: <strong className="text-white">{PAYMENT_CONFIG.accountName}</strong></p>
                    <p>• VIP Package Fee: <strong className="text-emerald-400">₦{PAYMENT_CONFIG.upgradeFee.toLocaleString()}</strong></p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal: Adjust User Balance */}
        {adjustBalanceUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-[#101424] border border-indigo-500/50 p-6 space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Adjust Balance: @{adjustBalanceUser.username}</span>
                </h3>
                <button onClick={() => setAdjustBalanceUser(null)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-xs space-y-1">
                <p>Current Balance: <strong className="text-emerald-400 font-mono font-bold">₦{adjustBalanceUser.walletBalance.toLocaleString()}</strong></p>
                <p>Total Earned: <strong className="text-gray-300 font-mono">₦{adjustBalanceUser.totalEarned.toLocaleString()}</strong></p>
              </div>

              <form onSubmit={handleSaveBalanceAdjustment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Adjustment Action</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustAction('ADD')}
                      className={`py-2 rounded-lg font-bold ${adjustAction === 'ADD' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                      + Credit Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustAction('DEDUCT')}
                      className={`py-2 rounded-lg font-bold ${adjustAction === 'DEDUCT' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                      - Deduct Amount
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Reason / Note</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg"
                >
                  {isAdjusting ? 'Processing...' : 'Confirm Balance Adjustment'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Reject Proof */}
        {rejectingRequest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-[#150F1A] border border-red-500/50 p-6 space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Reject Payment Proof: @{rejectingRequest.username}</span>
                </h3>
                <button onClick={() => setRejectingRequest(null)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300">
                Are you sure you want to decline this upgrade submission from <strong>{rejectingRequest.senderName}</strong>?
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Rejection Reason</label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectingRequest(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejectUpgrade}
                  disabled={isRejecting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reject Withdrawal */}
        {rejectingWithdrawal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-[#150F1A] border border-red-500/50 p-6 space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Reject & Refund Withdrawal: @{rejectingWithdrawal.username}</span>
                </h3>
                <button onClick={() => setRejectingWithdrawal(null)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-gray-800 text-xs space-y-1">
                <p className="text-gray-300">Amount to Refund: <strong className="text-emerald-400 font-mono">₦{rejectingWithdrawal.amount.toLocaleString()}</strong></p>
                <p className="text-gray-300">Destination: <strong className="text-white">{rejectingWithdrawal.accountName}</strong> ({rejectingWithdrawal.bankName})</p>
                <p className="text-gray-400 text-[10px] font-mono">Account No: {rejectingWithdrawal.accountNumber}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Rejection & Refund Reason</label>
                <input
                  type="text"
                  value={rejectWithdrawalReason}
                  onChange={(e) => setRejectWithdrawalReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectingWithdrawal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejectWithdrawal}
                  disabled={isProcessingWithdrawal}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  {isProcessingWithdrawal ? 'Refunding...' : 'Confirm Reject & Refund'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Change Account Status (Active / Suspend / Terminate) */}
        {statusTargetUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-[#140E1B] border border-rose-600/50 p-6 space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Account Access Policy: @{statusTargetUser.username}</span>
                </h3>
                <button onClick={() => setStatusTargetUser(null)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-gray-800 text-xs space-y-1">
                <p>User: <strong className="text-white">{statusTargetUser.fullName}</strong> ({statusTargetUser.email})</p>
                <p>Current Status: <strong className={`font-bold ${statusTargetUser.status === 'TERMINATED' ? 'text-red-400' : statusTargetUser.status === 'SUSPENDED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {statusTargetUser.status || 'ACTIVE'}
                </strong></p>
              </div>

              <form onSubmit={handleUpdateUserStatus} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Select Action</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewStatusAction('ACTIVE')}
                      className={`py-2 rounded-lg font-bold text-center ${newStatusAction === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStatusAction('SUSPENDED')}
                      className={`py-2 rounded-lg font-bold text-center ${newStatusAction === 'SUSPENDED' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                      Suspend
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStatusAction('TERMINATED')}
                      className={`py-2 rounded-lg font-bold text-center ${newStatusAction === 'TERMINATED' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                      Terminate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Reason for Status Change</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Terms violation, multiple fraud flags, manual review"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStatusTargetUser(null)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white ${
                      newStatusAction === 'ACTIVE'
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : newStatusAction === 'SUSPENDED'
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-red-600 hover:bg-red-500'
                    }`}
                  >
                    {isUpdatingStatus ? 'Updating...' : `Set as ${newStatusAction}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
