import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, VideoTask, SocialTask, QuizQuestion, Transaction, UpgradeRequest } from './types';
import { INITIAL_VIDEO_TASKS, INITIAL_SOCIAL_TASKS, INITIAL_QUIZ_QUESTIONS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { AudioGuidePlayer } from './components/AudioGuidePlayer';
import { WalletWidget } from './components/WalletWidget';
import { WatchEarnSection } from './components/WatchEarnSection';
import { QuizSection } from './components/QuizSection';
import { ClickEarnSection } from './components/ClickEarnSection';
import { ReferralSection } from './components/ReferralSection';
import { TransactionsHistory } from './components/TransactionsHistory';
import { UpgradeModal } from './components/UpgradeModal';
import { LoanModal } from './components/LoanModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { LandingPage } from './components/LandingPage';
import { BottomNav } from './components/BottomNav';
import { BentoDashboard } from './components/BentoDashboard';
import { soundManager } from './utils/audio';
import { supabase, mapSupabaseUserToProfile } from './lib/supabase';
import { supabaseDb } from './lib/supabaseDb';

export default function App() {
  // User State: Default to null for guest visitors so the 9jaPay landing page is displayed
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('9japay_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Active Tab: Default to 'landing' for guest visitors, 'dashboard' if already logged in
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('9japay_user');
      if (saved) return 'dashboard';
    }
    return 'landing';
  });

  // Tasks and App Data
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>(INITIAL_VIDEO_TASKS);
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>(INITIAL_SOCIAL_TASKS);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState<number>(0);
  const [quizDailyLimit, setQuizDailyLimit] = useState<number>(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingUpgrades, setPendingUpgrades] = useState<UpgradeRequest[]>([]);

  // Modals state
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [prefilledRef, setPrefilledRef] = useState('');

  // Supabase Session Management & Protected Route Guard
  useEffect(() => {
    const checkSessionAndRoute = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';

        if (pathname === '/login') {
          if (session?.user && !error) {
            setUser(prev => mapSupabaseUserToProfile(session.user, prev));
            setActiveTab('dashboard');
            window.history.replaceState({}, '', '/');
          } else {
            setUser(null);
            setActiveTab('landing');
            setAuthMode('login');
            setIsAuthOpen(true);
          }
          return;
        }

        if (pathname === '/register' || pathname === '/signup') {
          if (session?.user && !error) {
            setUser(prev => mapSupabaseUserToProfile(session.user, prev));
            setActiveTab('dashboard');
            window.history.replaceState({}, '', '/');
          } else {
            setUser(null);
            setActiveTab('landing');
            setAuthMode('register');
            setIsAuthOpen(true);
          }
          return;
        }

        const protectedTabs: Record<string, string> = {
          '/dashboard': 'dashboard',
          '/videos': 'videos',
          '/quiz': 'quiz',
          '/socials': 'socials',
          '/referral': 'referral',
          '/history': 'history',
        };

        const targetTab = protectedTabs[pathname];

        if (targetTab) {
          // Protected route check with supabase.auth.getSession()
          if (!session?.user || error) {
            // if no session, redirect to /login
            setUser(null);
            localStorage.removeItem('9japay_user');
            setActiveTab('landing');
            setAuthMode('login');
            setIsAuthOpen(true);
            window.history.replaceState({}, '', '/login');
          } else {
            setUser(prev => mapSupabaseUserToProfile(session.user, prev));
            setActiveTab(targetTab);
          }
          return;
        }

        // Standard root path '/'
        if (session?.user && !error) {
          setUser(prev => mapSupabaseUserToProfile(session.user, prev));
          setActiveTab('dashboard');
        } else {
          setUser(null);
          setActiveTab('landing');
        }
      } catch {
        setUser(null);
        setActiveTab('landing');
      }
    };

    checkSessionAndRoute();

    // Real-time Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(prev => mapSupabaseUserToProfile(session.user, prev));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('9japay_user');
        localStorage.removeItem('9japay_admin_token');
        setActiveTab('landing');
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/login');
        }
      }
    });

    // Browser Back/Forward navigation listener
    const handlePopState = () => {
      checkSessionAndRoute();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Protected Tab Navigation with supabase.auth.getSession() check
  const handleSelectTab = async (tabId: string) => {
    if (tabId === 'landing') {
      setActiveTab('landing');
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/');
      }
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session?.user || error) {
        // If no session, redirect to /login
        setUser(null);
        localStorage.removeItem('9japay_user');
        setActiveTab('landing');
        setAuthMode('login');
        setIsAuthOpen(true);
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/login');
        }
        return;
      }

      setUser(prev => mapSupabaseUserToProfile(session.user, prev));
      setActiveTab(tabId);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', tabId === 'dashboard' ? '/' : `/${tabId}`);
      }
    } catch {
      setUser(null);
      setActiveTab('landing');
      setAuthMode('login');
      setIsAuthOpen(true);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/login');
      }
    }
  };

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem('9japay_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('9japay_user');
    }
  }, [user]);

  // Check URL query parameters for referral (e.g. ?ref=username)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setPrefilledRef(ref);
      }
    }
  }, []);

  // Fetch updated data when user changes
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch updated tasks from Supabase
      const tasksData = await supabaseDb.fetchAllTasks();
      if (tasksData.videos?.length) setVideoTasks(tasksData.videos);
      if (tasksData.socials?.length) setSocialTasks(tasksData.socials);
      if (tasksData.quizzes?.length) setQuizQuestions(tasksData.quizzes);
    } catch {
      // Local fallback
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Complete a Task (Video or Social)
  const handleCompleteTask = async (taskId: string, type: 'video' | 'social') => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const reward = user.tier === 'PREMIUM' ? 1000 : 500;
    const updatedBalance = user.walletBalance + reward;
    const updatedUser: UserProfile = {
      ...user,
      walletBalance: updatedBalance,
      totalEarned: user.totalEarned + reward,
      tasksCompleted: user.tasksCompleted + 1
    };

    setUser(updatedUser);

    if (type === 'video') {
      setVideoTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, isCompleted: true } : t))
      );
    } else {
      setSocialTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, isCompleted: true } : t))
      );
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      type: 'TASK_EARN',
      amount: reward,
      status: 'COMPLETED',
      description: type === 'video' ? `Completed YouTube Video Task (+₦${reward.toLocaleString()})` : `Completed Social Engagement Task (+₦${reward.toLocaleString()})`,
      date: new Date().toISOString(),
      reference: `9JA-TSK-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    // Sync to Supabase
    try {
      await supabaseDb.updateProfile(user.id, {
        balance: updatedBalance
      });
      await supabaseDb.recordTransaction({
        userId: user.id,
        amount: reward,
        type: 'TASK_REWARD',
        status: 'COMPLETED',
        reference: newTx.reference
      });
    } catch (err) {
      console.warn('Supabase task completion sync:', err);
    }
  };

  // Submit Quiz Answer
  const handleSubmitQuiz = async (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D') => {
    if (!user) {
      setIsAuthOpen(true);
      throw new Error('Please login to answer quizzes');
    }

    const targetQuiz = quizQuestions.find(q => q.id === questionId) || quizQuestions[0];
    const isCorrect = targetQuiz ? selectedOption === targetQuiz.correctOption : true;
    const rewardEarned = isCorrect ? (user.tier === 'PREMIUM' ? 1000 : 500) : 0;
    const newAnsweredCount = quizAnsweredCount + 1;

    setQuizAnsweredCount(newAnsweredCount);

    if (isCorrect) {
      const updatedBalance = user.walletBalance + rewardEarned;
      const updatedUser: UserProfile = {
        ...user,
        walletBalance: updatedBalance,
        totalEarned: user.totalEarned + rewardEarned,
        tasksCompleted: user.tasksCompleted + 1
      };
      setUser(updatedUser);

      const newTx: Transaction = {
        id: `tx-quiz-${Date.now()}`,
        userId: user.id,
        type: 'QUIZ_EARN',
        amount: rewardEarned,
        status: 'COMPLETED',
        description: `Daily Quiz Reward (+₦${rewardEarned.toLocaleString()})`,
        date: new Date().toISOString(),
        reference: `9JA-QZ-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setTransactions(prev => [newTx, ...prev]);

      try {
        await supabaseDb.updateProfile(user.id, { balance: updatedBalance });
        await supabaseDb.recordTransaction({
          userId: user.id,
          amount: rewardEarned,
          type: 'TASK_REWARD',
          status: 'COMPLETED',
          reference: newTx.reference
        });
      } catch (err) {
        console.warn('Supabase quiz sync:', err);
      }
    }

    return {
      isCorrect,
      correctOption: targetQuiz ? targetQuiz.correctOption : 'A',
      explanation: targetQuiz ? targetQuiz.explanation : 'Correct answer verified!',
      rewardEarned
    };
  };

  // Submit Premium Upgrade Proof
  const handleSubmitProof = async (proofData: {
    senderName: string;
    senderBank: string;
    refNumber: string;
    receiptImage?: string;
  }) => {
    if (!user) return;

    const newRequest: UpgradeRequest = {
      id: `req_${Date.now()}`,
      userId: user.id,
      username: user.username,
      userFullName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone,
      senderName: proofData.senderName,
      senderBank: proofData.senderBank,
      refNumber: proofData.refNumber,
      amount: 10000,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      receiptImage: proofData.receiptImage
    };

    setPendingUpgrades(prev => [newRequest, ...prev]);
    setUser(prev => prev ? { ...prev, upgradeStatus: 'PENDING' } : null);
  };

  // Instant Paystack Upgrade Handler (Syncs to Supabase DB)
  const handleInstantUpgrade = async (reference: string) => {
    if (!user) return;

    try {
      // 1. Sync to Supabase profiles table
      await supabaseDb.upgradeUserToPremium(user.id, reference);

      // 2. Record transaction in Supabase
      await supabaseDb.recordTransaction({
        userId: user.id,
        type: 'VIP_UPGRADE',
        amount: 10000,
        status: 'COMPLETED',
        reference
      });
    } catch (err) {
      console.warn('Supabase remote upgrade sync fallback:', err);
    }

    // 3. Update local state
    const updatedUser: UserProfile = {
      ...user,
      tier: 'PREMIUM',
      loanLimit: 50000,
      upgradeStatus: 'APPROVED'
    };
    setUser(updatedUser);
    setQuizDailyLimit(10);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'VIP_UPGRADE',
      amount: 10000,
      status: 'COMPLETED',
      description: `Paystack VIP Upgrade: ${reference}`,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Fast Instant Approve Upgrade
  const handleFastApprove = async () => {
    if (!user) return;
    try {
      await supabaseDb.upgradeUserToPremium(user.id, 'FAST_APPROVE');
    } catch {
      // ignore
    }
    setUser(prev => prev ? { ...prev, tier: 'PREMIUM', loanLimit: 50000, upgradeStatus: 'APPROVED' } : null);
    setQuizDailyLimit(10);
  };

  // Admin Approve Upgrade Request
  const handleAdminApprove = async (targetUserId: string, requestId: string) => {
    try {
      await supabaseDb.upgradeUserToPremium(targetUserId, requestId);
    } catch {
      // ignore
    }
    setPendingUpgrades(prev => prev.filter(r => r.id !== requestId));
    if (user?.id === targetUserId) {
      setUser(prev => prev ? { ...prev, tier: 'PREMIUM', loanLimit: 50000, upgradeStatus: 'APPROVED' } : null);
      setQuizDailyLimit(10);
    }
  };

  // Apply Loan
  const handleApplyLoan = async (amount: number, _tenureDays: number) => {
    if (!user) return;
    const updatedBalance = user.walletBalance + amount;
    const updatedLoan = user.loanBalance + amount;

    const updatedUser: UserProfile = {
      ...user,
      walletBalance: updatedBalance,
      loanBalance: updatedLoan
    };
    setUser(updatedUser);

    const newTx: Transaction = {
      id: `tx-loan-${Date.now()}`,
      userId: user.id,
      type: 'LOAN_DISBURSED',
      amount,
      status: 'COMPLETED',
      description: `Emergency Member Loan Disbursed (+₦${amount.toLocaleString()})`,
      date: new Date().toISOString(),
      reference: `9JA-LN-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    try {
      await supabaseDb.updateProfile(user.id, { balance: updatedBalance });
      await supabaseDb.recordTransaction({
        userId: user.id,
        amount,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        reference: newTx.reference
      });
    } catch (err) {
      console.warn('Supabase loan sync:', err);
    }
  };

  // Repay Loan
  const handleRepayLoan = async () => {
    if (!user || user.loanBalance <= 0) return;
    const repayAmount = user.loanBalance;
    const updatedBalance = Math.max(0, user.walletBalance - repayAmount);

    const updatedUser: UserProfile = {
      ...user,
      walletBalance: updatedBalance,
      loanBalance: 0
    };
    setUser(updatedUser);

    const newTx: Transaction = {
      id: `tx-repay-${Date.now()}`,
      userId: user.id,
      type: 'LOAN_REPAID',
      amount: repayAmount,
      status: 'COMPLETED',
      description: `Loan Fully Repaid (-₦${repayAmount.toLocaleString()})`,
      date: new Date().toISOString(),
      reference: `9JA-RP-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    try {
      await supabaseDb.updateProfile(user.id, { balance: updatedBalance });
    } catch (err) {
      console.warn('Supabase loan repay sync:', err);
    }
  };

  // Withdraw
  const handleWithdraw = async (amount: number, bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    if (!user) return;
    const updatedBalance = Math.max(0, user.walletBalance - amount);
    const updatedUser: UserProfile = {
      ...user,
      walletBalance: updatedBalance,
      bankDetails: {
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName
      }
    };
    setUser(updatedUser);

    const newTx: Transaction = {
      id: `tx-wd-${Date.now()}`,
      userId: user.id,
      type: 'WITHDRAWAL',
      amount,
      status: 'COMPLETED',
      description: `Disbursement to ${bankDetails.bankName} (${bankDetails.accountNumber})`,
      date: new Date().toISOString(),
      reference: `9JA-WD-${Math.floor(100000 + Math.random() * 900000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    try {
      await supabaseDb.updateProfile(user.id, { balance: updatedBalance });
      await supabaseDb.recordTransaction({
        userId: user.id,
        amount,
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        reference: newTx.reference
      });
    } catch (err) {
      console.warn('Supabase withdrawal sync:', err);
    }
  };

  // Add YouTube Video Task (Admin)
  const handleAddVideoTask = async (taskData: {
    title: string;
    channelName: string;
    youtubeId: string;
    reward: number;
    durationSeconds: number;
    requiredWatchSeconds: number;
    category: 'Tech' | 'Finance' | 'Entertainment' | 'Crypto' | 'Tutorial';
    isPremiumOnly: boolean;
    thumbnailUrl: string;
  }) => {
    const newTask: VideoTask = {
      id: `vid_${Date.now()}`,
      ...taskData
    };
    setVideoTasks(prev => [newTask, ...prev]);

    try {
      await supabaseDb.saveTaskToSupabase({
        id: newTask.id,
        title: newTask.title,
        category: 'VIDEO',
        reward: newTask.reward,
        url_or_content: newTask.youtubeId,
        timer_seconds: newTask.requiredWatchSeconds
      });
    } catch (err) {
      console.warn('Supabase save task:', err);
    }
  };

  // Open Auth Modal with route update
  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', mode === 'login' ? '/login' : '/register');
    }
  };

  // Close Auth Modal
  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname === '/login' || pathname === '/register' || pathname === '/signup') {
        window.history.pushState({}, '', '/');
      }
    }
  };

  // Logout via Supabase Client
  const handleLogout = async () => {
    soundManager.playClickSound();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore sign out error
    }
    setUser(null);
    localStorage.removeItem('9japay_user');
    localStorage.removeItem('9japay_admin_token');
    setActiveTab('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#070509] text-gray-100 flex flex-col font-sans pb-24 md:pb-12">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {!user || activeTab === 'landing' ? (
          /* Public Landing Page */
          <LandingPage onOpenAuth={handleOpenAuth} />
        ) : (
          /* Authenticated User Experience */
          <div className="space-y-8">

            {/* Bento Grid Dashboard View */}
            {activeTab === 'dashboard' && (
              <BentoDashboard
                user={user}
                videoTasks={videoTasks}
                quizQuestions={quizQuestions}
                socialTasks={socialTasks}
                quizAnsweredCount={quizAnsweredCount}
                quizDailyLimit={quizDailyLimit}
                onOpenWithdraw={() => setIsWithdrawOpen(true)}
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
                onOpenLoan={() => setIsLoanOpen(true)}
                onSelectTab={handleSelectTab}
                onCompleteTask={handleCompleteTask}
                onSubmitQuiz={handleSubmitQuiz}
              />
            )}

            {/* Watch & Earn Dedicated Tab */}
            {activeTab === 'videos' && (
              <WatchEarnSection
                user={user}
                videoTasks={videoTasks}
                onCompleteTask={handleCompleteTask}
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* Quiz Dedicated Tab */}
            {activeTab === 'quiz' && (
              <QuizSection
                user={user}
                questions={quizQuestions}
                answeredCount={quizAnsweredCount}
                remainingQuestions={Math.max(0, quizDailyLimit - quizAnsweredCount)}
                dailyLimit={quizDailyLimit}
                onSubmitAnswer={handleSubmitQuiz}
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* Click & Earn Dedicated Tab */}
            {activeTab === 'socials' && (
              <ClickEarnSection
                user={user}
                socialTasks={socialTasks}
                onCompleteTask={handleCompleteTask}
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* Refer & Earn Dedicated Tab */}
            {activeTab === 'referral' && (
              <ReferralSection
                user={user}
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
              />
            )}

            {/* Transactions History Tab */}
            {activeTab === 'history' && (
              <TransactionsHistory transactions={transactions} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-6 text-center text-xs text-gray-400 max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-display">9jaPay Official</span>
            <span>•</span>
            <span>Licensed Task & Reward Portal</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="text-gray-400">© 2026 9jaPay. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Dock Bar */}
      <BottomNav
        user={user}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Modals */}
      {user && (
        <>
          <UpgradeModal
            user={user}
            isOpen={isUpgradeOpen}
            onClose={() => setIsUpgradeOpen(false)}
            onSubmitProof={handleSubmitProof}
            onInstantUpgrade={handleInstantUpgrade}
          />

          <LoanModal
            user={user}
            isOpen={isLoanOpen}
            onClose={() => setIsLoanOpen(false)}
            onApplyLoan={handleApplyLoan}
            onRepayLoan={handleRepayLoan}
            onOpenUpgrade={() => {
              setIsLoanOpen(false);
              setIsUpgradeOpen(true);
            }}
          />

          <WithdrawModal
            user={user}
            isOpen={isWithdrawOpen}
            onClose={() => setIsWithdrawOpen(false)}
            onWithdraw={handleWithdraw}
            onOpenUpgrade={() => {
              setIsWithdrawOpen(false);
              setIsUpgradeOpen(true);
            }}
          />
        </>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        initialMode={authMode}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setActiveTab('dashboard');
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
        }}
        prefilledRef={prefilledRef}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        pendingUpgrades={pendingUpgrades}
        onApproveUpgrade={handleAdminApprove}
        onAddVideoTask={handleAddVideoTask}
      />
    </div>
  );
}
