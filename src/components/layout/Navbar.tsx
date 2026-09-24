import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Coins,
  TrendingUp,
  Truck,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { playerCompany, playerPerfumer, rawMaterialsMap, perfumesMap, resetGame, setActiveTab } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calculate essence warehouse value
  const essenceTotalValue = Object.values(playerCompany.essenceStorage).reduce(
    (sum, item) => sum + (item.totalCostBasis || 0),
    0
  );

  // Calculate finished product inventory value
  const productTotalValue = Object.values(playerCompany.productStorage).reduce(
    (sum, item) => sum + (item.totalCostBasis || 0),
    0
  );

  // Total company net worth
  const totalNetWorth = Math.round(playerCompany.cash + essenceTotalValue + productTotalValue);

  const activeShipmentsCount = playerCompany.activeShipments.length;
  const isProducing = Boolean(playerCompany.activeProduction);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Company Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-xl">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-white font-serif">
                PARFÜM BORSASI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
                v1.0 SİMÜLATÖR
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Şirket:</span>
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                {playerCompany.name} 👑
              </span>
              <span>•</span>
              <span className="text-purple-300 font-medium flex items-center gap-1">
                <span>{playerPerfumer.avatar}</span>
                <span>{playerPerfumer.name}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Global Financial & Operations Indicators */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          
          {/* Nakit */}
          <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-500/20 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Nakit
              </div>
              <div className="text-sm lg:text-base font-bold text-amber-300 font-mono">
                {playerCompany.cash.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
              </div>
            </div>
          </div>

          {/* Toplam Varlık */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Toplam Varlık
              </div>
              <div className="text-sm font-bold text-indigo-200 font-mono">
                {totalNetWorth.toLocaleString('tr-TR')} ₺
              </div>
            </div>
          </div>

          {/* Net Kâr */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Net Kâr / Zarar
              </div>
              <div className={`text-sm font-bold font-mono ${playerCompany.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {playerCompany.netProfit >= 0 ? '+' : ''}{playerCompany.netProfit.toLocaleString('tr-TR')} ₺
              </div>
            </div>
          </div>

          {/* Nakliye Durumu Quick Badge */}
          <button
            onClick={() => setActiveTab('essence_storage')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeShipmentsCount > 0
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 animate-pulse'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{activeShipmentsCount > 0 ? `${activeShipmentsCount} Nakliyede` : 'Nakliye Yok'}</span>
          </button>

          {/* Üretim Durumu Quick Badge */}
          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isProducing
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>{isProducing ? 'Üretim Sürüyor' : 'Atölye Boşta'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Oyunu Sıfırla (500.000 TL başlangıç)"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Simülasyonu Sıfırla?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Tüm borsa hareketleri, nakliyeler, esanslar ve üretimler silinecek. Şirket başlangıç bakiyesi olan 500.000 TL ile yeniden başlayacak.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
