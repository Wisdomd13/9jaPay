import React, { useState } from 'react';
import { QuizQuestion, SocialTask, VideoTask } from '../types';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Plus, 
  HelpCircle, 
  Share2, 
  Youtube, 
  Sparkles, 
  ExternalLink,
  Lock,
  Save,
  X
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { supabaseDb } from '../lib/supabaseDb';
import { INITIAL_QUIZ_QUESTIONS, INITIAL_VIDEO_TASKS, INITIAL_SOCIAL_TASKS } from '../data/initialData';

interface ContentManagerProps {
  onRefreshParent: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ onRefreshParent }) => {
  const [subTab, setSubTab] = useState<'quizzes' | 'videos' | 'social'>('quizzes');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data lists
  const [quizList, setQuizList] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [videoList, setVideoList] = useState<VideoTask[]>(INITIAL_VIDEO_TASKS);
  const [socialList, setSocialList] = useState<SocialTask[]>(INITIAL_SOCIAL_TASKS);

  // Quiz Form State
  const [quizId, setQuizId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [quizReward, setQuizReward] = useState('500');
  const [quizCategory, setQuizCategory] = useState('General Knowledge');
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);

  // Video Form State
  const [videoEditId, setVideoEditId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoChannel, setVideoChannel] = useState('');
  const [videoYoutubeId, setVideoYoutubeId] = useState('');
  const [videoReward, setVideoReward] = useState('500');
  const [videoWatchSec, setVideoWatchSec] = useState('30');
  const [videoCat, setVideoCat] = useState<'Tech' | 'Finance' | 'Entertainment' | 'Crypto' | 'Tutorial'>('Finance');
  const [videoIsPrem, setVideoIsPrem] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);

  // Social Task Form State
  const [socialEditId, setSocialEditId] = useState('');
  const [socialTitle, setSocialTitle] = useState('');
  const [socialPlatform, setSocialPlatform] = useState<'Telegram' | 'Twitter / X' | 'WhatsApp' | 'TikTok' | 'Instagram' | 'Facebook' | 'YouTube' | 'Threads' | 'Discord' | 'Website / Ad'>('Telegram');
  const [socialActionType, setSocialActionType] = useState<'join' | 'follow' | 'like' | 'visit' | 'subscribe' | 'repost' | 'comment'>('join');
  const [socialReward, setSocialReward] = useState('500');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialTimerSec, setSocialTimerSec] = useState('15');
  const [socialIsPrem, setSocialIsPrem] = useState(false);
  const [socialInstructions, setSocialInstructions] = useState('');
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [socialSearchQuery, setSocialSearchQuery] = useState('');

  // Load live items
  const loadContent = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseDb.fetchAllTasks();
      if (data.quizzes?.length) setQuizList(data.quizzes);
      if (data.videos?.length) setVideoList(data.videos);
      if (data.socials?.length) setSocialList(data.socials);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadContent();
  }, []);

  const showMsg = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ---------------- QUIZ HANDLERS ---------------- //
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      showMsg('Please fill question text and all 4 options (A, B, C, D)', 'error');
      return;
    }

    const newQuiz: QuizQuestion = {
      id: quizId || `quiz_${Date.now()}`,
      question: questionText,
      options: { A: optA, B: optB, C: optC, D: optD },
      correctOption,
      explanation,
      reward: Number(quizReward) || 500,
      category: quizCategory
    };

    setQuizList(prev => {
      const exists = prev.some(q => q.id === newQuiz.id);
      if (exists) {
        return prev.map(q => (q.id === newQuiz.id ? newQuiz : q));
      }
      return [newQuiz, ...prev];
    });

    try {
      await supabaseDb.saveTaskToSupabase({
        id: newQuiz.id,
        title: newQuiz.question,
        category: 'QUIZ',
        reward: newQuiz.reward,
        url_or_content: JSON.stringify({
          options: newQuiz.options,
          correctOption: newQuiz.correctOption,
          explanation: newQuiz.explanation
        }),
        timer_seconds: 30
      });
    } catch {
      // ignore
    }

    soundManager.playSuccessSound();
    showMsg(isEditingQuiz ? 'Quiz question updated successfully!' : 'New Quiz question added live!');
    resetQuizForm();
    onRefreshParent();
  };

  const handleEditQuiz = (q: QuizQuestion) => {
    setQuizId(q.id);
    setQuestionText(q.question);
    setOptA(q.options.A);
    setOptB(q.options.B);
    setOptC(q.options.C);
    setOptD(q.options.D);
    setCorrectOption(q.correctOption);
    setExplanation(q.explanation);
    setQuizReward(String(q.reward));
    setQuizCategory(q.category || 'General Knowledge');
    setIsEditingQuiz(true);
    soundManager.playClickSound();
  };

  const handleDeleteQuiz = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this quiz question from live users?')) return;
    setQuizList(prev => prev.filter(q => q.id !== qId));
    try {
      await supabaseDb.deleteTaskFromSupabase(qId);
    } catch {
      // ignore
    }
    soundManager.playClickSound();
    showMsg('Quiz question deleted.');
    onRefreshParent();
  };

  const resetQuizForm = () => {
    setQuizId('');
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOption('A');
    setExplanation('');
    setQuizReward('500');
    setQuizCategory('General Knowledge');
    setIsEditingQuiz(false);
  };

  // ---------------- VIDEO TASK HANDLERS ---------------- //
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoYoutubeId.trim() || !videoReward) {
      showMsg('Please fill in Title, YouTube ID/Link, and Reward', 'error');
      return;
    }

    const newVideo: VideoTask = {
      id: videoEditId || `vid_${Date.now()}`,
      title: videoTitle,
      channelName: videoChannel || '9jaPay Partner',
      youtubeId: videoYoutubeId,
      reward: Number(videoReward) || 500,
      requiredWatchSeconds: Number(videoWatchSec) || 30,
      durationSeconds: (Number(videoWatchSec) || 30) * 3,
      category: videoCat,
      isPremiumOnly: videoIsPrem,
      thumbnailUrl: `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80`
    };

    setVideoList(prev => {
      const exists = prev.some(v => v.id === newVideo.id);
      if (exists) {
        return prev.map(v => (v.id === newVideo.id ? newVideo : v));
      }
      return [newVideo, ...prev];
    });

    try {
      await supabaseDb.saveTaskToSupabase({
        id: newVideo.id,
        title: newVideo.title,
        category: 'VIDEO',
        reward: newVideo.reward,
        url_or_content: newVideo.youtubeId,
        timer_seconds: newVideo.requiredWatchSeconds
      });
    } catch {
      // ignore
    }

    soundManager.playSuccessSound();
    showMsg(isEditingVideo ? 'Video task updated!' : 'Video task published successfully!');
    resetVideoForm();
    onRefreshParent();
  };

  const handleEditVideo = (v: VideoTask) => {
    setVideoEditId(v.id);
    setVideoTitle(v.title);
    setVideoChannel(v.channelName);
    setVideoYoutubeId(v.youtubeId);
    setVideoReward(String(v.reward));
    setVideoWatchSec(String(v.requiredWatchSeconds));
    setVideoCat(v.category);
    setVideoIsPrem(v.isPremiumOnly);
    setIsEditingVideo(true);
    soundManager.playClickSound();
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to remove this video task?')) return;
    setVideoList(prev => prev.filter(v => v.id !== id));
    try {
      await supabaseDb.deleteTaskFromSupabase(id);
    } catch {
      // ignore
    }
    soundManager.playClickSound();
    showMsg('Video task removed.');
    onRefreshParent();
  };

  const resetVideoForm = () => {
    setVideoEditId('');
    setVideoTitle('');
    setVideoChannel('');
    setVideoYoutubeId('');
    setVideoReward('500');
    setVideoWatchSec('30');
    setVideoCat('Finance');
    setVideoIsPrem(false);
    setIsEditingVideo(false);
  };

  // ---------------- SOCIAL TASK HANDLERS ---------------- //
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialTitle.trim() || !socialUrl.trim() || !socialReward) {
      showMsg('Please fill in Title, Link, and Reward', 'error');
      return;
    }

    const newSocial: SocialTask = {
      id: socialEditId || `soc_${Date.now()}`,
      title: socialTitle,
      platform: socialPlatform,
      actionType: socialActionType,
      reward: Number(socialReward) || 500,
      actionUrl: socialUrl,
      timerSeconds: Number(socialTimerSec) || 15,
      isPremiumOnly: socialIsPrem,
      instructions: socialInstructions || 'Complete social engagement to earn instant cash.'
    };

    setSocialList(prev => {
      const exists = prev.some(s => s.id === newSocial.id);
      if (exists) {
        return prev.map(s => (s.id === newSocial.id ? newSocial : s));
      }
      return [newSocial, ...prev];
    });

    try {
      await supabaseDb.saveTaskToSupabase({
        id: newSocial.id,
        title: newSocial.title,
        category: 'SOCIAL',
        reward: newSocial.reward,
        url_or_content: newSocial.actionUrl,
        timer_seconds: newSocial.timerSeconds
      });
    } catch {
      // ignore
    }

    soundManager.playSuccessSound();
    showMsg(isEditingSocial ? 'Social task updated!' : 'Social task created live!');
    resetSocialForm();
    onRefreshParent();
  };

  const handleEditSocial = (s: SocialTask) => {
    setSocialEditId(s.id);
    setSocialTitle(s.title);
    setSocialPlatform(s.platform);
    setSocialActionType(s.actionType);
    setSocialReward(String(s.reward));
    setSocialUrl(s.actionUrl);
    setSocialTimerSec(String(s.timerSeconds));
    setSocialIsPrem(s.isPremiumOnly);
    setSocialInstructions(s.instructions);
    setIsEditingSocial(true);
    soundManager.playClickSound();
  };

  const handleDeleteSocial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social task?')) return;
    setSocialList(prev => prev.filter(s => s.id !== id));
    try {
      await supabaseDb.deleteTaskFromSupabase(id);
    } catch {
      // ignore
    }
    soundManager.playClickSound();
    showMsg('Social task removed.');
    onRefreshParent();
  };

  const resetSocialForm = () => {
    setSocialEditId('');
    setSocialTitle('');
    setSocialPlatform('Telegram');
    setSocialActionType('join');
    setSocialReward('300');
    setSocialUrl('');
    setSocialTimerSec('15');
    setSocialIsPrem(false);
    setSocialInstructions('');
    setIsEditingSocial(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#7CFF00]/15 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setSubTab('quizzes');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'quizzes'
                ? 'bg-[#063B16] text-[#7CFF00] border border-[#7CFF00] shadow-lg shadow-[#7CFF00]/10'
                : 'bg-[#071A0C] text-[#A8B5AB] hover:text-white border border-[#7CFF00]/15 hover:border-[#7CFF00]/30'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#7CFF00]" />
            <span>Daily Quizzes ({quizList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setSubTab('videos');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'videos'
                ? 'bg-[#063B16] text-[#7CFF00] border border-[#7CFF00] shadow-lg shadow-[#7CFF00]/10'
                : 'bg-[#071A0C] text-[#A8B5AB] hover:text-white border border-[#7CFF00]/15 hover:border-[#7CFF00]/30'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-400" />
            <span>YouTube Video Tasks ({videoList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setSubTab('social');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'social'
                ? 'bg-[#063B16] text-[#7CFF00] border border-[#7CFF00] shadow-lg shadow-[#7CFF00]/10'
                : 'bg-[#071A0C] text-[#A8B5AB] hover:text-white border border-[#7CFF00]/15 hover:border-[#7CFF00]/30'
            }`}
          >
            <Share2 className="w-4 h-4 text-[#7CFF00]" />
            <span>Social Engagement Tasks ({socialList.length})</span>
          </button>
        </div>

        <button
          onClick={loadContent}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold font-mono border border-[#7CFF00]/20 cursor-pointer"
        >
          {isLoading ? 'Syncing...' : '↻ Refresh Content'}
        </button>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
          feedback.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'bg-red-500/20 text-red-300 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-80"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ================================= SUB-TAB 1: QUIZZES ================================= */}
      {subTab === 'quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quiz Form Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#071A0C] border border-[#7CFF00]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7CFF00]" />
                <h3 className="text-sm font-bold text-white">
                  {isEditingQuiz ? 'Edit Quiz Question' : 'Add New Daily Quiz'}
                </h3>
              </div>
              {isEditingQuiz && (
                <button
                  type="button"
                  onClick={resetQuizForm}
                  className="text-[11px] px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">Question Text *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. In what year did Nigeria gain independence?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#7CFF00]/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#7CFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option A text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option B text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Option C *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option C text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Option D *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option D text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-[#7CFF00] mb-1">Correct Answer *</label>
                  <select
                    value={correctOption}
                    onChange={(e) => setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')}
                    className="w-full px-3 py-2 rounded-lg bg-[#040F07] border border-[#7CFF00]/50 text-[#7CFF00] font-bold focus:outline-none"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Reward (₦)</label>
                  <input
                    type="number"
                    value={quizReward}
                    onChange={(e) => setQuizReward(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white font-mono focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={quizCategory}
                    onChange={(e) => setQuizCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">Explanation (Shown after answering)</label>
                <input
                  type="text"
                  placeholder="e.g. Nigeria became an independent state on October 1st, 1960."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] text-black font-black shadow-lg shadow-[#7CFF00]/20 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              >
                <Save className="w-4 h-4" />
                <span>{isEditingQuiz ? 'Update Quiz Question' : 'Publish Quiz Live'}</span>
              </button>
            </form>
          </div>

          {/* Quiz List Column */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-200">
                Active Quiz Question Pool ({quizList.length} total)
              </h3>
              <span className="text-[11px] text-[#A8B5AB] font-mono">Live on users' quiz tab</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {quizList.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-[#071A0C] border border-[#7CFF00]/15 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#063B16] text-[#7CFF00] font-mono font-bold mr-2 border border-[#7CFF00]/30">
                        #{idx + 1} {q.category || 'General'}
                      </span>
                      <span className="text-xs font-bold text-white">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditQuiz(q)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 cursor-pointer"
                        title="Edit question"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(q.id)}
                        className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-800/40 cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'A' ? 'bg-[#063B16] border-[#7CFF00]/50 text-[#7CFF00] font-bold' : 'bg-black/40 border-white/10 text-gray-400'}`}>
                      A: {q.options.A} {q.correctOption === 'A' && '✓ (Correct)'}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'B' ? 'bg-[#063B16] border-[#7CFF00]/50 text-[#7CFF00] font-bold' : 'bg-black/40 border-white/10 text-gray-400'}`}>
                      B: {q.options.B} {q.correctOption === 'B' && '✓ (Correct)'}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'C' ? 'bg-[#063B16] border-[#7CFF00]/50 text-[#7CFF00] font-bold' : 'bg-black/40 border-white/10 text-gray-400'}`}>
                      C: {q.options.C} {q.correctOption === 'C' && '✓ (Correct)'}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'D' ? 'bg-[#063B16] border-[#7CFF00]/50 text-[#7CFF00] font-bold' : 'bg-black/40 border-white/10 text-gray-400'}`}>
                      D: {q.options.D} {q.correctOption === 'D' && '✓ (Correct)'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-[#7CFF00]/10 pt-2">
                    <span>Reward: <strong className="text-[#7CFF00] font-mono">₦{q.reward}</strong></span>
                    <span className="text-gray-400 truncate max-w-[280px]">Note: {q.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================= SUB-TAB 2: VIDEO TASKS ================================= */}
      {subTab === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Form Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#071A0C] border border-[#7CFF00]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white">
                  {isEditingVideo ? 'Edit YouTube Video Task' : 'Create Live YouTube Video Task'}
                </h3>
              </div>
              {isEditingVideo && (
                <button
                  type="button"
                  onClick={resetVideoForm}
                  className="text-[11px] px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to Earn Daily on 9jaPay"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-[#7CFF00]/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#7CFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Channel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 9jaPay Official"
                    value={videoChannel}
                    onChange={(e) => setVideoChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 mb-1">YouTube Video ID / URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dQw4w9WgXcQ"
                    value={videoYoutubeId}
                    onChange={(e) => setVideoYoutubeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white font-mono focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Reward (₦) *</label>
                  <input
                    type="number"
                    required
                    value={videoReward}
                    onChange={(e) => setVideoReward(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white font-mono focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Watch (Sec) *</label>
                  <input
                    type="number"
                    required
                    value={videoWatchSec}
                    onChange={(e) => setVideoWatchSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white font-mono focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Category</label>
                  <select
                    value={videoCat}
                    onChange={(e) => setVideoCat(e.target.value as typeof videoCat)}
                    className="w-full px-3 py-2 rounded-lg bg-[#040F07] border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Tech">Tech</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-[#7CFF00]/15">
                <input
                  type="checkbox"
                  id="vidPremLock"
                  checked={videoIsPrem}
                  onChange={(e) => setVideoIsPrem(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7CFF00] focus:ring-[#7CFF00] bg-gray-900 border-gray-700"
                />
                <label htmlFor="vidPremLock" className="text-gray-200 cursor-pointer font-bold text-[11px]">
                  VIP Premium Members Only (Requires ₦10k upgrade)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] text-black font-black shadow-lg shadow-[#7CFF00]/20 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              >
                <Save className="w-4 h-4" />
                <span>{isEditingVideo ? 'Update Video Task' : 'Publish Live Video Task'}</span>
              </button>
            </form>
          </div>

          {/* Video List Column */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-200">
                Published Video Tasks ({videoList.length} live)
              </h3>
              <span className="text-[11px] text-[#A8B5AB] font-mono">Watch & Earn pool</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {videoList.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-[#071A0C] border border-[#7CFF00]/15 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                      alt={v.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-14 rounded-lg object-cover border border-[#7CFF00]/15 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white line-clamp-1">{v.title}</span>
                        {v.isPremiumOnly && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                            VIP ONLY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#A8B5AB] font-mono">
                        <span>{v.channelName}</span>
                        <span>•</span>
                        <span className="text-[#7CFF00] font-bold">₦{v.reward.toLocaleString()}</span>
                        <span>•</span>
                        <span>{v.requiredWatchSeconds}s watch</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditVideo(v)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 cursor-pointer"
                      title="Edit video task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-800/40 cursor-pointer"
                      title="Delete video task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================= SUB-TAB 3: SOCIAL TASKS ================================= */}
      {subTab === 'social' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Social Form Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#071A0C] border border-[#7CFF00]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#7CFF00]" />
                <h3 className="text-sm font-bold text-white">
                  {isEditingSocial ? 'Edit Social Engagement Task' : 'Create Social Engagement Task'}
                </h3>
              </div>
              {isEditingSocial && (
                <button
                  type="button"
                  onClick={resetSocialForm}
                  className="text-[11px] px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveSocial} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Join 9jaPay Telegram Announcement Channel"
                  value={socialTitle}
                  onChange={(e) => setSocialTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-[#7CFF00]/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#7CFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Platform</label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value as typeof socialPlatform)}
                    className="w-full px-3 py-2 rounded-lg bg-[#040F07] border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  >
                    <option value="Telegram">Telegram</option>
                    <option value="Twitter / X">Twitter / X</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Website / Ad">Website / Ad</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Action Type</label>
                  <select
                    value={socialActionType}
                    onChange={(e) => setSocialActionType(e.target.value as typeof socialActionType)}
                    className="w-full px-3 py-2 rounded-lg bg-[#040F07] border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                  >
                    <option value="join">Join Group / Channel</option>
                    <option value="follow">Follow Page</option>
                    <option value="like">Like & Retweet</option>
                    <option value="subscribe">Subscribe</option>
                    <option value="visit">Visit Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">Target Action Link / URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://t.me/example or https://x.com/example"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white font-mono focus:outline-none focus:border-[#7CFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Reward (₦) *</label>
                  <input
                    type="number"
                    required
                    value={socialReward}
                    onChange={(e) => setSocialReward(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white font-mono focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Timer (Sec)</label>
                  <input
                    type="number"
                    required
                    value={socialTimerSec}
                    onChange={(e) => setSocialTimerSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white font-mono focus:outline-none focus:border-[#7CFF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">Instructions for User</label>
                <input
                  type="text"
                  placeholder="Click the link, follow our handle, return to claim"
                  value={socialInstructions}
                  onChange={(e) => setSocialInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#7CFF00]/20 text-white focus:outline-none focus:border-[#7CFF00]"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-[#7CFF00]/15">
                <input
                  type="checkbox"
                  id="socPremLock"
                  checked={socialIsPrem}
                  onChange={(e) => setSocialIsPrem(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7CFF00] focus:ring-[#7CFF00] bg-gray-900 border-gray-700"
                />
                <label htmlFor="socPremLock" className="text-gray-200 cursor-pointer font-bold text-[11px]">
                  VIP Premium Members Only
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] text-black font-black shadow-lg shadow-[#7CFF00]/20 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              >
                <Save className="w-4 h-4" />
                <span>{isEditingSocial ? 'Update Social Task' : 'Publish Social Task Live'}</span>
              </button>
            </form>
          </div>

          {/* Social List Column */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-200">
                Active Social Tasks ({socialList.length} live)
              </h3>
              <span className="text-[11px] text-[#A8B5AB] font-mono">Engagement Earn pool</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {socialList.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-[#071A0C] border border-[#7CFF00]/15 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white line-clamp-1">{s.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#063B16] text-[#7CFF00] font-mono font-bold border border-[#7CFF00]/30">
                        {s.platform}
                      </span>
                      {s.isPremiumOnly && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#A8B5AB] font-mono">
                      <span className="text-[#7CFF00] font-bold">₦{s.reward.toLocaleString()}</span>
                      <span>•</span>
                      <span>{s.actionType}</span>
                      <span>•</span>
                      <span className="text-gray-400 truncate max-w-[200px]">{s.actionUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditSocial(s)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 cursor-pointer"
                      title="Edit social task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSocial(s.id)}
                      className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-800/40 cursor-pointer"
                      title="Delete social task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
