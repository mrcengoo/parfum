import {
  RawMaterial,
  RecipeItem,
  RndResult,
  GenderType,
  Perfume,
  Perfumer,
  Company,
  RndResultLevel,
  FormulaNoteItem,
  NoteType
} from '../types';

export interface FormulaInputItem {
  rawMaterialId: string;
  drops: number;
  noteType: NoteType;
}

export function generateRndFromFormula(
  formulaName: string,
  items: FormulaInputItem[],
  gender: GenderType,
  rawMaterialsMap: Map<string, RawMaterial>,
  company: Company,
  perfumer: Perfumer
): RndResult {
  if (!items || items.length === 0) {
    throw new Error('ParfümATÖR: Reçetede en az 1 nota bulunmalıdır.');
  }

  const validItems = items.filter((it) => it.drops > 0 && it.rawMaterialId);
  if (validItems.length === 0) {
    throw new Error("ParfümATÖR: Damla sayısı 0'dan büyük en az 1 nota olmalıdır.");
  }

  const totalDrops = validItems.reduce((acc, curr) => acc + curr.drops, 0);
  const topItems = validItems.filter((it) => it.noteType === 'top');
  const midItems = validItems.filter((it) => it.noteType === 'middle');
  const baseItems = validItems.filter((it) => it.noteType === 'base');

  const topDrops = topItems.reduce((acc, curr) => acc + curr.drops, 0);
  const midDrops = midItems.reduce((acc, curr) => acc + curr.drops, 0);
  const baseDrops = baseItems.reduce((acc, curr) => acc + curr.drops, 0);

  const topPct = totalDrops > 0 ? Math.round((topDrops / totalDrops) * 100) : 0;
  const midPct = totalDrops > 0 ? Math.round((midDrops / totalDrops) * 100) : 0;
  const basePct = totalDrops > 0 ? Math.max(0, 100 - topPct - midPct) : 0;

  // HASSAS NOTA TERAZİSİ (Kusursuz Altın Oran Piramidi)
  // İdeal Oranlar: Üst: %20-%30, Orta: %40-%50, Alt: %25-%35
  const isTopGolden = topPct >= 20 && topPct <= 30;
  const isMidGolden = midPct >= 40 && midPct <= 50;
  const isBaseGolden = basePct >= 25 && basePct <= 35;

  const isTopGood = topPct >= 18 && topPct <= 35;
  const isMidGood = midPct >= 35 && midPct <= 55;
  const isBaseGood = basePct >= 20 && basePct <= 40;

  let scaleBalanceBonus = 0;
  let scaleCommentary = '';

  if (topDrops === 0 || midDrops === 0 || baseDrops === 0) {
    scaleBalanceBonus = -22;
    scaleCommentary = 'Koku piramidinde eksik kademe var. Üst, orta ve alt notaların her birinde en az 1 damla esans bulunmalıdır.';
  } else if (isTopGolden && isMidGolden && isBaseGolden) {
    scaleBalanceBonus = 10;
    scaleCommentary = `Koku terazisinde piramit dengesi kusursuz; açılış, kalp ve dip akorları altın oranda (%${topPct} / %${midPct} / %${basePct}) birbirine kenetleniyor.`;
  } else if (isTopGood && isMidGood && isBaseGood) {
    scaleBalanceBonus = 3;
    scaleCommentary = `Terazi dağılımı dengeli (%${topPct} / %${midPct} / %${basePct}); piramit kokunun ana omurgasını başarıyla taşıyor.`;
  } else {
    scaleBalanceBonus = -14;
    if (topPct > 40) {
      scaleCommentary = `Terazide üst notalar aşırı baskın (%${topPct}); koku hızla buharlaşıp gövdesiz kalabilir.`;
    } else if (basePct > 40) {
      scaleCommentary = `Terazide dip notalar çok ağır bastı (%${basePct}); koku hantal, açılışsız ve boğucu bir yapıya dönüşebilir.`;
    } else if (midPct < 30) {
      scaleCommentary = `Kokunun kalp/orta gövdesi terazide zayıf kaldı (%${midPct}); üst ve dip notalar arasında kopukluk var.`;
    } else {
      scaleCommentary = `Koku terazisinde dengesizlik var (%${topPct} / %${midPct} / %${basePct}); piramit katmanları kaynaşamadı.`;
    }
  }

  // Note IDs
  const topNoteIds = Array.from(new Set(topItems.map((it) => it.rawMaterialId)));
  const middleNoteIds = Array.from(new Set(midItems.map((it) => it.rawMaterialId)));
  const baseNoteIds = Array.from(new Set(baseItems.map((it) => it.rawMaterialId)));
  const allUniqueIds = Array.from(new Set(validItems.map((it) => it.rawMaterialId)));

  const selectedMaterials = allUniqueIds
    .map((id) => rawMaterialsMap.get(id))
    .filter((m): m is RawMaterial => m !== undefined);

  // 1. Harmoni Hesaplaması
  const categories = selectedMaterials.map((m) => m.category || '');
  let baseHarmony = 22;

  const hasCitrus = categories.some((c) => c.includes('Narenciye'));
  const hasFloral = categories.some((c) => c.includes('Çiçeksi'));
  const hasWoody = categories.some((c) => c.includes('Odunsu'));
  const hasGourmand = categories.some((c) => c.includes('Gurme'));
  const hasSpicy = categories.some((c) => c.includes('Baharat'));
  const hasAmber = categories.some((c) => c.includes('Amber'));

  if (hasCitrus && (hasFloral || hasWoody)) baseHarmony += 6;
  if (hasAmber && (hasSpicy || hasGourmand || hasWoody)) baseHarmony += 6;
  if (hasFloral && hasWoody) baseHarmony += 5;
  if (allUniqueIds.length >= 4) baseHarmony += 5;
  if (topNoteIds.length >= 1 && middleNoteIds.length >= 1 && baseNoteIds.length >= 1) baseHarmony += 6;

  const perfumerHarmonyContribution = perfumer.noteHarmony * 1.8;
  const rawHarmonyScore = Math.min(99, Math.max(15, baseHarmony + perfumerHarmonyContribution + scaleBalanceBonus));
  const harmonyScore = Math.round(rawHarmonyScore);

  // 2. Trend Skoru
  let baseTrend = 24;
  if (hasGourmand) baseTrend += 6;
  if (hasAmber) baseTrend += 6;
  if (allUniqueIds.includes('vanilya') || allUniqueIds.includes('safran') || allUniqueIds.includes('ambroksan')) {
    baseTrend += 7;
  }
  const perfumerTrendContribution = perfumer.trendFit * 1.8;
  const trendScore = Math.min(99, Math.max(20, Math.round(baseTrend + perfumerTrendContribution)));

  // 3. Özgünlük Skoru
  const rareNotes = [
    'hus_agaci', 'sichuan_biberi', 'aci_badem', 'vetiver', 'meyan_koku',
    'safran', 'tütün_yapragi', 'bakir', 'tarcin', 'visne', 'iris', 'nane'
  ];
  const rareCount = allUniqueIds.filter((id) => rareNotes.includes(id)).length;
  let rawOriginality = rareCount * 22;
  if (allUniqueIds.includes('bakir') && (hasGourmand || hasFloral)) rawOriginality += 16;
  if (allUniqueIds.includes('tütün_yapragi') && hasCitrus) rawOriginality += 12;
  if (allUniqueIds.length >= 6) rawOriginality += 8;
  const originalityScore = Math.min(99, Math.max(0, Math.round(rawOriginality)));

  // 4. Genel Kalite Skoru
  const perfumerRdBonus = perfumer.rdLevel * 1.2;
  const weightedQuality = (harmonyScore * 0.54) + (trendScore * 0.24) + perfumerRdBonus + (scaleBalanceBonus >= 10 ? 4 : scaleBalanceBonus < 0 ? scaleBalanceBonus : 0);
  const qualityScore = Math.min(99, Math.max(15, Math.round(weightedQuality)));

  // 5. PARFÜM KALİTE SEVİYESİ (Hassas & Zorlayıcı Eşikler):
  // Nadir ve Efsanevi artık sadece kusursuz piramit terazisinde ve yüksek harmonide çıkar!
  let resultLevel: RndResultLevel = 'Standart';
  if (qualityScore >= 92 && harmonyScore >= 88 && scaleBalanceBonus >= 10 && allUniqueIds.length >= 5) {
    resultLevel = 'Efsanevi';
  } else if (qualityScore >= 84 && harmonyScore >= 80 && scaleBalanceBonus >= 10 && allUniqueIds.length >= 4) {
    resultLevel = 'Nadir';
  } else if (qualityScore >= 70 && harmonyScore >= 66) {
    resultLevel = 'Kaliteli';
  } else if (qualityScore >= 52) {
    resultLevel = 'Standart';
  } else if (qualityScore >= 38) {
    resultLevel = 'Sıradan';
  } else {
    resultLevel = 'Basit';
  }

  // Parfüm Adı
  const name = formulaName.trim() || `${company.name} No. ${Math.floor(Math.random() * 900 + 100)}`;

  // Recipe for 100-bottle production
  const recipeMap = new Map<string, { amount: number; noteType: NoteType; drops: number; rawMaterialName: string }>();
  validItems.forEach((it) => {
    const mat = rawMaterialsMap.get(it.rawMaterialId);
    const existing = recipeMap.get(it.rawMaterialId);
    if (existing) {
      existing.drops += it.drops;
      existing.amount += it.drops * 10;
    } else {
      recipeMap.set(it.rawMaterialId, {
        amount: it.drops * 10,
        noteType: it.noteType,
        drops: it.drops,
        rawMaterialName: mat?.name || it.rawMaterialId
      });
    }
  });

  const recipe: RecipeItem[] = Array.from(recipeMap.entries()).map(([rawMaterialId, val]) => ({
    rawMaterialId,
    amount: val.amount,
    noteType: val.noteType,
    drops: val.drops,
    rawMaterialName: val.rawMaterialName
  }));

  const formulaItems: FormulaNoteItem[] = validItems.map((it) => ({
    rawMaterialId: it.rawMaterialId,
    rawMaterialName: rawMaterialsMap.get(it.rawMaterialId)?.name || it.rawMaterialId,
    drops: it.drops,
    noteType: it.noteType
  }));

  // Production cost and retail price
  let batchMatCost = 0;
  recipe.forEach((r) => {
    const mat = rawMaterialsMap.get(r.rawMaterialId);
    batchMatCost += r.amount * (mat?.price || 100);
  });
  const productionCost = Math.round((batchMatCost * 1.5 + 4500) / 100);

  let priceMultiplier = 1.5;
  if (resultLevel === 'Efsanevi') priceMultiplier = 3.2;
  else if (resultLevel === 'Nadir') priceMultiplier = 2.4;
  else if (resultLevel === 'Kaliteli') priceMultiplier = 1.9;
  else if (resultLevel === 'Standart') priceMultiplier = 1.5;
  else if (resultLevel === 'Sıradan') priceMultiplier = 1.2;
  else priceMultiplier = 1.05;

  const estimatedMarketPrice = Math.round(productionCost * priceMultiplier);
  const notesSummary = `${topDrops} Damla Üst, ${midDrops} Damla Orta, ${baseDrops} Damla Alt Nota (${selectedMaterials.map((m) => m.name).slice(0, 4).join(', ')}...)`;

  const perfumerReview = generateRndPerfumerReview(
    perfumer,
    qualityScore,
    originalityScore,
    harmonyScore,
    trendScore,
    resultLevel,
    selectedMaterials,
    scaleCommentary
  );

  return {
    id: `rnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    companyId: company.id,
    companyName: company.name,
    perfumerId: perfumer.id,
    perfumerName: perfumer.name,
    gender,
    topNotes: topNoteIds,
    middleNotes: middleNoteIds,
    baseNotes: baseNoteIds,
    totalNotesCount: allUniqueIds.length,
    qualityScore,
    originalityScore,
    harmonyScore,
    trendScore,
    resultLevel,
    estimatedMarketPrice,
    productionCost,
    productionTime: 30,
    recipe,
    notesSummary,
    perfumerReview,
    designFee: perfumer.designFee,
    royaltyRate: perfumer.royaltyRate,
    createdAt: Date.now(),
    totalDrops,
    topDrops,
    midDrops,
    baseDrops,
    topPercentage: topPct,
    midPercentage: midPct,
    basePercentage: basePct,
    formulaItems
  };
}

const ADJECTIVES = [
  'Royal', 'Velvet', 'Mystic', 'Solar', 'Imperial', 'Aura', 'Celestial',
  'Noir', 'Golden', 'Opulent', 'Midnight', 'Ethereal', 'Silk', 'Amber', 'Obsidian', 'Lumière'
];

const NOUNS = [
  'Santal', 'Oud', 'Fleur', 'Rose', 'Cuir', 'Nectar', 'Extrait', 'Élixir', 'Essence', 'Parfum', 'Ambre', 'Vanille'
];

export function generateRndPerfume(
  topNoteIds: string[],
  middleNoteIds: string[],
  baseNoteIds: string[],
  gender: GenderType,
  rawMaterialsMap: Map<string, RawMaterial>,
  company: Company,
  perfumer: Perfumer,
  customAmounts?: Record<string, number>
): RndResult {
  if (topNoteIds.length === 0 || middleNoteIds.length === 0 || baseNoteIds.length === 0) {
    throw new Error('ParfümATÖR: Lütfen en az 1 üst nota, 1 orta nota ve 1 alt nota seçiniz.');
  }

  const allSelectedIds = [...topNoteIds, ...middleNoteIds, ...baseNoteIds];
  const selectedMaterials = allSelectedIds
    .map((id) => rawMaterialsMap.get(id))
    .filter((m): m is RawMaterial => m !== undefined);

  // --- NOTA TERAZİSİ VE PİRAMİT DENGESİ HASSASİYETİ ---
  let topWeight = 0;
  let midWeight = 0;
  let baseWeight = 0;

  if (customAmounts) {
    topNoteIds.forEach((id) => { topWeight += (customAmounts[id] || 0); });
    middleNoteIds.forEach((id) => { midWeight += (customAmounts[id] || 0); });
    baseNoteIds.forEach((id) => { baseWeight += (customAmounts[id] || 0); });
  }

  const totalWeight = topWeight + midWeight + baseWeight;
  const topPct = totalWeight > 0 ? (topWeight / totalWeight) * 100 : (topNoteIds.length / allSelectedIds.length) * 100;
  const midPct = totalWeight > 0 ? (midWeight / totalWeight) * 100 : (middleNoteIds.length / allSelectedIds.length) * 100;
  const basePct = totalWeight > 0 ? (baseWeight / totalWeight) * 100 : (baseNoteIds.length / allSelectedIds.length) * 100;

  // İdeal Parfüm Terazisi Hassasiyeti:
  // Üst Notalar: %15 - %45 (Açılış)
  // Kalp/Orta: %30 - %60 (Karakter & Gövde)
  // Dip/Temel: %15 - %45 (Kalıcılık)
  let scaleBalanceBonus = 0;
  let scaleCommentary = '';

  const isTopBalanced = topPct >= 15 && topPct <= 45;
  const isMidBalanced = midPct >= 30 && midPct <= 60;
  const isBaseBalanced = basePct >= 15 && basePct <= 45;

  if (isTopBalanced && isMidBalanced && isBaseBalanced) {
    scaleBalanceBonus = 12;
    scaleCommentary = 'Koku terazisinde piramit dengesi kusursuz; açılış, gövde ve dip katmanlar muazzam bir akıcılıkla birbirine kenetleniyor.';
  } else if ((isTopBalanced && isMidBalanced) || (isMidBalanced && isBaseBalanced)) {
    scaleBalanceBonus = 3;
    scaleCommentary = 'Terazi dağılımı kabul edilebilir seviyede; piramit kokunun ana omurgasını taşımaya yetiyor.';
  } else {
    scaleBalanceBonus = -16;
    if (topPct > 50) {
      scaleCommentary = 'Terazide üst notalar aşırı baskın (%' + Math.round(topPct) + '); parfüm ilk 15 dakikada hızla buharlaşıp gövdesiz kalabilir.';
    } else if (basePct > 55) {
      scaleCommentary = 'Terazide dip notalar çok ağır bastı (%' + Math.round(basePct) + '); koku hantal, açılışsız ve boğucu bir yapıya dönüştü.';
    } else if (midPct < 25) {
      scaleCommentary = 'Kokunun kalp/orta gövdesi terazide çok zayıf kaldı (%' + Math.round(midPct) + '); üst ve dip notalar arasında derin bir kopukluk var.';
    } else {
      scaleCommentary = 'Koku terazisinde belirgin bir dengesizlik var; piramit katmanları birbiriyle uyumlu kaynaşamadı.';
    }
  }

  // 1. Koku / Nota Uyumu (Note Harmony) Hesaplaması:
  const categories = selectedMaterials.map((m) => m.category || '');
  let baseHarmony = 30;

  const hasCitrus = categories.some((c) => c.includes('Narenciye'));
  const hasFloral = categories.some((c) => c.includes('Çiçeksi'));
  const hasWoody = categories.some((c) => c.includes('Odunsu'));
  const hasGourmand = categories.some((c) => c.includes('Gurme'));
  const hasSpicy = categories.some((c) => c.includes('Baharat'));
  const hasAmber = categories.some((c) => c.includes('Amber'));

  // Akor uyumları
  if (hasCitrus && (hasFloral || hasWoody)) baseHarmony += 8;
  if (hasAmber && (hasSpicy || hasGourmand || hasWoody)) baseHarmony += 8;
  if (hasFloral && hasWoody) baseHarmony += 6;
  if (topNoteIds.length >= 2 && middleNoteIds.length >= 2 && baseNoteIds.length >= 2) baseHarmony += 6;

  // Parfümör Nota Uyumu etkisi (1-10 puan arası)
  const perfumerHarmonyContribution = perfumer.noteHarmony * 2.2;
  const rawHarmonyScore = Math.min(99, Math.max(15, baseHarmony + perfumerHarmonyContribution + scaleBalanceBonus + (Math.random() * 6 - 3)));
  const harmonyScore = Math.round(rawHarmonyScore);

  // 2. Trend Uyumu (Trend Fit) Hesaplaması:
  let baseTrend = 28;
  if (hasGourmand) baseTrend += 8;
  if (hasAmber) baseTrend += 8;
  if (allSelectedIds.includes('vanilya') || allSelectedIds.includes('safran') || allSelectedIds.includes('ambroksan')) {
    baseTrend += 8;
  }
  const perfumerTrendContribution = perfumer.trendFit * 2.4;
  const rawTrendScore = Math.min(99, Math.max(20, baseTrend + perfumerTrendContribution + (Math.random() * 6 - 3)));
  const trendScore = Math.round(rawTrendScore);

  // 3. Özgünlük (Originality) Hesaplaması:
  const rareNotes = [
    'hus_agaci', 'sichuan_biberi', 'aci_badem', 'vetiver', 'meyan_koku',
    'safran', 'tütün_yapragi', 'bakir', 'tarcin', 'visne', 'iris', 'nane'
  ];
  const rareCount = allSelectedIds.filter((id) => rareNotes.includes(id)).length;
  
  let rawOriginality = rareCount * 20;
  if (allSelectedIds.includes('bakir') && (hasGourmand || hasFloral)) rawOriginality += 16;
  if (allSelectedIds.includes('tütün_yapragi') && hasCitrus) rawOriginality += 12;
  if (allSelectedIds.length >= 6) rawOriginality += 8;
  
  const originalityScore = Math.min(99, Math.max(0, Math.round(rawOriginality)));

  // 4. Genel Kalite Skoru (Hassas Terazi Etkili):
  const perfumerRdBonus = perfumer.rdLevel * 1.6;
  const weightedQuality = (harmonyScore * 0.52) + (trendScore * 0.28) + perfumerRdBonus + (scaleBalanceBonus > 0 ? 4 : -8);
  const qualityScore = Math.min(99, Math.max(15, Math.round(weightedQuality)));

  // 5. PARFÜM KALİTE SEVİYESİ (Hassas Eşikler):
  // Nadir ve Efsanevi artık çok kolay çıkmaz, hem yüksek harmoni hem terazi dengesi gerektirir!
  let resultLevel: RndResultLevel = 'Standart';

  if (qualityScore >= 92 && harmonyScore >= 86 && scaleBalanceBonus >= 10) {
    resultLevel = 'Efsanevi';
  } else if (qualityScore >= 82 && harmonyScore >= 76 && scaleBalanceBonus >= 3) {
    resultLevel = 'Nadir';
  } else if (qualityScore >= 68) {
    resultLevel = 'Kaliteli';
  } else if (qualityScore >= 52) {
    resultLevel = 'Standart';
  } else if (qualityScore >= 38) {
    resultLevel = 'Sıradan';
  } else {
    resultLevel = 'Basit';
  }

  // Parfümatör Hattrick Tarzı Keşif Yorumu (Dynamic Scout Commentary)
  const perfumerReview = generateRndPerfumerReview(
    perfumer,
    qualityScore,
    originalityScore,
    harmonyScore,
    trendScore,
    resultLevel,
    selectedMaterials,
    scaleCommentary
  );

  // İsim Oluşturma: Lüks ve tematik
  const firstWord = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const primaryMatName = selectedMaterials[0]?.name.split(' ')[0] || 'Aroma';
  const secondWord = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const name = `${firstWord} ${primaryMatName} ${secondWord}`;

  // 100 adetlik parti için artırılmış ve birbirinden farklı nota miktarları:
  // Üst notalar: 55-95 arası farklı miktarlar
  // Orta notalar: 75-135 arası farklı miktarlar
  // Alt notalar: 85-155 arası farklı miktarlar
  const usedAmounts = new Set<number>();
  const getDistinctAmount = (baseVal: number, tierOffset: number, index: number): number => {
    let val = Math.round(baseVal + (index * 12) - ((index % 2) * 15) + tierOffset);
    while (usedAmounts.has(val) || val < 45) {
      val += 5;
    }
    usedAmounts.add(val);
    return val;
  };

  const recipe: RecipeItem[] = [
    ...topNoteIds.map((id, idx) => ({
      rawMaterialId: id,
      amount: customAmounts && customAmounts[id] ? Math.round(customAmounts[id]) : getDistinctAmount(65, 0, idx),
      noteType: 'top' as const
    })),
    ...middleNoteIds.map((id, idx) => ({
      rawMaterialId: id,
      amount: customAmounts && customAmounts[id] ? Math.round(customAmounts[id]) : getDistinctAmount(90, 15, idx),
      noteType: 'middle' as const
    })),
    ...baseNoteIds.map((id, idx) => ({
      rawMaterialId: id,
      amount: customAmounts && customAmounts[id] ? Math.round(customAmounts[id]) : getDistinctAmount(115, 30, idx),
      noteType: 'base' as const
    }))
  ];

  // Maliyet ve tahmini perakende fiyatı hesabı
  let batchMatCost = 0;
  recipe.forEach((r) => {
    const mat = rawMaterialsMap.get(r.rawMaterialId);
    batchMatCost += r.amount * (mat?.price || 100);
  });

  const productionCost = Math.round((batchMatCost * 1.5 + 4500) / 100);

  // Sonuç seviyesine göre piyasa primi (6 Kalite Seviyesi)
  let priceMultiplier = 1.5;
  if (resultLevel === 'Efsanevi') priceMultiplier = 3.2;
  else if (resultLevel === 'Nadir') priceMultiplier = 2.4;
  else if (resultLevel === 'Kaliteli') priceMultiplier = 1.9;
  else if (resultLevel === 'Standart') priceMultiplier = 1.5;
  else if (resultLevel === 'Sıradan') priceMultiplier = 1.2;
  else priceMultiplier = 1.05;

  const estimatedMarketPrice = Math.round(productionCost * priceMultiplier);

  const notesSummary = `${topNoteIds.length} Üst, ${middleNoteIds.length} Orta, ${baseNoteIds.length} Alt Nota (${selectedMaterials.map((m) => m.name).slice(0, 4).join(', ')}...)`;

  return {
    id: `rnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    companyId: company.id,
    companyName: company.name,
    perfumerId: perfumer.id,
    perfumerName: perfumer.name,
    gender,
    topNotes: topNoteIds,
    middleNotes: middleNoteIds,
    baseNotes: baseNoteIds,
    totalNotesCount: topNoteIds.length + middleNoteIds.length + baseNoteIds.length,
    qualityScore,
    originalityScore,
    harmonyScore,
    trendScore,
    resultLevel,
    estimatedMarketPrice,
    productionCost,
    productionTime: 30,
    recipe,
    notesSummary,
    perfumerReview,
    designFee: perfumer.designFee,
    royaltyRate: perfumer.royaltyRate,
    createdAt: Date.now()
  };
}

