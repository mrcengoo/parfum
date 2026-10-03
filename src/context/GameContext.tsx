import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  RawMaterial,
  Perfume,
  Company,
  MarketOrder,
  RndResult,
  ActiveTab,
  ActiveShipment,
  EssenceInventoryItem,
  ProductInventoryItem,
  FinancialRecord,
  Perfumer,
  GenderType,
  SecretRecipe,
  SecretRecipeAttempt,
  SectorActivityEvent
} from '../types';
import { loadGameState, saveGameState, resetGameState } from '../services/storageService';
import { createShipment, tickMarketPrices, generateRandomOrder, pruneAndRefreshOrders } from '../services/economyEngine';
import { checkRecipeRequirements, startProduction } from '../services/productionEngine';
import { fulfillMarketOrder } from '../services/orderEngine';
import { generateRndPerfume, convertRndToPerfume, generateRndFromFormula, FormulaInputItem } from '../services/rndEngine';
import { evaluateSecretAttempt, convertSecretToPerfume } from '../services/secretRecipeEngine';
import { tickBotSimulation } from '../services/botEngine';
import { getPerfumerById, randomizePerfumer3Families } from '../data/perfumers';
import {
  AD_CAMPAIGN_PACKAGES,
  COMPETITIVE_TACTICS,
  COMPETITIVE_TACTIC_COOLDOWN_MS,
  COMPANY_DEFAULT_AD_SPECIALISTS,
  COMPANY_DEFAULT_COUNTRY_BONUSES,
  COMPANY_DEFAULT_SALES_REPS,
  GLOBAL_MARKET_COUNTRIES,
  TRANSFERABLE_AD_SPECIALISTS,
  TRANSFERABLE_SALES_REPS,
  calculateAdCampaignPower,
  calculateSaleMarketingBonuses,
  createCampaignDrivenOrder,
  getPerfumeFame,
  getPerfumePopularCountries,
  normalizeCountryName,
  rerollAllCountries3Families,
  rerollAllStaffBonuses
} from '../services/marketingEngine';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

interface GameContextType {
  rawMaterials: RawMaterial[];
  perfumes: Perfume[];
  companies: Company[];
  perfumers: Perfumer[];
  orders: MarketOrder[];
  rndArchive: RndResult[];
  secretRecipes: SecretRecipe[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  playerCompany: Company;
  playerPerfumer: Perfumer;
  rawMaterialsMap: Map<string, RawMaterial>;
  perfumesMap: Map<string, Perfume>;
  perfumersMap: Map<string, Perfumer>;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;

  // Actions
  buyRawMaterial: (materialId: string, quantity: number) => void;
  instantCompleteShipment: (shipmentId: string) => void;
  startProductionJob: (perfumeId: string, batchSize?: number) => void;
  instantCompleteProduction: () => void;
  sellToOrder: (orderId: string, quantity: number, targetProductId?: string) => void;
  sellProductWholesale: (perfumeId: string, quantity: number) => void;
  conductRnd: (
    topNotes: string[],
    middleNotes: string[],
    baseNotes: string[],
    gender: GenderType,
    customAmounts?: Record<string, number>
  ) => RndResult;
  saveRndFormula: (
    formulaName: string,
    items: FormulaInputItem[],
    gender: GenderType
  ) => RndResult;
  registerRndPerfume: (rndResultId: string) => void;
  assignPerfumerToPlayerCompany: (perfumerId: string) => void;
  buySecretRecipe: (secretId: string) => void;
  guessSecretRecipe: (
    secretId: string,
    topNotes: string[],
    middleNotes: string[],
    baseNotes: string[]
  ) => SecretRecipeAttempt;
  unlockSecretRecipeDirectly: (secretId: string) => void;
  rewardLegendaryPerfume: (perfume: Perfume, bonusCash?: number, silent?: boolean) => void;
  addCompanyCash: (amount: number) => void;
  deductCompanyCash: (amount: number, description: string, category?: string) => boolean;
  seekFreshOrders: () => void;
  cancelOrder: (orderId: string) => void;
  launchAdCampaign: (perfumeId: string, targetCountry: string, tier: 'influencer' | 'billboard' | 'gala') => void;
  trainSalesRep: () => void;
  hireSalesRep: (repId: string) => void;
  trainAdSpecialist: () => void;
  hireAdSpecialist: (adSpecialistId: string) => void;
  executeCompetitiveTactic: (
    tacticId: 'counter_ad' | 'country_embargo' | 'price_dumping' | 'supply_squeeze',
    targetCountry: string,
    targetRivalId: string
  ) => void;
  sectorActivities: SectorActivityEvent[];
  isBotAiEnabled: boolean;
  botSpeed: 'slow' | 'normal' | 'fast';
  isSpectatorMode: boolean;
  managedCompanyId: string | null;
  toggleSpectatorMode: () => void;
  setManagedCompany: (companyId: string | null) => void;
  toggleBotAi: () => void;
  triggerBotTurn: () => void;
  setBotSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  isGamePaused: boolean;
  togglePauseGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  rerollPerfumerFamilies: () => void;
  rerollCountryFamilies: () => void;
  rerollStaffBonuses: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState(loadGameState);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBotAiEnabled, setIsBotAiEnabled] = useState<boolean>(true);
  const [botSpeed, setBotSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [isGamePaused, setIsGamePaused] = useState<boolean>(false);
  const pausedAtRef = useRef<number | null>(null);

  // Spectator Mode: by default true so user can watch all companies as bots, but can take control of any company anytime!
  const [isSpectatorMode, setIsSpectatorMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('parfum_borsasi_spectator_mode');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true; // Default: Spectator Mode (Tüm Şirketler Bot)
  });
  const [viewedCompanyId, setViewedCompanyId] = useState<string>('aromalux');

  useEffect(() => {
    try {
      localStorage.setItem('parfum_borsasi_spectator_mode', JSON.stringify(isSpectatorMode));
    } catch {}
  }, [isSpectatorMode]);

  // Maps for O(1) lookups
  const rawMaterialsMap = useMemo(() => {
    return new Map(gameState.rawMaterials.map((m) => [m.id, m]));
  }, [gameState.rawMaterials]);

  const perfumesMap = useMemo(() => {
    return new Map(gameState.perfumes.map((p) => [p.id, p]));
  }, [gameState.perfumes]);

  const perfumersMap = useMemo(() => {
    return new Map(gameState.perfumers.map((p) => [p.id, p]));
  }, [gameState.perfumers]);

  const managedCompanyId = useMemo(() => {
    if (isSpectatorMode) return null;
    return gameState.companies.find((c) => c.isPlayer)?.id || null;
  }, [isSpectatorMode, gameState.companies]);

  const playerCompany = useMemo(() => {
    return (
      (!isSpectatorMode && gameState.companies.find((c) => c.isPlayer)) ||
      gameState.companies.find((c) => c.id === viewedCompanyId) ||
      gameState.companies.find((c) => c.isPlayer) ||
      gameState.companies[0]
    );
  }, [gameState.companies, viewedCompanyId, isSpectatorMode]);

  const playerPerfumer = useMemo(() => {
    return perfumersMap.get(playerCompany.perfumerId) || gameState.perfumers[0];
  }, [perfumersMap, playerCompany.perfumerId, gameState.perfumers]);

  const addToast = useCallback((_toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    // Sağ altta çıkan bildirim kutuları devre dışı bırakıldı
  }, []);

  const setManagedCompany = useCallback((companyId: string | null) => {
    if (companyId === null) {
      setIsSpectatorMode(true);
      setGameState((prev) => ({
        ...prev,
        companies: prev.companies.map((c) => ({ ...c, isPlayer: false }))
      }));
      addToast({
        type: 'info',
        title: '🎬 Seyirci Modu Aktif',
        message: 'Tüm parfümeri şirketleri Bot Yapay Zekası tarafından otonom yönetiliyor. Arkanıza yaslanıp canlı simülasyonu izleyebilirsiniz.'
      });
    } else {
      setIsSpectatorMode(false);
      setViewedCompanyId(companyId);
      setGameState((prev) => ({
        ...prev,
        companies: prev.companies.map((c) => ({
          ...c,
          isPlayer: c.id === companyId
        }))
      }));
      const compName = gameState.companies.find((c) => c.id === companyId)?.name || 'Şirket';
      addToast({
        type: 'success',
        title: `👑 ${compName} Yönetimi Devralındı!`,
        message: `Artık ${compName} şirketini doğrudan siz yönetiyorsunuz. Diğer 3 şirket bot olarak yarışmaya devam ediyor.`
      });
    }
  }, [addToast, gameState.companies]);

