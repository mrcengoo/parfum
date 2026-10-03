import {
  Company,
  RawMaterial,
  Perfume,
  Perfumer,
  MarketOrder,
  RndResult,
  SectorActivityEvent,
  GenderType,
  ProductInventoryItem,
  EssenceInventoryItem,
  FinancialRecord,
  FormulaNoteItem,
  RecipeItem,
  SecretRecipe
} from '../types';
import { calculatePurchase } from './economyEngine';
import { generateRndFromFormula } from './rndEngine';
import { convertSecretToPerfume, ensureSecretRecipePool, generateUniqueSecretRecipe } from './secretRecipeEngine';
import {
  AD_CAMPAIGN_PACKAGES,
  COMPANY_DEFAULT_AD_SPECIALISTS,
  COMPANY_DEFAULT_COUNTRY_BONUSES,
  COMPANY_DEFAULT_SALES_REPS,
  GLOBAL_MARKET_COUNTRIES,
  calculateAdCampaignPower,
  calculateSaleMarketingBonuses,
  createCampaignDrivenOrder,
  getCompanySynergyCountries,
  getPerfumeFame,
  getPerfumePopularCountries,
  normalizeCountryName
} from './marketingEngine';

export interface BotPersonality {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  preferredNotes: string[];
  preferredCategories: string[];
  rndNamePrefixes: string[];
  rndNameSuffixes: string[];
  imagePool: string[];
}

export const RND_INVENTION_COOLDOWN_MS = 45 * 1000; // Temel AR-GE / Formülü Bul döngü süresi (portföy büyüklüğüne göre dinamik ölçeklenir)
export const RND_BASE_FEE = 25000; // 25.000 TL AR-GE İcat Ücreti

export const BOT_PERSONALITIES: Record<string, BotPersonality> = {
  aromalux: {
    id: 'aromalux',
    name: 'AromaLux',
    logo: '👑',
    tagline: 'Klasik & Haute Parfumerie Şaheserleri',
    preferredNotes: ['bergamot', 'gul', 'yasemin', 'sedir_agaci', 'vetiver', 'vanilya', 'amber', 'iris', 'misk', 'ambroksan'],
    preferredCategories: ['Klasik', 'Oryantal', 'Şipre'],
    rndNamePrefixes: ['AromaLux Privé', 'Haute', 'Noble', 'Chypre', 'Élixir d’Or', 'Grand', 'Majestic'],
    rndNameSuffixes: ['Prestige', 'Impérial', 'Absolu', 'de Grasse', 'Intense', 'N°1', 'Royale'],
    imagePool: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80'
    ]
  },
  scentora: {
    id: 'scentora',
    name: 'Scentora Parfums',
    logo: '💎',
    tagline: 'Lüks & Oryantal Niche Ustası',
    preferredNotes: ['vanilya', 'safran', 'bergamot', 'sedir_agaci', 'oud', 'ambroksan', 'tutsu', 'amber', 'deri'],
    preferredCategories: ['Oryantal', 'Tatlı', 'Baharatlı'],
    rndNamePrefixes: ['Scentora Imperial', 'Scentora Royal', 'Velvet', 'Golden Amber', 'Mystic', 'Crown', 'Sultan'],
    rndNameSuffixes: ['Extrait', 'Oud Sublime', 'Saffron Rouge', 'Elixir Prestige', 'Nectar', 'Intense', 'Nadir'],
    imagePool: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&auto=format&fit=crop&q=80'
    ]
  },
  parfuma: {
    id: 'parfuma',
    name: 'Parfuma Global',
    logo: '🏛️',
    tagline: 'Fougère, Aromatik & Maskülen İkonlar',
    preferredNotes: ['vetiver', 'lavanta', 'karabiber', 'bergamot', 'sedir_agaci', 'greyfurt', 'deniz_notalari', 'tutsu', 'tarcin'],
    preferredCategories: ['Fougère', 'Odunsu', 'Narenciye'],
    rndNamePrefixes: ['Parfuma Club', 'Aromatique', 'Horizon', 'Blue Ocean', 'Sovereign', 'Vanguard', 'Titan'],
    rndNameSuffixes: ['Cologne', 'Vetiver Pure', 'Absolu', 'Sport', 'Nocturne', 'Legend', 'Prestige'],
    imagePool: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
    ]
  },
  aura_bella: {
    id: 'aura_bella',
    name: 'Aura Bella Atelier',
    logo: '🌺',
    tagline: 'Zarif Çiçeksi & Pudralı Kadın Koleksiyonları',
    preferredNotes: ['gul', 'yasemin', 'portakal_cicegi', 'ambroksan', 'vanilya', 'iris', 'lici', 'osmanthus', 'subulteber'],
    preferredCategories: ['Çiçeksi', 'Pudralı', 'Meyvemsi'],
    rndNamePrefixes: ['Aura Bella Belle', 'Fleur de', 'Rose Romantique', 'Chérie', 'Jardin Secret', 'Ethereal', 'Princesse'],
    rndNameSuffixes: ['Poudrée', 'Sensuelle', 'de Grasse', 'Féminine', 'Lumière', 'Parfum', 'Sublime'],
    imagePool: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&auto=format&fit=crop&q=80'
    ]
  }
};

/**
 * Helper to get all perfumes that a bot company can produce:
 * Merges the bot's custom R&D invented perfumes AND its signature brand catalogue!
 */
export function getBotProduciblePerfumes(bot: Company, allPerfumes: Perfume[]): Perfume[] {
  // A company strictly produces perfumes assigned to its portfolio or invented in its AR-GE lab
  const botOwned = allPerfumes.filter(
    (p) => p.producerCompanyId === bot.id || p.companyId === bot.id
  );

  return botOwned;
}

/**
 * Executes a simulated turn for all bot companies in the sector.
 */
