import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PAYMENT_CONFIG, INITIAL_VIDEO_TASKS, INITIAL_SOCIAL_TASKS, INITIAL_QUIZ_QUESTIONS } from './src/data/initialData';
import { UserProfile, Transaction, UpgradeRequest, LoanApplication, VideoTask, SocialTask, QuizQuestion, LoginLog, WithdrawalRequest } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data store with test run starting at 0 figures
interface AppDatabase {
  users: Record<string, UserProfile>;
  completedTasks: Record<string, string[]>; // userId -> taskId[]
  dailyQuizAnswered: Record<string, { date: string; answeredCount: number; answeredIds: string[] }>;
  transactions: Record<string, Transaction[]>; // userId -> Transaction[]
  upgradeRequests: UpgradeRequest[];
  withdrawals: WithdrawalRequest[];
  loans: Record<string, LoanApplication[]>; // userId -> LoanApplication[]
  videoTasks: VideoTask[];
  socialTasks: SocialTask[];
  quizQuestions: QuizQuestion[];
  loginLogs: LoginLog[];
}

const db: AppDatabase = {
  users: {
    'admin-root': {
      id: 'admin-root',
      fullName: 'Wisdom Dickson (Master Admin)',
      username: 'admin',
      email: 'admin@9japay.com.ng',
      phone: '+2348123456789',
      tier: 'PREMIUM',
      walletBalance: 0,
      totalEarned: 0,
      tasksCompleted: 0,
      referralsCount: 0,
      referralCode: 'ADMINVIP',
      loanBalance: 0,
      loanLimit: 50000,
      bankDetails: {
        bankName: 'FairMoney MFB',
        accountNumber: '5117425763',
        accountName: 'Wisdom Ebube Dickson'
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      upgradeStatus: 'APPROVED'
    },
    'user-wisdom': {
      id: 'user-wisdom',
      fullName: 'Wisdom Dickson',
      username: 'wisdom',
      email: 'dicksoneb103@gmail.com',
      phone: '+2348123456789',
      tier: 'PREMIUM',
      walletBalance: 0,
      totalEarned: 0,
      tasksCompleted: 0,
      referralsCount: 0,
      referralCode: 'WISDOM',
      loanBalance: 0,
      loanLimit: 50000,
      bankDetails: {
        bankName: 'FairMoney MFB',
        accountNumber: '5117425763',
        accountName: 'Wisdom Ebube Dickson'
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      upgradeStatus: 'APPROVED'
    }
  },
  completedTasks: {},
  dailyQuizAnswered: {},
  transactions: {},
  upgradeRequests: [],
  withdrawals: [],
  loans: {},
  videoTasks: [...INITIAL_VIDEO_TASKS],
  socialTasks: [...INITIAL_SOCIAL_TASKS],
  quizQuestions: [...INITIAL_QUIZ_QUESTIONS],
  loginLogs: [
    {
      id: 'log-seed-1',
      userId: 'user-wisdom',
      username: 'wisdom',
      fullName: 'Wisdom Dickson',
      email: 'dicksoneb103@gmail.com',
      tier: 'PREMIUM',
      loginTime: new Date(Date.now() - 3600000).toISOString(),
      device: 'Desktop Chrome / Windows',
      type: 'SIGNUP',
      details: 'Registered new account with referral code WISDOM'
    },
    {
      id: 'log-seed-2',
      userId: 'user-wisdom',
      username: 'wisdom',
      fullName: 'Wisdom Dickson',
      email: 'dicksoneb103@gmail.com',
      tier: 'PREMIUM',
      loginTime: new Date(Date.now() - 1800000).toISOString(),
      device: 'Desktop Chrome / Windows',
      type: 'UPGRADE_APPROVED',
      details: 'Upgraded to Lifetime VIP Premium (₦10,000)'
    },
    {
      id: 'log-seed-3',
      userId: 'admin-root',
      username: 'admin',
      fullName: 'Wisdom Dickson (Master Admin)',
      email: 'admin@9japay.com.ng',
      tier: 'PREMIUM',
      loginTime: new Date(Date.now() - 600000).toISOString(),
      device: 'Admin Secure Session',
      type: 'LOGIN',
      details: 'Master Admin authentication session established'
    }
  ]
};

// Helper to get or init user data
function ensureUserRecords(userId: string) {
  if (!db.completedTasks[userId]) db.completedTasks[userId] = [];
  if (!db.transactions[userId]) db.transactions[userId] = [];
  if (!db.loans[userId]) db.loans[userId] = [];
  
  const today = new Date().toISOString().split('T')[0];
  if (!db.dailyQuizAnswered[userId] || db.dailyQuizAnswered[userId].date !== today) {
    db.dailyQuizAnswered[userId] = {
      date: today,
      answeredCount: 0,
      answeredIds: []
    };
  }
}

// ----------------- API ROUTES ----------------- //

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: '9jaPay API' });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { fullName, username, email, phone, password, referralCode } = req.body;
  if (!fullName || !username || !email) {
    return res.status(400).json({ error: 'Full name, username and email are required.' });
  }

  const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  const existing = Object.values(db.users).find(u => u.username === cleanUsername || u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Username or Email is already registered. Please login.' });
  }

  const userId = `user-${Date.now()}`;
  const myRefCode = cleanUsername.toUpperCase();
  const nowStr = new Date().toISOString();

  // Fresh user starts with 0 Naira balance
  const newUser: UserProfile = {
    id: userId,
    fullName: fullName.trim(),
    username: cleanUsername,
    email: email.trim(),
    phone: phone?.trim() || '',
    password: password ? String(password).trim() : undefined,
    tier: 'FREE',
    walletBalance: 0,
    totalEarned: 0,
    tasksCompleted: 0,
    referralsCount: 0,
    referralCode: myRefCode,
    referredBy: referralCode?.trim() || undefined,
    loanBalance: 0,
    loanLimit: 20000,
    createdAt: nowStr,
    lastLoginAt: nowStr,
    upgradeStatus: 'NONE'
  };

  db.users[userId] = newUser;
  ensureUserRecords(userId);

  // Record signup in loginLogs for Admin tracking
  const signupLog: LoginLog = {
    id: `log-reg-${Date.now()}`,
    userId,
    username: cleanUsername,
    fullName: fullName.trim(),
    email: email.trim(),
    tier: 'FREE',
    loginTime: nowStr,
    device: req.headers['user-agent'] ? 'Web Browser' : 'Mobile Web',
    type: 'SIGNUP'
  };
  db.loginLogs.unshift(signupLog);

  // If referred by another user, increment referrer's count (Referral commission of ₦6,000 is awarded upon referee upgrading to Premium)
  if (referralCode) {
    const referrer = Object.values(db.users).find(u => u.referralCode.toUpperCase() === referralCode.toUpperCase());
    if (referrer) {
      referrer.referralsCount += 1;
      ensureUserRecords(referrer.id);
      db.transactions[referrer.id].unshift({
        id: `tx-ref-${Date.now()}`,
        userId: referrer.id,
        type: 'REFERRAL_BONUS',
        amount: 0,
        status: 'COMPLETED',
        description: `New Referral: @${cleanUsername} joined using your link. Upgrade reward (₦6,000) unlocks when they upgrade to VIP!`,
        date: new Date().toISOString(),
        reference: `9JA-REF-${Math.floor(100000 + Math.random() * 900000)}`
      });
    }
  }

  return res.json({ success: true, user: newUser });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body; // username or email
  if (!identifier) {
    return res.status(400).json({ error: 'Please enter your username or email' });
  }

  const clean = identifier.toLowerCase().trim();
  let user = Object.values(db.users).find(u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean);

  // Auto-detect and handle Admin users
  const isAdminId = clean === 'admin' || clean === 'admin@9japay.com.ng' || clean === 'wisdom' || clean === 'dicksoneb103@gmail.com';
  if (!user && isAdminId) {
    user = db.users['admin-root'] || db.users['user-wisdom'];
  }

  if (!user) {
    return res.status(404).json({ 
      error: 'Account not found. Please click "Create Account" below to sign up (Starts at ₦0 balance).' 
    });
  }

  if (user.status === 'TERMINATED') {
    return res.status(403).json({
      error: 'This account has been terminated by the 9jaPay administrative board. Access is strictly revoked.'
    });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({
      error: 'This account has been temporarily suspended by the administrator. Contact compliance@9japay.com.ng for review.'
    });
  }

  const nowStr = new Date().toISOString();
  user.lastLoginAt = nowStr;
  ensureUserRecords(user.id);

  // Record login event for Admin tracking
  const logItem: LoginLog = {
    id: `log-${Date.now()}`,
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    tier: user.tier,
    loginTime: nowStr,
    device: req.headers['user-agent'] ? 'Web Browser' : 'Mobile Web',
    type: 'LOGIN'
  };
  db.loginLogs.unshift(logItem);

  return res.json({ 
    success: true, 
    user,
    isAdmin: isAdminId || user.username === 'admin' || user.email === 'admin@9japay.com.ng'
  });
});

