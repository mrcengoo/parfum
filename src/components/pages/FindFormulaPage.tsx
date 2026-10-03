import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfume, RecipeItem } from '../../types';
import { NoteImage } from '../common/NoteImage';
import {
  Compass,
  FlaskConical,
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Zap,
  Award,
  Flame,
  Layers,
  Heart,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Crown,
  Coins,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  Dna
} from 'lucide-react';

// Pool of candidate raw materials for Top (Üst) - 15 materials
const TOP_NOTE_POOL = [
  'bergamot', 'limon', 'greyfurt', 'nane', 'pembe_biber',
  'karabiber', 'elma', 'ananas', 'yesil_cay', 'lavanta',
  'ahududu', 'aldehitler', 'lici', 'biberiye', 'deniz_notalari'
];

// Pool of candidate raw materials for Middle (Orta) - 16 materials
const MID_NOTE_POOL = [
  'yasemin', 'gul', 'iris', 'portakal_cicegi', 'tarcin',
  'kakule', 'sichuan_biberi', 'tonka_fasulyesi', 'kakao', 'kahve',
  'orkide', 'bal', 'visne', 'erik', 'subulteber', 'osmanthus'
];

// Pool of candidate raw materials for Base (Alt) - 14 materials
const BASE_NOTE_POOL = [
  'vanilya', 'sandal_agaci', 'sedir_agaci', 'paculi', 'vetiver',
  'oud', 'amber', 'ambroksan', 'misk', 'deri',
  'tütün_yapragi', 'tutsu', 'hus_agaci', 'meyan_koku'
];

// Formula Architectures (Damla / Oran yapısı): 4/4/3, 5/4/5, 6/4/5, 3/4/2, 2/5/3
export interface FormulaArchitecture {
  id: string;
  topDrops: number;
  midDrops: number;
  baseDrops: number;
  label: string;
  desc: string;
}

export const ARCHITECTURES: FormulaArchitecture[] = [
  { id: '4_4_3', topDrops: 4, midDrops: 4, baseDrops: 3, label: '4 / 4 / 3', desc: 'Dengeli Piramit (4 Üst · 4 Orta · 3 Alt Damla Oranı)' },
  { id: '5_4_5', topDrops: 5, midDrops: 4, baseDrops: 5, label: '5 / 4 / 5', desc: 'Zengin Gövde (5 Üst · 4 Orta · 5 Alt Damla Oranı)' },
  { id: '6_4_5', topDrops: 6, midDrops: 4, baseDrops: 5, label: '6 / 4 / 5', desc: 'Ferah Açılışlı (6 Üst · 4 Orta · 5 Alt Damla Oranı)' },
  { id: '3_4_2', topDrops: 3, midDrops: 4, baseDrops: 2, label: '3 / 4 / 2', desc: 'Klasik Minimalist (3 Üst · 4 Orta · 2 Alt Damla Oranı)' },
  { id: '2_5_3', topDrops: 2, midDrops: 5, baseDrops: 3, label: '2 / 5 / 3', desc: 'Çiçeksi Kalp Ağırlıklı (2 Üst · 5 Orta · 3 Alt Damla Oranı)' }
];

const LEGENDARY_PREFIXES = ['Efsanevi', 'Kraliyet', 'İmparatorluk', 'Altın', 'Mistik', 'Kozmik', 'Grand', 'Sovereign'];
const LEGENDARY_MIDDLES = ['Oud', 'Amber', 'Zümrüt', 'Floransa İrisi', 'Gül Nektarı', 'Sedir', 'Elixir', 'Aura'];
const LEGENDARY_SUFFIXES = ['Majestic', 'Imperiale', 'Royale', 'Nobile', 'Supreme', 'Absolu', 'Prestige', 'Extrait'];

interface GameTurnReport {
  turnNumber: number;
  topId: string;
  topStatus: 'correct' | 'wrong';
  midId: string;
  midStatus: 'correct' | 'wrong';
  baseId: string;
  baseStatus: 'correct' | 'wrong';
  comment: string;
}

