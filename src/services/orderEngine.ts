import { Company, MarketOrder, FinancialRecord, Perfume, Perfumer, OrderSubItem } from '../types';
import { calculateSaleMarketingBonuses } from './marketingEngine';

export interface FulfillmentResult {
  fulfilledQuantity: number;
  productId: string;
  productName: string;
  finalUnitPrice: number;
  grossRevenue: number;
  bonusRevenue: number;
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
  companyPerfumer?: Perfumer,
  targetProductId?: string
): FulfillmentResult {
  // Determine which product is being delivered
  let activeProductId = targetProductId || order.productId;
  let activeProductName = order.productName;
  let unitPrice = order.pricePerUnit;
  let maxOrderRemaining = order.remainingQuantity;

  let targetSubItem: OrderSubItem | undefined;
  if (order.items && order.items.length > 0) {
    if (targetProductId) {
      targetSubItem = order.items.find((item) => item.productId === targetProductId);
    } else {
      // Find the first sub-item that still needs fulfillment and that company has stock for
      targetSubItem = order.items.find((item) => item.remainingQuantity > 0 && (company.productStorage[item.productId]?.quantity || 0) > 0)
        || order.items.find((item) => item.remainingQuantity > 0)
        || order.items[0];
    }

    if (targetSubItem) {
      activeProductId = targetSubItem.productId;
      activeProductName = targetSubItem.productName;
      unitPrice = targetSubItem.pricePerUnit;
      maxOrderRemaining = targetSubItem.remainingQuantity;
    }
  }

  const currentProductStock = company.productStorage[activeProductId]?.quantity || 0;
  if (currentProductStock <= 0) {
    throw new Error(`Depoda satılacak ${activeProductName} stoğu bulunmuyor.`);
  }

  const validSellQuantity = Math.min(quantityToSell, currentProductStock, maxOrderRemaining);
  if (validSellQuantity <= 0) {
    throw new Error('Geçersiz veya 0 adetlik satış miktarı.');
  }

  // İhracat, Şöhret, Satış Temsilcisi İknası, Bölgesel Popülerlik ve Ülke/Reklam Bonusları
  const marketing = calculateSaleMarketingBonuses(
    unitPrice,
    company,
    perfume,
    order.country,
    companyPerfumer
  );
  const baseRevenue = validSellQuantity * unitPrice;
  const grossRevenue = Math.round(validSellQuantity * marketing.finalUnitPrice * 100) / 100;
  const bonusRevenue = Math.max(0, Math.round((grossRevenue - baseRevenue) * 100) / 100);

  // ParfümATÖR Telif Oranı (AR-GE parfümlerinde tanımlı, örn: %3)
  const royaltyRate = perfume?.royaltyRate || 0;
  const royaltyAmount = Math.round(grossRevenue * royaltyRate * 100) / 100;
  const netRevenue = Math.round((grossRevenue - royaltyAmount) * 100) / 100;

  // Update sub-items if present
  let updatedItems = order.items;
  let newTotalRemaining = 0;

  if (order.items && order.items.length > 0) {
    updatedItems = order.items.map((sub) => {
      if (sub.productId === activeProductId) {
        const subRemaining = Math.max(0, sub.remainingQuantity - validSellQuantity);
        return { ...sub, remainingQuantity: subRemaining };
      }
      return sub;
    });
    newTotalRemaining = updatedItems.reduce((acc, curr) => acc + curr.remainingQuantity, 0);
  } else {
    newTotalRemaining = Math.max(0, order.remainingQuantity - validSellQuantity);
  }

  const isCompleted = newTotalRemaining <= 0;

  const updatedOrder: MarketOrder = {
    ...order,
    items: updatedItems,
    remainingQuantity: newTotalRemaining,
    status: isCompleted ? 'completed' : 'active'
  };

  const productItem = company.productStorage[activeProductId];
  const unitCost = productItem?.unitCost || (perfume?.suggestedRetailPrice ? Math.max(120, perfume.suggestedRetailPrice - (perfume.resultLevel === 'Efsanevi' ? 2000 : perfume.resultLevel === 'Nadir' ? 1500 : perfume.resultLevel === 'Kaliteli' ? 1000 : 600)) : 180);
  const costOfGoodsSold = Math.round(validSellQuantity * unitCost * 100) / 100;
  const estimatedProfit = Math.round((netRevenue - costOfGoodsSold) * 100) / 100;

  const now = Date.now();
  const perfumerName = perfume?.perfumerName || companyPerfumer?.name || 'AromaLux Parfümörü';

  // 1. PARFÜM SATIŞI (Gelir Kaydı)
  const isBundle = order.orderType === 'bundle_3' || order.orderType === 'bundle_5';
  const bundleTag = isBundle ? ` [${order.orderCategory || 'Koleksiyon Siparişi'}]` : '';
  const totalBonusPct = Math.round(marketing.totalBonusRate * 100);

  const saleRecord: FinancialRecord = {
    id: `fin_sale_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'income',
    category: 'product_sale',
    amount: grossRevenue,
    description: `PARFÜM SATIŞI (${order.country}): ${validSellQuantity} adet ${activeProductName}${bundleTag} (Baz: ${unitPrice} ₺ -> İkna/Şöhret/Ülke Bonusu +${totalBonusPct}% ile Birim: ${marketing.finalUnitPrice} ₺ | Brüt: ${grossRevenue.toLocaleString('tr-TR')} ₺)`,
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
    productId: activeProductId,
    productName: activeProductName,
    finalUnitPrice: marketing.finalUnitPrice,
    grossRevenue,
    bonusRevenue,
    royaltyAmount,
    netRevenue,
    updatedOrder,
    saleRecord,
    royaltyRecord,
    estimatedProfit,
    perfumerName
  };
}