// Auth: Get User Profile
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const user = db.users[userId];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  ensureUserRecords(userId);
  return res.json({
    user,
    completedTasks: db.completedTasks[userId],
    quizProgress: db.dailyQuizAnswered[userId]
  });
});

// Update Bank Details
app.post('/api/users/:id/bank', (req, res) => {
  const userId = req.params.id;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { bankName, accountNumber, accountName } = req.body;
  if (!bankName || !accountNumber || !accountName) {
    return res.status(400).json({ error: 'Bank name, account number, and account name are required.' });
  }

  user.bankDetails = { bankName, accountNumber, accountName };
  return res.json({ success: true, bankDetails: user.bankDetails });
});

// Tasks: Get All Video Tasks
app.get('/api/tasks/videos', (req, res) => {
  const userId = req.query.userId as string;
  const user = userId ? db.users[userId] : null;
  const completed = userId && db.completedTasks[userId] ? db.completedTasks[userId] : [];

  const list = db.videoTasks.map(task => ({
    ...task,
    reward: user?.tier === 'PREMIUM' ? 1000 : 500,
    isCompleted: completed.includes(task.id),
    isLocked: task.isPremiumOnly && user?.tier !== 'PREMIUM'
  }));

  return res.json({ tasks: list });
});

// Tasks: Get All Social / Click Tasks
app.get('/api/tasks/socials', (req, res) => {
  const userId = req.query.userId as string;
  const user = userId ? db.users[userId] : null;
  const completed = userId && db.completedTasks[userId] ? db.completedTasks[userId] : [];

  const list = db.socialTasks.map(task => ({
    ...task,
    reward: user?.tier === 'PREMIUM' ? 1000 : 500,
    isCompleted: completed.includes(task.id),
    isLocked: task.isPremiumOnly && user?.tier !== 'PREMIUM'
  }));

  return res.json({ tasks: list });
});

