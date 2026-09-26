import React, { useState, useEffect } from 'react';
import { getRawMaterialImage } from '../../data/rawMaterialImages';

interface NoteImageProps {
  id?: string;
  src?: string;
  name?: string;
  fallbackEmoji?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'circle' | 'square';
  className?: string;
}

export const NoteImage: React.FC<NoteImageProps> = ({
  id,
  src,
  name = '',
  fallbackEmoji = '🌸',
  size = 'md',
  shape = 'rounded',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = src || (id ? getRawMaterialImage(id) : undefined);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl, id]);

  const sizeClasses = {
    xs: 'w-6 h-6 min-w-[24px] text-xs',
    sm: 'w-8 h-8 min-w-[32px] text-sm',
    md: 'w-10 h-10 min-w-[40px] text-base',
    lg: 'w-12 h-12 min-w-[48px] text-xl',
    xl: 'w-16 h-16 min-w-[64px] text-2xl'
  };

  const shapeClasses = {
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  if (!imageUrl || hasError) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-slate-800/90 border border-slate-700/80 select-none shrink-0 shadow-sm ${shapeClasses[shape]} ${sizeClasses[size]} ${className}`}
        title={name}
      >
        <span>{fallbackEmoji}</span>
      </span>
    );
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden bg-white/95 border border-slate-700/80 shadow-sm shrink-0 p-0.5 group-hover:scale-105 transition-transform duration-200 ${shapeClasses[shape]} ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className="w-full h-full object-contain block drop-shadow-xs"
      />
    </span>
  );
};
