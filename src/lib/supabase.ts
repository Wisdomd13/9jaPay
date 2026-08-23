import { UserProfile } from '../types';
import { User } from '@supabase/supabase-js';
import { supabase as clientInstance, SUPABASE_URL, SUPABASE_PUBLIC_KEY } from '../supabaseClient';

/**
 * Sanitizes and validates the Supabase URL:
 * - Trims whitespace
 * - Prepends 'https://' if protocol is missing
 * - Strips any trailing slashes (e.g. .replace(/\/+$/, ''))
 * - Validates with standard URL parser
 */
export function sanitizeSupabaseUrl(url?: string): string {
  if (!url || typeof url !== 'string') return 'https://placeholder.supabase.co';
  let trimmed = url.trim();
  if (!trimmed) return 'https://placeholder.supabase.co';

  // Explicitly prepend https:// if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed.replace(/^\/+/, '')}`;
  }

  // Strip any trailing slashes
  trimmed = trimmed.replace(/\/+$/, '');

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname) {
      return 'https://placeholder.supabase.co';
    }
    return trimmed;
  } catch {
    return 'https://placeholder.supabase.co';
  }
}

/**
 * Sanitizes and validates the Supabase Anon Key
 */
export function sanitizeAnonKey(key?: string): string {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    // Valid format placeholder key for fallback
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';
  }
  return key.trim();
}

export const supabaseUrl: string = SUPABASE_URL;
export const supabaseAnonKey: string = SUPABASE_PUBLIC_KEY;
export const isSupabaseConfigured: boolean = true;
export const supabase = clientInstance;

/**
 * Transforms a Supabase User object into a 9jaPay UserProfile
 */
export function mapSupabaseUserToProfile(sbUser: User, existingProfile?: UserProfile | null): UserProfile {
  const metadata = sbUser.user_metadata || {};
  const firstName = (metadata.first_name || '').trim();
  const lastName = (metadata.last_name || '').trim();
  const rawFullName = (metadata.full_name || `${firstName} ${lastName}`).trim();
  const emailPrefix = sbUser.email ? sbUser.email.split('@')[0] : 'member';
  const fullName = rawFullName || emailPrefix;
  const username = metadata.username || emailPrefix.replace(/[^a-zA-Z0-9_]/g, '');
  const phone = metadata.phone || sbUser.phone || '';
  const referralCode = metadata.referral_code || username.toUpperCase();

  // If user already had local stats / earnings, retain them
  if (existingProfile && (existingProfile.id === sbUser.id || existingProfile.email?.toLowerCase() === (sbUser.email || '').toLowerCase())) {
    return {
      ...existingProfile,
      id: sbUser.id,
      fullName: fullName || existingProfile.fullName,
      username: username || existingProfile.username,
      email: sbUser.email || existingProfile.email,
      phone: phone || existingProfile.phone,
    };
  }

  return {
    id: sbUser.id,
    fullName,
    username,
    email: sbUser.email || '',
    phone,
    tier: 'FREE',
    walletBalance: 0,
    totalEarned: 0,
    tasksCompleted: 0,
    referralsCount: 0,
    referralCode,
    loanBalance: 0,
    loanLimit: 20000,
    bankDetails: {
      bankName: 'OPay (PayCom)',
      accountNumber: '',
      accountName: fullName
    },
    createdAt: sbUser.created_at || new Date().toISOString(),
    upgradeStatus: 'NONE'
  };
}

export const supabaseDb = {
  async fetchAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        fullName: d.full_name || d.fullName || 'Member',
        username: d.username || 'user',
        email: d.email || '',
        phone: d.phone || '',
        tier: d.tier || 'FREE',
        walletBalance: d.wallet_balance ?? d.walletBalance ?? 0,
        totalEarned: d.total_earned ?? d.totalEarned ?? 0,
        tasksCompleted: d.tasks_completed ?? d.tasksCompleted ?? 0,
        referralsCount: d.referrals_count ?? d.referralsCount ?? 0,
        vipReferralsCount: d.vip_referrals_count ?? d.vipReferralsCount ?? 0,
        referralCode: d.referral_code || d.referralCode || '',
        loanBalance: d.loan_balance ?? d.loanBalance ?? 0,
        loanLimit: d.loan_limit ?? d.loanLimit ?? 20000,
        bankDetails: d.bank_details || { bankName: 'OPay', accountNumber: '', accountName: d.full_name || '' },
        createdAt: d.created_at || new Date().toISOString(),
        upgradeStatus: d.upgrade_status || 'NONE',
        status: d.status || 'ACTIVE'
      }));
    } catch {
      return [];
    }
  },

  async fetchAllWithdrawals(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('withdrawals').select('*');
      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  }
};