// Tasks: Complete a Task
app.post('/api/tasks/complete', (req, res) => {
  const { userId, taskId, taskType } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  ensureUserRecords(userId);
  if (db.completedTasks[userId].includes(taskId)) {
    return res.status(400).json({ error: 'Task already completed!' });
  }

  let reward = 0;
  let title = 'Task Reward';

  if (taskType === 'video') {
    const task = db.videoTasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.isPremiumOnly && user.tier !== 'PREMIUM') {
      return res.status(403).json({ error: 'This is an exclusive task for Premium members. Please upgrade.' });
    }
    // Fixed image pricing: Watch / Video (Free) = ₦500, Watch / Video (Premium) = ₦1,000
    reward = user.tier === 'PREMIUM' ? 1000 : 500;
    title = `Watched: ${task.title.substring(0, 35)}...`;
  } else {
    const task = db.socialTasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Social task not found' });
    if (task.isPremiumOnly && user.tier !== 'PREMIUM') {
      return res.status(403).json({ error: 'This is an exclusive task for Premium members. Please upgrade.' });
    }
    // Fixed image pricing: Click / Ad (Free) = ₦500, Click / Ad (Premium) = ₦1,000
    reward = user.tier === 'PREMIUM' ? 1000 : 500;
    title = `Engaged: ${task.title.substring(0, 35)}...`;
  }

  // Credit user
  user.walletBalance += reward;
  user.totalEarned += reward;
  user.tasksCompleted += 1;
  db.completedTasks[userId].push(taskId);

  // Add transaction
  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    userId,
    type: 'TASK_EARN',
    amount: reward,
    status: 'COMPLETED',
    description: title,
    date: new Date().toISOString(),
    reference: `9JA-TSK-${Math.floor(100000 + Math.random() * 900000)}`
  };
  db.transactions[userId].unshift(tx);

  return res.json({
    success: true,
    reward,
    user,
    transaction: tx
  });
});

// Quiz: Get Daily Questions & Status
app.get('/api/quiz/today', (req, res) => {
  const userId = req.query.userId as string;
  const user = userId ? db.users[userId] : null;

  if (userId) {
    ensureUserRecords(userId);
  }

  const answeredInfo = userId ? db.dailyQuizAnswered[userId] : { answeredCount: 0, answeredIds: [] };
  const dailyLimit = user?.tier === 'PREMIUM' ? 10 : 1; // Free = 1/day, Premium = 10/day
  const remaining = Math.max(0, dailyLimit - answeredInfo.answeredCount);

  // Map questions without leaking answers unless already answered
  const questions = db.quizQuestions.map(q => {
    const isAnswered = answeredInfo.answeredIds.includes(q.id);
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      reward: user?.tier === 'PREMIUM' ? 1000 : 500,
      isAnswered,
      // only show correct answer if user answered
      correctOption: isAnswered ? q.correctOption : undefined,
      explanation: isAnswered ? q.explanation : undefined
    };
  });

  return res.json({
    questions,
    dailyLimit,
    answeredCount: answeredInfo.answeredCount,
    remainingQuestions: remaining,
    isPremium: user?.tier === 'PREMIUM'
  });
});

// Quiz: Submit Answer
app.post('/api/quiz/submit', (req, res) => {
  const { userId, questionId, selectedOption } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  ensureUserRecords(userId);
  const quizInfo = db.dailyQuizAnswered[userId];
  const dailyLimit = user.tier === 'PREMIUM' ? 10 : 1;

  if (quizInfo.answeredCount >= dailyLimit) {
    return res.status(403).json({
      error: user.tier === 'PREMIUM' 
        ? 'You have completed all 10 daily quiz questions! Come back tomorrow for new challenges.' 
        : 'Daily limit reached! Free plan users can only answer 1 question per day. Upgrade to Premium to unlock all 10 daily questions!'
    });
  }

  if (quizInfo.answeredIds.includes(questionId)) {
    return res.status(400).json({ error: 'You have already answered this question today.' });
  }

  const question = db.quizQuestions.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const isCorrect = selectedOption === question.correctOption;
  // Fixed image pricing: Quiz (Free) = ₦500, Quiz (Premium) = ₦1,000
  const reward = isCorrect ? (user.tier === 'PREMIUM' ? 1000 : 500) : 0;

  quizInfo.answeredCount += 1;
  quizInfo.answeredIds.push(questionId);

  if (isCorrect) {
    user.walletBalance += reward;
    user.totalEarned += reward;
    user.tasksCompleted += 1;

    const tx: Transaction = {
      id: `tx-quiz-${Date.now()}`,
      userId,
      type: 'QUIZ_EARN',
      amount: reward,
      status: 'COMPLETED',
      description: `Daily Quiz Reward: ${question.category}`,
      date: new Date().toISOString(),
      reference: `9JA-QZ-${Math.floor(100000 + Math.random() * 900000)}`
    };
    db.transactions[userId].unshift(tx);
  }

  return res.json({
    success: true,
    isCorrect,
    correctOption: question.correctOption,
    explanation: question.explanation,
    rewardEarned: reward,
    user,
    answeredCount: quizInfo.answeredCount,
    remainingQuestions: Math.max(0, dailyLimit - quizInfo.answeredCount)
  });
});

