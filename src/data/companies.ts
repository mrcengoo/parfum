import { Company } from '../types';
import { INITIAL_PERFUMERS } from './perfumers';
import {
  COMPANY_DEFAULT_SALES_REPS,
  COMPANY_DEFAULT_AD_SPECIALISTS,
  COMPANY_DEFAULT_COUNTRY_BONUSES
} from '../services/marketingEngine';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'aromalux',
    name: 'AromaLux',
    logo: '👑',
    isPlayer: true,
    perfumerId: 'mert_aksoy', // Mert Aksoy
    cash: 20000000,
    essenceStorage: {
      // Klasik Temel Notalar
      bergamot: { rawMaterialId: 'bergamot', quantity: 240, totalCostBasis: 27600, averageUnitCost: 115 },
      yasemin: { rawMaterialId: 'yasemin', quantity: 200, totalCostBasis: 38000, averageUnitCost: 190 },
      gul: { rawMaterialId: 'gul', quantity: 220, totalCostBasis: 68200, averageUnitCost: 310 },
      sedir_agaci: { rawMaterialId: 'sedir_agaci', quantity: 210, totalCostBasis: 27300, averageUnitCost: 130 },
      vanilya: { rawMaterialId: 'vanilya', quantity: 250, totalCostBasis: 33750, averageUnitCost: 135 },
      lavanta: { rawMaterialId: 'lavanta', quantity: 200, totalCostBasis: 25000, averageUnitCost: 125 },
      vetiver: { rawMaterialId: 'vetiver', quantity: 180, totalCostBasis: 37800, averageUnitCost: 210 },
      greyfurt: { rawMaterialId: 'greyfurt', quantity: 160, totalCostBasis: 17600, averageUnitCost: 110 },
      karabiber: { rawMaterialId: 'karabiber', quantity: 150, totalCostBasis: 24000, averageUnitCost: 160 },
      sandal_agaci: { rawMaterialId: 'sandal_agaci', quantity: 180, totalCostBasis: 46800, averageUnitCost: 260 },
      paculi: { rawMaterialId: 'paculi', quantity: 190, totalCostBasis: 31350, averageUnitCost: 165 },
      ambroksan: { rawMaterialId: 'ambroksan', quantity: 220, totalCostBasis: 52800, averageUnitCost: 240 },
      misk: { rawMaterialId: 'misk', quantity: 200, totalCostBasis: 36000, averageUnitCost: 180 },
      safran: { rawMaterialId: 'safran', quantity: 120, totalCostBasis: 50400, averageUnitCost: 420 },
      tonka_fasulyesi: { rawMaterialId: 'tonka_fasulyesi', quantity: 170, totalCostBasis: 29750, averageUnitCost: 175 },
      tütün_yapragi: { rawMaterialId: 'tütün_yapragi', quantity: 160, totalCostBasis: 30400, averageUnitCost: 190 },
      elma: { rawMaterialId: 'elma', quantity: 150, totalCostBasis: 15000, averageUnitCost: 100 },
      ananas: { rawMaterialId: 'ananas', quantity: 140, totalCostBasis: 16800, averageUnitCost: 120 },
      portakal_cicegi: { rawMaterialId: 'portakal_cicegi', quantity: 160, totalCostBasis: 28800, averageUnitCost: 180 },
      aci_badem: { rawMaterialId: 'aci_badem', quantity: 130, totalCostBasis: 19500, averageUnitCost: 150 },
      sichuan_biberi: { rawMaterialId: 'sichuan_biberi', quantity: 120, totalCostBasis: 22200, averageUnitCost: 185 },

      // FRAGRANTICA NOTALARI (Yeni Eklenen 16 Nota)
      lici: { rawMaterialId: 'lici', quantity: 180, totalCostBasis: 32400, averageUnitCost: 180 },
      deniz_notalari: { rawMaterialId: 'deniz_notalari', quantity: 200, totalCostBasis: 24000, averageUnitCost: 120 },
      biberiye: { rawMaterialId: 'biberiye', quantity: 170, totalCostBasis: 18700, averageUnitCost: 110 },
      tutsu: { rawMaterialId: 'tutsu', quantity: 150, totalCostBasis: 39000, averageUnitCost: 260 },
      kakule: { rawMaterialId: 'kakule', quantity: 175, totalCostBasis: 34125, averageUnitCost: 195 },
      iris: { rawMaterialId: 'iris', quantity: 130, totalCostBasis: 44200, averageUnitCost: 340 },
      deri: { rawMaterialId: 'deri', quantity: 160, totalCostBasis: 35200, averageUnitCost: 220 },
      oud: { rawMaterialId: 'oud', quantity: 140, totalCostBasis: 63000, averageUnitCost: 450 },
      amber: { rawMaterialId: 'amber', quantity: 180, totalCostBasis: 41400, averageUnitCost: 230 },
      orkide: { rawMaterialId: 'orkide', quantity: 150, totalCostBasis: 41250, averageUnitCost: 275 },
      limon: { rawMaterialId: 'limon', quantity: 210, totalCostBasis: 19950, averageUnitCost: 95 },
      bal: { rawMaterialId: 'bal', quantity: 180, totalCostBasis: 25200, averageUnitCost: 140 },
      osmanthus: { rawMaterialId: 'osmanthus', quantity: 120, totalCostBasis: 37200, averageUnitCost: 310 },
      subulteber: { rawMaterialId: 'subulteber', quantity: 110, totalCostBasis: 41800, averageUnitCost: 380 },
      erik: { rawMaterialId: 'erik', quantity: 160, totalCostBasis: 24000, averageUnitCost: 150 },
      yesil_cay: { rawMaterialId: 'yesil_cay', quantity: 180, totalCostBasis: 23400, averageUnitCost: 130 },
      ahududu: { rawMaterialId: 'ahududu', quantity: 160, totalCostBasis: 26400, averageUnitCost: 165 },
      tarcin: { rawMaterialId: 'tarcin', quantity: 150, totalCostBasis: 21750, averageUnitCost: 145 }
    },
    productStorage: {},
    activeShipments: [],
    activeProduction: null,
    financialHistory: [
      {
        id: 'fin_init',
        timestamp: Date.now(),
        type: 'income',
        category: 'other',
        amount: 20000000,
        description: 'Kurucu sermaye transferi (AromaLux)',
        cashAfter: 20000000
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
    cash: 20000000,
    essenceStorage: {
      vanilya: { rawMaterialId: 'vanilya', quantity: 340, totalCostBasis: 45900, averageUnitCost: 135 },
      bergamot: { rawMaterialId: 'bergamot', quantity: 280, totalCostBasis: 32200, averageUnitCost: 115 },
      safran: { rawMaterialId: 'safran', quantity: 95, totalCostBasis: 39900, averageUnitCost: 420 },
      ahududu: { rawMaterialId: 'ahududu', quantity: 180, totalCostBasis: 29700, averageUnitCost: 165 },
      gul: { rawMaterialId: 'gul', quantity: 210, totalCostBasis: 65100, averageUnitCost: 310 },
      tarcin: { rawMaterialId: 'tarcin', quantity: 140, totalCostBasis: 20300, averageUnitCost: 145 },
      paculi: { rawMaterialId: 'paculi', quantity: 190, totalCostBasis: 31350, averageUnitCost: 165 },
      tutsu: { rawMaterialId: 'tutsu', quantity: 160, totalCostBasis: 41600, averageUnitCost: 260 },
      sandal_agaci: { rawMaterialId: 'sandal_agaci', quantity: 175, totalCostBasis: 45500, averageUnitCost: 260 },
      kakule: { rawMaterialId: 'kakule', quantity: 150, totalCostBasis: 29250, averageUnitCost: 195 },
      sichuan_biberi: { rawMaterialId: 'sichuan_biberi', quantity: 130, totalCostBasis: 24050, averageUnitCost: 185 },
      oud: { rawMaterialId: 'oud', quantity: 160, totalCostBasis: 72000, averageUnitCost: 450 },
      vetiver: { rawMaterialId: 'vetiver', quantity: 140, totalCostBasis: 29400, averageUnitCost: 210 },
      tonka_fasulyesi: { rawMaterialId: 'tonka_fasulyesi', quantity: 190, totalCostBasis: 33250, averageUnitCost: 175 },
      amber: { rawMaterialId: 'amber', quantity: 220, totalCostBasis: 50600, averageUnitCost: 230 },
      sedir_agaci: { rawMaterialId: 'sedir_agaci', quantity: 160, totalCostBasis: 20800, averageUnitCost: 130 }
    },
    productStorage: {},
    activeShipments: [],
    activeProduction: null,
    financialHistory: [
      {
        id: 'fin_init_scentora',
        timestamp: Date.now(),
        type: 'income',
        category: 'other',
        amount: 20000000,
        description: 'Kurucu sermaye transferi (Scentora)',
        cashAfter: 20000000
      }
    ],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  },
  {
    id: 'parfuma',
    name: 'Parfuma Global',
    logo: '🏛️',
    isPlayer: false,
    perfumerId: 'ece_yalin', // Ece Yalın
    cash: 20000000,
    essenceStorage: {
      vetiver: { rawMaterialId: 'vetiver', quantity: 410, totalCostBasis: 86100, averageUnitCost: 210 },
      lavanta: { rawMaterialId: 'lavanta', quantity: 600, totalCostBasis: 75000, averageUnitCost: 125 },
      bergamot: { rawMaterialId: 'bergamot', quantity: 260, totalCostBasis: 29900, averageUnitCost: 115 },
      portakal_cicegi: { rawMaterialId: 'portakal_cicegi', quantity: 180, totalCostBasis: 32400, averageUnitCost: 180 },
      orkide: { rawMaterialId: 'orkide', quantity: 160, totalCostBasis: 44000, averageUnitCost: 275 },
      vanilya: { rawMaterialId: 'vanilya', quantity: 300, totalCostBasis: 40500, averageUnitCost: 135 },
      ambroksan: { rawMaterialId: 'ambroksan', quantity: 240, totalCostBasis: 57600, averageUnitCost: 240 },
      elma: { rawMaterialId: 'elma', quantity: 190, totalCostBasis: 19000, averageUnitCost: 100 },
      kakule: { rawMaterialId: 'kakule', quantity: 150, totalCostBasis: 29250, averageUnitCost: 195 },
      karabiber: { rawMaterialId: 'karabiber', quantity: 140, totalCostBasis: 22400, averageUnitCost: 160 },
      paculi: { rawMaterialId: 'paculi', quantity: 180, totalCostBasis: 29700, averageUnitCost: 165 },
      limon: { rawMaterialId: 'limon', quantity: 240, totalCostBasis: 22800, averageUnitCost: 95 },
      bal: { rawMaterialId: 'bal', quantity: 200, totalCostBasis: 28000, averageUnitCost: 140 },
      tarcin: { rawMaterialId: 'tarcin', quantity: 130, totalCostBasis: 18850, averageUnitCost: 145 },
      tütün_yapragi: { rawMaterialId: 'tütün_yapragi', quantity: 220, totalCostBasis: 41800, averageUnitCost: 190 },
      deniz_notalari: { rawMaterialId: 'deniz_notalari', quantity: 210, totalCostBasis: 25200, averageUnitCost: 120 },
      tutsu: { rawMaterialId: 'tutsu', quantity: 170, totalCostBasis: 44200, averageUnitCost: 260 },
      sedir_agaci: { rawMaterialId: 'sedir_agaci', quantity: 230, totalCostBasis: 29900, averageUnitCost: 130 }
    },
    productStorage: {},
    activeShipments: [],
    activeProduction: null,
    financialHistory: [
      {
        id: 'fin_init_parfuma',
        timestamp: Date.now(),
        type: 'income',
        category: 'other',
        amount: 20000000,
        description: 'Kurucu sermaye transferi (Parfuma)',
        cashAfter: 20000000
      }
    ],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  },
  {
    id: 'aura_bella',
    name: 'Aura Bella Atelier',
    logo: '🌺',
    isPlayer: false,
    perfumerId: 'selin_arman', // Selin Arman
    cash: 20000000,
    essenceStorage: {
      gul: { rawMaterialId: 'gul', quantity: 240, totalCostBasis: 74400, averageUnitCost: 310 },
      yasemin: { rawMaterialId: 'yasemin', quantity: 220, totalCostBasis: 41800, averageUnitCost: 190 },
      safran: { rawMaterialId: 'safran', quantity: 120, totalCostBasis: 50400, averageUnitCost: 420 },
      ambroksan: { rawMaterialId: 'ambroksan', quantity: 180, totalCostBasis: 43200, averageUnitCost: 240 },
      osmanthus: { rawMaterialId: 'osmanthus', quantity: 170, totalCostBasis: 52700, averageUnitCost: 310 },
      subulteber: { rawMaterialId: 'subulteber', quantity: 160, totalCostBasis: 60800, averageUnitCost: 380 },
      sedir_agaci: { rawMaterialId: 'sedir_agaci', quantity: 190, totalCostBasis: 24700, averageUnitCost: 130 },
      amber: { rawMaterialId: 'amber', quantity: 200, totalCostBasis: 46000, averageUnitCost: 230 },
      erik: { rawMaterialId: 'erik', quantity: 180, totalCostBasis: 27000, averageUnitCost: 150 },
      aci_badem: { rawMaterialId: 'aci_badem', quantity: 150, totalCostBasis: 22500, averageUnitCost: 150 },
      tarcin: { rawMaterialId: 'tarcin', quantity: 130, totalCostBasis: 18850, averageUnitCost: 145 },
      deri: { rawMaterialId: 'deri', quantity: 170, totalCostBasis: 37400, averageUnitCost: 220 },
      tütün_yapragi: { rawMaterialId: 'tütün_yapragi', quantity: 180, totalCostBasis: 34200, averageUnitCost: 190 },
      paculi: { rawMaterialId: 'paculi', quantity: 160, totalCostBasis: 26400, averageUnitCost: 165 },
      bergamot: { rawMaterialId: 'bergamot', quantity: 210, totalCostBasis: 24150, averageUnitCost: 115 },
      yesil_cay: { rawMaterialId: 'yesil_cay', quantity: 190, totalCostBasis: 24700, averageUnitCost: 130 },
      ahududu: { rawMaterialId: 'ahududu', quantity: 160, totalCostBasis: 26400, averageUnitCost: 165 },
      misk: { rawMaterialId: 'misk', quantity: 200, totalCostBasis: 36000, averageUnitCost: 180 },
      sandal_agaci: { rawMaterialId: 'sandal_agaci', quantity: 160, totalCostBasis: 41600, averageUnitCost: 260 },
      iris: { rawMaterialId: 'iris', quantity: 150, totalCostBasis: 51000, averageUnitCost: 340 },
      lici: { rawMaterialId: 'lici', quantity: 170, totalCostBasis: 30600, averageUnitCost: 180 }
    },
    productStorage: {},
    activeShipments: [],
    activeProduction: null,
    financialHistory: [
      {
        id: 'fin_init_aura',
        timestamp: Date.now(),
        type: 'income',
        category: 'other',
        amount: 20000000,
        description: 'Kurucu sermaye transferi (Aura Bella)',
        cashAfter: 20000000
      }
    ],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
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
      perfumerId: comp.perfumerId || assignedPerfumer.id,
      salesRep: comp.salesRep || COMPANY_DEFAULT_SALES_REPS[comp.id] || COMPANY_DEFAULT_SALES_REPS.aromalux,
      adSpecialist:
        comp.adSpecialist ||
        COMPANY_DEFAULT_AD_SPECIALISTS[comp.id] ||
        COMPANY_DEFAULT_AD_SPECIALISTS.aromalux,
      countryBonuses: comp.countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[comp.id] || {},
      activeCampaigns: comp.activeCampaigns || [],
      totalAdSpend: comp.totalAdSpend || 0
    };
  });
}
