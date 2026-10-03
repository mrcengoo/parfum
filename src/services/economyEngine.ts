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
 * Generate dynamic random orders (Single, 3-Variety Collection, or 5-Variety Consortium).
 * Intelligently prioritizes perfumes that are actually stocked in player or bot warehouses
 * so products never get stuck unsold!
 */
/**
 * Generate dynamic random orders (Single, 3-Variety Collection, or 5-Variety Consortium).
 * Balanced across ALL sector companies (player & competitors) so inventory flows smoothly.
 */
export function generateRandomOrder(perfumes: Perfume[], companies: Company[] = []): MarketOrder {
  const countries = [
    { country: 'ABD (Los Angeles)', flag: '🇺🇸', client: 'Rodeo Drive Beverly Hills Scent Club' },
    { country: 'Fransa (Cannes)', flag: '🇫🇷', client: 'Riviera Grand Parfumerie' },
    { country: 'İtalya (Milano)', flag: '🇮🇹', client: 'Via Montenapoleone Luxury Hub' },
    { country: 'İsviçre (Cenevre)', flag: '🇨🇭', client: 'Lake Geneva Duty Free Consortium' },
    { country: 'Japonya (Osaka)', flag: '🇯🇵', client: 'Umeda Department Perfume Gallery' },
    { country: 'Singapur', flag: '🇸🇬', client: 'Marina Bay Sands Boutique' },
    { country: 'Katar (Doha)', flag: '🇶🇦', client: 'The Pearl Qatar Royal Fragrances' },
    { country: 'Türkiye (İstanbul)', flag: '🇹🇷', client: 'Nişantaşı Niş Parfümeri Derneği' },
    { country: 'Birleşik Krallık (Londra)', flag: '🇬🇧', client: 'Mayfair Prestige Fragrance Club' },
    { country: 'Monako (Monte Carlo)', flag: '🇲🇨', client: 'Casino Square Luxury Salon' },
    { country: 'Almanya (Berlin)', flag: '🇩🇪', client: 'KaDeWe Luxury Beauty Department' },
    { country: 'BAE (Abu Dabi)', flag: '🇦🇪', client: 'Emirates Palace Royal Ateliers' }
  ];

  const randomTarget = countries[Math.floor(Math.random() * countries.length)];
  const roll = Math.random();

  let orderType: 'single' | 'bundle_3' | 'bundle_5' = 'single';
  let varietyCount = 1;
  let categoryName = 'Tekli Prestij Siparişi';

  if (roll < 0.25 && perfumes.length >= 5) {
    orderType = 'bundle_5';
    varietyCount = 5;
    categoryName = "5'li Mega Departman Konsorsiyumu";
  } else if (roll < 0.60 && perfumes.length >= 3) {
    orderType = 'bundle_3';
    varietyCount = 3;
    categoryName = "3'lü Butik Seçki Koleksiyonu";
  }

  // Target selection: pick from stocked perfumes across companies, or catalogue
  const inStockPerfumeIds = new Set<string>();
  companies.forEach((comp) => {
    Object.values(comp.productStorage || {}).forEach((item) => {
      if (item && item.quantity > 0) {
        inStockPerfumeIds.add(item.perfumeId);
      }
    });
  });

  const inStockPerfumes = perfumes.filter((p) => inStockPerfumeIds.has(p.id));
  const otherPerfumes = perfumes.filter((p) => !inStockPerfumeIds.has(p.id));

  // Blend in-stock perfumes (70% weight) with catalogue (30% weight)
  const blendedPool: Perfume[] = [];
  if (inStockPerfumes.length > 0) {
    for (let i = 0; i < 3; i++) {
      blendedPool.push(...inStockPerfumes);
    }
  }
  blendedPool.push(...otherPerfumes);
  if (blendedPool.length === 0) {
    blendedPool.push(...perfumes);
  }

  // Shuffle and pick varietyCount unique perfumes
  const shuffled = [...blendedPool].sort(() => Math.random() - 0.5);
  const selectedPerfumes: Perfume[] = [];
  for (const perf of shuffled) {
    if (!selectedPerfumes.some((sp) => sp.id === perf.id)) {
      selectedPerfumes.push(perf);
    }
    if (selectedPerfumes.length >= varietyCount) break;
  }

  if (selectedPerfumes.length === 0 && perfumes.length > 0) {
    selectedPerfumes.push(perfumes[0]);
  }

  // Dynamic realistic expiration: 2.5 - 4.5 minutes so market never stagnates
  const durationMs = Math.floor(Math.random() * 120000) + 150000; // 150s - 270s
  const expiresAt = Date.now() + durationMs;

  if (varietyCount === 1 || selectedPerfumes.length <= 1) {
    const perfume = selectedPerfumes[0] || perfumes[0];
    const safeId = perfume?.id || 'pending_rnd';
    const safeName = perfume?.name || 'Özgün AR-GE Tasarımı';
    const safeRetail = perfume?.suggestedRetailPrice || 950;
    const quantity = Math.floor(Math.random() * 4 + 2) * 15; // 30 - 75 bottles (attainable, rapid velocity)
    const pricePremium = Math.round(safeRetail * (1 + (Math.random() * 0.20 - 0.02)));

    return {
      id: `ord_dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      country: randomTarget.country,
      countryFlag: randomTarget.flag,
      clientName: randomTarget.client,
      orderType: 'single',
      orderCategory: categoryName,
      productId: safeId,
      productName: safeName,
      requestedQuantity: quantity,
      remainingQuantity: quantity,
      pricePerUnit: pricePremium,
      totalOrderValue: quantity * pricePremium,
      createdAt: Date.now(),
      expiresAt,
      status: 'active'
    };
  }

  // Multi-variety bundle items
  const items = selectedPerfumes.map((p) => {
    const itemQty = Math.floor(Math.random() * 3 + 1) * 15 + 10; // 25, 40, 55 bottles
    const pricePremium = Math.round((p.suggestedRetailPrice || 350) * (1 + (Math.random() * 0.22 - 0.01)));
    return {
      productId: p.id,
      productName: p.name,
      requestedQuantity: itemQty,
      remainingQuantity: itemQty,
      pricePerUnit: pricePremium
    };
  });

  const totalQty = items.reduce((acc, curr) => acc + curr.requestedQuantity, 0);
  const totalValue = items.reduce((acc, curr) => acc + (curr.requestedQuantity * curr.pricePerUnit), 0);
  const avgPrice = Math.round(totalValue / totalQty);

  return {
    id: `ord_dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    country: randomTarget.country,
    countryFlag: randomTarget.flag,
    clientName: randomTarget.client,
    orderType,
    orderCategory: categoryName,
    productId: selectedPerfumes[0].id,
    productName: `${randomTarget.client} (${varietyCount} Çeşit)`,
    requestedQuantity: totalQty,
    remainingQuantity: totalQty,
    pricePerUnit: avgPrice,
    totalOrderValue: totalValue,
    items,
    createdAt: Date.now(),
    expiresAt,
    status: 'active'
  };
}

/**
 * Automatically cleans up stale/expired orders, maintains fresh order turnover,
 * and ensures no system-wide bottleneck ever occurs.
 */
export function pruneAndRefreshOrders(
  orders: MarketOrder[],
  perfumes: Perfume[],
  companies: Company[]
): MarketOrder[] {
  // If no perfumes have been invented/solved yet (scratch start), keep order book empty until first invention
  if (!perfumes || perfumes.length === 0) {
    return [];
  }

  const validPerfumeIds = new Set(perfumes.map((p) => p.id));
  const now = Date.now();

  // Filter out any legacy orders referencing removed Original/Fragrantica perfumes
  const validOrders = orders.filter((o) => {
    if (o.items && o.items.length > 0) {
      return o.items.every((sub) => validPerfumeIds.has(sub.productId));
    }
    return validPerfumeIds.has(o.productId);
  });

  // 1. Mark orders as expired if time has elapsed or if sitting unfulfilled for > 4 minutes
  let updatedOrders = validOrders.map((o) => {
    if (o.status === 'active') {
      const isPastExpiry = o.expiresAt && now > o.expiresAt;
      const isStale = (now - o.createdAt) > 240000; // 4 minutes
      if (isPastExpiry || isStale) {
        return { ...o, status: 'expired' as const };
      }
    }
    return o;
  });

  // 2. Filter active and retain past orders (max 15 historical items to prevent bloating)
  const activeOrders = updatedOrders.filter((o) => o.status === 'active');
  const pastOrders = updatedOrders.filter((o) => o.status !== 'active').slice(0, 15);

  // 3. Keep active order book proportional to discovered perfumes (up to 14 orders)
  const targetActiveCount = Math.min(14, Math.max(4, perfumes.length * 3));
  let currentActive = [...activeOrders];

  if (currentActive.length < targetActiveCount) {
    const needed = targetActiveCount - currentActive.length;
    for (let i = 0; i < needed; i++) {
      const freshOrder = generateRandomOrder(perfumes, companies);
      currentActive.unshift(freshOrder);
    }
  }

  return [...currentActive, ...pastOrders];
}

/**
 * Calculates a comprehensive and realistic corporate valuation for a perfume company.
 * Incorporates:
 * 1. Liquid Cash Reserves
 * 2. Essence Storage Value (Cost basis or current market valuation)
 * 3. Finished Products Commercial Value (Wholesale market value = retail * 0.70 or unitCost * 2.5)
 * 4. Commercial Goodwill & Brand Equity (based on accumulated revenue and profitability)
 */
export function calculateCompanyValuation(company: Company): number {
  if (!company) return 0;
  const cash = company.cash || 0;

  // 1. Essence Inventory Value
  const essenceVal = Object.values(company.essenceStorage || {}).reduce((sum, item) => {
    if (!item || item.quantity <= 0) return sum;
    const basis = item.totalCostBasis || (item.quantity * (item.averageUnitCost || 140));
    return sum + (basis || 0);
  }, 0);

  // 2. Finished Product Inventory Market/Wholesale Value
  const productVal = Object.values(company.productStorage || {}).reduce((sum, item) => {
    if (!item || item.quantity <= 0) return sum;
    const marketPrice = item.suggestedSalePrice || item.lastSalePrice || (item.unitCost * 3) || 1400;
    // Wholesale asset value is 70% of suggested retail price, minimum 1.6x production cost
    const unitVal = Math.max(item.unitCost * 1.6, marketPrice * 0.70);
    return sum + Math.round(item.quantity * unitVal);
  }, 0);

  // 3. Commercial Goodwill & Brand Equity (Marka Değeri)
  const revenueEquity = Math.round((company.totalRevenue || 0) * 0.40);
  const profitBonus = Math.max(0, Math.round((company.netProfit || 0) * 0.30));

  return Math.round(cash + essenceVal + productVal + revenueEquity + profitBonus);
}

