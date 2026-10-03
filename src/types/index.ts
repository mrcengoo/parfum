/**
 * Types and interfaces for Perfume Exchange & Production Simulation Game
 */

export type NoteType = 'top' | 'middle' | 'base';

export type OlfactoryFamilyGroup =
  | 'Narenciye'
  | 'Meyvemsi'
  | 'Yeşilimsi'
  | 'Baharatlı'
  | 'Çiçeksi'
  | 'Pudramsı'
  | 'Tatlımsı'
  | 'Odunsu'
  | 'Amber'
  | 'Deri';

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
  category?: string; // e.g. "Tatlımsı - Odunsu"
  familyGroup?: OlfactoryFamilyGroup; // 10 main families from Koku Çarkı
  noteTier?: NoteType; // 'top' (Üst Nota) | 'middle' (Orta Nota) | 'base' (Alt Nota)
  description?: string;
  image?: string; // Fragrantica note image URL
}

export interface RecipeItem {
  rawMaterialId: string;
  amount: number; // units required for 100 bottles batch (scales proportionally for 1, 5, 10, 50, 100)
  noteType: NoteType;
  drops?: number;
  rawMaterialName?: string;
}

export interface FormulaNoteItem {
  rawMaterialId: string;
  rawMaterialName: string;
  drops: number;
  noteType: NoteType;
}

export type GenderType = 'KADIN' | 'ERKEK' | 'UNISEX';

export type PerfumeSourceType = 'ORİJİNAL' | 'AR-GE' | 'SECRET';

export type PerfumeQualityLevel =
  | 'Basit'
  | 'Sıradan'
  | 'Standart'
  | 'Kaliteli'
  | 'Nadir'
  | 'Efsanevi';

export type RndResultLevel = PerfumeQualityLevel;

export interface Perfumer {
  id: string;
  name: string;
  role: string;
  noteHarmony: number; // 1-10 (TAM SAYI)
  trendFit: number; // 1-10 (TAM SAYI)
  rdLevel: number; // 1-10 (TAM SAYI)
  bonusFamilies?: OlfactoryFamilyGroup[]; // Random 3 Aile Bonusu (10 Aileden 3'ü)
  logisticsBonus: number; // 0 (eski bonus kaldırıldı)
  exportBonus: number; // 0 (eski bonus kaldırıldı)
  wasteBonus: number; // 0 (eski bonus kaldırıldı)
  designFee: number; // e.g. 25000 TL
  royaltyRate: number; // e.g. 0.03 (%3)
  avatarType?: 'mert' | 'arda' | 'ece' | 'selin' | string;
  avatar?: string;
  bio?: string;
  olfactoryFamily?: string; // 3 Aile Özeti
  specialtyNotes?: string[];
  favoredCountries?: string[];
  noteMasteryBonusRate?: number; // 3 Aile tam eşleşme tavan bonusu (+%24)
  qualityBonus?: number;
  wasteReduction?: number;
  speedBonus?: number;
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
  fame?: number; // 0-100 Parfüm Şöhreti (Reklam ve ihracat ile artar)
  popularCountries?: string[]; // Bu parfümün en popüler olduğu ülkeler
  createdAt: number;
}

export interface SalesRep {
  id: string;
  name: string;
  title: string;
  avatar: string;
  persuasion: number; // 1-100 İkna ve Satış Gücü
  level: number; // 1-10 Eğitim Seviyesi
  specialtyCountries: string[]; // Özel satış bonusu sağladığı ülkeler
  closedDeals: number;
  bonusRevenueGenerated: number;
}

export interface AdSpecialist {
  id: string;
  name: string;
  title: string;
  avatar: string;
  adPower: number; // 1-100 Reklam Gücü
  level: number; // 1-10 Kreatif Seviye
  specialtyCountries: string[]; // Özel reklam bonusu sağladığı ülkeler
  campaignsLaunched: number;
  totalFameGenerated: number;
}

export interface AdCampaign {
  id: string;
  companyId: string;
  perfumeId: string;
  perfumeName: string;
  targetCountry: string;
  targetCountryFlag: string;
  campaignTier: 'influencer' | 'billboard' | 'gala';
  campaignTitle: string;
  cost: number;
  fameBoost: number;
  countryBonusRate: number; // örn: 0.15 (+%15), 0.28 (+%28), 0.45 (+%45)
  adSpecialistName?: string;
  hasSynergy?: boolean;
  startedAt: number;
  expiresAt: number;
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
  countrySales?: Record<string, number>; // Ülke bazlı satılan şişe adedi (örn: { 'Fransa': 40 })
  countryRevenue?: Record<string, number>; // Ülke bazlı satış cirosu (örn: { 'Fransa': 68000 })
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
  | 'secret_recipe_purchase'
  | 'advertising'
  | 'sales_training'
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
  lastRndInventionAt?: number; // 15 dakikalık AR-GE icat bekleme süresi damgası
  salesRep?: SalesRep; // Şirketin Satış Temsilcisi & Satış/İkna Gücü
  adSpecialist?: AdSpecialist; // Şirketin Reklamcısı & Reklam Gücü
  countryBonuses?: Record<string, number>; // Ülke bazlı kalıcı pazar bonusu (örn: { 'Fransa': 0.15 })
  activeCampaigns?: AdCampaign[]; // Aktif reklam kampanyaları
  totalAdSpend?: number; // Toplam reklam harcaması
  exclusiveCountryDeals?: Record<string, number>; // Ülke bazlı VIP Vitrin Anlaşması bitiş zamanı (timestamp)
  countryPenalties?: Record<string, number>; // Rakip hamlesi nedeniyle o ülkede alınan geçici rekabet baskısı bitiş zamanı
  lastCompetitiveTacticAt?: number; // 15 dakikalık stratejik pazar hamlesi bekleme süresi damgası
}

