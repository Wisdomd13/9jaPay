import React from 'react';
import { 
  LayoutDashboard, 
  Youtube, 
  Zap, 
  MousePointerClick, 
  Gift
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { UserProfile } from '../types';

interface BottomNavProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ user, activeTab, setActiveTab, onOpenAuth }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Youtube className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <Zap className="w-4 h-4" />, isCenter: true },
    { id: 'socials', label: 'Click', icon: <MousePointerClick className="w-4 h-4" /> },
    { id: 'referral', label: 'Refer', icon: <Gift className="w-4 h-4" /> },
  ];

  const handleTabClick = (tabId: string) => {
    soundManager.playClickSound();
    if (!user && tabId !== 'dashboard') {
      onOpenAuth('register');
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 z-40 px-3 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto bg-[#071A0C]/95 border border-[#7CFF00]/25 p-1.5 rounded-3xl flex justify-around items-center h-16 shadow-2xl backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center -translate-y-3 transition-transform ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7CFF00] via-[#39E600] to-[#00B83D] flex items-center justify-center text-black shadow-lg shadow-[#7CFF00]/30 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-[#071A0C] flex items-center justify-center text-[#7CFF00]">
                    <Zap className="w-5 h-5 fill-[#7CFF00]" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-[#7CFF00] mt-0.5">Quiz</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#7CFF00] font-black'
                  : 'text-[#A8B5AB] hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#7CFF00]/15 text-[#7CFF00] border border-[#7CFF00]/30' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
