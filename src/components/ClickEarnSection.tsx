import React, { useState, useEffect } from 'react';
import { SocialTask, UserProfile } from '../types';
import { 
  MousePointerClick, 
  ExternalLink, 
  CheckCircle, 
  Sparkles, 
  Lock, 
  Clock, 
  Send, 
  Twitter, 
  Globe, 
  Award,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface ClickEarnSectionProps {
  user: UserProfile;
  socialTasks: SocialTask[];
  onCompleteTask: (taskId: string, type: 'social') => Promise<void>;
  onOpenUpgrade: () => void;
}

export const ClickEarnSection: React.FC<ClickEarnSectionProps> = ({
  user,
  socialTasks,
  onCompleteTask,
  onOpenUpgrade,
}) => {
  const [activeTask, setActiveTask] = useState<SocialTask | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [hasVisited, setHasVisited] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    let timer: number | null = null;
    if (activeTask && hasVisited && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTask, hasVisited, countdown]);

  const handleStartTask = (task: SocialTask) => {
    soundManager.playClickSound();
    if (task.isPremiumOnly && user.tier !== 'PREMIUM') {
      onOpenUpgrade();
      return;
    }
    setActiveTask(task);
    setCountdown(task.timerSeconds);
    setHasVisited(false);
  };

  const handleOpenLink = () => {
    if (!activeTask) return;
    soundManager.playClickSound();
    setHasVisited(true);
    window.open(activeTask.actionUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClaim = async () => {
    if (!activeTask || isClaiming) return;
    setIsClaiming(true);
    soundManager.playRewardSound();

    try {
      await onCompleteTask(activeTask.id, 'social');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setActiveTask(null);
    } catch {
      // Error handled upstream
    } finally {
      setIsClaiming(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Telegram':
        return <Send className="w-5 h-5 text-blue-400" />;
      case 'Twitter / X':
        return <Twitter className="w-5 h-5 text-sky-400" />;
      default:
        return <Globe className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <MousePointerClick className="w-6 h-6 text-purple-400" />
              Click & Earn / Social Tasks
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              {user.tier === 'PREMIUM' ? '₦1,000 / Task (VIP)' : '₦500 / Task (Free)'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Complete quick sponsored visits and social engagements to earn ₦{user.tier === 'PREMIUM' ? '1,000' : '500'} directly into your wallet.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialTasks.map((task) => {
          const isLocked = task.isPremiumOnly && user.tier !== 'PREMIUM';
          return (
            <div
              key={task.id}
              onClick={() => !task.isCompleted && handleStartTask(task)}
              className={`glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                task.isCompleted
                  ? 'border-emerald-500/30 opacity-75'
                  : isLocked
                  ? 'border-amber-500/30 hover:border-amber-500/60 cursor-pointer'
                  : 'border-gray-800 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-center flex-shrink-0">
                  {getPlatformIcon(task.platform)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-400">
                      {task.platform}
                    </span>
                    {task.isPremiumOnly && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        VIP ONLY
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {task.instructions}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>{task.timerSeconds}s verification</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-emerald-400">
                    +₦{user.tier === 'PREMIUM' ? '1,000' : '500'}
                  </span>

                  {task.isCompleted ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Done
                    </span>
                  ) : isLocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenUpgrade();
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" /> Unlock
                    </button>
                  ) : (
                    <button className="px-3.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm">
                      Start Task
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Execution Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121524] border border-purple-800/40 p-6 sm:p-7 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                {getPlatformIcon(activeTask.platform)}
                <div>
                  <span className="text-xs text-purple-400 font-semibold">{activeTask.platform}</span>
                  <h3 className="text-base font-bold text-white">{activeTask.title}</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveTask(null);
                }}
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 1: Instructions</h4>
              <p className="text-sm text-gray-200">{activeTask.instructions}</p>
            </div>

            {/* Step 2: Open link */}
            <div className="space-y-3">
              <button
                onClick={handleOpenLink}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 hover:scale-[1.01] transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{hasVisited ? 'Re-open Task Link' : 'Open Link to Perform Task'}</span>
              </button>

              {hasVisited && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 text-center space-y-2">
                  <div className="text-xs text-purple-300 font-medium">
                    {countdown > 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 animate-spin text-amber-400" />
                        Verifying action... Please wait {countdown}s
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Verification complete! Ready to claim.
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(0, ((activeTask.timerSeconds - countdown) / activeTask.timerSeconds) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Claim */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-800">
              <div className="text-xs text-gray-400">
                Reward:{' '}
                <span className="text-emerald-400 font-bold text-sm">
                  +₦{user.tier === 'PREMIUM' ? '1,000' : '500'}
                </span>
              </div>

              <button
                onClick={handleClaim}
                disabled={!hasVisited || countdown > 0 || isClaiming}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all ${
                  hasVisited && countdown === 0 && !isClaiming
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white animate-pulse shadow-emerald-950/50'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{isClaiming ? 'Crediting...' : `Claim ₦${user.tier === 'PREMIUM' ? '1,000' : '500'}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
