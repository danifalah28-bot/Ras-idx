import React from 'react';

interface RasIdxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function RasIdxLogo({
  size = 'md',
  showSubtitle = false,
  className = '',
}: RasIdxLogoProps) {
  const dimensions =
    size === 'sm'
      ? { box: 'h-8 w-8 rounded-[10px]', svg: 'h-5 w-5', title: 'text-sm', sub: 'text-[9.5px]', gap: 'gap-2' }
      : size === 'lg'
      ? { box: 'h-12 w-12 rounded-[15px]', svg: 'h-7 w-7', title: 'text-xl', sub: 'text-[11px]', gap: 'gap-3' }
      : { box: 'h-10 w-10 rounded-[13px]', svg: 'h-6 w-6', title: 'text-[17px]', sub: 'text-[10.5px]', gap: 'gap-2.5' };

  return (
    <span className={`inline-flex items-center ${dimensions.gap} select-none whitespace-nowrap shrink-0 ${className}`}>
      <span
        className={`grid place-items-center shrink-0 shadow-[0_6px_18px_rgba(0,224,138,0.18)] ${dimensions.box}`}
        style={{
          background: 'linear-gradient(145deg, #00e08a, #0a8f5c 45%, #1e5cff)',
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={dimensions.svg}>
          <path
            d="M10 44 L24 28 L34 36 L54 14"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="54" cy="14" r="6" fill="white" />
          <path
            d="M12 52 H52"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-tight text-left">
        <span className={`font-display font-bold tracking-tight text-slate-900 dark:text-[#eaf1f7] ${dimensions.title}`}>
          RAS.IDX <span className="text-emerald-600 dark:text-[#00e08a]">Terminal</span>
        </span>
        {showSubtitle && (
          <span className={`font-medium tracking-[0.4px] uppercase text-slate-500 dark:text-[#8d9aa8] ${dimensions.sub}`}>
            Riset saham Indonesia
          </span>
        )}
      </span>
    </span>
  );
}
