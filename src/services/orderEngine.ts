import { Company, MarketOrder, FinancialRecord, Perfume, Perfumer } from '../types';

export interface FulfillmentResult {
  fulfilledQuantity: number;
  grossRevenue: number;
  royaltyAmount: number;
  netRevenue: number;
  updatedOrder: MarketOrder;
  saleRecord: FinancialRecord;
  royaltyRecord?: FinancialRecord;
  estimatedProfit: number;
  perfumerName?: string;
}

export function fulfillMarketOrder(
  order: MarketOrder,
  quantityToSell: number,
  company: Company,
  perfume?: Perfume,
  companyPerfumer?: Perfumer
): FulfillmentResult {
  const currentProductStock = company.productStorage[order.productId]?.quantity || 0;
  if (currentProductStock <= 0) {
    throw new Error(`Depoda satılacak ${order.productName} stoğu bulunmuyor.`);
  }

  const validSellQuantity = Math.min(quantityToSell, currentProductStock, order.remainingQuantity);
  if (validSellQuantity <= 0) {
    throw new Error('Geçersiz satış miktarı.');
  }

  // İhracat Bonusu: örneğin +%4 ihracat bonusu satış gelirini %4 artırır
  const exportBonus = companyPerfumer?.exportBonus || 0;
  const baseRevenue = validSellQuantity * order.pricePerUnit;
  const grossRevenue = Math.round(baseRevenue * (1 + exportBonus) * 100) / 100;

  // ParfümATÖR Telif Oranı (AR-GE parfümlerinde tanımlı, örn: %3)
  const royaltyRate = perfume?.royaltyRate || 0;
  const royaltyAmount = Math.round(grossRevenue * royaltyRate * 100) / 100;
  const netRevenue = Math.round((grossRevenue - royaltyAmount) * 100) / 100;

  const newRemaining = order.remainingQuantity - validSellQuantity;
  const isCompleted = newRemaining <= 0;

  const updatedOrder: MarketOrder = {
    ...order,
    remainingQuantity: Math.max(0, newRemaining),
    status: isCompleted ? 'completed' : 'active'
  };

  const productItem = company.productStorage[order.productId];
  const unitCost = productItem?.unitCost || (perfume?.suggestedRetailPrice ? perfume.suggestedRetailPrice * 0.45 : 150);
  const costOfGoodsSold = Math.round(validSellQuantity * unitCost * 100) / 100;
  const estimatedProfit = Math.round((netRevenue - costOfGoodsSold) * 100) / 100;

  const now = Date.now();
  const perfumerName = perfume?.perfumerName || companyPerfumer?.name || 'AromaLux Parfümörü';

  // 1. PARFÜM SATIŞI (Gelir Kaydı)
  const saleRecord: FinancialRecord = {
    id: `fin_sale_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'income',
    category: 'product_sale',
    amount: grossRevenue,
    description: `PARFÜM SATIŞI: ${validSellQuantity} adet ${order.productName} (Birim: ${order.pricePerUnit} ₺ | Brüt: ${grossRevenue.toLocaleString('tr-TR')} ₺${exportBonus > 0 ? ` [İhracat Bonusu +%${exportBonus * 100}]` : ''})`,
    relatedEntityId: order.id,
    cashAfter: 0,
    grossSaleAmount: grossRevenue,
    royaltyAmount: royaltyAmount,
    netSaleAmount: netRevenue,
    perfumerName: perfumerName
  };

  // 2. PARFÜMATÖR TELİFİ (Telif Gider Kaydı)
  let royaltyRecord: FinancialRecord | undefined;
  if (royaltyAmount > 0) {
    royaltyRecord = {
      id: `fin_royalty_${now}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now + 1,
      type: 'expense',
      category: 'perfumer_royalty',
      amount: royaltyAmount,
      description: `PARFÜMATÖR TELİFİ: %${(royaltyRate * 100).toFixed(1)} telif ödemesi (${perfumerName}) [Net Şirket Geliri: ${netRevenue.toLocaleString('tr-TR')} ₺]`,
      relatedEntityId: order.id,
      cashAfter: 0,
      grossSaleAmount: grossRevenue,
      royaltyAmount: royaltyAmount,
      netSaleAmount: netRevenue,
      perfumerName: perfumerName
    };
  }

  return {
    fulfilledQuantity: validSellQuantity,
    grossRevenue,
    royaltyAmount,
    netRevenue,
    updatedOrder,
    saleRecord,
    royaltyRecord,
    estimatedProfit,
    perfumerName
  };
}
