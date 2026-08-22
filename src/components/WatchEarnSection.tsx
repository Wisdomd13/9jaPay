import React, { useState, useEffect } from 'react';
import { VideoTask, UserProfile } from '../types';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Eye, 
  Youtube, 
  Award, 
  X, 
  Flame,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface WatchEarnSectionProps {
  user: UserProfile;
  videoTasks: VideoTask[];
  onCompleteTask: (taskId: string, type: 'video') => Promise<void>;
  onOpenUpgrade: () => void;
}

export const WatchEarnSection: React.FC<WatchEarnSectionProps> = ({
  user,
  videoTasks,
  onCompleteTask,
  onOpenUpgrade,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeVideo, setActiveVideo] = useState<VideoTask | null>(null);
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const categories = ['All', 'Finance', 'Tech', 'Crypto', 'Tutorial'];

  const isPremium = user.tier === 'PREMIUM';
  const dailyLimit = isPremium ? 10 : 1;
  const completedCount = videoTasks.filter(t => t.isCompleted).length;
  const isCapped = completedCount >= dailyLimit;

  const filteredTasks = videoTasks.filter(task => {
    if (selectedCategory === 'All') return true;
    return task.category === selectedCategory;
  });

  // Watch timer ticker when modal is open
  useEffect(() => {
    let timer: number | null = null;
    if (activeVideo && !activeVideo.isCompleted) {
      timer = window.setInterval(() => {
        setWatchSeconds(prev => {
          if (prev >= activeVideo.requiredWatchSeconds) {
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeVideo]);

  const handleOpenVideo = (task: VideoTask) => {
    soundManager.playClickSound();
    if (task.isCompleted) {
      return;
    }
    if (isCapped) {
      if (!isPremium) {
        onOpenUpgrade();
      }
      return;
    }
    if (task.isPremiumOnly && user.tier !== 'PREMIUM') {
      onOpenUpgrade();
      return;
    }
    setActiveVideo(task);
    setWatchSeconds(0);
    setIsVerifying(false);
  };

  const handleClaimReward = async () => {
    if (!activeVideo || claiming) return;
    setClaiming(true);
    soundManager.playRewardSound();

    try {
      await onCompleteTask(activeVideo.id, 'video');
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 }
      });
      setActiveVideo(prev => prev ? { ...prev, isCompleted: true } : null);
    } catch {
      // Error handled upstream
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <Youtube className="w-6 h-6 text-[#7CFF00]" />
              Watch & Earn Videos
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#063B16] text-[#7CFF00] font-bold border border-[#7CFF00]/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#7CFF00]" /> {user.tier === 'PREMIUM' ? '₦1,000 / Video (VIP)' : '₦500 / Video (Free)'}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
              isCapped 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-[#063B16] text-[#7CFF00] border-[#7CFF00]/30'
            }`}>
              {completedCount}/{dailyLimit} Watched Today {isCapped ? '(Daily Cap Reached)' : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A8B5AB] mt-1">
            Watch curated videos for the required time and receive instant cash (₦{user.tier === 'PREMIUM' ? '1,000' : '500'} per video) in your 9jaPay wallet.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playClickSound();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#063B16] text-[#7CFF00] border border-[#7CFF00] shadow-md shadow-[#7CFF00]/20'
                  : 'bg-[#071A0C] border border-[#7CFF00]/10 text-gray-400 hover:text-white hover:border-[#7CFF00]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => {
          const isLocked = task.isPremiumOnly && user.tier !== 'PREMIUM';
          return (
            <div
              key={task.id}
              onClick={() => handleOpenVideo(task)}
              className={`group relative overflow-hidden rounded-2xl bg-[#071A0C] border transition-all cursor-pointer ${
                task.isCompleted
                  ? 'border-[#22C55E]/40 opacity-80'
                  : isLocked
                  ? 'border-amber-500/30 hover:border-amber-500/60'
                  : 'border-[#7CFF00]/15 hover:border-[#7CFF00] hover:shadow-xl hover:shadow-[#7CFF00]/10 hover:-translate-y-1'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={task.thumbnailUrl}
                  alt={task.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A0C] via-transparent to-black/40" />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-gray-300">
                    {task.category}
                  </span>
                  {task.isPremiumOnly && (
                    <span className="px-2 py-0.5 rounded-md bg-[#FFB800] text-black text-[10px] font-black flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" /> VIP ONLY
                    </span>
                  )}
                </div>

                {/* Views & Duration */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{Math.floor(task.durationSeconds / 60)}:00</span>
                </div>

                {/* Center Play or Lock Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {task.isCompleted ? (
                    <div className="w-12 h-12 rounded-full bg-[#22C55E] text-black flex items-center justify-center shadow-lg shadow-emerald-950/50">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  ) : isLocked ? (
                    <div className="w-12 h-12 rounded-full bg-[#FFB800] text-black flex items-center justify-center shadow-lg shadow-amber-950/50 group-hover:scale-110 transition-transform">
                      <Lock className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#7CFF00] text-black flex items-center justify-center shadow-lg shadow-[#7CFF00]/30 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <p className="text-xs text-[#7CFF00] font-semibold">
                  {task.channelName}
                </p>
                <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#7CFF00] transition-colors">
                  {task.title}
                </h3>

                <div className="pt-2 border-t border-[#7CFF00]/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#A8B5AB]">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Watch {task.requiredWatchSeconds}s</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#7CFF00] font-black text-sm">
                    <span>+₦{user.tier === 'PREMIUM' ? '1,000' : '500'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive YouTube Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#071A0C] border border-[#7CFF00]/30 overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#7CFF00]/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#7CFF00] font-semibold">{activeVideo.category}</span>
                <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">{activeVideo.title}</h3>
              </div>
              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveVideo(null);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Responsive YouTube Iframe */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Watch Timer & Reward Claim Bar */}
            <div className="p-4 sm:p-6 bg-[#040F07] space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#A8B5AB] font-medium">
                  Watch Time Required: <strong className="text-white">{activeVideo.requiredWatchSeconds}s</strong>
                </span>
                <span className="font-mono text-[#7CFF00] font-bold">
                  {watchSeconds}s / {activeVideo.requiredWatchSeconds}s
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-[#7CFF00]/10">
                <div
                  className="bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (watchSeconds / activeVideo.requiredWatchSeconds) * 100)}%`
                  }}
                />
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[#A8B5AB]">
                  Reward:{' '}
                  <span className="text-[#7CFF00] font-bold text-sm">
                    +₦{user.tier === 'PREMIUM' ? '1,000' : '500'}
                  </span>
                </div>

                {activeVideo.isCompleted ? (
                  <div className="flex items-center gap-1.5 text-[#22C55E] font-bold text-sm bg-[#063B16] px-4 py-2 rounded-xl border border-[#22C55E]/30">
                    <CheckCircle className="w-4 h-4" />
                    <span>Reward Already Claimed</span>
                  </div>
                ) : watchSeconds >= activeVideo.requiredWatchSeconds ? (
                  <button
                    onClick={handleClaimReward}
                    disabled={claiming}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] hover:opacity-95 text-black font-black text-sm shadow-lg shadow-[#7CFF00]/20 animate-pulse hover:scale-105 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>{claiming ? 'Claiming...' : `Claim ₦${user.tier === 'PREMIUM' ? '1,000' : '500'}`}</span>
                  </button>
                ) : (
                  <div className="text-xs text-amber-300/80 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                    Watch for {activeVideo.requiredWatchSeconds - watchSeconds}s more to claim...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
