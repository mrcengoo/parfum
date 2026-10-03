import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfume, GenderType, SecretRecipe, Company, RawMaterial } from '../../types';
import {
  getTierTargetProfit,
  analyzeRealizedProfit,
  calculateLivePerfumeUnitCost,
  calculateLiveCostBreakdown,
  TIER_BADGE_COLORS
} from '../../services/profitEngine';
import {
  getCountryFlag,
  getPerfumeFame,
  getPerfumePopularCountries
} from '../../services/marketingEngine';
import { NoteImage } from '../common/NoteImage';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Layers,
  TrendingUp,
  Coins,
  Package,
  Factory,
  ShieldCheck,
  Building2,
  Calendar,
  Award,
  ArrowRight,
  X,
  FileLock2,
  Flame,
  Zap,
  BarChart3,
  Percent,
  CheckCircle2,
  Clock,
  Eye,
  Info
} from 'lucide-react';

export type CatalogueCategory = 'all' | 'secret' | 'rnd' | 'player_owned';

export const ProductCataloguePage: React.FC = () => {
  const {
    perfumes,
    companies,
    playerCompany,
        rawMaterialsMap,
    setActiveTab
  } = useGame();

  const [activeCategory, setActiveCategory] = useState<CatalogueCategory>('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | GenderType>('all');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'quality_desc' | 'sales_desc' | 'newest'>('quality_desc');
  const [inspectPerfume, setInspectPerfume] = useState<Perfume | null>(null);

  // Helper map for company names and logos
  const companiesMap = useMemo(() => {
    return new Map(companies.map((c) => [c.id, c]));
  }, [companies]);

  const allCataloguePerfumes = perfumes;

  // Statistics across the sector for each perfume
  const perfumeStats = useMemo(() => {
    const stats = new Map<string, { totalProduced: number; totalSold: number; totalStock: number; companyHoldings: Record<string, number>; avgUnitCost: number }>();

    allCataloguePerfumes.forEach((perfume) => {
      let totalStock = 0;
      let totalSold = 0;
      let totalCostBasis = 0;
      const holdings: Record<string, number> = {};

      companies.forEach((company) => {
        const item = company.productStorage?.[perfume.id];
        if (item) {
          const qty = item.quantity || 0;
          const sold = item.totalSold || 0;
          totalStock += qty;
          totalSold += sold;
          totalCostBasis += (item.totalCostBasis || 0);
          holdings[company.id] = qty;
        } else {
          holdings[company.id] = 0;
        }
      });

      const totalProduced = totalStock + totalSold;

      // Calculate true theoretical manufacturing cost from recipe
      let recipeMatCost = 0;
      (perfume.recipe || []).forEach((r) => {
        const mat = rawMaterialsMap.get(r.rawMaterialId);
        const noteUnits = Math.max(1, Math.round(r.amount / 10));
        recipeMatCost += noteUnits * (mat?.price || 130);
      });
      const trueManufacturingCost = Math.round((recipeMatCost + 4500 + Math.round(recipeMatCost * 0.05)) / 100);

      const calculatedUnitCost = totalStock > 0 && totalCostBasis > 0 && (totalCostBasis / totalStock) <= perfume.suggestedRetailPrice * 0.65
        ? Math.round(totalCostBasis / totalStock)
        : trueManufacturingCost;

      stats.set(perfume.id, {
        totalProduced,
        totalSold,
        totalStock,
        companyHoldings: holdings,
        avgUnitCost: calculatedUnitCost
      });
    });

    return stats;
  }, [allCataloguePerfumes, companies]);

  // Filtered perfumes based on category, search, gender and sort
  const filteredPerfumes = useMemo(() => {
    return allCataloguePerfumes.filter((p) => {
      // Category filter
      if (activeCategory === 'secret' && p.sourceType !== 'SECRET') return false;
      if (activeCategory === 'rnd' && p.sourceType !== 'AR-GE') return false;
      if (activeCategory === 'player_owned' && p.producerCompanyId !== playerCompany.id && p.companyId !== playerCompany.id) return false;

      // Company filter
      if (selectedCompanyFilter !== 'all') {
        const isMatch = (p.producerCompanyId === selectedCompanyFilter) || (p.companyId === selectedCompanyFilter);
        if (!isMatch) return false;
      }

      // Gender filter
      if (selectedGender !== 'all' && p.gender !== selectedGender) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchBrand = p.brand.toLowerCase().includes(query);
        const matchComp = (p.companyName || '').toLowerCase().includes(query);
        const matchNotes = (p.notes || []).some((n) => n.toLowerCase().includes(query));
        if (!matchName && !matchBrand && !matchComp && !matchNotes) return false;
      }

      return true;
    }).sort((a, b) => {
      const statsA = perfumeStats.get(a.id) || { totalSold: 0, totalProduced: 0 };
      const statsB = perfumeStats.get(b.id) || { totalSold: 0, totalProduced: 0 };

      if (sortBy === 'price_desc') return b.suggestedRetailPrice - a.suggestedRetailPrice;
      if (sortBy === 'price_asc') return a.suggestedRetailPrice - b.suggestedRetailPrice;
      if (sortBy === 'quality_desc') return (b.quality || 0) - (a.quality || 0);
      if (sortBy === 'sales_desc') return statsB.totalSold - statsA.totalSold;
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      return 0;
    });
  }, [allCataloguePerfumes, activeCategory, selectedCompanyFilter, selectedGender, searchQuery, sortBy, playerCompany.id, perfumeStats]);

  // Categorized groups for the "all" view
  const fragranticaPerfumes = useMemo(() => {
    return filteredPerfumes.filter((p) => p.sourceType === 'ORİJİNAL');
  }, [filteredPerfumes]);

  const secretPerfumes = useMemo(() => {
    return filteredPerfumes.filter((p) => p.sourceType === 'SECRET');
  }, [filteredPerfumes]);

  const rndPerfumes = useMemo(() => {
    return filteredPerfumes.filter((p) => p.sourceType === 'AR-GE');
  }, [filteredPerfumes]);

  // Overall Global Catalogue Metrics
  const globalMetrics = useMemo(() => {
    let grandProduced = 0;
    let grandSold = 0;

    perfumeStats.forEach((st) => {
      grandProduced += st.totalProduced;
      grandSold += st.totalSold;
    });

    return {
      totalCatalogueCount: allCataloguePerfumes.length,
      secretCount: allCataloguePerfumes.filter((p) => p.sourceType === 'SECRET').length,
      rndCount: allCataloguePerfumes.filter((p) => p.sourceType === 'AR-GE').length,
      grandProduced,
      grandSold
    };
  }, [allCataloguePerfumes, perfumeStats]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Sektörel Parfüm Ansiklopedisi & Veritabanı
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <span>Ürün Kataloğu & Koleksiyon Portföyü</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              Sıfırdan Üretim Portföyü
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Orijinal ve Fragrantica hazır parfümleri kaldırılmıştır; tüm şirketler sıfırdan üretime başlar! Katalogda yalnızca <strong>Özgün AR-GE Formülleri</strong> ve <strong>Formülü Bul (Gizli Reçete)</strong> ile deşifre edilen parfümler yer alır.
          </p>
        </div>

        {/* Global Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center text-xs shrink-0">
          <div className="px-2">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Toplam Katalog</div>
            <div className="font-mono font-bold text-amber-300 text-base mt-0.5">
              {globalMetrics.totalCatalogueCount} Çeşit
            </div>
          </div>
          <div className="px-2 border-l border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Gizli Reçete</div>
            <div className="font-mono font-bold text-amber-400 text-base mt-0.5">
              {globalMetrics.secretCount}
            </div>
          </div>
          <div className="px-2 border-l border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">AromaLux (Siz)</div>
            <div className="font-mono font-bold text-indigo-300 text-base mt-0.5">
              {allCataloguePerfumes.filter(p => p.producerCompanyId === playerCompany.id || p.companyId === playerCompany.id).length}
            </div>
          </div>
          <div className="px-2 border-l border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Özgün AR-GE</div>
            <div className="font-mono font-bold text-purple-400 text-base mt-0.5">
              {globalMetrics.rndCount}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-md">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Tüm Parfümler</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 font-mono text-amber-300">
              {allCataloguePerfumes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('rnd')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'rnd'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🔬 Özgün AR-GE İnovasyonları</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 font-mono text-purple-300">
              {globalMetrics.rndCount}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('secret')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'secret'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🕵️ Çözülen Gizli Reçeteler (Secret)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/80 font-mono text-amber-300">
              {globalMetrics.secretCount}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('player_owned')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'player_owned'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>👑 {playerCompany.name} (Şirketiniz)</span>
          </button>
        </div>

        {/* Secondary Filter Row: Search, Gender, Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Parfüm, marka, şirket veya nota ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Company Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Şirket:</span>
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Tüm Şirketler</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.logo} {c.name} {c.isPlayer ? '(Siz)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Cinsiyet:</span>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">Tümü</option>
                <option value="KADIN">Kadın</option>
                <option value="ERKEK">Erkek</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="quality_desc">Kalite Skoru (En Yüksek)</option>
                <option value="sales_desc">En Çok Satılan</option>
                <option value="price_desc">Fiyat (Pahalıdan Ucuza)</option>
                <option value="price_asc">Fiyat (Ucuzdan Pahalıya)</option>
                <option value="newest">En Yeni Eklenen</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* ================= CATALOGUE GRID VIEWS ================= */}
      {/* If "all" category is selected and no search query or company filter is active, show categorized section by section */}
      {activeCategory === 'all' && !searchQuery.trim() && selectedGender === 'all' && selectedCompanyFilter === 'all' ? (
        <div className="space-y-10">
          
          {/* SECTION 1: ÇÖZÜLEN GİZLİ REÇETELER (SECRET) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕵️</span>
                <div>
                  <h3 className="text-base font-bold font-serif text-white">Çözülen Gizli Reçeteler (Formülü Bul)</h3>
                  <div className="text-xs text-slate-400">Deşifre edilerek şirketlerin üretim tesislerine kazandırılan gizli formüller</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
                {secretPerfumes.length} Parfüm
              </span>
            </div>

            {secretPerfumes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {secretPerfumes.map((perfume) => (
                  <PerfumeCatalogueCard
                    key={perfume.id}
                    perfume={perfume}
                    stats={perfumeStats.get(perfume.id)}
                    company={companiesMap.get(perfume.producerCompanyId || perfume.companyId || '')}
                    rawMaterialsMap={rawMaterialsMap}
                    onClick={() => setInspectPerfume(perfume)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-400">
                Henüz çözülmüş bir Gizli Reçete (Secret) parfümü yok. Formülü Bul sekmesinden gizli formülleri çözerek üretime ekleyebilirsiniz.
              </div>
            )}
          </div>

          {/* SECTION 2: ÖZGÜN AR-GE İNOVASYONLARI */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔬</span>
                <div>
                  <h3 className="text-base font-bold font-serif text-white">Özgün AR-GE İnovasyonları</h3>
                  <div className="text-xs text-slate-400">AromaLux ve rakip şirketlerin baş parfümatörlerince icat edilen patentli parfümler</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30">
                {rndPerfumes.length} Parfüm
              </span>
            </div>

            {rndPerfumes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rndPerfumes.map((perfume) => (
                  <PerfumeCatalogueCard
                    key={perfume.id}
                    perfume={perfume}
                    stats={perfumeStats.get(perfume.id)}
                    company={companiesMap.get(perfume.producerCompanyId || perfume.companyId || '')}
                    rawMaterialsMap={rawMaterialsMap}
                    onClick={() => setInspectPerfume(perfume)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 p-8 rounded-2xl text-center text-xs text-slate-400">
                Henüz AR-GE laboratuvarında yeni bir parfüm icat edilmedi. 
                AR-GE sekmesine giderek formül oluşturabilir ya da rakip botların icatlarını bekleyebilirsiniz.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* FLAT FILTERED VIEW */
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Filtrelenen sonuç: <strong className="text-white font-mono">{filteredPerfumes.length} parfüm</strong> bulundu.
          </div>

          {filteredPerfumes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPerfumes.map((perfume) => (
                <PerfumeCatalogueCard
                  key={perfume.id}
                  perfume={perfume}
                  stats={perfumeStats.get(perfume.id)}
                  company={companiesMap.get(perfume.producerCompanyId || perfume.companyId || '')}
                  rawMaterialsMap={rawMaterialsMap}
                  onClick={() => setInspectPerfume(perfume)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 p-12 rounded-3xl text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">Bu kriterlere uygun parfüm bulunamadı</h4>
              <p className="text-xs text-slate-400">Arama kelimesini veya kategori filtrenizi temizleyip tekrar deneyin.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= DETAILED INSPECTION MODAL WITH PRICE GRAPH ================= */}
      {inspectPerfume && (
        <PerfumeDetailInspectionModal
          perfume={inspectPerfume}
          stats={perfumeStats.get(inspectPerfume.id)}
          company={companiesMap.get(inspectPerfume.producerCompanyId || inspectPerfume.companyId || '')}
          allCompanies={companies}
          rawMaterialsMap={rawMaterialsMap}
          onClose={() => setInspectPerfume(null)}
          onGoToProduction={() => {
            setInspectPerfume(null);
            setActiveTab('production');
          }}
        />
      )}

    </div>
  );
};

// ================= PERFUME CATALOGUE CARD COMPONENT =================
interface PerfumeCatalogueCardProps {
  perfume: Perfume;
  stats?: { totalProduced: number; totalSold: number; totalStock: number; avgUnitCost: number };
  company?: Company;
  rawMaterialsMap: Map<string, RawMaterial>;
  onClick: () => void;
}

const PerfumeCatalogueCard: React.FC<PerfumeCatalogueCardProps> = ({
  perfume,
  stats,
  company,
  rawMaterialsMap,
  onClick
}) => {
  const isFragrantica = perfume.sourceType === 'ORİJİNAL';
  const isSecret = perfume.sourceType === 'SECRET';
  const isRnd = perfume.sourceType === 'AR-GE';

  // Canlı borsa hammadde fiyatlarına göre güncel anlık imalat maliyeti:
  const liveCost = calculateLivePerfumeUnitCost(perfume, rawMaterialsMap);
  const retailPrice = perfume.suggestedRetailPrice;
  const profitAnalysis = analyzeRealizedProfit(retailPrice, liveCost, perfume.resultLevel);

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border rounded-3xl p-5 shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl group ${
        isSecret
          ? 'border-amber-500/40 hover:border-amber-500/80 shadow-amber-950/20'
          : isRnd
          ? 'border-purple-500/40 hover:border-purple-500/80 shadow-purple-950/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="space-y-3.5">
        
        {/* Top Header: Image, Title, Badges */}
        <div className="flex gap-3.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative shadow-md">
            <img
              src={perfume.image}
              alt={perfume.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isRnd && (
              <span className="absolute top-1 left-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow border border-purple-300/40 z-10 animate-pulse">
                AR-GE
              </span>
            )}
            <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950/90 text-amber-300 border border-slate-800">
              {perfume.gender}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {isFragrantica ? (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  🌟 FRAGRANTICA
                </span>
              ) : isSecret ? (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  📜 GİZLİ REÇETE
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white border border-purple-400 shadow-sm">
                  🔬 AR-GE İCADI
                </span>
              )}

              {perfume.resultLevel && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {perfume.resultLevel}
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>{perfume.name}</span>
              {isRnd && (
                <span className="text-[8px] font-black uppercase px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  AR-GE
                </span>
              )}
            </h4>

            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {isRnd ? `${perfume.companyName || 'AR-GE'} × ${perfume.perfumerName || 'Parfümör'}` : perfume.brand}
            </div>

            {/* Şirket Bağlantısı Rozeti */}
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-300">
              <span>{company?.logo || '🏛️'}</span>
              <span className="truncate">{company?.name || (isFragrantica ? 'Kamusal Klasik' : 'Özel Mülk')}</span>
            </div>
          </div>
        </div>

        {/* Perfume Fame & Popular Countries Row */}
        {(() => {
          const fame = getPerfumeFame(perfume);
          const popCountries = getPerfumePopularCountries(perfume);
          return (
            <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800/80 text-[10px]">
              <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                <span>⭐ Şöhret: {fame}/100</span>
                <span className="text-emerald-400">(+%{Math.round(fame * 0.32)})</span>
              </span>
              <span className="text-rose-300 font-semibold flex items-center gap-1 truncate">
                <span>🔥 Popüler:</span>
                <span>{popCountries.map((c) => `${getCountryFlag(c)} ${c}`).join(', ')}</span>
              </span>
            </div>
          );
        })()}

        {/* Financial & Stock Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 text-center text-xs">
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Satış / Borsa Mal.</div>
            <div className="font-mono font-bold text-amber-300 text-xs mt-0.5">
              {retailPrice} ₺
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Mal: {liveCost} ₺</div>
          </div>

          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Kâr Payı (% & Δ)</div>
            <div className={`font-mono font-bold text-xs mt-0.5 ${profitAnalysis.statusColor}`}>
              %{profitAnalysis.profitMarginPct.toFixed(1)}
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              {profitAnalysis.profitMarginDeltaPct > 0 ? `+${profitAnalysis.profitMarginDeltaPct.toFixed(1)}%` : `${profitAnalysis.profitMarginDeltaPct.toFixed(1)}%`}
            </div>
          </div>

          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Birim Kâr</div>
            <div className={`font-mono font-bold text-xs mt-0.5 ${profitAnalysis.statusColor}`}>
              {profitAnalysis.realizedProfit >= 0 ? `+${profitAnalysis.realizedProfit}` : profitAnalysis.realizedProfit} ₺
            </div>
            <div className="text-[9px] text-slate-500 font-mono">Hedef: +{profitAnalysis.targetProfit} ₺</div>
          </div>
        </div>

        {/* Note Pyramid Badges Summary */}
        <div className="flex flex-wrap gap-1 text-[10px]">
          {(perfume.notes || []).slice(0, 4).map((noteId) => (
            <span key={noteId} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
              {noteId.replace(/_/g, ' ')}
            </span>
          ))}
          {(perfume.notes || []).length > 4 && (
            <span className="px-1.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 font-mono text-[9px]">
              +{(perfume.notes || []).length - 4} nota
            </span>
          )}
        </div>

      </div>

      {/* Card Footer: Detail prompt */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] flex items-center gap-1 font-mono">
          <span>Toplam Üretim:</span>
          <strong className="text-white">{stats?.totalProduced || 0} şişe</strong>
        </span>

        <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Detay & Fiyat Grafiği</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>

    </div>
  );
};

// ================= DETAILED INSPECTION MODAL COMPONENT =================
interface PerfumeDetailInspectionModalProps {
  perfume: Perfume;
  stats?: { totalProduced: number; totalSold: number; totalStock: number; companyHoldings: Record<string, number>; avgUnitCost: number };
  company?: Company;
  allCompanies: Company[];
  rawMaterialsMap: Map<string, any>;
  onClose: () => void;
  onGoToProduction: () => void;
}

const PerfumeDetailInspectionModal: React.FC<PerfumeDetailInspectionModalProps> = ({
  perfume,
  stats,
  company,
  allCompanies,
  rawMaterialsMap,
  onClose,
  onGoToProduction
}) => {
  const isFragrantica = perfume.sourceType === 'ORİJİNAL';
  const isSecret = perfume.sourceType === 'SECRET';
  const isRnd = perfume.sourceType === 'AR-GE';

  const retailPrice = perfume.suggestedRetailPrice;
  const targetProfit = getTierTargetProfit(perfume.resultLevel);
  // Canlı borsa hammadde spot fiyatlarına göre anlık imalat maliyeti:
  const liveUnitCost = calculateLivePerfumeUnitCost(perfume, rawMaterialsMap);
  const profitAnalysis = analyzeRealizedProfit(retailPrice, liveUnitCost, perfume.resultLevel);
  const royaltyRate = perfume.royaltyRate || (isRnd ? 0.03 : 0);
  const royaltyAmount = Math.round(retailPrice * royaltyRate * 100) / 100;

  // Generate simulated price points for historical graph (12 months trend)
  const priceHistory = useMemo(() => {
    const baseP = retailPrice;
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Bugün'];
    const variance = [0.88, 0.92, 0.90, 0.95, 0.94, 0.98, 1.02, 1.05, 1.03, 1.08, 1.06, 1.10];

    return months.map((m, idx) => {
      const p = Math.round(baseP * variance[idx]);
      return { month: m, price: p };
    });
  }, [retailPrice]);

  const maxPrice = Math.max(...priceHistory.map((p) => p.price));
  const minPrice = Math.min(...priceHistory.map((p) => p.price));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl p-6 sm:p-7 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Top Header: Close Button & Identity */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 shadow-lg relative">
              <img src={perfume.image} alt={perfume.name} className="w-full h-full object-cover" />
              {isRnd && (
                <span className="absolute top-1 left-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow border border-purple-300/50">
                  AR-GE
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {isFragrantica ? (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    🌟 FRAGRANTICA KLASİĞİ
                  </span>
                ) : isSecret ? (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    📜 SARI ZARF GİZLİ REÇETESİ
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-600 text-white border border-purple-400 shadow-sm">
                    🔬 ÖZGÜN AR-GE İCADI
                  </span>
                )}

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-bold">
                  {perfume.gender}
                </span>

                {perfume.resultLevel && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 font-mono">
                    {perfume.resultLevel} Seviye
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold font-serif text-white">
                {perfume.name}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5">
                Marka: <strong className="text-slate-200">{perfume.brand}</strong> • Sahip Şirket: <strong className="text-amber-400">{company?.name || 'Kamusal Portföy'}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 transition-colors border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 CORE KPI METRICS: ÜRETİM, SATIŞ, BİRİM MALİYET, PERAKENDE FİYATI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Toplam Üretilen</div>
            <div className="text-xl font-black font-mono text-white mt-1">
              {stats?.totalProduced || 0} <span className="text-xs font-normal text-slate-400 font-sans">şişe</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sektör Geneli</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Toplam Satılan</div>
            <div className="text-xl font-black font-mono text-indigo-400 mt-1">
              {stats?.totalSold || 0} <span className="text-xs font-normal text-slate-400 font-sans">şişe</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sipariş & İhracat</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Anlık Borsa Maliyet</div>
            <div className="text-xl font-black font-mono text-rose-400 mt-1">
              {liveUnitCost} ₺
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center justify-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Canlı Borsa Spot</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Piyasa Satış Fiyatı</div>
            <div className="text-xl font-black font-mono text-amber-300 mt-1">
              {retailPrice} ₺
            </div>
            <div className="text-[10px] font-bold mt-0.5 font-mono text-emerald-400">
              +{targetProfit} ₺ Sabit Hedef Kâr ({perfume.resultLevel || 'Standart'})
            </div>
          </div>
        </div>

        {/* FİYAT HAREKET GRAFİĞİ (HISTORICAL SVG PRICE TREND GRAPH) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Piyasa Fiyat Hareketi & Trend Grafiği (Son 12 Ay)
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Min: <strong className="text-slate-200">{minPrice} ₺</strong></span>
              <span className="text-slate-400">Max: <strong className="text-emerald-400">{maxPrice} ₺</strong></span>
            </div>
          </div>

          {/* SVG Sparkline Graph */}
          <div className="relative pt-4 pb-2">
            <div className="h-28 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 550 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad_${perfume.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="550" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="550" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="550" y2="80" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Polygon Area */}
                {(() => {
                  const points = priceHistory.map((p, idx) => {
                    const x = (idx / (priceHistory.length - 1)) * 550;
                    const y = 90 - ((p.price - minPrice) / (maxPrice - minPrice || 1)) * 75;
                    return `${x},${y}`;
                  }).join(' ');

                  const areaPoints = `0,100 ${points} 550,100`;

                  return (
                    <>
                      <polygon points={areaPoints} fill={`url(#grad_${perfume.id})`} />
                      <polyline fill="none" stroke="#10b981" strokeWidth="2.5" points={points} />
                    </>
                  );
                })()}

                {/* Data Points */}
                {priceHistory.map((p, idx) => {
                  const x = (idx / (priceHistory.length - 1)) * 550;
                  const y = 90 - ((p.price - minPrice) / (maxPrice - minPrice || 1)) * 75;
                  const isLast = idx === priceHistory.length - 1;

                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={isLast ? 4 : 2.5}
                      fill={isLast ? '#fbbf24' : '#10b981'}
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
              {priceHistory.map((p, i) => (
                <span key={i}>{p.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ŞİRKET BAZINDA ÜRÜN DEPOSU DAĞILIMI (KİMDE KAÇ ŞİŞE VAR?) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Sektör Stok Dağılımı (Kimde Kaç Şişe Var?)
            </span>
            <span className="font-mono text-emerald-400 text-xs">
              Toplam Stok: {stats?.totalStock || 0} Şişe
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allCompanies.map((comp) => {
              const holding = stats?.companyHoldings?.[comp.id] || 0;
              const isOwner = (perfume.producerCompanyId === comp.id) || (perfume.companyId === comp.id);

              return (
                <div
                  key={comp.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    comp.isPlayer
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base">{comp.logo}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate text-[11px]">{comp.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {isOwner ? '👑 Sahibi' : comp.isPlayer ? 'Siz' : 'Rakip'}
                      </div>
                    </div>
                  </div>

                  <div className={`font-mono font-bold text-xs ${holding > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {holding} adet
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FİNANSAL MALİYET, TELİF & KÂR PAYI AYRINTILARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Sol: Maliyet ve Kâr Dökümü (Canlı Borsa ve Kâr Payı % Değişimi) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5">
            <div className="font-bold text-slate-300 pb-1 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Maliyet & Kârlılık Analizi</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Borsa fiyatlarına göre canlı"></span>
              </span>
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Birim İmalat Maliyeti (Anlık Borsa):</span>
              <span className="font-mono text-white font-bold">{liveUnitCost} ₺</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Önerilen Perakende Satış:</span>
              <span className="font-mono text-amber-300 font-bold">{retailPrice} ₺</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Kademe Sabit Hedef Kâr:</span>
              <span className="font-mono text-slate-200 font-bold">+{profitAnalysis.targetProfit} ₺</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Şişe Başı Anlık Kâr:</span>
              <span className={`font-mono font-bold ${profitAnalysis.statusColor}`}>
                {profitAnalysis.realizedProfit >= 0 ? `+${profitAnalysis.realizedProfit}` : profitAnalysis.realizedProfit} ₺
              </span>
            </div>

            {/* KÂR PAYI YÜZDESİ VE DEĞİŞİMİ ALANI */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">Kâr Payı Yüzdesi (%):</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-white text-sm">%{profitAnalysis.profitMarginPct.toFixed(1)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    profitAnalysis.profitMarginDeltaPct < 0
                      ? 'text-amber-400 bg-amber-950/80 border border-amber-500/40'
                      : profitAnalysis.profitMarginDeltaPct > 0
                      ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/40'
                      : 'text-slate-300 bg-slate-800 border border-slate-700'
                  }`}>
                    {profitAnalysis.profitMarginDeltaPct > 0 ? `+${profitAnalysis.profitMarginDeltaPct.toFixed(1)}%` : `${profitAnalysis.profitMarginDeltaPct.toFixed(1)}%`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Hedef: %{profitAnalysis.targetProfitMarginPct.toFixed(1)}</span>
                <span className={profitAnalysis.profitMarginDeltaPct < 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {profitAnalysis.profitMarginDeltaPct < 0 ? `${profitAnalysis.profitMarginDeltaPct.toFixed(1)} puan erime` : `+${profitAnalysis.profitMarginDeltaPct.toFixed(1)} puan artış`}
                </span>
              </div>
            </div>

            <div className="pt-1 text-[11px]">
              {profitAnalysis.status === 'profit_eroded' ? (
                <span className="text-amber-400 font-semibold">⚠️ Hammadde zamları kâr payını {Math.abs(profitAnalysis.profitMarginDeltaPct).toFixed(1)} puan eritti!</span>
              ) : profitAnalysis.status === 'bonus_profit' ? (
                <span className="text-emerald-300 font-semibold">✨ Ucuz hammadde avantajı (+{profitAnalysis.profitMarginDeltaPct.toFixed(1)} puan ekstra kâr marjı)</span>
              ) : profitAnalysis.status === 'loss' ? (
                <span className="text-red-400 font-semibold">🚨 Hammadde maliyeti satış tavanını aştı (Zarar)!</span>
              ) : (
                <span className="text-emerald-400 font-semibold">✓ {perfume.resultLevel || 'Standart'} kademe kâr payı hedefi (%{profitAnalysis.targetProfitMarginPct.toFixed(1)}) korundu</span>
              )}
            </div>
          </div>

          {/* Sağ: Parfümatör Kâr Payı & Telif Oranı */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-slate-300 pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>Parfümatör Kâr Payı (Telif)</span>
              <Percent className="w-3.5 h-3.5 text-purple-400" />
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Sorumlu Parfümatör:</span>
              <span className="text-purple-300 font-bold">{perfume.perfumerName || 'Sektör Parfümörü'}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Telif / Kâr Payı Oranı:</span>
              <span className="font-mono text-purple-300 font-bold">
                {royaltyRate > 0 ? `%${(royaltyRate * 100).toFixed(1)}` : 'Kamusal (%0)'}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Şişe Başına Telif Kesintisi:</span>
              <span className="font-mono text-rose-300 font-bold">
                {royaltyAmount > 0 ? `-${royaltyAmount} ₺` : '0 ₺'}
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-800 flex justify-between text-slate-300">
              <span>Telif Sonrası Şirket Neti:</span>
              <span className="font-mono font-bold text-white">
                +{Math.round((retailPrice - royaltyAmount) * 100) / 100} ₺
              </span>
            </div>
          </div>

        </div>

        {/* KOKU PİRAMİDİ (RECIPE & NOTE PYRAMID) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Koku Piramidi & Esans Formülü</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Üst Notalar */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-rose-500/20 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-rose-300">Üst Notalar (Açılış)</div>
              <div className="flex flex-wrap gap-1">
                {(perfume.topNotes || []).map((id) => (
                  <span key={id} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[11px] border border-slate-800">
                    {rawMaterialsMap.get(id)?.name || id}
                  </span>
                ))}
              </div>
            </div>

            {/* Orta Notalar */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-amber-500/20 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-amber-300">Orta Notalar (Kalp)</div>
              <div className="flex flex-wrap gap-1">
                {(perfume.middleNotes || []).map((id) => (
                  <span key={id} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[11px] border border-slate-800">
                    {rawMaterialsMap.get(id)?.name || id}
                  </span>
                ))}
              </div>
            </div>

            {/* Alt Notalar */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-500/20 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-purple-300">Alt Notalar (Dip)</div>
              <div className="flex flex-wrap gap-1">
                {(perfume.baseNotes || []).map((id) => (
                  <span key={id} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[11px] border border-slate-800">
                    {rawMaterialsMap.get(id)?.name || id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Katalog Kimliği: <span className="font-mono text-slate-300">{perfume.id}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Kapat
            </button>

            <button
              onClick={onGoToProduction}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Factory className="w-4 h-4" />
              <span>Üretim Fabrikasına Git</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