/**
 * Generates dynamic Hattrick-style scouting/mentoring commentary for R&D invention.
 */
export function generateRndPerfumerReview(
  perfumer: Perfumer,
  qualityScore: number,
  originalityScore: number,
  harmonyScore: number,
  trendScore: number,
  resultLevel: RndResultLevel,
  selectedMaterials: RawMaterial[],
  scaleCommentary?: string
): string {
  const parts: string[] = [];

  // Quality & Harmony analysis
  if (resultLevel === 'Efsanevi') {
    parts.push(`Bu adeta bir dönüm noktası! ${perfumer.name} heyecanla notlarını inceliyor: "Kusursuz bir harmoni yakaladık. Notalar birbirine muazzam bir zarafetle kenetleniyor; bu formül parfümeri dünyasında yeni bir efsane yaratabilir."`);
  } else if (resultLevel === 'Nadir') {
    parts.push(`Çok sofistike ve seçkin bir çalışma. Notaların birbirini taşıma dengesi harika. Pazarın niş üst segmentinde büyük takdir toplayacaktır.`);
  } else if (resultLevel === 'Kaliteli') {
    parts.push(`Burada güzel bir uyum yakaladık. Notalar birbirini oldukça iyi tamamlıyor. Bu formülün ticari potansiyeli yüksek olabilir.`);
  } else if (resultLevel === 'Standart') {
    parts.push(`Dengeli ve güvenli bir kompozisyon. Ne rahatsız edici bir çatışma var ne de nefes kesici bir sürpriz; günlük kullanım için sağlam bir koku.`);
  } else if (resultLevel === 'Sıradan') {
    parts.push(`Formül temiz fakat koku biraz sönük kaldı. Burnuma gelen ilk his, pazardaki standart kokularla benzeştiği yönünde. Karakteri biraz daha derinleştirebiliriz.`);
  } else {
    parts.push(`Sonuç beklediğimiz kadar güçlü değil. Notalar arasında hafif bir sürtüşme hissediyorum; piramit henüz tam dengesini kuramadı.`);
  }

  // Scale / Terazi commentary
  if (scaleCommentary) {
    parts.push(`[Terazi Değerlendirmesi: ${scaleCommentary}]`);
  }

  // Originality distinction (completely decoupled from quality!)
  if (originalityScore >= 75) {
    if (qualityScore < 50) {
      parts.push(`Fakat bu formülde alışılmışın dışında, son derece cesur bir kıvılcım var! Klasik kalıpların dışına çıkmışsın; biraz daha ince ayar yapılırsa avangart bir başyapıt ortaya çıkabilir.`);
    } else {
      parts.push(`Aynı zamanda eşine az rastlanan bir özgünlük taşıyor; cesur nota seçimleri formüle benzersiz bir kimlik kazandırmış.`);
    }
  } else if (originalityScore <= 15) {
    if (qualityScore >= 78) {
      parts.push(`Formül özgünlük peşinde koşmuyor; klasik ve risksiz sularda yüzüyor. Ancak yakaladığı üst düzey kalite sayesinde kitleleri anında fethedebilir.`);
    } else {
      parts.push(`Formülde kullanılan akorlar çok bilindik kalıplarda kaldı; belki araya sürpriz bir baharat veya nadir bir odunsu nota serpiştirilebilir.`);
    }
  }

  return parts.join(' ');
}

