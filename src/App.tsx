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
import { RndPage } from './components/pages/RndPage';

const GameContent: React.FC = () => {
  const { activeTab } = useGame();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'market':
        return <MarketplacePage />;
      case 'essence_storage':
        return <EssenceStoragePage />;
      case 'production':
        return <ProductionPage />;
      case 'product_storage':
        return <ProductStoragePage />;
      case 'orders':
        return <OrdersPage />;
      case 'finance':
        return <FinancePage />;
      case 'rnd':
        return <RndPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

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
