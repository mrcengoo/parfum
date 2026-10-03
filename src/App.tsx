import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { OverviewPage } from './components/pages/OverviewPage';
import { MarketplacePage } from './components/pages/MarketplacePage';
import { EssenceStoragePage } from './components/pages/EssenceStoragePage';
import { ProductionPage } from './components/pages/ProductionPage';
import { ProductStoragePage } from './components/pages/ProductStoragePage';
import { OrdersPage } from './components/pages/OrdersPage';
import { FinancePage } from './components/pages/FinancePage';
import { CompaniesPage } from './components/pages/CompaniesPage';
import { PerfumersPage } from './components/pages/PerfumersPage';
import { RndPage } from './components/pages/RndPage';
import { AwardedPerfumesPage } from './components/pages/AwardedPerfumesPage';
import { FindFormulaPage } from './components/pages/FindFormulaPage';
import { ProductCataloguePage } from './components/pages/ProductCataloguePage';
import { MarketAnalyticsPage } from './components/pages/MarketAnalyticsPage';
import { CountriesPage } from './components/pages/CountriesPage';

const GameContent: React.FC = () => {
  const { activeTab, isGamePaused, resumeGame } = useGame();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'countries':
        return <CountriesPage />;
      case 'market_analytics':
        return <MarketAnalyticsPage />;
      case 'perfumers':
        return <PerfumersPage />;
      case 'market':
        return <MarketplacePage />;
      case 'essence_storage':
        return <EssenceStoragePage />;
      case 'production':
        return <ProductionPage />;
      case 'product_storage':
        return <ProductStoragePage />;
      case 'catalogue':
        return <ProductCataloguePage />;
      case 'orders':
        return <OrdersPage />;
      case 'finance':
        return <FinancePage />;
      case 'rnd':
        return <RndPage />;
      case 'awarded_perfumes':
        return <AwardedPerfumesPage />;
      case 'find_formula':
        return <FindFormulaPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

      {/* Simulation Paused Notification Banner */}
      {isGamePaused && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 lg:px-8 py-2.5 backdrop-blur-md sticky top-[61px] z-20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="font-bold text-amber-300 uppercase tracking-wide">⏸️ Simülasyon Durduruldu:</span>
            <span className="text-slate-300">
              Piyasa fiyatları, nakliye süreleri, üretim atölyesi ve rakip botlar beklemeye alındı.
            </span>
          </div>
          <button
            onClick={resumeGame}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
          >
            ▶️ Simülasyona Devam Et
          </button>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
