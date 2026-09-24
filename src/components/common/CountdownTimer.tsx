import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  startTime: number;
  endTime: number;
  onComplete?: () => void;
  showProgress?: boolean;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  startTime,
  endTime,
  onComplete,
  showProgress = true,
  className = ''
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endTime && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const totalDuration = Math.max(1, endTime - startTime);
  const remainingMs = Math.max(0, endTime - now);
  const remainingSecs = Math.ceil(remainingMs / 1000);

  const minutes = Math.floor(remainingSecs / 60);
  const seconds = remainingSecs % 60;

  const progressPercent = Math.min(100, Math.max(0, ((now - startTime) / totalDuration) * 100));

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-amber-400 font-semibold">{formattedTime}</span>
        <span className="text-slate-400 text-[11px]">{Math.round(progressPercent)}%</span>
      </div>
      {showProgress && (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
