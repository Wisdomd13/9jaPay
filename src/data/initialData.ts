import { VideoTask, SocialTask, QuizQuestion } from '../types';

export const PAYMENT_CONFIG = {
  upgradeFee: 10000,
  currency: 'NGN',
  currencySymbol: '₦',
  bankName: 'FairMoney MFB',
  accountNumber: '5117425763',
  accountName: 'Wisdom Ebube Dickson',
  supportEmail: 'support@9japay.com.ng',
  supportTelegram: 'https://t.me/ninjapay_official',
  supportWhatsapp: '+2348000000000'
};

/**
 * CUSTOM YOUTUBE VIDEO TASKS
 * You can easily add, edit, or remove YouTube videos here.
 * Set `youtubeId` to any YouTube video code (e.g., 'dQw4w9WgXcQ' from 'https://youtube.com/watch?v=dQw4w9WgXcQ')
 */
export const INITIAL_VIDEO_TASKS: VideoTask[] = [
  {
    id: 'vid-1',
    title: 'How To Make ₦50,000 Daily in Nigeria Online: Step by Step Guide',
    channelName: 'Wealth Academy Africa',
    youtubeId: 'jNQXAC9IVRw',
    reward: 500,
    durationSeconds: 120,
    requiredWatchSeconds: 30,
    category: 'Finance',
    isPremiumOnly: false, // 1st video free for everyone
    thumbnailUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format&fit=crop&q=80',
    viewsCount: '124K'
  },
  {
    id: 'vid-2',
    title: 'Top 5 Side Hustles for Nigerian Students and Tech Beginners',
    channelName: 'Naija Tech Hub',
    youtubeId: 'L_LUpnjgPso',
    reward: 500,
    durationSeconds: 180,
    requiredWatchSeconds: 45,
    category: 'Tutorial',
    isPremiumOnly: true, // VIP only
    thumbnailUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80',
    viewsCount: '89K'
  },
  {
    id: 'vid-3',
    title: 'Crypto Arbitrage Trading in Nigeria & Instant Bank Withdrawal Secret',
    channelName: 'Crypto Naija Masterclass',
    youtubeId: 'kJQP7kiw5Fk',
    reward: 500,
    durationSeconds: 240,
    requiredWatchSeconds: 60,
    category: 'Crypto',
    isPremiumOnly: true, // VIP only
    thumbnailUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
    viewsCount: '210K'
  },
  {
    id: 'vid-4',
    title: 'High-Ticket Affiliate Marketing Blueprint for 2026',
    channelName: 'Global Hustlers Africa',
    youtubeId: 'fJ9rUzIMcZQ',
    reward: 500,
    durationSeconds: 300,
    requiredWatchSeconds: 90,
    category: 'Tech',
    isPremiumOnly: true, // VIP only
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    viewsCount: '340K'
  },
  {
    id: 'vid-5',
    title: 'E-commerce Dropshipping in Lagos with 0 Capital',
    channelName: 'Biz Growth NG',
    youtubeId: '9bZkp7q19f0',
    reward: 500,
    durationSeconds: 150,
    requiredWatchSeconds: 40,
    category: 'Finance',
    isPremiumOnly: true, // VIP only
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=600&auto=format&fit=crop&q=80',
    viewsCount: '67K'
  }
];

