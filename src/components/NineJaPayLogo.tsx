import React from 'react';

interface NineJaPayLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon-only';
}

export const NineJaPayLogo: React.FC<NineJaPayLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
    '2xl': 'text-6xl'
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 9jaPay Iconic 3D Green '9' Folded Emblem */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(34,197,94,0.35)]`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform hover:scale-105 transition-transform duration-200"
        >
          <defs>
            {/* Main vibrant lime to green gradient */}
            <linearGradient id="nineja_lime_green" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a3e635" />
              <stop offset="45%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Inner folded arrow ribbon gradient (3D depth) */}
            <linearGradient id="nineja_arrow_shade" x1="120" y1="50" x2="175" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="60%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>

            {/* 3D Under-ribbon crease shadow */}
            <linearGradient id="nineja_crease" x1="100" y1="90" x2="140" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* Top 9 ring highlight */}
            <linearGradient id="nineja_ring_hi" x1="40" y1="30" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d9f99d" />
              <stop offset="30%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* Under-fold / 3D Shadow Layer */}
          <path
            d="M 108 85 L 142 122 L 112 175 L 82 175 L 102 120 Z"
            fill="url(#nineja_crease)"
            opacity="0.95"
          />

          {/* Right Play Arrow / Chevron Fold */}
          <path
            d="M 108 42 L 158 42 C 172 42 186 54 186 68 C 186 78 180 88 174 96 L 126 156 C 120 164 110 168 100 168 L 78 168 L 118 104 C 124 94 126 84 122 74 L 108 42 Z"
            fill="url(#nineja_arrow_shade)"
          />

          {/* Primary '9' Loop and Stem - Layer with cut-out counter hole */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 94 30 C 58.65 30 30 58.65 30 94 C 30 129.35 58.65 158 94 158 C 104.2 158 113.8 155.6 122.3 151.3 L 64 175 L 30 175 L 48 152 C 34.5 137.5 26 116.8 26 94 C 26 49.8 61.8 14 106 14 C 122.5 14 137.8 19 150.5 27.6 L 132.8 45.3 C 121.7 35.8 108.4 30 94 30 Z M 94 58 C 74.1 58 58 74.1 58 94 C 58 113.9 74.1 130 94 130 C 113.9 130 130 113.9 130 94 C 130 74.1 113.9 58 94 58 Z"
            fill="url(#nineja_ring_hi)"
          />

          {/* Forward Action Ribbon (Smooth Front Cap) */}
          <path
            d="M 102 18 C 108 18 135 18 152 28 C 166 36 178 52 178 70 C 178 84 170 98 158 112 L 98 178 C 92 184 84 186 76 186 L 36 186 C 28 186 24 178 28 172 L 56 136 C 42 122 34 104 34 84 C 34 48 64 18 102 18 Z M 92 56 C 76.5 56 64 68.5 64 84 C 64 99.5 76.5 112 92 112 C 107.5 112 120 99.5 120 84 C 120 68.5 107.5 56 92 56 Z"
            fill="url(#nineja_lime_green)"
          />

          {/* Gloss & Glow Highlights */}
          <path
            d="M 94 22 C 126 22 152 46 156 76 C 148 50 124 32 94 32 C 68 32 46 48 38 72 C 44 43 66 22 94 22 Z"
            fill="#ffffff"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* Modern Wordmark: "9ja" in Crisp White + "pay" in Bright Emerald/Neon Green */}
      {showText && (
        <span className={`${textSizes[size]} font-black tracking-tight flex items-baseline font-display`}>
          <span className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">9ja</span>
          <span className="text-[#00E676] bg-gradient-to-r from-[#84cc16] via-[#22c55e] to-[#00E676] bg-clip-text text-transparent ml-0.5 drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]">
            pay
          </span>
        </span>
      )}
    </div>
  );
};

