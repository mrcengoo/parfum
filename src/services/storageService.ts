import { RawMaterial, Perfume, Company, MarketOrder, RndResult, Perfumer, SecretRecipe } from '../types';
import { INITIAL_RAW_MATERIALS } from '../data/rawMaterials';
import { RAW_MATERIAL_IMAGES } from '../data/rawMaterialImages';
import { INITIAL_PERFUMES } from '../data/perfumes';
import { INITIAL_COMPANIES, assignPerfumersToCompanies } from '../data/companies';
import { INITIAL_ORDERS } from '../data/orders';
import { INITIAL_PERFUMERS } from '../data/perfumers';
import { INITIAL_SECRET_RECIPES } from '../data/secretRecipes';

const STORAGE_KEY = 'parfum_borsasi_game_v2'; // bumped to v2 for seamless migration

export interface GameState {
  rawMaterials: RawMaterial[];
  perfumes: Perfume[];
  companies: Company[];
  perfumers: Perfumer[];
  orders: MarketOrder[];
  rndArchive: RndResult[];
  secretRecipes: SecretRecipe[];
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

    // Migration guarantee: ensure companies have perfumerId and perfumers list is present
    const validPerfumers = parsed.perfumers && parsed.perfumers.length > 0 ? parsed.perfumers : INITIAL_PERFUMERS;
    const baseCompanies = assignPerfumersToCompanies(parsed.companies);
    const validCompanies = baseCompanies.map((c) => {
      if (c.isPlayer && (!c.essenceStorage || Object.keys(c.essenceStorage).length === 0)) {
        return {
          ...c,
          essenceStorage: INITIAL_COMPANIES[0].essenceStorage
        };
      }
      return c;
    });

    // Merge raw materials to ensure countryCode, flag, category and priceHistory exist
    const initialMatMap = new Map(INITIAL_RAW_MATERIALS.map((m) => [m.id, m]));
    const validRawMaterials = parsed.rawMaterials.map((m: RawMaterial) => {
      const init = initialMatMap.get(m.id);
      return {
        ...init,
        ...m,
        image: m.image || RAW_MATERIAL_IMAGES[m.id] || init?.image,
        countryCode: m.countryCode || init?.countryCode || '',
        flag: m.flag || init?.flag || '🌐',
        category: m.category || init?.category || 'Genel',
        priceHistory: m.priceHistory && m.priceHistory.length > 0 ? m.priceHistory : (init?.priceHistory || [])
      };
    });

    // Ensure any newly added raw materials (e.g. greyfurt, tarcin, visne, iris, nane) are included
    const existingMatIds = new Set(validRawMaterials.map((m: RawMaterial) => m.id));
    const missingRawMaterials = INITIAL_RAW_MATERIALS.filter((m) => !existingMatIds.has(m.id));
    const allRawMaterials = [...validRawMaterials, ...missingRawMaterials];

    // Merge perfumes so that initial perfumes receive updated rich & varied recipes and 6-tier quality
    const initialPerfumeMap = new Map(INITIAL_PERFUMES.map((p) => [p.id, p]));
    const validPerfumes = parsed.perfumes.map((p: Perfume) => {
      const init = initialPerfumeMap.get(p.id);
      if (init && p.sourceType === 'ORİJİNAL') {
        return {
          ...p,
          recipe: init.recipe,
          resultLevel: init.resultLevel || p.resultLevel || 'Kaliteli',
          suggestedRetailPrice: init.suggestedRetailPrice || p.suggestedRetailPrice
        };
      }
      return p;
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

    return {
      rawMaterials: allRawMaterials,
      perfumes: validPerfumes,
      companies: validCompanies,
      perfumers: validPerfumers,
      orders: parsed.orders,
      rndArchive: parsed.rndArchive || [],
      secretRecipes: validSecretRecipes,
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
  } catch (e) {
    console.error(e);
  }
  return getInitialGameState();
}

export function getInitialGameState(): GameState {
  return {
    rawMaterials: INITIAL_RAW_MATERIALS,
    perfumes: INITIAL_PERFUMES,
    companies: assignPerfumersToCompanies(INITIAL_COMPANIES),
    perfumers: INITIAL_PERFUMERS,
    orders: INITIAL_ORDERS,
    rndArchive: [],
    secretRecipes: INITIAL_SECRET_RECIPES,
    lastSavedAt: Date.now()
  };
}