// Premium Upgrade: Payment Details
app.get('/api/upgrade/details', (req, res) => {
  res.json({
    config: PAYMENT_CONFIG,
    benefits: [
      '5× Higher Task Rewards (Unlock up to ₦10,000+ daily)',
      'Instant 9jaLoan/KlinLoan Access (Borrow up to ₦50,000)',
      'Unrestricted Daily 24/7 Bank Withdrawals',
      'Full Access to All 10 Daily Quiz Questions (+₦5,000/day)',
      'Exclusive High-Paying YouTube & Social Tasks',
      'VIP Priority Support on Telegram & WhatsApp',
      '₦6,000 Direct VIP Referral Upgrade Commissions'
    ]
  });
});

// Premium Upgrade: Submit Proof
app.post('/api/upgrade/submit-proof', (req, res) => {
  const { userId, senderName, senderBank, refNumber, receiptImage } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!senderName || !senderBank || !refNumber) {
    return res.status(400).json({ error: 'Sender name, bank name, and transaction reference are required.' });
  }

  const upgradeReq: UpgradeRequest = {
    id: `upg-${Date.now()}`,
    userId,
    username: user.username,
    amount: PAYMENT_CONFIG.upgradeFee,
    senderName: senderName.trim(),
    senderBank: senderBank.trim(),
    refNumber: refNumber.trim(),
    receiptImage: receiptImage || undefined,
    submittedAt: new Date().toISOString(),
    status: 'PENDING'
  };

  user.upgradeStatus = 'PENDING';
  user.upgradeProof = {
    senderName,
    senderBank,
    refNumber,
    receiptImage,
    submittedAt: upgradeReq.submittedAt
  };

  db.upgradeRequests.unshift(upgradeReq);

  // Record upgrade request event for Admin tracking
  db.loginLogs.unshift({
    id: `log-upg-req-${Date.now()}`,
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    tier: user.tier,
    loginTime: upgradeReq.submittedAt,
    device: req.headers['user-agent'] ? 'Web Browser' : 'Mobile Web',
    type: 'UPGRADE_REQUEST',
    details: `Submitted VIP Upgrade proof (₦${PAYMENT_CONFIG.upgradeFee.toLocaleString()} from ${senderBank} - Ref: ${refNumber})`
  });

  return res.json({
    success: true,
    message: 'Payment proof submitted successfully! Verification usually takes 5-15 minutes.',
    request: upgradeReq,
    user
  });
});

// Premium Upgrade: Fast Approve (Simulated instant or Admin approve)
app.post('/api/upgrade/approve', (req, res) => {
  const { userId, requestId } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.tier = 'PREMIUM';
  user.upgradeStatus = 'APPROVED';
  user.loanLimit = 50000; // boost loan limit to 50k

  if (requestId) {
    const reqItem = db.upgradeRequests.find(r => r.id === requestId);
    if (reqItem) reqItem.status = 'APPROVED';
  }

  // Credit referrer bonus if this user was referred by someone
  if (user.referredBy) {
    const referrer = Object.values(db.users).find(u => u.referralCode.toUpperCase() === user.referredBy?.toUpperCase());
    if (referrer) {
      referrer.vipReferralsCount = (referrer.vipReferralsCount || 0) + 1;
      ensureUserRecords(referrer.id);

      if (referrer.tier === 'PREMIUM') {
        // Premium members get ₦6,000 commission credited directly to wallet
        referrer.walletBalance += 6000;
        referrer.totalEarned += 6000;
        db.transactions[referrer.id].unshift({
          id: `tx-ref-prem-${Date.now()}`,
          userId: referrer.id,
          type: 'REFERRAL_BONUS',
          amount: 6000,
          status: 'COMPLETED',
          description: `VIP Referral Commission (+₦6,000) for inviting @${user.username} who upgraded to Premium`,
          date: new Date().toISOString(),
          reference: `9JA-VIPCOMM-${Math.floor(100000 + Math.random() * 900000)}`
        });
      } else {
        // Free referrers DO NOT get access to ₦6,000 reward as they haven't upgraded
        referrer.lockedReferralCommission = (referrer.lockedReferralCommission || 0) + 6000;
        db.transactions[referrer.id].unshift({
          id: `tx-ref-locked-${Date.now()}`,
          userId: referrer.id,
          type: 'REFERRAL_BONUS',
          amount: 6000,
          status: 'PENDING',
          description: `🔒 ₦6,000 VIP Commission Locked: @${user.username} upgraded to VIP. Upgrade your account to Premium to unlock this reward!`,
          date: new Date().toISOString(),
          reference: `9JA-LCK-${Math.floor(100000 + Math.random() * 900000)}`
        });
      }
    }
  }

  // If the upgrading user had accumulated locked referral commissions from past invites, unlock them now!
  if (user.lockedReferralCommission && user.lockedReferralCommission > 0) {
    const unlockedAmount = user.lockedReferralCommission;
    user.walletBalance += unlockedAmount;
    user.totalEarned += unlockedAmount;
    user.lockedReferralCommission = 0;
    ensureUserRecords(userId);
    db.transactions[userId].unshift({
      id: `tx-ref-unlocked-${Date.now()}`,
      userId,
      type: 'REFERRAL_BONUS',
      amount: unlockedAmount,
      status: 'COMPLETED',
      description: `🎉 Unlocked ₦${unlockedAmount.toLocaleString()} in pending VIP Referral Commissions upon upgrading!`,
      date: new Date().toISOString(),
      reference: `9JA-UNL-${Math.floor(100000 + Math.random() * 900000)}`
    });
  }

  // Log transaction
  db.transactions[userId].unshift({
    id: `tx-upg-${Date.now()}`,
    userId,
    type: 'UPGRADE_PAYMENT',
    amount: PAYMENT_CONFIG.upgradeFee,
    status: 'COMPLETED',
    description: 'Upgraded to 9jaPay VIP Premium Lifetime Plan',
    date: new Date().toISOString(),
    reference: `9JA-VIP-${Math.floor(100000 + Math.random() * 900000)}`
  });

  // Record upgrade approval event for live admin stream
  db.loginLogs.unshift({
    id: `log-upg-app-${Date.now()}`,
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    tier: 'PREMIUM',
    loginTime: new Date().toISOString(),
    device: 'Admin Approval Desk',
    type: 'UPGRADE_APPROVED',
    details: `VIP Upgrade approved! Unlocked ₦50k loan limit and VIP task rates.`
  });

  return res.json({
    success: true,
    message: 'Congratulations! Account upgraded to PREMIUM successfully.',
    user
  });
});

