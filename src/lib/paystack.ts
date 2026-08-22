/**
 * Paystack Inline JS Integration Helper for 9jaPay VIP Upgrades (₦10,000)
 */

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // in kobo (10000 * 100 = 1,000,000 kobo)
        currency?: string;
        ref?: string;
        metadata?: Record<string, any>;
        callback: (response: { reference: string; status?: string; trxref?: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Paystack Inline JS from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface PaystackUpgradeParams {
  email: string;
  fullName: string;
  phone?: string;
  userId: string;
  amountNgn?: number; // default 10,000
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

export async function openPaystackUpgradeModal({
  email,
  fullName,
  phone,
  userId,
  amountNgn = 10000,
  onSuccess,
  onClose
}: PaystackUpgradeParams): Promise<boolean> {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
  const amountKobo = amountNgn * 100;
  const reference = `9JAPAY_VIP_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;

  const isLoaded = await loadPaystackScript();

  if (isLoaded && window.PaystackPop && publicKey && !publicKey.includes('placeholder')) {
    try {
      const handler = window.PaystackPop.setup({
        key: publicKey.trim(),
        email: email.trim() || 'member@9japay.com.ng',
        amount: amountKobo,
        currency: 'NGN',
        ref: reference,
        metadata: {
          custom_fields: [
            { display_name: 'User ID', variable_name: 'user_id', value: userId },
            { display_name: 'Full Name', variable_name: 'full_name', value: fullName },
            { display_name: 'Phone', variable_name: 'phone', value: phone || '' },
            { display_name: 'Plan', variable_name: 'plan', value: 'PREMIUM' }
          ]
        },
        callback: (response) => {
          console.log('[Paystack] Payment completed successfully:', response);
          onSuccess(response.reference || reference);
        },
        onClose: () => {
          console.log('[Paystack] User closed payment window');
          onClose?.();
        }
      });
      handler.openIframe();
      return true;
    } catch (err) {
      console.error('[Paystack] Setup error:', err);
    }
  }

  return false;
}
