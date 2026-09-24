import {
  RawMaterial,
  RecipeItem,
  RndResult,
  GenderType,
  Perfume,
  Perfumer,
  Company,
  RndResultLevel
} from '../types';

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
  perfumer: Perfumer
): RndResult {
  if (topNoteIds.length === 0 || middleNoteIds.length === 0 || baseNoteIds.length === 0) {
    throw new Error('ParfümATÖR: Lütfen en az 1 üst nota, 1 orta nota ve 1 alt nota seçiniz.');
  }

  const allSelectedIds = [...topNoteIds, ...middleNoteIds, ...baseNoteIds];
  const selectedMaterials = allSelectedIds
    .map((id) => rawMaterialsMap.get(id))
    .filter((m): m is RawMaterial => m !== undefined);

  // 1. Koku / Nota Uyumu (Note Harmony) Hesaplaması:
  // Kategori çeşitliliği ve tamamlayıcılık analizi
  const categories = selectedMaterials.map((m) => m.category || '');
  let baseHarmony = 45;

  const hasCitrus = categories.some((c) => c.includes('Narenciye'));
  const hasFloral = categories.some((c) => c.includes('Çiçeksi'));
  const hasWoody = categories.some((c) => c.includes('Odunsu'));
  const hasGourmand = categories.some((c) => c.includes('Gurme'));
  const hasSpicy = categories.some((c) => c.includes('Baharat'));
  const hasAmber = categories.some((c) => c.includes('Amber'));

  // Klasik ve dengeli akorlar
  if (hasCitrus && (hasFloral || hasWoody)) baseHarmony += 14;
  if (hasAmber && (hasSpicy || hasGourmand || hasWoody)) baseHarmony += 15;
  if (hasFloral && hasWoody) baseHarmony += 10;
  if (topNoteIds.length >= 2 && baseNoteIds.length >= 2) baseHarmony += 8;

  // Çok katmanlı zengin koku piramidi derinliği
  if (allSelectedIds.length >= 6) {
    baseHarmony += 6;
  }

  // Parfümör Nota Uyumu etkisi (1-10 puan arası TAM SAYI)
  const perfumerHarmonyContribution = perfumer.noteHarmony * 2.8;
  const rawHarmonyScore = Math.min(98, Math.max(25, baseHarmony + perfumerHarmonyContribution + (Math.random() * 8 - 4)));
  const harmonyScore = Math.round(rawHarmonyScore);

  // 2. Trend Uyumu (Trend Fit) Hesaplaması:
  // Modern pazarda Amber, Vanilya, Safran, Narenciye ve Gurme notaları yüksek trendde
  let baseTrend = 40;
  if (hasGourmand) baseTrend += 14;
  if (hasAmber) baseTrend += 12;
  if (allSelectedIds.includes('vanilya') || allSelectedIds.includes('safran') || allSelectedIds.includes('ambroksan')) {
    baseTrend += 12;
  }
  const perfumerTrendContribution = perfumer.trendFit * 3.2;
  const rawTrendScore = Math.min(99, Math.max(30, baseTrend + perfumerTrendContribution + (Math.random() * 6 - 3)));
  const trendScore = Math.round(rawTrendScore);

  // 3. Özgünlük (Originality) Hesaplaması:
  // Nadir ve özel notaların varlığı (Huş Katranı, Sichuan Biberi, Acı Badem, Vetiver, Meyan Kökü)
  let baseOriginality = 40;
  const rareNotes = ['hus_agaci', 'sichuan_biberi', 'aci_badem', 'vetiver', 'meyan_koku', 'safran', 'tütün_yapragi'];
  const rareCount = allSelectedIds.filter((id) => rareNotes.includes(id)).length;
  baseOriginality += rareCount * 12;
  if (allSelectedIds.length >= 4) baseOriginality += 6;
  if (allSelectedIds.length >= 6) baseOriginality += 8;
  const rawOriginalityScore = Math.min(99, Math.max(30, baseOriginality + (Math.random() * 8 - 4)));
  const originalityScore = Math.round(rawOriginalityScore);

  // 4. Genel Kalite Skoru:
  // Parfümörün AR-GE Seviyesi (TAM SAYI 1-10) ve nota dinamiklerinin harmanı
  const perfumerRdWeight = perfumer.rdLevel * 2.2;
  const weightedQuality =
    harmonyScore * 0.35 +
    trendScore * 0.25 +
    originalityScore * 0.22 +
    perfumerRdWeight;
  const qualityScore = Math.min(99, Math.max(25, Math.round(weightedQuality)));

  // 5. AR-GE Sonuç Seviyesi (KÖTÜ, ORTA, İYİ, ÇOK İYİ, İMZA):
  // İMZA PARFÜM SİSTEMİ:
  // Yüksek AR-GE seviyesi tek başına garanti etmez; Kötü nota uyumu varsa KÖTÜ çıkar!
  // İmza için birden fazla yüksek şartın birlikte sağlanması zorunludur:
  let resultLevel: RndResultLevel = 'ORTA';

  const isSignatureEligible =
    perfumer.rdLevel >= 6 &&
    harmonyScore >= 82 &&
    trendScore >= 78 &&
    originalityScore >= 78 &&
    qualityScore >= 87;

  if (isSignatureEligible && Math.random() > 0.35) {
    resultLevel = 'İMZA';
  } else if (qualityScore >= 76 && harmonyScore >= 68) {
    resultLevel = 'ÇOK İYİ';
  } else if (qualityScore >= 58 && harmonyScore >= 50) {
    resultLevel = 'İYİ';
  } else if (qualityScore >= 42 && harmonyScore >= 40) {
    resultLevel = 'ORTA';
  } else {
    // Kötü nota kombinasyonu veya düşük uyum
    resultLevel = 'KÖTÜ';
  }

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
      amount: getDistinctAmount(65, 0, idx),
      noteType: 'top' as const
    })),
    ...middleNoteIds.map((id, idx) => ({
      rawMaterialId: id,
      amount: getDistinctAmount(90, 15, idx),
      noteType: 'middle' as const
    })),
    ...baseNoteIds.map((id, idx) => ({
      rawMaterialId: id,
      amount: getDistinctAmount(115, 30, idx),
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

  // Sonuç seviyesine göre piyasa primi
  let priceMultiplier = 1.6;
  if (resultLevel === 'İMZA') priceMultiplier = 2.8;
  else if (resultLevel === 'ÇOK İYİ') priceMultiplier = 2.2;
  else if (resultLevel === 'İYİ') priceMultiplier = 1.8;
  else if (resultLevel === 'ORTA') priceMultiplier = 1.4;
  else priceMultiplier = 1.1;

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
    designFee: perfumer.designFee,
    royaltyRate: perfumer.royaltyRate,
    createdAt: Date.now()
  };
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
