import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { FinancialRecord, FinancialCategory } from '../../types';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  DollarSign,
  PieChart,
  Layers,
  FileSpreadsheet,
  Award,
  Coins
} from 'lucide-react';

export const FinancePage: React.FC = () => {
  const { playerCompany, playerPerfumer } = useGame();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense' | 'royalties'>('all');

  const history = playerCompany.financialHistory || [];

  const filteredHistory = useMemo(() => {
    if (selectedFilter === 'all') return history;
    if (selectedFilter === 'royalties') {
      return history.filter((h) => h.category === 'perfumer_royalty' || (h.royaltyAmount && h.royaltyAmount > 0));
    }
    return history.filter((h) => h.type === selectedFilter);
  }, [history, selectedFilter]);

  // Aggregate category sums
  const financialTotals = useMemo(() => {
    let totalGrossSales = 0;
    let totalRoyaltiesPaid = 0;
    let totalRndDesignFees = 0;
    let totalSecretPurchases = 0;
    let totalPurchases = 0;

    history.forEach((record) => {
      if (record.category === 'product_sale') {
        totalGrossSales += record.amount;
      }
      if (record.category === 'perfumer_royalty') {
        totalRoyaltiesPaid += record.amount;
      }
      if (record.category === 'rnd_design_fee') {
        totalRndDesignFees += record.amount;
      }
      if (record.category === 'secret_recipe_purchase') {
        totalSecretPurchases += record.amount;
      }
      if (record.category === 'raw_material_purchase') {
        totalPurchases += record.amount;
      }
    });

    const netSalesIncome = totalGrossSales - totalRoyaltiesPaid;

    return {
      totalGrossSales,
      totalRoyaltiesPaid,
      netSalesIncome,
      totalRndDesignFees,
      totalSecretPurchases,
      totalPurchases
    };
  }, [history]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4" />
            Finansal Yönetim & Muhasebe Defteri
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Şirket Gelir Tablosu & ParfümATÖR Telif Dökümü
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Borsa alımları, gümrük vergileri, lojistik, üretim giderleri, ihracat satışları ve 
            <strong> ParfümATÖR satış telifleri (%2 - %4)</strong> ile AR-GE tasarım ücretlerinin şeffaf bilançosu.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="text-xs">
            <div className="text-slate-400">Şirket Kasası:</div>
            <div className="font-mono font-bold text-amber-300 text-lg">
              {playerCompany.cash.toLocaleString('tr-TR')} ₺
            </div>
          </div>
        </div>
      </div>

      {/* ROYALTY & SALES SPECIAL LEDGER BREAKDOWN (SECTION 6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-2xl shadow-lg">
          <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-1">
            1. PARFÜM SATIŞI (BRÜT GELİR)
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            +{financialTotals.totalGrossSales.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            İhracat siparişlerinden elde edilen toplam ciro
          </div>
        </div>

        <div className="bg-slate-900/80 border border-purple-500/30 p-4 rounded-2xl shadow-lg">
          <div className="text-[10px] text-purple-400 uppercase font-bold tracking-wider mb-1">
            2. PARFÜMATÖR TELİFİ (KESİNTİ)
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">
            -{financialTotals.totalRoyaltiesPaid.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {playerPerfumer.name} ve AR-GE telif hak sahiplerine aktarılan
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 p-4 rounded-2xl shadow-lg">
          <div className="text-[10px] text-amber-400 uppercase font-bold tracking-wider mb-1">
            3. NET SATIŞ GELİRİ (KASAYA GİREN)
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            +{financialTotals.netSalesIncome.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Telif kesintileri sonrası şirkette kalan net nakit
          </div>
        </div>
      </div>

      {/* OVERALL FINANCIAL SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Toplam Gelir</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            +{playerCompany.totalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-500 mt-1">İhracat Tahsilatları</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Toplam Gider</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            -{playerCompany.totalExpenses.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-500 mt-1">Hammadde + Vergi + Lojistik + Telif</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Kâr / Zarar</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${playerCompany.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {playerCompany.netProfit >= 0 ? '+' : ''}{playerCompany.netProfit.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs text-slate-500 mt-1">Dönem Net Faaliyet Kârı</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Kâr Marjı</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            %{playerCompany.profitMargin.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Gelir Üzerinden Kârlılık Oranı</div>
        </div>
      </div>

      {/* TRANSACTION LEDGER TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hareket Dökümü ({filteredHistory.length} İşlem)
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                selectedFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedFilter('income')}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                selectedFilter === 'income' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satışlar
            </button>
            <button
              onClick={() => setSelectedFilter('royalties')}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                selectedFilter === 'royalties' ? 'bg-purple-600 text-white font-bold' : 'text-purple-300 hover:text-white'
              }`}
            >
              Telifler
            </button>
            <button
              onClick={() => setSelectedFilter('expense')}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                selectedFilter === 'expense' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Giderler
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Tarih & Saat</th>
                <th className="px-4 py-3.5">İşlem Kategorisi</th>
                <th className="px-5 py-3.5">Açıklama & Ayrıntı</th>
                <th className="px-4 py-3.5 text-right">Tutar</th>
                <th className="px-5 py-3.5 text-right">Kasa Bakiyesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const isIncome = item.type === 'income';
                  const isRoyalty = item.category === 'perfumer_royalty';
                  const isRndFee = item.category === 'rnd_design_fee';
                  const isSecretPurchase = item.category === 'secret_recipe_purchase';
                  const dateStr = new Date(item.timestamp).toLocaleString('tr-TR');

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isRoyalty
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                              : isRndFee
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                              : isSecretPurchase
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                              : isIncome
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isRoyalty
                            ? 'PARFÜMATÖR TELİFİ'
                            : isRndFee
                            ? 'AR-GE TASARIM ÜCRETİ'
                            : isSecretPurchase
                            ? 'GİZLİ REÇETE DOSYASI'
                            : isIncome
                            ? 'PARFÜM SATIŞI'
                            : 'GİDER'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-200">
                        <div>{item.description}</div>
                        {item.grossSaleAmount && item.royaltyAmount !== undefined && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono flex items-center gap-2">
                            <span>Brüt: {item.grossSaleAmount.toLocaleString('tr-TR')} ₺</span>
                            <span>•</span>
                            <span className="text-purple-300">Telif: -{item.royaltyAmount.toLocaleString('tr-TR')} ₺</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">Net: {item.netSaleAmount?.toLocaleString('tr-TR')} ₺</span>
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3.5 font-mono font-bold text-right whitespace-nowrap ${
                        isRoyalty ? 'text-purple-300' : isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.amount > 0 ? (isIncome ? `+${item.amount.toLocaleString('tr-TR')} ₺` : `-${item.amount.toLocaleString('tr-TR')} ₺`) : '0 ₺'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-300 font-semibold text-right whitespace-nowrap">
                        {item.cashAfter.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-xs">
                    Kayıtlı finansal hareket bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