export function tickBotSimulation(
  companies: Company[],
  rawMaterials: RawMaterial[],
  perfumes: Perfume[],
  perfumers: Perfumer[],
  orders: MarketOrder[],
  rndArchive: RndResult[],
  existingActivities: SectorActivityEvent[] = [],
  secretRecipes: SecretRecipe[] = [],
  spectatorMode: boolean = false
): {
  updatedCompanies: Company[];
  updatedMaterials: RawMaterial[];
  updatedPerfumes: Perfume[];
  updatedOrders: MarketOrder[];
  updatedRndArchive: RndResult[];
  updatedSecretRecipes: SecretRecipe[];
  newActivities: SectorActivityEvent[];
} {
  let currentCompanies = [...companies];
  let currentMaterials = [...rawMaterials];
  let currentPerfumes = [...perfumes];
  let currentOrders = [...orders];
  let currentRndArchive = [...rndArchive];
  let currentSecretRecipes = [...secretRecipes];
  const newActivities: SectorActivityEvent[] = [];

  const rawMaterialsMap = new Map(currentMaterials.map((m) => [m.id, m]));
  const perfumersMap = new Map(perfumers.map((p) => [p.id, p]));

  // In spectator mode, ALL companies are simulated as bots. Otherwise, all non-player companies run as bots.
  // Shuffle order each tick so no company gets a fixed turn-order advantage
  const botCompanies = [...(spectatorMode ? currentCompanies : currentCompanies.filter((c) => !c.isPlayer))].sort(
    () => Math.random() - 0.5
  );

  for (const bot of botCompanies) {
    const personality = BOT_PERSONALITIES[bot.id] || {
      id: bot.id,
      name: bot.name,
      logo: bot.logo,
      tagline: 'Parfüm Üreticisi',
      preferredNotes: ['bergamot', 'gul', 'sedir_agaci', 'vanilya'],
      preferredCategories: ['Narenciye', 'Çiçeksi', 'Odunsu'],
      rndNamePrefixes: [`${bot.name} Classic`],
      rndNameSuffixes: ['Noir', 'Blanc', 'Elixir'],
      imagePool: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80']
    };

    const botPerfumer = perfumersMap.get(bot.perfumerId) || perfumers[0];
    const companyIndex = currentCompanies.findIndex((c) => c.id === bot.id);
    if (companyIndex === -1) continue;

    let updatedBot: Company = {
      ...currentCompanies[companyIndex],
      salesRep: currentCompanies[companyIndex].salesRep || COMPANY_DEFAULT_SALES_REPS[bot.id] || COMPANY_DEFAULT_SALES_REPS.aromalux,
      adSpecialist:
        currentCompanies[companyIndex].adSpecialist ||
        COMPANY_DEFAULT_AD_SPECIALISTS[bot.id] ||
        COMPANY_DEFAULT_AD_SPECIALISTS.aromalux,
      countryBonuses: currentCompanies[companyIndex].countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[bot.id] || {},
      activeCampaigns: (currentCompanies[companyIndex].activeCampaigns || []).filter((c) => c.expiresAt > Date.now()),
      totalAdSpend: currentCompanies[companyIndex].totalAdSpend || 0
    };
    let acted = false;

    // STEP 0: PRE-SALE PRODUCTION IF STOCK IS LOW (So bots never stall with 0 bottles!)
    const initialBottles = Object.values(updatedBot.productStorage).reduce((s, it) => s + (it.quantity || 0), 0);
    if (initialBottles < 30) {
      const preProdResult = attemptBotProduction(updatedBot, currentPerfumes, rawMaterialsMap, currentOrders);
      if (preProdResult) {
        updatedBot = preProdResult.company;
        newActivities.push(preProdResult.activity);
      }
    }

    // STEP 1: EXPORT & WHOLESALE SALES (Driven by Sales Rep Persuasion, Perfume Fame, Country Bonuses & Note Harmony)
    const saleResult = attemptBotSale(updatedBot, currentOrders, currentPerfumes, botPerfumer);
    if (saleResult) {
      updatedBot = saleResult.company;
      currentOrders = saleResult.orders;
      currentPerfumes = saleResult.perfumes;
      newActivities.push(...saleResult.activities);
    }

    // STEP 1B: ADVERTISING CAMPAIGNS (Bots invest in targeted country ads to gradually boost Perfume Fame & Country Bonus!)
    if (updatedBot.cash >= 140000 && (updatedBot.activeCampaigns?.length || 0) < 2 && Math.random() < 0.15) {
      const adResult = attemptBotAdCampaign(updatedBot, currentPerfumes);
      if (adResult) {
        updatedBot = adResult.company;
        currentPerfumes = adResult.perfumes;
        if (adResult.newOrder) {
          currentOrders = [adResult.newOrder, ...currentOrders];
        }
        newActivities.push(adResult.activity);
      }
    }

    // STEP 1C: SALES REPRESENTATIVE PERSUASION TRAINING (Bots gradually train their Sales Rep's persuasion skill)
    if (
      updatedBot.cash >= 220000 &&
      (updatedBot.salesRep?.persuasion || 55) < 96 &&
      Math.random() < 0.08
    ) {
      const trainResult = attemptBotSalesRepTraining(updatedBot);
      if (trainResult) {
        updatedBot = trainResult.company;
        newActivities.push(trainResult.activity);
      }
    }

    // STEP 2: AR-GE & "FORMÜLÜ BUL" İNOVASYON DÖNGÜSÜ
    // Şirketler ağırlıklı olarak kendi AR-GE parfümlerini geliştirir; zaman zaman Formülü Bul masasını denerler.
    const now = Date.now();
    const botOwnedPerfumes = getBotProduciblePerfumes(updatedBot, currentPerfumes);
    const botPerfumesCount = botOwnedPerfumes.length;
    const botSecretCount = botOwnedPerfumes.filter((p) => p.sourceType === 'SECRET').length;

    // Gerçekçi bekleme süreleri (başarısız denemelerde de tam süre beklenir, oyun başında anında 7 reçete çözülmez!)
    const dynamicCooldownMs =
      botPerfumesCount === 0
        ? 15 * 1000 // Oyun başında ilk AR-GE için en az 15 sn hazırlık
        : botPerfumesCount < 3
        ? 65 * 1000 // 1-2 parfüm varken 65 saniye
        : botPerfumesCount < 5
        ? 120 * 1000 // 3-4 parfüm varken 2 dakika
        : 210 * 1000; // 5+ parfümden sonra 3.5 dakika

    // Eğer şirketin henüz lastRndInventionAt kaydı yoksa ilk turda kaydet ki 15 sn sonra ilk AR-GE başlasın
    if (!updatedBot.lastRndInventionAt) {
      updatedBot = { ...updatedBot, lastRndInventionAt: now };
    }
    const timeSinceLastInnovation = now - (updatedBot.lastRndInventionAt || now);
    const canInnovate = timeSinceLastInnovation >= dynamicCooldownMs;

    if (canInnovate && updatedBot.cash >= 35000 && Math.random() < (botPerfumesCount === 0 ? 0.85 : 0.45)) {
      // Şirketler önce kendi AR-GE parfümlerini üretir; yalnızca en az 1 AR-GE parfümü varsa ve en fazla 2 gizli reçetesi varsa %25 ihtimalle Formülü Bul dener!
      const preferFindFormula =
        botPerfumesCount >= 1 && botSecretCount < 2 && Math.random() < 0.25;

      if (preferFindFormula) {
        const formulaResult = attemptBotFindFormula(
          updatedBot,
          personality,
          botPerfumer,
          currentSecretRecipes,
          currentPerfumes,
          rawMaterialsMap
        );
        if (formulaResult) {
          updatedBot = formulaResult.company;
          currentSecretRecipes = formulaResult.secretRecipes;
          currentPerfumes = formulaResult.perfumes;
          if (formulaResult.newOrder) {
            currentOrders = [formulaResult.newOrder, ...currentOrders];
          }
          newActivities.push(formulaResult.activity);
        }
      } else {
        const rndResult = attemptBotRndInvention(
          updatedBot,
          personality,
          botPerfumer,
          rawMaterialsMap,
          currentPerfumes,
          currentRndArchive
        );
        if (rndResult) {
          updatedBot = rndResult.company;
          currentPerfumes = rndResult.perfumes;
          currentRndArchive = rndResult.rndArchive;
          if (rndResult.newOrder) {
            currentOrders = [rndResult.newOrder, ...currentOrders];
          }
          newActivities.push(rndResult.activity);
        }
      }
    }

    // STEP 3: PRODUCTION CYCLE (Produce continuously with high warehouse ceiling of 3500 bottles)
    const currentBottles = Object.values(updatedBot.productStorage).reduce((s, it) => s + (it.quantity || 0), 0);
    if (currentBottles < 3500) {
      const prodResult = attemptBotProduction(updatedBot, currentPerfumes, rawMaterialsMap, currentOrders);
      if (prodResult) {
        updatedBot = prodResult.company;
        newActivities.push(prodResult.activity);
      }
    }

    // STEP 4: RAW MATERIAL PROCUREMENT (Keep essence warehouse healthy, cap at 2000 units)
    const totalEssenceUnits = Object.values(updatedBot.essenceStorage).reduce((s, it) => s + (it.quantity || 0), 0);
    if (totalEssenceUnits < 2000 && Math.random() < 0.60) {
      const buyResult = attemptBotBuyMaterial(
        updatedBot,
        personality,
        currentMaterials,
        botPerfumer
      );
      if (buyResult) {
        updatedBot = buyResult.company;
        currentMaterials = buyResult.materials;
        newActivities.push(buyResult.activity);
      }
    }

    currentCompanies[companyIndex] = updatedBot;
  }

  const combinedActivities = [...newActivities, ...existingActivities].slice(0, 50);

  return {
    updatedCompanies: currentCompanies,
    updatedMaterials: currentMaterials,
    updatedPerfumes: currentPerfumes,
    updatedOrders: currentOrders,
    updatedRndArchive: currentRndArchive,
    updatedSecretRecipes: currentSecretRecipes,
    newActivities: combinedActivities
  };
}

/**
 * 1. BOT RAW MATERIAL PURCHASE
 * (With strict caps so bots never endlessly hoard essences)
 */