// Loan (9jaLoan / KlinLoan): Apply
app.post('/api/loan/apply', (req, res) => {
  const { userId, amount, tenureDays } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.tier !== 'PREMIUM') {
    return res.status(403).json({
      error: '9jaLoan is an exclusive feature for Premium members. Upgrade to Premium to unlock instant micro-loans up to ₦50,000!'
    });
  }

  const loanAmount = Number(amount);
  if (!loanAmount || loanAmount < 5000 || loanAmount > user.loanLimit) {
    return res.status(400).json({ error: `Loan amount must be between ₦5,000 and ₦${user.loanLimit.toLocaleString()}` });
  }

  if (user.loanBalance > 0) {
    return res.status(400).json({ error: 'You have an active outstanding loan. Please repay your current loan before applying for a new one.' });
  }

  const interestRate = 0.05; // 5% flat interest
  const totalRepayment = Math.round(loanAmount * (1 + interestRate));
  const now = new Date();
  const dueDate = new Date(now.getTime() + (tenureDays || 14) * 24 * 3600 * 1000);

  const loanApp: LoanApplication = {
    id: `loan-${Date.now()}`,
    userId,
    amount: loanAmount,
    tenureDays: tenureDays || 14,
    interestRate: 5,
    totalRepayment,
    status: 'ACTIVE',
    disbursedDate: now.toISOString(),
    dueDate: dueDate.toISOString()
  };

  ensureUserRecords(userId);
  db.loans[userId].push(loanApp);

  // Disburse funds directly into wallet balance
  user.walletBalance += loanAmount;
  user.loanBalance = totalRepayment;

  db.transactions[userId].unshift({
    id: `tx-loan-${Date.now()}`,
    userId,
    type: 'LOAN_DISBURSED',
    amount: loanAmount,
    status: 'COMPLETED',
    description: `9jaLoan Disbursed (${tenureDays || 14} days tenure @ 5% interest)`,
    date: now.toISOString(),
    reference: `9JA-LN-${Math.floor(100000 + Math.random() * 900000)}`
  });

  return res.json({
    success: true,
    message: `₦${loanAmount.toLocaleString()} loan disbursed instantly to your available balance!`,
    loan: loanApp,
    user
  });
});

// Loan: Repay
app.post('/api/loan/repay', (req, res) => {
  const { userId } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.loanBalance <= 0) {
    return res.status(400).json({ error: 'You do not have any outstanding loan balance.' });
  }

  if (user.walletBalance < user.loanBalance) {
    return res.status(400).json({
      error: `Insufficient wallet balance to repay loan. You need ₦${user.loanBalance.toLocaleString()} but have ₦${user.walletBalance.toLocaleString()}. Please complete more tasks or earn bonuses.`
    });
  }

  const repayAmount = user.loanBalance;
  user.walletBalance -= repayAmount;
  user.loanBalance = 0;

  // Mark loan as paid
  ensureUserRecords(userId);
  const activeLoan = db.loans[userId].find(l => l.status === 'ACTIVE');
  if (activeLoan) activeLoan.status = 'PAID';

  db.transactions[userId].unshift({
    id: `tx-repay-${Date.now()}`,
    userId,
    type: 'LOAN_REPAID',
    amount: repayAmount,
    status: 'COMPLETED',
    description: '9jaLoan Repayment Cleared in Full',
    date: new Date().toISOString(),
    reference: `9JA-RPY-${Math.floor(100000 + Math.random() * 900000)}`
  });

  return res.json({
    success: true,
    message: 'Loan successfully repaid in full! Your credit score and loan limit have increased.',
    user
  });
});

