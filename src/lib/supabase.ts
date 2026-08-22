import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Helper to validate valid HTTP/HTTPS URL
function getValidSupabaseUrl(url?: string): string {
  if (!url || typeof url !== 'string') return 'https://placeholder.supabase.co';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return 'https://placeholder.supabase.co';
    }
  }
  return 'https://placeholder.supabase.co';
}

function getValidAnonKey(key?: string): string {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    // Valid format placeholder key
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';
  }
  return key.trim();
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  typeof rawUrl === 'string' &&
  (rawUrl.startsWith('https://') || rawUrl.startsWith('http://')) &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('YOUR_SUPABASE') &&
  rawAnonKey &&
  typeof rawAnonKey === 'string' &&
  !rawAnonKey.includes('placeholder')
);

const finalUrl = getValidSupabaseUrl(rawUrl);
const finalAnonKey = getValidAnonKey(rawAnonKey);

// Safely instantiate Supabase client with guaranteed valid URL format
export const supabase: SupabaseClient = createClient(
  finalUrl,
  finalAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  }
);

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
