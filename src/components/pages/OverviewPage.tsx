import React from 'react';
import { useGame } from '../../context/GameContext';
import { CountdownTimer } from '../common/CountdownTimer';
import { MiniChart } from '../common/MiniChart';
import { CountryFlag } from '../common/CountryFlag';
import { formatCountryNameWithCode } from '../../data/rawMaterials';
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
  CheckCircle2
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const {
    playerCompany,
    rawMaterials,
    perfumes,
    orders,
    setActiveTab,
    instantCompleteShipment,
    instantCompleteProduction,
    sellToOrder
  } = useGame();

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

  const totalNetWorth = Math.round(playerCompany.cash + totalEssenceValue + totalProductValue);

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
            Başlangıç: 500.000 ₺
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
                    <CountryFlag
                      countryCode={item.countryCode}
                      country={item.country}
                      fallbackEmoji={item.flag}
                      size="md"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <CountryFlag
                          countryCode={item.countryCode}
                          country={item.country}
                          fallbackEmoji={item.flag}
                          size="xs"
                        />
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
                        <div className="text-xs font-bold text-white">{order.productName}</div>
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
