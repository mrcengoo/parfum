/**
 * Types and interfaces for Perfume Exchange & Production Simulation Game
 */

export type NoteType = 'top' | 'middle' | 'base';

export interface PricePoint {
  timestamp: number;
  price: number;
  label?: string; // e.g. "12 ay önce", "9 ay önce", "Bugün", etc.
}

export interface RawMaterial {
  id: string;
  name: string;
  country: string;
  countryCode: string; // e.g. "mg", "ir", "tr", "ht"
  flag: string; // e.g. "🇲🇬"
  price: number;
  basePrice: number;
  exchangeStock: number;
  producerCompany: string;
  taxRate: number; // e.g. 0.20
  logisticsRate: number; // e.g. 0.15
  wasteRate: number; // e.g. 0.25
  shippingTime: number; // in seconds (individual per material, e.g. 210s - 490s)
  productionTime?: number; // alias/sync for shipping/production duration
  supply: number; // 1-100
  demand: number; // 1-100
  priceHistory: PricePoint[];
  category?: string; // e.g. "Çiçeksi · Tatlı · Odunsu"
  description?: string;
}

export interface RecipeItem {
  rawMaterialId: string;
  amount: number; // units required for 100 bottles batch (scales proportionally for 1, 5, 10, 50, 100)
  noteType: NoteType;
}

export type GenderType = 'KADIN' | 'ERKEK' | 'UNISEX';

export type PerfumeSourceType = 'ORİJİNAL' | 'AR-GE';

export type RndResultLevel = 'KÖTÜ' | 'ORTA' | 'İYİ' | 'ÇOK İYİ' | 'İMZA';

export interface Perfumer {
  id: string;
  name: string;
  role: string;
  noteHarmony: number; // 1-10 (TAM SAYI)
  trendFit: number; // 1-10 (TAM SAYI)
  rdLevel: number; // 1-10 (TAM SAYI)
  logisticsBonus: number; // e.g. 0.03 (+3%)
  exportBonus: number; // e.g. 0.04 (+4%)
  wasteBonus: number; // e.g. 0.03 (+3%)
  designFee: number; // e.g. 8000 TL
  royaltyRate: number; // e.g. 0.03 (%3)
  avatarType?: 'mert' | 'arda' | 'ece' | 'selin';
  avatar?: string;
  bio?: string;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  companyId: string;
  companyName?: string;
  perfumerId?: string;
  perfumerName?: string;
  gender: GenderType;
  sourceType: PerfumeSourceType;
  quality: number; // 0-100
  originality: number; // 0-100
  noteHarmony: number; // 0-100
  trendFit: number; // 0-100
  resultLevel?: RndResultLevel;
  topNotes: string[]; // Raw material IDs
  middleNotes: string[]; // Raw material IDs
  baseNotes: string[]; // Raw material IDs
  notes: string[]; // All raw material IDs combined
  producerCompanyId: string;
  recipe: RecipeItem[];
  productionTime: number; // in seconds, base for 100 bottles
  image: string;
  source: string;
  suggestedRetailPrice: number;
  description: string;
  designFee?: number;
  royaltyRate?: number;
  createdAt: number;
}

export interface ActiveShipment {
  id: string;
  companyId: string;
  rawMaterialId: string;
  rawMaterialName: string;
  purchasedQuantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  logisticsAmount: number;
  totalCost: number;
  wasteRate: number;
  expectedNetQuantity: number; // purchasedQuantity * (1 - wasteRate)
  startTime: number;
  endTime: number;
  duration: number; // in seconds (individual per material)
  status: 'shipping' | 'completed' | 'cancelled';
}

export type ProductionBatchSize = 1 | 5 | 10 | 50 | 100;

export interface ActiveProduction {
  id: string;
  companyId: string;
  perfumeId: string;
  perfumeName: string;
  batchSize: number; // 1, 5, 10, 50, 100
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  status: 'producing' | 'completed';
  costBreakdown: ProductionCostBreakdown;
}

export interface ProductionCostBreakdown {
  rawMaterialCost: number;
  taxCost: number;
  logisticsCost: number;
  wasteCost: number;
  essenceProductionCost: number;
  factoryLaborCost: number;
  totalCost: number;
  unitCost: number;
}

export interface ProductInventoryItem {
  perfumeId: string;
  quantity: number;
  totalCostBasis: number; // Total money invested
  unitCost: number;
  lastSalePrice: number;
  suggestedSalePrice: number;
  totalSold: number;
  lastCostBreakdown?: ProductionCostBreakdown;
}

export interface EssenceInventoryItem {
  rawMaterialId: string;
  quantity: number;
  totalCostBasis: number;
  averageUnitCost: number;
}

export type FinancialCategory =
  | 'raw_material_purchase'
  | 'tax'
  | 'logistics'
  | 'production_fee'
  | 'product_sale'
  | 'perfumer_royalty'
  | 'rnd_design_fee'
  | 'rnd_expense'
  | 'other';

export type FinancialType = 'income' | 'expense';

export interface FinancialRecord {
  id: string;
  timestamp: number;
  type: FinancialType;
  category: FinancialCategory;
  amount: number;
  description: string;
  relatedEntityId?: string;
  cashAfter: number;
  grossSaleAmount?: number;
  royaltyAmount?: number;
  netSaleAmount?: number;
  perfumerName?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  isPlayer: boolean;
  perfumerId: string; // Assigned perfumer ID
  cash: number;
  essenceStorage: Record<string, EssenceInventoryItem>;
  productStorage: Record<string, ProductInventoryItem>;
  activeShipments: ActiveShipment[];
  activeProduction: ActiveProduction | null;
  financialHistory: FinancialRecord[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface MarketOrder {
  id: string;
  country: string;
  countryFlag: string;
  clientName: string;
  productId: string;
  productName: string;
  requestedQuantity: number;
  remainingQuantity: number;
  pricePerUnit: number;
  createdAt: number;
  expiresAt: number;
  status: 'active' | 'completed' | 'expired';
}

export interface RndResult {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  perfumerId: string;
  perfumerName: string;
  gender: GenderType;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  totalNotesCount: number;
  qualityScore: number; // 0-100
  originalityScore: number; // 0-100
  harmonyScore: number; // 0-100
  trendScore: number; // 0-100
  resultLevel: RndResultLevel;
  estimatedMarketPrice: number;
  productionCost: number;
  productionTime: number;
  recipe: RecipeItem[];
  notesSummary: string;
  designFee: number;
  royaltyRate: number;
  createdAt: number;
  isAddedToProduction?: boolean;
}

export type ActiveTab =
  | 'overview'
  | 'companies'
  | 'market'
  | 'essence_storage'
  | 'production'
  | 'product_storage'
  | 'orders'
  | 'finance'
  | 'rnd';
