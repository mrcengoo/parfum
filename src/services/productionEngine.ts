import {
  Perfume,
  Company,
  RawMaterial,
  ProductionCostBreakdown,
  ActiveProduction,
  FinancialRecord,
  ProductionBatchSize
} from '../types';
import { TAX_RATE, LOGISTICS_RATE, WASTE_RATE } from './economyEngine';

export const FACTORY_PRODUCTION_BASE_FEE_100 = 4500; // 100 adetlik laboratuvar, şişe, kapak, paketleme taban masrafı

export function getProductionDuration(batchSize: number): number {
  switch (batchSize) {
    case 1:
      return 6;  // 6 saniye
    case 5:
      return 10; // 10 saniye
    case 10:
      return 15; // 15 saniye
    case 50:
      return 22; // 22 saniye
    case 100:
    default:
      return 30; // 30 saniye
  }
}

export function getFactoryLaborFee(batchSize: number): number {
  // Proportional labor & packaging fee
  const unitFee = FACTORY_PRODUCTION_BASE_FEE_100 / 100; // 45 TL per bottle
  return Math.round(unitFee * batchSize);
}

export interface RecipeRequirementCheck {
  canProduce: boolean;
  batchSize: number;
  duration: number;
  items: {
    rawMaterialId: string;
    name: string;
    noteType: string;
    required: number;
    available: number;
    sufficient: boolean;
    missingAmount: number;
  }[];
  missingSummaryText: string;
  costBreakdown: ProductionCostBreakdown;
}

/**
 * Validates whether the company has all needed essence inventory for the selected batch size (1, 5, 10, 50, 100).
 */
export function checkRecipeRequirements(
  perfume: Perfume,
  company: Company,
  rawMaterialsMap: Map<string, RawMaterial>,
  batchSize: number = 100
): RecipeRequirementCheck {
  const batchMultiplier = batchSize / 100;
  const duration = getProductionDuration(batchSize);

  const items = perfume.recipe.map((recipeItem) => {
    const rawMat = rawMaterialsMap.get(recipeItem.rawMaterialId);
    // Integer requirement for the batch
    const required = Math.max(1, Math.round(recipeItem.amount * batchMultiplier));
    const inStock = company.essenceStorage[recipeItem.rawMaterialId]?.quantity || 0;
    const sufficient = inStock >= required;
    const missingAmount = sufficient ? 0 : required - inStock;

    return {
      rawMaterialId: recipeItem.rawMaterialId,
      name: rawMat?.name || recipeItem.rawMaterialId,
      noteType: recipeItem.noteType,
      required,
      available: inStock,
      sufficient,
      missingAmount
    };
  });

  const missingItems = items.filter((item) => !item.sufficient);
  const canProduce = missingItems.length === 0;

  const missingSummaryText =
    missingItems.length > 0
      ? `Üretim için eksik esans: ${missingItems.map((m) => `${m.name} (${m.missingAmount} birim eksik)`).join(', ')}`
      : 'Tüm esanslar hazır';

  // Calculate detailed cost breakdown for this batch
  let rawMaterialCost = 0;
  items.forEach((item) => {
    const rawMat = rawMaterialsMap.get(item.rawMaterialId);
    const essenceItem = company.essenceStorage[item.rawMaterialId];
    const basePrice = essenceItem?.averageUnitCost || rawMat?.price || 100;
    rawMaterialCost += item.required * basePrice;
  });

  const taxCost = Math.round(rawMaterialCost * TAX_RATE);
  const logisticsCost = Math.round(rawMaterialCost * LOGISTICS_RATE);
  const wasteCost = Math.round(rawMaterialCost * (WASTE_RATE / (1 - WASTE_RATE)));
  const essenceProductionCost = Math.round(rawMaterialCost * 0.08);
  const factoryLaborCost = getFactoryLaborFee(batchSize);

  const totalCost = Math.round(
    rawMaterialCost + taxCost + logisticsCost + wasteCost + essenceProductionCost + factoryLaborCost
  );
  const unitCost = Math.round((totalCost / batchSize) * 100) / 100;

  const costBreakdown: ProductionCostBreakdown = {
    rawMaterialCost,
    taxCost,
    logisticsCost,
    wasteCost,
    essenceProductionCost,
    factoryLaborCost,
    totalCost,
    unitCost
  };

  return {
    canProduce,
    batchSize,
    duration,
    items,
    missingSummaryText,
    costBreakdown
  };
}

/**
 * Initializes a new production batch for 1, 5, 10, 50, 100 units.
 */
export function startProduction(
  perfume: Perfume,
  company: Company,
  rawMaterialsMap: Map<string, RawMaterial>,
  batchSize: number = 100
): { production: ActiveProduction; financialRecord: FinancialRecord } {
  if (company.activeProduction) {
    throw new Error('Halen devam eden bir parfüm üretimi bulunmaktadır. Aynı anda yalnızca 1 üretim yapılabilir.');
  }

  const check = checkRecipeRequirements(perfume, company, rawMaterialsMap, batchSize);
  if (!check.canProduce) {
    throw new Error(check.missingSummaryText);
  }

  const now = Date.now();
  const duration = check.duration;
  const endTime = now + duration * 1000;

  const production: ActiveProduction = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    companyId: company.id,
    perfumeId: perfume.id,
    perfumeName: perfume.name,
    batchSize,
    startTime: now,
    endTime,
    duration,
    status: 'producing',
    costBreakdown: check.costBreakdown
  };

  const financialRecord: FinancialRecord = {
    id: `fin_prod_fee_${Date.now()}`,
    timestamp: now,
    type: 'expense',
    category: 'production_fee',
    amount: check.costBreakdown.factoryLaborCost,
    description: `Parfüm Üretim Laboratuvar & Şişeleme Masrafı (${batchSize} adet ${perfume.name})`,
    relatedEntityId: production.id,
    cashAfter: 0
  };

  return { production, financialRecord };
}
