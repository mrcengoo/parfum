import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfume, ProductInventoryItem } from '../../types';
import {
  Package,
  Sparkles,
  HelpCircle,
  TrendingUp,
  X,
  Factory,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  DollarSign,
  Award,
  Coins
} from 'lucide-react';

export const ProductStoragePage: React.FC = () => {
  const { playerCompany, perfumesMap, rawMaterialsMap, setActiveTab } = useGame();
  const [inspectPerfume, setInspectPerfume] = useState<{
    perfume: Perfume;
    item: ProductInventoryItem;
  } | null>(null);

  const inventoryEntries = Object.entries(playerCompany.productStorage).filter(
    ([_, item]) => item.quantity > 0 || (item.totalSold && item.totalSold > 0)
  );

  const totalFinishedBottles = Object.values(playerCompany.productStorage).reduce(
    (acc, curr) => acc + (curr.quantity || 0),
    0
  );

  const totalStorageValuation = Object.values(playerCompany.productStorage).reduce(
    (acc, curr) => acc + (curr.totalCostBasis || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            AromaLux Mamul Deposu
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Ürün Deposu (Bitmiş Parfümler)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Laboratuvarda üretimi tamamlanan parfümler burada stoklanır. Uluslararası ihracat siparişlerine 
            doğrudan bu depodan satış yapılır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Mevcut Şişe Stoğu</div>
            <div className="text-lg font-bold font-mono text-indigo-300">{totalFinishedBottles} adet</div>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Depo Değeri (Maliyet)</div>
            <div className="text-lg font-bold font-mono text-amber-300">{totalStorageValuation.toLocaleString('tr-TR')} ₺</div>
          </div>
        </div>
      </div>

      {/* PRODUCTS INVENTORY GRID */}
      {inventoryEntries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {inventoryEntries.map(([perfumeId, item]) => {
            const perfume = perfumesMap.get(perfumeId);
            if (!perfume) return null;

            const isRnd = perfume.sourceType === 'AR-GE';
            const salePrice = item.suggestedSalePrice || perfume.suggestedRetailPrice;
            const estimatedProfit = Math.round((salePrice - item.unitCost) * 100) / 100;
            const profitMarginPct = salePrice > 0 ? (estimatedProfit / salePrice) * 100 : 0;

            return (
              <div
                key={perfumeId}
                onClick={() => setInspectPerfume({ perfume, item })}
                className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl hover:shadow-amber-500/5 cursor-pointer transition-all duration-200 flex flex-col justify-between"
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
                      {/* Orijinal / AR-GE */}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur-sm border ${
                          isRnd
                            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                            : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {perfume.sourceType}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 shadow-md">
                        {item.quantity} Şişe
                      </span>
                    </div>
                  </div>

                  {/* Perfume Identity */}
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {perfume.name}
                  </h3>

                  {/* Şirket × Parfümör */}
                  <div className="text-xs font-semibold text-amber-400 mt-0.5">
                    {isRnd ? (
                      <span className="text-purple-300 font-bold">
                        {perfume.companyName || 'AromaLux'} × {perfume.perfumerName || 'Mert Aksoy'}
                      </span>
                    ) : (
                      <span>{perfume.brand} • {perfume.companyName || 'AromaLux'}</span>
                    )}
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Birim Maliyet:</span>
                    <span className="font-mono font-bold text-slate-200">{item.unitCost} ₺</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Piyasa Satış Fiyatı:</span>
                    <span className="font-mono font-bold text-amber-300">{salePrice} ₺</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Tahmini Birim Kâr:</span>
                    <span className="font-mono font-bold text-emerald-400">+{estimatedProfit} ₺</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Kâr Marjı:</span>
                    <span className="font-mono font-bold text-emerald-300">%{profitMarginPct.toFixed(1)}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectPerfume({ perfume, item });
                    }}
                    className="w-full mt-2 py-2 bg-slate-800 group-hover:bg-amber-500 text-slate-300 group-hover:text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Parfüm Oyun Kartını Aç
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Ürün deponuzda henüz parfüm bulunmuyor.</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Hammadde Borsasından esansları tamamlayıp Üretim Laboratuvarında 1 ile 100 adet arası üretim başlatabilirsiniz.
          </p>
          <button
            onClick={() => setActiveTab('production')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
          >
            <Factory className="w-4 h-4" />
            Üretim Laboratuvarına Git
          </button>
        </div>
      )}

      {/* COMPREHENSIVE PARFÜM OYUN KARTI (SECTION 12 & 15) */}
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
                    {inspectPerfume.perfume.companyName || 'AromaLux'} × {inspectPerfume.perfume.perfumerName || 'Mert Aksoy'}
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

              {/* DETAILED COST BREAKDOWN */}
              <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-5 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Maliyet Analizi: "Bu Ürün Bana Neden Bu Kadar Pahalıya Mal Oldu?"
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Parti Bazında</span>
                </div>

                <div className="divide-y divide-slate-800 text-xs space-y-2 pt-1">
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>1. Spot Hammadde Bedeli:</span>
                    <span className="font-mono text-white font-semibold">
                      {inspectPerfume.item.lastCostBreakdown?.rawMaterialCost.toLocaleString('tr-TR') || '24.500'} ₺
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-400">
                    <span>2. Gümrük & İthalat Vergisi (%20):</span>
                    <span className="font-mono text-rose-400">
                      +{inspectPerfume.item.lastCostBreakdown?.taxCost.toLocaleString('tr-TR') || '4.900'} ₺
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-400">
                    <span>3. Uluslararası Lojistik & Sigorta (%15):</span>
                    <span className="font-mono text-rose-400">
                      +{inspectPerfume.item.lastCostBreakdown?.logisticsCost.toLocaleString('tr-TR') || '3.675'} ₺
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-400">
                    <span>4. Nakliye Sırasındaki Fire Maliyeti:</span>
                    <span className="font-mono text-amber-400">
                      +{inspectPerfume.item.lastCostBreakdown?.wasteCost.toLocaleString('tr-TR') || '8.167'} ₺
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-400">
                    <span>5. Esans Saflaştırma & Maserasyon Payı (%8):</span>
                    <span className="font-mono text-indigo-300">
                      +{inspectPerfume.item.lastCostBreakdown?.essenceProductionCost.toLocaleString('tr-TR') || '1.960'} ₺
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-400">
                    <span>6. Şişeleme, Kapak, Kutu & İşçilik (Laboratuvar):</span>
                    <span className="font-mono text-indigo-300">
                      +{inspectPerfume.item.lastCostBreakdown?.factoryLaborCost.toLocaleString('tr-TR') || '4.500'} ₺
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between font-bold text-sm text-white">
                    <span>Toplam Üretim Maliyeti:</span>
                    <span className="font-mono text-amber-300">
                      {inspectPerfume.item.lastCostBreakdown?.totalCost.toLocaleString('tr-TR') || '47.702'} ₺
                    </span>
                  </div>

                  <div className="pt-1 flex justify-between font-bold text-sm text-emerald-400">
                    <span>Şişe Başına Net Birim Maliyet:</span>
                    <span className="font-mono">
                      {inspectPerfume.item.unitCost} ₺ / şişe
                    </span>
                  </div>
                </div>
              </div>

              {/* Commercial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Satış Fiyatı</div>
                  <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                    {inspectPerfume.item.suggestedSalePrice || inspectPerfume.perfume.suggestedRetailPrice} ₺
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Birim Maliyet</div>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                    {inspectPerfume.item.unitCost} ₺
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Birim Kâr</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    +{Math.round(((inspectPerfume.item.suggestedSalePrice || inspectPerfume.perfume.suggestedRetailPrice) - inspectPerfume.item.unitCost) * 10) / 10} ₺
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Toplam Satılan</div>
                  <div className="text-base font-bold font-mono text-indigo-300 mt-0.5">
                    {inspectPerfume.item.totalSold || 0} adet
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => setInspectPerfume(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Kapat
              </button>

              <button
                onClick={() => {
                  setInspectPerfume(null);
                  setActiveTab('orders');
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                Sipariş Havuzuna Satış Yap
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
