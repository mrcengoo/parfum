import React from 'react';

interface PerfumerAvatarProps {
  type?: 'mert' | 'arda' | 'ece' | 'selin' | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PerfumerAvatar: React.FC<PerfumerAvatarProps> = ({
  type = 'mert',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }[size];

  const renderCharacterSVG = () => {
    switch (type) {
      case 'mert':
      case 'mert_aksoy':
        // Mert Aksoy: Genç, şık karikatür parfümör, beyaz önlük, koku test şeridi
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <linearGradient id="bg_mert" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="skin_mert" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.2" />
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fbb6ce" />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle cx="60" cy="60" r="56" fill="url(#bg_mert)" stroke="#fbbf24" strokeWidth="3" />
            <circle cx="60" cy="60" r="50" fill="#1e1b4b" opacity="0.6" />

            {/* Shoulders & Lab Coat */}
            <path d="M25 110 C25 85 40 82 60 82 C80 82 95 85 95 110 Z" fill="#ffffff" />
            {/* Inner shirt / tie */}
            <path d="M54 82 L60 100 L66 82 Z" fill="#0284c7" />
            {/* Lapels */}
            <path d="M42 84 L52 110 L40 110 Z" fill="#e2e8f0" />
            <path d="M78 84 L68 110 L80 110 Z" fill="#e2e8f0" />

            {/* Neck */}
            <rect x="52" y="66" width="16" height="18" rx="4" fill="#fed7aa" />

            {/* Head & Face */}
            <ellipse cx="60" cy="52" rx="20" ry="24" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />

            {/* Hair: Modern swoop style */}
            <path d="M38 48 C36 30 50 20 68 22 C82 23 85 35 83 45 C80 34 70 30 55 32 C45 34 40 40 38 48 Z" fill="#451a03" stroke="#292524" strokeWidth="1.5" />
            <path d="M42 42 C48 28 65 26 78 32 C70 30 52 32 46 44 Z" fill="#78350f" />

            {/* Eyebrows */}
            <path d="M48 44 Q53 41 57 44" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M63 44 Q67 41 72 44" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Eyes */}
            <ellipse cx="52" cy="50" rx="3" ry="3.5" fill="#1e293b" />
            <circle cx="53" cy="49" r="1" fill="#ffffff" />
            <ellipse cx="68" cy="50" rx="3" ry="3.5" fill="#1e293b" />
            <circle cx="69" cy="49" r="1" fill="#ffffff" />

            {/* Nose (Nose is prominent for perfumer!) */}
            <path d="M59 48 L62 58 L57 59" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Confident Smile */}
            <path d="M53 64 Q60 69 67 64" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Perfume smelling strip (Mouillette) in hand */}
            <path d="M78 88 L96 68 L100 70 L82 92 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            <path d="M96 68 L104 60" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            {/* Sparkles around strip */}
            <circle cx="106" cy="56" r="2" fill="#fbbf24" />
            <circle cx="94" cy="54" r="1.5" fill="#fbbf24" />
          </svg>
        );

      case 'arda':
      case 'arda_sisman':
        // Arda Şişman: Vintage fötr şapkalı, klasik bıyıklı usta koleksiyoncu
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <linearGradient id="bg_arda" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="56" fill="url(#bg_arda)" stroke="#34d399" strokeWidth="3" />
            <circle cx="60" cy="60" r="50" fill="#0f172a" opacity="0.6" />

            {/* Suit & Velvet Collar */}
            <path d="M22 110 C22 84 38 80 60 80 C82 80 98 84 98 110 Z" fill="#1e293b" />
            <path d="M50 80 L60 96 L70 80 Z" fill="#f8fafc" />
            {/* Red Bowtie */}
            <path d="M53 82 L60 85 L67 82 L60 87 Z" fill="#dc2626" />

            {/* Neck */}
            <rect x="52" y="66" width="16" height="16" rx="4" fill="#fde68a" />

            {/* Face */}
            <ellipse cx="60" cy="54" rx="21" ry="22" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />

            {/* Eyes & Monocle / Eyebrows */}
            <ellipse cx="51" cy="51" rx="3" ry="3" fill="#1e293b" />
            <ellipse cx="69" cy="51" rx="3" ry="3" fill="#1e293b" />
            {/* Monocle on right eye */}
            <circle cx="69" cy="51" r="7" stroke="#fbbf24" strokeWidth="2" fill="none" />
            <path d="M75 56 L82 72" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />

            {/* Classical Curly Moustache */}
            <path d="M46 62 Q54 58 60 62 Q66 58 74 62 Q78 60 76 57 Q68 59 60 59 Q52 59 44 57 Q42 60 46 62 Z" fill="#451a03" stroke="#292524" strokeWidth="1" />

            {/* Perfumer's prominent Nose */}
            <path d="M59 48 L62 57 L57 58" stroke="#b45309" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Vintage Fedora Hat */}
            <ellipse cx="60" cy="36" rx="34" ry="7" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M38 34 C40 18 52 14 60 14 C68 14 80 18 82 34 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="42" y="29" width="36" height="5" fill="#dc2626" />

