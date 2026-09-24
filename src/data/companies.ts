import { Company } from '../types';
import { INITIAL_PERFUMERS } from './perfumers';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'aromalux',
    name: 'AromaLux',
    logo: '👑',
    isPlayer: true,
    perfumerId: 'mert_aksoy', // Mert Aksoy
    cash: 500000,
    essenceStorage: {},
    productStorage: {},
    activeShipments: [],
    activeProduction: null,
    financialHistory: [
      {
        id: 'fin_init',
        timestamp: Date.now(),
        type: 'income',
        category: 'other',
        amount: 500000,
        description: 'Kurucu sermaye transferi (AromaLux)',
        cashAfter: 500000
      }
    ],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  },
  {
    id: 'scentora',
    name: 'Scentora Parfums',
    logo: '💎',
    isPlayer: false,
    perfumerId: 'arda_sisman', // Arda Şişman
    cash: 1250000,
    essenceStorage: {
      vanilya: { rawMaterialId: 'vanilya', quantity: 340, totalCostBasis: 45900, averageUnitCost: 135 },
      bergamot: { rawMaterialId: 'bergamot', quantity: 280, totalCostBasis: 32200, averageUnitCost: 115 },
      safran: { rawMaterialId: 'safran', quantity: 95, totalCostBasis: 39900, averageUnitCost: 420 }
    },
    productStorage: {
      baccarat_rouge_540: {
        perfumeId: 'baccarat_rouge_540',
        quantity: 150,
        totalCostBasis: 42000,
        unitCost: 280,
        lastSalePrice: 540,
        suggestedSalePrice: 540,
        totalSold: 320
      }
    },
    activeShipments: [],
    activeProduction: null,
    financialHistory: [],
    totalRevenue: 850000,
    totalExpenses: 520000,
    netProfit: 330000,
    profitMargin: 38.8
  },
  {
    id: 'parfuma',
    name: 'Parfuma Global',
    logo: '🏛️',
    isPlayer: false,
    perfumerId: 'ece_yalin', // Ece Yalın
    cash: 890000,
    essenceStorage: {
      vetiver: { rawMaterialId: 'vetiver', quantity: 410, totalCostBasis: 86100, averageUnitCost: 210 },
      lavanta: { rawMaterialId: 'lavanta', quantity: 600, totalCostBasis: 75000, averageUnitCost: 125 }
    },
    productStorage: {
      dior_sauvage: {
        perfumeId: 'dior_sauvage',
        quantity: 200,
        totalCostBasis: 46000,
        unitCost: 230,
        lastSalePrice: 360,
        suggestedSalePrice: 360,
        totalSold: 580
      }
    },
    activeShipments: [],
    activeProduction: null,
    financialHistory: [],
    totalRevenue: 640000,
    totalExpenses: 410000,
    netProfit: 230000,
    profitMargin: 35.9
  },
  {
    id: 'aura_bella',
    name: 'Aura Bella Atelier',
    logo: '🌺',
    isPlayer: false,
    perfumerId: 'selin_arman', // Selin Arman
    cash: 1420000,
    essenceStorage: {
      safran: { rawMaterialId: 'safran', quantity: 120, totalCostBasis: 50400, averageUnitCost: 420 },
      ambroksan: { rawMaterialId: 'ambroksan', quantity: 180, totalCostBasis: 43200, averageUnitCost: 240 }
    },
    productStorage: {},
    activeShipments: [],
    activeProduction: null,
    financialHistory: [],
    totalRevenue: 980000,
    totalExpenses: 610000,
    netProfit: 370000,
    profitMargin: 37.7
  }
];

/**
 * Data-driven automatic cyclic assignment of Perfumers to Companies.
 */
export function assignPerfumersToCompanies(companies: Company[]): Company[] {
  return companies.map((comp, idx) => {
    const assignedPerfumer = INITIAL_PERFUMERS[idx % INITIAL_PERFUMERS.length];
    return {
      ...comp,
      perfumerId: comp.perfumerId || assignedPerfumer.id
    };
  });
}
