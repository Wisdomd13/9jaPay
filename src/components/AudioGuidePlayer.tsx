import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Headphones, RotateCcw, Mic } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const AudioGuidePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [selectedVoiceType, setSelectedVoiceType] = useState<'natural_female' | 'natural_male' | 'natural_host'>('natural_female');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const intervalRef = useRef<number | null>(null);

  const guideSegments = [
    { time: '0:00', title: 'Welcome to 9jaPay', text: 'Welcome to 9jaPay. Nigeria’s most trusted daily earning and micro-task platform.' },
    { time: '0:45', title: 'Watch & Earn', text: 'Watch curated YouTube videos for at least 30 seconds to earn real cash directly to your 9jaPay wallet.' },
    { time: '1:30', title: 'Daily Quiz Rewards', text: 'Answer our daily trivia questions to earn ₦500 to ₦1,000 per correct answer. Premium members receive 10 high-paying quizzes daily.' },
    { time: '2:45', title: 'Premium Upgrade & 9jaLoan', text: 'Upgrade to VIP Premium for ₦10,000 to unlock 5x rewards, instant ₦50,000 micro-loan access, and unlimited daily withdrawals.' },
    { time: '4:10', title: 'Instant Bank Payouts', text: 'Withdraw your earnings seamlessly to OPay, PalmPay, Kuda, FairMoney or any commercial Nigerian bank account.' }
  ];

  const totalDuration = 300; // 5 minutes in seconds

  // Load natural browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const getBestNaturalVoice = () => {
    if (!availableVoices.length) return null;

    if (selectedVoiceType === 'natural_female') {
      // Prioritize natural female English voices
      const femaleKeywords = ['female', 'google uk english female', 'samantha', 'karen', 'victoria', 'serena', 'moira', 'natural', 'jenny', 'aria'];
      const found = availableVoices.find(v => {
        const name = v.name.toLowerCase();
        return (v.lang.startsWith('en') || v.lang.includes('NG') || v.lang.includes('GB') || v.lang.includes('US')) &&
          femaleKeywords.some(kw => name.includes(kw));
      });
      if (found) return found;
    } else if (selectedVoiceType === 'natural_male') {
      // Prioritize natural male English voices
      const maleKeywords = ['male', 'google uk english male', 'daniel', 'oliver', 'guy', 'ryan', 'george'];
      const found = availableVoices.find(v => {
        const name = v.name.toLowerCase();
        return (v.lang.startsWith('en') || v.lang.includes('NG') || v.lang.includes('GB') || v.lang.includes('US')) &&
          maleKeywords.some(kw => name.includes(kw));
      });
      if (found) return found;
    }

    // Default: find best high quality English/Nigerian voice
    return availableVoices.find(v => v.lang === 'en-NG' || v.lang === 'en-GB' || v.lang === 'en-US' || v.name.includes('Natural')) || availableVoices[0];
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Pure natural acoustic prosody settings
      utterance.rate = 0.95; // Natural human conversational rate
      utterance.pitch = selectedVoiceType === 'natural_female' ? 1.05 : 0.96;
      utterance.volume = 1.0;

      const voice = getBestNaturalVoice();
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTogglePlay = () => {
    soundManager.playClickSound();
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      speakText(guideSegments[currentSegment].text);
      intervalRef.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          const next = prev + 1;
          if (next === 45) { setCurrentSegment(1); speakText(guideSegments[1].text); }
          else if (next === 90) { setCurrentSegment(2); speakText(guideSegments[2].text); }
          else if (next === 165) { setCurrentSegment(3); speakText(guideSegments[3].text); }
          else if (next === 250) { setCurrentSegment(4); speakText(guideSegments[4].text); }
          return next;
        });
      }, 1000);
    }
  };

  const handleReset = () => {
    soundManager.playClickSound();
    setIsPlaying(false);
    setProgress(0);
    setCurrentSegment(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#16121D] rounded-3xl p-5 sm:p-6 border border-purple-900/20 flex flex-col justify-between h-full shadow-lg relative overflow-hidden text-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" /> Pure Natural Voiceover
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              HD Natural
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Voice Tone Selector */}
            <select
              value={selectedVoiceType}
              onChange={(e) => {
                const newType = e.target.value as typeof selectedVoiceType;
                setSelectedVoiceType(newType);
                if (isPlaying) {
                  setTimeout(() => speakText(guideSegments[currentSegment].text), 100);
                }
              }}
              className="text-[10px] bg-black/60 border border-purple-800/40 rounded-lg px-2 py-0.5 text-purple-300 font-bold focus:outline-none cursor-pointer"
              title="Select Natural Voice Timbre"
            >
              <option value="natural_female">Natural Voice (Female)</option>
              <option value="natural_male">Natural Voice (Male)</option>
              <option value="natural_host">Natural Voice (Host)</option>
            </select>

            <button
              onClick={handleReset}
              title="Restart Guide"
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={isMuted ? 'Unmute voice' : 'Mute voice'}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
            </button>
          </div>
        </div>

        <h3 className="text-base sm:text-lg leading-snug font-medium text-white font-display">
          How 9jaPay Works:<br />
          <span className="text-xs sm:text-sm text-gray-400 font-normal">
            {isPlaying ? guideSegments[currentSegment].title : 'Listen to natural studio guide to start earning'}
          </span>
        </h3>
      </div>

      {/* Bento Audio Player Bar */}
      <div className="flex items-center gap-3 bg-[#0A050F] rounded-2xl p-3 border border-white/5 mt-4">
        {/* Circular Play Button */}
        <button
          onClick={handleTogglePlay}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 flex items-center justify-center cursor-pointer shadow-md shadow-purple-950/60 transition-transform active:scale-95 flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-white text-white" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${(progress / totalDuration) * 100}%` }}
          />
        </div>

        {/* Timestamp */}
        <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">
          {formatTime(progress)} / 5:00
        </span>
      </div>
    </div>
  );
};
