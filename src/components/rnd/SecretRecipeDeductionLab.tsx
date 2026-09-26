import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { SecretRecipe, NoteType, RawMaterial, SecretRecipeAttempt } from '../../types';
import { NoteImage } from '../common/NoteImage';
import { CountryFlag } from '../common/CountryFlag';
import {
  Sparkles,
  Droplets,
  Layers,
  FlaskConical,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Search,
  Plus,
  X,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';

interface SecretRecipeDeductionLabProps {
  secret: SecretRecipe;
  onClose?: () => void;
  onTransferToFormulaLab?: () => void;
}

interface NotePlacement {
  id: string;
  tier: NoteType;
  status?: 'green' | 'orange' | 'new';
}

export const SecretRecipeDeductionLab: React.FC<SecretRecipeDeductionLabProps> = ({
  secret,
  onClose,
  onTransferToFormulaLab
}) => {
  const {
    guessSecretRecipe,
    rawMaterials,
    rawMaterialsMap,
    playerPerfumer,
    setActiveTab,
    addToast
  } = useGame();

  // Internal draft placements
  const [placements, setPlacements] = useState<NotePlacement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAttemptResult, setLastAttemptResult] = useState<SecretRecipeAttempt | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // New Note Picker state
  const [pickerTargetTier, setPickerTargetTier] = useState<NoteType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Initialize placements from secret.discoveredNotes
  useEffect(() => {
    const initialPlacements: NotePlacement[] = [];
    if (secret.discoveredNotes && secret.discoveredNotes.length > 0) {
      secret.discoveredNotes.forEach((dn) => {
        initialPlacements.push({
          id: dn.id,
          tier: dn.tier,
          status: dn.status // 'green' or 'orange'
        });
      });
    }
    setPlacements(initialPlacements);

    // If there is an existing last attempt and it's fresh, display it or keep null
    if (secret.attempts.length > 0) {
      setLastAttemptResult(secret.attempts[secret.attempts.length - 1]);
    } else {
      setLastAttemptResult(null);
    }
  }, [secret.id, secret.discoveredNotes, secret.attempts]);

  // Placed notes grouped by tier
  const topNotes = useMemo(() => placements.filter((p) => p.tier === 'top'), [placements]);
  const midNotes = useMemo(() => placements.filter((p) => p.tier === 'middle'), [placements]);
  const baseNotes = useMemo(() => placements.filter((p) => p.tier === 'base'), [placements]);

  const placedIds = useMemo(() => new Set(placements.map((p) => p.id)), [placements]);

  // Total notes selected in this draft
  const totalNotesCount = placements.length;

  // Move an orange or new note to another tier
  const handleMoveTier = (noteId: string, newTier: NoteType) => {
    setPlacements((prev) =>
      prev.map((p) => {
        if (p.id === noteId) {
          // Green notes cannot be moved
          if (p.status === 'green') return p;
          return { ...p, tier: newTier };
        }
        return p;
      })
    );
  };

  // Remove a note (only allowed for 'new' unverified notes)
  const handleRemoveNote = (noteId: string) => {
    setPlacements((prev) =>
      prev.filter((p) => {
        // Green and orange notes are locked and cannot be deleted
        if (p.id === noteId && (p.status === 'green' || p.status === 'orange')) {
          return true;
        }
        return p.id !== noteId;
      })
    );
  };

  // Add a new note to target tier
  const handleSelectNewNote = (matId: string) => {
    if (!pickerTargetTier) return;
    if (placedIds.has(matId)) {
      addToast({
        type: 'warning',
        title: 'Zaten Seçildi',
        message: 'Bu nota zaten formülde mevcut.'
      });
      return;
    }

    setPlacements((prev) => [
      ...prev,
      {
        id: matId,
        tier: pickerTargetTier,
        status: 'new'
      }
    ]);
    setPickerTargetTier(null);
    setSearchQuery('');
  };

  // Filtered raw materials for picker
  const filteredMaterials = useMemo(() => {
    return rawMaterials.filter((mat) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        mat.name.toLowerCase().includes(q) ||
        (mat.category && mat.category.toLowerCase().includes(q)) ||
        (mat.description && mat.description.toLowerCase().includes(q));
      const matchesCat =
        categoryFilter === 'ALL' ||
        (mat.category && mat.category.toUpperCase().includes(categoryFilter.toUpperCase()));
      return matchesSearch && matchesCat;
    });
  }, [rawMaterials, searchQuery, categoryFilter]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    rawMaterials.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return ['ALL', ...Array.from(cats)];
  }, [rawMaterials]);

  // Submit guess to evaluate attempt
  const handleSubmitAttempt = async () => {
    if (totalNotesCount === 0) {
      addToast({
        type: 'warning',
        title: 'Nota Seçilmedi',
        message: 'Lütfen test etmek için en az bir nota seçiniz.'
      });
      return;
    }

    const tIds = topNotes.map((p) => p.id);
    const mIds = midNotes.map((p) => p.id);
    const bIds = baseNotes.map((p) => p.id);

    setIsSubmitting(true);
    try {
      const attempt = guessSecretRecipe(secret.id, tIds, mIds, bIds);
      setLastAttemptResult(attempt);
      setShowResultModal(true);

      // Setup next stage placements:
      // Green and orange notes are kept and locked, gray notes are discarded!
      const nextPlacements: NotePlacement[] = [];

      // Add evaluated green notes
      if (attempt.evaluatedNotes) {
        attempt.evaluatedNotes.forEach((en) => {
          if (en.status === 'green') {
            nextPlacements.push({
              id: en.id,
              tier: en.tier,
              status: 'green'
            });
          } else if (en.status === 'orange') {
            nextPlacements.push({
              id: en.id,
              tier: en.tier, // keeps tested tier, but can be changed by player
              status: 'orange'
            });
          }
          // Gray notes are discarded!
        });
      }

      setPlacements(nextPlacements);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Analiz Hatası',
        message: err.message || 'Tahmin işlemi gerçekleştirilemedi.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSolved = secret.status === 'solved';
  const isFailed = secret.status === 'failed';
  const currentStageNumber = secret.attempts.length + 1;

  return (
    <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-5 md:p-7 space-y-6 shadow-2xl relative">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🟨</span>
            <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
              AR-GE GİZLİ REÇETE DEŞİFRE MASASI
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border uppercase ${
                isSolved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : isFailed
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isSolved
                ? '✓ ÇÖZÜLDÜ'
                : isFailed
                ? '3 HAK TÜKENDİ'
                : `${secret.attemptsLeft} TAHMİN HAKKI KALDI`}
            </span>
          </div>

          <h3 className="text-xl font-bold font-serif text-white tracking-wide">
            {secret.codeName}
          </h3>

          <p className="text-xs text-slate-400">
            Parfümatörünüzün burun ipuçlarını rehber edinerek formüldeki notaları ve piramit katmanlarını çözün.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {onTransferToFormulaLab && isSolved && (
            <button
              type="button"
              onClick={onTransferToFormulaLab}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>AR-GE Masasına Yükle</span>
            </button>
          )}

          {isSolved && (
            <button
              type="button"
              onClick={() => setActiveTab('production')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Üretime Git</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* CLUE / HINT CALLOUT */}
      <div className="bg-slate-950/85 p-4 md:p-5 rounded-2xl border border-amber-500/30 text-slate-200 space-y-2 shadow-inner">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{playerPerfumer.name} Koku İpucu:</span>
        </div>
        <p className="italic text-slate-200 pl-6 leading-relaxed text-xs sm:text-sm font-serif">
          "{secret.hint}"
        </p>
      </div>

      {/* LEGEND / RULES HELPER */}
      <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
        <div className="flex items-center gap-2 text-emerald-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
          <span><strong>Yeşil (🟢):</strong> Doğru nota + doğru katman (Kilitli)</span>
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-sm shadow-amber-500/50" />
          <span><strong>Turuncu (🟠):</strong> Doğru nota + yanlış katman (Taşınabilir)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
          <span><strong>Gri (⚪):</strong> Formülde yok (Sonraki aşamada elenir)</span>
        </div>
      </div>

      {/* REVEALED PERFUME BANNER IF ALREADY SOLVED */}
      {isSolved && secret.realPerfume && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/50 p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={secret.realPerfume.image}
              alt={secret.realPerfume.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg shrink-0"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {secret.realPerfume.gender}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {secret.realPerfume.qualityLevel} Seviye
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Kalite: %{secret.realPerfume.qualityScore}
                </span>
              </div>
              <h4 className="text-xl font-bold font-serif text-white">
                {secret.realPerfume.brand} — {secret.realPerfume.name}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {secret.realPerfume.description}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">Üst Notalar:</span>
              <span className="text-slate-200">
                {secret.realPerfume.topNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Orta Notalar:</span>
              <span className="text-slate-200">
                {secret.realPerfume.middleNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">Alt Notalar:</span>
              <span className="text-slate-200">
                {secret.realPerfume.baseNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE RESEARCH STAGE WORKBENCH (WHEN NOT SOLVED AND NOT FAILED) */}
      {!isSolved && !isFailed && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                {currentStageNumber}. Araştırma Aşaması
              </span>
              <span className="text-xs text-slate-400">
                (Toplam {totalNotesCount} Nota Seçili)
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Kalan Hak: <strong className="text-amber-400">{secret.attemptsLeft}</strong> / 3
            </div>
          </div>

          {/* 3 TIERS CONTAINERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* 1. ÜST NOTALAR */}
            <div className="bg-slate-950/90 rounded-2xl border border-rose-500/30 p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    1. Üst Notalar (Açılış)
                  </span>
                  <span className="text-rose-400 font-mono text-[11px] font-bold">
                    {topNotes.length} Nota
                  </span>
                </div>

                {/* Placed Notes in Top */}
                <div className="space-y-2 mt-3 min-h-[100px]">
                  {topNotes.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-500 italic">
                      Henüz üst nota eklenmedi
                    </div>
                  ) : (
                    topNotes.map((placement) => {
                      const mat = rawMaterialsMap.get(placement.id);
                      const isGreen = placement.status === 'green';
                      const isOrange = placement.status === 'orange';

                      return (
                        <div
                          key={`top_${placement.id}`}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                            isGreen
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                              : isOrange
                              ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                              : 'bg-slate-900 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <NoteImage id={placement.id} src={mat?.image} name={mat?.name} size="xs" />
                            <div className="min-w-0">
                              <div className="font-bold truncate text-[11px] flex items-center gap-1">
                                <span>{mat?.name || placement.id}</span>
                                {isGreen && <span title="Doğru nota + doğru katman">🟢</span>}
                                {isOrange && <span title="Doğru nota + yanlış katman">🟠</span>}
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {isGreen
                                  ? 'Doğru nota + doğru katman (Kilitli)'
                                  : isOrange
                                  ? 'Doğru nota + yanlış katman'
                                  : 'Yeni Deneme'}
                              </div>
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            {isGreen ? (
                              <span title="Kilitli bilgi" className="text-emerald-400 p-1">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : isOrange ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'middle')}
                                  title="Orta Katmana Taşı"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                                >
                                  → Orta
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'base')}
                                  title="Alt Katmana Taşı"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                                >
                                  → Alt
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'middle')}
                                  title="Orta Katmana Taşı"
                                  className="p-1 rounded text-[10px] text-slate-400 hover:text-white"
                                >
                                  → Orta
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNote(placement.id)}
                                  title="Kaldır"
                                  className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Note Button */}
              <button
                type="button"
                onClick={() => setPickerTargetTier('top')}
                className="w-full mt-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Üst Nota Ekle</span>
              </button>
            </div>

            {/* 2. ORTA NOTALAR */}
            <div className="bg-slate-950/90 rounded-2xl border border-amber-500/30 p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Droplets className="w-3.5 h-3.5 text-amber-400" />
                    2. Orta / Kalp Notaları (Gövde)
                  </span>
                  <span className="text-amber-400 font-mono text-[11px] font-bold">
                    {midNotes.length} Nota
                  </span>
                </div>

                {/* Placed Notes in Middle */}
                <div className="space-y-2 mt-3 min-h-[100px]">
                  {midNotes.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-500 italic">
                      Henüz orta nota eklenmedi
                    </div>
                  ) : (
                    midNotes.map((placement) => {
                      const mat = rawMaterialsMap.get(placement.id);
                      const isGreen = placement.status === 'green';
                      const isOrange = placement.status === 'orange';

                      return (
                        <div
                          key={`mid_${placement.id}`}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                            isGreen
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                              : isOrange
                              ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                              : 'bg-slate-900 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <NoteImage id={placement.id} src={mat?.image} name={mat?.name} size="xs" />
                            <div className="min-w-0">
                              <div className="font-bold truncate text-[11px] flex items-center gap-1">
                                <span>{mat?.name || placement.id}</span>
                                {isGreen && <span title="Doğru nota + doğru katman">🟢</span>}
                                {isOrange && <span title="Doğru nota + yanlış katman">🟠</span>}
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {isGreen
                                  ? 'Doğru nota + doğru katman (Kilitli)'
                                  : isOrange
                                  ? 'Doğru nota + yanlış katman'
                                  : 'Yeni Deneme'}
                              </div>
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            {isGreen ? (
                              <span title="Kilitli bilgi" className="text-emerald-400 p-1">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : isOrange ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'top')}
                                  title="Üst Katmana Taşı"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                                >
                                  → Üst
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'base')}
                                  title="Alt Katmana Taşı"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                                >
                                  → Alt
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'top')}
                                  title="Üst Katmana Taşı"
                                  className="p-1 rounded text-[10px] text-slate-400 hover:text-white"
                                >
                                  → Üst
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'base')}
                                  title="Alt Katmana Taşı"
                                  className="p-1 rounded text-[10px] text-slate-400 hover:text-white"
                                >
                                  → Alt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNote(placement.id)}
                                  title="Kaldır"
                                  className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Note Button */}
              <button
                type="button"
                onClick={() => setPickerTargetTier('middle')}
                className="w-full mt-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Orta Nota Ekle</span>
              </button>
            </div>

            {/* 3. ALT NOTALAR */}
            <div className="bg-slate-950/90 rounded-2xl border border-purple-500/30 p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-purple-300 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    3. Alt / Dip Notaları (Kalıcılık)
                  </span>
                  <span className="text-purple-400 font-mono text-[11px] font-bold">
                    {baseNotes.length} Nota
                  </span>
                </div>

                {/* Placed Notes in Base */}
                <div className="space-y-2 mt-3 min-h-[100px]">
                  {baseNotes.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-500 italic">
                      Henüz alt nota eklenmedi
                    </div>
                  ) : (
                    baseNotes.map((placement) => {
                      const mat = rawMaterialsMap.get(placement.id);
                      const isGreen = placement.status === 'green';
                      const isOrange = placement.status === 'orange';

                      return (
                        <div
                          key={`base_${placement.id}`}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                            isGreen
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                              : isOrange
                              ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                              : 'bg-slate-900 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <NoteImage id={placement.id} src={mat?.image} name={mat?.name} size="xs" />
                            <div className="min-w-0">
                              <div className="font-bold truncate text-[11px] flex items-center gap-1">
                                <span>{mat?.name || placement.id}</span>
                                {isGreen && <span title="Doğru nota + doğru katman">🟢</span>}
                                {isOrange && <span title="Doğru nota + yanlış katman">🟠</span>}
                              </div>
                              <div className="text-[9px] text-slate-400">
                                {isGreen
                                  ? 'Doğru nota + doğru katman (Kilitli)'
                                  : isOrange
                                  ? 'Doğru nota + yanlış katman'
                                  : 'Yeni Deneme'}
                              </div>
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            {isGreen ? (
                              <span title="Kilitli bilgi" className="text-emerald-400 p-1">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : isOrange ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'top')}
                                  title="Üst Katmana Taşı"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                                >
                                  → Üst
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'middle')}
                                  title="Orta Katmana Taşı"
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                                >
                                  → Orta
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTier(placement.id, 'middle')}
                                  title="Orta Katmana Taşı"
                                  className="p-1 rounded text-[10px] text-slate-400 hover:text-white"
                                >
                                  → Orta
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNote(placement.id)}
                                  title="Kaldır"
                                  className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Note Button */}
              <button
                type="button"
                onClick={() => setPickerTargetTier('base')}
                className="w-full mt-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Alt Nota Ekle</span>
              </button>
            </div>

          </div>

          {/* SUBMIT ATTEMPT BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              💡 Formülü test ettiğinizde sistem seçimlerinizi değerlendirecek; yeşil ve turuncu notalar kilitlenecek, gri notalar elenecektir.
            </div>

            <button
              type="button"
              disabled={isSubmitting || totalNotesCount === 0}
              onClick={handleSubmitAttempt}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FlaskConical className="w-4 h-4 text-slate-950" />
              <span>
                {isSubmitting
                  ? 'Parfümatör Analiz Ediyor...'
                  : `⚗️ ${currentStageNumber}. Tahmini Test Et (${secret.attemptsLeft} Hak Kaldı)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* NOTE PICKER MODAL / DRAWER */}
      {pickerTargetTier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Nota Seçimi:</span>
                  <span className="text-amber-400 font-mono">
                    {pickerTargetTier === 'top'
                      ? '1. Üst Nota'
                      : pickerTargetTier === 'middle'
                      ? '2. Orta Nota'
                      : '3. Alt Nota'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Formüle eklemek istediğiniz hammaddeyi katalogdan seçin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPickerTargetTier(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nota veya koku ara..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat === 'ALL' ? 'Tümü' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Raw materials list */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredMaterials.map((mat) => {
                const isAlreadyPlaced = placedIds.has(mat.id);

                return (
                  <button
                    key={mat.id}
                    type="button"
                    disabled={isAlreadyPlaced}
                    onClick={() => handleSelectNewNote(mat.id)}
                    className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all ${
                      isAlreadyPlaced
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed'
                        : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/50 text-slate-200'
                    }`}
                  >
                    <NoteImage id={mat.id} src={mat.image} name={mat.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate flex items-center gap-1">
                        <span>{mat.name}</span>
                        {isAlreadyPlaced && <span className="text-[10px] text-amber-400">✓</span>}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">
                        {mat.category || 'Esans'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPickerTargetTier(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAHMİN SONUCU MODAL / DETAILED REPORT (EXACT FORMAT FROM PROMPT) */}
      {showResultModal && lastAttemptResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            
            {/* Header: "1. Tahmin: 2/5 Nota Doğru" */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  🔬 ARAŞTIRMA RAPORU
                </div>
                <h4 className="text-lg font-black font-serif text-white mt-0.5">
                  {lastAttemptResult.attemptNumber}. Tahmin: {lastAttemptResult.correctCount}/{lastAttemptResult.totalGuessed || lastAttemptResult.evaluatedNotes?.length || 0} Nota Doğru
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Evaluated Notes List (Green, Orange, Gray) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nota Değerlendirme Sonuçları:
              </span>

              <div className="space-y-2">
                {lastAttemptResult.evaluatedNotes?.map((en) => {
                  const isGreen = en.status === 'green';
                  const isOrange = en.status === 'orange';
                  const isGray = en.status === 'gray';

                  return (
                    <div
                      key={`ev_${en.id}_${en.tier}`}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                        isGreen
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                          : isOrange
                          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">
                          {isGreen ? '🟢' : isOrange ? '🟠' : '⚪'}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs">
                            {en.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Denenen Katman: {en.tier === 'top' ? 'Üst' : en.tier === 'middle' ? 'Orta' : 'Alt'} Nota
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                          isGreen
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isOrange
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {en.statusText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parfümörün Nota Yoğunluğu Yorumu */}
            {lastAttemptResult.densityComment && (
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                  <span>🔍 Parfümatör Nota Yoğunluğu Yorumu:</span>
                </div>
                <p className="text-slate-300 italic leading-relaxed">
                  "{lastAttemptResult.densityComment}"
                </p>
              </div>
            )}

            {/* Parfümatörün Koku İpucu */}
            {lastAttemptResult.clueComment && (
              <div className="bg-purple-950/30 p-4 rounded-2xl border border-purple-500/30 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-purple-300 text-[11px]">
                  <span>💡 Sonraki Aşama İçin Koku İpucu:</span>
                </div>
                <p className="text-purple-200 italic leading-relaxed">
                  "{lastAttemptResult.clueComment}"
                </p>
              </div>
            )}

            {/* Parfümatör Genel Yorumu */}
            <div className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              💬 <strong>{playerPerfumer.name}:</strong> "{lastAttemptResult.perfumerComment}"
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {lastAttemptResult.isFullyCorrect ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Harika! Deşifre Edilen Formülü Gör</span>
                </button>
              ) : secret.attemptsLeft <= 0 ? (
                <div className="w-full py-3 text-center text-xs font-bold text-rose-400 bg-rose-950/40 rounded-xl border border-rose-500/30">
                  3 Tahmin Hakkınız Tükendi. Bu formül bu dönem deşifre edilemedi.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Sonraki Aşamaya Geç → (Yeşil ve Turuncu Notalar Taşındı, Griler Temizlendi)</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PAST ATTEMPTS HISTORY ACCORDION / LOG */}
      {secret.attempts.length > 0 && (
        <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📜 Önceki Araştırma Raporları ({secret.attempts.length} Deneme)</span>
            </span>
          </div>

          <div className="space-y-2">
            {secret.attempts.map((att) => (
              <div
                key={`att_log_${att.attemptNumber}`}
                className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-amber-400">
                      {att.attemptNumber}. Tahmin:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-mono">
                      {att.correctCount}/{att.totalGuessed || att.evaluatedNotes?.length || 0} Nota Doğru
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(att.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                </div>

                {/* Notes evaluated in this attempt */}
                <div className="flex flex-wrap gap-1.5">
                  {att.evaluatedNotes?.map((en) => {
                    return (
                      <span
                        key={`log_n_${en.id}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${
                          en.status === 'green'
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : en.status === 'orange'
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                        }`}
                      >
                        <span>{en.status === 'green' ? '🟢' : en.status === 'orange' ? '🟠' : '⚪'}</span>
                        <span>{en.name}</span>
                      </span>
                    );
                  })}
                </div>

                {att.densityComment && (
                  <p className="text-[11px] text-slate-400 italic">
                    "{att.densityComment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
