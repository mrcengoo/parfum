import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import {
  COMPANY_DEFAULT_COUNTRY_BONUSES,
  COMPANY_DEFAULT_SALES_REPS,
  GLOBAL_MARKET_COUNTRIES,
  getCountryFlag,
  getPerfumeFame,
  getPerfumePopularCountries,
  isPerfumePopularInCountry,
  normalizeCountryName
} from '../../services/marketingEngine';
import {
  Globe2,
  Trophy,
  BarChart3,
  TrendingUp,
  Flame,
  Crown,
  Sparkles,
  Award,
  Megaphone,
  Building2,
  Package,
  Coins,
  ArrowRight
} from 'lucide-react';

interface PerfumeCountryStat {
  perfumeId: string;
  perfumeName: string;
  perfumeImage: string;
  sourceType: string;
  gender: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  fame: number;
  popularCountries: string[];
  totalBottlesSold: number;
  totalRevenue: number;
  lastSalePrice: number;
  currentStock: number;
  countryBottles: Record<string, number>;
  countryRevenue: Record<string, number>;
}

interface CountryCompanyShare {
  companyId: string;
  companyName: string;
  companyLogo: string;
  isPlayer: boolean;
  bottlesSold: number;
  revenue: number;
  influencePoints: number;
  marketSharePct: number;
  countryBonusPct: number;
  hasActiveAd: boolean;
  activeAdBonusPct: number;
  isRepSpecialty: boolean;
}

interface CountryMarketAnalytics {
  countryId: string;
  countryName: string;
  fullName: string;
  flag: string;
  favoriteStyle: string;
  totalBottlesSold: number;
  totalRevenue: number;
  leaderCompany: CountryCompanyShare;
  companyShares: CountryCompanyShare[];
  topPerfumes: {
    perfumeId: string;
    perfumeName: string;
    perfumeImage: string;
    sourceType: string;
    companyId: string;
    companyName: string;
    companyLogo: string;
    fame: number;
    isNaturallyPopular: boolean;
    bottlesSold: number;
    revenue: number;
    dominanceScore: number;
  }[];
}

const COMPANY_BAR_COLORS: Record<string, string> = {
  aromalux: 'from-amber-400 to-amber-500',
  scentora: 'from-purple-500 to-indigo-500',
  parfuma: 'from-sky-400 to-blue-600',
  aura_bella: 'from-rose-400 to-pink-600'
};

const COMPANY_BADGE_COLORS: Record<string, string> = {
  aromalux: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  scentora: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  parfuma: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  aura_bella: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
};

