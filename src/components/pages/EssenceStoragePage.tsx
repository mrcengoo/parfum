import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CountdownTimer } from '../common/CountdownTimer';
import { NoteImage } from '../common/NoteImage';
import { formatCountryNameWithCode } from '../../data/rawMaterials';
import {
  FlaskRound,
  Truck,
  Zap,
  TrendingUp,
  AlertTriangle,
  PackageCheck,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const EssenceStoragePage: React.FC = () => {
  const {
    playerCompany,
    rawMaterialsMap,
    instantCompleteShipment,
    setActiveTab
  } = useGame();

  const [searchFilter, setSearchFilter] = useState('');

  const essenceItems = Object.values(playerCompany.essenceStorage).filter((item) => item.quantity > 0);

  const filteredEssences = essenceItems.filter((item) => {
    const rawMat = rawMaterialsMap.get(item.rawMaterialId);
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      (rawMat?.name && rawMat.name.toLowerCase().includes(q)) ||
      (rawMat?.country && rawMat.country.toLowerCase().includes(q))
    );
  });

  const totalQuantity = essenceItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCostBasis = essenceItems.reduce((acc, curr) => acc + curr.totalCostBasis, 0);

  // Filter financial history for essence arrivals and fire records
  const arrivalHistory = playerCompany.financialHistory.filter(
    (record) => record.description.includes('Esans Depoya Giriş') || record.description.includes('Borsa Alımı')
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <FlaskRound className="w-4 h-4" />
            AromaLux Şirket Esans Envanteri
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Esans Deposu & Lojistik Takip
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Borsadan satın alınan hammaddeler, 3 dakikalık uluslararası nakliye ve <strong>%25 fire</strong> uygulamasının 
            ardından saflaştırılmış esans olarak bu depoya teslim edilir.
          </p>
        </div>

        {/* Quick Summary Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Toplam Esans Stoğu</div>
            <div className="text-lg font-bold font-mono text-amber-300">{totalQuantity} birim</div>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Depo Değeri (Maliyet)</div>
            <div className="text-lg font-bold font-mono text-indigo-300">{totalCostBasis.toLocaleString('tr-TR')} ₺</div>
          </div>
        </div>
      </div>

      {/* INBOUND SHIPMENTS SECTION (3 MINUTE TIMERS & 25% WASTE) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Yoldaki Nakliyeler ({playerCompany.activeShipments.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Kural: Süre bitiminde %25 fire otomatik düşülür.
          </span>
        </div>

        {playerCompany.activeShipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerCompany.activeShipments.map((shipment) => {
              const rawMat = rawMaterialsMap.get(shipment.rawMaterialId);
              const wasteUnits = Math.round(shipment.purchasedQuantity * shipment.wasteRate);

              return (
                <div
                  key={shipment.id}
                  className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <NoteImage
                          id={shipment.rawMaterialId}
                          src={rawMat?.image}
                          name={shipment.rawMaterialName}
                          fallbackEmoji="🌿"
                          size="lg"
                        />
                      </div>
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
                      title="Test amaçlı 3 dakikalık timerı hemen tamamla"
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
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-8 text-center">
            <Truck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-400">Şu anda yolda nakliye bulunmuyor.</div>
            <p className="text-xs text-slate-500 mt-1">
              Hammadde borsasından sipariş vererek esans tedariği sağlayabilirsiniz.
            </p>
            <button
              onClick={() => setActiveTab('market')}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              Hammadde Borsasını Aç <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* STORED ESSENCES INVENTORY */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FlaskRound className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Mevcut Esans Stokları ({filteredEssences.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Esans veya ülke filtrele..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {filteredEssences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEssences.map((item) => {
              const rawMat = rawMaterialsMap.get(item.rawMaterialId);
              const currentMarketPrice = rawMat?.price || item.averageUnitCost;
              const currentTotalValue = item.quantity * currentMarketPrice;
              const profitLoss = currentTotalValue - item.totalCostBasis;

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
                    <div>
                      <h4 className="text-sm font-bold text-white">{rawMat?.name || item.rawMaterialId}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        {rawMat && (
                          <span>{formatCountryNameWithCode(rawMat)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kullanılabilir Miktar:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {item.quantity} birim
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Ortalama Maliyet:</span>
                      <span className="font-mono text-slate-300">
                        {item.averageUnitCost.toFixed(1)} ₺ / birim
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Güncel Spot Fiyat:</span>
                      <span className="font-mono text-amber-300">
                        {currentMarketPrice.toFixed(1)} ₺
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800/60 flex justify-between font-semibold">
                      <span className="text-slate-400">Toplam Varlık:</span>
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
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-8 text-center">
            <FlaskRound className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-400">Esans deponuz henüz boş.</div>
            <p className="text-xs text-slate-500 mt-1">
              Parfüm üretebilmek için öncelikle Hammadde Borsasından gerekli notaları temin etmelisiniz.
            </p>
          </div>
        )}
      </div>

      {/* RECENT SHIPMENT & FIRE HISTORY */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Lojistik & Fire İşlem Geçmişi
          </h3>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto pr-1">
          {arrivalHistory.length > 0 ? (
            arrivalHistory.map((rec) => (
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

    </div>
  );
};
