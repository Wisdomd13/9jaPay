// Sound & Humanized Voice Engine for 9jaPay
// Handles Web Audio synthesis effects and SpeechSynthesis natural voiceovers

export type VoiceType = 'natural_female' | 'natural_male' | 'natural_host';

export interface VoiceoverCue {
  id: string;
  title: string;
  category: string;
  text: string;
}

export const PLATFORM_EXPLAINER_TRANSCRIPT = 
  "Welcome! I'll be explaining to you how 9jaPay works. Kindly listen carefully to the end for a better understanding. " +
  "Now, 9jaPay is a free earn and reward platform in which you earn money by simply performing simple tasks on the website, " +
  "such as watching video clips, answering simple quiz questions, and you can even borrow loan on this platform with no collateral. " +
  "I'll be explaining all the features on how you can use this platform to make money briefly. 9jaPay has two plans. " +
  "The first package is a free plan in which you have already registered as you are in now, and the second package is the premium plan. " +
  "On the free plan, you earn ₦500 daily by watching one video clip, and another ₦500 daily by answering one quiz question, giving you ₦1,000 every single day. " +
  "Free plan withdrawals are processed once a month on the 29th. " +
  "The second package is the VIP Premium plan, which costs a one-time activation fee of ₦10,000. " +
  "On the VIP plan, you unlock up to 10 video tasks daily earning ₦1,000 per video, and 10 quiz questions daily earning ₦1,000 per quiz, making up to ₦20,000 daily. " +
  "In addition, VIP members earn a massive direct referral commission of ₦6,000 for every friend who upgrades to VIP, " +
  "and enjoy daily withdrawals open every day between 8:00 PM and 9:00 PM with a minimum payout of ₦10,000. " +
  "You can also borrow collateral-free loans up to ₦50,000 directly into your bank account. " +
  "Thank you for choosing 9jaPay. Start performing your tasks and enjoy unlimited earnings!";

export const VOICEOVER_SCRIPTS: VoiceoverCue[] = [
  {
    id: 'explainer_master',
    title: 'Full Platform Explainer Guide (1.25x)',
    category: 'Guide',
    text: PLATFORM_EXPLAINER_TRANSCRIPT
  },
  {
    id: 'welcome',
    title: 'Platform Welcome & Introduction',
    category: 'Welcome',
    text: "Welcome to 9jaPay! Your number one platform to complete daily tasks, watch videos, and earn rewards effortlessly. Tap 'Start Earning' to jump right in."
  },
  {
    id: 'upgrade_vip',
    title: 'VIP Account Upgrade',
    category: 'Upgrade',
    text: "Upgrade your account to VIP for ₦10,000 today! Unlock high-paying premium videos, 10 daily quizzes, and earn a direct ₦6,000 commission for every friend you refer who upgrades."
  },
  {
    id: 'task_completed',
    title: 'Task Completion & Reward',
    category: 'Tasks',
    text: "Great job! Task completed successfully. Your reward has been added to your balance."
  },
  {
    id: 'premium_locked',
    title: 'Premium Task Unlock Prompt',
    category: 'Tasks',
    text: "This is a Premium task paying ₦1,000. Upgrade your account to VIP to unlock full access to all premium video and quiz rewards."
  },
  {
    id: 'quiz_correct',
    title: 'Daily Quiz - Correct Answer',
    category: 'Quiz',
    text: "Spot on! That's the correct answer. Reward added to your account."
  },
  {
    id: 'quiz_incorrect',
    title: 'Daily Quiz - Incorrect Answer',
    category: 'Quiz',
    text: "Ah, nice try! That wasn't quite right. Don't worry, keep going and try the next question!"
  },
  {
    id: 'referral_copied',
    title: 'Referral Link Copied',
    category: 'Referral',
    text: "Your referral link has been copied to your clipboard. Share it with your friends and earn ₦6,000 whenever they upgrade to VIP."
  },
  {
    id: 'referral_upgraded',
    title: 'Referral Friend Upgraded (VIP)',
    category: 'Referral',
    text: "Congratulations! One of your referred users just upgraded to VIP. A ₦6,000 referral bonus has been credited to your balance."
  },
  {
    id: 'payout_requested',
    title: 'Withdrawal Payout Queued',
    category: 'Withdrawal',
    text: "Your payout request has been received and sent for processing. You will receive an instant notification once your transfer is approved."
  },
  {
    id: 'profile_updated',
    title: 'Profile Settings Updated',
    category: 'Profile',
    text: "Your profile details have been updated successfully."
  }
];

export const FULL_MASTER_VOICEOVER = PLATFORM_EXPLAINER_TRANSCRIPT;

