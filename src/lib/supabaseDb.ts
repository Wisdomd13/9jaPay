import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, VideoTask, QuizQuestion, SocialTask, Transaction, UpgradeRequest, WithdrawalRequest, MembershipTier } from '../types';
import { INITIAL_VIDEO_TASKS, INITIAL_QUIZ_QUESTIONS, INITIAL_SOCIAL_TASKS } from '../data/initialData';

export interface DbProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  plan: 'FREE' | 'PREMIUM';
  balance: number;
  is_admin: boolean;
  total_referrals: number;
  premium_referrals: number;
  created_at?: string;
}

export interface DbTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'DEPOSIT' | 'VIP_UPGRADE' | 'TASK_REWARD' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference: string;
  created_at: string;
}

export interface DbTask {
  id: string;
  title: string;
  category: 'VIDEO' | 'QUIZ' | 'SOCIAL';
  reward: number;
  url_or_content: string;
  timer_seconds: number;
}

// Master Admin Owner check
export function checkIsAdmin(email?: string, profileAdmin?: boolean): boolean {
  if (!email && !profileAdmin) return false;
  const cleanEmail = (email || '').trim().toLowerCase();
  return (
    cleanEmail === 'soundguy300@gmail.com' ||
    cleanEmail === 'admin@9japay.com.ng' ||
    Boolean(profileAdmin)
  );
}

/**
 * Fetch or Initialize Profile from Supabase `profiles` table
 */
export async function getOrCreateProfile(
  userId: string,
  email: string,
  metadata?: { first_name?: string; last_name?: string; phone?: string; full_name?: string; username?: string; referral_code?: string }
): Promise<UserProfile> {
  const isAdmin = checkIsAdmin(email);
  const firstName = metadata?.first_name || '';
  const lastName = metadata?.last_name || '';
  const fullName = (metadata?.full_name || `${firstName} ${lastName}`).trim() || email.split('@')[0] || 'Valued Member';
  const username = metadata?.username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'member';
  const phone = metadata?.phone || '';
  const referralCode = metadata?.referral_code || username.toUpperCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const isUserAdmin = checkIsAdmin(data.email || email, data.is_admin);
        return {
          id: data.id,
          fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || fullName,
          username: username,
          email: data.email || email,
          phone: data.phone || phone,
          tier: (data.plan === 'PREMIUM' ? 'PREMIUM' : 'FREE') as MembershipTier,
          walletBalance: Number(data.balance) || 0,
          totalEarned: Number(data.balance) || 0,
          tasksCompleted: 0,
          referralsCount: Number(data.total_referrals) || 0,
          vipReferralsCount: Number(data.premium_referrals) || 0,
          referralCode,
          loanBalance: 0,
          loanLimit: data.plan === 'PREMIUM' ? 50000 : 20000,
          createdAt: data.created_at || new Date().toISOString(),
          upgradeStatus: data.plan === 'PREMIUM' ? 'APPROVED' : 'NONE',
          status: 'ACTIVE'
        };
      }

      // If profile does not exist in table, explicitly insert with plan: 'FREE' and balance: 0.00
      const newProfilePayload: DbProfile = {
        id: userId,
        email: email || '',
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        plan: 'FREE',
        balance: 0.00,
        is_admin: isAdmin,
        total_referrals: 0,
        premium_referrals: 0
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([newProfilePayload]);

      if (insertError) {
        console.warn('[Supabase] Profile insert error (may exist or RLS):', insertError.message);
      }
    } catch (err) {
      console.warn('[Supabase] Error reading/writing profiles table:', err);
    }
  }

  // Local sync profile
  return {
    id: userId,
    fullName,
    username,
    email,
    phone,
    tier: 'FREE',
    walletBalance: 0,
    totalEarned: 0,
    tasksCompleted: 0,
    referralsCount: 0,
    vipReferralsCount: 0,
    referralCode,
    loanBalance: 0,
    loanLimit: 20000,
    createdAt: new Date().toISOString(),
    upgradeStatus: 'NONE',
    status: 'ACTIVE'
  };
}

/**
 * Upgrade User to Premium in Supabase profiles table
 */
export async function upgradeUserToPremium(
  userId: string,
  reference: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'PREMIUM' })
      .eq('id', userId);

    if (error) {
      console.warn('[Supabase] Failed to update profile to PREMIUM:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Upgrade profile exception:', err);
    return false;
  }
}

/**
 * Update Profile Balance and Plan in Supabase
 */
export async function syncProfileUpdate(
  userId: string,
  updates: Partial<DbProfile>
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('[Supabase] Failed to update profile:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] Profile update exception:', err);
  }
}

