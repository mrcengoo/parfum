import { RndResultLevel, Perfume, RawMaterial, ProductionCostBreakdown } from '../types';

/**
 * SABİT HEDEF KÂR SİSTEMİ (Fixed Profit Tier Engine)
 *
 * Kullanıcı kuralı:
 * Yüzdelik sabit kâr marjı (%20 gibi) şirketi her zaman suni olarak artıda tutar ve
 * hammadde borsa riskini sıfırlar.
 *
 * Bunun yerine KADEME BAZLI SABİT HEDEF KÂR uygulanır:
 * - Basit: +200 ₺ sabit kâr
 * - Sıradan: +350 ₺ sabit kâr
 * - Standart: +600 ₺ sabit kâr
 * - Kaliteli: +1.000 ₺ sabit kâr
 * - Nadir: +1.500 ₺ sabit kâr
 * - Efsanevi: +2.000 ₺ sabit kâr
 *
 * Piyasa Satış Tavanı = Baz Maliyet + Sabit Hedef Kâr
 *
 * Eğer hammadde borsada zamlanırsa, imalat maliyeti anlık olarak artar ve piyasa fiyatı
 * sabit kaldığı için şirketin kârı 600 TL'den 200 TL'ye düşer, hatta zarar bile edebilir!
 */

export const TIER_FIXED_PROFIT: Record<RndResultLevel, number> = {
  Basit: 200,      // Basit formül hedef kârı
  Sıradan: 350,    // Sıradan formül hedef kârı
  Standart: 600,   // Standart formül hedef kârı
  Kaliteli: 1000,  // Kaliteli formül hedef kârı
  Nadir: 1500,     // Nadir formül hedef kârı
  Efsanevi: 2000   // Efsanevi/Niche formül hedef kârı
};

