import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { MarketOrder } from '../../types';
import {
  ClipboardList,
  Globe2,
  CheckCircle2,
  Clock,
  Coins,
  Package,
  ArrowRight,
  Sparkles,
  Sliders,
  DollarSign,
  Award
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, playerCompany, playerPerfumer, perfumesMap, sellToOrder, setActiveTab } = useGame();

  const [selectedOrder, setSelectedOrder] = useState<MarketOrder | null>(null);
  const [sellAmount, setSellAmount] = useState<number>(0);

  const activeOrders = orders.filter((o) => o.status === 'active');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const handleOpenFulfill = (order: MarketOrder) => {
    const inStock = playerCompany.productStorage[order.productId]?.quantity || 0;
    const maxSellable = Math.min(inStock, order.remainingQuantity);
    setSelectedOrder(order);
    setSellAmount(maxSellable);
  };

  const handleConfirmSale = () => {
    if (!selectedOrder || sellAmount <= 0) return;
    sellToOrder(selectedOrder.id, sellAmount);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" />
            Global İhracat & Sipariş Borsası
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Uluslararası Sipariş Havuzu
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Dünyanın önde gelen lüks perakende zincirlerinden gelen toptan parfüm talepleri. 
            Elinizdeki mevcut stok kadar <strong>kısmi teslimat</strong> yapabilir; 
            <strong> {playerPerfumer.name}</strong> ihracat bonusu (+%{(playerPerfumer.exportBonus * 100).toFixed(0)}) ile ek ciro kazanabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Aktif Sözleşmeler:</span>{' '}
            <span className="font-bold text-emerald-400 font-mono text-sm">{activeOrders.length}</span>
          </div>
        </div>
      </div>

      {/* ACTIVE ORDERS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            Açık Siparişler ({activeOrders.length})
          </h3>
        </div>

        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOrders.map((order) => {
              const inStock = playerCompany.productStorage[order.productId]?.quantity || 0;
              const perfume = perfumesMap.get(order.productId);
              const canFulfill = inStock > 0;
              const maxFulfillable = Math.min(inStock, order.remainingQuantity);
              const progressPct = ((order.requestedQuantity - order.remainingQuantity) / order.requestedQuantity) * 100;
              const isRnd = perfume?.sourceType === 'AR-GE';

              return (
                <div
                  key={order.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Top: Country Flag & Client */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl p-1 rounded-xl bg-slate-950 border border-slate-800">{order.countryFlag}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{order.clientName}</h4>
                          <div className="text-[11px] text-slate-400">{order.country}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {perfume && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono">
                            {perfume.gender}
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Aktif
                        </span>
                      </div>
                    </div>

                    {/* Product & Unit Price */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-xs font-bold text-white block">{order.productName}</span>
                          {perfume && (
                            <span className="text-[10px] text-purple-300 font-semibold">
                              {isRnd ? `${perfume.companyName || 'AromaLux'} × ${perfume.perfumerName || 'Mert Aksoy'}` : perfume.brand}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {order.pricePerUnit} ₺ <span className="text-[10px] text-slate-400 font-normal">/ şişe</span>
                        </span>
                      </div>

                      {/* Quantity & Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Kalan Talep:</span>
                          <span className="font-mono font-bold text-slate-200">
                            {order.remainingQuantity} / {order.requestedQuantity} şişe
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stock Status Indicator */}
                    <div className="mt-3 text-xs flex justify-between items-center px-1">
                      <span className="text-slate-400">Deponuzdaki Stok:</span>
                      <span className={`font-mono font-bold ${inStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {inStock} adet {inStock === 0 && '(Eksik)'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    {canFulfill ? (
                      <button
                        onClick={() => handleOpenFulfill(order)}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Coins className="w-4 h-4" />
                        Siparişi Karşıla ({maxFulfillable} adet sat)
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('production')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Üretim Başlat
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
            <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-400">Açık sipariş kalmadı.</div>
            <p className="text-xs text-slate-500 mt-1">
              Piyasa döngüsünde birkaç saniye içinde yeni uluslararası talepler havuzda listelenecektir.
            </p>
          </div>
        )}
      </div>

      {/* COMPLETED ORDERS SECTION */}
      {completedOrders.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Tamamlanan Sözleşmeler ({completedOrders.length})
          </h3>

          <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto">
            {completedOrders.map((order) => (
              <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span>{order.countryFlag}</span>
                  <div>
                    <span className="font-bold text-white">{order.productName}</span>
                    <span className="text-slate-400 ml-2">({order.requestedQuantity} adet teslim edildi - {order.clientName})</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  +{(order.requestedQuantity * order.pricePerUnit).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULFILLMENT SLIDER MODAL WITH PERFUMER BONUS & ROYALTY PREVIEW */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedOrder.countryFlag}</span>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedOrder.productName}</h3>
                  <div className="text-xs text-slate-400">{selectedOrder.clientName}</div>
                </div>
              </div>
              <span className="font-mono font-bold text-amber-300">
                {selectedOrder.pricePerUnit} ₺ / adet
              </span>
            </div>

            {/* Quantity Slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Teslim Edilecek Miktar:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{sellAmount} adet</span>
              </div>

              <input
                type="range"
                min="1"
                max={Math.min(
                  playerCompany.productStorage[selectedOrder.productId]?.quantity || 1,
                  selectedOrder.remainingQuantity
                )}
                value={sellAmount}
                onChange={(e) => setSellAmount(parseInt(e.target.value) || 1)}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1 adet</span>
                <span>Max: {Math.min(playerCompany.productStorage[selectedOrder.productId]?.quantity || 1, selectedOrder.remainingQuantity)} adet</span>
              </div>
            </div>

            {/* Financial calculation with export bonus & royalty preview */}
            {(() => {
              const baseRev = sellAmount * selectedOrder.pricePerUnit;
              const exportBonusRev = baseRev * (1 + playerPerfumer.exportBonus);
              const perfume = perfumesMap.get(selectedOrder.productId);
              const royaltyRate = perfume?.royaltyRate || 0;
              const royalty = Math.round(exportBonusRev * royaltyRate * 100) / 100;
              const netRev = Math.round((exportBonusRev - royalty) * 100) / 100;

              return (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Brüt Satış Geliri:</span>
                    <span className="font-mono font-bold text-white">
                      +{exportBonusRev.toLocaleString('tr-TR')} ₺
                      {playerPerfumer.exportBonus > 0 && (
                        <span className="text-indigo-400 text-[10px] ml-1 font-normal">
                          (+%{(playerPerfumer.exportBonus * 100).toFixed(0)} {playerPerfumer.name} Bonusu)
                        </span>
                      )}
                    </span>
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
                    <span className="font-mono">
                      +{netRev.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                    <span>Kalan Sipariş Talebi:</span>
                    <span className="font-mono text-slate-200">
                      {selectedOrder.remainingQuantity - sellAmount} adet
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmSale}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              >
                Satışı Onayla
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
