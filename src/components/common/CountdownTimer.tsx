import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

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
  const { isGamePaused } = useGame();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (isGamePaused) return;

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endTime && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete, isGamePaused]);

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
        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
          <span>{formattedTime}</span>
          {isGamePaused && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans font-bold">
              ⏸️ Beklemede
            </span>
          )}
        </span>
        <span className="text-slate-400 text-[11px]">{Math.round(progressPercent)}%</span>
      </div>
      {showProgress && (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isGamePaused
                ? 'bg-amber-500/60'
                : 'bg-gradient-to-r from-amber-500 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
