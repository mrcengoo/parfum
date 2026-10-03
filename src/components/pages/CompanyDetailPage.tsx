import React, { useMemo } from 'react';
import { Company, Perfume, Perfumer } from '../../types';
import {
  Building2,
  Coins,
  TrendingUp,
  TrendingDown,
  Percent,
  Package,
  Factory,
  Sparkles,
  ArrowLeft,
  Crown,
  Bot,
  FlaskConical,
  Award,
  Layers,
  Scale,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  HelpCircle,
  Clock,
  Flame,
  Globe2,
  ShoppingBag
} from 'lucide-react';

interface CompanyDetailPageProps {
  company: Company;
  perfumer?: Perfumer;
  allPerfumes: Perfume[];
  onBack: () => void;
  onNavigateToStorage?: () => void;
  onNavigateToProduction?: () => void;
  onNavigateToOrders?: () => void;
}

export const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({
  company,
  perfumer,
  allPerfumes,
  onBack,
  onNavigateToStorage,
  onNavigateToProduction,
  onNavigateToOrders
}) => {
  const isUser = company.isPlayer;

  // Filter perfumes produced or owned by this company
  const companyPerfumes = useMemo(() => {
    return allPerfumes.filter(
      (p) => p.producerCompanyId === company.id || p.companyId === company.id
    );
  }, [allPerfumes, company.id]);

  // Aggregate granular expense breakdown from company financial history & inventory cost basis
  const expenseBreakdown = useMemo(() => {
    let rawMaterialSpend = 0;
    let royaltySpend = 0;
    let rndDesignSpend = 0;
    let productionLaborSpend = 0;
    let taxSpend = 0;
    let logisticsSpend = 0;
    let wasteSpend = 0;
    let otherSpend = 0;

    (company.financialHistory || []).forEach((rec) => {
      if (rec.type === 'expense') {
        const amt = rec.amount || 0;
        switch (rec.category) {
          case 'raw_material_purchase':
            // 20% tax, 15% logistics included in raw purchase total
            rawMaterialSpend += Math.round(amt * 0.65);
            taxSpend += Math.round(amt * 0.20);
            logisticsSpend += Math.round(amt * 0.15);
            break;
          case 'perfumer_royalty':
            royaltySpend += amt;
            break;
          case 'rnd_design_fee':
          case 'rnd_expense':
            rndDesignSpend += amt;
            break;
          case 'production_fee':
            productionLaborSpend += amt;
            break;
          case 'tax':
            taxSpend += amt;
            break;
          case 'logistics':
            logisticsSpend += amt;
            break;
          default:
            otherSpend += amt;
        }
      }
    });

    // If historical records are few, extrapolate from totalExpenses proportionally
    const totalRecorded = rawMaterialSpend + royaltySpend + rndDesignSpend + productionLaborSpend + taxSpend + logisticsSpend + otherSpend;
    const baseTotal = Math.max(company.totalExpenses || 0, totalRecorded);

    if (totalRecorded === 0 && baseTotal > 0) {
      rawMaterialSpend = Math.round(baseTotal * 0.45);
      taxSpend = Math.round(baseTotal * 0.15);
      logisticsSpend = Math.round(baseTotal * 0.10);
      productionLaborSpend = Math.round(baseTotal * 0.18);
      rndDesignSpend = Math.round(baseTotal * 0.08);
      royaltySpend = Math.round(baseTotal * 0.04);
    }

    // Waste cost calculation based on raw materials
    wasteSpend = Math.round(rawMaterialSpend * 0.25);

    return {
      rawMaterialSpend,
      royaltySpend,
      rndDesignSpend,
      productionLaborSpend,
      taxSpend,
      logisticsSpend,
      wasteSpend,
      otherSpend,
      totalExpenses: baseTotal
    };
  }, [company]);

  // Granular Revenue & Profit Breakdown by Perfume Brand
  const perfumeSalesAnalysis = useMemo(() => {
    return companyPerfumes.map((perfume) => {
      const storageItem = company.productStorage?.[perfume.id];
      const totalSold = storageItem?.totalSold || (isUser ? 120 : Math.floor(Math.random() * 80 + 60));
      const currentStock = storageItem?.quantity || 0;
      
      const unitCost = storageItem?.unitCost || Math.round(perfume.suggestedRetailPrice * 0.45);
      const salePrice = storageItem?.lastSalePrice || perfume.suggestedRetailPrice;
      const unitProfit = Math.max(0, salePrice - unitCost);
      const profitMarginPct = salePrice > 0 ? (unitProfit / salePrice) * 100 : 0;

      const totalRevenue = Math.round(totalSold * salePrice);
      const totalCost = Math.round(totalSold * unitCost);
      const totalProfit = Math.round(totalSold * unitProfit);

      return {
        perfume,
        currentStock,
        totalSold,
        unitCost,
        salePrice,
        unitProfit,
        profitMarginPct,
        totalRevenue,
        totalCost,
        totalProfit
      };
    }).sort((a, b) => b.totalProfit - a.totalProfit);
  }, [companyPerfumes, company.productStorage, isUser]);

  const totalCalculatedPerfumeProfit = useMemo(() => {
    return perfumeSalesAnalysis.reduce((sum, item) => sum + item.totalProfit, 0);
  }, [perfumeSalesAnalysis]);

  const totalCalculatedRevenue = useMemo(() => {
    return perfumeSalesAnalysis.reduce((sum, item) => sum + item.totalRevenue, 0);
  }, [perfumeSalesAnalysis]);

  return (
    <div className="space-y-6 pb-20">
      
      {/* TOP NAVIGATION & COMPANY HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Tüm Şirketler Listesine & Liderlik Tablosuna Dön</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-md">
              {company.logo}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-wide">
                  {company.name}
                </h2>
                {isUser ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" /> Sizin Şirketiniz
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-purple-400" /> Rakip Parfümeri Şirketi
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                <span>Baş Parfümatör: <strong className="text-purple-300">{perfumer?.name || 'Mert Aksoy'}</strong></span>
                <span>•</span>
                <span>Rol: <strong className="text-slate-300">{perfumer?.role || 'Kıdemli Burun'}</strong></span>
                <span>•</span>
                <span>Katalog: <strong className="text-amber-300 font-mono">{companyPerfumes.length} Koku</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Nav Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {onNavigateToStorage && (
            <button
              onClick={onNavigateToStorage}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mamul Deposu</span>
            </button>
          )}
          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>İhracat Siparişleri</span>
            </button>
          )}
        </div>
      </div>

      {/* 5 RENKLİ SÜTUN: KASA NAKDİ, GELİR, GİDER, NET KÂR, KÂR MARJI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Sütun 1: KASA NAKDİ (Yeşil) */}
        <div className="bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> Kasa Nakdi
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl lg:text-2xl font-black font-mono text-emerald-400 mt-2">
              {company.cash.toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            Kullanılabilir Likit Bakiye
          </div>
        </div>

        {/* Sütun 2: TOPLAM GELİR (Mavi / Zümrüt) */}
        <div className="bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 border border-blue-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Toplam Gelir
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Ciro</span>
            </div>
            <div className="text-xl lg:text-2xl font-black font-mono text-blue-400 mt-2">
              {(company.totalRevenue || 0).toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            İhracat & Toptan Satışlar
          </div>
        </div>

        {/* Sütun 3: TOPLAM GİDER (Kırmızı / Gül) */}
        <div className="bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Toplam Gider
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Maliyet</span>
            </div>
            <div className="text-xl lg:text-2xl font-black font-mono text-rose-400 mt-2">
              {(company.totalExpenses || 0).toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            Hammadde, Telif, Vergi, AR-GE
          </div>
        </div>

        {/* Sütun 4: NET KÂR (Altın / Yeşil) */}
        <div className={`bg-gradient-to-b ${
          (company.netProfit || 0) >= 0
            ? 'from-amber-950/40 border-amber-500/50'
            : 'from-rose-950/40 border-rose-500/50'
        } via-slate-950 to-slate-950 border p-5 rounded-3xl shadow-xl flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Net Kâr
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                (company.netProfit || 0) >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {(company.netProfit || 0) >= 0 ? 'KÂRLI' : 'ZARAR'}
              </span>
            </div>
            <div className={`text-xl lg:text-2xl font-black font-mono mt-2 ${
              (company.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(company.netProfit || 0) >= 0 ? '+' : ''}{(company.netProfit || 0).toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            Gelir - Gider Net Dengesi
          </div>
        </div>

        {/* Sütun 5: KÂR MARJI (Mor / İndigo) */}
        <div className="bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" /> Kâr Marjı
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">% Oran</span>
            </div>
            <div className={`text-xl lg:text-2xl font-black font-mono mt-2 ${
              (company.profitMargin || 0) >= 0 ? 'text-purple-300' : 'text-rose-400'
            }`}>
              %{(company.profitMargin || 0).toFixed(1)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            Net Kâr / Toplam Ciro
          </div>
        </div>

      </div>

      {/* KAR PAYI FİYATLANDIRMA MANTIĞI AÇIKLAMA KUTUSU (KULLANICININ SORUSUNA BİREBİR REHBER) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 border border-amber-500/40 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Parfüm Fiyatlandırma Formülü: Maliyet + Kâr Payı = Satış Fiyatı
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Sistemde parfümlerin fiyatı hem <strong>net kâr payı tutarı (₺)</strong> hem de <strong>yüzdesel kâr marjı (%)</strong> ile tam uyumlu çalışır. 
            Örneğin: Bir parfümün şişe imalat maliyeti <strong>1.200 ₺</strong> ise ve üretici <strong>1.000 ₺ kâr payı</strong> hedefliyorsa, piyasa satış fiyatı <strong>2.200 ₺</strong> olur ve kâr marjı <strong>%45.5</strong> olarak kaydedilir.
          </p>
        </div>

        <div className="bg-slate-950/90 border border-amber-500/30 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0 font-mono text-xs">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">Maliyet</div>
            <div className="text-rose-400 font-bold">1.200 ₺</div>
          </div>
          <span className="text-slate-500 font-bold">+</span>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">Kâr Payı</div>
            <div className="text-emerald-400 font-bold">+1.000 ₺</div>
          </div>
          <span className="text-slate-500 font-bold">=</span>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">Satış</div>
            <div className="text-amber-300 font-bold">2.200 ₺</div>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">Marj</div>
            <div className="text-purple-300 font-bold">%45.5</div>
          </div>
        </div>
      </div>

      {/* 2 ANA DETAY BÖLÜMÜ: 1) GİDERLERİN RENKLİ ANALİZİ, 2) GELİRLERİN & PARFÜM KÂR PAYLARININ TABLOSU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SOL: GİDERLERİN DETAYLI KALEMLERİ (4 Sütun) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Gider Kalemleri Analizi
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400">
              {expenseBreakdown.totalExpenses.toLocaleString('tr-TR')} ₺
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 1. Hammadde Alımı */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Hammadde & Esans Alımları
                </span>
                <span className="font-mono font-bold text-blue-400">
                  {expenseBreakdown.rawMaterialSpend.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Borsa esans alımları (Madagaskar Vanilya, Grasse Gül vb.)
              </div>
            </div>

            {/* 2. Parfümatör Telifleri */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Parfümatör Satış Telifleri
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {expenseBreakdown.royaltySpend.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {perfumer?.name} (%{((perfumer?.royaltyRate || 0.03) * 100).toFixed(1)}) AR-GE satış telifleri
              </div>
            </div>

            {/* 3. Tasarım & AR-GE */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Tasarım & AR-GE Ücreti
                </span>
                <span className="font-mono font-bold text-purple-400">
                  {expenseBreakdown.rndDesignSpend.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Formül çıkarma bedeli ({perfumer?.designFee?.toLocaleString('tr-TR')} ₺ / formül)
              </div>
            </div>

            {/* 4. Fabrika İmalat & İşçilik */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Fabrika İmalat & İşçilik
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {expenseBreakdown.productionLaborSpend.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Şişeleme, kapak, kutu ve hat işçiliği (45 ₺ / şişe)
              </div>
            </div>

            {/* 5. Vergi (%20 KDV) */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Vergi (%20 KDV)
                </span>
                <span className="font-mono font-bold text-rose-400">
                  {expenseBreakdown.taxSpend.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Borsa hammadde tedarikinde kesilen resmi katma değer vergisi
              </div>
            </div>

            {/* 6. Lojistik (%15) */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Lojistik & Nakliye (%15)
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  {expenseBreakdown.logisticsSpend.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Uluslararası kargo, gümrük ve soğuk zincir esans sevkiyatı
              </div>
            </div>

            {/* 7. Fire & Saflaştırma (%25) */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Fire & Kalite Kaybı (%25)
                </span>
                <span className="font-mono font-bold text-orange-400">
                  {expenseBreakdown.wasteSpend.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Maserasyon, süzme ve dinlendirme esnasında buharlaşan esans
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: GELİRLERİN VE PARFÜM BAZINDA KÂR PAYI TABLOSU (8 Sütun) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Parfüm Satışları & Hangi Parfümden Ne Kadar Kâr Gelmiş
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Şirketin tescilli markalarının imalat maliyeti, satış fiyatı, şişe başı net kâr payı ve toplam getirisi.
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400">Toplam Parfüm Kârı:</span>
              <span className="font-mono font-bold text-emerald-400">
                +{totalCalculatedPerfumeProfit.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>

          {/* PERFUME SALES TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                  <th className="py-3 px-3">Parfüm Markası</th>
                  <th className="py-3 px-2 text-center">Satılan</th>
                  <th className="py-3 px-2 text-right">Maliyet</th>
                  <th className="py-3 px-2 text-right">Satış</th>
                  <th className="py-3 px-3 text-right">Şişe Başı Kâr</th>
                  <th className="py-3 px-3 text-right">Toplam Ciro</th>
                  <th className="py-3 px-3 text-right">Toplam Kâr</th>
                  <th className="py-3 px-2 text-center">Depo Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {perfumeSalesAnalysis.map(({
                  perfume,
                  currentStock,
                  totalSold,
                  unitCost,
                  salePrice,
                  unitProfit,
                  profitMarginPct,
                  totalRevenue,
                  totalProfit
                }) => {
                  const isRnd = perfume.sourceType === 'AR-GE';

                  return (
                    <tr key={perfume.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Image */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <img
                              src={perfume.image}
                              alt={perfume.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-800"
                            />
                            {isRnd && (
                              <span className="absolute -top-1 -left-1 bg-purple-600 text-white text-[7px] font-black px-1 rounded shadow">
                                AR-GE
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{perfume.name}</span>
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  isRnd
                                    ? 'bg-purple-600 text-white border border-purple-400 shadow-sm'
                                    : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                                }`}
                              >
                                {isRnd ? '🔬 AR-GE' : perfume.sourceType}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {perfume.brand} • {perfume.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sold Quantity */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-300">
                        {totalSold} şişe
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3 px-2 text-right font-mono text-slate-400">
                        {unitCost} ₺
                      </td>

                      {/* Retail Sale Price */}
                      <td className="py-3 px-2 text-right font-mono font-bold text-amber-300">
                        {salePrice} ₺
                      </td>

                      {/* Unit Profit (Kâr Payı) */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-emerald-400">
                          +{unitProfit} ₺
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          %{profitMarginPct.toFixed(0)} marj
                        </div>
                      </td>

                      {/* Total Revenue */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-400">
                        {totalRevenue.toLocaleString('tr-TR')} ₺
                      </td>

                      {/* Total Profit ("Hangi parfümden ne kadar kâr gelmiş") */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                          +{totalProfit.toLocaleString('tr-TR')} ₺
                        </span>
                      </td>

                      {/* In Stock */}
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={`text-[11px] font-bold ${
                          currentStock > 0 ? 'text-indigo-300' : 'text-slate-600'
                        }`}>
                          {currentStock > 0 ? `${currentStock} adet` : 'Tükendi'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ŞİRKETİN EN SON FİNANSAL İŞLEM GEÇMİŞİ */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-400" />
            Canlı Finansal Hareketler & Kasa Kayıtları (Son 15 İşlem)
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {company.financialHistory?.length || 0} toplam hareket
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-3">İşlem Türü</th>
                <th className="py-3 px-4">Açıklama</th>
                <th className="py-3 px-4 text-right">Tutar</th>
                <th className="py-3 px-4 text-right">Kasa Sonrası</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {(company.financialHistory || []).slice(0, 15).map((rec) => {
                const isIncome = rec.type === 'income';

                return (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(rec.timestamp).toLocaleTimeString('tr-TR')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                          isIncome
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {isIncome ? 'GELİR' : 'GİDER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {rec.description}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'}{rec.amount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {rec.cashAfter ? `${rec.cashAfter.toLocaleString('tr-TR')} ₺` : '—'}
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
