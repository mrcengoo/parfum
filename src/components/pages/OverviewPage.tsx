import React from 'react';
import { useGame } from '../../context/GameContext';
import { calculateCompanyValuation } from '../../services/economyEngine';
import { CountdownTimer } from '../common/CountdownTimer';
import { MiniChart } from '../common/MiniChart';
import { NoteImage } from '../common/NoteImage';
import { formatCountryNameWithCode } from '../../data/rawMaterials';
import {
  COMPANY_DEFAULT_COUNTRY_BONUSES,
  COMPANY_DEFAULT_SALES_REPS,
  getCountryFlag,
  getPerfumeFame,
  getPerfumePopularCountries
} from '../../services/marketingEngine';
import {
  Coins,
  Layers,
  TrendingUp,
  TrendingDown,
  Truck,
  FlaskConical,
  Package,
  ArrowRight,
  Sparkles,
  Zap,
  Globe2,
  CheckCircle2,
  Crown,
  Bot,
  Play,
  Pause
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const {
    companies,
    playerCompany,
    rawMaterials,
    perfumes,
    perfumesMap,
    orders,
    sectorActivities,
    isBotAiEnabled,
    isGamePaused,
    togglePauseGame,
    isSpectatorMode,
    setManagedCompany,
    setActiveTab,
    instantCompleteShipment,
    instantCompleteProduction,
    sellToOrder
  } = useGame();

  // Valuation calculator with dynamic market, inventory and brand equity model
  const getCompVal = (comp: any) => calculateCompanyValuation(comp);

  const sortedLeaderboard = [...companies]
    .map((c) => ({
      ...c,
      valuation: getCompVal(c)
    }))
    .sort((a, b) => b.valuation - a.valuation);

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 5) return 'Az önce';
    if (diffSec < 60) return `${diffSec} sn önce`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} dk önce`;
    return `${Math.floor(diffMin / 60)} sa önce`;
  };

  // Calculate essence warehouse total value & total units
  const totalEssenceUnits = Object.values(playerCompany.essenceStorage).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const totalEssenceValue = Object.values(playerCompany.essenceStorage).reduce(
    (sum, item) => sum + (item.totalCostBasis || 0),
    0
  );

  // Calculate finished product warehouse total units & value
  const totalProductUnits = Object.values(playerCompany.productStorage).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const totalProductValue = Object.values(playerCompany.productStorage).reduce(
    (sum, item) => sum + (item.totalCostBasis || 0),
    0
  );

  const totalNetWorth = calculateCompanyValuation(playerCompany);

  // Top price movers in raw materials
  const sortedMovers = [...rawMaterials].map((m) => {
    const firstP = m.priceHistory[0]?.price || m.basePrice;
    const change = m.price - firstP;
    const changePct = firstP > 0 ? (change / firstP) * 100 : 0;
    return { ...m, change, changePct };
  }).sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));

  const topMovers = sortedMovers.slice(0, 4);

  // Active market orders
  const activeOrders = orders.filter((o) => o.status === 'active').slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Spectator Mode Notice Banner */}
      {isSpectatorMode && (
        <div className="bg-purple-950/60 border border-purple-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎬</span>
            <div>
              <div className="text-xs font-bold text-purple-200">Canlı Seyirci Modu Aktif (Tüm Şirketler Bot)</div>
              <div className="text-[11px] text-purple-300/80">
                Tüm şirketler otonom botlar tarafından yönetiliyor. Canlı simülasyonu izliyorsunuz. Dilediğiniz şirketin yönetimini tek tıkla devralabilirsiniz.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setManagedCompany(playerCompany.id)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            👑 {playerCompany.name} Yönetimini Devral
          </button>
        </div>
      )}
      
      {/* Welcome & System Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 lg:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Parfüm Borsası & Üretim Ağı Aktif
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight">
              Hoş Geldiniz, {playerCompany.name}
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Küresel hammadde borsasından nadir notalar satın alın, %25 fire sonrası esans deponuzda biriktirin, 
              efsanevi formüller üretin ve uluslararası siparişlerle kârınızı maksimize edin.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('market')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Borsaya Git
            </button>
            <button
              onClick={() => setActiveTab('production')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              Üretime Başla
            </button>
            <button
              onClick={togglePauseGame}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md ${
                isGamePaused
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 animate-pulse shadow-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40'
              }`}
            >
              {isGamePaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 text-amber-400" />}
              <span>{isGamePaused ? 'Devam Et' : 'Durdur'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Nakit */}
        <div className="bg-slate-900/80 border border-amber-500/30 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider mb-1">
            Şirket Nakiti
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {playerCompany.cash.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Başlangıç: 20.000.000 ₺
          </div>
        </div>

        {/* Toplam Varlık */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Toplam Şirket Varlığı
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {totalNetWorth.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Nakit + Esans + Ürün Değeri
          </div>
        </div>

        {/* Toplam Gelir */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Toplam Gelir
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            +{playerCompany.totalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-400 mt-2">
            İhracat & Ürün Satışları
          </div>
        </div>

        {/* Toplam Gider */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Toplam Gider
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            -{playerCompany.totalExpenses.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Hammadde + Vergi + Lojistik + Üretim
          </div>
        </div>

        {/* Net Kâr & Marj */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Net Kâr (Marj)
          </div>
          <div className={`text-2xl font-bold font-mono ${playerCompany.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {playerCompany.netProfit >= 0 ? '+' : ''}{playerCompany.netProfit.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Kâr Marjı: %{playerCompany.profitMargin.toFixed(1)}
          </div>
        </div>
      </div>

      {/* ACTIVE SALES & MARKETING BONUSES DASHBOARD PANEL */}
      {(() => {
        const rep =
          playerCompany.salesRep ||
          COMPANY_DEFAULT_SALES_REPS[playerCompany.id] ||
          COMPANY_DEFAULT_SALES_REPS.aromalux;
        const persuasionBonusPct = Math.round((rep.persuasion || 55) * 0.28);
        const countryMap =
          playerCompany.countryBonuses ||
          COMPANY_DEFAULT_COUNTRY_BONUSES[playerCompany.id] ||
          {};
        const activeAds = (playerCompany.activeCampaigns || []).filter(
          (c) => c.expiresAt > Date.now()
        );
        const companyPerfumes = perfumes.filter(
          (p) => p.companyId === playerCompany.id || p.producerCompanyId === playerCompany.id
        );

        return (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/35 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{playerCompany.name} — Aktif Satış, İkna, Şöhret & Ülke Bonusları</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sipariş teslimatlarında ve toptan satışlarda birim fiyatınıza otomatik eklenen aktif çarpanlar:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
              >
                <span>📢 Reklam Yap & Bonusları Yönet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. Sales Rep Persuasion Bonus */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-indigo-400">
                    🗣️ Satış Temsilcisi İkna Bonusu
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px]">
                    +%{persuasionBonusPct} Fiyat Primi
                  </span>
                </div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="text-lg">{rep.avatar}</span>
                  <span>{rep.name} (İkna: {rep.persuasion}/100)</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {rep.specialtyCountries.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono"
                    >
                      🎯 {getCountryFlag(c)} {c} +%10
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. Country Bonuses & Active Ad Campaigns */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">
                    🌍 Şirket Ülke & Reklam Bonusları
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeAds.length} Aktif Reklam
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(countryMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cName, rate]) => (
                      <span
                        key={cName}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[11px]"
                      >
                        {getCountryFlag(cName)} {cName} +%{Math.round(rate * 100)}
                      </span>
                    ))}
                </div>
                {activeAds.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {activeAds.map((ad) => (
                      <span
                        key={ad.id}
                        className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold"
                      >
                        📢 {ad.targetCountryFlag} {ad.perfumeName} (+%{Math.round(ad.countryBonusRate * 100)})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Perfume Fame & Regional Popularity */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-rose-400">
                    ⭐ Parfüm Şöhreti & 🔥 Popüler Ülkeler (+%18)
                  </span>
                </div>
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {companyPerfumes.slice(0, 3).map((p) => {
                    const fame = getPerfumeFame(p);
                    const pop = getPerfumePopularCountries(p).slice(0, 2);
                    return (
                      <div key={p.id} className="flex items-center justify-between text-[11px] bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        <span className="font-bold text-white truncate max-w-[120px]">{p.name}</span>
                        <div className="flex items-center gap-1.5 font-mono shrink-0">
                          <span className="text-amber-300">⭐{fame} (+%{Math.round(fame * 0.32)})</span>
                          <span className="text-rose-300">🔥{pop.map((c) => getCountryFlag(c)).join('')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Real-time Operation Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Üretimdeki Ürün Tracker */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Üretim Atölyesi Durumu
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('production')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              Atölyeye Git <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {playerCompany.activeProduction ? (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Aktif Üretim Sürüyor
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {playerCompany.activeProduction.perfumeName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Parti Büyüklüğü: {playerCompany.activeProduction.batchSize} adet | Tahmini Birim Maliyet: {playerCompany.activeProduction.costBreakdown.unitCost} ₺
                  </p>
                </div>
                
                {/* Instant Complete Shortcut for quick testing */}
                <button
                  onClick={instantCompleteProduction}
                  title="Test amaçlı üretimi anında tamamla"
                  className="px-2.5 py-1 text-[11px] bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 rounded-lg border border-emerald-500/40 flex items-center gap-1 font-mono transition-all"
                >
                  <Zap className="w-3 h-3" />
                  Hemen Bitir
                </button>
              </div>

              <CountdownTimer
                startTime={playerCompany.activeProduction.startTime}
                endTime={playerCompany.activeProduction.endTime}
              />
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-8 text-center">
              <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-400">Laboratuvar Boşta</div>
              <p className="text-xs text-slate-500 mt-1">
                Esans deponuzdaki hammaddelerle hemen yeni bir parfüm partisi üretmeye başlayabilirsiniz.
              </p>
              <button
                onClick={() => setActiveTab('production')}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Formülleri İncele
              </button>
            </div>
          )}

          {/* Quick Warehouse Stocks Summary */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
            <div
              onClick={() => setActiveTab('essence_storage')}
              className="bg-slate-950/60 hover:bg-slate-950 p-3 rounded-xl border border-slate-800/80 cursor-pointer transition-colors"
            >
              <div className="text-[10px] text-slate-400 uppercase font-bold">Esans Deposu</div>
              <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">
                {totalEssenceUnits} birim
              </div>
              <div className="text-[11px] text-slate-500">Değer: {totalEssenceValue.toLocaleString('tr-TR')} ₺</div>
            </div>

            <div
              onClick={() => setActiveTab('product_storage')}
              className="bg-slate-950/60 hover:bg-slate-950 p-3 rounded-xl border border-slate-800/80 cursor-pointer transition-colors"
            >
              <div className="text-[10px] text-slate-400 uppercase font-bold">Ürün Deposu</div>
              <div className="text-lg font-bold text-indigo-300 font-mono mt-0.5">
                {totalProductUnits} şişe
              </div>
              <div className="text-[11px] text-slate-500">Değer: {totalProductValue.toLocaleString('tr-TR')} ₺</div>
            </div>
          </div>
        </div>

        {/* Aktif Nakliyeler (3 Dakika Timer & %25 Fire) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Yoldaki Nakliyeler ({playerCompany.activeShipments.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('essence_storage')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              Depo ve Lojistik <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {playerCompany.activeShipments.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {playerCompany.activeShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="bg-slate-950 border border-amber-500/20 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {shipment.rawMaterialName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {shipment.purchasedQuantity} Adet Alındı
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        %25 Fire Sonrası Net Gelecek: <span className="text-emerald-400 font-semibold">{shipment.expectedNetQuantity} esans</span>
                      </div>
                    </div>

                    <button
                      onClick={() => instantCompleteShipment(shipment.id)}
                      title="Test amaçlı nakliyeyi anında depoya ulaştır"
                      className="px-2 py-1 text-[11px] bg-amber-600/30 hover:bg-amber-600 text-amber-200 rounded-lg border border-amber-500/40 flex items-center gap-1 font-mono transition-all"
                    >
                      <Zap className="w-3 h-3" />
                      Ulaştır
                    </button>
                  </div>

                  <CountdownTimer
                    startTime={shipment.startTime}
                    endTime={shipment.endTime}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-8 text-center">
              <Truck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-400">Yolda Nakliye Yok</div>
              <p className="text-xs text-slate-500 mt-1">
                Borsadan satın aldığınız hammaddeler 3 dakikalık nakliye sürecine girer ve varışta %25 fire uygulanır.
              </p>
              <button
                onClick={() => setActiveTab('market')}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Hammadde Satın Al
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEKTÖR REKABETİ & CANLI BOT YARIŞI WIDGET */}
      <div className="bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Sektör Liderlik Yarışı & Canlı Bot Rakipler
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Botlar Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scentora Parfums, Parfuma Global ve Aura Bella Atelier ile canlı pazar rekabeti
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('companies')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Tüm Sektör & Bot Detayları</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Companies Valuation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sortedLeaderboard.map((item, idx) => {
            const rank = idx + 1;
            const isUser = item.isPlayer;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
                  isUser
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{rank}
                  </span>
                  <span className="text-xl">{item.logo}</span>
                </div>

                <div>
                  <div className="font-bold text-white text-xs truncate flex items-center gap-1">
                    <span>{item.name}</span>
                    {isUser && <span className="text-amber-400 font-normal text-[10px]">(Siz)</span>}
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                    {item.valuation.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Nakit: {item.cash.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Sector Actions Ticker */}
        {sectorActivities.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Son Sektör Hareketleri (Canlı):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sectorActivities.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{act.companyLogo}</span>
                    <span className="truncate text-slate-300 text-[11px]">{act.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 pl-2">
                    {formatTimeAgo(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row: Market Movers & Quick Order Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Önemli Hammadde Fiyat Hareketleri */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Borsa Hareketleri & Trendler
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('market')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              Tüm Borsayı Gör <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topMovers.map((item) => {
              const isUp = item.change >= 0;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab('market')}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <NoteImage
                        id={item.id}
                        src={item.image}
                        name={item.name}
                        fallbackEmoji="🌿"
                        size="md"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{formatCountryNameWithCode(item)}</span>
                        <span>• Stok: {item.exchangeStock}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                      <MiniChart data={item.priceHistory} width={90} height={32} />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">
                        {item.price.toFixed(1)} ₺
                      </div>
                      <div
                        className={`text-xs font-mono font-semibold flex items-center justify-end gap-0.5 ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{item.changePct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aktif Uluslararası Siparişler */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Bekleyen İhracat Siparişleri
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              Sipariş Havuzu <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeOrders.map((order) => {
              const inStock = playerCompany.productStorage[order.productId]?.quantity || 0;
              const canFulfillAny = inStock > 0;
              const fulfillAmount = Math.min(inStock, order.remainingQuantity);

              return (
                <div
                  key={order.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{order.countryFlag}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{order.productName}</span>
                          {(() => {
                            const p = perfumesMap.get(order.productId);
                            return p && p.sourceType === 'AR-GE' ? (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white shadow-sm border border-purple-400/40">
                                AR-GE
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div className="text-[10px] text-slate-400">{order.country} • {order.clientName}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-amber-300">
                        {order.pricePerUnit} ₺ / adet
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Kalan Talep: {order.remainingQuantity} adet
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="text-[11px] text-slate-400">
                      Deponuzdaki Stok: <span className={inStock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{inStock} adet</span>
                    </div>

                    {canFulfillAny ? (
                      <button
                        onClick={() => sellToOrder(order.id, fulfillAmount)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {fulfillAmount} Adet Sat (+{(fulfillAmount * order.pricePerUnit).toLocaleString('tr-TR')} ₺)
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('production')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg transition-colors"
                      >
                        Üretim Gerekli
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