// Withdrawals: Request Withdrawal
app.post('/api/withdraw', (req, res) => {
  const { userId, amount, bankName, accountNumber, accountName } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const withdrawAmount = Number(amount);
  const minWithdrawal = 12000; // ₦12,000 for both free and premium users

  if (!withdrawAmount || withdrawAmount < minWithdrawal) {
    return res.status(400).json({
      error: `Minimum withdrawal amount is ₦${minWithdrawal.toLocaleString()} for all members.`
    });
  }

  if (withdrawAmount > user.walletBalance) {
    return res.status(400).json({
      error: `Insufficient wallet balance. You have ₦${user.walletBalance.toLocaleString()} available.`
    });
  }

  if (!bankName || !accountNumber || !accountName) {
    return res.status(400).json({ error: 'Please provide valid bank name, account number, and recipient name.' });
  }

  // Deduct from balance
  user.walletBalance -= withdrawAmount;

  // Save bank details for convenience
  user.bankDetails = { bankName, accountNumber, accountName };

  const ref = `9JA-WD-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const withdrawalRecord: WithdrawalRequest = {
    id: `wd-${Date.now()}`,
    userId,
    username: user.username,
    amount: withdrawAmount,
    bankName,
    accountNumber,
    accountName,
    status: 'COMPLETED',
    date: now,
    reference: ref
  };
  db.withdrawals.unshift(withdrawalRecord);

  const tx: Transaction = {
    id: `tx-wd-${Date.now()}`,
    userId,
    type: 'WITHDRAWAL',
    amount: withdrawAmount,
    status: 'COMPLETED',
    description: `Bank Transfer to ${bankName} (${accountNumber}) - ${accountName}`,
    date: now,
    reference: ref
  };

  ensureUserRecords(userId);
  db.transactions[userId].unshift(tx);

  return res.json({
    success: true,
    message: `Withdrawal of ₦${withdrawAmount.toLocaleString()} to ${accountName} (${bankName}) has been processed successfully!`,
    user,
    transaction: tx,
    withdrawal: withdrawalRecord
  });
});

// Transactions: Get User History
app.get('/api/transactions/:userId', (req, res) => {
  const userId = req.params.userId;
  ensureUserRecords(userId);
  return res.json({ transactions: db.transactions[userId] || [] });
});

// Referrals: Get User Referrals Info
app.get('/api/referrals/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Find all users who used this user's referralCode
  const referredUsers = Object.values(db.users).filter(
    u => u.referredBy?.toUpperCase() === user.referralCode.toUpperCase()
  );

  return res.json({
    referralCode: user.referralCode,
    totalReferrals: user.referralsCount,
    totalBonusEarned: referredUsers.length * 200 + referredUsers.filter(u => u.tier === 'PREMIUM').length * 1500,
    referredUsers: referredUsers.map(u => ({
      username: u.username,
      fullName: u.fullName,
      tier: u.tier,
      joinedDate: u.createdAt
    }))
  });
});

// Admin: Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const validAdminUsernames = ['admin', 'admin@9japay.com.ng', 'wisdom', 'dicksoneb103@gmail.com'];
  const validPasswords = ['admin9japay2025', 'admin123', 'admin', 'password123'];

  const cleanUser = username?.toLowerCase().trim();
  const cleanPass = password?.trim();

  if (validAdminUsernames.includes(cleanUser) && validPasswords.includes(cleanPass)) {
    return res.json({
      success: true,
      token: 'admin_session_token_' + Date.now(),
      admin: {
        username: cleanUser,
        email: 'admin@9japay.com.ng',
        name: 'Master Administrator (Wisdom Dickson)',
        role: 'SUPER_ADMIN'
      }
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials. Please enter valid admin username and password.' });
});

// Leaderboard: Public & User Referral Champions
app.get('/api/leaderboard/referrals', (req, res) => {
  const currentUserId = req.query.userId as string;
  const allUsersList = Object.values(db.users);

  // Sort users by referralsCount desc, then totalEarned desc
  const sorted = [...allUsersList].sort((a, b) => {
    if ((b.referralsCount || 0) !== (a.referralsCount || 0)) {
      return (b.referralsCount || 0) - (a.referralsCount || 0);
    }
    return (b.totalEarned || 0) - (a.totalEarned || 0);
  });

  const leaderboard = sorted.map((u, idx) => {
    // Calculate total referral earnings for this user
    const userTxs = db.transactions[u.id] || [];
    const referralEarned = userTxs
      .filter(t => t.type === 'REFERRAL_BONUS' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      rank: idx + 1,
      userId: u.id,
      username: u.username,
      fullName: u.fullName,
      tier: u.tier,
      totalReferrals: u.referralsCount || 0,
      vipReferrals: u.vipReferralsCount || 0,
      totalReferralEarned: referralEarned,
      isCurrentUser: currentUserId ? u.id === currentUserId : false
    };
  });

  const currentUserEntry = currentUserId ? leaderboard.find(e => e.userId === currentUserId) || null : null;

  return res.json({
    success: true,
    leaderboard,
    currentUser: currentUserEntry,
    totalReferralsPlatform: allUsersList.reduce((sum, u) => sum + (u.referralsCount || 0), 0)
  });
});

// Admin: Get all stats, full user ledger, login tracking & upgrade proofs
app.get('/api/admin/overview', (req, res) => {
  const allUsersList = Object.values(db.users);
  const totalUsers = allUsersList.length;
  const premiumUsers = allUsersList.filter(u => u.tier === 'PREMIUM').length;
  const freeUsers = allUsersList.filter(u => u.tier === 'FREE').length;
  
  // Total Revenue = ₦10,000 * premium users count
  const totalRevenue = premiumUsers * PAYMENT_CONFIG.upgradeFee;

  const totalPaidOut = Object.values(db.transactions)
    .flat()
    .filter(t => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTasksCompleted = allUsersList.reduce((sum, u) => sum + (u.tasksCompleted || 0), 0);
  const totalWalletBalances = allUsersList.reduce((sum, u) => sum + (u.walletBalance || 0), 0);

  const pendingUpgrades = db.upgradeRequests.filter(r => r.status === 'PENDING');
  const approvedUpgrades = db.upgradeRequests.filter(r => r.status === 'APPROVED');

  return res.json({
    totalUsers,
    premiumUsers,
    freeUsers,
    totalRevenue,
    totalPaidOut,
    totalTasksCompleted,
    totalWalletBalances,
    pendingUpgrades,
    approvedUpgrades,
    withdrawals: db.withdrawals || [],
    allUsers: allUsersList,
    loginLogs: db.loginLogs || []
  });
});

// Admin: Approve / Mark Withdrawal Processed
app.post('/api/admin/withdrawal/approve', (req, res) => {
  const { withdrawalId } = req.body;
  const wd = db.withdrawals.find(w => w.id === withdrawalId);
  if (!wd) return res.status(404).json({ error: 'Withdrawal record not found' });

  wd.status = 'COMPLETED';
  return res.json({ success: true, withdrawal: wd, message: 'Withdrawal marked as completed and paid out.' });
});

// Admin: Reject Withdrawal and Refund User
app.post('/api/admin/withdrawal/reject', (req, res) => {
  const { withdrawalId, reason } = req.body;
  const wd = db.withdrawals.find(w => w.id === withdrawalId);
  if (!wd) return res.status(404).json({ error: 'Withdrawal record not found' });

  if (wd.status === 'REJECTED') {
    return res.status(400).json({ error: 'Withdrawal already rejected and refunded.' });
  }

  wd.status = 'REJECTED';
  const user = db.users[wd.userId];
  if (user) {
    // Refund balance to user
    user.walletBalance += wd.amount;
    ensureUserRecords(user.id);
    db.transactions[user.id].unshift({
      id: `tx-wd-refund-${Date.now()}`,
      userId: user.id,
      type: 'TASK_EARN',
      amount: wd.amount,
      status: 'COMPLETED',
      description: `Withdrawal Refund (Rejected: ${reason || 'Incorrect account details'})`,
      date: new Date().toISOString(),
      reference: `9JA-REFUND-${Math.floor(100000 + Math.random() * 900000)}`
    });
  }

  return res.json({ success: true, withdrawal: wd, message: 'Withdrawal rejected and funds refunded to user wallet.' });
});

// Admin: Toggle User Membership Tier (Free <-> Premium)
app.post('/api/admin/user/toggle-tier', (req, res) => {
  const { userId, newTier } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.tier = newTier === 'PREMIUM' ? 'PREMIUM' : 'FREE';
  user.upgradeStatus = user.tier === 'PREMIUM' ? 'APPROVED' : 'NONE';
  if (user.tier === 'PREMIUM') {
    user.loanLimit = 50000;
  }

  ensureUserRecords(userId);
  db.transactions[userId].unshift({
    id: `tx-admin-tier-${Date.now()}`,
    userId,
    type: 'UPGRADE_PAYMENT',
    amount: user.tier === 'PREMIUM' ? PAYMENT_CONFIG.upgradeFee : 0,
    status: 'COMPLETED',
    description: `Admin manual tier update to ${user.tier}`,
    date: new Date().toISOString(),
    reference: `9JA-ADM-${Math.floor(100000 + Math.random() * 900000)}`
  });

  return res.json({ success: true, user });
});

// Admin: Adjust User Balance (Add or Deduct)
app.post('/api/admin/user/adjust-balance', (req, res) => {
  const { userId, amount, action, reason } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid positive amount' });
  }

  if (action === 'DEDUCT') {
    user.walletBalance = Math.max(0, user.walletBalance - numAmount);
  } else {
    user.walletBalance += numAmount;
    user.totalEarned += numAmount;
  }

  ensureUserRecords(userId);
  db.transactions[userId].unshift({
    id: `tx-adm-bal-${Date.now()}`,
    userId,
    type: action === 'DEDUCT' ? 'WITHDRAWAL' : 'TASK_EARN',
    amount: numAmount,
    status: 'COMPLETED',
    description: `Admin Balance Adjustment (${action}): ${reason || 'Manual Adjustment'}`,
    date: new Date().toISOString(),
    reference: `9JA-ADM-BAL-${Math.floor(100000 + Math.random() * 900000)}`
  });

  return res.json({ success: true, user });
});

// Admin: Reject Payment Proof
app.post('/api/admin/upgrade/reject', (req, res) => {
  const { requestId, reason } = req.body;
  const request = db.upgradeRequests.find(r => r.id === requestId);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.status = 'REJECTED';
  const user = db.users[request.userId];
  if (user) {
    user.upgradeStatus = 'REJECTED';
  }

  return res.json({ success: true, request, message: 'Upgrade request rejected.' });
});

// Admin: Update User Status (ACTIVE, SUSPENDED, TERMINATED)
app.post('/api/admin/user/status', (req, res) => {
  const { userId, status, reason } = req.body;
  const user = db.users[userId];
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.status = status;
  ensureUserRecords(userId);

  return res.json({ 
    success: true, 
    user, 
    message: `Account status updated to ${status}.${reason ? ` Reason: ${reason}` : ''}` 
  });
});

// Admin: Delete User Permanently
app.delete('/api/admin/user/:id', (req, res) => {
  const userId = req.params.id;
  if (!db.users[userId]) return res.status(404).json({ error: 'User not found' });

  delete db.users[userId];
  delete db.completedTasks[userId];
  delete db.transactions[userId];
  delete db.dailyQuizAnswered[userId];

  return res.json({ success: true, message: 'User account removed.' });
});

// Admin: Get all Tasks and Quizzes for management
app.get('/api/admin/content-items', (req, res) => {
  return res.json({
    videoTasks: db.videoTasks,
    socialTasks: db.socialTasks,
    quizQuestions: db.quizQuestions
  });
});

// Admin: Add or update Video Task
app.post('/api/admin/video-tasks', (req, res) => {
  const { id, title, channelName, youtubeId, reward, durationSeconds, requiredWatchSeconds, category, isPremiumOnly, thumbnailUrl } = req.body;
  if (!title || !youtubeId || !reward) {
    return res.status(400).json({ error: 'Title, YouTube ID, and reward are required.' });
  }

  let cleanId = youtubeId.trim();
  if (cleanId.includes('youtu.be/')) {
    cleanId = cleanId.split('youtu.be/')[1].split('?')[0];
  } else if (cleanId.includes('watch?v=')) {
    cleanId = cleanId.split('watch?v=')[1].split('&')[0];
  }

  const taskData: VideoTask = {
    id: id || `vid-${Date.now()}`,
    title: title.trim(),
    channelName: channelName?.trim() || '9jaPay Partner',
    youtubeId: cleanId,
    reward: Number(reward),
    durationSeconds: Number(durationSeconds) || 120,
    requiredWatchSeconds: Number(requiredWatchSeconds) || 30,
    category: category || 'Tutorial',
    isPremiumOnly: Boolean(isPremiumOnly),
    thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`,
    viewsCount: '1.5K'
  };

  if (id) {
    const existingIndex = db.videoTasks.findIndex(t => t.id === id);
    if (existingIndex >= 0) {
      db.videoTasks[existingIndex] = taskData;
    } else {
      db.videoTasks.unshift(taskData);
    }
  } else {
    db.videoTasks.unshift(taskData);
  }

  return res.json({ success: true, task: taskData, message: 'Video task published successfully!' });
});