            {/* Antique dropper in corner */}
            <path d="M18 90 L30 76 L34 80 L22 94 Z" fill="#fbbf24" />
            <circle cx="32" cy="74" r="3" fill="#dc2626" />
          </svg>
        );

      case 'ece':
      case 'ece_yalin':
        // Ece Yalın: Mor gözlüklü, şık topuzlu trend analizcisi kadın parfümör
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <linearGradient id="bg_ece" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#6b21a8" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="56" fill="url(#bg_ece)" stroke="#c084fc" strokeWidth="3" />
            <circle cx="60" cy="60" r="50" fill="#18181b" opacity="0.6" />

            {/* Bun Hair Behind */}
            <circle cx="60" cy="22" r="14" fill="#3f2e20" stroke="#1f1810" strokeWidth="1.5" />

            {/* Purple Blouse & Modern Coat */}
            <path d="M26 110 C26 86 40 82 60 82 C80 82 94 86 94 110 Z" fill="#f1f5f9" />
            <path d="M52 82 L60 98 L68 82 Z" fill="#9333ea" />

            {/* Neck & Pendant */}
            <rect x="54" y="66" width="12" height="16" fill="#fed7aa" />
            <circle cx="60" cy="76" r="3" fill="#a855f7" />

            {/* Face */}
            <ellipse cx="60" cy="52" rx="18" ry="21" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />

            {/* Hair: Elegant side-part & strands */}
            <path d="M42 48 C40 32 50 25 60 25 C70 25 80 32 78 48 C72 36 65 32 60 32 C55 32 48 36 42 48 Z" fill="#3f2e20" />
            <path d="M40 48 C41 58 43 64 45 66 C43 62 42 56 42 48 Z" fill="#3f2e20" />
            <path d="M80 48 C79 58 77 64 75 66 C77 62 78 56 80 48 Z" fill="#3f2e20" />

            {/* Cat-eye stylish glasses */}
            <rect x="44" y="44" width="13" height="9" rx="3" fill="none" stroke="#d946ef" strokeWidth="2.5" />
            <rect x="63" y="44" width="13" height="9" rx="3" fill="none" stroke="#d946ef" strokeWidth="2.5" />
            <path d="M57 48 L63 48" stroke="#d946ef" strokeWidth="2.5" />

            {/* Eyes behind glasses */}
            <circle cx="50.5" cy="48.5" r="2.5" fill="#1e293b" />
            <circle cx="69.5" cy="48.5" r="2.5" fill="#1e293b" />

            {/* Nose */}
            <path d="M60 48 L61 55 L58 56" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Berry lipstick smile */}
            <path d="M54 62 Q60 67 66 62" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Modern Flask in hand */}
            <path d="M86 86 L94 74 L98 74 L98 70 L92 70 L92 74 L96 74 L88 88 Z" fill="#38bdf8" opacity="0.8" />
            <circle cx="95" cy="66" r="2" fill="#a855f7" />
          </svg>
        );

      case 'selin':
      case 'selin_arman':
      default:
        // Selin Arman: Asil, gizemli baş simyager, altın taç, gece siyahı ceket
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <linearGradient id="bg_selin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="56" fill="url(#bg_selin)" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="60" cy="60" r="50" fill="#09090b" opacity="0.5" />

            {/* Long dark wavy hair behind */}
            <path d="M36 45 C30 70 32 95 38 105 C42 85 45 60 45 50 Z" fill="#171717" />
            <path d="M84 45 C90 70 88 95 82 105 C78 85 75 60 75 50 Z" fill="#171717" />

            {/* High Collar Royal Alchemy Cloak */}
            <path d="M24 110 C24 82 38 78 60 78 C82 78 96 82 96 110 Z" fill="#09090b" />
            <path d="M38 84 L60 102 L82 84 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <path d="M46 86 L60 104 L74 86 Z" fill="#4338ca" />

            {/* Gold Alchemy Brooch */}
            <polygon points="60,78 64,84 60,90 56,84" fill="#fbbf24" />

            {/* Neck */}
            <rect x="54" y="64" width="12" height="16" fill="#fed7aa" />

            {/* Face */}
            <ellipse cx="60" cy="50" rx="17" ry="20" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />

            {/* Golden Diadem / Crown */}
            <path d="M45 32 L52 24 L60 30 L68 24 L75 32 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <circle cx="60" cy="28" r="2" fill="#ef4444" />

            {/* Hair Front */}
            <path d="M43 45 C41 33 50 30 60 30 C70 30 79 33 77 45 C73 36 67 34 60 34 C53 34 47 36 43 45 Z" fill="#171717" />

            {/* Seductive & Sharp Eyes */}
            <ellipse cx="52" cy="48" rx="3.5" ry="2.5" fill="#0f172a" />
            <circle cx="53" cy="47" r="1" fill="#ffffff" />
            <path d="M47 45 Q53 43 56 46" stroke="#171717" strokeWidth="1.5" fill="none" />

            <ellipse cx="68" cy="48" rx="3.5" ry="2.5" fill="#0f172a" />
            <circle cx="69" cy="47" r="1" fill="#ffffff" />
            <path d="M64 46 Q67 43 73 45" stroke="#171717" strokeWidth="1.5" fill="none" />

            {/* Nose */}
            <path d="M60 46 L61 53 L58 54" stroke="#c2410c" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Royal Crimson Smile */}
            <path d="M54 60 Q60 64 66 60" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Glowing crystal essence sphere */}
            <circle cx="92" cy="74" r="8" fill="#ec4899" opacity="0.8" />
            <circle cx="92" cy="74" r="5" fill="#f43f5e" />
            <circle cx="90" cy="72" r="2" fill="#ffffff" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-lg shrink-0 ${sizeClasses} ${className}`}>
      {renderCharacterSVG()}
    </div>
  );
};
