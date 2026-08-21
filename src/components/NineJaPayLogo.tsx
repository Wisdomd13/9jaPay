import React from 'react';
import appLogo from '../assets/images/9japay_logo_1787151742060.jpg';

interface NineJaPayLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NineJaPayLogo: React.FC<NineJaPayLogoProps> = ({
  className = '',
  showText = true,
  size = 'md'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 9jaPay Iconic Logo Asset */}
      <div className={`relative ${iconSizes[size]} overflow-hidden shadow-lg shadow-purple-950/60 border border-purple-500/40 flex-shrink-0 bg-gradient-to-tr from-purple-900 to-amber-600 flex items-center justify-center`}>
        <img
          src={appLogo}
          alt="9jaPay Logo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`${textSizes[size]} font-black tracking-tight text-white font-display flex items-center`}>
          9ja<span className="text-amber-400">Pay</span>
        </span>
      )}
    </div>
  );
};