// Admin: Delete Video Task
app.delete('/api/admin/video-tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.videoTasks = db.videoTasks.filter(t => t.id !== taskId);
  return res.json({ success: true, message: 'Video task deleted.' });
});

// Admin: Add or update Social Task
app.post('/api/admin/social-tasks', (req, res) => {
  const { id, title, platform, actionType, reward, actionUrl, timerSeconds, isPremiumOnly, instructions } = req.body;
  if (!title || !actionUrl || !reward) {
    return res.status(400).json({ error: 'Title, URL, and reward are required.' });
  }

  const socialData: SocialTask = {
    id: id || `soc-${Date.now()}`,
    title: title.trim(),
    platform: platform || 'Telegram',
    actionType: actionType || 'join',
    reward: Number(reward),
    actionUrl: actionUrl.trim(),
    timerSeconds: Number(timerSeconds) || 15,
    isPremiumOnly: Boolean(isPremiumOnly),
    instructions: instructions || 'Click the link, complete engagement, and return to claim earnings.'
  };

  if (id) {
    const idx = db.socialTasks.findIndex(t => t.id === id);
    if (idx >= 0) {
      db.socialTasks[idx] = socialData;
    } else {
      db.socialTasks.unshift(socialData);
    }
  } else {
    db.socialTasks.unshift(socialData);
  }

  return res.json({ success: true, task: socialData, message: 'Social task published successfully!' });
});