function attemptBotBuyMaterial(
  bot: Company,
  personality: BotPersonality,
  materials: RawMaterial[],
  perfumer: Perfumer
): { company: Company; materials: RawMaterial[]; activity: SectorActivityEvent } | null {
  // Cap: Keep essence warehouse healthy (cap at 2000 units)
  const totalEssence = Object.values(bot.essenceStorage).reduce((s, it) => s + (it.quantity || 0), 0);
  if (totalEssence >= 2000) {
    return null;
  }

  // Candidate materials based on preferences that bot has low stock of (< 100 units)
  const candidateMaterials = materials.filter((m) => {
    const currentHolding = bot.essenceStorage[m.id]?.quantity || 0;
    return (
      currentHolding < 100 &&
      m.exchangeStock >= 25 &&
      (personality.preferredNotes.includes(m.id) ||
        personality.preferredCategories.some((cat) => m.category?.includes(cat)))
    );
  });

  if (candidateMaterials.length === 0) return null;

  // Pick candidate material with lowest stock in bot storage
  const targetMat = candidateMaterials.sort((a, b) => {
    const stockA = bot.essenceStorage[a.id]?.quantity || 0;
    const stockB = bot.essenceStorage[b.id]?.quantity || 0;
    return stockA - stockB;
  })[0];

  // Buy moderate batch (25-45 units)
  const quantityToBuy = Math.min(
    targetMat.exchangeStock,
    Math.floor(Math.random() * 21) + 25
  );

  const purchaseCalc = calculatePurchase(quantityToBuy, targetMat.price, perfumer);

  // Safety threshold
  if (bot.cash - purchaseCalc.totalCost < 50000) {
    return null;
  }

  const newCash = Math.round((bot.cash - purchaseCalc.totalCost) * 100) / 100;
  const newExpenses = bot.totalExpenses + purchaseCalc.totalCost;
  const newNetProfit = bot.totalRevenue - newExpenses;
  const newMargin = bot.totalRevenue > 0 ? (newNetProfit / bot.totalRevenue) * 100 : 0;

  // Add into bot essence storage
  const existingItem = bot.essenceStorage[targetMat.id] || {
    rawMaterialId: targetMat.id,
    quantity: 0,
    totalCostBasis: 0,
    averageUnitCost: 0
  };

  const newTotalQty = existingItem.quantity + purchaseCalc.expectedNetQuantity;
  const newTotalCostBasis = existingItem.totalCostBasis + purchaseCalc.totalCost;
  const newAverageCost = newTotalQty > 0 ? Math.round((newTotalCostBasis / newTotalQty) * 100) / 100 : targetMat.price;

  const updatedEssenceStorage: Record<string, EssenceInventoryItem> = {
    ...bot.essenceStorage,
    [targetMat.id]: {
      rawMaterialId: targetMat.id,
      quantity: newTotalQty,
      totalCostBasis: newTotalCostBasis,
      averageUnitCost: newAverageCost
    }
  };

  const financialRecord: FinancialRecord = {
    id: `fin_bot_buy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    type: 'expense',
    category: 'raw_material_purchase',
    amount: purchaseCalc.totalCost,
    description: `Borsa Hammadde Alımı: ${quantityToBuy} adet ${targetMat.name}`,
    cashAfter: newCash
  };

  const updatedCompany: Company = {
    ...bot,
    cash: newCash,
    totalExpenses: newExpenses,
    netProfit: newNetProfit,
    profitMargin: Math.round(newMargin * 10) / 10,
    essenceStorage: updatedEssenceStorage,
    financialHistory: [financialRecord, ...bot.financialHistory.slice(0, 15)]
  };

  // Update market stock & demand
  const updatedMaterials = materials.map((m) => {
    if (m.id === targetMat.id) {
      return {
        ...m,
        exchangeStock: Math.max(0, m.exchangeStock - quantityToBuy),
        demand: Math.min(99, m.demand + 2)
      };
    }
    return m;
  });

  const activity: SectorActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    companyId: bot.id,
    companyName: bot.name,
    companyLogo: bot.logo,
    type: 'buy_essence',
    title: 'Hammadde Borsasından Esans Alındı',
    description: `${bot.name}, borsadan ${quantityToBuy} adet ${targetMat.name} satın aldı.`,
    amount: purchaseCalc.totalCost
  };

  return {
    company: updatedCompany,
    materials: updatedMaterials,
    activity
  };
}

/**
 * 2. BOT R&D INNOVATION (Inventing new perfumes & immediately producing first batch!)
 */
function attemptBotRndInvention(
  bot: Company,
  personality: BotPersonality,
  perfumer: Perfumer,
  rawMaterialsMap: Map<string, RawMaterial>,
  allPerfumes: Perfume[],
  rndArchive: RndResult[]
): {
  company: Company;
  perfumes: Perfume[];
  rndArchive: RndResult[];
  activity: SectorActivityEvent;
  newOrder?: MarketOrder;
} | null {
  // Requires at least 35.000 TL cash to perform R&D (25.000 TL AR-GE fee + pilot batch)
  const now = Date.now();
  if (bot.lastRndInventionAt && (now - bot.lastRndInventionAt) < RND_INVENTION_COOLDOWN_MS) {
    return null;
  }
  if (bot.cash < 35000) return null;

  // Bot limits custom inventions to max 60
  const botRndCount = allPerfumes.filter((p) => p.producerCompanyId === bot.id && p.sourceType === 'AR-GE').length;
  if (botRndCount >= 60) return null;

  // Select 6-7 distinct notes across Üst / Orta / Alt tiers!
  // Bots only hit the rare Golden Ratio + full family match ~14% of the time (so Nadir/Efsanevi is genuinely rare!)
  const allMaterials = Array.from(rawMaterialsMap.values());
  const perfumerFamilies = perfumer.bonusFamilies || ['Narenciye', 'Çiçeksi', 'Odunsu'];
  const isRareMasterpieceAttempt = Math.random() < 0.14;

  const pickMatForTier = (tier: 'top' | 'middle' | 'base', excludeIds: string[]): RawMaterial | undefined => {
    const familyMatches = allMaterials.filter(
      (m) =>
        m.noteTier === tier &&
        !excludeIds.includes(m.id) &&
        m.familyGroup &&
        perfumerFamilies.includes(m.familyGroup)
    );
    if (familyMatches.length > 0 && (isRareMasterpieceAttempt || Math.random() < 0.35)) {
      return familyMatches[Math.floor(Math.random() * familyMatches.length)];
    }
    const tierPool = allMaterials.filter((m) => m.noteTier === tier && !excludeIds.includes(m.id));
    if (tierPool.length > 0) {
      return tierPool[Math.floor(Math.random() * tierPool.length)];
    }
    return allMaterials.find((m) => !excludeIds.includes(m.id));
  };

  const chosenIds: string[] = [];
  const top1 = pickMatForTier('top', chosenIds);
  if (top1) chosenIds.push(top1.id);
  const top2 = pickMatForTier('top', chosenIds);
  if (top2) chosenIds.push(top2.id);

  const mid1 = pickMatForTier('middle', chosenIds);
  if (mid1) chosenIds.push(mid1.id);
  const mid2 = pickMatForTier('middle', chosenIds);
  if (mid2) chosenIds.push(mid2.id);
  const mid3 = isRareMasterpieceAttempt ? pickMatForTier('middle', chosenIds) : undefined;
  if (mid3) chosenIds.push(mid3.id);

  const base1 = pickMatForTier('base', chosenIds);
  if (base1) chosenIds.push(base1.id);
  const base2 = pickMatForTier('base', chosenIds);
  if (base2) chosenIds.push(base2.id);

  // Only 14% of attempts hit Golden Ratio (Üst: %25, Orta: %45, Alt: %30); 86% have normal/imperfect ratios
  const topDropsTotal = isRareMasterpieceAttempt ? 25 : 34;
  const midDropsTotal = isRareMasterpieceAttempt ? 45 : 36;
  const baseDropsTotal = 100 - topDropsTotal - midDropsTotal;

  const formulaItems: FormulaNoteItem[] = [
    {
      rawMaterialId: top1?.id || 'bergamot',
      rawMaterialName: top1?.name || 'Bergamot',
      drops: Math.floor(topDropsTotal / 2),
      noteType: 'top'
    },
    {
      rawMaterialId: top2?.id || 'limon',
      rawMaterialName: top2?.name || 'Limon',
      drops: topDropsTotal - Math.floor(topDropsTotal / 2),
      noteType: 'top'
    },
    {
      rawMaterialId: mid1?.id || 'gul',
      rawMaterialName: mid1?.name || 'Gül',
      drops: mid3 ? Math.floor(midDropsTotal / 3) : Math.floor(midDropsTotal / 2),
      noteType: 'middle'
    },
    {
      rawMaterialId: mid2?.id || 'yasemin',
      rawMaterialName: mid2?.name || 'Yasemin',
      drops: mid3 ? Math.floor(midDropsTotal / 3) : midDropsTotal - Math.floor(midDropsTotal / 2),
      noteType: 'middle'
    },
    ...(mid3
      ? [
          {
            rawMaterialId: mid3.id,
            rawMaterialName: mid3.name,
            drops: midDropsTotal - 2 * Math.floor(midDropsTotal / 3),
            noteType: 'middle' as const
          }
        ]
      : []),
    {
      rawMaterialId: base1?.id || 'sandal_agaci',
      rawMaterialName: base1?.name || 'Sandal Ağacı',
      drops: Math.floor(baseDropsTotal / 2),
      noteType: 'base'
    },
    {
      rawMaterialId: base2?.id || 'vanilya',
      rawMaterialName: base2?.name || 'Vanilya',
      drops: baseDropsTotal - Math.floor(baseDropsTotal / 2),
      noteType: 'base'
    }
  ];

  // Generate perfume name
  const prefix = personality.rndNamePrefixes[Math.floor(Math.random() * personality.rndNamePrefixes.length)];
  const suffix = personality.rndNameSuffixes[Math.floor(Math.random() * personality.rndNameSuffixes.length)];
  const uniqueNum = Math.floor(Math.random() * 89) + 10;
  const perfumeName = `${prefix} ${suffix} N°${uniqueNum}`;

  const genders: GenderType[] = ['UNISEX', 'KADIN', 'ERKEK'];
  const gender = genders[Math.floor(Math.random() * genders.length)];

  let rndResult: RndResult;
  try {
    rndResult = generateRndFromFormula(
      perfumeName,
      formulaItems,
      gender,
      rawMaterialsMap,
      bot,
      perfumer
    );
  } catch (err) {
    return null;
  }

  const designFee = RND_BASE_FEE; // Her zaman tam 25.000 TL AR-GE Ücreti
  const totalCost = designFee;

  const newCash = Math.max(0, bot.cash - totalCost);
  const newExpenses = bot.totalExpenses + totalCost;
  const newNetProfit = bot.totalRevenue - newExpenses;
  const newMargin = bot.totalRevenue > 0 ? (newNetProfit / bot.totalRevenue) * 100 : 0;

  const randomImage = personality.imagePool[Math.floor(Math.random() * personality.imagePool.length)];

  // Convert RndResult to a full registered Perfume in production catalog
  const newPerfume: Perfume = {
    id: `bot_perfume_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: rndResult.name,
    brand: bot.name,
    companyId: bot.id,
    companyName: bot.name,
    perfumerId: perfumer.id,
    perfumerName: perfumer.name,
    gender: rndResult.gender,
    sourceType: 'AR-GE',
    quality: rndResult.qualityScore,
    originality: rndResult.originalityScore,
    noteHarmony: rndResult.harmonyScore,
    trendFit: rndResult.trendScore,
    resultLevel: rndResult.resultLevel,
    topNotes: rndResult.topNotes,
    middleNotes: rndResult.middleNotes,
    baseNotes: rndResult.baseNotes,
    notes: [...rndResult.topNotes, ...rndResult.middleNotes, ...rndResult.baseNotes],
    producerCompanyId: bot.id,
    recipe: rndResult.recipe,
    productionTime: rndResult.productionTime || 25,
    image: randomImage,
    source: `${bot.name} Laboratuvar AR-GE İcadı`,
    suggestedRetailPrice: rndResult.estimatedMarketPrice,
    description: `${bot.name} & ${perfumer.name} ortaklığıyla geliştirilen ${rndResult.resultLevel} seviye özgün AR-GE formülü. ${rndResult.notesSummary}.`,
    designFee: designFee,
    royaltyRate: perfumer.royaltyRate || 0.03,
    createdAt: Date.now()
  };

  // Register in productStorage with 0 bottles: Bot MUST produce it in the Production Facility (Üretim Tesisi) using raw materials!
  const estUnitCost = rndResult.productionCost || Math.max(120, newPerfume.suggestedRetailPrice - 600);
  const updatedProductStorage: Record<string, ProductInventoryItem> = {
    ...bot.productStorage,
    [newPerfume.id]: {
      perfumeId: newPerfume.id,
      quantity: 0,
      totalCostBasis: 0,
      unitCost: estUnitCost,
      lastSalePrice: newPerfume.suggestedRetailPrice,
      suggestedSalePrice: newPerfume.suggestedRetailPrice,
      totalSold: 0
    }
  };

  const financialRecord: FinancialRecord = {
    id: `fin_bot_rnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    type: 'expense',
    category: 'rnd_expense',
    amount: totalCost,
    description: `AR-GE İcat Ücreti (25.000 ₺): ${perfumeName} (${rndResult.resultLevel} • Üretim Tesisine Eklendi)`,
    cashAfter: newCash
  };

  const updatedCompany: Company = {
    ...bot,
    lastRndInventionAt: now,
    cash: newCash,
    totalExpenses: newExpenses,
    netProfit: newNetProfit,
    profitMargin: Math.round(newMargin * 10) / 10,
    productStorage: updatedProductStorage,
    financialHistory: [financialRecord, ...bot.financialHistory.slice(0, 15)]
  };

  const activity: SectorActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    companyId: bot.id,
    companyName: bot.name,
    companyLogo: bot.logo,
    type: 'invent_perfume',
    title: `🔬 AR-GE: ${newPerfume.name} (${rndResult.resultLevel}) Formülü Geliştirildi`,
    description: `${bot.name}, Baş Parfümör ${perfumer.name} ile ${rndResult.recipe.length} notalı "${newPerfume.name}" (${rndResult.resultLevel}) formülünü geliştirdi ve Üretim Tesisine gönderdi.`,
    highlight: rndResult.resultLevel === 'Nadir' || rndResult.resultLevel === 'Efsanevi',
    amount: totalCost
  };

  // Generate an international launch order in one of the Perfumer's Favored Countries!
  const favoredCountryName =
    (perfumer.favoredCountries && perfumer.favoredCountries.length > 0
      ? perfumer.favoredCountries[Math.floor(Math.random() * perfumer.favoredCountries.length)]
      : 'Fransa');
  const launchCountryInfo =
    GLOBAL_MARKET_COUNTRIES.find((c) => c.name === normalizeCountryName(favoredCountryName)) ||
    GLOBAL_MARKET_COUNTRIES[0];
  const launchClient =
    launchCountryInfo.vipClientNames[Math.floor(Math.random() * launchCountryInfo.vipClientNames.length)];

  const launchOrder: MarketOrder = {
    id: `ord_launch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    country: launchCountryInfo.fullName,
    countryFlag: launchCountryInfo.flag,
    clientName: `${launchClient} (${perfumer.name} Özel Lansman)`,
    orderType: 'single',
    orderCategory: 'Yeni AR-GE & Usta Nota Lansman Kontratı',
    productId: newPerfume.id,
    productName: newPerfume.name,
    requestedQuantity: 30,
    remainingQuantity: 30,
    pricePerUnit: Math.round(newPerfume.suggestedRetailPrice * 1.18),
    totalOrderValue: 30 * Math.round(newPerfume.suggestedRetailPrice * 1.18),
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000 * 3,
    status: 'active'
  };

  return {
    company: updatedCompany,
    perfumes: [newPerfume, ...allPerfumes],
    rndArchive: [rndResult, ...rndArchive],
    activity,
    newOrder: launchOrder
  };
}

