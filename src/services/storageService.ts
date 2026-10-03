import { RawMaterial, Perfume, Company, MarketOrder, RndResult, Perfumer, SecretRecipe, SectorActivityEvent } from '../types';
import { INITIAL_RAW_MATERIALS, pickRandom3Families, format3FamiliesLabel } from '../data/rawMaterials';
import { RAW_MATERIAL_IMAGES } from '../data/rawMaterialImages';
import { INITIAL_PERFUMES } from '../data/perfumes';
import { INITIAL_COMPANIES, assignPerfumersToCompanies } from '../data/companies';
import { INITIAL_ORDERS } from '../data/orders';
import { INITIAL_PERFUMERS, randomizePerfumer3Families } from '../data/perfumers';
import { INITIAL_SECRET_RECIPES } from '../data/secretRecipes';
import { pruneAndRefreshOrders } from './economyEngine';
import { rerollAllCountries3Families, rerollAllStaffBonuses } from './marketingEngine';

const STORAGE_KEY = 'parfum_borsasi_game_v9'; // localStorage key (v9 fixed bot secret recipe cooldown & 12% solve rate)

export interface GameState {
  rawMaterials: RawMaterial[];
  perfumes: Perfume[];
  companies: Company[];
  perfumers: Perfumer[];
  orders: MarketOrder[];
  rndArchive: RndResult[];
  secretRecipes: SecretRecipe[];
  sectorActivities: SectorActivityEvent[];
  lastSavedAt: number;
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialGameState();
    }
    const parsed = JSON.parse(raw);
    if (!parsed.rawMaterials || !parsed.companies || !parsed.perfumes || !parsed.orders) {
      return getInitialGameState();
    }

    // Migration guarantee: ensure companies have perfumerId and perfumers have Random 3 Family Bonuses (old bonuses removed)
    const savedPerfumerMap = new Map(
      Array.isArray(parsed.perfumers) ? parsed.perfumers.map((p: Perfumer) => [p.id, p]) : []
    );
    const validPerfumers: Perfumer[] = INITIAL_PERFUMERS.map((initPerf) => {
      const savedPerf = savedPerfumerMap.get(initPerf.id);
      const bonusFamilies =
        savedPerf?.bonusFamilies && savedPerf.bonusFamilies.length === 3
          ? savedPerf.bonusFamilies
          : initPerf.bonusFamilies || pickRandom3Families();
      const famLabel = format3FamiliesLabel(bonusFamilies);
      return {
        ...initPerf,
        ...(savedPerf || {}),
        bonusFamilies,
        olfactoryFamily: famLabel,
        logisticsBonus: 0,
        exportBonus: 0,
        wasteBonus: 0,
        wasteReduction: 0,
        speedBonus: 0,
        specialtyNotes: [],
        noteMasteryBonusRate: 0.24,
        bio: `${initPerf.name}, Koku Çarkı'ndaki 3 Aile Bonusuna (${famLabel}) sahiptir. Formülde bu 3 aileden hammadde kullanıldığında 1 Aile: +%8, 2 Aile: +%16, 3 Aile: +%24 ekstra satış fiyat farkı ve AR-GE uyumu kazandırır.`
      };
    });

    const initialPerfumeMap = new Map(INITIAL_PERFUMES.map((p) => [p.id, p]));
    const baseCompanies = assignPerfumersToCompanies(parsed.companies);
    
    // Merge company storages (ensure all new Fragrantica essences and productStorage items exist)
    const initCompanyMap = new Map(INITIAL_COMPANIES.map((c) => [c.id, c]));
    const validCompanies = baseCompanies.map((c) => {
      const initComp = initCompanyMap.get(c.id);

      // Merge essence storage so newly added notes (lici, deniz_notalari, etc.) are present
      const mergedEssence = { ...(initComp?.essenceStorage || {}), ...(c.essenceStorage || {}) };
      if (initComp?.essenceStorage) {
        Object.entries(initComp.essenceStorage).forEach(([rawMatId, item]) => {
          if (!mergedEssence[rawMatId] || (mergedEssence[rawMatId].quantity || 0) === 0) {
            mergedEssence[rawMatId] = item;
          }
        });
      }

      // Merge product storage so newly allocated Fragrantica perfumes are present
      const mergedProducts = { ...(initComp?.productStorage || {}), ...(c.productStorage || {}) };
      if (initComp?.productStorage) {
        Object.entries(initComp.productStorage).forEach(([perfumeId, item]) => {
          if (!mergedProducts[perfumeId]) {
            mergedProducts[perfumeId] = item;
          }
        });
      }

      // Sync suggestedSalePrice with current perfume definitions & sanitize legacy costs
      Object.keys(mergedProducts).forEach((pId) => {
        const prod = mergedProducts[pId];
        const initialPerfume = initialPerfumeMap.get(pId);
        if (prod && initialPerfume) {
          prod.suggestedSalePrice = initialPerfume.suggestedRetailPrice;
          if (!prod.lastSalePrice || prod.lastSalePrice < initialPerfume.suggestedRetailPrice * 0.5) {
            prod.lastSalePrice = initialPerfume.suggestedRetailPrice;
          }
        }

        // Sanitize corrupted legacy unit costs (e.g. <= 0 or > 600 TL)
        if (prod && (prod.unitCost <= 0 || prod.unitCost > 600)) {
          const saneCost = initialPerfume ? 220 : 200;
          mergedProducts[pId] = {
            ...prod,
            unitCost: saneCost,
            totalCostBasis: (prod.quantity || 0) * saneCost
          };
        }

        // Normalize clogged excess stocks for rivals from old stuck loop (cap at 75 bottles per item)
        if (!c.isPlayer && prod && prod.quantity > 75) {
          const excess = prod.quantity - 50;
          mergedProducts[pId] = {
            ...prod,
            quantity: 50,
            totalCostBasis: 50 * prod.unitCost,
            totalSold: (prod.totalSold || 0) + excess
          };
        }
      });

      if (c.id !== 'aromalux') {
        // Other companies should not hold or produce AromaLux's exclusive perfumes
        const aromaLuxPerfumeIds = new Set([
          'chanel_no_5', 'dior_sauvage', 'baccarat_rouge_540',
          'creed_aventus', 'black_opium', 'tobacco_vanille',
          'delina_exclusif', 'acqua_di_gio_profumo', 'santal_33'
        ]);
        aromaLuxPerfumeIds.forEach((pId) => {
          delete mergedProducts[pId];
        });
      }

      if (c.isPlayer) {
        // Normalize player cash to 20M if it was the legacy 50M or undefined
        let playerCash = typeof c.cash === 'number' && !isNaN(c.cash) ? c.cash : 20000000;
        if (playerCash === 50000000) {
          playerCash = 20000000;
        }
        return {
          ...initComp,
          ...c,
          cash: playerCash,
          essenceStorage: mergedEssence,
          productStorage: mergedProducts
        };
      } else {
        const botCash = typeof c.cash === 'number' && !isNaN(c.cash) ? c.cash : 20000000;
        const botRev = typeof c.totalRevenue === 'number' ? c.totalRevenue : 0;
        const botExp = typeof c.totalExpenses === 'number' ? c.totalExpenses : 0;
        const botNet = botRev - botExp;
        const botMargin = botRev > 0 ? (botNet / botRev) * 100 : 0;

        return {
          ...initComp,
          ...c,
          cash: botCash,
          totalRevenue: botRev,
          totalExpenses: botExp,
          netProfit: botNet,
          profitMargin: Math.round(botMargin * 10) / 10,
          essenceStorage: mergedEssence,
          productStorage: mergedProducts
        };
      }
    });

    // Merge raw materials to ensure 10 familyGroup, noteTier (Üst/Orta/Alt), category, and priceHistory exist
    const initialMatMap = new Map(INITIAL_RAW_MATERIALS.map((m) => [m.id, m]));
    const validRawMaterials = parsed.rawMaterials.map((m: RawMaterial) => {
      const init = initialMatMap.get(m.id);
      return {
        ...init,
        ...m,
        name: init?.name || m.name,
        image: RAW_MATERIAL_IMAGES[m.id] || m.image || init?.image,
        countryCode: m.countryCode || init?.countryCode || '',
        flag: m.flag || init?.flag || '🌐',
        familyGroup: init?.familyGroup || m.familyGroup || 'Çiçeksi',
        noteTier: init?.noteTier || m.noteTier || 'middle',
        category: init?.category || m.category || 'Genel',
        description: init?.description || m.description,
        priceHistory: m.priceHistory && m.priceHistory.length > 0 ? m.priceHistory : (init?.priceHistory || [])
      };
    });

    // Ensure any newly added raw materials (e.g. lici, deniz_notalari, biberiye, tutsu, kakule, iris, deri, oud, amber, orkide, limon, bal, osmanthus, subulteber, erik, yesil_cay, ahududu) are included
    const existingMatIds = new Set(validRawMaterials.map((m: RawMaterial) => m.id));
    const missingRawMaterials = INITIAL_RAW_MATERIALS.filter((m) => !existingMatIds.has(m.id));
    const allRawMaterials = [...validRawMaterials, ...missingRawMaterials];

    // Keep ONLY AR-GE and SECRET perfumes (all Original and Fragrantica perfumes are removed so players start from scratch)
    const isGradualFameMigrated = parsed.fameCurveVersion === 2;
    const allPerfumes: Perfume[] = (parsed.perfumes || [])
      .filter((p: Perfume) => p.sourceType === 'AR-GE' || p.sourceType === 'SECRET')
      .map((p: Perfume) => ({
        ...p,
        fame: isGradualFameMigrated ? p.fame : undefined
      }));
    const validPerfumeIdSet = new Set(allPerfumes.map((p) => p.id));

    // Clean any removed Original/Fragrantica perfumes from companies' productStorage and activeProduction
    const cleanedCompanies = validCompanies.map((comp) => {
      const filteredStorage: Record<string, any> = {};
      Object.entries(comp.productStorage || {}).forEach(([pid, item]) => {
        if (validPerfumeIdSet.has(pid)) {
          filteredStorage[pid] = item;
        }
      });
      const validActiveProd =
        comp.activeProduction && validPerfumeIdSet.has(comp.activeProduction.perfumeId)
          ? comp.activeProduction
          : null;
      return {
        ...comp,
        productStorage: filteredStorage,
        activeProduction: validActiveProd
      };
    });

    // Merge secret recipes so new secrets exist even for existing saves
    const savedSecrets: SecretRecipe[] = parsed.secretRecipes || [];
    const savedSecretMap = new Map(savedSecrets.map((s) => [s.id, s]));
    const validSecretRecipes: SecretRecipe[] = INITIAL_SECRET_RECIPES.map((initSec) => {
      const saved = savedSecretMap.get(initSec.id);
      if (saved) {
        return {
          ...initSec,
          ...saved,
          realPerfume: initSec.realPerfume,
          hint: initSec.hint
        };
      }
      return initSec;
    });

    // Merge and sanitize orders: clean up any stale/expired orders from past sessions and ensure fresh active market contracts
    const savedOrders: MarketOrder[] = parsed.orders && parsed.orders.length > 0 ? parsed.orders : INITIAL_ORDERS;
    const allOrders = pruneAndRefreshOrders(savedOrders, allPerfumes, cleanedCompanies);

    return {
      rawMaterials: allRawMaterials,
      perfumes: allPerfumes,
      companies: cleanedCompanies,
      perfumers: validPerfumers,
      orders: allOrders,
      rndArchive: parsed.rndArchive || [],
      secretRecipes: validSecretRecipes,
      sectorActivities: parsed.sectorActivities || [],
      lastSavedAt: parsed.lastSavedAt || Date.now()
    };
  } catch (error) {
    console.error('Failed to load game state, fallback to initial:', error);
    return getInitialGameState();
  }
}

