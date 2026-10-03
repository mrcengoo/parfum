import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfumer, Perfume } from '../../types';
import { PerfumerAvatar } from '../common/PerfumerAvatar';
import { getFamilyMeta, format3FamiliesLabel } from '../../data/rawMaterials';
import {
  COMPANY_DEFAULT_AD_SPECIALISTS,
  COMPANY_DEFAULT_SALES_REPS,
  GLOBAL_MARKET_COUNTRIES,
  TRANSFERABLE_AD_SPECIALISTS,
  TRANSFERABLE_SALES_REPS,
  getCompanyAdSpecialist,
  getCompanySalesRep,
  getCompanySynergyCountries,
  getCountryFlag,
  getCountrySynergyDetails,
  normalizeCountryName
} from '../../services/marketingEngine';
import {
  Award,
  Sparkles,
  TrendingUp,
  FlaskConical,
  Truck,
  Globe2,
  Droplets,
  Coins,
  Percent,
  Building2,
  UserCheck,
  Megaphone,
  Zap,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  History,
  Info,
  ChevronRight
} from 'lucide-react';

export const PerfumersPage: React.FC = () => {
  const {
    perfumers,
    playerPerfumer,
    playerCompany,
    companies,
    perfumes,
    rawMaterialsMap,
    assignPerfumerToPlayerCompany,
    trainSalesRep,
    hireSalesRep,
    trainAdSpecialist,
    hireAdSpecialist,
    rerollPerfumerFamilies,
    rerollStaffBonuses,
    setActiveTab
  } = useGame();

  const [selectedPerfumerId, setSelectedPerfumerId] = useState<string>(playerPerfumer.id);
  const [employeeTab, setEmployeeTab] = useState<
    'all' | 'perfumers' | 'ad_specialists' | 'sales_reps' | 'synergy'
  >('all');

  // Combine all Ad Specialists (4 Company Defaults + 4 Transferable) without duplicates
  const allAdSpecialistsList = useMemo(() => {
    const activeList = companies.map((comp) => ({
      specialist: getCompanyAdSpecialist(comp),
      company: comp,
      isTransferCandidate: false,
      hiringCost: 0
    }));
    const activeIds = new Set(activeList.map((a) => a.specialist.id));
    const transferableList = TRANSFERABLE_AD_SPECIALISTS.filter((t) => !activeIds.has(t.id)).map(
      (t) => ({
        specialist: t,
        company: undefined,
        isTransferCandidate: true,
        hiringCost: t.hiringCost
      })
    );
    return [...activeList, ...transferableList];
  }, [companies]);

  // Combine all Sales Reps (4 Company Defaults + 4 Transferable) without duplicates
  const allSalesRepsList = useMemo(() => {
    const activeList = companies.map((comp) => ({
      rep: getCompanySalesRep(comp),
      company: comp,
      isTransferCandidate: false,
      hiringCost: 0
    }));
    const activeIds = new Set(activeList.map((r) => r.rep.id));
    const transferableList = TRANSFERABLE_SALES_REPS.filter((t) => !activeIds.has(t.id)).map(
      (t) => ({
        rep: t,
        company: undefined,
        isTransferCandidate: true,
        hiringCost: t.hiringCost
      })
    );
    return [...activeList, ...transferableList];
  }, [companies]);

  const selectedPerfumer = useMemo(() => {
    return perfumers.find((p) => p.id === selectedPerfumerId) || perfumers[0];
  }, [perfumers, selectedPerfumerId]);

  // Map perfumer to their assigned company
  const perfumerCompanyMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; logo: string; isPlayer: boolean }>();
    companies.forEach((comp) => {
      if (comp.perfumerId) {
        map.set(comp.perfumerId, {
          id: comp.id,
          name: comp.name,
          logo: comp.logo,
          isPlayer: comp.isPlayer
        });
      }
    });
    return map;
  }, [companies]);

  // Perfumes associated with each perfumer
  const perfumerPerfumeStats = useMemo(() => {
    const statsMap = new Map<string, {
      perfumes: {
        perfume: Perfume;
        producingCompany?: { id: string; name: string; logo: string };
        totalSold: number;
        lastSalePrice: number;
        designFeeEarned: number;
        royaltyRate: number;
        unitRoyaltyAmount: number;
        totalRoyaltyEarned: number;
        totalEarnings: number;
      }[];
      totalDesignFees: number;
      totalRoyalties: number;
      totalCombinedEarnings: number;
      totalBottlesSold: number;
    }>();

    perfumers.forEach((p) => {
      // Find perfumes: either matching perfumerId/perfumerName OR belonging to their company's core catalogue
      const assignedComp = perfumerCompanyMap.get(p.id);

      const matchedPerfumes = perfumes.filter((perf) => {
        if (perf.perfumerId === p.id) return true;
        if (perf.perfumerName?.toLowerCase() === p.name.toLowerCase()) return true;
        if (assignedComp && (perf.producerCompanyId === assignedComp.id || perf.companyId === assignedComp.id)) {
          return true;
        }
        return false;
      });

      let totalDesignFees = 0;
      let totalRoyalties = 0;
      let totalBottlesSold = 0;

      const detailedList = matchedPerfumes.map((perf) => {
        // Find producing company
        const comp = companies.find((c) => c.id === perf.producerCompanyId || c.id === perf.companyId);
        const item = comp?.productStorage?.[perf.id];

        const totalSold = item?.totalSold || 0;
        const lastSalePrice = item?.lastSalePrice || perf.suggestedRetailPrice;

        // Design Fee: If AR-GE or custom registered, perfumer was paid their design fee
        const isRnd = perf.sourceType === 'AR-GE';
        const designFeeEarned = isRnd ? (perf.designFee || p.designFee) : 0;

        // Royalty: Defined for AR-GE or custom formulas
        const royaltyRate = perf.royaltyRate || (isRnd ? p.royaltyRate : 0);
        const unitRoyaltyAmount = Math.round(lastSalePrice * royaltyRate * 100) / 100;
        const totalRoyaltyEarned = Math.round(totalSold * unitRoyaltyAmount * 100) / 100;

        const totalEarnings = designFeeEarned + totalRoyaltyEarned;

        totalDesignFees += designFeeEarned;
        totalRoyalties += totalRoyaltyEarned;
        totalBottlesSold += totalSold;

        return {
          perfume: perf,
          producingCompany: comp ? { id: comp.id, name: comp.name, logo: comp.logo } : undefined,
          totalSold,
          lastSalePrice,
          designFeeEarned,
          royaltyRate,
          unitRoyaltyAmount,
          totalRoyaltyEarned,
          totalEarnings
        };
      }).sort((a, b) => b.totalEarnings - a.totalEarnings);

      statsMap.set(p.id, {
        perfumes: detailedList,
        totalDesignFees,
        totalRoyalties,
        totalCombinedEarnings: totalDesignFees + totalRoyalties,
        totalBottlesSold
      });
    });

    return statsMap;
  }, [perfumers, perfumes, companies, perfumerCompanyMap]);

  // Aggregate sector stats
  const sectorAggregate = useMemo(() => {
    let totalDesignFees = 0;
    let totalRoyalties = 0;
    let totalBottles = 0;

    perfumerPerfumeStats.forEach((st) => {
      totalDesignFees += st.totalDesignFees;
      totalRoyalties += st.totalRoyalties;
      totalBottles += st.totalBottlesSold;
    });

    return { totalDesignFees, totalRoyalties, totalBottles };
  }, [perfumerPerfumeStats]);

  const selectedStats = perfumerPerfumeStats.get(selectedPerfumer.id) || {
    perfumes: [],
    totalDesignFees: 0,
    totalRoyalties: 0,
    totalCombinedEarnings: 0,
    totalBottlesSold: 0
  };

  const selectedCompany = perfumerCompanyMap.get(selectedPerfumer.id);
  const isSelectedActiveForPlayer = playerPerfumer.id === selectedPerfumer.id;

  // Recent transactions related to this perfumer from company financial histories
  const perfumerRecentTransactions = useMemo(() => {
    const list: {
      id: string;
      timestamp: number;
      companyName: string;
      companyLogo: string;
      type: 'royalty' | 'design_fee';
      amount: number;
      description: string;
    }[] = [];

    companies.forEach((comp) => {
      (comp.financialHistory || []).forEach((rec) => {
        const isRoyalty = rec.category === 'perfumer_royalty' && rec.description?.includes(selectedPerfumer.name);
        const isDesignFee = rec.category === 'rnd_design_fee' && rec.description?.includes(selectedPerfumer.name);

        if (isRoyalty || isDesignFee) {
          list.push({
            id: rec.id,
            timestamp: rec.timestamp,
            companyName: comp.name,
            companyLogo: comp.logo,
            type: isRoyalty ? 'royalty' : 'design_fee',
            amount: rec.amount,
            description: rec.description
          });
        }
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [companies, selectedPerfumer]);

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER BANNER: ÇALIŞANLAR MERKEZİ */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-purple-400" />
              Küresel İnsan Kaynakları, Uzman Kadro &amp; Bonus Rehberi
            </div>
            <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
              👥 Çalışanlar: Parfümatörler, Reklamcılar &amp; Satış Temsilcileri (Tüm Bonuslarıyla)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Sektördeki tüm <strong>🧪 Parfümatörleri</strong> (Random 3 Koku Ailesi Bonusu: +%8 / +%16 / +%24 ekstra satış fiyat farkı), <strong>📢 Reklamcıları</strong> (reklam gücü ve +%8 ülke uzmanlığı bonusları) ve <strong>🗣️ Satış Temsilcilerini</strong> (ikna gücü fiyat primi, +%10 ülke uzmanlığı ve ⚡ ortak ülke sinerji bonusları) tek sayfada inceleyin, eğitin veya şirketinize transfer edin.
            </p>
          </div>

          {/* Aggregate Summary Pills */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="bg-slate-950 px-3.5 py-2 rounded-2xl border border-purple-500/30">
              <div className="text-[10px] text-purple-300 uppercase font-bold">🧪 Parfümatörler</div>
              <div className="text-sm font-bold font-mono text-white">{perfumers.length} Usta Burun</div>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-2xl border border-amber-500/30">
              <div className="text-[10px] text-amber-300 uppercase font-bold">📢 Reklamcılar</div>
              <div className="text-sm font-bold font-mono text-white">
                {allAdSpecialistsList.length} Reklam Direktörü
              </div>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-2xl border border-indigo-500/30">
              <div className="text-[10px] text-indigo-300 uppercase font-bold">🗣️ Temsilciler</div>
              <div className="text-sm font-bold font-mono text-white">
                {allSalesRepsList.length} Satış Direktörü
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setEmployeeTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              employeeTab === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            📋 Tüm Çalışanlar &amp; Bonus Tabloları (Hepsi)
          </button>
          <button
            type="button"
            onClick={() => setEmployeeTab('perfumers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              employeeTab === 'perfumers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-950 text-purple-300 hover:bg-slate-800 border border-purple-500/30'
            }`}
          >
            🧪 Parfümatörler ({perfumers.length})
          </button>
          <button
            type="button"
            onClick={() => setEmployeeTab('ad_specialists')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              employeeTab === 'ad_specialists'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-amber-300 hover:bg-slate-800 border border-amber-500/30'
            }`}
          >
            📢 Reklamcılar ({allAdSpecialistsList.length})
          </button>
          <button
            type="button"
            onClick={() => setEmployeeTab('sales_reps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              employeeTab === 'sales_reps'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-indigo-300 hover:bg-slate-800 border border-indigo-500/30'
            }`}
          >
            🗣️ Satış Temsilcileri ({allSalesRepsList.length})
          </button>
          <button
            type="button"
            onClick={() => setEmployeeTab('synergy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              employeeTab === 'synergy'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-emerald-300 hover:bg-slate-800 border border-emerald-500/30'
            }`}
          >
            ⚡ Ortak Ülke Sinerjisi (Reklamcı + Temsilci)
          </button>
        </div>
      </div>

      {/* ================= TOPLU BONUS TABLOLARI: PARFÜMATÖRLER + REKLAMCILAR + SATIŞ TEMSİLCİLERİ TEK EKRANDA ================= */}
      {employeeTab === 'all' && (
        <div className="space-y-6">
          {/* 1. TÜM PARFÜMATÖRLER BONUS TABLOSU */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-purple-400" />
                  <span>1. 🧪 Tüm Parfümatörler ve Random 3 Koku Ailesi Bonusları ({perfumers.length} Usta)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Eski bonuslar kaldırıldı: Her parfümatör Koku Çarkı&apos;ndaki 10 ana aileden <strong>Random 3 Koku Ailesi Bonusu (1 Aile: +%8 • 2 Aile: +%16 • 3 Aile: +%24)</strong> taşır:
                </p>
              </div>
              <button
                type="button"
                onClick={rerollPerfumerFamilies}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md"
              >
                🎲 Random 3 Aile Bonuslarını Yeniden Dağıt
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <th className="py-3 px-4">Parfümatör &amp; Unvan</th>
                    <th className="py-3 px-3">Çalıştığı Şirket</th>
                    <th className="py-3 px-3">🎡 Random 3 Koku Ailesi Bonusu (Her Aile +%8)</th>
                    <th className="py-3 px-3">🌍 Aynı Aile Bonusuna Sahip Ülkeler</th>
                    <th className="py-3 px-3 text-center">💰 Aile Uyum Fiyat Farkı</th>
                    <th className="py-3 px-3 text-center">Nota / Trend / AR-GE</th>
                    <th className="py-3 px-3 text-center">İmza &amp; Telif</th>
                    <th className="py-3 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {perfumers.map((p) => {
                    const assigned = perfumerCompanyMap.get(p.id);
                    const isPlayerPerf = p.id === playerPerfumer.id;
                    const pFamilies = p.bonusFamilies || ['Narenciye', 'Çiçeksi', 'Odunsu'];
                    const matchingCountries = GLOBAL_MARKET_COUNTRIES.filter((c) =>
                      (c.bonusFamilies || []).some((cf) => pFamilies.includes(cf))
                    );
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isPlayerPerf ? 'bg-purple-950/25' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-purple-300 font-semibold">
                            {p.role}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {assigned ? (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-bold text-[11px]">
                              {assigned.logo} {assigned.name} {isPlayerPerf ? '(Siz)' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">Bağımsız / Boşta</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1.5">
                            {pFamilies.map((fam) => {
                              const meta = getFamilyMeta(fam);
                              return (
                                <span
                                  key={fam}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold ${meta.badgeClass}`}
                                >
                                  <span>{meta.emoji}</span>
                                  <span>{meta.name}</span>
                                  <span className="font-mono opacity-90">+%8</span>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {matchingCountries.map((c) => {
                              const overlapCount = (c.bonusFamilies || []).filter((cf) =>
                                pFamilies.includes(cf)
                              ).length;
                              return (
                                <span
                                  key={c.id}
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold"
                                >
                                  {c.flag} {c.name} ({overlapCount} ortak aile)
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                            +%8 / +%16 / +%24
                          </span>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            1 / 2 / 3 Aile Eşleşmesi
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px]">
                          <span className="text-amber-300 font-bold">{p.noteHarmony}</span> /{' '}
                          <span className="text-blue-300 font-bold">{p.trendFit}</span> /{' '}
                          <span className="text-purple-300 font-bold">{p.rdLevel}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px]">
                          <div className="text-white font-bold">
                            {p.designFee.toLocaleString('tr-TR')} ₺
                          </div>
                          <div className="text-amber-400 text-[10px]">
                            %{(p.royaltyRate * 100).toFixed(1)} Telif
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPlayerPerf ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              ✓ Görevde
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => assignPerfumerToPlayerCompany(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Şirkete Ata
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. TÜM REKLAMCILAR BONUS TABLOSU */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  <span>
                    2. 📢 Tüm Reklamcılar ve Verdikleri Bonuslar ({allAdSpecialistsList.length} Reklam Direktörü)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Reklamcılar kampanya şöhretini artırır, uzman ülkelerinde <strong>+%8 Satış/Reklam Bonusu</strong> verir ve Satış Temsilcinizle aynı ülkede eşleşirse <strong>⚡ +%35 Reklam Gücü &amp; Satış Sinerjisi</strong> açar:
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={rerollStaffBonuses}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
                >
                  🎲 20 Reklamcı &amp; 20 Temsilci Ülke/Güç Bonuslarını Karıştır
                </button>
                <button
                  type="button"
                  onClick={trainAdSpecialist}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                >
                  📢 Aktif Reklamcıyı Eğit (+6 Güç • 70.000 ₺)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <th className="py-3 px-4">Reklamcı &amp; Unvan</th>
                    <th className="py-3 px-3">Durumu / Şirketi</th>
                    <th className="py-3 px-3 text-center">📢 Reklam Gücü</th>
                    <th className="py-3 px-3 text-center">Kampanya Çarpanı</th>
                    <th className="py-3 px-3">🌍 Uzman Olduğu Ülkeler (📢 +%8 Bonus)</th>
                    <th className="py-3 px-3 text-center">⚡ Temsilcinizle Sinerji</th>
                    <th className="py-3 px-4 text-right">Transfer / Eğitim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allAdSpecialistsList.map(({ specialist, company, isTransferCandidate, hiringCost }) => {
                    const playerRep = getCompanySalesRep(playerCompany);
                    const playerRepCountries = playerRep.specialtyCountries.map((c) =>
                      normalizeCountryName(c)
                    );
                    const matchedSynergyCountries = specialist.specialtyCountries.filter((c) =>
                      playerRepCountries.includes(normalizeCountryName(c))
                    );
                    const isPlayersActive = getCompanyAdSpecialist(playerCompany).id === specialist.id;
                    const powerBonusPct = Math.round(Math.max(0, (specialist.adPower - 50) * 0.5) + 15);

                    return (
                      <tr
                        key={specialist.id}
                        className={`transition-colors ${
                          isPlayersActive ? 'bg-amber-950/25' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{specialist.avatar}</span>
                            <div>
                              <div className="font-bold text-white">{specialist.name}</div>
                              <div className="text-[10px] text-amber-300">{specialist.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {company ? (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-bold text-[11px]">
                              {company.logo} {company.name} {company.isPlayer ? '(Siz)' : ''}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                              🌟 Transfer Adayı
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                            {specialist.adPower} / 100
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                          +%{powerBonusPct} Şöhret Etkisi
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {specialist.specialtyCountries.map((cName) => (
                              <span
                                key={cName}
                                className="px-2 py-0.5 rounded bg-slate-950 border border-amber-500/30 text-amber-200 text-[10px] font-bold"
                              >
                                {getCountryFlag(cName)} {cName} (+%8)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {matchedSynergyCountries.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {matchedSynergyCountries.map((mc) => (
                                <span
                                  key={mc}
                                  className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-[10px]"
                                >
                                  ⚡ {getCountryFlag(mc)} {mc}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Eşleşme Yok</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {isPlayersActive ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              ✓ Şirketinizde Görevde
                            </span>
                          ) : isTransferCandidate ? (
                            <button
                              type="button"
                              disabled={playerCompany.cash < hiringCost}
                              onClick={() => hireAdSpecialist(specialist.id)}
                              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-[10px] cursor-pointer"
                            >
                              Transfer Et ({(hiringCost / 1000).toFixed(0)}B ₺)
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Rakip Kadroda</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. TÜM SATIŞ TEMSİLCİLERİ BONUS TABLOSU */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <span>
                    3. 🗣️ Tüm Satış Temsilcileri ve Verdikleri Bonuslar ({allSalesRepsList.length} Satış Direktörü)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Satış Temsilcileri tüm satışlarda <strong>+%28&apos;e kadar İkna Fiyat Primi</strong>, uzman olduğu ülkelerde ekstra <strong>🎯 +%10 Ülke Satış Bonusu</strong> ve Reklamcınızla aynı ülkede <strong>⚡ Ortak Ülke Sinerjisi</strong> sağlar:
                </p>
              </div>
              <button
                type="button"
                onClick={trainSalesRep}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                🗣️ Aktif Temsilciyi Eğit (+6 İkna • 75.000 ₺)
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <th className="py-3 px-4">Satış Temsilcisi &amp; Unvan</th>
                    <th className="py-3 px-3">Durumu / Şirketi</th>
                    <th className="py-3 px-3 text-center">🗣️ İkna Gücü</th>
                    <th className="py-3 px-3 text-center">💰 İkna Fiyat Bonusu</th>
                    <th className="py-3 px-3">🎯 Uzman Olduğu Ülkeler (+%10 Bonus)</th>
                    <th className="py-3 px-3 text-center">⚡ Reklamcınızla Sinerji</th>
                    <th className="py-3 px-4 text-right">Transfer / Eğitim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allSalesRepsList.map(({ rep, company, isTransferCandidate, hiringCost }) => {
                    const playerAdSpec = getCompanyAdSpecialist(playerCompany);
                    const playerAdCountries = playerAdSpec.specialtyCountries.map((c) =>
                      normalizeCountryName(c)
                    );
                    const matchedSynergyCountries = rep.specialtyCountries.filter((c) =>
                      playerAdCountries.includes(normalizeCountryName(c))
                    );
                    const isPlayersActive = getCompanySalesRep(playerCompany).id === rep.id;
                    const persuasionPriceBonusPct = Math.round((rep.persuasion || 55) * 0.28);

                    return (
                      <tr
                        key={rep.id}
                        className={`transition-colors ${
                          isPlayersActive ? 'bg-indigo-950/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{rep.avatar}</span>
                            <div>
                              <div className="font-bold text-white">{rep.name}</div>
                              <div className="text-[10px] text-indigo-300">{rep.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {company ? (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-bold text-[11px]">
                              {company.logo} {company.name} {company.isPlayer ? '(Siz)' : ''}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                              🌟 Transfer Adayı
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold">
                            {rep.persuasion} / 100
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                          +%{persuasionPriceBonusPct} Birim Fiyat
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {rep.specialtyCountries.map((cName) => (
                              <span
                                key={cName}
                                className="px-2 py-0.5 rounded bg-slate-950 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold"
                              >
                                {getCountryFlag(cName)} {cName} (+%10)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {matchedSynergyCountries.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {matchedSynergyCountries.map((mc) => (
                                <span
                                  key={mc}
                                  className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-[10px]"
                                >
                                  ⚡ {getCountryFlag(mc)} {mc}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Eşleşme Yok</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {isPlayersActive ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              ✓ Şirketinizde Görevde
                            </span>
                          ) : isTransferCandidate ? (
                            <button
                              type="button"
                              disabled={playerCompany.cash < hiringCost}
                              onClick={() => hireSalesRep(rep.id)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Transfer Et ({(hiringCost / 1000).toFixed(0)}B ₺)
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Rakip Kadroda</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAYLI PARFÜMATÖR KARTLARI BÖLÜMÜ */}
      {(employeeTab === 'all' || employeeTab === 'perfumers') && (
        <div className="space-y-6">
          {/* 4 PERFUMERS GRID CARDS (CLICK TO INSPECT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {perfumers.map((p) => {
          const isSelected = p.id === selectedPerfumerId;
          const isPlayerPerf = p.id === playerPerfumer.id;
          const assigned = perfumerCompanyMap.get(p.id);
          const pStats = perfumerPerfumeStats.get(p.id);

          return (
            <div
              key={p.id}
              onClick={() => setSelectedPerfumerId(p.id)}
              className={`rounded-3xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xl relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-950/50 via-slate-900 to-slate-950 border-purple-500 shadow-purple-950/40 ring-2 ring-purple-500/50 scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Active Badge */}
              <div className="flex items-center justify-between gap-1 mb-3">
                {isPlayerPerf ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono">
                    👑 AKTİF BURUNUNUZ
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1">
                    <span>{assigned?.logo || '🏢'}</span> {assigned?.name || 'Bağımsız'}
                  </span>
                )}

                <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/80 px-2 py-0.5 rounded-lg border border-purple-800/60">
                  %{p.royaltyRate * 100} Telif
                </span>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3.5 mb-4">
                <PerfumerAvatar
                  type={p.avatarType || p.id}
                  size="lg"
                  className={`border-2 shadow-lg shrink-0 transition-transform duration-200 ${
                    isSelected ? 'border-purple-400 scale-105' : 'border-slate-700'
                  }`}
                />
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white tracking-tight truncate font-serif">
                    {p.name}
                  </h3>
                  <div className="text-xs text-purple-300 truncate">
                    {p.role}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    İmza Ücreti: <strong className="text-white">{p.designFee.toLocaleString('tr-TR')} ₺</strong>
                  </div>
                </div>
              </div>

              {/* Core Skill Bars Mini */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-slate-950/90 border border-slate-800/80 text-center mb-3">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Nota</div>
                  <div className="text-xs font-bold font-mono text-amber-300 mt-0.5">{p.noteHarmony}/10</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">Trend</div>
                  <div className="text-xs font-bold font-mono text-blue-300 mt-0.5">{p.trendFit}/10</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-semibold">AR-GE</div>
                  <div className="text-xs font-bold font-mono text-purple-300 mt-0.5">{p.rdLevel}/10</div>
                </div>
              </div>

              {/* Random 3 Family Bonuses */}
              <div className="space-y-2 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-purple-500/30">
                <div className="flex justify-between items-center pb-1 border-b border-slate-800/60">
                  <span className="text-purple-300 font-bold text-[10px] uppercase tracking-wider">
                    🎡 Random 3 Aile Bonusu
                  </span>
                  <span className="font-mono font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 text-[10px] shrink-0">
                    +%8 / +%16 / +%24
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 py-0.5">
                  {(p.bonusFamilies || ['Narenciye', 'Çiçeksi', 'Odunsu']).map((fam) => {
                    const meta = getFamilyMeta(fam);
                    return (
                      <span
                        key={fam}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${meta.badgeClass}`}
                      >
                        <span>{meta.emoji}</span>
                        <span>{meta.name}</span>
                        <span className="font-mono opacity-90">+%8</span>
                      </span>
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-400">
                  Parfüm formülünde bu 3 aileden esans oldukça ekstra satış fiyat farkı verir.
                </div>
              </div>

              {/* Earnings summary pill */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Toplam Hasılat:</span>
                <span className="font-mono font-bold text-amber-300">
                  {(pStats?.totalCombinedEarnings || 0).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DETAILED INSPECTION OF SELECTED PERFUMER ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-7">
        
        {/* Top Profile Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-4">
            <PerfumerAvatar
              type={selectedPerfumer.avatarType || selectedPerfumer.id}
              size="lg"
              className="border-2 border-purple-500 shadow-xl shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {isSelectedActiveForPlayer ? (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    AromaLux Baş Parfümörü (Sizin Burununuz)
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <span>{selectedCompany?.logo}</span> {selectedCompany?.name || 'Rakip Şirket'} Baş Parfümörü
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-950 text-indigo-300 border border-slate-800">
                  {selectedStats.perfumes.length} Formül İmzası
                </span>
              </div>

              <h2 className="text-2xl font-bold font-serif text-white">
                {selectedPerfumer.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {selectedPerfumer.bio}
              </p>
            </div>
          </div>

          {/* Action: Hire / Assign to Player Company */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!isSelectedActiveForPlayer && (
              <button
                onClick={() => assignPerfumerToPlayerCompany(selectedPerfumer.id)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>AromaLux'a Baş Burun Olarak Ata</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('rnd')}
              className="px-4 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <span>AR-GE Laboratuvarına Git</span>
            </button>
          </div>
        </div>

        {/* 2 PANELS: YETENEKLER & BONUSLAR + FİNANSAL PARAMETRELER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sol Panel: 3 Ustalık Yeteneği & 3 Operasyonel Bonus */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Mesleki Yetkinlikler & Operasyonel Primler
            </h3>

            {/* 3 Skill Bars */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Nota Uyumu (Harmony):
                  </span>
                  <span className="font-mono font-bold text-amber-400">{selectedPerfumer.noteHarmony} / 10</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedPerfumer.noteHarmony / 10) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Koku piramidinde tepe, kalp ve dip notalarının birbiriyle pürüzsüz rezonans kurma yeteneği.
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Trend Uyumu (Trend Fit):
                  </span>
                  <span className="font-mono font-bold text-blue-400">{selectedPerfumer.trendFit} / 10</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedPerfumer.trendFit / 10) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Küresel pazarlardaki anlık tüketici talepleri ve popüler koku ailelerini yakalama becerisi.
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-purple-400" /> AR-GE İnovasyon Seviyesi:
                  </span>
                  <span className="font-mono font-bold text-purple-400">{selectedPerfumer.rdLevel} / 10</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(selectedPerfumer.rdLevel / 10) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Laboratuvarda yeni formül sentezlerken Nadir ve Efsanevi kalite seviyesine ulaşma şansı.
                </div>
              </div>
            </div>

            {/* Random 3 Family Bonuses Grid */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold uppercase tracking-wider text-purple-300">
                  🎡 Parfümatörün Random 3 Koku Ailesi Bonusu
                </span>
                <span className="font-mono font-bold text-amber-300">
                  1 Aile: +%8 • 2 Aile: +%16 • 3 Aile: +%24
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {(selectedPerfumer.bonusFamilies || ['Narenciye', 'Çiçeksi', 'Odunsu']).map((fam, idx) => {
                  const meta = getFamilyMeta(fam);
                  return (
                    <div
                      key={fam}
                      className={`p-2.5 rounded-xl border ${meta.badgeClass}`}
                    >
                      <div className="text-base">{meta.emoji}</div>
                      <div className="text-xs font-bold mt-0.5">{meta.name}</div>
                      <div className="text-[10px] font-mono font-bold mt-0.5">
                        +%8 ({idx + 1}. Aile)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ Panel: Finansal Koşullar & Toplam Kazanç Dağılımı */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Sözleşme Koşulları & Kümülatif Parfümatör Kazancı
              </h3>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Tek Seferlik Tasarım Ücreti</div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {selectedPerfumer.designFee.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Yeni AR-GE formülü başına</div>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Satış Telif Oranı (Royalty)</div>
                  <div className="text-lg font-bold font-mono text-purple-400 mt-1">
                    %{(selectedPerfumer.royaltyRate * 100).toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">İhracat brüt cirosundan</div>
                </div>
              </div>

              {/* Kazanç Dökümü Özeti */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Toplam AR-GE Tasarım Kazancı:</span>
                  <span className="font-mono text-white font-bold">
                    +{selectedStats.totalDesignFees.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Toplam İhracat Satış Telifi:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    +{selectedStats.totalRoyalties.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Toplam Satılan Şişe Adedi:</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {selectedStats.totalBottlesSold.toLocaleString('tr-TR')} şişe
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-slate-200">Parfümatörün Toplam Kazancı:</span>
                  <span className="font-mono text-emerald-400">
                    +{selectedStats.totalCombinedEarnings.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl text-[11px] text-purple-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Telif Sistemi Nasıl İşler:</strong> Bu parfümatörün icat ettiği AR-GE formülleri küresel siparişlere teslim edildikçe, brüt satış tutarından %{(selectedPerfumer.royaltyRate * 100).toFixed(1)} pay otomatik düşülerek parfümatörün telif hesabına kaydedilir.
              </span>
            </div>
          </div>

        </div>

        {/* ================= DETAYLI PARFÜM TABLOSU: HANGİ PARFÜMDEN NE KADAR KAZANDI ================= */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                {selectedPerfumer.name} Tarafından Tasarlanan Parfümler & Telif Gelirleri
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Aşağıdaki tabloda bu ustanın geliştirdiği tüm parfümler, alınan peşin tasarım ücreti, satış telif oranı ve kümülatif kazancı listelenmektedir.
              </p>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Toplam <strong className="text-white">{selectedStats.perfumes.length}</strong> Parfüm Formülü
            </span>
          </div>

          {selectedStats.perfumes.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <th className="py-3 px-4">Parfüm & Marka</th>
                    <th className="py-3 px-3">Türü & Cinsiyet</th>
                    <th className="py-3 px-3">Üreten Şirket</th>
                    <th className="py-3 px-3">Piyasa Satış</th>
                    <th className="py-3 px-3">Tasarım Ücreti</th>
                    <th className="py-3 px-3">Telif Oranı</th>
                    <th className="py-3 px-3">Satılan Şişe</th>
                    <th className="py-3 px-3 text-right">Telif Geliri</th>
                    <th className="py-3 px-4 text-right">Toplam Parfümatör Kazancı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {selectedStats.perfumes.map(({ perfume, producingCompany, totalSold, lastSalePrice, designFeeEarned, royaltyRate, totalRoyaltyEarned, totalEarnings }) => {
                    const isRnd = perfume.sourceType === 'AR-GE';

                    return (
                      <tr key={perfume.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Perfume Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                              <img src={perfume.image} alt={perfume.name} className="w-full h-full object-cover" />
                              {isRnd && (
                                <span className="absolute bottom-0 inset-x-0 bg-purple-600 text-[7px] font-black text-white text-center leading-tight">
                                  AR-GE
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span>{perfume.name}</span>
                                {isRnd && (
                                  <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white shadow-sm border border-purple-400/50">
                                    AR-GE
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{perfume.brand}</div>
                            </div>
                          </div>
                        </td>

                        {/* Source Type & Gender */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit flex items-center gap-1 ${
                              isRnd
                                ? 'bg-purple-600 text-white border border-purple-400 shadow-sm'
                                : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                            }`}>
                              {isRnd ? '🔬 AR-GE' : perfume.sourceType}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{perfume.gender}</span>
                          </div>
                        </td>

                        {/* Producing Company */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <span>{producingCompany?.logo || '🏢'}</span>
                            <span>{producingCompany?.name || 'AromaLux'}</span>
                          </div>
                        </td>

                        {/* Sale Price */}
                        <td className="py-3 px-3 font-mono font-semibold text-amber-300">
                          {lastSalePrice} ₺
                        </td>

                        {/* Design Fee */}
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {designFeeEarned > 0 ? (
                            <span className="text-purple-300 font-bold">+{designFeeEarned.toLocaleString('tr-TR')} ₺</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Royalty Rate */}
                        <td className="py-3 px-3 font-mono text-xs">
                          {royaltyRate > 0 ? (
                            <span className="text-amber-400 font-bold">%{(royaltyRate * 100).toFixed(1)}</span>
                          ) : (
                            <span className="text-slate-500">%0 (Klasik)</span>
                          )}
                        </td>

                        {/* Total Sold */}
                        <td className="py-3 px-3 font-mono text-indigo-300 font-semibold">
                          {totalSold > 0 ? `${totalSold.toLocaleString('tr-TR')} adet` : '0'}
                        </td>

                        {/* Total Royalty Earned */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                          {totalRoyaltyEarned > 0 ? `+${totalRoyaltyEarned.toLocaleString('tr-TR')} ₺` : '0 ₺'}
                        </td>

                        {/* Combined Total */}
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                          +{totalEarnings.toLocaleString('tr-TR')} ₺
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 p-8 rounded-2xl text-center text-xs text-slate-400">
              Bu parfümatöre kayıtlı henüz bir parfüm bulunmuyor. AR-GE sekmesinden yeni formül tasarlayarak bu ustanın imzasını ekleyebilirsiniz.
            </div>
          )}
        </div>

        {/* ================= CANLI FİNANSAL TELİF İŞLEM GEÇMİŞİ ================= */}
        {perfumerRecentTransactions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              {selectedPerfumer.name} Adına Yapılan Son Finansal Ödemeler
            </h3>

            <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              {perfumerRecentTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tx.companyLogo}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{tx.description}</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                          tx.type === 'royalty'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}>
                          {tx.type === 'royalty' ? 'Satış Telifi' : 'Tasarım Ücreti'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {tx.companyName} • {new Date(tx.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-amber-400 text-sm">
                    +{tx.amount.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      </div>
      )}

      {/* ================= ⚡ ORTAK ÜLKE SİNERJİ MERKEZİ (REKLAMCI + SATIŞ TEMSİLCİSİ AYNI ÜLKE = REKLAM GÜCÜ & SATIŞ GÜCÜ) ================= */}
      {(employeeTab === 'all' || employeeTab === 'synergy') && (
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              Reklamcı Kartı + Satış Temsilcisi Kartı Ortak Ülke Sinerjisi
            </div>
            <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2.5 flex-wrap">
              <span>⚡ Ortak Ülkelerde Süper Reklam Gücü & Satış Gücü</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                Aynı Ülke = Çifte Sinerji Bonusu
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed">
              <strong>Reklamcılar</strong> ülke reklamlarını yönetir, <strong>Satış Temsilcileri</strong> sipariş satışlarını bağlar. Şirketinizin <strong>Reklamcısı ile Satış Temsilcisinde aynı ülke varsa</strong>, o ülkede <strong>⚡ Ortak Ülke Sinerjisi</strong> doğar: O ülkedeki <strong>Reklam Gücü +%35 artar (+%14 ekstra reklam primi & 2x kalıcı ülke bonusu)</strong> ve yapılan her satışta <strong>Satış Gücü ekstra +%15 ile +%24 arasında Sinerji Fiyat Primi</strong> kazanır!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shrink-0 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Sinerji Ülkesinde Reklam & Satış Yap</span>
          </button>
        </div>

        {/* 4 Şirketin Reklamcı + Satış Temsilcisi Ortak Ülke Sinerji Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {companies.map((comp) => {
            const adSpec = getCompanyAdSpecialist(comp);
            const salesRep = getCompanySalesRep(comp);
            const synergyCountries = getCompanySynergyCountries(comp);
            const synergySalesPct = Math.round(((adSpec.adPower + salesRep.persuasion) / 2) * 0.25);

            return (
              <div
                key={comp.id}
                className={`rounded-2xl border p-4 space-y-3 ${
                  comp.isPlayer
                    ? 'bg-slate-950/90 border-amber-500/50 ring-1 ring-amber-500/20'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{comp.logo}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{comp.name}</span>
                        {comp.isPlayer && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                            SİZ
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {synergyCountries.length} Ortak Sinerji Ülkesi
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold">
                    ⚡ +%{synergySalesPct} Sinerji
                  </span>
                </div>

                {/* Reklamcı + Satış Temsilcisi İkilisi */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
                    <div className="text-[9px] uppercase font-bold text-amber-300">📢 Reklamcı</div>
                    <div className="font-bold text-white truncate mt-0.5">
                      {adSpec.avatar} {adSpec.name}
                    </div>
                    <div className="font-mono text-[10px] text-amber-200">
                      Güç: {adSpec.adPower}/100
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25">
                    <div className="text-[9px] uppercase font-bold text-indigo-300">🗣️ Temsilci</div>
                    <div className="font-bold text-white truncate mt-0.5">
                      {salesRep.avatar} {salesRep.name}
                    </div>
                    <div className="font-mono text-[10px] text-indigo-200">
                      İkna: {salesRep.persuasion}/100
                    </div>
                  </div>
                </div>

                {/* Eşleşen Ortak Ülkeler */}
                <div>
                  <div className="text-[10px] font-bold uppercase text-emerald-300 mb-1.5 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Aynı Ülke Sinerjisi (Reklam + Satış Gücü):</span>
                  </div>
                  {synergyCountries.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {synergyCountries.map((cName) => {
                        const details = getCountrySynergyDetails(comp, cName);
                        return (
                          <span
                            key={cName}
                            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-emerald-400/50 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            <span>⚡ {getCountryFlag(cName)} {cName}</span>
                            <span className="font-mono text-emerald-300 text-[10px]">
                              (+%{Math.round(details.totalCountrySynergyRate * 100)} Toplam Güç)
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic bg-slate-900 p-2 rounded-xl border border-slate-800">
                      Ortak ülke yok — Aynı ülkeye sahip Reklamcı veya Temsilci transfer ederek sinerji açın!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* ================= 📢 KÜRESEL REKLAMCI KARTLARI (REKLAM DİREKTÖRLERİ & TRANSFER BORSASI) ================= */}
      {(employeeTab === 'all' || employeeTab === 'ad_specialists') && (
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/25 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Megaphone className="w-4 h-4" />
              Küresel Reklamcı Kartları & Reklam Gücü Merkezi
            </div>
            <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2 flex-wrap">
              <span>📢 Şirket Reklam Direktörleri & Elit Reklamcı Transferi</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Reklamcılar Reklam Yapar • Ülke Bonusu & Şöhret Üretir
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Her şirketin <strong>Reklamcısı</strong> küresel reklam kampanyalarını yürütür. <strong>Reklam Gücü (1–100)</strong> kampanyaların kazandırdığı şöhreti ve ülke bonusunu artırır. Uzman olduğu ülkelerde ekstra <strong>📢 +%8 Ülke Bonusu</strong> verir; <strong>Satış Temsilcinizle aynı ülkede eşleşirse ⚡ Ortak Ülke Reklam + Satış Gücü Sinerjisi</strong> patlar!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={trainAdSpecialist}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Reklamcıya Eğitim Ver (+6 Reklam Gücü • 70.000 ₺)</span>
            </button>
          </div>
        </div>

        {/* 1. 4 ŞİRKETİN AKTİF REKLAMCI KARTLARI */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <span>Sektördeki 4 Şirketin Aktif Reklamcı Kartları</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {companies.map((comp) => {
              const adSpec = getCompanyAdSpecialist(comp);
              const salesRep = getCompanySalesRep(comp);
              const isUser = comp.isPlayer;
              const repCountriesNorm = salesRep.specialtyCountries.map((c) => normalizeCountryName(c));

              return (
                <div
                  key={comp.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-xl ${
                    isUser
                      ? 'bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top: Avatar & Company Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                          {adSpec.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                              <span>{comp.logo}</span>
                              <span>{comp.name}</span>
                            </span>
                            {isUser && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                                Siz
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white mt-1">{adSpec.name}</h4>
                          <div className="text-[11px] text-slate-400 leading-snug">{adSpec.title}</div>
                        </div>
                      </div>
                    </div>

                    {/* Ad Power Meter */}
                    <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">📢 Reklam Gücü</span>
                        <span className="font-mono font-bold text-amber-300">
                          {adSpec.adPower} / 100
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-300 transition-all duration-300"
                          style={{ width: `${adSpec.adPower}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-slate-400">Seviye {adSpec.level || 3} Reklamcı</span>
                        <span className="font-mono font-bold text-amber-300">
                          📢 +%8 Ülke Reklam Bonusu
                        </span>
                      </div>
                    </div>

                    {/* Specialty Countries & Synergy Badges */}
                    <div>
                      <div className="text-[10px] font-bold uppercase text-amber-300 mb-1.5">
                        🌍 Reklamcının Ülke Bonusları (⚡=Temsilci ile Ortak Sinerji):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {adSpec.specialtyCountries.map((cName) => {
                          const isSynergy = repCountriesNorm.includes(normalizeCountryName(cName));
                          return (
                            <span
                              key={cName}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                                isSynergy
                                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200 shadow-sm'
                                  : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                              }`}
                              title={
                                isSynergy
                                  ? `⚡ Satış Temsilcisi ${salesRep.name} ile Ortak Ülke! O ülkede Reklam Gücü + Satış Gücü Sinerjisi Aktif!`
                                  : 'Reklamcı Uzman Ülkesi (+%8 Bonus)'
                              }
                            >
                              <span>{getCountryFlag(cName)}</span>
                              <span>{cName}</span>
                              {isSynergy && (
                                <span className="text-[9px] px-1 rounded bg-emerald-400 text-slate-950 font-black">
                                  ⚡ SİNERJİ
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Campaigns & Fame Generated Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] text-slate-400">Yaptığı Reklam</div>
                        <div className="font-mono font-bold text-white mt-0.5">
                          {adSpec.campaignsLaunched || 0} Kampanya
                        </div>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] text-slate-400">Kazandırdığı Şöhret</div>
                        <div className="font-mono font-bold text-amber-300 mt-0.5">
                          ⭐ +{adSpec.totalFameGenerated || 0} Puan
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    {isUser ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={adSpec.adPower >= 99 || playerCompany.cash < 70000}
                          onClick={trainAdSpecialist}
                          className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition-all cursor-pointer"
                        >
                          +6 Güç Eğit (70B ₺)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-[11px] shadow-md transition-all cursor-pointer"
                        >
                          📢 Reklam Yap
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-[11px] text-slate-400 font-medium py-1">
                        {comp.name} Aktif Reklam Direktörü
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. TRANSFER EDİLEBİLİR ELİT REKLAMCI KARTLARI */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Transfer Edilebilir Elit Küresel Reklamcı Kartları (⚡ Temsilcinizle Aynı Ülkeleri Seçin!)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {TRANSFERABLE_AD_SPECIALISTS.map((candidate) => {
              const currentAdId = getCompanyAdSpecialist(playerCompany).id;
              const playerRep = getCompanySalesRep(playerCompany);
              const playerRepCountries = playerRep.specialtyCountries.map((c) => normalizeCountryName(c));
              const isHired = currentAdId === candidate.id;
              const canAfford = playerCompany.cash >= candidate.hiringCost;

              return (
                <div
                  key={candidate.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-xl ${
                    isHired
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-2xl">
                          {candidate.avatar}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-400">
                            Elit Reklamcı • Seviye {candidate.level}
                          </span>
                          <h4 className="text-sm font-bold text-white">{candidate.name}</h4>
                          <div className="text-[10px] text-slate-400">{candidate.title}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">📢 Reklam Gücü:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {candidate.adPower}/100
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                          style={{ width: `${candidate.adPower}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">{candidate.bio}</p>

                    <div className="space-y-1">
                      <div className="text-[9px] font-bold uppercase text-slate-400">
                        Uzman Ülkeleri (⚡ = Temsilciniz {playerRep.name} ile Eşleşir):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.specialtyCountries.map((cName) => {
                          const matchesRep = playerRepCountries.includes(normalizeCountryName(cName));
                          return (
                            <span
                              key={cName}
                              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                                matchesRep
                                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                                  : 'bg-slate-900 border-slate-800 text-amber-300'
                              }`}
                            >
                              {matchesRep ? '⚡ ' : '📢 '}
                              {getCountryFlag(cName)} {cName}
                              {matchesRep ? ' (Sinerji!)' : ' (+%8)'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {candidate.hiringCost.toLocaleString('tr-TR')} ₺
                    </span>
                    {isHired ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                        ✓ Şirketinizde Görevde
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => hireAdSpecialist(candidate.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Transfer Et
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* ================= KÜRESEL SATIŞ TEMSİLCİLERİ & MÜZAKERE DİREKTÖRLERİ KARTLARI ================= */}
      {(employeeTab === 'all' || employeeTab === 'sales_reps') && (
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4" />
              Küresel Satış Temsilcileri & İkna Kabiliyeti Kartları
            </div>
            <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2 flex-wrap">
              <span>Şirket Satış Direktörleri & Transfer Borsası</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                4 Şirket Temsilcisi • {TRANSFERABLE_SALES_REPS.length} Elit Transfer Adayı (Toplam {allSalesRepsList.length})
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Her şirketin satış temsilcisi sahip olduğu <strong>İkna Kabiliyeti (1–100)</strong> sayesinde birim satış fiyatlarına <strong>+%28'e kadar İkna Primi</strong> ve uzman olduğu ülkelerdeki siparişlerde ekstra <strong>🎯 +%10 Ülke Uzmanlığı Bonusu</strong> ekler.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={trainSalesRep}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Temsilcinize İkna Eğitimi Ver (+6 İkna • 75.000 ₺)</span>
            </button>
          </div>
        </div>

        {/* 1. 4 ŞİRKETİN AKTİF SATIŞ TEMSİLCİSİ KARTLARI */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Sektördeki 4 Şirketin Aktif Satış Temsilcisi Kartları</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {companies.map((comp) => {
              const rep =
                comp.salesRep ||
                COMPANY_DEFAULT_SALES_REPS[comp.id] ||
                COMPANY_DEFAULT_SALES_REPS.aromalux;
              const isUser = comp.isPlayer;
              const persuasionBonusPct = Math.round((rep.persuasion || 55) * 0.28);

              return (
                <div
                  key={comp.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-xl ${
                    isUser
                      ? 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top: Avatar & Company Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                          {rep.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 flex items-center gap-1">
                              <span>{comp.logo}</span>
                              <span>{comp.name}</span>
                            </span>
                            {isUser && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                                Siz
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white mt-1">{rep.name}</h4>
                          <div className="text-[11px] text-slate-400 leading-snug">{rep.title}</div>
                        </div>
                      </div>
                    </div>

                    {/* Persuasion Meter */}
                    <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">🗣️ İkna Kabiliyeti</span>
                        <span className="font-mono font-bold text-amber-300">
                          {rep.persuasion} / 100
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-300"
                          style={{ width: `${rep.persuasion}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-slate-400">Seviye {rep.level || 3} Müzakereci</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +%{persuasionBonusPct} Satış Fiyat Bonusu
                        </span>
                      </div>
                    </div>

                    {/* Specialty Countries */}
                    <div>
                      <div className="text-[10px] font-bold uppercase text-indigo-300 mb-1.5">
                        🎯 Satış Temsilcisinin Ülke Bonusları (⚡=Reklamcı ile Ortak Sinerji):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rep.specialtyCountries.map((cName) => {
                          const compAdSpec = getCompanyAdSpecialist(comp);
                          const isSynergy = compAdSpec.specialtyCountries.some(
                            (ac) => normalizeCountryName(ac) === normalizeCountryName(cName)
                          );
                          return (
                            <span
                              key={cName}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                                isSynergy
                                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200 shadow-sm'
                                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200'
                              }`}
                              title={
                                isSynergy
                                  ? `⚡ Reklamcı ${compAdSpec.name} ile Ortak Ülke! O ülkede Reklam Gücü + Satış Gücü Sinerjisi Aktif!`
                                  : 'Satış Temsilcisi Uzman Ülkesi (+%10 Bonus)'
                              }
                            >
                              <span>{getCountryFlag(cName)}</span>
                              <span>{cName}</span>
                              {isSynergy && (
                                <span className="text-[9px] px-1 rounded bg-emerald-400 text-slate-950 font-black">
                                  ⚡ SİNERJİ
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deals & Bonus Revenue Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] text-slate-400">Bağlanan Satış</div>
                        <div className="font-mono font-bold text-white mt-0.5">
                          {rep.closedDeals || 0} Anlaşma
                        </div>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] text-slate-400">İkna Primi Geliri</div>
                        <div className="font-mono font-bold text-emerald-400 mt-0.5">
                          +{(rep.bonusRevenueGenerated || 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    {isUser ? (
                      <button
                        type="button"
                        disabled={rep.persuasion >= 99 || playerCompany.cash < 75000}
                        onClick={trainSalesRep}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>
                          {rep.persuasion >= 99
                            ? 'Maksimum İkna (99/100)'
                            : 'İkna Eğitimi Ver (+6 İkna • 75.000 ₺)'}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center text-[11px] text-slate-400 font-medium py-1">
                        {comp.name} Aktif Satış Direktörü
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. TRANSFER EDİLEBİLİR ELİT SATIŞ DİREKTÖRÜ KARTLARI */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Transfer Edilebilir Elit Küresel Satış Direktörü Kartları</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {TRANSFERABLE_SALES_REPS.map((candidate) => {
              const currentRepId =
                playerCompany.salesRep?.id ||
                COMPANY_DEFAULT_SALES_REPS[playerCompany.id]?.id;
              const isHired = currentRepId === candidate.id;
              const canAfford = playerCompany.cash >= candidate.hiringCost;
              const bonusPct = Math.round(candidate.persuasion * 0.28);

              return (
                <div
                  key={candidate.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all shadow-xl ${
                    isHired
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-2xl">
                          {candidate.avatar}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-400">
                            Elit Transfer • Seviye {candidate.level}
                          </span>
                          <h4 className="text-sm font-bold text-white">{candidate.name}</h4>
                          <div className="text-[10px] text-slate-400">{candidate.title}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">🗣️ İkna Gücü:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {candidate.persuasion}/100 (+%{bonusPct} Bonus)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                          style={{ width: `${candidate.persuasion}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">{candidate.bio}</p>

                    <div className="flex flex-wrap gap-1">
                      {candidate.specialtyCountries.map((cName) => {
                        const playerAdSpec = getCompanyAdSpecialist(playerCompany);
                        const matchesAd = playerAdSpec.specialtyCountries.some(
                          (ac) => normalizeCountryName(ac) === normalizeCountryName(cName)
                        );
                        return (
                          <span
                            key={cName}
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                              matchesAd
                                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-indigo-300'
                            }`}
                          >
                            {matchesAd ? '⚡ ' : '🎯 '}
                            {getCountryFlag(cName)} {cName}
                            {matchesAd ? ' (Reklamcıyla Sinerji!)' : ' (+%10)'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {candidate.hiringCost.toLocaleString('tr-TR')} ₺
                    </span>
                    {isHired ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                        ✓ Şirketinizde Görevde
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => hireSalesRep(candidate.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Transfer Et
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