/**
 * 2B. BOT "FORMÜLÜ BUL" / SECRET RECIPE DEDUCTION
 * Bots actively participate in Formülü Bul (paying 10.000 TL fee)
 * Inventing, discovering and immediately producing pilot batch of unique formula!
 */
function attemptBotFindFormula(
  bot: Company,
  personality: BotPersonality,
  perfumer: Perfumer,
  currentSecretRecipes: SecretRecipe[],
  currentPerfumes: Perfume[],
  rawMaterialsMap: Map<string, RawMaterial>
): {
  company: Company;
  secretRecipes: SecretRecipe[];
  perfumes: Perfume[];
  activity: SectorActivityEvent;
  newOrder?: MarketOrder;
} | null {
  // Requires at least 20.000 TL cash so paying 10.000 TL fee leaves operational cash
  if (bot.cash < 20000) return null;

  const fee = 10000; // ALWAYS exactly 10.000 ₺ fee

  // Ensure fresh unique secret formula is available
  const pool = ensureSecretRecipePool(currentSecretRecipes, 5, currentPerfumes);
  // Pick an unsolved secret recipe or generate a brand new one
  let targetSecret = pool.find((s) => s.status !== 'solved');
  if (!targetSecret) {
    targetSecret = generateUniqueSecretRecipe(pool, currentPerfumes);
    pool.push(targetSecret);
  }

  // Deduct 10.000 TL fee from bot cash
  const newCash = Math.round((bot.cash - fee) * 100) / 100;
  const newExpenses = bot.totalExpenses + fee;
  const newNetProfit = bot.totalRevenue - newExpenses;
  const newMargin = bot.totalRevenue > 0 ? (newNetProfit / bot.totalRevenue) * 100 : 0;

  // 12% chance to solve the 3x12 note secret formula within 3 hearts (88% chance a tier runs out of 3 hearts and formula burns!)
  const didCrackSecret = Math.random() < 0.12;

  if (!didCrackSecret) {
    const failedFinancialRecord: FinancialRecord = {
      id: `fin_bot_findform_fail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type: 'expense',
      category: 'rnd_expense',
      amount: fee,
      description: `Formülü Bul Yanlış Analiz (3 Hak Bitti - Formül Yandı): ${targetSecret.codeName} (10.000 ₺)`,
      cashAfter: newCash
    };

    const failedCompany: Company = {
      ...bot,
      // Full cooldown even on failure so bot cannot retry every tick!
      lastRndInventionAt: Date.now(),
      cash: newCash,
      totalExpenses: newExpenses,
      netProfit: newNetProfit,
      profitMargin: Math.round(newMargin * 10) / 10,
      financialHistory: [failedFinancialRecord, ...bot.financialHistory.slice(0, 15)]
    };

    const failActivity: SectorActivityEvent = {
      id: `act_secret_fail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      companyId: bot.id,
      companyName: bot.name,
      companyLogo: bot.logo,
      type: 'invent_perfume',
      title: '🕵️ Formülü Bul: 3 Hak Bitti, Gizli Formül Bozuldu',
      description: `${bot.name}, 10.000 ₺ ödeyerek ${targetSecret.codeName} gizli reçetesini çözmeyi denedi ancak 12 adaylı katmanlarda 3 hakkını tüketerek formülü yaktı.`,
      highlight: false,
      amount: fee
    };

    return {
      company: failedCompany,
      secretRecipes: pool,
      perfumes: currentPerfumes,
      activity: failActivity
    };
  }

  // Convert the solved secret into a real prestigious Perfume for this bot (6-8 notes)
  const solvedPerfume = convertSecretToPerfume(targetSecret, bot.id, perfumer, bot.name);
  const estCost = Math.max(140, Math.round(solvedPerfume.suggestedRetailPrice * 0.25));

  // Register with 0 bottles: Bot MUST produce it in its Production Facility (Üretim Tesisi) using raw materials!
  const updatedProductStorage: Record<string, ProductInventoryItem> = {
    ...bot.productStorage,
    [solvedPerfume.id]: {
      perfumeId: solvedPerfume.id,
      quantity: 0,
      totalCostBasis: 0,
      unitCost: estCost,
      lastSalePrice: solvedPerfume.suggestedRetailPrice,
      suggestedSalePrice: solvedPerfume.suggestedRetailPrice,
      totalSold: 0
    }
  };

  const financialRecord: FinancialRecord = {
    id: `fin_bot_findform_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    type: 'expense',
    category: 'rnd_expense',
    amount: fee,
    description: `Formülü Bul AR-GE Deşifre Ücreti: ${targetSecret.codeName} (10.000 ₺ • Üretim Tesisine Eklendi)`,
    cashAfter: newCash
  };

  const updatedCompany: Company = {
    ...bot,
    lastRndInventionAt: Date.now(),
    cash: newCash,
    totalExpenses: newExpenses,
    netProfit: newNetProfit,
    profitMargin: Math.round(newMargin * 10) / 10,
    productStorage: updatedProductStorage,
    financialHistory: [financialRecord, ...bot.financialHistory.slice(0, 15)]
  };

  // Mark this secret recipe as solved
  const updatedSecretRecipes = pool.map((s) => {
    if (s.id === targetSecret!.id) {
      return {
        ...s,
        status: 'solved' as const,
        isPurchased: true,
        solvedBy: bot.name
      };
    }
    return s;
  });

  // Ensure fresh pool has a new unsolved unique formula in background
  const finalSecrets = ensureSecretRecipePool(updatedSecretRecipes, 5, [solvedPerfume, ...currentPerfumes]);

  // Create a launch order for the newly solved Secret Perfume so international buyers immediately demand it!
  const favoredCountryName =
    perfumer.favoredCountries && perfumer.favoredCountries.length > 0
      ? perfumer.favoredCountries[Math.floor(Math.random() * perfumer.favoredCountries.length)]
      : 'Fransa';
  const launchCountryInfo =
    GLOBAL_MARKET_COUNTRIES.find((c) => c.name === normalizeCountryName(favoredCountryName)) ||
    GLOBAL_MARKET_COUNTRIES[0];
  const launchClient =
    launchCountryInfo.vipClientNames[Math.floor(Math.random() * launchCountryInfo.vipClientNames.length)];

  const secretLaunchOrder: MarketOrder = {
    id: `ord_secret_launch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    country: launchCountryInfo.fullName,
    countryFlag: launchCountryInfo.flag,
    clientName: `${launchClient} (Gizli Reçete Lansmanı)`,
    orderType: 'single',
    orderCategory: 'Deşifre Edilen Gizli Reçete (Secret) Kontratı',
    productId: solvedPerfume.id,
    productName: solvedPerfume.name,
    requestedQuantity: 35,
    remainingQuantity: 35,
    pricePerUnit: Math.round(solvedPerfume.suggestedRetailPrice * 1.22),
    totalOrderValue: 35 * Math.round(solvedPerfume.suggestedRetailPrice * 1.22),
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000 * 3,
    status: 'active'
  };

  const activity: SectorActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    companyId: bot.id,
    companyName: bot.name,
    companyLogo: bot.logo,
    type: 'invent_perfume',
    title: '🕵️ Formülü Bul: Gizli Reçete Çözüldü ve Üretim Tesisine Gönderildi!',
    description: `${bot.name}, ${targetSecret.codeName} kod adlı ${solvedPerfume.recipe.length} notalık gizli formülü deşifre etti! "${solvedPerfume.name}" (${solvedPerfume.resultLevel}) reçetesi şirketin Üretim Tesisine eklendi (hammadde tedarik edilerek üretilecek).`,
    highlight: true,
    amount: fee
  };

  return {
    company: updatedCompany,
    secretRecipes: finalSecrets,
    perfumes: [solvedPerfume, ...currentPerfumes],
    activity,
    newOrder: secretLaunchOrder
  };
}

