import React from 'react';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types';
import {
  Home,
  Building2,
  TrendingUp,
  FlaskRound,
  Factory,
  Package,
  ClipboardList,
  Wallet,
  Dna
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  badge?: number | string | null;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    playerCompany,
    rawMaterials,
    orders
  } = useGame();

  const totalEssenceStock = Object.values(playerCompany.essenceStorage).reduce(
    (acc, curr) => acc + (curr.quantity || 0),
    0
  );

  const totalProductStock = Object.values(playerCompany.productStorage).reduce(
    (acc, curr) => acc + (curr.quantity || 0),
    0
  );

  const activeOrdersCount = orders.filter((o) => o.status === 'active').length;
  const activeShipmentsCount = playerCompany.activeShipments.length;
  const isProducing = Boolean(playerCompany.activeProduction);

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Genel Bakış',
      icon: <Home className="w-4 h-4" />
    },
    {
      id: 'companies',
      label: 'Şirketler',
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: 'market',
      label: 'Hammadde Borsası',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: rawMaterials.length,
      badgeColor: 'bg-blue-500/20 text-blue-300'
    },
    {
      id: 'essence_storage',
      label: 'Esans Deposu',
      icon: <FlaskRound className="w-4 h-4" />,
      badge: activeShipmentsCount > 0 ? `${activeShipmentsCount} Nakliye` : (totalEssenceStock > 0 ? `${totalEssenceStock}` : null),
      badgeColor: activeShipmentsCount > 0 ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-slate-700 text-slate-300'
    },
    {
      id: 'production',
      label: 'Üretim',
      icon: <Factory className="w-4 h-4" />,
      badge: isProducing ? 'Aktif' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'product_storage',
      label: 'Ürün Deposu',
      icon: <Package className="w-4 h-4" />,
      badge: totalProductStock > 0 ? `${totalProductStock} Şişe` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300'
    },
    {
      id: 'orders',
      label: 'Siparişler',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: activeOrdersCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'finance',
      label: 'Finans',
      icon: <Wallet className="w-4 h-4" />
    },
    {
      id: 'rnd',
      label: 'AR-GE (ParfümATÖR)',
      icon: <Dna className="w-4 h-4" />,
      badge: 'YENİ',
      badgeColor: 'bg-purple-500/20 text-purple-300 font-bold'
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 p-3 lg:p-4 lg:min-h-[calc(100vh-65px)]">
      <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-1 lg:pb-0 scrollbar-none">
        <div className="hidden lg:block text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Yönetim Paneli
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap lg:whitespace-normal ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/10 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="font-semibold">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
