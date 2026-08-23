import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Headphones, 
  RotateCcw, 
  Sparkles, 
  Radio, 
  Zap,
  Info
} from 'lucide-react';
import { soundManager, PLATFORM_EXPLAINER_TRANSCRIPT, VoiceType } from '../utils/audio';

export const AudioGuidePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceType, setVoiceType] = useState<VoiceType>('natural_female');

  // Sync mute state
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    if (nextMuted) {
      setIsPlaying(false);
      soundManager.stopSpeaking();
    }
  };

  // Switch voice type
  const handleVoiceChange = (newVoice: VoiceType) => {
    setVoiceType(newVoice);
    soundManager.setVoiceType(newVoice);
    if (isPlaying) {
      soundManager.speak(PLATFORM_EXPLAINER_TRANSCRIPT, {
        voiceType: newVoice,
        rate: 1.0,
        pitch: 1.0,
        onEnd: () => setIsPlaying(false)
      });
    }
  };

  // Play / Pause Master Guide
  const handleTogglePlay = () => {
    soundManager.playClickSound();
    if (isPlaying) {
      setIsPlaying(false);
      soundManager.stopSpeaking();
    } else {
      if (isMuted) {
        setIsMuted(false);
        soundManager.setMuted(false);
      }
      setIsPlaying(true);
      soundManager.speak(PLATFORM_EXPLAINER_TRANSCRIPT, {
        voiceType,
        rate: 1.0,
        pitch: 1.0,
        onEnd: () => setIsPlaying(false)
      });
    }
  };

  // Restart from beginning
  const handleReset = () => {
    soundManager.playClickSound();
    soundManager.stopSpeaking();
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      soundManager.stopSpeaking();
    };
  }, []);

  return (
    <div className="bg-[#0D0B14] rounded-3xl p-5 sm:p-6 border border-purple-900/30 flex flex-col justify-between shadow-xl relative overflow-hidden text-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7CFF00]/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                  Audio Platform Explainer
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  HD Voice
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Voice Selector & Mute */}
          <div className="flex items-center gap-2">
            <select
              value={voiceType}
              onChange={(e) => handleVoiceChange(e.target.value as VoiceType)}
              className="text-[11px] bg-black/60 border border-purple-700/40 rounded-xl px-2.5 py-1 text-purple-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="natural_female">Natural Voice (Female)</option>
              <option value="natural_male">Natural Voice (Male)</option>
              <option value="natural_host">Natural Studio (Host)</option>
            </select>

            <button
              type="button"
              onClick={handleReset}
              title="Restart from beginning"
              className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute voiceover' : 'Mute voiceover'}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        </div>

        {/* Current Active Voiceover Display */}
        <div className="my-3 p-4 rounded-2xl bg-black/40 border border-purple-800/30 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> How 9jaPay Works (Full Audio Guide)
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Speaking Live...
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-purple-100 font-medium leading-relaxed italic">
            "Welcome! I'll be explaining to you how 9jaPay works. Complete daily tasks, watch YouTube videos, and take trivia quizzes to earn guaranteed cash into your bank account. Upgrade to VIP to earn ₦1,000 per video, unlock 10 daily quizzes, and withdraw every day!"
          </p>
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3 bg-[#06030A] rounded-2xl p-3 border border-white/10">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 flex items-center justify-center cursor-pointer shadow-lg shadow-purple-950/60 transition-transform active:scale-95 flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            )}
          </button>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[11px] text-gray-300 font-medium">
              <span>{isPlaying ? 'Playing Full Platform Explainer (Normal Speed 1.0x)' : 'Click to Listen to Complete Audio Guide'}</span>
              <span className="text-purple-300 font-mono font-bold">{isPlaying ? 'Active' : 'Ready'}</span>
            </div>
            <div className="h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-purple-500 to-[#7CFF00] transition-all duration-300 ${
                  isPlaying ? 'w-full animate-pulse' : 'w-0'
                }`} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
