import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { RndResult, GenderType, RndResultLevel, NoteType, SecretRecipe } from '../../types';
import { PerfumerCard } from '../common/PerfumerCard';
import { NoteImage } from '../common/NoteImage';
import { CountryFlag } from '../common/CountryFlag';
import { SecretRecipeDeductionLab } from '../rnd/SecretRecipeDeductionLab';
import {
  FlaskConical,
  Scale,
  Sparkles,
  Archive,
  Users,
  CheckCircle2,
  Check,
  Plus,
  Trash2,
  FileLock2,
  Unlock,
  ArrowRight,
  Lightbulb,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Layers,
  Droplets,
  PackageOpen
} from 'lucide-react';

interface FormulaRowState {
  id: string;
  rawMaterialId: string;
  drops: number;
  tier: NoteType;
}

export const RndPage: React.FC = () => {
  const {
    rawMaterials,
    rndArchive,
    saveRndFormula,
    registerRndPerfume,
    playerCompany,
    playerPerfumer,
    perfumers,
    assignPerfumerToPlayerCompany,
    rawMaterialsMap,
    addToast,
    secretRecipes,
    guessSecretRecipe,
    setActiveTab
  } = useGame();

  // Navigation Subtabs: Lab, Secrets, Archive, 4 Perfumers
  const [activeSubTab, setActiveSubTab] = useState<'lab' | 'secrets' | 'archive' | 'perfumers'>('lab');

  // Purchased Secret Recipes
  const purchasedSecrets = useMemo(() => {
    return secretRecipes.filter((s) => s.isPurchased);
  }, [secretRecipes]);

  // ================= 1. MEVCUT HAMMADDE DEPOSU TEK KAYNAK =================
  // SADECE kullanıcının Hammadde Deposu'nda olan (stok > 0) hammaddeler seçilebilir
  const availableDepoMaterials = useMemo(() => {
    return Object.values(playerCompany.essenceStorage)
      .filter((item) => item.quantity > 0)
      .map((item) => {
        const mat = rawMaterialsMap.get(item.rawMaterialId);
        return {
          id: item.rawMaterialId,
          name: mat?.name || item.rawMaterialId,
          category: mat?.category || '',
          image: mat?.image,
          flag: mat?.flag || '🌿',
          stock: item.quantity
        };
      })
      .filter((item) => item.name)
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [playerCompany.essenceStorage, rawMaterialsMap]);

  // ================= FORMÜL GENEL ALANLARI =================
  const [formulaName, setFormulaName] = useState<string>('');
  const [gender, setGender] = useState<GenderType>('UNISEX');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<RndResult | null>(null);

  // Secret Recipe Guess / Reverse Engineering State in AR-GE
  const [activeSecretId, setActiveSecretId] = useState<string | null>(null);
  const [guessTop, setGuessTop] = useState<string[]>([]);
  const [guessMid, setGuessMid] = useState<string[]>([]);
  const [guessBase, setGuessBase] = useState<string[]>([]);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState<boolean>(false);

  // ================= 2. NOTA SATIRLARI (MAX 20 SATIR) =================
  const [rows, setRows] = useState<FormulaRowState[]>([]);

  // Initial starter rows from player's available warehouse stock
  useEffect(() => {
    if (rows.length === 0 && availableDepoMaterials.length > 0) {
      const topMat = availableDepoMaterials.find((m) => m.category.includes('Narenciye')) || availableDepoMaterials[0];
      const midMat =
        availableDepoMaterials.find(
          (m) => m.id !== topMat.id && (m.category.includes('Çiçeksi') || m.category.includes('Baharat'))
        ) ||
        availableDepoMaterials[1] ||
        availableDepoMaterials[0];
      const baseMat =
        availableDepoMaterials.find(
          (m) => m.id !== topMat.id && m.id !== midMat.id && (m.category.includes('Odunsu') || m.category.includes('Amber'))
        ) ||
        availableDepoMaterials[2] ||
        availableDepoMaterials[0];

      setRows([
        { id: 'row_1', rawMaterialId: topMat.id, drops: 8, tier: 'top' },
        { id: 'row_2', rawMaterialId: midMat.id, drops: 12, tier: 'middle' },
        { id: 'row_3', rawMaterialId: baseMat.id, drops: 8, tier: 'base' }
      ]);
    }
  }, [availableDepoMaterials]);

  // ================= 3. DAMLA VE TERAZİ HESAPLAMALARI =================
  const totalDrops = useMemo(() => {
    return rows.reduce((acc, r) => acc + (Number(r.drops) || 0), 0);
  }, [rows]);

  const topDrops = useMemo(() => {
    return rows.filter((r) => r.tier === 'top').reduce((acc, r) => acc + (Number(r.drops) || 0), 0);
  }, [rows]);

  const midDrops = useMemo(() => {
    return rows.filter((r) => r.tier === 'middle').reduce((acc, r) => acc + (Number(r.drops) || 0), 0);
  }, [rows]);

  const baseDrops = useMemo(() => {
    return rows.filter((r) => r.tier === 'base').reduce((acc, r) => acc + (Number(r.drops) || 0), 0);
  }, [rows]);

  const topPct = totalDrops > 0 ? Math.round((topDrops / totalDrops) * 100) : 0;
  const midPct = totalDrops > 0 ? Math.round((midDrops / totalDrops) * 100) : 0;
  const basePct = totalDrops > 0 ? Math.max(0, 100 - topPct - midPct) : 0;

  // ================= 5. HASSAS NOTA TERAZİSİ ANALİZİ =================
  const balanceStatus = useMemo(() => {
    if (topDrops === 0 || midDrops === 0 || baseDrops === 0) {
      return {
        isBalanced: false,
        level: 'incomplete',
        label: 'Eksik Piramit',
        hint: 'Koku piramidinin tamamlanması için her üç kademe (Üst, Orta, Alt) en az 1 damla nota içermelidir.',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      };
    }

    const isTopGolden = topPct >= 20 && topPct <= 30;
    const isMidGolden = midPct >= 40 && midPct <= 50;
    const isBaseGolden = basePct >= 25 && basePct <= 35;

    const isTopGood = topPct >= 18 && topPct <= 35;
    const isMidGood = midPct >= 35 && midPct <= 55;
    const isBaseGood = basePct >= 20 && basePct <= 40;

    if (isTopGolden && isMidGolden && isBaseGolden) {
      return {
        isBalanced: true,
        level: 'perfect',
        label: 'Mükemmel Terazi Dengesi',
        hint: `Kusursuz piramit akoru: Üst (%${topPct}), Kalp (%${midPct}) ve Dip (%${basePct}) altın oranda (+10 Harmoni Bonusu).`,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      };
    } else if (isTopGood && isMidGood && isBaseGood) {
      return {
        isBalanced: true,
        level: 'good',
        label: 'İyi Terazi Dengesi',
        hint: `Piramit akorları dengeli (%${topPct} / %${midPct} / %${basePct}); hafif bir damla ayarıyla mükemmel seviyeye çıkarılabilir.`,
        color: 'text-amber-300 bg-amber-500/10 border-amber-500/30'
      };
    } else {
      let defect = 'Koku piramidinde katmanlar arası belirgin terazi dengesizliği var.';
      if (topPct > 40) defect = `Üst notalar aşırı baskın (%${topPct}); parfüm ilk 15 dakikada uçar ve gövdesiz kalabilir.`;
      else if (basePct > 40) defect = `Dip notalar çok ağır (%${basePct}); koku hantal, açılışsız ve boğucu olabilir.`;
      else if (midPct < 30) defect = `Kalp notaları zayıf (%${midPct}); kokunun omurgası zayıf ve kopuk.`;

      return {
        isBalanced: false,
        level: 'poor',
        label: 'Dengesiz Terazi',
        hint: `${defect} (Kalite ve harmoni puanı düşer)`,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      };
    }
  }, [topDrops, midDrops, baseDrops, topPct, midPct, basePct]);

  // ================= ACTIONS =================
  const handleAddRow = () => {
    if (rows.length >= 20) {
      addToast({
        type: 'warning',
        title: 'Maksimum Nota Sınırı',
        message: 'Bir formülde en fazla 20 nota satırı eklenebilir.'
      });
      return;
    }

    if (availableDepoMaterials.length === 0) {
      addToast({
        type: 'error',
        title: 'Depo Boş',
        message: 'Hammadde deponuzda seçilebilecek esans bulunmuyor.'
      });
      return;
    }

    // Unused or default
    const usedIds = new Set(rows.map((r) => r.rawMaterialId));
    const nextMat = availableDepoMaterials.find((m) => !usedIds.has(m.id)) || availableDepoMaterials[0];

    // Smart tier proposal
    let proposedTier: NoteType = 'middle';
    if (topDrops <= midDrops && topDrops <= baseDrops) proposedTier = 'top';
    else if (baseDrops <= midDrops && baseDrops <= topDrops) proposedTier = 'base';

    setRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        rawMaterialId: nextMat.id,
        drops: 5,
        tier: proposedTier
      }
    ]);
  };

  const handleUpdateRow = (id: string, updates: Partial<FormulaRowState>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      addToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Formülde en az 1 nota satırı bulunmalıdır.'
      });
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetFormula = () => {
    if (availableDepoMaterials.length > 0) {
      const topMat = availableDepoMaterials[0];
      const midMat = availableDepoMaterials[1] || topMat;
      const baseMat = availableDepoMaterials[2] || topMat;

      setRows([
        { id: 'row_1', rawMaterialId: topMat.id, drops: 8, tier: 'top' },
        { id: 'row_2', rawMaterialId: midMat.id, drops: 12, tier: 'middle' },
        { id: 'row_3', rawMaterialId: baseMat.id, drops: 8, tier: 'base' }
      ]);
    } else {
      setRows([]);
    }
    setFormulaName('');
    setGender('UNISEX');
    addToast({
      type: 'info',
      title: 'Sıfırlandı',
      message: 'AR-GE formül masası standart başlangıç haline getirildi.'
    });
  };

  // ================= GİZLİ REÇETE TERSİNE MÜHENDİSLİK İŞLEMLERİ =================
  const toggleGuessTop = (id: string) => {
    setGuessTop((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleGuessMid = (id: string) => {
    setGuessMid((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleGuessBase = (id: string) => {
    setGuessBase((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmitSecretGuess = (secretId: string) => {
    if (guessTop.length === 0 || guessMid.length === 0 || guessBase.length === 0) {
      addToast({
        type: 'warning',
        title: 'Eksik Koku Piramidi',
        message: 'Lütfen analiziniz için en az 1 üst nota, 1 orta nota ve 1 alt nota seçiniz.'
      });
      return;
    }

    setIsSubmittingGuess(true);
    try {
      const attempt = guessSecretRecipe(secretId, guessTop, guessMid, guessBase);
      if (attempt.isFullyCorrect) {
        addToast({
          type: 'success',
          title: '🏆 GİZLİ REÇETE ÇÖZÜLDÜ!',
          message: 'Kusursuz analiz! Gizli reçete deşifre edildi ve Üretim Portföyüne eklendi!'
        });
        setGuessTop([]);
        setGuessMid([]);
        setGuessBase([]);
      } else {
        addToast({
          type: 'info',
          title: `🧬 ${attempt.correctCount}/${attempt.totalRequired} Nota Doğru (${attempt.attemptNumber}. Deneme)`,
          message: attempt.perfumerComment
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Analiz Başarısız',
        message: err.message || 'Tahmin işlemi başarısız.'
      });
    } finally {
      setIsSubmittingGuess(false);
    }
  };

  const handleTransferGuessToLab = (secret: SecretRecipe) => {
    const newRows: FormulaRowState[] = [];
    guessTop.forEach((id, idx) => {
      newRows.push({ id: `row_gt_${idx}_${Date.now()}`, rawMaterialId: id, drops: 8, tier: 'top' });
    });
    guessMid.forEach((id, idx) => {
      newRows.push({ id: `row_gm_${idx}_${Date.now()}`, rawMaterialId: id, drops: 12, tier: 'middle' });
    });
    guessBase.forEach((id, idx) => {
      newRows.push({ id: `row_gb_${idx}_${Date.now()}`, rawMaterialId: id, drops: 8, tier: 'base' });
    });

    if (newRows.length === 0) {
      addToast({
        type: 'warning',
        title: 'Nota Seçilmedi',
        message: 'AR-GE masasına aktarmak için en az 1 nota seçmelisiniz.'
      });
      return;
    }

    setRows(newRows.slice(0, 20));
    setFormulaName(`${secret.codeName} Analizi`);
    setActiveSubTab('lab');
    addToast({
      type: 'success',
      title: 'AR-GE Masasına Aktarıldı',
      message: `${newRows.length} nota Formül Laboratuvarı masasına aktarıldı. Damla ayarlarını yapabilirsiniz.`
    });
  };

  const handleLoadSolvedToLab = (secret: SecretRecipe) => {
    if (!secret.realPerfume) return;
    const newRows: FormulaRowState[] = [];
    secret.realPerfume.topNotes.forEach((id, idx) => {
      newRows.push({ id: `row_st_${idx}_${Date.now()}`, rawMaterialId: id, drops: 8, tier: 'top' });
    });
    secret.realPerfume.middleNotes.forEach((id, idx) => {
      newRows.push({ id: `row_sm_${idx}_${Date.now()}`, rawMaterialId: id, drops: 12, tier: 'middle' });
    });
    secret.realPerfume.baseNotes.forEach((id, idx) => {
      newRows.push({ id: `row_sb_${idx}_${Date.now()}`, rawMaterialId: id, drops: 8, tier: 'base' });
    });

    setRows(newRows.slice(0, 20));
    setFormulaName(secret.realPerfume.name);
    setGender(secret.realPerfume.gender);
    setActiveSubTab('lab');
    addToast({
      type: 'info',
      title: 'Reçete Yüklendi',
      message: `"${secret.realPerfume.name}" formülü AR-GE masasına aktarıldı.`
    });
  };

  // ================= 6. FORMÜLÜ KAYDET =================
  const handleSaveFormula = () => {
    if (rows.length === 0) {
      addToast({
        type: 'error',
        title: 'Boş Formül',
        message: 'Lütfen reçeteye en az bir nota ekleyin.'
      });
      return;
    }

    if (totalDrops === 0) {
      addToast({
        type: 'error',
        title: 'Damla Sayısı Eksik',
        message: 'Toplam damla sayısı 0 olamaz. Lütfen notalara damla miktarı belirleyin.'
      });
      return;
    }

    if (topDrops === 0 || midDrops === 0 || baseDrops === 0) {
      addToast({
        type: 'error',
        title: 'Eksik Koku Piramidi',
        message: 'Formülü kaydedebilmek için her üç kademede (Üst, Orta, Alt) en az 1 damla nota bulunmalıdır.'
      });
      return;
    }

    if (playerCompany.cash < playerPerfumer.designFee) {
      addToast({
        type: 'error',
        title: 'Yetersiz Kasa Bakiyesi',
        message: `${playerPerfumer.name} tasarım ücreti ${playerPerfumer.designFee.toLocaleString('tr-TR')} ₺'dir. Kasanızda yeterli nakit yok.`
      });
      return;
    }

    const items = rows.map((r) => ({
      rawMaterialId: r.rawMaterialId,
      drops: Math.max(1, Number(r.drops) || 1),
      noteType: r.tier
    }));

    try {
      setIsSaving(true);
      const generatedName =
        formulaName.trim() ||
        `${playerCompany.name} ${rawMaterialsMap.get(rows[0]?.rawMaterialId)?.name || 'Élixir'} No. ${Math.floor(
          Math.random() * 900 + 100
        )}`;

      const result = saveRndFormula(generatedName, items, gender);
      setLastResult(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeStyle = (level: RndResultLevel) => {
    switch (level) {
      case 'Efsanevi':
        return 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white font-black shadow-lg shadow-amber-500/20 border-amber-300 animate-pulse';
      case 'Nadir':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold';
      case 'Kaliteli':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold';
      case 'Standart':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-medium';
      case 'Sıradan':
        return 'bg-slate-700/50 text-slate-300 border-slate-600 font-medium';
      case 'Basit':
      default:
        return 'bg-rose-950/40 text-rose-300 border-rose-800 font-medium';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4 text-rose-400" />
            ParfümATÖR AR-GE Laboratuvarı
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            Parfüm Formül & Reçete Tasarımı
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Mevcut Hammadde Deposu'ndaki esanslarınızı damla usulü harmanlayarak şirketiniz adına yeni parfüm 
            reçeteleri geliştirin.
          </p>
        </div>

        {/* SUBTAB NAVIGATION */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs shrink-0 flex-wrap">
          <button
            onClick={() => setActiveSubTab('lab')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'lab'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Formül Laboratuvarı
          </button>

          <button
            onClick={() => setActiveSubTab('secrets')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 relative ${
              activeSubTab === 'secrets'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileLock2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Gizli Reçeteler ({purchasedSecrets.length})</span>
            {purchasedSecrets.some((s) => s.status !== 'solved') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('archive')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'archive'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Formül Arşivi ({rndArchive.length})
          </button>

          <button
            onClick={() => setActiveSubTab('perfumers')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'perfumers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            4 ParfümATÖR Kadrosu
          </button>
        </div>
      </div>

      {/* SUBTAB 1: FORMÜL LABORATUVARI (REFERANS TASARIM) */}
      {activeSubTab === 'lab' && (
        <div className="space-y-6">

          {/* Active Perfumer Bar */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                {playerPerfumer.avatar || '👨‍🔬'}
              </span>
              <div>
                <div className="text-slate-400">Baş Parfümör Denetimi:</div>
                <div className="text-sm font-bold text-white">
                  {playerPerfumer.name} • <span className="text-rose-400 font-semibold">{playerPerfumer.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs flex-wrap">
              <span className="text-slate-300">
                Tasarım Ücreti: <strong className="text-amber-300">{playerPerfumer.designFee.toLocaleString('tr-TR')} ₺</strong>
              </span>
              <span>•</span>
              <span className="text-slate-300">
                Telif: <strong className="text-purple-300">%{(playerPerfumer.royaltyRate * 100).toFixed(1)}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-300">
                Depo Hammaddesi: <strong className="text-emerald-400 font-bold">{availableDepoMaterials.length} Çeşit</strong>
              </span>
              <span>•</span>
              <span className="text-slate-300">
                Kasanız: <strong className="text-emerald-400">{playerCompany.cash.toLocaleString('tr-TR')} ₺</strong>
              </span>
            </div>
          </div>

          {/* LATEST SAVED FORMULA BANNER */}
          {lastResult && (
            <div className="bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-950 border-2 border-purple-500/60 p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Reçete Başarıyla Kaydedildi!
                  </div>
                  <h3 className="text-xl font-bold font-serif text-white mt-0.5">
                    {lastResult.name}
                  </h3>
                  <div className="text-xs text-slate-400">
                    Formül: {lastResult.companyName} × {lastResult.perfumerName} ({lastResult.gender}) • Toplam: {lastResult.totalDrops || totalDrops} Damla
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-xl border text-xs uppercase tracking-wider ${getBadgeStyle(lastResult.resultLevel)}`}>
                    {lastResult.resultLevel} İcat
                  </span>

                  {!lastResult.isAddedToProduction ? (
                    <button
                      onClick={() => registerRndPerfume(lastResult.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Üretim Portföyüne Ekle
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('production')}
                      className="px-4 py-2 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-900/60 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Üretime Git
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Score Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Genel Kalite</div>
                  <div className="text-lg font-black font-mono text-amber-300 mt-0.5">
                    %{lastResult.qualityScore}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Nota Uyumu</div>
                  <div className="text-lg font-black font-mono text-rose-300 mt-0.5">
                    %{lastResult.harmonyScore}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Özgünlük</div>
                  <div className="text-lg font-black font-mono text-purple-300 mt-0.5">
                    %{lastResult.originalityScore}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Trend Uyumu</div>
                  <div className="text-lg font-black font-mono text-blue-300 mt-0.5">
                    %{lastResult.trendScore}
                  </div>
                </div>
              </div>

              {/* Dynamic Commentary */}
              {lastResult.perfumerReview && (
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-300 italic flex items-start gap-2.5">
                  <span className="text-lg shrink-0">💬</span>
                  <div>
                    <strong className="text-purple-300 not-italic">{lastResult.perfumerName}:</strong> {lastResult.perfumerReview}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WARNING IF DEPOSITORY IS EMPTY */}
          {availableDepoMaterials.length === 0 && (
            <div className="bg-rose-950/40 border border-rose-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Hammadde Deponuzda Esans Bulunmuyor!</h4>
                  <p className="text-slate-300 mt-0.5">
                    AR-GE'de formül oluşturabilmek için mevcut Hammadde Deponuzda stok bulunmalıdır.
                    Lütfen Hammadde Borsası'ndan esans satın alıp nakliyesini tamamlayın.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('market')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>Hammadde Borsasına Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ================= ANA AR-GE FORMU & TERAZİ IZGARASI ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* SOL / ORTA PANEL: REÇETE FORMU & NOTA TABLOSU (8 Kolon) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* FORMÜL KİMLİĞİ BAR */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Formül / Reçete Adı
                    </label>
                    <input
                      type="text"
                      value={formulaName}
                      onChange={(e) => setFormulaName(e.target.value)}
                      placeholder={`Örn: ${playerCompany.name} Velvet Amber`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Hedef Cinsiyet
                    </label>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['KADIN', 'ERKEK', 'UNISEX'] as GenderType[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            gender === g
                              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTA TABLOSU */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 md:p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Reçete Notaları & Damla Sayıları
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                      {rows.length} / 20 Nota Satırı
                    </span>

                    <button
                      type="button"
                      onClick={handleResetFormula}
                      title="Formülü Sıfırla"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                        <th className="py-2.5 px-2 w-8 text-center">#</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Hammadde (Nota)</th>
                        <th className="py-2.5 px-3 w-36 text-center">Damla Sayısı</th>
                        <th className="py-2.5 px-3 min-w-[130px]">Nota Yeri</th>
                        <th className="py-2.5 px-2 w-12 text-center">Kaldır</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rows.map((row, index) => {
                        const currentMat = rawMaterialsMap.get(row.rawMaterialId);
                        const depoStock = playerCompany.essenceStorage[row.rawMaterialId]?.quantity || 0;

                        return (
                          <tr key={row.id} className="hover:bg-slate-950/40 transition-colors group">
                            
                            {/* 1. SIRA NO */}
                            <td className="py-3 px-2 text-center font-mono font-bold text-slate-500">
                              {index + 1}
                            </td>

                            {/* 2. HAMMADDE (NOTA) DROPDOWN (SADECE DEPO STOKLARINDAN) */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="shrink-0">
                                  <NoteImage
                                    id={row.rawMaterialId}
                                    src={currentMat?.image}
                                    name={currentMat?.name}
                                    fallbackEmoji={currentMat?.flag || '🌿'}
                                    size="sm"
                                  />
                                </div>
                                <select
                                  value={row.rawMaterialId}
                                  onChange={(e) => handleUpdateRow(row.id, { rawMaterialId: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                                >
                                  {availableDepoMaterials.map((mat) => (
                                    <option key={mat.id} value={mat.id}>
                                      {mat.name} (Stok: {mat.stock})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>

                            {/* 3. DAMLA SAYISI (SADECE DAMLA BİRİMİ) */}
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateRow(row.id, { drops: Math.max(1, (Number(row.drops) || 1) - 1) })
                                  }
                                  className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>

                                <input
                                  type="number"
                                  min="1"
                                  max="200"
                                  value={row.drops}
                                  onChange={(e) =>
                                    handleUpdateRow(row.id, { drops: Math.max(1, parseInt(e.target.value) || 1) })
                                  }
                                  className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono font-bold text-white text-xs focus:border-rose-500 focus:outline-none"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateRow(row.id, { drops: (Number(row.drops) || 0) + 1 })
                                  }
                                  className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {row.drops} damla
                              </div>
                            </td>

                            {/* 4. NOTA YERİ (Üst, Orta, Alt Nota) */}
                            <td className="py-3 px-3">
                              <select
                                value={row.tier}
                                onChange={(e) => handleUpdateRow(row.id, { tier: e.target.value as NoteType })}
                                className={`w-full font-bold border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none ${
                                  row.tier === 'top'
                                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                                    : row.tier === 'middle'
                                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                                    : 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                                }`}
                              >
                                <option value="top">Üst Nota (Açılış)</option>
                                <option value="middle">Orta Nota (Kalp)</option>
                                <option value="base">Alt Nota (Dip / Kalıcı)</option>
                              </select>
                            </td>

                            {/* 5. KALDIR */}
                            <td className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                title="Satırı Kaldır"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM BUTTON: YENİ NOTA EKLE (MAX 20) */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    disabled={rows.length >= 20 || availableDepoMaterials.length === 0}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Yeni Nota Ekle ({rows.length}/20)</span>
                  </button>

                  <div className="text-[11px] text-slate-400">
                    Toplam Damla: <strong className="text-white font-mono">{totalDrops} damla</strong>
                  </div>
                </div>

                {/* FORMÜLÜ KAYDET BUTONU */}
                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={
                      isSaving ||
                      rows.length === 0 ||
                      totalDrops === 0 ||
                      topDrops === 0 ||
                      midDrops === 0 ||
                      baseDrops === 0 ||
                      playerCompany.cash < playerPerfumer.designFee
                    }
                    onClick={handleSaveFormula}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 hover:opacity-95 text-white font-black text-sm shadow-xl shadow-rose-950/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FlaskConical className="w-5 h-5" />
                    <span>
                      {isSaving
                        ? 'Formül Sentezleniyor & Kaydediliyor...'
                        : `⚗️ Formülü Kaydet (${playerPerfumer.designFee.toLocaleString('tr-TR')} ₺)`}
                    </span>
                  </button>
                  <div className="text-center text-[10px] text-slate-400 mt-2">
                    Kaydedilen reçete doğrudan formül arşivinize eklenir ve Üretim Laboratuvarı kataloğuna aktarılabilir.
                  </div>
                </div>

              </div>

            </div>

            {/* SAĞ PANEL: HASSAS NOTA TERAZİSİ (4 Kolon) */}
            <div className="lg:col-span-4 space-y-5">
              
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-5 sticky top-20">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Nota Terazisi
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${balanceStatus.color}`}>
                    {balanceStatus.label}
                  </span>
                </div>

                {/* TOPLAM DAMLA SAYISI GÖSTERGESİ */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Toplam Formül Hacmi
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    {totalDrops} <span className="text-sm text-slate-400 font-sans font-normal">Damla</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    (100'lük üretim partisinde: {totalDrops * 10} birim esans)
                  </div>
                </div>

                {/* 3 KATMAN TERAZİ DAĞILIMI (DAMLA & YÜZDELER) */}
                <div className="space-y-3.5">
                  
                  {/* ÜST NOTALAR */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-rose-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="text-xs font-bold text-rose-300">Üst Notalar</span>
                      </div>
                      <div className="font-mono text-xs">
                        <strong className="text-white">{topDrops} Damla</strong>
                        <span className="text-rose-400 font-bold ml-1.5">%{topPct}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${topPct}%` }}
                        className="h-full bg-rose-500 transition-all duration-300"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Açılış Akoru</span>
                      <span className={topPct >= 20 && topPct <= 30 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        İdeal: %20 - %30
                      </span>
                    </div>
                  </div>

                  {/* ORTA NOTALAR */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-xs font-bold text-amber-300">Orta Notalar</span>
                      </div>
                      <div className="font-mono text-xs">
                        <strong className="text-white">{midDrops} Damla</strong>
                        <span className="text-amber-400 font-bold ml-1.5">%{midPct}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${midPct}%` }}
                        className="h-full bg-amber-500 transition-all duration-300"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Kalp / Gövde Akoru</span>
                      <span className={midPct >= 40 && midPct <= 50 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        İdeal: %40 - %50
                      </span>
                    </div>
                  </div>

                  {/* ALT NOTALAR */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                        <span className="text-xs font-bold text-purple-300">Alt Notalar</span>
                      </div>
                      <div className="font-mono text-xs">
                        <strong className="text-white">{baseDrops} Damla</strong>
                        <span className="text-purple-400 font-bold ml-1.5">%{basePct}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${basePct}%` }}
                        className="h-full bg-purple-600 transition-all duration-300"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Dip / Kalıcılık Akoru</span>
                      <span className={basePct >= 25 && basePct <= 35 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        İdeal: %25 - %35
                      </span>
                    </div>
                  </div>

                </div>

                {/* STACKED PIRAMIT ÇUBUĞU */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Koku Piramidi Bütünleşik Çubuğu:
                  </div>
                  <div className="h-3 rounded-xl overflow-hidden flex bg-slate-950 border border-slate-800">
                    <div
                      style={{ width: `${topPct}%` }}
                      className="bg-rose-500 transition-all duration-300"
                      title={`Üst: %${topPct}`}
                    />
                    <div
                      style={{ width: `${midPct}%` }}
                      className="bg-amber-500 transition-all duration-300"
                      title={`Orta: %${midPct}`}
                    />
                    <div
                      style={{ width: `${basePct}%` }}
                      className="bg-purple-600 transition-all duration-300"
                      title={`Alt: %${basePct}`}
                    />
                  </div>
                </div>

                {/* TERAZİ HASSASİYET ANALİZİ & GERİBİLDİRİM */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <span>⚖️ Parfümatör Terazi Analizi:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    {balanceStatus.hint}
                  </p>
                </div>

                {/* PARFÜMÖR İMZASI */}
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>İmza: {playerPerfumer.name}</span>
                  <span className="text-amber-400 font-mono">Ücret: {playerPerfumer.designFee.toLocaleString('tr-TR')} ₺</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 2: GİZLİ REÇETELER (SARI ZARFLAR) AR-GE MASASI */}
      {activeSubTab === 'secrets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileLock2 className="w-5 h-5 text-amber-400" />
                <span>Satın Alınan Gizli Reçeteler ({purchasedSecrets.length} Zarf)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Satın aldığınız sarı zarfları AR-GE laboratuvarında analiz ederek doğrudan üretim kataloğunuza ekleyebilirsiniz.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('secret_recipes')}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Yeni Gizli Zarf Satın Al</span>
            </button>
          </div>

          {purchasedSecrets.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto text-2xl">
                🟨
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Henüz Satın Alınmış Gizli Reçete Zarfı Yok</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Gizli Reçeteler sayfasına giderek dünyaca ünlü efsane parfümlerin sarı zarflarını temin edebilirsiniz. 
                  Satın aldığınız tüm zarflar doğrudan buraya gelir ve çözülerek üretime aktarılabilir.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('secret_recipes')}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all inline-flex items-center gap-2"
              >
                <FileLock2 className="w-4 h-4" />
                <span>Gizli Reçeteler Sayfasına Git</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {purchasedSecrets.map((secret) => {
                const isSolved = secret.status === 'solved';
                const isFailed = secret.status === 'failed';

                return (
                  <div
                    key={secret.id}
                    className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl space-y-5 transition-all ${
                      isSolved
                        ? 'border-emerald-500/40 shadow-emerald-950/20'
                        : isFailed
                        ? 'border-rose-500/40 shadow-rose-950/20'
                        : 'border-amber-500/40 shadow-amber-950/20'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                          {isSolved ? '🏆' : '🟨'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                              TOP SECRET DOSYA
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                isSolved
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isFailed
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {isSolved
                                ? '✓ Çözüldü & Üretime Eklendi'
                                : isFailed
                                ? '3 Hak Doldu'
                                : `${secret.attemptsLeft} Tahmin Hakkı`}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold font-serif text-white mt-0.5">
                            {secret.codeName}
                          </h4>
                        </div>
                      </div>

                      {/* Top Action Button */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isSolved ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleLoadSolvedToLab(secret)}
                              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                              <FlaskConical className="w-4 h-4" />
                              <span>AR-GE Masasında Aç</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('production')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
                            >
                              <Zap className="w-4 h-4" />
                              <span>Üretim Sayfasında Üret</span>
                            </button>
                          </div>
                        ) : isFailed ? (
                          <span className="px-3 py-1.5 rounded-xl bg-rose-950/50 text-rose-300 border border-rose-500/40 text-xs font-bold">
                            3 Hak Tükendi
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSecretId(activeSecretId === secret.id ? null : secret.id);
                            }}
                            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all ${
                              activeSecretId === secret.id
                                ? 'bg-purple-600 text-white shadow-purple-600/30'
                                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20'
                            }`}
                          >
                            <FlaskConical className="w-4 h-4" />
                            <span>
                              {activeSecretId === secret.id
                                ? 'Analiz Masasını Kapat ▲'
                                : `Laboratuvarda Formülü Çöz (${secret.attemptsLeft} Hak) ▼`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DEDUCTION LABORATORY BENCH (WHEN ACTIVE & UNSOLVED) */}
                    {activeSecretId === secret.id && !isSolved && !isFailed && (
                      <SecretRecipeDeductionLab
                        secret={secret}
                        onClose={() => setActiveSecretId(null)}
                        onTransferToFormulaLab={() => handleLoadSolvedToLab(secret)}
                      />
                    )}

                    {/* Hint / Parfümatör İpucu (shown if lab is not open) */}
                    {activeSecretId !== secret.id && (
                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span>ParfümATÖR Burun İpuçları:</span>
                        </div>
                        <p className="italic text-slate-300 leading-relaxed">
                          "{secret.hint}"
                        </p>
                      </div>
                    )}

                    {/* IF SOLVED: SHOW REVEALED PERFUME */}
                    {isSolved && secret.realPerfume && (
                      <div className="bg-gradient-to-br from-emerald-950/30 via-slate-950 to-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <img
                            src={secret.realPerfume.image}
                            alt={secret.realPerfume.name}
                            className="w-20 h-20 rounded-2xl object-cover border border-emerald-500/40 shadow-md shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {secret.realPerfume.gender}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {secret.realPerfume.qualityLevel} Seviye
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                Kalite Skoru: %{secret.realPerfume.qualityScore}
                              </span>
                            </div>
                            <h5 className="text-base font-bold text-white">
                              {secret.realPerfume.brand} — {secret.realPerfume.name}
                            </h5>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {secret.realPerfume.description}
                            </p>
                          </div>
                        </div>

                        {/* Notalar Listesi */}
                        <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">Üst Notalar:</span>
                            <div className="text-slate-300">
                              {secret.realPerfume.topNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
                            </div>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Orta Notalar:</span>
                            <div className="text-slate-300">
                              {secret.realPerfume.middleNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
                            </div>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Alt Notalar:</span>
                            <div className="text-slate-300">
                              {secret.realPerfume.baseNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 text-xs">
                          <span className="text-slate-400">
                            Tavsiye Edilen Satış Fiyatı: <strong className="text-emerald-400 font-mono">{secret.realPerfume.suggestedRetailPrice} ₺</strong>
                          </span>
                          <button
                            onClick={() => setActiveTab('production')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                          >
                            Üretim Bölümünde Üret
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: FORMÜL ARŞİVİ */}
      {activeSubTab === 'archive' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-purple-400" />
              AR-GE Formül Arşivi ({rndArchive.length} Formül)
            </h3>
            <span className="text-xs text-slate-400">
              Kaydettiğiniz tüm özgün reçeteler burada saklanır.
            </span>
          </div>

          {rndArchive.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-3xl text-center space-y-3 shadow-xl">
              <FlaskConical className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Henüz Kayıtlı AR-GE Reçetesi Yok</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Formül Laboratuvarı sekmesinden deponuzdaki esansları birleştirerek ilk parfüm formülünüzü kaydedebilirsiniz.
              </p>
              <button
                onClick={() => setActiveSubTab('lab')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Formül Oluştur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rndArchive.map((rnd) => (
                <div
                  key={rnd.id}
                  className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(rnd.resultLevel)}`}>
                        {rnd.resultLevel}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(rnd.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold font-serif text-white">
                      {rnd.name}
                    </h4>

                    <div className="text-xs text-slate-400">
                      Tasarımcı: {rnd.companyName} × {rnd.perfumerName} ({rnd.gender})
                    </div>

                    {/* Metrikler */}
                    <div className="grid grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center text-xs">
                      <div>
                        <div className="text-[9px] text-slate-400">Kalite</div>
                        <div className="font-bold font-mono text-amber-300">%{rnd.qualityScore}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Özgünlük</div>
                        <div className="font-bold font-mono text-purple-300">%{rnd.originalityScore}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Uyum</div>
                        <div className="font-bold font-mono text-rose-300">%{rnd.harmonyScore}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Trend</div>
                        <div className="font-bold font-mono text-blue-300">%{rnd.trendScore}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                      {rnd.notesSummary}
                    </div>

                    {/* Damla Özeti */}
                    {rnd.totalDrops && (
                      <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between px-1">
                        <span>Hacim: {rnd.totalDrops} Damla</span>
                        <span>Üst: %{rnd.topPercentage || 0} · Orta: %{rnd.midPercentage || 0} · Dip: %{rnd.basePercentage || 0}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Tahmini Fiyat</div>
                      <div className="font-mono font-bold text-emerald-400">{rnd.estimatedMarketPrice} ₺</div>
                    </div>

                    {rnd.isAddedToProduction ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Üretimde
                      </span>
                    ) : (
                      <button
                        onClick={() => registerRndPerfume(rnd.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        Üretime Ekle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: 4 PARFÜMATÖR KADROSU */}
      {activeSubTab === 'perfumers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Sektördeki 4 Resmi ParfümATÖR Profili
            </h3>
            <span className="text-xs text-slate-400">
              Mevcut Şirket Parfümörünüz: <strong className="text-purple-300">{playerPerfumer.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {perfumers.map((perf) => (
              <PerfumerCard
                key={perf.id}
                perfumer={perf}
                isAssignedToPlayer={playerCompany.perfumerId === perf.id}
                showAssignAction={true}
                onAssign={() => assignPerfumerToPlayerCompany(perf.id)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