export function saveGameState(state: GameState): void {
  try {
    const payload = {
      ...state,
      fameCurveVersion: 2,
      lastSavedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function resetGameState(): GameState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('parfum_borsasi_game_v1');
    localStorage.removeItem('parfum_borsasi_game_v2');
    localStorage.removeItem('parfum_borsasi_game_v3');
    localStorage.removeItem('parfum_borsasi_game_v4');
    localStorage.removeItem('parfum_borsasi_game_v5');
    localStorage.removeItem('parfum_borsasi_game_v6');
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('parfum_borsasi_game')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error(e);
  }
  rerollAllCountries3Families();
  rerollAllStaffBonuses();
  return getInitialGameState();
}

export function getInitialGameState(): GameState {
  const randomizedPerfumers = INITIAL_PERFUMERS.map((p) => randomizePerfumer3Families(p));
  const cleanCompanies: Company[] = INITIAL_COMPANIES.map((c) => {
    return {
      ...c,
      cash: 20000000,
      productStorage: {},
      activeShipments: [],
      activeProduction: null,
      lastRndInventionAt: Date.now(),
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      financialHistory: [
        {
          id: `fin_init_${c.id}_${Date.now()}`,
          timestamp: Date.now(),
          type: 'income',
          category: 'other',
          amount: 20000000,
          description: `Kurucu sermaye girişi (${c.name} - Sıfırdan Üretim Başlangıcı)`,
          cashAfter: 20000000
        }
      ]
    };
  });

  return {
    rawMaterials: INITIAL_RAW_MATERIALS,
    perfumes: INITIAL_PERFUMES,
    companies: assignPerfumersToCompanies(cleanCompanies),
    perfumers: randomizedPerfumers,
    orders: INITIAL_ORDERS,
    rndArchive: [],
    secretRecipes: INITIAL_SECRET_RECIPES,
    sectorActivities: [],
    lastSavedAt: Date.now()
  };
}