/**
 * 3. BOT PERFUME PRODUCTION
 */
function attemptBotProduction(
  bot: Company,
  allPerfumes: Perfume[],
  rawMaterialsMap: Map<string, RawMaterial>,
  orders: MarketOrder[] = []
): { company: Company; activity: SectorActivityEvent } | null {
  // Get all AR-GE and SECRET perfumes owned by this company
  const botPerfumes = getBotProduciblePerfumes(bot, allPerfumes);
  if (botPerfumes.length === 0) return null;

  // PRIORITY 1: Brand-new AR-GE or Formülü Bul (SECRET) perfume that has NEVER been produced yet (0 bottles & 0 sold)!
  const unproducedNewPerfume = botPerfumes.find((p) => {
    const item = bot.productStorage[p.id];
    return !item || ((item.quantity || 0) === 0 && (item.totalSold || 0) === 0);
  });

  // PRIORITY 2: Any perfume in the company's portfolio that is currently out of stock (0 bottles)
  const zeroStockPerfumes = botPerfumes.filter((p) => (bot.productStorage[p.id]?.quantity || 0) === 0);
  const zeroStockPick =
    zeroStockPerfumes.length > 0
      ? zeroStockPerfumes[Math.floor(Math.random() * zeroStockPerfumes.length)]
      : null;

  // PRIORITY 3: Active export order (single or bundle item) matching one of bot's perfumes with < 60 stock (randomized so it doesn't always pick index 0)
  const activeOrders = orders.filter((o) => o.status === 'active');
  const exportTargets = botPerfumes.filter((p) => {
    const hasOrder = activeOrders.some((o) => {
      if (o.items && o.items.length > 0) {
        return o.items.some((sub) => sub.productId === p.id && sub.remainingQuantity > 0);
      }
      return o.productId === p.id && o.remainingQuantity > 0;
    });
    const curStock = bot.productStorage[p.id]?.quantity || 0;
    return hasOrder && curStock < 60;
  });
  const exportTarget =
    exportTargets.length > 0
      ? exportTargets[Math.floor(Math.random() * exportTargets.length)]
      : null;

  // PRIORITY 4: Rotate evenly across all owned AR-GE & SECRET perfumes by picking the one with the lowest current bottle count
  const sortedByLowestStock = [...botPerfumes].sort(
    (a, b) => (bot.productStorage[a.id]?.quantity || 0) - (bot.productStorage[b.id]?.quantity || 0)
  );

  const candidatePerfume =
    unproducedNewPerfume ||
    zeroStockPick ||
    exportTarget ||
    sortedByLowestStock[0];

  const candidateFame = getPerfumeFame(candidatePerfume);
  // Distinct production rhythm & batch sizes per company strategy so companies don't produce identical volumes
  const companyBatchProfiles: Record<string, number[]> = {
    scentora: candidateFame >= 55 ? [30, 50, 75] : [15, 25, 40], // Royal Niche: smaller, high-margin luxury batches
    parfuma: candidateFame >= 55 ? [65, 95, 130] : [35, 55, 85], // Global Chain: high-volume mass export batches
    aura_bella: candidateFame >= 55 ? [40, 65, 90] : [20, 35, 55] // Artisanal Atelier: balanced seasonal waves
  };
  const batchOptions =
    companyBatchProfiles[bot.id] || (candidateFame >= 60 ? [45, 75, 110] : [20, 35, 55, 70]);
  const batchSize = batchOptions[Math.floor(Math.random() * batchOptions.length)];
  const laborCost = Math.round(batchSize * 45); // 45 TL factory labor per bottle

  if (bot.cash < laborCost + 15000) return null;

  let extraProcurementCost = 0;
  let totalEssenceCost = 0;
  const updatedEssenceStorage = { ...bot.essenceStorage };

  for (const item of candidatePerfume.recipe) {
    // Formula amounts are in permille (‰). For 100 bottles, each note requires (amount / 10) essence units
    const requiredAmount = Math.max(1, Math.round((item.amount / 10) * (batchSize / 100)));
    const currentStock = updatedEssenceStorage[item.rawMaterialId]?.quantity || 0;
    const mat = rawMaterialsMap.get(item.rawMaterialId);
    const unitPrice = mat?.price || 140;
    const avgCost = updatedEssenceStorage[item.rawMaterialId]?.averageUnitCost || unitPrice;

    // Check if missing
    if (currentStock < requiredAmount) {
      const missing = requiredAmount - currentStock;
      const procurementCost = Math.round(missing * unitPrice);

      // Bot auto-procures missing essence to ensure production runs!
      if (bot.cash - (laborCost + extraProcurementCost + procurementCost) >= 15000) {
        extraProcurementCost += procurementCost;
        const prevBasis = updatedEssenceStorage[item.rawMaterialId]?.totalCostBasis || 0;
        updatedEssenceStorage[item.rawMaterialId] = {
          rawMaterialId: item.rawMaterialId,
          quantity: requiredAmount,
          totalCostBasis: prevBasis + procurementCost,
          averageUnitCost: unitPrice
        };
      } else {
        return null;
      }
    }

    // Consume requiredAmount
    const itemStock = updatedEssenceStorage[item.rawMaterialId]?.quantity || requiredAmount;
    const itemBasis = updatedEssenceStorage[item.rawMaterialId]?.totalCostBasis || 0;
    const itemAvg = updatedEssenceStorage[item.rawMaterialId]?.averageUnitCost || avgCost;

    const newStock = Math.max(0, itemStock - requiredAmount);
    const newBasis = Math.max(0, itemBasis - (requiredAmount * itemAvg));

    updatedEssenceStorage[item.rawMaterialId] = {
      rawMaterialId: item.rawMaterialId,
      quantity: newStock,
      totalCostBasis: newBasis,
      averageUnitCost: itemAvg
    };
    totalEssenceCost += requiredAmount * itemAvg;
  }

  const totalSpent = laborCost + extraProcurementCost;
  const newCash = Math.round((bot.cash - totalSpent) * 100) / 100;
  const newExpenses = bot.totalExpenses + totalSpent;
  const newNetProfit = bot.totalRevenue - newExpenses;
  const newMargin = bot.totalRevenue > 0 ? (newNetProfit / bot.totalRevenue) * 100 : 0;

  // Batch cost calculation
  const totalBatchCost = totalEssenceCost + laborCost;
  const unitCost = Math.round((totalBatchCost / batchSize) * 100) / 100;

  // Add into bot product storage
  const prevProduct = bot.productStorage[candidatePerfume.id] || {
    perfumeId: candidatePerfume.id,
    quantity: 0,
    totalCostBasis: 0,
    unitCost: unitCost,
    lastSalePrice: candidatePerfume.suggestedRetailPrice,
    suggestedSalePrice: candidatePerfume.suggestedRetailPrice,
    totalSold: 0
  };

  const newProductQuantity = prevProduct.quantity + batchSize;
  const newProductCostBasis = prevProduct.totalCostBasis + totalBatchCost;
  const newWeightedUnitCost = Math.round((newProductCostBasis / newProductQuantity) * 100) / 100;

  const updatedProductStorage: Record<string, ProductInventoryItem> = {
    ...bot.productStorage,
    [candidatePerfume.id]: {
      ...prevProduct,
      quantity: newProductQuantity,
      totalCostBasis: newProductCostBasis,
      unitCost: newWeightedUnitCost,
      lastCostBreakdown: {
        rawMaterialCost: totalEssenceCost,
        taxCost: Math.round(totalEssenceCost * 0.2),
        logisticsCost: Math.round(totalEssenceCost * 0.15),
        wasteCost: Math.round(totalEssenceCost * 0.25),
        essenceProductionCost: Math.round(totalEssenceCost * 0.08),
        factoryLaborCost: laborCost,
        totalCost: totalBatchCost,
        unitCost: newWeightedUnitCost
      }
    }
  };

  const isRnd = candidatePerfume.sourceType === 'AR-GE';
  const isSecret = candidatePerfume.sourceType === 'SECRET';
  const sourceBadge = isSecret ? ' (Gizli Reçete / Formülü Bul)' : isRnd ? ' (AR-GE İcadı)' : '';
  const financialRecord: FinancialRecord = {
    id: `fin_bot_prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    type: 'expense',
    category: 'production_fee',
    amount: totalSpent,
    description: `Fabrika Üretim Hattı: ${batchSize} adet ${candidatePerfume.name} üretildi.${sourceBadge}`,
    cashAfter: newCash
  };

  const updatedCompany: Company = {
    ...bot,
    cash: newCash,
    totalExpenses: newExpenses,
    netProfit: newNetProfit,
    profitMargin: Math.round(newMargin * 10) / 10,
    essenceStorage: updatedEssenceStorage,
    productStorage: updatedProductStorage,
    financialHistory: [financialRecord, ...bot.financialHistory.slice(0, 15)]
  };

  const activity: SectorActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    companyId: bot.id,
    companyName: bot.name,
    companyLogo: bot.logo,
    type: 'complete_production',
    title: isSecret
      ? '🕵️ Gizli Reçete (Formülü Bul) Parfümü Üretildi'
      : isRnd
      ? '🔬 AR-GE Parfümü Üretimi Tamamlandı'
      : '🏭 Fabrika Üretim Hattı Tamamlandı',
    description: `${bot.name}, Üretim Tesisinde ${batchSize} şişe "${candidatePerfume.name}"${sourceBadge} üretimini tamamladı ve satış için mamul deposuna teslim etti.`,
    amount: totalSpent,
    highlight: true
  };

  return {
    company: updatedCompany,
    activity
  };
}

/**
 * 4. BOT SALES (Export order fulfillment [single/bundle] & Domestic Wholesale liquidation)
 * Driven by Sales Rep Persuasion, Perfume Fame, Country Bonuses & Regional Popularity!
 */
function attemptBotSale(
  bot: Company,
  orders: MarketOrder[],
  allPerfumes: Perfume[],
  botPerfumer?: Perfumer
): {
  company: Company;
  orders: MarketOrder[];
  perfumes: Perfume[];
  activities: SectorActivityEvent[];
} | null {
  const stockItems = Object.values(bot.productStorage).filter((p) => p.quantity > 0);
  if (stockItems.length === 0) return null;

  let currentBot = { ...bot };
  let currentSalesRep = {
    ...(bot.salesRep || COMPANY_DEFAULT_SALES_REPS[bot.id] || COMPANY_DEFAULT_SALES_REPS.aromalux)
  };
  let currentProductStorage = { ...bot.productStorage };
  let currentOrders = orders;
  let updatedPerfumes = [...allPerfumes];
  const activities: SectorActivityEvent[] = [];
  const financialRecords: FinancialRecord[] = [];
  let totalGrossGain = 0;
  let totalBonusEarned = 0;
  let dealsCount = 0;

  // OPTION A: Fulfill active export market order (prioritize orders with highest Country + Fame + Persuasion bonus!)
  const activeOrders = currentOrders.filter((o) => o.status === 'active');

  interface CandidateOrderMatch {
    order: MarketOrder;
    productId: string;
    productName: string;
    basePrice: number;
    maxDemand: number;
    finalUnitPrice: number;
    totalBonusRate: number;
    isPopular: boolean;
    countryNoteHarmonyBonusRate: number;
    perfumerNoteMasteryBonusRate: number;
    matchedCountryNotesCount: number;
    matchedPerfumerNotesCount: number;
    perfumerOlfactoryFamily: string;
  }

  const candidateMatches: CandidateOrderMatch[] = [];

  const nowTs = Date.now();
  for (const order of activeOrders) {
    const normOrderCountry = normalizeCountryName(order.country);
    const isPenalizedInCountry = Boolean(
      currentBot.countryPenalties && (currentBot.countryPenalties[normOrderCountry] || 0) > nowTs
    );
    // If rival applied a strategic showcase move in this country, mild 18% priority slowdown (never blocks game flow)
    if (isPenalizedInCountry && Math.random() < 0.18) {
      continue;
    }

    if (order.items && order.items.length > 0) {
      for (const sub of order.items) {
        if (sub.remainingQuantity > 0 && (currentProductStorage[sub.productId]?.quantity || 0) >= 1) {
          const perf = updatedPerfumes.find((p) => p.id === sub.productId);
          const m = calculateSaleMarketingBonuses(sub.pricePerUnit, currentBot, perf, order.country, botPerfumer);
          candidateMatches.push({
            order,
            productId: sub.productId,
            productName: sub.productName,
            basePrice: sub.pricePerUnit,
            maxDemand: sub.remainingQuantity,
            finalUnitPrice: m.finalUnitPrice,
            totalBonusRate: m.totalBonusRate,
            isPopular: m.isPopularInCountry,
            countryNoteHarmonyBonusRate: m.countryNoteHarmonyBonusRate,
            perfumerNoteMasteryBonusRate: m.perfumerNoteMasteryBonusRate,
            matchedCountryNotesCount: m.matchedCountryNotes.length,
            matchedPerfumerNotesCount: m.matchedPerfumerNotes.length,
            perfumerOlfactoryFamily: m.perfumerOlfactoryFamily
          });
        }
      }
    } else if (order.remainingQuantity > 0 && (currentProductStorage[order.productId]?.quantity || 0) >= 1) {
      const perf = updatedPerfumes.find((p) => p.id === order.productId);
      const m = calculateSaleMarketingBonuses(order.pricePerUnit, currentBot, perf, order.country, botPerfumer);
      candidateMatches.push({
        order,
        productId: order.productId,
        productName: order.productName,
        basePrice: order.pricePerUnit,
        maxDemand: order.remainingQuantity,
        finalUnitPrice: m.finalUnitPrice,
        totalBonusRate: m.totalBonusRate,
        isPopular: m.isPopularInCountry,
        countryNoteHarmonyBonusRate: m.countryNoteHarmonyBonusRate,
        perfumerNoteMasteryBonusRate: m.perfumerNoteMasteryBonusRate,
        matchedCountryNotesCount: m.matchedCountryNotes.length,
        matchedPerfumerNotesCount: m.matchedPerfumerNotes.length,
        perfumerOlfactoryFamily: m.perfumerOlfactoryFamily
      });
    }
  }

  // Sort matches so the bot picks the order where Country Favorite Note Harmony + Perfumer Note Mastery + Persuasion yield the highest premium!
  candidateMatches.sort(
    (a, b) =>
      b.totalBonusRate +
      b.countryNoteHarmonyBonusRate * 0.5 +
      b.perfumerNoteMasteryBonusRate * 0.5 -
      (a.totalBonusRate + a.countryNoteHarmonyBonusRate * 0.5 + a.perfumerNoteMasteryBonusRate * 0.5)
  );
  const bestMatch = candidateMatches[0];

  // Dynamic conversion chance & volume driven by Perfumer Note Mastery + Country Favorite Note Harmony + Company Archetype!
  const harmonyBoost = bestMatch
    ? bestMatch.matchedCountryNotesCount * 0.11 + bestMatch.matchedPerfumerNotesCount * 0.09
    : 0;
  const exportConversionChance = Math.min(
    0.98,
    Math.max(0.55, 0.55 + (currentSalesRep.persuasion || 55) * 0.003 + harmonyBoost)
  );

  if (bestMatch && Math.random() < exportConversionChance) {
    const {
      order: targetOrder,
      productId: targetProductId,
      productName: targetProductName,
      basePrice,
      maxDemand,
      finalUnitPrice,
      totalBonusRate,
      isPopular,
      countryNoteHarmonyBonusRate,
      perfumerNoteMasteryBonusRate,
      matchedCountryNotesCount,
      matchedPerfumerNotesCount,
      perfumerOlfactoryFamily
    } = bestMatch;
    const availableStock = currentProductStorage[targetProductId]?.quantity || 0;

    // Volume strongly diverges based on whether Country Note Harmony & Perfumer Specialty are matched!
    const noteVolumeMultiplier =
      matchedCountryNotesCount >= 3 && matchedPerfumerNotesCount >= 2
        ? 1.75
        : matchedCountryNotesCount >= 2 || matchedPerfumerNotesCount >= 2
        ? 1.35
        : matchedCountryNotesCount === 0
        ? 0.45
        : 0.85;
    const companyVolumeFactor =
      currentBot.id === 'parfuma' ? 1.30 : currentBot.id === 'scentora' ? 0.82 : 1.05;

    const maxCap = Math.max(
      6,
      Math.round((22 + (currentSalesRep.persuasion || 55) * 0.65) * noteVolumeMultiplier * companyVolumeFactor)
    );
    const sellQty = Math.min(availableStock, maxDemand, maxCap);
    const grossRevenue = Math.round(sellQty * finalUnitPrice);
    const baseRev = Math.round(sellQty * basePrice);
    const bonusRev = Math.max(0, grossRevenue - baseRev);

    // Update order
    if (targetOrder.items && targetOrder.items.length > 0) {
      const updatedSubItems = targetOrder.items.map((sub) => {
        if (sub.productId === targetProductId) {
          return { ...sub, remainingQuantity: Math.max(0, sub.remainingQuantity - sellQty) };
        }
        return sub;
      });
      const newTotalRem = updatedSubItems.reduce((acc, curr) => acc + curr.remainingQuantity, 0);
      const isCompleted = newTotalRem <= 0;

      currentOrders = currentOrders.map((o) => {
        if (o.id === targetOrder.id) {
          return {
            ...o,
            items: updatedSubItems,
            remainingQuantity: newTotalRem,
            status: isCompleted ? ('completed' as const) : ('active' as const)
          };
        }
        return o;
      });
    } else {
      const newRemaining = Math.max(0, targetOrder.remainingQuantity - sellQty);
      const isCompleted = newRemaining <= 0;
      currentOrders = currentOrders.map((o) => {
        if (o.id === targetOrder.id) {
          return {
            ...o,
            remainingQuantity: newRemaining,
            status: isCompleted ? ('completed' as const) : ('active' as const)
          };
        }
        return o;
      });
    }

    const currentProd = currentProductStorage[targetProductId];
    const newStock = Math.max(0, currentProd.quantity - sellQty);
    const newBasis = Math.max(0, currentProd.totalCostBasis - sellQty * currentProd.unitCost);
    const normExportCountry = normalizeCountryName(targetOrder.country);
    const prevCountrySales = currentProd.countrySales || {};
    const prevCountryRev = currentProd.countryRevenue || {};

    currentProductStorage[targetProductId] = {
      ...currentProd,
      quantity: newStock,
      totalCostBasis: newBasis,
      totalSold: currentProd.totalSold + sellQty,
      lastSalePrice: finalUnitPrice,
      countrySales: {
        ...prevCountrySales,
        [normExportCountry]: (prevCountrySales[normExportCountry] || 0) + sellQty
      },
      countryRevenue: {
        ...prevCountryRev,
        [normExportCountry]: (prevCountryRev[normExportCountry] || 0) + grossRevenue
      }
    };

    // Gradually boost perfume Fame (+0.5 to +1 from international export)
    const exportFameGain = sellQty >= 45 ? 1 : 0.5;
    updatedPerfumes = updatedPerfumes.map((p) => {
      if (p.id === targetProductId) {
        return { ...p, fame: Math.min(100, Math.round((getPerfumeFame(p) + exportFameGain) * 10) / 10) };
      }
      return p;
    });

    totalGrossGain += grossRevenue;
    totalBonusEarned += bonusRev;
    dealsCount += 1;

    const bonusPct = Math.round(totalBonusRate * 100);
    const noteBonusPct = Math.round((countryNoteHarmonyBonusRate + perfumerNoteMasteryBonusRate) * 100);
    const noteHarmonyTag =
      noteBonusPct > 0
        ? ` • 🎵 Ülke Nota & Parfümatör (${botPerfumer?.name || 'Usta'} - ${perfumerOlfactoryFamily}) Fiyat Farkı: +%${noteBonusPct}`
        : '';

    const finRec: FinancialRecord = {
      id: `fin_bot_sale_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type: 'income',
      category: 'product_sale',
      amount: grossRevenue,
      description: `Uluslararası İhracat (${targetOrder.country}): ${sellQty} adet ${targetProductName} [Toplam Fiyat Farkı: +%${bonusPct}${noteHarmonyTag}]`,
      cashAfter: currentBot.cash + grossRevenue
    };
    financialRecords.push(finRec);

    const isBundle = targetOrder.orderType === 'bundle_3' || targetOrder.orderType === 'bundle_5';
    activities.push({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      companyId: currentBot.id,
      companyName: currentBot.name,
      companyLogo: currentBot.logo,
      type: 'export_order',
      title: isBundle
        ? `📦 Prestij İhracatı (+%${bonusPct} Toplam Fiyat Farkı)`
        : `📦 Küresel İhracat Teslimatı (+%${bonusPct} Fiyat Farkı)`,
      description: `${currentBot.name} (Parfümatör: ${botPerfumer?.name || 'Usta'} • ${perfumerOlfactoryFamily}), ${targetOrder.country} pazarındaki "${targetOrder.clientName}" anlaşmasında ${sellQty} şişe "${targetProductName}" parfümünü ${matchedCountryNotesCount >= 2 ? `🎵 ${matchedCountryNotesCount} Sevilen Nota Uyumu (+%${noteBonusPct} Ekstra Nota Fiyat Farkı) ve ` : isPopular ? '🔥 Bölgesel Popülerlik ve ' : ''}ikna primiyle şişesi ${finalUnitPrice} ₺'den sattı!`,
      amount: grossRevenue,
      highlight: true
    });
  }

  // OPTION B: Domestic & Global Boutique Distribution (Strongly differentiated by Perfumer Note Mastery & Country Note Harmony!)
  const surplusCandidates = Object.values(currentProductStorage).filter((p) => p.quantity >= 2);
  // Each company has its own boutique cadence so they don't sell at the same rate every turn, while remaining fluid
  const companyCadenceChance =
    currentBot.id === 'scentora' ? 0.72 : currentBot.id === 'parfuma' ? 0.94 : 0.84;

  const shuffledCandidates =
    Math.random() < companyCadenceChance
      ? [...surplusCandidates].sort(() => Math.random() - 0.5).slice(0, 2)
      : [];

  for (const surplusItem of shuffledCandidates) {
    const perfume = updatedPerfumes.find((p) => p.id === surplusItem.perfumeId);
    const fame = perfume ? getPerfumeFame(perfume) : 25;
    const persuasion = currentSalesRep.persuasion || 55;
    const hasActiveAd = (currentBot.activeCampaigns || []).some((c) => c.perfumeId === surplusItem.perfumeId);

    // Pick a target country from Perfumer's Favored Countries, Sales Rep Specialty, or Global Markets
    const candidateCountries = Array.from(
      new Set([
        ...(botPerfumer?.favoredCountries || []),
        ...(currentSalesRep.specialtyCountries || []),
        'Fransa',
        'Birleşik Arap Emirlikleri',
        'ABD',
        'İtalya',
        'Japonya'
      ])
    );
    const chosenCountry = candidateCountries[Math.floor(Math.random() * candidateCountries.length)];

    const baseRetail = perfume?.suggestedRetailPrice || Math.round(surplusItem.unitCost * 2.2);
    const baseWholesale = Math.round(baseRetail * 0.78);
    const marketing = calculateSaleMarketingBonuses(baseWholesale, currentBot, perfume, chosenCountry, botPerfumer);

    const countryMatches = marketing.matchedCountryNotes.length;
    const perfumerMatches = marketing.matchedPerfumerNotes.length;

    // Deal chance stays fluid while rewarding Country Note Harmony + Perfumer Note Mastery
    const noteDealBoost = countryMatches * 0.10 + perfumerMatches * 0.08;
    const dealChance = Math.min(
      0.96,
      Math.max(0.55, 0.52 + (fame / 100) * 0.15 + (persuasion / 100) * 0.12 + noteDealBoost + (hasActiveAd ? 0.12 : 0))
    );
    if (Math.random() > dealChance) continue;

    const excess = Math.max(1, surplusItem.quantity - 1);
    if (excess <= 0) continue;

    // Sell volume diverges sharply: high note harmony sells big waves (35-65%), low harmony sells small trial lots (8-18%)
    const harmonyVolumeBonus =
      countryMatches >= 3 ? 0.28 : countryMatches === 2 ? 0.16 : countryMatches === 0 ? -0.10 : 0.04;
    const sellRatio = Math.min(
      0.68,
      Math.max(0.08, 0.10 + (fame / 100) * 0.16 + harmonyVolumeBonus + Math.random() * 0.18)
    );
    const saleQty = Math.max(2, Math.min(surplusItem.quantity, Math.floor(excess * sellRatio) + 1));

    const wholesaleUnitPrice = marketing.finalUnitPrice;
    const grossRevenue = saleQty * wholesaleUnitPrice;
    const bonusRev = Math.max(0, saleQty * (wholesaleUnitPrice - baseWholesale));

    const newStock = Math.max(0, surplusItem.quantity - saleQty);
    const newBasis = Math.max(0, surplusItem.totalCostBasis - saleQty * surplusItem.unitCost);
    const normBoutiqueCountry = normalizeCountryName(chosenCountry);
    const prevBoutiqueSales = surplusItem.countrySales || {};
    const prevBoutiqueRev = surplusItem.countryRevenue || {};

    currentProductStorage[surplusItem.perfumeId] = {
      ...surplusItem,
      quantity: newStock,
      totalCostBasis: newBasis,
      totalSold: surplusItem.totalSold + saleQty,
      lastSalePrice: wholesaleUnitPrice,
      countrySales: {
        ...prevBoutiqueSales,
        [normBoutiqueCountry]: (prevBoutiqueSales[normBoutiqueCountry] || 0) + saleQty
      },
      countryRevenue: {
        ...prevBoutiqueRev,
        [normBoutiqueCountry]: (prevBoutiqueRev[normBoutiqueCountry] || 0) + grossRevenue
      }
    };

    // Gradual fame increase (+0.3) on strong boutique distribution
    if (saleQty >= 15) {
      updatedPerfumes = updatedPerfumes.map((p) => {
        if (p.id === surplusItem.perfumeId) {
          return { ...p, fame: Math.min(100, Math.round((getPerfumeFame(p) + 0.3) * 10) / 10) };
        }
        return p;
      });
    }

    totalGrossGain += grossRevenue;
    totalBonusEarned += bonusRev;
    dealsCount += 1;

    const bonusPct = Math.round(marketing.totalBonusRate * 100);
    const noteHarmonyPct = Math.round(
      (marketing.countryNoteHarmonyBonusRate + marketing.perfumerNoteMasteryBonusRate) * 100
    );
    const finRec: FinancialRecord = {
      id: `fin_bot_wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type: 'income',
      category: 'product_sale',
      amount: grossRevenue,
      description: `${chosenCountry} Butik Dağıtımı (${botPerfumer?.name || 'Usta'} Nota Uyumu +%${noteHarmonyPct} • Toplam +%${bonusPct}): ${saleQty} adet ${perfume?.name || surplusItem.perfumeId}`,
      cashAfter: currentBot.cash + totalGrossGain
    };
    financialRecords.push(finRec);

    activities.push({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      companyId: currentBot.id,
      companyName: currentBot.name,
      companyLogo: currentBot.logo,
      type: 'sell_product',
      title: `🛍️ ${chosenCountry} Nota Uyumlu Butik Satışı (+%${bonusPct} Fiyat Farkı)`,
      description: `${currentBot.name} (Baş Burun: ${botPerfumer?.name || 'Usta'} • ${marketing.perfumerOlfactoryFamily}), ${chosenCountry} pazarının sevdiği ${countryMatches} nota uyumu (+%${noteHarmonyPct} Nota & Usta Fiyat Farkı) ile ${saleQty} şişe "${perfume?.name || 'Mamul'}" sevkiyatını şişesi ${wholesaleUnitPrice} ₺'den bağladı.`,
      amount: grossRevenue
    });
  }

  if (totalGrossGain === 0) return null;

  const updatedSalesRep = {
    ...currentSalesRep,
    closedDeals: (currentSalesRep.closedDeals || 0) + dealsCount,
    bonusRevenueGenerated: Math.round((currentSalesRep.bonusRevenueGenerated || 0) + totalBonusEarned)
  };

  const newCash = Math.round((currentBot.cash + totalGrossGain) * 100) / 100;
  const newRevenue = currentBot.totalRevenue + totalGrossGain;
  const newNetProfit = newRevenue - currentBot.totalExpenses;
  const newMargin = newRevenue > 0 ? (newNetProfit / newRevenue) * 100 : 0;

  const updatedCompany: Company = {
    ...currentBot,
    cash: newCash,
    totalRevenue: newRevenue,
    netProfit: newNetProfit,
    profitMargin: Math.round(newMargin * 10) / 10,
    productStorage: currentProductStorage,
    salesRep: updatedSalesRep,
    financialHistory: [...financialRecords, ...currentBot.financialHistory.slice(0, 15)]
  };

  return {
    company: updatedCompany,
    orders: currentOrders,
    perfumes: updatedPerfumes,
    activities
  };
}