export const MarketAnalyticsPage: React.FC = () => {
  const { companies, perfumes, setActiveTab } = useGame();

  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [perfumeSortBy, setPerfumeSortBy] = useState<'bottles' | 'revenue' | 'fame'>('bottles');

  // Build complete analytics for all perfumes, companies, and the 9 global countries
  const analytics = useMemo(() => {
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    // 1. Build per-perfume stats across all companies
    const perfumeStatsList: PerfumeCountryStat[] = perfumes.map((p) => {
      const ownerComp =
        companyMap.get(p.producerCompanyId) ||
        companyMap.get(p.companyId) ||
        companies[0];

      // Aggregate across all company storages (in case multiple records exist, though each perfume belongs to its producer)
      let totalBottlesSold = 0;
      let totalRevenue = 0;
      let currentStock = 0;
      let lastSalePrice = p.suggestedRetailPrice || 1400;
      const countryBottles: Record<string, number> = {};
      const countryRevenue: Record<string, number> = {};

      for (const comp of companies) {
        const item = comp.productStorage?.[p.id];
        if (!item) continue;
        currentStock += item.quantity || 0;
        if (item.lastSalePrice) lastSalePrice = item.lastSalePrice;

        const sold = item.totalSold || 0;
        totalBottlesSold += sold;

        // Recorded country sales
        let recordedSum = 0;
        if (item.countrySales) {
          for (const [cName, qty] of Object.entries(item.countrySales)) {
            const norm = normalizeCountryName(cName);
            countryBottles[norm] = (countryBottles[norm] || 0) + qty;
            recordedSum += qty;
          }
        }
        if (item.countryRevenue) {
          for (const [cName, rev] of Object.entries(item.countryRevenue)) {
            const norm = normalizeCountryName(cName);
            countryRevenue[norm] = (countryRevenue[norm] || 0) + rev;
            totalRevenue += rev;
          }
        }

        // If there were legacy sold bottles before countrySales tracking, distribute them realistically across the perfume's popular countries & rep specialty countries
        const unallocated = Math.max(0, sold - recordedSum);
        if (unallocated > 0) {
          const popCountries = getPerfumePopularCountries(p);
          const repCountries =
            (comp.salesRep || COMPANY_DEFAULT_SALES_REPS[comp.id])?.specialtyCountries || [];
          const targetList = Array.from(new Set([...popCountries, ...repCountries]));
          const weights = [0.45, 0.32, 0.23];
          let allocatedSoFar = 0;

          for (let i = 0; i < Math.min(3, targetList.length); i++) {
            const cName = targetList[i];
            const shareQty =
              i === Math.min(3, targetList.length) - 1
                ? unallocated - allocatedSoFar
                : Math.round(unallocated * (weights[i] || 0.25));
            if (shareQty > 0) {
              countryBottles[cName] = (countryBottles[cName] || 0) + shareQty;
              const estRev = shareQty * (item.lastSalePrice || p.suggestedRetailPrice || 1400);
              countryRevenue[cName] = (countryRevenue[cName] || 0) + estRev;
              totalRevenue += estRev;
              allocatedSoFar += shareQty;
            }
          }
        }
      }

      return {
        perfumeId: p.id,
        perfumeName: p.name,
        perfumeImage: p.image,
        sourceType: p.sourceType,
        gender: p.gender,
        companyId: ownerComp.id,
        companyName: ownerComp.name,
        companyLogo: ownerComp.logo,
        fame: getPerfumeFame(p),
        popularCountries: getPerfumePopularCountries(p),
        totalBottlesSold,
        totalRevenue: Math.round(totalRevenue),
        lastSalePrice,
        currentStock,
        countryBottles,
        countryRevenue
      };
    });

    // 2. Build per-country market share & top perfumes for each of the 9 global countries
    const now = Date.now();
    const countryAnalyticsList: CountryMarketAnalytics[] = GLOBAL_MARKET_COUNTRIES.map(
      (country) => {
        const cName = country.name;

        const rawCompanyShares = companies.map((comp) => {
          const rep =
            comp.salesRep ||
            COMPANY_DEFAULT_SALES_REPS[comp.id] ||
            COMPANY_DEFAULT_SALES_REPS.aromalux;
          const countryMap =
            comp.countryBonuses ||
            COMPANY_DEFAULT_COUNTRY_BONUSES[comp.id] ||
            {};
          const countryBonusPct = Math.round((countryMap[cName] || 0) * 100);
          const activeAd = (comp.activeCampaigns || []).find(
            (ad) => ad.expiresAt > now && normalizeCountryName(ad.targetCountry) === cName
          );
          const activeAdBonusPct = activeAd ? Math.round(activeAd.countryBonusRate * 100) : 0;
          const isRepSpecialty = rep.specialtyCountries.some(
            (sc) => normalizeCountryName(sc) === cName
          );

          // Sum bottles sold & revenue in this country by this company's perfumes
          const compPerfumes = perfumeStatsList.filter((ps) => ps.companyId === comp.id);
          let bottlesSold = 0;
          let revenue = 0;
          let popularPerfumeCount = 0;

          for (const ps of compPerfumes) {
            bottlesSold += ps.countryBottles[cName] || 0;
            revenue += ps.countryRevenue[cName] || 0;
            if (ps.popularCountries.includes(cName)) {
              popularPerfumeCount += 1;
            }
          }

          // Influence points combine actual sales volume + structural country presence (bonuses, ads, rep specialty, popular perfumes)
          // so market share is always meaningful (both at 0 sales start and as sales scale!)
          const basePresencePoints =
            10 +
            countryBonusPct * 1.8 +
            activeAdBonusPct * 2.2 +
            (isRepSpecialty ? 16 : 0) +
            popularPerfumeCount * 8 +
            (rep.persuasion || 55) * 0.2;
          const influencePoints = bottlesSold * 6 + revenue / 800 + basePresencePoints;

          return {
            companyId: comp.id,
            companyName: comp.name,
            companyLogo: comp.logo,
            isPlayer: comp.isPlayer,
            bottlesSold,
            revenue: Math.round(revenue),
            influencePoints,
            marketSharePct: 0,
            countryBonusPct,
            hasActiveAd: Boolean(activeAd),
            activeAdBonusPct,
            isRepSpecialty
          };
        });

        const totalBottlesInCountry = rawCompanyShares.reduce((s, c) => s + c.bottlesSold, 0);
        const totalRevenueInCountry = rawCompanyShares.reduce((s, c) => s + c.revenue, 0);
        const totalInfluence = rawCompanyShares.reduce((s, c) => s + c.influencePoints, 0) || 1;

        // Calculate market share %:
        // If there are substantial sales in this country (>= 20 bottles), weight 75% actual sales + 25% influence; otherwise weight influence + sales smoothly
        const companyShares: CountryCompanyShare[] = rawCompanyShares
          .map((cs) => {
            let pct = (cs.influencePoints / totalInfluence) * 100;
            if (totalBottlesInCountry >= 15) {
              const bottlePct = (cs.bottlesSold / totalBottlesInCountry) * 100;
              pct = bottlePct * 0.78 + pct * 0.22;
            }
            return {
              ...cs,
              marketSharePct: Math.round(pct * 10) / 10
            };
          })
          .sort((a, b) => b.marketSharePct - a.marketSharePct);

        // Normalize rounding to 100.0%
        const sumPct = companyShares.reduce((s, c) => s + c.marketSharePct, 0);
        if (companyShares.length > 0 && Math.abs(sumPct - 100) > 0.05) {
          companyShares[0].marketSharePct =
            Math.round((companyShares[0].marketSharePct + (100 - sumPct)) * 10) / 10;
        }

        // Top perfumes in this country
        const topPerfumes = perfumeStatsList
          .map((ps) => {
            const bSold = ps.countryBottles[cName] || 0;
            const rev = ps.countryRevenue[cName] || 0;
            const isNatPop = ps.popularCountries.includes(cName);
            const dominanceScore =
              bSold * 100 + rev / 100 + (isNatPop ? 35 : 0) + ps.fame * 0.8;
            return {
              perfumeId: ps.perfumeId,
              perfumeName: ps.perfumeName,
              perfumeImage: ps.perfumeImage,
              sourceType: ps.sourceType,
              companyId: ps.companyId,
              companyName: ps.companyName,
              companyLogo: ps.companyLogo,
              fame: ps.fame,
              isNaturallyPopular: isNatPop,
              bottlesSold: bSold,
              revenue: Math.round(rev),
              dominanceScore
            };
          })
          .sort((a, b) => b.dominanceScore - a.dominanceScore)
          .slice(0, 5);

        return {
          countryId: country.id,
          countryName: cName,
          fullName: country.fullName,
          flag: country.flag,
          favoriteStyle: country.favoriteStyle,
          totalBottlesSold: totalBottlesInCountry,
          totalRevenue: totalRevenueInCountry,
          leaderCompany: companyShares[0],
          companyShares,
          topPerfumes
        };
      }
    );

    // 3. Global company market share summary
    const globalTotalBottles = perfumeStatsList.reduce((s, p) => s + p.totalBottlesSold, 0);
    const globalTotalRevenue = perfumeStatsList.reduce((s, p) => s + p.totalRevenue, 0);

    const globalCompanySummary = companies.map((comp) => {
      const compPerfumes = perfumeStatsList.filter((p) => p.companyId === comp.id);
      const bottlesSold = compPerfumes.reduce((s, p) => s + p.totalBottlesSold, 0);
      const salesRevenue = compPerfumes.reduce((s, p) => s + p.totalRevenue, 0);
      const ledCountries = countryAnalyticsList.filter(
        (ca) => ca.leaderCompany.companyId === comp.id
      );
      const bestPerfume = [...compPerfumes].sort(
        (a, b) => b.totalBottlesSold - a.totalBottlesSold || b.fame - a.fame
      )[0];

      // Average market share across the 9 countries
      const avgCountryShare =
        countryAnalyticsList.reduce((sum, ca) => {
          const found = ca.companyShares.find((s) => s.companyId === comp.id);
          return sum + (found?.marketSharePct || 25);
        }, 0) / countryAnalyticsList.length;

      const globalSharePct =
        globalTotalBottles >= 25
          ? Math.round(((bottlesSold / globalTotalBottles) * 75 + avgCountryShare * 0.25) * 10) / 10
          : Math.round(avgCountryShare * 10) / 10;

      return {
        company: comp,
        bottlesSold,
        salesRevenue,
        ledCountriesCount: ledCountries.length,
        ledCountries,
        bestPerfume,
        globalSharePct
      };
    });

    // Normalize globalSharePct to 100%
    globalCompanySummary.sort((a, b) => b.globalSharePct - a.globalSharePct);
    const globalSumPct = globalCompanySummary.reduce((s, c) => s + c.globalSharePct, 0);
    if (globalCompanySummary.length > 0 && Math.abs(globalSumPct - 100) > 0.05) {
      globalCompanySummary[0].globalSharePct =
        Math.round((globalCompanySummary[0].globalSharePct + (100 - globalSumPct)) * 10) / 10;
    }

    return {
      perfumeStatsList,
      countryAnalyticsList,
      globalCompanySummary,
      globalTotalBottles,
      globalTotalRevenue
    };
  }, [companies, perfumes]);

  // Sorted & filtered perfumes for the Best-Selling Perfumes leaderboard
  const rankedPerfumes = useMemo(() => {
    const filtered = analytics.perfumeStatsList.filter((p) => {
      if (selectedCompanyFilter !== 'all' && p.companyId !== selectedCompanyFilter) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (perfumeSortBy === 'revenue') {
        return b.totalRevenue - a.totalRevenue || b.totalBottlesSold - a.totalBottlesSold || b.fame - a.fame;
      }
      if (perfumeSortBy === 'fame') {
        return b.fame - a.fame || b.totalBottlesSold - a.totalBottlesSold;
      }
      return b.totalBottlesSold - a.totalBottlesSold || b.totalRevenue - a.totalRevenue || b.fame - a.fame;
    });
  }, [analytics.perfumeStatsList, selectedCompanyFilter, perfumeSortBy]);

  const visibleCountries = useMemo(() => {
    if (selectedCountryFilter === 'all') return analytics.countryAnalyticsList;
    return analytics.countryAnalyticsList.filter((c) => c.countryName === selectedCountryFilter);
  }, [analytics.countryAnalyticsList, selectedCountryFilter]);

  const topGlobalPerfume = rankedPerfumes[0];
  const globalLeaderCompany = analytics.globalCompanySummary[0];

  return (
    <div className="space-y-7 pb-16">
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            Küresel Pazar İstihbaratı & Satış Analitiği
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2.5 flex-wrap">
            <span>Ülkelere Göre Pazar Payı & En Çok Satılan Parfümler</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              20 Küresel Ülke • {perfumes.length} Parfüm
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            4 parfümeri evinin 20 küresel pazardaki (Fransa, BAE, ABD, İngiltere, İtalya, Katar, Japonya, Almanya, İsviçre, Suudi Arabistan, İspanya, Güney Kore, Çin, Rusya, Kanada, Brezilya, Avustralya, Singapur, Kuveyt, Türkiye) <strong>anlık pazar payı yüzdelerini</strong>, <strong>ülke liderliklerini</strong> ve <strong>dünya genelinde en çok satılan parfümlerin</strong> şişe/ciro istatistiklerini canlı takip edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Ülke Reklamı Ver & Pazar Payını Artır</span>
          </button>
        </div>
      </div>

      {/* TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Küresel Satılan Toplam Şişe
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {analytics.globalTotalBottles.toLocaleString('tr-TR')} şişe
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>20 Ülke İhracat & Dağıtım Toplamı</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Küresel Parfüm Satış Cirosu
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {analytics.globalTotalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>İkna, Şöhret & Ülke Primleri Dahil</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
            Küresel Pazar Lideri Şirket
          </div>
          {globalLeaderCompany && (
            <>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">{globalLeaderCompany.company.logo}</span>
                <span className="truncate">{globalLeaderCompany.company.name}</span>
                <span className="text-sm font-mono font-black text-amber-300">
                  %{globalLeaderCompany.globalSharePct}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                {globalLeaderCompany.ledCountriesCount} Ülkede Pazar Lideri • {globalLeaderCompany.bottlesSold} Şişe
              </div>
            </>
          )}
        </div>

        <div className="bg-slate-900/90 border border-purple-500/30 p-5 rounded-2xl shadow-lg">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">
            Dünyanın En Çok Satan Parfümü
          </div>
          {topGlobalPerfume && (
            <>
              <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                <span>🏆 {topGlobalPerfume.perfumeName}</span>
              </div>
              <div className="text-xs text-emerald-400 font-mono font-bold mt-1">
                {topGlobalPerfume.totalBottlesSold} şişe • {topGlobalPerfume.totalRevenue.toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{topGlobalPerfume.companyLogo} {topGlobalPerfume.companyName}</span>
                <span className="text-amber-300 font-mono">⭐ Şöhret: {topGlobalPerfume.fame}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 1: 4 ŞİRKETİN KÜRESEL PAZAR PAYI ÖZET ÇUBUĞU VE KARTLARI */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Sektör Genel Pazar Payı Dağılımı (4 Şirket Karşılaştırması)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gerçekleşen şişe satışları, ülke hakimiyet bonusları, aktif reklam kampanyaları ve temsilci ikna gücüne göre küresel pazar payı:
            </p>
          </div>
        </div>

        {/* Stacked Global Market Share Bar */}
        <div className="space-y-2">
          <div className="w-full h-5 bg-slate-950 rounded-2xl overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
            {analytics.globalCompanySummary.map((item) => (
              <div
                key={item.company.id}
                style={{ width: `${Math.max(4, item.globalSharePct)}%` }}
                className={`h-full first:rounded-l-xl last:rounded-r-xl bg-gradient-to-r ${
                  COMPANY_BAR_COLORS[item.company.id] || 'from-emerald-500 to-teal-500'
                } transition-all duration-500 flex items-center justify-center text-[10px] font-mono font-black text-slate-950 overflow-hidden`}
                title={`${item.company.name}: %${item.globalSharePct}`}
              >
                {item.globalSharePct >= 10 ? `${item.company.name} %${item.globalSharePct}` : ''}
              </div>
            ))}
          </div>
        </div>

        {/* 4 Company Global Share Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.globalCompanySummary.map((item, idx) => (
            <div
              key={item.company.id}
              className={`rounded-2xl border p-4 space-y-3 ${
                item.company.isPlayer
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.company.logo}</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>#{idx + 1} {item.company.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.ledCountriesCount} Ülkede Lider
                    </div>
                  </div>
                </div>
                <span className="text-base font-mono font-black text-amber-300">
                  %{item.globalSharePct}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400">Satılan Şişe</div>
                  <div className="font-mono font-bold text-emerald-400">
                    {item.bottlesSold.toLocaleString('tr-TR')} adet
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Satış Cirosu</div>
                  <div className="font-mono font-bold text-amber-300">
                    {item.salesRevenue.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>

              {/* Led Countries Flags */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Lider Olduğu Pazarlar:</span>
                <div className="flex items-center gap-1">
                  {item.ledCountries.length > 0 ? (
                    item.ledCountries.map((lc) => (
                      <span key={lc.countryId} title={lc.countryName} className="text-sm">
                        {lc.flag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic text-[10px]">Rekabet ediyor</span>
                  )}
                </div>
              </div>

              {item.bestPerfume && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[110px]">
                    En Çok Satan: <strong className="text-slate-200">{item.bestPerfume.perfumeName}</strong>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold shrink-0">
                    {item.bestPerfume.totalBottlesSold} şişe
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: ÜLKELERE GÖRE ŞİRKETLERİN PAZAR PAYI & ÜLKENİN EN ÇOK SATILAN PARFÜMLERİ */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <span>Ülkelere Göre Şirket Pazar Payları & Ülkede En Çok Satılan Parfümler</span>
            </h3>
            <p className="text-xs text-slate-400">
              Her ülkede hangi şirketin yüzde kaç pazar payına sahip olduğunu ve o ülkede en çok satan ilk 5 parfümü inceleyin:
            </p>
          </div>

          {/* Country Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedCountryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCountryFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Tüm Ülkeler ({GLOBAL_MARKET_COUNTRIES.length})
            </button>
            {GLOBAL_MARKET_COUNTRIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCountryFilter(c.name)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedCountryFilter === c.name
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Country Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleCountries.map((country) => (
            <div
              key={country.countryId}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-4">
                {/* Country Header & Leader Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
                      {country.flag}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{country.fullName}</h4>
                      <div className="text-[10px] text-slate-400">{country.favoriteStyle}</div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                        Toplam Satış: <strong>{country.totalBottlesSold} şişe</strong> •{' '}
                        <strong>{country.totalRevenue.toLocaleString('tr-TR')} ₺</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">
                      Pazar Lideri
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono mt-0.5">
                      <span>{country.leaderCompany.companyLogo}</span>
                      <span>%{country.leaderCompany.marketSharePct}</span>
                    </span>
                  </div>
                </div>

                {/* Stacked Bar for this Country */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-between">
                    <span>Şirketlerin {country.countryName} Pazar Payı (%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                    {country.companyShares.map((cs) => (
                      <div
                        key={cs.companyId}
                        style={{ width: `${Math.max(3, cs.marketSharePct)}%` }}
                        className={`h-full bg-gradient-to-r ${
                          COMPANY_BAR_COLORS[cs.companyId] || 'from-emerald-500 to-teal-500'
                        }`}
                        title={`${cs.companyName}: %${cs.marketSharePct}`}
                      />
                    ))}
                  </div>

                  {/* 4 Company Rows in this Country */}
                  <div className="space-y-1.5 pt-1">
                    {country.companyShares.map((cs, i) => (
                      <div
                        key={cs.companyId}
                        className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs ${
                          cs.isPlayer
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-slate-950/70 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-mono text-slate-500 w-3">
                            {i + 1}.
                          </span>
                          <span>{cs.companyLogo}</span>
                          <span className="font-bold text-white truncate text-[11px]">
                            {cs.companyName}
                          </span>
                          {cs.countryBonusPct > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono">
                              +%{cs.countryBonusPct}
                            </span>
                          )}
                          {cs.isRepSpecialty && (
                            <span title="Temsilci Uzman Ülkesi (+%10)" className="text-[10px]">
                              🎯
                            </span>
                          )}
                          {cs.hasActiveAd && (
                            <span
                              title={`Aktif Reklam (+%${cs.activeAdBonusPct})`}
                              className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold"
                            >
                              📢 +%{cs.activeAdBonusPct}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                          <span className="text-slate-400">{cs.bottlesSold} şişe</span>
                          <span className="font-bold text-amber-300 w-12 text-right">
                            %{cs.marketSharePct.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Best-Selling Perfumes in this Country */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold uppercase text-rose-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>{country.countryName} En Çok Satan Parfümler</span>
                    </span>
                    <span className="text-slate-500 font-mono">Adet & Şöhret</span>
                  </div>

                  <div className="space-y-1.5">
                    {country.topPerfumes.map((tp, idx) => (
                      <div
                        key={tp.perfumeId}
                        className="p-2 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                              idx === 0
                                ? 'bg-amber-500 text-slate-950'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <img
                            src={tp.perfumeImage}
                            alt={tp.perfumeName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate text-[11px] flex items-center gap-1">
                              <span className="truncate">{tp.perfumeName}</span>
                              {tp.isNaturallyPopular && (
                                <span
                                  title="Bu ülkede doğal olarak çok popüler (+%18)"
                                  className="text-[9px] text-rose-400 shrink-0"
                                >
                                  🔥
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-400 flex items-center gap-1">
                              <span>{tp.companyLogo} {tp.companyName}</span>
                              <span>•</span>
                              <span className="text-amber-300 font-mono">⭐{tp.fame}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono">
                          <div className="text-[11px] font-bold text-emerald-400">
                            {tp.bottlesSold} şişe
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {tp.revenue > 0 ? `${tp.revenue.toLocaleString('tr-TR')} ₺` : 'Popüler Aday'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: DÜNYA GENELİ EN ÇOK SATILAN PARFÜMLER SIRALAMASI (TOP BEST-SELLERS TABLE) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              Küresel En Çok Satılan Parfümler Liderlik Tablosu
            </div>
            <h3 className="text-base lg:text-lg font-bold text-white">
              Tüm Parfümlerin Satış Adedi, Cirosu, Şöhreti ve En Çok Sattığı Ülkeler
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Company Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCompanyFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedCompanyFilter === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tüm Şirketler
              </button>
              {companies.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCompanyFilter(c.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedCompanyFilter === c.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{c.logo}</span>
                  <span className="hidden sm:inline">{c.name}</span>
                </button>
              ))}
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPerfumeSortBy('bottles')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  perfumeSortBy === 'bottles'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📦 Satılan Şişe
              </button>
              <button
                type="button"
                onClick={() => setPerfumeSortBy('revenue')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  perfumeSortBy === 'revenue'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                💰 Toplam Ciro
              </button>
              <button
                type="button"
                onClick={() => setPerfumeSortBy('fame')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  perfumeSortBy === 'fame'
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⭐ Şöhret Puanı
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Best-Selling Perfumes Podium */}
        {rankedPerfumes.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankedPerfumes.slice(0, 3).map((p, idx) => {
              const topSoldCountries = Object.entries(p.countryBottles)
                .filter(([, q]) => q > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

              return (
                <div
                  key={p.perfumeId}
                  className={`rounded-2xl border p-4 flex items-center gap-3.5 ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-950/40 to-slate-950 border-amber-500/50'
                      : idx === 1
                      ? 'bg-gradient-to-r from-slate-800/40 to-slate-950 border-slate-600/50'
                      : 'bg-gradient-to-r from-orange-950/30 to-slate-950 border-orange-500/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={p.perfumeImage}
                      alt={p.perfumeName}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
                    />
                    <span className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                        {p.companyLogo} {p.companyName}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-300">
                        ⭐ Şöhret: {p.fame}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{p.perfumeName}</h4>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">{p.totalBottlesSold} şişe satıldı</span>
                      <span className="text-amber-300 font-bold">
                        {p.totalRevenue.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {topSoldCountries.length > 0 ? (
                        topSoldCountries.map(([cName, qty]) => (
                          <span
                            key={cName}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                          >
                            {getCountryFlag(cName)} {cName}: {qty}
                          </span>
                        ))
                      ) : (
                        p.popularCountries.map((cName) => (
                          <span
                            key={cName}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300"
                          >
                            🔥 {getCountryFlag(cName)} {cName}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Best-Selling Perfumes Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <th className="py-3.5 px-4">Sıra & Parfüm</th>
                <th className="py-3.5 px-3">Üretici Şirket</th>
                <th className="py-3.5 px-3 text-center">⭐ Şöhret</th>
                <th className="py-3.5 px-3">🔥 Popüler Olduğu Ülkeler</th>
                <th className="py-3.5 px-3">En Çok Sattığı Ülkeler (Adet)</th>
                <th className="py-3.5 px-3 text-right">Toplam Satılan</th>
                <th className="py-3.5 px-4 text-right">Toplam Satış Cirosu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedPerfumes.map((p, index) => {
                const topSoldCountries = Object.entries(p.countryBottles)
                  .filter(([, q]) => q > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3);
                const shareOfGlobalBottles =
                  analytics.globalTotalBottles > 0
                    ? ((p.totalBottlesSold / analytics.globalTotalBottles) * 100).toFixed(1)
                    : '0.0';

                return (
                  <tr key={p.perfumeId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-400 w-5">
                          #{index + 1}
                        </span>
                        <img
                          src={p.perfumeImage}
                          alt={p.perfumeName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{p.perfumeName}</span>
                            {p.sourceType === 'AR-GE' && (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white">
                                AR-GE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Son Fiyat: {p.lastSalePrice.toLocaleString('tr-TR')} ₺ • Stok: {p.currentStock}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold ${
                          COMPANY_BADGE_COLORS[p.companyId] ||
                          'bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        <span>{p.companyLogo}</span>
                        <span>{p.companyName}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                        ⭐ {p.fame}/100
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.popularCountries.map((cName) => (
                          <span
                            key={cName}
                            className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-200 text-[10px] font-medium"
                          >
                            🔥 {getCountryFlag(cName)} {cName}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {topSoldCountries.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {topSoldCountries.map(([cName, qty]) => (
                            <span
                              key={cName}
                              className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold"
                            >
                              {getCountryFlag(cName)} {cName}: {qty} şişe
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Henüz satış yok</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <div className="font-bold text-emerald-400 text-xs">
                        {p.totalBottlesSold.toLocaleString('tr-TR')} şişe
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Küresel Pay: %{shareOfGlobalBottles}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-300 text-xs">
                      {p.totalRevenue.toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
