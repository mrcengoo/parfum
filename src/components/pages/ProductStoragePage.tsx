import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfume, ProductInventoryItem, Company } from '../../types';
import {
  analyzeRealizedProfit,
  getTierTargetProfit,
  calculateLivePerfumeUnitCost,
  calculateLiveCostBreakdown,
  TIER_BADGE_COLORS
} from '../../services/profitEngine';
import {
  Package,
  Sparkles,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  X,
  Factory,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  DollarSign,
  Award,
  Coins,
  Building2,
  Crown,
  Bot,
  BarChart3,
  Search,
  ArrowRight,
  Wallet,
  Percent,
  CheckCircle2,
  Globe2
} from 'lucide-react';

export const ProductStoragePage: React.FC = () => {
  const {
    companies,
    playerCompany,
    perfumes,
    perfumesMap,
    perfumersMap,
    rawMaterialsMap,
    sellProductWholesale,
    setActiveTab
  } = useGame();

  // Company selection: 'all' or company ID
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | 'ORİJİNAL' | 'AR-GE'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'ERKEK' | 'KADIN' | 'UNISEX'>('all');

  const [inspectPerfume, setInspectPerfume] = useState<{
    perfume: Perfume;
    item: ProductInventoryItem;
    company: Company;
  } | null>(null);

  // Wholesale liquidation modal state
  const [wholesaleTarget, setWholesaleTarget] = useState<{
    perfume: Perfume;
    item: ProductInventoryItem;
  } | null>(null);
  const [wholesaleQty, setWholesaleQty] = useState<number>(1);

  // Currently inspected company (defaults to player if not 'all')
  const currentCompany = useMemo(() => {
    if (selectedCompanyId === 'all') return null;
    return companies.find((c) => c.id === selectedCompanyId) || playerCompany;
  }, [selectedCompanyId, companies, playerCompany]);

  // Inventory entries for the currently selected company
  const companyInventoryEntries = useMemo(() => {
    if (!currentCompany) return [];
    return Object.entries(currentCompany.productStorage || {})
      .filter(([_, item]) => (item.quantity && item.quantity > 0) || (item.totalSold && item.totalSold > 0))
      .map(([perfumeId, item]) => {
        const perfume = perfumesMap.get(perfumeId);
        return { perfumeId, item, perfume };
      })
      .filter((entry): entry is { perfumeId: string; item: ProductInventoryItem; perfume: Perfume } => Boolean(entry.perfume));
  }, [currentCompany, perfumesMap]);

  // Filtered entries for current company
  const filteredCompanyEntries = useMemo(() => {
    return companyInventoryEntries.filter(({ perfume }) => {
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const matchName = perfume.name.toLowerCase().includes(q);
        const matchBrand = perfume.brand?.toLowerCase().includes(q);
        const matchCreator = perfume.perfumerName?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCreator) return false;
      }
      if (sourceTypeFilter !== 'all' && perfume.sourceType !== sourceTypeFilter) {
        return false;
      }
      if (genderFilter !== 'all' && perfume.gender !== genderFilter) {
        return false;
      }
      return true;
    });
  }, [companyInventoryEntries, searchFilter, sourceTypeFilter, genderFilter]);

  // Totals for current company
  const currentCompanyTotalBottles = useMemo(() => {
    if (!currentCompany) return 0;
    return Object.values(currentCompany.productStorage || {}).reduce(
      (acc, curr) => acc + (curr.quantity || 0),
      0
    );
  }, [currentCompany]);

  const currentCompanyTotalValuation = useMemo(() => {
    if (!currentCompany) return 0;
    return Object.values(currentCompany.productStorage || {}).reduce(
      (acc, curr) => acc + (curr.totalCostBasis || 0),
      0
    );
  }, [currentCompany]);

  // Sector totals across all companies
  const sectorTotalBottles = useMemo(() => {
    return companies.reduce((sum, comp) => {
      const q = Object.values(comp.productStorage || {}).reduce((s, it) => s + (it.quantity || 0), 0);
      return sum + q;
    }, 0);
  }, [companies]);

  const sectorTotalValuation = useMemo(() => {
    return companies.reduce((sum, comp) => {
      const v = Object.values(comp.productStorage || {}).reduce((s, it) => s + (it.totalCostBasis || 0), 0);
      return sum + v;
    }, 0);
  }, [companies]);

  // Sektör Dağılım Matrisi: Kimde Hangi Parfümden Kaç Şişe Var?
  const sectorProductMatrix = useMemo(() => {
    return perfumes.map((perf) => {
      const companyStocks = companies.map((comp) => {
        const item = comp.productStorage?.[perf.id];
        return {
          companyId: comp.id,
          companyName: comp.name,
          companyLogo: comp.logo,
          isPlayer: comp.isPlayer,
          quantity: item?.quantity || 0,
          unitCost: item?.unitCost || Math.round(perf.suggestedRetailPrice * 0.55),
          totalCostBasis: item?.totalCostBasis || 0,
          totalSold: item?.totalSold || 0
        };
      });

      const totalBottlesInSector = companyStocks.reduce((sum, s) => sum + s.quantity, 0);
      const topHolder = [...companyStocks].sort((a, b) => b.quantity - a.quantity)[0];

      return {
        perfume: perf,
        totalBottlesInSector,
        companyStocks,
        topHolder: topHolder.quantity > 0 ? topHolder : null
      };
    }).filter((row) => {
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const matchName = row.perfume.name.toLowerCase().includes(q);
        const matchBrand = row.perfume.brand?.toLowerCase().includes(q);
        const matchCreator = row.perfume.perfumerName?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCreator) return false;
      }
      if (sourceTypeFilter !== 'all' && row.perfume.sourceType !== sourceTypeFilter) {
        return false;
      }
      if (genderFilter !== 'all' && row.perfume.gender !== genderFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      // Sort by sector stock descending, then by name
      if (b.totalBottlesInSector !== a.totalBottlesInSector) {
        return b.totalBottlesInSector - a.totalBottlesInSector;
      }
      return a.perfume.name.localeCompare(b.perfume.name);
    });
  }, [perfumes, companies, searchFilter, sourceTypeFilter, genderFilter]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            Parfüm Sektörü Mamul Depoları & Şirket Finansal Tablosu
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            {selectedCompanyId === 'all'
              ? 'Mamul Ürün Depoları (Şirket Şirket Parfüm Stokları)'
              : `${currentCompany?.name} Mamul Deposu & Finansalları`}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Laboratuvarlarda üretilen bitmiş parfümler bu depolarda muhafaza edilir. 
            Aşağıdaki sekmelerden hem kendi deponuzu hem de <strong>diğer bot şirketlerin elinde hangi parfümden kaç adet olduğunu</strong>,
            ayrıca tüm şirketlerin <strong>Gelir, Gider, Net Kâr ve Kâr Marjı</strong> verilerini canlı takip edebilirsiniz.
          </p>
        </div>

        {/* Global Summary Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {selectedCompanyId === 'all' ? 'Sektör Toplam Şişe' : `${currentCompany?.name} Stoğu`}
            </div>
            <div className="text-lg font-bold font-mono text-indigo-300">
              {(selectedCompanyId === 'all' ? sectorTotalBottles : currentCompanyTotalBottles).toLocaleString('tr-TR')} adet
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {selectedCompanyId === 'all' ? 'Sektör Mamul Değeri' : `${currentCompany?.name} Değeri`}
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {(selectedCompanyId === 'all' ? sectorTotalValuation : currentCompanyTotalValuation).toLocaleString('tr-TR')} ₺
            </div>
          </div>
        </div>
      </div>

      {/* COMPANY SELECTOR TABS (ŞİRKET ŞİRKET SEÇİM ÇUBUĞU) */}
      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-md">
        {/* All Companies Matrix Button */}
        <button
          onClick={() => setSelectedCompanyId('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedCompanyId === 'all'
              ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md shadow-indigo-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Sektör Karşılaştırması & Matris (Tüm Şirketler)</span>
        </button>

        {/* Individual Company Buttons */}
        {companies.map((comp) => {
          const isSelected = selectedCompanyId === comp.id;
          const totalBottles = Object.values(comp.productStorage || {}).reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );

          return (
            <button
              key={comp.id}
              onClick={() => setSelectedCompanyId(comp.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? comp.isPlayer
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-purple-950/50 text-purple-200 border-purple-500/50 shadow-md shadow-purple-950/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <span className="text-sm">{comp.logo}</span>
              <span>{comp.name}</span>
              {comp.isPlayer && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                  SİZİN
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 font-mono text-slate-300">
                {totalBottles} şişe
              </span>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: ALL COMPANIES SECTOR COMPARISON & MATRIX */}
      {selectedCompanyId === 'all' && (
        <div className="space-y-6">
          
          {/* 4 ŞİRKETİN GELİR - GİDER - NET KÂR - KÂR MARJI & STOK KARTLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.map((comp) => {
              const compBottles = Object.values(comp.productStorage || {}).reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              );
              const compValuation = Object.values(comp.productStorage || {}).reduce(
                (sum, item) => sum + (item.totalCostBasis || 0),
                0
              );
              const distinctPerfumeCount = Object.values(comp.productStorage || {}).filter(
                (i) => (i.quantity || 0) > 0
              ).length;
              const perfumer = perfumersMap.get(comp.perfumerId);
              const isProfitPositive = (comp.netProfit || 0) >= 0;

              return (
                <div
                  key={comp.id}
                  className={`p-5 rounded-3xl border shadow-lg space-y-4 transition-all ${
                    comp.isPlayer
                      ? 'bg-slate-900/95 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Company Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                        {comp.logo}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{comp.name}</span>
                          {comp.isPlayer && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              Siz
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-purple-300">
                          {perfumer?.name || 'Baş Parfümatör'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 ANA FİNANSAL GÖSTERGE: GELİR - GİDER - NET KÂR - KÂR MARJI */}
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Finansal Göstergeler
                      </span>
                      <span className="text-slate-400 font-mono">
                        Kasa: {comp.cash.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                      <div>
                        <div className="text-slate-400 text-[10px]">Toplam Gelir</div>
                        <div className="font-mono font-bold text-emerald-400">
                          {(comp.totalRevenue || 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Toplam Gider</div>
                        <div className="font-mono font-bold text-rose-400">
                          {(comp.totalExpenses || 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Net Kâr</div>
                        <div className={`font-mono font-bold ${isProfitPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfitPositive ? '+' : ''}{(comp.netProfit || 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Kâr Marjı</div>
                        <div className={`font-mono font-bold ${isProfitPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
                          %{(comp.profitMargin || 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Snapshot */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Depodaki Şişe</div>
                      <div className="font-mono font-bold text-indigo-300 text-sm">{compBottles} adet</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Mamul Değeri</div>
                      <div className="font-mono font-bold text-amber-300 text-sm">
                        {compValuation.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                    <span>Çeşit: <strong className="text-white">{distinctPerfumeCount} koku</strong></span>
                    <span className="text-[11px] text-slate-400">
                      {comp.isPlayer ? '👑 Aktif Oyuncu' : '🤖 Otonom Bot'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCompanyId(comp.id)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{comp.name} Depo ve Ürünleri</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* SEKTÖR MAMUL DAĞILIM MATRİSİ: KİMDE HANGİ PARFÜMDEN KAÇ TANE VAR? */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  <Layers className="w-4 h-4" />
                  Kimde Hangi Parfümden Kaç Şişe Var? (Sektör Mamul Dağılım Matrisi)
                </div>
                <h3 className="text-base font-bold text-white">
                  Tüm Parfümler & Şirketlerin Elindeki Bitmiş Şişe Miktarları
                </h3>
              </div>

              {/* Filters for Matrix */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Parfüm veya tasarımcı ara..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-52 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <select
                  value={sourceTypeFilter}
                  onChange={(e) => setSourceTypeFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tüm Kaynaklar (Orijinal & AR-GE)</option>
                  <option value="ORİJİNAL">Orijinal İkonik</option>
                  <option value="AR-GE">Özgün AR-GE</option>
                </select>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tüm Cinsiyetler</option>
                  <option value="ERKEK">Erkek</option>
                  <option value="KADIN">Kadın</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <th className="py-3.5 px-4">Parfüm / Marka & Koku</th>
                    <th className="py-3.5 px-3">Türü & Cinsiyet</th>
                    <th className="py-3.5 px-3">Piyasa Fiyatı</th>
                    <th className="py-3.5 px-3">Sektör Toplamı</th>
                    {companies.map((c) => (
                      <th
                        key={c.id}
                        className={`py-3.5 px-3 text-center ${c.isPlayer ? 'bg-amber-500/5 text-amber-300' : ''}`}
                      >
                        <div className="flex items-center justify-center gap-1 font-sans">
                          <span>{c.logo}</span>
                          <span>{c.name}</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-3.5 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {sectorProductMatrix.map((row) => {
                    const perf = row.perfume;
                    const isRnd = perf.sourceType === 'AR-GE';

                    return (
                      <tr key={perf.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Perfume Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                              <img
                                src={perf.image}
                                alt={perf.name}
                                className="w-full h-full object-cover"
                              />
                              {isRnd && (
                                <span className="absolute bottom-0 inset-x-0 bg-purple-600 text-[7px] font-black text-white text-center leading-tight">
                                  AR-GE
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span>{perf.name}</span>
                                {isRnd && (
                                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white shadow-sm border border-purple-400/50">
                                    AR-GE
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {isRnd ? (
                                  <span className="text-purple-300">
                                    {perf.companyName || 'AR-GE'} × {perf.perfumerName || 'Parfümatör'}
                                  </span>
                                ) : (
                                  <span>{perf.brand}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Gender */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded w-fit flex items-center gap-1 ${
                                isRnd
                                  ? 'bg-purple-600 text-white border border-purple-400 font-black shadow-sm'
                                  : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {isRnd ? '🔬 AR-GE' : perf.sourceType}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {perf.gender}
                            </span>
                          </div>
                        </td>

                        {/* Retail Price */}
                        <td className="py-3.5 px-3 font-mono font-semibold text-amber-300">
                          {perf.suggestedRetailPrice.toFixed(0)} ₺
                        </td>

                        {/* Sector Total Bottles */}
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-300">
                          {row.totalBottlesInSector > 0 ? `${row.totalBottlesInSector} şişe` : '—'}
                        </td>

                        {/* 4 Company Stock Columns */}
                        {companies.map((comp) => {
                          const stockItem = row.companyStocks.find((s) => s.companyId === comp.id);
                          const qty = stockItem?.quantity || 0;
                          const isTop = row.topHolder?.companyId === comp.id && qty > 0;

                          return (
                            <td
                              key={comp.id}
                              className={`py-3.5 px-3 text-center font-mono ${
                                comp.isPlayer ? 'bg-amber-500/5' : ''
                              }`}
                            >
                              {qty > 0 ? (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all">
                                  <span className={comp.isPlayer ? 'text-amber-300' : 'text-slate-200'}>
                                    {qty} şişe
                                  </span>
                                  {isTop && (
                                    <span title="Sektörde bu parfümden en çok stok tutan şirket" className="text-[10px]">
                                      🏆
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 font-mono">—</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Action / Inspect */}
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => {
                              // If any company holds this perfume, use that item; otherwise construct representative item
                              const companyWithStock = companies.find((c) => (c.productStorage?.[perf.id]?.quantity || 0) > 0) || playerCompany;
                              const existingItem = companyWithStock.productStorage?.[perf.id] || {
                                perfumeId: perf.id,
                                quantity: 0,
                                totalCostBasis: 0,
                                unitCost: Math.round(perf.suggestedRetailPrice * 0.55),
                                suggestedSalePrice: perf.suggestedRetailPrice,
                                totalSold: 0
                              };
                              setInspectPerfume({
                                perfume: perf,
                                item: existingItem,
                                company: companyWithStock
                              });
                            }}
                            className="px-2.5 py-1 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>İncele</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SPECIFIC COMPANY FINISHED PRODUCT WAREHOUSE & FINANCIALS */}
      {selectedCompanyId !== 'all' && currentCompany && (
        <div className="space-y-6">
          
          {/* Company Profile & 4-Pillar Financial Header */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-md">
                  {currentCompany.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-serif">{currentCompany.name}</h3>
                    {currentCompany.isPlayer ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" /> Sizin Şirketiniz
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <Bot className="w-3 h-3 text-purple-400" /> Rakip Bot Parfümeri
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Baş Parfümatör:</span>
                    <span className="text-purple-300 font-semibold">
                      {perfumersMap.get(currentCompany.perfumerId)?.name || 'Atanmadı'}
                    </span>
                    <span>•</span>
                    <span>Kasa Nakdi: <strong className="text-amber-400 font-mono">{currentCompany.cash.toLocaleString('tr-TR')} ₺</strong></span>
                  </div>
                </div>
              </div>

              {/* Action button to switch to comparison */}
              <button
                onClick={() => setSelectedCompanyId('all')}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1.5 self-start md:self-center"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Tüm Şirketleri Karşılaştır</span>
              </button>
            </div>

            {/* 4 ANA FİNANSAL SÜTUN: GELİR - GİDER - NET KÂR - KÂR MARJI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Toplam Gelir
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  {(currentCompany.totalRevenue || 0).toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Sipariş & Toptan Satış</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Toplam Gider
                </div>
                <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                  {(currentCompany.totalExpenses || 0).toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hammadde, Üretim & AR-GE</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> Net Kâr
                </div>
                <div className={`text-lg font-bold font-mono mt-1 ${(currentCompany.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(currentCompany.netProfit || 0) >= 0 ? '+' : ''}{(currentCompany.netProfit || 0).toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Gelir - Gider Dengesi</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-indigo-400" /> Kâr Marjı
                </div>
                <div className={`text-lg font-bold font-mono mt-1 ${(currentCompany.profitMargin || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  %{(currentCompany.profitMargin || 0).toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Net Kâr / Toplam Gelir</div>
              </div>
            </div>
          </div>

          {/* PRODUCTS INVENTORY GRID FOR THIS COMPANY */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {currentCompany.name} Mamul Depo Envanteri ({filteredCompanyEntries.length} Koku)
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Parfüm veya tasarımcı ara..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-48 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <select
                  value={sourceTypeFilter}
                  onChange={(e) => setSourceTypeFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tüm Kaynaklar</option>
                  <option value="ORİJİNAL">Orijinal İkonik</option>
                  <option value="AR-GE">Özgün AR-GE</option>
                </select>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tüm Cinsiyetler</option>
                  <option value="ERKEK">Erkek</option>
                  <option value="KADIN">Kadın</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
            </div>

            {filteredCompanyEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCompanyEntries.map(({ perfumeId, item, perfume }) => {
                  const isRnd = perfume.sourceType === 'AR-GE';
                  const salePrice = item.suggestedSalePrice || perfume.suggestedRetailPrice;
                  // Canlı borsa hammadde spot fiyatlarına göre dinamik imalat maliyeti
                  const liveCost = calculateLivePerfumeUnitCost(perfume, rawMaterialsMap);
                  const profitAnalysis = analyzeRealizedProfit(salePrice, liveCost, perfume.resultLevel);
                  const badgeStyle = TIER_BADGE_COLORS[perfume.resultLevel || 'Standart'] || TIER_BADGE_COLORS.Standart;

                  return (
                    <div
                      key={perfumeId}
                      onClick={() => setInspectPerfume({ perfume, item, company: currentCompany })}
                      className="group bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl hover:shadow-amber-500/5 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top: Image & Origin / Gender Badges */}
                        <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[16/10] bg-slate-950 border border-slate-800">
                          <img
                            src={perfume.image}
                            alt={perfume.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                            {/* Cinsiyet */}
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 backdrop-blur-sm border border-slate-700 font-mono">
                              {perfume.gender}
                            </span>
                            {/* Kademe & Sabit Kâr Seviyesi */}
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur-sm border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} font-mono`}>
                              {perfume.resultLevel || 'Standart'} (+{profitAnalysis.targetProfit} ₺)
                            </span>
                            {/* Orijinal / AR-GE */}
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded backdrop-blur-sm border flex items-center gap-1 ${
                                isRnd
                                  ? 'bg-purple-600 text-white border-purple-300 shadow-md animate-pulse'
                                  : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                              }`}
                            >
                              {isRnd ? '🔬 AR-GE İCADI' : perfume.sourceType}
                            </span>
                          </div>

                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 shadow-md">
                              {item.quantity} Şişe
                            </span>
                          </div>
                        </div>

                        {/* Perfume Identity */}
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2 flex-wrap">
                          <span>{perfume.name}</span>
                          {isRnd && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white border border-purple-300/50 shadow-sm">
                              AR-GE
                            </span>
                          )}
                        </h3>

                        {/* Şirket × Parfümör */}
                        <div className="text-xs font-semibold text-amber-400 mt-0.5">
                          {isRnd ? (
                            <span className="text-purple-300 font-bold">
                              {perfume.companyName || currentCompany.name} × {perfume.perfumerName || 'Mert Aksoy'}
                            </span>
                          ) : (
                            <span>{perfume.brand} • {perfume.companyName || currentCompany.name}</span>
                          )}
                        </div>
                      </div>

                      {/* Metrics Table: Anlık Borsa Maliyeti, Sabit Hedef Kâr & Kâr Payı % Değişimi */}
                      <div className="space-y-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1">
                            <span>Anlık Borsa Maliyeti:</span>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Hammadde borsa fiyatlarına göre anlık güncellenir"></span>
                          </span>
                          <span className="font-mono font-bold text-slate-200">
                            {liveCost} ₺
                            {item.unitCost !== liveCost && (
                              <span className="text-[10px] text-slate-500 font-normal ml-1" title="Önceki parti depo maliyeti">
                                (Depo: {item.unitCost} ₺)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400">Piyasa Satış Fiyatı:</span>
                          <span className="font-mono font-bold text-amber-300">{salePrice} ₺</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400">Kademe Hedef Kârı:</span>
                          <span className="font-mono font-bold text-slate-300">+{profitAnalysis.targetProfit} ₺</span>
                        </div>

                        <div className="flex justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400">Anlık Birim Kâr:</span>
                          <span className={`font-mono font-bold ${profitAnalysis.statusColor}`}>
                            {profitAnalysis.realizedProfit >= 0 ? `+${profitAnalysis.realizedProfit}` : profitAnalysis.realizedProfit} ₺
                          </span>
                        </div>

                        {/* Kâr Payı Yüzdesi & Değişimi */}
                        <div className="flex justify-between items-center pt-0.5 text-[11px]">
                          <span className="text-slate-400">Kâr Payı (%):</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-white">%{profitAnalysis.profitMarginPct.toFixed(1)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              profitAnalysis.profitMarginDeltaPct < 0
                                ? 'text-amber-400 bg-amber-950/70 border border-amber-500/30'
                                : profitAnalysis.profitMarginDeltaPct > 0
                                ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-500/30'
                                : 'text-slate-400 bg-slate-900 border border-slate-700'
                            }`}>
                              {profitAnalysis.profitMarginDeltaPct > 0 ? `+${profitAnalysis.profitMarginDeltaPct.toFixed(1)}%` : `${profitAnalysis.profitMarginDeltaPct.toFixed(1)}%`}
                            </span>
                          </div>
                        </div>

                        {/* Hammadde Etkisi Durum Rozeti */}
                        <div className="pt-1">
                          {profitAnalysis.status === 'profit_eroded' && (
                            <div className="text-[10px] text-amber-400/90 font-medium bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded-lg">
                              ⚠️ Hammadde artışı kâr payını %{profitAnalysis.targetProfitMarginPct.toFixed(1)}'den %{profitAnalysis.profitMarginPct.toFixed(1)}'ye düşürdü ({Math.abs(profitAnalysis.profitDifference)} ₺ erime)
                            </div>
                          )}
                          {profitAnalysis.status === 'loss' && (
                            <div className="text-[10px] text-red-400 font-bold bg-red-950/40 border border-red-500/30 px-2 py-1 rounded-lg">
                              🚨 Borsa hammadde maliyeti satış fiyatını aştı (Zarar)!
                            </div>
                          )}
                          {profitAnalysis.status === 'target_met' && (
                            <div className="text-[10px] text-emerald-400/90 font-medium bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg">
                              ✓ {perfume.resultLevel || 'Standart'} kademe hedef kârı (%{profitAnalysis.targetProfitMarginPct.toFixed(1)}) korundu
                            </div>
                          )}
                          {profitAnalysis.status === 'bonus_profit' && (
                            <div className="text-[10px] text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded-lg">
                              ✨ Ucuz hammadde avantajı (+{profitAnalysis.profitDifference} ₺ ekstra kâr, +{profitAnalysis.profitMarginDeltaPct.toFixed(1)} puan)
                            </div>
                          )}
                        </div>

                        {item.totalSold && item.totalSold > 0 ? (
                          <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                            <span>Toplam Satılan:</span>
                            <span className="font-mono text-indigo-300 font-bold">{item.totalSold} adet</span>
                          </div>
                        ) : null}

                        {currentCompany.isPlayer && item.quantity > 0 ? (
                          <div className="grid grid-cols-3 gap-1.5 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setWholesaleTarget({ perfume, item });
                                setWholesaleQty(Math.min(item.quantity, 50));
                              }}
                              className="py-2 px-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Coins className="w-3 h-3" />
                              Toptan Sat
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('orders');
                              }}
                              className="py-2 px-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Globe2 className="w-3 h-3" />
                              İhracat
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectPerfume({ perfume, item, company: currentCompany });
                              }}
                              className="py-2 px-1.5 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              Oyun Kartı
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectPerfume({ perfume, item, company: currentCompany });
                            }}
                            className="w-full mt-2 py-2 bg-slate-800 group-hover:bg-amber-500 text-slate-300 group-hover:text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Parfüm Oyun Kartını Aç
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Package className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {currentCompany.name} mamul deposunda şu anda parfüm bulunmuyor.
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {currentCompany.isPlayer
                    ? 'Hammadde Borsasından esansları tamamlayıp Üretim Laboratuvarında 1 ile 100 adet arası üretim başlatabilirsiniz.'
                    : 'Bu şirket otonom olarak esans tedariğini tamamlayıp yeni parti üretimini başlattığında mamul stokları güncellenecektir.'}
                </p>
                {currentCompany.isPlayer && (
                  <button
                    onClick={() => setActiveTab('production')}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
                  >
                    <Factory className="w-4 h-4" />
                    Üretim Laboratuvarına Git
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PARFÜM OYUN KARTI (MODAL) */}
      {inspectPerfume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="relative h-48 sm:h-56 bg-slate-950">
              <img
                src={inspectPerfume.perfume.image}
                alt={inspectPerfume.perfume.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              <button
                onClick={() => setInspectPerfume(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* Cinsiyet */}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono">
                      {inspectPerfume.perfume.gender}
                    </span>
                    {/* ORİJİNAL / AR-GE */}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {inspectPerfume.perfume.sourceType}
                    </span>
                    {inspectPerfume.perfume.resultLevel && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {inspectPerfume.perfume.resultLevel}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-serif font-bold text-white">
                    {inspectPerfume.perfume.name}
                  </h2>

                  {/* ŞİRKET × PARFÜMATÖR */}
                  <div className="text-xs font-semibold text-purple-300 mt-0.5">
                    {inspectPerfume.company.logo} {inspectPerfume.company.name} • {inspectPerfume.perfume.brand || inspectPerfume.perfume.companyName}
                  </div>
                </div>

                <div className="text-right bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Depodaki Stok</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {inspectPerfume.item.quantity} Şişe
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              
              {/* Quality, Originality, Harmony, Trend Fit Gauges */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Kalite</div>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                    %{inspectPerfume.perfume.quality || 90}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Özgünlük</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    %{inspectPerfume.perfume.originality || 88}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Nota Uyumu</div>
                  <div className="text-base font-bold font-mono text-blue-300 mt-0.5">
                    %{inspectPerfume.perfume.noteHarmony || 92}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Trend Uyumu</div>
                  <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
                    %{inspectPerfume.perfume.trendFit || 85}
                  </div>
                </div>
              </div>

              {/* Olfactory Pyramid (Notalar Hiyerarşisi) */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Koku Piramidi (Notalar)
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-amber-300 w-24 shrink-0">Üst Notalar:</span>
                    <span className="text-slate-300">
                      {inspectPerfume.perfume.topNotes
                        .map((id) => rawMaterialsMap.get(id)?.name || id)
                        .join(', ')}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="font-bold text-rose-300 w-24 shrink-0">Orta Notalar:</span>
                    <span className="text-slate-300">
                      {inspectPerfume.perfume.middleNotes
                        .map((id) => rawMaterialsMap.get(id)?.name || id)
                        .join(', ')}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="font-bold text-indigo-300 w-24 shrink-0">Alt Notalar:</span>
                    <span className="text-slate-300">
                      {inspectPerfume.perfume.baseNotes
                        .map((id) => rawMaterialsMap.get(id)?.name || id)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILED COST BREAKDOWN (CANLI BORSA SPOT FİYATLARIYLA GÜNCELLENİR) */}
              {(() => {
                const liveBreakdown = calculateLiveCostBreakdown(inspectPerfume.perfume, rawMaterialsMap);
                const liveUnitCost = calculateLivePerfumeUnitCost(inspectPerfume.perfume, rawMaterialsMap);

                return (
                  <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-5 rounded-2xl border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        <span>Maliyet Analizi: "Bu Parfümün Güncel Borsa İmalat Maliyeti"</span>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Borsa fiyatlarına göre canlı"></span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">Canlı Borsa Fiyatlarıyla (100 Şişe)</span>
                    </div>

                    <div className="divide-y divide-slate-800 text-xs space-y-2 pt-1">
                      <div className="flex justify-between py-1 text-slate-300">
                        <span>1. Canlı Spot Hammadde Bedeli:</span>
                        <span className="font-mono text-white font-semibold">
                          {liveBreakdown.rawMaterialCost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <div className="flex justify-between py-1 text-slate-400">
                        <span>2. Gümrük & İthalat Vergisi (%20):</span>
                        <span className="font-mono text-rose-400">
                          +{liveBreakdown.taxCost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <div className="flex justify-between py-1 text-slate-400">
                        <span>3. Uluslararası Lojistik & Sigorta (%15):</span>
                        <span className="font-mono text-rose-400">
                          +{liveBreakdown.logisticsCost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <div className="flex justify-between py-1 text-slate-400">
                        <span>4. Nakliye Sırasındaki Fire Maliyeti:</span>
                        <span className="font-mono text-amber-400">
                          +{liveBreakdown.wasteCost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <div className="flex justify-between py-1 text-slate-400">
                        <span>5. Esans Saflaştırma & Maserasyon Payı:</span>
                        <span className="font-mono text-indigo-300">
                          +{liveBreakdown.essenceProductionCost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <div className="flex justify-between py-1 text-slate-400">
                        <span>6. Şişeleme, Kapak, Kutu & İşçilik (Laboratuvar):</span>
                        <span className="font-mono text-indigo-300">
                          +{liveBreakdown.factoryLaborCost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <div className="pt-2 flex justify-between font-bold text-sm text-white">
                        <span>Toplam Üretim Maliyeti (100 Şişe):</span>
                        <span className="font-mono text-amber-300">
                          {liveBreakdown.totalCost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <div className="pt-1 flex justify-between font-bold text-sm text-emerald-400">
                        <span>Şişe Başına Güncel Borsa Birim Maliyet:</span>
                        <span className="font-mono">
                          {liveUnitCost} ₺ / şişe
                          {inspectPerfume.item.unitCost !== liveUnitCost && (
                            <span className="text-xs text-slate-400 font-normal ml-1.5 font-sans">
                              (Önceki Parti Depo Maliyeti: {inspectPerfume.item.unitCost} ₺)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Commercial Summary with Fixed Tier Profit & Raw Material Erosion */}
              {(() => {
                const liveUnitCost = calculateLivePerfumeUnitCost(inspectPerfume.perfume, rawMaterialsMap);
                const modalSalePrice = inspectPerfume.item.suggestedSalePrice || inspectPerfume.perfume.suggestedRetailPrice;
                const modalAnalysis = analyzeRealizedProfit(modalSalePrice, liveUnitCost, inspectPerfume.perfume.resultLevel);

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">Piyasa Satış Fiyatı</div>
                        <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                          {modalSalePrice} ₺
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Etiket Tavanı</div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">Anlık Borsa Maliyeti</div>
                        <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                          {liveUnitCost} ₺
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Şişe Başı Borsa</div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">Kademe Sabit Hedef Kâr</div>
                        <div className="text-base font-bold font-mono text-slate-300 mt-0.5">
                          +{modalAnalysis.targetProfit} ₺
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{inspectPerfume.perfume.resultLevel || 'Standart'} Kademe</div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">Anlık Birim Kâr</div>
                        <div className={`text-base font-bold font-mono mt-0.5 ${modalAnalysis.statusColor}`}>
                          {modalAnalysis.realizedProfit >= 0 ? `+${modalAnalysis.realizedProfit}` : modalAnalysis.realizedProfit} ₺
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Net Şişe Kârı</div>
                      </div>
                    </div>

                    {/* KÂR PAYI YÜZDESİ VE DEĞİŞİMİ ÖZEL ANALİZ PANOSU */}
                    <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <div className="text-slate-400 text-[11px] font-semibold flex items-center justify-between">
                          <span>Anlık Kâr Payı Oranı:</span>
                          <span className="font-mono font-bold text-white text-sm">%{modalAnalysis.profitMarginPct.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              modalAnalysis.status === 'loss' ? 'bg-red-500' :
                              modalAnalysis.status === 'profit_eroded' ? 'bg-amber-400' :
                              'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, modalAnalysis.profitMarginPct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Hedeflenen: %{modalAnalysis.targetProfitMarginPct.toFixed(1)}</span>
                          <span>Gerçekleşen: %{modalAnalysis.profitMarginPct.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400 font-bold">Kâr Payı Değişimi (Δ)</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">
                            {modalAnalysis.profitMarginDeltaPct < 0
                              ? 'Hammadde zamları kâr payını eritti'
                              : modalAnalysis.profitMarginDeltaPct > 0
                              ? 'Ucuz hammadde kâr payını artırdı'
                              : 'Kâr payı hedefi tam olarak korundu'}
                          </div>
                        </div>
                        <div className={`font-mono text-base font-extrabold px-3 py-1 rounded-xl border ${
                          modalAnalysis.profitMarginDeltaPct < 0
                            ? 'text-amber-400 bg-amber-950/80 border-amber-500/40'
                            : modalAnalysis.profitMarginDeltaPct > 0
                            ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40'
                            : 'text-slate-300 bg-slate-900 border-slate-700'
                        }`}>
                          {modalAnalysis.profitMarginDeltaPct > 0 ? `+${modalAnalysis.profitMarginDeltaPct.toFixed(1)}%` : `${modalAnalysis.profitMarginDeltaPct.toFixed(1)}%`}
                        </div>
                      </div>
                    </div>

                    {/* Fixed Profit vs Raw Material Fluctuation Analysis Banner */}
                    <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
                      modalAnalysis.status === 'loss' ? 'bg-red-950/40 border-red-500/40 text-red-200' :
                      modalAnalysis.status === 'profit_eroded' ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' :
                      'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    }`}>
                      <Coins className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div className="space-y-1">
                        <div className="font-bold flex flex-wrap items-center gap-2">
                          <span>Sabit Kâr & Borsa Maliyet Analizi:</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase border ${
                            modalAnalysis.status === 'loss' ? 'bg-red-900/60 border-red-500 text-white' :
                            modalAnalysis.status === 'profit_eroded' ? 'bg-amber-900/60 border-amber-500 text-amber-200' :
                            'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                          }`}>
                            {modalAnalysis.statusLabel}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Kademe: {inspectPerfume.perfume.resultLevel || 'Standart'}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-90 text-slate-300">
                          {modalAnalysis.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => setInspectPerfume(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Kapat
              </button>

              {inspectPerfume.company.isPlayer ? (
                <div className="flex items-center gap-2">
                  {inspectPerfume.item.quantity > 0 && (
                    <button
                      onClick={() => {
                        setWholesaleTarget({
                          perfume: inspectPerfume.perfume,
                          item: inspectPerfume.item
                        });
                        setWholesaleQty(Math.min(inspectPerfume.item.quantity, 50));
                      }}
                      className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      Toptan Sat (%85)
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setInspectPerfume(null);
                      setActiveTab('orders');
                    }}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    Sipariş Havuzuna Git
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-mono">
                  {inspectPerfume.company.name} Ürün Kartı
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* WHOLESALE LIQUIDATION MODAL (TOPTAN DİSTRİBÜTÖR SATIŞI) */}
      {wholesaleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                  <img
                    src={wholesaleTarget.perfume.image}
                    alt={wholesaleTarget.perfume.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      TOPTAN DAĞITIM
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Stok: {wholesaleTarget.item.quantity} şişe
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-serif mt-0.5">
                    {wholesaleTarget.perfume.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setWholesaleTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* Wholesale Pricing Metrics */}
            {(() => {
              const retail = wholesaleTarget.perfume.suggestedRetailPrice;
              const wholesalePrice = Math.round(retail * 0.85);
              const cost = wholesaleTarget.item.unitCost;
              const unitProfit = wholesalePrice - cost;
              const gross = wholesaleQty * wholesalePrice;
              const isRnd = wholesaleTarget.perfume.sourceType === 'AR-GE';
              const royaltyRate = wholesaleTarget.perfume.royaltyRate || (isRnd ? 0.03 : 0);
              const royalty = Math.round(gross * royaltyRate * 100) / 100;
              const netRevenue = Math.round((gross - royalty) * 100) / 100;

              return (
                <div className="space-y-4 text-xs">
                  {/* Explanation Banner */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    Deponuzdaki şişeleri ihracat sözleşmesi beklemeden, lüks mağaza ve distribütör ağına (Sephora, Beymen, Boyner vb.) 
                    toptan <strong>perakende fiyatının %85'ine ({wholesalePrice} ₺/şişe)</strong> anında nakit karşılığı satabilirsiniz.
                  </div>

                  {/* Quantity Slider */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">Satılacak Şişe Miktarı:</span>
                      <span className="font-mono text-emerald-400 font-bold text-base">
                        {wholesaleQty} şişe
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max={wholesaleTarget.item.quantity}
                      value={wholesaleQty}
                      onChange={(e) => setWholesaleQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />

                    {/* Quick presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setWholesaleQty(Math.min(wholesaleTarget.item.quantity, 10))}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-800"
                      >
                        10 Adet
                      </button>
                      <button
                        type="button"
                        onClick={() => setWholesaleQty(Math.min(wholesaleTarget.item.quantity, 50))}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-800"
                      >
                        50 Adet
                      </button>
                      <button
                        type="button"
                        onClick={() => setWholesaleQty(Math.min(wholesaleTarget.item.quantity, 100))}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-800"
                      >
                        100 Adet
                      </button>
                      <button
                        type="button"
                        onClick={() => setWholesaleQty(wholesaleTarget.item.quantity)}
                        className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 rounded-lg text-[10px] font-mono border border-emerald-800/60 font-bold ml-auto"
                      >
                        Tüm Depo ({wholesaleTarget.item.quantity})
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown Summary */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Birim Alış / Toptan Fiyat:</span>
                      <span className="font-mono text-white font-bold">{wholesalePrice} ₺ / şişe</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Birim İmalat Maliyetiniz:</span>
                      <span className="font-mono text-slate-300">{cost} ₺</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Şişe Başı Saf Kâr:</span>
                      <span className="font-mono text-emerald-400 font-bold">+{unitProfit} ₺</span>
                    </div>
                    {royalty > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>Parfümatör Telifi (%{(royaltyRate * 100).toFixed(1)}):</span>
                        <span className="font-mono text-amber-400">-{royalty.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-800/80 flex justify-between font-bold text-sm">
                      <span className="text-white">Net Kasaya Giren Nakit:</span>
                      <span className="font-mono text-emerald-400">+{netRevenue.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setWholesaleTarget(null)}
                      className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all text-xs"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sellProductWholesale(wholesaleTarget.perfume.id, wholesaleQty);
                        setWholesaleTarget(null);
                        if (inspectPerfume) setInspectPerfume(null);
                      }}
                      className="w-2/3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 text-xs"
                    >
                      <Coins className="w-4 h-4" />
                      <span>{wholesaleQty} Şişeyi Sat (+{netRevenue.toLocaleString('tr-TR')} ₺)</span>
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
