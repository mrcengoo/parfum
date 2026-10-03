import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Company, SectorActivityType, SectorActivityEvent } from '../../types';
import { calculateCompanyValuation } from '../../services/economyEngine';
import {
  COMPANY_DEFAULT_COUNTRY_BONUSES,
  COMPANY_DEFAULT_SALES_REPS,
  getCountryFlag,
  getPerfumeFame,
  getPerfumePopularCountries
} from '../../services/marketingEngine';
import {
  Building2,
  Coins,
  Layers,
  TrendingUp,
  TrendingDown,
  Package,
  Factory,
  Sparkles,
  Bot,
  Play,
  Pause,
  Zap,
  Award,
  Crown,
  Medal,
  Clock,
  Filter,
  Flame,
  Globe2,
  FlaskConical,
  ShoppingBag,
  Truck,
  RotateCcw,
  BarChart3,
  Percent,
  Megaphone,
  UserCheck
} from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const {
    companies,
    playerCompany,
    playerPerfumer,
    perfumersMap,
    perfumes,
    sectorActivities,
    isBotAiEnabled,
    botSpeed,
    toggleBotAi,
    triggerBotTurn,
    setBotSpeed,
    isGamePaused,
    togglePauseGame,
    isSpectatorMode,
    managedCompanyId,
    toggleSpectatorMode,
    setManagedCompany,
    resetGame,
    setActiveTab
  } = useGame();

  const [selectedActivityFilter, setSelectedActivityFilter] = useState<'all' | SectorActivityType>('all');
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Calculate company total valuation with dynamic market, inventory and brand equity model
  const getCompanyValuation = (company: Company) => {
    return calculateCompanyValuation(company);
  };

  // Sorted leaderboard by valuation descending
  const leaderboard = useMemo(() => {
    return [...companies]
      .map((c) => ({
        company: c,
        valuation: getCompanyValuation(c),
        perfumer: perfumersMap.get(c.perfumerId),
        essenceCount: Object.values(c.essenceStorage || {}).filter((e) => e.quantity > 0).length,
        productCount: Object.values(c.productStorage || {}).reduce((sum, p) => sum + (p.quantity || 0), 0),
        ownedPerfumes: perfumes.filter((p) => p.producerCompanyId === c.id || p.companyId === c.id)
      }))
      .sort((a, b) => b.valuation - a.valuation);
  }, [companies, perfumersMap, perfumes]);

  // Filtered sector activities
  const filteredActivities = useMemo(() => {
    if (selectedActivityFilter === 'all') return sectorActivities;
    return sectorActivities.filter((a) => a.type === selectedActivityFilter);
  }, [sectorActivities, selectedActivityFilter]);

  const playerRank = leaderboard.findIndex((item) => item.company.isPlayer) + 1;

  const getActivityBadge = (type: SectorActivityType) => {
    switch (type) {
      case 'ad_campaign':
        return {
          icon: <Megaphone className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Reklam Kampanyası',
          bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300'
        };
      case 'sales_rep_training':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-indigo-400" />,
          label: 'Temsilci İkna Eğitimi',
          bg: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
        };
      case 'invent_perfume':
        return {
          icon: <FlaskConical className="w-3.5 h-3.5 text-purple-400" />,
          label: 'AR-GE İcadı',
          bg: 'bg-purple-950/60 border-purple-500/40 text-purple-300'
        };
      case 'complete_production':
      case 'start_production':
        return {
          icon: <Factory className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Üretim',
          bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300'
        };
      case 'export_order':
        return {
          icon: <Globe2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'İhracat Teslimatı',
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
        };
      case 'buy_essence':
        return {
          icon: <Truck className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Borsa Alımı',
          bg: 'bg-blue-950/60 border-blue-500/40 text-blue-300'
        };
      case 'sell_product':
      default:
        return {
          icon: <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />,
          label: 'Satış & Dağıtım',
          bg: 'bg-teal-950/60 border-teal-500/40 text-teal-300'
        };
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 5) return 'Az önce';
    if (diffSec < 60) return `${diffSec} sn önce`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} dk önce`;
    return `${Math.floor(diffMin / 60)} sa önce`;
  };

  return (
    <div className="space-y-7 pb-16">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            Parfüm Sektörü & Canlı Bot Simülasyonu
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <span>Sektör Liderliği & Rakip Parfümeri Evleri</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              4 Üretici
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Sektördeki 3 yapay zeka rakip bot (<strong>Scentora Parfums</strong>, <strong>Parfuma Global</strong> ve <strong>Aura Bella Atelier</strong>) 
            canlı olarak hammadde borsasından esans alır, AR-GE laboratuvarlarında yeni parfümler icat eder, fabrikalarında üretim yapar ve uluslararası siparişlere ürün ihraç eder.
          </p>
        </div>

        {/* BOT AI MASTER CONTROLS */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shrink-0 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            {/* Master Simulation Pause */}
            <button
              type="button"
              onClick={togglePauseGame}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                isGamePaused
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 animate-pulse'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
              }`}
              title={isGamePaused ? 'Simülasyonu Devam Ettir' : 'Tüm Simülasyonu Duraklat'}
            >
              {isGamePaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isGamePaused ? 'Devam Et ▶️' : 'Durdur ⏸️'}</span>
            </button>

            {/* Rival Bot AI Toggle */}
            <button
              type="button"
              onClick={toggleBotAi}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                isBotAiEnabled
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {isBotAiEnabled ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                  <span>Botlar: AKTİF 🟢</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Botlar: BEKLEMEDE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={triggerBotTurn}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Rakipleri hemen bir tur ilerlet"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Hızlı Tur</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-500 px-1.5">Hız:</span>
            {(['slow', 'normal', 'fast'] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setBotSpeed(spd)}
                className={`px-2 py-1 rounded-lg font-bold uppercase transition-all ${
                  botSpeed === spd
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd === 'slow' ? 'Yavaş' : spd === 'normal' ? 'Normal' : 'Hızlı'}
              </button>
            ))}
          </div>

          {/* Reset Companies & Warehouses Button */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Şirket kasalarını 20M ₺ olarak eşitle ve tüm depoları sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Sıfırla (20M ₺ Kasa)</span>
          </button>
        </div>
      </div>

      {/* SEYİRCİ MODU (TÜMÜ BOT) VEYA ŞİRKET YÖNETİMİ BANNER & SEÇİCİ */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-xl ${
        isSpectatorMode
          ? 'bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border-purple-500/50 shadow-purple-950/30 ring-1 ring-purple-500/30'
          : 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/50 shadow-amber-950/20 ring-1 ring-amber-500/30'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${
                isSpectatorMode
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-amber-500 text-slate-950 font-black'
              }`}>
                {isSpectatorMode ? <Bot className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
                {isSpectatorMode ? '🎬 TÜM ŞİRKETLER BOT (CANLI SEYİRCİ MODU)' : `👑 YÖNETİLEN ŞİRKET: ${playerCompany.name}`}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {isSpectatorMode
                  ? '4 Şirketin Tümü Otonom Yapay Zeka Tarafından Yönetiliyor'
                  : '1 Şirket Sizin Yönetiminizde • 3 Şirket Otonom Bot'}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isSpectatorMode ? (
                <>
                  Tüm şirketler (<strong>AromaLux, Scentora, Parfuma ve Aura Bella</strong>) tamamen otonom botlar tarafından yönetilmektedir. Borsadan hammadde alımı, 15 dakikalık AR-GE icatları, üretim ve satış işlemlerini arkana yaslanıp canlı izleyebilir; <strong>dilediğin an bir şirketin yönetimini tek tıkla devralabilirsin.</strong>
                </>
              ) : (
                <>
                  Şu an <strong>{playerCompany.name}</strong> şirketinin üretim, borsa ve AR-GE kararlarını bizzat siz yönetiyorsunuz. Kalan 3 şirket otonom bot olarak rekabet ediyor. İsterseniz <strong>tümünü bot yapıp seyirci moduna geçebilir</strong> veya başka bir şirketi devralabilirsiniz.
                </>
              )}
            </p>
          </div>

          {/* Quick Mode Switch Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Button: Tümünü Bot Yap (Seyret) */}
            <button
              type="button"
              onClick={() => setManagedCompany(null)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                isSpectatorMode
                  ? 'bg-purple-600 text-white border border-purple-400 shadow-purple-950/50 ring-2 ring-purple-400/40'
                  : 'bg-slate-950 hover:bg-purple-950/70 text-purple-300 border border-slate-800 hover:border-purple-500/50'
              }`}
              title="Tüm şirketleri bota devret ve canlı simülasyonu izle"
            >
              <Bot className={`w-4 h-4 ${isSpectatorMode ? 'animate-pulse' : ''}`} />
              <span>🎬 Tümünü Bot Yap (Seyret)</span>
            </button>

            {/* Quick Switch to Specific Company */}
            <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase">Yönet:</span>
              {companies.map((c) => {
                const isCurrent = !isSpectatorMode && c.isPlayer;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setManagedCompany(c.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:text-white'
                    }`}
                    title={`${c.name} şirketinin yönetimini devral`}
                  >
                    <span>{c.logo}</span>
                    <span className="hidden sm:inline">{c.name.split(' ')[0]}</span>
                    {isCurrent && <span className="text-[10px]">👑</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CANLI LİDERLİK SIRALAMASI (PODIUM & LEADERBOARD) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Piyasa Değeri & Sektör Liderlik Sıralaması
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Sizin Konumunuz: <strong className="text-amber-400">#{playerRank}</strong> / 4
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaderboard.map((item, index) => {
            const rank = index + 1;
            const isFirst = rank === 1;
            const isUser = item.company.isPlayer;

            return (
              <div
                key={item.company.id}
                className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                  isUser
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-indigo-950/30 border-amber-500/60 shadow-amber-950/30 ring-1 ring-amber-500/30'
                    : isFirst
                    ? 'bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border-amber-400/50 shadow-amber-950/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Rank Badge & Crown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs font-mono shadow-md ${
                        rank === 1
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 3
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{rank}
                    </span>

                    {isUser && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        Sizin Şirketiniz
                      </span>
                    )}
                  </div>

                  <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                    {item.company.logo}
                  </span>
                </div>

                {/* Company Name & Perfumer */}
                <div>
                  <h4 className="text-lg font-bold font-serif text-white tracking-wide">
                    {item.company.name}
                  </h4>
                  <div className="text-xs text-purple-300 font-medium flex items-center gap-1 mt-0.5">
                    <span>{item.perfumer?.avatar || '👨‍🔬'}</span>
                    <span>{item.perfumer?.name || 'Parfümör'}</span>
                    <span className="text-slate-500 text-[10px]">({item.perfumer?.role})</span>
                  </div>
                </div>

                {/* Valuation & Cash Breakdown */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Toplam Varlık:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {item.valuation.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Kasa Nakdi:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {item.company.cash.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>

                  {/* 4 ANA FİNANSAL GÖSTERGE: GELİR, GİDER, NET KÂR, KÂR MARJI */}
                  <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80 my-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Toplam Gelir</div>
                        <div className="font-mono font-bold text-emerald-400 text-[11px]">
                          {(item.company.totalRevenue || 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Toplam Gider</div>
                        <div className="font-mono font-bold text-rose-400 text-[11px]">
                          {(item.company.totalExpenses || 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Net Kâr</div>
                        <div className={`font-mono font-bold text-[11px] ${item.company.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.company.netProfit >= 0 ? '+' : ''}{(item.company.netProfit || 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Kâr Marjı</div>
                        <div className={`font-mono font-bold text-[11px] ${item.company.profitMargin >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                          %{(item.company.profitMargin || 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Katalog Parfümleri:</span>
                    <span className="font-mono text-purple-300">
                      {item.ownedPerfumes.length} Çeşit
                    </span>
                  </div>

                  {/* Podium Card Bonuses Summary (Sales Rep Persuasion + Country Bonuses + Ads) */}
                  {(() => {
                    const rep =
                      item.company.salesRep ||
                      COMPANY_DEFAULT_SALES_REPS[item.company.id] ||
                      COMPANY_DEFAULT_SALES_REPS.aromalux;
                    const cMap =
                      item.company.countryBonuses ||
                      COMPANY_DEFAULT_COUNTRY_BONUSES[item.company.id] ||
                      {};
                    const topC = Object.entries(cMap)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3);
                    const activeAds = (item.company.activeCampaigns || []).filter(
                      (c) => c.expiresAt > Date.now()
                    );
                    const persuasionBonusPct = Math.round((rep.persuasion || 55) * 0.28);

                    return (
                      <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-2 space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-indigo-200 font-bold truncate">
                            {rep.avatar} {rep.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                            🗣️ İkna: {rep.persuasion} (+%{persuasionBonusPct})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {topC.map(([cName, rate]) => (
                            <span
                              key={cName}
                              className="px-1.5 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800 font-mono"
                            >
                              {getCountryFlag(cName)} +%{Math.round(rate * 100)}
                            </span>
                          ))}
                          {activeAds.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              📢 {activeAds.length} Reklam
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Live Activity indicator */}
                <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isUser && !isSpectatorMode ? 'Kullanıcı Yönetiminde' : 'Otonom Bot Operasyonu'}</span>
                  </span>
                  <span className="font-mono text-slate-500">
                    {item.productCount} Şişe Stok
                  </span>
                </div>

                {/* Management Quick Switch Button */}
                <div className="pt-2">
                  {isUser && !isSpectatorMode ? (
                    <button
                      type="button"
                      onClick={() => setManagedCompany(null)}
                      className="w-full py-1.5 px-3 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      title="Bu şirketin yönetimini bota devret ve canlı seyret"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Bot Yap (Seyret)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setManagedCompany(item.company.id)}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-indigo-600 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 hover:border-indigo-500 flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                      title={`${item.company.name} şirketinin yönetimini devral`}
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      <span>{item.company.name} Yönet</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEKTÖR ŞİRKETLERİ FİNANSAL PERFORMANS KARŞILAŞTIRMA TABLOSU */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              Finansal Bilanço & Performans Karşılaştırması
            </div>
            <h3 className="text-base font-bold text-white">
              Şirketlerin Gelir, Gider, Net Kâr ve Kâr Marjı Tablosu
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Tüm şirketlerin finansal verileri anlık güncellenir
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <th className="py-3.5 px-4">Sıra & Şirket</th>
                <th className="py-3.5 px-3">Baş Parfümatör</th>
                <th className="py-3.5 px-3 text-right">Kasa Nakdi</th>
                <th className="py-3.5 px-3 text-right">Toplam Gelir</th>
                <th className="py-3.5 px-3 text-right">Toplam Gider</th>
                <th className="py-3.5 px-3 text-right">Net Kâr</th>
                <th className="py-3.5 px-3 text-right">Kâr Marjı</th>
                <th className="py-3.5 px-3 text-center">Mamul Stoğu</th>
                <th className="py-3.5 px-4 text-right">Toplam Varlık</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {leaderboard.map((item, index) => {
                const rank = index + 1;
                const isUser = item.company.isPlayer;
                const isProfit = (item.company.netProfit || 0) >= 0;

                return (
                  <tr
                    key={item.company.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isUser ? 'bg-amber-500/5 font-medium' : ''
                    }`}
                  >
                    {/* Rank & Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-slate-400 text-xs font-bold w-5">
                          #{rank}
                        </span>
                        <span className="text-xl">{item.company.logo}</span>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{item.company.name}</span>
                            {isUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                Siz
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {isUser ? 'Kullanıcı Şirketi' : 'Otonom Rakip Bot'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Perfumer */}
                    <td className="py-3.5 px-3">
                      <span className="text-purple-300 font-medium">
                        {item.perfumer?.name || 'Parfümatör'}
                      </span>
                    </td>

                    {/* Cash */}
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-400">
                      {item.company.cash.toLocaleString('tr-TR')} ₺
                    </td>

                    {/* Revenue (Gelir) */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {(item.company.totalRevenue || 0).toLocaleString('tr-TR')} ₺
                    </td>

                    {/* Expenses (Gider) */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-400">
                      {(item.company.totalExpenses || 0).toLocaleString('tr-TR')} ₺
                    </td>

                    {/* Net Profit (Net Kâr) */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg ${
                          isProfit
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isProfit ? '+' : ''}{(item.company.netProfit || 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </td>

                    {/* Profit Margin (Kâr Marjı) */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span className={isProfit ? 'text-emerald-300' : 'text-rose-300'}>
                        %{(item.company.profitMargin || 0).toFixed(1)}
                      </span>
                    </td>

                    {/* Finished Stock */}
                    <td className="py-3.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-slate-950 text-indigo-300 font-semibold border border-slate-800">
                        {item.productCount} şişe
                      </span>
                    </td>

                    {/* Valuation */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-300">
                      {item.valuation.toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ŞİRKETLERİN ÜLKE BONUSLARI, TEMSİLCİ İKNA KABİLİYETİ, ŞÖHRET & REKLAM TABLOSU */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/25 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Megaphone className="w-4 h-4" />
              Küresel Rekabet & Satış Çarpanları Tablosu
            </div>
            <h3 className="text-base font-bold text-white">
              Şirketlerin Satış Temsilcisi İknası, Ülke Bonusları, Parfüm Şöhreti ve Aktif Reklamları
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Reklam Ver & Temsilciyi Eğit</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <th className="py-3.5 px-4">Şirket</th>
                <th className="py-3.5 px-3">Satış Temsilcisi & İkna Bonusu</th>
                <th className="py-3.5 px-3">Temsilci Uzman Ülkeleri (+%10)</th>
                <th className="py-3.5 px-3">Şirketin Ülke Bonusları</th>
                <th className="py-3.5 px-3 text-center">Ort. Parfüm Şöhreti</th>
                <th className="py-3.5 px-4 text-right">Aktif Reklam & Harcama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((item) => {
                const comp = item.company;
                const rep =
                  comp.salesRep ||
                  COMPANY_DEFAULT_SALES_REPS[comp.id] ||
                  COMPANY_DEFAULT_SALES_REPS.aromalux;
                const persuasionBonusPct = Math.round((rep.persuasion || 55) * 0.28);
                const countryMap =
                  comp.countryBonuses ||
                  COMPANY_DEFAULT_COUNTRY_BONUSES[comp.id] ||
                  {};
                const activeAds = (comp.activeCampaigns || []).filter(
                  (c) => c.expiresAt > Date.now()
                );
                const avgFame =
                  item.ownedPerfumes.length > 0
                    ? Math.round(
                        item.ownedPerfumes.reduce((s, p) => s + getPerfumeFame(p), 0) /
                          item.ownedPerfumes.length
                      )
                    : 30;
                const avgFameBonusPct = Math.round(avgFame * 0.32);

                return (
                  <tr
                    key={comp.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      comp.isPlayer ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{comp.logo}</span>
                        <div>
                          <div className="font-bold text-white text-xs">{comp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {rep.closedDeals || 0} Anlaşma • +{(rep.bonusRevenueGenerated || 0).toLocaleString('tr-TR')} ₺ Prim
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{rep.avatar}</span>
                        <div>
                          <div className="font-bold text-indigo-300 text-xs">{rep.name}</div>
                          <div className="text-[10px] font-mono text-amber-300 font-bold">
                            🗣️ İkna: {rep.persuasion}/100 (+%{persuasionBonusPct} Fiyat Bonusu)
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {rep.specialtyCountries.map((cName) => (
                          <span
                            key={cName}
                            className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold"
                          >
                            🎯 {getCountryFlag(cName)} {cName} (+%10)
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(countryMap)
                          .sort((a, b) => b[1] - a[1])
                          .map(([cName, rate]) => (
                            <span
                              key={cName}
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold"
                            >
                              {getCountryFlag(cName)} {cName} +%{Math.round(rate * 100)}
                            </span>
                          ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                        ⭐ {avgFame}/100 (+%{avgFameBonusPct})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {activeAds.length > 0 ? (
                        <div className="space-y-1">
                          {activeAds.map((ad) => (
                            <div
                              key={ad.id}
                              className="inline-block px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold font-mono"
                            >
                              📢 {ad.targetCountryFlag} {ad.targetCountry} (+%{Math.round(ad.countryBonusRate * 100)})
                            </div>
                          ))}
                          <div className="text-[10px] text-slate-400 font-mono">
                            Toplam Reklam: {(comp.totalAdSpend || 0).toLocaleString('tr-TR')} ₺
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Aktif reklam yok
                          <div className="text-[10px] text-slate-600">
                            Toplam: {(comp.totalAdSpend || 0).toLocaleString('tr-TR')} ₺
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTOR LIVE ACTIVITY FEED (CANLI SEKTÖR AKIŞI) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Flame className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Canlı Sektör Akışı & Rakip Bot Hareketleri</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rakiplerin ve şirketinizin gerçekleştirdiği son borsa alımları, AR-GE icatları, fabrika üretimleri ve ihracat siparişleri.
              </p>
            </div>
          </div>

          {/* Activity Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'invent_perfume', label: '🔬 AR-GE İcatları' },
              { id: 'buy_essence', label: '🌿 Esans Alımları' },
              { id: 'complete_production', label: '🏭 Üretimler' },
              { id: 'export_order', label: '📦 İhracatlar' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedActivityFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedActivityFilter === f.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 italic">
              Henüz yeni bir sektör hareketi gerçekleşmedi. Botlar arka planda simüle edilmeye devam ediyor...
            </div>
          ) : (
            filteredActivities.map((act) => {
              const badge = getActivityBadge(act.type);
              const isHighlight = act.highlight;

              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isHighlight
                      ? 'bg-purple-950/30 border-purple-500/40 shadow-md shadow-purple-950/20'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {act.companyLogo}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {act.companyName}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${badge.bg}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>

                        {isHighlight && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950">
                            Önemli Olay
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 text-slate-500 text-[11px] font-mono pl-10 sm:pl-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatTimeAgo(act.timestamp)}
                    </span>
                    {act.amount && (
                      <span className="text-emerald-400 font-bold">
                        {act.type === 'buy_essence' || act.type === 'invent_perfume' ? '-' : '+'}
                        {act.amount.toLocaleString('tr-TR')} ₺
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ALL 4 PERFUMERY HOUSES DETAILED PROFILES & PORTFOLIOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Sektör Parfümeri Evleri Portföy & Ürün Koleksiyonları
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            4 Şirket • Toplam {perfumes.length} Parfüm Formülü
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {companies.map((comp) => {
            const isUser = comp.isPlayer;
            const compPerfumer = perfumersMap.get(comp.perfumerId);
            const compPerfumes = perfumes.filter(
              (p) => p.producerCompanyId === comp.id || p.companyId === comp.id
            );
            const essenceCount = Object.values(comp.essenceStorage || {}).filter((e) => e.quantity > 0).length;
            const productTotalUnits = Object.values(comp.productStorage || {}).reduce((s, p) => s + (p.quantity || 0), 0);
            const valuation = getCompanyValuation(comp);

            return (
              <div
                key={comp.id}
                className={`border rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-all ${
                  isUser
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50 shadow-amber-950/20 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                        {comp.logo}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold font-serif text-white">
                            {comp.name}
                          </h4>
                          {isUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black uppercase">
                              Siz
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-amber-400 font-medium block">
                          {comp.id === 'aromalux'
                            ? 'Lüks Haute Parfumerie (Sizin)'
                            : comp.id === 'scentora'
                            ? 'Lüks & Niş Doğu Odaklı'
                            : comp.id === 'parfuma'
                            ? 'Hacimli Global Üretici'
                            : 'Sanatsal Çiçeksi & Butik'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                      {compPerfumes.length} Çeşit
                    </span>
                  </div>

                  {/* Assigned Perfumer card */}
                  {compPerfumer && (
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                          <span>{compPerfumer.avatar}</span>
                          <span>{compPerfumer.name}</span>
                        </span>
                        <span className="text-amber-400 text-[10px] font-mono font-bold">
                          AR-GE Seviye: {compPerfumer.rdLevel}/10
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic truncate">
                        "{compPerfumer.role}"
                      </p>
                    </div>
                  )}

                  {/* Sales Representative Persuasion & Country Bonuses Card */}
                  {(() => {
                    const rep =
                      comp.salesRep ||
                      COMPANY_DEFAULT_SALES_REPS[comp.id] ||
                      COMPANY_DEFAULT_SALES_REPS.aromalux;
                    const countryMap =
                      comp.countryBonuses ||
                      COMPANY_DEFAULT_COUNTRY_BONUSES[comp.id] ||
                      {};
                    const topCountries = Object.entries(countryMap)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3);
                    const activeAds = (comp.activeCampaigns || []).filter((c) => c.expiresAt > Date.now());

                    return (
                      <div className="p-3 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-indigo-300 flex items-center gap-1.5 truncate">
                            <span>{rep.avatar}</span>
                            <span className="truncate">{rep.name}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold shrink-0">
                            🗣️ İkna: {rep.persuasion}/100
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {topCountries.map(([cName, rate]) => (
                            <span
                              key={cName}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 font-mono"
                            >
                              {getCountryFlag(cName)} {cName} +%{Math.round(rate * 100)}
                            </span>
                          ))}
                          {activeAds.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                              📢 {activeAds.length} Aktif Reklam
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Kasa Nakdi</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {comp.cash.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Şirket Değeri</span>
                      <span className="font-mono font-bold text-amber-300 text-xs">
                        {valuation.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>

                  {/* All Owned / Catalog Perfumes List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <span>Katalog Parfümleri:</span>
                      <span className="font-mono text-purple-300">{compPerfumes.length} Adet</span>
                    </div>

                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                      {compPerfumes.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-500 italic bg-slate-950/50 rounded-xl">
                          Henüz tescilli parfüm yok
                        </div>
                      ) : (
                        compPerfumes.map((p) => {
                          const stock = comp.productStorage?.[p.id]?.quantity || 0;
                          const isRnd = p.sourceType === 'AR-GE';
                          const fame = getPerfumeFame(p);
                          const popCountries = getPerfumePopularCountries(p).slice(0, 2);

                          return (
                            <div
                              key={p.id}
                              className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                            >
                              <div className="min-w-0 flex items-center gap-2">
                                <div className="relative shrink-0">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                                  />
                                  {isRnd && (
                                    <span className="absolute -top-1 -left-1 bg-purple-600 text-white text-[7px] font-black px-1 rounded shadow">
                                      AR-GE
                                    </span>
                                  )}
                                </div>
                                <div className="truncate">
                                  <div className="font-bold text-slate-200 truncate flex items-center gap-1.5 text-[11px]">
                                    <span>{p.name}</span>
                                    {isRnd && (
                                      <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-purple-600 text-white border border-purple-400 shadow-sm">
                                        AR-GE
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                    <span>{p.suggestedRetailPrice} ₺</span>
                                    <span>•</span>
                                    <span className="text-amber-300 font-mono">⭐{fame}</span>
                                    <span>•</span>
                                    <span title={`Popüler Ülkeler: ${popCountries.join(', ')}`}>
                                      🔥{popCountries.map((c) => getCountryFlag(c)).join('')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="font-mono text-[10px] font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                                {stock} şişe
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Management Action & Status Bar */}
                <div className="pt-2">
                  {isUser && !isSpectatorMode ? (
                    <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Sizin Yönetiminizde</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setManagedCompany(null)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Bu şirketin yönetimini bota devret ve 4 şirketi canlı izle"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Bot Yap (Seyret)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Otonom Bot</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setManagedCompany(comp.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                        title={`${comp.name} şirketinin yönetimini devral`}
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        <span>Yönetimi Devral</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer status & Catalogue button */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Depo: <strong className="text-slate-200">{essenceCount}</strong> nota</span>
                  <span>Mamul: <strong className="text-emerald-400 font-bold">{productTotalUnits}</strong> şişe</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIFIRLAMA ONAY MODALI */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Şirketleri ve Depoları Sıfırla?</h3>
                <p className="text-xs text-slate-400">Kasa bakiyeleri eşitlenir ve depolar temizlenir.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span>Şirket Kasaları (4 Şirket):</span>
                <strong className="text-emerald-400 font-mono">20.000.000 ₺ (Eşit)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Mamul Depoları:</span>
                <strong className="text-indigo-300">0 Şişe (Sıfırdan Başlar)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Esans Depoları & Formüller:</span>
                <strong className="text-purple-300">Dengeli Başlangıç</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bu işlem tüm şirketlerin mamul deposundaki kalan ürünleri sıfırlar ve AromaLux, Scentora, Parfuma ve Aura Bella kasalarını 20M ₺ olarak eşitler.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  resetGame();
                  setShowResetModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
              >
                Evet, Sıfırla (20M ₺)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