  const toggleSpectatorMode = useCallback(() => {
    if (isSpectatorMode) {
      setManagedCompany(viewedCompanyId || 'aromalux');
    } else {
      setManagedCompany(null);
    }
  }, [isSpectatorMode, viewedCompanyId, setManagedCompany]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save to storage on update
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Handle Shipment Completion
  const completeShipment = useCallback((shipment: ActiveShipment) => {
    setGameState((prev) => {
      const companyIndex = prev.companies.findIndex((c) => c.id === shipment.companyId);
      if (companyIndex === -1) return prev;

      const company = prev.companies[companyIndex];
      const wasteAmount = Math.round(shipment.purchasedQuantity * shipment.wasteRate);
      const netQuantity = shipment.purchasedQuantity - wasteAmount;

      const existingEssence: EssenceInventoryItem = company.essenceStorage[shipment.rawMaterialId] || {
        rawMaterialId: shipment.rawMaterialId,
        quantity: 0,
        totalCostBasis: 0,
        averageUnitCost: 0
      };

      const newTotalQuantity = existingEssence.quantity + netQuantity;
      const newTotalCostBasis = existingEssence.totalCostBasis + shipment.totalCost;
      const newAverageUnitCost = newTotalQuantity > 0 ? Math.round((newTotalCostBasis / newTotalQuantity) * 100) / 100 : 0;

      const updatedEssenceStorage: Record<string, EssenceInventoryItem> = {
        ...company.essenceStorage,
        [shipment.rawMaterialId]: {
          rawMaterialId: shipment.rawMaterialId,
          quantity: newTotalQuantity,
          totalCostBasis: newTotalCostBasis,
          averageUnitCost: newAverageUnitCost
        }
      };

      const updatedShipments = company.activeShipments.filter((s) => s.id !== shipment.id);

      const completionRecord: FinancialRecord = {
        id: `fin_arrival_${Date.now()}`,
        timestamp: Date.now(),
        type: 'expense',
        category: 'other',
        amount: 0,
        description: `Esans Depoya Giriş: ${shipment.rawMaterialName} (${shipment.purchasedQuantity} alım - %${(shipment.wasteRate * 100).toFixed(1)} fire: ${wasteAmount} adet = Net ${netQuantity} birim)`,
        cashAfter: company.cash
      };

      const updatedCompany: Company = {
        ...company,
        essenceStorage: updatedEssenceStorage,
        activeShipments: updatedShipments,
        financialHistory: [completionRecord, ...company.financialHistory]
      };

      const updatedCompanies = [...prev.companies];
      updatedCompanies[companyIndex] = updatedCompany;

      return {
        ...prev,
        companies: updatedCompanies
      };
    });

    addToast({
      type: 'success',
      title: '📦 Nakliye Esans Deposuna Ulaştı!',
      message: `${shipment.rawMaterialName}: ${shipment.purchasedQuantity} hammadde fire sonrası net ${shipment.expectedNetQuantity} esans olarak depoya eklendi.`
    });
  }, [addToast]);

  // Handle Production Completion
  const completeProduction = useCallback((production: NonNullable<Company['activeProduction']>) => {
    setGameState((prev) => {
      const companyIndex = prev.companies.findIndex((c) => c.id === production.companyId);
      if (companyIndex === -1) return prev;

      const company = prev.companies[companyIndex];
      const perfume = prev.perfumes.find((p) => p.id === production.perfumeId);
      if (!perfume) return prev;

      // Deduct recipe essences from company essenceStorage
      const updatedEssenceStorage = { ...company.essenceStorage };
      const batchMultiplier = production.batchSize / 100;

      perfume.recipe.forEach((recipeItem) => {
        const required = Math.max(1, Math.round(recipeItem.amount * batchMultiplier));
        const current = updatedEssenceStorage[recipeItem.rawMaterialId];
        if (current) {
          const newQty = Math.max(0, current.quantity - required);
          const newBasis = Math.max(0, current.totalCostBasis - required * current.averageUnitCost);
          updatedEssenceStorage[recipeItem.rawMaterialId] = {
            ...current,
            quantity: newQty,
            totalCostBasis: Math.round(newBasis * 100) / 100
          };
        }
      });

      // Add to Product Storage
      const existingProduct: ProductInventoryItem = company.productStorage[production.perfumeId] || {
        perfumeId: production.perfumeId,
        quantity: 0,
        totalCostBasis: 0,
        unitCost: production.costBreakdown.unitCost,
        lastSalePrice: perfume.suggestedRetailPrice,
        suggestedSalePrice: perfume.suggestedRetailPrice,
        totalSold: 0
      };

      const newProductQty = existingProduct.quantity + production.batchSize;
      const newTotalCostBasis = existingProduct.totalCostBasis + production.costBreakdown.totalCost;
      const newUnitCost = Math.round((newTotalCostBasis / newProductQty) * 100) / 100;

      const updatedProductStorage: Record<string, ProductInventoryItem> = {
        ...company.productStorage,
        [production.perfumeId]: {
          ...existingProduct,
          quantity: newProductQty,
          totalCostBasis: newTotalCostBasis,
          unitCost: newUnitCost,
          lastCostBreakdown: production.costBreakdown
        }
      };

      const record: FinancialRecord = {
        id: `fin_prod_done_${Date.now()}`,
        timestamp: Date.now(),
        type: 'expense',
        category: 'production_fee',
        amount: production.costBreakdown.totalCost,
        description: `Üretim Tamamlandı: ${production.batchSize} adet ${production.perfumeName} üretildi. Toplam Maliyet: ${production.costBreakdown.totalCost.toLocaleString('tr-TR')} TL (Birim: ${production.costBreakdown.unitCost} TL)`,
        cashAfter: company.cash
      };

      const updatedCompany: Company = {
        ...company,
        essenceStorage: updatedEssenceStorage,
        productStorage: updatedProductStorage,
        activeProduction: null,
        financialHistory: [record, ...company.financialHistory]
      };

      const updatedCompanies = [...prev.companies];
      updatedCompanies[companyIndex] = updatedCompany;

      return {
        ...prev,
        companies: updatedCompanies
      };
    });

    addToast({
      type: 'success',
      title: '🏭 Üretim Başarıyla Tamamlandı!',
      message: `${production.batchSize} adet ${production.perfumeName} ürün deposuna teslim edildi. Birim maliyet: ${production.costBreakdown.unitCost} TL.`
    });
  }, [addToast]);

  // Pause & Resume Game Simulation Controls
  const resumeGame = useCallback(() => {
    setIsGamePaused(false);
    if (pausedAtRef.current) {
      const elapsed = Date.now() - pausedAtRef.current;
      if (elapsed > 0) {
        setGameState((prev) => {
          const compIndex = prev.companies.findIndex((c) => c.isPlayer);
          if (compIndex === -1) return prev;
          const playerComp = prev.companies[compIndex];
          const updatedShipments = (playerComp.activeShipments || []).map((s) => ({
            ...s,
            startTime: s.startTime + elapsed,
            endTime: s.endTime + elapsed
          }));
          const updatedProd = playerComp.activeProduction
            ? {
                ...playerComp.activeProduction,
                startTime: playerComp.activeProduction.startTime + elapsed,
                endTime: playerComp.activeProduction.endTime + elapsed
              }
            : null;
          const updatedOrders = (prev.orders || []).map((o) => ({
            ...o,
            expiresAt: o.expiresAt ? o.expiresAt + elapsed : o.expiresAt
          }));
          const updatedCompanies = [...prev.companies];
          updatedCompanies[compIndex] = {
            ...playerComp,
            activeShipments: updatedShipments,
            activeProduction: updatedProd
          };
          return {
            ...prev,
            companies: updatedCompanies,
            orders: updatedOrders
          };
        });
      }
      pausedAtRef.current = null;
    }
    addToast({
      type: 'success',
      title: '▶️ Oyun Devam Ediyor',
      message: 'Simülasyon aktif. Nakliyeler, üretim, piyasa fiyatları ve rakip botlar çalışmaya devam ediyor.'
    });
  }, [addToast]);

  const pauseGame = useCallback(() => {
    pausedAtRef.current = Date.now();
    setIsGamePaused(true);
    addToast({
      type: 'info',
      title: '⏸️ Oyun Durduruldu',
      message: 'Simülasyon, borsa fiyatları, nakliyeler, üretim ve rakip botlar duraklatıldı. İstediğiniz zaman devam ettirebilirsiniz.'
    });
  }, [addToast]);

  const togglePauseGame = useCallback(() => {
    if (isGamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }, [isGamePaused, resumeGame, pauseGame]);

  // Master Clock (Every 1 second)
  useEffect(() => {
    if (isGamePaused) return;

    const timer = setInterval(() => {
      const now = Date.now();

      // Check player shipments
      if (playerCompany.activeShipments && playerCompany.activeShipments.length > 0) {
        playerCompany.activeShipments.forEach((shipment) => {
          if (now >= shipment.endTime && shipment.status === 'shipping') {
            completeShipment(shipment);
          }
        });
      }

      // Check player active production
      if (playerCompany.activeProduction && now >= playerCompany.activeProduction.endTime) {
        completeProduction(playerCompany.activeProduction);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isGamePaused, playerCompany.activeShipments, playerCompany.activeProduction, completeShipment, completeProduction]);

  // Market & Order Ticker (Every 5 seconds)
  useEffect(() => {
    if (isGamePaused) return;

    const marketInterval = setInterval(() => {
      setGameState((prev) => {
        const newMaterials = tickMarketPrices(prev.rawMaterials);
        // Automatically prune expired/stale orders and inject fresh orders targeting in-stock perfumes
        const refreshedOrders = pruneAndRefreshOrders(prev.orders, prev.perfumes, prev.companies);

        // Player Flagship Boutique & International Counter Sales (continuous fluid retail sales)
        let updatedCompanies = prev.companies;
        const playerCompIndex = prev.companies.findIndex((c) => c.isPlayer);
        if (playerCompIndex !== -1) {
          const playerComp = prev.companies[playerCompIndex];
          const stockedPerfumes = Object.values(playerComp.productStorage || {}).filter((p) => (p.quantity || 0) >= 1);
          
          if (stockedPerfumes.length > 0 && Math.random() < 0.78) {
            const targetItem = stockedPerfumes[Math.floor(Math.random() * stockedPerfumes.length)];
            const perfumeDef = prev.perfumes.find((p) => p.id === targetItem.perfumeId);
            const activePerfumer = prev.perfumers.find((pf) => pf.id === playerComp.perfumerId) || prev.perfumers[0];
            const targetCountries = [
              ...(activePerfumer?.favoredCountries || []),
              'Fransa',
              'ABD',
              'Birleşik Arap Emirlikleri',
              'İtalya'
            ];
            const chosenCountry = normalizeCountryName(
              targetCountries[Math.floor(Math.random() * targetCountries.length)]
            );
            const baseRetail = perfumeDef?.suggestedRetailPrice || (targetItem.unitCost * 3) || 1200;
            const m = calculateSaleMarketingBonuses(baseRetail, playerComp, perfumeDef, chosenCountry, activePerfumer);
            const unitPrice = m.finalUnitPrice;
            const maxBoutiqueSell = m.matchedCountryNotes.length >= 2 ? 4 : 2;
            const saleQty = Math.min(targetItem.quantity, Math.floor(Math.random() * maxBoutiqueSell) + 1);
            const grossRev = saleQty * unitPrice;

            const newProdQty = targetItem.quantity - saleQty;
            const newProdBasis = Math.max(0, targetItem.totalCostBasis - (saleQty * targetItem.unitCost));
            const prevCountrySales = targetItem.countrySales || {};
            const prevCountryRev = targetItem.countryRevenue || {};

            const updatedProductStorage = {
              ...playerComp.productStorage,
              [targetItem.perfumeId]: {
                ...targetItem,
                quantity: newProdQty,
                totalCostBasis: newProdBasis,
                totalSold: (targetItem.totalSold || 0) + saleQty,
                lastSalePrice: unitPrice,
                countrySales: {
                  ...prevCountrySales,
                  [chosenCountry]: (prevCountrySales[chosenCountry] || 0) + saleQty
                },
                countryRevenue: {
                  ...prevCountryRev,
                  [chosenCountry]: (prevCountryRev[chosenCountry] || 0) + grossRev
                }
              }
            };

            const newCash = playerComp.cash + grossRev;
            const newRevenue = playerComp.totalRevenue + grossRev;
            const newNetProfit = newRevenue - playerComp.totalExpenses;
            const newMargin = newRevenue > 0 ? (newNetProfit / newRevenue) * 100 : 0;
            const notePct = Math.round((m.countryNoteHarmonyBonusRate + m.perfumerNoteMasteryBonusRate) * 100);

            const boutiqueRecord: FinancialRecord = {
              id: `fin_boutique_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              timestamp: Date.now(),
              type: 'income',
              category: 'product_sale',
              amount: grossRev,
              description: `Butik & VIP Perakende (${chosenCountry}): ${saleQty} adet ${perfumeDef?.name || targetItem.perfumeId}${notePct > 0 ? ` [🎵 Nota & Usta Farkı: +%${notePct}]` : ''}`,
              cashAfter: newCash,
              grossSaleAmount: grossRev,
              netSaleAmount: grossRev
            };

            updatedCompanies = [...prev.companies];
            updatedCompanies[playerCompIndex] = {
              ...playerComp,
              cash: newCash,
              totalRevenue: newRevenue,
              netProfit: newNetProfit,
              profitMargin: Math.round(newMargin * 10) / 10,
              productStorage: updatedProductStorage,
              financialHistory: [boutiqueRecord, ...playerComp.financialHistory.slice(0, 19)]
            };
          }
        }

        return {
          ...prev,
          rawMaterials: newMaterials,
          orders: refreshedOrders,
          companies: updatedCompanies
        };
      });
    }, 5000);

    return () => clearInterval(marketInterval);
  }, [isGamePaused]);

  // Bot AI Competition Actions & Loop
  const toggleBotAi = useCallback(() => {
    setIsBotAiEnabled((prev) => {
      const next = !prev;
      addToast({
        type: next ? 'success' : 'info',
        title: next ? '🤖 Rakip Botlar Aktif' : '⏸️ Rakip Botlar Duraklatıldı',
        message: next
          ? 'Scentora, Parfuma ve Aura Bella aktif olarak hammadde alacak, AR-GE yapacak ve satış yapacaktır.'
          : 'Rakip şirketlerin otonom hareketleri duraklatıldı.'
      });
      return next;
    });
  }, [addToast]);

  const triggerBotTurn = useCallback(() => {
    setGameState((prev) => {
      const result = tickBotSimulation(
        prev.companies,
        prev.rawMaterials,
        prev.perfumes,
        prev.perfumers,
        prev.orders,
        prev.rndArchive,
        prev.sectorActivities || [],
        prev.secretRecipes || [],
        isSpectatorMode
      );
      return {
        ...prev,
        companies: result.updatedCompanies,
        rawMaterials: result.updatedMaterials,
        perfumes: result.updatedPerfumes,
        orders: result.updatedOrders,
        rndArchive: result.updatedRndArchive,
        secretRecipes: result.updatedSecretRecipes || prev.secretRecipes,
        sectorActivities: result.newActivities
      };
    });
    addToast({
      type: 'info',
      title: '⚡ Bot Simülasyon Turu Tamamlandı',
      message: isSpectatorMode
        ? 'Tüm 4 parfümeri şirketi otonom operasyonlar gerçekleştirdi.'
        : 'Sektördeki rakip parfümeri şirketleri yeni operasyonlar gerçekleştirdi.'
    });
  }, [addToast, isSpectatorMode]);

  // Dynamic Bot AI Loop (every 7s on normal, 3.5s on fast, 14s on slow)
  useEffect(() => {
    if (isGamePaused || !isBotAiEnabled) return;

    const intervalMs = botSpeed === 'fast' ? 3500 : botSpeed === 'slow' ? 14000 : 7000;
    const botTimer = setInterval(() => {
      setGameState((prev) => {
        const result = tickBotSimulation(
          prev.companies,
          prev.rawMaterials,
          prev.perfumes,
          prev.perfumers,
          prev.orders,
          prev.rndArchive,
          prev.sectorActivities || [],
          prev.secretRecipes || [],
          isSpectatorMode
        );

        return {
          ...prev,
          companies: result.updatedCompanies,
          rawMaterials: result.updatedMaterials,
          perfumes: result.updatedPerfumes,
          orders: result.updatedOrders,
          rndArchive: result.updatedRndArchive,
          secretRecipes: result.updatedSecretRecipes || prev.secretRecipes,
          sectorActivities: result.newActivities
        };
      });
    }, intervalMs);

    return () => clearInterval(botTimer);
  }, [isGamePaused, isBotAiEnabled, botSpeed, isSpectatorMode]);

  // Action: Buy Raw Material (applies player's Perfumer bonuses)
  const buyRawMaterial = useCallback((materialId: string, quantity: number) => {
    const material = rawMaterialsMap.get(materialId);
    if (!material) {
      addToast({ type: 'error', title: 'Hata', message: 'Hammadde bulunamadı.' });
      return;
    }

    if (quantity <= 0) {
      addToast({ type: 'warning', title: 'Uyarı', message: 'Lütfen geçerli bir miktar girin.' });
      return;
    }

    if (quantity > material.exchangeStock) {
      addToast({
        type: 'warning',
        title: 'Yetersiz Borsa Stoğu',
        message: `Borsada yalnızca ${material.exchangeStock} adet ${material.name} bulunmaktadır.`
      });
      return;
    }

    const { shipment, financialRecord } = createShipment(
      playerCompany.id,
      material,
      quantity,
      playerPerfumer
    );

    if (playerCompany.cash < shipment.totalCost) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `Bu satın alma için ${shipment.totalCost.toLocaleString('tr-TR')} TL gereklidir. Bakiyeniz: ${playerCompany.cash.toLocaleString('tr-TR')} TL.`
      });
      return;
    }

    setGameState((prev) => {
      const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      if (compIndex === -1) return prev;

      const comp = prev.companies[compIndex];
      const newCash = Math.round((comp.cash - shipment.totalCost) * 100) / 100;
      financialRecord.cashAfter = newCash;

      const updatedExpenses = comp.totalExpenses + shipment.totalCost;
      const updatedNetProfit = comp.totalRevenue - updatedExpenses;
      const updatedMargin = comp.totalRevenue > 0 ? (updatedNetProfit / comp.totalRevenue) * 100 : 0;

      const updatedComp: Company = {
        ...comp,
        cash: newCash,
        totalExpenses: updatedExpenses,
        netProfit: updatedNetProfit,
        profitMargin: Math.round(updatedMargin * 10) / 10,
        activeShipments: [shipment, ...comp.activeShipments],
        financialHistory: [financialRecord, ...comp.financialHistory]
      };

      const updatedMaterials = prev.rawMaterials.map((m) => {
        if (m.id === materialId) {
          return {
            ...m,
            exchangeStock: Math.max(0, m.exchangeStock - quantity),
            demand: Math.min(99, m.demand + 2)
          };
        }
        return m;
      });

      const updatedCompanies = [...prev.companies];
      updatedCompanies[compIndex] = updatedComp;

      return {
        ...prev,
        rawMaterials: updatedMaterials,
        companies: updatedCompanies
      };
    });

    addToast({
      type: 'info',
      title: '🚢 Satın Alma Başarılı & Nakliye Başladı',
      message: `${quantity} adet ${material.name} alındı (${Math.floor(shipment.duration / 60)} dk ${shipment.duration % 60} sn). ${playerPerfumer.name} bonusu uygulandı.`
    });
  }, [rawMaterialsMap, playerCompany, playerPerfumer, addToast]);

  // Fast-Forward Shipment
  const instantCompleteShipment = useCallback((shipmentId: string) => {
    const shipment = playerCompany.activeShipments.find((s) => s.id === shipmentId);
    if (shipment) {
      completeShipment(shipment);
    }
  }, [playerCompany.activeShipments, completeShipment]);

  // Action: Start Perfume Production (1, 5, 10, 50, 100)
  const startProductionJob = useCallback((perfumeId: string, batchSize: number = 100) => {
    const perfume = perfumesMap.get(perfumeId);
    if (!perfume) {
      addToast({ type: 'error', title: 'Hata', message: 'Parfüm formülü bulunamadı.' });
      return;
    }

    try {
      const { production, financialRecord } = startProduction(
        perfume,
        playerCompany,
        rawMaterialsMap,
        batchSize
      );

      if (playerCompany.cash < production.costBreakdown.factoryLaborCost) {
        addToast({
          type: 'error',
          title: 'Yetersiz Bakiye',
          message: `Üretim laboratuvar masrafı için ${production.costBreakdown.factoryLaborCost.toLocaleString('tr-TR')} TL gereklidir.`
        });
        return;
      }

      setGameState((prev) => {
        const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
        if (compIndex === -1) return prev;

        const comp = prev.companies[compIndex];
        const newCash = Math.round((comp.cash - production.costBreakdown.factoryLaborCost) * 100) / 100;
        financialRecord.cashAfter = newCash;

        const updatedExpenses = comp.totalExpenses + production.costBreakdown.factoryLaborCost;
        const updatedNetProfit = comp.totalRevenue - updatedExpenses;
        const updatedMargin = comp.totalRevenue > 0 ? (updatedNetProfit / comp.totalRevenue) * 100 : 0;

        const updatedComp: Company = {
          ...comp,
          cash: newCash,
          totalExpenses: updatedExpenses,
          netProfit: updatedNetProfit,
          profitMargin: Math.round(updatedMargin * 10) / 10,
          activeProduction: production,
          financialHistory: [financialRecord, ...comp.financialHistory]
        };

        const updatedCompanies = [...prev.companies];
        updatedCompanies[compIndex] = updatedComp;

        return {
          ...prev,
          companies: updatedCompanies
        };
      });

      addToast({
        type: 'info',
        title: '🧪 Parfüm Üretimi Başladı!',
        message: `${batchSize} adet ${perfume.name} için ${production.duration} saniyelik üretim süreci başladı.`
      });
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Üretim Başlatılamadı',
        message: err.message || 'Üretim için gerekli koşullar sağlanamadı.'
      });
    }
  }, [perfumesMap, playerCompany, rawMaterialsMap, addToast]);

  // Fast-Forward Production
  const instantCompleteProduction = useCallback(() => {
    if (playerCompany.activeProduction) {
      completeProduction(playerCompany.activeProduction);
    }
  }, [playerCompany.activeProduction, completeProduction]);

  // Action: Sell to Order with Perfumer Royalty & Export Bonus
  const sellToOrder = useCallback((orderId: string, quantity: number, targetProductId?: string) => {
    const order = gameState.orders.find((o) => o.id === orderId);
    if (!order) {
      addToast({ type: 'error', title: 'Hata', message: 'Sipariş bulunamadı.' });
      return;
    }

    const effectiveProductId = targetProductId || order.productId;
    const perfume = perfumesMap.get(effectiveProductId);

    try {
      const result = fulfillMarketOrder(
        order,
        quantity,
        playerCompany,
        perfume,
        playerPerfumer,
        effectiveProductId
      );

      setGameState((prev) => {
        const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
        if (compIndex === -1) return prev;

        const comp = prev.companies[compIndex];
        const newCash = Math.round((comp.cash + result.netRevenue) * 100) / 100;
        result.saleRecord.cashAfter = Math.round((comp.cash + result.grossRevenue) * 100) / 100;
        if (result.royaltyRecord) {
          result.royaltyRecord.cashAfter = newCash;
        }

        // Deduct from product storage using the fulfilled product ID
        const currentProd = comp.productStorage[result.productId];
        const newProdQty = Math.max(0, (currentProd?.quantity || 0) - result.fulfilledQuantity);
        const newBasis = Math.max(0, (currentProd?.totalCostBasis || 0) - (result.fulfilledQuantity * (currentProd?.unitCost || 0)));
        const normOrderCountry = normalizeCountryName(order.country);
        const prevCSales = currentProd?.countrySales || {};
        const prevCRev = currentProd?.countryRevenue || {};

        const updatedProductStorage = {
          ...comp.productStorage,
          [result.productId]: {
            ...currentProd,
            quantity: newProdQty,
            totalCostBasis: newBasis,
            totalSold: (currentProd?.totalSold || 0) + result.fulfilledQuantity,
            lastSalePrice: result.finalUnitPrice || order.pricePerUnit,
            countrySales: {
              ...prevCSales,
              [normOrderCountry]: (prevCSales[normOrderCountry] || 0) + result.fulfilledQuantity
            },
            countryRevenue: {
              ...prevCRev,
              [normOrderCountry]: (prevCRev[normOrderCountry] || 0) + result.grossRevenue
            }
          }
        };

        const updatedRevenue = comp.totalRevenue + result.grossRevenue;
        const updatedExpenses = comp.totalExpenses + result.royaltyAmount;
        const updatedNetProfit = updatedRevenue - updatedExpenses;
        const updatedMargin = updatedRevenue > 0 ? (updatedNetProfit / updatedRevenue) * 100 : 0;

        const newRecords = result.royaltyRecord
          ? [result.royaltyRecord, result.saleRecord, ...comp.financialHistory]
          : [result.saleRecord, ...comp.financialHistory];

        const currentSalesRep = comp.salesRep || COMPANY_DEFAULT_SALES_REPS[comp.id] || COMPANY_DEFAULT_SALES_REPS.aromalux;
        const updatedSalesRep = {
          ...currentSalesRep,
          closedDeals: (currentSalesRep.closedDeals || 0) + 1,
          bonusRevenueGenerated: Math.round((currentSalesRep.bonusRevenueGenerated || 0) + (result.bonusRevenue || 0))
        };

        const updatedComp: Company = {
          ...comp,
          cash: newCash,
          totalRevenue: updatedRevenue,
          totalExpenses: updatedExpenses,
          netProfit: updatedNetProfit,
          profitMargin: Math.round(updatedMargin * 10) / 10,
          productStorage: updatedProductStorage,
          salesRep: updatedSalesRep,
          financialHistory: newRecords
        };

        const updatedOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            return result.updatedOrder;
          }
          return o;
        });

        const exportFameGain = result.fulfilledQuantity >= 45 ? 1 : 0.5;
        const updatedPerfumes = prev.perfumes.map((p) => {
          if (p.id === result.productId) {
            return { ...p, fame: Math.min(100, Math.round((getPerfumeFame(p) + exportFameGain) * 10) / 10) };
          }
          return p;
        });

        const updatedCompanies = [...prev.companies];
        updatedCompanies[compIndex] = updatedComp;

        return {
          ...prev,
          orders: updatedOrders,
          perfumes: updatedPerfumes,
          companies: updatedCompanies
        };
      });

      const royaltyInfo = result.royaltyAmount > 0
        ? ` (Telif: -${result.royaltyAmount.toLocaleString('tr-TR')} ₺ -> ${result.perfumerName})`
        : '';
      const bonusInfo = result.bonusRevenue > 0
        ? ` (İkna/Şöhret/Ülke Primi: +${result.bonusRevenue.toLocaleString('tr-TR')} ₺)`
        : '';

      addToast({
        type: 'success',
        title: '💰 Sipariş Teslimatı Başarılı!',
        message: `${result.fulfilledQuantity} adet satıldı. Brüt: ${result.grossRevenue.toLocaleString('tr-TR')} ₺${bonusInfo}${royaltyInfo} | Net: +${result.netRevenue.toLocaleString('tr-TR')} ₺`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Satış Başarısız',
        message: err.message || 'Sipariş karşılanamadı.'
      });
    }
  }, [gameState.orders, perfumesMap, playerCompany, playerPerfumer, addToast]);

  // Action: Sell Product Wholesale (Direct liquidation to domestic luxury department stores / boutiques)
  const sellProductWholesale = useCallback((perfumeId: string, quantity: number) => {
    const perfume = perfumesMap.get(perfumeId);
    if (!perfume) {
      addToast({ type: 'error', title: 'Hata', message: 'Parfüm bulunamadı.' });
      return;
    }

    const currentStock = playerCompany.productStorage[perfumeId]?.quantity || 0;
    if (currentStock <= 0) {
      addToast({ type: 'warning', title: 'Stok Yok', message: 'Bu parfümden depoda stok bulunmuyor.' });
      return;
    }

    const validQty = Math.min(quantity, currentStock);
    if (validQty <= 0) return;

    // Base wholesale price is 78% of retail price, boosted by Sales Rep Persuasion + Perfume Fame + Active Ads!
    const baseWholesale = Math.round(perfume.suggestedRetailPrice * 0.78);
    const marketing = calculateSaleMarketingBonuses(baseWholesale, playerCompany, perfume, undefined, playerPerfumer);
    const wholesaleUnitPrice = marketing.finalUnitPrice;
    const grossRevenue = validQty * wholesaleUnitPrice;
    const bonusRevenue = Math.max(0, validQty * (wholesaleUnitPrice - baseWholesale));

    // Royalty if applicable (AR-GE perfumes)
    const royaltyRate = perfume.royaltyRate || 0;
    const royaltyAmount = Math.round(grossRevenue * royaltyRate * 100) / 100;
    const netRevenue = Math.round((grossRevenue - royaltyAmount) * 100) / 100;

    const now = Date.now();
    const saleRecord: FinancialRecord = {
      id: `fin_wsale_${now}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      type: 'income',
      category: 'product_sale',
      amount: grossRevenue,
      description: `Toptan Distribütör Satışı: ${validQty} adet ${perfume.name} (İkna & Şöhretli Birim: ${wholesaleUnitPrice} ₺)`,
      cashAfter: 0,
      grossSaleAmount: grossRevenue,
      royaltyAmount,
      netSaleAmount: netRevenue
    };

    let royaltyRecord: FinancialRecord | undefined;
    if (royaltyAmount > 0) {
      royaltyRecord = {
        id: `fin_royalty_wsale_${now}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now + 1,
        type: 'expense',
        category: 'perfumer_royalty',
        amount: royaltyAmount,
        description: `PARFÜMATÖR TELİFİ (Toptan Satış): %${(royaltyRate * 100).toFixed(1)} telif ödemesi (${perfume.perfumerName || playerPerfumer.name})`,
        cashAfter: 0,
        grossSaleAmount: grossRevenue
      };
    }

    setGameState((prev) => {
      const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      if (compIndex === -1) return prev;

      const comp = prev.companies[compIndex];
      const newCash = Math.round((comp.cash + netRevenue) * 100) / 100;
      saleRecord.cashAfter = Math.round((comp.cash + grossRevenue) * 100) / 100;
      if (royaltyRecord) royaltyRecord.cashAfter = newCash;

      const currentProd = comp.productStorage[perfumeId];
      const newProdQty = Math.max(0, currentProd.quantity - validQty);
      const newBasis = Math.max(0, currentProd.totalCostBasis - (validQty * currentProd.unitCost));
      const popList = getPerfumePopularCountries(perfume);
      const defaultCountry = popList[0] || 'Fransa';
      const prevWSales = currentProd?.countrySales || {};
      const prevWRev = currentProd?.countryRevenue || {};

      const updatedProductStorage = {
        ...comp.productStorage,
        [perfumeId]: {
          ...currentProd,
          quantity: newProdQty,
          totalCostBasis: newBasis,
          totalSold: (currentProd?.totalSold || 0) + validQty,
          lastSalePrice: wholesaleUnitPrice,
          countrySales: {
            ...prevWSales,
            [defaultCountry]: (prevWSales[defaultCountry] || 0) + validQty
          },
          countryRevenue: {
            ...prevWRev,
            [defaultCountry]: (prevWRev[defaultCountry] || 0) + grossRevenue
          }
        }
      };

      const updatedRevenue = comp.totalRevenue + grossRevenue;
      const updatedExpenses = comp.totalExpenses + royaltyAmount;
      const updatedNetProfit = updatedRevenue - updatedExpenses;
      const updatedMargin = updatedRevenue > 0 ? (updatedNetProfit / updatedRevenue) * 100 : 0;

      const newRecords = royaltyRecord
        ? [royaltyRecord, saleRecord, ...comp.financialHistory]
        : [saleRecord, ...comp.financialHistory];

      const currentSalesRep = comp.salesRep || COMPANY_DEFAULT_SALES_REPS[comp.id] || COMPANY_DEFAULT_SALES_REPS.aromalux;
      const updatedSalesRep = {
        ...currentSalesRep,
        closedDeals: (currentSalesRep.closedDeals || 0) + 1,
        bonusRevenueGenerated: Math.round((currentSalesRep.bonusRevenueGenerated || 0) + bonusRevenue)
      };

      const wholesaleFameGain = validQty >= 35 ? 0.5 : 0.3;
      const updatedPerfumes = prev.perfumes.map((p) => {
        if (p.id === perfumeId) {
          return { ...p, fame: Math.min(100, Math.round((getPerfumeFame(p) + wholesaleFameGain) * 10) / 10) };
        }
        return p;
      });

      const updatedCompanies = [...prev.companies];
      updatedCompanies[compIndex] = {
        ...comp,
        cash: newCash,
        totalRevenue: updatedRevenue,
        totalExpenses: updatedExpenses,
        netProfit: updatedNetProfit,
        profitMargin: Math.round(updatedMargin * 10) / 10,
        productStorage: updatedProductStorage,
        salesRep: updatedSalesRep,
        financialHistory: newRecords
      };

      return {
        ...prev,
        perfumes: updatedPerfumes,
        companies: updatedCompanies
      };
    });

    addToast({
      type: 'success',
      title: '📦 Toptan Distribütör Satışı Başarılı!',
      message: `${validQty} adet ${perfume.name} dağıtıcı ağına teslim edildi. Net Kasaya Giren: +${netRevenue.toLocaleString('tr-TR')} ₺`
    });
  }, [perfumesMap, playerCompany, playerPerfumer, addToast]);

  // Action: Conduct R&D (charges perfumer design fee)
  const conductRnd = useCallback((
    topNotes: string[],
    middleNotes: string[],
    baseNotes: string[],
    gender: GenderType,
    customAmounts?: Record<string, number>
  ): RndResult => {
    if (playerCompany.cash < playerPerfumer.designFee) {
      addToast({
        type: 'error',
        title: 'Yetersiz Nakit',
        message: `${playerPerfumer.name} tasarım ücreti ${playerPerfumer.designFee.toLocaleString('tr-TR')} TL'dir. Mevcut bakiye: ${playerCompany.cash.toLocaleString('tr-TR')} TL.`
      });
      throw new Error('Yetersiz nakit bakiye.');
    }

    const result = generateRndPerfume(
      topNotes,
      middleNotes,
      baseNotes,
      gender,
      rawMaterialsMap,
      playerCompany,
      playerPerfumer,
      customAmounts
    );

    const now = Date.now();
    const newCash = Math.round((playerCompany.cash - playerPerfumer.designFee) * 100) / 100;

    const designFeeRecord: FinancialRecord = {
      id: `fin_rnd_fee_${now}`,
      timestamp: now,
      type: 'expense',
      category: 'rnd_design_fee',
      amount: playerPerfumer.designFee,
      description: `AR-GE Tasarım Ücreti: ${playerPerfumer.name} (${result.name} formülü - ${result.resultLevel} İcat)`,
      relatedEntityId: result.id,
      cashAfter: newCash
    };

    setGameState((prev) => {
      const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      const updatedCompanies = [...prev.companies];
      if (compIndex !== -1) {
        const comp = updatedCompanies[compIndex];
        const updatedExpenses = comp.totalExpenses + playerPerfumer.designFee;
        const updatedNetProfit = comp.totalRevenue - updatedExpenses;
        const updatedMargin = comp.totalRevenue > 0 ? (updatedNetProfit / comp.totalRevenue) * 100 : 0;

        updatedCompanies[compIndex] = {
          ...comp,
          lastRndInventionAt: now,
          cash: newCash,
          totalExpenses: updatedExpenses,
          netProfit: updatedNetProfit,
          profitMargin: Math.round(updatedMargin * 10) / 10,
          financialHistory: [designFeeRecord, ...comp.financialHistory]
        };
      }

      return {
        ...prev,
        companies: updatedCompanies,
        rndArchive: [result, ...prev.rndArchive]
      };
    });

    const isSignature = result.resultLevel === 'Efsanevi';

    addToast({
      type: isSignature ? 'success' : (result.resultLevel === 'Basit' ? 'warning' : 'info'),
      title: isSignature ? '🏆 EFSANEVİ PARFÜM İCAT EDİLDİ!' : `🧬 Parfümatör: ${result.resultLevel} Seviye Sonuç!`,
      message: `"${result.name}" (${playerCompany.name} × ${playerPerfumer.name}) sentezlendi! Kalite: %${result.qualityScore}, Özgünlük: %${result.originalityScore}. Tasarım Ücreti: -${playerPerfumer.designFee.toLocaleString('tr-TR')} ₺.`
    });

    return result;
  }, [playerCompany, playerPerfumer, rawMaterialsMap, addToast]);

  // Action: Save R&D Formula (charges perfumer design fee, stores in archive)
  const saveRndFormula = useCallback((
    formulaName: string,
    items: FormulaInputItem[],
    gender: GenderType
  ): RndResult => {
    if (playerCompany.cash < playerPerfumer.designFee) {
      addToast({
        type: 'error',
        title: 'Yetersiz Nakit',
        message: `${playerPerfumer.name} tasarım ücreti ${playerPerfumer.designFee.toLocaleString('tr-TR')} TL'dir. Mevcut bakiye: ${playerCompany.cash.toLocaleString('tr-TR')} TL.`
      });
      throw new Error('Yetersiz nakit bakiye.');
    }

    const result = generateRndFromFormula(
      formulaName,
      items,
      gender,
      rawMaterialsMap,
      playerCompany,
      playerPerfumer
    );

    const now = Date.now();
    const newCash = Math.round((playerCompany.cash - playerPerfumer.designFee) * 100) / 100;

    const designFeeRecord: FinancialRecord = {
      id: `fin_rnd_fee_${now}`,
      timestamp: now,
      type: 'expense',
      category: 'rnd_design_fee',
      amount: playerPerfumer.designFee,
      description: `AR-GE Tasarım Ücreti: ${playerPerfumer.name} (${result.name} formülü - ${result.resultLevel} İcat)`,
      relatedEntityId: result.id,
      cashAfter: newCash
    };

    setGameState((prev) => {
      const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      const updatedCompanies = [...prev.companies];
      if (compIndex !== -1) {
        const comp = updatedCompanies[compIndex];
        const updatedExpenses = comp.totalExpenses + playerPerfumer.designFee;
        const updatedNetProfit = comp.totalRevenue - updatedExpenses;
        const updatedMargin = comp.totalRevenue > 0 ? (updatedNetProfit / comp.totalRevenue) * 100 : 0;

        updatedCompanies[compIndex] = {
          ...comp,
          lastRndInventionAt: now,
          cash: newCash,
          totalExpenses: updatedExpenses,
          netProfit: updatedNetProfit,
          profitMargin: Math.round(updatedMargin * 10) / 10,
          financialHistory: [designFeeRecord, ...comp.financialHistory]
        };
      }

      return {
        ...prev,
        companies: updatedCompanies,
        rndArchive: [result, ...prev.rndArchive]
      };
    });

    const isSignature = result.resultLevel === 'Efsanevi';
    addToast({
      type: isSignature ? 'success' : (result.resultLevel === 'Basit' ? 'warning' : 'info'),
      title: isSignature ? '🏆 EFSANEVİ PARFÜM FORMÜLÜ KAYDEDİLDİ!' : `⚗️ Formül Kaydedildi (${result.resultLevel} Seviye)`,
      message: `"${result.name}" (${result.totalDrops} Damla) başarıyla kaydedildi! Kalite: %${result.qualityScore}, Harmoni: %${result.harmonyScore}. Tasarım Ücreti: -${playerPerfumer.designFee.toLocaleString('tr-TR')} ₺.`
    });

    return result;
  }, [playerCompany, playerPerfumer, rawMaterialsMap, addToast]);

  // Action: Register R&D Perfume into Production Catalogue
  const registerRndPerfume = useCallback((rndResultId: string) => {
    const rnd = gameState.rndArchive.find((r) => r.id === rndResultId);
    if (!rnd) return;

    if (gameState.perfumes.some((p) => p.id === rnd.id)) {
      addToast({
        type: 'warning',
        title: 'Zaten Kayıtlı',
        message: 'Bu parfüm zaten üretim portföyünüze eklenmiş.'
      });
      return;
    }

    const newPerfume = convertRndToPerfume(rnd);

    setGameState((prev) => {
      const nextPerfumes = [newPerfume, ...prev.perfumes];
      const freshOrder1 = generateRandomOrder([newPerfume], prev.companies);
      const freshOrder2 = generateRandomOrder(nextPerfumes, prev.companies);
      return {
        ...prev,
        perfumes: nextPerfumes,
        orders: [freshOrder1, freshOrder2, ...prev.orders],
        rndArchive: prev.rndArchive.map((item) =>
          item.id === rndResultId ? { ...item, isAddedToProduction: true } : item
        )
      };
    });

    addToast({
      type: 'success',
      title: '📋 Üretim Portföyüne Eklendi',
      message: `"${newPerfume.name}" (${newPerfume.companyName} × ${newPerfume.perfumerName}) artık Üretim Tesisi'nde üretilebilir ve uluslararası siparişleri açıldı!`
    });
  }, [gameState.rndArchive, gameState.perfumes, addToast]);

  // Action: Assign Perfumer to Player Company
  const assignPerfumerToPlayerCompany = useCallback((perfumerId: string) => {
    const targetPerfumer = perfumersMap.get(perfumerId);
    if (!targetPerfumer) return;

    setGameState((prev) => {
      const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      if (compIndex === -1) return prev;

      const updatedCompanies = [...prev.companies];
      updatedCompanies[compIndex] = {
        ...updatedCompanies[compIndex],
        perfumerId
      };

      return {
        ...prev,
        companies: updatedCompanies
      };
    });

    addToast({
      type: 'info',
      title: '👔 Yeni ParfümATÖR Göreve Başladı',
      message: `${targetPerfumer.name} AromaLux baş parfümörü olarak atandı. Bonusları aktif!`
    });
  }, [playerCompany.id, perfumersMap, addToast]);

  // Action: Buy Secret Recipe dossier
  const buySecretRecipe = useCallback((secretId: string) => {
    const secret = gameState.secretRecipes.find((s) => s.id === secretId);
    if (!secret) return;

    if (secret.isPurchased) {
      addToast({
        type: 'info',
        title: 'Zaten Satın Alındı',
        message: `${secret.codeName} gizli reçetesi zaten açılmış durumda. AR-GE'de çözebilirsiniz.`
      });
      return;
    }

    if (playerCompany.cash < secret.purchasePrice) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `Gizli reçete bedeli ${secret.purchasePrice.toLocaleString('tr-TR')} ₺'dir. Mevcut nakdiniz: ${playerCompany.cash.toLocaleString('tr-TR')} ₺.`
      });
      return;
    }

    const now = Date.now();
    const newCash = Math.round((playerCompany.cash - secret.purchasePrice) * 100) / 100;

    const record: FinancialRecord = {
      id: `fin_secret_${now}`,
      timestamp: now,
      type: 'expense',
      category: 'secret_recipe_purchase',
      amount: secret.purchasePrice,
      description: `Gizli Reçete Dosyası Satın Alındı: ${secret.codeName}`,
      relatedEntityId: secret.id,
      cashAfter: newCash
    };

    setGameState((prev) => {
      const compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      const updatedCompanies = [...prev.companies];
      if (compIndex !== -1) {
        const comp = updatedCompanies[compIndex];
        const updatedExpenses = comp.totalExpenses + secret.purchasePrice;
        const updatedNetProfit = comp.totalRevenue - updatedExpenses;
        const updatedMargin = comp.totalRevenue > 0 ? (updatedNetProfit / comp.totalRevenue) * 100 : 0;

        updatedCompanies[compIndex] = {
          ...comp,
          cash: newCash,
          totalExpenses: updatedExpenses,
          netProfit: updatedNetProfit,
          profitMargin: Math.round(updatedMargin * 10) / 10,
          financialHistory: [record, ...comp.financialHistory]
        };
      }

      const updatedSecrets = prev.secretRecipes.map((s) => {
        if (s.id === secretId) {
          return {
            ...s,
            isPurchased: true,
            status: 'purchased' as const,
            unlockedAt: now
          };
        }
        return s;
      });

      return {
        ...prev,
        companies: updatedCompanies,
        secretRecipes: updatedSecrets
      };
    });

    addToast({
      type: 'success',
      title: '📁 Gizli Dosya Satın Alındı!',
      message: `${secret.codeName} sarı zarfı açıldı. 3 tahmin hakkınızla AR-GE'de çözmeye başlayabilirsiniz!`
    });
  }, [gameState.secretRecipes, playerCompany, addToast]);

  // Action: Guess Secret Recipe Notes (Max 3 Attempts)
  const guessSecretRecipe = useCallback((
    secretId: string,
    topNotes: string[],
    middleNotes: string[],
    baseNotes: string[]
  ): SecretRecipeAttempt => {
    const secret = gameState.secretRecipes.find((s) => s.id === secretId);
    if (!secret) throw new Error('Gizli reçete bulunamadı.');
    if (!secret.isPurchased) throw new Error('Önce bu gizli reçeteyi satın almalısınız.');
    if (secret.status === 'solved') throw new Error('Bu reçete zaten başarıyla çözüldü.');
    if (secret.attemptsLeft <= 0 || secret.status === 'failed') throw new Error('Tahmin haklarınız tükendi.');

    const { attempt, isSolved, discoveredNotes } = evaluateSecretAttempt(
      secret,
      topNotes,
      middleNotes,
      baseNotes,
      rawMaterialsMap,
      playerPerfumer
    );

    const newAttemptsLeft = secret.attemptsLeft - 1;
    const newStatus: 'solved' | 'failed' | 'purchased' = isSolved ? 'solved' : (newAttemptsLeft <= 0 ? 'failed' : 'purchased');

    let solvedPerfume: Perfume | null = null;
    if (isSolved) {
      solvedPerfume = convertSecretToPerfume(secret, playerCompany.id, playerPerfumer);
    }

    setGameState((prev) => {
      const updatedSecrets = prev.secretRecipes.map((s) => {
        if (s.id === secretId) {
          return {
            ...s,
            attemptsLeft: newAttemptsLeft,
            status: newStatus,
            attempts: [...s.attempts, attempt],
            discoveredNotes: discoveredNotes
          };
        }
        return s;
      });

      let updatedPerfumes = prev.perfumes;
      let updatedOrders = prev.orders;
      if (solvedPerfume && !prev.perfumes.some((p) => p.id === solvedPerfume.id)) {
        updatedPerfumes = [solvedPerfume, ...prev.perfumes];
        const freshOrd = generateRandomOrder([solvedPerfume], prev.companies);
        updatedOrders = [freshOrd, ...prev.orders];
      }

      return {
        ...prev,
        secretRecipes: updatedSecrets,
        perfumes: updatedPerfumes,
        orders: updatedOrders
      };
    });

    if (isSolved) {
      addToast({
        type: 'success',
        title: '🎉 PARFÜMÜ İCAT ETTİN!',
        message: `Tebrikler! ${secret.realPerfume.brand} - ${secret.realPerfume.name} formülünü çözdün ve üretim kataloğuna kazandırdın!`
      });
    } else if (newAttemptsLeft === 0) {
      addToast({
        type: 'error',
        title: '❌ 3 Tahmin Hakkı Bitti',
        message: `${secret.codeName} çözülemedi ve kilitlendi. Parfümatör yorumunu inceleyebilirsiniz.`
      });
    } else {
      addToast({
        type: 'info',
        title: `🔍 Parfümatör Analizi (Kalan Hak: ${newAttemptsLeft})`,
        message: attempt.perfumerComment
      });
    }

    return attempt;
  }, [gameState.secretRecipes, rawMaterialsMap, playerCompany.id, playerPerfumer, addToast]);

  // Action: Unlock & Solve Secret Recipe directly in AR-GE
  const unlockSecretRecipeDirectly = useCallback((secretId: string) => {
    const secret = gameState.secretRecipes.find((s) => s.id === secretId);
    if (!secret) return;
    if (!secret.isPurchased) {
      addToast({
        type: 'error',
        title: 'Önce Zarfı Satın Alın',
        message: 'Bu gizli formülü laboratuvarda çözebilmek için önce sarı zarfı satın almalısınız.'
      });
      return;
    }

    const solvedPerfume = convertSecretToPerfume(secret, playerCompany.id, playerPerfumer);

    setGameState((prev) => {
      const updatedSecrets = prev.secretRecipes.map((s) => {
        if (s.id === secretId) {
          return {
            ...s,
            status: 'solved' as const
          };
        }
        return s;
      });

      let updatedPerfumes = prev.perfumes;
      let updatedOrders = prev.orders;
      if (!prev.perfumes.some((p) => p.id === solvedPerfume.id)) {
        updatedPerfumes = [solvedPerfume, ...prev.perfumes];
        const freshOrd = generateRandomOrder([solvedPerfume], prev.companies);
        updatedOrders = [freshOrd, ...prev.orders];
      }

      return {
        ...prev,
        secretRecipes: updatedSecrets,
        perfumes: updatedPerfumes,
        orders: updatedOrders
      };
    });

    addToast({
      type: 'success',
      title: '🏆 Gizli Reçete Çözüldü & Üretime Eklendi!',
      message: `"${solvedPerfume.name}" (${solvedPerfume.brand}) AR-GE laboratuvarında çözüldü! Artık Üretim sayfasında üretilebilir.`
    });
  }, [gameState.secretRecipes, playerCompany.id, playerPerfumer, addToast]);

  // Action: Reward Legendary Perfume from Formülü Bul Deduction Game
  const rewardLegendaryPerfume = useCallback((perfume: Perfume, bonusCash: number = 30000, silent: boolean = false) => {
    setGameState((prev) => {
      let companyIndex = prev.companies.findIndex((c) => c.isPlayer);
      if (companyIndex === -1) {
        companyIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      }
      if (companyIndex === -1) companyIndex = 0;
      const comp = prev.companies[companyIndex];
      const now = Date.now();
      const newCash = Math.round((comp.cash + bonusCash) * 100) / 100;

      const record: FinancialRecord = {
        id: `fin_legendary_reward_${now}`,
        timestamp: now,
        type: 'income',
        category: 'other',
        amount: bonusCash,
        description: `🏆 Efsanevi Formül Buluş Ödülü: "${perfume.name}"`,
        cashAfter: newCash
      };

      const estUnitCost = Math.max(140, Math.round((perfume.suggestedRetailPrice || 1400) * 0.22));
      const updatedProductStorage: Record<string, ProductInventoryItem> = {
        ...comp.productStorage,
        [perfume.id]: comp.productStorage[perfume.id] || {
          perfumeId: perfume.id,
          quantity: 0,
          totalCostBasis: 0,
          unitCost: estUnitCost,
          lastSalePrice: perfume.suggestedRetailPrice,
          suggestedSalePrice: perfume.suggestedRetailPrice,
          totalSold: 0
        }
      };

      const updatedCompanies = [...prev.companies];
      updatedCompanies[companyIndex] = {
        ...comp,
        cash: newCash,
        totalRevenue: comp.totalRevenue + bonusCash,
        productStorage: updatedProductStorage,
        financialHistory: [record, ...comp.financialHistory]
      };

      let updatedPerfumes = prev.perfumes;
      let updatedOrders = prev.orders;
      if (!prev.perfumes.some((p) => p.id === perfume.id)) {
        updatedPerfumes = [perfume, ...prev.perfumes];
        const freshOrd1 = generateRandomOrder([perfume], updatedCompanies);
        const freshOrd2 = generateRandomOrder(updatedPerfumes, updatedCompanies);
        updatedOrders = [freshOrd1, freshOrd2, ...prev.orders];
      }

      return {
        ...prev,
        companies: updatedCompanies,
        perfumes: updatedPerfumes,
        orders: updatedOrders
      };
    });

    if (!silent) {
      addToast({
        type: 'success',
        title: '👑 GİZLİ REÇETE DEŞİFRE EDİLDİ!',
        message: `Tebrikler! "${perfume.name}" formülünü başarıyla deşifre ettiniz! Reçete Üretim Tesisine eklendi ve +${bonusCash.toLocaleString('tr-TR')} ₺ ödül şirketinize aktarıldı!`
      });
    }
  }, [addToast, playerCompany.id]);

  // Action: Add Company Cash (Sermaye Takviyesi)
  const addCompanyCash = useCallback((amount: number) => {
    setGameState((prev) => {
      let companyIndex = prev.companies.findIndex((c) => c.isPlayer);
      if (companyIndex === -1) {
        companyIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      }
      if (companyIndex === -1) companyIndex = 0;
      const comp = prev.companies[companyIndex];
      const newCash = Math.round((comp.cash + amount) * 100) / 100;
      const record: FinancialRecord = {
        id: `fin_inject_${Date.now()}`,
        timestamp: Date.now(),
        type: 'income',
        category: 'other',
        amount,
        description: 'Sermaye Artırımı / Nakit Takviyesi',
        cashAfter: newCash
      };
      const updatedCompanies = [...prev.companies];
      updatedCompanies[companyIndex] = {
        ...comp,
        cash: newCash,
        financialHistory: [record, ...comp.financialHistory]
      };
      return {
        ...prev,
        companies: updatedCompanies
      };
    });
    addToast({
      type: 'success',
      title: '💰 Şirket Kasasına Nakit Eklendi',
      message: `+${amount.toLocaleString('tr-TR')} ₺ şirket hesabına aktarıldı.`
    });
  }, [addToast, playerCompany.id]);

  // Action: Deduct Company Cash (Masraf / Katılım Ücreti)
  const deductCompanyCash = useCallback((amount: number, description: string, category: string = 'rnd_expense'): boolean => {
    if (!playerCompany || playerCompany.cash < amount) {
      return false;
    }

    setGameState((prev) => {
      let companyIndex = prev.companies.findIndex((c) => c.isPlayer);
      if (companyIndex === -1) {
        companyIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      }
      if (companyIndex === -1) companyIndex = 0;
      const comp = prev.companies[companyIndex];
      if (!comp || comp.cash < amount) {
        return prev;
      }
      const now = Date.now();
      const newCash = Math.round((comp.cash - amount) * 100) / 100;
      const newExpenses = comp.totalExpenses + amount;
      const newNetProfit = comp.totalRevenue - newExpenses;
      const newMargin = comp.totalRevenue > 0 ? (newNetProfit / comp.totalRevenue) * 100 : 0;

      const record: FinancialRecord = {
        id: `fin_deduct_${now}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        type: 'expense',
        category: category as any,
        amount,
        description,
        cashAfter: newCash
      };

      const updatedCompanies = [...prev.companies];
      updatedCompanies[companyIndex] = {
        ...comp,
        cash: newCash,
        totalExpenses: newExpenses,
        netProfit: newNetProfit,
        profitMargin: Math.round(newMargin * 10) / 10,
        financialHistory: [record, ...comp.financialHistory.slice(0, 20)]
      };

      return {
        ...prev,
        companies: updatedCompanies
      };
    });
    return true;
  }, [playerCompany]);

  // Action: Seek Fresh Global Export Orders (Pazar Talebi Çağrısı)
  const seekFreshOrders = useCallback(() => {
    if (gameState.perfumes.length === 0) {
      addToast({
        type: 'warning',
        title: 'Henüz İcat Edilmiş Parfüm Yok',
        message: 'Sıfırdan üretime başladığınız için önce AR-GE Laboratuvarında veya Formülü Bul masasında ilk parfümünüzü oluşturmalısınız!'
      });
      return;
    }
    setGameState((prev) => {
      if (prev.perfumes.length === 0) return prev;
      const order1 = generateRandomOrder(prev.perfumes, prev.companies);
      const order2 = generateRandomOrder(prev.perfumes, prev.companies);
      const order3 = generateRandomOrder(prev.perfumes, prev.companies);
      return {
        ...prev,
        orders: [order1, order2, order3, ...prev.orders]
      };
    });
    addToast({
      type: 'success',
      title: '🌐 Yeni Küresel İhracat Talepleri Geldi!',
      message: 'Uluslararası lüks parfümeri alıcıları ve konsorsiyumlar mamul stoklarınıza özel 3 yeni ihracat sözleşmesi sundu.'
    });
  }, [gameState.perfumes.length, addToast]);

  // Action: Cancel/Decline Stale or Unwanted Order
  const cancelOrder = useCallback((orderId: string) => {
    setGameState((prev) => {
      const remainingOrders = prev.orders.filter((o) => o.id !== orderId);
      if (prev.perfumes.length === 0) {
        return {
          ...prev,
          orders: remainingOrders
        };
      }
      // Immediately generate a replacement order targeting current stock
      const freshReplacement = generateRandomOrder(prev.perfumes, prev.companies);
      return {
        ...prev,
        orders: [freshReplacement, ...remainingOrders]
      };
    });
    addToast({
      type: 'info',
      title: 'Sözleşme Reddedildi',
      message: 'Sipariş havuzdan çıkarıldı ve yerine yeni bir uluslararası alıcı sözleşmesi yönlendirildi.'
    });
  }, [addToast]);

  // Action: Launch Advertising Campaign (Boost Perfume Fame & Country Bonus + Attract VIP Orders)
  const launchAdCampaign = useCallback(
    (perfumeId: string, targetCountry: string, tier: 'influencer' | 'billboard' | 'gala') => {
      const pkg = AD_CAMPAIGN_PACKAGES.find((p) => p.tier === tier);
      const perfume = perfumesMap.get(perfumeId);
      if (!pkg || !perfume) {
        addToast({ type: 'error', title: 'Hata', message: 'Kampanya veya parfüm bulunamadı.' });
        return;
      }

      if (playerCompany.cash < pkg.cost) {
        addToast({
          type: 'error',
          title: 'Yetersiz Kasa Bakiyesi',
          message: `Bu reklam kampanyası için ${pkg.cost.toLocaleString('tr-TR')} ₺ gereklidir.`
        });
        return;
      }

      const normCountry = normalizeCountryName(targetCountry);
      const countryInfo =
        GLOBAL_MARKET_COUNTRIES.find((c) => c.name === normCountry) || GLOBAL_MARKET_COUNTRIES[0];
      const adPowerCalc = calculateAdCampaignPower(playerCompany, countryInfo.name, pkg);
      const now = Date.now();
      const oldFame = getPerfumeFame(perfume);
      const newFame = Math.min(100, Math.round((oldFame + adPowerCalc.effectiveFameBoost) * 10) / 10);

      setGameState((prev) => {
        let compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
        if (compIndex === -1) compIndex = 0;
        const comp = prev.companies[compIndex];

        const newCampaign = {
          id: `ad_${now}_${Math.random().toString(36).substring(2, 6)}`,
          companyId: comp.id,
          perfumeId: perfume.id,
          perfumeName: perfume.name,
          targetCountry: countryInfo.name,
          targetCountryFlag: countryInfo.flag,
          campaignTier: pkg.tier,
          campaignTitle: `${countryInfo.flag} ${countryInfo.name} - ${pkg.title}`,
          cost: pkg.cost,
          fameBoost: adPowerCalc.effectiveFameBoost,
          countryBonusRate: adPowerCalc.effectiveCountryBonusRate,
          adSpecialistName: adPowerCalc.adSpecialist.name,
          hasSynergy: adPowerCalc.hasSynergy,
          startedAt: now,
          expiresAt: now + pkg.durationMinutes * 60 * 1000
        };

        const currentCountryBonuses = {
          ...(comp.countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[comp.id] || {})
        };
        currentCountryBonuses[countryInfo.name] =
          Math.round(((currentCountryBonuses[countryInfo.name] || 0) + adPowerCalc.effectivePermanentGain) * 100) / 100;

        const newCash = Math.round((comp.cash - pkg.cost) * 100) / 100;
        const newExpenses = comp.totalExpenses + pkg.cost;
        const newNetProfit = comp.totalRevenue - newExpenses;
        const newMargin = comp.totalRevenue > 0 ? (newNetProfit / comp.totalRevenue) * 100 : 0;

        const synergyTag = adPowerCalc.hasSynergy ? ' [⚡ Reklam+Satış Ortak Ülke Sinerjisi!]' : '';

        const finRec: FinancialRecord = {
          id: `fin_ad_${now}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          type: 'expense',
          category: 'advertising',
          amount: pkg.cost,
          description: `REKLAM KAMPANYASI (${countryInfo.flag} ${countryInfo.name} • Reklamcı: ${adPowerCalc.adSpecialist.name}): "${perfume.name}" - ${pkg.title}${synergyTag} (⭐ Şöhret: ${oldFame} -> ${newFame})`,
          cashAfter: newCash
        };

        const updatedAdSpec = {
          ...adPowerCalc.adSpecialist,
          campaignsLaunched: (adPowerCalc.adSpecialist.campaignsLaunched || 0) + 1,
          totalFameGenerated:
            Math.round(((adPowerCalc.adSpecialist.totalFameGenerated || 0) + adPowerCalc.effectiveFameBoost) * 10) / 10
        };

        const updatedComp: Company = {
          ...comp,
          cash: newCash,
          totalExpenses: newExpenses,
          netProfit: newNetProfit,
          profitMargin: Math.round(newMargin * 10) / 10,
          adSpecialist: updatedAdSpec,
          countryBonuses: currentCountryBonuses,
          activeCampaigns: [newCampaign, ...(comp.activeCampaigns || []).filter((c) => c.expiresAt > now)],
          totalAdSpend: (comp.totalAdSpend || 0) + pkg.cost,
          financialHistory: [finRec, ...comp.financialHistory]
        };

        const updatedPerfumes = prev.perfumes.map((p) => {
          if (p.id === perfume.id) {
            return {
              ...p,
              fame: newFame,
              popularCountries: getPerfumePopularCountries(p)
            };
          }
          return p;
        });

        const updatedCompanies = [...prev.companies];
        updatedCompanies[compIndex] = updatedComp;

        let updatedOrders = prev.orders;
        if (pkg.spawnsVipOrder || adPowerCalc.hasSynergy) {
          const vipOrder = createCampaignDrivenOrder(updatedComp, perfume, countryInfo.name, pkg.tier);
          updatedOrders = [vipOrder, ...prev.orders];
        }

        const actEvent: SectorActivityEvent = {
          id: `act_ad_${now}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          companyId: comp.id,
          companyName: comp.name,
          companyLogo: comp.logo,
          type: 'ad_campaign',
          title: `📢 ${countryInfo.flag} ${countryInfo.name}'da Reklamcı ${adPowerCalc.adSpecialist.name} Kampanyası!${adPowerCalc.hasSynergy ? ' ⚡ Ortak Ülke Sinerjisi!' : ''}`,
          description: `${comp.name} Reklam Direktörü ${adPowerCalc.adSpecialist.name}, "${perfume.name}" için ${countryInfo.name} pazarında "${pkg.title}" başlattı!${synergyTag} Parfüm Şöhreti ⭐ ${newFame}/100'e yükseldi (+%${Math.round(adPowerCalc.effectiveCountryBonusRate * 100)} Ülke Bonusu).`,
          amount: pkg.cost,
          highlight: true
        };

        return {
          ...prev,
          companies: updatedCompanies,
          perfumes: updatedPerfumes,
          orders: updatedOrders,
          sectorActivities: [actEvent, ...(prev.sectorActivities || []).slice(0, 49)]
        };
      });

      addToast({
        type: 'success',
        title: `📢 ${countryInfo.flag} ${countryInfo.name} Reklamı Başladı!${adPowerCalc.hasSynergy ? ' ⚡ Sinerji Aktif!' : ''}`,
        message: `Reklamcı ${adPowerCalc.adSpecialist.name} ile "${perfume.name}" şöhreti ⭐ ${oldFame} -> ${newFame}/100 oldu! ${countryInfo.name} siparişlerinde +%${Math.round(adPowerCalc.effectiveCountryBonusRate * 100)} reklam primi aktif.${adPowerCalc.hasSynergy ? ' Reklamcı + Satış Temsilcisi aynı ülkede eşleştiği için ekstra Reklam & Satış Gücü ve VIP sipariş tetiklendi!' : ''}`
      });
    },
    [perfumesMap, playerCompany, addToast]
  );

  // Action: Train Sales Representative (İkna & Müzakere Akademisi)
  const trainSalesRep = useCallback(() => {
    const rep =
      playerCompany.salesRep ||
      COMPANY_DEFAULT_SALES_REPS[playerCompany.id] ||
      COMPANY_DEFAULT_SALES_REPS.aromalux;

    if (rep.persuasion >= 99) {
      addToast({
        type: 'info',
        title: 'Maksimum İkna Kabiliyeti',
        message: `${rep.name} halihazırda sektörün zirvesinde (99/100 İkna Kabiliyeti)!`
      });
      return;
    }

    const trainingCost = 75000;
    if (playerCompany.cash < trainingCost) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `Satış Temsilcisi İkna & Müzakere Eğitimi için ${trainingCost.toLocaleString('tr-TR')} ₺ gereklidir.`
      });
      return;
    }

    const gain = 6;
    const newPersuasion = Math.min(99, rep.persuasion + gain);
    const newLevel = Math.min(10, (rep.level || 1) + 1);
    const now = Date.now();

    setGameState((prev) => {
      let compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      if (compIndex === -1) compIndex = 0;
      const comp = prev.companies[compIndex];

      const newCash = Math.round((comp.cash - trainingCost) * 100) / 100;
      const newExpenses = comp.totalExpenses + trainingCost;
      const newNetProfit = comp.totalRevenue - newExpenses;
      const newMargin = comp.totalRevenue > 0 ? (newNetProfit / comp.totalRevenue) * 100 : 0;

      const finRec: FinancialRecord = {
        id: `fin_train_${now}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        type: 'expense',
        category: 'sales_training',
        amount: trainingCost,
        description: `Satış Temsilcisi İkna & Müzakere Eğitimi: ${rep.name} (İkna: ${rep.persuasion} -> ${newPersuasion}/100)`,
        cashAfter: newCash
      };

      const updatedCompanies = [...prev.companies];
      updatedCompanies[compIndex] = {
        ...comp,
        cash: newCash,
        totalExpenses: newExpenses,
        netProfit: newNetProfit,
        profitMargin: Math.round(newMargin * 10) / 10,
        salesRep: {
          ...rep,
          persuasion: newPersuasion,
          level: newLevel
        },
        financialHistory: [finRec, ...comp.financialHistory]
      };

      const actEvent: SectorActivityEvent = {
        id: `act_train_${now}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        companyId: comp.id,
        companyName: comp.name,
        companyLogo: comp.logo,
        type: 'sales_rep_training',
        title: `🗣️ ${rep.name} İkna Kabiliyeti Yükseldi!`,
        description: `${comp.name} Satış Direktörü ${rep.name}, İkna & Müzakere Akademisi'ni tamamladı. Yeni İkna Kabiliyeti: ${newPersuasion}/100!`,
        amount: trainingCost
      };

      return {
        ...prev,
        companies: updatedCompanies,
        sectorActivities: [actEvent, ...(prev.sectorActivities || []).slice(0, 49)]
      };
    });

    addToast({
      type: 'success',
      title: `🗣️ İkna Kabiliyeti Yükseldi: ${newPersuasion}/100`,
      message: `${rep.name} artık uluslararası siparişlerde ve toptan satışlarda daha yüksek birim fiyat primi kazanıyor!`
    });
  }, [playerCompany, addToast]);

  // Action: Hire / Transfer Elite Sales Representative
  const hireSalesRep = useCallback(
    (repId: string) => {
      const candidate = TRANSFERABLE_SALES_REPS.find((r) => r.id === repId);
      if (!candidate) return;

      if (playerCompany.cash < candidate.hiringCost) {
        addToast({
          type: 'error',
          title: 'Yetersiz Bakiye',
          message: `${candidate.name} transfer imza parası için ${candidate.hiringCost.toLocaleString('tr-TR')} ₺ gereklidir.`
        });
        return;
      }

      const now = Date.now();
      setGameState((prev) => {
        let compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
        if (compIndex === -1) compIndex = 0;
        const comp = prev.companies[compIndex];

        const newCash = Math.round((comp.cash - candidate.hiringCost) * 100) / 100;
        const newExpenses = comp.totalExpenses + candidate.hiringCost;
        const newNetProfit = comp.totalRevenue - newExpenses;
        const newMargin = comp.totalRevenue > 0 ? (newNetProfit / comp.totalRevenue) * 100 : 0;

        const finRec: FinancialRecord = {
          id: `fin_hire_rep_${now}`,
          timestamp: now,
          type: 'expense',
          category: 'sales_training',
          amount: candidate.hiringCost,
          description: `Küresel Satış Direktörü Transferi: ${candidate.name} (İkna: ${candidate.persuasion}/100 | Uzmanlık: ${candidate.specialtyCountries.join(', ')})`,
          cashAfter: newCash
        };

        const updatedCompanies = [...prev.companies];
        updatedCompanies[compIndex] = {
          ...comp,
          cash: newCash,
          totalExpenses: newExpenses,
          netProfit: newNetProfit,
          profitMargin: Math.round(newMargin * 10) / 10,
          salesRep: {
            id: candidate.id,
            name: candidate.name,
            title: candidate.title,
            avatar: candidate.avatar,
            persuasion: candidate.persuasion,
            level: candidate.level,
            specialtyCountries: candidate.specialtyCountries,
            closedDeals: comp.salesRep?.closedDeals || 0,
            bonusRevenueGenerated: comp.salesRep?.bonusRevenueGenerated || 0
          },
          financialHistory: [finRec, ...comp.financialHistory]
        };

        return {
          ...prev,
          companies: updatedCompanies
        };
      });

      addToast({
        type: 'success',
        title: `🕴️ ${candidate.name} Şirketinize Katıldı!`,
        message: `Yeni Baş Satış Direktörünüz (${candidate.persuasion}/100 İkna) göreve başladı. Uzmanlık ülkeleri: ${candidate.specialtyCountries.join(', ')}.`
      });
    },
    [playerCompany, addToast]
  );

  // Action: Train Ad Specialist (Reklamcı Kreatif & Medya Akademisi)
  const trainAdSpecialist = useCallback(() => {
    const adSpec =
      playerCompany.adSpecialist ||
      COMPANY_DEFAULT_AD_SPECIALISTS[playerCompany.id] ||
      COMPANY_DEFAULT_AD_SPECIALISTS.aromalux;

    if (adSpec.adPower >= 99) {
      addToast({
        type: 'info',
        title: 'Maksimum Reklam Gücü',
        message: `${adSpec.name} halihazırda sektörün zirvesinde (99/100 Reklam Gücü)!`
      });
      return;
    }

    const trainingCost = 70000;
    if (playerCompany.cash < trainingCost) {
      addToast({
        type: 'error',
        title: 'Yetersiz Bakiye',
        message: `Reklamcı Kreatif & Medya Eğitimi için ${trainingCost.toLocaleString('tr-TR')} ₺ gereklidir.`
      });
      return;
    }

    const gain = 6;
    const newAdPower = Math.min(99, adSpec.adPower + gain);
    const newLevel = Math.min(10, (adSpec.level || 1) + 1);
    const now = Date.now();

    setGameState((prev) => {
      let compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
      if (compIndex === -1) compIndex = 0;
      const comp = prev.companies[compIndex];

      const newCash = Math.round((comp.cash - trainingCost) * 100) / 100;
      const newExpenses = comp.totalExpenses + trainingCost;
      const newNetProfit = comp.totalRevenue - newExpenses;
      const newMargin = comp.totalRevenue > 0 ? (newNetProfit / comp.totalRevenue) * 100 : 0;

      const finRec: FinancialRecord = {
        id: `fin_train_ad_${now}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        type: 'expense',
        category: 'advertising',
        amount: trainingCost,
        description: `Reklamcı Kreatif & Küresel Medya Eğitimi: ${adSpec.name} (Reklam Gücü: ${adSpec.adPower} -> ${newAdPower}/100)`,
        cashAfter: newCash
      };

      const updatedCompanies = [...prev.companies];
      updatedCompanies[compIndex] = {
        ...comp,
        cash: newCash,
        totalExpenses: newExpenses,
        netProfit: newNetProfit,
        profitMargin: Math.round(newMargin * 10) / 10,
        adSpecialist: {
          ...adSpec,
          adPower: newAdPower,
          level: newLevel
        },
        financialHistory: [finRec, ...comp.financialHistory]
      };

      return {
        ...prev,
        companies: updatedCompanies
      };
    });

    addToast({
      type: 'success',
      title: `📢 Reklam Gücü Yükseldi: ${newAdPower}/100`,
      message: `${adSpec.name} artık kampanyalarda daha fazla şöhret ve ortak ülkelerde daha yüksek Reklam+Satış Gücü sinerjisi üretiyor!`
    });
  }, [playerCompany, addToast]);

  // Action: Hire / Transfer Elite Ad Specialist (Elit Reklam Direktörü Transferi)
  const hireAdSpecialist = useCallback(
    (adSpecialistId: string) => {
      const candidate = TRANSFERABLE_AD_SPECIALISTS.find((a) => a.id === adSpecialistId);
      if (!candidate) return;

      if (playerCompany.cash < candidate.hiringCost) {
        addToast({
          type: 'error',
          title: 'Yetersiz Bakiye',
          message: `${candidate.name} transfer imza parası için ${candidate.hiringCost.toLocaleString('tr-TR')} ₺ gereklidir.`
        });
        return;
      }

      const now = Date.now();
      setGameState((prev) => {
        let compIndex = prev.companies.findIndex((c) => c.id === playerCompany.id);
        if (compIndex === -1) compIndex = 0;
        const comp = prev.companies[compIndex];

        const newCash = Math.round((comp.cash - candidate.hiringCost) * 100) / 100;
        const newExpenses = comp.totalExpenses + candidate.hiringCost;
        const newNetProfit = comp.totalRevenue - newExpenses;
        const newMargin = comp.totalRevenue > 0 ? (newNetProfit / comp.totalRevenue) * 100 : 0;

        const finRec: FinancialRecord = {
          id: `fin_hire_ad_${now}`,
          timestamp: now,
          type: 'expense',
          category: 'advertising',
          amount: candidate.hiringCost,
          description: `Küresel Reklam Direktörü Transferi: ${candidate.name} (Reklam Gücü: ${candidate.adPower}/100 | Uzmanlık: ${candidate.specialtyCountries.join(', ')})`,
          cashAfter: newCash
        };

        const updatedCompanies = [...prev.companies];
        updatedCompanies[compIndex] = {
          ...comp,
          cash: newCash,
          totalExpenses: newExpenses,
          netProfit: newNetProfit,
          profitMargin: Math.round(newMargin * 10) / 10,
          adSpecialist: {
            id: candidate.id,
            name: candidate.name,
            title: candidate.title,
            avatar: candidate.avatar,
            adPower: candidate.adPower,
            level: candidate.level,
            specialtyCountries: candidate.specialtyCountries,
            campaignsLaunched: comp.adSpecialist?.campaignsLaunched || 0,
            totalFameGenerated: comp.adSpecialist?.totalFameGenerated || 0
          },
          financialHistory: [finRec, ...comp.financialHistory]
        };

        return {
          ...prev,
          companies: updatedCompanies
        };
      });

      addToast({
        type: 'success',
        title: `📢 ${candidate.name} Şirketinize Katıldı!`,
        message: `Yeni Baş Reklam Direktörünüz (${candidate.adPower}/100 Reklam Gücü) göreve başladı. Uzman ülkeleri: ${candidate.specialtyCountries.join(', ')}. Satış temsilcinizle aynı olan ülkelerde Reklam + Satış Gücü Sinerjisi aktif!`
      });
    },
    [playerCompany, addToast]
  );

  // Action: Execute Strategic Market Tactic (Balanced & Cooldown-Limited to 15 mins)
  const executeCompetitiveTactic = useCallback(
    (
      tacticId: 'counter_ad' | 'country_embargo' | 'price_dumping' | 'supply_squeeze',
      targetCountry: string,
      targetRivalId: string
    ) => {
      const tactic = COMPETITIVE_TACTICS.find((t) => t.id === tacticId);
      if (!tactic) return;

      const now = Date.now();
      const lastUsed = playerCompany.lastCompetitiveTacticAt || 0;
      const elapsed = now - lastUsed;
      if (lastUsed > 0 && elapsed < COMPETITIVE_TACTIC_COOLDOWN_MS) {
        const remainingSec = Math.ceil((COMPETITIVE_TACTIC_COOLDOWN_MS - elapsed) / 1000);
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        addToast({
          type: 'info',
          title: '⏳ Stratejik Hamle Bekleme Süresi (30 Dk)',
          message: `Piyasa dengesini korumak için 30 dakikada bir stratejik hamle yapılabilir. Kalan süre: ${mins} dk ${secs} sn.`
        });
        return;
      }

      const normCountry = normalizeCountryName(targetCountry);
      const countryInfo =
        GLOBAL_MARKET_COUNTRIES.find((c) => c.name === normCountry) || GLOBAL_MARKET_COUNTRIES[0];

      if (playerCompany.cash < tactic.cost) {
        addToast({
          type: 'error',
          title: 'Yetersiz Bakiye',
          message: `"${tactic.title}" stratejisi için ${tactic.cost.toLocaleString('tr-TR')} ₺ bütçe gereklidir.`
        });
        return;
      }

      const rivalComp = gameState.companies.find((c) => c.id === targetRivalId);
      if (!rivalComp || rivalComp.id === playerCompany.id) return;

      const expiresAt = now + tactic.durationMs;

      setGameState((prev) => {
        const pIdx = prev.companies.findIndex((c) => c.id === playerCompany.id);
        const rIdx = prev.companies.findIndex((c) => c.id === targetRivalId);
        if (pIdx === -1 || rIdx === -1) return prev;

        const pComp = prev.companies[pIdx];
        const rComp = prev.companies[rIdx];

        const newCash = Math.round((pComp.cash - tactic.cost) * 100) / 100;
        const newExpenses = pComp.totalExpenses + tactic.cost;
        const newNetProfit = pComp.totalRevenue - newExpenses;
        const newMargin = pComp.totalRevenue > 0 ? (newNetProfit / pComp.totalRevenue) * 100 : 0;

        // Mildly update player country bonuses (+1% to +2%) & VIP showcase deal
        const pBonuses = {
          ...(pComp.countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[pComp.id] || {})
        };
        const currentPBonus = pBonuses[countryInfo.name] || 0;
        pBonuses[countryInfo.name] = Math.min(
          0.50,
          Math.round((currentPBonus + tactic.playerBonusGain) * 100) / 100
        );

        const pExclusives = { ...(pComp.exclusiveCountryDeals || {}) };
        if (tacticId === 'country_embargo') {
          pExclusives[countryInfo.name] = expiresAt;
        }

        // Apply temporary mild pressure on the selected rival only
        const rPenalties = { ...(rComp.countryPenalties || {}) };
        rPenalties[countryInfo.name] = expiresAt;

        const rBonuses = {
          ...(rComp.countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[rComp.id] || {})
        };
        if (tacticId === 'price_dumping') {
          rBonuses[countryInfo.name] = Math.max(
            0.02,
            Math.round(((rBonuses[countryInfo.name] || 0) - 0.01) * 100) / 100
          );
        }

        const finRec: FinancialRecord = {
          id: `fin_tactic_${now}`,
          timestamp: now,
          type: 'expense',
          category: 'advertising',
          amount: tactic.cost,
          description: `STRATEJİK PAZAR HAMLESİ (${countryInfo.flag} ${countryInfo.name} -> ${rComp.name}): ${tactic.title} (${tactic.effectSummary})`,
          cashAfter: newCash
        };

        const updatedCompanies = [...prev.companies];
        updatedCompanies[pIdx] = {
          ...pComp,
          cash: newCash,
          totalExpenses: newExpenses,
          netProfit: newNetProfit,
          profitMargin: Math.round(newMargin * 10) / 10,
          countryBonuses: pBonuses,
          exclusiveCountryDeals: pExclusives,
          lastCompetitiveTacticAt: now,
          financialHistory: [finRec, ...pComp.financialHistory]
        };

        updatedCompanies[rIdx] = {
          ...rComp,
          countryBonuses: rBonuses,
          countryPenalties: rPenalties
        };

        // Gently adjust rival's top perfume fame (-1 to -1.5) & boost player's top perfume fame (+1.5)
        const rivalPerfumeIds = Object.keys(rComp.productStorage);
        const updatedPerfumes = prev.perfumes.map((perf) => {
          const belongsToRival =
            perf.companyId === rComp.id ||
            perf.producerCompanyId === rComp.id ||
            rivalPerfumeIds.includes(perf.id);
          if (belongsToRival) {
            const oldFame = getPerfumeFame(perf);
            return {
              ...perf,
              fame: Math.max(10, Math.round((oldFame - tactic.rivalFameDrop) * 10) / 10)
            };
          }
          if (perf.companyId === pComp.id || perf.producerCompanyId === pComp.id) {
            const oldFame = getPerfumeFame(perf);
            return {
              ...perf,
              fame: Math.min(100, Math.round((oldFame + 1.5) * 10) / 10)
            };
          }
          return perf;
        });

        // If supply_squeeze, mildly increase favorite notes' prices by +10%
        const updatedRawMaterials =
          tacticId === 'supply_squeeze'
            ? prev.rawMaterials.map((rm) => {
                if (countryInfo.favoriteNotes.includes(rm.id)) {
                  const bumped = Math.round(rm.currentPrice * 1.10);
                  return {
                    ...rm,
                    currentPrice: bumped,
                    priceChangePercent: 10,
                    stock: Math.max(20, Math.floor(rm.stock * 0.85))
                  };
                }
                return rm;
              })
            : prev.rawMaterials;

        const actEvent: SectorActivityEvent = {
          id: `act_tactic_${now}`,
          timestamp: now,
          companyId: pComp.id,
          companyName: pComp.name,
          companyLogo: pComp.logo,
          type: 'ad_campaign',
          title: `${tactic.title} (${countryInfo.flag} ${countryInfo.name})`,
          description: `${pComp.name}, ${countryInfo.name} pazarında ${rComp.name} karşısında "${tactic.title}" stratejisi uyguladı. (${tactic.effectSummary})`,
          amount: tactic.cost,
          highlight: true
        };

        return {
          ...prev,
          companies: updatedCompanies,
          perfumes: updatedPerfumes,
          rawMaterials: updatedRawMaterials,
          sectorActivities: [actEvent, ...(prev.sectorActivities || []).slice(0, 49)]
        };
      });

      addToast({
        type: 'success',
        title: `${tactic.title} Başlatıldı (5 Dk Etki • 30 Dk Bekleme)`,
        message: `${countryInfo.flag} ${countryInfo.name} pazarında 5 dakikalık stratejik avantaj başladı: ${tactic.effectSummary}`
      });
    },
    [playerCompany, gameState.companies, addToast]
  );

  // Action: Reroll Random 3 Family Bonuses for all Perfumers
  const rerollPerfumerFamilies = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      perfumers: prev.perfumers.map((p) => randomizePerfumer3Families(p))
    }));
    addToast({
      type: 'success',
      title: '🎲 Parfümatörlere Yeni Random 3 Aile Bonusu Dağıtıldı!',
      message: 'Tüm parfümatörlerin 3 Koku Ailesi Bonusu (+%8 / +%16 / +%24) 10 ana aile arasından rastgele yenilendi.'
    });
  }, [addToast]);

  // Action: Reroll Random 3 Family Bonuses for all 20 Countries
  const rerollCountryFamilies = useCallback(() => {
    rerollAllCountries3Families();
    setGameState((prev) => ({
      ...prev,
      lastSavedAt: Date.now()
    }));
    addToast({
      type: 'success',
      title: '🎲 Ülkelere Yeni Random 3 Aile Bonusu Dağıtıldı!',
      message: '20 ülkenin tamamına 10 Koku Ailesi arasından rastgele 3 Aile Bonusu (+%10 / +%20 / +%30) atandı.'
    });
  }, [addToast]);

  // Action: Reroll Random 3 Country Bonuses & Power for all 20 Ad Specialists and 20 Sales Reps
  const rerollStaffBonuses = useCallback(() => {
    const { salesRepsByCompany, adSpecialistsByCompany } = rerollAllStaffBonuses();
    setGameState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => ({
        ...c,
        salesRep: salesRepsByCompany[c.id]
          ? {
              ...salesRepsByCompany[c.id],
              closedDeals: c.salesRep?.closedDeals || salesRepsByCompany[c.id].closedDeals,
              bonusRevenueGenerated: c.salesRep?.bonusRevenueGenerated || 0
            }
          : c.salesRep,
        adSpecialist: adSpecialistsByCompany[c.id]
          ? {
              ...adSpecialistsByCompany[c.id],
              campaignsLaunched:
                c.adSpecialist?.campaignsLaunched || adSpecialistsByCompany[c.id].campaignsLaunched,
              totalFameGenerated:
                c.adSpecialist?.totalFameGenerated || adSpecialistsByCompany[c.id].totalFameGenerated
            }
          : c.adSpecialist
      })),
      lastSavedAt: Date.now()
    }));
  }, []);

  // Action: Reset Game
  const resetGame = useCallback(() => {
    setIsGamePaused(false);
    pausedAtRef.current = null;
    setIsSpectatorMode(true);
    setViewedCompanyId('aromalux');
    try {
      localStorage.removeItem('parfum_borsasi_spectator_mode');
    } catch {}
    const initial = resetGameState();
    setGameState(initial);
    addToast({
      type: 'info',
      title: '🔄 Oyun Sıfırlandı (Seyirci Modu Aktif)',
      message: 'Tüm borsa stokları ve mamul depoları temizlendi. Tüm şirket kasaları 20.000.000 ₺ olarak eşitlendi ve 4 şirket de bot olarak yarışa başladı.'
    });
  }, [addToast]);

  return (
    <GameContext.Provider
      value={{
        rawMaterials: gameState.rawMaterials,
        perfumes: gameState.perfumes,
        companies: gameState.companies,
        perfumers: gameState.perfumers,
        orders: gameState.orders,
        rndArchive: gameState.rndArchive,
        secretRecipes: gameState.secretRecipes,
        activeTab,
        setActiveTab,
        playerCompany,
        playerPerfumer,
        rawMaterialsMap,
        perfumesMap,
        perfumersMap,
        toasts,
        removeToast,
        addToast,
        buyRawMaterial,
        instantCompleteShipment,
        startProductionJob,
        instantCompleteProduction,
        sellToOrder,
        sellProductWholesale,
        conductRnd,
        saveRndFormula,
        registerRndPerfume,
        assignPerfumerToPlayerCompany,
        buySecretRecipe,
        guessSecretRecipe,
        unlockSecretRecipeDirectly,
        rewardLegendaryPerfume,
        addCompanyCash,
        deductCompanyCash,
        seekFreshOrders,
        cancelOrder,
        launchAdCampaign,
        trainSalesRep,
        hireSalesRep,
        trainAdSpecialist,
        hireAdSpecialist,
        executeCompetitiveTactic,
        sectorActivities: gameState.sectorActivities || [],
        isBotAiEnabled,
        botSpeed,
        isSpectatorMode,
        managedCompanyId,
        toggleSpectatorMode,
        setManagedCompany,
        toggleBotAi,
        triggerBotTurn,
        setBotSpeed,
        isGamePaused,
        togglePauseGame,
        pauseGame,
        resumeGame,
        resetGame,
        rerollPerfumerFamilies,
        rerollCountryFamilies,
        rerollStaffBonuses
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