/**
 * Converts an R&D formula into a playable perfume in player's production catalogue.
 */
export function convertRndToPerfume(rnd: RndResult): Perfume {
  return {
    id: rnd.id,
    name: rnd.name,
    brand: `${rnd.companyName} × ${rnd.perfumerName}`,
    companyId: rnd.companyId,
    companyName: rnd.companyName,
    perfumerId: rnd.perfumerId,
    perfumerName: rnd.perfumerName,
    gender: rnd.gender,
    sourceType: 'AR-GE',
    quality: rnd.qualityScore,
    originality: rnd.originalityScore,
    noteHarmony: rnd.harmonyScore,
    trendFit: rnd.trendScore,
    resultLevel: rnd.resultLevel,
    topNotes: rnd.topNotes,
    middleNotes: rnd.middleNotes,
    baseNotes: rnd.baseNotes,
    notes: [...rnd.topNotes, ...rnd.middleNotes, ...rnd.baseNotes],
    producerCompanyId: rnd.companyId,
    recipe: rnd.recipe,
    productionTime: rnd.productionTime || 30,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
    source: `${rnd.companyName} × ${rnd.perfumerName} (${rnd.resultLevel} İcat)`,
    suggestedRetailPrice: rnd.estimatedMarketPrice,
    description: `${rnd.companyName} bünyesinde ${rnd.perfumerName} tarafından sentezlenen ${rnd.resultLevel} seviye AR-GE formülü. Uyum: %${rnd.harmonyScore}, Trend: %${rnd.trendScore}, Özgünlük: %${rnd.originalityScore}.`,
    designFee: rnd.designFee,
    royaltyRate: rnd.royaltyRate,
    createdAt: rnd.createdAt
  };
}
