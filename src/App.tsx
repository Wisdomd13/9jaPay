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

export default function App() {
  // User State
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
    // Default logged in demo user starts with 0 Naira as requested
    return {
      id: 'user-demo',
      fullName: 'Tunde Adeleke',
      username: 'tundegold',
      email: 'tunde@example.com',
      phone: '+2348123456789',
      tier: 'FREE',
      walletBalance: 0, // Starts at 0 Naira as requested
      totalEarned: 0,
      tasksCompleted: 0,
      referralsCount: 0,
      referralCode: 'TUNDE2026',
      loanBalance: 0,
      loanLimit: 20000,
      bankDetails: {
        bankName: 'OPay (PayCom)',
        accountNumber: '8123456789',
        accountName: 'Tunde Adeleke'
      },
      createdAt: new Date().toISOString(),
      upgradeStatus: 'NONE'
    };
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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

  // Fetch updated data from API when user changes
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch user status
      const userRes = await fetch(`/api/users/${user.id}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // 2. Fetch video tasks
      const vidRes = await fetch(`/api/tasks/videos?userId=${user.id}`);
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        setVideoTasks(vidData.tasks);
      }

      // 3. Fetch social tasks
      const socRes = await fetch(`/api/tasks/socials?userId=${user.id}`);
      if (socRes.ok) {
        const socData = await socRes.json();
        setSocialTasks(socData.tasks);
      }

      // 4. Fetch quiz info
      const quizRes = await fetch(`/api/quiz/today?userId=${user.id}`);
      if (quizRes.ok) {
        const qData = await quizRes.json();
        setQuizQuestions(qData.questions);
        setQuizAnsweredCount(qData.answeredCount);
        setQuizDailyLimit(qData.dailyLimit);
      }

      // 5. Fetch transactions
      const txRes = await fetch(`/api/transactions/${user.id}`);
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.transactions?.length) {
          setTransactions(txData.transactions);
        }
      }

      // 6. Fetch admin overview
      const adminRes = await fetch('/api/admin/overview');
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setPendingUpgrades(adminData.pendingUpgrades || []);
      }
    } catch {
      // API fallback
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

    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          taskId,
          taskType: type
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete task');

      setUser(data.user);
      if (data.transaction) {
        setTransactions(prev => [data.transaction, ...prev]);
      }

      if (type === 'video') {
        setVideoTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, isCompleted: true } : t))
        );
      } else {
        setSocialTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, isCompleted: true } : t))
        );
      }
    } catch (err: unknown) {
      // Fallback local update if network issue
      const reward = user.tier === 'PREMIUM' ? 1000 : 500;

      const updatedUser: UserProfile = {
        ...user,
        walletBalance: user.walletBalance + reward,
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

      setTransactions(prev => [
        {
          id: `tx-${Date.now()}`,
          userId: user.id,
          type: 'TASK_EARN',
          amount: reward,
          status: 'COMPLETED',
          description: type === 'video' ? 'Completed YouTube Video Task (+₦' + reward.toLocaleString() + ')' : 'Completed Social Engagement Task (+₦' + reward.toLocaleString() + ')',
          date: new Date().toISOString(),
          reference: `9JA-TSK-${Math.floor(100000 + Math.random() * 900000)}`
        },
        ...prev
      ]);
    }
  };

  // Submit Quiz Answer
  const handleSubmitQuiz = async (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D') => {
    if (!user) {
      setIsAuthOpen(true);
      throw new Error('Please login to answer quizzes');
    }

    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        questionId,
        selectedOption
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit answer');

    setUser(data.user);
    setQuizAnsweredCount(data.answeredCount);

    if (data.isCorrect) {
      setTransactions(prev => [
        {
          id: `tx-quiz-${Date.now()}`,
          userId: user.id,
          type: 'QUIZ_EARN',
          amount: data.rewardEarned,
          status: 'COMPLETED',
          description: 'Daily Quiz Reward Increment',
          date: new Date().toISOString(),
          reference: `9JA-QZ-${Math.floor(100000 + Math.random() * 900000)}`
        },
        ...prev
      ]);
    }

    return {
      isCorrect: data.isCorrect,
      correctOption: data.correctOption,
      explanation: data.explanation,
      rewardEarned: data.rewardEarned
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

    const res = await fetch('/api/upgrade/submit-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        ...proofData
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit proof');

    setUser(data.user);
    if (data.request) {
      setPendingUpgrades(prev => [data.request, ...prev]);
    }
  };

  // Fast Instant Approve Upgrade
  const handleFastApprove = async () => {
    if (!user) return;

    const res = await fetch('/api/upgrade/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setQuizDailyLimit(10);
      fetchUserData();
    } else {
      // Fallback
      setUser(prev => prev ? { ...prev, tier: 'PREMIUM', loanLimit: 50000 } : null);
      setQuizDailyLimit(10);
    }
  };

  // Admin Approve Upgrade Request
  const handleAdminApprove = async (targetUserId: string, requestId: string) => {
    const res = await fetch('/api/upgrade/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId, requestId })
    });

    if (res.ok) {
      setPendingUpgrades(prev => prev.filter(r => r.id !== requestId));
      if (user?.id === targetUserId) {
        const data = await res.json();
        setUser(data.user);
      }
    }
  };

  // Apply Loan
  const handleApplyLoan = async (amount: number, tenureDays: number) => {
    if (!user) return;

    const res = await fetch('/api/loan/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        amount,
        tenureDays
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Loan application failed');

    setUser(data.user);
    fetchUserData();
  };

  // Repay Loan
  const handleRepayLoan = async () => {
    if (!user) return;

    const res = await fetch('/api/loan/repay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Loan repayment failed');

    setUser(data.user);
    fetchUserData();
  };

  // Withdraw
  const handleWithdraw = async (amount: number, bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    if (!user) return;

    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        amount,
        ...bankDetails
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Withdrawal failed');

    setUser(data.user);
    if (data.transaction) {
      setTransactions(prev => [data.transaction, ...prev]);
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
    const res = await fetch('/api/admin/video-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add task');

    setVideoTasks(prev => [data.task, ...prev]);
  };

  // Open Auth Modal
  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Logout
  const handleLogout = () => {
    soundManager.playClickSound();
    setUser(null);
    setActiveTab('landing');
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
        setActiveTab={setActiveTab}
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
                onSelectTab={setActiveTab}
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
        setActiveTab={setActiveTab}
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
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setActiveTab('dashboard');
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
