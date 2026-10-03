import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { MarketOrder, OrderSubItem } from '../../types';
import {
  AD_CAMPAIGN_PACKAGES,
  COMPANY_DEFAULT_AD_SPECIALISTS,
  COMPANY_DEFAULT_COUNTRY_BONUSES,
  COMPANY_DEFAULT_SALES_REPS,
  GLOBAL_MARKET_COUNTRIES,
  TRANSFERABLE_AD_SPECIALISTS,
  TRANSFERABLE_SALES_REPS,
  calculateAdCampaignPower,
  calculateSaleMarketingBonuses,
  getCompanyAdSpecialist,
  getCompanySalesRep,
  getCompanySynergyCountries,
  getCountryFlag,
  getCountrySynergyDetails,
  getPerfumeFame,
  getPerfumePopularCountries,
  isPerfumePopularInCountry,
  normalizeCountryName
} from '../../services/marketingEngine';
import {
  ClipboardList,
  Globe2,
  CheckCircle2,
  Coins,
  Package,
  ArrowRight,
  Sparkles,
  Layers,
  Megaphone,
  UserCheck,
  Zap,
  Flame,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    perfumes,
    playerCompany,
    playerPerfumer,
    perfumesMap,
    sellToOrder,
    setActiveTab,
    seekFreshOrders,
    cancelOrder,
    launchAdCampaign,
    trainSalesRep,
    hireSalesRep,
    trainAdSpecialist,
    hireAdSpecialist
  } = useGame();

  const [selectedOrder, setSelectedOrder] = useState<MarketOrder | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<OrderSubItem | null>(null);
  const [sellAmount, setSellAmount] = useState<number>(0);
  const [filterType, setFilterType] = useState<'all' | 'single' | 'bundle_3' | 'bundle_5'>('all');

  // Marketing & Sales Rep Center state
  const [activeHubTab, setActiveHubTab] = useState<'ads' | 'sales_rep' | 'countries'>('ads');

  const companyPerfumes = useMemo(() => {
    const owned = perfumes.filter(
      (p) =>
        p.companyId === playerCompany.id ||
        p.producerCompanyId === playerCompany.id ||
        (playerCompany.productStorage[p.id]?.quantity || 0) > 0
    );
    return owned.length > 0 ? owned : perfumes.slice(0, 8);
  }, [perfumes, playerCompany]);

  const [adPerfumeId, setAdPerfumeId] = useState<string>(() => companyPerfumes[0]?.id || '');
  const [adCountry, setAdCountry] = useState<string>('Fransa');

  const currentSalesRep = useMemo(() => {
    return getCompanySalesRep(playerCompany);
  }, [playerCompany]);

  const currentAdSpecialist = useMemo(() => {
    return getCompanyAdSpecialist(playerCompany);
  }, [playerCompany]);

  const synergyCountries = useMemo(() => {
    return getCompanySynergyCountries(playerCompany);
  }, [playerCompany]);

  const currentCountryBonuses = useMemo(() => {
    return (
      playerCompany.countryBonuses ||
      COMPANY_DEFAULT_COUNTRY_BONUSES[playerCompany.id] ||
      {}
    );
  }, [playerCompany]);

  const activeCampaigns = useMemo(() => {
    const now = Date.now();
    return (playerCompany.activeCampaigns || []).filter((c) => c.expiresAt > now);
  }, [playerCompany.activeCampaigns]);

  const selectedAdPerfume = useMemo(() => {
    return (
      perfumesMap.get(adPerfumeId) ||
      companyPerfumes[0] ||
      perfumes[0]
    );
  }, [adPerfumeId, perfumesMap, companyPerfumes, perfumes]);

  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== 'active') return false;
      if (filterType !== 'all') {
        const orderType = o.orderType || 'single';
        return orderType === filterType;
      }
      return true;
    });
  }, [orders, filterType]);

  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'completed');
  }, [orders]);

  // Open modal with specific sub-item (or single order)
  const handleOpenFulfill = (order: MarketOrder, subItem?: OrderSubItem) => {
    const targetItem = subItem || (order.items && order.items.length > 0 ? order.items[0] : null);
    const targetProductId = targetItem ? targetItem.productId : order.productId;
    const maxRemaining = targetItem ? targetItem.remainingQuantity : order.remainingQuantity;

    const inStock = playerCompany.productStorage[targetProductId]?.quantity || 0;
    const maxSellable = Math.max(1, Math.min(inStock, maxRemaining));

    setSelectedOrder(order);
    setSelectedSubItem(targetItem);
    setSellAmount(inStock > 0 ? maxSellable : 1);
  };

  const handleSelectSubItemInModal = (subItem: OrderSubItem) => {
    const inStock = playerCompany.productStorage[subItem.productId]?.quantity || 0;
    const maxSellable = Math.max(1, Math.min(inStock, subItem.remainingQuantity));
    setSelectedSubItem(subItem);
    setSellAmount(inStock > 0 ? maxSellable : 1);
  };

  const handleConfirmSale = () => {
    if (!selectedOrder || sellAmount <= 0) return;
    const targetProductId = selectedSubItem ? selectedSubItem.productId : selectedOrder.productId;
    sellToOrder(selectedOrder.id, sellAmount, targetProductId);
    setSelectedOrder(null);
    setSelectedSubItem(null);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" />
            Global İhracat, Reklam & Satış Temsilcisi Merkezi
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2 flex-wrap">
            <span>Uluslararası Sipariş Havuzu & Pazarlama</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              Şöhret • Ülke Bonusu • Temsilci İknası • Bölgesel Popülerlik
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Satış fiyatları ve müşteri talepleri artık <strong>Parfümün Şöhreti (⭐ 0-100)</strong>, <strong>Satış Temsilcinizin İkna Kabiliyeti ({currentSalesRep.name}: {currentSalesRep.persuasion}/100)</strong>, <strong>Parfümün O Ülkedeki Popülerliği (🔥 +%18)</strong> ve <strong>Ülke Reklam Kampanyalarınız</strong> ile gerçekçi şekilde belirlenir!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400">Aktif Sözleşmeler:</span>{' '}
            <span className="font-bold text-emerald-400 font-mono text-base">{activeOrders.length}</span>
          </div>

          <button
            type="button"
            onClick={seekFreshOrders}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            title="Küresel pazardan hemen 3 yeni ihracat alıcısı ve sözleşme çağır"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Yeni Alıcıları Çağır (+3 Sipariş)</span>
          </button>
        </div>
      </div>

      {/* MARKETING, AD CAMPAIGNS, SALES REP PERSUASION & COUNTRY BONUSES HUB */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/30 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base lg:text-lg font-bold text-white">
                  Küresel Pazarlama, Reklam & Satış Direktörlüğü ({playerCompany.name})
                </h3>
                {activeCampaigns.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    📢 {activeCampaigns.length} Aktif Reklam Kampanyası
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hedef ülkelere reklam vererek parfüm şöhretini ve ülke bonusunu artırın, satış temsilcinizin ikna kabiliyetini geliştirerek her şişeyi rekor fiyata satın.
              </p>
            </div>
          </div>

          {/* Hub Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveHubTab('ads')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeHubTab === 'ads'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>📢 Reklam Yap & Parfüm Şöhreti</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHubTab('sales_rep')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeHubTab === 'sales_rep'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>🗣️ Satış Temsilcisi İknası ({currentSalesRep.persuasion}/100)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHubTab('countries')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeHubTab === 'countries'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>🌍 Ülke Bonusları & Popülerlik</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LAUNCH ADVERTISING CAMPAIGN & PERFUME FAME */}
        {activeHubTab === 'ads' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Step 1 & 2: Select Perfume & Target Country */}
              <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    1. Tanıtımı Yapılacak Parfümü Seçin (Şöhret & Popülerlik)
                  </label>
                  <select
                    value={selectedAdPerfume?.id || ''}
                    onChange={(e) => setAdPerfumeId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {companyPerfumes.map((p) => {
                      const stock = playerCompany.productStorage[p.id]?.quantity || 0;
                      const fame = getPerfumeFame(p);
                      const pop = getPerfumePopularCountries(p);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} — ⭐ Şöhret: {fame}/100 | Stok: {stock} | 🔥 Popüler: {pop.join(', ')}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedAdPerfume && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{selectedAdPerfume.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                            ⭐ Şöhret: {getPerfumeFame(selectedAdPerfume)}/100 (+%{Math.round(getPerfumeFame(selectedAdPerfume) * 0.32)} Fiyat Primi)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Deponuzdaki Stok:{' '}
                          <strong className="text-emerald-400 font-mono">
                            {playerCompany.productStorage[selectedAdPerfume.id]?.quantity || 0} şişe
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Fame Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Parfümün Küresel Şöhreti (Reklamla Artar)</span>
                        <span className="font-mono font-bold text-amber-400">
                          {getPerfumeFame(selectedAdPerfume)} / 100
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-300"
                          style={{ width: `${getPerfumeFame(selectedAdPerfume)}%` }}
                        />
                      </div>
                    </div>

                    {/* Popular Countries for this Perfume */}
                    <div className="pt-1">
                      <div className="text-[10px] font-bold text-rose-300 uppercase flex items-center gap-1 mb-1">
                        <Flame className="w-3 h-3 text-rose-400" />
                        <span>Bu Parfümün En Popüler Olduğu Ülkeler (+%18 Bölgesel Talep & Fiyat Bonusu):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {getPerfumePopularCountries(selectedAdPerfume).map((cName) => (
                          <button
                            key={cName}
                            type="button"
                            onClick={() => setAdCountry(cName)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                              adCountry === cName
                                ? 'bg-rose-500/25 border-rose-400 text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-rose-300 hover:border-rose-500/50'
                            }`}
                          >
                            <span>{getCountryFlag(cName)}</span>
                            <span>{cName}</span>
                            <span className="text-[9px] text-amber-300 font-mono">🔥 +%18</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Ad Specialist Card & Synergy Banner */}
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/30 border border-amber-500/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currentAdSpecialist.avatar}</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-amber-400">
                          📢 Reklamı Yapan Reklamcınız
                        </div>
                        <div className="text-xs font-bold text-white">
                          {currentAdSpecialist.name} (Reklam Gücü: {currentAdSpecialist.adPower}/100)
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={trainAdSpecialist}
                      disabled={currentAdSpecialist.adPower >= 99 || playerCompany.cash < 70000}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] cursor-pointer disabled:opacity-40"
                    >
                      +6 Reklam Gücü Eğit (70B ₺)
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-300 flex flex-wrap items-center gap-1">
                    <span className="text-emerald-300 font-bold">⚡ Ortak Sinerji Ülkeleri (Reklam+Satış Gücü):</span>
                    {synergyCountries.length > 0 ? (
                      synergyCountries.map((sc) => (
                        <span
                          key={sc}
                          onClick={() => setAdCountry(sc)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-bold cursor-pointer"
                        >
                          ⚡ {getCountryFlag(sc)} {sc}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Yok</span>
                    )}
                  </div>
                </div>

                {/* Target Country Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                    2. Reklam Verilecek Hedef Ülkeyi Seçin (⚡=Reklamcı+Temsilci Ortak Sinerji)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {GLOBAL_MARKET_COUNTRIES.map((country) => {
                      const isSelected = adCountry === country.name;
                      const compBonus = Math.round((currentCountryBonuses[country.name] || 0) * 100);
                      const isPop = selectedAdPerfume
                        ? isPerfumePopularInCountry(selectedAdPerfume, country.name)
                        : false;
                      const syn = getCountrySynergyDetails(playerCompany, country.name);

                      return (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => setAdCountry(country.name)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                              : syn.hasSynergy
                              ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400 text-slate-200'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{country.flag}</span>
                            <div className="flex items-center gap-0.5 text-[11px]">
                              {syn.hasSynergy && (
                                <span title="⚡ Reklamcı + Satış Temsilcisi Aynı Ülke Sinerjisi! (Reklam & Satış Gücü)">
                                  ⚡
                                </span>
                              )}
                              {syn.isAdSpecialty && !syn.hasSynergy && (
                                <span title="Reklamcınızın uzman ülkesi (+%8)">📢</span>
                              )}
                              {syn.isSalesSpecialty && !syn.hasSynergy && (
                                <span title="Satış temsilcinizin uzman ülkesi (+%10)">🎯</span>
                              )}
                              {isPop && <span title="Bu parfüm bu ülkede çok popüler (+%18)">🔥</span>}
                            </div>
                          </div>
                          <div className="text-[11px] font-bold truncate mt-0.5">{country.name}</div>
                          <div className="text-[9px] font-mono text-emerald-400 flex items-center justify-between">
                            <span>+%{compBonus}</span>
                            {syn.hasSynergy && (
                              <span className="text-amber-300 font-bold">⚡Sinerji</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 3: 3 Advertising Campaign Packages */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center justify-between">
                    <span>3. Reklam Kampanyası Paketini Başlat ({getCountryFlag(adCountry)} {adCountry})</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Kasanız: <strong className="text-emerald-400">{playerCompany.cash.toLocaleString('tr-TR')} ₺</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {AD_CAMPAIGN_PACKAGES.map((pkg) => {
                      const canAfford = playerCompany.cash >= pkg.cost;
                      const calc = calculateAdCampaignPower(playerCompany, adCountry, pkg);
                      return (
                        <div
                          key={pkg.tier}
                          className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                            pkg.tier === 'gala'
                              ? 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-950/20'
                              : pkg.tier === 'billboard'
                              ? 'bg-gradient-to-b from-purple-950/30 to-slate-950 border-purple-500/40'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300">
                                {pkg.badge}
                              </span>
                              <span className="text-xs font-mono font-bold text-rose-300">
                                {pkg.cost.toLocaleString('tr-TR')} ₺
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-white leading-snug">{pkg.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{pkg.subtitle}</p>

                            {calc.hasSynergy && (
                              <div className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-300 shrink-0" />
                                <span>⚡ Sinerji Ülkesi: Reklam & Satış Gücü Aktif!</span>
                              </div>
                            )}

                            <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Parfüm Şöhreti:</span>
                                <span className="font-mono font-bold text-amber-300">
                                  +{calc.effectiveFameBoost} ⭐ Şöhret
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">{adCountry} Reklam Gücü:</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  +%{Math.round(calc.effectiveCountryBonusRate * 100)} Fiyat
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Kalıcı {adCountry} Bonusu:</span>
                                <span className="font-mono font-bold text-indigo-300">
                                  +%{Math.round(calc.effectivePermanentGain * 100)} Kalıcı
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Reklamla Gelen Talep:</span>
                                <span className="font-mono font-bold text-purple-300">
                                  {pkg.spawnsVipOrder || calc.hasSynergy
                                    ? '👑 Anında VIP Sipariş'
                                    : '📈 Yüksek Satış Hızı'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!canAfford || !selectedAdPerfume}
                            onClick={() =>
                              selectedAdPerfume && launchAdCampaign(selectedAdPerfume.id, adCountry, pkg.tier)
                            }
                            className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? pkg.tier === 'gala'
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Megaphone className="w-3.5 h-3.5" />
                            <span>Reklamı Başlat ({pkg.cost.toLocaleString('tr-TR')} ₺)</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Ad Campaigns Bar */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <span>📢 Aktif Reklam Kampanyalarınız ({activeCampaigns.length})</span>
                    <span className="text-[10px] font-mono text-amber-400">
                      Toplam Reklam Yatırımı: {(playerCompany.totalAdSpend || 0).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  {activeCampaigns.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeCampaigns.map((camp) => {
                        const remMin = Math.max(1, Math.ceil((camp.expiresAt - Date.now()) / 60000));
                        return (
                          <div
                            key={camp.id}
                            className="bg-slate-900 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate flex items-center gap-1">
                                <span>{camp.targetCountryFlag}</span>
                                <span>{camp.perfumeName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {camp.targetCountry} • +%{Math.round(camp.countryBonusRate * 100)} Satış Bonusu
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                              ⏱️ {remMin} dk
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Şu an aktif reklam kampanyanız yok. Yukarıdan bir parfüm ve ülke seçerek reklam başlatabilirsiniz.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SALES REPRESENTATIVE PERSUASION & TRANSFER CENTER */}
        {activeHubTab === 'sales_rep' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Current Sales Representative Card */}
            <div className="lg:col-span-5 bg-slate-950 border border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center shadow-inner">
                      {currentSalesRep.avatar}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Aktif Satış Direktörünüz (Seviye {currentSalesRep.level})
                      </div>
                      <h4 className="text-lg font-bold text-white">{currentSalesRep.name}</h4>
                      <div className="text-xs text-slate-400">{currentSalesRep.title}</div>
                    </div>
                  </div>
                </div>

                {/* Persuasion Skill Meter */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">🗣️ İkna Kabiliyeti (Müzakere Gücü):</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {currentSalesRep.persuasion} / 100 (+%{Math.round(currentSalesRep.persuasion * 0.28)} Fiyat Primi)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${currentSalesRep.persuasion}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Yüksek ikna kabiliyeti her siparişte birim satış fiyatını <strong>+%{Math.round(currentSalesRep.persuasion * 0.28)}</strong> artırır ve uzman olduğu ülkelerde ekstra <strong>+%10 Ülke Uzmanlığı Bonusu</strong> kazandırır.
                  </p>
                </div>

                {/* Specialty Countries */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                    🎯 Temsilcinin Uzman Olduğu Ülkeler (+%10 Ekstra İkna Bonusu):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSalesRep.specialtyCountries.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1"
                      >
                        <span>{getCountryFlag(c)}</span>
                        <span>{c}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase">Bağlanan Satışlar</div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">
                      {currentSalesRep.closedDeals} Anlaşma
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase">Kazandırdığı Ekstra Prim</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                      +{(currentSalesRep.bonusRevenueGenerated || 0).toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={currentSalesRep.persuasion >= 99 || playerCompany.cash < 75000}
                onClick={trainSalesRep}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>
                  {currentSalesRep.persuasion >= 99
                    ? 'Maksimum İkna Kabiliyetine Ulaşıldı (99/100)'
                    : 'İkna & Müzakere Eğitimi Ver (+6 İkna • 75.000 ₺)'}
                </span>
              </button>
            </div>

            {/* Transferable Elite Sales Representatives */}
            <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Küresel Satış Direktörü Transfer Borsası</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Daha yüksek ikna kabiliyetine ve geniş ülke uzmanlığına sahip efsanevi müzakerecileri şirketinize transfer edin.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TRANSFERABLE_SALES_REPS.map((candidate) => {
                  const isCurrent = currentSalesRep.id === candidate.id;
                  const canAfford = playerCompany.cash >= candidate.hiringCost;

                  return (
                    <div
                      key={candidate.id}
                      className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'bg-emerald-950/25 border-emerald-500/50'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                              {candidate.avatar}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">{candidate.name}</div>
                              <div className="text-[10px] text-slate-400">{candidate.title}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold shrink-0">
                            🗣️ {candidate.persuasion}/100
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">{candidate.bio}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {candidate.specialtyCountries.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-medium"
                            >
                              {getCountryFlag(c)} {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {candidate.hiringCost.toLocaleString('tr-TR')} ₺
                        </span>
                        {isCurrent ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            ✓ Görevde
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => hireSalesRep(candidate.id)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Transfer Et
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COUNTRY BONUSES & REGIONAL POPULARITY MATRIX */}
        {activeHubTab === 'countries' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GLOBAL_MARKET_COUNTRIES.map((country) => {
              const permBonus = Math.round((currentCountryBonuses[country.name] || 0) * 100);
              const activeAd = activeCampaigns.find(
                (c) => normalizeCountryName(c.targetCountry) === country.name
              );
              const adBonus = activeAd ? Math.round(activeAd.countryBonusRate * 100) : 0;
              const isRepSpec = currentSalesRep.specialtyCountries.includes(country.name);
              const popularOwnedPerfumes = companyPerfumes.filter((p) =>
                isPerfumePopularInCountry(p, country.name)
              );

              return (
                <div
                  key={country.id}
                  className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{country.fullName}</div>
                          <div className="text-[10px] text-slate-400">{country.favoriteStyle}</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                        +%{permBonus + adBonus + (isRepSpec ? 10 : 0)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-slate-900 p-2 rounded-xl border border-slate-800/80 text-center">
                      <div>
                        <div className="text-slate-500">Ülke Bonusu</div>
                        <div className="font-mono font-bold text-emerald-400">+%{permBonus}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Aktif Reklam</div>
                        <div className="font-mono font-bold text-amber-300">+%{adBonus}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Temsilci Uzm.</div>
                        <div className="font-mono font-bold text-indigo-300">
                          {isRepSpec ? '+%10 🎯' : '—'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-rose-300 uppercase mb-1 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-400" />
                        <span>Bu Ülkede Popüler Parfümleriniz (+%18 Bonus):</span>
                      </div>
                      {popularOwnedPerfumes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {popularOwnedPerfumes.slice(0, 4).map((p) => (
                            <span
                              key={p.id}
                              className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-200 font-medium"
                            >
                              🔥 {p.name} (⭐{getPerfumeFame(p)})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          Favori notalar: {country.favoriteNotes.slice(0, 4).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAdCountry(country.name);
                      setActiveHubTab('ads');
                    }}
                    className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-amber-300 border border-slate-800 hover:border-amber-500/40 text-[11px] font-bold transition-all"
                  >
                    📢 {country.name} Pazarında Reklam Ver
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Tüm Siparişler ({orders.filter((o) => o.status === 'active').length})
        </button>

        <button
          onClick={() => setFilterType('bundle_5')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'bundle_5'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>👑 5'li Mega Departmanlar</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 font-mono text-amber-300">
            {orders.filter((o) => o.status === 'active' && o.orderType === 'bundle_5').length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('bundle_3')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'bundle_3'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>🎁 3'lü Butik Koleksiyonlar</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 font-mono text-purple-300">
            {orders.filter((o) => o.status === 'active' && o.orderType === 'bundle_3').length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('single')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'single'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>🌟 Tekli Prestij Siparişler</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 font-mono text-emerald-300">
            {orders.filter((o) => o.status === 'active' && (!o.orderType || o.orderType === 'single')).length}
          </span>
        </button>
      </div>

      {/* ACTIVE ORDERS LIST */}
      <div className="space-y-4">
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {activeOrders.map((order) => {
              const isBundle = order.orderType === 'bundle_3' || order.orderType === 'bundle_5';
              const progressPct = ((order.requestedQuantity - order.remainingQuantity) / order.requestedQuantity) * 100;
              const primaryPerfume = perfumesMap.get(order.productId);
              const orderMarketing = calculateSaleMarketingBonuses(
                order.pricePerUnit,
                playerCompany,
                primaryPerfume,
                order.country,
                playerPerfumer
              );
              
              // Total in-stock across all varieties in this order
              let totalStockForOrder = 0;
              let anyVarietyInStock = false;

              if (order.items && order.items.length > 0) {
                totalStockForOrder = order.items.reduce((sum, item) => {
                  const stock = playerCompany.productStorage[item.productId]?.quantity || 0;
                  if (stock > 0) anyVarietyInStock = true;
                  return sum + stock;
                }, 0);
              } else {
                const singleStock = playerCompany.productStorage[order.productId]?.quantity || 0;
                totalStockForOrder = singleStock;
                anyVarietyInStock = singleStock > 0;
              }

              return (
                <div
                  key={order.id}
                  className={`bg-slate-900/90 border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all ${
                    order.orderType === 'bundle_5'
                      ? 'border-amber-500/40 hover:border-amber-500/70 shadow-amber-950/20'
                      : order.orderType === 'bundle_3'
                      ? 'border-purple-500/40 hover:border-purple-500/70 shadow-purple-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top: Country Flag & Client & Order Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm">
                          {order.countryFlag}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{order.clientName}</h4>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{order.country}</span>
                            <span>•</span>
                            <span className="text-slate-300 font-medium flex items-center gap-1.5">
                              {order.productName}
                              {(() => {
                                const p = perfumesMap.get(order.productId);
                                return p && p.sourceType === 'AR-GE' ? (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white shadow-sm border border-purple-400/40">
                                    AR-GE
                                  </span>
                                ) : null;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Type Badge & Decline Button */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {order.orderType === 'bundle_5' ? (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono">
                            👑 5 ÇEŞİT KONSORSİYUM
                          </span>
                        ) : order.orderType === 'bundle_3' ? (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-mono">
                            🎁 3 ÇEŞİT KOLEKSİYON
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                            🌟 TEKLİ SİPARİŞ
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => cancelOrder(order.id)}
                          className="px-2 py-1 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 text-[10px] font-bold transition-all"
                          title="Bu sözleşmeyi reddet ve havuzdan kaldır"
                        >
                          ✕ Reddet
                        </button>
                      </div>
                    </div>

                    {/* Marketing, Persuasion, Country Bonus & Popularity Badges for this Order */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80 text-[10px]">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                        ⚡ Toplam Satış Primi: +%{Math.round(orderMarketing.totalBonusRate * 100)}
                      </span>
                      {orderMarketing.hasCountrySynergy && (
                        <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/25 to-emerald-500/25 text-emerald-200 border border-emerald-400/50 font-mono font-bold">
                          ⚡ Reklam+Satış Ortak Ülke Sinerjisi: +%{Math.round(orderMarketing.synergySalesPowerBonusRate * 100)}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                        🗣️ Temsilci İkna ({currentSalesRep.persuasion}): +%{Math.round(orderMarketing.persuasionBonusRate * 100)}
                      </span>
                      {orderMarketing.isRepSpecialtyCountry && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                          🎯 Temsilci Ülkesi: +%10
                        </span>
                      )}
                      {orderMarketing.isAdSpecialtyCountry && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                          📢 Reklamcı Ülkesi: +%8
                        </span>
                      )}
                      {!isBundle && primaryPerfume && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                          ⭐ Şöhret ({orderMarketing.fameScore}/100): +%{Math.round(orderMarketing.fameBonusRate * 100)}
                        </span>
                      )}
                      {orderMarketing.isPopularInCountry && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">
                          🔥 Bu Ülkede Çok Popüler: +%18
                        </span>
                      )}
                      {orderMarketing.countryNoteHarmonyBonusRate !== 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-lg font-mono font-bold ${
                            orderMarketing.countryNoteHarmonyBonusRate > 0
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          🎵 Ülke Nota Uyumu ({orderMarketing.matchedCountryNotes.length} Nota):{' '}
                          {orderMarketing.countryNoteHarmonyBonusRate > 0 ? '+' : ''}%
                          {Math.round(orderMarketing.countryNoteHarmonyBonusRate * 100)} Fiyat Farkı
                        </span>
                      )}
                      {orderMarketing.perfumerNoteMasteryBonusRate > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/40 font-mono font-bold">
                          🧪 {orderMarketing.perfumerName} ({orderMarketing.perfumerOlfactoryFamily}): +%
                          {Math.round(orderMarketing.perfumerNoteMasteryBonusRate * 100)} Usta Nota Farkı
                        </span>
                      )}
                      {(orderMarketing.companyCountryBonusRate > 0 || orderMarketing.activeAdBonusRate > 0) && (
                        <span className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono">
                          🌍 Ülke & Reklam: +%{Math.round((orderMarketing.companyCountryBonusRate + orderMarketing.activeAdBonusRate) * 100)}
                        </span>
                      )}
                    </div>

                    {/* Contract Summary Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs text-center">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">İknalı Sözleşme Değeri</div>
                        <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                          {Math.round(
                            (order.totalOrderValue || order.requestedQuantity * order.pricePerUnit) *
                              (1 + orderMarketing.totalBonusRate)
                          ).toLocaleString('tr-TR')}{' '}
                          ₺
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Kalan / Toplam</div>
                        <div className="font-mono font-bold text-indigo-300 text-sm mt-0.5">
                          {order.remainingQuantity} / {order.requestedQuantity} şişe
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">İlerleme</div>
                        <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                          %{progressPct.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* MULTI-VARIETY (3 veya 5 ÇEŞİT) İÇERİK DÖKÜMÜ */}
                    {isBundle && order.items && order.items.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Talep Edilen Parfüm Çeşitleri ({order.items.length} Çeşit):</span>
                        </div>

                        <div className="divide-y divide-slate-800/60 bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden">
                          {order.items.map((subItem) => {
                            const subStock = playerCompany.productStorage[subItem.productId]?.quantity || 0;
                            const subPerfume = perfumesMap.get(subItem.productId);
                            const isSubCompleted = subItem.remainingQuantity <= 0;
                            const subMarketing = calculateSaleMarketingBonuses(
                              subItem.pricePerUnit,
                              playerCompany,
                              subPerfume,
                              order.country,
                              playerPerfumer
                            );

                            return (
                              <div
                                key={subItem.productId}
                                className={`p-3 flex items-center justify-between gap-3 text-xs transition-colors ${
                                  isSubCompleted ? 'opacity-40 bg-slate-900/40' : 'hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {subPerfume?.image ? (
                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                                      <img src={subPerfume.image} alt={subItem.productName} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <span className="text-lg">🧴</span>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-white truncate text-xs flex items-center gap-1.5 flex-wrap">
                                      <span>{subItem.productName}</span>
                                      {subPerfume && subPerfume.sourceType === 'AR-GE' && (
                                        <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white shadow-sm border border-purple-400/40">
                                          AR-GE
                                        </span>
                                      )}
                                      {subPerfume && (
                                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                          ⭐ {subMarketing.fameScore}
                                        </span>
                                      )}
                                      {subMarketing.isPopularInCountry && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                          🔥 Popüler (+%18)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-slate-500 line-through">{subItem.pricePerUnit} ₺</span>
                                      <span className="font-mono text-emerald-400 font-bold">
                                        {subMarketing.finalUnitPrice} ₺ / şişe (+%{Math.round(subMarketing.totalBonusRate * 100)})
                                      </span>
                                      <span>•</span>
                                      <span>Kalan: <strong className="text-slate-200 font-mono">{subItem.remainingQuantity}</strong>/{subItem.requestedQuantity}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Stock & Action for this variety */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    <div className="text-[10px] text-slate-400">Deponuz</div>
                                    <div className={`font-mono font-bold text-xs ${subStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {subStock} adet
                                    </div>
                                  </div>

                                  {!isSubCompleted && subStock > 0 && (
                                    <button
                                      onClick={() => handleOpenFulfill(order, subItem)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                                      title={`${subItem.productName} teslim et`}
                                    >
                                      <span>Teslim Et</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* SINGLE ORDER VIEW */
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🧴</span>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-2 flex-wrap">
                              <span>{order.productName}</span>
                              {primaryPerfume && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  ⭐ Şöhret: {orderMarketing.fameScore}/100
                                </span>
                              )}
                              {orderMarketing.isPopularInCountry && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  🔥 Bu Ülkede Popüler (+%18)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono mt-0.5 flex items-center gap-2">
                              <span className="text-slate-500 line-through">{order.pricePerUnit} ₺</span>
                              <span className="text-emerald-400 font-bold text-sm">
                                {orderMarketing.finalUnitPrice} ₺ / şişe
                              </span>
                              <span className="text-[10px] text-amber-300">
                                (+%{Math.round(orderMarketing.totalBonusRate * 100)} İkna/Şöhret/Ülke Primi)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Deponuzdaki Stok</div>
                          <div className={`font-mono font-bold text-sm ${totalStockForOrder > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {totalStockForOrder} adet
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>{currentSalesRep.avatar} {currentSalesRep.name}:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        +%{Math.round(orderMarketing.totalBonusRate * 100)} Toplam Satış Bonusu
                      </span>
                    </div>

                    {anyVarietyInStock ? (
                      <button
                        onClick={() => handleOpenFulfill(order)}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Siparişi Karşıla (Teslimat Yap)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('production')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Üretim Laboratuvarına Git</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Bu filtrede aktif ihracat siparişi kalmadı.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Simülasyon döngüsünde birkaç saniye içinde küresel piyasalardan yeni tekli, 3'lü ve 5'li siparişler havuzda listelenecektir.
            </p>
          </div>
        )}
      </div>

      {/* COMPLETED ORDERS SECTION */}
      {completedOrders.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Tamamlanan Global Sözleşmeler ({completedOrders.length})
          </h3>

          <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
            {completedOrders.map((order) => {
              const val = order.totalOrderValue || (order.requestedQuantity * order.pricePerUnit);

              return (
                <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{order.countryFlag}</span>
                    <div>
                      <span className="font-bold text-white">{order.productName}</span>
                      <span className="text-slate-400 ml-2">
                        ({order.requestedQuantity} şişe teslim edildi • {order.clientName} - {order.country})
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">
                    +{val.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULFILLMENT MODAL (SUPPORTS BOTH SINGLE ORDERS AND BUNDLE VARIETIES) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">
                  {selectedOrder.countryFlag}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedOrder.productName}</h3>
                  <div className="text-xs text-slate-400">
                    {selectedOrder.clientName} ({selectedOrder.country})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* BUNDLE VARIETY SELECTOR (If multi-product order) */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Teslim Edilecek Parfüm Çeşidini Seçin:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedOrder.items.map((sub) => {
                    const isSelected = selectedSubItem?.productId === sub.productId;
                    const stock = playerCompany.productStorage[sub.productId]?.quantity || 0;
                    const isDone = sub.remainingQuantity <= 0;
                    const subPerf = perfumesMap.get(sub.productId);
                    const subM = calculateSaleMarketingBonuses(
                      sub.pricePerUnit,
                      playerCompany,
                      subPerf,
                      selectedOrder.country,
                      playerPerfumer
                    );

                    return (
                      <button
                        key={sub.productId}
                        type="button"
                        disabled={isDone}
                        onClick={() => handleSelectSubItemInModal(sub)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                            : isDone
                            ? 'opacity-40 bg-slate-950 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="font-bold truncate text-xs">{sub.productName}</div>
                        <div className="flex items-center justify-between text-[11px] mt-1 text-slate-400">
                          <span className="text-emerald-400 font-mono font-bold">{subM.finalUnitPrice} ₺</span>
                          <span className={stock > 0 ? 'text-emerald-400 font-bold font-mono' : 'text-rose-400 font-mono'}>
                            Stok: {stock}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTIVE PRODUCT BEING FULFILLED INFO */}
            {(() => {
              const activeProductId = selectedSubItem ? selectedSubItem.productId : selectedOrder.productId;
              const activeProductName = selectedSubItem ? selectedSubItem.productName : selectedOrder.productName;
              const unitPrice = selectedSubItem ? selectedSubItem.pricePerUnit : selectedOrder.pricePerUnit;
              const orderRemaining = selectedSubItem ? selectedSubItem.remainingQuantity : selectedOrder.remainingQuantity;
              const userStock = playerCompany.productStorage[activeProductId]?.quantity || 0;
              const maxDeliverable = Math.min(userStock, orderRemaining);

              const perfume = perfumesMap.get(activeProductId);
              const marketing = calculateSaleMarketingBonuses(
                unitPrice,
                playerCompany,
                perfume,
                selectedOrder.country,
                playerPerfumer
              );

              const grossRev = sellAmount * marketing.finalUnitPrice;
              const baseRev = sellAmount * unitPrice;
              const bonusRev = Math.max(0, grossRev - baseRev);
              const royaltyRate = perfume?.royaltyRate || 0;
              const royalty = Math.round(grossRev * royaltyRate * 100) / 100;
              const netRev = Math.round((grossRev - royalty) * 100) / 100;

              return (
                <div className="space-y-4">
                  {/* Quantity Slider */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Seçili Ürün:</span>{' '}
                        <strong className="text-white">{activeProductName}</strong>
                      </div>
                      <div className="font-mono text-emerald-400 font-bold text-sm">
                        {sellAmount} şişe
                      </div>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max={Math.max(1, maxDeliverable)}
                      value={Math.min(sellAmount, Math.max(1, maxDeliverable))}
                      disabled={userStock <= 0}
                      onChange={(e) => setSellAmount(parseInt(e.target.value) || 1)}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>1 şişe</span>
                      <button
                        type="button"
                        onClick={() => setSellAmount(maxDeliverable)}
                        className="text-amber-400 hover:underline font-bold"
                      >
                        Tüm Stoğu Teslim Et ({maxDeliverable} adet)
                      </button>
                    </div>
                  </div>

                  {/* Detailed Marketing & Persuasion Financial Breakdown */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Sözleşme Baz Birim Fiyatı:</span>
                      <span className="font-mono">{unitPrice} ₺</span>
                    </div>

                    <div className="flex justify-between text-amber-300">
                      <span>⭐ Parfüm Şöhreti ({marketing.fameScore}/100):</span>
                      <span className="font-mono font-bold">+%{Math.round(marketing.fameBonusRate * 100)}</span>
                    </div>

                    <div className="flex justify-between text-indigo-300">
                      <span>🗣️ Satış Temsilcisi İkna ({currentSalesRep.name} - {marketing.persuasionScore}):</span>
                      <span className="font-mono font-bold">
                        +%{Math.round(marketing.persuasionBonusRate * 100)}
                        {marketing.isRepSpecialtyCountry ? ' (+%10 Uzman Ülke 🎯)' : ''}
                      </span>
                    </div>

                    {marketing.isAdSpecialtyCountry && (
                      <div className="flex justify-between text-amber-300">
                        <span>📢 Reklamcı Ülke Bonusu ({currentAdSpecialist.name}):</span>
                        <span className="font-mono font-bold">+%{Math.round(marketing.adSpecialistBonusRate * 100)}</span>
                      </div>
                    )}

                    {marketing.hasCountrySynergy && (
                      <div className="flex justify-between text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
                        <span>⚡ Ortak Ülke Sinerjisi (Reklam + Satış Gücü):</span>
                        <span className="font-mono font-bold">+%{Math.round(marketing.synergySalesPowerBonusRate * 100)}</span>
                      </div>
                    )}

                    {marketing.isPopularInCountry && (
                      <div className="flex justify-between text-rose-300">
                        <span>🔥 Bölgesel Popülerlik ({normalizeCountryName(selectedOrder.country)}):</span>
                        <span className="font-mono font-bold">+%18</span>
                      </div>
                    )}

                    {(marketing.companyCountryBonusRate > 0 || marketing.activeAdBonusRate > 0) && (
                      <div className="flex justify-between text-teal-300">
                        <span>🌍 Ülke & Aktif Reklam Kampanyası Primi:</span>
                        <span className="font-mono font-bold">
                          +%{Math.round((marketing.companyCountryBonusRate + marketing.activeAdBonusRate) * 100)}
                        </span>
                      </div>
                    )}

                    {marketing.perfumerExportBonusRate > 0 && (
                      <div className="flex justify-between text-purple-300">
                        <span>👑 {playerPerfumer.name} İhracat Bonusu:</span>
                        <span className="font-mono font-bold">+%{Math.round(marketing.perfumerExportBonusRate * 100)}</span>
                      </div>
                    )}

                    {marketing.countryNoteHarmonyBonusRate !== 0 && (
                      <div
                        className={`flex justify-between px-2 py-1 rounded-lg border ${
                          marketing.countryNoteHarmonyBonusRate > 0
                            ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                            : 'text-rose-300 bg-rose-500/10 border-rose-500/30'
                        }`}
                      >
                        <span>
                          🎵 Ülke Sevdiği Nota Uyumu ({marketing.matchedCountryNotes.length} Nota Eşleşti):
                        </span>
                        <span className="font-mono font-bold">
                          {marketing.countryNoteHarmonyBonusRate > 0 ? '+' : ''}%
                          {Math.round(marketing.countryNoteHarmonyBonusRate * 100)} Ekstra Fiyat Farkı
                        </span>
                      </div>
                    )}

                    {marketing.perfumerNoteMasteryBonusRate > 0 && (
                      <div className="flex justify-between text-purple-200 bg-purple-500/15 px-2 py-1 rounded-lg border border-purple-500/30">
                        <span>
                          🧪 Parfümatör Nota Uzmanlığı ({marketing.perfumerName} • {marketing.perfumerOlfactoryFamily}):
                        </span>
                        <span className="font-mono font-bold">
                          +%{Math.round(marketing.perfumerNoteMasteryBonusRate * 100)} Ekstra Fiyat Farkı
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between text-white font-bold">
                      <span>İkna & Şöhretli Birim Fiyat (+%{Math.round(marketing.totalBonusRate * 100)}):</span>
                      <span className="font-mono text-emerald-400">{marketing.finalUnitPrice} ₺ / şişe</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Toplam Brüt Ciro (Ekstra Prim: +{bonusRev.toLocaleString('tr-TR')} ₺):</span>
                      <span className="font-mono font-bold text-white">+{grossRev.toLocaleString('tr-TR')} ₺</span>
                    </div>

                    {royalty > 0 && (
                      <div className="flex justify-between text-purple-300">
                        <span>ParfümATÖR Telifi (%{(royaltyRate * 100).toFixed(1)}):</span>
                        <span className="font-mono font-bold">
                          -{royalty.toLocaleString('tr-TR')} ₺ ({perfume?.perfumerName || playerPerfumer.name})
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-emerald-400">
                      <span>Kasaya Girecek Net Gelir:</span>
                      <span className="font-mono text-base">
                        +{netRev.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(null);
                        setSelectedSubItem(null);
                      }}
                      className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      İptal
                    </button>

                    <button
                      type="button"
                      disabled={userStock <= 0}
                      onClick={handleConfirmSale}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-4 h-4" />
                      <span>{sellAmount} Şişeyi Teslim Et</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};