class SoundManager {
  private ctx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoiceType: VoiceType = 'natural_female';
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available && available.length > 0) {
      this.voices = available;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVoiceType(type: VoiceType) {
    this.selectedVoiceType = type;
  }

  public getVoiceType(): VoiceType {
    return this.selectedVoiceType;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeaking();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  // Get high definition natural human neural voice
  public getBestNaturalVoice(type?: VoiceType): SpeechSynthesisVoice | null {
    const vType = type || this.selectedVoiceType;
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const englishVoices = voices.filter(v => 
      v.lang.startsWith('en') || v.lang.includes('NG') || v.lang.includes('GB') || v.lang.includes('US')
    );
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    if (vType === 'natural_female') {
      const femaleKeywords = [
        'google uk english female',
        'microsoft natural',
        'en-us-neural',
        'natural',
        'neural',
        'jenny',
        'aria',
        'samantha',
        'victoria',
        'serena',
        'moira',
        'karen',
        'female'
      ];
      const match = pool.find(v => {
        const name = v.name.toLowerCase();
        return femaleKeywords.some(k => name.includes(k));
      });
      if (match) return match;
    } else if (vType === 'natural_male') {
      const maleKeywords = [
        'google uk english male',
        'microsoft natural',
        'en-us-neural',
        'natural',
        'neural',
        'guy',
        'ryan',
        'daniel',
        'george',
        'oliver',
        'male'
      ];
      const match = pool.find(v => {
        const name = v.name.toLowerCase();
        return maleKeywords.some(k => name.includes(k));
      });
      if (match) return match;
    }

    // Default: find best high definition Natural/Neural voice (Google UK English Female / Microsoft Natural / Neural)
    return pool.find(v => v.name.toLowerCase().includes('google uk english female')) ||
           pool.find(v => v.name.toLowerCase().includes('microsoft natural')) ||
           pool.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural')) ||
           pool.find(v => v.lang === 'en-NG' || v.lang === 'en-GB' || v.lang === 'en-US') || 
           pool[0];
  }

  // Pre-process text to expand Nigerian Naira currency symbols so voice synthesis speaks naturally
  private humanizeText(text: string): string {
    return text
      .replace(/₦10,000/g, 'ten thousand Naira')
      .replace(/₦6,000/g, 'six thousand Naira')
      .replace(/₦1,000/g, 'one thousand Naira')
      .replace(/₦500/g, 'five hundred Naira')
      .replace(/₦50,000/g, 'fifty thousand Naira')
      .replace(/₦12,000/g, 'twelve thousand Naira')
      .replace(/₦65,000/g, 'sixty-five thousand Naira')
      .replace(/₦([\d,]+)/g, (_, num) => `${num} Naira`)
      .replace(/9jaPay/g, 'Naija Pay');
  }

  // Speak humanized text with natural phrasing & prosody at 1.25x speed and 1.0 pitch
  public speak(
    text: string, 
    options?: {
      voiceType?: VoiceType;
      onEnd?: () => void;
      rate?: number;
      pitch?: number;
      interrupt?: boolean;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || this.isMuted) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    if (options?.interrupt !== false) {
      window.speechSynthesis.cancel();
    }

    const naturalText = this.humanizeText(text);
    const utterance = new SpeechSynthesisUtterance(naturalText);
    const vType = options?.voiceType || this.selectedVoiceType;

    // Web Speech API Voiceover settings: 1.0x (normal speed), 1.0 pitch
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = 1.0;

    const voice = this.getBestNaturalVoice(vType);
    if (voice) {
      utterance.voice = voice;
    }

    this.isSpeaking = true;

    utterance.onend = () => {
      this.isSpeaking = false;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (options?.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public speakFullGuide(onEnd?: () => void) {
    this.playClickSound();
    this.speak(PLATFORM_EXPLAINER_TRANSCRIPT, {
      rate: 1.0,
      pitch: 1.0,
      onEnd
    });
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Specific contextual voice triggers
  public speakWelcome() {
    this.playClickSound();
    this.speak(VOICEOVER_SCRIPTS[0].text);
  }

  public speakUpgrade() {
    this.playClickSound();
    this.speak(VOICEOVER_SCRIPTS[1].text);
  }

  public speakTaskCompleted() {
    this.playRewardSound();
    setTimeout(() => {
      this.speak(VOICEOVER_SCRIPTS[2].text);
    }, 400);
  }

  public speakPremiumLocked() {
    this.playNotificationSound();
    this.speak(VOICEOVER_SCRIPTS[3].text);
  }

  public speakQuizCorrect() {
    this.playRewardSound();
    setTimeout(() => {
      this.speak(VOICEOVER_SCRIPTS[4].text);
    }, 350);
  }

  public speakQuizWrong() {
    this.playWrongSound();
    setTimeout(() => {
      this.speak(VOICEOVER_SCRIPTS[5].text);
    }, 350);
  }

  public speakReferralCopied() {
    this.playRewardSound();
    this.speak(VOICEOVER_SCRIPTS[6].text);
  }

  public speakReferralUpgraded() {
    this.playSuccessSound();
    setTimeout(() => {
      this.speak(VOICEOVER_SCRIPTS[7].text);
    }, 450);
  }

  public speakPayoutRequested() {
    this.playSuccessSound();
    setTimeout(() => {
      this.speak(VOICEOVER_SCRIPTS[8].text);
    }, 400);
  }

  public speakProfileUpdated() {
    this.playNotificationSound();
    this.speak(VOICEOVER_SCRIPTS[9].text);
  }

  // Sound effects synthesized via Web Audio API (no external file dependencies)
  public playRewardSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.16); // D6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio fallback
    }
  }

  public playSuccessSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch {
      // Audio fallback
    }
  }

  public playWrongSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(150, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  public playNotificationSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio fallback
    }
  }

  public playClickSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  }
}

export const soundManager = new SoundManager();