export const INITIAL_SOCIAL_TASKS: SocialTask[] = [
  {
    id: 'soc-1',
    title: 'Join the Official 9jaPay Telegram Announcement Channel',
    platform: 'Telegram',
    actionType: 'join',
    reward: 500,
    actionUrl: 'https://t.me/ninjapay_official',
    timerSeconds: 10,
    isPremiumOnly: false,
    instructions: 'Join our Telegram channel to receive daily payment alerts, VIP promo codes, and updates.'
  },
  {
    id: 'soc-2',
    title: 'Follow 9jaPay Official Twitter/X Account & Like Pinned Post',
    platform: 'Twitter / X',
    actionType: 'follow',
    reward: 500,
    actionUrl: 'https://twitter.com',
    timerSeconds: 12,
    isPremiumOnly: false,
    instructions: 'Follow @9jaPayOfficial and like our pinned announcement tweet.'
  },
  {
    id: 'soc-3',
    title: 'Follow our TikTok Page and Like Latest 3 Earning Videos',
    platform: 'TikTok',
    actionType: 'like',
    reward: 500,
    actionUrl: 'https://tiktok.com',
    timerSeconds: 10,
    isPremiumOnly: false,
    instructions: 'Follow our TikTok page to watch short tutorials on maximizing daily earnings.'
  },
  {
    id: 'soc-4',
    title: 'Click & Visit Sponsored Fintech Partner Offer for 15s',
    platform: 'Website / Ad',
    actionType: 'visit',
    reward: 500,
    actionUrl: 'https://google.com',
    timerSeconds: 15,
    isPremiumOnly: false,
    instructions: 'Visit the partner portal, view the sponsored offer for 15 seconds to receive instant reward.'
  },
  {
    id: 'soc-5',
    title: 'Subscribe to 9jaPay Official YouTube Channel & Ring Bell',
    platform: 'YouTube',
    actionType: 'subscribe',
    reward: 500,
    actionUrl: 'https://youtube.com',
    timerSeconds: 15,
    isPremiumOnly: false,
    instructions: 'Subscribe to our official YouTube channel for live withdrawal proofs and earning updates.'
  },
  {
    id: 'soc-6',
    title: 'Daily Sponsored Ad Click & Verification',
    platform: 'Website / Ad',
    actionType: 'visit',
    reward: 500,
    actionUrl: 'https://google.com',
    timerSeconds: 10,
    isPremiumOnly: false,
    instructions: 'Click the partner link and complete the quick 10-second verification visit.'
  },
  {
    id: 'soc-7',
    title: 'Quick Micro-Task: Share 9jaPay on Social Feed',
    platform: 'Twitter / X',
    actionType: 'like',
    reward: 500,
    actionUrl: 'https://twitter.com',
    timerSeconds: 10,
    isPremiumOnly: false,
    instructions: 'Retweet or like the sponsored payment proof update.'
  }
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-1',
    question: 'What is the commercial capital and largest economic hub of Nigeria?',
    options: {
      A: 'Abuja',
      B: 'Lagos',
      C: 'Port Harcourt',
      D: 'Kano'
    },
    correctOption: 'B',
    explanation: 'Lagos is the economic powerhouse and largest financial center in Nigeria and West Africa.',
    reward: 500,
    category: 'General Knowledge'
  },
  {
    id: 'quiz-2',
    question: 'Which regulatory agency issues banking licenses and oversees monetary policy in Nigeria?',
    options: {
      A: 'EFCC',
      B: 'SEC',
      C: 'CBN (Central Bank of Nigeria)',
      D: 'FIRS'
    },
    correctOption: 'C',
    explanation: 'The Central Bank of Nigeria (CBN) regulates banks and oversees monetary policy.',
    reward: 500,
    category: 'Finance'
  },
  {
    id: 'quiz-3',
    question: 'What is the official currency abbreviation for Nigerian Naira?',
    options: {
      A: 'NGR',
      B: 'NGN',
      C: 'NIR',
      D: 'NNA'
    },
    correctOption: 'B',
    explanation: 'NGN is the ISO standard currency code for the Nigerian Naira (₦).',
    reward: 500,
    category: 'Finance'
  },
  {
    id: 'quiz-4',
    question: 'In digital finance, what does the acronym "MFB" stand for in Nigerian banking?',
    options: {
      A: 'Micro Finance Bank',
      B: 'Major Federal Bureau',
      C: 'Mobile Financial Branch',
      D: 'Monetary Fund Board'
    },
    correctOption: 'A',
    explanation: 'MFB stands for Microfinance Bank, such as FairMoney MFB, Kuda MFB, OPay, etc.',
    reward: 500,
    category: 'Banking'
  },
  {
    id: 'quiz-5',
    question: 'Which Nigerian fintech platform became a unicorn after reaching a $1 Billion+ valuation first?',
    options: {
      A: 'Interswitch',
      B: 'Flutterwave',
      C: 'Paystack',
      D: 'Moniepoint'
    },
    correctOption: 'A',
    explanation: 'Interswitch was Nigeria\'s first recognized tech unicorn valuation, followed by Flutterwave and others.',
    reward: 500,
    category: 'Tech'
  },
  {
    id: 'quiz-6',
    question: 'What is the standard referral bonus reward on 9jaPay for bringing an active Premium member?',
    options: {
      A: '₦500',
      B: '₦1,000',
      C: '₦1,500',
      D: '₦5,000'
    },
    correctOption: 'C',
    explanation: '9jaPay offers a generous ₦1,500 direct referral commission for every upgraded affiliate member!',
    reward: 500,
    category: '9jaPay Trivia'
  },
  {
    id: 'quiz-7',
    question: 'What is the primary benefit of upgrading to 9jaPay Premium status?',
    options: {
      A: '5x higher task earnings & KlinLoan access',
      B: 'Daily free airtime only',
      C: 'Free smartphone delivery',
      D: 'Zero task requirements'
    },
    correctOption: 'A',
    explanation: 'Premium unlocks 5x higher task rewards, all 10 daily quiz questions, daily withdrawals, and instant KlinLoan access.',
    reward: 500,
    category: '9jaPay Trivia'
  },
  {
    id: 'quiz-8',
    question: 'Which technological framework powers modern crypto blockchain transactions?',
    options: {
      A: 'Distributed Ledger Technology (DLT)',
      B: 'Centralized File Server',
      C: 'Single SQL Database',
      D: 'Local Browser Cache'
    },
    correctOption: 'A',
    explanation: 'Blockchain operates on Distributed Ledger Technology (DLT) across decentralized peer nodes.',
    reward: 500,
    category: 'Crypto'
  },
  {
    id: 'quiz-9',
    question: 'What is the daily withdrawal schedule for 9jaPay Premium members?',
    options: {
      A: 'Once a month on the 30th',
      B: 'Every single day (24/7 Access)',
      C: 'Only on Sunday midnight',
      D: 'Once every 90 days'
    },
    correctOption: 'B',
    explanation: 'Premium members enjoy unrestricted 24/7 daily bank withdrawal access directly to any Nigerian bank.',
    reward: 500,
    category: '9jaPay Trivia'
  },
  {
    id: 'quiz-10',
    question: 'What is the one-time upgrade fee to unlock lifetime 9jaPay Premium privileges?',
    options: {
      A: '₦5,000',
      B: '₦10,000',
      C: '₦25,000',
      D: '₦50,000'
    },
    correctOption: 'B',
    explanation: 'The one-time lifetime membership upgrade fee is strictly ₦10,000 to the official FairMoney account.',
    reward: 500,
    category: '9jaPay Trivia'
  }
];

