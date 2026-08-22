export type MembershipTier = 'FREE' | 'PREMIUM';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  tier: MembershipTier;
  walletBalance: number;
  totalEarned: number;
  tasksCompleted: number;
  referralsCount: number;
  referralCode: string;
  referredBy?: string;
  lockedReferralCommission?: number; // ₦6,000 VIP commissions locked until user upgrades
  vipReferralsCount?: number; // count of referred friends who became VIP
  loanBalance: number;
  loanLimit: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
  lastLoginAt?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  upgradeStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  upgradeProof?: {
    senderName: string;
    senderBank: string;
    refNumber: string;
    receiptImage?: string;
    submittedAt: string;
  };
}

export interface ReferralLeaderboardEntry {
  rank: number;
  userId?: string;
  username: string;
  fullName?: string;
  tier: MembershipTier;
  totalReferrals: number;
  vipReferrals?: number;
  totalReferralEarned?: number;
  prize?: string;
  isCurrentUser?: boolean;
}

export interface LoginLog {
  id: string;
  userId: string;
  username?: string;
  fullName?: string;
  email: string;
  tier?: MembershipTier;
  loginTime?: string;
  timestamp?: string;
  ipAddress?: string;
  device?: string;
  type?: 'SIGNUP' | 'LOGIN' | 'UPGRADE_REQUEST' | 'UPGRADE_APPROVED';
  details?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username?: string;
  userFullName?: string;
  userEmail?: string;
  userTier?: MembershipTier;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  date?: string;
  requestedAt?: string;
  reference?: string;
}

export interface AdminOverviewData {
  totalUsers: number;
  activeUsers?: number;
  premiumUsers?: number;
  freeUsers?: number;
  paidPremiumMembers?: number;
  totalRevenue: number;
  totalPaidOut?: number;
  totalPayoutsDisbursed?: number;
  totalTasksCompleted?: number;
  totalWalletBalances?: number;
  pendingUpgradesCount?: number;
  pendingWithdrawalsCount?: number;
  pendingUpgrades: UpgradeRequest[];
  approvedUpgrades?: UpgradeRequest[];
  withdrawals?: WithdrawalRequest[];
  pendingWithdrawals?: WithdrawalRequest[];
  users?: UserProfile[];
  allUsers?: UserProfile[];
  loginLogs?: LoginLog[];
  recentLoginLogs?: LoginLog[];
}

export interface VideoTask {
  id: string;
  title: string;
  channelName: string;
  youtubeId: string;
  reward: number; // in NGN
  durationSeconds: number;
  requiredWatchSeconds: number;
  category: 'Tech' | 'Finance' | 'Entertainment' | 'Crypto' | 'Tutorial';
  isPremiumOnly: boolean;
  thumbnailUrl: string;
  viewsCount?: string;
  isCompleted?: boolean;
}

export interface SocialTask {
  id: string;
  title: string;
  platform: 'Telegram' | 'Twitter / X' | 'WhatsApp' | 'TikTok' | 'Instagram' | 'Facebook' | 'YouTube' | 'Threads' | 'Discord' | 'Website / Ad';
  actionType: 'join' | 'follow' | 'like' | 'visit' | 'subscribe' | 'repost' | 'comment';
  reward: number; // in NGN
  actionUrl: string;
  timerSeconds: number;
  isPremiumOnly: boolean;
  instructions: string;
  description?: string;
  isCompleted?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  reward: number; // in NGN (e.g. 500)
  category: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'TASK_EARN' | 'QUIZ_EARN' | 'REFERRAL_BONUS' | 'UPGRADE_PAYMENT' | 'VIP_UPGRADE' | 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN_DISBURSED' | 'LOAN_REPAID' | 'WELCOME_BONUS';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
  date?: string;
  createdAt?: string;
  reference?: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  tenureDays: number;
  interestRate: number; // e.g. 5%
  totalRepayment: number;
  status: 'ACTIVE' | 'PAID' | 'OVERDUE';
  disbursedDate: string;
  dueDate: string;
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  username: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  amount: number;
  senderName: string;
  senderBank: string;
  refNumber: string;
  receiptImage?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
