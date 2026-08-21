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

interface ContentManagerProps {
  onRefreshParent: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ onRefreshParent }) => {
  const [subTab, setSubTab] = useState<'quizzes' | 'videos' | 'social'>('quizzes');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data lists
  const [quizList, setQuizList] = useState<QuizQuestion[]>([]);
  const [videoList, setVideoList] = useState<VideoTask[]>([]);
  const [socialList, setSocialList] = useState<SocialTask[]>([]);

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
      const res = await fetch('/api/admin/content-items');
      if (res.ok) {
        const data = await res.json();
        setQuizList(data.quizQuestions || []);
        setVideoList(data.videoTasks || []);
        setSocialList(data.socialTasks || []);
      }
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

    try {
      const res = await fetch('/api/admin/quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quizId || undefined,
          question: questionText,
          options: { A: optA, B: optB, C: optC, D: optD },
          correctOption,
          explanation,
          reward: Number(quizReward) || 500,
          category: quizCategory
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save quiz');

      soundManager.playSuccessSound();
      showMsg(isEditingQuiz ? 'Quiz question updated successfully!' : 'New Quiz question added live!');
      resetQuizForm();
      loadContent();
      onRefreshParent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving quiz';
      showMsg(msg, 'error');
    }
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
    try {
      const res = await fetch(`/api/admin/quiz-questions/${qId}`, { method: 'DELETE' });
      if (res.ok) {
        soundManager.playClickSound();
        showMsg('Quiz question deleted.');
        loadContent();
        onRefreshParent();
      }
    } catch {
      showMsg('Failed to delete quiz', 'error');
    }
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

    try {
      const res = await fetch('/api/admin/video-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: videoEditId || undefined,
          title: videoTitle,
          channelName: videoChannel,
          youtubeId: videoYoutubeId,
          reward: Number(videoReward),
          requiredWatchSeconds: Number(videoWatchSec),
          durationSeconds: Number(videoWatchSec) * 3,
          category: videoCat,
          isPremiumOnly: videoIsPrem
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save video task');

      soundManager.playSuccessSound();
      showMsg(isEditingVideo ? 'Video task updated!' : 'Video task published successfully!');
      resetVideoForm();
      loadContent();
      onRefreshParent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving video task';
      showMsg(msg, 'error');
    }
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
    try {
      const res = await fetch(`/api/admin/video-tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        soundManager.playClickSound();
        showMsg('Video task removed.');
        loadContent();
        onRefreshParent();
      }
    } catch {
      showMsg('Failed to delete video task', 'error');
    }
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

    try {
      const res = await fetch('/api/admin/social-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: socialEditId || undefined,
          title: socialTitle,
          platform: socialPlatform,
          actionType: socialActionType,
          reward: Number(socialReward),
          actionUrl: socialUrl,
          timerSeconds: Number(socialTimerSec),
          isPremiumOnly: socialIsPrem,
          instructions: socialInstructions
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save social task');

      soundManager.playSuccessSound();
      showMsg(isEditingSocial ? 'Social task updated!' : 'Social task created live!');
      resetSocialForm();
      loadContent();
      onRefreshParent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving social task';
      showMsg(msg, 'error');
    }
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
    try {
      const res = await fetch(`/api/admin/social-tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        soundManager.playClickSound();
        showMsg('Social task removed.');
        loadContent();
        onRefreshParent();
      }
    } catch {
      showMsg('Failed to delete social task', 'error');
    }
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
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setSubTab('quizzes');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'quizzes'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-purple-300" />
            <span>Daily Quizzes ({quizList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setSubTab('videos');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'videos'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-300" />
            <span>YouTube Video Tasks ({videoList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setSubTab('social');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'social'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Share2 className="w-4 h-4 text-cyan-300" />
            <span>Social Engagement Tasks ({socialList.length})</span>
          </button>
        </div>

        <button
          onClick={loadContent}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold font-mono"
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
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0E1322] border border-purple-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  {isEditingQuiz ? 'Edit Quiz Question' : 'Add New Daily Quiz'}
                </h3>
              </div>
              {isEditingQuiz && (
                <button
                  type="button"
                  onClick={resetQuizForm}
                  className="text-[11px] px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-emerald-400 mb-1">Correct Answer *</label>
                  <select
                    value={correctOption}
                    onChange={(e) => setCorrectOption(e.target.value as 'A' | 'B' | 'C' | 'D')}
                    className="w-full px-3 py-2 rounded-lg bg-black/70 border border-emerald-500/50 text-emerald-300 font-bold focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={quizCategory}
                    onChange={(e) => setQuizCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
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
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2"
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
              <span className="text-[11px] text-gray-400 font-mono">Live on users' quiz tab</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {quizList.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-[#0E1322] border border-gray-800 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold mr-2">
                        #{idx + 1} {q.category || 'General'}
                      </span>
                      <span className="text-xs font-bold text-white">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditQuiz(q)}
                        className="p-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/40"
                        title="Edit question"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(q.id)}
                        className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-800/40"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'A' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-black/40 border-gray-800 text-gray-400'}`}>
                      A: {q.options.A} {q.correctOption === 'A' && '✓ (Correct)'}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'B' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-black/40 border-gray-800 text-gray-400'}`}>
                      B: {q.options.B} {q.correctOption === 'B' && '✓ (Correct)'}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'C' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-black/40 border-gray-800 text-gray-400'}`}>
                      C: {q.options.C} {q.correctOption === 'C' && '✓ (Correct)'}
                    </div>
                    <div className={`p-2 rounded-lg border ${q.correctOption === 'D' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold' : 'bg-black/40 border-gray-800 text-gray-400'}`}>
                      D: {q.options.D} {q.correctOption === 'D' && '✓ (Correct)'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-800/60 pt-2">
                    <span>Reward: <strong className="text-emerald-400 font-mono">₦{q.reward}</strong></span>
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
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0E1322] border border-red-900/30 space-y-4">
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
                  className="text-[11px] px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
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
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Watch (Sec) *</label>
                  <input
                    type="number"
                    required
                    value={videoWatchSec}
                    onChange={(e) => setVideoWatchSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Category</label>
                  <select
                    value={videoCat}
                    onChange={(e) => setVideoCat(e.target.value as typeof videoCat)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Tech">Tech</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-gray-800">
                <input
                  type="checkbox"
                  id="vidPremLock"
                  checked={videoIsPrem}
                  onChange={(e) => setVideoIsPrem(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-gray-900 border-gray-700"
                />
                <label htmlFor="vidPremLock" className="text-gray-200 cursor-pointer font-bold text-[11px]">
                  VIP Premium Members Only (Requires ₦10k upgrade)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-950/50 flex items-center justify-center gap-2"
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
              <span className="text-[11px] text-gray-400 font-mono">Watch & Earn pool</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {videoList.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-[#0E1322] border border-gray-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={v.thumbnailUrl || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                      alt={v.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-14 rounded-lg object-cover border border-gray-800 shrink-0"
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
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                        <span>{v.channelName}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">₦{v.reward.toLocaleString()}</span>
                        <span>•</span>
                        <span>{v.requiredWatchSeconds}s watch</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditVideo(v)}
                      className="p-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/40"
                      title="Edit video task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(v.id)}
                      className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-800/40"
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
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0E1322] border border-cyan-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {isEditingSocial ? 'Edit Social Engagement Task' : 'Create Social Engagement Task'}
                </h3>
              </div>
              {isEditingSocial && (
                <button
                  type="button"
                  onClick={resetSocialForm}
                  className="text-[11px] px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
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
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">Platform</label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value as typeof socialPlatform)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
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
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
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
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">Timer (Sec)</label>
                  <input
                    type="number"
                    required
                    value={socialTimerSec}
                    onChange={(e) => setSocialTimerSec(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white font-mono"
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
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-white"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-gray-800">
                <input
                  type="checkbox"
                  id="socPremLock"
                  checked={socialIsPrem}
                  onChange={(e) => setSocialIsPrem(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-gray-900 border-gray-700"
                />
                <label htmlFor="socPremLock" className="text-gray-200 cursor-pointer font-bold text-[11px]">
                  VIP Premium Members Only
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
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
              <span className="text-[11px] text-gray-400 font-mono">Engagement Earn pool</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {socialList.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-[#0E1322] border border-gray-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white line-clamp-1">{s.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                        {s.platform}
                      </span>
                      {s.isPremiumOnly && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                      <span className="text-emerald-400 font-bold">₦{s.reward.toLocaleString()}</span>
                      <span>•</span>
                      <span>{s.actionType}</span>
                      <span>•</span>
                      <span className="text-gray-400 truncate max-w-[200px]">{s.actionUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditSocial(s)}
                      className="p-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/40"
                      title="Edit social task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSocial(s.id)}
                      className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 border border-red-800/40"
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
