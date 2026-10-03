import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { calculateCompanyValuation } from '../../services/economyEngine';
import {
  Coins,
  TrendingUp,
  Truck,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Layers,
  Crown,
  Bot,
  Play,
  Pause
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    companies,
    playerCompany,
    playerPerfumer,
    rawMaterialsMap,
    perfumesMap,
    resetGame,
    setActiveTab,
    isBotAiEnabled,
    isGamePaused,
    togglePauseGame,
    isSpectatorMode,
    toggleSpectatorMode,
    setManagedCompany,
    managedCompanyId
  } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

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

  // Total company net worth with dynamic valuation model
  const totalNetWorth = calculateCompanyValuation(playerCompany);

  // Player sector leaderboard rank calculation
  const getCompanyVal = (comp: any) => calculateCompanyValuation(comp);
  const sortedLeaderboard = [...companies].sort((a, b) => getCompanyVal(b) - getCompanyVal(a));
  const playerRank = sortedLeaderboard.findIndex((c) => c.isPlayer) + 1;

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
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              {/* SEYİRCİ MODU / ŞİRKET YÖNETİMİ BUTONU & DROPDOWN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    isSpectatorMode
                      ? 'bg-purple-950/80 border-purple-500/50 text-purple-200 hover:bg-purple-900/80'
                      : 'bg-amber-950/80 border-amber-500/50 text-amber-200 hover:bg-amber-900/80'
                  }`}
                  title="Seyirci Modu veya Yönetilen Şirketi Seç"
                >
                  {isSpectatorMode ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                      <span>🎬 Seyirci Modu (4 Bot)</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      <span>👑 Yönetilen: {playerCompany.name}</span>
                    </>
                  )}
                  <span className="text-[10px] text-slate-400">▾</span>
                </button>

                {/* Dropdown Menu */}
                {showCompanyMenu && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-2.5 shadow-2xl z-50 animate-fade-in space-y-1.5">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Simülasyon Modu</span>
                      <button
                        type="button"
                        onClick={() => setShowCompanyMenu(false)}
                        className="text-slate-500 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Seyirci Modu Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setManagedCompany(null);
                        setShowCompanyMenu(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                        isSpectatorMode
                          ? 'bg-purple-950/90 border border-purple-500/60 text-white shadow-md'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">🎬 Seyirci Modu (4 Bot)</span>
                          {isSpectatorMode && (
                            <span className="text-[9px] font-black text-emerald-400 font-mono">AKTİF ✓</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                          Tüm şirketleri arkana yaslanıp canlı izle, yapay zeka yönetsin.
                        </p>
                      </div>
                    </button>

                    <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800">
                      Şirket Yönetimini Devral:
                    </div>

                    {/* Companies List to Manage */}
                    <div className="space-y-1">
                      {companies.map((comp) => {
                        const isCurrentManaged = !isSpectatorMode && comp.isPlayer;
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              setManagedCompany(comp.id);
                              setShowCompanyMenu(false);
                            }}
                            className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
                              isCurrentManaged
                                ? 'bg-amber-500/20 border border-amber-500/50 text-white'
                                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base">{comp.logo}</span>
                              <div className="truncate">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                  <span>{comp.name}</span>
                                  {isCurrentManaged && (
                                    <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-black">
                                      YÖNETİYORSUNUZ
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-emerald-400 font-mono">
                                  {comp.cash.toLocaleString('tr-TR')} ₺
                                </div>
                              </div>
                            </div>

                            {!isCurrentManaged && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shrink-0">
                                Yönet
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <span>•</span>
              <button
                onClick={() => setActiveTab('perfumers')}
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span>{playerPerfumer.avatar}</span>
                <span>{playerPerfumer.name}</span>
              </button>
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

          {/* Sektör Liderlik & Bot Durumu Quick Badge */}
          <button
            onClick={() => setActiveTab('companies')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              playerRank === 1
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-md shadow-amber-500/10'
                : 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
            }`}
            title="Sektör Liderlik Sıralaması & Canlı Bot Yarışı"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-bold">
              {playerRank === 1 ? '🥇 Sektör Lideri' : `#${playerRank}. Sıra`}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isBotAiEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
              title={isBotAiEnabled ? '3 Rakip Bot Aktif' : 'Botlar Duraklatıldı'}
            />
          </button>

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

          {/* Pause / Resume Button */}
          <button
            onClick={togglePauseGame}
            title={isGamePaused ? 'Oyunu Devam Ettir (Piyasa ve üretim başlasın)' : 'Oyunu Duraklat (Piyasa, üretim ve botlar dursun)'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isGamePaused
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 animate-pulse shadow-emerald-500/25'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isGamePaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Devam Et</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Durdur</span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Oyunu Sıfırla (20.000.000 TL başlangıç kasasıyla baştan başla)"
            className="flex items-center gap-1.5 px-3 py-2 text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/30 rounded-xl border border-rose-500/30 hover:border-rose-500/60 text-xs font-semibold transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
              <RotateCcw className="w-7 h-7" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-1.5 font-serif">Simülasyonu Sıfırla?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tüm borsa geçmişi, siparişler, aktif nakliyeler, laboratuvar formülleri ve depo stokları sıfırlanacaktır.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span>Başlangıç Kasası (Tüm Şirketler):</span>
                <span className="font-bold text-emerald-400 font-mono">20.000.000 ₺</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Mamul Parfüm Deposu:</span>
                <span className="font-semibold text-indigo-300">0 Şişe (Sıfırdan Başlar)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Rakip Botlar:</span>
                <span className="font-semibold text-emerald-400">20M ₺ & Eşit Başlangıç</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-lg shadow-rose-600/30"
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