export interface OrderSubItem {
  productId: string;
  productName: string;
  requestedQuantity: number;
  remainingQuantity: number;
  pricePerUnit: number;
}

export interface MarketOrder {
  id: string;
  country: string;
  countryFlag: string;
  clientName: string;
  orderType?: 'single' | 'bundle_3' | 'bundle_5';
  orderCategory?: string; // e.g. "Tekli Prestij Siparişi", "3'lü Butik Seçki Koleksiyonu", "5'li Mega Departman Konsorsiyumu"
  items?: OrderSubItem[]; // For 3 or 5 variety orders
  productId: string;
  productName: string;
  requestedQuantity: number;
  remainingQuantity: number;
  pricePerUnit: number;
  totalOrderValue?: number;
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
  perfumerReview?: string;
  designFee: number;
  royaltyRate: number;
  createdAt: number;
  isAddedToProduction?: boolean;
  totalDrops?: number;
  topDrops?: number;
  midDrops?: number;
  baseDrops?: number;
  topPercentage?: number;
  midPercentage?: number;
  basePercentage?: number;
  formulaItems?: FormulaNoteItem[];
}

export type EvaluatedNoteStatus = 'green' | 'orange' | 'gray';

export interface EvaluatedNoteItem {
  id: string;
  name: string;
  tier: NoteType; // 'top' | 'middle' | 'base'
  status: EvaluatedNoteStatus; // 'green' | 'orange' | 'gray'
  statusText: string; // 'Doğru nota + doğru katman' | 'Doğru nota + yanlış katman' | 'Formülde yok'
}

export interface DiscoveredSecretNote {
  id: string;
  name: string;
  tier: NoteType;
  status: 'green' | 'orange';
}

export interface SecretRecipeAttempt {
  attemptNumber: number; // 1, 2, 3
  timestamp: number;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  correctCount: number;
  totalGuessed?: number;
  totalRequired: number;
  isFullyCorrect: boolean;
  perfumerComment: string; // Hattrick-style scouting feedback
  densityComment?: string; // Parfümörün nota yoğunluğu yorumu
  clueComment?: string; // Bir sonraki araştırma için koku ipucu
  evaluatedNotes?: EvaluatedNoteItem[];
  greenNotes?: string[];
  orangeNotes?: string[];
  grayNotes?: string[];
}

export interface SecretRecipe {
  id: string; // e.g. 'secret_terre_hermes'
  codeName: string; // e.g. 'PROJE TERRA NOBILE'
  purchasePrice: number; // e.g. 32000 ₺
  isPurchased: boolean;
  status: 'locked' | 'purchased' | 'solved' | 'failed';
  attemptsLeft: number; // max 3
  attempts: SecretRecipeAttempt[];
  hint: string; // Parfümatörün koku ipucu
  unlockedAt?: number;
  discoveredNotes?: DiscoveredSecretNote[];

  // Real Fragrantica identity (revealed ONLY when solved):
  realPerfume: {
    id: string;
    name: string;
    brand: string;
    gender: GenderType;
    qualityLevel: 'Standart' | 'Kaliteli' | 'Nadir'; // Never Efsanevi!
    qualityScore: number;
    description: string;
    image: string;
    suggestedRetailPrice: number;
    recipe: RecipeItem[];
    topNotes: string[];
    middleNotes: string[];
    baseNotes: string[];
  };
}

export type ActiveTab =
  | 'overview'
  | 'companies'
  | 'perfumers'
  | 'market'
  | 'essence_storage'
  | 'production'
  | 'product_storage'
  | 'orders'
  | 'finance'
  | 'rnd'
  | 'awarded_perfumes'
  | 'find_formula'
  | 'catalogue'
  | 'market_analytics'
  | 'countries';

export type SectorActivityType =
  | 'buy_essence'
  | 'invent_perfume'
  | 'start_production'
  | 'complete_production'
  | 'sell_product'
  | 'export_order'
  | 'ad_campaign'
  | 'sales_rep_training';

export interface SectorActivityEvent {
  id: string;
  timestamp: number;
  companyId: string;
  companyName: string;
  companyLogo: string;
  type: SectorActivityType;
  title: string;
  description: string;
  amount?: number;
  highlight?: boolean;
}