export const FindFormulaPage: React.FC = () => {
  const {
    rawMaterialsMap,
    rewardLegendaryPerfume,
    playerPerfumer,
    playerCompany,
    perfumes,
    addToast,
    deductCompanyCash,
    setActiveTab
  } = useGame();

  // Active Architecture (4/4/3, 5/4/5, 6/4/5, 3/4/2, 2/5/3) - changes randomly after each round/game
  const [currentArchitecture, setCurrentArchitecture] = useState<FormulaArchitecture>(ARCHITECTURES[0]);

  // Fee state (10.000 ₺ per formula project)
  const [isFeePaid, setIsFeePaid] = useState<boolean>(false);

  // Set of already generated formula triads to guarantee 100% uniqueness
  const usedTriadsRef = React.useRef<Set<string>>(new Set());

  // Candidate options for each group: EXACTLY 9 NOTES EACH (3x3 grid)
  const [topOptions, setTopOptions] = useState<string[]>([]);
  const [midOptions, setMidOptions] = useState<string[]>([]);
  const [baseOptions, setBaseOptions] = useState<string[]>([]);

  // EXACT SINGLE SECRET TARGET NOTE FOR EACH GROUP (Strictly kept internal - never displayed to user)
  const [secretTopId, setSecretTopId] = useState<string>('');
  const [secretMidId, setSecretMidId] = useState<string>('');
  const [secretBaseId, setSecretBaseId] = useState<string>('');
  const [secretCodeName, setSecretCodeName] = useState<string>('');

  // Player selections for the current trial (1 per group)
  const [selectedTopId, setSelectedTopId] = useState<string | null>(null);
  const [selectedMidId, setSelectedMidId] = useState<string | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);

  // Group Lives / Attempts (3 per group)
  const [topAttempts, setTopAttempts] = useState<number>(3);
  const [midAttempts, setMidAttempts] = useState<number>(3);
  const [baseAttempts, setBaseAttempts] = useState<number>(3);

  // Solved states for each group
  const [topSolved, setTopSolved] = useState<boolean>(false);
  const [midSolved, setMidSolved] = useState<boolean>(false);
  const [baseSolved, setBaseSolved] = useState<boolean>(false);

  // Eliminated / tested wrong notes
  const [eliminatedTop, setEliminatedTop] = useState<Set<string>>(new Set());
  const [eliminatedMid, setEliminatedMid] = useState<Set<string>>(new Set());
  const [eliminatedBase, setEliminatedBase] = useState<Set<string>>(new Set());

  // Past turn reports
  const [reports, setReports] = useState<GameTurnReport[]>([]);
  const [turnCounter, setTurnCounter] = useState<number>(1);

  // Game over / Won states
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [wonPerfume, setWonPerfume] = useState<Perfume | null>(null);

  // Show "Nasıl Çalışıyor?" explainer modal
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Helper: Shuffle array
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Generate a new random formula game (her denemeden/oyundan sonra random değişir & hiçbiri birbirinin aynısı olamaz!)
  const initNewGame = useCallback((chosenArch?: FormulaArchitecture) => {
    // 1. Pick a random architecture from 4/4/3, 5/4/5, 6/4/5, 3/4/2, 2/5/3
    const arch = chosenArch || ARCHITECTURES[Math.floor(Math.random() * ARCHITECTURES.length)];
    setCurrentArchitecture(arch);

    // Collect all existing registered perfume note signatures
    const existingSignatures = new Set<string>();
    perfumes.forEach((p) => {
      const topSig = [...(p.topNotes || [])].sort().join(',');
      const midSig = [...(p.middleNotes || [])].sort().join(',');
      const baseSig = [...(p.baseNotes || [])].sort().join(',');
      existingSignatures.add(`${topSig}::${midSig}::${baseSig}`);
    });

    let top12: string[] = [];
    let mid12: string[] = [];
    let base12: string[] = [];
    let targetTop = '';
    let targetMid = '';
    let targetBase = '';
    let attempts = 0;

    do {
      attempts++;
      // 2. Select EXACTLY 12 candidate notes per group (3x4 grid - much harder to guess by luck!)
      top12 = shuffle(TOP_NOTE_POOL).slice(0, 12);
      mid12 = shuffle(MID_NOTE_POOL).slice(0, 12);
      base12 = shuffle(BASE_NOTE_POOL).slice(0, 12);

      // 3. Pick 1 true secret note from each group
      targetTop = top12[Math.floor(Math.random() * top12.length)];
      targetMid = mid12[Math.floor(Math.random() * mid12.length)];
      targetBase = base12[Math.floor(Math.random() * base12.length)];

      const triadKey = `${targetTop}::${targetMid}::${targetBase}`;
      if (!existingSignatures.has(triadKey) && !usedTriadsRef.current.has(triadKey)) {
        usedTriadsRef.current.add(triadKey);
        break;
      }
    } while (attempts < 50);

    setTopOptions(top12);
    setMidOptions(mid12);
    setBaseOptions(base12);

    setSecretTopId(targetTop);
    setSecretMidId(targetMid);
    setSecretBaseId(targetBase);

    // 4. Random luxury code name with high-entropy unique serial
    const codeP = LEGENDARY_PREFIXES[Math.floor(Math.random() * LEGENDARY_PREFIXES.length)];
    const codeM = LEGENDARY_MIDDLES[Math.floor(Math.random() * LEGENDARY_MIDDLES.length)];
    const codeS = LEGENDARY_SUFFIXES[Math.floor(Math.random() * LEGENDARY_SUFFIXES.length)];
    const serial = Math.floor(Math.random() * 8999) + 1000;
    const codeName = `PROJE ${codeP.toUpperCase()} ${codeM.toUpperCase()} ${codeS.toUpperCase()} N°${serial}`;
    setSecretCodeName(codeName);

    // 5. Reset player state and fee state (player must manually select notes)
    setIsFeePaid(false);
    setSelectedTopId(null);
    setSelectedMidId(null);
    setSelectedBaseId(null);

    setTopAttempts(3);
    setMidAttempts(3);
    setBaseAttempts(3);

    setTopSolved(false);
    setMidSolved(false);
    setBaseSolved(false);

    setEliminatedTop(new Set());
    setEliminatedMid(new Set());
    setEliminatedBase(new Set());

    setReports([]);
    setTurnCounter(1);
    setIsWon(false);
    setIsGameOver(false);
    setWonPerfume(null);
  }, [perfumes]);

  // Initialize on mount
  useEffect(() => {
    initNewGame();
  }, []);

  // Check if player has selected notes for all active (unsolved) groups
  const canTest = useMemo(() => {
    if (isWon || isGameOver) return false;
    const needTop = !topSolved && selectedTopId === null;
    const needMid = !midSolved && selectedMidId === null;
    const needBase = !baseSolved && selectedBaseId === null;
    return !needTop && !needMid && !needBase;
  }, [isWon, isGameOver, topSolved, midSolved, baseSolved, selectedTopId, selectedMidId, selectedBaseId]);

  // Test current guess
  const handleTestFormula = () => {
    if (isWon || isGameOver) return;

    if (!canTest) {
      const missing: string[] = [];
      if (!topSolved && !selectedTopId) missing.push('1. Üst Nota');
      if (!midSolved && !selectedMidId) missing.push('2. Orta Nota');
      if (!baseSolved && !selectedBaseId) missing.push('3. Alt Nota');
      addToast({
        type: 'warning',
        title: 'Eksik Nota Seçimi',
        message: `Test edebilmek için şu katmanlardan 1'er aday nota seçmelisiniz: ${missing.join(', ')}.`
      });
      return;
    }

    // Fee Check: 10.000 ₺ per formula project
    if (!isFeePaid) {
      if (playerCompany.cash < 10000) {
        addToast({
          type: 'error',
          title: 'Yetersiz Şirket Bakiyesi',
          message: 'Formülü Bul deşifre masasına katılmak için şirket kasasında en az 10.000 ₺ bulunmalıdır.'
        });
        return;
      }
      const success = deductCompanyCash(10000, `Formülü Bul AR-GE Deşifre Ücreti: ${secretCodeName}`, 'rnd_expense');
      if (!success) {
        addToast({
          type: 'error',
          title: 'İşlem Başarısız',
          message: 'Deşifre masası ücreti tahsil edilemedi.'
        });
        return;
      }
      setIsFeePaid(true);
      addToast({
        type: 'info',
        title: '🏺 10.000 ₺ Deşifre Ücreti Ödendi',
        message: 'Deşifre masası analiz ücreti şirket kasasından tahsil edildi. Koku testi yapılıyor...'
      });
    }

    let newTopSolved = topSolved;
    let newMidSolved = midSolved;
    let newBaseSolved = baseSolved;

    let newTopAttempts = topAttempts;
    let newMidAttempts = midAttempts;
    let newBaseAttempts = baseAttempts;

    const nextElimTop = new Set(eliminatedTop);
    const nextElimMid = new Set(eliminatedMid);
    const nextElimBase = new Set(eliminatedBase);

    // TEST 1. ÜST NOTA: EXACT MATCH CHECK
    let topStatus: 'correct' | 'wrong' = 'correct';
    if (!topSolved && selectedTopId) {
      if (selectedTopId === secretTopId) {
        newTopSolved = true;
        setTopSolved(true);
      } else {
        topStatus = 'wrong';
        newTopAttempts = Math.max(0, topAttempts - 1);
        setTopAttempts(newTopAttempts);
        nextElimTop.add(selectedTopId);
        setEliminatedTop(nextElimTop);
        setSelectedTopId(null);
      }
    }

    // TEST 2. ORTA NOTA: EXACT MATCH CHECK
    let midStatus: 'correct' | 'wrong' = 'correct';
    if (!midSolved && selectedMidId) {
      if (selectedMidId === secretMidId) {
        newMidSolved = true;
        setMidSolved(true);
      } else {
        midStatus = 'wrong';
        newMidAttempts = Math.max(0, midAttempts - 1);
        setMidAttempts(newMidAttempts);
        nextElimMid.add(selectedMidId);
        setEliminatedMid(nextElimMid);
        setSelectedMidId(null);
      }
    }

    // TEST 3. ALT NOTA: EXACT MATCH CHECK
    let baseStatus: 'correct' | 'wrong' = 'correct';
    if (!baseSolved && selectedBaseId) {
      if (selectedBaseId === secretBaseId) {
        newBaseSolved = true;
        setBaseSolved(true);
      } else {
        baseStatus = 'wrong';
        newBaseAttempts = Math.max(0, baseAttempts - 1);
        setBaseAttempts(newBaseAttempts);
        nextElimBase.add(selectedBaseId);
        setEliminatedBase(nextElimBase);
        setSelectedBaseId(null);
      }
    }

    // Abstract feedback without revealing the secret notes
    const correctCount = (newTopSolved ? 1 : 0) + (newMidSolved ? 1 : 0) + (newBaseSolved ? 1 : 0);
    let perfumerNote = '';

    if (correctCount === 3) {
      perfumerNote = `Muazzam bir burun ustalığı! Üst, Kalp ve Dip katmanlarının gizli notaları tam 12'den vuruldu! Formül kusursuz şekilde kilitlendi.`;
    } else if (correctCount === 2) {
      perfumerNote = `Çok yaklaştınız! 2 katman başarıyla çözüldü ve kilitlendi. Son katmanda kalan haklarınıza dikkat edin.`;
    } else if (correctCount === 1) {
      perfumerNote = `1 katman doğru bulundu ve kilitlendi! Yanlış seçilen notalar elendi.`;
    } else {
      perfumerNote = `Bu denemede doğru nota tutturulamadı. Denenen yanlış notalar elendi, kalan haklarınızla alternatiflere odaklanın.`;
    }

    const newReport: GameTurnReport = {
      turnNumber: turnCounter,
      topId: selectedTopId || '',
      topStatus,
      midId: selectedMidId || '',
      midStatus,
      baseId: selectedBaseId || '',
      baseStatus,
      comment: perfumerNote
    };

    setReports([newReport, ...reports]);
    setTurnCounter((prev) => prev + 1);

    // CHECK VICTORY (All 3 groups correctly found!)
    if (newTopSolved && newMidSolved && newBaseSolved) {
      setIsWon(true);

      // Build a full 6-to-8 note pyramid around the 3 solved key notes (2-3 Top, 2-3 Mid, 2 Base)
      const topTargetCount = currentArchitecture.topDrops >= 5 ? 3 : 2;
      const midTargetCount = currentArchitecture.midDrops >= 5 ? 3 : 2;
      const baseTargetCount = currentArchitecture.baseDrops >= 5 ? 3 : 2;

      const extraTop = topOptions.filter((id) => id !== secretTopId).slice(0, topTargetCount - 1);
      const extraMid = midOptions.filter((id) => id !== secretMidId).slice(0, midTargetCount - 1);
      const extraBase = baseOptions.filter((id) => id !== secretBaseId).slice(0, baseTargetCount - 1);

      const finalTopNotes = [secretTopId, ...extraTop];
      const finalMidNotes = [secretMidId, ...extraMid];
      const finalBaseNotes = [secretBaseId, ...extraBase];
      const allFormulaNotes = [...finalTopNotes, ...finalMidNotes, ...finalBaseNotes];

      const recipeItems: RecipeItem[] = [
        ...finalTopNotes.map((id) => ({
          rawMaterialId: id,
          amount: 80, // 100 şişede 8 birim esans
          noteType: 'top' as const,
          drops: currentArchitecture.topDrops
        })),
        ...finalMidNotes.map((id) => ({
          rawMaterialId: id,
          amount: 110, // 100 şişede 11 birim esans
          noteType: 'middle' as const,
          drops: currentArchitecture.midDrops
        })),
        ...finalBaseNotes.map((id) => ({
          rawMaterialId: id,
          amount: 130, // 100 şişede 13 birim esans
          noteType: 'base' as const,
          drops: currentArchitecture.baseDrops
        }))
      ];

      // Calculate Quality Tier (Kaliteli / Nadir / Efsanevi) based on:
      // 1) Remaining Hearts (out of 9 ❤️)
      // 2) Perfumer Random 3 Family Matches
      // 3) Total Note Count (6, 7, or 8 notes)
      const remainingHearts = newTopAttempts + newMidAttempts + newBaseAttempts; // 3 to 9
      const usedFamilies = new Set(
        allFormulaNotes.map((id) => rawMaterialsMap.get(id)?.familyGroup).filter(Boolean)
      );
      const perfumerFamilyMatches = (playerPerfumer.bonusFamilies || []).filter((f) =>
        usedFamilies.has(f)
      ).length;

      const baseScore = 74;
      const heartBonus = remainingHearts >= 8 ? 14 : remainingHearts >= 6 ? 9 : remainingHearts >= 5 ? 5 : 2;
      const familyBonus = perfumerFamilyMatches * 3; // +3, +6, +9
      const noteCountBonus = allFormulaNotes.length >= 7 ? 4 : 2;
      const finalQualityScore = Math.min(100, baseScore + heartBonus + familyBonus + noteCountBonus);

      let finalLevel: 'Kaliteli' | 'Nadir' | 'Efsanevi' = 'Kaliteli';
      let retailPrice = 1350;
      let rewardCash = 15000;

      if (finalQualityScore >= 92 && remainingHearts >= 7) {
        finalLevel = 'Efsanevi';
        retailPrice = 2850 + perfumerFamilyMatches * 200;
        rewardCash = 35000;
      } else if (finalQualityScore >= 85 && remainingHearts >= 5) {
        finalLevel = 'Nadir';
        retailPrice = 1750 + perfumerFamilyMatches * 150;
        rewardCash = 25000;
      } else {
        finalLevel = 'Kaliteli';
        retailPrice = 1250 + perfumerFamilyMatches * 100;
        rewardCash = 15000;
      }

      const luxuryName = `${playerPerfumer.name} ${finalLevel} Reçete: ${secretCodeName.replace('PROJE ', '')}`;

      const solvedSecretPerfume: Perfume = {
        id: `perfume_secret_${Date.now()}`,
        name: luxuryName,
        brand: playerCompany.name,
        companyId: playerCompany.id,
        producerCompanyId: playerCompany.id,
        companyName: playerCompany.name,
        perfumerId: playerPerfumer.id,
        perfumerName: playerPerfumer.name,
        gender: 'UNISEX',
        sourceType: 'SECRET',
        quality: finalQualityScore,
        originality: Math.min(99, finalQualityScore - 1),
        noteHarmony: Math.min(100, finalQualityScore + 1),
        trendFit: Math.min(98, finalQualityScore - 2),
        resultLevel: finalLevel,
        topNotes: finalTopNotes,
        middleNotes: finalMidNotes,
        baseNotes: finalBaseNotes,
        notes: allFormulaNotes,
        recipe: recipeItems,
        productionTime: 30,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
        source: 'Formülü Bul Zaferi',
        suggestedRetailPrice: retailPrice,
        description: `Formülü Bul deşifre masasında ${currentArchitecture.label} mimarisi ve ${remainingHearts}/9 kalan hakla çözülerek elde edilen ${allFormulaNotes.length} notalı (${finalTopNotes.length} Üst, ${finalMidNotes.length} Orta, ${finalBaseNotes.length} Alt) ${finalLevel} gizli reçete.`,
        createdAt: Date.now()
      };

      setWonPerfume(solvedSecretPerfume);
      rewardLegendaryPerfume(solvedSecretPerfume, rewardCash, true);
      return;
    }

    // CHECK GAME OVER (any group reaches 0 attempts without being solved)
    const topFailed = !newTopSolved && newTopAttempts === 0;
    const midFailed = !newMidSolved && newMidAttempts === 0;
    const baseFailed = !newBaseSolved && newBaseAttempts === 0;

    if (topFailed || midFailed || baseFailed) {
      setIsGameOver(true);
    }
  };

  // Progressive deduction clues: only revealed AFTER making mistakes in that tier!
  const getTierHint = (tier: 'top' | 'mid' | 'base', attemptsLeft: number, solved: boolean, secretId: string) => {
    const secretMat = rawMaterialsMap.get(secretId);
    if (solved && secretMat) {
      return `✓ Doğru Nota Bulundu: ${secretMat.name} (${secretMat.familyGroup})`;
    }
    if (attemptsLeft === 3 || !secretMat) {
      if (tier === 'top') return 'Açılış katmanındaki 12 adaydan yalnızca 1 tanesi gizli formüle aittir. İlk analizden sonra koku ailesi ipucu açılır.';
      if (tier === 'mid') return 'Kalp katmanındaki 12 adaydan yalnızca 1 tanesi gizli formüle aittir. İlk analizden sonra koku ailesi ipucu açılır.';
      return 'Dip katmanındaki 12 adaydan yalnızca 1 tanesi gizli formüle aittir. İlk analizden sonra koku ailesi ipucu açılır.';
    }
    if (attemptsLeft === 2) {
      return `🔍 1. Analiz İpucu: Aranan gizli nota "${secretMat.familyGroup}" koku ailesine veya "${secretMat.category?.split('·')[0]?.trim()}" grubuna ait!`;
    }
    if (attemptsLeft === 1) {
      const firstLetter = secretMat.name.charAt(0).toUpperCase();
      return `⚠️ SON HAK İPUCU: "${secretMat.familyGroup}" ailesinde ve baş harfi "${firstLetter}..." olan esans! (${secretMat.flag || '🌐'})`;
    }
    return '❌ Bu katmandaki 3 deneme hakkınız da tükendi! Formül bozuldu.';
  };

  const topHint = getTierHint('top', topAttempts, topSolved, secretTopId);
  const midHint = getTierHint('mid', midAttempts, midSolved, secretMidId);
  const baseHint = getTierHint('base', baseAttempts, baseSolved, secretBaseId);

  // List of player's won legendary perfumes
  const wonLegendaryList = useMemo(() => {
    return perfumes.filter(
      (p) => p.source === 'Formülü Bul Zaferi' || (p.resultLevel === 'Efsanevi' && p.producerCompanyId === playerCompany.id)
    );
  }, [perfumes, playerCompany.id]);

  return (
    <div className="space-y-6 pb-24">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-amber-950/60 border border-purple-500/40 p-6 sm:p-7 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Koku Mühendisliği & Tersine Formül Bulma Oyunu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide flex items-center gap-3 flex-wrap">
            <span>Formülü Bul</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              {currentArchitecture.label}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Ücret: 10.000 ₺ {isFeePaid ? '· Ödendi ✓' : '· Masaya Girişte Alınır'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Arka planda rastgele çalışan koku mimarisini deşifre edin! Her nota grubundaki <strong>9 nota arasından gizli olan 1 doğru notayı</strong> bulun. Her grup için <strong>3 hakkınız</strong> var. 3 katmanı da çözerseniz <strong>Efsanevi Parfüm Reçetesi</strong> ve +35.000 ₺ kazanın!
          </p>
        </div>

        {/* Action Buttons & System Guide Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 z-10 shrink-0">
          <button
            type="button"
            onClick={() => setShowHowItWorks(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Nasıl Çalışıyor?</span>
          </button>

          <button
            type="button"
            onClick={() => initNewGame()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Rastgele Formül</span>
          </button>
        </div>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ARCHITECTURE SELECTOR / RANDOM GENERATOR BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-md">
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5 text-amber-400" />
            Arka Planda Çalışan Formül Mimarisi:
          </span>

          <div className="flex flex-wrap gap-1.5">
            {ARCHITECTURES.map((arch) => {
              const isCurrent = currentArchitecture.id === arch.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => initNewGame(arch)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                  title={arch.desc}
                >
                  {arch.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Formül Damla Oranı:</span>
          <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
            {currentArchitecture.topDrops} Üst · {currentArchitecture.midDrops} Orta · {currentArchitecture.baseDrops} Alt Damla
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN GAME WORKBENCH: 3 NOTA GRUBU (HER BİRİNDE 9 NOTA!) */}
      {/* ======================================================== */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl">
        
        {/* Mystery Target Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aktif Gizli Proje:</span>
            </div>
            <h3 className="text-lg font-serif font-black text-white">
              {secretCodeName}
            </h3>
            <div className="text-[11px] text-slate-400">
              Formül Mimarisi: <strong className="text-purple-300">{currentArchitecture.desc}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Çözülen Katman</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">
                {(topSolved ? 1 : 0) + (midSolved ? 1 : 0) + (baseSolved ? 1 : 0)} / 3 Doğru
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Kalite Sınıfı</div>
              <div className="font-mono font-bold text-amber-300 text-sm">
                Kaliteli · Nadir · Efsanevi
              </div>
            </div>
          </div>
        </div>

        {/* GAME OVER / FAILED FORMULA BANNER (NO EXTRA HEARTS EXPLOIT!) */}
        {isGameOver && (
          <div className="bg-rose-950/80 border-2 border-rose-500/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Deşifre Başarısız — Formül Yanlış Analizle Bozuldu!</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Bir nota katmanındaki <strong>3 deneme hakkınız (❤️❤️❤️)</strong> tükendiği için gizli numune bozuldu ve bu proje iptal edildi. Yeni ve rastgele bir gizli formül başlatarak tekrar deneyebilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => initNewGame()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yeni Rastgele Formül Başlat</span>
              </button>
            </div>
          </div>
        )}

        {/* 3 NOTA GRUBU SÜTUNLARI - HER BİRİNDE 9 NOTA (3x3 GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* ====================================================== */}
          {/* 1. ÜST NOTALAR GRUBU (9 NOTA) */}
          {/* ====================================================== */}
          <div
            className={`rounded-2xl p-4 space-y-4 border transition-all flex flex-col justify-between ${
              topSolved
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                : topAttempts === 0
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-slate-950/70 border-rose-500/30'
            }`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    1. Üst Notalar (12 Nota)
                  </span>
                </div>

                {/* Hearts / Attempts */}
                <div className="flex items-center gap-1" title={`${topAttempts} / 3 Hak Kaldı`}>
                  {topSolved ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ÇÖZÜLDÜ
                    </span>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((heart) => (
                        <Heart
                          key={heart}
                          className={`w-3.5 h-3.5 ${
                            heart <= topAttempts
                              ? 'text-rose-500 fill-rose-500'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scent Hint */}
              <div className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{topHint}</span>
              </div>

              {/* 9 Candidate Notes (3x3 Izgara) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Doğru Notayı Seçin:</span>
                  <span className="text-rose-400 font-mono text-[10px]">
                    1 Doğru / 11 Yanlış
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {topOptions.map((optId) => {
                    const mat = rawMaterialsMap.get(optId);
                    const isSelected = selectedTopId === optId;
                    const isEliminated = eliminatedTop.has(optId);
                    const isCorrect = topSolved && optId === selectedTopId;

                    return (
                      <button
                        key={optId}
                        type="button"
                        disabled={topSolved || isEliminated || isGameOver}
                        onClick={() => setSelectedTopId(optId)}
                        className={`p-2 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[82px] relative ${
                          isCorrect
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                            : isEliminated
                            ? 'bg-slate-900/40 border-slate-800/40 opacity-40 line-through cursor-not-allowed text-slate-500'
                            : isSelected
                            ? 'bg-rose-950/70 border-rose-500 text-white ring-2 ring-rose-500/40 shadow-md'
                            : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/40 text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <NoteImage id={optId} src={mat?.image} name={mat?.name} size="xs" />
                          {isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          {isEliminated && (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                        </div>

                        <div className="min-w-0 mt-1">
                          <div className="text-[11px] font-bold truncate leading-tight">
                            {mat?.name || optId}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            {mat?.category?.split('·')[0] || mat?.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Seçim: {selectedTopId ? rawMaterialsMap.get(selectedTopId)?.name : (topSolved ? '✓ Kilitli' : 'Seçilmedi')}</span>
              <span className="font-mono">{topAttempts} Hak Kaldı</span>
            </div>
          </div>

          {/* ====================================================== */}
          {/* 2. ORTA / KALP NOTALARI GRUBU (9 NOTA) */}
          {/* ====================================================== */}
          <div
            className={`rounded-2xl p-4 space-y-4 border transition-all flex flex-col justify-between ${
              midSolved
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                : midAttempts === 0
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-slate-950/70 border-amber-500/30'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    2. Orta / Kalp (12 Nota)
                  </span>
                </div>

                <div className="flex items-center gap-1" title={`${midAttempts} / 3 Hak Kaldı`}>
                  {midSolved ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ÇÖZÜLDÜ
                    </span>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((heart) => (
                        <Heart
                          key={heart}
                          className={`w-3.5 h-3.5 ${
                            heart <= midAttempts
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{midHint}</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Doğru Notayı Seçin:</span>
                  <span className="text-amber-400 font-mono text-[10px]">
                    1 Doğru / 11 Yanlış
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {midOptions.map((optId) => {
                    const mat = rawMaterialsMap.get(optId);
                    const isSelected = selectedMidId === optId;
                    const isEliminated = eliminatedMid.has(optId);
                    const isCorrect = midSolved && optId === selectedMidId;

                    return (
                      <button
                        key={optId}
                        type="button"
                        disabled={midSolved || isEliminated || isGameOver}
                        onClick={() => setSelectedMidId(optId)}
                        className={`p-2 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[82px] relative ${
                          isCorrect
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                            : isEliminated
                            ? 'bg-slate-900/40 border-slate-800/40 opacity-40 line-through cursor-not-allowed text-slate-500'
                            : isSelected
                            ? 'bg-amber-950/70 border-amber-500 text-white ring-2 ring-amber-500/40 shadow-md'
                            : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <NoteImage id={optId} src={mat?.image} name={mat?.name} size="xs" />
                          {isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          {isEliminated && (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                        </div>

                        <div className="min-w-0 mt-1">
                          <div className="text-[11px] font-bold truncate leading-tight">
                            {mat?.name || optId}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            {mat?.category?.split('·')[0] || mat?.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Seçim: {selectedMidId ? rawMaterialsMap.get(selectedMidId)?.name : (midSolved ? '✓ Kilitli' : 'Seçilmedi')}</span>
              <span className="font-mono">{midAttempts} Hak Kaldı</span>
            </div>
          </div>

          {/* ====================================================== */}
          {/* 3. ALT / DİP NOTALARI GRUBU (9 NOTA) */}
          {/* ====================================================== */}
          <div
            className={`rounded-2xl p-4 space-y-4 border transition-all flex flex-col justify-between ${
              baseSolved
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                : baseAttempts === 0
                ? 'bg-purple-950/20 border-purple-500/40'
                : 'bg-slate-950/70 border-purple-500/30'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    3. Alt / Dip (12 Nota)
                  </span>
                </div>

                <div className="flex items-center gap-1" title={`${baseAttempts} / 3 Hak Kaldı`}>
                  {baseSolved ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ÇÖZÜLDÜ
                    </span>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((heart) => (
                        <Heart
                          key={heart}
                          className={`w-3.5 h-3.5 ${
                            heart <= baseAttempts
                              ? 'text-purple-400 fill-purple-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>{baseHint}</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Doğru Notayı Seçin:</span>
                  <span className="text-purple-400 font-mono text-[10px]">
                    1 Doğru / 11 Yanlış
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {baseOptions.map((optId) => {
                    const mat = rawMaterialsMap.get(optId);
                    const isSelected = selectedBaseId === optId;
                    const isEliminated = eliminatedBase.has(optId);
                    const isCorrect = baseSolved && optId === selectedBaseId;

                    return (
                      <button
                        key={optId}
                        type="button"
                        disabled={baseSolved || isEliminated || isGameOver}
                        onClick={() => setSelectedBaseId(optId)}
                        className={`p-2 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[82px] relative ${
                          isCorrect
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                            : isEliminated
                            ? 'bg-slate-900/40 border-slate-800/40 opacity-40 line-through cursor-not-allowed text-slate-500'
                            : isSelected
                            ? 'bg-purple-950/70 border-purple-500 text-white ring-2 ring-purple-500/40 shadow-md'
                            : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/40 text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <NoteImage id={optId} src={mat?.image} name={mat?.name} size="xs" />
                          {isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          {isEliminated && (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                        </div>

                        <div className="min-w-0 mt-1">
                          <div className="text-[11px] font-bold truncate leading-tight">
                            {mat?.name || optId}
                          </div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">
                            {mat?.category?.split('·')[0] || mat?.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Seçim: {selectedBaseId ? rawMaterialsMap.get(selectedBaseId)?.name : (baseSolved ? '✓ Kilitli' : 'Seçilmedi')}</span>
              <span className="font-mono">{baseAttempts} Hak Kaldı</span>
            </div>
          </div>

        </div>

        {/* TEST SUBMISSION CONTROL BAR */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-300 space-y-0.5 text-center sm:text-left">
            <div className="font-bold flex items-center gap-1.5 justify-center sm:justify-start">
              <span>Masa Seçim Durumu:</span>
              <span className="font-mono text-amber-400">
                Üst: {selectedTopId ? '✓ Seçildi' : (topSolved ? '✓ Kilitli' : 'Bekleniyor')} | Orta: {selectedMidId ? '✓ Seçildi' : (midSolved ? '✓ Kilitli' : 'Bekleniyor')} | Alt: {selectedBaseId ? '✓ Seçildi' : (baseSolved ? '✓ Kilitli' : 'Bekleniyor')}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Her gruptan 1 nota seçip gizli formülü test edin. Sadece gerçek formüldeki nota yeşil yanar, yanlışlar elenir!
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isWon ? (
              <button
                type="button"
                onClick={() => initNewGame()}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Zafer! Yeni Rastgele Formül Oyna →</span>
              </button>
            ) : isGameOver ? (
              <button
                type="button"
                onClick={() => initNewGame()}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Formül Yandı — Yeni Rastgele Formül Başlat</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTestFormula}
                className={`w-full sm:w-auto px-7 py-3 rounded-2xl font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer ${
                  canTest
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 shadow-amber-950/40 hover:scale-[1.02]'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>
                  {!canTest
                    ? '👆 Önce 3 Katmandan 1’er Nota Seçin'
                    : !isFeePaid
                    ? '🏺 Formülü Test Et (10.000 ₺ Ücret)'
                    : '🏺 Formülü Test Et (Deşifre Et)'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* TURN REPORTS HISTORY */}
        {reports.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Önceki Araştırma Raporları ({reports.length} Deneme):</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {reports.map((rep) => {
                const topMat = rawMaterialsMap.get(rep.topId);
                const midMat = rawMaterialsMap.get(rep.midId);
                const baseMat = rawMaterialsMap.get(rep.baseId);

                return (
                  <div
                    key={`turn_${rep.turnNumber}`}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-mono font-bold text-amber-400 text-[11px]">
                        {rep.turnNumber}. Tahmin Raporu:
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {rep.topId && (
                          <span
                            className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] flex items-center gap-1 ${
                              rep.topStatus === 'correct'
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <span>Üst: {topMat?.name || rep.topId}</span>
                            <span>{rep.topStatus === 'correct' ? '🟢' : '🔴'}</span>
                          </span>
                        )}

                        {rep.midId && (
                          <span
                            className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] flex items-center gap-1 ${
                              rep.midStatus === 'correct'
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <span>Orta: {midMat?.name || rep.midId}</span>
                            <span>{rep.midStatus === 'correct' ? '🟢' : '🔴'}</span>
                          </span>
                        )}

                        {rep.baseId && (
                          <span
                            className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] flex items-center gap-1 ${
                              rep.baseStatus === 'correct'
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            <span>Alt: {baseMat?.name || rep.baseId}</span>
                            <span>{rep.baseStatus === 'correct' ? '🟢' : '🔴'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic pl-1 leading-relaxed">
                      "{rep.comment}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* "NASIL ÇALIŞIYOR?" EXPLAINER MODAL */}
      {/* ======================================================== */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Compass className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Formül Bul Sistemi Nasıl Çalışıyor?
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Koku Mühendisliği & Deşifre Algoritması Kılavuzu
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block text-[11px] uppercase">
                  1. Nota Grubu Başına 9 Aday Nota (1 Doğru, 8 Yanlış):
                </span>
                <p>
                  Her grupta (Üst, Orta, Alt) <strong>9 adet aday nota</strong> yer alır. Bu 9 nota arasından <strong>yalnızca 1 tanesi</strong> arka plandaki gizli formüle aittir! Geriye kalan 8 nota ise şaşırtmacadır.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-purple-400 block text-[11px] uppercase">
                  2. Arka Planda Dinamik Koku Mimarisi (4/4/3, 5/4/5, 6/4/5 vb.):
                </span>
                <p>
                  Sistem arka planda her yeni oyunda rastgele bir parfüm damla oranı seçer (<strong>4/4/3, 5/4/5, 6/4/5, 3/4/2, 2/5/3</strong>). Bu oranlar parfümün gövde dengesini belirler.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400 block text-[11px] uppercase">
                  3. Her Gruptan 1 Seçim ve 3 Deneme Hakkı (❤️❤️❤️):
                </span>
                <p>
                  Her gruptan 1'er nota seçip <strong>"Formülü Test Et"</strong> butonuna basarsınız. Eğer seçtiğiniz nota gizli formülün doğru notasıysa yeşile dönüp kilitlenir (🟢). Yanlışsa o katmanın hakkı 1 azalır ve o yanlış nota elenir.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block text-[11px] uppercase">
                  4. Üst / Orta / Alt Notalar Kaç Hammadde İstiyor &amp; Hangi Kalite Neye Göre Çıkıyor?
                </span>
                <p>
                  Çözülen her gizli reçete toplam <strong>6 ile 8 farklı hammaddeden</strong> (<strong>2–3 Üst + 2–3 Orta + 2–3 Alt nota</strong>) oluşur. 100 şişelik tam parti üretimde her Üst nota <strong>8 birim</strong>, her Orta nota <strong>11 birim</strong>, her Alt nota <strong>13 birim</strong> esans ister. Çıkan kalite ise <strong>Kalan Kalp Hakkınız (❤️) + Parfümatör 3 Aile Bonusu Eşleşmesi + Mimari Nota Sayısına</strong> göre belirlenir:
                  <br />• <strong>👑 Efsanevi (92–100 Puan):</strong> En az 7–9 kalan kalp hakkı + Parfümatör aile uyumu
                  <br />• <strong>💎 Nadir (85–91 Puan):</strong> 5–6 kalan kalp hakkı + 6–7 hammadde
                  <br />• <strong>✨ Kaliteli (78–84 Puan):</strong> Son haklarda (3–4 kalp) çözülen 6 hammaddeli reçete
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Anladım, Deşifre Masasına Dön
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VICTORY CELEBRATION MODAL (DOĞRU NOTA İSİMLERİ VERİLMEZ) */}
      {/* ======================================================== */}
      {isWon && wonPerfume && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950 border-2 border-emerald-500/60 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center text-slate-950 text-3xl mx-auto shadow-lg shadow-emerald-500/30">
              🏆
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                FORMÜL BAŞARIYLA ÇÖZÜLDÜ! ({currentArchitecture.label})
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-white">
                Efsanevi Parfüm Reçetesi Kazanıldı!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Tebrikler! 3 nota katmanını da ustalıkla deşifre ettiniz. Bu paha biçilmez gizli reçete şirketinizin portföyüne kalıcı olarak mühürlendi.
              </p>
            </div>

            {/* Won Perfume Badge */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/40 text-left flex gap-4 items-center">
              <img
                src={wonPerfume.image}
                alt={wonPerfume.name}
                className="w-20 h-20 rounded-2xl object-cover border border-emerald-500/50 shadow-md shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    %100 Kusursuz Kalite
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    +35.000 ₺ Ödül
                  </span>
                </div>
                <h4 className="text-base font-bold text-white truncate">
                  {wonPerfume.name}
                </h4>
                <div className="text-xs text-amber-400 font-mono font-bold">
                  Perakende Satış Değeri: {wonPerfume.suggestedRetailPrice} ₺ / Şişe
                </div>
              </div>
            </div>

            {/* Secret Formula Mystery Archive - No note names revealed */}
            <div className="text-left bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-300 text-[11px] uppercase flex items-center justify-between">
                <span>Formül Mühür Durumu:</span>
                <span className="text-emerald-400 font-mono">Patentlendi & Korundu</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Gizli Mimari Oranı:</span>
                  <span className="font-mono text-amber-300 font-bold">{currentArchitecture.desc}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Reçete Güvenliği:</span>
                  <span className="text-purple-300 font-bold">Mühürlü Özel Arşiv (Üretime Hazır)</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Kalite Seviyesi:</span>
                  <span className="text-emerald-400 font-bold font-mono">%100 Kusursuz Efsanevi Seviye</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsWon(false);
                  setActiveTab('production');
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Fabrikada Hemen Üret</span>
              </button>

              <button
                type="button"
                onClick={() => initNewGame()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yeni Rastgele Formül Çöz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WON LEGENDARY RECIPES SHELF */}
      {/* ======================================================== */}
      {wonLegendaryList.length > 0 && (
        <div className="space-y-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Deşifre Masasında Kazandığınız Efsanevi Reçeteler ({wonLegendaryList.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Şirket Koleksiyonu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wonLegendaryList.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 flex gap-3 items-center justify-between"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      {p.suggestedRetailPrice} ₺ • %{p.quality} Kalite
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('production')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
                  title="Üretime Git"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Üret</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