export const updateProfile = syncProfileUpdate;

/**
 * Record a transaction in `transactions` table
 */
export async function recordTransaction(tx: {
  userId: string;
  amount: number;
  type: 'DEPOSIT' | 'VIP_UPGRADE' | 'TASK_REWARD' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference?: string;
}): Promise<Transaction> {
  const reference = tx.reference || `9JA-${tx.type}-${Date.now().toString().slice(-6)}`;
  const newTx: Transaction = {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: tx.userId,
    type: tx.type === 'TASK_REWARD' ? 'TASK_EARN' : (tx.type as any),
    amount: tx.amount,
    status: tx.status,
    description: 
      tx.type === 'VIP_UPGRADE' ? 'Upgrade to VIP Premium Plan (₦10,000)' :
      tx.type === 'TASK_REWARD' ? `Task Reward Credited (+₦${tx.amount.toLocaleString()})` :
      tx.type === 'WITHDRAWAL' ? `Withdrawal Request (₦${tx.amount.toLocaleString()})` : 'Wallet Deposit',
    date: new Date().toISOString(),
    reference
  };

  if (isSupabaseConfigured) {
    try {
      const dbTxPayload: DbTransaction = {
        id: newTx.id,
        user_id: tx.userId,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        reference,
        created_at: new Date().toISOString()
      };

      await supabase.from('transactions').insert([dbTxPayload]);
    } catch (err) {
      console.warn('[Supabase] Could not insert transaction to Supabase table:', err);
    }
  }

  return newTx;
}

/**
 * Fetch All Tasks from Supabase `tasks` table with default fallbacks
 */
export async function fetchAllTasks(): Promise<{
  videos: VideoTask[];
  quizzes: QuizQuestion[];
  socials: SocialTask[];
}> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (data && data.length > 0 && !error) {
        const videos: VideoTask[] = [];
        const quizzes: QuizQuestion[] = [];
        const socials: SocialTask[] = [];

        data.forEach((item: DbTask) => {
          if (item.category === 'VIDEO') {
            videos.push({
              id: item.id,
              title: item.title,
              channelName: '9jaPay Partner',
              youtubeId: item.url_or_content || 'dQw4w9WgXcQ',
              reward: Number(item.reward) || 500,
              durationSeconds: item.timer_seconds || 30,
              requiredWatchSeconds: item.timer_seconds || 30,
              category: 'Finance',
              isPremiumOnly: false,
              thumbnailUrl: `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80`
            });
          } else if (item.category === 'QUIZ') {
            let parsed;
            try {
              parsed = JSON.parse(item.url_or_content);
            } catch {
              parsed = null;
            }
            quizzes.push({
              id: item.id,
              question: item.title,
              options: parsed?.options || { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
              correctOption: parsed?.correctOption || 'A',
              explanation: parsed?.explanation || 'Official 9jaPay trivia answer.',
              reward: Number(item.reward) || 500,
              category: 'General'
            });
          } else if (item.category === 'SOCIAL') {
            socials.push({
              id: item.id,
              title: item.title,
              platform: 'Telegram',
              actionType: 'join',
              reward: Number(item.reward) || 500,
              actionUrl: item.url_or_content || 'https://t.me/ninjapayofficial',
              timerSeconds: item.timer_seconds || 15,
              isPremiumOnly: false,
              instructions: 'Join community and earn instant reward'
            });
          }
        });

        return {
          videos: videos.length ? videos : INITIAL_VIDEO_TASKS,
          quizzes: quizzes.length ? quizzes : INITIAL_QUIZ_QUESTIONS,
          socials: socials.length ? socials : INITIAL_SOCIAL_TASKS
        };
      }
    } catch (err) {
      console.warn('[Supabase] Tasks fetch error:', err);
    }
  }

  return {
    videos: INITIAL_VIDEO_TASKS,
    quizzes: INITIAL_QUIZ_QUESTIONS,
    socials: INITIAL_SOCIAL_TASKS
  };
}

/**
 * Save Task to Supabase `tasks` table
 */
export async function saveTaskToSupabase(task: DbTask): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('tasks').upsert([task]);
    if (error) {
      console.error('[Supabase] Failed to upsert task:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Upsert task exception:', err);
    return false;
  }
}

/**
 * Delete Task from Supabase `tasks` table
 */
export async function deleteTaskFromSupabase(taskId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    return !error;
  } catch {
    return false;
  }
}

export const supabaseDb = {
  checkIsAdmin,
  getOrCreateProfile,
  updateProfile,
  upgradeUserToPremium,
  recordTransaction,
  fetchAllTasks,
  saveTaskToSupabase,
  deleteTaskFromSupabase
};
