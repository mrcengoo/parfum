import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { RawMaterial } from '../../types';
import { MiniChart } from '../common/MiniChart';
import { NoteImage } from '../common/NoteImage';
import { calculatePurchase, TAX_RATE, LOGISTICS_RATE, WASTE_RATE } from '../../services/economyEngine';
import {
  formatDurationToMinutesAndSeconds,
  formatCountryDisplay,
  formatCountryNameWithCode,
  formatNoteCategory,
  getFlagEmoji
} from '../../data/rawMaterials';
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Building2,
  Truck,
  ShieldCheck,
  AlertTriangle,
  X,
  Clock,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const { rawMaterials, buyRawMaterial, playerCompany, playerPerfumer } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);

  // Purchase modal states
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(100);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawMaterials.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['all', ...Array.from(set)];
  }, [rawMaterials]);

  // Filter raw materials
  const filteredMaterials = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rawMaterials.filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        m.producerCompany.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q));

      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [rawMaterials, searchQuery, selectedCategory]);

  const purchaseCalc = useMemo(() => {
    if (!selectedMaterial) return null;
    return calculatePurchase(
      purchaseQuantity,
      selectedMaterial.price,
      playerPerfumer,
      selectedMaterial.wasteRate || WASTE_RATE
    );
  }, [selectedMaterial, purchaseQuantity, playerPerfumer]);

  const handleOpenDetail = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setPurchaseQuantity(100);
  };

  const handleConfirmPurchase = () => {
    if (!selectedMaterial || !purchaseCalc) return;
    buyRawMaterial(selectedMaterial.id, purchaseQuantity);
    setSelectedMaterial(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            Uluslararası Emtia Borsası
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Hammadde & Esans Borsası
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Tüm parfümlerin formüllerinde kullanılan tekil hammaddelerin anlık spot piyasası. 
            Her hammadde coğrafi menşeine göre farklı üretim & nakliye sürelerine sahiptir.
          </p>
        </div>

        {/* Perfumer Active Bonus Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <div>
            <span className="text-purple-400 font-bold">Aktif Parfümör:</span> {playerPerfumer.name}
            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
              <span className="text-emerald-400">Lojistik: %{(playerPerfumer.logisticsBonus * 100).toFixed(0)}</span>
              <span>•</span>
              <span className="text-emerald-400">Fire: %{(playerPerfumer.wasteBonus * 100).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hammadde adı, nota veya ülke ara (örn: Van, Safran, Madagaskar)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'Tüm Notalar' : cat}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Raw Materials Grid / Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map((material) => {
            const firstPrice = material.priceHistory[0]?.price || material.basePrice;
            const priceChange = material.price - firstPrice;
            const priceChangePct = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
            const isUp = priceChange >= 0;
            const durationStr = formatDurationToMinutesAndSeconds(material.shippingTime || material.productionTime || 240);

            return (
              <div
                key={material.id}
                onClick={() => handleOpenDetail(material)}
                className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg hover:shadow-amber-500/5 cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                {/* Top: Required format: HAMMADDE ADI, ÜLKE, ÜLKE BAYRAĞI & FRAGRANTICA NOTA RESMİ */}
                <div className="min-w-0">
                  <div className="flex items-start gap-3 mb-2 min-w-0">
                    <div className="relative shrink-0">
                      <NoteImage
                        id={material.id}
                        src={material.image}
                        name={material.name}
                        fallbackEmoji="🌿"
                        size="lg"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white uppercase tracking-tight group-hover:text-amber-300 transition-colors truncate">
                        {material.name}
                      </h3>
                      {/* Ülke bilgisi: Madagaskar */}
                      <div className="text-[11px] font-semibold text-amber-400/95 tracking-wide mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>{formatCountryNameWithCode(material)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nota Grubu: Çiçeksi · Tatlı · Odunsu (taşma önleme, otomatik satır kırılımı) */}
                  <div className="mt-2 mb-2 flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">
                      Nota Grubu:
                    </span>
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800/90 text-amber-200/90 border border-slate-700/60 max-w-full break-words"
                      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                    >
                      {formatNoteCategory(material.category)}
                    </span>
                  </div>

                  {/* Producer & Individual Duration */}
                  <div className="space-y-1 mt-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{material.producerCompany}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-400/90 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Üretim & Nakliye: {durationStr}</span>
                    </div>
                  </div>

                  {/* Sparkline chart */}
                  <div className="my-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mb-1">
                      <span>Fiyat Trendi</span>
                      <span className="text-amber-400">Son Hareketler</span>
                    </div>
                    <MiniChart
                      data={material.priceHistory}
                      basePrice={material.basePrice}
                      height={38}
                      width={180}
                    />
                  </div>
                </div>

                {/* Bottom: Price, Stock, Supply/Demand & Buy Action */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Birim Fiyat</div>
                      <div className="text-xl font-bold font-mono text-white">
                        {material.price.toFixed(1)} ₺
                      </div>
                    </div>

                    <div
                      className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isUp ? '+' : ''}{priceChangePct.toFixed(1)}%
                    </div>
                  </div>

                  {/* Supply / Demand Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500">Arz: </span>
                      <span className="font-semibold text-slate-300">{material.supply}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Talep: </span>
                      <span className="font-semibold text-amber-400">{material.demand}/100</span>
                    </div>
                    <div className="col-span-2 text-slate-400 text-[10px] pt-1 border-t border-slate-800/60 flex justify-between">
                      <span>Borsa Stoğu:</span>
                      <span className="font-mono font-bold text-slate-200">{material.exchangeStock.toLocaleString('tr-TR')} adet</span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(material);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-amber-500 group-hover:bg-amber-500 text-slate-300 hover:text-slate-950 group-hover:text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Detay & Satın Al
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Hammadde & Orijin Ülke</th>
                  <th className="px-4 py-3.5">Üretici Şirket</th>
                  <th className="px-4 py-3.5">Üretim/Nakliye Süresi</th>
                  <th className="px-4 py-3.5">Güncel Fiyat</th>
                  <th className="px-4 py-3.5">Fiyat Değişimi</th>
                  <th className="px-4 py-3.5">Borsa Stoğu</th>
                  <th className="px-4 py-3.5">Arz / Talep</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMaterials.map((m) => {
                  const firstPrice = m.priceHistory[0]?.price || m.basePrice;
                  const priceChange = m.price - firstPrice;
                  const priceChangePct = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
                  const isUp = priceChange >= 0;
                  const durationStr = formatDurationToMinutesAndSeconds(m.shippingTime || m.productionTime || 240);

                  return (
                    <tr
                      key={m.id}
                      onClick={() => handleOpenDetail(m)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <NoteImage
                              id={m.id}
                              src={m.image}
                              name={m.name}
                              fallbackEmoji="🌿"
                              size="md"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm uppercase">{m.name}</div>
                            <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
                              <span>{formatCountryNameWithCode(m)}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{formatNoteCategory(m.category)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-medium">
                        {m.producerCompany}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-amber-300">
                        {durationStr}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-sm text-white">
                        {m.price.toFixed(1)} ₺
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold">
                        <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                          {isUp ? '+' : ''}{priceChangePct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {m.exchangeStock.toLocaleString('tr-TR')} adet
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-[11px]">
                          <span className="text-slate-400">A: {m.supply}</span>
                          <span className="mx-1 text-slate-600">|</span>
                          <span className="text-amber-400">T: {m.demand}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(m);
                          }}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-lg border border-amber-500/30 transition-all"
                        >
                          Satın Al
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL & PURCHASE MODAL */}
      {selectedMaterial && purchaseCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <NoteImage
                    id={selectedMaterial.id}
                    src={selectedMaterial.image}
                    name={selectedMaterial.name}
                    fallbackEmoji="🌿"
                    size="xl"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold font-serif text-white uppercase">
                      {selectedMaterial.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded max-w-full break-words"
                      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                    >
                      {formatNoteCategory(selectedMaterial.category)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-amber-400 uppercase mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>ORİJİN ÜLKE:</span>
                    <span>{formatCountryNameWithCode(selectedMaterial)}</span>
                    <span className="text-slate-500">|</span>
                    <span>Üretici: {selectedMaterial.producerCompany}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Material Description */}
              {selectedMaterial.description && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {selectedMaterial.description}
                </p>
              )}

              {/* Price Graph & Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Hammadde Fiyat Grafiği & Geçmişi</span>
                    <span className="text-[10px] text-amber-400 font-mono">Piyasa Verisi</span>
                  </div>
                  <div className="pt-1">
                    <MiniChart
                      data={selectedMaterial.priceHistory}
                      basePrice={selectedMaterial.basePrice}
                      height={95}
                      width={300}
                      interactive={true}
                      showDetails={true}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Piyasa & Tedarik Göstergeleri
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Güncel Spot Fiyat:</span>
                    <span className="font-bold font-mono text-amber-300">{selectedMaterial.price.toFixed(1)} ₺</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Borsa Toplam Stoğu:</span>
                    <span className="font-mono font-semibold text-white">{selectedMaterial.exchangeStock.toLocaleString('tr-TR')} adet</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Üretim & Nakliye Süresi:</span>
                    <span className="font-semibold text-amber-400 font-mono">
                      {formatDurationToMinutesAndSeconds(selectedMaterial.shippingTime || selectedMaterial.productionTime || 240)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Parfümör İndirimi:</span>
                    <span className="font-semibold text-emerald-400">
                      {playerPerfumer.name} (Lojistik %{(playerPerfumer.logisticsBonus * 100).toFixed(0)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Calculation Panel */}
              <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-5 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4" />
                    Satın Alma Miktarı Belirle
                  </div>
                  <div className="text-xs text-slate-400">
                    Mevcut Bakiyeniz: <span className="font-mono font-bold text-amber-300">{playerCompany.cash.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>

                {/* Quantity Input & Presets */}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={selectedMaterial.exchangeStock}
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[50, 100, 200, 500].map((q) => (
                      <button
                        key={q}
                        onClick={() => setPurchaseQuantity(q)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                          purchaseQuantity === q
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        +{q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Economic Breakdown Box */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Hammadde Bedeli ({purchaseQuantity} × {selectedMaterial.price.toFixed(1)} ₺):</span>
                    <span className="font-mono">{purchaseCalc.subtotal.toLocaleString('tr-TR')} ₺</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Gümrük & KDV (%20):</span>
                    <span className="font-mono text-rose-400">+{purchaseCalc.taxAmount.toLocaleString('tr-TR')} ₺</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>
                      Uluslararası Lojistik (%15
                      {playerPerfumer.logisticsBonus !== 0 && ` -> %${(playerPerfumer.logisticsBonus * 100).toFixed(0)} ${playerPerfumer.name} İndirimi`}):
                    </span>
                    <span className="font-mono text-rose-400">+{purchaseCalc.logisticsAmount.toLocaleString('tr-TR')} ₺</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                    <span>Toplam Ödenecek Tutar:</span>
                    <span className="font-mono text-amber-300">{purchaseCalc.totalCost.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>

                {/* Waste & Shipping Notice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Fire Oranı: %{(purchaseCalc.wasteRate * 100).toFixed(1)}</span>
                      <p className="text-[11px] text-amber-200/80 mt-0.5">
                        {purchaseQuantity} adet hammaddeden {purchaseCalc.expectedWasteQuantity} fire verilecek, 
                        net <strong className="text-white font-mono">{purchaseCalc.expectedNetQuantity} adet esans</strong> depoya girecektir.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-300">
                        {formatDurationToMinutesAndSeconds(selectedMaterial.shippingTime || selectedMaterial.productionTime || 240)} Nakliye:
                      </span>
                      <p className="text-[11px] text-blue-200/80 mt-0.5">
                        Ürünler {selectedMaterial.country} menşeinden yola çıkacak, sayfa yenilense bile timer çalışmaya devam edecektir.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Vazgeç
              </button>

              <button
                onClick={handleConfirmPurchase}
                disabled={playerCompany.cash < purchaseCalc.totalCost || purchaseQuantity > selectedMaterial.exchangeStock}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                {purchaseCalc.totalCost.toLocaleString('tr-TR')} ₺ ile Satın Al & Nakliyeyi Başlat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