export const TIER_BADGE_COLORS: Record<RndResultLevel, { bg: string; text: string; border: string }> = {
  Basit: { bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' },
  Sıradan: { bg: 'bg-zinc-800/80', text: 'text-zinc-300', border: 'border-zinc-700' },
  Standart: { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-700/60' },
  Kaliteli: { bg: 'bg-cyan-950/80', text: 'text-cyan-300', border: 'border-cyan-600/60' },
  Nadir: { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-600/60' },
  Efsanevi: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-600/60' }
};

/**
 * Parfümün kalite seviyesine göre hedeflenen sabit kârı döner.
 */
export function getTierTargetProfit(level?: RndResultLevel): number {
  if (!level || !TIER_FIXED_PROFIT[level]) {
    return TIER_FIXED_PROFIT.Standart; // Varsayılan 600 TL
  }
  return TIER_FIXED_PROFIT[level];
}

/**
 * Parfümün güncel borsa hammadde spot fiyatlarına göre canlı şişe başı imalat maliyetini hesaplar.
 * Hammadde fiyatları borsada değiştikçe bu değer anlık olarak güncellenir.
 */
export function calculateLivePerfumeUnitCost(
  perfume: Perfume,
  rawMaterialsMap: Map<string, RawMaterial>
): number {
  if (!perfume.recipe || perfume.recipe.length === 0) {
    return Math.max(120, perfume.suggestedRetailPrice - getTierTargetProfit(perfume.resultLevel));
  }

  let batchMatCost = 0;
  perfume.recipe.forEach((item) => {
    const rawMat = rawMaterialsMap.get(item.rawMaterialId);
    const unitPrice = rawMat?.price || 120;
    const requiredUnits = Math.max(1, Math.round(item.amount / 10));
    batchMatCost += requiredUnits * unitPrice;
  });

  // Şişeleme ve laboratuvar işçilik gideri (100 şişelik baz için 4.500 ₺ -> şişe başı 45 ₺)
  const factoryLaborAndPackaging = 4500;
  const liveCost = Math.round((batchMatCost + factoryLaborAndPackaging) / 100);

  return Math.max(80, liveCost);
}

/**
 * Parfümün anlık borsa fiyatlarıyla detaylı maliyet bileşenlerini hesaplar.
 */
export function calculateLiveCostBreakdown(
  perfume: Perfume,
  rawMaterialsMap: Map<string, RawMaterial>
): ProductionCostBreakdown {
  let spotRawCost = 0;
  let taxCost = 0;
  let logisticsCost = 0;
  let wasteCost = 0;

  perfume.recipe.forEach((item) => {
    const rawMat = rawMaterialsMap.get(item.rawMaterialId);
    const price = rawMat?.price || 120;
    const units = Math.max(1, Math.round(item.amount / 10));
    const subtotal = units * price * 10; // 100 şişe için

    spotRawCost += subtotal;
    taxCost += subtotal * (rawMat?.taxRate || 0.20);
    logisticsCost += subtotal * (rawMat?.logisticsRate || 0.15);
    wasteCost += subtotal * (rawMat?.wasteRate || 0.25);
  });

  const factoryLaborCost = 3500;
  const packagingCost = 1000;
  const totalCost = spotRawCost + factoryLaborCost + packagingCost;
  const unitCost = Math.round(totalCost / 100);

  return {
    rawMaterialCost: Math.round(spotRawCost),
    taxCost: Math.round(taxCost),
    logisticsCost: Math.round(logisticsCost),
    wasteCost: Math.round(wasteCost),
    essenceProductionCost: packagingCost,
    factoryLaborCost: factoryLaborCost,
    totalCost: Math.round(totalCost),
    unitCost: Math.max(80, unitCost)
  };
}

export interface RealizedProfitAnalysis {
  salePrice: number;
  unitCost: number;
  targetProfit: number;
  realizedProfit: number;
  profitDifference: number; // realizedProfit - targetProfit (Negatifse hammadde kârı eritti)
  profitMarginPct: number; // Anlık Kâr Payı % (Örn: %54.2)
  targetProfitMarginPct: number; // Hedef Kâr Payı % (Örn: %65.0)
  profitMarginDeltaPct: number; // Kâr Payı Yüzde Değişimi (Örn: -10.8 puan erime)
  status: 'target_met' | 'profit_eroded' | 'loss' | 'bonus_profit';
  statusLabel: string;
  statusColor: string;
  explanation: string;
}

/**
 * Şişe başı gerçekleşen kâr ve hammadde maliyeti etkisini hesaplar.
 */
export function analyzeRealizedProfit(
  salePrice: number,
  unitCost: number,
  level?: RndResultLevel
): RealizedProfitAnalysis {
  const targetProfit = getTierTargetProfit(level);
  const realizedProfit = Math.round((salePrice - unitCost) * 100) / 100;
  const profitDifference = Math.round((realizedProfit - targetProfit) * 100) / 100;

  // Kâr Payı Yüzdeleri
  const profitMarginPct = salePrice > 0 ? Math.round((realizedProfit / salePrice) * 1000) / 10 : 0;
  const targetProfitMarginPct = salePrice > 0 ? Math.round((targetProfit / salePrice) * 1000) / 10 : 0;
  const profitMarginDeltaPct = Math.round((profitMarginPct - targetProfitMarginPct) * 10) / 10;

  if (realizedProfit < 0) {
    return {
      salePrice,
      unitCost,
      targetProfit,
      realizedProfit,
      profitDifference,
      profitMarginPct,
      targetProfitMarginPct,
      profitMarginDeltaPct,
      status: 'loss',
      statusLabel: 'ZARAR',
      statusColor: 'text-red-400',
      explanation: `Hammadde maliyeti (${unitCost} ₺) satış fiyatını aştı! Kâr marjı %${profitMarginPct} seviyesinde (${profitMarginDeltaPct} puan düşüş). Şişe başı ${Math.abs(realizedProfit)} ₺ zarar yazıyor.`
    };
  }

  if (profitDifference < -15) {
    return {
      salePrice,
      unitCost,
      targetProfit,
      realizedProfit,
      profitDifference,
      profitMarginPct,
      targetProfitMarginPct,
      profitMarginDeltaPct,
      status: 'profit_eroded',
      statusLabel: 'KÂR ERİDİ',
      statusColor: 'text-amber-400',
      explanation: `Hammadde zamları kâr marjını %${targetProfitMarginPct}'den %${profitMarginPct}'ye düşürdü (${Math.abs(profitMarginDeltaPct)} puan erime)! Hedeflenen ${targetProfit} ₺ yerine +${realizedProfit} ₺ kâr kalıyor.`
    };
  }

  if (profitDifference > 25) {
    return {
      salePrice,
      unitCost,
      targetProfit,
      realizedProfit,
      profitDifference,
      profitMarginPct,
      targetProfitMarginPct,
      profitMarginDeltaPct,
      status: 'bonus_profit',
      statusLabel: 'YÜKSEK KÂR',
      statusColor: 'text-emerald-300',
      explanation: `Hammadde borsadan ucuza temin edildi! Kâr marjı %${targetProfitMarginPct}'den %${profitMarginPct}'ye yükseldi (+${profitMarginDeltaPct} puan artış, +${realizedProfit} ₺ kâr).`
    };
  }

  return {
    salePrice,
    unitCost,
    targetProfit,
    realizedProfit,
    profitDifference,
    profitMarginPct,
    targetProfitMarginPct,
    profitMarginDeltaPct,
    status: 'target_met',
    statusLabel: 'HEDEF KÂRDA',
    statusColor: 'text-emerald-400',
    explanation: `Kademeye ait +${targetProfit} ₺ sabit kâr ve %${profitMarginPct} kâr marjı başarıyla yakalandı.`
  };
}
