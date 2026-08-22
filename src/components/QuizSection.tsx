import React, { useState } from 'react';
import { QuizQuestion, UserProfile } from '../types';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Crown, 
  ArrowRight, 
  RotateCcw, 
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface QuizSectionProps {
  user: UserProfile;
  questions: QuizQuestion[];
  answeredCount: number;
  remainingQuestions: number;
  dailyLimit: number;
  onSubmitAnswer: (questionId: string, selectedOption: 'A' | 'B' | 'C' | 'D') => Promise<{
    isCorrect: boolean;
    correctOption: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    rewardEarned: number;
  }>;
  onOpenUpgrade: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  user,
  questions,
  answeredCount,
  remainingQuestions,
  dailyLimit,
  onSubmitAnswer,
  onOpenUpgrade,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultData, setResultData] = useState<{
    questionId: string;
    isCorrect: boolean;
    correctOption: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    reward: number;
  } | null>(null);

  const currentQuestion = questions[currentIdx] || questions[0];
  const isFreePlan = user.tier !== 'PREMIUM';
  const hasReachedLimit = answeredCount >= dailyLimit;

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (resultData || hasReachedLimit) return;
    soundManager.playClickSound();
    setSelectedOption(opt);
  };

  const handleSubmit = async () => {
    if (!selectedOption || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmitAnswer(currentQuestion.id, selectedOption);
      setResultData({
        questionId: currentQuestion.id,
        isCorrect: res.isCorrect,
        correctOption: res.correctOption,
        explanation: res.explanation,
        reward: res.rewardEarned
      });

      if (res.isCorrect) {
        soundManager.playSuccessSound();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        soundManager.playClickSound();
      }
    } catch {
      // Error handled upstream
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    soundManager.playClickSound();
    setSelectedOption(null);
    setResultData(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#7CFF00]" />
              Daily Quiz Challenge
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#063B16] text-[#7CFF00] font-bold border border-[#7CFF00]/30">
              {user.tier === 'PREMIUM' ? '+₦1,000 / Question (VIP)' : '+₦500 / Question (Free)'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A8B5AB] mt-1">
            Test your knowledge daily. Correct answers earn instant ₦{user.tier === 'PREMIUM' ? '1,000' : '500'} straight to your balance.
          </p>
        </div>

        {/* Tier Allowance Card */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#071A0C] border border-[#7CFF00]/20">
          <div>
            <div className="text-[11px] text-[#A8B5AB] font-medium">Daily Allowance</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{answeredCount} / {dailyLimit} Solved</span>
              {user.tier === 'PREMIUM' ? (
                <span className="text-[10px] text-[#FFB800] font-extrabold px-1.5 py-0.2 rounded bg-amber-400/10">VIP 10/day</span>
              ) : (
                <span className="text-[10px] text-[#7CFF00] font-semibold px-1.5 py-0.2 rounded bg-[#063B16]">Free 1/day</span>
              )}
            </div>
          </div>
          {isFreePlan && (
            <button
              onClick={onOpenUpgrade}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFCC33] to-[#FFB800] text-black font-black text-xs shadow-sm hover:scale-105 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 fill-black" />
              Unlock 10
            </button>
          )}
        </div>
      </div>

      {/* Main Quiz Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#071A0C] border border-[#7CFF00]/25 shadow-2xl relative overflow-hidden text-white">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7CFF00]/10 rounded-full blur-3xl pointer-events-none" />

        {hasReachedLimit && !resultData ? (
          /* Daily Limit Reached Screen */
          <div className="text-center py-10 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#063B16] border border-[#7CFF00]/30 text-[#7CFF00] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white font-display">
              {isFreePlan ? "Today's Free Question Completed!" : "All 10 Daily Quizzes Completed!"}
            </h3>

            <p className="text-sm text-[#A8B5AB]">
              {isFreePlan 
                ? "You have used your 1 daily free question. Upgrade to 9jaPay Premium to unlock all 10 daily questions and earn up to ₦5,000 every single day!"
                : "Great job! You have answered all 10 questions for today. Check back tomorrow at midnight for a fresh batch of trivia!"}
            </p>

            {isFreePlan && (
              <div className="pt-4">
                <button
                  onClick={onOpenUpgrade}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFCC33] via-[#FFB800] to-[#D99100] hover:opacity-95 text-black font-black text-sm shadow-xl shadow-amber-950/50 hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Crown className="w-4 h-4 fill-black" />
                  <span>Upgrade to Premium (Unlock 9 More Quizzes)</span>
                </button>
              </div>
            )}
          </div>
        ) : currentQuestion ? (
          /* Active Question View */
          <div className="space-y-6">
            
            {/* Top Indicator */}
            <div className="flex items-center justify-between border-b border-[#7CFF00]/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-[#063B16] text-[#7CFF00] font-semibold border border-[#7CFF00]/30">
                  {currentQuestion.category}
                </span>
                <span className="text-xs text-[#A8B5AB] font-medium">
                  Question #{currentIdx + 1} of {questions.length}
                </span>
              </div>

              <div className="text-[#7CFF00] font-bold text-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+₦{currentQuestion.reward}</span>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed font-display">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Multiple Choice Options (A, B, C, D) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const optionText = currentQuestion.options[optKey];
                const isSelected = selectedOption === optKey;
                const isThisCorrect = resultData && optKey === resultData.correctOption;
                const isThisWrong = resultData && isSelected && !resultData.isCorrect;
                
                let optionStyle = 'border-[#7CFF00]/15 bg-[#040F07] hover:border-[#7CFF00]/50 hover:bg-[#063B16]/40 text-gray-200 cursor-pointer';
                
                if (resultData) {
                  if (isThisCorrect) {
                    optionStyle = 'border-[#22C55E] bg-[#22C55E]/20 text-[#22C55E] ring-2 ring-[#22C55E]/50 shadow-lg shadow-emerald-950/50';
                  } else if (isThisWrong) {
                    optionStyle = 'border-red-500 bg-red-500/25 text-red-200 ring-2 ring-red-500/50 shadow-lg shadow-red-950/50';
                  } else {
                    optionStyle = 'border-white/5 bg-black/30 text-gray-500 opacity-40';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-[#7CFF00] bg-[#063B16] text-white ring-2 ring-[#7CFF00]/60 shadow-lg shadow-[#7CFF00]/20';
                }

                return (
                  <button
                    key={optKey}
                    type="button"
                    onClick={() => handleSelectOption(optKey)}
                    disabled={Boolean(resultData) || isSubmitting}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2.5 relative ${optionStyle}`}
                  >
                    <div className="flex items-start justify-between w-full gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 transition-colors ${
                          isThisCorrect
                            ? 'bg-[#22C55E] text-black shadow-sm'
                            : isThisWrong
                            ? 'bg-red-500 text-white shadow-sm'
                            : isSelected
                            ? 'bg-[#7CFF00] text-black shadow-sm'
                            : 'bg-white/10 text-gray-300'
                        }`}>
                          {optKey}
                        </span>
                        <span className="text-sm font-semibold pt-1 leading-snug">
                          {optionText}
                        </span>
                      </div>

                      {/* Status Icon */}
                      {isThisCorrect && (
                        <span className="flex items-center gap-1 text-[11px] font-black text-[#22C55E] bg-[#063B16] px-2 py-0.5 rounded-full border border-[#22C55E]/40 flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      )}
                      {isThisWrong && (
                        <span className="flex items-center gap-1 text-[11px] font-black text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-500/40 flex-shrink-0">
                          <XCircle className="w-3.5 h-3.5" /> Wrong
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback & Explanation */}
            {resultData && (
              <div className={`p-4 sm:p-5 rounded-2xl border animate-fadeIn ${
                resultData.isCorrect
                  ? 'bg-[#063B16]/60 border-[#22C55E]/40 text-emerald-200'
                  : 'bg-red-950/30 border-red-500/40 text-red-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-base">
                  {resultData.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      <span>Correct Answer! You earned +₦{resultData.reward}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span>Incorrect! The correct answer was option {resultData.correctOption}.</span>
                    </>
                  )}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-[#A8B5AB] flex items-start gap-2 bg-[#040F07] p-3 rounded-xl border border-[#7CFF00]/10">
                  <BookOpen className="w-4 h-4 text-[#7CFF00] flex-shrink-0 mt-0.5" />
                  <p>{resultData.explanation}</p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-[#7CFF00]/10">
              <div className="text-xs text-[#A8B5AB]">
                {resultData ? 'Question finished' : 'Select an option to submit'}
              </div>

              {resultData ? (
                <div className="flex items-center gap-3">
                  {currentIdx < questions.length - 1 && remainingQuestions > 0 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7CFF00] to-[#39E600] text-black font-black text-sm shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : isFreePlan ? (
                    <button
                      onClick={onOpenUpgrade}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFCC33] to-[#FFB800] text-black font-black text-sm shadow-md flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                    >
                      <Crown className="w-4 h-4 fill-black" />
                      <span>Upgrade for 9 More Questions</span>
                    </button>
                  ) : (
                    <div className="text-xs text-[#22C55E] font-bold">
                      Daily Quizzes Completed
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption || isSubmitting}
                  className={`px-7 py-3 rounded-xl font-black text-sm transition-all shadow-lg cursor-pointer ${
                    selectedOption && !isSubmitting
                      ? 'bg-gradient-to-r from-[#7CFF00] via-[#39E600] to-[#00B83D] text-black shadow-[#7CFF00]/20 hover:scale-105'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Checking Answer...' : 'Submit Answer'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">Loading daily quiz challenges...</div>
        )}
      </div>
    </div>
  );
};
