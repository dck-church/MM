import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'text-slate-900',
  className = '',
}) => {
  const dimensions = {
    sm: { icon: 34, title: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 44, title: 'text-base font-bold', sub: 'text-[10px]' },
    lg: { icon: 58, title: 'text-xl font-bold', sub: 'text-xs' },
    xl: { icon: 76, title: 'text-2xl font-extrabold', sub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3M Triangle Logo: 2 capital Ms at base, 1 capital M centered on top */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0c1a30] via-[#102447] to-[#071120] p-1.5 shadow-md ring-1 ring-[#eab308]/40"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* Golden pyramid apex glow */}
          <circle cx="50" cy="50" r="44" stroke="#eab308" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />

          {/* Top Centered M (Gold Accent) */}
          <g transform="translate(28, 12)">
            <path
              d="M 4 36 L 4 6 L 16 22 L 28 22 L 40 6 L 40 36 L 33 36 L 33 16 L 24 28 L 20 28 L 11 16 L 11 36 Z"
              fill="url(#goldGrad)"
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"
            />
          </g>

          {/* Bottom Left M */}
          <g transform="translate(6, 50)">
            <path
              d="M 4 36 L 4 6 L 16 22 L 28 22 L 40 6 L 40 36 L 33 36 L 33 16 L 24 28 L 20 28 L 11 16 L 11 36 Z"
              fill="url(#baseGrad)"
            />
          </g>

          {/* Bottom Right M */}
          <g transform="translate(50, 50)">
            <path
              d="M 4 36 L 4 6 L 16 22 L 28 22 L 40 6 L 40 36 L 33 36 L 33 16 L 24 28 L 20 28 L 11 16 L 11 36 Z"
              fill="url(#baseGrad)"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="leading-tight">
          <div className={`tracking-tight ${dimensions.title} ${textColor} flex items-center gap-1.5`}>
            <span>TRIPPLE MMM</span>
            <span className="text-[#d97706] text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">LTD</span>
          </div>
          <div className={`font-semibold tracking-wider text-[#d97706] uppercase ${dimensions.sub}`}>
            Investments Company
          </div>
        </div>
      )}
    </div>
  );
};