export const NIGERIAN_BANKS = [
  'OPay (PayCom)',
  'PalmPay',
  'FairMoney MFB',
  'Kuda Bank',
  'Moniepoint MFB',
  'GTBank (Guaranty Trust Bank)',
  'Zenith Bank',
  'Access Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Union Bank',
  'Wema Bank / ALAT',
  'Ecobank Nigeria'
];

export const LIVE_PAYOUTS = [
  { name: 'Emeka O.', amount: '₦18,500', method: 'Direct Bank Transfer', time: '1m ago', bank: 'OPay' },
  { name: 'Amina B.', amount: '₦12,000', method: 'VIP Daily Payout', time: '2m ago', bank: 'Kuda MFB' },
  { name: 'Blessing K.', amount: '₦25,000', method: 'Bank Transfer', time: '4m ago', bank: 'GTBank' },
  { name: 'Tunde A.', amount: '₦14,500', method: 'Instant Withdrawal', time: '5m ago', bank: 'PalmPay' },
  { name: 'Chukwuma E.', amount: '₦35,000', method: 'Direct Payout', time: '7m ago', bank: 'Access Bank' },
  { name: 'Fatima S.', amount: '₦16,200', method: 'Daily Cashout', time: '9m ago', bank: 'Zenith Bank' },
  { name: 'Oluwaseun D.', amount: '₦22,000', method: 'Bank Transfer', time: '11m ago', bank: 'FairMoney MFB' },
  { name: 'Ngozi M.', amount: '₦65,000', method: 'Milestone Withdrawal', time: '13m ago', bank: 'Moniepoint MFB' },
  { name: 'Ibrahim Y.', amount: '₦14,000', method: 'Instant NUBAN Transfer', time: '16m ago', bank: 'UBA' },
  { name: 'Chioma R.', amount: '₦48,500', method: 'VIP Fast Payout', time: '18m ago', bank: 'FirstBank' },
  { name: 'David N.', amount: '₦12,500', method: 'Direct Bank Payout', time: '20m ago', bank: 'Stanbic IBTC' },
  { name: 'Kelechi U.', amount: '₦75,000', method: 'Verified Bank Settlement', time: '22m ago', bank: 'OPay' },
  { name: 'Zainab M.', amount: '₦15,000', method: 'Instant Cashout', time: '24m ago', bank: 'FairMoney MFB' },
  { name: 'Babajide A.', amount: '₦30,000', method: 'Direct Transfer', time: '26m ago', bank: 'Access Bank' },
];

