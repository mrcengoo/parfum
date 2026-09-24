import { RawMaterial, ActiveShipment, Company, FinancialRecord, MarketOrder, Perfume, Perfumer } from '../types';

export const TAX_RATE = 0.20; // %20 Vergi
export const LOGISTICS_RATE = 0.15; // %15 Lojistik
export const WASTE_RATE = 0.25; // %25 Fire

export interface PurchaseCalculation {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  logisticsAmount: number;
  totalCost: number;
  wasteRate: number;
  expectedWasteQuantity: number;
  expectedNetQuantity: number;
}

export function calculatePurchase(
  quantity: number,
  unitPrice: number,
  perfumer?: Perfumer,
  baseWasteRate: number = WASTE_RATE
): PurchaseCalculation {
  const subtotal = Math.round(quantity * unitPrice * 100) / 100;
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;

  // Lojistik bonusu: örneğin -%3 = lojistik maliyetinin %3 azaltılması
  const logisticsMultiplier = perfumer ? Math.max(0.5, 1 + perfumer.logisticsBonus) : 1;
  const logisticsAmount = Math.round(subtotal * LOGISTICS_RATE * logisticsMultiplier * 100) / 100;

  const totalCost = Math.round((subtotal + taxAmount + logisticsAmount) * 100) / 100;

  // Fire bonusu: fire oranının mutlak değil, oransal olarak %3 azaltılması
  const wasteMultiplier = perfumer ? Math.max(0.5, 1 + perfumer.wasteBonus) : 1;
  const effectiveWasteRate = baseWasteRate * wasteMultiplier;

  const expectedWasteQuantity = Math.round(quantity * effectiveWasteRate);
  const expectedNetQuantity = quantity - expectedWasteQuantity;

  return {
    quantity,
    unitPrice,
    subtotal,
    taxAmount,
    logisticsAmount,
    totalCost,
    wasteRate: effectiveWasteRate,
    expectedWasteQuantity,
    expectedNetQuantity
  };
}

/**
 * Creates an active shipment with individual material shipping time and perfumer bonuses.
 */
export function createShipment(
  companyId: string,
  material: RawMaterial,
  quantity: number,
  perfumer?: Perfumer
): { shipment: ActiveShipment; financialRecord: FinancialRecord } {
  const calc = calculatePurchase(quantity, material.price, perfumer, material.wasteRate || WASTE_RATE);
  const now = Date.now();
  // Individual raw material shipping/production time
  const duration = material.shippingTime || material.productionTime || 240;
  const endTime = now + duration * 1000;

  const shipment: ActiveShipment = {
    id: `ship_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    rawMaterialId: material.id,
    rawMaterialName: material.name,
    purchasedQuantity: quantity,
    unitPrice: material.price,
    subtotal: calc.subtotal,
    taxAmount: calc.taxAmount,
    logisticsAmount: calc.logisticsAmount,
    totalCost: calc.totalCost,
    wasteRate: calc.wasteRate,
    expectedNetQuantity: calc.expectedNetQuantity,
    startTime: now,
    endTime: endTime,
    duration: duration,
    status: 'shipping'
  };

  const perfumerBonusText = perfumer
    ? ` [Parfümör ${perfumer.name}: Lojistik %${(perfumer.logisticsBonus * 100).toFixed(0)}, Fire %${(perfumer.wasteBonus * 100).toFixed(0)}]`
    : '';

  const financialRecord: FinancialRecord = {
    id: `fin_buy_${Date.now()}`,
    timestamp: now,
    type: 'expense',
    category: 'raw_material_purchase',
    amount: calc.totalCost,
    description: `Borsa Alımı: ${quantity} adet ${material.name} (Mal: ${calc.subtotal.toLocaleString('tr-TR')} TL + KDV %20: ${calc.taxAmount.toLocaleString('tr-TR')} TL + Lojistik: ${calc.logisticsAmount.toLocaleString('tr-TR')} TL)${perfumerBonusText}`,
    relatedEntityId: shipment.id,
    cashAfter: 0
  };

  return { shipment, financialRecord };
}

/**
 * Realistic price ticker with Supply, Demand & micro noise + mean reversion.
 */
export function tickMarketPrices(materials: RawMaterial[]): RawMaterial[] {
  const now = Date.now();
  return materials.map((item) => {
    const pressure = (item.demand - item.supply) / 100;
    const pressureComponent = item.price * (pressure * 0.012);
    const randomShift = (Math.random() - 0.49) * 0.024 * item.price;
    const meanPull = (item.basePrice - item.price) * 0.04;

    const delta = pressureComponent + randomShift + meanPull;
    let newPrice = Math.round((item.price + delta) * 10) / 10;

    const minP = Math.max(10, Math.round(item.basePrice * 0.35));
    const maxP = Math.round(item.basePrice * 2.6);
    newPrice = Math.min(maxP, Math.max(minP, newPrice));

    const newSupply = Math.min(95, Math.max(15, Math.round(item.supply + (Math.random() - 0.5) * 4)));
    const newDemand = Math.min(95, Math.max(20, Math.round(item.demand + (Math.random() - 0.5) * 4)));
    const stockChange = Math.round((Math.random() - 0.48) * 15);
    const newStock = Math.max(100, item.exchangeStock + stockChange);

    const updatedHistory = [
      ...item.priceHistory.slice(-24),
      { timestamp: now, price: newPrice }
    ];

    return {
      ...item,
      price: newPrice,
      supply: newSupply,
      demand: newDemand,
      exchangeStock: newStock,
      priceHistory: updatedHistory
    };
  });
}

/**
 * Generate dynamic random orders.
 */
export function generateRandomOrder(perfumes: Perfume[]): MarketOrder {
  const countries = [
    { country: 'ABD (Los Angeles)', flag: '🇺🇸', client: 'Rodeo Drive Beverly Hills Scent Club' },
    { country: 'Fransa (Cannes)', flag: '🇫🇷', client: 'Riviera Grand Parfumerie' },
    { country: 'İtalya (Milano)', flag: '🇮🇹', client: 'Via Montenapoleone Luxury Hub' },
    { country: 'İsviçre (Cenevre)', flag: '🇨🇭', client: 'Lake Geneva Duty Free Consortium' },
    { country: 'Japonya (Osaka)', flag: '🇯🇵', client: 'Umeda Department Perfume Gallery' },
    { country: 'Singapur', flag: '🇸🇬', client: 'Marina Bay Sands Boutique' },
    { country: 'Katar (Doha)', flag: '🇶🇦', client: 'The Pearl Qatar Royal Fragrances' },
    { country: 'Türkiye (İstanbul)', flag: '🇹🇷', client: 'Nişantaşı Niş Parfümeri Derneği' }
  ];

  const randomTarget = countries[Math.floor(Math.random() * countries.length)];
  const perfume = perfumes[Math.floor(Math.random() * perfumes.length)];
  const quantity = Math.floor(Math.random() * 4 + 1) * 50;
  const pricePremium = Math.round((perfume.suggestedRetailPrice || 350) * (1 + (Math.random() * 0.25 - 0.05)));

  return {
    id: `ord_dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    country: randomTarget.country,
    countryFlag: randomTarget.flag,
    clientName: randomTarget.client,
    productId: perfume.id,
    productName: perfume.name,
    requestedQuantity: quantity,
    remainingQuantity: quantity,
    pricePerUnit: pricePremium,
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000 * 3,
    status: 'active'
  };
}