/**
 * 5. BOT ADVERTISING CAMPAIGNS (Reklam Kampanyası & Parfüm Şöhreti Yatırımı)
 */
function attemptBotAdCampaign(
  bot: Company,
  allPerfumes: Perfume[]
): {
  company: Company;
  perfumes: Perfume[];
  activity: SectorActivityEvent;
  newOrder?: MarketOrder;
} | null {
  const botPerfumes = getBotProduciblePerfumes(bot, allPerfumes);
  if (botPerfumes.length === 0) return null;

  // Prefer advertising perfumes that the bot currently has in stock OR its R&D inventions with Fame < 90
  const stockedPerfumes = botPerfumes.filter(
    (p) => (bot.productStorage[p.id]?.quantity || 0) > 0 && getPerfumeFame(p) < 95
  );
  const candidatePool = stockedPerfumes.length > 0 ? stockedPerfumes : botPerfumes;
  const targetPerfume = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  // Choose campaign tier based on bot cash
  const affordablePackages = AD_CAMPAIGN_PACKAGES.filter((pkg) => bot.cash >= pkg.cost + 80000);
  if (affordablePackages.length === 0) return null;

  const chosenPkg = affordablePackages[Math.floor(Math.random() * affordablePackages.length)];

  // Choose target country: strongly prefer countries where Reklamcı + Satış Temsilcisi share synergy!
  const synergyCountries = getCompanySynergyCountries(bot);
  const popCountries = getPerfumePopularCountries(targetPerfume);
  const adCountries = bot.adSpecialist?.specialtyCountries || [];
  const repCountries = bot.salesRep?.specialtyCountries || [];
  const combinedCountries = Array.from(
    new Set([...synergyCountries, ...synergyCountries, ...adCountries, ...popCountries, ...repCountries])
  );
  const targetCountryName =
    combinedCountries.length > 0
      ? combinedCountries[Math.floor(Math.random() * combinedCountries.length)]
      : GLOBAL_MARKET_COUNTRIES[Math.floor(Math.random() * GLOBAL_MARKET_COUNTRIES.length)].name;

  const countryInfo =
    GLOBAL_MARKET_COUNTRIES.find((c) => c.name === normalizeCountryName(targetCountryName)) ||
    GLOBAL_MARKET_COUNTRIES[0];

  const adPowerCalc = calculateAdCampaignPower(bot, countryInfo.name, chosenPkg);
  const now = Date.now();
  const newCampaign = {
    id: `ad_${now}_${Math.random().toString(36).substring(2, 6)}`,
    companyId: bot.id,
    perfumeId: targetPerfume.id,
    perfumeName: targetPerfume.name,
    targetCountry: countryInfo.name,
    targetCountryFlag: countryInfo.flag,
    campaignTier: chosenPkg.tier,
    campaignTitle: `${countryInfo.flag} ${countryInfo.name} - ${chosenPkg.title}`,
    cost: chosenPkg.cost,
    fameBoost: adPowerCalc.effectiveFameBoost,
    countryBonusRate: adPowerCalc.effectiveCountryBonusRate,
    adSpecialistName: adPowerCalc.adSpecialist.name,
    hasSynergy: adPowerCalc.hasSynergy,
    startedAt: now,
    expiresAt: now + chosenPkg.durationMinutes * 60 * 1000
  };

  const oldFame = getPerfumeFame(targetPerfume);
  const newFame = Math.min(100, Math.round((oldFame + adPowerCalc.effectiveFameBoost) * 10) / 10);

  const updatedPerfumes = allPerfumes.map((p) => {
    if (p.id === targetPerfume.id) {
      return {
        ...p,
        fame: newFame,
        popularCountries: getPerfumePopularCountries(p)
      };
    }
    return p;
  });

  const currentCountryBonuses = {
    ...(bot.countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[bot.id] || {})
  };
  currentCountryBonuses[countryInfo.name] =
    Math.round(((currentCountryBonuses[countryInfo.name] || 0) + adPowerCalc.effectivePermanentGain) * 100) / 100;

  const newCash = Math.round((bot.cash - chosenPkg.cost) * 100) / 100;
  const newExpenses = bot.totalExpenses + chosenPkg.cost;
  const newNetProfit = bot.totalRevenue - newExpenses;
  const newMargin = bot.totalRevenue > 0 ? (newNetProfit / bot.totalRevenue) * 100 : 0;

  const synergyNote = adPowerCalc.hasSynergy ? ' [⚡ Reklam+Satış Ortak Ülke Sinerjisi!]' : '';

  const finRec: FinancialRecord = {
    id: `fin_bot_ad_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'expense',
    category: 'advertising',
    amount: chosenPkg.cost,
    description: `Reklamcı ${adPowerCalc.adSpecialist.name} Kampanyası (${countryInfo.flag} ${countryInfo.name}): "${targetPerfume.name}" - ${chosenPkg.title}${synergyNote} (Şöhret: ${oldFame} -> ${newFame})`,
    cashAfter: newCash
  };

  const updatedAdSpec = {
    ...adPowerCalc.adSpecialist,
    campaignsLaunched: (adPowerCalc.adSpecialist.campaignsLaunched || 0) + 1,
    totalFameGenerated:
      Math.round(((adPowerCalc.adSpecialist.totalFameGenerated || 0) + adPowerCalc.effectiveFameBoost) * 10) / 10
  };

  const updatedCompany: Company = {
    ...bot,
    cash: newCash,
    totalExpenses: newExpenses,
    netProfit: newNetProfit,
    profitMargin: Math.round(newMargin * 10) / 10,
    adSpecialist: updatedAdSpec,
    countryBonuses: currentCountryBonuses,
    activeCampaigns: [newCampaign, ...(bot.activeCampaigns || []).filter((c) => c.expiresAt > now)],
    totalAdSpend: (bot.totalAdSpend || 0) + chosenPkg.cost,
    financialHistory: [finRec, ...bot.financialHistory.slice(0, 15)]
  };

  const newOrder = chosenPkg.spawnsVipOrder || adPowerCalc.hasSynergy
    ? createCampaignDrivenOrder(updatedCompany, targetPerfume, countryInfo.name, chosenPkg.tier)
    : undefined;

  const activity: SectorActivityEvent = {
    id: `act_ad_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    companyId: bot.id,
    companyName: bot.name,
    companyLogo: bot.logo,
    type: 'ad_campaign',
    title: `📢 ${countryInfo.flag} ${countryInfo.name}'da Reklamcı ${adPowerCalc.adSpecialist.name} Kampanyası!${adPowerCalc.hasSynergy ? ' ⚡ Sinerji!' : ''}`,
    description: `${bot.name} Reklam Direktörü ${adPowerCalc.adSpecialist.name}, "${targetPerfume.name}" için ${countryInfo.name} pazarında "${chosenPkg.title}" başlattı!${synergyNote} Şöhret ⭐ ${newFame}/100 (+%${Math.round(adPowerCalc.effectiveCountryBonusRate * 100)} Ülke Bonusu).`,
    amount: chosenPkg.cost,
    highlight: true
  };

  return {
    company: updatedCompany,
    perfumes: updatedPerfumes,
    activity,
    newOrder
  };
}