// Admin: Delete Social Task
app.delete('/api/admin/social-tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.socialTasks = db.socialTasks.filter(t => t.id !== taskId);
  return res.json({ success: true, message: 'Social task deleted.' });
});

// Admin: Add or Update Quiz Question
app.post('/api/admin/quiz-questions', (req, res) => {
  const { id, question, options, correctOption, explanation, reward, category } = req.body;
  if (!question || !options || !correctOption) {
    return res.status(400).json({ error: 'Question text, 4 options, and correct answer option are required.' });
  }

  const quizData: QuizQuestion = {
    id: id || `q-${Date.now()}`,
    question: question.trim(),
    options: {
      A: options.A.trim(),
      B: options.B.trim(),
      C: options.C.trim(),
      D: options.D.trim()
    },
    correctOption: correctOption as 'A' | 'B' | 'C' | 'D',
    explanation: explanation?.trim() || 'Verified by 9jaPay Knowledge Engine.',
    reward: Number(reward) || 500,
    category: category?.trim() || 'General Knowledge'
  };

  if (id) {
    const idx = db.quizQuestions.findIndex(q => q.id === id);
    if (idx >= 0) {
      db.quizQuestions[idx] = quizData;
    } else {
      db.quizQuestions.push(quizData);
    }
  } else {
    db.quizQuestions.push(quizData);
  }

  return res.json({ success: true, quiz: quizData, message: 'Quiz question published and active!' });
});

// Admin: Delete Quiz Question
app.delete('/api/admin/quiz-questions/:id', (req, res) => {
  const qId = req.params.id;
  db.quizQuestions = db.quizQuestions.filter(q => q.id !== qId);
  return res.json({ success: true, message: 'Quiz question removed.' });
});

// ----------------- VITE MIDDLEWARE / PRODUCTION ----------------- //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`9jaPay server running smoothly on http://localhost:${PORT}`);
  });
}

startServer();
