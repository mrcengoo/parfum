import React from 'react';
import { useGame } from '../../context/GameContext';
import { Company } from '../../types';
import { PerfumerCard } from '../common/PerfumerCard';
import {
  Building2,
  Coins,
  Layers,
  TrendingUp,
  FlaskRound,
  Package,
  Factory,
  ShieldCheck,
  Star,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const { companies, playerCompany, playerPerfumer, perfumersMap, setActiveTab, assignPerfumerToPlayerCompany } = useGame();

  const getCompanyValuation = (company: Company) => {
    const essenceVal = Object.values(company.essenceStorage).reduce(
      (sum, item) => sum + (item.totalCostBasis || 0),
      0
    );
    const productVal = Object.values(company.productStorage).reduce(
      (sum, item) => sum + (item.totalCostBasis || 0),
      0
    );
    return Math.round(company.cash + essenceVal + productVal);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            Sektör Analizi & Şirket Profilleri
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Parfüm Üretim Şirketleri & Baş Parfümörler
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Sektördeki 4 resmi üretici ve otomatik atanan baş parfümörleri. 
            Her şirket kendi parfümörünün AR-GE seviyesi, lojistik ve ihracat bonuslarından faydalanır.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <span className="text-amber-400 font-bold">Kayıtlı Üretici:</span> {companies.length} Şirket
        </div>
      </div>

      {/* AROMALUX PLAYER CARD */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/20 border-2 border-amber-500/40 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  Sizin Şirketiniz
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: aromalux</span>
              </div>
              <h3 className="text-2xl font-bold font-serif text-white mt-1">
                {playerCompany.name}
              </h3>
              <div className="text-xs text-purple-300 mt-1 font-semibold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Baş Parfümör: <strong>{playerPerfumer.name}</strong> ({playerPerfumer.role})
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('rnd')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Parfümör ile AR-GE Yap
            </button>
            <button
              onClick={() => setActiveTab('production')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Factory className="w-4 h-4" />
              Üretim Hattı
            </button>
          </div>
        </div>

        {/* AromaLux Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Nakit</div>
            <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
              {playerCompany.cash.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Toplam Değer</div>
            <div className="text-base font-bold font-mono text-indigo-300 mt-0.5">
              {getCompanyValuation(playerCompany).toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Toplam Gelir</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              +{playerCompany.totalRevenue.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Toplam Gider</div>
            <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
              -{playerCompany.totalExpenses.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Net Kâr (Marj)</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${playerCompany.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {playerCompany.netProfit >= 0 ? '+' : ''}{playerCompany.netProfit.toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-[10px] text-slate-500">%{playerCompany.profitMargin.toFixed(1)}</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Parfümör Bonusu</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 truncate">
              İhracat +%{(playerPerfumer.exportBonus * 100).toFixed(0)} | Fire %{(playerPerfumer.wasteBonus * 100).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* SECTOR PEERS WITH ASSIGNED PERFUMERS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          Piyasa Rakipleri & Atanmış Baş Parfümörler (Data-Driven Dağıtım)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies
            .filter((c) => !c.isPlayer)
            .map((comp) => {
              const compPerfumer = perfumersMap.get(comp.perfumerId);

              return (
                <div
                  key={comp.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800">{comp.logo}</span>
                        <div>
                          <h4 className="text-lg font-bold text-white">{comp.name}</h4>
                          <div className="text-xs text-slate-400">Rakip Parfümeri Evi</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Pazar Payı
                      </span>
                    </div>

                    {/* Assigned Perfumer info */}
                    {compPerfumer && (
                      <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                          <span>{compPerfumer.avatar}</span>
                          <span>Atanmış Baş Parfümör: {compPerfumer.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {compPerfumer.role} • AR-GE Seviyesi: {compPerfumer.rdLevel}/10
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          Lojistik: %{(compPerfumer.logisticsBonus * 100).toFixed(0)} | İhracat: +%{(compPerfumer.exportBonus * 100).toFixed(0)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div>
                      <div className="text-slate-500 text-[10px]">Nakit</div>
                      <div className="font-mono font-bold text-amber-300 text-xs">{comp.cash.toLocaleString('tr-TR')} ₺</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Net Kâr</div>
                      <div className="font-mono font-bold text-emerald-400 text-xs">+{comp.netProfit.toLocaleString('tr-TR')} ₺</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Kâr Marjı</div>
                      <div className="font-mono font-bold text-slate-200 text-xs">%{comp.profitMargin.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
};
