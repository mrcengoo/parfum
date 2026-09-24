import { RawMaterial, Perfume, Company, MarketOrder, RndResult, Perfumer } from '../types';
import { INITIAL_RAW_MATERIALS } from '../data/rawMaterials';
import { INITIAL_PERFUMES } from '../data/perfumes';
import { INITIAL_COMPANIES, assignPerfumersToCompanies } from '../data/companies';
import { INITIAL_ORDERS } from '../data/orders';
import { INITIAL_PERFUMERS } from '../data/perfumers';

const STORAGE_KEY = 'parfum_borsasi_game_v2'; // bumped to v2 for seamless migration

export interface GameState {
  rawMaterials: RawMaterial[];
  perfumes: Perfume[];
  companies: Company[];
  perfumers: Perfumer[];
  orders: MarketOrder[];
  rndArchive: RndResult[];
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
    const validCompanies = assignPerfumersToCompanies(parsed.companies);

    // Merge raw materials to ensure countryCode, flag, category and priceHistory exist
    const initialMatMap = new Map(INITIAL_RAW_MATERIALS.map((m) => [m.id, m]));
    const validRawMaterials = parsed.rawMaterials.map((m: RawMaterial) => {
      const init = initialMatMap.get(m.id);
      return {
        ...init,
        ...m,
        countryCode: m.countryCode || init?.countryCode || '',
        flag: m.flag || init?.flag || '🌐',
        category: m.category || init?.category || 'Genel',
        priceHistory: m.priceHistory && m.priceHistory.length > 0 ? m.priceHistory : (init?.priceHistory || [])
      };
    });

    // Merge perfumes so that initial perfumes receive updated rich & varied recipes
    const initialPerfumeMap = new Map(INITIAL_PERFUMES.map((p) => [p.id, p]));
    const validPerfumes = parsed.perfumes.map((p: Perfume) => {
      const init = initialPerfumeMap.get(p.id);
      if (init && p.sourceType === 'ORİJİNAL') {
        return {
          ...p,
          recipe: init.recipe,
          suggestedRetailPrice: init.suggestedRetailPrice || p.suggestedRetailPrice
        };
      }
      return p;
    });

    return {
      rawMaterials: validRawMaterials,
      perfumes: validPerfumes,
      companies: validCompanies,
      perfumers: validPerfumers,
      orders: parsed.orders,
      rndArchive: parsed.rndArchive || [],
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
    lastSavedAt: Date.now()
  };
}
