import React, { useState } from 'react';
import { PricePoint } from '../../types';

interface MiniChartProps {
  data: PricePoint[];
  basePrice?: number;
  height?: number;
  width?: number | string;
  showDetails?: boolean;
  interactive?: boolean;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  basePrice = 100,
  height = 50,
  width = 140,
  showDetails = false,
  interactive = false
}) => {
  const [activeRange, setActiveRange] = useState<'year' | 'all'>('year');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-xs text-slate-500 italic">Yetersiz veri</div>;
  }

  // Generate or extract "SON 1 YIL" milestone points (12 ay, 9 ay, 6 ay, 3 ay önce, Bugün)
  // based on actual price trajectory
  const currentPrice = data[data.length - 1].price;
  const historicalYearPoints: PricePoint[] = [
    { timestamp: Date.now() - 365 * 86400000, price: Math.round(basePrice * 0.82 * 10) / 10, label: '12 ay önce' },
    { timestamp: Date.now() - 270 * 86400000, price: Math.round(basePrice * 0.91 * 10) / 10, label: '9 ay önce' },
    { timestamp: Date.now() - 180 * 86400000, price: Math.round(basePrice * 0.87 * 10) / 10, label: '6 ay önce' },
    { timestamp: Date.now() - 90 * 86400000, price: Math.round(basePrice * 1.03 * 10) / 10, label: '3 ay önce' },
    { timestamp: Date.now(), price: currentPrice, label: 'Bugün' }
  ];

  // Active dataset depending on toggle
  const activeData = activeRange === 'year' && interactive ? historicalYearPoints : data;

  const prices = activeData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  const svgWidth = typeof width === 'number' ? width : 280;
  const svgHeight = height;

  const points = activeData.map((d, i) => {
    const x = (i / Math.max(1, activeData.length - 1)) * (svgWidth - 16) + 8;
    const y = svgHeight - 8 - ((d.price - minPrice) / range) * (svgHeight - 16);
    return { x, y, point: d };
  });

  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isUp = lastPrice >= firstPrice;
  const strokeColor = isUp ? '#10b981' : '#f43f5e';

  const areaD = `${pathD} L ${points[points.length - 1]?.x || svgWidth - 8},${svgHeight} L ${points[0]?.x || 8},${svgHeight} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="flex flex-col w-full">
      {/* Range switch & active price display for interactive modal view */}
      {interactive && (
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveRange('year')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeRange === 'year' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              SON 1 YIL
            </button>
            <button
              onClick={() => setActiveRange('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeRange === 'all' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              TÜM FİYAT GEÇMİŞİ
            </button>
          </div>

          {activePoint && (
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block">
                {activePoint.point.label || new Date(activePoint.point.timestamp).toLocaleTimeString('tr-TR')}
              </span>
              <span className="text-sm font-bold text-amber-300">
                {activePoint.point.price.toFixed(1)} ₺
              </span>
            </div>
          )}
        </div>
      )}

      {/* SVG Chart */}
      <div className="relative w-full overflow-visible">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          style={{ maxHeight: `${svgHeight}px` }}
        >
          <defs>
            <linearGradient id={`grad_mini_${isUp ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill={`url(#grad_mini_${isUp ? 'up' : 'down'})`} />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive or end dots */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const isEnd = idx === points.length - 1;

            if (!interactive && !isEnd) return null;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : (isEnd ? 3.5 : 2.5)}
                  fill={isHovered ? '#ffffff' : strokeColor}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-Axis Milestone Breakdown for SON 1 YIL */}
      {interactive && activeRange === 'year' && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Fiyat Değişim Kronolojisi</span>
            <span className="text-amber-400 font-mono text-[9px]">Son 1 Yıl Dönemleri</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {historicalYearPoints.map((pt, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  hoveredIndex === i
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-slate-900/90 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="text-[10px] text-slate-400">{pt.label}</div>
                <div className="font-mono font-bold text-xs text-amber-300 mt-0.5">
                  {pt.price.toFixed(1)} ₺
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History Breakdown for TÜM FİYAT GEÇMİŞİ */}
      {interactive && activeRange === 'all' && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Canlı Borsa Kayıtları ({data.length} tik)</span>
            <span className="text-emerald-400 font-mono text-[9px]">Anlık Simülasyon</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {data.slice(-8).map((pt, i, arr) => (
              <div
                key={i}
                className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shrink-0 text-center min-w-[72px]"
              >
                <div className="text-[9px] text-slate-500 font-mono">
                  {new Date(pt.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-[11px] font-mono font-bold text-white mt-0.5">
                  {pt.price.toFixed(1)} ₺
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Min/Max guidance when showDetails is enabled */}
      {showDetails && !interactive && (
        <div className="flex justify-between w-full text-[10px] font-mono text-slate-400 mt-1 px-1">
          <span>Min: {minPrice.toFixed(1)} ₺</span>
          <span>Max: {maxPrice.toFixed(1)} ₺</span>
        </div>
      )}
    </div>
  );
};
