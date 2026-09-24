import React, { useState } from 'react';

interface CountryFlagProps {
  countryCode?: string;
  country?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackEmoji?: string;
}

// Built-in crisp SVG flags for key countries to guarantee instant rendering even without network
const SVG_FLAGS: Record<string, React.ReactNode> = {
  fr: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ed2939" />
    </svg>
  ),
  it: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ce2b37" />
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 1200 800" className="w-full h-full">
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#ffffff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <polygon
        points="583.33,400 706.77,440.11 630.48,335.1 630.48,464.9 706.77,359.89"
        fill="#ffffff"
      />
    </svg>
  ),
  mg: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="1" height="2" fill="#ffffff" />
      <rect x="1" width="2" height="1" fill="#fc3d32" />
      <rect x="1" y="1" width="2" height="1" fill="#007e3a" />
    </svg>
  ),
  ir: (
    <svg viewBox="0 0 7 4" className="w-full h-full">
      <rect width="7" height="1.33" fill="#239f40" />
      <rect y="1.33" width="7" height="1.34" fill="#ffffff" />
      <rect y="2.67" width="7" height="1.33" fill="#da0000" />
      <circle cx="3.5" cy="2" r="0.4" fill="#da0000" />
    </svg>
  ),
  ht: (
    <svg viewBox="0 0 5 3" className="w-full h-full">
      <rect width="5" height="1.5" fill="#00209f" />
      <rect y="1.5" width="5" height="1.5" fill="#d21034" />
      <rect x="2" y="1.1" width="1" height="0.8" fill="#ffffff" rx="0.1" />
    </svg>
  ),
  bg: (
    <svg viewBox="0 0 5 3" className="w-full h-full">
      <rect width="5" height="1" fill="#ffffff" />
      <rect y="1" width="5" height="1" fill="#00966e" />
      <rect y="2" width="5" height="1" fill="#d62612" />
    </svg>
  ),
  in: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="0.67" fill="#ff9933" />
      <rect y="0.67" width="3" height="0.66" fill="#ffffff" />
      <rect y="1.33" width="3" height="0.67" fill="#138808" />
      <circle cx="1.5" cy="1" r="0.22" fill="#000080" />
    </svg>
  ),
  om: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="1" height="2" fill="#db161e" />
      <rect x="1" width="2" height="0.67" fill="#ffffff" />
      <rect x="1" y="0.67" width="2" height="0.66" fill="#db161e" />
      <rect x="1" y="1.33" width="2" height="0.67" fill="#008000" />
    </svg>
  ),
  us: (
    <svg viewBox="0 0 19 10" className="w-full h-full">
      <rect width="19" height="10" fill="#b22234" />
      <rect y="1" width="19" height="1" fill="#ffffff" />
      <rect y="3" width="19" height="1" fill="#ffffff" />
      <rect y="5" width="19" height="1" fill="#ffffff" />
      <rect y="7" width="19" height="1" fill="#ffffff" />
      <rect y="9" width="19" height="1" fill="#ffffff" />
      <rect width="7.6" height="5.38" fill="#3c3b6e" />
    </svg>
  ),
  br: (
    <svg viewBox="0 0 10 7" className="w-full h-full">
      <rect width="10" height="7" fill="#009b3a" />
      <polygon points="5,0.8 9.2,3.5 5,6.2 0.8,3.5" fill="#fedf00" />
      <circle cx="5" cy="3.5" r="1.6" fill="#002776" />
    </svg>
  ),
  eg: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="0.67" fill="#ce1126" />
      <rect y="0.67" width="3" height="0.66" fill="#ffffff" />
      <rect y="1.33" width="3" height="0.67" fill="#000000" />
    </svg>
  ),
  gt: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="1" height="2" fill="#4997d0" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#4997d0" />
    </svg>
  ),
  so: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="2" fill="#4189dd" />
      <polygon points="1.5,0.7 1.6,1.0 1.9,1.0 1.65,1.2 1.75,1.5 1.5,1.3 1.25,1.5 1.35,1.2 1.1,1.0 1.4,1.0" fill="#ffffff" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 2 1" className="w-full h-full">
      <rect width="2" height="1" fill="#00008b" />
      <rect width="1" height="0.5" fill="#00247d" />
      <path d="M0,0 L1,0.5 M1,0 L0,0.5" stroke="#ffffff" strokeWidth="0.1" />
      <path d="M0.5,0 L0.5,0.5 M0,0.25 L1,0.25" stroke="#ffffff" strokeWidth="0.15" />
      <path d="M0.5,0 L0.5,0.5 M0,0.25 L1,0.25" stroke="#cf142b" strokeWidth="0.08" />
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="0.67" fill="#ffffff" />
      <rect y="0.67" width="3" height="0.66" fill="#0039a6" />
      <rect y="1.33" width="3" height="0.67" fill="#d52b1e" />
    </svg>
  ),
  cn: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="2" fill="#de2910" />
      <polygon points="0.5,0.3 0.55,0.45 0.7,0.45 0.58,0.55 0.62,0.7 0.5,0.6 0.38,0.7 0.42,0.55 0.3,0.45 0.45,0.45" fill="#ffde00" />
    </svg>
  ),
  ma: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="2" fill="#c1272d" />
      <polygon points="1.5,0.7 1.56,0.9 1.75,0.9 1.6,1.02 1.65,1.2 1.5,1.1 1.35,1.2 1.4,1.02 1.25,0.9 1.44,0.9" fill="none" stroke="#006233" strokeWidth="0.04" />
    </svg>
  ),
  cl: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect y="1" width="3" height="1" fill="#d52b1e" />
      <rect x="1" width="2" height="1" fill="#ffffff" />
      <rect width="1" height="1" fill="#0039a6" />
      <polygon points="0.5,0.25 0.55,0.42 0.72,0.42 0.58,0.52 0.63,0.7 0.5,0.59 0.37,0.7 0.42,0.52 0.28,0.42 0.45,0.42" fill="#ffffff" />
    </svg>
  )
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode = '',
  country = '',
  className = '',
  size = 'md',
  fallbackEmoji
}) => {
  const [imgError, setImgError] = useState(false);
  const code = (countryCode || '').toLowerCase().trim();

  // Size specifications matching crisp rectangular flag styling from user mockup
  const sizeClasses = {
    xs: 'w-4 h-2.5 min-w-[16px]',
    sm: 'w-5 h-3.5 min-w-[20px]',
    md: 'w-6 h-4 min-w-[24px]',
    lg: 'w-8 h-5.5 min-w-[32px]',
    xl: 'w-10 h-7 min-w-[40px]'
  };

  // If we have an exact built-in SVG vector flag or if the image fails
  const renderFallbackSvg = () => {
    if (code && SVG_FLAGS[code]) {
      return (
        <span
          className={`inline-block overflow-hidden rounded-[2px] shadow-sm border border-slate-700/80 bg-slate-900 shrink-0 ${sizeClasses[size]} ${className}`}
          title={`${country} (${code.toUpperCase()})`}
        >
          {SVG_FLAGS[code]}
        </span>
      );
    }

    if (fallbackEmoji) {
      return (
        <span className={`inline-flex items-center justify-center shrink-0 ${className}`} title={country}>
          {fallbackEmoji}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center justify-center text-[9px] font-bold text-slate-300 bg-slate-800 rounded-[2px] border border-slate-700 shrink-0 uppercase ${sizeClasses[size]} ${className}`}
      >
        {code || '??'}
      </span>
    );
  };

  if (!code) {
    return renderFallbackSvg();
  }

  // Priority 1: Built-in SVG vector flag for instant crispness without external requests
  if (SVG_FLAGS[code] && !imgError) {
    return (
      <span
        className={`inline-block overflow-hidden rounded-[2px] shadow-sm border border-slate-700/80 bg-slate-900 shrink-0 align-middle ${sizeClasses[size]} ${className}`}
        title={`${country} (${code.toUpperCase()})`}
      >
        {SVG_FLAGS[code]}
      </span>
    );
  }

  // Priority 2: High-resolution FlagCDN rectangular graphic
  return (
    <span
      className={`inline-block overflow-hidden rounded-[2px] shadow-sm border border-slate-700/80 bg-slate-900 shrink-0 align-middle ${sizeClasses[size]} ${className}`}
      title={`${country} (${code.toUpperCase()})`}
    >
      {!imgError ? (
        <img
          src={`https://flagcdn.com/w80/${code}.png`}
          srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
          alt={`${country} bayrağı`}
          className="w-full h-full object-cover block"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        renderFallbackSvg()
      )}
    </span>
  );
};
