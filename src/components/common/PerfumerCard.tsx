import React from 'react';
import { Perfumer } from '../../types';
import { PerfumerAvatar } from './PerfumerAvatar';
import { Sparkles, TrendingUp, FlaskConical, Truck, Globe2, Droplets, Check, CheckCircle2 } from 'lucide-react';

interface PerfumerCardProps {
  perfumer: Perfumer;
  isAssignedToPlayer?: boolean;
  assignedCompanyName?: string;
  onAssign?: () => void;
  showAssignAction?: boolean;
}

export const PerfumerCard: React.FC<PerfumerCardProps> = ({
  perfumer,
  isAssignedToPlayer = false,
  assignedCompanyName,
  onAssign,
  showAssignAction = false
}) => {
  // Format all bonuses with +X% as required
  const formatBonusPct = (val: number) => {
    const absVal = Math.abs(val) * 100;
    return `+${absVal.toFixed(0)}%`;
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between shadow-xl min-w-0 w-full overflow-hidden ${
        isAssignedToPlayer
          ? 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/60 shadow-purple-950/30 ring-1 ring-purple-500/50'
          : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="space-y-3 min-w-0">
        
        {/* Top Header: PARFÜMATÖR & AKTİF BURUN badge */}
        <div className="flex items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
            PARFÜMATÖR
          </span>

          {isAssignedToPlayer ? (
            <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full flex items-center gap-1 shrink-0">
              <Check className="w-2.5 h-2.5 text-purple-400" />
              AKTİF BURUN
            </span>
          ) : assignedCompanyName ? (
            <span className="px-2 py-0.5 text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-full truncate max-w-[120px]">
              {assignedCompanyName}
            </span>
          ) : null}
        </div>

        {/* Character Cartoon Picture & Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <PerfumerAvatar
            type={perfumer.avatarType || perfumer.id}
            size="md"
            className="border-2 border-slate-700 shadow-md shrink-0"
          />

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">
              {perfumer.name}
            </h3>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {perfumer.role}
            </div>
          </div>
        </div>

        {/* Primary Stats: NOTA UYUMU, TREND UYUMU, AR-GE SEVİYESİ (X / 10) */}
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs">
          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase font-semibold truncate flex items-center justify-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> NOTA
            </div>
            <div className="text-xs font-bold font-mono text-amber-300 mt-0.5">
              {perfumer.noteHarmony} <span className="text-[9px] text-slate-500 font-normal">/ 10</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase font-semibold truncate flex items-center justify-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5 text-blue-400" /> TREND
            </div>
            <div className="text-xs font-bold font-mono text-blue-300 mt-0.5">
              {perfumer.trendFit} <span className="text-[9px] text-slate-500 font-normal">/ 10</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase font-semibold truncate flex items-center justify-center gap-0.5">
              <FlaskConical className="w-2.5 h-2.5 text-purple-400" /> AR-GE
            </div>
            <div className="text-xs font-bold font-mono text-purple-300 mt-0.5">
              {perfumer.rdLevel} <span className="text-[9px] text-slate-500 font-normal">/ 10</span>
            </div>
          </div>
        </div>

        {/* BONUSLAR: LOJİSTİK +X%, İHRACAT +X%, FİRE +X% */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-[11px]">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            BONUSLAR
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Truck className="w-3 h-3 text-slate-500 shrink-0" /> LOJİSTİK:
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {formatBonusPct(perfumer.logisticsBonus)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Globe2 className="w-3 h-3 text-slate-500 shrink-0" /> İHRACAT:
            </span>
            <span className="font-mono font-bold text-indigo-300">
              {formatBonusPct(perfumer.exportBonus)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Droplets className="w-3 h-3 text-slate-500 shrink-0" /> FİRE:
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {formatBonusPct(perfumer.wasteBonus)}
            </span>
          </div>
        </div>

      </div>

      {/* Commercial Terms & Action: TASARIM ÜCRETİ, SATIŞ TELİFİ */}
      <div className="pt-2.5 mt-2 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-2">
          <div className="min-w-0">
            <div className="text-[9px] text-slate-400 uppercase font-semibold truncate">TASARIM ÜCRETİ</div>
            <div className="font-mono font-bold text-amber-300 text-xs mt-0.5 truncate">
              {perfumer.designFee.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div className="min-w-0 text-right">
            <div className="text-[9px] text-slate-400 uppercase font-semibold truncate">SATIŞ TELİFİ</div>
            <div className="font-mono font-bold text-purple-300 text-xs mt-0.5">
              %{(perfumer.royaltyRate * 100).toFixed(1)}
            </div>
          </div>
        </div>

        {showAssignAction && !isAssignedToPlayer && onAssign && (
          <button
            onClick={onAssign}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
          >
            AromaLux'a Baş Parfümör Ata
          </button>
        )}
      </div>
    </div>
  );
};
