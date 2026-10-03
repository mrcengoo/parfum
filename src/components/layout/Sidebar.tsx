import React from 'react';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types';
import {
  Home,
  Building2,
  BarChart3,
  Globe2,
  Award,
  TrendingUp,
  FlaskRound,
  Factory,
  Package,
  ClipboardList,
  Wallet,
  Dna,
  Trophy,
  Compass,
  BookOpen,
  Play,
  Pause
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
    orders,
    perfumes,
    isGamePaused,
    togglePauseGame
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
      id: 'countries',
      label: 'Ülkeler & Bonuslar',
      icon: <Globe2 className="w-4 h-4 text-amber-400" />,
      badge: 'Özellik & Sinerji',
      badgeColor: 'bg-amber-500/20 text-amber-300 font-bold'
    },
    {
      id: 'market_analytics',
      label: 'Pazar Payı & İstatistik',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
      badge: '20 Ülke',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold'
    },
    {
      id: 'perfumers',
      label: 'Çalışanlar',
      icon: <Award className="w-4 h-4 text-purple-400" />,
      badge: 'Usta, Reklamcı & Temsilci',
      badgeColor: 'bg-purple-500/20 text-purple-300 font-bold'
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
      id: 'catalogue',
      label: 'Ürün Kataloğu',
      icon: <BookOpen className="w-4 h-4" />,
      badge: `${perfumes.length} Çeşit`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold'
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
      badge: 'İCAT',
      badgeColor: 'bg-purple-500/20 text-purple-300 font-bold'
    },
    {
      id: 'awarded_perfumes',
      label: 'Ödüllü Parfümler',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      badge: '🏆 ÖDÜLLÜ',
      badgeColor: 'bg-amber-500/20 text-amber-300 font-bold'
    },
    {
      id: 'find_formula',
      label: 'Formülü Bul',
      icon: <Compass className="w-4 h-4 text-purple-400" />,
      badge: 'DEŞİFRE',
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

      {/* Simulation Status Card on Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-2 mt-auto pt-6 border-t border-slate-800/80">
        <div className={`p-3 rounded-2xl border text-xs transition-all ${
          isGamePaused
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-slate-950/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simülasyon</span>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
              isGamePaused ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isGamePaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              {isGamePaused ? 'Durduruldu' : 'Çalışıyor'}
            </span>
          </div>
          <button
            type="button"
            onClick={togglePauseGame}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              isGamePaused
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/30'
            }`}
          >
            {isGamePaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isGamePaused ? 'Devam Et ▶️' : 'Oyunu Durdur ⏸️'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
