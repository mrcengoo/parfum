import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { CountdownTimer } from '../common/CountdownTimer';
import { NoteImage } from '../common/NoteImage';
import { formatCountryNameWithCode } from '../../data/rawMaterials';
import { Company, EssenceInventoryItem } from '../../types';
import {
  FlaskRound,
  Truck,
  Zap,
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Crown,
  Bot,
  Layers,
  Coins,
  TrendingUp,
  Filter,
  BarChart3
} from 'lucide-react';

export const EssenceStoragePage: React.FC = () => {
  const {
    companies,
    playerCompany,
    perfumersMap,
    rawMaterials,
    rawMaterialsMap,
    instantCompleteShipment,
    setActiveTab
  } = useGame();

  // Company selection: 'all' or company ID
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'quantity' | 'value' | 'name'>('quantity');

  // Currently inspected company (defaults to player if not 'all')
  const currentCompany = useMemo(() => {
    if (selectedCompanyId === 'all') return null;
    return companies.find((c) => c.id === selectedCompanyId) || playerCompany;
  }, [selectedCompanyId, companies, playerCompany]);

  // Categories extracted from raw materials for filter pill list
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    rawMaterials.forEach((m) => {
      if (m.category) {
        m.category.split(',').forEach((c) => cats.add(c.trim()));
      }
    });
    return Array.from(cats).sort();
  }, [rawMaterials]);

  // Essence items for current company
  const companyEssenceItems = useMemo(() => {
    if (!currentCompany) return [];
    return Object.values(currentCompany.essenceStorage || {}).filter((item) => (item.quantity || 0) > 0);
  }, [currentCompany]);

  // Filtered and sorted essence items for current company
  const filteredEssences = useMemo(() => {
    return companyEssenceItems
      .filter((item) => {
        const rawMat = rawMaterialsMap.get(item.rawMaterialId);
        if (searchFilter) {
          const q = searchFilter.toLowerCase();
          const matchName = rawMat?.name && rawMat.name.toLowerCase().includes(q);
          const matchCountry = rawMat?.country && rawMat.country.toLowerCase().includes(q);
          if (!matchName && !matchCountry) return false;
        }
        if (categoryFilter !== 'all') {
          if (!rawMat?.category?.includes(categoryFilter)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const matA = rawMaterialsMap.get(a.rawMaterialId);
        const matB = rawMaterialsMap.get(b.rawMaterialId);
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        if (sortBy === 'value') return b.totalCostBasis - a.totalCostBasis;
        return (matA?.name || '').localeCompare(matB?.name || '');
      });
  }, [companyEssenceItems, searchFilter, categoryFilter, sortBy, rawMaterialsMap]);

  // Totals for inspected company
  const companyTotalQuantity = useMemo(() => {
    return companyEssenceItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  }, [companyEssenceItems]);

  const companyTotalCostBasis = useMemo(() => {
    return companyEssenceItems.reduce((acc, curr) => acc + (curr.totalCostBasis || 0), 0);
  }, [companyEssenceItems]);

  // Player arrival history
  const playerArrivalHistory = useMemo(() => {
    return playerCompany.financialHistory.filter(
      (record) => record.description.includes('Esans Depoya Giriş') || record.description.includes('Borsa Alımı')
    );
  }, [playerCompany.financialHistory]);

  // Matrix calculation for 'all' mode: which company holds what
  const sectorMatrix = useMemo(() => {
    return rawMaterials.map((mat) => {
      const companyStocks = companies.map((comp) => {
        const item = comp.essenceStorage?.[mat.id];
        return {
          companyId: comp.id,
          companyName: comp.name,
          companyLogo: comp.logo,
          isPlayer: comp.isPlayer,
          quantity: item?.quantity || 0,
          totalCostBasis: item?.totalCostBasis || 0,
          averageUnitCost: item?.averageUnitCost || mat.price
        };
      });

      const totalHeldInSector = companyStocks.reduce((sum, s) => sum + s.quantity, 0);
      const topHolder = [...companyStocks].sort((a, b) => b.quantity - a.quantity)[0];

      return {
        material: mat,
        totalHeldInSector,
        companyStocks,
        topHolder: topHolder.quantity > 0 ? topHolder : null
      };
    }).filter((row) => {
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const matchName = row.material.name.toLowerCase().includes(q);
        const matchCountry = row.material.country.toLowerCase().includes(q);
        if (!matchName && !matchCountry) return false;
      }
      if (categoryFilter !== 'all') {
        if (!row.material.category?.includes(categoryFilter)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'quantity') return b.totalHeldInSector - a.totalHeldInSector;
      if (sortBy === 'value') return b.material.price - a.material.price;
      return a.material.name.localeCompare(b.material.name);
    });
  }, [rawMaterials, companies, searchFilter, categoryFilter, sortBy]);

  // Quick total metrics across all companies
  const sectorGrandTotalQuantity = useMemo(() => {
    return companies.reduce((sum, comp) => {
      const q = Object.values(comp.essenceStorage || {}).reduce((s, it) => s + (it.quantity || 0), 0);
      return sum + q;
    }, 0);
  }, [companies]);

  const sectorGrandTotalValue = useMemo(() => {
    return companies.reduce((sum, comp) => {
      const v = Object.values(comp.essenceStorage || {}).reduce((s, it) => s + (it.totalCostBasis || 0), 0);
      return sum + v;
    }, 0);
  }, [companies]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <FlaskRound className="w-4 h-4" />
            Parfüm Sektörü Esans Depoları & Envanter Dağılımı
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            {selectedCompanyId === 'all'
              ? 'Sektör Esans Depoları (Şirket Şirket Envanter)'
              : `${currentCompany?.name} Esans Deposu`}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Hammadde borsasından temin edilen saf yağlar ve esanslar burada saklanır. 
            Aşağıdaki sekmelerden hem kendi deponuzu hem de <strong>rakip şirketlerin depolarında hangi esansların bulunduğunu</strong> şirket şirket inceleyebilirsiniz.
          </p>
        </div>

        {/* Global Summary Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {selectedCompanyId === 'all' ? 'Sektör Toplam Esans' : `${currentCompany?.name} Stoğu`}
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {(selectedCompanyId === 'all' ? sectorGrandTotalQuantity : companyTotalQuantity).toLocaleString('tr-TR')} birim
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {selectedCompanyId === 'all' ? 'Sektör Depo Değeri' : `${currentCompany?.name} Değeri`}
            </div>
            <div className="text-lg font-bold font-mono text-indigo-300">
              {(selectedCompanyId === 'all' ? sectorGrandTotalValue : companyTotalCostBasis).toLocaleString('tr-TR')} ₺
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
          const totalUnits = Object.values(comp.essenceStorage || {}).reduce(
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
                {totalUnits} br
              </span>
            </button>
          );
        })}
      </div>

      {/* VIEW MODE 1: ALL COMPANIES SECTOR COMPARISON MATRIX */}
      {selectedCompanyId === 'all' && (
        <div className="space-y-6">
          {/* Top 4 Companies Essence Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.map((comp) => {
              const compUnits = Object.values(comp.essenceStorage || {}).reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              );
              const compValue = Object.values(comp.essenceStorage || {}).reduce(
                (sum, item) => sum + (item.totalCostBasis || 0),
                0
              );
              const essenceCount = Object.values(comp.essenceStorage || {}).filter((i) => i.quantity > 0).length;
              const perfumer = perfumersMap.get(comp.perfumerId);

              // Top held essence for this company
              const topEssence = Object.values(comp.essenceStorage || {})
                .sort((a, b) => b.quantity - a.quantity)[0];
              const topMat = topEssence ? rawMaterialsMap.get(topEssence.rawMaterialId) : null;

              return (
                <div
                  key={comp.id}
                  className={`p-5 rounded-3xl border shadow-lg space-y-3 transition-all ${
                    comp.isPlayer
                      ? 'bg-slate-900/90 border-amber-500/30 ring-1 ring-amber-500/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{comp.logo}</span>
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

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Esans Stoğu</div>
                      <div className="font-mono font-bold text-amber-300 text-sm">{compUnits} birim</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Depo Değeri</div>
                      <div className="font-mono font-bold text-indigo-300 text-sm">{compValue.toLocaleString('tr-TR')} ₺</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                    <span>Çeşit: <strong className="text-white">{essenceCount} nota</strong></span>
                    {topMat && (
                      <span className="text-[11px] text-slate-300 truncate max-w-[120px]" title={`En Çok: ${topMat.name} (${topEssence.quantity})`}>
                        En çok: {topMat.name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedCompanyId(comp.id)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{comp.name} Depo Detayı</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* SECTOR MATRIX TABLE: KIMDE HANGI ESANS VAR? */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  <Layers className="w-4 h-4" />
                  Kimde Hangi Esans Var? (Sektör Dağılım Tablosu)
                </div>
                <h3 className="text-base font-bold text-white">
                  Tüm Hammaddeler & Şirketlerin Elindeki Miktarlar
                </h3>
              </div>

              {/* Filters for Matrix */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nota veya ülke ara..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-48 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tüm Koku Aileleri</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <th className="py-3 px-4">Hammadde / Esans</th>
                    <th className="py-3 px-3">Spot Fiyat</th>
                    <th className="py-3 px-3">Sektör Toplamı</th>
                    {companies.map((c) => (
                      <th
                        key={c.id}
                        className={`py-3 px-3 text-center ${c.isPlayer ? 'bg-amber-500/5 text-amber-300' : ''}`}
                      >
                        <div className="flex items-center justify-center gap-1 font-sans">
                          <span>{c.logo}</span>
                          <span>{c.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {sectorMatrix.map((row) => {
                    const mat = row.material;

                    return (
                      <tr key={mat.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Note & Country */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <NoteImage
                              id={mat.id}
                              src={mat.image}
                              name={mat.name}
                              fallbackEmoji="🌿"
                              size="sm"
                            />
                            <div>
                              <div className="font-bold text-white text-xs">{mat.name}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <span>{formatCountryNameWithCode(mat)}</span>
                                <span>•</span>
                                <span className="text-amber-400/80">{mat.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Spot Price */}
                        <td className="py-3 px-3 font-mono font-semibold text-amber-300">
                          {mat.price.toFixed(0)} ₺
                        </td>

                        {/* Total in Sector */}
                        <td className="py-3 px-3 font-mono font-bold text-indigo-300">
                          {row.totalHeldInSector > 0 ? `${row.totalHeldInSector} br` : '—'}
                        </td>

                        {/* 4 Company Stock Columns */}
                        {companies.map((comp) => {
                          const stockItem = row.companyStocks.find((s) => s.companyId === comp.id);
                          const qty = stockItem?.quantity || 0;
                          const isTop = row.topHolder?.companyId === comp.id && qty > 0;

                          return (
                            <td
                              key={comp.id}
                              className={`py-3 px-3 text-center font-mono ${
                                comp.isPlayer ? 'bg-amber-500/5' : ''
                              }`}
                            >
                              {qty > 0 ? (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all">
                                  <span className={comp.isPlayer ? 'text-amber-300' : 'text-slate-200'}>
                                    {qty} br
                                  </span>
                                  {isTop && (
                                    <span title="Sektörde bu esansa en çok sahip olan şirket" className="text-[10px]">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SPECIFIC COMPANY ESSENCE WAREHOUSE */}
      {selectedCompanyId !== 'all' && currentCompany && (
        <div className="space-y-6">
          {/* Company Profile Header Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-md">
                {currentCompany.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-serif">{currentCompany.name}</h3>
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
                  <span>Kasa: <strong className="text-amber-400 font-mono">{currentCompany.cash.toLocaleString('tr-TR')} ₺</strong></span>
                </div>
              </div>
            </div>

            {/* Switch to All Companies shortcut */}
            <button
              onClick={() => setSelectedCompanyId('all')}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1.5 self-start md:self-center"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tüm Şirketleri Karşılaştır</span>
            </button>
          </div>

          {/* INBOUND SHIPMENTS SECTION (Only for player company if has active shipments) */}
          {currentCompany.isPlayer && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Yoldaki Nakliyeler ({currentCompany.activeShipments.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Kural: Süre bitiminde %25 fire otomatik düşülür.
                </span>
              </div>

              {currentCompany.activeShipments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCompany.activeShipments.map((shipment) => {
                    const rawMat = rawMaterialsMap.get(shipment.rawMaterialId);
                    const wasteUnits = Math.round(shipment.purchasedQuantity * shipment.wasteRate);

                    return (
                      <div
                        key={shipment.id}
                        className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <NoteImage
                              id={shipment.rawMaterialId}
                              src={rawMat?.image}
                              name={shipment.rawMaterialName}
                              fallbackEmoji="🌿"
                              size="lg"
                            />
                            <div>
                              <h4 className="text-base font-bold text-white">
                                {shipment.rawMaterialName}
                              </h4>
                              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                {rawMat && (
                                  <>
                                    <span>{formatCountryNameWithCode(rawMat)}</span>
                                    <span>•</span>
                                  </>
                                )}
                                <span>{shipment.purchasedQuantity} Adet Satın Alındı</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => instantCompleteShipment(shipment.id)}
                            title="Nakliyeyi hemen tamamla"
                            className="px-2.5 py-1 text-xs bg-amber-600/30 hover:bg-amber-600 text-amber-200 rounded-lg border border-amber-500/40 flex items-center gap-1.5 font-mono font-semibold transition-all shadow-sm"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Hemen Ulaştır
                          </button>
                        </div>

                        {/* Waste & Net Quantity Breakdown */}
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-slate-400 text-[10px]">Alınan Miktar</div>
                            <div className="font-mono font-bold text-slate-200">{shipment.purchasedQuantity} adet</div>
                          </div>
                          <div>
                            <div className="text-rose-400 text-[10px]">%25 Fire Kaybı</div>
                            <div className="font-mono font-bold text-rose-400">-{wasteUnits} adet</div>
                          </div>
                          <div>
                            <div className="text-emerald-400 text-[10px]">Net Esans Girişi</div>
                            <div className="font-mono font-bold text-emerald-300">+{shipment.expectedNetQuantity} birim</div>
                          </div>
                        </div>

                        {/* Countdown Timer with Progress Bar */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              Kalan Nakliye Süresi (3 dk)
                            </span>
                            <span className="text-amber-400 font-semibold">NAKLİYEDE</span>
                          </div>
                          <CountdownTimer
                            startTime={shipment.startTime}
                            endTime={shipment.endTime}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
                  <Truck className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-400">Şu anda yolda nakliye bulunmuyor.</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hammadde borsasından sipariş vererek yeni esans tedariği sağlayabilirsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="mt-3 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    Hammadde Borsasını Aç <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STORED ESSENCES INVENTORY CARDS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FlaskRound className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {currentCompany.name} Esans Envanteri ({filteredEssences.length} Nota)
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Esans veya ülke ara..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-44 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tüm Koku Aileleri</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="quantity">Miktar (Azalan)</option>
                  <option value="value">Maliyet Değeri (Azalan)</option>
                  <option value="name">İsim (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Grid of Essence Cards */}
            {filteredEssences.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEssences.map((item) => {
                  const rawMat = rawMaterialsMap.get(item.rawMaterialId);
                  const currentMarketPrice = rawMat?.price || item.averageUnitCost;
                  const currentTotalValue = item.quantity * currentMarketPrice;
                  const percentOfTotal = companyTotalQuantity > 0 ? (item.quantity / companyTotalQuantity) * 100 : 0;

                  return (
                    <div
                      key={item.rawMaterialId}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <NoteImage
                            id={item.rawMaterialId}
                            src={rawMat?.image}
                            name={rawMat?.name || item.rawMaterialId}
                            fallbackEmoji="🌿"
                            size="md"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate" title={rawMat?.name}>
                            {rawMat?.name || item.rawMaterialId}
                          </h4>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {rawMat && (
                              <span>{formatCountryNameWithCode(rawMat)}</span>
                            )}
                            <span>•</span>
                            <span className="text-amber-400/90 truncate">{rawMat?.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stock share progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Depo Payı:</span>
                          <span>%{percentOfTotal.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, percentOfTotal)}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mevcut Miktar:</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {item.quantity} birim
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400">Ortalama Maliyet:</span>
                          <span className="font-mono text-slate-300">
                            {item.averageUnitCost.toFixed(1)} ₺ / br
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-400">Güncel Borsa Fiyatı:</span>
                          <span className="font-mono text-amber-300">
                            {currentMarketPrice.toFixed(1)} ₺
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-slate-800/60 flex justify-between font-semibold">
                          <span className="text-slate-400">Toplam Değer:</span>
                          <span className="font-mono text-white">
                            {item.totalCostBasis.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
                <FlaskRound className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-400">
                  {searchFilter ? 'Aramanıza uygun esans bulunamadı.' : `${currentCompany.name} esans deposu boş.`}
                </div>
                {currentCompany.isPlayer && (
                  <button
                    onClick={() => setActiveTab('market')}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    Hammadde Borsasını Aç <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RECENT SHIPMENT & FIRE HISTORY (For player company only) */}
          {currentCompany.isPlayer && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Lojistik & Fire İşlem Geçmişi
                </h3>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto pr-1">
                {playerArrivalHistory.length > 0 ? (
                  playerArrivalHistory.map((rec) => (
                    <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{rec.description}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-4">
                        {new Date(rec.timestamp).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-4 text-center">Henüz bir lojistik kaydı yok.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