/**
 * 6. BOT SALES REPRESENTATIVE PERSUASION TRAINING (Satış Temsilcisi İkna Eğitimi)
 */
function attemptBotSalesRepTraining(
  bot: Company
): { company: Company; activity: SectorActivityEvent } | null {
  const rep = bot.salesRep || COMPANY_DEFAULT_SALES_REPS[bot.id] || COMPANY_DEFAULT_SALES_REPS.aromalux;
  if (rep.persuasion >= 96) return null;

  const trainingCost = 75000;
  if (bot.cash < trainingCost + 100000) return null;

  const gain = Math.floor(Math.random() * 4) + 4; // +4 to +7 persuasion
  const newPersuasion = Math.min(99, rep.persuasion + gain);
  const newLevel = Math.min(10, (rep.level || 1) + 1);

  const now = Date.now();
  const newCash = Math.round((bot.cash - trainingCost) * 100) / 100;
  const newExpenses = bot.totalExpenses + trainingCost;
  const newNetProfit = bot.totalRevenue - newExpenses;
  const newMargin = bot.totalRevenue > 0 ? (newNetProfit / bot.totalRevenue) * 100 : 0;

  const finRec: FinancialRecord = {
    id: `fin_bot_train_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    type: 'expense',
    category: 'sales_training',
    amount: trainingCost,
    description: `Satış Temsilcisi İkna & Müzakere Akademisi: ${rep.name} (İkna: ${rep.persuasion} -> ${newPersuasion})`,
    cashAfter: newCash
  };

  const updatedCompany: Company = {
    ...bot,
    cash: newCash,
    totalExpenses: newExpenses,
    netProfit: newNetProfit,
    profitMargin: Math.round(newMargin * 10) / 10,
    salesRep: {
      ...rep,
      persuasion: newPersuasion,
      level: newLevel
    },
    financialHistory: [finRec, ...bot.financialHistory.slice(0, 15)]
  };

  const activity: SectorActivityEvent = {
    id: `act_train_${now}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    companyId: bot.id,
    companyName: bot.name,
    companyLogo: bot.logo,
    type: 'sales_rep_training',
    title: `🗣️ Satış Temsilcisi İkna Kabiliyeti Yükseldi!`,
    description: `${bot.name}, Baş Satış Direktörü ${rep.name}'i Uluslararası Lüks Müzakere Akademisi'ne gönderdi. İkna Kabiliyeti ${newPersuasion}/100 seviyesine ulaştı!`,
    amount: trainingCost
  };

  return {
    company: updatedCompany,
    activity
  };
}
