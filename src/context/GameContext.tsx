import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
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
  GenderType
} from '../types';
import { loadGameState, saveGameState, resetGameState } from '../services/storageService';
import { createShipment, tickMarketPrices, generateRandomOrder } from '../services/economyEngine';
import { checkRecipeRequirements, startProduction } from '../services/productionEngine';
import { fulfillMarketOrder } from '../services/orderEngine';
import { generateRndPerfume, convertRndToPerfume } from '../services/rndEngine';
import { getPerfumerById } from '../data/perfumers';

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
  sellToOrder: (orderId: string, quantity: number) => void;
  conductRnd: (topNotes: string[], middleNotes: string[], baseNotes: string[], gender: GenderType) => RndResult;
  registerRndPerfume: (rndResultId: string) => void;
  assignPerfumerToPlayerCompany: (perfumerId: string) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState(loadGameState);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const playerCompany = useMemo(() => {
    return (
      gameState.companies.find((c) => c.isPlayer) ||
      gameState.companies[0]
    );
  }, [gameState.companies]);

  const playerPerfumer = useMemo(() => {
    return perfumersMap.get(playerCompany.perfumerId) || gameState.perfumers[0];
  }, [perfumersMap, playerCompany.perfumerId, gameState.perfumers]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now()
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  }, []);

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

  // Master Clock (Every 1 second)
  useEffect(() => {
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
  }, [playerCompany.activeShipments, playerCompany.activeProduction, completeShipment, completeProduction]);

  // Market Ticker (Every 12 seconds)
  useEffect(() => {
    const marketInterval = setInterval(() => {
      setGameState((prev) => {
        const newMaterials = tickMarketPrices(prev.rawMaterials);
        let newOrders = prev.orders;
        if (Math.random() < 0.25 && prev.orders.filter((o) => o.status === 'active').length < 8) {
          const freshOrder = generateRandomOrder(prev.perfumes);
          newOrders = [freshOrder, ...prev.orders];
        }

        return {
          ...prev,
          rawMaterials: newMaterials,
          orders: newOrders
        };
      });
    }, 12000);

    return () => clearInterval(marketInterval);
  }, []);

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
  const sellToOrder = useCallback((orderId: string, quantity: number) => {
    const order = gameState.orders.find((o) => o.id === orderId);
    if (!order) {
      addToast({ type: 'error', title: 'Hata', message: 'Sipariş bulunamadı.' });
      return;
    }

    const perfume = perfumesMap.get(order.productId);

    try {
      const result = fulfillMarketOrder(
        order,
        quantity,
        playerCompany,
        perfume,
        playerPerfumer
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

        // Deduct from product storage
        const currentProd = comp.productStorage[order.productId];
        const newProdQty = Math.max(0, (currentProd?.quantity || 0) - result.fulfilledQuantity);
        const newBasis = Math.max(0, (currentProd?.totalCostBasis || 0) - (result.fulfilledQuantity * (currentProd?.unitCost || 0)));

        const updatedProductStorage = {
          ...comp.productStorage,
          [order.productId]: {
            ...currentProd,
            quantity: newProdQty,
            totalCostBasis: newBasis,
            totalSold: (currentProd?.totalSold || 0) + result.fulfilledQuantity,
            lastSalePrice: order.pricePerUnit
          }
        };

        const updatedRevenue = comp.totalRevenue + result.grossRevenue;
        const updatedExpenses = comp.totalExpenses + result.royaltyAmount;
        const updatedNetProfit = updatedRevenue - updatedExpenses;
        const updatedMargin = updatedRevenue > 0 ? (updatedNetProfit / updatedRevenue) * 100 : 0;

        const newRecords = result.royaltyRecord
          ? [result.royaltyRecord, result.saleRecord, ...comp.financialHistory]
          : [result.saleRecord, ...comp.financialHistory];

        const updatedComp: Company = {
          ...comp,
          cash: newCash,
          totalRevenue: updatedRevenue,
          totalExpenses: updatedExpenses,
          netProfit: updatedNetProfit,
          profitMargin: Math.round(updatedMargin * 10) / 10,
          productStorage: updatedProductStorage,
          financialHistory: newRecords
        };

        const updatedOrders = prev.orders.map((o) => {
          if (o.id === orderId) {
            return result.updatedOrder;
          }
          return o;
        });

        const updatedCompanies = [...prev.companies];
        updatedCompanies[compIndex] = updatedComp;

        return {
          ...prev,
          orders: updatedOrders,
          companies: updatedCompanies
        };
      });

      const royaltyInfo = result.royaltyAmount > 0
        ? ` (Telif: -${result.royaltyAmount.toLocaleString('tr-TR')} ₺ -> ${result.perfumerName})`
        : '';

      addToast({
        type: 'success',
        title: '💰 Sipariş Teslimatı Başarılı!',
        message: `${result.fulfilledQuantity} adet satıldı. Brüt: ${result.grossRevenue.toLocaleString('tr-TR')} ₺${royaltyInfo} | Net Kasaya Giren: +${result.netRevenue.toLocaleString('tr-TR')} ₺`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Satış Başarısız',
        message: err.message || 'Sipariş karşılanamadı.'
      });
    }
  }, [gameState.orders, perfumesMap, playerCompany, playerPerfumer, addToast]);

  // Action: Conduct R&D (charges perfumer design fee)
  const conductRnd = useCallback((
    topNotes: string[],
    middleNotes: string[],
    baseNotes: string[],
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

    const result = generateRndPerfume(
      topNotes,
      middleNotes,
      baseNotes,
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

    const isSignature = result.resultLevel === 'İMZA';

    addToast({
      type: isSignature ? 'success' : (result.resultLevel === 'KÖTÜ' ? 'warning' : 'info'),
      title: isSignature ? '🏆 İMZA PARFÜM İCAT EDİLDİ!' : `🧬 ParfümATÖR: ${result.resultLevel} Seviye Sonuç!`,
      message: `"${result.name}" (${playerCompany.name} × ${playerPerfumer.name}) sentezlendi! Kalite: %${result.qualityScore}, Uyum: %${result.harmonyScore}. Tasarım Ücreti: -${playerPerfumer.designFee.toLocaleString('tr-TR')} ₺.`
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

    setGameState((prev) => ({
      ...prev,
      perfumes: [newPerfume, ...prev.perfumes],
      rndArchive: prev.rndArchive.map((item) =>
        item.id === rndResultId ? { ...item, isAddedToProduction: true } : item
      )
    }));

    addToast({
      type: 'success',
      title: '📋 Üretim Portföyüne Eklendi',
      message: `"${newPerfume.name}" (${newPerfume.companyName} × ${newPerfume.perfumerName}) artık Üretim sayfasında üretilebilir!`
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

  // Action: Reset Game
  const resetGame = useCallback(() => {
    const initial = resetGameState();
    setGameState(initial);
    addToast({
      type: 'info',
      title: '🔄 Oyun Sıfırlandı',
      message: 'Tüm borsa stokları, nakit ve depolar başlangıç durumuna getirildi.'
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
        conductRnd,
        registerRndPerfume,
        assignPerfumerToPlayerCompany,
        resetGame
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
